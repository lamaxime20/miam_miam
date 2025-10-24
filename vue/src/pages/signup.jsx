import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SignupFormName from '../components/signupFormName';
import SignupFormVerification from '../components/signupFormVerification';
import SignupFormPassword from '../components/SignupFormPassword';
import ChoixClientResto from '../components/choixClientResto';
import { loadUserFromStorage } from '../services/user';
import '../assets/styles/signup.css';

function Signup() {
    loadUserFromStorage(); // 🔹 charge les données avant le render
    // 🔹 récupère la valeur stockée, sinon 1 par défaut
    const storedStep = parseInt(localStorage.getItem('signupStep'), 10) || 1;
    const [step, setStep] = useState(storedStep);

    const navigate = useNavigate();

    const goNext = (stepNumber) => {
        const nextStep = stepNumber || (step + 1);
        setStep(nextStep);
        localStorage.setItem('signupStep', nextStep); // 🔹 on persiste
    };

    const goPrevious = () => {
        const prevStep = step - 1;
        setStep(prevStep);
        localStorage.setItem('signupStep', prevStep); // 🔹 on persiste
    };

    const goToStep = (stepNumber) => {
        setStep(stepNumber);
        localStorage.setItem('signupStep', stepNumber); // 🔹 on persiste
    };

    const handleLoginClick = () => navigate('/login');

    return (
        <>
            {step !== 4 && (
                <button className='signup-login-btn' onClick={handleLoginClick}>Se connecter</button>
            )}
            <div className="signup-container">
                {step === 1 && <SignupFormName onNext={goNext} />}
                {step === 2 && <SignupFormVerification onPrevious={goPrevious} onNext={goNext} />}
                {step === 3 && <SignupFormPassword onPrevious={() => goToStep(1)} onNext={goNext} />}
                {step === 4 && <ChoixClientResto />}
            </div>
        </>
    );
}

export default Signup;