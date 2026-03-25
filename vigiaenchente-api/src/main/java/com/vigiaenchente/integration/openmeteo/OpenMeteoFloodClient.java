package com.vigiaenchente.integration.openmeteo;

import com.vigiaenchente.model.entity.RiverDischargeRecord;
import com.vigiaenchente.model.enums.DataSource;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class OpenMeteoFloodClient {

    private final WebClient webClient;

    @Value("${openmeteo.flood.base-url}")
    private String baseUrl;

    @Value("${sabara.latitude}")
    private double defaultLatitude;

    @Value("${sabara.longitude}")
    private double defaultLongitude;

    /**
     * Busca dados de vazão para um período específico.
     */
    public List<RiverDischargeRecord> fetchDischargeData(LocalDate startDate, LocalDate endDate) {
        return fetchDischargeData(defaultLatitude, defaultLongitude, startDate, endDate);
    }

    /**
     * Busca dados de vazão para coordenadas e período específicos.
     */
    @SuppressWarnings("unchecked")
    public List<RiverDischargeRecord> fetchDischargeData(
            double latitude, double longitude, LocalDate startDate, LocalDate endDate) {

        log.info("Buscando dados de vazão Open-Meteo: lat={}, lon={}, de {} até {}",
                latitude, longitude, startDate, endDate);

        Map<String, Object> response = webClient.get()
                .uri(baseUrl, uriBuilder -> uriBuilder
                        .queryParam("latitude", latitude)
                        .queryParam("longitude", longitude)
                        .queryParam("daily", "river_discharge,river_discharge_mean,river_discharge_max,river_discharge_min")
                        .queryParam("start_date", startDate.toString())
                        .queryParam("end_date", endDate.toString())
                        .build())
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (response == null || !response.containsKey("daily")) {
            log.warn("Resposta vazia da Open-Meteo Flood API");
            return List.of();
        }

        Map<String, List<?>> daily = (Map<String, List<?>>) response.get("daily");
        List<String> dates = (List<String>) daily.get("time");
        List<Number> discharges = (List<Number>) daily.get("river_discharge");
        List<Number> means = (List<Number>) daily.get("river_discharge_mean");
        List<Number> maxes = (List<Number>) daily.get("river_discharge_max");
        List<Number> mins = (List<Number>) daily.get("river_discharge_min");

        List<RiverDischargeRecord> records = new ArrayList<>();
        for (int i = 0; i < dates.size(); i++) {
            records.add(RiverDischargeRecord.builder()
                    .latitude(latitude)
                    .longitude(longitude)
                    .recordedDate(LocalDate.parse(dates.get(i)))
                    .dischargeM3s(toDouble(discharges, i))
                    .dischargeMean(toDouble(means, i))
                    .dischargeMax(toDouble(maxes, i))
                    .dischargeMin(toDouble(mins, i))
                    .source(DataSource.OPEN_METEO)
                    .build());
        }

        log.info("Recebidos {} registros de vazão da Open-Meteo", records.size());
        return records;
    }

    /**
     * Busca dados recentes (últimos N dias + forecast).
     */
    public List<RiverDischargeRecord> fetchRecentData(int pastDays, int forecastDays) {
        return fetchDischargeData(
                LocalDate.now().minusDays(pastDays),
                LocalDate.now().plusDays(forecastDays));
    }

    private Double toDouble(List<Number> list, int index) {
        if (list == null || index >= list.size() || list.get(index) == null) return null;
        return list.get(index).doubleValue();
    }
}
