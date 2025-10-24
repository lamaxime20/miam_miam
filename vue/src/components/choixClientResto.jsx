import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, genererTokenInscription } from '../services/user';
import LoaderOverlay from './loaderOverlay'; // 🔹 import du composant
import '../assets/styles/signup.css';

const ChoixClientResto = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false); // 🔹 état du loader

    const handleContinueClient = async () => {
        setIsLoading(true); // 🔹 affiche le loader

        const tokenCree = await genererTokenInscription({ email: User.email, role: 'client', restaurant: '1' });

        if(tokenCree){
            [
                'User',
                'signupStep',
                'verificationCode',
                'codeExpiration',
                'verificationTimer',
                'isEmailVerified'
            ].forEach(k => localStorage.removeItem(k));

            console.log('max');
            navigate('/etudiants');
        }

        setIsLoading(false); // 🔹 cache le loader
    };

    const handleCreateRestaurant = () => {
        navigate('/create-restaurant'); // redirige vers la page création restaurant
    };

    return (
        <div className="continue-create-container">
            {/* 🔹 Overlay Loader */}
            <LoaderOverlay isLoading={isLoading} />

            <form className="continue-create-form">
                <div className="button-group">
                    <button 
                        className="continue-client-btn" 
                        type="button" 
                        onClick={handleContinueClient}
                        disabled={isLoading} // 🔹 empêche clics multiples
                    >
                        Continuer comme client
                    </button>
                </div>

                <div className="link-group">
                    <span 
                        className="create-restaurant-link" 
                        onClick={handleCreateRestaurant}
                    >
                        Créer un restaurant
                    </span>
                </div>
            </form>
        </div>
    );
};

export default ChoixClientResto;