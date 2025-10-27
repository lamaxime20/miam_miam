import { FaEye, FaRedoAlt, FaBoxOpen } from "react-icons/fa";
import 'bootstrap/dist/css/bootstrap.min.css';

/**
 * Affiche une carte résumant une commande.
 * @param {object} props
 * @param {object} props.order - L'objet commande contenant les détails.
 * @param {object} props.statusConfig - L'objet de configuration pour les statuts de commande.
 * @param {function} props.onSelectOrder - La fonction à appeler pour afficher les détails de la commande.
 */
function CommandeCard({ order, statusConfig, onSelectOrder, onCancelOrder, isCancelling }) {
    // Si pas de commande fournie, ne pas tenter de rendre
    if (!order) return null;
    console.log(order);

    // Essayer plusieurs formes de la clé de statut (exacte, minuscule) puis fallback
    const rawStatus = order.status || "";
    const normalized = String(rawStatus).toLowerCase();
    const statusInfo = statusConfig[rawStatus] || statusConfig[normalized] || null;

    // Si pas de configuration de statut, utiliser un fallback pour toujours afficher la carte
    const fallback = { label: rawStatus || "Inconnu", color: "text-secondary", icon: FaBoxOpen, bg: "bg-light" };
    const effectiveStatus = statusInfo || fallback;

    const StatusIcon = effectiveStatus.icon || (() => null);

    // Calcul pour bouton annuler : si la commande a été passée il y a moins d'1 heure
    let canCancel = false;
    try {
        const dateSource = order.dateISO || order.date || null;
        if (dateSource) {
            const orderTime = new Date(dateSource).getTime();
            const diff = Date.now() - orderTime; // ms
            const ONE_HOUR = 60 * 60 * 1000;
            // Autoriser annulation uniquement si la commande a été passée il y a moins d'1 heure
            canCancel = diff >= 0 && diff <= ONE_HOUR && !["livré", "annulé"].includes(normalized);
        }
    } catch (e) {
        console.warn('Erreur calcul annulation:', e);
        canCancel = false;
    }

    return (
        <div className="card mb-4">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                        <h5>Commande {order.orderNumber}</h5>
                        <small className="text-muted">{order.date}</small>
                        <div className={`badge ${effectiveStatus.color} mt-2`} style={{ backgroundColor: "#cfbd97", color: "#000" }}>
                            <StatusIcon className="me-1" />
                            {effectiveStatus.label}
                        </div>
                    </div>
                    <div className="text-end">
                        <div className="fw-bold mb-2">{order.total} FCFA</div>
                        <button className="btn btn-sm btn-outline-dark" onClick={() => onSelectOrder(order)}>
                            <FaEye className="me-1" /> Détails
                        </button>
                        {canCancel && (
                            <button className="btn btn-sm btn-danger ms-2" onClick={() => onCancelOrder && onCancelOrder(order)} disabled={isCancelling}>
                                {isCancelling ? 'Annulation...' : 'Annuler'}
                            </button>
                        )}
                    </div>
                </div>

                <p className="mb-1"><strong>Articles:</strong> {Array.isArray(order.items) ? order.items.join(", ") : (order.items || '—')}</p>

                {(["pending", "preparing", "delivering"]).includes(normalized) && (
                    <div className="progress mt-3" style={{ height: "8px" }}>
                        <div className="progress-bar" role="progressbar" style={{ width: normalized === "pending" ? "33%" : normalized === "preparing" ? "66%" : "100%", backgroundColor: "#cfbd97" }} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default CommandeCard;