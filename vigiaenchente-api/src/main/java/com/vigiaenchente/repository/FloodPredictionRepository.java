package com.vigiaenchente.repository;

import com.vigiaenchente.model.entity.FloodPrediction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface FloodPredictionRepository extends JpaRepository<FloodPrediction, Long> {

    Optional<FloodPrediction> findTopByTargetDateOrderByPredictionDateDesc(LocalDate targetDate);

    List<FloodPrediction> findByTargetDateBetweenOrderByTargetDateAsc(LocalDate start, LocalDate end);
}
