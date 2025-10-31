import { useState } from "react";
import { MessageSquare, Send, FileText, Image as ImageIcon, Clock, CheckCircle } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";

const claims = [
  { id: 1, subject: "Commande incomplète", orderNumber: "#1021", date: "20 Oct 2025", status: "resolved", category: "Problème de commande", description: "Il manquait la salade dans ma commande", response: "Nous sommes désolés pour ce désagrément. Un avoir de 900 FCFA a été crédité sur votre compte." },
  { id: 2, subject: "Retard de livraison", orderNumber: "#1019", date: "18 Oct 2025", status: "in-progress", category: "Livraison", description: "La livraison a pris plus de 2 heures" },
];

const categories = ["Problème de commande","Livraison","Qualité du produit","Paiement","Application","Autre"];

export default function Reclamations() {
  const [activeTab, setActiveTab] = useState("new");
  const [formData, setFormData] = useState({ orderNumber: "", category: "", subject: "", description: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Claim submitted:", formData);
    setFormData({ orderNumber: "", category: "", subject: "", description: "" });
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "open": return { label: "Ouverte", color: "text-primary", bg: "bg-primary bg-opacity-10", icon: Clock };
      case "in-progress": return { label: "En cours", color: "text-warning", bg: "bg-warning bg-opacity-10", icon: Clock };
      case "resolved": return { label: "Résolue", color: "text-success", bg: "bg-success bg-opacity-10", icon: CheckCircle };
      default: return { label: "Ouverte", color: "text-secondary", bg: "bg-secondary bg-opacity-10", icon: Clock };
    }
  };

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h1>Réclamations & Support</h1>
        <p className="text-muted">Nous sommes là pour vous aider</p>
      </div>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "new" ? "active" : ""}`} onClick={() => setActiveTab("new")}>Nouvelle réclamation</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "history" ? "active" : ""}`} onClick={() => setActiveTab("history")}>Historique ({claims.length})</button>
        </li>
      </ul>

      {activeTab === "new" ? (
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card shadow-sm p-4">
              <h4 className="mb-3">Déposer une réclamation</h4>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Numéro de commande (optionnel)</label>
                  <input type="text" className="form-control" placeholder="Ex: #1023" value={formData.orderNumber} onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Catégorie *</label>
                  <select className="form-select" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required>
                    <option value="">Sélectionnez une catégorie</option>
                    {categories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Sujet *</label>
                  <input type="text" className="form-control" placeholder="Résumez votre problème" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description *</label>
                  <textarea className="form-control" rows={5} placeholder="Décrivez votre problème" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Pièces jointes (optionnel)</label>
                  <div className="border border-dashed border-secondary rounded p-4 text-center">
                    <ImageIcon size={32} className="text-secondary mb-2" />
                    <div>PNG, JPG jusqu'à 5MB</div>
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary flex-grow-1 d-flex align-items-center gap-2 justify-content-center">
                    <Send size={16} />
                    Envoyer
                  </button>
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setFormData({ orderNumber: "", category: "", subject: "", description: "" })}>Annuler</button>
                </div>
              </form>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card shadow-sm p-3 mb-3">
              <h5>Besoin d'aide ?</h5>
              <ul className="list-unstyled mt-3">
                <li className="d-flex align-items-start mb-2"><MessageSquare size={18} className="text-primary me-2" /><div><div>Chat en direct</div><small className="text-muted">Lun-Ven: 9h-18h</small></div></li>
                <li className="d-flex align-items-start mb-2"><span className="me-2">📞</span><div><div>Téléphone</div><small className="text-muted">+221 33 123 45 67</small></div></li>
                <li className="d-flex align-items-start"><span className="me-2">✉️</span><div><div>Email</div><small className="text-muted">support@monmiammiam.sn</small></div></li>
              </ul>
            </div>
            <div className="card p-3 bg-light text-center">
              <FileText size={24} className="text-primary mb-2" />
              <h6>FAQ</h6>
              <p className="small">Consultez notre FAQ pour trouver rapidement des réponses</p>
              <button className="btn btn-link p-0">Voir la FAQ →</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="row g-3">
          {claims.length === 0 && (
            <div className="col-12 text-center py-5">
              <MessageSquare size={48} className="text-secondary mb-3" />
              <h5>Aucune réclamation</h5>
              <p className="text-muted">Vous n'avez pas encore déposé de réclamation</p>
            </div>
          )}
          {claims.map((claim) => {
            const statusInfo = getStatusConfig(claim.status);
            const StatusIcon = statusInfo.icon;
            return (
              <div key={claim.id} className="col-12 card p-3 shadow-sm">
                <div className="d-flex justify-content-between mb-2">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <h5 className="mb-0">{claim.subject}</h5>
                      <span className={`badge ${statusInfo.bg} ${statusInfo.color} d-flex align-items-center gap-1`}>
                        <StatusIcon size={14} /> {statusInfo.label}
                      </span>
                    </div>
                    <small className="text-muted">Commande {claim.orderNumber} • {claim.category} • {claim.date}</small>
                  </div>
                  <MessageSquare size={18} className="text-secondary" />
                </div>
                <div className="border rounded p-2 mb-2 bg-light">
                  <div className="text-muted small mb-1">Votre message:</div>
                  <p className="mb-0">{claim.description}</p>
                </div>
                {claim.response && (
                  <div className="border-start border-success ps-2 bg-success bg-opacity-10 p-2 mb-2">
                    <div className="d-flex align-items-center gap-1 text-success mb-1"><CheckCircle size={16} /> Réponse de notre équipe:</div>
                    <p className="mb-0">{claim.response}</p>
                  </div>
                )}
                {claim.status === "in-progress" && (
                  <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary flex-grow-1">Ajouter un message</button>
                    <button className="btn btn-outline-danger">Clôturer</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
