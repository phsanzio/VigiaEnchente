# 🌊 VigiaEnchente API

Sistema de monitoramento e previsão de enchentes para o município de Sabará/MG, focado no Rio das Velhas.

## O que é

API REST em Spring Boot que coleta dados hidrológicos e meteorológicos, calcula o risco de enchente atual e, futuramente, usará um modelo de Machine Learning para previsões mais precisas.

**Equipe:** Lívia Mendes, Paulo Moura, Pedro Sanzio e Raphael Abade.

## Stack

- Java 25 (Amazon Corretto via SDKMAN)
- Spring Boot 3.5.x
- PostgreSQL 17 (via Docker)
- Flyway (migrações de banco)
- Spring Security + JWT (autenticação)
- WebClient (chamadas a APIs externas)
- Lombok

## Pré-requisitos

- **Java 25**: `sdk install java 25.0.2-amzn` (via [SDKMAN](https://sdkman.io/))
- **Maven**: instalado globalmente ou via SDKMAN
- **Docker Desktop**: [download aqui](https://www.docker.com/products/docker-desktop/) — necessário para rodar o PostgreSQL

## Como rodar

### 1. Subir o PostgreSQL

```bash
cd vigiaenchente-api
docker compose up -d
```

Isso cria e inicia um container com PostgreSQL 17 na porta 5432.
O banco `vigiaenchente` é criado automaticamente com usuário/senha `vigiaenchente`.

> O container só para se você rodar `docker compose down` ou fechar o Docker Desktop.
> Enquanto o Docker Desktop estiver aberto, o banco fica disponível.

### 2. Rodar a aplicação

```bash
cd vigiaenchente-api
mvn spring-boot:run -DskipTests
```

> Todos os comandos abaixo assumem que você está dentro da pasta `vigiaenchente-api/`.

O Flyway roda as migrações automaticamente na primeira execução, criando todas as tabelas.

A API fica disponível em `http://localhost:8080`.

### 3. Compilar (sem rodar)

```bash
mvn clean install -DskipTests
```

## Endpoints

| Método | Endpoint | Auth | Descrição |
|--------|----------|------|-----------|
| POST | `/api/auth/register` | Público | Cadastro de usuário |
| POST | `/api/auth/login` | Público | Login (retorna JWT) |
| PATCH | `/api/auth/promote/{userId}` | ADMIN | Promove usuário a admin |
| GET | `/api/flood/risk` | Público | Risco atual de enchente |
| POST | `/api/flood/fetch?startDate=&endDate=` | ADMIN | Coleta dados de vazão da Open-Meteo |
| POST | `/api/weather/fetch?startDate=&endDate=` | ADMIN | Coleta dados meteorológicos da Open-Meteo |

### Autenticação

A API usa JWT (JSON Web Token). Após login/registro, o token é retornado no response.
Para acessar endpoints protegidos, envie o header:

```
Authorization: Bearer <seu_token_aqui>
```

### Roles

- **USER** — role padrão ao se registrar
- **ADMIN** — pode acessar endpoints de coleta de dados e promover outros usuários

Para criar o primeiro admin, rode direto no banco:
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'seu@email.com';
```
Depois disso, esse admin pode promover outros via `PATCH /api/auth/promote/{userId}`.

## Variáveis de Ambiente

| Variável | Default | Descrição |
|----------|---------|-----------|
| `DB_USERNAME` | `vigiaenchente` | Usuário do PostgreSQL |
| `DB_PASSWORD` | `vigiaenchente` | Senha do PostgreSQL |
| `JWT_SECRET` | chave temporária | Chave secreta para assinar tokens JWT |

Em produção, defina `JWT_SECRET` como variável de ambiente com uma chave forte.
Em desenvolvimento, o default funciona sem configuração extra.

## Estrutura do Projeto

```
src/main/java/com/vigiaenchente/
├── config/                    # Configurações (CORS, Security, WebClient)
├── controller/                # Endpoints REST
├── exception/                 # Tratamento global de erros
├── integration/openmeteo/     # Clientes das APIs Open-Meteo (vazão e clima)
├── model/
│   ├── dto/request/           # DTOs de entrada (login, registro, endereço)
│   ├── dto/response/          # DTOs de saída (auth, risco, usuário)
│   ├── entity/                # Entidades JPA (User, Address, WeatherRecord, etc.)
│   └── enums/                 # Enums (RiskLevel, DataSource, Role)
├── repository/                # Repositórios JPA
├── scheduler/                 # Jobs agendados (coleta periódica de dados)
├── security/                  # JWT (geração, validação, filtro)
└── service/                   # Lógica de negócio
```

### Camadas

```
Controller → Service → Repository → PostgreSQL
                ↓
          Integration (Open-Meteo APIs)
```

- **Controller**: recebe requests, valida, delega pro service
- **Service**: lógica de negócio (cálculo de risco, autenticação, coleta de dados)
- **Integration**: clientes HTTP que chamam as APIs externas (Open-Meteo)
- **Repository**: acesso ao banco via Spring Data JPA
- **Security**: filtro JWT que intercepta requests e seta autenticação

## APIs Externas

Todas gratuitas e sem necessidade de API key:

| API | Uso | Dados |
|-----|-----|-------|
| [Open-Meteo Flood](https://flood-api.open-meteo.com/) | Vazão do rio | Desde 1984, resolução 5km (GloFAS) |
| [Open-Meteo Historical Weather](https://archive-api.open-meteo.com/) | Clima histórico | Desde 1940 (chuva, temperatura, umidade) |
| [Open-Meteo Forecast](https://api.open-meteo.com/) | Previsão do tempo | Próximos dias |

Coordenadas de Sabará/MG: `latitude=-19.88, longitude=-43.80`

## Segurança

- **Senhas**: hash com BCrypt (nunca armazenadas em texto puro)
- **JWT**: tokens assinados com HMAC-SHA. Contêm userId, email e role. Expiram em 24h.
- **Roles**: USER e ADMIN. Endpoints de coleta exigem ADMIN.
- **CORS**: configurado para aceitar requests de qualquer origem (desenvolvimento)
- **CSRF**: desabilitado (API stateless, sem cookies de sessão)
- **Sessões**: stateless — o servidor não guarda estado entre requests

## Cálculo de Risco (Fase Atual)

Método simplista baseado em thresholds fixos da vazão (Open-Meteo):

| Vazão média (3 dias) | Risco |
|----------------------|-------|
| < 2 m³/s | Sem risco |
| 2 - 5 m³/s | Baixo |
| 5 - 10 m³/s | Médio |
| > 10 m³/s | Alto |

A variação da vazão (subindo/descendo) também influencia o resultado.

## Machine Learning (Futuro)

O plano é substituir o cálculo simplista por um modelo de ML treinado com dados históricos:

- **Dados de treinamento**: Defesa Civil de Sabará (chuva 1941-2018, vazão 1939-1965) + Open-Meteo histórico
- **Arquitetura**: microserviço Python (FastAPI) separado, que o Spring Boot consome via REST
- **Algoritmos**: Random Forest / Gradient Boosting (scikit-learn)
- **Objetivo**: classificar risco (NONE/LOW/MEDIUM/HIGH) com confiança percentual e previsão para os próximos 7 dias

Mais detalhes nos arquivos de steering (`.kiro/steering/`).

## Documentação de Steering (`.kiro/steering/`)

Arquivos de contexto e planejamento do projeto:

| Arquivo | Conteúdo |
|---------|----------|
| `01-projeto-visao-geral.md` | Visão geral, equipe, contexto geográfico, histórico |
| `02-arquitetura-tecnica.md` | Stack, APIs externas, infra, deploy |
| `03-roadmap-implementacao.md` | Fases do projeto e próximos passos |
| `04-banco-dados-schema.md` | Schema do PostgreSQL e plano de migração |
| `05-apis-externas-referencia.md` | Referência detalhada das APIs (parâmetros, exemplos) |
| `06-ml-estrategia.md` | Estratégia de ML, features, treinamento, estrutura Python |
| `07-tcc-orientacoes.md` | Orientações para o TCC (tema, estrutura, métricas) |
| `08-dados-defesa-civil-inventario.md` | Inventário dos dados da Defesa Civil de Sabará |
| `09-fluxos-sistema.md` | Diagramas de fluxo (atual, futuro, coleta de dados) |

## Dados da Defesa Civil (`dados-defesa-civil/`)

Dados históricos reais fornecidos pela Defesa Civil de Sabará:

- `Dados_Sabará.mdb` — banco Access com dados de 20 estações (chuva, vazão, cotas)
- `Estações_Sabará.xlsx` — cadastro das estações com coordenadas e períodos
- Tutoriais de acesso ao HidroWeb e Hidro Telemetria da ANA (PDFs)

## Migrações do Banco

| Arquivo | Descrição |
|---------|-----------|
| `V1__create_user_tables.sql` | Tabelas users e addresses |
| `V2__create_hydrological_tables.sql` | Tabelas de dados hidrológicos e meteorológicos |
| `V3__create_prediction_tables.sql` | Tabelas de previsões e alertas |
| `V4__add_role_to_users.sql` | Coluna role na tabela users |
