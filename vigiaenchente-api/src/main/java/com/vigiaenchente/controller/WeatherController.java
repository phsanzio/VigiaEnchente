package com.vigiaenchente.controller;

import com.vigiaenchente.service.WeatherService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/weather")
@RequiredArgsConstructor
public class WeatherController {

    private final WeatherService weatherService;

    /**
     * Dispara a coleta de dados meteorológicos para um período.
     */
    @PostMapping("/fetch")
    public ResponseEntity<Map<String, Object>> fetchData(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        int saved = weatherService.fetchAndStoreWeatherData(startDate, endDate);
        return ResponseEntity.ok(Map.of(
                "message", "Coleta de dados meteorológicos concluída",
                "recordsSaved", saved,
                "period", startDate + " até " + endDate));
    }
}
