export async function getRestaurantById(id) {
  try {
    const response = await fetch(`/exempleJSON/restaurant.json`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) {
      throw new Error(`Erreur serveur : ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors du fetch du restaurant :', error);
    return null;
  }
}
