---
inclusion: auto
---

# VigiaEnchente - Arquitetura Técnica

## Por que Dois Serviços Separados?

| Serviço | Linguagem | Responsabilidade |
|---------|-----------|------------------|
| **vigiaenchente-api** | Java (Spring Boot) | API REST, autenticação, banco de dados, regras de negócio |
| **vigiaenchente-ml** | Python (FastAPI) | Treinamento de modelos, previsões de ML, análise de dados |

### Justificativas:
1. **Ecossistema ML**: Python domina ML/IA. scikit-learn, pandas, numpy são nativos em Python.
2. **Velocidade de prototipagem**: Em Python você treina um modelo em 10 linhas. Em Java seriam 50+.
3. **Separação de responsabilidades**: Spring Boot cuida de API/segurança. Python cuida de ML.
4. **Escalabilidade independente**: Se o modelo ML ficar pesado, escala só o serviço Python.
5. **Equipe**: Cientistas de dados preferem Python. Devs backend preferem Java.

## Stack Definida

### Backend Principal - Spring Boot (Java 25 LTS)
- Spring Boot 3.5.x
- Spring Data JPA (Hibernate)
- Spring Security (autenticação JWT)
- Spring Web (REST API)
- PostgreSQL como banco de dados
- Flyway para migrações de banco
- Comunicação com microserviço Python via REST (WebClient/RestTemplate)

### Microserviço de ML - Python (FastAPI)
- FastAPI como framework web
- scikit-learn para modelos de ML (Random Forest, Gradient Boosting)
- pandas + numpy para manipulação de dados
- Responsável por: treinar modelos, fazer previsões de risco, análise de séries temporais
- Expõe endpoints REST que o Spring Boot consome

### Banco de Dados - PostgreSQL
- Escolhido por: melhor suporte a JSON nativo, extensão PostGIS disponível para futuro uso geoespacial (rota de fuga), performance superior para queries analíticas
- Armazena: usuários, endereços, dados históricos de vazão/meteorologia, alertas, previsões

### Frontend
- Decisão pendente (pode ser o HTML existente consumindo a API REST, ou React/Vue futuramente)
- O Spring Boot serve apenas como API REST, sem servir páginas

## APIs Externas Validadas

### Open-Meteo Flood API (GRATUITA, sem API key)
- Endpoint: https://flood-api.open-meteo.com/v1/flood
- Dados: river_discharge (vazão do rio em m³/s), com variantes estatísticas (mean, max, min, p25, p75)
- Coordenadas Sabará: latitude=-19.88, longitude=-43.80
- Dados históricos disponíveis desde 1984
- Forecast disponível até 210 dias
- Resolução: 5km (GloFAS v4)
- IMPORTANTE: a resolução de 5km pode não pegar exatamente o Rio das Velhas. Variar coordenadas em ±0.1° pode ajudar.

### Open-Meteo Historical Weather API (GRATUITA, sem API key)
- Endpoint: https://archive-api.open-meteo.com/v1/archive
- Dados: precipitation_sum, rain_sum, temperature_2m_max/min, relative_humidity_2m_max, e muitos outros
- Dados desde 1940
- Resolução: 0.1° (~11km)

### OpenWeatherMap API (GRATUITA com limites)
- Clima atual em tempo real
- API key necessária (já existente no projeto original)

### ANA HidroWeb (ACESSO PENDENTE)
- Dados históricos de estações fluviométricas brasileiras
- Necessário solicitar acesso à nova API via email para hidro@ana.gov.br
- Dados de nível e vazão reais medidos em estações físicas
- Fonte mais confiável para dados de vazão do Rio das Velhas em Sabará
- Tutoriais de acesso disponíveis em dados-defesa-civil/ (PDFs da defesa civil)
- Portal web: https://www.snirh.gov.br/hidroweb/mapa e https://www.snirh.gov.br/hidrotelemetria/Mapa.aspx

### Dados Locais da Defesa Civil (DISPONÍVEIS)
- Banco Access (dados-defesa-civil/Dados_Sabará.mdb) com dados históricos reais
- 20 estações cadastradas em Sabará (pluviométricas e fluviométricas)
- Dados de chuva da estação 1943006 (1941-2018): 1746 registros mensais com chuva diária
- Dados de vazão de 3 estações (1939-1965): 631 registros mensais
- Dados de cotas/nível de 4 estações (1938-1965): 899 registros mensais
- Estação principal: 41230000 (SABARÁ, Rio das Velhas, área drenagem 1970 km², vazão máx histórica 1350 m³/s)

## Dados Reais Observados (Open-Meteo Flood API para Sabará)

### Padrão Sazonal 2024 (vazão em m³/s):
- Janeiro (chuvoso): 1.12 a 7.13 m³/s (picos durante chuvas)
- Fevereiro: 0.97 a 10.32 m³/s (pico em 24/02: 10.32)
- Março: 1.06 a 8.93 m³/s (pico em 25/03: 8.93)
- Abril-Setembro (seco): queda gradual de ~2.25 até ~0.23 m³/s
- Outubro-Novembro: início da recuperação, 0.23 a 1.74 m³/s
- Dezembro: subida rápida, 0.52 a 6.14 m³/s

### Dados Recentes (fev-mar 2026):
- Pico observado: 17.32 m³/s em 28/02/2026 (evento significativo)
- Sequência de alta: 10.61 → 14.63 → 13.26 → 17.32 → 16.30 → 14.10 m³/s

### Conclusão para ML:
- Há clara sazonalidade (período chuvoso out-mar vs seco abr-set)
- Vazão acima de ~10 m³/s parece indicar evento significativo na Open-Meteo (resolução 5km)
- Correlação precipitação x vazão é evidente nos dados (ex: 30mm de chuva em 24/01 → pico de vazão em 24-25/02)
- Há defasagem temporal entre chuva e pico de vazão (lag) que o modelo pode aprender
- IMPORTANTE — DISCREPÂNCIA DE ESCALA ENTRE FONTES DE DADOS:
  A Open-Meteo usa o GloFAS (Global Flood Awareness System) que divide o planeta em quadrados de 5x5 km e simula matematicamente a vazão do "rio" dentro de cada quadrado. Essa resolução é grosseira demais pra capturar com precisão o Rio das Velhas — o modelo pode estar simulando um córrego ou trecho secundário em vez do rio principal.
  Resultado: Open-Meteo retorna picos de ~17 m³/s, enquanto a estação real da ANA (41230000), instalada fisicamente na margem do Rio das Velhas (área de drenagem 1970 km²), registrou picos de até 1350 m³/s.
  Nenhum dado está "errado" — eles medem coisas diferentes. A Open-Meteo modela um grid genérico; a ANA mede o rio real.
  Para o ML: os dados da Open-Meteo ainda são úteis porque capturam tendência e sazonalidade (o padrão relativo é o mesmo: sobe no período chuvoso, desce no seco). Mas os thresholds de risco devem ser calibrados separadamente para cada fonte.
- A estação 1943006 tem dados de chuva de 1941 a 2018 — excelente para correlacionar com vazão e treinar modelos

## Infra e Deploy

### Desenvolvimento Local (Docker Compose)
```yaml
# docker-compose.yml (versão futura com os 3 serviços)
services:
  postgres:
    image: postgres:17
    ports: ["5432:5432"]
  api:
    build: ./vigiaenchente-api
    ports: ["8080:8080"]
    environment:
      ML_SERVICE_URL: http://ml:8000
    depends_on: [postgres]
  ml:
    build: ./vigiaenchente-ml
    ports: ["8000:8000"]
    depends_on: [postgres]
```

### Sem Docker (cada um separado)
| Terminal | Serviço | Comando |
|----------|---------|---------|
| 1 | PostgreSQL | Instalar localmente ou Docker só pro banco |
| 2 | Spring Boot | `cd vigiaenchente-api && ./mvnw spring-boot:run` |
| 3 | FastAPI | `cd vigiaenchente-ml && uvicorn app.main:app --reload --port 8000` |

### Portas
| Serviço | Porta | URL |
|---------|-------|-----|
| PostgreSQL | 5432 | localhost:5432 |
| Spring Boot API | 8080 | http://localhost:8080 |
| FastAPI ML | 8000 | http://localhost:8000 |

### Deploy Produção

**Opção 1: Railway / Render (mais simples)**
- 3 serviços separados (Java + Python + PostgreSQL managed)
- $0-17/mês (free tier cobre boa parte)

**Opção 2: AWS Free Tier**
- EC2 t2.micro (Spring Boot + FastAPI) + RDS PostgreSQL db.t3.micro
- $0 por 12 meses, depois ~$15-25/mês

**Opção 3: VPS (Hetzner, DigitalOcean)**
- 1 VPS com Docker Compose rodando tudo
- $4-12/mês, mais controle
