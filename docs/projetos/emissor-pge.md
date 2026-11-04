# Emissor de Guias PGE

Projeto privado desenvolvido por Gabriel Bomfim Bispo para apoiar uma rotina do setor financeiro da Procuradoria-Geral do Estado de Sergipe.

## Contexto

A emissão de guias exigia a repetição de etapas no navegador, conferência de dados vindos de planilhas, organização dos arquivos gerados e registro do resultado de cada item processado. A automação foi criada a partir dessa rotina real, conhecida por quem executava o trabalho.

## O que a solução faz

- lê lotes em planilhas nos formatos ODS e Excel;
- valida e normaliza os dados necessários antes da execução;
- conduz o fluxo de emissão no navegador;
- mantém a confirmação humana quando o portal exige verificação;
- baixa, valida e organiza os PDFs gerados;
- permite pausar, interromper e retomar o processamento;
- produz um relatório final com sucessos e falhas;
- mascara informações sensíveis nos registros de execução.

## Tecnologias e decisões técnicas

- Python;
- Selenium;
- Tkinter;
- openpyxl e ezodf;
- processamento em lote com política de retentativas;
- diagnóstico local de compatibilidade entre Chrome e ChromeDriver;
- distribuição como aplicativo Windows;
- testes automatizados do motor, documentos, rotas de processamento e caminhos da aplicação.

## Resultado

A ferramenta reduziu a repetição manual, padronizou a execução por lote e criou uma forma mais clara de acompanhar o que foi processado e o que ainda precisava de atenção.

## Privacidade

O código-fonte, os endereços internos, as credenciais, os documentos, as planilhas operacionais e os dados processados não são públicos. Esta descrição apresenta somente o contexto, a arquitetura geral e os aprendizados técnicos que podem ser compartilhados com segurança.

