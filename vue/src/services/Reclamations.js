const API_BASE = import.meta.env.VITE_API_URL + "api/" || 'http://localhost:8000/api/';

const toFrontendStatus = (dbStatus) => {
  switch (dbStatus) {
    case 'ouverte': return 'open';
    case 'en_traitement': return 'in-progress';
    case 'fermée': return 'resolved';
    default: return 'open';
  }
};

const toDbStatus = (uiStatus) => {
  switch (uiStatus) {
    case 'open': return 'ouverte';
    case 'in-progress': return 'en_traitement';
    case 'resolved': return 'fermée';
    default: return 'ouverte';
  }
};

const jsonHeaders = { 'Content-Type': 'application/json' };

// Restaurants pour le select
export async function fetchRestaurants() {
  const res = await fetch(`${API_BASE}restaurants`);
  if (!res.ok) throw new Error('Erreur chargement restaurants');
  return await res.json();
}

// Lister les réclamations d’un client
export async function fetchReclamationsByClient(idClient) {
  const res = await fetch(`${API_BASE}reclamations/client/${idClient}`);
  if (!res.ok) throw new Error('Erreur chargement réclamations');
  const data = await res.json();
  return data.map(r => ({
    id: r.id_reclamation,
    subject: r.nom_restaurant ? `Réclamation - ${r.nom_restaurant}` : 'Réclamation',
    orderNumber: '',
    date: new Date(r.date_soummission).toLocaleDateString(),
    status: toFrontendStatus(r.statut_reclamation),
    category: '',
    description: r.message_reclamation,
  }));
}

// Employer: lister les réclamations pour un restaurant, mappées au format attendu par la page Employeur
export async function fetchReclamationsByRestaurant(idRestaurant) {
  const res = await fetch(`${API_BASE}reclamations/restaurant/${idRestaurant}`);
  if (!res.ok) throw new Error('Erreur chargement réclamations restaurant');
  const data = await res.json();
  // Le backend peut renvoyer des colonnes différentes selon la jointure; on gère prudemment
  return data.map(r => ({
    id: String(r.id_reclamation ?? r.id ?? ''),
    orderId: r.id_commande ? String(r.id_commande) : (r.order_id ?? ''),
    customer: r.nom_client || r.client_nom || r.client || r.acheteur_nom || 'Client',
    email: r.email_client || r.client_email || r.email || '',
    subject: r.sujet || r.subject || 'Réclamation',
    description: r.message_reclamation || r.description || '',
    status: r.statut_reclamation || r.status || 'ouverte',
    createdAt: r.date_soummission || r.created_at || new Date().toISOString(),
    response: r.derniere_reponse || r.response || undefined,
  }));
}

// Créer une réclamation
export async function createReclamation({ message, restaurantId, acheteurId }) {
  const res = await fetch(`${API_BASE}reclamations`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({
      message,
      restaurant_cible: restaurantId,
      acheteur: acheteurId,
    }),
  });
  if (!res.ok) throw new Error('Erreur création réclamation');
  return await res.json(); // { id }
}

// Détail réclamation + réponses
export async function fetchReclamationDetail(idReclamation) {
  const res = await fetch(`${API_BASE}reclamations/${idReclamation}`);
  if (!res.ok) throw new Error('Erreur chargement réclamation');
  const rows = await res.json();
  if (!rows || (Array.isArray(rows) && rows.length === 0)) return null;

  // Le contrôleur renvoie déjà un objet agrégé avec reponses
  if (!Array.isArray(rows)) return rows;

  // Si jamais c'est brut (lignes), fallback:
  const base = {
    id: rows[0].id_reclamation,
    message: rows[0].message_reclamation,
    date: rows[0].date_soummission,
    status: toFrontendStatus(rows[0].statut_reclamation),
    restaurant_cible: rows[0].restaurant_cible,
    acheteur: rows[0].acheteur,
  };
  const reponses = rows
    .filter(r => r.id_reponse !== null)
    .map(r => ({
      id: r.id_reponse,
      message: r.message_reponse,
      statut: toFrontendStatus(r.statut_reponse),
      auteur: r.auteur,
    }));
  return { ...base, reponses };
}

// Lister uniquement les réponses d’une réclamation
export async function fetchReponses(idReclamation) {
  const res = await fetch(`${API_BASE}reclamations/${idReclamation}/reponses`);
  if (!res.ok) throw new Error('Erreur chargement réponses');
  const data = await res.json();
  return data.map(r => ({
    id: r.id_reponse,
    message: r.message_reponse,
    statut: toFrontendStatus(r.statut_reponse),
    auteur: r.auteur,
  }));
}

// Ajouter une réponse
export async function addReponse(idReclamation, { message, auteurId, statut /* optionnel: 'open'|'in-progress'|'resolved' */ }) {
  const body = {
    message,
    auteur: auteurId,
  };
  if (statut) body.statut = toDbStatus(statut);

  const res = await fetch(`${API_BASE}reclamations/${idReclamation}/reponses`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Erreur ajout réponse');
  return await res.json(); // { id }
}

// Changer statut (UI mapping open/in-progress/resolved)
export async function updateReclamationStatus(idReclamation, uiStatus) {
  const res = await fetch(`${API_BASE}reclamations/${idReclamation}/status`, {
    method: 'PUT',
    headers: jsonHeaders,
    body: JSON.stringify({ statut: toDbStatus(uiStatus) }),
  });
  if (!res.ok) throw new Error('Erreur mise à jour statut');
  return await res.json();
}

// Changer statut en passant directement un statut DB ('ouverte'|'en_traitement'|'fermée')
export async function updateReclamationStatusDb(idReclamation, dbStatus) {
  const allowed = ['ouverte','en_traitement','fermée'];
  const statut = allowed.includes(dbStatus) ? dbStatus : toDbStatus(dbStatus);
  const res = await fetch(`${API_BASE}reclamations/${idReclamation}/status`, {
    method: 'PUT',
    headers: jsonHeaders,
    body: JSON.stringify({ statut }),
  });
  if (!res.ok) throw new Error('Erreur mise à jour statut');
  return await res.json();
}

// Clôturer
export async function closeReclamation(idReclamation) {
  const res = await fetch(`${API_BASE}reclamations/${idReclamation}/close`, { method: 'PUT' });
  if (!res.ok) throw new Error('Erreur clôture réclamation');
  return await res.json();
}