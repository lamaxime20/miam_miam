import { useEffect, useState } from 'react';
import './AcceuilStudent.css';
import NavBarEtudiant from './components/Layout/NavBarEtudiant.jsx';
import HeroCarousel from './components/Section/HeroCarousel.jsx';
import MenuSection from './components/Section/MenuSection.jsx';
import Footer from './components/Layout/Footer.jsx';
import Dashboard from './components/Dashboard/Dashboard.jsx';
import { getRestaurantById } from './services/resataurant.js';
import { addToCart } from '../../services/Menu.js';
import { getAuthInfo } from '../../services/user.js';

function AcceuilStudent() {
  const [restaurant, setRestaurant] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [initialDashboardPage, setInitialDashboardPage] = useState('dashboard');

  useEffect(() => {
    async function fetchRestaurant() {
      try {
        setLoading(true);
        setError(null);
        const data = await getRestaurantById(1);
        setRestaurant(data || {});
      } catch (err) {
        console.error('Erreur lors du chargement du restaurant:', err);
        setError("Impossible de charger les données du restaurant");
      } finally {
        setLoading(false);
      }
    }
    fetchRestaurant();

    // Détecter l'authentification via le token local
    const info = getAuthInfo();
    if (info) {
      setIsAuthenticated(true);
      setUser({ name: info.display_name || 'Client' });
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setShowDashboard(false);
    localStorage.removeItem('auth_token');
  };

  const handleShowDashboard = () => {
    if (isAuthenticated) {
      setInitialDashboardPage('dashboard');
      setShowDashboard(true);
    } else {
      alert('Veuillez vous connecter pour accéder au tableau de bord');
    }
  };

  const handleBackToHome = () => setShowDashboard(false);

  const handleAddToCartAndShowPanier = (item) => {
    addToCart(item);
    setInitialDashboardPage('panier');
    setShowDashboard(true);
  };

  if (loading) return <div style={{ padding: 20, color: '#fff' }}>Chargement...</div>;
  if (error) return <div style={{ padding: 20, color: 'tomato' }}>{error}</div>;

  const handleRequestLogin = () => window.location.href = '/login';


  return (
    <div className="home">
      <NavBarEtudiant
        chemin={restaurant?.chemin}
        isAuthenticated={isAuthenticated}
        user={user}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
        onShowDashboard={handleShowDashboard}
        onGoHome={handleBackToHome}
      />

      {showDashboard ? (
        <Dashboard user={user} onClose={handleBackToHome} initialPage={initialDashboardPage} />
      ) : (
        <>
          <HeroCarousel />
          <MenuSection 
            isAuthenticated={isAuthenticated} 
            onRequestLogin={handleRequestLogin} 
            onAddToCartAndShowPanier={handleAddToCartAndShowPanier} 
          />
          <Footer />
        </>
      )}
    </div>
  );
}

export default AcceuilStudent;
