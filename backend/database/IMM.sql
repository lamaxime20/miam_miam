--Fonctions CRUD--
--Table Utilisateur--
-- =============================
--     FONCTIONS CRUD : UTILISATEUR
-- =============================

-- CREATE : Ajouter un utilisateur
CREATE OR REPLACE FUNCTION ajouter_utilisateur(
    p_nom Name,
    p_email Email,
    p_password Motpasse,
    p_num Telephone,
    p_statut userState
)
RETURNS INT AS $$
DECLARE
    v_id_user INT;
BEGIN
    INSERT INTO "Utilisateur" (
        nom_user, email_user, password_user, num_user,
        date_inscription, last_connexion, statut_account
    )
    VALUES (
        p_nom, p_email, p_password, p_num,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, p_statut
    )
    RETURNING id_user INTO v_id_user;  -- capture de l’ID nouvellement créé

    RETURN v_id_user;  -- on retourne cet ID
END;
$$ LANGUAGE plpgsql;


-- READ 1 : Obtenir un utilisateur par ID
CREATE OR REPLACE FUNCTION obtenir_utilisateur_par_id(p_id INT)
RETURNS TABLE (
    id_user INT,
    nom_user Name,
    email_user Email,
    password_user Motpasse,
    num_user Telephone,
    date_inscription TIMESTAMP,
    last_connexion TIMESTAMP,
    statut_account userState,
    updated_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM "Utilisateur" u
    WHERE u.id_user = p_id;
END;
$$ LANGUAGE plpgsql;



-- READ 2 : Lister tous les utilisateurs
CREATE OR REPLACE FUNCTION lister_utilisateurs()
RETURNS TABLE (
    id_user INT,
    nom_user Name,
    email_user Email,
    password_user Motpasse,
    num_user Telephone,
    date_inscription TIMESTAMP,
    last_connexion TIMESTAMP,
    statut_account userState,
    updated_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM "Utilisateur"
    ORDER BY id_user ASC;
END;
$$ LANGUAGE plpgsql;



-- UPDATE : Modifier les informations d’un utilisateur
CREATE OR REPLACE FUNCTION modifier_utilisateur(
    p_id INT,
    p_nom Name DEFAULT NULL,
    p_email Email DEFAULT NULL,
    p_num Telephone DEFAULT NULL,
    p_statut userState DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE "Utilisateur"
    SET
        nom_user = COALESCE(p_nom, nom_user),
        email_user = COALESCE(p_email, email_user),
        num_user = COALESCE(p_num, num_user),
        statut_account = COALESCE(p_statut, statut_account),
        updated_at = CURRENT_TIMESTAMP
    WHERE id_user = p_id;
END;
$$ LANGUAGE plpgsql;



-- DELETE : Supprimer un utilisateur
CREATE OR REPLACE FUNCTION supprimer_utilisateur(p_id INT)
RETURNS VOID AS $$
BEGIN
    DELETE FROM "Utilisateur"
    WHERE id_user = p_id;
END;
$$ LANGUAGE plpgsql;

-- =============================
--     FONCTIONS CRUD : RESTAURANT
-- =============================

-- #############################################################
-- Fonction 1 : Créer un restaurant
-- #############################################################
CREATE OR REPLACE FUNCTION creer_restaurant(
    p_nom_restaurant VARCHAR,
    p_localisation TEXT,
    p_type_localisation VARCHAR,
    p_logo_restaurant INT,
    p_politique TEXT,
    p_administrateur INT
)
RETURNS TABLE (restaurant_id INT, message TEXT)
AS $$
DECLARE
    new_id INT;
BEGIN
    INSERT INTO Restaurant (nom_restaurant, localisation, type_localisation, logo_restaurant, politique, administrateur)
    VALUES (p_nom_restaurant, p_localisation, p_type_localisation, p_logo_restaurant, p_politique, p_administrateur)
    RETURNING id_restaurant INTO new_id;

    RETURN QUERY SELECT new_id AS restaurant_id, 'Restaurant créé avec succès.' AS message;
END;
$$ LANGUAGE plpgsql;


-- #############################################################
-- Fonction 2 : Obtenir tous les restaurants
-- #############################################################
CREATE OR REPLACE FUNCTION get_all_restaurants()
RETURNS TABLE (
    id_restaurant INT,
    nom_restaurant VARCHAR,
    localisation TEXT,
    type_localisation VARCHAR,
    logo_restaurant INT,
    politique TEXT,
    administrateur INT,
    updated_at TIMESTAMP
)
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id_restaurant,
        r.nom_restaurant::VARCHAR,
        r.localisation,
        r.type_localisation::VARCHAR,
        r.logo_restaurant,
        r.politique,
        r.administrateur,
        r.updated_at
    FROM Restaurant r
    ORDER BY r.id_restaurant;
END;
$$ LANGUAGE plpgsql;

-- #############################################################
-- Fonction 3 : Obtenir un restaurant par ID
-- #############################################################
CREATE OR REPLACE FUNCTION get_one_restaurant(p_id INT)
RETURNS TABLE (
    id_restaurant INT,
    nom_restaurant VARCHAR,
    localisation TEXT,
    type_localisation VARCHAR,
    logo_restaurant INT,
    politique TEXT,
    administrateur INT,
    updated_at TIMESTAMP
)
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id_restaurant,
        r.nom_restaurant::VARCHAR,
        r.localisation,
        r.type_localisation::VARCHAR,
        r.logo_restaurant,
        r.politique,
        r.administrateur,
        r.updated_at
    FROM Restaurant r
    WHERE r.id_restaurant = p_id;
END;
$$ LANGUAGE plpgsql;


-- #############################################################
-- Fonction 4 : Mettre à jour un restaurant
-- #############################################################
CREATE OR REPLACE FUNCTION update_restaurant(
    p_id INT,
    p_nom_restaurant VARCHAR DEFAULT NULL,
    p_localisation TEXT DEFAULT NULL,
    p_type_localisation VARCHAR DEFAULT NULL,
    p_logo_restaurant INT DEFAULT NULL,
    p_politique TEXT DEFAULT NULL,
    p_administrateur INT DEFAULT NULL
)
RETURNS TEXT
AS $$
BEGIN
    UPDATE Restaurant
    SET
        nom_restaurant = COALESCE(p_nom_restaurant, nom_restaurant),
        localisation = COALESCE(p_localisation, localisation),
        type_localisation = COALESCE(p_type_localisation, type_localisation),
        logo_restaurant = COALESCE(p_logo_restaurant, logo_restaurant),
        politique = COALESCE(p_politique, politique),
        administrateur = COALESCE(p_administrateur, administrateur),
        updated_at = CURRENT_TIMESTAMP
    WHERE id_restaurant = p_id;

    IF NOT FOUND THEN
        RETURN 'Aucun restaurant trouvé.';
    END IF;

    RETURN 'Restaurant mis à jour avec succès.';
END;
$$ LANGUAGE plpgsql;


-- #############################################################
-- Fonction 5 : Supprimer un restaurant
-- #############################################################
CREATE OR REPLACE FUNCTION delete_restaurant(p_id INT)
RETURNS TEXT
AS $$
BEGIN
    DELETE FROM Restaurant WHERE id_restaurant = p_id;

    IF NOT FOUND THEN
        RETURN 'Aucun restaurant trouvé.';
    END IF;

    RETURN 'Restaurant supprimé avec succès.';
END;
$$ LANGUAGE plpgsql;