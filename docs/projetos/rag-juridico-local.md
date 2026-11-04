# RAG Jurídico Local

Projeto em desenvolvimento para organizar, recuperar e consultar legislação brasileira com uma arquitetura RAG executada localmente.

## Contexto

A proposta é construir uma base jurídica auditável: os textos devem vir de fontes oficiais, preservar seus metadados e poder ser rastreados até a norma de origem. O projeto também funciona como estudo prático de engenharia de dados, busca semântica e uso local de modelos de linguagem.

## O que já existe

- coleta de legislação a partir de identificadores e fontes oficiais;
- resolução e extração do texto integral das normas;
- limpeza e normalização do conteúdo;
- registro canônico em JSON;
- divisão do texto por artigos e hierarquia jurídica;
- persistência local em JSON e JSONL;
- estrutura para PostgreSQL e pgvector;
- busca semântica com embeddings locais;
- interface de linha de comando;
- testes automatizados para utilitários e segmentação jurídica.

## Em desenvolvimento

- consolidação da camada vetorial com PostgreSQL e pgvector;
- geração de respostas usando um modelo Llama executado localmente;
- referências explícitas aos trechos recuperados;
- validação da resposta contra as fontes jurídicas;
- preparação de uma demonstração reproduzível.

## Tecnologias

- Python;
- requests e Beautiful Soup;
- sentence-transformers;
- PostgreSQL e pgvector;
- Llama local;
- Docker como suporte opcional para a camada de banco.

## Objetivo de privacidade

O processamento local permite estudar IA generativa e recuperação de informação sem depender do envio do conteúdo consultado para um serviço externo. O projeto ainda está em evolução e não deve ser apresentado como ferramenta de aconselhamento jurídico.

