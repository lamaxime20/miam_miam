import React, { useState, useEffect } from 'react';
import { Modal, Button, Spinner, ListGroup, Alert } from 'react-bootstrap';
import { getLivreursDisponibles, assignerLivreur } from '../pages/employer/views/commande';

/**
 * Modale pour choisir un livreur pour une commande.
 * @param {object} props
 * @param {boolean} props.isOpen - Indique si la modale est ouverte.
 * @param {function} props.onClose - Fonction pour fermer la modale.
 * @param {object} props.commande - La commande pour laquelle choisir un livreur.
 * @param {function} props.onSuccess - Callback appelé quand un livreur est assigné avec succès.
 * @param {function} props.onError - Callback appelé en cas d'erreur.
 */
function ChoixLivreurCommande({ isOpen, onClose, commande, onSuccess, onError }) {
    const [livreurs, setLivreurs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedLivreur, setSelectedLivreur] = useState(null);
    const [assigning, setAssigning] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadLivreurs();
        }
    }, [isOpen]);

    const loadLivreurs = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getLivreursDisponibles();
            setLivreurs(data);
        } catch (err) {
            setError('Erreur lors du chargement des livreurs disponibles');
            console.error('Erreur:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectLivreur = (livreur) => {
        setSelectedLivreur(livreur);
    };

    const handleConfirmer = async () => {
        if (!selectedLivreur) return;

        try {
            setAssigning(true);
            setError(null);

            await assignerLivreur(commande.id_commande, selectedLivreur.id);
            
            if (onSuccess) {
                onSuccess(selectedLivreur);
            }
            
            onClose();
        } catch (err) {
            setError('Erreur lors de l\'assignation du livreur');
            console.error('Erreur:', err);
            
            // L'erreur sera gérée par le composant parent via onError

            if (onError) {
                onError(err);
            }
        } finally {
            setAssigning(false);
        }
    };

    const handleCancel = () => {
        onClose();
    };

    return (
        <Modal show={isOpen} onHide={handleCancel} centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Choisir un livreur pour la commande #{commande?.id_commande}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && (
                    <Alert variant="danger" className="mb-3">
                        {error}
                    </Alert>
                )}

                {loading ? (
                    <div className="text-center p-4">
                        <Spinner animation="border" variant="warning" />
                        <p className="mt-2 text-muted">Chargement des livreurs disponibles...</p>
                    </div>
                ) : livreurs.length === 0 ? (
                    <Alert variant="warning">
                        Aucun livreur disponible pour le moment.
                    </Alert>
                ) : (
                    <ListGroup>
                        {livreurs.map(livreur => (
                            <ListGroup.Item
                                key={livreur.id}
                                action
                                active={selectedLivreur?.id === livreur.id}
                                onClick={() => handleSelectLivreur(livreur)}
                                className="d-flex justify-content-between align-items-center"
                            >
                                <div>
                                    <h6 className="mb-0">{livreur.nom}</h6>
                                    <small className="text-muted">{livreur.tel}</small>
                                </div>
                                <div className="text-warning">
                                    {Array.from({ length: 5 }, (_, i) => (
                                        <i
                                            key={i}
                                            className={`bi bi-star${i < Math.floor(livreur.evaluation) ? '-fill' : i < livreur.evaluation ? '-half' : ''}`}
                                        />
                                    ))}
                                    <small className="ms-1">({livreur.evaluation})</small>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleCancel} disabled={assigning}>
                    Annuler
                </Button>
                <Button
                    variant="success"
                    onClick={handleConfirmer}
                    disabled={!selectedLivreur || assigning}
                >
                    {assigning ? (
                        <>
                            <Spinner as="span" animation="border" size="sm" className="me-2" />
                            Assignation en cours...
                        </>
                    ) : (
                        'Confirmer le livreur'
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ChoixLivreurCommande;