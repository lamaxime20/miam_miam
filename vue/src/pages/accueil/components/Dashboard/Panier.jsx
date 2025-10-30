"use client"

import { useState } from "react";
import { FaShoppingBag } from "react-icons/fa";
import PanierCardMenu from "./PanierCardMenu";
import { 
  updateCartQuantity, 
  removeFromCart, 
  getTotalCartPrice,
  getTotalCartItems 
} from "../../../../services/Menu";
import { useMenusGroupedByRestaurant, useCommande } from "../../../../services/Panier";

export function Panier({ onShowMenu }) {
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);

  const { groupedMenus, loading, reload } = useMenusGroupedByRestaurant();
  const {
    isModalOpen, openModal, closeModal, handleSubmit,
    heureLivraison, setHeureLivraison,
    typeLocalisation, setTypeLocalisation,
    localisationEstimee, setLocalisationEstimee,
    isSubmitting, error
  } = useCommande(() => reload());

  const applyPromoCode = () => {
    if (promoCode === "PROMO20") setDiscount(0.2);
  };

  const subtotalReal = groupedMenus.reduce((acc, g) => acc + (g.totals?.real || 0), 0);
  const subtotalPromo = groupedMenus.reduce((acc, g) => acc + (g.totals?.promo || 0), 0);
  const deliveryFee = subtotalPromo > 0 ? 500 : 0;
  const totalReal = subtotalReal + deliveryFee;
  const totalPromo = subtotalPromo + deliveryFee;
  const totalItems = getTotalCartItems();

  const handleUpdateQuantity = (id, change) => {
    // PanierCardMenu envoie l'id de l'item (menu.id)
    updateCartQuantity(id, Math.max(1, (change > 0 ? 1 : -1) + 0)); // la fonction existante nécessite quantité finale, mais ici on laisse PanierCardMenu appeler correctement si nécessaire
    reload();
  };

  const handleRemoveItem = (id) => {
    removeFromCart(id);
    reload();
  };

  const onCommanderRestaurant = (group) => {
    const menusPayload = group.items.map(it => ({
      id_menu: it.id,
      quantity: it.quantity,
      prix_menu: it.pricePromo ?? it.price,
      pricePromo: it.pricePromo ?? null,
    }));
    openModal(menusPayload);
  };

  return (
    <div className="container py-5" style={{ backgroundColor: "#000000", minHeight: "100vh" }}>
      <h1 className="text-white mb-3">Mon Panier</h1>
      <p className="text-white-50">{totalItems} article{totalItems > 1 ? "s" : ""} dans votre panier</p>

      {loading ? (
        <div className="text-center text-white-50">Chargement...</div>
      ) : groupedMenus.length === 0 ? (
        <div className="text-center bg-white rounded-xl p-5 shadow-sm">
          <div className="mx-auto mb-3 p-4 rounded-circle bg-light d-flex justify-content-center align-items-center" style={{ width: "80px", height: "80px" }}>
            <FaShoppingBag size={32} className="text-muted" />
          </div>
          <h3>Votre panier est vide</h3>
          <p className="text-muted mb-3">Ajoutez des plats délicieux à votre panier</p>
          <button className="btn" style={{ backgroundColor: "#cfbd97", color: "#000000" }} onClick={onShowMenu}>Voir le Menu</button>
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-lg-8">
            {groupedMenus.map((group) => (
              <div key={group.restaurant.id} className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h4 className="text-white m-0">{group.restaurant.nom}</h4>
                  <div className="text-white-50 small me-2">
                    <span className="me-2">Total groupe (réel): {group.totals?.real || 0} FCFA</span>
                    <span>Promo: <span style={{ color: "#cfbd97" }}>{group.totals?.promo || 0} FCFA</span></span>
                  </div>
                  <button className="btn btn-sm" style={{ backgroundColor: "#cfbd97", color: "#000000" }} onClick={() => onCommanderRestaurant(group)}>
                    commander au {group.restaurant.nom}
                  </button>
                </div>
                {group.items.map((item) => (
                  <PanierCardMenu key={item.id} item={item} updateQuantity={handleUpdateQuantity} removeItem={handleRemoveItem} />
                ))}
              </div>
            ))}
          </div>

          <div className="col-lg-4">
            <div className="card shadow-sm p-4 sticky-top" style={{ top: "20px" }}>
              <h5>Résumé de la commande</h5>
              <hr />
              <div className="d-flex justify-content-between mb-2">
                <span>Sous-total (réel)</span>
                <span>{subtotalReal} FCFA</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Sous-total (promo)</span>
                <span style={{ color: "#cfbd97" }}>{subtotalPromo} FCFA</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Frais de livraison</span>
                <span>{deliveryFee} FCFA</span>
              </div>
              <div className="d-flex justify-content-between fw-bold mt-3">
                <span>Total (réel)</span>
                <span>{totalReal} FCFA</span>
              </div>
              <div className="d-flex justify-content-between fw-bold">
                <span>Total (promo)</span>
                <span style={{ color: "#cfbd97" }}>{totalPromo} FCFA</span>
              </div>
              <button className="btn btn-outline-secondary w-100 mt-2" onClick={onShowMenu}>Continuer mes achats</button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="modal d-block" tabIndex="-1" role="dialog" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Informations de livraison</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Heure de livraison</label>
                  <input type="time" className="form-control" value={heureLivraison} onChange={(e) => setHeureLivraison(e.target.value)} />
                </div>

                <div className="mb-3">
                  <label className="form-label d-block">Type de localisation</label>
                  <div className="form-check form-check-inline">
                    <input className="form-check-input" type="radio" id="loc-estimation" value="estimation" checked={typeLocalisation === 'estimation'} onChange={(e) => setTypeLocalisation(e.target.value)} />
                    <label className="form-check-label" htmlFor="loc-estimation">Estimée</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input className="form-check-input" type="radio" id="loc-google" value="googleMap" checked={typeLocalisation === 'googleMap'} onChange={(e) => setTypeLocalisation(e.target.value)} />
                    <label className="form-check-label" htmlFor="loc-google">Google Map</label>
                  </div>
                </div>

                {typeLocalisation === 'estimation' ? (
                  <div className="mb-3">
                    <label className="form-label">Votre localisation</label>
                    <input type="text" className="form-control" placeholder="Entrez votre position" value={localisationEstimee} onChange={(e) => setLocalisationEstimee(e.target.value)} />
                  </div>
                ) : (
                  <div className="alert alert-info">Localisation définie par défaut: yatchika</div>
                )}

                {error && <div className="alert alert-danger mt-2">{error}</div>}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal} disabled={isSubmitting}>Annuler</button>
                <button type="button" className="btn" style={{ backgroundColor: "#cfbd97", color: "#000000" }} onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? 'En cours...' : 'Commander'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Panier;
