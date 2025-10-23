import React, { useState } from 'react';
import { validateSignupFormName } from '../services/user';
import { User } from '../services/user';

const SignupFormName = ({ onNext }) => {
    const [name, setName] = useState(User.name || '');
    const [email, setEmail] = useState(User.email || '');
    const [phone, setPhone] = useState(User.phone || '');
    const [errors, setErrors] = useState({});

    const handleNext = () => {
        const validationErrors = validateSignupFormName({ name, email, phone });

        if (Object.keys(validationErrors).length === 0) {
            onNext(); // ✅ passe à l’étape suivante si tout est bon
            console.log("good")
        } else {
            setErrors(validationErrors); // ❌ sinon affiche les erreurs
            console.log(validationErrors)
        }
    };

    return (
        <div className="signup-form-name-container">
            <form>
                <div className="signup-form-group">
                    <label htmlFor="name">Nom</label>
                    <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} />
                    {errors.name && <p className="signup-error-message">{errors.name}</p>}
                </div>

                <div className="signup-form-group">
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    {errors.email && <p className="signup-error-message">{errors.email}</p>}
                </div>

                <div className="signup-form-group">
                    <label htmlFor="phone">Téléphone</label>
                    <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    {errors.phone && <p className="signup-error-message">{errors.phone}</p>}
                </div>
                {errors.global && <p className="signup-error-message">{errors.global}</p>}
            </form>

            <div className="signup-button-container">
                <button className="signup-btn" type="button" onClick={handleNext}>Next</button>
            </div>
        </div>
    );
};

export default SignupFormName;