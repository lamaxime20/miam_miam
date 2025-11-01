const API_BASE_URL = "https://miam-miam-q5x4.onrender.com/api";

/**
 * Récupère les points de fidélité du client
 */
export async function getPointsFidelite(clientId) {
  try {
    const response = await fetch(`${API_BASE_URL}/client/${clientId}/points`);
    if (!response.ok) {
      throw new Error(`Erreur HTTP : ${response.status}`);
    }
    const data = await response.json();
    return data.points_fidelite ?? 0;
  } catch (error) {
    console.error("Erreur lors de la récupération des points de fidélité :", error);
    return 0;
  }
}

/**
 * Récupère les détails de parrainage (code, totaux, historique des filleuls)
 */
export async function getReferralDetails(clientId) {
  try {
    const response = await fetch(`${API_BASE_URL}/client/${clientId}/referral-details`);
    if (!response.ok) {
      throw new Error(`Erreur HTTP : ${response.status}`);
    }
    const data = await response.json();

    const referral = data.referral || {};
    const referrals = Array.isArray(data.referrals) ? data.referrals : [];

    // Normalisation pour convenir à l'UI Fidelite.jsx
    return {
      referralCode: referral.code || "",
      totalReferralPoints: referral.total_points_referrals || 0,
      totalReferrals: referral.total_filleuls || 0,
      referralHistory: referrals.map((r) => ({
        name: r.nom_filleul,
        status: r.actif ? "active" : "pending",
        points: r.points || 0,
        date: r.date_inscription,
      })),
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des détails de parrainage :", error);
    return {
      referralCode: "",
      totalReferralPoints: 0,
      totalReferrals: 0,
      referralHistory: [],
    };
  }
}

/**
 * Réclame le bonus quotidien de fidélité (10 points par défaut)
 * Retourne { success, newPoints?, alreadyClaimed? }
 */
export async function claimDailyBonus(clientId, restaurantId = 1) {
  try {
    const response = await fetch(`${API_BASE_URL}/client/${clientId}/bonus-quotidien`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restaurant_id: restaurantId }),
    });

    if (response.status === 409) {
      // Bonus déjà réclamé aujourd'hui
      return { success: false, alreadyClaimed: true };
    }

    if (!response.ok) {
      throw new Error(`Erreur HTTP : ${response.status}`);
    }

    const data = await response.json();
    return { success: true, newPoints: data.new_points };
  } catch (error) {
    console.error("Erreur lors de la réclamation du bonus quotidien :", error);
    return { success: false };
  }
}

// =============================
// Fonctions haut-niveau pour l'UI
// =============================

/**
 * Charge toutes les données nécessaires à la page Fidélité & Parrainage.
 * Retourne un objet prêt à être injecté dans l'état du composant.
 */
export async function loadFideliteData(clientId) {
  try {
    const [currentPoints, referral] = await Promise.all([
      getPointsFidelite(clientId),
      getReferralDetails(clientId),
    ]);

    return {
      currentPoints,
      referralCode: referral.referralCode,
      totalReferralPoints: referral.totalReferralPoints,
      totalReferrals: referral.totalReferrals,
      referralHistory: referral.referralHistory,
    };
  } catch (error) {
    console.error("Erreur lors du chargement des données de fidélité :", error);
    return {
      currentPoints: 0,
      referralCode: "",
      totalReferralPoints: 0,
      totalReferrals: 0,
      referralHistory: [],
    };
  }
}

/**
 * Clique sur "Récupérer 10 points" : réclame le bonus et rafraîchit les points.
 * Retourne { success, alreadyClaimed?, currentPoints? }.
 */
export async function claimDailyBonusAndRefresh(clientId, restaurantId = 1) {
  const res = await claimDailyBonus(clientId, restaurantId);
  if (!res.success) {
    return { success: false, alreadyClaimed: !!res.alreadyClaimed };
  }
  const currentPoints = await getPointsFidelite(clientId);
  return { success: true, currentPoints };
}

/**
 * Copie le code de parrainage dans le presse-papiers.
 * Retourne true/false selon la réussite.
 */
export async function copyReferralCodeToClipboard(referralCode) {
  try {
    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(referralCode);
      return true;
    }
    // Fallback minimal (peut ne pas fonctionner selon le contexte)
    const el = document.createElement('textarea');
    el.value = referralCode;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    return true;
  } catch (error) {
    console.error('Erreur lors de la copie du code de parrainage :', error);
    return false;
  }
}
