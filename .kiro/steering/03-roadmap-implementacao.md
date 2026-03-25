---
inclusion: auto
---

# VigiaEnchente - Roadmap de Implementação

## Fase 1: Fundação Spring Boot (PRÓXIMA)
1. Criar projeto Spring Boot com estrutura base
2. Modelar entidades JPA (User, Address, RiverDischargeRecord, WeatherRecord, FloodAlert)
3. Migrar lógica de autenticação (JWT em vez de session)
4. Criar serviço de integração com Open-Meteo Flood API
5. Criar serviço de integração com Open-Meteo Historical Weather API
6. Criar scheduler para coleta periódica de dados (cron job)
7. Endpoint REST para consulta de risco atual (substituindo o cálculo simplista do JS)
8. Docker Compose com PostgreSQL

## Fase 2: Coleta e Armazenamento de Dados Históricos
1. Importar dados do banco Access da defesa civil (dados-defesa-civil/Dados_Sabará.mdb) para PostgreSQL
   - Chuvas: estação 1943006 (1941-2018, 1746 registros mensais com dados diários)
   - Vazões: estações 41205000, 41220000, 41230000 (1939-1965, 631 registros)
   - Cotas: estações 41205000, 41220000, 41230000, 41242500 (1938-1965, 899 registros)
2. Script/job para popular banco com dados históricos de vazão via Open-Meteo (desde 1984)
3. Script/job para popular banco com dados meteorológicos históricos via Open-Meteo (desde 1940)
4. Solicitar acesso à API da ANA (HidroWeb) para dados mais recentes de estações ativas
5. Criar views/queries para análise exploratória e cruzamento dos dados

## Fase 3: Microserviço Python + ML (CORE DO TCC)
1. Criar projeto FastAPI
2. Endpoint de treinamento do modelo
3. Feature engineering: criar features a partir dos dados brutos
   - Vazão dos últimos N dias (lag features)
   - Precipitação acumulada (1, 3, 7 dias)
   - Taxa de variação da vazão
   - Sazonalidade (mês, dia do ano)
   - Média móvel de vazão
4. Treinar modelo de classificação (Random Forest / Gradient Boosting)
   - Classes: sem_risco, risco_baixo, risco_medio, risco_alto
   - Ou regressão: prever vazão dos próximos N dias
5. Endpoint de previsão: recebe dados atuais, retorna previsão de risco
6. Métricas de avaliação: accuracy, precision, recall, F1-score, confusion matrix
7. Comparação: modelo ML vs cálculo simplista original (argumento forte pro TCC)

## Fase 4: Integração e Alertas
1. Spring Boot consome endpoint de previsão do Python
2. Sistema de alertas por email (migrar Mailgun ou usar outro)
3. Notificações push (opcional)
4. Dashboard com histórico de previsões vs realidade

## Fase 5: Melhorias Futuras (pós-TCC ou escopo estendido)
- Rota de fuga (requer dados de elevação, malha viária, PostGIS)
- Reconhecimento de imagem para identificar locais alagados
- App mobile
- Expansão para outros municípios
- Agente IA conversacional para consultas

## Decisões Pendentes
- [ ] Definir escopo exato do TCC (sugestão: Fases 1-3 + comparação ML vs simplista)
- [ ] Solicitar acesso à API da ANA (email pronto para envio)
- [ ] Definir se frontend será React/Vue ou HTML simples
- [ ] Definir plataforma de deploy para demonstração
- [x] Dados da Defesa Civil de Sabará (DISPONÍVEIS e analisados)
