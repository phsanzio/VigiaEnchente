---
inclusion: auto
---

# VigiaEnchente - Inventário dos Dados da Defesa Civil de Sabará

## Arquivos Disponíveis (pasta dados-defesa-civil/)

| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| Dados_Sabará.mdb | Microsoft Access Database | Banco com dados históricos de todas as estações |
| Dados_Sabará.zip | ZIP | Versão compactada do .mdb |
| Estações_Sabará.xlsx | Excel 2007+ | Cadastro detalhado das 21 estações com coordenadas e períodos |
| Tutorial de Acesso HidroWeb.pdf | PDF (3 pgs) | Tutorial para acessar dados no portal HidroWeb da ANA |
| Tutorial de Acesso Hidro Telemetria.pdf | PDF (1 pg) | Tutorial para acessar dados de telemetria em tempo real |

## Estrutura do Banco Access (Dados_Sabará.mdb)

### Tabelas com Dados Populados
| Tabela | Registros | Descrição |
|--------|-----------|-----------|
| Estacao | 20 | Cadastro das estações (código, nome, coordenadas, tipo, períodos) |
| Chuvas | 1746 | Dados mensais de precipitação com valores diários (Chuva01-Chuva31) |
| Vazoes | 631 | Dados mensais de vazão com valores diários (Vazao01-Vazao31) em m³/s |
| Cotas | 899 | Dados mensais de nível do rio com valores diários (Cota01-Cota31) em cm |
| Bacia, SubBacia, Rio, Estado, Municipio | aux | Tabelas de referência geográfica |

### Tabelas Vazias ou com Poucos Dados
CurvaDescarga, CurvaDescargaTabelaVazao, ResumoDescarga, Clima, Sedimentos, QualAgua, MedDescADCP, MedDescMolinete, Granulometria, PerfilTransversal, Imagem

## Estações Cadastradas (20 estações)

### Estações Pluviométricas (medem chuva)
| Código | Nome | Lat | Lon | Alt | Operadora | Telemetria | Período Chuva | Status |
|--------|------|-----|-----|-----|-----------|------------|---------------|--------|
| 1941024 | SABARÁ/RAVENA | -19.80 | -43.75 | - | COPASA-MG | Não | 2002-atual | Ativa |
| 1943006 | SABARÁ | -19.89 | -43.82 | 720m | SGB-CPRM | Não | 1941-2018 | Ativa |
| 1943141 | SABARÁ_N.S. Fátima | -19.87 | -43.86 | 789m | CEMADEN | Sim | 2014-atual | Ativa |
| 1943142 | SABARÁ_Ana Lucia | -19.88 | -43.90 | 821m | CEMADEN | Sim | 2014-atual | Ativa |
| 1943143 | SABARÁ_Borba Gato | -19.83 | -43.84 | 748m | CEMADEN | Sim | 2014-atual | Ativa |
| 1943144 | SABARÁ_Ravena | -19.79 | -43.76 | 845m | CEMADEN | Sim | 2014-atual | Ativa |
| 1943146 | CGH MARZAGÃO BARR. | -19.90 | -43.87 | 706m | FERTILIGAS | Sim | 2016-atual | Ativa |

### Estações Fluviométricas (medem vazão/nível do rio)
| Código | Nome | Rio | Lat | Lon | Alt | Área Dren. | Operadora | Período Vazão | Status |
|--------|------|-----|-----|-----|-----|------------|-----------|---------------|--------|
| 41200500 | RIO DAS VELHAS (mont. rib. Sabará) | Rio das Velhas | -19.91 | -43.82 | - | - | IGAM-MG | Qual.água 2003+ | Ativa |
| 41205000 | JUSTINO | Rib. da Mutuca | -19.93 | -43.93 | - | 10 km² | ANA | 1939-1946 | Inativa |
| 41220000 | SIDERURGICA | Rib. Sabará | -19.87 | -43.77 | 704m | 102 km² | ANA | 1941-1965 | Inativa |
| 41221000 | CÓR. DO GALINHA | Cór. do Galinha | -19.88 | -43.78 | 744m | - | IGAM-MG | Qual.água 2012+ | Ativa |
| 41229000 | SABARÁ | Rio das Velhas | -19.94 | -43.83 | - | - | IGAM-MG | Qual.água 1997+ | Ativa |
| 41230000 | SABARÁ | Rio São Francisco* | -19.93 | -43.82 | 691m | 1970 km² | ANA | 1937-1965 | Inativa |
| 41230500 | RIB. SABARÁ (prox. foz) | Rib. Sabará | -19.88 | -43.82 | - | - | IGAM-MG | Qual.água 1997+ | Ativa |
| 41230700 | RIO DAS VELHAS (jus. Rib. Sabará) | Rio das Velhas | -19.89 | -43.83 | 701m | - | IGAM-MG | Qual.água 2012+ | Ativa |
| 41236000 | SABARÁ | Rib. Arrudas | -19.88 | -43.86 | - | - | IGAM-MG | Qual.água 1997+ | Ativa |
| 41237000 | SABARÁ | Rio das Velhas | -19.85 | -43.87 | - | - | IGAM-MG | Qual.água 1997+ | Ativa |
| 41237500 | CGH MARZAGÃO MONT. | Rib. Arrudas | -19.90 | -43.88 | 756m | 191.8 km² | FERTILIGAS | 2016-2024 | Inativa |
| 41237580 | CGH MARZAGÃO BARR. | Rib. Arrudas | -19.90 | -43.87 | 706m | 192 km² | FERTILIGAS | 2016-2017 | Inativa |
| 41237700 | CGH MARZAGÃO JUS. | Rib. Arrudas | -19.90 | -43.86 | 690m | 200 km² | FERTILIGAS | 2025+ | Ativa |
| 41242500 | SANATÓRIO HUGO WERNECK | Rib. da Izidora | -19.92 | -43.93 | - | 49 km² | ANA | 1939-1959 | Inativa |

*Nota: A estação 41230000 está catalogada como "Rio São Francisco" mas pela localização e área de drenagem (1970 km²) provavelmente mede o Rio das Velhas na confluência.

## Dados de Vazão - Detalhamento

### Estação 41230000 (SABARÁ - a mais importante, 1970 km² de drenagem)
- Período: 1939-1965 (313 registros mensais)
- Vazão máxima histórica: 1350 m³/s (janeiro/1949)
- Top 10 eventos de vazão máxima mensal:
  1. Jan/1949: 1350 m³/s (méd: 222, mín: 46.9)
  2. Dez/1948: 1278 m³/s (méd: 129, mín: 23.5)
  3. Jan/1961: 1127 m³/s (méd: 139, mín: 38.4)
  4. Jan/1955: 1032 m³/s (méd: 93.2, mín: 18.6)
  5. Mar/1951: 998 m³/s (méd: 91.8, mín: 34.3)
  6. Dez/1947: 910 m³/s (méd: 84.6, mín: 24.2)
  7. Fev/1965: 873 m³/s (méd: 94.3, mín: 32.5)
  8. Fev/1949: 527 m³/s (méd: 182, mín: 91.0)
  9. Mar/1948: 509 m³/s (méd: 57.2, mín: 37.6)
  10. Dez/1942: 463 m³/s (méd: 103, mín: 42.1)

### Estação 41220000 (SIDERURGICA - Ribeirão Sabará, 102 km²)
- Período: 1942-1965 (237 registros mensais)
- Vazão máxima: 145 m³/s (janeiro/1964)

### Estação 41205000 (JUSTINO - Ribeirão da Mutuca, 10 km²)
- Período: 1940-1945 (81 registros mensais)
- Vazão máxima: 27.1 m³/s (janeiro/1943)

## Dados de Chuva - Detalhamento

### Estação 1943006 (SABARÁ - a mais completa)
- Período: 1941-2018 (1746 registros mensais = ~77 anos de dados)
- Chuva máxima em 1 dia: 158.2 mm (janeiro/2003)
- Total mensal máximo: 784.2 mm (janeiro/1949 - mesmo mês da maior enchente)
- Estrutura: cada registro = 1 mês, com campos Chuva01 a Chuva31 (valor diário em mm)
- Campos adicionais: Maxima, Total, DiaMaxima, NumDiasDeChuva

## Dados de Cotas (Nível do Rio) - Detalhamento

### Estação 41230000 (SABARÁ)
- Período: 1938-1965 (317 registros mensais)
- Cota máxima: 600 cm (janeiro/1949 - coincide com maior vazão)

### Estação 41220000 (SIDERURGICA)
- Período: 1942-1965 (282 registros)
- Cota máxima: 290 cm (janeiro/1964)

### Estação 41242500 (SANATÓRIO HUGO WERNECK)
- Período: 1940-1959 (219 registros)
- Cota máxima: 220 cm (dezembro/1957)

## Correlações Observadas nos Dados
- Janeiro/1949: maior chuva mensal (784.2mm) + maior vazão (1350 m³/s) + maior cota (600cm) → evento extremo
- Padrão claro: grandes enchentes ocorrem em dez-jan-fev-mar (período chuvoso)
- Dados de chuva (1941-2018) cobrem período muito maior que vazão (1939-1965), permitindo usar chuva como proxy/feature principal para o modelo ML

## Formato dos Dados no .mdb (para migração)
Cada tabela de dados (Chuvas, Vazoes, Cotas) segue o padrão:
- EstacaoCodigo: código da estação
- NivelConsistencia: 1=bruto, 2=consistido
- Data: data no formato MM/DD/YY (representa o mês)
- Valor01 a Valor31: valor para cada dia do mês
- Valor01Status a Valor31Status: status de cada medição
- Maxima, Minima, Media: estatísticas do mês
- MediaAnual: média anual (quando disponível)
