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

-- ============================================
--   FONCTION : Récupérer un utilisateur par email
-- ============================================
CREATE OR REPLACE FUNCTION get_utilisateur_par_email(p_email VARCHAR)
RETURNS TABLE (
    id_user INT,
    nom_user VARCHAR(100),
    email_user VARCHAR(255)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id_user,
        u.nom_user::VARCHAR(100),
        u.email_user::VARCHAR(255)
    FROM "Utilisateur" u
    WHERE u.email_user = p_email
    LIMIT 1; -- pour s'assurer qu'on ne récupère qu'un utilisateur
END;
$$ LANGUAGE plpgsql;

-- =============================
--     FONCTIONS CRUD : FILE
-- =============================
-- #############################################################
-- Fonction 1 : Créer un fichier
-- #############################################################
CREATE OR REPLACE FUNCTION creer_file(
    p_nom_fichier Name,
    p_extension VARCHAR(10),
    p_chemin TEXT
)
RETURNS TABLE (id INT, message TEXT)
AS $$
DECLARE
    new_id INT;
BEGIN
    INSERT INTO File (nom_fichier, extension, chemin)
    VALUES (p_nom_fichier, p_extension, p_chemin)
    RETURNING id_file INTO new_id;

    RETURN QUERY SELECT new_id AS id, 'fichier created successfully' AS message;
END;
$$ LANGUAGE plpgsql;

-- #############################################################
-- Fonction 2 : Récupérer tous les fichiers
-- #############################################################
CREATE OR REPLACE FUNCTION get_all_files()
RETURNS TABLE (
    id_file INT,
    nom_fichier Name,
    extension VARCHAR(10),
    chemin TEXT
)
AS $$
BEGIN
    RETURN QUERY
    SELECT f.id_file, f.nom_fichier, f.extension, f.chemin
    FROM File f
    ORDER BY f.id_file;
END;
$$ LANGUAGE plpgsql;

-- #############################################################
-- Fonction 3 : Récupérer un fichier par son ID
-- #############################################################
CREATE OR REPLACE FUNCTION get_one_file(p_id INT)
RETURNS TABLE (
    id_file INT,
    nom_fichier Name,
    extension VARCHAR(10),
    chemin TEXT
)
AS $$
BEGIN
    RETURN QUERY
    SELECT f.id_file, f.nom_fichier, f.extension, f.chemin
    FROM File f
    WHERE f.id_file = p_id;
END;
$$ LANGUAGE plpgsql;

-- #############################################################
-- Fonction 4 : Mettre à jour un fichier
-- #############################################################
CREATE OR REPLACE FUNCTION update_file(
    p_id INT,
    p_nom_fichier Name DEFAULT NULL,
    p_extension VARCHAR(10) DEFAULT NULL,
    p_chemin TEXT DEFAULT NULL
)
RETURNS TEXT
AS $$
BEGIN
    UPDATE File f
    SET
        nom_fichier = COALESCE(p_nom_fichier, nom_fichier),
        extension = COALESCE(p_extension, extension),
        chemin = COALESCE(p_chemin, chemin)
    WHERE f.id_file = p_id;

    IF NOT FOUND THEN
        RETURN 'aucun fichier trouvé';
    END IF;

    RETURN 'fichier updated successfully';
END;
$$ LANGUAGE plpgsql;

-- #############################################################
-- Fonction 5 : Supprimer un fichier
-- #############################################################
CREATE OR REPLACE FUNCTION delete_file(p_id INT)
RETURNS TEXT
AS $$
BEGIN
    DELETE FROM File f WHERE f.id_file = p_id;

    IF NOT FOUND THEN
        RETURN 'aucun fichier trouvé';
    END IF;

    RETURN 'fichier deleted successfully';
END;
$$ LANGUAGE plpgsql;

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

-- ============================================
--   FONCTION 11 : Menus du jour par popularité
-- ============================================
CREATE OR REPLACE FUNCTION get_menus_du_jour_par_popularite()
RETURNS TABLE (
    id INT,
    name Name,
    description TEXT,
    price prices,
    image INT,
    idResto INT,
    rating NUMERIC,
    popular BOOLEAN,
    category typeRepas
) AS $$
BEGIN
    RETURN QUERY
    WITH menu_popularite AS (
        SELECT 
            cmj.id_menu,
            COALESCE(SUM(c.quantite), 0) AS total_commandes
        FROM Choisir_Menu_Jour cmj
        LEFT JOIN Contenir c ON cmj.id_menu = c.id_menu
        WHERE cmj.date_jour = CURRENT_DATE
        GROUP BY cmj.id_menu
    )
    SELECT
        m.id_menu AS id,
        m.nom_menu AS name,
        m.description_menu AS description,
        m.prix_menu AS price,
        m.image_menu AS image,
        m.restaurant_hote AS idResto,
        COALESCE(ROUND(AVG(n.note_menu)::NUMERIC, 2), 0.0) AS rating,
        (ROW_NUMBER() OVER (ORDER BY mp.total_commandes DESC, m.nom_menu ASC) <= 2) AS popular,
        m.libelle_menu as category
    FROM Menu m
    JOIN menu_popularite mp ON m.id_menu = mp.id_menu
    LEFT JOIN Noter n ON m.id_menu = n.id_menu
    GROUP BY m.id_menu, mp.total_commandes
    ORDER BY mp.total_commandes DESC, m.nom_menu ASC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
--   FONCTION : Créer une commande avec ses menus
-- ============================================
CREATE OR REPLACE FUNCTION creer_commande(
    p_date_heure_livraison TIMESTAMP,
    p_localisation_client TEXT,
    p_type_localisation location,
    p_statut_commande commandeState,
    p_acheteur INT,
    p_menus JSON
)
RETURNS INT AS $$
DECLARE
    v_id_commande INT;
    v_menu JSON;
    v_id_menu INT;
    v_quantite INT;
    v_prix_unitaire prices;
BEGIN
    -- 1️⃣ Créer la commande principale
    INSERT INTO Commande (
        date_commande,
        date_heure_livraison,
        localisation_client,
        type_localisation,
        statut_commande,
        acheteur
    )
    VALUES (
        CURRENT_TIMESTAMP,
        p_date_heure_livraison,
        p_localisation_client,
        p_type_localisation,
        p_statut_commande,
        p_acheteur
    )
    RETURNING id_commande INTO v_id_commande;

    -- 2️⃣ Parcourir le JSON contenant les menus
    -- Exemple de JSON attendu :
    -- [
    --   {"id_menu": 2, "quantite": 3, "prix_unitaire": 4500},
    --   {"id_menu": 5, "quantite": 1, "prix_unitaire": 6500}
    -- ]

    FOR v_menu IN SELECT * FROM json_array_elements(p_menus)
    LOOP
        v_id_menu := (v_menu->>'id_menu')::INT;
        v_quantite := (v_menu->>'quantite')::INT;
        v_prix_unitaire := (v_menu->>'prix_unitaire')::prices;

        INSERT INTO Contenir (id_commande, id_menu, quantite, prix_unitaire)
        VALUES (v_id_commande, v_id_menu, v_quantite, v_prix_unitaire);
    END LOOP;

    -- 3️⃣ Retourner l’ID de la commande créée
    RETURN v_id_commande;
END;
$$ LANGUAGE plpgsql;

-- ============================================
--   FONCTION : Récupérer toutes les commandes d’un utilisateur (corrigée)
-- ============================================
CREATE OR REPLACE FUNCTION get_commandes_by_user(p_id_user INT)
RETURNS TABLE (
    id_commande INT,
    date_commande TIMESTAMP,
    date_heure_livraison TIMESTAMP,
    localisation_client TEXT,
    type_localisation location,
    statut_commande commandeState,
    acheteur INT,
    id_menu INT,
    quantite INT,
    prix_unitaire DECIMAL(10,2),
    prix_total DECIMAL(10,2),
    statut TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id_commande,
        c.date_commande,
        c.date_heure_livraison,
        c.localisation_client,
        c.type_localisation,
        c.statut_commande,
        c.acheteur,
        ct.id_menu,
        ct.quantite,
        ct.prix_unitaire::DECIMAL(10,2),  -- ✅ conversion explicite
        (ct.quantite * ct.prix_unitaire)::DECIMAL(10,2) AS prix_total,

        CASE
            WHEN c.statut_commande = 'annulé'
              OR bc.statut_bon = 'annulé'
              OR l.statut_livraison = 'annulé'
              THEN 'annulé'

            WHEN c.statut_commande = 'en cours'
              AND (bc.statut_bon IS NULL OR bc.statut_bon = 'initial')
              THEN 'initial'

            WHEN c.statut_commande = 'valide'
              AND bc.statut_bon = 'en cours'
              THEN 'en cours'

            WHEN c.statut_commande = 'valide'
              AND bc.statut_bon = 'valide'
              AND (l.statut_livraison = 'en cours' OR l.statut_livraison IS NULL)
              THEN 'en cours de livraison'

            WHEN c.statut_commande = 'valide'
              AND bc.statut_bon = 'valide'
              AND l.statut_livraison = 'valide'
              THEN 'livré'

            ELSE 'initial'
        END AS statut

    FROM Commande c
    LEFT JOIN Contenir ct ON c.id_commande = ct.id_commande
    LEFT JOIN Bon_commande bc ON c.id_commande = bc.commande_associe
    LEFT JOIN Livraison l ON bc.id_bon = l.bon_associe
    WHERE c.acheteur = p_id_user
    ORDER BY c.date_commande DESC, c.id_commande, ct.id_menu;
END;
$$ LANGUAGE plpgsql;
