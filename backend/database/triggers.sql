-- =====================================================
-- TRIGGER : Créer automatiquement un Client après insertion d'un "Utilisateur"
-- =====================================================

-- Étape 1 : Fonction du trigger
CREATE OR REPLACE FUNCTION creer_client_auto()
RETURNS TRIGGER AS $$
DECLARE
    v_code_parrainage VARCHAR(50);
BEGIN
    -- Générer un code de parrainage unique à partir de l'ID utilisateur et du temps
    v_code_parrainage := CONCAT('CLI-', NEW.id_user, '-', EXTRACT(EPOCH FROM NOW())::BIGINT);

    -- Insérer automatiquement dans la table Client
    INSERT INTO Client (id_user, fidelity, code_parrainage, parrain)
    VALUES (NEW.id_user, 0, v_code_parrainage, NULL);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- Étape 2 : Trigger lié à la table "Utilisateur"
CREATE TRIGGER trig_creer_client_auto
AFTER INSERT ON "Utilisateur"
FOR EACH ROW
EXECUTE FUNCTION creer_client_auto();

-- =====================================================
-- TRIGGER : Assigner automatiquement l'admin comme gérant, employé et livreur
--           lors de la création d'un restaurant.
-- =====================================================

-- Étape 1 : Fonction du trigger
CREATE OR REPLACE FUNCTION assigner_admin_roles_auto()
RETURNS TRIGGER AS $$
DECLARE
    v_admin_id INT;
    v_resto_id INT;
BEGIN
    -- Récupérer les IDs de l'admin et du nouveau restaurant
    v_admin_id := NEW.administrateur;
    v_resto_id := NEW.id_restaurant;

    -- 1. Assigner le rôle de Gérant
    -- S'assurer que l'admin existe dans la table Gerant
    INSERT INTO Gerant (id_user) VALUES (v_admin_id) ON CONFLICT (id_user) DO NOTHING;
    -- Lier le gérant au restaurant
    INSERT INTO Gerer (id_restaurant, id_gerant, date_debut, service_employe)
    VALUES (v_resto_id, v_admin_id, CURRENT_TIMESTAMP, TRUE);

    -- 2. Assigner le rôle d'Employé
    INSERT INTO Employe (id_user) VALUES (v_admin_id) ON CONFLICT (id_user) DO NOTHING;
    INSERT INTO Travailler_pour (id_employe, id_restaurant, date_debut, service_employe)
    VALUES (v_admin_id, v_resto_id, CURRENT_TIMESTAMP, TRUE);

    -- 3. Assigner le rôle de Livreur
    INSERT INTO Livreur (id_user) VALUES (v_admin_id) ON CONFLICT (id_user) DO NOTHING;
    INSERT INTO Etre_livreur (id_livreur, id_restaurant, note_livreur, date_debut, service_employe)
    VALUES (v_admin_id, v_resto_id, 0, CURRENT_TIMESTAMP, TRUE);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Étape 2 : Trigger lié à la table "Restaurant"
CREATE TRIGGER trig_assigner_admin_roles
AFTER INSERT ON Restaurant
FOR EACH ROW
EXECUTE FUNCTION assigner_admin_roles_auto();
