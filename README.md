# PulseBI — Revenue Intelligence

Aplicação de Business Intelligence com aparência de produto real, criada para demonstrar engenharia frontend, APIs analíticas, visualização de dados, self-service BI e experiência responsiva.

## Stack

- Next.js 16
- React 19
- TypeScript strict
- React Router / React Router DOM 7
- Tailwind CSS 4
- Next.js Route Handlers
- SVG charts sem biblioteca de gráficos
- Vercel

## Rotas

```text
/overview   visão executiva
/revenue    receita, meta, pedidos e forecast
/customers  clientes, aquisição e funil comercial
/portfolio  categorias, margem e unit economics
/explorer   análise ad hoc por dimensão e métrica
```

A aplicação usa `react-router` / `react-router-dom` para navegação client-side. O Next.js mantém a infraestrutura, APIs e entrega das rotas via catch-all.

## Funcionalidades de BI

- KPIs comparados ao período anterior
- filtros globais por período, região, canal e categoria
- receita × meta
- forecast de 3 meses
- barras horizontais e verticais
- gráfico de linha/área
- donut de canais
- funil comercial
- scatter/bubble de margem × faturamento × pedidos
- self-service explorer com dimensão e métrica selecionáveis
- unit economics por categoria
- insights executivos
- exportação CSV
- API tipada em `/api/analytics`
- health check em `/api/health`
- cache HTTP
- tema claro/escuro
- navegação desktop e mobile
- layout responsivo
- dataset sintético determinístico

## Desenvolvimento

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

### Vercel Plugin para agentes

```bash
npx plugins add vercel/vercel-plugin
```

Ou:

```bash
npm run agent:vercel
```

Esse plugin é uma ferramenta do ambiente do agente de código; ele não faz parte do runtime da aplicação.

## Endpoints

```text
GET /api/health
GET /api/analytics?months=12&region=all&channel=all&category=all
GET /api/analytics?...&format=csv
```

## Dados

O dataset é sintético e determinístico para manter a demo pública, estável, gratuita e sem exposição de dados corporativos.
