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