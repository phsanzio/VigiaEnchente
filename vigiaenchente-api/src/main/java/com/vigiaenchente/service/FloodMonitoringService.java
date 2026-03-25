package com.vigiaenchente.service;

import com.vigiaenchente.integration.openmeteo.OpenMeteoFloodClient;
import com.vigiaenchente.model.dto.response.FloodRiskResponse;
import com.vigiaenchente.model.entity.RiverDischargeRecord;
import com.vigiaenchente.model.enums.DataSource;
import com.vigiaenchente.model.enums.RiskLevel;
import com.vigiaenchente.repository.RiverDischargeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Serviço de monitoramento de enchentes.
 * Atualmente usa cálculo simplista baseado em thresholds (migrado do JS original).
 * Será substituído/complementado pelo modelo ML do microserviço Python na Fase 3.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FloodMonitoringService {

    private final OpenMeteoFloodClient floodClient;
    private final RiverDischargeRepository dischargeRepository;

    // Thresholds para Open-Meteo (GloFAS 5km) — valores menores que medição real
    private static final double THRESHOLD_LOW = 2.0;
    private static final double THRESHOLD_MEDIUM = 5.0;
    private static final double THRESHOLD_HIGH = 10.0;
    private static final double VARIATION_THRESHOLD = 3.0;

    /**
     * Retorna o risco atual de enchente baseado nos dados mais recentes.
     * Método simplista (v1) — será substituído pelo modelo ML.
     */
    public FloodRiskResponse getCurrentRisk() {
        List<RiverDischargeRecord> recentRecords =
                dischargeRepository.findTop7BySourceOrderByRecordedDateDesc(DataSource.OPEN_METEO);

        if (recentRecords.isEmpty()) {
            log.info("Sem dados recentes no banco, buscando da API...");
            recentRecords = floodClient.fetchRecentData(7, 0);
        }

        if (recentRecords.size() < 3) {
            return new FloodRiskResponse(
                    RiskLevel.NONE, null, null, LocalDate.now(),
                    "Dados insuficientes para análise.", "OPEN_METEO");
        }

        // Pega os 3 mais recentes
        List<RiverDischargeRecord> last3 = recentRecords.subList(0, Math.min(3, recentRecords.size()));

        double mean = last3.stream()
                .mapToDouble(r -> r.getDischargeM3s() != null ? r.getDischargeM3s() : 0)
                .average()
                .orElse(0);

        double first = last3.getLast().getDischargeM3s() != null ? last3.getLast().getDischargeM3s() : 0;
        double latest = last3.getFirst().getDischargeM3s() != null ? last3.getFirst().getDischargeM3s() : 0;
        double variation = latest - first;

        RiskLevel risk = calculateRisk(mean, variation);
        String message = buildMessage(risk, mean, variation);

        return new FloodRiskResponse(
                risk, latest, variation,
                last3.getFirst().getRecordedDate(),
                message, "OPEN_METEO_SIMPLISTIC_V1");
    }

    /**
     * Busca e persiste dados de vazão de um período.
     */
    @Transactional
    public int fetchAndStoreDischargeData(LocalDate startDate, LocalDate endDate) {
        List<RiverDischargeRecord> records = floodClient.fetchDischargeData(startDate, endDate);

        int saved = 0;
        for (RiverDischargeRecord record : records) {
            if (!dischargeRepository.existsByRecordedDateAndSource(record.getRecordedDate(), record.getSource())) {
                dischargeRepository.save(record);
                saved++;
            }
        }

        log.info("Salvos {}/{} registros de vazão no banco", saved, records.size());
        return saved;
    }

    /**
     * Cálculo simplista de risco — migrado do JS original.
     * TODO: substituir pelo modelo ML na Fase 3.
     */
    private RiskLevel calculateRisk(double meanDischarge, double variation) {
        if (meanDischarge < THRESHOLD_LOW) {
            return variation > VARIATION_THRESHOLD ? RiskLevel.LOW : RiskLevel.NONE;
        } else if (meanDischarge < THRESHOLD_MEDIUM) {
            return variation > VARIATION_THRESHOLD ? RiskLevel.MEDIUM : RiskLevel.LOW;
        } else if (meanDischarge < THRESHOLD_HIGH) {
            return variation > VARIATION_THRESHOLD ? RiskLevel.HIGH : RiskLevel.MEDIUM;
        }
        return RiskLevel.HIGH;
    }

    private String buildMessage(RiskLevel risk, double mean, double variation) {
        return switch (risk) {
            case NONE -> "Não há risco de enchente. Vazão média: %.2f m³/s".formatted(mean);
            case LOW -> "Risco baixo de enchente. Vazão média: %.2f m³/s, variação: %.2f m³/s".formatted(mean, variation);
            case MEDIUM -> "Risco médio de enchente. Vazão média: %.2f m³/s, variação: %.2f m³/s".formatted(mean, variation);
            case HIGH -> "Risco alto de enchente! Vazão média: %.2f m³/s, variação: %.2f m³/s".formatted(mean, variation);
        };
    }
}
