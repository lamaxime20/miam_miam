CREATE OR REPLACE FUNCTION get_restaurants_utilisateur(
    p_email Email
)
RETURNS TABLE(
    restaurant_id INT,
    restaurant_nom TEXT,
    restaurant_logo TEXT,
    role_utilisateur TEXT,
    date_debut TIMESTAMP
) 
LANGUAGE plpgsql
AS $$
DECLARE
    user_id INT;
BEGIN
    -- Trouver l'ID de l'utilisateur par email
    SELECT id_user INTO user_id
    FROM "Utilisateur" 
    WHERE email_user = p_email;
    
    -- Si l'utilisateur n'existe pas, retourner vide
    IF user_id IS NULL THEN
        RETURN;
    END IF;
    
    -- Récupération des restaurants où l'utilisateur est impliqué
    RETURN QUERY 
    WITH restaurants_utilisateur AS (
        -- Administrateur
        SELECT 
            r.id_restaurant,
            r.nom_restaurant::TEXT,
            COALESCE(f.chemin::TEXT, '') as logo,
            'Administrateur'::TEXT as role,
            r.updated_at as debut
        FROM restaurant r
        INNER JOIN administrateur a ON r.administrateur = a.id_user
        LEFT JOIN file f ON r.logo_restaurant = f.id_file
        WHERE a.id_user = user_id

        UNION ALL

        -- Gérant
        SELECT 
            r.id_restaurant,
            r.nom_restaurant::TEXT,
            COALESCE(f.chemin::TEXT, ''),
            'Gérant'::TEXT,
            gr.date_debut
        FROM restaurant r
        INNER JOIN gerer gr ON r.id_restaurant = gr.id_restaurant
        INNER JOIN gerant g ON gr.id_gerant = g.id_user
        LEFT JOIN file f ON r.logo_restaurant = f.id_file
        WHERE g.id_user = user_id
        AND gr.service_employe = TRUE

        UNION ALL

        -- Employé
        SELECT 
            r.id_restaurant,
            r.nom_restaurant::TEXT,
            COALESCE(f.chemin::TEXT, ''),
            'Employé'::TEXT,
            tp.date_debut
        FROM restaurant r
        INNER JOIN travailler_pour tp ON r.id_restaurant = tp.id_restaurant
        INNER JOIN employe e ON tp.id_employe = e.id_user
        LEFT JOIN file f ON r.logo_restaurant = f.id_file
        WHERE e.id_user = user_id
        AND tp.service_employe = TRUE

        UNION ALL

        -- Livreur
        SELECT 
            r.id_restaurant,
            r.nom_restaurant::TEXT,
            COALESCE(f.chemin::TEXT, ''),
            'Livreur'::TEXT,
            el.date_debut
        FROM restaurant r
        INNER JOIN etre_livreur el ON r.id_restaurant = el.id_restaurant
        INNER JOIN livreur l ON el.id_livreur = l.id_user
        LEFT JOIN file f ON r.logo_restaurant = f.id_file
        WHERE l.id_user = user_id
        AND el.service_employe = TRUE
    )
    SELECT 
        ru.id_restaurant as restaurant_id,
        ru.nom_restaurant as restaurant_nom,
        ru.logo as restaurant_logo,
        ru.role as role_utilisateur,
        ru.debut as date_debut
    FROM restaurants_utilisateur ru
    ORDER BY 
        CASE ru.role
            WHEN 'Administrateur' THEN 1
            WHEN 'Gérant' THEN 2
            WHEN 'Employé' THEN 3
            WHEN 'Livreur' THEN 4
            ELSE 5
        END,
        ru.debut DESC;

END;
$$;