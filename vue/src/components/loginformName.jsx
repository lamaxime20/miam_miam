import React, { useState } from 'react';
import { checkPassword } from '../services/user';
import { Link } from 'react-router-dom';
import '../assets/styles/login.css';

const LoginFormName = ({ onPasswordCorrect }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        let formErrors = {};
        if (!email) formErrors.email = "L'email est obligatoire.";
        if (!password) formErrors.password = "Le mot de passe est obligatoire.";

        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            setLoading(false);
            return;
        }

        try {
            const isPasswordCorrect = await checkPassword(email, password);

            if (isPasswordCorrect) {
                // === LA LOGIQUE MANQUANTE EST ICI ===
                // On stocke les identifiants pour que l'étape 2 puisse les utiliser.
                localStorage.setItem('loginCredentials', JSON.stringify({ email, password }));
                
                // On passe à l'étape suivante
                onPasswordCorrect();
            } else {
                setErrors({ global: 'Email ou mot de passe incorrect.' });
            }
        } catch (error) {
            console.error("Erreur lors de la vérification du mot de passe:", error);
            setErrors({ global: 'Une erreur est survenue. Veuillez réessayer.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <h2 className="text-center mb-4">Connexion</h2>
            <form onSubmit={handleSubmit}>
                {errors.global && <div className="error-message">{errors.global}</div>}
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>
                <div className="form-group">
                    <label htmlFor="password">Mot de passe</label>
                    <input
                        type="password"
                        id="password"
                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                    />
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                    {loading ? 'Vérification...' : 'Suivant'}
                </button>
                <div className="form-group text-end">
                    <Link to="/forgot-password" style={{ fontSize: '0.9em' }}>Mot de passe oublié ?</Link>
                </div>
                <div className="text-center mt-3">
                    <span className="text-muted">Pas de compte ? </span>
                    <Link to="/signup">S'inscrire</Link>
                </div>
            </form>
        </div>
    );
};

export default LoginFormName;