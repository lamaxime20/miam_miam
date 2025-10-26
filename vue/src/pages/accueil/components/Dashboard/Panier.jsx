"use client"

import { useState, useEffect } from "react";
import { FaMinus, FaPlus, FaTrash, FaShoppingBag, FaArrowRight } from "react-icons/fa";
import PanierCardMenu from "./PanierCardMenu";
import { 
  getCartFromStorage, 
  updateCartQuantity, 
  removeFromCart, 
  getTotalCartPrice,
  getTotalCartItems 
} from "../../../../services/Menu";

export function Panier({ onCheckout }) {
  const [cartItems, setCartItems] = useState([]);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [restaurants, setRestaurants] = useState({}); // Ajout de l'état pour les restaurants

  // Charger les données du panier depuis le localStorage au montage du composant
  useEffect(() => {
    groupCartItemsByRestaurant();
  }, []);

  const groupCartItemsByRestaurant = async () => {
    const cartData = getCartFromStorage();
    const itemsArray = Object.values(cartData);
    
    const groupedItems = {};

    for (const item of itemsArray) {
      try {
        const response = await fetch(`http://localhost:8000/api/menu/${item.id}/restaurant`);
        const result = await response.json();

        if (result.success) {
          const restaurantId = result.data.id_restaurant;
          if (!groupedItems[restaurantId]) {
            groupedItems[restaurantId] = {
              name: result.data.nom_restaurant,
              items: [],
            };
          }
          item.nomResto = result.data.nom_restaurant; // Add restaurant name to the item
          groupedItems[restaurantId].items.push(item);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du restaurant pour le menu:", error);
      }
    }

    setRestaurants(groupedItems);
    setCartItems(itemsArray); // Garder les articles du panier pour les calculs de totaux
  };

  const updateQuantity = (id, change) => {
    const currentItem = cartItems.find(item => item.id === id);
    if (!currentItem) return;

    const newQuantity = Math.max(1, currentItem.quantity + change);
    updateCartQuantity(id, newQuantity);
    groupCartItemsByRestaurant(); // Recharger et regrouper les données
  };

  const removeItem = (id) => {
    removeFromCart(id);
    groupCartItemsByRestaurant(); // Recharger et regrouper les données
  };

  const applyPromoCode = () => {
    if (promoCode === "PROMO20") setDiscount(0.2);
  };

  // Calculer les totaux en utilisant les fonctions du service Menu
  const subtotal = getTotalCartPrice();
  const deliveryFee = subtotal > 0 ? 500 : 0;
  const discountAmount = subtotal * discount;
  const total = subtotal + deliveryFee - discountAmount;
  const totalItems = getTotalCartItems();

  return (
    <div className="container py-5" style={{ backgroundColor: "#000000", minHeight: "100vh", }}>
      <h1 className="text-white mb-3">Mon Panier</h1>
      <p className="text-white-50">
        {totalItems} article{totalItems > 1 ? "s" : ""} dans votre panier
      </p>

      {cartItems.length === 0 ? (
        <div className="text-center bg-white rounded-xl p-5 shadow-sm">
          <div className="mx-auto mb-3 p-4 rounded-circle bg-light d-flex justify-content-center align-items-center" style={{ width: "80px", height: "80px" }}>
            <FaShoppingBag size={32} className="text-muted" />
          </div>
          <h3>Votre panier est vide</h3>
          <p className="text-muted mb-3">Ajoutez des plats délicieux à votre panier</p>
          <button className="btn" style={{ backgroundColor: "#cfbd97", color: "#000000" }}>Voir le Menu</button>
        </div>
      ) : (
        <div className="row g-4">
          {/* Cart Items */}
          <div className="col-lg-8">
            {Object.keys(restaurants).map((restaurantId) => (
              <div key={restaurantId} className="mb-4">
                <h4 className="text-white">{restaurants[restaurantId].name}</h4>
                {restaurants[restaurantId].items.map((item) => (
                  <PanierCardMenu key={item.id} item={item} updateQuantity={updateQuantity} removeItem={removeItem} />
                ))}
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="col-lg-4">
            <div className="card shadow-sm p-4 sticky-top" style={{ top: "20px" }}>
              <h5>Résumé de la commande</h5>
              <hr />
              <div className="d-flex justify-content-between mb-2">
                <span>Sous-total</span>
                <span>{subtotal} FCFA</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Frais de livraison</span>
                <span>{deliveryFee} FCFA</span>
              </div>
              {discount > 0 && (
                <div className="d-flex justify-content-between text-success mb-2">
                  <span>Réduction</span>
                  <span>-{discountAmount} FCFA</span>
                </div>
              )}
              <div className="d-flex justify-content-between fw-bold mt-3">
                <span>Total</span>
                <span style={{ color: "#cfbd97" }}>{total} FCFA</span>
              </div>

              <button className="btn w-100 mt-3 d-flex justify-content-center align-items-center gap-2" style={{ backgroundColor: "#cfbd97", color: "#000000" }} onClick={onCheckout}>
                Passer la commande <FaArrowRight />
              </button>
              <button className="btn btn-outline-secondary w-100 mt-2">Continuer mes achats</button>

              {/* Loyalty Points */}
              <div className="mt-4 p-3 rounded bg-light">
                <p className="mb-1 fw-bold">⭐ Points de fidélité</p>
                <p className="mb-0 text-muted">Vous gagnerez {Math.floor(total / 10)} points avec cette commande</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Panier;
