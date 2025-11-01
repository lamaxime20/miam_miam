/**
 * Service Orders - Gestion des commandes
 * 
 * Ce fichier contient les fonctions pour récupérer les données des commandes.
 * Actuellement, il utilise des données mockées.
 * 
 * TODO: Remplacer les données mockées par des appels API vers le backend.
 */

const API_URL = "https://miam-miam-q5x4.onrender.com/";

const mockOrders = [
  {
    id: 'CMD-1284',
    customer: 'Marie Dubois',
    email: 'marie.dubois@email.com',
    date: '2025-10-24',
    total: 245.00,
    status: 'validée',
    items: 3,
    paymentMethod: 'Carte bancaire',
    numero: '677609956',
    products: [
      { name: 'Burger Premium', quantity: 2, price: 15.90 },
      { name: 'Frites Maison', quantity: 2, price: 4.50 },
      { name: 'Dessert du jour', quantity: 1, price: 6.50 },
    ],
  },
  {
    id: 'CMD-1283',
    customer: 'Pierre Martin',
    email: 'pierre.martin@email.com',
    date: '2025-10-24',
    total: 128.50,
    status: 'en_cours',
    items: 2,
    paymentMethod: 'Pas encore payé',
    numero: '677609956',
    products: [
      { name: 'Pizza Margherita', quantity: 1, price: 12.90 },
      { name: 'Salade César', quantity: 1, price: 9.50 },
    ],
  },
  {
    id: 'CMD-1282',
    customer: 'Sophie Laurent',
    email: 'sophie.laurent@email.com',
    date: '2025-10-23',
    total: 320.00,
    status: 'en_cours',
    items: 4,
    paymentMethod: 'Carte bancaire',
    numero: '677609956',
    products: [
      { name: 'Menu Famille', quantity: 1, price: 45.00 },
      { name: 'Boissons x4', quantity: 4, price: 3.00 },
    ],
  },
  {
    id: 'CMD-1281',
    customer: 'Luc Bernard',
    email: 'luc.bernard@email.com',
    date: '2025-10-23',
    total: 95.00,
    status: 'validée',
    items: 1,
    paymentMethod: 'Virement',
    numero: '677609956',
    products: [
      { name: 'Plat du jour', quantity: 1, price: 14.90 },
    ],
  },
  {
    id: 'CMD-1280',
    customer: 'Julie Petit',
    email: 'julie.petit@email.com',
    date: '2025-10-22',
    total: 410.00,
    status: 'en_cours',
    items: 5,
    paymentMethod: 'Carte bancaire',
    numero: '677609956',
    products: [
      { name: 'Menu Groupe', quantity: 1, price: 89.00 },
    ],
  },
  {
    id: 'CMD-1279',
    customer: 'Thomas Rousseau',
    email: 'thomas.rousseau@email.com',
    date: '2025-10-22',
    total: 185.00,
    status: 'en_cours',
    items: 2,
    paymentMethod: 'Carte bancaire',
    numero: '677609956',
    products: [
      { name: 'Sushi Mix', quantity: 2, price: 24.50 },
    ],
  },
  {
    id: 'CMD-1278',
    customer: 'Émilie Moreau',
    email: 'emilie.moreau@email.com',
    date: '2025-10-21',
    total: 75.00,
    status: 'annulée',
    items: 1,
    paymentMethod: 'PayPal',
    numero: '677609956',
    products: [
      { name: 'Plateau Dégustation', quantity: 1, price: 32.00 },
    ],
  },
  {
    id: 'CMD-1277',
    customer: 'Antoine Leroy',
    email: 'antoine.leroy@email.com',
    date: '2025-10-21',
    total: 560.00,
    status: 'validée',
    items: 3,
    paymentMethod: 'Carte bancaire',
    numero: '677609956',
    products: [
      { name: 'Buffet Traiteur', quantity: 1, price: 150.00 },
    ],
  },
];

/**
 * Récupère la liste des commandes.
 * @returns {Promise<Order[]>}
 */
/**
 * Récupère la liste des commandes.
 * @returns {Promise<Order[]>}
 */
export async function getOrders() {
  try {
    const response = await fetch(API_URL + 'api/orders');
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transformation des données pour correspondre au format attendu par le frontend
    return data.map(order => ({
      id: order.id,
      customer: order.customer,
      email: order.email,
      date: order.date,
      total: order.total, // Le total est déjà en EUR depuis la base de données
      status: order.status, // Statut déjà transformé par le backend
      items: order.items,
      paymentMethod: order.paymentMethod,
      numero: order.numero,
      products: order.products.map(product => ({
        name: product.name,
        quantity: product.quantity,
        price: product.price
      }))
    }));
    
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    
    // En cas d'erreur, vous pouvez soit :
    // 1. Retourner un tableau vide
    // return [];
    
    // 2. Ou retourner les données mockées en fallback (pour le développement)
    return mockOrders;
  }
}