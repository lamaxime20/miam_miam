import { useState, useEffect } from "react";
import { FaClock, FaCheckCircle, FaTimesCircle, FaBoxOpen } from "react-icons/fa";
import 'bootstrap/dist/css/bootstrap.min.css';
import CommandeCard from "./CommandeCard";
import { getCommandesUtilisateur, getAuthInfo, getUserByEmail } from "../../../../services/user";
import { Spinner } from "react-bootstrap";
const API_URL = import.meta.env.VITE_API_URL;

const statusConfig = {
  // Les clés correspondent aux statuts retournés par la fonction SQL get_commandes_by_user
  'initial': { label: "Non lue", color: "text-secondary", icon: FaClock, bg: "bg-light" },
  'en cours': { label: "En cours", color: "text-warning", icon: FaClock, bg: "bg-light" },
  'en cours de livraison': { label: "Livraison en cours", color: "text-primary", icon: FaBoxOpen, bg: "bg-light" },
  'livré': { label: "Livré", color: "text-success", icon: FaCheckCircle, bg: "bg-light" },
  'annulé': { label: "Annulé", color: "text-danger", icon: FaTimesCircle, bg: "bg-light" },
};

function MesCommandes() {
  let idKey = 0;
  const [orders, setOrders] = useState([]);
  const [cancellingIds, setCancellingIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchUserAndCommands = async () => {
      try {
        setLoading(true);
        const authInfo = getAuthInfo();
        if (!authInfo || !authInfo.display_name) {
          throw new Error("Utilisateur non authentifié. Veuillez vous reconnecter.");
        }

        const userData = await getUserByEmail(authInfo.display_name);
        if (!userData || !userData.id_user) {
          throw new Error("Impossible de récupérer les informations de l'utilisateur.");
        }

        const commandesData = await getCommandesUtilisateur(userData.id_user);
        console.log("Commandes fetch :", commandesData);

        // Transformation des données de l'API pour correspondre au format attendu par le frontend
        const formattedOrders = commandesData.map(cmd => {
          // liste_menus peut être un tableau d'objets (backend) ou une chaîne
          let items = [];
          let total = 0;

          if (Array.isArray(cmd.liste_menus)) {
            items = cmd.liste_menus.map(m => `${m.nom_menu} x${m.quantite}`);
            total = cmd.liste_menus.reduce((sum, m) => sum + (parseFloat(m.prix_total) || 0), 0);
          } else if (typeof cmd.liste_menus === 'string') {
            items = cmd.liste_menus.split(', ').map(s => s.trim()).filter(Boolean);
            total = cmd.montant_total || 0;
          } else {
            items = [];
            total = cmd.montant_total || 0;
          }

          // Normaliser le statut (ex: en_cours -> en cours)
          const rawStatus = (cmd.statut || '').toString().trim();
          // Conserver 'initial' tel quel pour matcher statusConfig['initial']
          let normalizedStatus = rawStatus === 'initial' ? 'initial' 
            : rawStatus.replace(/_/g, ' ').toLowerCase();
          // Corrections rapides (mais pas sur 'initial')
          if (normalizedStatus === 'livre') normalizedStatus = 'livré';
          if (normalizedStatus === 'annule') normalizedStatus = 'annulé';

          return {
            id: cmd.id_commande,
            orderNumber: `#${cmd.id_commande}`,
            // date de commande affichée
            date: new Date(cmd.date_commande || cmd.date_heure_livraison).toLocaleString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            dateISO: cmd.date_commande || cmd.date_heure_livraison,
            date_heure_livraison: cmd.date_heure_livraison || cmd.date_commande,
            status: normalizedStatus,
            items,
            total,
            deliveryAddress: cmd.localisation_client || 'Non spécifiée',
            localisation_client: cmd.localisation_client || '',
            type_localisation: cmd.type_localisation || 'inconnue'
          };
        });

        setOrders(formattedOrders);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndCommands();
  }, []);

      console.log("Order fetch :", orders);
  

  // La logique de filtrage est mise à jour pour correspondre aux nouveaux boutons
  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    return order.status === filter;
  });

  if (loading) {
    return (
      <div className="container py-5 text-center text-white" style={{ backgroundColor: "#000000", minHeight: "100vh" }}>
        <Spinner animation="border" variant="warning" />
        <p className="mt-2">Chargement de vos commandes...</p>
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ backgroundColor: "#000000", minHeight: "100vh" }}>
      <h1 className="text-white mb-3">Mes Commandes</h1>
      <p className="text-white-50 mb-4">Suivez l'historique de vos commandes</p>

      {/* Les boutons de filtre ont été remplacés */}
      <div className="mb-4 d-flex flex-wrap gap-2">
        <button className={`btn ${filter === 'all' ? 'btn-warning text-white' : 'btn-outline-light'}`} onClick={() => setFilter('all')}>Toutes</button>
        {Object.entries(statusConfig).map(([statusKey, { label }]) => (
          <button 
            key={statusKey} 
            className={`btn ${filter === statusKey ? 'btn-warning text-white' : 'btn-outline-light'}`} 
            onClick={() => setFilter(statusKey)}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="alert alert-danger">
          <p className="fw-bold">Erreur de chargement</p>
          {error}
        </div>
      )}

      {!loading && !error && filteredOrders.length === 0 && (
        <div className="text-center text-white mt-5">
          <FaBoxOpen size={50} className="mb-3" />
          <h3>Aucune commande trouvée</h3>
          <p>Il semble que vous n'ayez pas encore de commandes correspondant à ce filtre.</p>
        </div>
      )}

      {!error && filteredOrders.map(order => {
        const isCancelling = cancellingIds.includes(order.id);
        return <CommandeCard 
          key={idKey++} 
          order={order} 
          statusConfig={statusConfig} 
          onSelectOrder={setSelectedOrder}
          isCancelling={isCancelling}
          onCancelOrder={async (o) => {
            // Optimistic update: sauvegarde l'état courant, applique annulation UI, désactive bouton
            const prevOrders = orders;
            setOrders(prev => prev.map(item => item.id === o.id ? { ...item, status: 'annulé' } : item));
            setCancellingIds(prev => Array.from(new Set([...prev, o.id])));

            try {
              const dateSource = o.date_heure_livraison || o.dateISO || new Date().toISOString();
              const dateObj = new Date(dateSource);
              const date_heure_livraison = dateObj.toISOString().slice(0,19).replace('T',' ');

              const body = {
                date_heure_livraison,
                localisation_client: o.localisation_client || o.deliveryAddress || '',
                type_localisation: o.type_localisation || 'inconnue',
                statut_commande: 'annulé'
              };

              const res = await fetch(`${API_URL}api/updateCommande/${o.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(body)
              });

              if (!res.ok) {
                const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
                throw new Error(err.message || `Erreur HTTP ${res.status}`);
              }

              // Succès : retirer de la liste des en-cours
              setCancellingIds(prev => prev.filter(id => id !== o.id));
            } catch (err) {
              console.error('Erreur annulation commande :', err);
              // Rollback UI
              setOrders(prevOrders);
              setCancellingIds(prev => prev.filter(id => id !== o.id));
              alert('Impossible d\'annuler la commande : ' + (err.message || 'erreur serveur'));
            }
          }}
        />
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
