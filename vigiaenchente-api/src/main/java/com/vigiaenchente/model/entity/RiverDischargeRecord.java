package com.vigiaenchente.model.entity;

import com.vigiaenchente.model.enums.DataSource;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "river_discharge_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiverDischargeRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "station_code")
    private String stationCode;

    @Column(name = "station_name")
    private String stationName;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(name = "recorded_date", nullable = false)
    private LocalDate recordedDate;

    @Column(name = "discharge_m3s")
    private Double dischargeM3s;

    @Column(name = "discharge_mean")
    private Double dischargeMean;

    @Column(name = "discharge_max")
    private Double dischargeMax;

    @Column(name = "discharge_min")
    private Double dischargeMin;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DataSource source;

    @Column(name = "fetched_at")
    private LocalDateTime fetchedAt;

    @PrePersist
    protected void onCreate() {
        fetchedAt = LocalDateTime.now();
    }
}
