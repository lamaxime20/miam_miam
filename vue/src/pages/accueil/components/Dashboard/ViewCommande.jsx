import React from 'react';

export default function ViewCommande({ onBack }) {
  return (
    <div className="container py-5" style={{ backgroundColor: "#000000", minHeight: "100vh" }}>
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header bg-dark text-white">
              <h4 className="mb-0">📋 Vue de la Commande</h4>
            </div>
            <div className="card-body">
              <div className="text-center py-5">
                <h5 className="text-muted">Page de visualisation de la commande</h5>
                <p className="text-muted">Cette page sera développée prochainement...</p>
                
                <button 
                  className="btn btn-secondary mt-3"
                  onClick={onBack}
                >
                  ← Retour au panier
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
