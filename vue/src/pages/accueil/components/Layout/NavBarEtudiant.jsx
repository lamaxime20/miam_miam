import { useState } from "react"
import { useNavigate } from "react-router-dom"
import logoRestau from "../../assets/images/utilsImages/Logo miam miam.png"
import "../../../../App.css"
import Login from "../Auth/Connexion.jsx"
import Register from "../Auth/Register.jsx"
import ForgotPassword from "../Auth/Forgotpassword.jsx"
import "./navBarEtudiant.css"
import "bootstrap/dist/css/bootstrap.min.css"

function NavBarEtudiant({ chemin, isAuthenticated, user, onLoginSuccess, onLogout, onShowDashboard, onGoHome }) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  const handleSwitchToRegister = () => { setShowLogin(false); setShowRegister(true) }
  const handleSwitchToLogin = () => { setShowRegister(false); setShowLogin(true) }
  const handleSwitchToForgotPassword = () => { setShowLogin(false); setShowForgotPassword(true) }
  const handleSwitchFromForgotPassword = () => { setShowForgotPassword(false); setShowLogin(true) }

  const handleLoginSuccess = (userData) => { setShowLogin(false); onLoginSuccess(userData) }
  const handleRegisterSuccess = (userData) => { setShowRegister(false); onLoginSuccess(userData) }

  const handleDashboardClick = () => {
    if (!isAuthenticated) { alert("Veuillez vous connecter pour accéder au tableau de bord"); setShowLogin(true); setMenuOpen(false); return }
    onShowDashboard(); setMenuOpen(false)
  }

  return (
    <>
      <nav className="navigateur">
        <div className="container-fluid">
          <div className="row align-items-center justify-content-between">
            {/* Logo */}
            <div className="col-auto">
              <img className="navbar-logo" src={logoRestau} alt="Logo miam miam" />
            </div>
            {/* Menu principal */}
            <div className="col d-none d-md-block">
              <div className="d-flex justify-content-center onglets">
                <button className="onglet" onClick={() => { onGoHome?.(); navigate('/'); setMenuOpen(false); }}>Accueil</button>
                <button className="onglet" onClick={handleDashboardClick}>Tableau de bord</button>
                <button className="onglet">A propos</button>
              </div>
            </div>
            {/* Icônes et boutons*/}
            <div className="col-auto d-none d-lg-flex">
              <div className="d-flex align-items-center services">
                {isAuthenticated ? (
                  <>
                    <span className="user-welcome" style={{ color: "#ffffff", marginRight: "1rem" }}>Bonjour, {user?.name}</span>
                    <button className="btn-connexion" onClick={onLogout}>Déconnexion</button>
                  </>
                ) : (
                  <>
                    <button className="btn-connexion" onClick={() => { navigate('/login'); setMenuOpen(false); }}>Connexion</button>
                    <button className="link-inscrire" onClick={() => { navigate('/signup'); setMenuOpen(false); }} style={{ background: "none", border: "none", color: "#ffffff" }}>S'inscrire</button>
                  </>
                )}
              </div>
            </div>
            {/* Menu hamburger visible sur mobile */}
            <div className="col-auto d-md-none menu-toggle">
              <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
            </div>
          </div>
          {/* Menu mobile */}
          {menuOpen && (
            <div className="menu-mobile d-md-none">
              <button className="onglet" onClick={() => { onGoHome?.(); navigate('/'); setMenuOpen(false); }}>Accueil</button>
              <button className="onglet" onClick={handleDashboardClick}>Tableau de bord</button>
              <button className="onglet">A propos</button>
              <div className="mobile-actions">
                {isAuthenticated ? (
                  <>
                    <span className="user-welcome" style={{ color: "#ffffff", textAlign: "center", padding: "0.5rem 0" }}>Bonjour, {user?.name}</span>
                    <button className="btn-connexion" onClick={() => { onLogout(); setMenuOpen(false) }}>Déconnexion</button>
                  </>
                ) : (
                  <>
                    <button className="btn-connexion" onClick={() => { navigate('/login'); setMenuOpen(false) }}>Connexion</button>
                    <button className="link-inscrire" onClick={() => { navigate('/signup'); setMenuOpen(false) }} style={{ background: "none", border: "none", color: "#ffffff", textAlign: "center", padding: "0.5rem 0" }}>S'inscrire</button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Modals */}
      {showLogin && (
        <Login onClose={() => setShowLogin(false)} onSwitchToRegister={handleSwitchToRegister} onSwitchToForgotPassword={handleSwitchToForgotPassword} onLoginSuccess={handleLoginSuccess} />
      )}
      {showRegister && (
        <Register onClose={() => setShowRegister(false)} onSwitchToLogin={handleSwitchToLogin} onSwitchToForgotPassword={handleSwitchToForgotPassword} onRegisterSuccess={handleRegisterSuccess} />
      )}
      {showForgotPassword && (
        <ForgotPassword onClose={() => setShowForgotPassword(false)} onSwitchToLogin={handleSwitchFromForgotPassword} />
      )}
    </>
  )
}

export default NavBarEtudiant
