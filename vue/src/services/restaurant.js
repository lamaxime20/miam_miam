import { useState } from "react";

let restoName = "";
let restoLocalisationType = "";
let restoManualLocation = "";
let restoIsEstimateValid = false;

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