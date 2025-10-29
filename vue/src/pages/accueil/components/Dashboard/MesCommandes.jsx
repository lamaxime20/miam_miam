import { useState } from "react";
import { FaClock, FaCheckCircle, FaTimesCircle, FaBoxOpen, FaRedoAlt, FaEye } from "react-icons/fa";
import 'bootstrap/dist/css/bootstrap.min.css';

const orders = [
  { id: 1, orderNumber: "#1023", date: "21 Oct 2025, 14:30", status: "delivered", items: ["Pizza Margherita", "Coca Cola"], total: 1850, deliveryAddress: "12 Avenue des Champs, Dakar" },
  { id: 2, orderNumber: "#1022", date: "21 Oct 2025, 12:15", status: "preparing", items: ["Burger Classique", "Frites", "Sprite"], total: 1500, deliveryAddress: "12 Avenue des Champs, Dakar" },
  { id: 3, orderNumber: "#1021", date: "20 Oct 2025, 19:45", status: "delivered", items: ["Sushi Mix", "Salade César"], total: 2900, deliveryAddress: "12 Avenue des Champs, Dakar" },
];

const statusConfig = {
  pending: { label: "En attente", color: "text-dark", icon: FaClock, bg: "bg-light" },
  preparing: { label: "En préparation", color: "text-warning", icon: FaClock, bg: "bg-light" },
  delivering: { label: "En livraison", color: "text-primary", icon: FaBoxOpen, bg: "bg-light" },
  delivered: { label: "Livrée", color: "text-success", icon: FaCheckCircle, bg: "bg-light" },
  cancelled: { label: "Annulée", color: "text-danger", icon: FaTimesCircle, bg: "bg-light" },
};

function MesCommandes() {
  const [filter, setFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filteredOrders = orders.filter((order) => {
    if (filter === "active") return ["pending", "preparing", "delivering"].includes(order.status);
    if (filter === "completed") return ["delivered", "cancelled"].includes(order.status);
    return true;
  });

  return (
    <div className="container py-5" style={{ backgroundColor: "#000000", minHeight: "100vh" }}>
      <h1 className="text-white mb-3">Mes Commandes</h1>
      <p className="text-white-50">Suivez l'historique de vos commandes</p>

      <div className="mb-4">
        <button className={`me-2 btn ${filter === "all" ? "btn-warning text-white" : "btn-outline-light"}`} onClick={() => setFilter("all")}>
          Toutes ({orders.length})
        </button>
        <button className={`me-2 btn ${filter === "active" ? "btn-warning text-white" : "btn-outline-light"}`} onClick={() => setFilter("active")}>
          En cours ({orders.filter(o => ["pending", "preparing", "delivering"].includes(o.status)).length})
        </button>
        <button className={`btn ${filter === "completed" ? "btn-warning text-white" : "btn-outline-light"}`} onClick={() => setFilter("completed")}>
          Terminées ({orders.filter(o => ["delivered", "cancelled"].includes(o.status)).length})
        </button>
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center text-white mt-5">
          <FaBoxOpen size={50} className="mb-3" />
          <h3>Aucune commande</h3>
          <p>Vous n'avez pas encore passé de commande</p>
        </div>
      )}

      {filteredOrders.map(order => {
        const statusInfo = statusConfig[order.status];
        const StatusIcon = statusInfo.icon;
        return (
          <div key={order.id} className="card mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <h5>Commande {order.orderNumber}</h5>
                  <small className="text-muted">{order.date}</small>
                  <div className={`badge ${statusInfo.color} mt-2`} style={{ backgroundColor: "#cfbd97", color: "#000" }}>
                    <StatusIcon className="me-1" />
                    {statusInfo.label}
                  </div>
                </div>
                <div className="text-end">
                  <div className="fw-bold mb-2">{order.total} FCFA</div>
                  <button className="btn btn-sm btn-outline-dark" onClick={() => setSelectedOrder(order)}>
                    <FaEye className="me-1" /> Détails
                  </button>
                </div>
              </div>

              <p className="mb-1"><strong>Articles:</strong> {order.items.join(", ")}</p>

              {order.status === "delivered" && (
                <button className="btn btn-warning btn-sm mt-2">
                  <FaRedoAlt className="me-1" /> Recommander
                </button>
              )}

              {(["pending", "preparing", "delivering"]).includes(order.status) && (
                <div className="progress mt-3" style={{ height: "8px" }}>
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{
                      width: order.status === "pending" ? "33%" :
                             order.status === "preparing" ? "66%" : "100%",
                      backgroundColor: "#cfbd97",
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}

      {selectedOrder && (
        <div className="modal show d-block" tabIndex="-1" onClick={() => setSelectedOrder(null)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Détails de la commande {selectedOrder.orderNumber}</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedOrder(null)}></button>
              </div>
              <div className="modal-body">
                <p><strong>Date:</strong> {selectedOrder.date}</p>
                <p><strong>Articles:</strong></p>
                <ul>
                  {selectedOrder.items.map((item, idx) => <li key={idx}>{item}</li>)}
                </ul>
                <p><strong>Adresse de livraison:</strong> {selectedOrder.deliveryAddress}</p>
                <p><strong>Total:</strong> {selectedOrder.total} FCFA</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-warning" onClick={() => setSelectedOrder(null)}>Fermer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MesCommandes;
