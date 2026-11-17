import test from 'node:test';
import assert from 'node:assert/strict';
import { getDashboardData, toCsv } from '../src/lib/analytics.ts';

const allFilters = {
  months: 6,
  region: 'all',
  channel: 'all',
  category: 'all',
};

test('dashboard aggregates monthly, forecast, category, and KPI data', () => {
  const dashboard = getDashboardData(allFilters);

  assert.equal(dashboard.monthly.length, 6);
  assert.equal(dashboard.forecast.length, 3);
  assert.equal(dashboard.categories.length, 4);
  assert.ok(dashboard.kpis.revenue.value > 0);
  assert.ok(dashboard.kpis.orders.value > 0);
  assert.ok(dashboard.kpis.margin.value > 0 && dashboard.kpis.margin.value < 1);
});

test('dashboard filters constrain the generated dataset', () => {
  const dashboard = getDashboardData({
    ...allFilters,
    region: 'Sul',
    channel: 'E-commerce',
    category: 'Software',
  });

  assert.ok(dashboard.kpis.revenue.value > 0);
  assert.ok(dashboard.regions.find((item) => item.label === 'Sul')?.revenue > 0);
  assert.ok(dashboard.categories.find((item) => item.category === 'Software')?.revenue > 0);
  assert.equal(dashboard.categories.filter((item) => item.revenue > 0).length, 1);
});

test('CSV export includes the category table header and data rows', () => {
  const csv = toCsv(getDashboardData(allFilters));

  assert.match(csv, /^categoria;faturamento;pedidos;clientes;margem/);
  assert.ok(csv.split('\n').length > 1);
});
