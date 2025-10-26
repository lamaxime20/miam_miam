import { useState, useEffect } from "react"
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
import ViewCommande from "./ViewCommande"
import { 
  getDashboardStats, 
  getCommandesRecentes, 
  getDetailsFidelite, 
  getPromotionsActives, 
  getNotificationsClient,
  marquerNotificationLue,
  getTopClients
} from "../../../../services/Menu.js"

export default function Dashboard({ user }) {
  const [isOpen, setIsOpen] = useState(true)
  const [activePage, setActivePage] = useState("dashboard")
  const [cartCount] = useState(3)
  
  // États pour les données du backend
  const [dashboardStats, setDashboardStats] = useState({
    points_fidelite: 0,
    nombre_commandes: 0,
    nombre_filleuls: 0
  })
  const [commandesRecentes, setCommandesRecentes] = useState([])
  const [detailsFidelite, setDetailsFidelite] = useState({
    points_actuels: 0,
    points_pour_repas_gratuit: 1500,
    pourcentage_progression: 0,
    nombre_filleuls: 0
  })
  const [promotions, setPromotions] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const displayName = user?.name || "Marie Segment"
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  // ID du client (à adapter selon votre logique d'authentification)
  const clientId = user?.id || 1

  // Chargement des données au montage du composant
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        
        // Chargement parallèle de toutes les données
        const [
          stats,
          commandes,
          fidelite,
          promotionsData,
          notificationsData
        ] = await Promise.all([
          getDashboardStats(clientId),
          getCommandesRecentes(clientId, 5),
          getDetailsFidelite(clientId),
          getPromotionsActives(),
          getNotificationsClient(clientId)
        ])

        setDashboardStats(stats)
        setCommandesRecentes(commandes)
        setDetailsFidelite(fidelite)
        setPromotions(promotionsData)
        setNotifications(notificationsData)
      } catch (error) {
        console.error("Erreur lors du chargement des données du dashboard :", error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [clientId])

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

  // Fonction pour formater le prix
  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(price)
  }

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

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
              <StatCard 
                icon={<i className="bi bi-star-fill text-warning fs-3 me-3"></i>} 
                title="Points Fidélité" 
                value={loading ? "..." : dashboardStats.points_fidelite?.toLocaleString() || "0"} 
              />
              <StatCard 
                icon={<i className="bi bi-cart-check text-success fs-3 me-3"></i>} 
                title="Commandes" 
                value={loading ? "..." : dashboardStats.nombre_commandes?.toString() || "0"} 
              />
              <StatCard 
                icon={<i className="bi bi-people text-primary fs-3 me-3"></i>} 
                title="Filleuls" 
                value={loading ? "..." : dashboardStats.nombre_filleuls?.toString() || "0"} 
              />
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
                    {loading ? (
                      <div className="text-center py-3">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Chargement...</span>
                        </div>
                      </div>
                    ) : promotions.length > 0 ? (
                      promotions.map(promo => (
                        <div key={promo.id_promo} className="promotion-card p-3 mb-3 border rounded">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className="fw-bold mb-0">{promo.nom_menu || promo.titre}</h6>
                            <span className="badge bg-danger">{promo.pourcentage_reduction}%</span>
                          </div>
                          <p className="text-muted small mb-2">{promo.description_promotion}</p>
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <span className="text-decoration-line-through text-muted me-2">
                                {formatPrice(promo.prix_original)}
                              </span>
                              <span className="fw-bold text-primary">
                                {formatPrice(promo.prix_reduit)}
                              </span>
                            </div>
                            <button className="btn btn-primary-custom btn-sm" 
                                    style={{ backgroundColor: "#D4C4A8", borderColor: "#D4C4A8" }}>
                              Ajouter
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted py-3">
                        <i className="bi bi-gift fs-1 mb-2"></i>
                        <p>Aucune promotion disponible</p>
                      </div>
                    )}
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
                    {loading ? (
                      <div className="text-center py-3">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Chargement...</span>
                        </div>
                      </div>
                    ) : notifications.length > 0 ? (
                      notifications.slice(0, 2).map(notification => (
                        <div key={notification.id_notification} className="event-card p-3 mb-3 border rounded">
                          <h6 className="fw-bold mb-2">{notification.nom_restaurant}</h6>
                          <p className="text-muted small mb-3">{notification.message_notification}</p>
                          <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">{formatDate(notification.date_notif)}</small>
                            <button 
                              className="btn btn-outline-primary-custom btn-sm"
                              style={{ borderColor: "#D4C4A8", color: "#D4C4A8" }}
                              onClick={() => marquerNotificationLue(notification.id_notification, clientId)}
                            >
                              {notification.ouvert ? "Lu" : "Marquer lu"}
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted py-3">
                        <i className="bi bi-bell fs-1 mb-2"></i>
                        <p>Aucun événement disponible</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Programme de Fidélité */}
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-white border-0">
                    <h5 className="mb-0">Programme de Fidélité</h5>
                  </div>
                  <div className="card-body">
                    {loading ? (
                      <div className="text-center py-3">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Chargement...</span>
                        </div>
                      </div>
                    ) : (
                      <div className="fidelite-stats text-center">
                        <div className="row mb-3">
                          <div className="col-4">
                            <div className="fidelite-item">
                              <div className="fw-bold fs-4">{detailsFidelite.points_actuels?.toLocaleString() || "0"}</div>
                              <div className="text-muted small">Points accumulés</div>
                            </div>
                          </div>
                          <div className="col-4">
                            <div className="fidelite-item">
                              <div className="fw-bold fs-4">{detailsFidelite.nombre_filleuls || "0"}</div>
                              <div className="text-muted small">Filleuls parrainés</div>
                            </div>
                          </div>
                        </div>
                        <div className="progress mb-3" style={{ height: "8px" }}>
                          <div 
                            className="progress-bar" 
                            style={{ 
                              backgroundColor: "#D4C4A8",
                              width: `${detailsFidelite.pourcentage_progression || 0}%`
                            }}
                          ></div>
                        </div>
                        <small className="text-muted">
                          Repas gratuit à {detailsFidelite.points_pour_repas_gratuit} pts
                        </small>
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
                    )}
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
                    {loading ? (
                      <div className="text-center py-3">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Chargement...</span>
                        </div>
                      </div>
                    ) : commandesRecentes.length > 0 ? (
                      <div className="list-group list-group-flush">
                        {commandesRecentes.map(commande => (
                          <div key={commande.id_commande} className="list-group-item d-flex justify-content-between align-items-center">
                            <div>
                              <div className="d-flex align-items-center mb-1">
                                <i className={`bi ${
                                  commande.statut_commande === 'validée' ? 'bi-check-circle-fill text-success' :
                                  commande.statut_commande === 'en_cours' ? 'bi-clock text-warning' :
                                  'bi-x-circle-fill text-danger'
                                } me-2`}></i>
                                <strong>Commande #{commande.id_commande}</strong>
                              </div>
                              <small className="text-muted">{commande.liste_menus}</small>
                              <br />
                              <small className="text-muted">{commande.nom_restaurant}</small>
                            </div>
                            <div className="text-end">
                              <div className="text-primary-custom fw-bold">{formatPrice(commande.montant_total)}</div>
                              <span className={`badge ${
                                commande.statut_commande === 'validée' ? 'bg-success' :
                                commande.statut_commande === 'en_cours' ? 'bg-warning' :
                                'bg-danger'
                              }`}>
                                {commande.statut_commande === 'validée' ? 'Livrée' :
                                 commande.statut_commande === 'en_cours' ? 'En cours' :
                                 'Annulée'}
                              </span>
                              <br />
                              <small className="text-muted">{formatDate(commande.date_commande)}</small>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-muted py-3">
                        <i className="bi bi-box-seam fs-1 mb-2"></i>
                        <p>Aucune commande récente</p>
                      </div>
                    )}
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
        return <Panier onCheckout={() => setActivePage("viewCommande")} />
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
      case "viewCommande":
        return <ViewCommande onBack={() => setActivePage("panier")} />
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
              <div className="loyalty-points">
                {loading ? "..." : dashboardStats.points_fidelite?.toLocaleString() || "0"}
              </div>
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
