package com.vigiaenchente.model.entity;

import com.vigiaenchente.model.enums.DataSource;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "weather_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeatherRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "station_code")
    private String stationCode;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(name = "recorded_date", nullable = false)
    private LocalDate recordedDate;

    @Column(name = "precipitation_mm")
    private Double precipitationMm;

    @Column(name = "rain_mm")
    private Double rainMm;

    @Column(name = "temp_max")
    private Double tempMax;

    @Column(name = "temp_min")
    private Double tempMin;

    @Column(name = "humidity_max")
    private Double humidityMax;

    @Column(name = "wind_speed")
    private Double windSpeed;

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
