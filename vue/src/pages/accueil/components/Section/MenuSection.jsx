import "./MenuSection.css"
import Eru from "../../assets/images/utilsImages/Eru.jpg"
import Okok from "../../assets/images/utilsImages/Okok.png"
import Ndole from "../../assets/images/utilsImages/Ndole.png"
import PouletDG from "../../assets/images/utilsImages/PouletDG.png"

function MenuSection({ isAuthenticated, onRequestLogin, onShowMenu }) {
  const menuItems = [
    { id: 1, name: "Eru", image: Eru, description: "Délicieux Eru accompagné de coucous Tapioca", price: "1000 FCFA", rating: 5 },
    { id: 2, name: "Okok salé", image: Okok, description: "Du okok sale savoureux accompagné de baton de manioc", price: "1000 FCFA", rating: 4 },
    { id: 3, name: "Ndolé", image: Ndole, description: "Ndole avec au choix du riz, plantain ou baton de manioc pour accompagnement", price: "1500 FCFA", rating: 5 },
    { id: 4, name: "Poulet DG", image: PouletDG, description: "Poulet DG accompagné de plantains frits et d'une sauce épicée", price: "2000 FCFA", rating: 3 },
  ]

  const handleMenuClick = () => {
    if (!isAuthenticated) {
      alert("Veuillez vous connecter pour accéder au menu complet");
      onRequestLogin?.();
      return;
    }
    onShowMenu?.();
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
            <div key={item.id} className="col-12 col-md-6 col-lg-3 ">
              <div className="menu-card">
                <div className="menu-image-container">
                  <img src={item.image || "/placeholder.svg"} alt={item.name} className="menu-image" />
                  <div className="menu-icons"></div>
                </div>
                <h3 className="menu-item-name">{item.name}</h3>
                <div className="menu-rating">
                  {[...Array(item.rating)].map((_, i) => (
                    <span key={i} className="star">★</span>
                  ))}
                </div>
                <p className="menu-item-description">{item.description}</p>
                <p className="menu-item-price">{item.price}</p>
                <button className="order-button">Commander</button>
              </div>
            </div>
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
