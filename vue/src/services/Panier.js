import { useState, useEffect } from "react";
import { getCartFromStorage } from "./Menu";
import { AvoirRestaurantById } from "./restaurant";

/**
 * Récupère les articles du panier depuis le localStorage et les regroupe par restaurant.
 * Le format de retour est adapté pour le composant ViewCommande.
 * @returns {Promise<Array<Object>>} Une promesse qui résout un tableau d'objets, chaque objet contenant les informations du restaurant et la liste des menus associés.
 */
export async function getCartItemsGroupedByRestaurant() {
    const cartData = getCartFromStorage();
    const itemsArray = Object.values(cartData);
    const grouped = {};

    for (const item of itemsArray) {
        const restaurantId = item.idresto;

        if (!restaurantId) continue;

        if (!grouped[restaurantId]) {
            try {
                const restaurantInfo = await AvoirRestaurantById(restaurantId);
                grouped[restaurantId] = {
                    restaurant: {
                        id: restaurantId,
                        nom: restaurantInfo.nom_restaurant,
                        localisation: restaurantInfo.localisation,
                    },
                    menus: [],
                };
            } catch (error) {
                console.error(`Erreur lors de la récupération des informations pour le restaurant ${restaurantId}:`, error);
                // Utiliser un restaurant par défaut en cas d'erreur
                grouped[restaurantId] = {
                    restaurant: { id: restaurantId, nom: item.nomResto || 'Restaurant inconnu', localisation: 'Localisation inconnue' },
                    menus: [],
                };
            }
        }

        // Adapter l'objet menu au format attendu par ViewCommande
        grouped[restaurantId].menus.push({
            id_menu: item.id,
            nom_menu: item.name,
            description_menu: item.description,
            prix_menu: item.price,
            image_menu: item.image.startsWith('data:image') ? item.image.split(',')[1] : null, // Extraire la partie base64
            quantity: item.quantity,
        });
    }

    return Object.values(grouped);
}

/**
 * Hook personnalisé pour charger et fournir les menus regroupés par restaurant.
 */
export function useMenusGroupedByRestaurant() {
    const [groupedMenus, setGroupedMenus] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCartItemsGroupedByRestaurant()
            .then(data => {
                setGroupedMenus(data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Erreur dans useMenusGroupedByRestaurant:", error);
                setLoading(false);
            });
    }, []);

    return { groupedMenus, loading };
}