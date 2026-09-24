'use client';

import type {
  BreakdownItem,
  CategoryRow,
  DashboardResponse,
  FunnelStage,
} from '@/types/analytics';

export function currency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
}

export function compactCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

export function integer(value: number) {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(value);
}

export function percent(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(value);
}

export function RevenueTargetChart({
  data,
}: {
  data: DashboardResponse['monthly'];
}) {
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
      x:
        data.length === 1
          ? width / 2
          : pad + (index / (data.length - 1)) * (width - pad * 2),
      y: height - pad - ((item[key] - min) / range) * (height - pad * 2),
    }));

  const revenue = points('revenue');
  const target = points('target');

  return (
    <div className="chart-wrap">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Receita mensal comparada à meta"
      >
        <defs>
          <linearGradient id="revenue-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity=".28" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g className="grid-lines">
          {[0.2, 0.4, 0.6, 0.8].map((position) => (
            <line
              key={position}
              x1="0"
              x2={width}
              y1={height * position}
              y2={height * position}
            />
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
          <circle
            className="chart-dot"
            key={point.month}
            cx={point.x}
            cy={point.y}
            r="4"
          >
            <title>
              {point.label}: {currency(point.revenue)}
            </title>
          </circle>
        ))}
      </svg>
      <div className="chart-axis">
        {data.map((item, index) => (
          <span
            key={item.month}
            className={index % 2 === 1 ? 'axis-hide-mobile' : ''}
          >
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function ForecastChart({
  actual,
  forecast,
}: {
  actual: DashboardResponse['monthly'];
  forecast: DashboardResponse['forecast'];
}) {
  const values = [
    ...actual.slice(-5).map((item) => ({
      label: item.label,
      value: item.revenue,
      forecast: false,
    })),
    ...forecast.map((item) => ({
      label: item.label,
      value: item.revenue,
      forecast: true,
    })),
  ];
  const width = 760;
  const height = 230;
  const pad = 24;
  const max = Math.max(...values.map((item) => item.value), 1);
  const min = Math.min(...values.map((item) => item.value), 0);
  const range = Math.max(max - min, 1);
  const points = values.map((item, index) => ({
    ...item,
    x:
      values.length === 1
        ? width / 2
        : pad + (index / (values.length - 1)) * (width - pad * 2),
    y: height - pad - ((item.value - min) / range) * (height - pad * 2),
  }));
  const actualPoints = points.filter((item) => !item.forecast);
  const forecastPoints = points.slice(Math.max(actualPoints.length - 1, 0));

  return (
    <div className="chart-wrap forecast-chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Forecast de faturamento">
        <g className="grid-lines">
          {[0.25, 0.5, 0.75].map((position) => (
            <line
              key={position}
              x1="0"
              x2={width}
              y1={height * position}
              y2={height * position}
            />
          ))}
        </g>
        <polyline
          className="revenue-line"
          points={actualPoints.map((point) => `${point.x},${point.y}`).join(' ')}
        />
        <polyline
          className="forecast-line"
          points={forecastPoints.map((point) => `${point.x},${point.y}`).join(' ')}
        />
        {points.map((point) => (
          <circle
            key={point.label}
            className={point.forecast ? 'forecast-dot' : 'chart-dot'}
            cx={point.x}
            cy={point.y}
            r="4"
          >
            <title>
              {point.label}: {currency(point.value)}
            </title>
          </circle>
        ))}
      </svg>
      <div className="chart-axis">
        {values.map((item) => (
          <span key={item.label}>{item.label}</span>
        ))}
      </div>
    </div>
  );
}

export function HorizontalBars({
  items,
  metric = 'revenue',
}: {
  items: BreakdownItem[];
  metric?: 'revenue' | 'orders' | 'customers';
}) {
  const max = Math.max(...items.map((item) => item[metric]), 1);

  return (
    <div className="bar-list">
      {items.map((item) => (
        <div className="bar-item" key={item.label}>
          <div className="bar-label">
            <span>{item.label}</span>
            <strong>
              {metric === 'revenue'
                ? compactCurrency(item.revenue)
                : integer(item[metric])}
            </strong>
          </div>
          <div className="bar-track">
            <span style={{ width: `${(item[metric] / max) * 100}%` }} />
          </div>
          <small>
            {metric === 'revenue'
              ? `${percent(item.share)} da receita`
              : `${percent(item.margin)} de margem`}
          </small>
        </div>
      ))}
    </div>
  );
}

export function ChannelDonut({ items }: { items: BreakdownItem[] }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const colors = ['var(--violet)', 'var(--cyan)', 'var(--blue)'];
  const segments = items.map((item, index) => {
    const priorShare = items
      .slice(0, index)
      .reduce((total, previous) => total + previous.share, 0);
    const length = circumference * item.share;

    return {
      item,
      index,
      length,
      dashOffset: -(circumference * priorShare),
    };
  });

  return (
    <div className="donut-layout">
      <div className="donut">
        <svg viewBox="0 0 140 140" role="img" aria-label="Participação por canal">
          <circle className="donut-base" cx="70" cy="70" r={radius} />
          {segments.map(({ item, index, length, dashOffset }) => (
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
          ))}
        </svg>
        <div className="donut-center">
          <strong>100%</strong>
          <span>mix</span>
        </div>
      </div>
      <div className="legend">
        {items.map((item, index) => (
          <div key={item.label}>
            <span
              className="legend-dot"
              style={{ background: colors[index] }}
            />
            <p>
              <strong>{item.label}</strong>
              <small>{percent(item.share)}</small>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MonthlyBars({
  data,
  metric,
}: {
  data: DashboardResponse['monthly'];
  metric: 'orders' | 'customers';
}) {
  const max = Math.max(...data.map((item) => item[metric]), 1);

  return (
    <div className="vertical-bars" role="img" aria-label={metric === 'orders' ? 'Pedidos mensais' : 'Clientes mensais'}>
      {data.map((item) => (
        <div className="vertical-bar" key={item.month}>
          <div className="vertical-bar-value">
            <span
              style={{ height: `${Math.max(7, (item[metric] / max) * 100)}%` }}
              title={`${item.label}: ${integer(item[metric])}`}
            />
          </div>
          <small>{item.label}</small>
        </div>
      ))}
    </div>
  );
}

export function FunnelChart({ stages }: { stages: FunnelStage[] }) {
  const max = Math.max(...stages.map((stage) => stage.value), 1);

  return (
    <div className="funnel">
      {stages.map((stage, index) => (
        <div className="funnel-row" key={stage.label}>
          <div className="funnel-meta">
            <span>{stage.label}</span>
            <strong>{integer(stage.value)}</strong>
          </div>
          <div className="funnel-track">
            <span
              style={{ width: `${Math.max(18, (stage.value / max) * 100)}%` }}
            />
          </div>
          <small>
            {index === 0 ? 'Base do funil' : `${percent(stage.conversion)} conversão`}
          </small>
        </div>
      ))}
    </div>
  );
}

export function CategoryScatter({ items }: { items: CategoryRow[] }) {
  const width = 620;
  const height = 270;
  const pad = 42;
  const maxRevenue = Math.max(...items.map((item) => item.revenue), 1);
  const margins = items.map((item) => item.margin);
  const minMargin = Math.min(...margins, 0);
  const maxMargin = Math.max(...margins, 1);
  const marginRange = Math.max(maxMargin - minMargin, 0.01);
  const maxOrders = Math.max(...items.map((item) => item.orders), 1);

  return (
    <div className="scatter-chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Faturamento por margem e volume de pedidos">
        <line className="scatter-axis" x1={pad} x2={pad} y1={pad} y2={height - pad} />
        <line className="scatter-axis" x1={pad} x2={width - pad} y1={height - pad} y2={height - pad} />
        {items.map((item, index) => {
          const x = pad + (item.revenue / maxRevenue) * (width - pad * 2);
          const y =
            height -
            pad -
            ((item.margin - minMargin) / marginRange) * (height - pad * 2);
          const radius = 9 + (item.orders / maxOrders) * 14;

          return (
            <g key={item.category}>
              <circle
                className={`scatter-dot scatter-dot-${index + 1}`}
                cx={x}
                cy={y}
                r={radius}
              >
                <title>
                  {item.category}: {currency(item.revenue)} · {percent(item.margin)}
                </title>
              </circle>
              <text x={x} y={y - radius - 7} textAnchor="middle">
                {item.category}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="scatter-caption">
        <span>← menor faturamento</span>
        <span>maior faturamento →</span>
      </div>
    </div>
  );
}

export function ExplorerBars({
  items,
}: {
  items: Array<{ label: string; value: number; formatted: string }>;
}) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="explorer-bars">
      {items.map((item) => (
        <div key={item.label}>
          <div className="explorer-label">
            <strong>{item.label}</strong>
            <span>{item.formatted}</span>
          </div>
          <div className="explorer-track">
            <span style={{ width: `${Math.max(3, (item.value / max) * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
