import { useState, useEffect, useCallback } from "react";
import { getCartFromStorage, removeFromCart, getImageBase64 } from "./Menu";
import { recupererToken, getAuthInfo, getUserByEmail } from "./user";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/";

function computeDiscounted(price, percent) {
    if (!percent || percent <= 0) return price;
    const discounted = price * (1 - percent / 100);
    return Math.round(discounted * 100) / 100;
}

async function fetchPromotionMapByMenuId() {
    try {
        const res = await fetch(`${API_BASE_URL}api/promotions/actives`);
        if (!res.ok) return {};
        const promos = await res.json();
        const map = {};
        if (!Array.isArray(promos)) return map;
        // For each promo, fetch menus concerned
        await Promise.all(promos.map(async (p) => {
            const pid = p.id_promo || p.id || p.idPromo;
            const percent = parseFloat(p.pourcentage_reduction || p.pourcentage || p.percent || 0);
            if (!pid || !percent) return;
            try {
                const r = await fetch(`${API_BASE_URL}api/promotions/${pid}/menus`);
                if (r.ok) {
                    const menus = await r.json();
                    const list = Array.isArray(menus) ? menus : (menus?.data || []);
                    list.forEach((m) => {
                        const mid = m.id_menu || m.id || m.menu_id;
                        if (!mid) return;
                        // If multiple promos, keep the best (max percent)
                        map[mid] = Math.max(map[mid] || 0, percent);
                    });
                }
            } catch (e) {}
        }));
        return map;
    } catch (e) {
        return {};
    }
}

export async function getCartItemsGroupedByRestaurant() {
    const cartData = getCartFromStorage();
    const itemsArray = Object.values(cartData);
    const grouped = {};

    // Fetch active promotions mapping menuId -> percent
    const promoMap = await fetchPromotionMapByMenuId();

    for (const item of itemsArray) {
        let restaurantId = item.idresto || item.restaurant_hote || null;
        let restaurantName = item.nomResto || null;

        // Normaliser l'image: si on a un ID (ou une valeur non-URL), on le convertit en URL
        let imageUrl = item.image;
        try {
            const isString = typeof imageUrl === 'string';
            const looksLikeUrl = isString && (imageUrl?.startsWith('http') || imageUrl?.startsWith('/'));
            if (!looksLikeUrl && imageUrl) {
                imageUrl = await getImageBase64(imageUrl);
            }
        } catch (_) {
            imageUrl = "/placeholder.svg";
        }

        if (!restaurantId || !restaurantName) {
            try {
                const resp = await fetch(`${API_BASE_URL}api/menu/${item.id}/restaurant`);
                const result = await resp.json();
                if (result && result.success && result.data) {
                    restaurantId = result.data.id_restaurant;
                    restaurantName = result.data.nom_restaurant;
                }
            } catch (e) {}
        }
        if (!restaurantId) continue;

        if (!grouped[restaurantId]) {
            grouped[restaurantId] = {
                restaurant: {
                    id: restaurantId,
                    nom: restaurantName || "Restaurant",
                },
                items: [],
                totals: { real: 0, promo: 0 },
            };
        }

        const unit = item.price ?? item.prix_menu ?? 0;
        const percent = promoMap[item.id] || promoMap[item.id_menu] || 0;
        const unitPromo = computeDiscounted(unit, percent);
        const quantity = item.quantity || 1;

        const withResto = {
            ...item,
            image: imageUrl,
            nomResto: restaurantName || item.nomResto,
            priceOriginal: unit,
            promoPercent: percent,
            pricePromo: unitPromo,
        };
        grouped[restaurantId].items.push(withResto);
        grouped[restaurantId].totals.real += unit * quantity;
        grouped[restaurantId].totals.promo += unitPromo * quantity;
    }

    // Round totals to 2 decimals
    return Object.values(grouped).map(g => ({
        ...g,
        totals: {
            real: Math.round(g.totals.real * 100) / 100,
            promo: Math.round(g.totals.promo * 100) / 100,
        }
    }));
}

export function useMenusGroupedByRestaurant() {
    const [groupedMenus, setGroupedMenus] = useState([]);
    const [loading, setLoading] = useState(true);

    const reload = useCallback(() => {
        setLoading(true);
        return getCartItemsGroupedByRestaurant()
            .then(data => {
                setGroupedMenus(data);
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        reload();
    }, [reload]);

    return { groupedMenus, loading, reload };
}

export function useCommande(onCommandeSuccess) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [menusToOrder, setMenusToOrder] = useState([]);
    const [heureLivraison, setHeureLivraison] = useState('12:30');
    const [typeLocalisation, setTypeLocalisation] = useState('estimation');
    const [localisationEstimee, setLocalisationEstimee] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const openModal = useCallback((menus) => {
        setMenusToOrder(menus);
        setIsModalOpen(true);
        setError(null);
        setLocalisationEstimee('');
    }, []);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    const handleSubmit = useCallback(async () => {
        setError(null);
        if (typeLocalisation === 'estimation' && !localisationEstimee.trim()) {
            setError("Veuillez indiquer votre localisation estimée.");
            return;
        }
        setIsSubmitting(true);
        try {
            const token = recupererToken();
            if (!token) throw new Error("Vous devez être connecté pour passer une commande.");

            const authInfo = getAuthInfo();
            if (!authInfo) throw new Error("Impossible de récupérer votre identification. Veuillez vous reconnecter.");

            const date = new Date();
            const [heure, minute] = heureLivraison.split(':');
            date.setHours(heure, minute, 0, 0);
            const date_heure_livraison = date.toISOString().slice(0, 19).replace('T', ' ');

            const localisation_client = typeLocalisation === 'googleMap' ? 'yatchika' : localisationEstimee;

            const commandeDetails = {
                date_heure_livraison,
                localisation_client,
                type_localisation: typeLocalisation,
                acheteur: authInfo,
                menus: menusToOrder,
            };

            const resultat = await passerCommande(commandeDetails);
            menusToOrder.forEach(menu => removeFromCart(menu.id_menu));
            closeModal();
            if (onCommandeSuccess) onCommandeSuccess(resultat);
        } catch (err) {
            setError(err.message || "Une erreur inattendue est survenue.");
        } finally {
            setIsSubmitting(false);
        }
    }, [heureLivraison, typeLocalisation, localisationEstimee, menusToOrder, onCommandeSuccess, closeModal]);

    return { isModalOpen, openModal, closeModal, handleSubmit, heureLivraison, setHeureLivraison, typeLocalisation, setTypeLocalisation, localisationEstimee, setLocalisationEstimee, isSubmitting, error };
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
    // acheteur provient de getAuthInfo() (token info). On récupère l'utilisateur complet côté serveur
    // via son email (display_name contient l'email dans notre token storage).
    console.log('Recherche utilisateur par email :', acheteur && acheteur.display_name);
    const userData = await getUserByEmail(acheteur && acheteur.display_name);
    if (!userData) {
        throw new Error('Impossible de récupérer les informations utilisateur.');
    }

    // L'API renvoie normalement id_user (voir backend). On accepte plusieurs variantes par sécurité.
    const acheteurId = userData.id_user || userData.id || userData.idUser || null;
    console.log('ID acheteur récupéré :', acheteurId);
    if (!acheteurId) {
        throw new Error('Identifiant acheteur introuvable dans la réponse du serveur.');
    }


    const body = {
        date_heure_livraison,
        localisation_client,
        type_localisation,
        statut_commande,
        acheteur: acheteurId,
        menus: menus.map(menu => ({
            id_menu: menu.id_menu,
            quantite: menu.quantity,
            prix_unitaire: menu.pricePromo || menu.prix_menu
        }))
    };

    try {
        const response = await fetch(API_BASE_URL + "api/commandes", {
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
