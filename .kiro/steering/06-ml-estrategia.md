---
inclusion: auto
---

# VigiaEnchente - Estratégia de Machine Learning

## Objetivo
Criar um modelo preditivo que, dado dados meteorológicos e hidrológicos recentes, preveja o risco de enchente para as próximas horas/dias em Sabará/MG.

## Abordagem Sugerida

### Tipo de Problema
- Classificação multiclasse: SEM_RISCO, BAIXO, MEDIO, ALTO
- Alternativa: Regressão (prever vazão em m³/s para os próximos N dias) + thresholds para classificar

### Algoritmos Candidatos (scikit-learn)
1. Random Forest Classifier/Regressor - robusto, interpretável, bom para features tabulares
2. Gradient Boosting (XGBoost/LightGBM) - geralmente melhor performance
3. Baseline: Logistic Regression / Linear Regression (para comparação)

### Features (variáveis de entrada)
Dados dos últimos N dias (janela temporal):
- river_discharge (vazão atual e lag de 1, 2, 3, 7 dias)
- precipitation_sum (precipitação acumulada 1, 3, 7 dias)
- rain_sum
- temperature_2m_max, temperature_2m_min
- relative_humidity_2m_max
- Taxa de variação da vazão (derivada)
- Média móvel da vazão (7, 14, 30 dias)
- Mês do ano (sazonalidade)
- Dia do ano (sazonalidade mais fina)

### Target (variável alvo)
- Opção A: Classificação do risco baseada na vazão do dia seguinte (ou N dias à frente)
- Opção B: Valor da vazão do dia seguinte (regressão)
- Definir thresholds com base nos dados históricos e, idealmente, nos dados da Defesa Civil (quando disponíveis)

### Thresholds Preliminares (baseados nos dados observados)
Para Open-Meteo (GloFAS, resolução 5km - valores menores):
- Vazão < 2 m³/s → SEM_RISCO (período seco normal)
- Vazão 2-5 m³/s → BAIXO (período chuvoso normal)
- Vazão 5-10 m³/s → MEDIO (chuvas intensas)
- Vazão > 10 m³/s → ALTO (evento significativo, como o pico de 17.32 em fev/2026)

Para dados reais da ANA/Defesa Civil (estação 41230000, área drenagem 1970 km²):
- Vazão < 50 m³/s → SEM_RISCO
- Vazão 50-150 m³/s → BAIXO
- Vazão 150-400 m³/s → MEDIO
- Vazão > 400 m³/s → ALTO (eventos como jan/1949: 1350 m³/s, jan/1961: 1127 m³/s)

Para chuva diária (estação 1943006):
- < 20 mm/dia → normal
- 20-50 mm/dia → atenção
- 50-100 mm/dia → alerta
- > 100 mm/dia → alerta máximo (máx histórico: 158.2 mm em 1 dia)

NOTA: Esses thresholds são preliminares e devem ser refinados com dados da Defesa Civil e conhecimento local sobre quando de fato ocorrem enchentes em Sabará.

### Dados para Treinamento
- Open-Meteo Flood API: vazão desde 1984 (40+ anos de dados, resolução 5km GloFAS)
- Open-Meteo Historical Weather: precipitação, temperatura, umidade desde 1940
- Defesa Civil (banco Access): chuva diária real 1941-2018 (estação 1943006), vazão real 1939-1965 (estações 41205000, 41220000, 41230000), cotas 1938-1965
- ANA HidroWeb (quando acesso concedido): dados mais recentes de estações ativas
- Junção por data: cada registro = 1 dia com todas as features meteorológicas + vazão
- Split: 80% treino, 20% teste (respeitando ordem temporal - não usar random split em séries temporais)

### IMPORTANTE: Discrepância de Escala nos Dados de Vazão
A Open-Meteo usa o modelo GloFAS que divide o planeta em quadrados de 5x5 km e simula a vazão dentro de cada quadrado. Essa resolução é grosseira — o modelo pode estar simulando um córrego ou trecho secundário em vez do Rio das Velhas real.

Comparação concreta:
- Open-Meteo (GloFAS 5km): picos de ~17 m³/s para as coordenadas de Sabará
- Estação real ANA 41230000 (equipamento físico na margem do rio, área de drenagem 1970 km²): picos de até 1350 m³/s

Nenhum dado está errado — eles medem coisas diferentes. É como tirar uma foto de satélite muito de longe (Open-Meteo) vs medir com uma régua no local (ANA). A foto de longe mostra que tem água e se está subindo ou descendo, mas não dá o valor real.

Implicações para o modelo ML:
- Não misturar valores absolutos das duas fontes como se fossem a mesma coisa
- Open-Meteo é útil para capturar tendência e sazonalidade (o padrão relativo é o mesmo)
- Thresholds de risco devem ser calibrados separadamente para cada fonte
- Pro modelo, o que importa é o padrão (subiu, desceu, taxa de variação), não o valor absoluto
- Usar preferencialmente dados reais da ANA/defesa civil quando disponíveis para definir "ground truth" de enchente

### Métricas de Avaliação
- Accuracy, Precision, Recall, F1-Score (por classe)
- Confusion Matrix
- ROC-AUC (para cada classe)
- MAE/RMSE (se regressão)
- Comparação com o método simplista original (argumento forte para o TCC)

### Pipeline de ML
1. Coleta de dados históricos (Open-Meteo APIs)
2. Limpeza e junção dos datasets
3. Feature engineering
4. Treinamento e validação cruzada (TimeSeriesSplit)
5. Avaliação e seleção do melhor modelo
6. Serialização do modelo (joblib/pickle)
7. Endpoint FastAPI para previsão em tempo real
8. Monitoramento de performance ao longo do tempo

## Treinamento vs Previsão — Dois Momentos Diferentes

| Aspecto | Treinamento | Previsão (Inferência) |
|---------|-------------|----------------------|
| Frequência | Raro (1x, depois a cada meses) | Constante (cada request) |
| Tempo | Minutos a horas | Milissegundos (< 100ms) |
| Entrada | Dados históricos (milhares de registros) | Dados atuais (últimos dias) |
| Saída | Arquivo model.pkl | Classe de risco + confiança |
| Quem dispara | Dev ou cron job | Usuário via API |
| Custo computacional | Alto (CPU/RAM) | Baixo |

Analogia: Treinamento = aluno estudando para a prova (lê livros, aprende, conhecimento fica na cabeça). Previsão = aluno fazendo a prova (já estudou, só aplica o que sabe, rápido).

## Pseudocódigo do Treinamento (trainer.py)

```python
# 1. Carregar dados do PostgreSQL
df_vazao = pd.read_sql("SELECT * FROM river_discharge_records", engine)
df_chuva = pd.read_sql("SELECT * FROM weather_records", engine)

# 2. Juntar por data (cada linha = 1 dia com todas as variáveis)
df = df_vazao.merge(df_chuva, on="recorded_date", how="inner")

# 3. Feature engineering
df["vazao_lag_1"] = df["discharge_m3s"].shift(1)
df["vazao_lag_3"] = df["discharge_m3s"].shift(3)
df["chuva_acum_7d"] = df["precipitation"].rolling(7).sum()
df["media_movel_30d"] = df["discharge_m3s"].rolling(30).mean()
df["mes"] = df["recorded_date"].dt.month
df["taxa_variacao"] = df["discharge_m3s"].diff()

# 4. Definir target
df["risco"] = df["discharge_m3s"].apply(classificar_risco)

# 5. Split temporal (NÃO random — é série temporal!)
split_idx = int(len(df) * 0.8)
X_train, X_test = X[:split_idx], X[split_idx:]

# 6. Treinar
modelo = RandomForestClassifier(n_estimators=100, random_state=42)
modelo.fit(X_train, y_train)

# 7. Avaliar
print(classification_report(y_test, modelo.predict(X_test)))

# 8. Salvar
joblib.dump(modelo, "app/models/model.pkl")
```

## Pseudocódigo da Previsão (predictor.py)

```python
# Carrega modelo 1x quando o servidor inicia
modelo = joblib.load("app/models/model.pkl")

def prever_risco(dados_atuais: dict) -> dict:
    features = montar_features(dados_atuais)
    risco = modelo.predict([features])[0]              # "HIGH"
    probabilidades = modelo.predict_proba([features])[0]
    confianca = max(probabilidades)                     # 0.87 = 87%
    return {"risk": risco, "confidence": confianca, "probabilities": {...}}
```

## Estrutura do Projeto Python (vigiaenchente-ml)

```
vigiaenchente-ml/
├── app/
│   ├── main.py                  # FastAPI — ponto de entrada
│   ├── config.py                # Configurações (DB URL, paths)
│   ├── api/routes/
│   │   ├── predict.py           # POST /predict — faz previsão
│   │   ├── train.py             # POST /train — dispara treinamento
│   │   └── health.py            # GET /health
│   ├── api/schemas/
│   │   ├── predict.py           # PredictRequest, PredictResponse
│   │   └── train.py             # TrainRequest, TrainResponse
│   ├── ml/
│   │   ├── trainer.py           # Lógica de treinamento
│   │   ├── predictor.py         # Lógica de previsão (carrega model.pkl)
│   │   ├── features.py          # Feature engineering
│   │   └── evaluation.py        # Métricas (accuracy, F1, confusion matrix)
│   ├── data/
│   │   ├── database.py          # Conexão PostgreSQL (SQLAlchemy)
│   │   └── loader.py            # Carrega dados para pandas DataFrame
│   └── models/                  # Modelos treinados (.pkl)
├── notebooks/                   # Jupyter para exploração
│   ├── 01_exploracao_dados.ipynb
│   ├── 02_feature_engineering.ipynb
│   └── 03_treinamento_modelo.ipynb
├── tests/
├── requirements.txt
├── Dockerfile
└── README.md
```

## Quando Retreinar o Modelo?

O modelo NÃO precisa ser retreinado a cada request. Retreinar quando:
1. Novos dados significativos (acumulou 6+ meses de dados novos)
2. Performance degradou (accuracy caiu abaixo de 80%)
3. Mudança no padrão (obra no rio, desvio, etc.)
4. Novos dados da ANA (conseguiu acesso a dados reais mais recentes)

## Comparação: Método Simplista vs ML (Argumento do TCC)

| Aspecto | Simplista (atual) | ML (futuro) |
|---------|-------------------|-------------|
| Variáveis | Só vazão | Vazão + chuva + temp + sazonalidade |
| Thresholds | Fixos (2/5/10) | Aprendidos dos dados |
| Sazonalidade | Ignora | Considera |
| Previsão futura | Não | Sim (próximos 7 dias) |
| Confiança | Não informa | Informa (ex: 87%) |
| Accuracy esperada | ~60-70% | ~85-95% |

Se o modelo ML tiver accuracy de 90% e o simplista 65%, isso é um argumento forte: "O uso de aprendizado de máquina melhorou a acurácia em 25 pontos percentuais".
