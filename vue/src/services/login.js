const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/';
import { recupererToken } from './user';

export async function avoirRoleUser(email){
    try {
        const response = await fetch(`${API_URL}api/getRestaurantsUtilisateur`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ email: email }),
        });

        console.log('reponse: ', response)

        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const data = await response.json();
        console.log('avoirRoleUser: ', data);
        return data; // Renvoie les données des restaurants
    } catch (error) {
        console.error("Erreur lors de la récupération des restaurants de l'utilisateur :", error);
        return []; // Retourne un tableau vide en cas d'erreur
    }
}

export async function logout() {
    try {
        const token = recupererToken();

        const response = await fetch(`${API_URL}api/deconnexion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        // On nettoie le localStorage côté client dans tous les cas
        localStorage.removeItem('auth_token');
        localStorage.removeItem('User');
        localStorage.removeItem('code_verification');
        localStorage.removeItem('signupStep');

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.warn('Erreur serveur pendant la déconnexion, session client nettoyée.', errorData.message || response.statusText);
        }

        return { success: true };
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
        return { success: false, message: error.message };
    }
}