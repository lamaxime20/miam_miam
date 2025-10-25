"use client"

import { useState } from "react";
import { FaMinus, FaPlus, FaTrash, FaShoppingBag, FaArrowRight } from "react-icons/fa";

export function Panier({ onCheckout }) {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Pizza Margherita",
      price: 1200,
      quantity: 2,
      image: "https://images.unsplash.com/photo-1563245738-9169ff58eccf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    },
    {
      id: 2,
      name: "Burger Classique",
      price: 1500,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    },
  ]);

  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);

  const updateQuantity = (id, change) => {
    setCartItems((prev) =>
      prev.map((item) => ({
        ...item,
        quantity: item.id === id ? Math.max(1, item.quantity + change) : item.quantity,
      }))
    );
  };

  const removeItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const applyPromoCode = () => {
    if (promoCode === "PROMO20") setDiscount(0.2);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal > 0 ? 500 : 0;
  const discountAmount = subtotal * discount;
  const total = subtotal + deliveryFee - discountAmount;

  return (
    <div className="container py-5" style={{ backgroundColor: "#000000", minHeight: "100vh", }}>
      <h1 className="text-white mb-3">Mon Panier</h1>
      <p className="text-white-50">
        {cartItems.length} article{cartItems.length > 1 ? "s" : ""} dans votre panier
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
            {cartItems.map((item) => (
              <div key={item.id} className="card mb-3 shadow-sm">
                <div className="row g-3 align-items-center p-3">
                  <div className="col-md-3">
                    <img src={item.image} alt={item.name} className="img-fluid rounded" />
                  </div>
                  <div className="col-md-5">
                    <h5>{item.name}</h5>
                    <p className="text-warning fw-bold">{item.price} FCFA</p>
                    <div className="d-flex align-items-center gap-2 mt-2">
                      <button className="btn btn-outline-secondary btn-sm" onClick={() => updateQuantity(item.id, -1)}>
                        <FaMinus />
                      </button>
                      <span className="px-2">{item.quantity}</span>
                      <button className="btn btn-outline-secondary btn-sm" onClick={() => updateQuantity(item.id, 1)}>
                        <FaPlus />
                      </button>
                    </div>
                  </div>
                  <div className="col-md-2 text-end">
                    <p className="fw-bold">{item.price * item.quantity} FCFA</p>
                  </div>
                  <div className="col-md-2 text-end">
                    <button className="btn btn-outline-danger btn-sm" onClick={() => removeItem(item.id)}>
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Promo Code */}
            <div className="card shadow-sm p-3 mb-3">
              <h5>Code Promo</h5>
              <div className="d-flex gap-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Entrez votre code promo"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
                <button className="btn" style={{ backgroundColor: "#cfbd97", color: "#000000" }} onClick={applyPromoCode}>
                  Appliquer
                </button>
              </div>
              {discount > 0 && (
                <p className="text-success mt-2">✓ Code promo appliqué: -{discount * 100}%</p>
              )}
            </div>
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
