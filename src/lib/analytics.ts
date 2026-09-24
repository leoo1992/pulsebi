import type {
  Category,
  CategoryRow,
  Channel,
  DashboardFilters,
  DashboardResponse,
  Region,
} from '@/types/analytics';

interface SaleRecord {
  monthIndex: number;
  month: string;
  label: string;
  region: Region;
  channel: Channel;
  category: Category;
  revenue: number;
  cost: number;
  orders: number;
  customers: number;
}

export const REGIONS: Region[] = ['Sul', 'Sudeste', 'Nordeste', 'Centro-Oeste'];
export const CHANNELS: Channel[] = ['E-commerce', 'Loja', 'Parceiros'];
export const CATEGORIES: Category[] = ['Software', 'Serviços', 'Suporte', 'Treinamento'];

const MONTHS = Array.from({ length: 24 }, (_, index) => {
  const date = new Date(Date.UTC(2024, 9 + index, 1));
  return {
    index,
    key: date.toISOString().slice(0, 7),
    label: new Intl.DateTimeFormat('pt-BR', {
      month: 'short',
      year: '2-digit',
      timeZone: 'UTC',
    })
      .format(date)
      .replace('.', ''),
  };
});

const REGION_FACTOR: Record<Region, number> = {
  Sul: 1.08,
  Sudeste: 1.34,
  Nordeste: 0.84,
  'Centro-Oeste': 0.72,
};

const CHANNEL_FACTOR: Record<Channel, number> = {
  'E-commerce': 1.18,
  Loja: 0.92,
  Parceiros: 0.78,
};

const DATASET: SaleRecord[] = MONTHS.flatMap((month) =>
  REGIONS.flatMap((region, regionIndex) =>
    CHANNELS.flatMap((channel, channelIndex) =>
      CATEGORIES.map((category, categoryIndex) => {
        const seasonal = 1 + Math.sin((month.index / 12) * Math.PI * 2) * 0.11;
        const trend = 1 + month.index * 0.019;
        const categoryFactor = 0.76 + categoryIndex * 0.115;
        const noiseSeed =
          (month.index * 7919 +
            regionIndex * 3797 +
            channelIndex * 1901 +
            categoryIndex * 1103) %
          19000;
        const base = 26000 + noiseSeed;
        const revenue = Math.round(
          base *
            REGION_FACTOR[region] *
            CHANNEL_FACTOR[channel] *
            categoryFactor *
            seasonal *
            trend,
        );
        const marginRate =
          0.31 +
          ((month.index + regionIndex + channelIndex + categoryIndex) % 9) * 0.012;
        const cost = Math.round(revenue * (1 - marginRate));
        const orders = Math.max(
          8,
          Math.round(revenue / (1600 + ((month.index + categoryIndex) % 5) * 120)),
        );
        const customers = Math.max(
          6,
          Math.round(orders * (0.69 + regionIndex * 0.025)),
        );

        return {
          monthIndex: month.index,
          month: month.key,
          label: month.label,
          region,
          channel,
          category,
          revenue,
          cost,
          orders,
          customers,
        };
      }),
    ),
  ),
);

function sum(records: SaleRecord[], key: 'revenue' | 'cost' | 'orders' | 'customers') {
  return records.reduce((total, record) => total + record[key], 0);
}

function marginOf(records: SaleRecord[]) {
  const revenue = sum(records, 'revenue');
  const cost = sum(records, 'cost');
  return revenue > 0 ? (revenue - cost) / revenue : 0;
}

function filterDimension(records: SaleRecord[], filters: DashboardFilters) {
  return records
    .filter((record) => filters.region === 'all' || record.region === filters.region)
    .filter((record) => filters.channel === 'all' || record.channel === filters.channel)
    .filter((record) => filters.category === 'all' || record.category === filters.category);
}

function makeKpi(
  label: string,
  value: number,
  previous: number,
  format: 'currency' | 'number' | 'percent',
) {
  return { label, value, previous, format };
}

function computeBreakdown<T extends Region | Channel>(
  records: SaleRecord[],
  values: readonly T[],
  selector: (record: SaleRecord) => T,
) {
  const total = sum(records, 'revenue');

  return values
    .map((value) => {
      const slice = records.filter((record) => selector(record) === value);
      const revenue = sum(slice, 'revenue');

      return {
        label: value,
        revenue,
        share: total > 0 ? revenue / total : 0,
        orders: sum(slice, 'orders'),
        customers: sum(slice, 'customers'),
        margin: marginOf(slice),
      };
    })
    .sort((a, b) => b.revenue - a.revenue);
}

function buildForecast(monthlyRevenue: number[]) {
  const recent = monthlyRevenue.slice(-4);
  const changes = recent.slice(1).map((value, index) => {
    const prior = recent[index] ?? value;
    return prior > 0 ? (value - prior) / prior : 0;
  });
  const averageGrowth = changes.length
    ? changes.reduce((total, value) => total + value, 0) / changes.length
    : 0;
  const cappedGrowth = Math.max(-0.05, Math.min(0.08, averageGrowth));

  let lastValue = recent.at(-1) ?? 0;
  const lastMonth = MONTHS.at(-1);
  const baseDate = lastMonth
    ? new Date(`${lastMonth.key}-01T00:00:00.000Z`)
    : new Date(Date.UTC(2026, 8, 1));

  return Array.from({ length: 3 }, (_, index) => {
    const date = new Date(
      Date.UTC(baseDate.getUTCFullYear(), baseDate.getUTCMonth() + index + 1, 1),
    );
    lastValue = Math.round(lastValue * (1 + cappedGrowth));

    return {
      month: date.toISOString().slice(0, 7),
      label: new Intl.DateTimeFormat('pt-BR', {
        month: 'short',
        year: '2-digit',
        timeZone: 'UTC',
      })
        .format(date)
        .replace('.', ''),
      revenue: lastValue,
    };
  });
}

export function getDashboardData(filters: DashboardFilters): DashboardResponse {
  const currentStart = MONTHS.length - filters.months;
  const previousStart = Math.max(0, currentStart - filters.months);

  const current = filterDimension(
    DATASET.filter((record) => record.monthIndex >= currentStart),
    filters,
  );
  const previous = filterDimension(
    DATASET.filter(
      (record) => record.monthIndex >= previousStart && record.monthIndex < currentStart,
    ),
    filters,
  );

  const revenue = sum(current, 'revenue');
  const cost = sum(current, 'cost');
  const orders = sum(current, 'orders');
  const customers = sum(current, 'customers');
  const previousRevenue = sum(previous, 'revenue');
  const previousCost = sum(previous, 'cost');
  const previousOrders = sum(previous, 'orders');
  const previousCustomers = sum(previous, 'customers');

  const margin = revenue > 0 ? (revenue - cost) / revenue : 0;
  const previousMargin =
    previousRevenue > 0 ? (previousRevenue - previousCost) / previousRevenue : 0;
  const ticket = orders > 0 ? revenue / orders : 0;
  const previousTicket = previousOrders > 0 ? previousRevenue / previousOrders : 0;

  const monthly = MONTHS.slice(currentStart).map((month, index) => {
    const slice = current.filter((record) => record.monthIndex === month.index);
    const monthRevenue = sum(slice, 'revenue');
    const baseline =
      previousRevenue > 0 ? previousRevenue / filters.months : revenue / filters.months;
    const target = Math.round(baseline * (1.035 + index * 0.006));

    return {
      month: month.key,
      label: month.label,
      revenue: monthRevenue,
      target,
      orders: sum(slice, 'orders'),
      customers: sum(slice, 'customers'),
      margin: marginOf(slice),
    };
  });

  const forecast = buildForecast(monthly.map((item) => item.revenue));
  const regions = computeBreakdown(current, REGIONS, (record) => record.region);
  const channels = computeBreakdown(current, CHANNELS, (record) => record.channel);

  const categories: CategoryRow[] = CATEGORIES.map((category) => {
    const records = current.filter((record) => record.category === category);
    const categoryRevenue = sum(records, 'revenue');
    const categoryCost = sum(records, 'cost');

    return {
      category,
      revenue: categoryRevenue,
      orders: sum(records, 'orders'),
      customers: sum(records, 'customers'),
      margin:
        categoryRevenue > 0 ? (categoryRevenue - categoryCost) / categoryRevenue : 0,
    };
  }).sort((a, b) => b.revenue - a.revenue);

  const funnelBase = Math.max(orders, 1);
  const funnelValues = [
    { label: 'Leads', value: Math.round(funnelBase * 4.8) },
    { label: 'Oportunidades', value: Math.round(funnelBase * 2.15) },
    { label: 'Pedidos', value: orders },
    { label: 'Recompra', value: Math.round(funnelBase * 0.34) },
  ];
  const funnel = funnelValues.map((stage, index) => ({
    ...stage,
    conversion:
      index === 0
        ? 1
        : stage.value / Math.max(funnelValues[index - 1]?.value ?? stage.value, 1),
  }));

  const revenueDelta =
    previousRevenue > 0 ? (revenue - previousRevenue) / previousRevenue : 0;
  const bestRegion = regions[0];
  const strongestCategory = categories[0];

  const insight =
    revenueDelta >= 0.06
      ? {
          title: 'Tração acima da base comparável',
          body: `A receita avançou ${(revenueDelta * 100).toFixed(1)}% sobre o período anterior. ${bestRegion?.label ?? 'A principal região'} lidera participação e ${strongestCategory?.category ?? 'a principal categoria'} concentra o maior faturamento.`,
          tone: 'positive' as const,
        }
      : revenueDelta < -0.02
        ? {
            title: 'Receita exige atenção',
            body: `O faturamento recuou ${Math.abs(revenueDelta * 100).toFixed(1)}% no comparativo. A análise por região e canal ajuda a localizar a origem da retração antes de ajustar metas.`,
            tone: 'attention' as const,
          }
        : {
            title: 'Operação em faixa estável',
            body: 'A receita está próxima do período comparável. O ganho de margem e o mix de canais passam a ser os principais vetores para ampliar resultado.',
            tone: 'neutral' as const,
          };

  return {
    generatedAt: new Date().toISOString(),
    source: 'Dataset comercial sintético e determinístico',
    filters,
    kpis: {
      revenue: makeKpi('Faturamento', revenue, previousRevenue, 'currency'),
      margin: makeKpi('Margem bruta', margin, previousMargin, 'percent'),
      orders: makeKpi('Pedidos', orders, previousOrders, 'number'),
      ticket: makeKpi('Ticket médio', ticket, previousTicket, 'currency'),
      customers: makeKpi('Clientes', customers, previousCustomers, 'number'),
    },
    monthly,
    forecast,
    regions,
    channels,
    categories,
    funnel,
    insight,
  };
}

export function toCsv(data: DashboardResponse) {
  const rows = [
    ['categoria', 'faturamento', 'pedidos', 'clientes', 'margem'],
    ...data.categories.map((item) => [
      item.category,
      item.revenue,
      item.orders,
      item.customers,
      item.margin.toFixed(4),
    ]),
  ];

  return rows.map((row) => row.join(';')).join('\n');
}
