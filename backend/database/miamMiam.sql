-- ##################################################
-- ################### DOMAINES ####################
-- ##################################################

CREATE DOMAIN Name AS VARCHAR(100);

CREATE DOMAIN Email AS VARCHAR(255)
  CHECK (VALUE ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

CREATE DOMAIN Motpasse AS VARCHAR(255);

CREATE DOMAIN Telephone AS VARCHAR(20)
  CHECK (VALUE ~ '^\+?[0-9\s\-()]{7,20}$');

CREATE DOMAIN userState AS VARCHAR(50)
  CHECK (VALUE IN ('actif','inactif','suspendu'));

CREATE DOMAIN commandeState AS VARCHAR(50)
  CHECK (VALUE IN ('en_cours','validée','annulée'));

CREATE DOMAIN menuState AS VARCHAR(50)
  CHECK (VALUE IN ('disponible','indisponible'));

CREATE DOMAIN note AS INT
  CHECK (VALUE BETWEEN 0 AND 5);

CREATE DOMAIN pointFidelite AS INT
  CHECK (VALUE >= 0);

CREATE DOMAIN location AS VARCHAR(255)
  CHECK (VALUE IN ('googleMap', 'estimation'));

CREATE DOMAIN prices AS DECIMAL(10,2)
  CHECK (VALUE > 0.00);

CREATE DOMAIN reclamationState AS VARCHAR(50)
  CHECK (VALUE IN ('ouverte','en_traitement','fermée'));

CREATE DOMAIN modePaiement AS VARCHAR(50)
  CHECK (VALUE IN ('carte','mobile_money','especes'));

CREATE DOMAIN paiementState AS VARCHAR(50)
  CHECK (VALUE IN ('en_attente','reussi','echoue'));

CREATE DOMAIN typeRepas AS VARCHAR(50)
  CHECK (VALUE IN ('entree','plat','dessert','boisson'));

CREATE DOMAIN actionType AS VARCHAR(100)
  CHECK (VALUE IN (
    'connexion',
    'deconnexion',
    'ajout_menu',
    'modif_menu',
    'suppression_menu',
    'ajout_commande',
    'annulation_commande',
    'validation_livraison',
    'creation_compte',
    'suppression_compte',
    'modif_profil',
    'traitement_reclamation',
    'ajout_promotion',
    'suppression_promotion',
    'autre'
  ));

CREATE DOMAIN cibleType AS VARCHAR(100)
  CHECK (VALUE IN (
    'Utilisateur',
    'Client',
    'Gerant',
    'Employe',
    'Livreur',
    'Restaurant',
    'Menu',
    'Commande',
    'Livraison',
    'Promotion',
    'Reclamation',
    'Reponse',
    'Paiement',
    'Historique_fidelite',
    'Autre'
  ));

-- ##################################################
-- ################### TABLES ######################
-- ##################################################

-- TABLE Utilisateur
CREATE TABLE IF NOT EXISTS Utilisateur (
  id_user SERIAL NOT NULL,
  nom_user Name NOT NULL,
  email_user Email NOT NULL,
  password_user Motpasse NOT NULL,
  num_user Telephone NOT NULL,
  date_inscription TIMESTAMP NOT NULL,
  last_connexion TIMESTAMP NOT NULL,
  statut_account userState NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT utilisateur_cc0 PRIMARY KEY (id_user),
  CONSTRAINT utilisateur_cc1 UNIQUE (email_user)
);

-- TABLE Client
CREATE TABLE IF NOT EXISTS Client (
  id_user INT NOT NULL,
  fidelity INT NOT NULL,
  code_parrainage VARCHAR(50) NOT NULL,
  parrain INT,
  CONSTRAINT client_cc0 PRIMARY KEY (id_user),
  CONSTRAINT client_cc1 UNIQUE (code_parrainage),
  CONSTRAINT client_cr0 FOREIGN KEY (id_user) REFERENCES Utilisateur(id_user) ON DELETE CASCADE,
  CONSTRAINT client_cr1 FOREIGN KEY (parrain) REFERENCES Utilisateur(id_user) ON DELETE SET NULL
);

-- TABLE Administrateur
CREATE TABLE IF NOT EXISTS Administrateur (
  id_user INT NOT NULL,
  CONSTRAINT administrateur_cc0 PRIMARY KEY (id_user),
  CONSTRAINT administrateur_cr0 FOREIGN KEY (id_user) REFERENCES Utilisateur(id_user) ON DELETE CASCADE
);

-- TABLE Gerant
CREATE TABLE IF NOT EXISTS Gerant (
  id_user INT NOT NULL,
  CONSTRAINT gerant_cc0 PRIMARY KEY (id_user),
  CONSTRAINT gerant_cr0 FOREIGN KEY (id_user) REFERENCES Utilisateur(id_user) ON DELETE CASCADE
);

-- TABLE Employe
CREATE TABLE IF NOT EXISTS Employe (
  id_user INT NOT NULL,
  CONSTRAINT employe_cc0 PRIMARY KEY (id_user),
  CONSTRAINT employe_cr0 FOREIGN KEY (id_user) REFERENCES Utilisateur(id_user) ON DELETE CASCADE
);

-- TABLE Livreur
CREATE TABLE IF NOT EXISTS Livreur (
  id_user INT NOT NULL,
  code_payement VARCHAR(100),
  CONSTRAINT livreur_cc0 PRIMARY KEY (id_user),
  CONSTRAINT livreur_cr0 FOREIGN KEY (id_user) REFERENCES Utilisateur(id_user) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS File (
  id_File SERIAL PRIMARY KEY,
  nom_fichier Name NOT NULL,
  extension VARCHAR(10) NOT NULL,
  chemin TEXT NOT NULL
);

-- TABLE Restaurant
CREATE TABLE IF NOT EXISTS Restaurant (
  id_restaurant SERIAL NOT NULL,
  nom_restaurant Name NOT NULL,
  localisation TEXT NOT NULL,
  type_localisation location NOT NULL,
  logo_restaurant INT,
  politique TEXT,
  administrateur INT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT restaurant_cc0 PRIMARY KEY (id_restaurant),
  CONSTRAINT restaurant_cr0 FOREIGN KEY (administrateur) REFERENCES Administrateur(id_user) ON DELETE CASCADE,
  CONSTRAINT restaurant_cr1 FOREIGN KEY (logo_restaurant) REFERENCES File(id_File) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS Categorie_menu (
  libelle typeRepas NOT NULL,
  description_categorie TEXT,
  CONSTRAINT categorie_menu_cc0 PRIMARY KEY (libelle)
);

-- TABLE Menu
CREATE TABLE IF NOT EXISTS Menu (
  id_menu SERIAL NOT NULL,
  nom_menu Name NOT NULL,
  description_menu TEXT NOT NULL,
  image_menu INT,
  prix_menu prices NOT NULL,
  fidelity_point pointFidelite NOT NULL,
  statut_menu menuState NOT NULL,
  restaurant_hote INT NOT NULL,
  libelle_menu typeRepas NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT menu_cc0 PRIMARY KEY (id_menu),
  CONSTRAINT menu_cc1 UNIQUE (nom_menu, restaurant_hote),
  CONSTRAINT menu_cr0 FOREIGN KEY (restaurant_hote) REFERENCES Restaurant(id_restaurant) ON DELETE CASCADE,
  CONSTRAINT menu_cr1 FOREIGN KEY (image_menu) REFERENCES File(id_File) ON DELETE SET NULL,
  CONSTRAINT menu_cr2 FOREIGN KEY (libelle_menu) REFERENCES Categorie_menu(libelle) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Favoris (
  id_menu INT NOT NULL,
  id_client INT NOT NULL,
  CONSTRAINT favoris_cc0 PRIMARY KEY (id_menu, id_client),
  CONSTRAINT favoris_cr0 FOREIGN KEY (id_menu) REFERENCES Menu(id_menu) ON DELETE CASCADE,
  CONSTRAINT favoris_cr1 FOREIGN KEY (id_client) REFERENCES Client(id_user) ON DELETE CASCADE
);

-- TABLE Commande
CREATE TABLE IF NOT EXISTS Commande (
  id_commande SERIAL NOT NULL,
  date_commande TIMESTAMP NOT NULL,
  date_heure_livraison TIMESTAMP NOT NULL,
  localisation_client TEXT NOT NULL,
  type_localisation location NOT NULL,
  statut_commande commandeState NOT NULL,
  acheteur INT NOT NULL,
  CONSTRAINT commande_cc0 PRIMARY KEY (id_commande),
  CONSTRAINT commande_cr0 FOREIGN KEY (acheteur) REFERENCES Client(id_user) ON DELETE CASCADE
);

-- TABLE Bon_commande
CREATE TABLE IF NOT EXISTS Bon_commande (
  id_bon SERIAL NOT NULL,
  statut_bon commandeState NOT NULL,
  validateur INT NOT NULL,
  commande_associe INT NOT NULL,
  CONSTRAINT bon_commande_cc0 PRIMARY KEY (id_bon),
  CONSTRAINT bon_commande_cr0 FOREIGN KEY (validateur) REFERENCES Utilisateur(id_user) ON DELETE CASCADE,
  CONSTRAINT bon_commande_cr1 FOREIGN KEY (commande_associe) REFERENCES Commande(id_commande) ON DELETE CASCADE
);

-- TABLE Livraison
CREATE TABLE IF NOT EXISTS Livraison (
  id_livraison SERIAL NOT NULL,
  date_livraison TIMESTAMP,
  statut_livraison commandeState NOT NULL,
  commentaire TEXT NOT NULL,
  note_livraison note NOT NULL DEFAULT 0,
  livreur INT NOT NULL,
  bon_associe INT NOT NULL,
  CONSTRAINT livraison_cc0 PRIMARY KEY (id_livraison),
  CONSTRAINT livraison_cr0 FOREIGN KEY (livreur) REFERENCES Livreur(id_user) ON DELETE CASCADE,
  CONSTRAINT livraison_cr1 FOREIGN KEY (bon_associe) REFERENCES Bon_commande(id_bon) ON DELETE CASCADE
);

-- TABLE Promotion
CREATE TABLE IF NOT EXISTS Promotion (
  id_promo SERIAL NOT NULL,
  titre Name NOT NULL,
  description_promotion TEXT NOT NULL,
  date_debut TIMESTAMP NOT NULL,
  date_fin TIMESTAMP NOT NULL,
  image_promo INT,
  pourcentage_reduction DECIMAL(5,2) NOT NULL,
  CONSTRAINT promotion_cc0 PRIMARY KEY (id_promo),
  CONSTRAINT promotion_cr0 FOREIGN KEY (image_promo) REFERENCES File(id_File) ON DELETE SET NULL,
  CONSTRAINT promotion_ck0 CHECK (date_fin > date_debut),
  CONSTRAINT promotion_ck1 CHECK (pourcentage_reduction > 0 AND pourcentage_reduction <= 100)
);

-- TABLE Reclamation
CREATE TABLE IF NOT EXISTS Reclamation (
  id_reclamation SERIAL NOT NULL,
  message_reclamation TEXT NOT NULL,
  date_soummission TIMESTAMP NOT NULL,
  statut_reclamation reclamationState NOT NULL,
  restaurant_cible INT NOT NULL,
  acheteur INT NOT NULL,
  CONSTRAINT reclamation_cc0 PRIMARY KEY (id_reclamation),
  CONSTRAINT reclamation_cr0 FOREIGN KEY (restaurant_cible) REFERENCES Restaurant(id_restaurant) ON DELETE CASCADE,
  CONSTRAINT reclamation_cr1 FOREIGN KEY (acheteur) REFERENCES Client(id_user) ON DELETE CASCADE
);

-- TABLE Reponse
CREATE TABLE IF NOT EXISTS Reponse (
  id_reponse SERIAL NOT NULL,
  statut_reponse reclamationState NOT NULL,
  reclamation_cible INT NOT NULL,
  auteur INT NOT NULL,
  message_reponse TEXT NOT NULL,
  CONSTRAINT reponse_cc0 PRIMARY KEY (id_reponse),
  CONSTRAINT reponse_cr0 FOREIGN KEY (reclamation_cible) REFERENCES Reclamation(id_reclamation) ON DELETE CASCADE,
  CONSTRAINT reponse_cr1 FOREIGN KEY (auteur) REFERENCES Utilisateur(id_user) ON DELETE CASCADE
);

-- TABLE Noter
CREATE TABLE IF NOT EXISTS Noter (
  id_client INT NOT NULL,
  id_menu INT NOT NULL,
  note_menu note NOT NULL,
  commentaire TEXT NOT NULL DEFAULT 'RAS',
  CONSTRAINT noter_cc0 PRIMARY KEY (id_client, id_menu),
  CONSTRAINT noter_cr0 FOREIGN KEY (id_client) REFERENCES Client(id_user) ON DELETE CASCADE,
  CONSTRAINT noter_cr1 FOREIGN KEY (id_menu) REFERENCES Menu(id_menu) ON DELETE CASCADE
);

-- TABLE Choisir_Menu_Jour
CREATE TABLE IF NOT EXISTS Choisir_Menu_Jour (
  id_menu INT NOT NULL,
  id_employe INT NOT NULL,
  date_jour DATE NOT NULL,
  CONSTRAINT choisir_menu_jour_cc0 PRIMARY KEY (id_menu, date_jour),
  CONSTRAINT choisir_menu_jour_cr0 FOREIGN KEY (id_menu) REFERENCES Menu(id_menu) ON DELETE CASCADE,
  CONSTRAINT choisir_menu_jour_cr1 FOREIGN KEY (id_employe) REFERENCES Employe(id_user) ON DELETE CASCADE
);

-- TABLE Contenir
CREATE TABLE IF NOT EXISTS Contenir (
  id_commande INT NOT NULL,
  id_menu INT NOT NULL,
  quantite INT NOT NULL,
  prix_unitaire prices NOT NULL,
  CONSTRAINT contenir_cc0 PRIMARY KEY (id_commande, id_menu),
  CONSTRAINT contenir_cr0 FOREIGN KEY (id_commande) REFERENCES Commande(id_commande) ON DELETE CASCADE,
  CONSTRAINT contenir_cr1 FOREIGN KEY (id_menu) REFERENCES Menu(id_menu) ON DELETE CASCADE
);

-- TABLE Travailler_pour
CREATE TABLE IF NOT EXISTS Travailler_pour (
  id_employe INT NOT NULL,
  id_restaurant INT NOT NULL,
  date_debut TIMESTAMP NOT NULL,
  service_employe BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT travailler_pour_cc0 PRIMARY KEY (id_employe, id_restaurant),
  CONSTRAINT travailler_pour_cr0 FOREIGN KEY (id_employe) REFERENCES Employe(id_user) ON DELETE CASCADE,
  CONSTRAINT travailler_pour_cr1 FOREIGN KEY (id_restaurant) REFERENCES Restaurant(id_restaurant) ON DELETE CASCADE
);

-- TABLE Gerer
CREATE TABLE IF NOT EXISTS Gerer (
  id_restaurant INT NOT NULL,
  id_gerant INT NOT NULL,
  date_debut TIMESTAMP NOT NULL,
  service_employe BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT gerer_cc0 PRIMARY KEY (id_restaurant, id_gerant),
  CONSTRAINT gerer_cr0 FOREIGN KEY (id_restaurant) REFERENCES Restaurant(id_restaurant) ON DELETE CASCADE,
  CONSTRAINT gerer_cr1 FOREIGN KEY (id_gerant) REFERENCES Gerant(id_user) ON DELETE CASCADE
);

-- TABLE Etre_livreur
CREATE TABLE IF NOT EXISTS Etre_livreur (
  id_livreur INT NOT NULL,
  id_restaurant INT NOT NULL,
  note_livreur note NOT NULL DEFAULT 0,
  date_debut TIMESTAMP NOT NULL,
  service_employe BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT etre_livreur_cc0 PRIMARY KEY (id_livreur, id_restaurant),
  CONSTRAINT etre_livreur_cr0 FOREIGN KEY (id_livreur) REFERENCES Livreur(id_user) ON DELETE CASCADE,
  CONSTRAINT etre_livreur_cr1 FOREIGN KEY (id_restaurant) REFERENCES Restaurant(id_restaurant) ON DELETE CASCADE
);

-- TABLE Concerner_menu
CREATE TABLE IF NOT EXISTS Concerner_menu (
  id_promo INT NOT NULL,
  id_menu INT NOT NULL,
  CONSTRAINT concerner_menu_cc0 PRIMARY KEY (id_promo, id_menu),
  CONSTRAINT concerner_menu_cr0 FOREIGN KEY (id_promo) REFERENCES Promotion(id_promo) ON DELETE CASCADE,
  CONSTRAINT concerner_menu_cr1 FOREIGN KEY (id_menu) REFERENCES Menu(id_menu) ON DELETE CASCADE
);

-- TABLE Paiement
CREATE TABLE IF NOT EXISTS Paiement (
  id_paiement SERIAL NOT NULL,
  id_commande INT NOT NULL,
  montant prices NOT NULL,
  moyen_paiement modePaiement NOT NULL,
  statut_paiement paiementState NOT NULL,
  reference_transaction VARCHAR(100) UNIQUE,
  date_paiement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT paiement_cc0 PRIMARY KEY(id_paiement),
  CONSTRAINT paiement_cr0 FOREIGN KEY (id_commande) REFERENCES Commande(id_commande) ON DELETE CASCADE
);

-- TABLE Historique_fidelite
CREATE TABLE IF NOT EXISTS Historique_fidelite (
  id_historique SERIAL NOT NULL,
  id_client INT NOT NULL,
  changement INT NOT NULL, -- positif ou négatif
  raison VARCHAR(255) NOT NULL,
  date_changement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT histo_fidelite_cc0 PRIMARY KEY(id_historique),
  CONSTRAINT histo_fidelite_cr0 FOREIGN KEY (id_client) REFERENCES Client(id_user) ON DELETE CASCADE
);

-- Table Notifications
CREATE TABLE IF NOT EXISTS Notifications (
  id_notification SERIAL NOT NULL,
  message_notification TEXT NOT NULL,
  date_notif TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  restaurant_auteur INT NOT NULL,
  CONSTRAINT notifications_cc0 PRIMARY KEY(id_notification),
  CONSTRAINT notifications_cr0 FOREIGN KEY(restaurant_auteur) REFERENCES Restaurant(id_restaurant)
);

-- Table Cible_Notifications
CREATE TABLE IF NOT EXISTS Cible_Notifications (
  id_notification INT NOT NULL,
  id_cible INT NOT NULL,
  ouvert BOOLEAN DEFAULT FALSE,
  CONSTRAINT cible_notifications_cc0 PRIMARY KEY(id_notification, id_cible),
  CONSTRAINT cible_notifications_cr0 FOREIGN KEY(id_notification) REFERENCES Notifications(id_notification),
  CONSTRAINT cible_notifications_cr1 FOREIGN KEY(id_cible) REFERENCES Utilisateur(id_user)
);

-- Table CONSENTEMENT : enregistre les validations RGPD (cookies, confidentialité, etc.)
CREATE TABLE IF NOT EXISTS Consentement (
  id_consentement SERIAL PRIMARY KEY,
  id_user INT,
  type_consentement VARCHAR(100) NOT NULL,  -- exemple : 'cookies', 'newsletter', 'confidentialite'
  version_texte VARCHAR(50) NOT NULL,       -- ex : 'v1.0' pour la version du texte RGPD affiché
  accepte BOOLEAN NOT NULL,                 -- TRUE = accepté, FALSE = refusé
  date_action TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_client VARCHAR(50),
  user_agent TEXT,                          -- navigateur utilisé (facultatif)
  CONSTRAINT consentement_cr0 FOREIGN KEY (id_user) REFERENCES Utilisateur(id_user) ON DELETE SET NULL
);

-- Nécessite l’extension UUID pour les identifiants uniques de session
-- À activer une seule fois dans ta base :

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS Session (
  id_session UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  -- identifiant unique par session
  id_user INT NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,                      -- JWT ou clé de session générée côté backend
  ip_client VARCHAR(50),
  user_agent TEXT,
  date_connexion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_deconnexion TIMESTAMP,
  actif BOOLEAN DEFAULT TRUE,                              -- TRUE = session ouverte
  CONSTRAINT session_cr0 FOREIGN KEY (id_user) REFERENCES Utilisateur(id_user) ON DELETE CASCADE
);

-- Table PASSWORD_RESET : gestion des liens temporaires pour réinitialisation
CREATE TABLE IF NOT EXISTS Password_Reset (
  id_reset SERIAL PRIMARY KEY,
  id_user INT NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,          -- jeton unique envoyé par email
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_expiration TIMESTAMP NOT NULL,          -- durée de validité (ex : 15 min ou 1h)
  utilise BOOLEAN DEFAULT FALSE,               -- TRUE après usage du lien
  CONSTRAINT password_reset_cr0 FOREIGN KEY (id_user) REFERENCES Utilisateur(id_user) ON DELETE CASCADE,
  CONSTRAINT password_reset_ck0 CHECK (date_expiration > date_creation)
);

-- Table LOG_ACTIVITE : enregistre les actions effectuées par les utilisateurs
CREATE TABLE IF NOT EXISTS Log_Activite (
  id_log SERIAL PRIMARY KEY,
  id_user INT,
  action actionType NOT NULL,               -- ex : 'connexion', 'ajout_menu', 'suppression_compte'
  cible cibleType NOT NULL,                         -- ex : 'Menu', 'Utilisateur', 'Commande'
  id_cible INT,                               -- identifiant de l’objet concerné
  details TEXT,                               -- infos complémentaires
  ip_client VARCHAR(50),
  date_action TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT log_activite_cr0 FOREIGN KEY (id_user) REFERENCES Utilisateur(id_user) ON DELETE SET NULL
);