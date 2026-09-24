# PulseBI — Revenue Intelligence

Production-style Business Intelligence dashboard criado para demonstrar engenharia frontend, modelagem analítica, APIs tipadas e experiência de produto.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Next.js Route Handlers
- SVG charts sem bibliotecas de visualização
- Vercel

## O que o projeto demonstra

- dashboard executivo responsivo;
- KPIs comparados ao período anterior;
- filtros multidimensionais por período, região, canal e categoria;
- API REST tipada em `/api/analytics`;
- health check em `/api/health`;
- cache HTTP para analytics;
- gráfico temporal receita vs. meta;
- breakdown regional e mix de canais;
- unit economics por categoria;
- executive insight derivado dos indicadores;
- exportação CSV;
- tema claro/escuro persistido;
- loading e tratamento de erro;
- dataset sintético determinístico para não depender de serviços pagos ou dados sensíveis.

## Execução

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Endpoints

```text
GET /api/health
GET /api/analytics?months=12&region=all&channel=all&category=all
GET /api/analytics?...&format=csv
```

## Por que dados sintéticos?

O objetivo é apresentar arquitetura e capacidade analítica sem publicar dados corporativos ou depender de banco pago. A geração é determinística: filtros iguais produzem os mesmos resultados.

## Deploy

Projeto preparado para Vercel e compatível com o plano gratuito/hobby.
