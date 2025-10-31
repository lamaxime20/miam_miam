import React, { useState } from "react";
import { verifierRestaurantFormPolicy, restaurant, connecterAdmin, supprimerDonneesResto } from "../services/restaurant";
import "../assets/styles/createRestaurant.css";
import LoaderOverlay from "./loaderOverlay"; // Import du loader

const CreateRestaurantFormPolicy = ({ onNext, onPrevious }) => {
    const [policy, setPolicy] = useState(restaurant.restoPolicy);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false); // État pour le loader

    const handleNext = () => {
        console.log("Politique :", policy);
        onNext();
    }

    const handlePrevious = () => {
        onPrevious();
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationError = verifierRestaurantFormPolicy(policy);
        setError(validationError);

        setIsLoading(true);
        if (!validationError) {
            const adminConnected = await connecterAdmin();
            console.log("Admin connecté :", adminConnected);
            if (adminConnected) {
                restaurant.restoCree = true;
                handleNext();
            } else {
                setError("Impossible de finaliser la création du restaurant. Veuillez réessayer.");
                console.error("Impossible de connecter l'admin");
            }
        }
        setIsLoading(false);
    };

    return (
        <div className="createRestaurantFormPolicy-container">
            {/* Loader Overlay */}
            <LoaderOverlay isLoading={isLoading} />

            <h2 className="createRestaurantFormPolicy-title">
                Politique de l’entreprise
            </h2>

            <form
                className="createRestaurantFormPolicy-form"
                onSubmit={handleSubmit}
            >
                <label
                    htmlFor="policy"
                    className="createRestaurantFormPolicy-label"
                >
                    Décrivez la politique de votre entreprise :
                </label>

                <textarea
                    id="policy"
                    className="createRestaurantFormPolicy-textarea"
                    placeholder="Ex : Nous privilégions des produits locaux, une cuisine saine et un service orienté client..."
                    value={policy}
                    onChange={(e) => setPolicy(e.target.value)}
                    rows={6}
                />

                {error && (
                    <p className="createRestaurantFormPolicy-error-message">
                        {error}
                    </p>
                )}

                <div className="createRestaurantFormPolicy-nav">
                    <button
                        type="button"
                        className="createRestaurantFormPolicy-navButton previous"
                        onClick={handlePrevious}
                        disabled={isLoading}
                    >
                        Previous
                    </button>
                    <button
                        type="submit"
                        className="createRestaurantFormPolicy-navButton next"
                        disabled={isLoading}
                    >
                        Next
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateRestaurantFormPolicy;