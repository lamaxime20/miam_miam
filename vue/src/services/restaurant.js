import { useState } from "react";

let restoName = "";
let restoLocalisationType = "";
let restoManualLocation = "";
let restoIsEstimateValid = false;
let restoIdFileLogo = null;
let restoLogo = null;

/**
 * Hook principal de gestion du formulaire "Créer un restaurant"
 */
export const useRestaurantFormName = () => {
    const [restaurantName, setRestaurantName] = useState(restoName);
    const [localisationType, setLocalisationType] = useState(restoLocalisationType);
    const [manualLocation, setManualLocation] = useState(restoManualLocation);
    const [isEstimatedValid, setIsEstimatedValid] = useState(restoIsEstimateValid);
    const [errors, setErrors] = useState({});

    /**
     * Changement du type de localisation (radio)
     */
    const handleLocalisationChange = (type) => {
        setLocalisationType(type);
        restoLocalisationType = localisationType;
        if (type === "googleMap") {
            setIsEstimatedValid(false);
            setManualLocation("");
            restoIsEstimateValid = isEstimatedValid;
            restoManualLocation = manualLocation;
        }
        setErrors((prev) => ({ ...prev, localisationType: undefined }));
    };

    /**
     * Saisie de la localisation manuelle
     */
    const handleManualLocationChange = (value) => {
        setManualLocation(value);
        setIsEstimatedValid(value.trim().length > 0);
        restoManualLocation = manualLocation;
        restoIsEstimateValid = isEstimatedValid;
        setErrors((prev) => ({ ...prev, manualLocation: undefined }));
    };

    restoName = restaurantName;
    restoLocalisationType = localisationType;
    restoManualLocation = manualLocation;
    restoIsEstimateValid = isEstimatedValid;

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
    const [image, setImage] = useState(restoLogo);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    /**
     * Quand l’utilisateur dépose ou sélectionne une image
     */
    const handleImageUpload = async (file) => {
        if (!file) return;

        if(restoIdFileLogo !== null){
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

            restoIdFileLogo = data.id;
            restoLogo = file;

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
        const fileId = restoIdFileLogo;
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
            restoIdFileLogo = null;
            restoLogo = null;
        } catch (err) {
            console.error("Erreur suppression :", err);
            setError("Impossible de supprimer l'image.");
            setMessage("");
        }
    };

    restoLogo = image;

    return {
        image,
        error,
        message,
        handleImageUpload,
        handleRemoveImage,
    };
};