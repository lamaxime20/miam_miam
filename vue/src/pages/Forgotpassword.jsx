import { useState } from 'react';
import { RiCloseLine, RiMailLine } from 'react-icons/ri';
import '../assets/styles/ForgotPassword.css';
import { requestReset, verifyCode, resetPassword } from '../services/ForgotPassword';

const ForgotPassword = ({ onClose, onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');
  const [code, setCode] = useState('');
  const [codeVerified, setCodeVerified] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    // Validation basique
    if (!email) {
      setError('Veuillez entrer votre adresse email');
      setIsLoading(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Veuillez entrer une adresse email valide');
      setIsLoading(false);
      return;
    }

    try {
      await requestReset(email);
      setIsSent(true);
      setMessage("Nous avons envoyé un code de réinitialisation à votre adresse email.");
    } catch (err) {
      setError(err.message || 'Erreur lors de la demande. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setEmail('');
    setIsSent(false);
    setError('');
    setCode('');
    setCodeVerified(false);
    setPassword('');
    setConfirmPassword('');
    setMessage('');
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await verifyCode(email, code);
      if (res.valid) {
        setCodeVerified(true);
        setMessage('Code vérifié. Vous pouvez maintenant définir un nouveau mot de passe.');
      } else {
        setError('Code invalide ou expiré.');
      }
    } catch (err) {
      setError(err.message || 'Erreur lors de la vérification du code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    if (!password || password.length < 6) {
      setIsLoading(false);
      return setError('Le mot de passe doit contenir au moins 6 caractères.');
    }
    if (password !== confirmPassword) {
      setIsLoading(false);
      return setError('Les mots de passe ne correspondent pas.');
    }
    try {
      await resetPassword(email, code, password, confirmPassword);
      setMessage('Mot de passe réinitialisé avec succès. Vous allez être redirigé vers la connexion...');
      setError('');
      window.location.href = '/login';
    } catch (err) {
      setError(err.message || 'Erreur lors de la réinitialisation du mot de passe.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-overlay">
      <div className="forgot-password-container">
        {/* En-tête */}
        <div className="forgot-password-header">
          <h2 className="forgot-password-title">Mot de passe oublié</h2>
          <button className="forgot-password-close" onClick={onClose}>
            <RiCloseLine size={24} />
          </button>
        </div>

        {!isSent ? (
          <>
            {/* Sous-titre */}
            <div className="forgot-password-subtitle">
              <p>Entrez votre adresse email pour recevoir un code de réinitialisation</p>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="forgot-password-form">
              {/* Champ Email */}
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Adresse email
                </label>
                <div className="email-input-container">
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    placeholder="votre@email.com"
                    required
                    disabled={isLoading}
                  />
                  <RiMailLine className="email-icon" size={20} />
                </div>
              </div>

              {/* Message d'erreur */}
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
              {message && !error && (
                <div className="success-description">
                  {message}
                </div>
              )}

              {/* Bouton d'envoi */}
              <button 
                type="submit" 
                className="send-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="loading-spinner">
                    <div className="spinner"></div>
                    Envoi en cours...
                  </div>
                ) : (
                  'Envoyer le code'
                )}
              </button>
            </form>
          </>
        ) : (
          <>
            {!codeVerified ? (
              /* Vérification du code */
              <form onSubmit={handleVerifyCode} className="forgot-password-form">
                <div className="form-group">
                  <label htmlFor="code" className="form-label">Code de réinitialisation</label>
                  <input
                    type="text"
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="form-input"
                    placeholder="Entrez le code à 6 chiffres"
                    required
                    maxLength={6}
                    disabled={isLoading}
                  />
                </div>
                {error && <div className="error-message">{error}</div>}
                {message && !error && <div className="success-description">{message}</div>}
                <div className="actions-row">
                  <button type="button" className="back-button" onClick={handleReset} disabled={isLoading}>Changer d'email</button>
                  <button type="submit" className="send-button" disabled={isLoading}>
                    {isLoading ? 'Vérification...' : 'Vérifier le code'}
                  </button>
                </div>
              </form>
            ) : (
              /* Changement du mot de passe */
              <form onSubmit={handleChangePassword} className="forgot-password-form">
                <div className="form-group">
                  <label htmlFor="password" className="form-label">Nouveau mot de passe</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                    placeholder="Votre nouveau mot de passe"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">Confirmer le mot de passe</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-input"
                    placeholder="Confirmez le mot de passe"
                    required
                    disabled={isLoading}
                  />
                </div>
                {error && <div className="error-message">{error}</div>}
                {message && !error && <div className="success-description">{message}</div>}
                <div className="actions-row">
                  <button type="button" className="back-button" onClick={handleReset} disabled={isLoading}>Recommencer</button>
                  <button type="submit" className="send-button" disabled={isLoading}>
                    {isLoading ? 'Mise à jour...' : 'Changer le mot de passe'}
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        {/* Lien de retour */}
        <div className="forgot-password-footer">
          <button 
            className="back-button"
            onClick={() => window.location.href = '/login'}
            disabled={isLoading}
          >
            ← Retour à la connexion
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;