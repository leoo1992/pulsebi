export type Region = 'Sul' | 'Sudeste' | 'Nordeste' | 'Centro-Oeste';
export type Channel = 'E-commerce' | 'Loja' | 'Parceiros';
export type Category = 'Software' | 'Serviços' | 'Suporte' | 'Treinamento';

export interface DashboardFilters {
  months: 3 | 6 | 12;
  region: 'all' | Region;
  channel: 'all' | Channel;
  category: 'all' | Category;
}

export interface Kpi {
  label: string;
  value: number;
  previous: number;
  format: 'currency' | 'number' | 'percent';
}

export interface MonthlyPoint {
  month: string;
  label: string;
  revenue: number;
  target: number;
  orders: number;
  customers: number;
  margin: number;
}

export interface ForecastPoint {
  month: string;
  label: string;
  revenue: number;
}

export interface BreakdownItem {
  label: string;
  revenue: number;
  share: number;
  orders: number;
  customers: number;
  margin: number;
}

export interface CategoryRow {
  category: Category;
  revenue: number;
  orders: number;
  margin: number;
  customers: number;
}

export interface FunnelStage {
  label: string;
  value: number;
  conversion: number;
}

export interface DashboardResponse {
  generatedAt: string;
  source: string;
  filters: DashboardFilters;
  kpis: {
    revenue: Kpi;
    margin: Kpi;
    orders: Kpi;
    ticket: Kpi;
    customers: Kpi;
  };
  monthly: MonthlyPoint[];
  forecast: ForecastPoint[];
  regions: BreakdownItem[];
  channels: BreakdownItem[];
  categories: CategoryRow[];
  funnel: FunnelStage[];
  insight: {
    title: string;
    body: string;
    tone: 'positive' | 'attention' | 'neutral';
  };
}
