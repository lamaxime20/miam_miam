import React, { useState, useEffect } from 'react';
import LoginFormName from '../components/loginformName';
import LoginFormChoixRole from '../components/loginFormChoixRole';
import '../assets/styles/login.css';

const Login = () => {
    const [loginStep, setLoginStep] = useState(1);

    // Passer à l'étape suivante (choix du rôle)
    const handlePasswordCorrect = () => {
        setLoginStep(2);
    };

    // Revenir à l'étape précédente (saisie des identifiants)
    const handleBack = () => {
        localStorage.removeItem('loginCredentials');
        setLoginStep(1);
    };

    // S'assurer de commencer à l'étape 1 à chaque chargement de la page
    useEffect(() => {
        handleBack();
    }, []);

    return (
        <div className="login-page-background">
            {loginStep === 1 && <LoginFormName onPasswordCorrect={handlePasswordCorrect} />}
            {loginStep === 2 && <LoginFormChoixRole onBack={handleBack} />}
        </div>
    );
};

export default Login;
