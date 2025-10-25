import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import ProgressionRestaurant from "../components/progressionRestaurant";
import CreateRestaurantFormName from "../components/createRestaurantFormName";
import CreateRestaurantFormLogo from "../components/createRestaurantFormLogo";


function CreateRestaurant() {
    const storedStep = parseInt(localStorage.getItem('restaurantStep'), 10) || 1;
    const [step, setStep] = useState(storedStep);

    const navigate = useNavigate();

    const goNext = () => {
        setStep(step + 1);
    }

    const goPrevious = () => {
        setStep(step - 1);
    }
    return (
        <>
            <a>Continuer comme client</a>
            <ProgressionRestaurant NbreSteps={4} StepActu={2} />
            <div className="createRestaurant-container">
                {step == 1 && (<CreateRestaurantFormName onNext={goNext}/>)}
                {step == 2 && (<CreateRestaurantFormLogo handleNext={goNext} handlePrevious={goPrevious} />)}
            </div>
        </>
    )
}

export default CreateRestaurant;