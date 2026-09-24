# Arquitetura

```text
Browser
  ↓
Next.js UI
  ↓
/api/analytics
  ↓
Analytics Engine
  ↓
Deterministic Dataset
```

A UI não conhece a lógica de geração ou agregação dos dados. O endpoint expõe um contrato tipado e pode ser substituído futuramente por PostgreSQL, Supabase ou um serviço NestJS sem reescrever o dashboard.

## Decisões

- **Next.js Route Handlers:** um único deploy e zero infraestrutura adicional.
- **TypeScript strict:** contratos explícitos entre engine, API e UI.
- **SVG nativo:** reduz bundle e demonstra fundamentos de visualização.
- **Dataset sintético:** demo pública segura, estável e gratuita.
- **Cache HTTP:** analytics cacheável por 5 minutos com stale-while-revalidate.

## Evolução prevista

1. PostgreSQL/Supabase;
2. autenticação e RBAC;
3. ingestão CSV;
4. jobs de ETL;
5. forecasting;
6. testes de contrato da API.
