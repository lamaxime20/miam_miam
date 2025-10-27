import { useState } from 'react';
import './Register.css';
import { RiCloseLine, RiEyeLine, RiEyeOffLine } from "react-icons/ri";

const Register = ({ onClose, onSwitchToLogin, onSwitchToForgotPassword, onRegisterSuccess }) => {
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', location: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Le nom complet est requis';
    if (!formData.email.trim()) newErrors.email = "L'email est requis"; else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "L'email n'est pas valide";
    if (!formData.phone.trim()) newErrors.phone = 'Le téléphone est requis';
    if (!formData.location.trim()) newErrors.location = 'La localisation est requise';
    if (!formData.password) newErrors.password = 'Le mot de passe est requis'; else if (formData.password.length < 6) newErrors.password = 'Au moins 6 caractères';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Veuillez confirmer votre mot de passe'; else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    setErrors(newErrors); return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      onRegisterSuccess?.({ name: formData.fullName, email: formData.email });
      onSwitchToLogin?.();
    } catch {
      setErrors({ submit: "Erreur lors de la création du compte" });
    } finally { setIsLoading(false); }
  };

  return (
    <div className="register-overlay">
      <div className="register-container">
        <div className="register-header">
          <h2 className="register-title">Créer un compte</h2>
          <button className="register-close" onClick={onClose}><RiCloseLine size={24} /></button>
        </div>
        <div className="register-subtitle"><p>Remplissez le formulaire pour créer votre compte</p></div>
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="fullName" className="form-label">Nom complet</label>
            <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} className={`form-input ${errors.fullName ? 'error' : ''}`} placeholder="Votre nom complet" disabled={isLoading} />
            {errors.fullName && <span className="error-text">{errors.fullName}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className={`form-input ${errors.email ? 'error' : ''}`} placeholder="votre@email.com" disabled={isLoading} />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="phone" className="form-label">Téléphone</label>
            <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} className={`form-input ${errors.phone ? 'error' : ''}`} placeholder="Votre numéro de téléphone" disabled={isLoading} />
            {errors.phone && <span className="error-text">{errors.phone}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="location" className="form-label">Localisation</label>
            <input type="text" id="location" name="location" value={formData.location} onChange={handleChange} className={`form-input ${errors.location ? 'error' : ''}`} placeholder="Votre localisation" disabled={isLoading} />
            {errors.location && <span className="error-text">{errors.location}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">Mot de passe</label>
            <div className="password-input-container">
              <input type={showPassword ? 'text' : 'password'} id="password" name="password" value={formData.password} onChange={handleChange} className={`form-input ${errors.password ? 'error' : ''}`} placeholder="Votre mot de passe" disabled={isLoading} />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} disabled={isLoading}>{showPassword ? <RiEyeOffLine size={20} /> : <RiEyeLine size={20} />}</button>
            </div>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Confirmer le mot de passe</label>
            <div className="password-input-container">
              <input type={showConfirmPassword ? 'text' : 'password'} id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className={`form-input ${errors.confirmPassword ? 'error' : ''}`} placeholder="Confirmez votre mot de passe" disabled={isLoading} />
              <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)} disabled={isLoading}>{showConfirmPassword ? <RiEyeOffLine size={20} /> : <RiEyeLine size={20} />}</button>
            </div>
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>
          {errors.submit && <div className="error-message">{errors.submit}</div>}
          <button type="submit" className="register-button" disabled={isLoading}>{isLoading ? 'Création du compte...' : 'Créer un compte'}</button>
        </form>
        <div className="register-footer">
          <p>Déjà un compte ? <button className="switch-button" onClick={onSwitchToLogin} disabled={isLoading}>Se connecter</button></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
