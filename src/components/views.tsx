'use client';

import { useMemo, useState } from 'react';
import type { DashboardResponse, Kpi } from '@/types/analytics';
import {
  CategoryScatter,
  ChannelDonut,
  ExplorerBars,
  ForecastChart,
  FunnelChart,
  HorizontalBars,
  MonthlyBars,
  RevenueTargetChart,
  compactCurrency,
  currency,
  integer,
  percent,
} from './charts';

function delta(kpi: Kpi) {
  if (kpi.format === 'percent') return kpi.value - kpi.previous;
  if (kpi.previous === 0) return 0;
  return (kpi.value - kpi.previous) / kpi.previous;
}

function formatKpi(kpi: Kpi) {
  if (kpi.format === 'currency') return currency(kpi.value);
  if (kpi.format === 'percent') return percent(kpi.value);
  return integer(kpi.value);
}

function KpiCard({
  kpi,
  icon,
}: {
  kpi: Kpi;
  icon: string;
}) {
  const change = delta(kpi);
  const positive = change >= 0;

  return (
    <article className="kpi-card">
      <div className="kpi-top">
        <span className="icon-box">{icon}</span>
        <span className={positive ? 'delta delta-up' : 'delta delta-down'}>
          {positive ? '↗' : '↘'} {Math.abs(change * 100).toFixed(1)}%
        </span>
      </div>
      <p>{kpi.label}</p>
      <strong>{formatKpi(kpi)}</strong>
      <small>vs. período anterior</small>
    </article>
  );
}

function CategoryTable({ data }: { data: DashboardResponse }) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Categoria</th>
            <th>Faturamento</th>
            <th>Pedidos</th>
            <th>Clientes</th>
            <th>Margem</th>
          </tr>
        </thead>
        <tbody>
          {data.categories.map((item) => (
            <tr key={item.category}>
              <td><strong>{item.category}</strong></td>
              <td>{currency(item.revenue)}</td>
              <td>{integer(item.orders)}</td>
              <td>{integer(item.customers)}</td>
              <td><span className="margin-pill">{percent(item.margin)}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function OverviewView({ data }: { data: DashboardResponse }) {
  return (
    <>
      <section className="kpi-grid">
        <KpiCard kpi={data.kpis.revenue} icon="R$" />
        <KpiCard kpi={data.kpis.margin} icon="%" />
        <KpiCard kpi={data.kpis.orders} icon="#" />
        <KpiCard kpi={data.kpis.ticket} icon="↗" />
        <KpiCard kpi={data.kpis.customers} icon="◎" />
      </section>

      <section className="insight-card">
        <span className={`insight-icon insight-${data.insight.tone}`}>◆</span>
        <div>
          <p>Executive insight</p>
          <strong>{data.insight.title}</strong>
          <small>{data.insight.body}</small>
        </div>
        <span className="source-chip">{data.source}</span>
      </section>

      <section className="main-grid">
        <article className="panel revenue-panel">
          <div className="panel-heading">
            <div><p>Performance temporal</p><h2>Receita vs. meta</h2></div>
            <div className="legend-inline">
              <span><i className="legend-revenue" /> Receita</span>
              <span><i className="legend-target" /> Meta</span>
            </div>
          </div>
          <RevenueTargetChart data={data.monthly} />
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div><p>Geografia</p><h2>Receita por região</h2></div>
          </div>
          <HorizontalBars items={data.regions} />
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div><p>Distribuição</p><h2>Mix de canais</h2></div>
          </div>
          <ChannelDonut items={data.channels} />
        </article>

        <article className="panel table-panel">
          <div className="panel-heading">
            <div><p>Unit economics</p><h2>Performance por categoria</h2></div>
            <span className="table-meta">{data.categories.length} categorias</span>
          </div>
          <CategoryTable data={data} />
        </article>
      </section>
    </>
  );
}

export function RevenueView({ data }: { data: DashboardResponse }) {
  const attainment = data.monthly.reduce(
    (total, item) => total + (item.target > 0 ? item.revenue / item.target : 0),
    0,
  ) / Math.max(data.monthly.length, 1);

  return (
    <>
      <section className="route-hero">
        <div>
          <p>REVENUE ANALYTICS</p>
          <h2>Receita, meta e tendência futura</h2>
          <span>
            Análise temporal com comparação de meta, volume comercial e forecast sintético.
          </span>
        </div>
        <div className="route-hero-stat">
          <span>Atingimento médio</span>
          <strong>{percent(attainment)}</strong>
        </div>
      </section>

      <section className="triple-grid">
        <KpiCard kpi={data.kpis.revenue} icon="R$" />
        <KpiCard kpi={data.kpis.margin} icon="%" />
        <KpiCard kpi={data.kpis.ticket} icon="↗" />
      </section>

      <section className="main-grid">
        <article className="panel revenue-panel">
          <div className="panel-heading">
            <div><p>Performance</p><h2>Receita vs. meta</h2></div>
          </div>
          <RevenueTargetChart data={data.monthly} />
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div><p>Volume</p><h2>Pedidos mensais</h2></div>
          </div>
          <MonthlyBars data={data.monthly} metric="orders" />
        </article>

        <article className="panel wide-panel">
          <div className="panel-heading">
            <div><p>Forecast</p><h2>Projeção dos próximos 3 meses</h2></div>
            <span className="table-meta">média móvel de crescimento</span>
          </div>
          <ForecastChart actual={data.monthly} forecast={data.forecast} />
        </article>
      </section>
    </>
  );
}

export function CustomersView({ data }: { data: DashboardResponse }) {
  const revenuePerCustomer =
    data.kpis.customers.value > 0
      ? data.kpis.revenue.value / data.kpis.customers.value
      : 0;

  return (
    <>
      <section className="route-hero">
        <div>
          <p>CUSTOMER ANALYTICS</p>
          <h2>Aquisição, conversão e valor da base</h2>
          <span>
            Leitura de clientes ativos, funil comercial e participação dos canais.
          </span>
        </div>
        <div className="route-hero-stat">
          <span>Receita por cliente</span>
          <strong>{currency(revenuePerCustomer)}</strong>
        </div>
      </section>

      <section className="triple-grid">
        <KpiCard kpi={data.kpis.customers} icon="◎" />
        <KpiCard kpi={data.kpis.orders} icon="#" />
        <KpiCard kpi={data.kpis.ticket} icon="↗" />
      </section>

      <section className="main-grid">
        <article className="panel">
          <div className="panel-heading">
            <div><p>Tendência</p><h2>Clientes mensais</h2></div>
          </div>
          <MonthlyBars data={data.monthly} metric="customers" />
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div><p>Conversão</p><h2>Funil comercial</h2></div>
          </div>
          <FunnelChart stages={data.funnel} />
        </article>

        <article className="panel wide-panel">
          <div className="panel-heading">
            <div><p>Aquisição</p><h2>Clientes por canal</h2></div>
          </div>
          <HorizontalBars items={data.channels} metric="customers" />
        </article>
      </section>
    </>
  );
}

export function PortfolioView({ data }: { data: DashboardResponse }) {
  const bestMargin = [...data.categories].sort((a, b) => b.margin - a.margin)[0];

  return (
    <>
      <section className="route-hero">
        <div>
          <p>PORTFOLIO ANALYTICS</p>
          <h2>Mix de oferta e eficiência por categoria</h2>
          <span>
            Compare faturamento, margem, clientes e volume para encontrar concentração e oportunidades.
          </span>
        </div>
        <div className="route-hero-stat">
          <span>Maior margem</span>
          <strong>{bestMargin ? percent(bestMargin.margin) : '—'}</strong>
          <small>{bestMargin?.category ?? ''}</small>
        </div>
      </section>

      <section className="main-grid">
        <article className="panel">
          <div className="panel-heading">
            <div><p>Receita</p><h2>Participação regional</h2></div>
          </div>
          <HorizontalBars items={data.regions} />
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div><p>Portfólio</p><h2>Margem × faturamento × pedidos</h2></div>
          </div>
          <CategoryScatter items={data.categories} />
        </article>

        <article className="panel table-panel">
          <div className="panel-heading">
            <div><p>Detalhamento</p><h2>Unit economics por categoria</h2></div>
          </div>
          <CategoryTable data={data} />
        </article>
      </section>
    </>
  );
}

type ExplorerDimension = 'region' | 'channel' | 'category';
type ExplorerMetric = 'revenue' | 'orders' | 'customers' | 'margin';

export function ExplorerView({ data }: { data: DashboardResponse }) {
  const [dimension, setDimension] = useState<ExplorerDimension>('region');
  const [metric, setMetric] = useState<ExplorerMetric>('revenue');

  const items = useMemo(() => {
    const source =
      dimension === 'region'
        ? data.regions
        : dimension === 'channel'
          ? data.channels
          : data.categories.map((item) => ({
              label: item.category,
              revenue: item.revenue,
              orders: item.orders,
              customers: item.customers,
              margin: item.margin,
            }));

    return source
      .map((item) => {
        const value = item[metric];
        const formatted =
          metric === 'revenue'
            ? compactCurrency(value)
            : metric === 'margin'
              ? percent(value)
              : integer(value);

        return {
          label: item.label,
          value,
          formatted,
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [data, dimension, metric]);

  return (
    <>
      <section className="route-hero">
        <div>
          <p>SELF-SERVICE BI</p>
          <h2>Explorador multidimensional</h2>
          <span>
            Escolha dimensão e métrica para responder perguntas de negócio sem alterar o código.
          </span>
        </div>
      </section>

      <section className="explorer-controls">
        <label>
          <span>Dimensão</span>
          <select
            value={dimension}
            onChange={(event) => setDimension(event.target.value as ExplorerDimension)}
          >
            <option value="region">Região</option>
            <option value="channel">Canal</option>
            <option value="category">Categoria</option>
          </select>
        </label>
        <label>
          <span>Métrica</span>
          <select
            value={metric}
            onChange={(event) => setMetric(event.target.value as ExplorerMetric)}
          >
            <option value="revenue">Faturamento</option>
            <option value="orders">Pedidos</option>
            <option value="customers">Clientes</option>
            <option value="margin">Margem</option>
          </select>
        </label>
      </section>

      <section className="panel explorer-panel">
        <div className="panel-heading">
          <div><p>Análise ad hoc</p><h2>Resultado da exploração</h2></div>
          <span className="table-meta">{items.length} segmentos</span>
        </div>
        <ExplorerBars items={items} />
      </section>

      <section className="explorer-summary">
        {items.map((item, index) => (
          <article key={item.label}>
            <span>#{index + 1}</span>
            <strong>{item.label}</strong>
            <small>{item.formatted}</small>
          </article>
        ))}
      </section>
    </>
  );
}
