import { useState } from "react";
import "./Connexion.css";

function Login({ onClose, onSwitchToRegister, onSwitchToForgotPassword, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Veuillez remplir tous les champs");
      setLoading(false);
      return;
    }

    setTimeout(() => {
      const userData = { id: 1, name: "Marie sagmeni", email, role: "client", points: 1250 };
      onLoginSuccess(userData);
      setLoading(false);
      onClose();
    }, 800);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-auth" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        <div className="auth-container">
          <h2 className="auth-title">Connexion</h2>
          <p className="auth-subtitle">Connectez-vous pour accéder à votre espace client</p>
          {error && <div className="alert alert-danger" role="alert">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input type="email" className="form-control" id="email" placeholder="votre@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Mot de passe</label>
              <input type="password" className="form-control" id="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="mb-3 text-end">
              <button type="button" className="btn btn-link p-0 text-decoration-none" onClick={onSwitchToForgotPassword}>Mot de passe oublié ?</button>
            </div>
            <button type="submit" className="btn btn-primary w-100 mb-3" disabled={loading}>{loading ? "Connexion..." : "Se connecter"}</button>
            <div className="text-center">
              <span className="text-muted">Pas encore de compte ? </span>
              <button type="button" className="btn btn-link p-0 text-decoration-none" onClick={onSwitchToRegister}>S'inscrire</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
