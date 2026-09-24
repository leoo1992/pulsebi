'use client';

import {
  BrowserRouter,
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';
import type {
  Category,
  Channel,
  DashboardResponse,
  Region,
} from '@/types/analytics';
import {
  CustomersView,
  ExplorerView,
  OverviewView,
  PortfolioView,
  RevenueView,
} from './views';

const REGIONS: Region[] = ['Sul', 'Sudeste', 'Nordeste', 'Centro-Oeste'];
const CHANNELS: Channel[] = ['E-commerce', 'Loja', 'Parceiros'];
const CATEGORIES: Category[] = ['Software', 'Serviços', 'Suporte', 'Treinamento'];

const routeMeta: Record<string, { eyebrow: string; title: string }> = {
  '/overview': { eyebrow: 'Executive workspace', title: 'Revenue Intelligence' },
  '/revenue': { eyebrow: 'Commercial performance', title: 'Revenue Analytics' },
  '/customers': { eyebrow: 'Customer performance', title: 'Customer Analytics' },
  '/portfolio': { eyebrow: 'Offer intelligence', title: 'Portfolio Analytics' },
  '/explorer': { eyebrow: 'Self-service analytics', title: 'BI Explorer' },
};

function Icon({ name }: { name: string }) {
  const icons: Record<string, string> = {
    grid: 'M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z',
    trend: 'M4 17 10 11l4 4 6-8M15 7h5v5',
    users:
      'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm9-1a3 3 0 0 1 0 6',
    layers: 'm12 2 9 5-9 5-9-5 9-5Zm9 10-9 5-9-5m18 5-9 5-9-5',
    explorer: 'M4 6h16M7 12h10M10 18h4M17 4v4M9 10v4M13 16v4',
    download: 'M12 3v12m0 0 5-5m-5 5-5-5M5 21h14',
    moon: 'M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z',
    sun: 'M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={icons[name] ?? icons.grid} />
    </svg>
  );
}

const subscribeClient = () => () => {};

function DashboardRouter() {
  const location = useLocation();
  const [months, setMonths] = useState<3 | 6 | 12>(12);
  const [region, setRegion] = useState<'all' | Region>('all');
  const [channel, setChannel] = useState<'all' | Channel>('all');
  const [category, setCategory] = useState<'all' | Category>('all');
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState(false);

  const subscribeTheme = useCallback((callback: () => void) => {
    window.addEventListener('storage', callback);
    window.addEventListener('pulsebi-theme-change', callback);

    return () => {
      window.removeEventListener('storage', callback);
      window.removeEventListener('pulsebi-theme-change', callback);
    };
  }, []);

  const theme = useSyncExternalStore(
    subscribeTheme,
    () => (window.localStorage.getItem('pulsebi-theme') === 'light' ? 'light' : 'dark'),
    () => 'dark',
  );

  const dark = theme === 'dark';

  const toggleTheme = useCallback(() => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    window.localStorage.setItem('pulsebi-theme', nextTheme);
    window.dispatchEvent(new Event('pulsebi-theme-change'));
  }, [theme]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      months: String(months),
      region,
      channel,
      category,
    });

    fetch(`/api/analytics?${params.toString()}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Falha ao carregar analytics');
        return response.json() as Promise<DashboardResponse>;
      })
      .then((payload) => {
        setData(payload);
        setError(false);
      })
      .catch((caught: unknown) => {
        if (caught instanceof Error && caught.name !== 'AbortError') {
          console.error(caught);
          setError(true);
        }
      });

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
    ? new Intl.DateTimeFormat('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(data.generatedAt))
    : '--:--';

  const meta = routeMeta[location.pathname] ?? routeMeta['/overview'];

  const navigation = [
    { to: '/overview', label: 'Visão geral', icon: 'grid' },
    { to: '/revenue', label: 'Receita', icon: 'trend' },
    { to: '/customers', label: 'Clientes', icon: 'users' },
    { to: '/portfolio', label: 'Portfólio', icon: 'layers' },
    { to: '/explorer', label: 'Explorar', icon: 'explorer' },
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">P</span>
          <div>
            <strong>PulseBI</strong>
            <small>Revenue Intelligence</small>
          </div>
        </div>

        <nav aria-label="Navegação do dashboard">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              className={({ isActive }) =>
                isActive ? 'nav-item nav-active' : 'nav-item'
              }
              to={item.to}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-card">
          <span className="status-dot" />
          <div>
            <strong>API operacional</strong>
            <small>/api/health · 200 OK</small>
          </div>
        </div>
        <p className="sidebar-foot">Next.js · React Router · TypeScript</p>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">{meta?.eyebrow}</p>
            <h1>{meta?.title}</h1>
          </div>
          <div className="top-actions">
            <div className="sync-pill">
              <span className="status-dot" />
              <div>
                <strong>Dados atualizados</strong>
                <small>{updatedAt}</small>
              </div>
            </div>
            <button
              className="icon-button"
              type="button"
              aria-label="Alternar tema"
              onClick={toggleTheme}
            >
              <Icon name={dark ? 'sun' : 'moon'} />
            </button>
            <a className="primary-button" href={exportUrl}>
              <Icon name="download" /> Exportar CSV
            </a>
          </div>
        </header>

        <section className="filter-bar" aria-label="Filtros globais">
          <label>
            <span>Período</span>
            <select
              value={months}
              onChange={(event) =>
                setMonths(Number(event.target.value) as 3 | 6 | 12)
              }
            >
              <option value={3}>Últimos 3 meses</option>
              <option value={6}>Últimos 6 meses</option>
              <option value={12}>Últimos 12 meses</option>
            </select>
          </label>
          <label>
            <span>Região</span>
            <select
              value={region}
              onChange={(event) =>
                setRegion(event.target.value as 'all' | Region)
              }
            >
              <option value="all">Todas</option>
              {REGIONS.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Canal</span>
            <select
              value={channel}
              onChange={(event) =>
                setChannel(event.target.value as 'all' | Channel)
              }
            >
              <option value="all">Todos</option>
              {CHANNELS.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Categoria</span>
            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as 'all' | Category)
              }
            >
              <option value="all">Todas</option>
              {CATEGORIES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </section>

        {!data && !error ? (
          <section className="loading-grid" aria-label="Carregando dashboard">
            {Array.from({ length: 8 }, (_, index) => (
              <div className="skeleton" key={index} />
            ))}
          </section>
        ) : error && !data ? (
          <section className="error-state">
            <strong>Não foi possível carregar os indicadores.</strong>
            <p>Atualize a página para executar uma nova consulta.</p>
          </section>
        ) : data ? (
          <Routes>
            <Route path="/" element={<Navigate replace to="/overview" />} />
            <Route path="/overview" element={<OverviewView data={data} />} />
            <Route path="/revenue" element={<RevenueView data={data} />} />
            <Route path="/customers" element={<CustomersView data={data} />} />
            <Route path="/portfolio" element={<PortfolioView data={data} />} />
            <Route path="/explorer" element={<ExplorerView data={data} />} />
            <Route path="*" element={<Navigate replace to="/overview" />} />
          </Routes>
        ) : null}

        <footer className="footer">
          <span>PulseBI · Business Intelligence demo</span>
          <span>Leonardo Santos Custódio · Software Developer</span>
        </footer>
      </main>
    </div>
  );
}

export function Dashboard() {
  const isClient = useSyncExternalStore(
    subscribeClient,
    () => true,
    () => false,
  );

  if (!isClient) {
    return <div className="boot-screen">Carregando PulseBI…</div>;
  }

  return (
    <BrowserRouter>
      <DashboardRouter />
    </BrowserRouter>
  );
}
