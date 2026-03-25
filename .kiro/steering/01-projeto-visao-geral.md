---
inclusion: auto
---

# VigiaEnchente - Visão Geral do Projeto

## O que é
Sistema de monitoramento e previsão de enchentes para o município de Sabará/MG, focado inicialmente no Rio das Velhas. Originalmente desenvolvido em JavaScript (Node.js + Express), está sendo migrado para Spring Boot (backend) com um microserviço Python para ML/IA.

## Equipe
Lívia Mendes, Paulo Moura, Pedro Sanzio e Raphael Abade.

## Contexto Geográfico
- Município: Sabará, Minas Gerais, Brasil
- Rio principal: Rio das Velhas (afluente do Rio São Francisco)
- Coordenadas de referência: latitude -19.88, longitude -43.80
- Elevação da região: ~835m
- Sabará sofre historicamente com enchentes do Rio das Velhas, especialmente no período chuvoso (outubro a março)

## Repositório Original (JS)
- GitHub: https://github.com/phsanzio/VigiaEnchente
- Stack original: Node.js, Express, MySQL, bcryptjs, Mailgun, OpenWeatherMap API, Open-Meteo Flood API, NewsAPI, ipinfo.io
- Funcionalidades existentes: autenticação de usuários, cadastro de endereço, exibição de clima, classificação simplista de risco de enchente (baixo/médio/alto), notícias sobre enchentes, envio de email de confirmação

## Problema do Projeto Original
- Coordenadas da Flood API estavam hardcoded para Oslo (59.9, 10.75) em vez de Sabará (-19.88, -43.80)
- Cálculo de risco é simplista: média de 3 valores de vazão com thresholds fixos (5 e 10 m³/s)
- Sem dados históricos, sem ML, sem análise preditiva real

## Objetivo da Evolução
Migrar para Spring Boot + microserviço Python com ML para análise preditiva de enchentes, usando dados reais de vazão e meteorológicos da região de Sabará. Potencial tema de TCC: "Análise preditiva de risco de enchente usando aprendizado de máquina aplicado a dados hidrológicos e meteorológicos".

## Dados da Defesa Civil (DISPONÍVEIS - pasta dados-defesa-civil/)
A defesa civil forneceu dados valiosos que incluem:
- Arquivo Access (.mdb) com dados históricos de 20 estações em Sabará
- Planilha Excel com cadastro detalhado das estações (coordenadas, tipo, período)
- Tutoriais de acesso ao HidroWeb e Hidro Telemetria da ANA

### Estações Mais Relevantes:
- **41230000 - SABARÁ** (Rio São Francisco/Rio das Velhas): lat -19.93, lon -43.82, alt 691m, área drenagem 1970 km². Dados de vazão e cotas de 1938 a 1965. Vazão máxima histórica: 1350 m³/s (jan/1949). INATIVA.
- **41229000 - SABARÁ** (Rio das Velhas, IGAM): lat -19.94, lon -43.83. Qualidade da água desde 1997. ATIVA.
- **41230700 - RIO DAS VELHAS (jus. Ribeirão Sabará)** (IGAM): lat -19.89, lon -43.83, alt 701m. Qualidade da água desde 2012. ATIVA.
- **41237000 - SABARÁ** (Rio das Velhas, IGAM): lat -19.85, lon -43.87. Qualidade da água desde 1997. ATIVA.
- **41220000 - SIDERURGICA** (Ribeirão Sabará): lat -19.87, lon -43.77, alt 704m, área 102 km². Vazão/cotas 1942-1965. Vazão máx: 145 m³/s. INATIVA.
- **1943006 - SABARÁ** (Pluviométrica, ANA/CPRM): lat -19.89, lon -43.82, alt 720m. Dados de chuva desde 1941. ATIVA. Chuva máxima em 1 dia: 158.2mm. Total mensal máximo: 784.2mm (jan/1949).
- **1943141 a 1943144** - Estações CEMADEN (telemétricas, pluviométricas) em bairros de Sabará: N.S. Fátima, Ana Lucia, Borba Gato, Ravena. Ativas desde 2014.

### Dados Disponíveis no .mdb:
- Vazões: 631 registros mensais (3 estações, 1939-1965)
- Cotas (nível do rio): 899 registros mensais (4 estações, 1938-1965)
- Chuvas: 1746 registros mensais (estação 1943006, 1941-2018)
- Tabelas auxiliares: Bacia, Rio, Município, CurvaDescarga (vazia)

## Status Atual
- Fase de planejamento e concepção da nova arquitetura
- Dados da defesa civil de Sabará: DISPONÍVEIS e analisados
- Dados da ANA (HidroWeb): solicitação de acesso à API pendente (email a enviar)
- Acesso ao portal web HidroWeb/Telemetria: tutoriais disponíveis nos PDFs da defesa civil
