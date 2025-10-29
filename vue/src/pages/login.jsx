import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/user';
import '../assets/styles/login.css';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordShown, setPasswordShown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const togglePasswordVisibility = () => {
    setPasswordShown(!passwordShown);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Veuillez renseigner votre email et votre mot de passe');
      return;
    }
    setLoading(true);
    const res = await loginUser({ email, password });
    setLoading(false);
    if (!res.success) {
      setError(res.message || 'Email ou mot de passe incorrect');
      return;
    }
    navigate('/');
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <div className="password-wrapper">
            <input type={passwordShown ? 'text' : 'password'} id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <i className={`fa ${passwordShown ? 'fa-eye-slash' : 'fa-eye'} togglePassword`} onClick={togglePasswordVisibility}></i>
          </div>
          {error && (
            <div className="error-message">
              <span>{error}</span>
            </div>
          )}
        </div>
        <button className="login-btn" type="submit" disabled={loading}>{loading ? 'Connexion...' : 'Login'}</button>
        <div className="form-links">
          <div className="signup-link">
            <a href="/signup">Nouveau ?Créer un compte</a>
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
