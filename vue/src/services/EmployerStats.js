const API_URL = import.meta.env.VITE_API_URL + 'api/';

/**
 * Récupère les statistiques employeur depuis le backend.
 * @param {{ restaurantId: number, days?: number }} params
 * @returns {Promise<{orders:number, delivered:number, revenue:number, avgTicket:number, newDishes:number}>}
 */
export async function getEmployerStats({ restaurantId, days = 30 }) {
  if (!restaurantId) throw new Error('restaurantId est requis');
  const url = new URL(API_URL + 'employe/stats');
  url.searchParams.set('restaurant_id', String(restaurantId));
  url.searchParams.set('days', String(days));

  const res = await fetch(url.toString(), {
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Erreur API employe/stats: ${res.status}`);
  }
  return res.json();
}

/**
 * Récupère les statistiques de série pour le tableau de bord de l'employeur.
 * @param {{ restaurantId: number, days?: number }} params
 * @returns {Promise<{orders:number, delivered:number, revenue:number, avgTicket:number, newDishes:number}>}
 */
export async function getEmployerSeries({ restaurantId, days = 30 }) {
  if (!restaurantId) throw new Error('restaurantId est requis');
  const url = new URL(API_URL + 'employe/series');
  url.searchParams.set('restaurant_id', String(restaurantId));
  url.searchParams.set('days', String(days));

  const res = await fetch(url.toString(), {
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Erreur API employe/series: ${res.status}`);
  }
  return res.json();
}