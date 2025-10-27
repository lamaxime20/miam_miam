import React from 'react';

/**
 * Fenêtre flottante pour finaliser les détails de la commande.
 * @param {Object} props
 * @param {boolean} props.isOpen - Indique si la modale est ouverte.
 * @param {function} props.onClose - Fonction pour fermer la modale.
 * @param {function} props.onSubmit - Fonction à appeler lors de la soumission.
 * @param {string} props.heureLivraison - Heure de livraison sélectionnée.
 * @param {function} props.setHeureLivraison - Setter pour l'heure de livraison.
 * @param {string} props.typeLocalisation - Type de localisation sélectionné.
 * @param {function} props.setTypeLocalisation - Setter pour le type de localisation.
 * @param {string} props.localisationEstimee - Localisation estimée par l'utilisateur.
 * @param {function} props.setLocalisationEstimee - Setter pour la localisation estimée.
 * @param {boolean} props.isSubmitting - Indique si la commande est en cours de soumission.
 * @param {string|null} props.error - Message d'erreur à afficher.
 */
export default function ViewCommandFloat({
    isOpen,
    onClose,
    onSubmit,
    heureLivraison,
    setHeureLivraison,
    typeLocalisation,
    setTypeLocalisation,
    localisationEstimee,
    setLocalisationEstimee,
    isSubmitting,
    error
}) {
    if (!isOpen) {
        return null;
    }

    const handleFormSubmit = (e) => {
        e.preventDefault();
        onSubmit();
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050
        }}>
            <div className="card text-white" style={{ backgroundColor: '#1a1a1a', width: '90%', maxWidth: '500px' }}>
                <div className="card-body">
                    <h5 className="card-title">Finaliser la Commande</h5>
                    <form onSubmit={handleFormSubmit}>
                        {/* Heure de livraison */}
                        <div className="mb-3">
                            <label htmlFor="heureLivraison" className="form-label">Heure de livraison souhaitée</label>
                            <input
                                type="time"
                                id="heureLivraison"
                                className="form-control bg-dark text-white"
                                value={heureLivraison}
                                onChange={(e) => setHeureLivraison(e.target.value)}
                                required
                            />
                        </div>

                        {/* Type de localisation */}
                        <div className="mb-3">
                            <p className="form-label">Type de localisation</p>
                            <div className="form-check">
                                <input className="form-check-input" type="radio" name="typeLocalisation" id="estimation" value="estimation" checked={typeLocalisation === 'estimation'} onChange={(e) => setTypeLocalisation(e.target.value)} />
                                <label className="form-check-label" htmlFor="estimation">Estimation</label>
                            </div>
                            <div className="form-check">
                                <input className="form-check-input" type="radio" name="typeLocalisation" id="googleMap" value="googleMap" checked={typeLocalisation === 'googleMap'} onChange={(e) => setTypeLocalisation(e.target.value)} />
                                <label className="form-check-label" htmlFor="googleMap">Google Map</label>
                            </div>
                        </div>

                        {/* Champ de texte pour l'estimation */}
                        {typeLocalisation === 'estimation' && (
                            <div className="mb-3">
                                <label htmlFor="localisationEstimee" className="form-label">Indiquez votre localisation</label>
                                <input
                                    type="text"
                                    id="localisationEstimee"
                                    className="form-control bg-dark text-white"
                                    value={localisationEstimee}
                                    onChange={(e) => setLocalisationEstimee(e.target.value)}
                                    placeholder="Ex: Yaoundé - Carrefour Biyem-Assi"
                                    required
                                />
                            </div>
                        )}

                        {error && <div className="alert alert-danger">{error}</div>}

                        <div className="d-flex justify-content-end gap-2">
                            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>Annuler</button>
                            <button type="submit" className="btn" style={{ backgroundColor: "#cfbd97", color: "#000000" }} disabled={isSubmitting}>
                                {isSubmitting ? 'Envoi...' : 'Commander'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}