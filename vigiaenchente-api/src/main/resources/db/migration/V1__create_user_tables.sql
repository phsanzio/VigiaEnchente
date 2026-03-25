CREATE TABLE users (
    id          BIGSERIAL PRIMARY KEY,
    nome        VARCHAR(255) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    phone       VARCHAR(15)  NOT NULL UNIQUE,
    senha_hash  VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE addresses (
    id        BIGSERIAL PRIMARY KEY,
    user_id   BIGINT       NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
    rua       VARCHAR(255),
    numero    VARCHAR(45),
    cep       VARCHAR(9),
    bairro    VARCHAR(100),
    cidade    VARCHAR(100),
    latitude  DOUBLE PRECISION,
    longitude DOUBLE PRECISION
);
