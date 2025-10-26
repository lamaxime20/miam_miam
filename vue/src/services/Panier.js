import { useState, useEffect } from "react";
import { getCartFromStorage } from "./Menu";
import { AvoirRestaurantById } from "./restaurant";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/";

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

/**
 * Envoie une nouvelle commande à l'API.
 * @param {Object} commandeDetails - Les détails de la commande.
 * @param {string} commandeDetails.date_heure_livraison - Date et heure de livraison (ex: "2025-10-26 13:30:00").
 * @param {string} commandeDetails.localisation_client - Adresse de livraison.
 * @param {string} commandeDetails.type_localisation - Type de localisation ('googleMap' ou 'estimation').
 * @param {number} commandeDetails.acheteur - ID de l'utilisateur qui passe la commande.
 * @param {Array<Object>} commandeDetails.menus - Liste des menus commandés.
 * @returns {Promise<Object>} Une promesse qui résout avec les données de la commande créée.
 */
export async function passerCommande(commandeDetails) {
    const { date_heure_livraison, localisation_client, type_localisation, acheteur, menus } = commandeDetails;

    // Le statut est géré côté backend, mais on peut l'initialiser ici si besoin.
    // D'après la fonction creer_commande, 'en_cours' est une valeur valide.
    const statut_commande = 'en_cours';

    const body = {
        date_heure_livraison,
        localisation_client,
        type_localisation,
        statut_commande,
        acheteur,
        menus: menus.map(menu => ({
            id_menu: menu.id_menu,
            quantite: menu.quantity,
            prix_unitaire: menu.prix_menu
        }))
    };

    try {
        const response = await fetch(`${API_BASE_URL}api/commandes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!response.ok) {
            // Lève une erreur avec les détails fournis par l'API
            throw new Error(data.message || `Erreur ${response.status}`);
        }

        return data; // Contient { message, id_commande }
    } catch (error) {
        console.error("Erreur lors de la création de la commande :", error);
        // Propage l'erreur pour que le composant puisse la gérer (ex: afficher un message à l'utilisateur)
        throw error;
    }
}
