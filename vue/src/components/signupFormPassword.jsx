import React, { useState } from 'react';
import { validateSignupFormPassword, creerUser } from '../services/user';

// ✅ Composant Loader global avec overlay semi-transparent
const LoadingOverlay = ({ visible, message = "Création du compte..." }) => {
    if (!visible) return null;
    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0,
            width: '100vw', height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            flexDirection: 'column',
            color: 'white',
            fontSize: '1.2em'
        }}>
            <div className="loader" style={{
                border: '6px solid #f3f3f3',
                borderTop: '6px solid #3498db',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                animation: 'spin 1s linear infinite',
                marginBottom: '15px'
            }}></div>
            <p>{message}</p>

            {/* Animation CSS */}
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

const SignupFormPassword = ({ onPrevious, onNext }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordShown, setPasswordShown] = useState(false);
    const [confirmPasswordShown, setConfirmPasswordShown] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false); // ✅ état du chargement

    const togglePasswordVisibility = () => setPasswordShown(!passwordShown);
    const toggleConfirmPasswordVisibility = () => setConfirmPasswordShown(!confirmPasswordShown);

    const handleNext = async () => {
        const validationErrors = validateSignupFormPassword({ password, confirmPassword });
        if (Object.keys(validationErrors).length === 0) {
            try {
                setLoading(true); // ✅ fige l’écran et affiche le loader
                const success = await creerUser();
                if (success) onNext();
                else setErrors({ global: "Erreur lors de la création du compte." });
            } catch (error) {
                console.error(error);
                setErrors({ global: "Une erreur est survenue. Réessayez plus tard." });
            } finally {
                setLoading(false); // ✅ retire le loader à la fin
            }
        } else {
            setErrors(validationErrors);
        }
    };

    return (
        <>
            <div className="signup-form-password-container" style={{ position: 'relative' }}>
                <form onSubmit={(e) => e.preventDefault()} className='signup-form-password'>
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

                    {errors.global && <p className="signup-error-message">{errors.global}</p>}
                </form>

                <div className="signup-button-containers">
                    <button className="signup-btns previous-btn" type="button" onClick={onPrevious}>
                        Précédent
                    </button>
                    <button
                        className="signup-btns next-btn"
                        type="button"
                        onClick={handleNext}
                        disabled={loading} // ✅ empêche plusieurs clics
                    >
                        {loading ? "Création..." : "S'inscrire"}
                    </button>
                </div>
            </div>

            {/* ✅ Overlay de chargement global */}
            <LoadingOverlay visible={loading} message="Création du compte..." />
        </>
    );
};

export default SignupFormPassword;