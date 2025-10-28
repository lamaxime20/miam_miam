CREATE OR REPLACE FUNCTION user_deja_employe(
    user_email Email,
    user_role TEXT
)
RETURNS BOOLEAN 
LANGUAGE plpgsql
AS $$
DECLARE
    user_exists BOOLEAN := FALSE;
    user_id INT;
BEGIN
    -- Trouver l'ID de l'utilisateur par email
    SELECT id_user INTO user_id
    FROM "Utilisateur" 
    WHERE email_user = user_email;
    
    -- Si l'utilisateur n'existe pas, retourner false
    IF user_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Vérifier selon le rôle
    CASE user_role
        WHEN 'gérant' THEN
            -- Vérifier dans la table gerer
            SELECT EXISTS(
                SELECT 1 
                FROM gerer g
                WHERE g.id_gerant = user_id 
                AND g.service_employe = TRUE
            ) INTO user_exists;
            
        WHEN 'employé' THEN
            -- Vérifier dans la table travailler_pour
            SELECT EXISTS(
                SELECT 1 
                FROM travailler_pour tp
                WHERE tp.id_employe = user_id 
                AND tp.service_employe = TRUE
            ) INTO user_exists;
            
        WHEN 'livreur' THEN
            -- Vérifier dans la table etre_livreur
            SELECT EXISTS(
                SELECT 1 
                FROM etre_livreur el
                WHERE el.id_livreur = user_id 
                AND el.service_employe = TRUE
            ) INTO user_exists;
            
        ELSE
            -- Rôle non reconnu
            user_exists := FALSE;
    END CASE;
    
    RETURN user_exists;
    
EXCEPTION
    WHEN OTHERS THEN
        -- En cas d'erreur, retourner false
        RETURN FALSE;
END;
$$;

CREATE OR REPLACE FUNCTION create_employee(
    user_email Email,
    user_role TEXT,
    restaurant_id INT
)
RETURNS TEXT 
LANGUAGE plpgsql
AS $$
DECLARE
    user_id INT;
    existing_user_id INT;
BEGIN
    -- Vérifier si l'utilisateur existe
    SELECT id_user INTO user_id
    FROM "Utilisateur" 
    WHERE email_user = user_email;
    
    -- Si l'utilisateur n'existe pas, retourner une erreur
    IF user_id IS NULL THEN
        RETURN 'UTILISATEUR_NON_TROUVE';
    END IF;
    
    -- Vérifier si l'utilisateur est déjà employé dans ce restaurant
    CASE user_role
        WHEN 'gérant' THEN
            SELECT id_gerant INTO existing_user_id
            FROM gerer 
            WHERE id_gerant = user_id 
            AND id_restaurant = restaurant_id;
            
        WHEN 'employé' THEN
            SELECT id_employe INTO existing_user_id
            FROM travailler_pour 
            WHERE id_employe = user_id 
            AND id_restaurant = restaurant_id;
            
        WHEN 'livreur' THEN
            SELECT id_livreur INTO existing_user_id
            FROM etre_livreur 
            WHERE id_livreur = user_id 
            AND id_restaurant = restaurant_id;
            
        ELSE
            RETURN 'ROLE_INVALIDE';
    END CASE;
    
    -- Si l'utilisateur est déjà employé dans ce restaurant
    IF existing_user_id IS NOT NULL THEN
        -- Mettre à jour le service_employe à TRUE
        CASE user_role
            WHEN 'gérant' THEN
                UPDATE gerer 
                SET service_employe = TRUE,
                    date_debut = CURRENT_TIMESTAMP
                WHERE id_gerant = user_id 
                AND id_restaurant = restaurant_id;
                
            WHEN 'employé' THEN
                UPDATE travailler_pour 
                SET service_employe = TRUE,
                    date_debut = CURRENT_TIMESTAMP
                WHERE id_employe = user_id 
                AND id_restaurant = restaurant_id;
                
            WHEN 'livreur' THEN
                UPDATE etre_livreur 
                SET service_employe = TRUE,
                    date_debut = CURRENT_TIMESTAMP
                WHERE id_livreur = user_id 
                AND id_restaurant = restaurant_id;
        END CASE;
        
        RETURN 'EMPLOYE_REACTIVE';
    END IF;
    
    -- Insérer le nouvel employé selon le rôle
    CASE user_role
        WHEN 'gérant' THEN
            -- Vérifier si l'utilisateur est déjà dans la table gerant
            IF NOT EXISTS (SELECT 1 FROM gerant WHERE id_user = user_id) THEN
                INSERT INTO gerant (id_user) VALUES (user_id);
            END IF;
            
            -- Ajouter la relation avec le restaurant
            INSERT INTO gerer (id_restaurant, id_gerant, date_debut, service_employe)
            VALUES (restaurant_id, user_id, CURRENT_TIMESTAMP, TRUE);
            
        WHEN 'employé' THEN
            -- Vérifier si l'utilisateur est déjà dans la table employe
            IF NOT EXISTS (SELECT 1 FROM employe WHERE id_user = user_id) THEN
                INSERT INTO employe (id_user) VALUES (user_id);
            END IF;
            
            -- Ajouter la relation avec le restaurant
            INSERT INTO travailler_pour (id_employe, id_restaurant, date_debut, service_employe)
            VALUES (user_id, restaurant_id, CURRENT_TIMESTAMP, TRUE);
            
        WHEN 'livreur' THEN
            -- Vérifier si l'utilisateur est déjà dans la table livreur
            IF NOT EXISTS (SELECT 1 FROM livreur WHERE id_user = user_id) THEN
                INSERT INTO livreur (id_user) VALUES (user_id);
            END IF;
            
            -- Ajouter la relation avec le restaurant
            INSERT INTO etre_livreur (id_livreur, id_restaurant, date_debut, service_employe, note_livreur)
            VALUES (user_id, restaurant_id, CURRENT_TIMESTAMP, TRUE, 0);
            
        ELSE
            RETURN 'ROLE_INVALIDE';
    END CASE;
    
    RETURN 'EMPLOYE_CREE';
    
EXCEPTION
    WHEN OTHERS THEN
        -- En cas d'erreur, retourner le message d'erreur
        RETURN 'ERREUR: ' || SQLERRM;
END;
$$;