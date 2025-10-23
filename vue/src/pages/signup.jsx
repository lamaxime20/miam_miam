import React, { use, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SignupFormName from '../components/signupFormName';
import SignupFormVerification from '../components/signupFormVerification';
import SignupFormPassword from '../components/signupFormPassword';
import ChoixClientResto from '../components/choixClientResto';
import '../assets/styles/signup.css'

function Signup() {
    const [step, setStep] = useState(1);
    const navigate = useNavigate();

    const goNext = () => setStep(step + 1);
    const goPrevious = () => setStep(step - 1);
    const goToStep = (stepNumber) => setStep(stepNumber);

    const handleLoginClick = () => {
        navigate('/login');
    }
    return (
        <>
            {step !== 4 && (
                <button className='signup-login-btn' onClick={handleLoginClick}>Se connecter</button>
            )}
            <div className="signup-container">
                {step === 1 && <SignupFormName onNext={goNext} />}
                {step === 2 && (
                    <SignupFormVerification
                    onPrevious={goPrevious}
                    onNext={goNext}
                    />
                )}
                {step === 3 && (<SignupFormPassword onPrevious={() => goToStep(1)} onNext={goNext} />)}
                {step === 4 && (<ChoixClientResto/>)}
            </div>
        </>
    )
}
export default Signup;