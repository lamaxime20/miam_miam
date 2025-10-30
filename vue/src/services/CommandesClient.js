const API_URL = import.meta.env.VITE_API_URL;

// Mappe les statuts métier (DB/Backend) vers les statuts utilisés dans l'UI
// Règles fournies:
// - non lu: commande en cours
// - en préparation: commande validée et bon en cours OU bon validé sans livraison
// - en livraison: commande validée, bon validé et livraison en cours
// - validé: commande validée, bon validé et livraison validée
// - annulé: si un des éléments est annulé
export function mapStatutForUI(statutBackend) {
  const s = (statutBackend || '').toLowerCase();
  if (s === 'non lu' || s === 'non_lu' || s === 'en_cours') return 'pending';
  if (s === 'en préparation' || s === 'en_preparation') return 'preparing';
  if (s === 'en livraison' || s === 'en_livraison') return 'delivering';
  if (s === 'validé' || s === 'valide' || s === 'validée') return 'delivered';
  if (s === 'annulé' || s === 'annule' || s === 'annulée') return 'cancelled';
  return 'pending';
}

// Transforme la structure renvoyée par l'API vers celle attendue par la page MesCommandes
function transformCommandeToUI(cmd) {
  const items = Array.isArray(cmd.liste_menus)
    ? cmd.liste_menus.map(m => `${m.nom_menu} x${m.quantite}`)
    : [];

  const total = Array.isArray(cmd.liste_menus)
    ? cmd.liste_menus.reduce((sum, m) => sum + Number(m.prix_total || 0), 0)
    : 0;

  // Format date simple (YYYY-MM-DD HH:mm)
  const dateStr = (cmd.date_commande || cmd.date_heure_livraison || '')
    .toString()
    .replace('T', ' ')
    .slice(0, 16);

  return {
    id: cmd.id_commande,
    orderNumber: `#${String(cmd.id_commande).padStart(4, '0')}`,
    date: dateStr,
    status: mapStatutForUI(cmd.statut || cmd.statut_commande),
    items,
    total,
    deliveryAddress: cmd.localisation_client || '',
    createdAtMs: Date.parse(cmd.date_commande || cmd.date_heure_livraison || new Date().toISOString()) || Date.now(),
  };
}

// Récupère les commandes par ID utilisateur (utilise l'endpoint existant)
export async function fetchClientOrdersByUserId(userId) {
  if (!userId) return [];
  const resp = await fetch(`${API_URL}api/getCommandesByUser/${userId}`);
  if (!resp.ok) {
    // En cas de 404, retourner un tableau vide; sinon lever une erreur générique
    if (resp.status === 404) return [];
    let msg = `Erreur serveur : ${resp.status}`;
    try { const e = await resp.json(); if (e && e.message) msg = e.message; } catch {}
    throw new Error(msg);
  }
  const data = await resp.json();
  const list = Array.isArray(data) ? data : Array.isArray(data?.commandes) ? data.commandes : [];
  return list.map(transformCommandeToUI);
}

// Met à jour une commande (PUT)
export async function updateCommandeClient(id_commande, payload) {
  // payload: { date_heure_livraison, localisation_client, type_localisation, statut_commande }
  const resp = await fetch(`${API_URL}api/updateCommande/${id_commande}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw new Error(data.message || `Erreur serveur : ${resp.status}`);
  }
  return data;
}

// Helpers pour récupérer l'ID utilisateur courant via le token stocké
import { getAuthInfo, getUserByEmail } from './user';

export async function getCurrentUserId() {
  const auth = getAuthInfo();
  if (!auth || !auth.display_name) {
    return null;
  }
  const user = await getUserByEmail(auth.display_name);
  return user?.id_user || user?.id || null;
}

// Récupère directement les commandes de l'utilisateur courant
export async function fetchCurrentUserOrders() {
  const userId = await getCurrentUserId();
  console.log(userId);
  if (!userId) return [];
  return fetchClientOrdersByUserId(userId);
}

// Annule une commande côté client (met le statut à 'annulé')
export async function cancelCommande(id_commande) {
  if (!id_commande) throw new Error('id_commande manquant');
  const resp = await fetch(`${API_URL}api/commandes/${id_commande}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ statut: 'annulé' }),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw new Error(data.message || `Erreur serveur : ${resp.status}`);
  }
  return data; // { id_commande, statut }
}
