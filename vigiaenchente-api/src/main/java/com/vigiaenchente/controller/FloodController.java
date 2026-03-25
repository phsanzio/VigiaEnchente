package com.vigiaenchente.controller;

import com.vigiaenchente.model.dto.response.FloodRiskResponse;
import com.vigiaenchente.service.FloodMonitoringService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/flood")
@RequiredArgsConstructor
public class FloodController {

    private final FloodMonitoringService floodService;

    /**
     * Retorna o risco atual de enchente.
     */
    @GetMapping("/risk")
    public ResponseEntity<FloodRiskResponse> getCurrentRisk() {
        return ResponseEntity.ok(floodService.getCurrentRisk());
    }

    /**
     * Dispara a coleta de dados de vazão para um período.
     * Útil para popular o banco com dados históricos.
     */
    @PostMapping("/fetch")
    public ResponseEntity<Map<String, Object>> fetchData(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        int saved = floodService.fetchAndStoreDischargeData(startDate, endDate);
        return ResponseEntity.ok(Map.of(
                "message", "Coleta de dados concluída",
                "recordsSaved", saved,
                "period", startDate + " até " + endDate));
    }
}
