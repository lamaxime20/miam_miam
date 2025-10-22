import React, { useState } from 'react';
import '../assets/styles/login.css';

const Login = () => {
    const [passwordShown, setPasswordShown] = useState(false);

    const togglePasswordVisibility = () => {
        setPasswordShown(!passwordShown);
    };

    return (
        <div className="login-container">
            <form className="login-form">
                <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" name="email" required />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <div className="password-wrapper">
                        <input type={passwordShown ? "text" : "password"} id="password" name="password" required />
                        <i className={`fa ${passwordShown ? "fa-eye-slash" : "fa-eye"} togglePassword`} onClick={togglePasswordVisibility}></i>
                    </div>
                    <div className="error-message">
                        <span>email ou mot de passe incorrect</span>
                    </div>
                </div>
                <button type="button">Login</button>
                <div className="form-links">
                    <div className="signup-link">
                        <a href="#">Nouveau ?Créer un compte</a>
                    </div>
                    <div className="forgot-password-link">
                        <a href="#">Mot de passe oublié ?</a>
                    </div>
                </div>
                <div className="continue-with-container">
                    <hr />
                    <span>Ou continuer avec</span>
                    <hr />
                </div>                
                <div className="social-login">
                    <a href="https://www.google.com" target="_blank" rel="noopener noreferrer">
                        <img src="/assets/images/googleLogo.svg" alt="Google" />
                    </a>
                </div>
            </form>
        </div>
    );
};

export default Login;
