# VigiaEnchente — MVP Machine Learning

Modelo de previsao de risco de enchente para Sabara/MG usando Random Forest.

**Equipe:** Livia Mendes, Paulo Moura, Pedro Sanzio e Raphael Abade.

## O que e

MVP do modulo de Machine Learning do VigiaEnchente. Treina um Random Forest para prever se havera risco de enchente no dia seguinte (D+1) a partir de dados de chuva, vazao e meteorologia.

## Resultado

| Metrica | Random Forest | Regra de Chuva (100mm/72h) |
|---------|---------------|----------------------------|
| F1 Score | **0.86** | 0.33 |
| Vantagem | +163% | baseline |

O modelo supera a regra simples de chuva em 163%. A vazao do rio e a variavel mais importante (59% da decisao), seguida de umidade e chuva acumulada.

## Dados

| Fonte | Variavel | Periodo | Origem |
|-------|----------|---------|--------|
| ANA/Hidroweb | Chuva diaria (mm) | 1997-2025 | Estacao 1943006 (Sabara) |
| Open-Meteo Flood (GloFAS) | Vazao simulada (m3/s) | 1997-2025 | lat=-19.88, lon=-43.80 |
| Open-Meteo Archive (ERA5) | Temperatura, umidade, vento, pressao, evapotranspiracao | 1997-2025 | lat=-19.88, lon=-43.80 |
| Defesa Civil | Eventos confirmados | 1997-2024 | PLANCON Sabara 2025/2028 |

**Nota:** GloFAS (vazao) e ERA5 (meteorologia) sao dados de natureza diferente apesar de virem da mesma familia (Copernicus/ECMWF).

## Target

Criterio combinado (baseado nos eventos confirmados pela Defesa Civil):

```
target = 1 se (vazao D+1 >= 7.5 m3/s) OU (acumulado_3d D+1 >= 100mm)
```

- Vazao >= 7.5 m3/s: pega inundacao do Rio das Velhas (eventos 1997, 2020, 2022)
- Acumulado >= 100mm: pega alagamento por chuva extrema (evento nov/2024)
- Limiar de 7.5 m3/s = minimo de vazao nos eventos fluviais confirmados

## Features (15 variaveis)

| Feature | Descricao | Importancia |
|---------|-----------|-------------|
| vazao | Vazao GloFAS do dia (m3/s) | 28% |
| vazao_ontem | Vazao do dia anterior | 16% |
| vazao_anteontem | Vazao de 2 dias atras | 16% |
| umidade_media | Umidade relativa media (%) | 8% |
| acumulado_7d | Chuva acumulada 7 dias (mm) | 8% |
| acumulado_3d | Chuva acumulada 3 dias (mm) | 8% |
| chuva_mm | Chuva do dia (mm) | 4% |
| chuva_anteontem | Chuva de 2 dias atras (mm) | 3% |
| pressao_media | Pressao atmosferica (hPa) | 2% |
| chuva_ontem | Chuva do dia anterior (mm) | 2% |
| temp_min | Temperatura minima (C) | 2% |
| chuva_3d_atras | Chuva de 3 dias atras (mm) | 1% |
| evapotranspiracao | Evapotranspiracao (mm/dia) | 1% |
| temp_max | Temperatura maxima (C) | 1% |
| vento_max | Velocidade max do vento (km/h) | 1% |

## Estrutura

```
mvp-vigIA/
├── data_csv/
│   ├── raw/                        # Dados brutos
│   │   ├── chuvas.csv              # Chuva ANA (estacao 1943006)
│   │   ├── glofas_vazao.csv        # Vazao GloFAS (Open-Meteo)
│   │   └── meteo_historico.csv     # Meteorologia ERA5 (Open-Meteo)
│   └── processed/                  # Dados processados (gerados pelo notebook)
│       ├── base_modelo.csv         # Base final pro modelo
│       └── eventos_confirmados.csv # Tabela de eventos (extraida da base)
├── models/                         # Modelo treinado
│   └── random_forest.pkl
├── outputs/                        # Graficos gerados
│   ├── matriz_confusao.png
│   └── feature_importance.png
├── mvp_completo.ipynb              # Notebook com pipeline completo
└── README.md
```

## Como rodar

### Google Colab

1. Subir `chuvas.csv`, `glofas_vazao.csv` e `meteo_historico.csv` para `data_csv/raw/`
2. Abrir `mvp_completo.ipynb`
3. Rodar todas as celulas de cima a baixo

### Local

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install pandas numpy scikit-learn matplotlib seaborn
jupyter notebook mvp_completo.ipynb
```

## Metodologia

1. **Preparacao**: despivotar chuvas ANA, merge com GloFAS e ERA5, criar features temporais
2. **Divisao temporal**: treino (1997-2017), validacao (2018-2019), teste (2020-2025)
3. **Treinamento**: Random Forest (100 arvores, class_weight=balanced)
4. **Avaliacao**: metricas na validacao e teste, comparacao com regra de chuva, validacao nos eventos confirmados

## Limitacoes

- GloFAS nao cobre tributarios locais (Rio Sabara, corregos) — resolucao 5km
- Poucos eventos confirmados (5 eventos / 8 dias) para validacao
- Sem dados de nivel do rio (regua de 2m da Ponte do Paciencia)
- Target parcialmente dependente de chuva (componente de 100mm/72h)

## Proximos passos

1. Obter dados de nivel do rio (regua) para target mais robusto
2. Integrar como microservico Python (FastAPI) na API Spring Boot
3. Adicionar previsao meteorologica (Open-Meteo Forecast) para horizonte de 3-7 dias

## Referencia

- PLANCON Sabara 2025/2028 — Plano Municipal de Gerenciamento de Riscos e Desastres
- Threshold oficial: precipitacao >= 100mm/72h OU nivel Rio das Velhas > 2.0m
- Open-Meteo: https://open-meteo.com/
- GloFAS: Global Flood Awareness System (Copernicus/ECMWF)
- ERA5: ECMWF Reanalysis v5
- ANA/Hidroweb: https://www.snirh.gov.br/hidroweb/
