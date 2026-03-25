---
inclusion: auto
---

# VigiaEnchente - Orientações para TCC

## Tema Sugerido
"Aplicação de aprendizado de máquina para previsão de risco de enchentes: um estudo de caso no município de Sabará/MG"

## Estrutura Sugerida do TCC
1. Introdução: problema das enchentes urbanas, Sabará como caso de estudo
2. Revisão bibliográfica: ML aplicado a previsão de enchentes, sistemas de alerta precoce
3. Metodologia: coleta de dados, feature engineering, algoritmos utilizados, métricas
4. Desenvolvimento: arquitetura do sistema (Spring Boot + Python), implementação
5. Resultados: performance do modelo, comparação com método simplista
6. Conclusão e trabalhos futuros

## Pontos Fortes para Defesa
- Problema real com impacto social
- Dados públicos e gratuitos (Open-Meteo, ANA)
- Dados reais da Defesa Civil de Sabará (chuva 1941-2018, vazão 1939-1965)
- Comparação quantitativa: ML vs método simplista
- Sistema funcional como prova de conceito
- Escalável para outros municípios

## Referências Importantes a Buscar
- Artigos sobre ML para previsão de enchentes (flood prediction machine learning)
- GloFAS (Global Flood Awareness System) - base dos dados da Open-Meteo
- Trabalhos sobre o Rio das Velhas e enchentes em Sabará
- Documentação da ANA sobre monitoramento hidrológico
- CEMADEN (Centro Nacional de Monitoramento e Alertas de Desastres Naturais) - opera 4 estações telemétricas em Sabará

## Cuidados
- Não prometer o que não vai entregar (rota de fuga, app mobile, etc.)
- Focar no que é mensurável e demonstrável
- Documentar limitações (resolução de 5km da Open-Meteo, dados antigos da defesa civil, gap temporal nos dados de vazão)
- Os thresholds de risco precisam ser validados com dados reais de enchentes
- Explicar a discrepância de escala entre dados Open-Meteo (GloFAS, grid 5km, ~17 m³/s) e dados reais da ANA (estação física, 1350 m³/s) — não é erro, são medições de coisas diferentes. Isso inclusive pode ser um ponto interessante de discussão no TCC.

## Limitações da Resolução Espacial dos Dados Simulados vs Medidos e Seu Impacto na Acurácia do Modelo

Ponto importante para discussão no TCC. O sistema trabalha com duas fontes de dados de vazão com escalas completamente diferentes:

- **Open-Meteo (GloFAS)**: modelo computacional que divide o planeta em quadrados de 5x5 km e simula a vazão dentro de cada célula. Para Sabará, retorna picos de ~17 m³/s. É um dado **simulado**, de resolução grosseira, que pode estar modelando um córrego ou trecho secundário em vez do Rio das Velhas real.

- **ANA / Defesa Civil (estação 41230000)**: equipamento físico instalado na margem do Rio das Velhas, com área de drenagem de 1970 km². Registrou picos de até 1350 m³/s. É um dado **real, medido in loco**.

Nenhum dado está errado — eles medem coisas diferentes. A Open-Meteo é como uma foto de satélite de longe: mostra tendência (subiu, desceu, sazonalidade), mas não o valor real. A ANA é a régua no local.

### Impacto no modelo ML:
- O modelo não usa valores absolutos da Open-Meteo como se fossem vazão real. Ele usa os **padrões relativos** (variação, tendência, sazonalidade) como features de entrada.
- O "ground truth" (quando de fato houve enchente) vem dos dados reais da Defesa Civil.
- O modelo aprende: "quando o indicador da Open-Meteo sobe nessa proporção, historicamente a Defesa Civil registrou enchente".
- Thresholds de risco são calibrados separadamente para cada fonte.

### Discussão acadêmica:
- Qual o impacto dessa resolução grosseira na acurácia do modelo?
- O modelo treinado com dados simulados (Open-Meteo) como proxy tem performance comparável a um treinado com dados reais (ANA)?
- A obtenção de dados reais recentes da ANA (solicitação pendente) melhoraria significativamente a acurácia?
- Essa limitação é comum em sistemas de alerta de enchentes em municípios sem estações ativas — como contorná-la?

Esse ponto fortalece o TCC porque mostra consciência das limitações e propõe caminhos de melhoria.

## Timeline Sugerida (ajustar conforme prazo do TCC)
- Mês 1-2: Spring Boot + coleta de dados + banco populado
- Mês 3-4: Microserviço Python + treinamento do modelo + avaliação
- Mês 5: Integração completa + testes + deploy demo
- Mês 6: Escrita do TCC + preparação da defesa
