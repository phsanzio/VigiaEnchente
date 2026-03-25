package com.vigiaenchente.model.entity;

import com.vigiaenchente.model.enums.DataSource;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "river_level_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiverLevelRecord {

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

    @Column(name = "level_cm")
    private Double levelCm;

    @Column(name = "level_max")
    private Double levelMax;

    @Column(name = "level_min")
    private Double levelMin;

    @Column(name = "level_mean")
    private Double levelMean;

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
