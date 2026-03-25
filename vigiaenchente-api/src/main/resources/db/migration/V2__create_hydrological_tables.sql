CREATE TABLE river_discharge_records (
    id              BIGSERIAL PRIMARY KEY,
    station_code    VARCHAR(20),
    station_name    VARCHAR(255),
    latitude        DOUBLE PRECISION NOT NULL,
    longitude       DOUBLE PRECISION NOT NULL,
    recorded_date   DATE             NOT NULL,
    discharge_m3s   DOUBLE PRECISION,
    discharge_mean  DOUBLE PRECISION,
    discharge_max   DOUBLE PRECISION,
    discharge_min   DOUBLE PRECISION,
    source          VARCHAR(30)      NOT NULL,
    fetched_at      TIMESTAMP        NOT NULL DEFAULT NOW(),
    UNIQUE (station_code, recorded_date, source)
);

CREATE TABLE weather_records (
    id                BIGSERIAL PRIMARY KEY,
    station_code      VARCHAR(20),
    latitude          DOUBLE PRECISION NOT NULL,
    longitude         DOUBLE PRECISION NOT NULL,
    recorded_date     DATE             NOT NULL,
    precipitation_mm  DOUBLE PRECISION,
    rain_mm           DOUBLE PRECISION,
    temp_max          DOUBLE PRECISION,
    temp_min          DOUBLE PRECISION,
    humidity_max      DOUBLE PRECISION,
    wind_speed        DOUBLE PRECISION,
    source            VARCHAR(30)      NOT NULL,
    fetched_at        TIMESTAMP        NOT NULL DEFAULT NOW(),
    UNIQUE (latitude, longitude, recorded_date, source)
);

CREATE TABLE river_level_records (
    id            BIGSERIAL PRIMARY KEY,
    station_code  VARCHAR(20),
    station_name  VARCHAR(255),
    latitude      DOUBLE PRECISION NOT NULL,
    longitude     DOUBLE PRECISION NOT NULL,
    recorded_date DATE             NOT NULL,
    level_cm      DOUBLE PRECISION,
    level_max     DOUBLE PRECISION,
    level_min     DOUBLE PRECISION,
    level_mean    DOUBLE PRECISION,
    source        VARCHAR(30)      NOT NULL,
    fetched_at    TIMESTAMP        NOT NULL DEFAULT NOW(),
    UNIQUE (station_code, recorded_date, source)
);

CREATE INDEX idx_discharge_date ON river_discharge_records (recorded_date);
CREATE INDEX idx_discharge_source ON river_discharge_records (source);
CREATE INDEX idx_weather_date ON weather_records (recorded_date);
CREATE INDEX idx_level_date ON river_level_records (recorded_date);
