--Fonctions CRUD--
--Table "Utilisateur"--
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

-- Verifier si l'email existe
CREATE OR REPLACE FUNCTION verifier_email_existant(p_email Email)
RETURNS BOOLEAN AS $$
DECLARE
    v_count INT;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM "Utilisateur"
    WHERE email_user = p_email;

    IF v_count > 0 THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Verifier si le password est correct
CREATE OR REPLACE FUNCTION verifier_password_correct(p_email Email, p_password Motpasse)
RETURNS BOOLEAN AS $$
DECLARE
    v_count INT;
BEGIN
    SELECT COUNT(Email) INTO v_count
    FROM "Utilisateur"
    WHERE email_user = p_email AND password_user = p_password;

    IF v_count > 0 THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =============================
--     FONCTIONS CRUD : FILE
-- =============================
-- #############################################################
-- Fonction 1 : Créer un fichier
-- #############################################################
CREATE OR REPLACE FUNCTION insert_file(
    p_nom_fichier NAME,
    p_extension VARCHAR(10),
    p_chemin TEXT
)
RETURNS TABLE(
    id_file INTEGER,
    nom_fichier NAME,
    extension VARCHAR(10),
    chemin TEXT
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    INSERT INTO file (nom_fichier, extension, chemin)
    VALUES (p_nom_fichier, p_extension, p_chemin)
    RETURNING file.id_file, file.nom_fichier, file.extension, file.chemin;
END;
$$;

CREATE OR REPLACE FUNCTION get_file_by_id(p_id_file INTEGER)
RETURNS TABLE(
    id_file INTEGER,
    nom_fichier NAME,
    extension VARCHAR(10),
    chemin TEXT
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT f.id_file, f.nom_fichier, f.extension, f.chemin
    FROM file f
    WHERE f.id_file = p_id_file;
END;
$$;

CREATE OR REPLACE FUNCTION get_all_files()
RETURNS TABLE(
    id_file INTEGER,
    nom_fichier NAME,
    extension VARCHAR(10),
    chemin TEXT
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT f.id_file, f.nom_fichier, f.extension, f.chemin
    FROM file f
    ORDER BY f.id_file;
END;
$$;

CREATE OR REPLACE FUNCTION delete_file(p_id_file INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    rows_deleted INTEGER;
BEGIN
    DELETE FROM file 
    WHERE id_file = p_id_file;
    
    GET DIAGNOSTICS rows_deleted = ROW_COUNT;
    
    RETURN rows_deleted > 0;
END;
$$;

CREATE OR REPLACE FUNCTION file_exists(p_id_file INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    file_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO file_count
    FROM file
    WHERE id_file = p_id_file;
    
    RETURN file_count > 0;
END;
$$;

-- ==============================================
-- FONCTION : lister_menu_du_jour()
-- ==============================================
CREATE OR REPLACE FUNCTION lister_menu_du_jour()
RETURNS TABLE (
    id INT,
    name VARCHAR(100),
    image INT,
    description TEXT,
    price DECIMAL(10,2),
    rating DECIMAL(3,2),
    nomResto VARCHAR(255)
)
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id_menu AS id,
        m.nom_menu::VARCHAR(100) AS name,      -- cast explicite Name -> VARCHAR
        m.image_menu AS image,
        m.description_menu AS description,
        m.prix_menu::DECIMAL(10,2) AS price,  -- cast explicite prices -> DECIMAL
        COALESCE(ROUND(AVG(n.note_menu)::NUMERIC, 2), 0) AS rating,
        r.nom_restaurant::VARCHAR(255) AS nomResto
    FROM Menu m
    JOIN Choisir_Menu_Jour cmj ON cmj.id_menu = m.id_menu
    JOIN Restaurant r ON r.id_restaurant = m.restaurant_hote
    LEFT JOIN Noter n ON n.id_menu = m.id_menu
    WHERE cmj.date_jour = CURRENT_DATE
    GROUP BY m.id_menu, m.nom_menu, m.image_menu, m.description_menu, 
             m.prix_menu, r.id_restaurant
    ORDER BY rating DESC, m.nom_menu ASC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
--   FONCTION 1 : Nombre de points de fidélité
-- ============================================
CREATE OR REPLACE FUNCTION get_points_fidelite_client(p_id_client INT)
RETURNS INT
AS $$
DECLARE
    v_points INT;
BEGIN
    SELECT c.fidelity
    INTO v_points
    FROM Client c
    WHERE c.id_user = p_id_client;

    RETURN COALESCE(v_points, 0);
END;
$$ LANGUAGE plpgsql;


-- ============================================
--   FONCTION 2 : Nombre total de commandes du client
-- ============================================
CREATE OR REPLACE FUNCTION get_nombre_commandes_client(p_id_client INT)
RETURNS INT
AS $$
DECLARE
    v_total INT;
BEGIN
    SELECT COUNT(*)
    INTO v_total
    FROM Commande cmd
    WHERE cmd.acheteur = p_id_client; -- ✅ Correction du nom de colonne

    RETURN COALESCE(v_total, 0);
END;
$$ LANGUAGE plpgsql;


-- ============================================
--   FONCTION 3 : Nombre de filleuls d'un client
-- ============================================
CREATE OR REPLACE FUNCTION get_nombre_filleuls_client(p_id_client INT)
RETURNS INT
AS $$
DECLARE
    v_filleuls INT;
BEGIN
    SELECT COUNT(*)
    INTO v_filleuls
    FROM Client c
    WHERE c.parrain = p_id_client;

    RETURN COALESCE(v_filleuls, 0);
END;
$$ LANGUAGE plpgsql;


-- ============================================
--   FONCTION 4 : Statistiques du dashboard client
-- ============================================
CREATE OR REPLACE FUNCTION get_dashboard_stats_client(p_id_client INT)
RETURNS TABLE (
    points_fidelite INT,
    nombre_commandes INT,
    nombre_filleuls INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(c.fidelity, 0) AS points_fidelite,
        COALESCE(get_nombre_commandes_client(p_id_client), 0) AS nombre_commandes,
        COALESCE(get_nombre_filleuls_client(p_id_client), 0) AS nombre_filleuls
    FROM Client c
    WHERE c.id_user = p_id_client;
END;
$$ LANGUAGE plpgsql;


-- ============================================
--   FONCTION 5 : Obtenir les promotions actives
-- ============================================
CREATE OR REPLACE FUNCTION get_promotions_actives()
RETURNS TABLE (
    id_promo INT,
    titre VARCHAR(100),
    description_promotion TEXT,
    pourcentage_reduction DECIMAL(5,2),
    date_debut TIMESTAMP,
    date_fin TIMESTAMP,
    image_promo INT,
    nom_menu VARCHAR(100),
    prix_original DECIMAL(10,2),
    prix_reduit DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id_promo,
        p.titre::VARCHAR(100),
        p.description_promotion,
        p.pourcentage_reduction,
        p.date_debut,
        p.date_fin,
        p.image_promo,
        m.nom_menu::VARCHAR(100),
        m.prix_menu::numeric(10,2) AS prix_original,  -- ✅ cast ajouté
        ROUND((m.prix_menu::numeric(10,2)) * (1 - p.pourcentage_reduction/100), 2) AS prix_reduit
    FROM Promotion p
    LEFT JOIN Concerner_menu cm ON cm.id_promo = p.id_promo
    LEFT JOIN Menu m ON m.id_menu = cm.id_menu
    WHERE p.date_debut <= CURRENT_TIMESTAMP 
      AND p.date_fin >= CURRENT_TIMESTAMP
    ORDER BY p.date_debut DESC;
END;
$$ LANGUAGE plpgsql;


-- ============================================
--   FONCTION 6 : Commandes récentes du client
-- ============================================
CREATE OR REPLACE FUNCTION get_commandes_recentes_client(p_id_client INT, p_limit INT DEFAULT 5)
RETURNS TABLE (
    id_commande INT,
    date_commande TIMESTAMP,
    statut_commande VARCHAR(50),
    montant_total DECIMAL(10,2),
    liste_menus TEXT,
    nom_restaurant VARCHAR(100)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id_commande,
        c.date_commande,
        c.statut_commande::VARCHAR(50),
        COALESCE(SUM(ct.quantite * (ct.prix_unitaire::numeric(10,2))), 0) AS montant_total,
        STRING_AGG(m.nom_menu::VARCHAR(100), ', ' ORDER BY m.nom_menu) AS liste_menus,
        r.nom_restaurant::VARCHAR(100) AS nom_restaurant
    FROM Commande c
    LEFT JOIN Contenir ct ON ct.id_commande = c.id_commande
    LEFT JOIN Menu m ON m.id_menu = ct.id_menu
    LEFT JOIN Restaurant r ON r.id_restaurant = m.restaurant_hote
    WHERE c.acheteur = p_id_client
    GROUP BY c.id_commande, c.date_commande, c.statut_commande, r.nom_restaurant
    ORDER BY c.date_commande DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;


-- ============================================
--   FONCTION 7 : Notifications d’un client
-- ============================================
CREATE OR REPLACE FUNCTION get_notifications_client(p_id_client INT)
RETURNS TABLE (
    id_notification INT,
    message_notification TEXT,
    date_notif TIMESTAMP,
    ouvert BOOLEAN,
    nom_restaurant VARCHAR(100)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.id_notification,
        n.message_notification,
        n.date_notif,
        COALESCE(cn.ouvert, FALSE) AS ouvert,
        r.nom_restaurant::VARCHAR(100) AS nom_restaurant
    FROM Notifications n
    JOIN Restaurant r ON r.id_restaurant = n.restaurant_auteur
    LEFT JOIN Cible_Notifications cn ON cn.id_notification = n.id_notification 
        AND cn.id_cible = p_id_client
    WHERE cn.id_cible = p_id_client OR cn.id_cible IS NULL
    ORDER BY n.date_notif DESC;
END;
$$ LANGUAGE plpgsql;


-- ============================================
--   FONCTION 8 : Détails de fidélité du client
-- ============================================
CREATE OR REPLACE FUNCTION get_details_fidelite_client(p_id_client INT)
RETURNS TABLE (
    points_actuels INT,
    points_pour_repas_gratuit INT,
    pourcentage_progression DECIMAL(5,2),
    nombre_filleuls INT,
    dernier_changement TIMESTAMP,
    derniere_raison VARCHAR(255)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(c.fidelity, 0) AS points_actuels,
        1500 AS points_pour_repas_gratuit,
        CASE 
            WHEN COALESCE(c.fidelity, 0) >= 1500 THEN 100.00
            ELSE ROUND((COALESCE(c.fidelity, 0)::DECIMAL / 1500.0) * 100, 2)
        END AS pourcentage_progression,
        COALESCE(get_nombre_filleuls_client(p_id_client), 0) AS nombre_filleuls,
        hf.date_changement AS dernier_changement,
        hf.raison AS derniere_raison
    FROM Client c
    LEFT JOIN Historique_fidelite hf ON hf.id_client = c.id_user
    WHERE c.id_user = p_id_client
    ORDER BY hf.date_changement DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;


-- ============================================
--   FONCTION 9 : Top des clients
-- ============================================
CREATE OR REPLACE FUNCTION get_top_clients(p_limit INT DEFAULT 10)
RETURNS TABLE (
    id_client INT,
    nom_client VARCHAR(100),
    email_client VARCHAR(255),
    points_fidelite INT,
    nombre_commandes INT,
    montant_total DECIMAL(10,2),
    restaurant_prefere VARCHAR(100)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id_user AS id_client,
        u.nom_user::VARCHAR(100) AS nom_client,
        u.email_user::VARCHAR(255) AS email_client,
        COALESCE(c.fidelity, 0) AS points_fidelite,
        COALESCE(get_nombre_commandes_client(c.id_user), 0) AS nombre_commandes,
        COALESCE(SUM(ct.quantite * (ct.prix_unitaire::numeric(10,2))), 0) AS montant_total,
        r.nom_restaurant::VARCHAR(100) AS restaurant_prefere
    FROM Client c
    JOIN "Utilisateur" u ON u.id_user = c.id_user
    LEFT JOIN Commande cmd ON cmd.acheteur = c.id_user
    LEFT JOIN Contenir ct ON ct.id_commande = cmd.id_commande
    LEFT JOIN Menu m ON m.id_menu = ct.id_menu
    LEFT JOIN Restaurant r ON r.id_restaurant = m.restaurant_hote
    GROUP BY c.id_user, u.nom_user, u.email_user, c.fidelity, r.nom_restaurant
    ORDER BY montant_total DESC, points_fidelite DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;


-- ============================================
--   FONCTION 10 : Marquer une notification comme lue
-- ============================================
CREATE OR REPLACE FUNCTION marquer_notification_lue(p_id_notification INT, p_id_client INT)
RETURNS BOOLEAN AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM Cible_Notifications 
        WHERE id_notification = p_id_notification AND id_cible = p_id_client
    ) THEN
        UPDATE Cible_Notifications 
        SET ouvert = TRUE 
        WHERE id_notification = p_id_notification AND id_cible = p_id_client;
        RETURN TRUE;
    ELSE
        INSERT INTO Cible_Notifications (id_notification, id_cible, ouvert)
        VALUES (p_id_notification, p_id_client, TRUE);
        RETURN TRUE;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
--   FONCTION 12 : Récupérer le restaurant d'un menu
-- ============================================
CREATE OR REPLACE FUNCTION get_restaurant_by_menu_id(p_id_menu INT)
RETURNS TABLE (
    id_menu INT,
    nom_menu VARCHAR(100),
    prix_menu DECIMAL(10,2),
    description_menu TEXT,
    image_menu INT,
    id_restaurant INT,
    nom_restaurant VARCHAR(100),
    localisation VARCHAR(255)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id_menu,
        m.nom_menu::VARCHAR(100),
        m.prix_menu::DECIMAL(10,2),
        m.description_menu,
        m.image_menu,
        r.id_restaurant,
        r.nom_restaurant::VARCHAR(100),
        r.localisation::VARCHAR(255)
    FROM Menu m
    JOIN Restaurant r ON r.id_restaurant = m.restaurant_hote
    WHERE m.id_menu = p_id_menu;
END;
$$ LANGUAGE plpgsql;