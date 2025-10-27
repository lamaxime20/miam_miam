export async function  AvoirRestaurantById(id) {
    try {
        const response = await fetch(`http://localhost:8000/api/restaurants/${id}`);

        if(!response.ok){
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Erreur lors de la récupération du restaurant :", error);
        return null;
    }
}