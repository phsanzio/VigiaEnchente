---
inclusion: auto
---

# VigiaEnchente - Schema do Banco de Dados (PostgreSQL)

## Schema Original (MySQL - projeto JS)
```sql
-- Users: id_user, nome, email, phone, senha
-- Address: id_address, id_address_user (FK), rua, num_rua, cep, bairro, cidade
-- Phone: id_phone_user (FK), id_phone, numero
-- Message: id_msg, id_user_msg (FK), date_msg, hour_msg, content_msg
-- Alert: id_alert, date_alert, hour_alert, content_alert, id_msg_alert (FK)
```

## Schema Proposto (PostgreSQL - Spring Boot)

### Tabelas de Usuário (migração do original)
- users: id, nome, email (unique), phone (unique), senha_hash, created_at, updated_at
- addresses: id, user_id (FK), rua, numero, cep, bairro, cidade, latitude, longitude

### Tabelas de Dados Hidrológicos (NOVAS)
- river_discharge_records: id, station_code, station_name, latitude, longitude, recorded_date, discharge_m3s, discharge_mean, discharge_max, discharge_min, source (OPEN_METEO, ANA, DEFESA_CIVIL), fetched_at
- weather_records: id, station_code, latitude, longitude, recorded_date, precipitation_mm, rain_mm, temp_max, temp_min, humidity_max, wind_speed, source, fetched_at
- river_level_records: id, station_code, station_name, latitude, longitude, recorded_date, level_cm, level_max, level_min, level_mean, source (ANA, DEFESA_CIVIL), fetched_at
- daily_rainfall_records: id, station_code, recorded_month, day_of_month, rainfall_mm, source (DEFESA_CIVIL, OPEN_METEO), fetched_at

### Tabelas de Alertas e Previsões (NOVAS)
- flood_predictions: id, prediction_date, target_date, risk_level (NONE, LOW, MEDIUM, HIGH), predicted_discharge, confidence_score, model_version, created_at
- flood_alerts: id, prediction_id (FK), alert_type, message, sent_at, recipients_count

### Tabelas de Auditoria do Modelo (para TCC)
- ml_model_versions: id, version, algorithm, accuracy, precision_score, recall, f1_score, training_data_start, training_data_end, trained_at, notes
- prediction_evaluations: id, prediction_id (FK), actual_discharge, actual_risk_level, was_correct, evaluated_at

## Notas
- Latitude/longitude em addresses permite futura integração com rota de fuga
- source nos records permite distinguir dados de diferentes APIs e da defesa civil
- station_code permite rastrear de qual estação da ANA/defesa civil veio o dado
- ml_model_versions permite rastrear evolução do modelo (importante pro TCC)
- prediction_evaluations permite medir acurácia real do modelo ao longo do tempo
- daily_rainfall_records armazena chuva diária extraída do .mdb (campos Chuva01-Chuva31)
- river_level_records armazena cotas/nível do rio (campos Cota01-Cota31 do .mdb)

## Migração dos Dados da Defesa Civil (.mdb → PostgreSQL)
O banco Access tem estrutura mensal: cada registro = 1 mês, com campos dia01-dia31.
Na migração, normalizar para 1 registro por dia:
- Chuvas: Chuva01..Chuva31 → 1 registro por dia com rainfall_mm
- Vazoes: Vazao01..Vazao31 → 1 registro por dia com discharge_m3s
- Cotas: Cota01..Cota31 → 1 registro por dia com level_cm
