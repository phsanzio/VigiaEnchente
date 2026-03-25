package com.vigiaenchente.scheduler;

import com.vigiaenchente.service.FloodMonitoringService;
import com.vigiaenchente.service.WeatherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * Job agendado para coleta periódica de dados das APIs externas.
 * Roda diariamente às 06:00 e 18:00 (horário do servidor).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataCollectionScheduler {

    private final FloodMonitoringService floodService;
    private final WeatherService weatherService;

    @Scheduled(cron = "0 0 6,18 * * *")
    public void collectDailyData() {
        log.info("Iniciando coleta diária de dados...");

        LocalDate today = LocalDate.now();
        LocalDate weekAgo = today.minusDays(7);

        try {
            int dischargeRecords = floodService.fetchAndStoreDischargeData(weekAgo, today);
            log.info("Coleta de vazão: {} novos registros", dischargeRecords);
        } catch (Exception e) {
            log.error("Erro na coleta de dados de vazão: {}", e.getMessage());
        }

        try {
            // Weather API só tem dados até ontem
            int weatherRecords = weatherService.fetchAndStoreWeatherData(weekAgo, today.minusDays(1));
            log.info("Coleta meteorológica: {} novos registros", weatherRecords);
        } catch (Exception e) {
            log.error("Erro na coleta de dados meteorológicos: {}", e.getMessage());
        }

        log.info("Coleta diária finalizada.");
    }
}
