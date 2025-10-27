import { useState } from 'react';
import { RiCloseLine, RiMailLine } from 'react-icons/ri';
import './Forgotpassword.css';

const ForgotPassword = ({ onClose, onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!email) { setError("Veuillez entrer votre adresse email"); setIsLoading(false); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Veuillez entrer une adresse email valide"); setIsLoading(false); return; }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSent(true);
    } catch (err) {
      setError("Erreur lors de l'envoi du lien. Veuillez réessayer.");
    } finally { setIsLoading(false); }
  };

  const handleReset = () => { setEmail(''); setIsSent(false); setError(''); };

  return (
    <div className="forgot-password-overlay">
      <div className="forgot-password-container">
        <div className="forgot-password-header">
          <h2 className="forgot-password-title">Mot de passe oublié</h2>
          <button className="forgot-password-close" onClick={onClose}><RiCloseLine size={24} /></button>
        </div>

        {!isSent ? (
          <>
            <div className="forgot-password-subtitle"><p>Entrez votre adresse email pour recevoir un lien de réinitialisation</p></div>
            <form onSubmit={handleSubmit} className="forgot-password-form">
              <div className="form-group">
                <label htmlFor="email" className="form-label">Adresse email</label>
                <div className="email-input-container">
                  <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-input" placeholder="votre@email.com" required disabled={isLoading} />
                  <RiMailLine className="email-icon" size={20} />
                </div>
              </div>
              {error && (<div className="error-message">{error}</div>)}
              <button type="submit" className="send-button" disabled={isLoading}>{isLoading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}</button>
            </form>
          </>
        ) : (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h3 className="success-title">Email envoyé !</h3>
            <p className="success-description">Nous avons envoyé un lien de réinitialisation à <strong>{email}</strong>.</p>
            <button className="resend-button" onClick={handleReset}>Réessayer avec un autre email</button>
          </div>
        )}

        <div className="forgot-password-footer">
          <button className="back-button" onClick={onSwitchToLogin} disabled={isLoading}>← Retour à la connexion</button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
