import { NextRequest } from 'next/server';
import { CATEGORIES, CHANNELS, getDashboardData, REGIONS, toCsv } from '@/lib/analytics';
import type { Category, Channel, DashboardFilters, Region } from '@/types/analytics';

export const dynamic = 'force-dynamic';

function parseMonths(value: string | null): 3 | 6 | 12 {
  return value === '3' || value === '6' ? (Number(value) as 3 | 6) : 12;
}

function parseFilter<T extends string>(value: string | null, allowed: readonly T[]): 'all' | T {
  return value && allowed.includes(value as T) ? (value as T) : 'all';
}

export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const filters: DashboardFilters = {
    months: parseMonths(params.get('months')),
    region: parseFilter<Region>(params.get('region'), REGIONS),
    channel: parseFilter<Channel>(params.get('channel'), CHANNELS),
    category: parseFilter<Category>(params.get('category'), CATEGORIES),
  };

  const data = getDashboardData(filters);

  if (params.get('format') === 'csv') {
    return new Response('\uFEFF' + toCsv(data), {
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': 'attachment; filename="pulsebi-category-performance.csv"',
      },
    });
  }

  return Response.json(data, {
    headers: {
      'cache-control': 'public, s-maxage=300, stale-while-revalidate=1800',
    },
  });
}
