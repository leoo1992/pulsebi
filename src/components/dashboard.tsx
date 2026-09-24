'use client';

import { useEffect, useMemo, useState } from 'react';
import type {
  BreakdownItem,
  Category,
  Channel,
  DashboardResponse,
  Kpi,
  Region,
} from '@/types/analytics';

const REGIONS: Region[] = ['Sul', 'Sudeste', 'Nordeste', 'Centro-Oeste'];
const CHANNELS: Channel[] = ['E-commerce', 'Loja', 'Parceiros'];
const CATEGORIES: Category[] = ['Software', 'Serviços', 'Suporte', 'Treinamento'];

function currency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
}

function compactCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

function integer(value: number) {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(value);
}

function percent(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(value);
}

function formatKpi(kpi: Kpi) {
  if (kpi.format === 'currency') return currency(kpi.value);
  if (kpi.format === 'percent') return percent(kpi.value);
  return integer(kpi.value);
}

function getDelta(kpi: Kpi) {
  if (kpi.format === 'percent') return kpi.value - kpi.previous;
  if (kpi.previous === 0) return 0;
  return (kpi.value - kpi.previous) / kpi.previous;
}

function Icon({ name }: { name: string }) {
  const icons: Record<string, string> = {
    grid: 'M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z',
    trend: 'M4 17 10 11l4 4 6-8M15 7h5v5',
    users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm9-1a3 3 0 0 1 0 6',
    layers: 'm12 2 9 5-9 5-9-5 9-5Zm9 10-9 5-9-5m18 5-9 5-9-5',
    download: 'M12 3v12m0 0 5-5m-5 5-5-5M5 21h14',
    moon: 'M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z',
    sun: 'M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
    spark: 'm12 3 1.8 4.9L19 10l-5.2 2.1L12 17l-1.8-4.9L5 10l5.2-2.1L12 3Z',
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={icons[name] ?? icons.grid} />
    </svg>
  );
}

function KpiCard({ kpi, icon }: { kpi: Kpi; icon: string }) {
  const change = getDelta(kpi);
  const positive = change >= 0;

  return (
    <article className="kpi-card">
      <div className="kpi-top">
        <span className="icon-box"><Icon name={icon} /></span>
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

function RevenueChart({ data }: { data: DashboardResponse['monthly'] }) {
  const width = 820;
  const height = 290;
  const pad = 24;
  const all = data.flatMap((item) => [item.revenue, item.target]);
  const max = Math.max(...all, 1);
  const min = Math.min(...all, 0);
  const range = Math.max(max - min, 1);

  const points = (key: 'revenue' | 'target') =>
    data.map((item, index) => ({
      ...item,
      x: data.length === 1 ? width / 2 : pad + (index / (data.length - 1)) * (width - pad * 2),
      y: height - pad - ((item[key] - min) / range) * (height - pad * 2),
    }));

  const revenue = points('revenue');
  const target = points('target');

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Receita mensal comparada à meta">
        <defs>
          <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity=".28" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g className="grid-lines">
          {[0.2, 0.4, 0.6, 0.8].map((position) => (
            <line key={position} x1="0" x2={width} y1={height * position} y2={height * position} />
          ))}
        </g>
        <polygon
          className="area"
          points={`${pad},${height - pad} ${revenue.map((point) => `${point.x},${point.y}`).join(' ')} ${width - pad},${height - pad}`}
        />
        <polyline
          className="target-line"
          points={target.map((point) => `${point.x},${point.y}`).join(' ')}
        />
        <polyline
          className="revenue-line"
          points={revenue.map((point) => `${point.x},${point.y}`).join(' ')}
        />
        {revenue.map((point) => (
          <circle className="chart-dot" key={point.month} cx={point.x} cy={point.y} r="4">
            <title>{point.label}: {currency(point.revenue)}</title>
          </circle>
        ))}
      </svg>
      <div className="chart-axis">
        {data.map((item, index) => (
          <span key={item.month} className={index % 2 === 1 ? 'axis-hide-mobile' : ''}>{item.label}</span>
        ))}
      </div>
    </div>
  );
}

function RegionBars({ items }: { items: BreakdownItem[] }) {
  const max = Math.max(...items.map((item) => item.revenue), 1);

  return (
    <div className="bar-list">
      {items.map((item) => (
        <div className="bar-item" key={item.label}>
          <div className="bar-label">
            <span>{item.label}</span>
            <strong>{compactCurrency(item.revenue)}</strong>
          </div>
          <div className="bar-track">
            <span style={{ width: `${(item.revenue / max) * 100}%` }} />
          </div>
          <small>{percent(item.share)} da receita</small>
        </div>
      ))}
    </div>
  );
}

function ChannelDonut({ items }: { items: BreakdownItem[] }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const colors = ['var(--violet)', 'var(--cyan)', 'var(--blue)'];

  return (
    <div className="donut-layout">
      <div className="donut">
        <svg viewBox="0 0 140 140" role="img" aria-label="Participação por canal">
          <circle className="donut-base" cx="70" cy="70" r={radius} />
          {items.map((item, index) => {
            const length = circumference * item.share;
            const dashOffset = -offset;
            offset += length;
            return (
              <circle
                key={item.label}
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke={colors[index]}
                strokeWidth="16"
                strokeDasharray={`${length} ${circumference - length}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="butt"
                transform="rotate(-90 70 70)"
              />
            );
          })}
        </svg>
        <div className="donut-center">
          <strong>100%</strong>
          <span>mix</span>
        </div>
      </div>
      <div className="legend">
        {items.map((item, index) => (
          <div key={item.label}>
            <span className="legend-dot" style={{ background: colors[index] }} />
            <p><strong>{item.label}</strong><small>{percent(item.share)}</small></p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Dashboard() {
  const [months, setMonths] = useState<3 | 6 | 12>(12);
  const [region, setRegion] = useState<'all' | Region>('all');
  const [channel, setChannel] = useState<'all' | Channel>('all');
  const [category, setCategory] = useState<'all' | Category>('all');
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const stored = window.localStorage.getItem('pulsebi-theme');
    setDark(stored ? stored === 'dark' : true);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    window.localStorage.setItem('pulsebi-theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ months: String(months), region, channel, category });

    setLoading(true);
    fetch(`/api/analytics?${params.toString()}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Falha ao carregar analytics');
        return response.json() as Promise<DashboardResponse>;
      })
      .then(setData)
      .catch((error: unknown) => {
        if (error instanceof Error && error.name !== 'AbortError') console.error(error);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [category, channel, months, region]);

  const exportUrl = useMemo(() => {
    const params = new URLSearchParams({
      months: String(months),
      region,
      channel,
      category,
      format: 'csv',
    });
    return `/api/analytics?${params.toString()}`;
  }, [category, channel, months, region]);

  const updatedAt = data
    ? new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(data.generatedAt))
    : '--:--';

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">P</span>
          <div><strong>PulseBI</strong><small>Revenue Intelligence</small></div>
        </div>

        <nav aria-label="Navegação do dashboard">
          <a className="nav-item nav-active" href="#overview"><Icon name="grid" /><span>Visão geral</span></a>
          <a className="nav-item" href="#revenue"><Icon name="trend" /><span>Receita</span></a>
          <a className="nav-item" href="#customers"><Icon name="users" /><span>Clientes</span></a>
          <a className="nav-item" href="#categories"><Icon name="layers" /><span>Portfólio</span></a>
        </nav>

        <div className="sidebar-card">
          <span className="status-dot" />
          <div><strong>API operacional</strong><small>/api/health · 200 OK</small></div>
        </div>
        <p className="sidebar-foot">Next.js · React · TypeScript</p>
      </aside>

      <main className="content" id="overview">
        <header className="topbar">
          <div><p className="eyebrow">Executive workspace</p><h1>Revenue Intelligence</h1></div>
          <div className="top-actions">
            <div className="sync-pill">
              <span className="status-dot" />
              <div><strong>Dados atualizados</strong><small>{updatedAt}</small></div>
            </div>
            <button className="icon-button" type="button" aria-label="Alternar tema" onClick={() => setDark((value) => !value)}>
              <Icon name={dark ? 'sun' : 'moon'} />
            </button>
            <a className="primary-button" href={exportUrl}><Icon name="download" /> Exportar CSV</a>
          </div>
        </header>

        <section className="filter-bar" aria-label="Filtros">
          <label><span>Período</span><select value={months} onChange={(event) => setMonths(Number(event.target.value) as 3 | 6 | 12)}><option value={3}>Últimos 3 meses</option><option value={6}>Últimos 6 meses</option><option value={12}>Últimos 12 meses</option></select></label>
          <label><span>Região</span><select value={region} onChange={(event) => setRegion(event.target.value as 'all' | Region)}><option value="all">Todas</option>{REGIONS.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><span>Canal</span><select value={channel} onChange={(event) => setChannel(event.target.value as 'all' | Channel)}><option value="all">Todos</option>{CHANNELS.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><span>Categoria</span><select value={category} onChange={(event) => setCategory(event.target.value as 'all' | Category)}><option value="all">Todas</option>{CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></label>
        </section>

        {loading && !data ? (
          <section className="loading-grid" aria-label="Carregando dashboard">
            {Array.from({ length: 8 }, (_, index) => <div className="skeleton" key={index} />)}
          </section>
        ) : data ? (
          <>
            <section className="kpi-grid">
              <KpiCard kpi={data.kpis.revenue} icon="trend" />
              <KpiCard kpi={data.kpis.margin} icon="spark" />
              <KpiCard kpi={data.kpis.orders} icon="layers" />
              <KpiCard kpi={data.kpis.ticket} icon="grid" />
              <KpiCard kpi={data.kpis.customers} icon="users" />
            </section>

            <section className="insight-card">
              <span className={`insight-icon insight-${data.insight.tone}`}><Icon name="spark" /></span>
              <div><p>Executive insight</p><strong>{data.insight.title}</strong><small>{data.insight.body}</small></div>
              <span className="source-chip">{data.source}</span>
            </section>

            <section className="main-grid">
              <article className="panel revenue-panel" id="revenue">
                <div className="panel-heading"><div><p>Performance temporal</p><h2>Receita vs. meta</h2></div><div className="legend-inline"><span><i className="legend-revenue" /> Receita</span><span><i className="legend-target" /> Meta</span></div></div>
                <RevenueChart data={data.monthly} />
              </article>

              <article className="panel">
                <div className="panel-heading"><div><p>Geografia</p><h2>Receita por região</h2></div></div>
                <RegionBars items={data.regions} />
              </article>

              <article className="panel" id="customers">
                <div className="panel-heading"><div><p>Distribuição</p><h2>Mix de canais</h2></div></div>
                <ChannelDonut items={data.channels} />
              </article>

              <article className="panel table-panel" id="categories">
                <div className="panel-heading"><div><p>Unit economics</p><h2>Performance por categoria</h2></div><span className="table-meta">{data.categories.length} categorias</span></div>
                <div className="table-scroll">
                  <table>
                    <thead><tr><th>Categoria</th><th>Faturamento</th><th>Pedidos</th><th>Clientes</th><th>Margem</th></tr></thead>
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
              </article>
            </section>
          </>
        ) : (
          <section className="error-state"><strong>Não foi possível carregar os indicadores.</strong><p>Atualize a página para executar uma nova consulta.</p></section>
        )}

        <footer className="footer"><span>PulseBI · demo de Business Intelligence</span><span>Leonardo Santos Custódio · Software Developer</span></footer>
      </main>
    </div>
  );
}
