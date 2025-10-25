"use client"

import { User, Bell, MapPin, CreditCard, Lock, Globe, HelpCircle, LogOut } from "lucide-react";
import { useState } from "react";

export default function Parametres() {
  const [profile, setProfile] = useState({
    name: "Marie Segment",
    email: "marie.segment@email.com",
    phone: "+221 77 123 45 67",
    birthdate: "1995-06-15",
  });

  const [addresses, setAddresses] = useState([
    { id: 1, name: "Domicile", address: "12 Avenue des Champs, Dakar", isDefault: true },
    { id: 2, name: "Bureau", address: "45 Rue de la République, Dakar", isDefault: false },
  ]);

  const [notifications, setNotifications] = useState({ orders: true, promotions: true, newsletter: false, sms: true });
  const [preferences, setPreferences] = useState({ language: "fr", currency: "FCFA", darkMode: false });

  return (
    <div className="container my-4">
      <div className="mb-4">
        <h1>Paramètres</h1>
        <p className="text-muted">Gérez vos informations et préférences</p>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card mb-4">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <User className="me-2 text-warning" />
                <h5 className="card-title mb-0">Informations personnelles</h5>
              </div>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Nom complet</label>
                  <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="form-control" />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="form-control" />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Téléphone</label>
                  <input type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="form-control" />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Date de naissance</label>
                  <input type="date" value={profile.birthdate} onChange={(e) => setProfile({ ...profile, birthdate: e.target.value })} className="form-control" />
                </div>
              </div>
              <button className="btn btn-warning mt-3">Enregistrer les modifications</button>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center">
                  <MapPin className="me-2 text-warning" />
                  <h5 className="mb-0">Adresses de livraison</h5>
                </div>
                <button className="btn btn-link text-warning p-0">+ Ajouter une adresse</button>
              </div>
              {addresses.map((addr) => (
                <div key={addr.id} className="d-flex justify-content-between align-items-start mb-2 p-2 border rounded">
                  <div className="d-flex align-items-start">
                    <MapPin className="me-2 text-muted mt-1" />
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span>{addr.name}</span>
                        {addr.isDefault && <span className="badge bg-success">Par défaut</span>}
                      </div>
                      <div className="text-muted">{addr.address}</div>
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-warning">Modifier</button>
                    <button className="btn btn-sm btn-outline-danger">Supprimer</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center">
                  <CreditCard className="me-2 text-warning" />
                  <h5 className="mb-0">Moyens de paiement</h5>
                </div>
                <button className="btn btn-link text-warning p-0">+ Ajouter une carte</button>
              </div>
              <div className="d-flex flex-column gap-2">
                <div className="d-flex justify-content-between align-items-center p-2 border rounded">
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-primary text-white rounded d-flex justify-content-center align-items-center" style={{width: "48px", height: "48px"}}>💳</div>
                    <div>
                      <div>Visa •••• 4242</div>
                      <div className="text-muted">Expire 12/25</div>
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-warning">Modifier</button>
                    <button className="btn btn-sm btn-outline-danger">Supprimer</button>
                  </div>
                </div>
                <div className="d-flex justify-content-between align-items-center p-2 border rounded">
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-warning text-white rounded d-flex justify-content-center align-items-center" style={{width: "48px", height: "48px"}}>📱</div>
                    <div>
                      <div>Orange Money</div>
                      <div className="text-muted">+221 77 123 45 67</div>
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-warning">Modifier</button>
                    <button className="btn btn-sm btn-outline-danger">Supprimer</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <Bell className="me-2 text-warning" />
                <h5 className="mb-0">Notifications</h5>
              </div>
              <div className="list-group list-group-flush">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="list-group-item d-flex justify-content-between align-items-center p-3 border-bottom">
                    <div className="text-capitalize">{key.replace("_", " ")}</div>
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" checked={value} onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <Globe className="me-2 text-warning" />
                <h5 className="mb-0">Préférences</h5>
              </div>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Langue</label>
                  <select value={preferences.language} onChange={(e) => setPreferences({ ...preferences, language: e.target.value })} className="form-select">
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Devise</label>
                  <select value={preferences.currency} onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })} className="form-select">
                    <option value="FCFA">FCFA</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card mb-4 text-center">
            <div className="card-body">
              <div className="rounded-circle bg-warning text-white d-flex justify-content-center align-items-center mx-auto mb-2" style={{width: "96px", height: "96px", fontSize: "24px"}}>
                {profile.name.split(" ").map(n => n[0]).join("")}
              </div>
              <h6 className="card-title">{profile.name}</h6>
              <p className="text-muted mb-2">Étudiante</p>
              <div className="bg-light rounded p-2 mb-3">
                <div className="text-warning">Niveau Gold</div>
                <div className="text-muted">1,250 points</div>
              </div>
              <button className="btn btn-outline-secondary w-100">Modifier la photo</button>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <Lock className="me-2 text-warning" />
                <h6 className="mb-0">Sécurité</h6>
              </div>
              <div className="d-grid gap-2">
                <button className="btn btn-outline-secondary w-100 text-start">Changer le mot de passe</button>
                <button className="btn btn-outline-secondary w-100 text-start">Authentification à 2 facteurs</button>
                <button className="btn btn-outline-secondary w-100 text-start">Sessions actives</button>
              </div>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <HelpCircle className="me-2 text-warning" />
                <h6 className="mb-0">Aide</h6>
              </div>
              <div className="d-grid gap-2">
                <button className="btn btn-outline-secondary w-100 text-start">Centre d'aide</button>
                <button className="btn btn-outline-secondary w-100 text-start">Conditions d'utilisation</button>
                <button className="btn btn-outline-secondary w-100 text-start">Politique de confidentialité</button>
              </div>
            </div>
          </div>

          <button className="btn btn-danger w-100 d-flex justify-content-center align-items-center gap-2">
            <LogOut /> Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}
