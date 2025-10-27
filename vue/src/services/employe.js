import { recupererToken } from "./user";

const API_URL = import.meta.env.VITE_API_URL + 'api/';

/**
 * Récupère les indicateurs clés de performance (KPIs) pour le tableau de bord de l'employeur.
 * @returns {Promise<Object>} Une promesse qui résout avec un objet contenant les KPIs.
 */
export async function getEmployerDashboardKpis() {
    try {
        const token = recupererToken();
        const response = await fetch(`${API_URL}employe/dashboard/kpis`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`Erreur serveur : ${response.status}`);
        }

        return await response.json();

    } catch (error) {
        console.error("Erreur lors de la récupération des KPIs du tableau de bord employeur :", error);
        // Retourner un objet avec des valeurs par défaut en cas d'erreur
        return {
            daily_orders_count: 0,
            daily_revenue: 0,
            open_complaints_count: 0,
            active_employees_count: 0,
        };
    }
}