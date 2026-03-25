package com.vigiaenchente.repository;

import com.vigiaenchente.model.entity.RiverDischargeRecord;
import com.vigiaenchente.model.enums.DataSource;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface RiverDischargeRepository extends JpaRepository<RiverDischargeRecord, Long> {

    List<RiverDischargeRecord> findByRecordedDateBetweenAndSourceOrderByRecordedDateAsc(
            LocalDate start, LocalDate end, DataSource source);

    List<RiverDischargeRecord> findByRecordedDateBetweenOrderByRecordedDateAsc(
            LocalDate start, LocalDate end);

    List<RiverDischargeRecord> findTop7BySourceOrderByRecordedDateDesc(DataSource source);

    boolean existsByRecordedDateAndSource(LocalDate date, DataSource source);
}
