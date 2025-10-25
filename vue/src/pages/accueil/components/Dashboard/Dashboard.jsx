import { useState } from "react"
import "./Dashboard.css"
import {
  RiDashboardLine,
  RiShoppingCart2Line,
  RiFileList3Line,
  RiGiftLine,
  RiSettings4Line,
  RiStarFill,
} from "react-icons/ri"

import MiniJeux from "./MiniJeux"
import Panier from "./Panier"
import Parametres from "./Parametres"
import Reclamations from "./Reclamations"
import TopClients from "./TopClients"
import Menu from "./Menu.jsx"
import MesCommandes from "./MesCommandes"
import Fidelite from "./Fidelite"
import StatCard from "./StatCard.jsx"

export default function Dashboard({ user }) {
  const [isOpen, setIsOpen] = useState(true)
  const [activePage, setActivePage] = useState("dashboard")
  const [cartCount] = useState(3)

  const displayName = user?.name || "Marie Segment"
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  const menuItems = [
    { icon: RiDashboardLine, label: "Tableau de bord", key: "dashboard" },
    { icon: RiShoppingCart2Line, label: "Menu", key: "menu" },
    { icon: RiShoppingCart2Line, label: "Panier", key: "panier" },
    { icon: RiFileList3Line, label: "Mes Commandes", key: "commandes" },
    { icon: RiStarFill, label: "Fidélité & Parrainage", key: "fidelite" },
    { icon: RiFileList3Line, label: "Réclamations", key: "reclamations" },
    { icon: RiGiftLine, label: "Mini-jeux", key: "miniJeux" },
    { icon: RiSettings4Line, label: "Paramètres", key: "parametres" },
    { icon: RiStarFill, label: "Top Clients", key: "topClients" },
  ]

  const promotions = [
    {
      id: 1,
      name: "Pizza Margherita",
      description: "Tomate, Mozzarella, Basilic frais",
      originalPrice: "45.00€",
      discountedPrice: "12.00€",
      discount: "20%",
    }
  ]

  const evenements = [
    {
      id: 1,
      title: "Jeu Concours",
      description: "Gagnez un repas gratuit ! Tentez votre chance maintenant.",
      buttonText: "Participer"
    },
    {
      id: 2,
      title: "Menu Spécial",
      description: "Découvrez notre menu spécial étudiant jusqu'au 31 mars.",
      buttonText: "Découvrir"
    }
  ]

  const renderContent = () => {
    switch (activePage) {
      case "dashboard":
        return (
          <div className="container py-5">
            <div className="row">
              <div className="col-12">
                <div
                  className="card border-0 shadow-sm mb-4"
                  style={{ background: "linear-gradient(135deg, #D4C4A8 0%, #c4b498 100%)" }}
                >
                  <div className="card-body text-white p-5">
                    <h1 className="display-4 mb-3">Bonjour {displayName.split(" ")[0]} !</h1>
                    <p className="lead mb-4">Il est temps de savourer de délicieux plats</p>
                    <button className="btn btn-light btn-lg" onClick={() => setActivePage("menu")}>
                      <i className="bi bi-cart me-2"></i>
                      Voir le Menu
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Cartes de statistiques */}
            <div className="row g-4 mb-4">
              <StatCard icon={<i className="bi bi-star-fill text-warning fs-3 me-3"></i>} title="Points Fidélité" value="1,250" />
              <StatCard icon={<i className="bi bi-cart-check text-success fs-3 me-3"></i>} title="Commandes" value="23" />
              <StatCard icon={<i className="bi bi-people text-primary fs-3 me-3"></i>} title="Filleuls" value="5" />
            </div>

            {/* Nouvelles sections : Promotions, Événements et Fidélité */}
            <div className="row g-4 mb-4">
              {/* Colonne de gauche - Promotions */}
              <div className="col-md-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-header bg-white border-0">
                    <h5 className="mb-0">Promotions du Jour</h5>
                  </div>
                  <div className="card-body">
                    {promotions.map(promo => (
                      <div key={promo.id} className="promotion-card p-3 mb-3 border rounded">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="fw-bold mb-0">{promo.name}</h6>
                          <span className="badge bg-danger">{promo.discount}</span>
                        </div>
                        <p className="text-muted small mb-2">{promo.description}</p>
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <span className="text-decoration-line-through text-muted me-2">{promo.originalPrice}</span>
                            <span className="fw-bold text-primary">{promo.discountedPrice}</span>
                          </div>
                          <button className="btn btn-primary-custom btn-sm" 
                                  style={{ backgroundColor: "#D4C4A8", borderColor: "#D4C4A8" }}>
                            Ajouter
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Colonne de droite - Événements et Fidélité */}
              <div className="col-md-6">
                {/* Événements */}
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-header bg-white border-0">
                    <h5 className="mb-0">Événements</h5>
                  </div>
                  <div className="card-body">
                    {evenements.map(event => (
                      <div key={event.id} className="event-card p-3 mb-3 border rounded">
                        <h6 className="fw-bold mb-2">{event.title}</h6>
                        <p className="text-muted small mb-3">{event.description}</p>
                        <button className="btn btn-outline-primary-custom btn-sm w-100"
                                style={{ borderColor: "#D4C4A8", color: "#D4C4A8" }}>
                          {event.buttonText}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Programme de Fidélité */}
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-white border-0">
                    <h5 className="mb-0">Programme de Fidélité</h5>
                  </div>
                  <div className="card-body">
                    <div className="fidelite-stats text-center">
                      <div className="row mb-3">
                        <div className="col-4">
                          <div className="fidelite-item">
                            <div className="fw-bold fs-4">1,250</div>
                            <div className="text-muted small">Points accumulés</div>
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="fidelite-item">
                            <div className="fw-bold fs-4">5</div>
                            <div className="text-muted small">Filleuls parrainés</div>
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="fidelite-item">
                            <div className="fw-bold fs-4">450FCFA</div>
                            <div className="text-muted small">Prochaine récompense</div>
                          </div>
                        </div>
                      </div>
                      <div className="progress mb-3" style={{ height: "8px" }}>
                        <div 
                          className="progress-bar" 
                          style={{ 
                            backgroundColor: "#D4C4A8",
                            width: "83%" // 1250/1500 * 100
                          }}
                        ></div>
                      </div>
                      <small className="text-muted">Repas gratuit à 1500 pts</small>
                      <div className="mt-3">
                        <button className="btn btn-primary-custom btn-sm me-2"
                                style={{ backgroundColor: "#D4C4A8", borderColor: "#D4C4A8" }}>
                          Utiliser mes points
                        </button>
                        <button className="btn btn-outline-primary-custom btn-sm"
                                style={{ borderColor: "#D4C4A8", color: "#D4C4A8" }}>
                          Inviter des amis
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Commandes Récentes et Actions Rapides */}
            <div className="row g-4 mb-4">
              <div className="col-md-8">
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Commandes Récentes</h5>
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => setActivePage("commandes")}>
                      Voir tout
                    </button>
                  </div>
                  <div className="card-body">
                    <div className="list-group list-group-flush">
                      <div className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                          <div className="d-flex align-items-center mb-1">
                            <i className="bi bi-check-circle-fill text-success me-2"></i>
                            <strong>Commande #1023</strong>
                          </div>
                          <small className="text-muted">Pizza Margherita, Coca Cola</small>
                        </div>
                        <div className="text-end">
                          <div className="text-primary-custom fw-bold">1850 FCFA</div>
                          <span className="badge bg-success">Livrée</span>
                        </div>
                      </div>
                      <div className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                          <div className="d-flex align-items-center mb-1">
                            <i className="bi bi-clock text-warning me-2"></i>
                            <strong>Commande #1022</strong>
                          </div>
                          <small className="text-muted">Burger, Frites, Sprite</small>
                        </div>
                        <div className="text-end">
                          <div className="text-primary-custom fw-bold">1500 FCFA</div>
                          <span className="badge bg-warning">En préparation</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-header bg-white border-0">
                    <h5 className="mb-0">Actions Rapides</h5>
                  </div>
                  <div className="card-body">
                    <div className="d-grid gap-2">
                      <button
                        className="btn btn-primary-custom btn-lg"
                        style={{ backgroundColor: "#D4C4A8", borderColor: "#D4C4A8" }}
                        onClick={() => setActivePage("menu")}
                      >
                        <i className="bi bi-cart-plus me-2"></i>
                        Passer Commande
                      </button>
                      <button className="btn btn-outline-secondary" onClick={() => setActivePage("commandes")}>
                        <i className="bi bi-box-seam me-2"></i>
                        Mes Commandes
                      </button>
                      <button className="btn btn-outline-secondary" onClick={() => setActivePage("fidelite")}>
                        <i className="bi bi-star me-2"></i>
                        Mes Points
                      </button>
                      <button className="btn btn-outline-secondary" onClick={() => setActivePage("miniJeux")}>
                        <i className="bi bi-controller me-2"></i>
                        Mini-jeux
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      case "menu":
        return <Menu />
      case "panier":
        return <Panier onCheckout={() => setActivePage("paiement")} />
      case "commandes":
        return <MesCommandes />
      case "fidelite":
        return <Fidelite />
      case "reclamations":
        return <Reclamations />
      case "miniJeux":
        return <MiniJeux />
      case "parametres":
        return <Parametres />
      case "topClients":
        return <TopClients />
      case "paiement":
        return <Paiement onBack={() => setActivePage("panier")} />
      default:
        return <div>Page non trouvée</div>
    }
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <div className="user-profile">
            <div className="avatar">{initials}</div>
            {isOpen && (
              <div className="user-info">
                <div className="user-name">{displayName}</div>
                <div className="user-role">Étudiante</div>
              </div>
            )}
          </div>
          {isOpen && (
            <div className="loyalty-card">
              <div className="loyalty-header">
                <span>Points Fidélité</span>
                <RiStarFill className="star-icon" />
              </div>
              <div className="loyalty-points">1,250</div>
            </div>
          )}
        </div>

        <div className="sidebar-title">{isOpen ? "MON DASHBOARD" : "🏠"}</div>

        {menuItems.map((item) => (
          <div
            key={item.key}
            className={`sidebar-item ${activePage === item.key ? "active" : ""}`}
            onClick={() => setActivePage(item.key)}
          >
            <item.icon size={20} />
            {isOpen && <span>{item.label}</span>}
          </div>
        ))}

        <div className="sidebar-footer">
          <button className="logout-btn">
            <span>🚪</span>
            {isOpen && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Zone principale */}
      <main className={`main-content ${isOpen ? "" : "closed"}`}>
        <button className="toggle-btn" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? "◀" : "▶"}
        </button>
        {renderContent()}
      </main>
    </div>
  )
}
