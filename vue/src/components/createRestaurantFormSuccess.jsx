import React from "react";
import "../assets/styles/createRestaurant.css";
import { supprimerDonneesResto, resetRestaurant } from "../services/restaurant";
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from "lucide-react"; // jolie icône moderne (déjà dispo via lucide-react)

const CreateRestaurantFormSuccess = () => {
    const navigate = useNavigate();
    const navigateToDashboard = () => {
        supprimerDonneesResto();
        resetRestaurant();
        navigate('/admin');
    }
    return (
        <div className="createRestaurantFormSuccess-container">
            <div className="createRestaurantFormSuccess-iconWrapper">
                <CheckCircle className="createRestaurantFormSuccess-icon" />
            </div>

            <h2 className="createRestaurantFormSuccess-title">
                Restaurant créé !
            </h2>

            <p className="createRestaurantFormSuccess-message">
                Félicitations 🎉 Votre restaurant a bien été enregistré.
            </p>

            <button
                className="createRestaurantFormSuccess-dashboardButton"
                onClick={navigateToDashboard}
            >
                Aller au tableau de bord
            </button>
        </div>
    );
};

export default CreateRestaurantFormSuccess;