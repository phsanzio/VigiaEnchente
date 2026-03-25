package com.vigiaenchente.repository;

import com.vigiaenchente.model.entity.WeatherRecord;
import com.vigiaenchente.model.enums.DataSource;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface WeatherRecordRepository extends JpaRepository<WeatherRecord, Long> {

    List<WeatherRecord> findByRecordedDateBetweenAndSourceOrderByRecordedDateAsc(
            LocalDate start, LocalDate end, DataSource source);

    List<WeatherRecord> findByRecordedDateBetweenOrderByRecordedDateAsc(
            LocalDate start, LocalDate end);

    boolean existsByRecordedDateAndSource(LocalDate date, DataSource source);
}
