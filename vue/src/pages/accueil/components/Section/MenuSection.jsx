import { useState, useEffect } from "react";
import "./MenuSection.css"

import MenuCard from "./MenuCard.jsx"
import { AvoirMenusJourAcceul } from "../../../../services/Menu.js"
import { useNavigate } from "react-router-dom";

function MenuSection({ isAuthenticated, onRequestLogin, onAddToCartAndShowPanier }) {
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const items = await AvoirMenusJourAcceul();
        // On ne prend que les 4 premiers pour l'accueil
        setMenuItems(items.slice(0, 4));
      } catch (error) {
        console.error("Erreur lors de la récupération du menu du jour:", error);
      }
    };

    fetchMenuItems();
  }, []); // Le tableau vide signifie que cet effet ne s'exécute qu'une fois, au montage.

  const navigate = useNavigate();

  const handleMenuClick = () => {
    if (!isAuthenticated) {
      alert("Veuillez vous connecter pour accéder au menu complet");
      navigate('/login');
      return;
    }
    onAddToCartAndShowPanier(null); // Pour afficher le dashboard sur la page menu par défaut
  };

  return (
    <section className="menu-section">
      <div className="container-fluid">
        <div className="menu-header">
          <h2 className="menu-title">Menu du jour</h2>
          <p className="menu-subtitle">chez Mon miam miam Space</p>
          <p className="menu-description">
            Chaque jour, notre chef prépare des plats frais avec des ingrédients de saison. Découvrez nos spécialités
            maison, élaborées avec passion pour vous offrir une expérience culinaire inoubliable. Tous nos plats sont
            préparés sur commande pour garantir fraîcheur et qualité.
          </p>
        </div>

        <div className="row menu-grid">
          {menuItems.map((item) => (
            <MenuCard 
              key={item.id} 
              item={item} 
              isAuthenticated={isAuthenticated}
              onRequestLogin={onRequestLogin}
              onAddToCartAndShowPanier={onAddToCartAndShowPanier}
            />
          ))}
        </div>
        <div className="see-all-container">
          <button className="see-all-button" onClick={handleMenuClick}>
            Voir le menu complet
          </button>
        </div>
      </div>
    </section>
  );
}

export default MenuSection;
