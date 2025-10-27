/**
 * Simule une latence réseau.
 * @param {number} ms - Durée de la latence en millisecondes.
 * @returns {Promise<void>}
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Récupère les données du menu pour l'employé.
 * NOTE: Actuellement, cette fonction retourne des données statiques.
 * @returns {Promise<Array<Object>>}
 */
export async function fetchMenuData() {
    await sleep(500);
    // Données mockées en attendant l'API
    return [
        { id: 1, name: 'Poulet DG', description: 'Un plat de poulet directeur général, avec des plantains frits.', category: 'Plat', price: 3500, available: true, image: null, image_id: null, updatedAt: '2025-10-20' },
        { id: 2, name: 'Ndolé avec crevettes', description: 'Le fameux Ndolé camerounais, riche et savoureux.', category: 'Plat', price: 4000, available: true, image: null, image_id: null, updatedAt: '2025-10-21' },
        { id: 3, name: 'Jus de foléré', description: 'Jus de bissap rafraîchissant.', category: 'Boisson', price: 1000, available: false, updatedAt: '2025-10-19' },
        { id: 4, name: 'Gâteau au chocolat', description: 'Un gâteau fondant pour les amateurs de chocolat.', category: 'Dessert', price: 1500, available: true, image: null, image_id: null, updatedAt: '2025-10-22' },
    ];
}

/**
 * Crée un enregistrement de fichier pour une nouvelle image via l'API.
 * @param {string} imageBase64 - L'image encodée en base64.
 * @returns {Promise<{id_file: number, chemin: string}>} Un objet contenant l'ID et le chemin du nouveau fichier.
 */
export async function createFile(imageBase64) {
    console.log("Envoi d'une nouvelle image à l'API...");
    try {
        const response = await fetch(`${API_URL}/files`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ image: imageBase64 }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Erreur API: ${response.status}`);
        }

        const data = await response.json();
        // L'API doit retourner un objet avec id et path.
        // J'adapte au format demandé : { id_file, chemin }
        const newFile = {
            id_file: data.id,
            chemin: data.path,
        };
        console.log("Nouveau fichier créé via API :", newFile);
        return newFile;
    } catch (error) {
        console.error("Erreur lors de la création du fichier:", error);
        throw error; // Propage l'erreur pour que le composant puisse la gérer
    }
}

/**
 * Supprime un fichier de la base de données via l'API.
 * @param {number} fileId - L'ID du fichier à supprimer.
 * @returns {Promise<void>}
 */
async function deleteFile(fileId) {
    if (!fileId) return;
    console.log(`Suppression du fichier avec l'ID: ${fileId}`);
    await sleep(300);
    try {
        const response = await fetch(`${API_URL}/files/${fileId}`, { method: 'DELETE' });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Erreur API: ${response.status}`);
        }
        console.log(`Fichier ${fileId} supprimé via API.`);
    } catch (error) {
        console.error(`Erreur lors de la suppression du fichier ${fileId}:`, error);
        throw error;
    }
}

/**
 * Met à jour une image de plat.
 * Supprime l'ancienne image si elle existe, puis en crée une nouvelle.
 * @param {string} newImageBase64 - La nouvelle image encodée en base64.
 * @param {number|null} oldImageId - L'ID de l'ancienne image à supprimer.
 * @returns {Promise<{id_file: number, chemin: string}>} Le nouvel objet fichier.
 */
export async function updateFile(newImageBase64, oldImageId) {
    if (oldImageId) {
        await deleteFile(oldImageId);
    }
    return await createFile(newImageBase64);
}

/**
 * Crée un nouveau menu via l'API.
 * @param {Object} menuData - Les données du menu à créer.
 * @param {string} menuData.name - Le nom du menu.
 * @param {string} menuData.description - La description du menu.
 * @param {number} menuData.price - Le prix du menu.
 * @param {string} menuData.category - La catégorie du menu ('Entree', 'Plat', 'Dessert', 'Boisson').
 * @param {boolean} menuData.available - La disponibilité du menu.
 * @param {number|null} menuData.image_id - L'ID de l'image associée.
 * @returns {Promise<Object>} Le nouvel objet menu créé.
 */
export async function createMenu(menuData) {
    console.log("Création d'un nouveau menu via l'API avec les données:", menuData);
    // NOTE: L'URL et le corps de la requête sont des exemples et doivent être adaptés à votre API.
    // Par exemple, restaurant_hote est codé en dur, il faudra le rendre dynamique.
    try {
        const response = await fetch(`${API_URL}/menus`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                nom_menu: menuData.name,
                description_menu: menuData.description,
                prix_menu: menuData.price,
                libelle_menu: menuData.category.toLowerCase(), // 'plat', 'entree', etc.
                statut_menu: menuData.available ? 'disponible' : 'indisponible',
                image_menu: menuData.image_id,
                restaurant_hote: 1, // IMPORTANT: À remplacer par l'ID du restaurant de l'employé connecté
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Erreur API: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Erreur lors de la création du menu:", error);
        throw error;
    }
}