CREATE OR REPLACE FUNCTION get_ventes_aujourdhui()
RETURNS TABLE(
    total_eur DECIMAL(10,2),
    pourcentage_vs_hier DECIMAL(5,2)
) 
LANGUAGE plpgsql
AS $$
DECLARE
    total_aujourdhui DECIMAL(10,2);
    total_hier DECIMAL(10,2);
    date_aujourdhui DATE := CURRENT_DATE;
    date_hier DATE := CURRENT_DATE - INTERVAL '1 day';
BEGIN
    -- Calcul du total des revenus d'aujourd'hui
    SELECT COALESCE(SUM(p.montant), 0)
    INTO total_aujourdhui
    FROM paiement p
    INNER JOIN commande c ON p.id_commande = c.id_commande
    WHERE DATE(p.date_paiement) = date_aujourdhui
    AND p.statut_paiement = 'reussi';
    
    -- Calcul du total des revenus d'hier
    SELECT COALESCE(SUM(p.montant), 0)
    INTO total_hier
    FROM paiement p
    INNER JOIN commande c ON p.id_commande = c.id_commande
    WHERE DATE(p.date_paiement) = date_hier
    AND p.statut_paiement = 'reussi';
    
    -- Calcul du pourcentage de variation
    total_eur := total_aujourdhui;
    
    IF total_hier > 0 THEN
        pourcentage_vs_hier := ROUND(
            ((total_aujourdhui - total_hier) / total_hier * 100)::numeric, 
            2
        );
    ELSE
        -- Si aucun revenu hier mais des revenus aujourd'hui = +100%
        -- Si aucun revenu hier ni aujourd'hui = 0%
        IF total_aujourdhui > 0 THEN
            pourcentage_vs_hier := 100.00;
        ELSE
            pourcentage_vs_hier := 0.00;
        END IF;
    END IF;
    
    RETURN NEXT;
    
EXCEPTION
    WHEN OTHERS THEN
        -- En cas d'erreur, retourner des valeurs par défaut
        total_eur := 0;
        pourcentage_vs_hier := 0;
        RETURN NEXT;
END;
$$;


CREATE OR REPLACE FUNCTION get_stats_dashboard()
RETURNS TABLE(
    ventes_aujourdhui_eur DECIMAL(10,2),
    utilisateurs_actifs BIGINT,
    pourcentage_utilisateurs_ajoutes_ce_mois DECIMAL(5,2),
    reclamations BIGINT,
    pourcentage_reclamation_non_traite_ajoute_ce_mois DECIMAL(5,2),
    points_fidelite BIGINT,
    pourcentage_points_donne_ce_mois DECIMAL(5,2),
    reclamations_non_traitees BIGINT
) 
LANGUAGE plpgsql
AS $$
DECLARE
    debut_mois DATE := DATE_TRUNC('month', CURRENT_DATE);
    debut_mois_precedent DATE := DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month');
    fin_mois_precedent DATE := debut_mois - INTERVAL '1 day';
BEGIN
    -- Ventes aujourd'hui
    SELECT COALESCE(SUM(p.montant), 0)
    INTO ventes_aujourdhui_eur
    FROM paiement p
    INNER JOIN commande c ON p.id_commande = c.id_commande
    WHERE DATE(p.date_paiement) = CURRENT_DATE
    AND p.statut_paiement = 'reussi';

    -- Utilisateurs actifs (ayant une connexion récente)
    SELECT COUNT(*)
    INTO utilisateurs_actifs
    FROM "Utilisateur"
    WHERE last_connexion >= CURRENT_DATE - INTERVAL '30 days'
    AND statut_account = 'actif';

    -- Pourcentage d'utilisateurs ajoutés ce mois vs mois précédent
    WITH users_ce_mois AS (
        SELECT COUNT(*) as count_mois
        FROM "Utilisateur"
        WHERE date_inscription >= debut_mois
    ),
    users_mois_precedent AS (
        SELECT COUNT(*) as count_precedent
        FROM "Utilisateur"
        WHERE date_inscription >= debut_mois_precedent 
        AND date_inscription < debut_mois
    )
    SELECT 
        CASE 
            WHEN u_prec.count_precedent > 0 THEN
                ROUND(((u_mois.count_mois - u_prec.count_precedent)::DECIMAL / u_prec.count_precedent * 100)::numeric, 2)
            WHEN u_mois.count_mois > 0 THEN 100.00
            ELSE 0.00
        END
    INTO pourcentage_utilisateurs_ajoutes_ce_mois
    FROM users_ce_mois u_mois, users_mois_precedent u_prec;

    -- Total des réclamations
    SELECT COUNT(*)
    INTO reclamations
    FROM reclamation
    WHERE date_soummission >= CURRENT_DATE - INTERVAL '30 days';

    -- Réclamations non traitées
    SELECT COUNT(*)
    INTO reclamations_non_traitees
    FROM reclamation
    WHERE statut_reclamation IN ('ouverte', 'en_traitement');

    -- Pourcentage de réclamations non traitées ajoutées ce mois
    WITH reclam_ce_mois AS (
        SELECT COUNT(*) as count_mois
        FROM reclamation
        WHERE date_soummission >= debut_mois
        AND statut_reclamation IN ('ouverte', 'en_traitement')
    ),
    reclam_mois_precedent AS (
        SELECT COUNT(*) as count_precedent
        FROM reclamation
        WHERE date_soummission >= debut_mois_precedent 
        AND date_soummission < debut_mois
        AND statut_reclamation IN ('ouverte', 'en_traitement')
    )
    SELECT 
        CASE 
            WHEN r_prec.count_precedent > 0 THEN
                ROUND(((r_mois.count_mois - r_prec.count_precedent)::DECIMAL / r_prec.count_precedent * 100)::numeric, 2)
            WHEN r_mois.count_mois > 0 THEN 100.00
            ELSE 0.00
        END
    INTO pourcentage_reclamation_non_traite_ajoute_ce_mois
    FROM reclam_ce_mois r_mois, reclam_mois_precedent r_prec;

    -- Points de fidélité totaux
    SELECT COALESCE(SUM(fidelity), 0)
    INTO points_fidelite
    FROM client;

    -- Pourcentage de points donnés ce mois
    WITH points_ce_mois AS (
        SELECT COALESCE(SUM(changement), 0) as points_mois
        FROM historique_fidelite
        WHERE date_changement >= debut_mois
        AND changement > 0
    ),
    points_mois_precedent AS (
        SELECT COALESCE(SUM(changement), 0) as points_precedent
        FROM historique_fidelite
        WHERE date_changement >= debut_mois_precedent 
        AND date_changement < debut_mois
        AND changement > 0
    )
    SELECT 
        CASE 
            WHEN p_prec.points_precedent > 0 THEN
                ROUND(((p_mois.points_mois - p_prec.points_precedent)::DECIMAL / p_prec.points_precedent * 100)::numeric, 2)
            WHEN p_mois.points_mois > 0 THEN 100.00
            ELSE 0.00
        END
    INTO pourcentage_points_donne_ce_mois
    FROM points_ce_mois p_mois, points_mois_precedent p_prec;

    RETURN NEXT;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Valeurs par défaut en cas d'erreur
        ventes_aujourdhui_eur := 0;
        utilisateurs_actifs := 0;
        pourcentage_utilisateurs_ajoutes_ce_mois := 0;
        reclamations := 0;
        pourcentage_reclamation_non_traite_ajoute_ce_mois := 0;
        points_fidelite := 0;
        pourcentage_points_donne_ce_mois := 0;
        reclamations_non_traitees := 0;
        RETURN NEXT;
END;
$$;

CREATE OR REPLACE FUNCTION get_user_distribution()
RETURNS TABLE(
    name TEXT,
    value BIGINT,
    color TEXT
) 
LANGUAGE plpgsql
AS $$
BEGIN
    -- Clients actifs (connexion dans les 30 derniers jours)
    RETURN QUERY 
    SELECT 
        'Clients actifs' as name,
        COUNT(*) as value,
        '#cfbd97' as color
    FROM "Utilisateur" u
    INNER JOIN client c ON u.id_user = c.id_user
    WHERE u.last_connexion >= CURRENT_DATE - INTERVAL '30 days'
    AND u.statut_account = 'actif';

    -- Nouveaux clients (inscrits ce mois)
    RETURN QUERY 
    SELECT 
        'Nouveaux clients' as name,
        COUNT(*) as value,
        '#6b7280' as color
    FROM "Utilisateur" u
    INNER JOIN client c ON u.id_user = c.id_user
    WHERE u.date_inscription >= DATE_TRUNC('month', CURRENT_DATE);

    -- Clients fidèles (plus de 100 points de fidélité)
    RETURN QUERY 
    SELECT 
        'Clients fidèles' as name,
        COUNT(*) as value,
        '#000000' as color
    FROM client
    WHERE fidelity >= 100;

END;
$$;

CREATE OR REPLACE FUNCTION get_recent_orders()
RETURNS TABLE(
    commande_id TEXT,
    amount TEXT,
    status TEXT,
    time_text TEXT,
    status_color TEXT,
    icon_type TEXT
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        '#' || c.id_commande::TEXT as commande_id,
        ROUND(SUM(co.prix_unitaire * co.quantite))::TEXT || ' XAF' as amount,
        CASE 
            WHEN l.statut_livraison = 'validée' THEN 'Livré'
            WHEN l.statut_livraison = 'en_cours' THEN 'En cours'
            ELSE 'Préparation'
        END as status,
        CASE 
            WHEN c.date_commande >= CURRENT_TIMESTAMP - INTERVAL '1 hour' THEN 'il y a ' || EXTRACT(MINUTE FROM (CURRENT_TIMESTAMP - c.date_commande))::INT || ' min'
            WHEN c.date_commande >= CURRENT_TIMESTAMP - INTERVAL '24 hours' THEN 'il y a ' || EXTRACT(HOUR FROM (CURRENT_TIMESTAMP - c.date_commande))::INT || ' h'
            ELSE 'il y a ' || EXTRACT(DAY FROM (CURRENT_TIMESTAMP - c.date_commande))::INT || ' j'
        END as time_text,
        CASE 
            WHEN l.statut_livraison = 'validée' THEN 'bg-green-100 text-green-700'
            WHEN l.statut_livraison = 'en_cours' THEN 'bg-yellow-100 text-yellow-700'
            ELSE 'bg-blue-100 text-blue-700'
        END as status_color,
        CASE 
            WHEN l.statut_livraison = 'validée' THEN 'CheckCircle'
            WHEN l.statut_livraison = 'en_cours' THEN 'Clock'
            ELSE 'Package'
        END as icon_type
    FROM commande c
    INNER JOIN contenir co ON c.id_commande = co.id_commande
    LEFT JOIN bon_commande bc ON c.id_commande = bc.commande_associe
    LEFT JOIN livraison l ON bc.id_bon = l.bon_associe
    WHERE c.date_commande >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
    GROUP BY c.id_commande, c.date_commande, l.statut_livraison
    ORDER BY c.date_commande DESC
    LIMIT 3;

END;
$$;

CREATE OR REPLACE FUNCTION get_recent_complaints()
RETURNS TABLE(
    reclamation_id TEXT,
    title TEXT,
    client TEXT,
    time_text TEXT,
    priority TEXT,
    priority_color TEXT,
    icon TEXT
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        '#' || r.id_reclamation::TEXT as reclamation_id,
        CASE 
            WHEN LENGTH(r.message_reclamation) > 20 THEN 
                SUBSTRING(r.message_reclamation FROM 1 FOR 20) || '...'
            ELSE r.message_reclamation
        END as title,
        'Client: ' || u.nom_user as client,
        CASE 
            WHEN r.date_soummission >= CURRENT_TIMESTAMP - INTERVAL '1 hour' THEN 'il y a ' || EXTRACT(MINUTE FROM (CURRENT_TIMESTAMP - r.date_soummission))::INT || ' min'
            WHEN r.date_soummission >= CURRENT_TIMESTAMP - INTERVAL '24 hours' THEN 'il y a ' || EXTRACT(HOUR FROM (CURRENT_TIMESTAMP - r.date_soummission))::INT || ' h'
            ELSE 'il y a ' || EXTRACT(DAY FROM (CURRENT_TIMESTAMP - r.date_soummission))::INT || ' j'
        END as time_text,
        CASE 
            WHEN r.statut_reclamation = 'ouverte' AND r.date_soummission >= CURRENT_TIMESTAMP - INTERVAL '2 hours' THEN 'Urgent'
            WHEN r.statut_reclamation = 'ouverte' THEN 'Moyen'
            ELSE 'Résolu'
        END as priority,
        CASE 
            WHEN r.statut_reclamation = 'ouverte' AND r.date_soummission >= CURRENT_TIMESTAMP - INTERVAL '2 hours' THEN 'bg-red-100 text-red-700'
            WHEN r.statut_reclamation = 'ouverte' THEN 'bg-yellow-100 text-yellow-700'
            ELSE 'bg-green-100 text-green-700'
        END as priority_color,
        CASE 
            WHEN r.statut_reclamation = 'ouverte' AND r.date_soummission >= CURRENT_TIMESTAMP - INTERVAL '2 hours' THEN 'bg-red-100 text-red-600'
            WHEN r.statut_reclamation = 'ouverte' THEN 'bg-yellow-100 text-yellow-600'
            ELSE 'bg-green-100 text-green-600'
        END as icon
    FROM reclamation r
    INNER JOIN "Utilisateur" u ON r.acheteur = u.id_user
    WHERE r.date_soummission >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
    ORDER BY 
        CASE 
            WHEN r.statut_reclamation = 'ouverte' AND r.date_soummission >= CURRENT_TIMESTAMP - INTERVAL '2 hours' THEN 1
            WHEN r.statut_reclamation = 'ouverte' THEN 2
            ELSE 3
        END,
        r.date_soummission DESC
    LIMIT 3;

END;
$$;

CREATE OR REPLACE FUNCTION get_ventes_semaine()
RETURNS TABLE(
    jour TEXT,
    ventes_eur DECIMAL(10,2)
) 
LANGUAGE plpgsql
AS $$
DECLARE
    debut_semaine DATE := DATE_TRUNC('week', CURRENT_DATE)::DATE;
    jours_semaine TEXT[] := ARRAY['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    i INT;
    date_jour DATE;
BEGIN
    -- Pour chaque jour de la semaine (du lundi au dimanche)
    FOR i IN 0..6 LOOP
        date_jour := debut_semaine + i;
        
        jour := jours_semaine[i + 1]; -- +1 car les arrays commencent à 1 en PostgreSQL
        
        -- Calcul des ventes pour le jour
        SELECT COALESCE(SUM(p.montant), 0)
        INTO ventes_eur
        FROM paiement p
        INNER JOIN commande c ON p.id_commande = c.id_commande
        WHERE DATE(p.date_paiement) = date_jour
        AND p.statut_paiement = 'reussi';
        
        RETURN NEXT;
    END LOOP;
    
EXCEPTION
    WHEN OTHERS THEN
        -- En cas d'erreur, retourner des valeurs par défaut pour tous les jours
        FOR i IN 0..6 LOOP
            jour := jours_semaine[i + 1];
            ventes_eur := 0;
            RETURN NEXT;
        END LOOP;
END;
$$;