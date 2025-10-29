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
    
    // Conversion des prix EUR -> XAF si nécessaire
    return data.map(item => ({
      ...item,
      price: item.price, // ou convertirEURversXAF(item.price) si nécessaire
      priceFormate: formaterMontantXAF(item.price), // Adapter selon votre devise
      image: API_URL + item.image
    }));
    
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