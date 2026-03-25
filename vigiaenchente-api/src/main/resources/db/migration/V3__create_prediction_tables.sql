CREATE TABLE flood_predictions (
    id                  BIGSERIAL PRIMARY KEY,
    prediction_date     TIMESTAMP        NOT NULL DEFAULT NOW(),
    target_date         DATE             NOT NULL,
    risk_level          VARCHAR(20)      NOT NULL,
    predicted_discharge DOUBLE PRECISION,
    confidence_score    DOUBLE PRECISION,
    model_version       VARCHAR(50),
    created_at          TIMESTAMP        NOT NULL DEFAULT NOW()
);

CREATE TABLE flood_alerts (
    id               BIGSERIAL PRIMARY KEY,
    prediction_id    BIGINT REFERENCES flood_predictions (id),
    alert_type       VARCHAR(50)  NOT NULL,
    message          TEXT         NOT NULL,
    sent_at          TIMESTAMP,
    recipients_count INT DEFAULT 0
);

CREATE TABLE ml_model_versions (
    id                   BIGSERIAL PRIMARY KEY,
    version              VARCHAR(50)      NOT NULL UNIQUE,
    algorithm            VARCHAR(100)     NOT NULL,
    accuracy             DOUBLE PRECISION,
    precision_score      DOUBLE PRECISION,
    recall               DOUBLE PRECISION,
    f1_score             DOUBLE PRECISION,
    training_data_start  DATE,
    training_data_end    DATE,
    trained_at           TIMESTAMP        NOT NULL DEFAULT NOW(),
    notes                TEXT
);

CREATE TABLE prediction_evaluations (
    id                BIGSERIAL PRIMARY KEY,
    prediction_id     BIGINT REFERENCES flood_predictions (id),
    actual_discharge  DOUBLE PRECISION,
    actual_risk_level VARCHAR(20),
    was_correct       BOOLEAN,
    evaluated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_predictions_target ON flood_predictions (target_date);
CREATE INDEX idx_predictions_risk ON flood_predictions (risk_level);
