import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import ProgressionRestaurant from "../components/progressionRestaurant";
import CreateRestaurantFormName from "../components/createRestaurantFormName";
import CreateRestaurantFormLogo from "../components/createRestaurantFormLogo";
import CreateRestaurantFormPolicy from "../components/createRestaurantFormPolicy";
import CreateRestaurantFormSuccess from "../components/CreateRestaurantFormSuccess";
import { getRestaurantStep } from "../services/restaurant";


function CreateRestaurant() {
    const [step, setStep] = useState(getRestaurantStep);

    const navigate = useNavigate();

    const goNext = () => {
        setStep((prev) => {
            const target = Math.min(4, prev + 1);
            const allowed = getRestaurantStep();
            const finalStep = Math.min(4, Math.max(target, allowed));
            setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0);
            return finalStep;
        });
    }

    const goPrevious = () => {
        setStep((prev) => {
            const next = Math.max(1, prev - 1);
            setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0);
            return next;
        });
    }

    return (
        <>
            {step != 4 && (<a href="/client">Continuer comme client</a>)}
            <ProgressionRestaurant NbreSteps={4} StepActu={step} />
            <div className="createRestaurant-container">
                {step == 1 && (<CreateRestaurantFormName onNext={goNext}/>)}
                {step == 2 && (<CreateRestaurantFormLogo onNext={goNext} handlePrevious={goPrevious} />)}
                {step == 3 && (<CreateRestaurantFormPolicy onNext={goNext} onPrevious={goPrevious} />)}
                {step == 4 && (<CreateRestaurantFormSuccess />)}
            </div>
        </>
    )
}

export default CreateRestaurant;