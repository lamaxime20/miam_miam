// ReportAdmin.js
// Fonctions pour récupérer les données de ReportsPage depuis l'API Laravel
const API_URL = "https://miam-miam-q5x4.onrender.com/";
const API_BASE = API_URL + 'api/dashboard/reports';

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: {
      'Accept': 'application/json'
    },
    credentials: 'same-origin'
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

export async function fetchReportsPageData({ restaurantId, startDate, endDate, months = 10, limit = 5 }) {
  if (!restaurantId) throw new Error('restaurantId requis');

  const params = new URLSearchParams();
  params.set('restaurant_id', restaurantId);
  if (startDate) params.set('start_date', startDate);
  if (endDate) params.set('end_date', endDate);
  params.set('months', String(months));
  params.set('limit', String(limit));

  const url = `${API_BASE}/all?${params.toString()}`;
  return fetchJson(url);
}

// Wrappers individuels (si vous préférez appeler des endpoints séparés)
export async function getMonthlyRevenue({ restaurantId, months = 10 }) {
  const params = new URLSearchParams({ restaurant_id: restaurantId, months: String(months) });
  return fetchJson(`${API_BASE}/monthly-revenue?${params.toString()}`);
}

export async function getCategoryDistribution({ restaurantId }) {
  const params = new URLSearchParams({ restaurant_id: restaurantId });
  return fetchJson(`${API_BASE}/category-distribution?${params.toString()}`);
}

export async function getTopProducts({ restaurantId, limit = 5 }) {
  const params = new URLSearchParams({ restaurant_id: restaurantId, limit: String(limit) });
  return fetchJson(`${API_BASE}/top-products?${params.toString()}`);
}

export async function getHourlyOrders({ restaurantId, startDate, endDate }) {
  const params = new URLSearchParams({ restaurant_id: restaurantId });
  if (startDate) params.set('start_date', startDate);
  if (endDate) params.set('end_date', endDate);
  return fetchJson(`${API_BASE}/hourly-orders?${params.toString()}`);
}

export async function getKpis({ restaurantId, startDate, endDate }) {
  const params = new URLSearchParams({ restaurant_id: restaurantId });
  if (startDate) params.set('start_date', startDate);
  if (endDate) params.set('end_date', endDate);
  return fetchJson(`${API_BASE}/kpis?${params.toString()}`);
}

export async function getMonthlySummary({ restaurantId, startDate, endDate }) {
  const params = new URLSearchParams({ restaurant_id: restaurantId });
  if (startDate) params.set('start_date', startDate);
  if (endDate) params.set('end_date', endDate);
  return fetchJson(`${API_BASE}/summary?${params.toString()}`);
}

export default {
  fetchReportsPageData,
  getMonthlyRevenue,
  getCategoryDistribution,
  getTopProducts,
  getHourlyOrders,
  getKpis,
  getMonthlySummary
};
