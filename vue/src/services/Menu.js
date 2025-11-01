
const API_BASE_URL = "https://miam-miam-q5x4.onrender.com/api";

export async function AvoirMenusJourAcceul() {
    try {
        const response = await fetch(`${API_BASE_URL}/choisir_menu_jour`);
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const data = await response.json();

        // On prend seulement les 5 premiers éléments
        const top5Menus = data.slice(0, 5);
        console.log("Menus du jour récupérés pour l'accueil :", top5Menus);
        return top5Menus;
    } catch (error) {
        console.error("Erreur lors de la récupération des menus du jour :", error);
        return []; // Retourne un tableau vide en cas d'erreur
    }
}

/**
 * Récupère les menus du jour classés par popularité (nombre de commandes)
 */
export async function getMenusParPopularite() {
    try {
        const response = await fetch(`${API_BASE_URL}/choisir_menu_jour/popularite`);
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Erreur lors de la récupération des menus');
        }

        // Traitement des images pour chaque menu
        const menusAvecImages = await Promise.all(
            data.data.map(async (menu) => {
                let imageUrl = "/placeholder.svg";
                
                if (menu.image) {
                    try {
                        imageUrl = await getImageBase64(menu.image);
                    } catch (error) {
                        console.warn(`Erreur lors du chargement de l'image pour le menu ${menu.id}:`, error);
                    }
                }

                return {
                    ...menu,
                    image: imageUrl
                };
            })
        );

        return menusAvecImages;
    } catch (error) {
        console.error("Erreur lors de la récupération des menus par popularité :", error);
        return []; // Retourne un tableau vide en cas d'erreur
    }
}

export async function getImageBase64(id) {
    if (!id) return "/placeholder.svg";

    try {
        const response = await fetch(`${API_BASE_URL}/files/${id}`);
        if (!response.ok) throw new Error(`Fichier introuvable : ${response.status}`);

        const data = await response.json();
        console.log("data:", data);

        if(!data.url) return "/placeholder.svg";

        return data.url;
    } catch (error) {
        console.error("Erreur récupération image :", error);
        return "/placeholder.svg"; // fallback
    }
}

// Nouvelle API: récupère tous les menus de tous les restaurants avec promotions appliquées
export async function getAllMenusWithPromotions() {
    try {
        const response = await fetch(`${API_BASE_URL}/menus/daily`);
        if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);
        const data = await response.json();

        // Résolution des images: si l'API renvoie un ID, on le convertit en URL exploitable
        const menus = await Promise.all((data || []).map(async (m) => {
            let imageUrl = "/placeholder.svg";
            try {
                if (m.image) {
                    if (typeof m.image === 'string' && (m.image.startsWith('http') || m.image.startsWith('/'))) {
                        imageUrl = m.image;
                    } else {
                        imageUrl = await getImageBase64(m.image);
                    }
                }
            } catch (e) {
                console.warn('Erreur résolution image menu', m.id, e);
            }
            return {
                id: m.id,
                name: m.name,
                description: m.description,
                // prix final calculé côté backend si promo active
                price: m.price,
                // pour affichage prix barré si promo active
                priceOriginal: m.priceOriginal ?? null,
                discountPercent: m.discountPercent ?? 0,
                category: m.category,
                image: imageUrl,
                // normalisation pour la recherche/affichage
                nomResto: m.nom_restaurant || m.nomResto || '',
                rating: m.rating ?? 0,
                popular: m.popular ?? false,
            };
        }));
        return menus;
    } catch (e) {
        console.error('Erreur getAllMenusWithPromotions:', e);
        return [];
    }
}

// ============================================
// FONCTIONS POUR LE DASHBOARD
// ============================================

/**
 * Récupère les statistiques du dashboard pour un client
 */
export async function getDashboardStats(clientId) {
    try {
        const response = await fetch(`${API_BASE_URL}/client/${clientId}/dashboard-stats`);
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const data = await response.json();
        return data.stats;
    } catch (error) {
        console.error("Erreur lors de la récupération des statistiques du dashboard :", error);
        return {
            points_fidelite: 0,
            nombre_commandes: 0,
            nombre_filleuls: 0
        };
    }
}

/**
 * Récupère les commandes récentes d'un client
 */
export async function getCommandesRecentes(clientId, limit = 5) {
    try {
        const response = await fetch(`${API_BASE_URL}/client/${clientId}/commandes-recentes?limit=${limit}`);
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const data = await response.json();
        return data.commandes;
    } catch (error) {
        console.error("Erreur lors de la récupération des commandes récentes :", error);
        return [];
    }
}

/**
 * Récupère les détails de fidélité d'un client
 */
export async function getDetailsFidelite(clientId) {
    try {
        const response = await fetch(`${API_BASE_URL}/client/${clientId}/details-fidelite`);
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const data = await response.json();
        return data.details;
    } catch (error) {
        console.error("Erreur lors de la récupération des détails de fidélité :", error);
        return {
            points_actuels: 0,
            points_pour_repas_gratuit: 1500,
            pourcentage_progression: 0,
            nombre_filleuls: 0
        };
    }
}

/**
 * Récupère les promotions actives
 */
export async function getPromotionsActives() {
    try {
        const response = await fetch(`${API_BASE_URL}/promotions/actives`);
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const data = await response.json();
        return data.promotions;
    } catch (error) {
        console.error("Erreur lors de la récupération des promotions actives :", error);
        return [];
    }
}

/**
 * Récupère les notifications/événements pour un client
 */
export async function getNotificationsClient(clientId) {
    try {
        const response = await fetch(`${API_BASE_URL}/notifications/client/${clientId}`);
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const data = await response.json();
        return data.notifications;
    } catch (error) {
        console.error("Erreur lors de la récupération des notifications :", error);
        return [];
    }
}

/**
 * Marque une notification comme lue
 */
export async function marquerNotificationLue(notificationId, clientId) {
    try {
        const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/client/${clientId}/marquer-lue`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const data = await response.json();
        return data.success;
    } catch (error) {
        console.error("Erreur lors de la mise à jour de la notification :", error);
        return false;
    }
}

/**
 * Récupère le top des clients
 */
export async function getTopClients(limit = 10) {
    try {
        const response = await fetch(`${API_BASE_URL}/client/top-clients?limit=${limit}`);
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const data = await response.json();
        return data.clients;
    } catch (error) {
        console.error("Erreur lors de la récupération du top des clients :", error);
        return [];
    }
}

// ============================================
// FONCTIONS POUR LE PANIER (LOCAL STORAGE)
// ============================================

const CART_STORAGE_KEY = 'miam_miam_cart';

/**
 * Récupère le panier depuis le localStorage
 */
export function getCartFromStorage() {
    try {
        const cartData = localStorage.getItem(CART_STORAGE_KEY);
        return cartData ? JSON.parse(cartData) : {};
    } catch (error) {
        console.error("Erreur lors de la récupération du panier depuis le localStorage :", error);
        return {};
    }
}

/**
 * Sauvegarde le panier dans le localStorage
 */
export function saveCartToStorage(cart) {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
        console.error("Erreur lors de la sauvegarde du panier dans le localStorage :", error);
    }
}

/**
 * Ajoute un menu au panier
 */
export function addToCart(menuItem) {
    try {
        const cart = getCartFromStorage();
        const menuId = menuItem.id;
        
        if (cart[menuId]) {
            // Si le menu existe déjà, augmenter la quantité
            cart[menuId].quantity += 1;
        } else {
            // Si c'est un nouveau menu, l'ajouter au panier
            cart[menuId] = {
                ...menuItem,
                quantity: 1
            };
        }
        
        saveCartToStorage(cart);
        return cart;
    } catch (error) {
        console.error("Erreur lors de l'ajout au panier :", error);
        return getCartFromStorage();
    }
}

/**
 * Supprime un menu du panier
 */
export function removeFromCart(menuId) {
    try {
        const cart = getCartFromStorage();
        delete cart[menuId];
        saveCartToStorage(cart);
        return cart;
    } catch (error) {
        console.error("Erreur lors de la suppression du panier :", error);
        return getCartFromStorage();
    }
}

/**
 * Met à jour la quantité d'un menu dans le panier
 */
export function updateCartQuantity(menuId, quantity) {
    try {
        const cart = getCartFromStorage();
        
        if (quantity <= 0) {
            // Si la quantité est 0 ou négative, supprimer l'item
            delete cart[menuId];
        } else {
            // Sinon, mettre à jour la quantité
            if (cart[menuId]) {
                cart[menuId].quantity = quantity;
            }
        }
        
        saveCartToStorage(cart);
        return cart;
    } catch (error) {
        console.error("Erreur lors de la mise à jour de la quantité :", error);
        return getCartFromStorage();
    }
}

/**
 * Incrémente la quantité d'un menu dans le panier
 */
export function incrementCartQuantity(menuId) {
    try {
        const cart = getCartFromStorage();
        
        if (cart[menuId]) {
            cart[menuId].quantity += 1;
            saveCartToStorage(cart);
        }
        
        return cart;
    } catch (error) {
        console.error("Erreur lors de l'incrémentation de la quantité :", error);
        return getCartFromStorage();
    }
}

/**
 * Décrémente la quantité d'un menu dans le panier
 */
export function decrementCartQuantity(menuId) {
    try {
        const cart = getCartFromStorage();
        
        if (cart[menuId]) {
            cart[menuId].quantity -= 1;
            
            if (cart[menuId].quantity <= 0) {
                delete cart[menuId];
            }
            
            saveCartToStorage(cart);
        }
        
        return cart;
    } catch (error) {
        console.error("Erreur lors de la décrémentation de la quantité :", error);
        return getCartFromStorage();
    }
}

/**
 * Vide complètement le panier
 */
export function clearCart() {
    try {
        localStorage.removeItem(CART_STORAGE_KEY);
        return {};
    } catch (error) {
        console.error("Erreur lors du vidage du panier :", error);
        return getCartFromStorage();
    }
}

/**
 * Récupère la quantité totale d'articles dans le panier
 */
export function getTotalCartItems() {
    try {
        const cart = getCartFromStorage();
        return Object.values(cart).reduce((total, item) => total + item.quantity, 0);
    } catch (error) {
        console.error("Erreur lors du calcul du total des articles :", error);
        return 0;
    }
}

/**
 * Récupère le prix total du panier
 */
export function getTotalCartPrice() {
    try {
        const cart = getCartFromStorage();
        return Object.values(cart).reduce((total, item) => total + (item.price * item.quantity), 0);
    } catch (error) {
        console.error("Erreur lors du calcul du prix total :", error);
        return 0;
    }
}

/**
 * Récupère la quantité d'un menu spécifique dans le panier
 */
export function getMenuQuantityInCart(menuId) {
    try {
        const cart = getCartFromStorage();
        return cart[menuId] ? cart[menuId].quantity : 0;
    } catch (error) {
        console.error("Erreur lors de la récupération de la quantité :", error);
        return 0;
    }
}

// ============================================
// FONCTIONS POUR LA RECHERCHE ET FILTRAGE
// ============================================

/**
 * Filtre les menus selon la catégorie sélectionnée
 */
export function filterMenusByCategory(menus, selectedCategory) {
    if (!menus || !Array.isArray(menus)) return [];
    
    if (selectedCategory === 'Tous') {
        return menus;
    }
    
    return menus.filter(menu => menu.category === selectedCategory);
}

/**
 * Filtre les menus selon la requête de recherche
 */
export function searchMenus(menus, searchQuery) {
    if (!menus || !Array.isArray(menus)) return [];
    
    if (!searchQuery || searchQuery.trim() === '') {
        return menus;
    }
    
    const query = searchQuery.toLowerCase().trim();
    
    return menus.filter(menu => {
        // Recherche dans le nom du menu
        const nameMatch = menu.name && menu.name.toLowerCase().includes(query);
        
        // Recherche dans la description
        const descriptionMatch = menu.description && menu.description.toLowerCase().includes(query);
        
        // Recherche dans le nom du restaurant
        const restaurantMatch = menu.nomResto && menu.nomResto.toLowerCase().includes(query);
        
        // Recherche dans la catégorie (avec traduction)
        const categoryLabels = {
            'entree': 'entrée',
            'plat': 'plat',
            'dessert': 'dessert',
            'boisson': 'boisson'
        };
        const categoryMatch = menu.category && 
            (menu.category.toLowerCase().includes(query) || 
             (categoryLabels[menu.category] && categoryLabels[menu.category].includes(query)));
        
        // Recherche dans le prix (recherche numérique)
        const priceMatch = menu.price && 
            (menu.price.toString().includes(query) || 
             query.includes(menu.price.toString()));
        
        return nameMatch || descriptionMatch || restaurantMatch || categoryMatch || priceMatch;
    });
}

/**
 * Filtre les menus selon la catégorie et la requête de recherche
 */
export function filterAndSearchMenus(menus, selectedCategory, searchQuery) {
    if (!menus || !Array.isArray(menus)) return [];
    
    // D'abord filtrer par catégorie
    const filteredByCategory = filterMenusByCategory(menus, selectedCategory);
    
    // Ensuite filtrer par recherche
    const filteredBySearch = searchMenus(filteredByCategory, searchQuery);
    
    return filteredBySearch;
}

/**
 * Génère des suggestions de recherche à partir des menus et d'une requête donnée
 */
export function getSearchSuggestions(menus, query, limit = 8) {
    if (!menus || !Array.isArray(menus)) return [];
    if (!query || query.trim() === '') return [];
    const q = query.toLowerCase().trim();

    const set = new Set();

    menus.forEach((m) => {
        if (m.name && m.name.toLowerCase().includes(q)) set.add(m.name);
        if (m.nomResto && m.nomResto.toLowerCase().includes(q)) set.add(m.nomResto);
        if (m.category && m.category.toLowerCase().includes(q)) set.add(m.category);
        if (m.description && m.description.toLowerCase().includes(q)) set.add(m.description.slice(0, 50) + '...');
    });

    return Array.from(set).slice(0, limit);
}

/**
 * Trie les menus selon différents critères
 */
export function sortMenus(menus, sortBy = 'popularity') {
    if (!menus || !Array.isArray(menus)) return [];
    
    const sortedMenus = [...menus];
    
    switch (sortBy) {
        case 'popularity':
            // Trier par popularité (les populaires en premier)
            return sortedMenus.sort((a, b) => {
                if (a.popular && !b.popular) return -1;
                if (!a.popular && b.popular) return 1;
                return 0;
            });
            
        case 'price_asc':
            // Trier par prix croissant
            return sortedMenus.sort((a, b) => (a.price || 0) - (b.price || 0));
            
        case 'price_desc':
            // Trier par prix décroissant
            return sortedMenus.sort((a, b) => (b.price || 0) - (a.price || 0));
            
        case 'rating':
            // Trier par note décroissante
            return sortedMenus.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            
        case 'name':
            // Trier par nom alphabétique
            return sortedMenus.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            
        default:
            return sortedMenus;
    }
}