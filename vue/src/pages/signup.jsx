import React, { useState } from 'react';
import SignupFormName from '../components/signupFormName';
import SignupFormVerification from '../components/signupFormVerification';
import '../assets/styles/signup.css'

function Signup() {
    const [step, setStep] = useState(1);

    const goNext = () => setStep(step + 1);
    const goPrevious = () => setStep(step - 1);
    return (
        <div className="signup-container">
            {step === 1 && <SignupFormName onNext={goNext} />}
            {step === 2 && (
                <SignupFormVerification
                  onPrevious={goPrevious}
                  onNext={goNext}
                />
            )}
        </div>
    )
}
export default Signup;