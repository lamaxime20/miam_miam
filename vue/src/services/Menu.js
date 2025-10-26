
const API_BASE_URL = "http://localhost:8000/api";

export async function AvoirMenusJourAcceul() {
    try {
        const response = await fetch(`${API_BASE_URL}/choisir_menu_jour`);
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const data = await response.json();

        // On prend seulement les 5 premiers éléments
        const top5Menus = data.slice(0, 5);

        return top5Menus;
    } catch (error) {
        console.error("Erreur lors de la récupération des menus du jour :", error);
        return []; // Retourne un tableau vide en cas d'erreur
    }
}

export async function getImageBase64(id) {
    if (!id) return "/placeholder.svg";

    try {
        const response = await fetch(`${API_BASE_URL}/files/${id}`);
        if (!response.ok) throw new Error(`Fichier introuvable : ${response.status}`);

        const data = await response.json();

        // Vérifier que contenu_base64 existe
        if (!data.contenu_base64) return "/placeholder.svg";

        return `data:image/${data.extension || "jpg"};base64,${data.contenu_base64}`;
    } catch (error) {
        console.error("Erreur récupération image :", error);
        return "/placeholder.svg"; // fallback
    }
}

// ============================================
// FONCTIONS POUR LE DASHBOARD
// ============================================

/**
 * Récupère les statistiques du dashboard pour un client
 */
export async function getDashboardStats(clientId) {
    try {
        const response = await fetch(`${API_BASE_URL}/client/${clientId}/dashboard-stats`);
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const data = await response.json();
        return data.stats;
    } catch (error) {
        console.error("Erreur lors de la récupération des statistiques du dashboard :", error);
        return {
            points_fidelite: 0,
            nombre_commandes: 0,
            nombre_filleuls: 0
        };
    }
}

/**
 * Récupère les commandes récentes d'un client
 */
export async function getCommandesRecentes(clientId, limit = 5) {
    try {
        const response = await fetch(`${API_BASE_URL}/client/${clientId}/commandes-recentes?limit=${limit}`);
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const data = await response.json();
        return data.commandes;
    } catch (error) {
        console.error("Erreur lors de la récupération des commandes récentes :", error);
        return [];
    }
}

/**
 * Récupère les détails de fidélité d'un client
 */
export async function getDetailsFidelite(clientId) {
    try {
        const response = await fetch(`${API_BASE_URL}/client/${clientId}/details-fidelite`);
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const data = await response.json();
        return data.details;
    } catch (error) {
        console.error("Erreur lors de la récupération des détails de fidélité :", error);
        return {
            points_actuels: 0,
            points_pour_repas_gratuit: 1500,
            pourcentage_progression: 0,
            nombre_filleuls: 0
        };
    }
}

/**
 * Récupère les promotions actives
 */
export async function getPromotionsActives() {
    try {
        const response = await fetch(`${API_BASE_URL}/promotions/actives`);
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const data = await response.json();
        return data.promotions;
    } catch (error) {
        console.error("Erreur lors de la récupération des promotions actives :", error);
        return [];
    }
}

/**
 * Récupère les notifications/événements pour un client
 */
export async function getNotificationsClient(clientId) {
    try {
        const response = await fetch(`${API_BASE_URL}/notifications/client/${clientId}`);
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const data = await response.json();
        return data.notifications;
    } catch (error) {
        console.error("Erreur lors de la récupération des notifications :", error);
        return [];
    }
}

/**
 * Marque une notification comme lue
 */
export async function marquerNotificationLue(notificationId, clientId) {
    try {
        const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/client/${clientId}/marquer-lue`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const data = await response.json();
        return data.success;
    } catch (error) {
        console.error("Erreur lors de la mise à jour de la notification :", error);
        return false;
    }
}

/**
 * Récupère le top des clients
 */
export async function getTopClients(limit = 10) {
    try {
        const response = await fetch(`${API_BASE_URL}/client/top-clients?limit=${limit}`);
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const data = await response.json();
        return data.clients;
    } catch (error) {
        console.error("Erreur lors de la récupération du top des clients :", error);
        return [];
    }
}