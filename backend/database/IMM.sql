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