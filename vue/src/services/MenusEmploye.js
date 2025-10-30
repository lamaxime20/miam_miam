function absolutizeUrl(rel) {
    if (!rel) return null;
    const base = API_URL.replace(/\/?api$/, '');
    return `${base}/${rel}`.replace(/\/+/g, '/');
}

async function safeJson(res) {
    try { return await res.json(); } catch { return null; }
}/**
 * Simule une latence réseau.
 * @param {number} ms - Durée de la latence en millisecondes.
 * @returns {Promise<void>}
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/';

/**
 * Récupère les données du menu pour l'employé.
 * NOTE: Actuellement, cette fonction retourne des données statiques.
 * @returns {Promise<Array<Object>>}
 */
export async function fetchMenuData(restaurantId = 1) {
    const res = await fetch(`${API_URL}api/menus?restaurant_id=${restaurantId}`);
    if (!res.ok) throw new Error(`Erreur API: ${res.status}`);
    return await res.json();
}

/**
 * Crée un enregistrement de fichier pour une nouvelle image via l'API.
 * @param {string} imageBase64 - L'image encodée en base64.
 * @returns {Promise<{id_file: number, chemin: string}>} Un objet contenant l'ID et le chemin du nouveau fichier.
 */
export async function createFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_URL}api/files/upload`, {
        method: 'POST',
        body: formData,
    });
    if (!res.ok) {
        const err = await safeJson(res);
        throw new Error(err?.message || `Erreur API: ${res.status}`);
    }
    const data = await res.json();
    const d = data.data || {};
    return {
        id_file: d.id_file ?? d.id ?? d.id_File ?? null,
        chemin: d.chemin ?? data.relative_path ?? null,
        url: data.url ? absolutizeUrl(data.url) : null,
    };
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
        const response = await fetch(`${API_URL}api/files/${fileId}`, { method: 'DELETE' });
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
export async function updateFile(file, oldImageId) {
    try {
        // Si pas d'ancienne image, on en crée une nouvelle
        if (!oldImageId) {
            return await createFile(file);
        }

        // Option 1: Supprimer l'ancienne et créer une nouvelle
        await deleteFile(oldImageId);
        return await createFile(file);

    } catch (error) {
        console.error('Erreur dans updateFile:', error);
        throw error;
    }
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
export async function createMenu(menuData, restaurantId = 1) {
    const response = await fetch(`${API_URL}api/menus`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            nom_menu: menuData.name,
            description_menu: menuData.description,
            prix_menu: menuData.price,
            libelle_menu: menuData.category.toLowerCase(),
            statut_menu: menuData.available ? 'disponible' : 'indisponible',
            image_menu: menuData.image_id,
            restaurant_hote: restaurantId,
        }),
    });
    if (!response.ok) {
        const errorData = await safeJson(response);
        throw new Error(errorData?.message || `Erreur API: ${response.status}`);
    }
    return await response.json();
}

export async function updateMenu(menuId, menuData, restaurantId = 1) {
    const response = await fetch(`${API_URL}api/menus/${menuId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            nom_menu: menuData.name,
            description_menu: menuData.description,
            prix_menu: menuData.price,
            libelle_menu: menuData.category.toLowerCase(),
            statut_menu: menuData.available ? 'disponible' : 'indisponible',
            image_menu: menuData.image_id,
            restaurant_hote: restaurantId,
        }),
    });
    if (!response.ok) {
        const errorData = await safeJson(response);
        throw new Error(errorData?.message || `Erreur API: ${response.status}`);
    }
    return await response.json();
}