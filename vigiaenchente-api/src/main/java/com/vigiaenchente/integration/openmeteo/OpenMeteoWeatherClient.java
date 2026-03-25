package com.vigiaenchente.integration.openmeteo;

import com.vigiaenchente.model.entity.WeatherRecord;
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
public class OpenMeteoWeatherClient {

    private final WebClient webClient;

    @Value("${openmeteo.weather.base-url}")
    private String baseUrl;

    @Value("${sabara.latitude}")
    private double defaultLatitude;

    @Value("${sabara.longitude}")
    private double defaultLongitude;

    /**
     * Busca dados meteorológicos históricos para um período.
     */
    @SuppressWarnings("unchecked")
    public List<WeatherRecord> fetchWeatherData(LocalDate startDate, LocalDate endDate) {
        log.info("Buscando dados meteorológicos Open-Meteo: de {} até {}", startDate, endDate);

        Map<String, Object> response = webClient.get()
                .uri(baseUrl, uriBuilder -> uriBuilder
                        .queryParam("latitude", defaultLatitude)
                        .queryParam("longitude", defaultLongitude)
                        .queryParam("daily", "precipitation_sum,rain_sum,temperature_2m_max,temperature_2m_min,relative_humidity_2m_max,wind_speed_10m_max")
                        .queryParam("timezone", "America/Sao_Paulo")
                        .queryParam("start_date", startDate.toString())
                        .queryParam("end_date", endDate.toString())
                        .build())
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (response == null || !response.containsKey("daily")) {
            log.warn("Resposta vazia da Open-Meteo Weather API");
            return List.of();
        }

        Map<String, List<?>> daily = (Map<String, List<?>>) response.get("daily");
        List<String> dates = (List<String>) daily.get("time");
        List<Number> precipitation = (List<Number>) daily.get("precipitation_sum");
        List<Number> rain = (List<Number>) daily.get("rain_sum");
        List<Number> tempMax = (List<Number>) daily.get("temperature_2m_max");
        List<Number> tempMin = (List<Number>) daily.get("temperature_2m_min");
        List<Number> humidity = (List<Number>) daily.get("relative_humidity_2m_max");
        List<Number> wind = (List<Number>) daily.get("wind_speed_10m_max");

        List<WeatherRecord> records = new ArrayList<>();
        for (int i = 0; i < dates.size(); i++) {
            records.add(WeatherRecord.builder()
                    .latitude(defaultLatitude)
                    .longitude(defaultLongitude)
                    .recordedDate(LocalDate.parse(dates.get(i)))
                    .precipitationMm(toDouble(precipitation, i))
                    .rainMm(toDouble(rain, i))
                    .tempMax(toDouble(tempMax, i))
                    .tempMin(toDouble(tempMin, i))
                    .humidityMax(toDouble(humidity, i))
                    .windSpeed(toDouble(wind, i))
                    .source(DataSource.OPEN_METEO)
                    .build());
        }

        log.info("Recebidos {} registros meteorológicos da Open-Meteo", records.size());
        return records;
    }

    private Double toDouble(List<Number> list, int index) {
        if (list == null || index >= list.size() || list.get(index) == null) return null;
        return list.get(index).doubleValue();
    }
}
