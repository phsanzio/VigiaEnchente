package com.vigiaenchente.service;

import com.vigiaenchente.integration.openmeteo.OpenMeteoWeatherClient;
import com.vigiaenchente.model.entity.WeatherRecord;
import com.vigiaenchente.repository.WeatherRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class WeatherService {

    private final OpenMeteoWeatherClient weatherClient;
    private final WeatherRecordRepository weatherRepository;

    /**
     * Busca e persiste dados meteorológicos de um período.
     */
    @Transactional
    public int fetchAndStoreWeatherData(LocalDate startDate, LocalDate endDate) {
        List<WeatherRecord> records = weatherClient.fetchWeatherData(startDate, endDate);

        int saved = 0;
        for (WeatherRecord record : records) {
            if (!weatherRepository.existsByRecordedDateAndSource(record.getRecordedDate(), record.getSource())) {
                weatherRepository.save(record);
                saved++;
            }
        }

        log.info("Salvos {}/{} registros meteorológicos no banco", saved, records.size());
        return saved;
    }

    public List<WeatherRecord> getWeatherData(LocalDate startDate, LocalDate endDate) {
        return weatherRepository.findByRecordedDateBetweenOrderByRecordedDateAsc(startDate, endDate);
    }
}
