# PulseBI — Revenue Intelligence

[Versão em português](README.md)

A Business Intelligence application demonstrating frontend engineering, analytical APIs, data visualization, self-service BI, and responsive user experience.

## Stack

- Next.js 16, React 19, and strict TypeScript
- React Router 7 and Tailwind CSS 4
- Next.js Route Handlers
- SVG charts without a charting library
- Vercel

## Routes

| Route | Purpose |
| --- | --- |
| `/overview` | Executive overview |
| `/revenue` | Revenue, targets, orders, and forecast |
| `/customers` | Customers, acquisition, and sales funnel |
| `/portfolio` | Categories, margin, and unit economics |
| `/explorer` | Ad hoc analysis by dimension and metric |

## BI capabilities

- KPIs compared with the previous period
- Global filters for period, region, channel, and category
- Revenue versus target and three-month forecast
- Bar, line/area, donut, funnel, and scatter/bubble charts
- Self-service explorer with selectable dimensions and metrics
- Category-level unit economics and executive insights
- CSV export and typed `/api/analytics` endpoint
- Health check, HTTP caching, light/dark themes, and responsive navigation

## Development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Data

The dataset is deterministic and synthetic. It keeps the public demo stable and avoids exposing corporate or customer data.
