import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/signup.css';

const ChoixClientResto = () => {
    const navigate = useNavigate();

    const handleContinueClient = () => {
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
    };

    const handleCreateRestaurant = () => {
        navigate('/create-restaurant'); // redirige vers la page création restaurant
    };

    return (
        <div className="continue-create-container">
            <form className="continue-create-form">
                <div className="button-group">
                    <button 
                        className="continue-client-btn" 
                        type="button" 
                        onClick={handleContinueClient}
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