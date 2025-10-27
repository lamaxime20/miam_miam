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

// Changer statut
export async function updateReclamationStatus(idReclamation, uiStatus) {
  const res = await fetch(`${API_BASE}reclamations/${idReclamation}/status`, {
    method: 'PUT',
    headers: jsonHeaders,
    body: JSON.stringify({ statut: toDbStatus(uiStatus) }),
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