const API_URL = import.meta.env.VITE_API_URL;

const mockMenuItemsEUR = [
  {
    id: '1',
    name: 'Burger Premium',
    description: 'Pain artisanal, steak 180g, cheddar affiné, sauce maison',
    price: 15.90,
    category: 'Plats',
    status: 'available',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
  },
  {
    id: '2',
    name: 'Pizza Margherita',
    description: 'Sauce tomate, mozzarella di bufala, basilic frais',
    price: 12.90,
    category: 'Plats',
    status: 'available',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop',
  },
  {
    id: '3',
    name: 'Salade César',
    description: 'Poulet grillé, parmesan, croûtons, sauce césar',
    price: 9.50,
    category: 'Entrées',
    status: 'available',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
  },
  {
    id: '4',
    name: 'Tiramisu Maison',
    description: 'Mascarpone, café, cacao, biscuits imbibés',
    price: 6.50,
    category: 'Desserts',
    status: 'available',
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop',
  },
  {
    id: '5',
    name: 'Cappuccino',
    description: 'Espresso, lait vapeur, mousse de lait',
    price: 4.50,
    category: 'Boissons',
    status: 'available',
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop',
  },
  {
    id: '6',
    name: 'Tartare de Saumon',
    description: 'Saumon frais, avocat, citron vert, sésame',
    price: 16.50,
    category: 'Entrées',
    status: 'unavailable',
    image: 'https://images.unsplash.com/photo-1580959375944-1ab5b8c78f75?w=400&h=300&fit=crop',
  },
  {
    id: '7',
    name: 'Pâtes Carbonara',
    description: 'Crème, lardons, parmesan, jaune d\'œuf',
    price: 13.90,
    category: 'Plats',
    status: 'available',
    image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&h=300&fit=crop',
  },
  {
    id: '8',
    name: 'Fondant au Chocolat',
    description: 'Chocolat noir 70%, cœur coulant, glace vanille',
    price: 7.50,
    category: 'Desserts',
    status: 'available',
    image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&h=300&fit=crop',
  },
];

/**
 * Récupère la liste complète des plats du menu pour la gestion.
 * @returns {Promise<Array>} - La liste des plats du menu.
 */
export async function getAllMenuItems() {
    const restaurantId = 1;
  try {
    const response = await fetch(API_URL + `api/menu/${restaurantId}/items`);
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();

    const backendToUiCategory = {
      entree: 'Entrées',
      plat: 'Plats',
      dessert: 'Desserts',
      boisson: 'Boissons',
    };

    console.log(data);

    return data.map((item) => {
      const id = (item.id ?? item.id_menu ?? item.menu_id);
      const name = item.name ?? item.nom_menu ?? item.titre ?? '';
      const description = item.description ?? item.description_menu ?? '';
      const rawPrice = item.price ?? item.prix ?? item.prix_menu;
      const price = typeof rawPrice === 'number' ? rawPrice : parseFloat(rawPrice ?? '0');
      const rawCategory = item.category ?? item.libelle_menu ?? item.categorie;
      const categoryLower = typeof rawCategory === 'string' ? rawCategory.toLowerCase() : rawCategory;
      const category = backendToUiCategory[categoryLower] || rawCategory || '';
      const rawStatus = item.status ?? item.statut_menu ?? '';
      const status = rawStatus === 'disponible' ? 'available' : rawStatus === 'indisponible' ? 'unavailable' : (rawStatus || 'available');
      const rawImage = item.image ?? item.image_path ?? item.image_menu_path ?? item.image_menu;
      const image = API_URL + item.image
      const imageId = item.image_menu;

      return {
        id: id != null ? String(id) : crypto?.randomUUID?.() || Math.random().toString(36).slice(2),
        name,
        description,
        price,
        category,
        status,
        image,
        imageId,
      };
    });
    
  } catch (error) {
    console.error("Erreur lors de la récupération des plats du menu :", error);
    
    // Fallback avec données mockées (optionnel pour le développement)
    return []
  }
}

/**
 * Taux de conversion EUR -> XAF
 * 1 EUR = 655.957 XAF (taux fixe Franc CFA)
 */
const TAUX_EUR_TO_XAF = 655.957;

/**
 * Formater un montant en XAF avec séparateurs de milliers
 * @param {number} montant - Montant à formater
 * @returns {string} - Montant formaté (ex: "1 865 432 XAF")
 */
export function formaterMontantXAF(montant) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(montant).replace('FCFA', 'XAF');
}

/**
 * Convertir un prix EUR en XAF et le formater
 * @param {number} prixEUR - Prix en euros
 * @returns {Object} - { eur, xaf, xafFormate, eurFormate }
 */
export function convertirPrix(prixEUR) {
  if (typeof prixEUR !== 'number' || isNaN(prixEUR)) {
    prixEUR = 0;
  }
  const prixXAF = Math.round(prixEUR * TAUX_EUR_TO_XAF);
  return {
    eur: prixEUR,
    xaf: prixXAF,
    xafFormate: formaterMontantXAF(prixXAF),
    eurFormate: `${prixEUR.toFixed(2)} €`
  };
}

// Dans c:\Users\user\Desktop\X2\Developpement web\miam_miam\vue\src\services\GestionMenu.js

// Assurez-vous que API_URL est bien défini dans votre configuration

// ... autres fonctions du fichier

/**
 * Envoie un fichier image à l'API et retourne les informations de l'image uploadée.
 * @param {File} file - Le fichier image à téléverser.
 * @returns {Promise<object>} - Le JSON retourné par l'API.
 */
export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('file', file); // La clé 'file' doit correspondre à ce que votre backend attend

  try {
    const response = await fetch(`${API_URL}api/files/upload`, {
      method: 'POST',
      body: formData,
      // Si une authentification est requise, ajoutez les en-têtes ici.
      // headers: {
      //   'Authorization': `Bearer ${votre_token}`,
      // },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Réponse non-JSON du serveur.' }));
      throw new Error(errorData.message || `Erreur HTTP ${response.status} lors du téléversement de l'image.`);
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur lors du téléversement de l'image:", error);
    throw error; // Propage l'erreur pour la gérer dans le composant
  }
}

/**
 * Crée un nouvel article de menu.
 * @param {object} menuItemData - Les données de l'article de menu.
 * @param {string} menuItemData.name - Nom du plat.
 * @param {string} menuItemData.description - Description du plat.
 * @param {string} menuItemData.id_file - ID du fichier image téléversé.
 * @param {number} menuItemData.price - Prix en EUR.
 * @param {'available' | 'unavailable'} menuItemData.status - Statut du plat.
 * @param {string} menuItemData.category - Catégorie du plat ('Entrées', 'Plats', 'Desserts', 'Boissons').
 * @returns {Promise<object>} - L'article de menu créé.
 */
export async function createMenuItem(menuItemData) {
  const restaurant_id = 1;

  // Traduire les catégories et statuts pour le backend si nécessaire
  const categoryMap = {
    'Entrées': 'entree',
    'Plats': 'plat',
    'Desserts': 'dessert',
    'Boissons': 'boisson',
  };

  if(menuItemData.id_file == null){
    menuItemData.id_file = 6;
  }

  const payload = {
    nom_menu: menuItemData.name,
    description_menu: menuItemData.description,
    prix_menu: menuItemData.price,
    libelle_menu: categoryMap[menuItemData.category] || menuItemData.category.toLowerCase(),
    statut_menu: menuItemData.status === 'available' ? 'disponible' : 'indisponible',
    image_menu: menuItemData.id_file,
    restaurant_hote: restaurant_id,
  };

  try {
    const response = await fetch(`${API_URL}api/menu`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();

    if (!response.ok) {
      // Utiliser le message d'erreur du backend s'il existe
      const errorMessage = responseData.error || responseData.message || `Erreur HTTP: ${response.status}`;
      throw new Error(errorMessage);
    }

    return responseData;

  } catch (error) {
    console.error('Erreur lors de la création du menu:', error);
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Erreur de connexion au serveur. Vérifiez votre connexion internet et que le serveur est bien démarré.');
    }
    throw error; // Relancer l'erreur pour la gestion dans le composant
  }
}

/**
 * Met à jour une image existante.
 * @param {number} oldImageId - L'ID de l'image à remplacer.
 * @param {File} file - Le nouveau fichier image.
 * @returns {Promise<object>} - Les informations de la nouvelle image.
 */
export async function updateImage(oldImageId, file) {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_URL}api/files/${oldImageId}`, {
      method: 'PUT', // La méthode est POST même pour une mise à jour de fichier
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Réponse non-JSON du serveur.' }));
      throw new Error(errorData.message || `Erreur HTTP ${response.status} lors de la mise à jour de l'image.`);
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'image:", error);
    throw error;
  }
}

/**
 * Met à jour un article de menu existant.
 * @param {string} menuItemId - L'ID de l'article à mettre à jour.
 * @param {object} menuItemData - Les nouvelles données de l'article.
 * @returns {Promise<object>} - L'article de menu mis à jour.
 */
export async function updateMenuItem(menuItemId, menuItemData) {
  const restaurant_id = 1;

  // Traduire les catégories et statuts pour le backend
  const categoryMap = {
    'Entrées': 'entree',
    'Plats': 'plat',
    'Desserts': 'dessert',
    'Boissons': 'boisson',
  };

  const payload = {
    nom_menu: menuItemData.name,
    description_menu: menuItemData.description,
    prix_menu: menuItemData.price,
    libelle_menu: categoryMap[menuItemData.category] || menuItemData.category.toLowerCase(),
    statut_menu: menuItemData.status === 'available' ? 'disponible' : 'indisponible',
    image_menu: menuItemData.id_file,
    restaurant_hote: restaurant_id,
  };

  try {
    const response = await fetch(`${API_URL}api/menu/${menuItemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();

    if (!response.ok) {
      const errorMessage = responseData.error || responseData.message || `Erreur HTTP: ${response.status}`;
      throw new Error(errorMessage);
    }

    return responseData;

  } catch (error) {
    console.error('Erreur lors de la mise à jour du menu:', error);
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Erreur de connexion au serveur.');
    }
    throw error;
  }
}