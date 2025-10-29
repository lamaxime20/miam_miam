CREATE OR REPLACE FUNCTION get_monthly_revenue(p_restaurant_id INT, p_months INT DEFAULT 10)
RETURNS TABLE(month_label TEXT, revenus NUMERIC, commandes INT) AS $$
WITH months AS (
  SELECT (date_trunc('month', CURRENT_DATE) - (i || ' months')::interval)::date AS month_start
  FROM generate_series(0, GREATEST(p_months - 1,0)) AS i
), sales AS (
  SELECT
    date_trunc('month', c.date_commande)::date AS month_start,
    SUM(ct.quantite * ct.prix_unitaire)::numeric(14,2) AS revenu,
    COUNT(DISTINCT c.id_commande) AS commandes
  FROM Contenir ct
  JOIN Menu m ON m.id_menu = ct.id_menu AND m.restaurant_hote = p_restaurant_id
  JOIN Commande c ON c.id_commande = ct.id_commande
  JOIN Paiement p ON p.id_commande = c.id_commande
  WHERE p.statut_paiement = 'reussi'
  GROUP BY date_trunc('month', c.date_commande)
)
SELECT to_char(m.month_start, 'Mon') AS month_label,
       COALESCE(s.revenu, 0)::numeric(14,2) AS revenus,
       COALESCE(s.commandes, 0) AS commandes
FROM months m
LEFT JOIN sales s USING (month_start)
ORDER BY m.month_start;
$$ LANGUAGE sql STABLE;


CREATE OR REPLACE FUNCTION get_category_distribution(p_restaurant_id INT)
RETURNS TABLE(name TEXT, value NUMERIC) AS $$
SELECT coalesce(m.libelle_menu::text, 'Autre') AS name,
       ROUND(100.0 * SUM(ct.quantite)::numeric / NULLIF(total.total_qte,0),2) AS value
FROM Contenir ct
JOIN Menu m ON m.id_menu = ct.id_menu AND m.restaurant_hote = p_restaurant_id
JOIN (
  SELECT SUM(ct2.quantite) AS total_qte
  FROM Contenir ct2
  JOIN Menu m2 ON m2.id_menu = ct2.id_menu AND m2.restaurant_hote = p_restaurant_id
  JOIN Commande c2 ON c2.id_commande = ct2.id_commande
  JOIN Paiement p2 ON p2.id_commande = c2.id_commande
  WHERE p2.statut_paiement = 'reussi'
) total ON TRUE
JOIN Commande c ON c.id_commande = ct.id_commande
JOIN Paiement p ON p.id_commande = c.id_commande AND p.statut_paiement = 'reussi'
GROUP BY m.libelle_menu, total.total_qte
ORDER BY value DESC;
$$ LANGUAGE sql STABLE;


CREATE OR REPLACE FUNCTION get_top_products(p_restaurant_id INT, p_limit INT DEFAULT 5)
RETURNS TABLE(name TEXT, sales INT, revenue NUMERIC) AS $$
SELECT m.nom_menu AS name,
       SUM(ct.quantite) AS sales,
       SUM(ct.quantite * ct.prix_unitaire)::numeric(14,2) AS revenue
FROM Contenir ct
JOIN Menu m ON m.id_menu = ct.id_menu AND m.restaurant_hote = p_restaurant_id
JOIN Commande c ON c.id_commande = ct.id_commande
JOIN Paiement p ON p.id_commande = c.id_commande AND p.statut_paiement = 'reussi'
GROUP BY m.nom_menu
ORDER BY sales DESC
LIMIT p_limit;
$$ LANGUAGE sql STABLE;


CREATE OR REPLACE FUNCTION get_hourly_orders(p_restaurant_id INT, p_start_date DATE, p_end_date DATE)
RETURNS TABLE(hour_label TEXT, commandes INT) AS $$
WITH hours AS (
  SELECT generate_series(0,23) AS hr
), orders AS (
  SELECT EXTRACT(HOUR FROM c.date_commande)::int AS hr,
         COUNT(DISTINCT c.id_commande) AS cnt
  FROM Contenir ct
  JOIN Menu m ON m.id_menu = ct.id_menu AND m.restaurant_hote = p_restaurant_id
  JOIN Commande c ON c.id_commande = ct.id_commande
  JOIN Paiement p ON p.id_commande = c.id_commande AND p.statut_paiement = 'reussi'
  WHERE c.date_commande::date BETWEEN p_start_date AND p_end_date
  GROUP BY EXTRACT(HOUR FROM c.date_commande)
)
SELECT (h.hr || 'h')::text AS hour_label,
       COALESCE(o.cnt, 0) AS commandes
FROM hours h
LEFT JOIN orders o ON o.hr = h.hr
ORDER BY h.hr;
$$ LANGUAGE sql STABLE;


CREATE OR REPLACE FUNCTION get_kpis(p_restaurant_id INT, p_start_date DATE, p_end_date DATE)
RETURNS TABLE(total_revenue NUMERIC, total_orders INT, avg_basket NUMERIC, unique_customers INT) AS $$
WITH order_revenues AS (
  SELECT c.id_commande,
         SUM(ct.quantite * ct.prix_unitaire)::numeric(14,2) AS revenue_per_order,
         c.acheteur
  FROM Contenir ct
  JOIN Menu m ON m.id_menu = ct.id_menu AND m.restaurant_hote = p_restaurant_id
  JOIN Commande c ON c.id_commande = ct.id_commande
  JOIN Paiement p ON p.id_commande = c.id_commande AND p.statut_paiement = 'reussi'
  WHERE c.date_commande::date BETWEEN p_start_date AND p_end_date
  GROUP BY c.id_commande, c.acheteur
)
SELECT COALESCE(SUM(revenue_per_order),0)::numeric(14,2) AS total_revenue,
       COALESCE(COUNT(*),0) AS total_orders,
       CASE WHEN COUNT(*) = 0 THEN 0 ELSE ROUND(SUM(revenue_per_order)::numeric / COUNT(*)::numeric,2) END AS avg_basket,
       COALESCE(COUNT(DISTINCT acheteur),0) AS unique_customers
FROM order_revenues;
$$ LANGUAGE sql STABLE;


CREATE OR REPLACE FUNCTION get_monthly_summary(p_restaurant_id INT, p_start_date DATE, p_end_date DATE)
RETURNS TABLE(best_day TEXT, avg_orders INT, peak_hour TEXT, peak_hour_orders INT, satisfaction_percent NUMERIC) AS $$
-- best_day: nom du jour (French) avec le plus d'ordres moyen
WITH orders_by_day AS (
  SELECT to_char(c.date_commande,'Day') AS day_name,
         date_trunc('day', c.date_commande)::date AS day_date,
         COUNT(DISTINCT c.id_commande) AS orders_count
  FROM Contenir ct
  JOIN Menu m ON m.id_menu = ct.id_menu AND m.restaurant_hote = p_restaurant_id
  JOIN Commande c ON c.id_commande = ct.id_commande
  JOIN Paiement p ON p.id_commande = c.id_commande AND p.statut_paiement = 'reussi'
  WHERE c.date_commande::date BETWEEN p_start_date AND p_end_date
  GROUP BY day_name, date_trunc('day', c.date_commande)
), avg_by_dayname AS (
  SELECT trim(day_name) AS day_name, ROUND(AVG(orders_count)::numeric)::int AS avg_orders
  FROM orders_by_day
  GROUP BY day_name
  ORDER BY avg_orders DESC
  LIMIT 1
), orders_by_hour AS (
  SELECT EXTRACT(HOUR FROM c.date_commande)::int AS hr,
         COUNT(DISTINCT c.id_commande) AS orders_count
  FROM Contenir ct
  JOIN Menu m ON m.id_menu = ct.id_menu AND m.restaurant_hote = p_restaurant_id
  JOIN Commande c ON c.id_commande = ct.id_commande
  JOIN Paiement p ON p.id_commande = c.id_commande AND p.statut_paiement = 'reussi'
  WHERE c.date_commande::date BETWEEN p_start_date AND p_end_date
  GROUP BY EXTRACT(HOUR FROM c.date_commande)
  ORDER BY orders_count DESC
  LIMIT 1
),
 menu_ratings AS (
  SELECT avg(n.note_menu)::numeric AS avg_menu_rating
  FROM Noter n
  JOIN Menu m ON m.id_menu = n.id_menu AND m.restaurant_hote = p_restaurant_id
), delivery_ratings AS (
  SELECT avg(l.note_livraison)::numeric AS avg_delivery_rating
  FROM Livraison l
  JOIN Bon_commande b ON b.id_bon = l.bon_associe
  JOIN Commande c ON c.id_commande = b.commande_associe
  JOIN Contenir ct ON ct.id_commande = c.id_commande
  JOIN Menu m2 ON m2.id_menu = ct.id_menu AND m2.restaurant_hote = p_restaurant_id
)
SELECT
  COALESCE(ad.day_name,'N/A') AS best_day,
  COALESCE(ad.avg_orders,0) AS avg_orders,
  COALESCE((CASE WHEN oh.hr IS NULL THEN 'N/A' ELSE (oh.hr||'h') END), 'N/A') AS peak_hour,
  COALESCE(oh.orders_count, 0) AS peak_hour_orders,
  -- satisfaction : si on a au moins une note, on fait (avg_rating / 5) * 100
  COALESCE(ROUND(
    (
      (COALESCE((SELECT avg_menu_rating FROM menu_ratings),0) + COALESCE((SELECT avg_delivery_rating FROM delivery_ratings),0)) / 
      GREATEST( (CASE WHEN (SELECT avg_menu_rating FROM menu_ratings) IS NOT NULL THEN 1 ELSE 0 END) + (CASE WHEN (SELECT avg_delivery_rating FROM delivery_ratings) IS NOT NULL THEN 1 ELSE 0 END), 1)
    )/5.0
  * 100.0, 1), 0) AS satisfaction_percent
FROM avg_by_dayname ad
FULL JOIN orders_by_hour oh ON TRUE
LIMIT 1;
$$ LANGUAGE sql STABLE;


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