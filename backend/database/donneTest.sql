-- -------------------------------
-- Création des catégories de menu si non existantes
-- -------------------------------
INSERT INTO Categorie_menu (libelle, description_categorie)
VALUES 
('entree', 'Entrées diverses'),
('plat', 'Plats principaux'),
('dessert', 'Desserts'),
('boisson', 'Boissons')
ON CONFLICT DO NOTHING;

-- -------------------------------
-- Création d'un fichier de test
-- -------------------------------

-- Supposons que l'id renvoyé est 1
-- Création de l'employé lié
INSERT INTO Employe (id_user)
VALUES (1);


-- -------------------------------
-- Création de 5 menus
-- -------------------------------
INSERT INTO Menu (nom_menu, description_menu, image_menu, prix_menu, fidelity_point, statut_menu, restaurant_hote, libelle_menu)
VALUES
('Menu1', 'Description Menu 1', 1, 2500.00, 10, 'disponible', 1, 'entree'),
('Menu2', 'Description Menu 2', 1, 3000.00, 15, 'disponible', 1, 'plat'),
('Menu3', 'Description Menu 3', 1, 1500.00, 5, 'disponible', 1, 'dessert'),
('Menu4', 'Description Menu 4', 1, 1000.00, 2, 'disponible', 1, 'boisson'),
('Menu5', 'Description Menu 5', 1, 2000.00, 8, 'disponible', 1, 'plat');

-- Supposons que les id_menu générés sont 1,2,3,4,5

-- -------------------------------
-- Création de 5 Choisir_Menu_Jour pour aujourd'hui
-- -------------------------------
INSERT INTO Choisir_Menu_Jour (id_menu, id_employe, date_jour)
VALUES
(1, 1, CURRENT_DATE),
(2, 1, CURRENT_DATE),
(3, 1, CURRENT_DATE),
(4, 1, CURRENT_DATE),
(5, 1, CURRENT_DATE);