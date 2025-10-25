

export async function AvoirMenusJourAcceul() {
    try {
        const response = await fetch("http://localhost:8000/api/choisir_menu_jour");
        
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
        const response = await fetch(`http://localhost:8000/api/files/${id}`);
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