package com.vigiaenchente.model.dto.response;

import com.vigiaenchente.model.enums.RiskLevel;

import java.time.LocalDate;

public record FloodRiskResponse(
        RiskLevel riskLevel,
        Double currentDischarge,
        Double dischargeVariation,
        LocalDate date,
        String message,
        String source
) {}
