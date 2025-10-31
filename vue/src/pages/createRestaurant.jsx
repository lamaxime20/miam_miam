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
        setStep(step + 1);
    }

    const goPrevious = () => {
        setStep(step - 1);
    }

    return (
        <>
            {step != 4 && (<a>Continuer comme client</a>)}
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