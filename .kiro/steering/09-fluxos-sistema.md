---
inclusion: auto
---

# VigiaEnchente - Fluxos do Sistema

## Fluxo Atual (Fase 1 — Simplista, sem ML)

```
┌─────────────┐       GET /api/flood/risk       ┌──────────────────────┐
│   Usuário    │ ──────────────────────────────► │   Spring Boot API    │
│  (Browser)   │                                 │                      │
│              │ ◄────────────────────────────── │  FloodMonitoring     │
│              │    { risk: "MEDIO", msg: ... }  │  Service             │
└─────────────┘                                  │                      │
                                                 │  ┌────────────────┐  │
                                                 │  │ Banco tem dados│  │
                                                 │  │ recentes?      │  │
                                                 │  └───────┬────────┘  │
                                                 │      SIM │ NÃO       │
                                                 │      ▼   │  ▼        │
                                                 │  ┌─────┐ │┌────────┐ │
                                                 │  │ BD  │ ││Open-   │ │
                                                 │  │Post │ ││Meteo  │ │
                                                 │  │gres │ ││API    │ │
                                                 │  └─────┘ │└────────┘ │
                                                 │          │           │
                                                 │  ┌───────▼────────┐  │
                                                 │  │ Cálculo:       │  │
                                                 │  │ média 3 dias   │  │
                                                 │  │ + thresholds   │  │
                                                 │  │ fixos (2/5/10) │  │
                                                 │  └────────────────┘  │
                                                 └──────────────────────┘
```

### O que acontece:
1. Usuário faz `GET /api/flood/risk`
2. Spring Boot busca os últimos 7 registros de vazão no banco (fonte: Open-Meteo)
3. Se não tem dados no banco, busca direto da Open-Meteo Flood API
4. Pega os 3 mais recentes, calcula a média e a variação
5. Aplica thresholds fixos: `< 2 = NONE`, `2-5 = LOW`, `5-10 = MEDIUM`, `> 10 = HIGH`
6. Retorna o risco com uma mensagem

### Limitações:
- Thresholds fixos não consideram sazonalidade (período chuvoso vs seco)
- Não usa dados de chuva (precipitação é um indicador antecedente importante)
- Não aprende com dados históricos
- Não faz previsão futura (só diz o risco "agora")

## Fluxo Futuro (Fase 3 — Com ML)

```
┌─────────────┐    GET /api/flood/risk     ┌──────────────────────┐
│   Usuário    │ ────────────────────────► │   Spring Boot API    │
│  (Browser)   │                           │   (vigiaenchente-api)│
│              │ ◄──────────────────────── │                      │
│              │  { risk: "ALTO",          └──────────┬───────────┘
│              │    confidence: 0.87,                  │
│              │    forecast: [...] }                  │ POST /predict
│              │                                      ▼
└─────────────┘                           ┌──────────────────────┐
                                          │   FastAPI (Python)   │
                                          │   (vigiaenchente-ml) │
                                          │                      │
                                          │  1. Recebe dados     │
                                          │     atuais           │
                                          │  2. Monta features   │
                                          │  3. model.predict()  │
                                          │  4. Retorna risco    │
                                          │     + confiança      │
                                          │     + previsão 7d    │
                                          └──────────┬───────────┘
                                                     │
                                          ┌──────────▼───────────┐
                                          │  Modelo Treinado     │
                                          │  (model.pkl)         │
                                          │  Treinado com dados  │
                                          │  Defesa Civil +      │
                                          │  Open-Meteo hist.    │
                                          └──────────────────────┘
```

### O que vai acontecer:
1. Usuário faz `GET /api/flood/risk` (mesma rota de antes)
2. Spring Boot coleta dados recentes (vazão, chuva, temperatura) do banco
3. Spring Boot faz `POST /predict` para o serviço Python
4. Python monta features, carrega modelo treinado, faz `model.predict()`
5. Python retorna: classe de risco + confiança + previsão para os próximos dias
6. Spring Boot formata e retorna para o usuário

### Vantagens sobre o método simplista:
- Aprende padrões complexos dos dados históricos (77 anos de chuva, 26 anos de vazão)
- Considera múltiplas variáveis (chuva + vazão + temperatura + sazonalidade)
- Faz previsão futura (próximos 7 dias)
- Retorna confiança (ex: 87% de certeza)
- Melhora com o tempo conforme mais dados são coletados

## Fluxo de Coleta de Dados (Endpoints POST)

Os endpoints `POST /api/flood/fetch` e `POST /api/weather/fetch` são para **popular o banco**. NÃO são usados pelo usuário final.

```
Dev/Admin                Spring Boot              Open-Meteo API
    │                        │                        │
    │  POST /api/flood/fetch │                        │
    │  { startDate, endDate }│                        │
    │ ──────────────────────►│                        │
    │                        │  GET /v1/flood?...     │
    │                        │───────────────────────►│
    │                        │◄───────────────────────│
    │                        │  Salva no PostgreSQL   │
    │◄──────────────────────│                        │
    │  { saved: 365 }       │                        │
```

### Quando são usados:

| Situação | Quem usa | Exemplo |
|----------|----------|---------|
| Setup inicial | Desenvolvedor | Banco recém-criado, precisa popular |
| Disaster recovery | Admin | Banco perdido/corrompido |
| Retreinamento ML | Cron job ou dev | Atualizar dados antes de retreinar |
| Novos dados | Dev | ANA liberou acesso, importar dados |

O scheduler (DataCollectionScheduler) também faz coleta automática a cada 6h.

## Fluxo Completo de Dados (Fontes → Banco → ML → Usuário)

```
FONTES DE DADOS
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│ Defesa Civil    │   │ Open-Meteo      │   │ ANA HidroWeb    │
│ (.mdb)          │   │ (API)           │   │ (API - futuro)  │
│ Chuva 1941-2018 │   │ Vazão 1984-hoje │   │ Vazão real      │
│ Vazão 1939-1965 │   │ Clima 1940-hoje │   │ Tempo real      │
│ DADOS REAIS     │   │ DADOS SIMULADOS │   │ DADOS REAIS     │
└────────┬────────┘   └────────┬────────┘   └────────┬────────┘
         │ importação          │ scheduler            │ scheduler
         │ (1x, manual)       │ (automático)         │ (futuro)
         ▼                     ▼                      ▼
┌──────────────────────────────────────────────────────────────┐
│                      PostgreSQL                               │
│  weather_records │ river_discharge_records │ flood_predictions │
└──────────────────────────┬───────────────────────────────────┘
                           │ leitura
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                   Python ML Service                           │
│  TREINAMENTO (raro)           │  PREVISÃO (cada request)     │
│  Lê dados hist. → model.pkl  │  Recebe dados → predict()    │
└──────────────────────────────┬───────────────────────────────┘
                               │ resposta
                               ▼
┌──────────────────────────────────────────────────────────────┐
│  Spring Boot API → GET /api/flood/risk → Usuário             │
└──────────────────────────────────────────────────────────────┘
```

## Mapa de Endpoints

| Endpoint | Método | Público? | Quem usa | Propósito |
|----------|--------|----------|----------|-----------|
| `/api/auth/register` | POST | Sim | Usuário | Cadastro |
| `/api/auth/login` | POST | Sim | Usuário | Login (retorna JWT) |
| `/api/flood/risk` | GET | Sim | Usuário | Risco atual de enchente |
| `/api/flood/fetch` | POST | Não (JWT) | Dev/Admin | Popular banco com dados de vazão |
| `/api/weather/fetch` | POST | Não (JWT) | Dev/Admin | Popular banco com dados meteorológicos |

## Comunicação Spring Boot ↔ Python

```java
// FloodMonitoringService.java (versão futura com ML)
public FloodRiskResponse getCurrentRisk() {
    var recentDischarge = dischargeRepository.findRecent(7);
    var recentWeather = weatherRepository.findRecent(7);
    var mlRequest = new MLPredictRequest(recentDischarge, recentWeather);

    var mlResponse = mlServiceClient.post()
        .uri("/predict")
        .bodyValue(mlRequest)
        .retrieve()
        .bodyToMono(MLPredictResponse.class)
        .block();

    return FloodRiskResponse.fromMLResponse(mlResponse);
}
```

### Fallback (se Python estiver fora do ar):
```java
public FloodRiskResponse getCurrentRisk() {
    try {
        return getCurrentRiskFromML();       // tenta ML primeiro
    } catch (Exception e) {
        log.warn("ML indisponível, usando método simplista", e);
        return getCurrentRiskSimplistic();   // fallback
    }
}
```
