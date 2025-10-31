-- ============================================================
-- IMM2.sql : Fonctions PostgreSQL pour Fidélité & Parrainage
-- Dépendances: schéma de miamMiam.sql et fonctions de IMM.sql
-- ============================================================

-- 1) Alias de compatibilité pour le controller existant
-- Le controller appelle: SELECT get_points_fidelite(?)
-- Or la fonction existante s'appelle: get_points_fidelite_client
CREATE OR REPLACE FUNCTION get_points_fidelite(p_id_client INT)
RETURNS INT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN get_points_fidelite_client(p_id_client);
END;
$$;

-- 2) Récupérer ou générer un code de parrainage unique pour un client
CREATE OR REPLACE FUNCTION get_or_create_referral_code(p_id_client INT)
RETURNS VARCHAR
LANGUAGE plpgsql
AS $$
DECLARE
  v_code VARCHAR(50);
  try_count INT := 0;
BEGIN
  SELECT code_parrainage INTO v_code
  FROM Client
  WHERE id_user = p_id_client;

  IF v_code IS NOT NULL AND v_code <> '' THEN
    RETURN v_code;
  END IF;

  -- Générer jusqu'à trouver un code unique (sécurisé par UNIQUE constraint client_cc1)
  LOOP
    try_count := try_count + 1;
    v_code := UPPER(substr(md5(random()::text), 1, 8));
    BEGIN
      UPDATE Client
      SET code_parrainage = v_code
      WHERE id_user = p_id_client;

      IF FOUND THEN
        RETURN v_code;
      END IF;

      -- Si aucun client, on stoppe proprement
      RAISE EXCEPTION 'Client % introuvable', p_id_client;
    EXCEPTION WHEN unique_violation THEN
      -- Collision, on retente
      IF try_count > 10 THEN
        RAISE EXCEPTION 'Impossible de générer un code parrainage unique';
      END IF;
    END;
  END LOOP;

  RETURN v_code; -- ne doit pas être atteint
END;
$$;

-- 3) Liste des filleuls d’un client, avec statut d’activité et points attribuables
-- Actif = au moins une commande validée
-- Points = 200 si actif, sinon 0
CREATE OR REPLACE FUNCTION get_referrals_client(p_id_client INT)
RETURNS TABLE (
  id_filleul INT,
  nom_filleul VARCHAR,
  date_inscription TIMESTAMP,
  actif BOOLEAN,
  points INT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id_user AS id_filleul,
    u.nom_user::VARCHAR AS nom_filleul,
    u.date_inscription,
    EXISTS (
      SELECT 1
      FROM Commande cmd
      WHERE cmd.acheteur = c.id_user
        AND cmd.statut_commande = 'validée'
      LIMIT 1
    ) AS actif,
    CASE
      WHEN EXISTS (
        SELECT 1
        FROM Commande cmd
        WHERE cmd.acheteur = c.id_user
          AND cmd.statut_commande = 'validée'
        LIMIT 1
      ) THEN 200
      ELSE 0
    END AS points
  FROM Client c
  JOIN "Utilisateur" u ON u.id_user = c.id_user
  WHERE c.parrain = p_id_client
  ORDER BY u.date_inscription DESC;
END;
$$;

-- 4) Résumé du parrainage d’un client (code + totaux)
CREATE OR REPLACE FUNCTION get_referral_summary(p_id_client INT)
RETURNS TABLE (
  code VARCHAR,
  total_points_referrals INT,
  total_filleuls INT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_code VARCHAR;
BEGIN
  -- Récupérer ou générer le code de parrainage
  v_code := get_or_create_referral_code(p_id_client);

  RETURN QUERY
  WITH referrals AS (
    SELECT *
    FROM get_referrals_client(p_id_client)
  )
  SELECT
    v_code AS code,
    COALESCE(SUM(ref.points)::INT, 0) AS total_points_referrals,  -- cast en INT
    COALESCE(COUNT(*)::INT, 0) AS total_filleuls                 -- cast en INT
  FROM referrals ref;
END;
$$;

-- 5) Bonus quotidien: crédite une seule fois par jour
-- Note: Historique_fidelite.restaurant est NOT NULL, on exige p_restaurant
CREATE OR REPLACE FUNCTION claim_daily_bonus(
  p_id_client INT,
  p_restaurant INT,
  p_points INT DEFAULT 10
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_already_claimed BOOLEAN;
BEGIN
  -- Vérifier si déjà réclamé aujourd’hui
  SELECT EXISTS (
    SELECT 1
    FROM Historique_fidelite hf
    WHERE hf.id_client = p_id_client
      AND hf.raison = 'bonus_quotidien'
      AND date_trunc('day', hf.date_changement) = date_trunc('day', CURRENT_TIMESTAMP)
  ) INTO v_already_claimed;

  IF v_already_claimed THEN
    RETURN FALSE;
  END IF;

  -- Créditer le client
  UPDATE Client
  SET fidelity = fidelity + p_points
  WHERE id_user = p_id_client;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Client % introuvable', p_id_client;
  END IF;

  -- Historiser
  INSERT INTO Historique_fidelite (id_client, changement, raison, restaurant)
  VALUES (p_id_client, p_points, 'bonus_quotidien', p_restaurant);

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    -- En cas d’erreur, on peut choisir de rollbacker implicitement la transaction
    -- et renvoyer FALSE pour signaler l’échec à l’API.
    RETURN FALSE;
END;
$$;

-- 6) [Optionnel] Crédit parrainage à la 1ère commande validée d’un filleul
-- Utilisable dans un trigger/processus métier de validation de commande
CREATE OR REPLACE FUNCTION award_referral_points_if_applicable(
  p_id_filleul INT,
  p_restaurant INT,
  p_points INT DEFAULT 200
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_parrain INT;
  v_deja_valide BOOLEAN;
BEGIN
  -- Trouver le parrain du filleul
  SELECT parrain INTO v_parrain
  FROM Client
  WHERE id_user = p_id_filleul;

  IF v_parrain IS NULL THEN
    RETURN;
  END IF;

  -- Si le filleul a déjà une commande validée avant celle-ci, ne pas re-créditer
  SELECT EXISTS (
    SELECT 1
    FROM Commande cmd
    WHERE cmd.acheteur = p_id_filleul
      AND cmd.statut_commande = 'validée'
    LIMIT 1
  ) INTO v_deja_valide;

  IF v_deja_valide THEN
    RETURN;
  END IF;

  -- Créditer le parrain
  UPDATE Client
  SET fidelity = fidelity + p_points
  WHERE id_user = v_parrain;

  -- Historiser côté parrain
  INSERT INTO Historique_fidelite (id_client, changement, raison, restaurant)
  VALUES (v_parrain, p_points, 'parrainage', p_restaurant);
END;
$$;

-- ============================================================
-- 7) Réclamations: création
-- ============================================================
CREATE OR REPLACE FUNCTION create_reclamation(
    p_message TEXT,
    p_restaurant_cible INT,
    p_acheteur INT
)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE v_id INT;
BEGIN
  INSERT INTO Reclamation (
    message_reclamation,
    date_soummission,
    statut_reclamation,
    restaurant_cible,
    acheteur
  ) VALUES (
    p_message,
    CURRENT_TIMESTAMP,
    'ouverte',
    p_restaurant_cible,
    p_acheteur
  ) RETURNING id_reclamation INTO v_id;

  RETURN v_id;
END;
$$;

-- ============================================================
-- 8) Réclamations: liste par client
-- ============================================================
CREATE OR REPLACE FUNCTION list_reclamations_by_client(p_id_client INT)
RETURNS TABLE(
  id_reclamation INT,
  message_reclamation TEXT,
  date_soummission TIMESTAMP,
  statut_reclamation VARCHAR,
  restaurant_cible INT,
  nom_restaurant VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT r.id_reclamation,
         r.message_reclamation,
         r.date_soummission,
         r.statut_reclamation::VARCHAR,
         r.restaurant_cible,
         rest.nom_restaurant::VARCHAR
  FROM Reclamation r
  JOIN Restaurant rest ON rest.id_restaurant = r.restaurant_cible
  WHERE r.acheteur = p_id_client
  ORDER BY r.date_soummission DESC;
END;
$$;

-- ============================================================
-- 9) Réclamations: liste par restaurant
-- ============================================================
CREATE OR REPLACE FUNCTION list_reclamations_by_restaurant(p_id_restaurant INT)
RETURNS TABLE(
  id_reclamation INT,
  message_reclamation TEXT,
  date_soummission TIMESTAMP,
  statut_reclamation VARCHAR,
  acheteur INT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT r.id_reclamation,
         r.message_reclamation,
         r.date_soummission,
         r.statut_reclamation::VARCHAR,
         r.acheteur
  FROM Reclamation r
  WHERE r.restaurant_cible = p_id_restaurant
  ORDER BY r.date_soummission DESC;
END;
$$;

-- ============================================================
-- 10) Réclamations: détail + réponses
-- ============================================================
CREATE OR REPLACE FUNCTION get_reclamation_with_responses(p_id_reclamation INT)
RETURNS TABLE(
  id_reclamation INT,
  message_reclamation TEXT,
  date_soummission TIMESTAMP,
  statut_reclamation VARCHAR,
  restaurant_cible INT,
  acheteur INT,
  id_reponse INT,
  message_reponse TEXT,
  statut_reponse VARCHAR,
  auteur INT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT r.id_reclamation,
         r.message_reclamation,
         r.date_soummission,
         r.statut_reclamation::VARCHAR,
         r.restaurant_cible,
         r.acheteur,
         rp.id_reponse,
         rp.message_reponse,
         rp.statut_reponse::VARCHAR,
         rp.auteur
  FROM Reclamation r
  LEFT JOIN Reponse rp ON rp.reclamation_cible = r.id_reclamation
  WHERE r.id_reclamation = p_id_reclamation
  ORDER BY rp.id_reponse ASC;
END;
$$;

-- ============================================================
-- 11) Réponses: ajout (et passe réclamation en traitement si besoin)
-- ============================================================
CREATE OR REPLACE FUNCTION add_reponse(
  p_reclamation_id INT,
  p_message TEXT,
  p_auteur INT,
  p_statut reclamationState DEFAULT 'en_traitement'
)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE v_id INT;
BEGIN
  INSERT INTO Reponse (statut_reponse, reclamation_cible, auteur, message_reponse)
  VALUES (COALESCE(p_statut, 'en_traitement'), p_reclamation_id, p_auteur, p_message)
  RETURNING id_reponse INTO v_id;

  UPDATE Reclamation
  SET statut_reclamation = CASE
      WHEN statut_reclamation = 'fermée' THEN 'fermée'
      ELSE 'en_traitement'
  END
  WHERE id_reclamation = p_reclamation_id;

  RETURN v_id;
END;
$$;

-- ============================================================
-- 12) Réclamations: mise à jour du statut
-- ============================================================
CREATE OR REPLACE FUNCTION update_reclamation_status(
  p_id_reclamation INT,
  p_statut reclamationState
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE Reclamation
  SET statut_reclamation = p_statut
  WHERE id_reclamation = p_id_reclamation;
END;
$$;

-- ============================================================
-- 13) Réclamations: clôture
-- ============================================================
CREATE OR REPLACE FUNCTION close_reclamation(p_id_reclamation INT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE Reclamation
  SET statut_reclamation = 'fermée'
  WHERE id_reclamation = p_id_reclamation;
END;
$$;

-- =================================================================
-- 1. Compter le nombre de commandes du jour pour un restaurant spécifique
-- =================================================================
CREATE OR REPLACE FUNCTION get_daily_orders_count(p_id_restaurant INT)
RETURNS INTEGER AS $$
DECLARE
    order_count INTEGER;
BEGIN
    SELECT COUNT(*)::INTEGER
    INTO order_count
    FROM Commande c
    JOIN Contenir ct ON c.id_commande = ct.id_commande
    JOIN Menu m ON ct.id_menu = m.id_menu
    WHERE DATE(c.date_commande) = CURRENT_DATE
      AND m.restaurant_hote = p_id_restaurant;

    RETURN COALESCE(order_count, 0);
END;
$$ LANGUAGE plpgsql;

-- =================================================================
-- 2. Calculer le chiffre d'affaires total pour les commandes livrées aujourd'hui pour un restaurant spécifique
--    Le CA est calculé sur les commandes avec le statut 'validée' et est la somme
--    des (quantité * prix) de la table "Contenir".
-- =================================================================
CREATE OR REPLACE FUNCTION get_daily_revenue(p_id_restaurant INT)
RETURNS NUMERIC AS $$
DECLARE
    total_revenue NUMERIC;
BEGIN
    SELECT COALESCE(SUM(ct.quantite * ct.prix_unitaire), 0)
    INTO total_revenue
    FROM Commande c
    JOIN Contenir ct ON c.id_commande = ct.id_commande
    JOIN Menu m ON ct.id_menu = m.id_menu
    WHERE DATE(c.date_commande) = CURRENT_DATE
      AND c.statut_commande = 'validée'
      AND m.restaurant_hote = p_id_restaurant;

    RETURN total_revenue;
END;
$$ LANGUAGE plpgsql;

-- =================================================================
-- 3. Compter le nombre de réclamations (tickets) avec le statut 'ouverte' pour un restaurant spécifique
--    Utilise la table "Reclamation" et sa colonne "statut_reclamation".
-- =================================================================
CREATE OR REPLACE FUNCTION get_open_complaints_count(p_id_restaurant INT)
RETURNS INTEGER AS $$
DECLARE
    open_complaints_count INTEGER;
BEGIN
    SELECT COUNT(*)::INTEGER
    INTO open_complaints_count
    FROM Reclamation
    WHERE statut_reclamation = 'ouverte'
      AND restaurant_cible = p_id_restaurant;

    RETURN COALESCE(open_complaints_count, 0);
END;
$$ LANGUAGE plpgsql;

-- =================================================================
-- 4. Compter le nombre d'employés actifs pour un restaurant spécifique
--    Compte les utilisateurs dans la table "Employe" qui ont un statut 'actif'
--    dans la table "Utilisateur".
-- =================================================================
CREATE OR REPLACE FUNCTION get_active_employees_count(p_id_restaurant INT)
RETURNS INTEGER AS $$
DECLARE
    active_employees_count INTEGER;
BEGIN
    SELECT COUNT(DISTINCT u.id_user)::INTEGER
    INTO active_employees_count
    FROM "Utilisateur" u
    WHERE u.statut_account = 'actif'
      AND (
          -- Gérants du restaurant
          EXISTS (SELECT 1 FROM Gerer g WHERE g.id_gerant = u.id_user AND g.id_restaurant = p_id_restaurant AND g.service_employe = TRUE)
          OR
          -- Employés du restaurant
          EXISTS (SELECT 1 FROM Travailler_pour tp WHERE tp.id_employe = u.id_user AND tp.id_restaurant = p_id_restaurant AND tp.service_employe = TRUE)
          OR
          -- Livreurs du restaurant
          EXISTS (SELECT 1 FROM Etre_livreur el WHERE el.id_livreur = u.id_user AND el.id_restaurant = p_id_restaurant AND el.service_employe = TRUE)
      );

    RETURN COALESCE(active_employees_count, 0);
END;
$$ LANGUAGE plpgsql;

-- =================================================================
-- BONUS: Une fonction qui retourne toutes les métriques d'un coup
--        pour optimiser les appels à la base de données.
-- =================================================================
CREATE OR REPLACE FUNCTION get_dashboard_kpis(p_id_restaurant INT)
RETURNS TABLE(daily_orders_count INTEGER, daily_revenue NUMERIC, open_complaints_count INTEGER, active_employees_count INTEGER) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT get_daily_orders_count(p_id_restaurant)),
        (SELECT get_daily_revenue(p_id_restaurant)),
        (SELECT get_open_complaints_count(p_id_restaurant)),
        (SELECT get_active_employees_count(p_id_restaurant));
END;
$$ LANGUAGE plpgsql;