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

CREATE OR REPLACE FUNCTION desactiver_employe(
    user_email Email,
    user_role TEXT,
    restaurant_id INT
)
RETURNS TEXT 
LANGUAGE plpgsql
AS $$
DECLARE
    user_id INT;
    rows_affected INT := 0;
BEGIN
    -- Trouver l'ID de l'utilisateur par email
    SELECT id_user INTO user_id
    FROM "Utilisateur" 
    WHERE email_user = user_email;
    
    -- Si l'utilisateur n'existe pas, retourner une erreur
    IF user_id IS NULL THEN
        RETURN 'UTILISATEUR_NON_TROUVE';
    END IF;
    
    -- Désactiver l'employé selon le rôle
    CASE user_role
        WHEN 'gérant' THEN
            UPDATE gerer 
            SET service_employe = FALSE
            WHERE id_gerant = user_id 
            AND id_restaurant = restaurant_id;
            
            GET DIAGNOSTICS rows_affected = ROW_COUNT;
            
        WHEN 'employé' THEN
            UPDATE travailler_pour 
            SET service_employe = FALSE
            WHERE id_employe = user_id 
            AND id_restaurant = restaurant_id;
            
            GET DIAGNOSTICS rows_affected = ROW_COUNT;
            
        WHEN 'livreur' THEN
            UPDATE etre_livreur 
            SET service_employe = FALSE
            WHERE id_livreur = user_id 
            AND id_restaurant = restaurant_id;
            
            GET DIAGNOSTICS rows_affected = ROW_COUNT;
            
        ELSE
            RETURN 'ROLE_INVALIDE';
    END CASE;
    
    -- Vérifier si une ligne a été mise à jour
    IF rows_affected = 0 THEN
        RETURN 'EMPLOYE_NON_TROUVE';
    END IF;
    
    RETURN 'EMPLOYE_DESACTIVE';
    
EXCEPTION
    WHEN OTHERS THEN
        -- En cas d'erreur, retourner le message d'erreur
        RETURN 'ERREUR: ' || SQLERRM;
END;
$$;


CREATE OR REPLACE FUNCTION get_all_menu_items(restaurant_id INT)
RETURNS TABLE(
    id TEXT,
    name TEXT,
    description TEXT,
    price DECIMAL(10,2),
    category TEXT,
    status TEXT,
    image TEXT
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        m.id_menu::TEXT as id,
        m.nom_menu::TEXT as name,
        m.description_menu::TEXT as description,
        m.prix_menu as price,
        CASE 
            WHEN m.libelle_menu = 'plat' THEN 'Plats'::TEXT
            WHEN m.libelle_menu = 'entree' THEN 'Entrées'::TEXT
            WHEN m.libelle_menu = 'dessert' THEN 'Desserts'::TEXT
            WHEN m.libelle_menu = 'boisson' THEN 'Boissons'::TEXT
            ELSE m.libelle_menu::TEXT
        END as category,
        CASE 
            WHEN m.statut_menu = 'disponible' THEN 'available'::TEXT
            WHEN m.statut_menu = 'indisponible' THEN 'unavailable'::TEXT
            ELSE m.statut_menu::TEXT
        END as status,
        f.chemin::TEXT as image
    FROM Menu m
    LEFT JOIN file f ON m.image_menu = f.id_file
    WHERE m.restaurant_hote = restaurant_id
    ORDER BY 
        CASE 
            WHEN m.libelle_menu = 'entree' THEN 1
            WHEN m.libelle_menu = 'plat' THEN 2
            WHEN m.libelle_menu = 'dessert' THEN 3
            WHEN m.libelle_menu = 'boisson' THEN 4
            ELSE 5
        END,
        m.nom_menu;

END;
$$;

CREATE OR REPLACE FUNCTION create_menu_item(
    nom_menu Name,
    description_menu TEXT,
    prix_menu prices,
    libelle_menu typeRepas,
    statut_menu menuState,
    restaurant_hote INT,
    image_menu INT DEFAULT NULL
)
RETURNS TEXT 
LANGUAGE plpgsql
AS $$
DECLARE
    nouveau_id INT;
    fidelity_points_calcules pointFidelite;
BEGIN
    -- Calculer les points de fidélité : prix / 1000 (arrondi à l'entier)
    fidelity_points_calcules := ROUND(prix_menu / 1000)::INT;
    
    -- S'assurer que les points sont au minimum 1
    IF fidelity_points_calcules < 1 THEN
        fidelity_points_calcules := 1;
    END IF;
    
    -- Vérifier si le restaurant existe
    IF NOT EXISTS (SELECT 1 FROM restaurant WHERE id_restaurant = restaurant_hote) THEN
        RETURN 'RESTAURANT_NON_TROUVE';
    END IF;
    
    -- Vérifier si l'image existe (si fournie)
    IF image_menu IS NOT NULL AND NOT EXISTS (SELECT 1 FROM file WHERE id_file = image_menu) THEN
        RETURN 'IMAGE_NON_TROUVEE';
    END IF;
    
    -- Vérifier si un menu avec le même nom existe déjà dans ce restaurant
    IF EXISTS (
        SELECT 1 
        FROM menu 
        WHERE nom_menu = $1 
        AND restaurant_hote = $6
    ) THEN
        RETURN 'NOM_EXISTE_DEJA';
    END IF;
    
    -- Insérer le nouveau menu
    INSERT INTO menu (
        nom_menu,
        description_menu,
        image_menu,
        prix_menu,
        fidelity_point,
        statut_menu,
        restaurant_hote,
        libelle_menu,
        updated_at
    ) VALUES (
        nom_menu,
        description_menu,
        image_menu,
        prix_menu,
        fidelity_points_calcules,
        statut_menu,
        restaurant_hote,
        libelle_menu,
        CURRENT_TIMESTAMP
    )
    RETURNING id_menu INTO nouveau_id;
    
    RETURN 'MENU_CREE:' || nouveau_id::TEXT;
    
EXCEPTION
    WHEN OTHERS THEN
        -- En cas d'erreur, retourner le message d'erreur
        RETURN 'ERREUR: ' || SQLERRM;
END;
$$;