import React, { useState } from "react";
import { verifierRestaurantFormPolicy, restoPolicy } from "../services/restaurant";
import "../assets/styles/createRestaurant.css";

const CreateRestaurantFormPolicy = ({ onNext, onPrevious }) => {
    const [policy, setPolicy] = useState(restoPolicy);
    const [error, setError] = useState(null);

    const handleNext = () => {
        console.log("Politique :", policy);
        onNext();
    }

    const handlePrevious = () => {
        onPrevious();
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationError = verifierRestaurantFormPolicy(policy);
        setError(validationError);

        if (!validationError) {
            handleNext();
        }
    };

    return (
        <div className="createRestaurantFormPolicy-container">
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
                    >
                        Previous
                    </button>
                    <button
                        type="submit"
                        className="createRestaurantFormPolicy-navButton next"
                    >
                        Next
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateRestaurantFormPolicy;