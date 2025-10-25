import { useState } from "react";
import { creerAdmin, recupererUser, genererTokenConnexion } from "./user";

export let restaurant = JSON.parse(localStorage.getItem("restaurant")) || {
    restoName: "",
    restoLocalisationType: "",
    restoManualLocation: "",
    restoIsEstimateValid: false,
    restoIdFileLogo: null,
    restoLogo: null,
    imagechoisi: false,
    restoPolicy: "",
    restoCree: false,
};

const enregistrerRestaurantLocalStorage = () => {
    localStorage.setItem("restaurant", JSON.stringify(restaurant));
}

export const supprimerDonneesResto = () => {
    restaurant.restoName = "";
    restaurant.restoLocalisationType = "";
    restaurant.restoManualLocation = "";
    restaurant.restoIsEstimateValid = false;
    restaurant.restoIdFileLogo = null;
    restaurant.restoLogo = null;
    restaurant.restoPolicy = "";
    localStorage.removeItem("restaurant");
}

export const resetRestaurant = () => {
    restaurant.restoName = "";
    restaurant.restoLocalisationType = "";
    restaurant.restoManualLocation = "";
    restaurant.restoIsEstimateValid = false;
    restaurant.restoIdFileLogo = null;
    restaurant.restoLogo = null;
    restaurant.restoPolicy = "";
    enregistrerRestaurantLocalStorage;
    console.log(localStorage.getItem('restaurant') || "max");
};

/**
 * Hook principal de gestion du formulaire "Créer un restaurant"
 */
export const useRestaurantFormName = () => {
    const [restaurantName, setRestaurantName] = useState(restaurant.restoName);
    const [localisationType, setLocalisationType] = useState(restaurant.restoLocalisationType);
    const [manualLocation, setManualLocation] = useState(restaurant.restoManualLocation);
    const [isEstimatedValid, setIsEstimatedValid] = useState(restaurant.restoIsEstimateValid);
    const [errors, setErrors] = useState({});

    /**
     * Changement du type de localisation (radio)
     */
    const handleLocalisationChange = (type) => {
        setLocalisationType(type);
        restaurant.restoLocalisationType = localisationType;
        if (type === "googleMap") {
            setIsEstimatedValid(false);
            setManualLocation("");
        }
        restaurant.restoIsEstimateValid = isEstimatedValid;
        restaurant.restoManualLocation = manualLocation;
        setErrors((prev) => ({ ...prev, localisationType: undefined }));
    };

    /**
     * Saisie de la localisation manuelle
     */
    const handleManualLocationChange = (value) => {
        setManualLocation(value);
        setIsEstimatedValid(value.trim().length > 0);
        restaurant.restoManualLocation = manualLocation;
        restaurant.restoIsEstimateValid = isEstimatedValid;
        setErrors((prev) => ({ ...prev, manualLocation: undefined }));
    };

    restaurant.restoName = restaurantName;
    restaurant.restoLocalisationType = localisationType;
    restaurant.restoManualLocation = manualLocation;
    restaurant.restoIsEstimateValid = isEstimatedValid;

    return {
        restaurantName,
        setRestaurantName,
        localisationType,
        handleLocalisationChange,
        manualLocation,
        handleManualLocationChange,
        isEstimatedValid,
        errors,
        setErrors,
    };
};

/**
 * Vérifie la validité du formulaire
 * et renvoie true/false + met à jour les erreurs dans l’interface
 */
export const verifierRestaurantFormName = ({
    restaurantName,
    localisationType,
    manualLocation,
    setErrors,
}) => {
    const newErrors = {};

    if (!restaurantName.trim()) {
        newErrors.restaurantName = "Le nom du restaurant est requis.";
    }

    if (!localisationType) {
        newErrors.localisationType = "Veuillez choisir un type de localisation.";
    }

    if (localisationType === "estimation" && !manualLocation.trim()) {
        newErrors.manualLocation = "Veuillez entrer la localisation estimée.";
    }

    setErrors(newErrors);
    enregistrerRestaurantLocalStorage();
    return Object.keys(newErrors).length === 0;
};

// create Restaurant Form Image
export const verifierChargementImage = (file) => {
    if (!file) return false;

    // Vérifie le type MIME : on accepte uniquement les images
    const acceptedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!acceptedTypes.includes(file.type)) {
        console.warn("Type de fichier non supporté :", file.type);
        return false;
    }

    // Vérifie la taille maximale (ex. 5 Mo)
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeInBytes) {
        console.warn("Fichier trop volumineux :", file.size);
        return false;
    }

    // Vérification passée → on peut uploader
    return true;
};

/**
 * Hook de gestion du formulaire Logo
 */
export const useRestaurantFormLogo = () => {
    const [image, setImage] = useState(restaurant.restoLogo);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    /**
     * Quand l’utilisateur dépose ou sélectionne une image
     */
    const handleImageUpload = async (file) => {
        if (!file) return;

        if(restaurant.restoIdFileLogo !== null){
            // Supprimer l’ancienne image avant d’uploader la nouvelle
            await handleRemoveImage();
        }

        const isLoaded = verifierChargementImage(file);
        if (!isLoaded) {
            setError("Erreur de connexion lors du chargement de l’image.");
            setImage(null);
            return;
        }

        setError("");
        setMessage("Chargement en cours...");

        try {
            // Préparer le fichier pour l’envoi (formulaire multipart)
            const formData = new FormData();
            formData.append("file", file);

            // Appel à ton endpoint Laravel : POST /api/files
            const response = await fetch(`${import.meta.env.VITE_API_URL}api/files`, {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Erreur lors de l’envoi du fichier.");
            }

            restaurant.restoIdFileLogo = data.id;
            restaurant.restoLogo = file;

            // ✅ Fichier envoyé et enregistré en base avec succès
            setImage(URL.createObjectURL(file)); // affichage local immédiat
            setMessage(`Image "${data.nom_fichier}.${data.extension}" enregistrée avec succès.`);
            setError("");

            console.log("Réponse API fichier :", data);

        } catch (err) {
            console.error("Erreur upload :", err);
            setError("Erreur lors de l’envoi du fichier.");
            setMessage("");
        }
    };

    /**
     * Suppression de l’image
     */
    const handleRemoveImage = async () => {
        const fileId = restaurant.restoIdFileLogo;
        console.log(fileId);
        if (!fileId) {
            setImage(null);
            setError("");
            setMessage("Une image par défaut sera utilisée.");
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}api/files/${fileId}`, {
                method: "DELETE",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Erreur lors de la suppression du fichier.");
            }

            // ✅ Suppression réussie
            setImage(null);
            setError("");
            setMessage(data.message || "Une image par défaut sera utilisée.");
            console.log("Fichier supprimé :", data);
            restaurant.restoIdFileLogo = null;
            restaurant.restoLogo = null;
        } catch (err) {
            console.error("Erreur suppression :", err);
            setError("Impossible de supprimer l'image.");
            setMessage("");
        }
    };

    restaurant.restoLogo = image;

    enregistrerRestaurantLocalStorage();

    return {
        image,
        error,
        message,
        handleImageUpload,
        handleRemoveImage,
    };
};

// create Restaurant Form Policy
export const verifierRestaurantFormPolicy = (policy) => {
    if (!policy || typeof policy !== "string" || !policy.trim() || policy.trim() == null) {
        console.error("La politique de l’entreprise est obligatoire.");
        return "La politique de l’entreprise est obligatoire.";
    }
    restaurant.restoPolicy = policy.trim();
    enregistrerRestaurantLocalStorage();
    return null;
};

export const getRestaurantStep = () => {
    console.log(restaurant);
    // Step 1 : Informations de base (nom)
    if (!restaurant.restoName || restaurant.restoName.trim() === "") {
        return 1;
    }

    // Step 1 : Localisation
    if (
        !restaurant.restoLocalisationType ||
        restaurant.restoLocalisationType.trim() === "" ||
        !restaurant.restoManualLocation ||
        restaurant.restoManualLocation.trim() === ""
    ) {
        return 1;
    }

    // Step 2 : Logo
    if (
        !restaurant.restoIdFileLogo ||
        restaurant.restoIdFileLogo === null ||
        !restaurant.restoLogo ||
        !restaurant.imagechoisi
    ) {
        return 2;
    }

    // Step 3 : Politique
    if (!restaurant.restoPolicy || restaurant.restoPolicy.trim() === "" || !restaurant.restoCree) {
        console.log(4);
        return 3;
    }
    return 4
};

export const createRestaurant = async (administrateur) => {
    console.log("create restaurant")
    const restaurantData = restaurant;
    try {
        // Préparer le corps de la requête
        const formData = new FormData();
        formData.append("nom_restaurant", restaurantData.restoName);
        formData.append("localisation", restaurantData.restoManualLocation || "yatchika");
        formData.append("type_localisation", restaurantData.restoLocalisationType);
        formData.append("logo_restaurant", restaurantData.restoIdFileLogo || 1);
        formData.append("politique", restaurantData.restoPolicy);
        formData.append("administrateur", administrateur);

        console.log("Données restaurant à envoyer :", {
            nom_restaurant: restaurantData.restoName,
            localisation: restaurantData.restoManualLocation || "yatchika",
            type_localisation: restaurantData.restoLocalisationType,
            logo_restaurant: restaurantData.restoIdFileLogo || 1,
            politique: restaurantData.restoPolicy,
            administrateur: administrateur,
        });


        // Appel à l'API Laravel
        const response = await fetch(`${import.meta.env.VITE_API_URL}api/restaurants`, {
            method: "POST",
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Erreur lors de la création du restaurant.");
        }

        console.log("Restaurant créé avec succès :", data);

        // Retourner les données du restaurant créé
        return {
            success: true,
            restaurant: data, // On retourne directement l'objet restaurant
        };
    } catch (error) {
        console.error("Erreur création restaurant :", error);
        return {
            success: false,
            message: error.message,
        };
    }
};

export const connecterAdmin = async () => {
    console.log("connecter admin")
    const id_admin = await creerAdmin();
    if (!id_admin) return false;

    const createRes = await createRestaurant(id_admin);
    if (!createRes.success) return false;

    const user = await recupererUser();
    if (!user) return false;

    console.log("Génération du token de connexion pour l’administrateur...");
    console.log(user);

    console.log(createRes);

    const restaurant = createRes.restaurant;
    const restaurantId = restaurant.id_restaurant;

    const tokenGenerated = await genererTokenConnexion({
        email: user.email,
        role: 'administrateur',
        restaurant: restaurantId.toString(),
    });

    return tokenGenerated; // true si succès, false sinon
}

export const setIdRestaurant = (id) => {
    localStorage.setItem("id_restaurant", id);
}

export const getIdRestaurant = () => {
    return localStorage.getItem("id_restaurant");
}