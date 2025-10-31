import React from "react";
import "../assets/styles/createRestaurant.css";
import { useRestaurantFormName, verifierRestaurantFormName } from "../services/restaurant";

const CreateRestaurantFormName = ({ onNext }) => {
    const {
        restaurantName,
        setRestaurantName,
        localisationType,
        handleLocalisationChange,
        manualLocation,
        handleManualLocationChange,
        isEstimatedValid,
        errors,
        setErrors,
    } = useRestaurantFormName();

    const handleNext = () => {
        const isValid = verifierRestaurantFormName({
            restaurantName,
            localisationType,
            manualLocation,
            setErrors,
        });

        if (!isValid) return; // bloque si erreurs

        console.log({
            restaurantName,
            localisationType,
            manualLocation: localisationType === "estimation" ? manualLocation : "Google Map",
        });

        onNext();
    };

    return (
        <div className="createRestaurantFormName-container">
            <h2 className="createRestaurantFormName-title">Créer un restaurant</h2>

            {/* Champ Nom */}
            <div className="createRestaurantFormName-field">
                <label className="createRestaurantFormName-label">Nom du restaurant</label>
                <input
                    type="text"
                    value={restaurantName}
                    onChange={(e) => {
                        setRestaurantName(e.target.value);
                        setErrors((prev) => ({ ...prev, restaurantName: undefined }));
                    }}
                    className="createRestaurantFormName-input"
                    placeholder="Entrez le nom du restaurant"
                />
                {errors.restaurantName && (
                    <p className="createRestaurantFormName-error-message">
                        {errors.restaurantName}
                    </p>
                )}
            </div>

            {/* Radio-boutons pour la localisation */}
            <div className="createRestaurantFormName-field">
                <label className="createRestaurantFormName-label">Localisation</label>
                <div className="createRestaurantFormName-radio-group">
                    <label
                        className={`createRestaurantFormName-radio-option ${
                            localisationType === "estimation" ? "active" : ""
                        }`}
                    >
                        <input
                            type="radio"
                            name="localisation"
                            value="estimation"
                            checked={localisationType === "estimation"}
                            onChange={() => handleLocalisationChange("estimation")}
                        />
                        <span>
                            Estimation{" "}
                            {isEstimatedValid && (
                                <i
                                    className="fa-solid fa-check"
                                    style={{ color: "green", marginLeft: "5px" }}
                                ></i>
                            )}
                        </span>
                    </label>

                    <label
                        className={`createRestaurantFormName-radio-option ${
                            localisationType === "googleMap" ? "active" : ""
                        }`}
                    >
                        <input
                            type="radio"
                            name="localisation"
                            value="googleMap"
                            checked={localisationType === "googleMap"}
                            onChange={() => handleLocalisationChange("googleMap")}
                        />
                        <span>Google Map</span>
                    </label>
                </div>
                {errors.localisationType && (
                    <p className="createRestaurantFormName-error-message">
                        {errors.localisationType}
                    </p>
                )}
            </div>

            {/* Champ manuel si "estimation" est choisi */}
            {localisationType === "estimation" && (
                <div className="createRestaurantFormName-field">
                    <label className="createRestaurantFormName-label">
                        Localisation estimée
                    </label>
                    <input
                        type="text"
                        value={manualLocation}
                        onChange={(e) => handleManualLocationChange(e.target.value)}
                        className="createRestaurantFormName-input"
                        placeholder="Entrez la localisation du restaurant"
                    />
                    {errors.manualLocation && (
                        <p className="createRestaurantFormName-error-message">
                            {errors.manualLocation}
                        </p>
                    )}
                </div>
            )}

            {/* Bouton Next */}
            <button className="createRestaurantFormName-nextButton" onClick={handleNext}>
                Next
            </button>
        </div>
    );
};

export default CreateRestaurantFormName;
