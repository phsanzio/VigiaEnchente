---
inclusion: auto
---

# VigiaEnchente - Referência de APIs Externas

## 1. Open-Meteo Flood API

### Endpoint
`GET https://flood-api.open-meteo.com/v1/flood`

### Parâmetros Principais
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| latitude | float | Sim | -19.88 para Sabará |
| longitude | float | Sim | -43.80 para Sabará |
| daily | string | Não | river_discharge, river_discharge_mean, river_discharge_max, river_discharge_min, river_discharge_p25, river_discharge_p75 |
| start_date | yyyy-mm-dd | Não | Dados disponíveis desde 1984-01-01 |
| end_date | yyyy-mm-dd | Não | Até 7 meses de forecast |
| past_days | int | Não | Dias passados a incluir |
| forecast_days | int | Não | Até 210 dias de previsão (default 92) |
| models | string | Não | forecast_v4 (default) |

### Exemplo de Chamada
```
https://flood-api.open-meteo.com/v1/flood?latitude=-19.88&longitude=-43.80&daily=river_discharge,river_discharge_mean,river_discharge_max,river_discharge_min&start_date=2024-01-01&end_date=2024-12-31
```

### Resposta (resumida)
```json
{
  "latitude": -19.874996,
  "longitude": -43.824997,
  "elevation": 835,
  "daily": {
    "time": ["2024-01-01", ...],
    "river_discharge": [1.12, ...]
  }
}
```

### Notas
- Resolução de 5km (GloFAS v4) - pode não pegar exatamente o rio desejado
- Variar coordenadas em ±0.1° pode ajudar a encontrar o rio correto
- Gratuita para uso não-comercial, sem API key

---

## 2. Open-Meteo Historical Weather API

### Endpoint
`GET https://archive-api.open-meteo.com/v1/archive`

### Parâmetros Principais
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| latitude | float | -19.88 |
| longitude | float | -43.80 |
| start_date | yyyy-mm-dd | Dados desde 1940 |
| end_date | yyyy-mm-dd | Até ontem |
| daily | string | precipitation_sum, rain_sum, temperature_2m_max, temperature_2m_min, relative_humidity_2m_max, etc |
| timezone | string | America/Sao_Paulo |

### Exemplo
```
https://archive-api.open-meteo.com/v1/archive?latitude=-19.88&longitude=-43.80&start_date=2024-01-01&end_date=2024-01-31&daily=precipitation_sum,rain_sum,temperature_2m_max,temperature_2m_min,relative_humidity_2m_max&timezone=America/Sao_Paulo
```

---

## 3. Open-Meteo Weather Forecast API

### Endpoint
`GET https://api.open-meteo.com/v1/forecast`

### Uso
- Previsão meteorológica para os próximos dias
- Pode substituir OpenWeatherMap (sem necessidade de API key)

---

## 4. OpenWeatherMap API (já usada no projeto original)
- API key existente no projeto: 733da4642c26a47989b7d127dc1c9aac
- Endpoint: https://api.openweathermap.org/data/2.5/weather
- Pode ser substituída pela Open-Meteo Forecast API (gratuita, sem key)

---

## 5. ANA HidroWeb (ACESSO PENDENTE)
- Dados reais de estações fluviométricas
- Necessário solicitar acesso: enviar email para hidro@ana.gov.br com assunto "Solicitação de acesso à API"
- Informar: nome, CPF/CNPJ, email, motivação
- Prazo de migração para nova API: até 30/06/2026
- Tutorial: "Tutorial de Serviço para Consumo de Dados - API HidroWebService"
- Portal web alternativo: https://www.snirh.gov.br/hidroweb/mapa (busca por estação/município)
- Portal telemetria: https://www.snirh.gov.br/hidrotelemetria/Mapa.aspx (dados em tempo real)
- Tutoriais de acesso disponíveis em dados-defesa-civil/ (PDFs fornecidos pela defesa civil)

---

## 6. INMET (Instituto Nacional de Meteorologia)
- Dados meteorológicos de estações brasileiras
- API pública disponível
- Complementar aos dados do Open-Meteo

---

## 7. Dados Locais da Defesa Civil de Sabará (DISPONÍVEIS)
- Banco Access: dados-defesa-civil/Dados_Sabará.mdb
- Planilha de estações: dados-defesa-civil/Estações_Sabará.xlsx
- Contém dados reais medidos em estações físicas no município
- Estações com dados de chuva diária (1941-2018), vazão (1939-1965), cotas (1938-1965)
- Ver arquivo 08-dados-defesa-civil-inventario.md para detalhamento completo
