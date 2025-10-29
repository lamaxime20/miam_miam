const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/';

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