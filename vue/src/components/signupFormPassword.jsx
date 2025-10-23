import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateSignupFormPassword } from '../services/user.js';
import { User, creerUser } from '../services/user.js';

const SignupFormPassword = ({ onNext, onPrevious }) => {
    const [password, setPassword] = useState(User.password || '');
    const [confirmPassword, setConfirmPassword] = useState(User.confirmPassword || '');
    const [passwordShown, setPasswordShown] = useState(false);
    const [confirmPasswordShown, setConfirmPasswordShown] = useState(false);
    const [errors, setErrors] = useState({});

    const togglePasswordVisibility = () => {
        setPasswordShown(!passwordShown);
    };

    const toggleConfirmPasswordVisibility = () => {
        setConfirmPasswordShown(!confirmPasswordShown);
    };

    const handleNext = () => {
        const validationErrors = validateSignupFormPassword({ password, confirmPassword });

        if (Object.keys(validationErrors).length === 0) {
            User.password = password;
            User.confirmPassword = confirmPassword;
            creerUser(onNext); // ✅ passe à l’étape suivante si tout est bon
            console.log("good");
        } else {
            setErrors(validationErrors);
            console.log(validationErrors);
        }
    };

    return (
        <div className="signup-form-password-container">
            <form className="signup-form-password">
                <div className="signup-form-group">
                    <label htmlFor="password">Mot de passe</label>
                    <div className="password-wrapper">
                        <input
                            type={passwordShown ? "text" : "password"}
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <i
                            className={`fa ${passwordShown ? "fa-eye-slash" : "fa-eye"} togglePassword`}
                            onClick={togglePasswordVisibility}
                        ></i>
                    </div>
                    {errors.password && <p className="signup-error-message">{errors.password}</p>}
                </div>

                <div className="signup-form-group">
                    <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
                    <div className="password-wrapper">
                        <input
                            type={confirmPasswordShown ? "text" : "password"}
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <i
                            className={`fa ${confirmPasswordShown ? "fa-eye-slash" : "fa-eye"} togglePassword`}
                            onClick={toggleConfirmPasswordVisibility}
                        ></i>
                    </div>
                    {errors.confirmPassword && <p className="signup-error-message">{errors.confirmPassword}</p>}
                </div>
            </form>

            <div className="signup-button-containers">
                <button className="signup-btns previous-btn" type="button" onClick={onPrevious}>Previous</button>
                <button className="signup-btns next-btn" type="button" onClick={handleNext}>S'inscrire</button>
            </div>
        </div>
    );
};

export default SignupFormPassword;