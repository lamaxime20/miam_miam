# 📚 Guide de Connexion à la Base de Données

## 🎯 Objectif

Ce guide explique comment connecter le Dashboard Admin aux vraies données de la base de données PostgreSQL.

---

## 📁 Fichiers Importants

### 1. **`dashboard.js`** - Service de données
- **Chemin** : `src/services/dashboard.js`
- **Rôle** : Contient toutes les fonctions pour récupérer les statistiques
- **À faire** : Remplacer les données mockées par des appels API

### 2. **`Dashboard.tsx`** - Composant React
- **Chemin** : `src/pages/Admin/components/Dashboard.tsx`
- **Rôle** : Affiche les statistiques dans l'interface
- **État** : ✅ Déjà configuré pour utiliser le service

---

## 🔧 Étapes de Connexion

### Étape 1️⃣ : Créer l'API Backend (Laravel)

Créer un contrôleur Laravel pour exposer les données :

```php
// backend/app/Http/Controllers/DashboardController.php

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Récupérer les ventes du jour
     * Utilise la fonction PostgreSQL existante : get_ventes_aujourdhui()
     */
    public function getVentesAujourdhui()
    {
        try {
            // Appeler la fonction PostgreSQL
            $result = DB::select('SELECT get_ventes_aujourdhui() as total');
            $total = $result[0]->total ?? 0;
            
            // Calculer le pourcentage vs hier
            $hier = DB::select('
                SELECT COALESCE(SUM(montant), 0) as total
                FROM Paiement
                WHERE DATE(date_paiement) = CURRENT_DATE - INTERVAL \'1 day\'
                AND statut_paiement = \'reussi\'
            ');
            $totalHier = $hier[0]->total ?? 1;
            $pourcentage = (($total - $totalHier) / $totalHier) * 100;
            
            return response()->json([
                'total_eur' => floatval($total),
                'pourcentage_vs_hier' => round($pourcentage, 1)
            ]);
            
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Récupérer les ventes de la semaine
     */
    public function getVentesSemaine()
    {
        try {
            $ventes = DB::select("
                SELECT 
                    CASE EXTRACT(DOW FROM p.date_paiement)
                        WHEN 0 THEN 'Dim'
                        WHEN 1 THEN 'Lun'
                        WHEN 2 THEN 'Mar'
                        WHEN 3 THEN 'Mer'
                        WHEN 4 THEN 'Jeu'
                        WHEN 5 THEN 'Ven'
                        WHEN 6 THEN 'Sam'
                    END as jour,
                    COALESCE(SUM(p.montant), 0) as ventes_eur
                FROM Paiement p
                WHERE p.date_paiement >= CURRENT_DATE - INTERVAL '7 days'
                AND p.statut_paiement = 'reussi'
                GROUP BY EXTRACT(DOW FROM p.date_paiement)
                ORDER BY EXTRACT(DOW FROM p.date_paiement)
            ");
            
            return response()->json($ventes);
            
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Récupérer toutes les statistiques du dashboard
     */
    public function getStatsDashboard()
    {
        try {
            // Utiliser la fonction PostgreSQL existante
            $stats = DB::select('SELECT * FROM get_dashboard_stats()');
            
            // Ventes du jour
            $ventesResult = DB::select('SELECT get_ventes_aujourdhui() as total');
            $ventes = $ventesResult[0]->total ?? 0;
            
            return response()->json([
                'ventes_aujourdhui_eur' => floatval($ventes),
                'utilisateurs_actifs' => $stats[0]->total_clients ?? 0,
                'reclamations' => $stats[0]->total_reclamations ?? 0,
                'points_fidelite' => $stats[0]->total_points_fidelite ?? 0
            ]);
            
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
```

### Étape 2️⃣ : Ajouter les Routes API

Ajouter dans `backend/routes/api.php` :

```php
use App\Http\Controllers\DashboardController;

Route::prefix('dashboard')->group(function () {
    Route::get('/ventes-aujourdhui', [DashboardController::class, 'getVentesAujourdhui']);
    Route::get('/ventes-semaine', [DashboardController::class, 'getVentesSemaine']);
    Route::get('/stats', [DashboardController::class, 'getStatsDashboard']);
});
```

### Étape 3️⃣ : Modifier le Service Frontend

Ouvrir `src/services/dashboard.js` et remplacer les appels mockés :

```javascript
// AVANT (données mockées)
const dataMockee = {
  total_eur: 2847.50,
  pourcentage_vs_hier: 12.3
};

// APRÈS (appel API réel)
const response = await fetch('https://miam-miam-q5x4.onrender.com/api/dashboard/ventes-aujourdhui');
const data = await response.json();
```

**Exemple complet pour `getVentesAujourdhui()` :**

```javascript
export async function getVentesAujourdhui() {
  try {
    // ✅ APPEL API RÉEL
    const response = await fetch('https://miam-miam-q5x4.onrender.com/api/dashboard/ventes-aujourdhui', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Ajouter le token d'authentification si nécessaire
        // 'Authorization': `Bearer ${recupererToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des ventes');
    }
    
    const data = await response.json();
    
    // Conversion EUR -> XAF
    const totalXAF = convertirEURversXAF(data.total_eur);
    
    return {
      total: totalXAF,
      totalFormate: formaterMontantXAF(totalXAF),
      pourcentage_vs_hier: data.pourcentage_vs_hier
    };
    
  } catch (error) {
    console.error('Erreur lors de la récupération des ventes:', error);
    return {
      total: 0,
      totalFormate: formaterMontantXAF(0),
      pourcentage_vs_hier: 0
    };
  }
}
```

---

## 🧪 Tester la Connexion

### 1. Tester l'API Backend

```bash
# Tester les ventes du jour
curl https://miam-miam-q5x4.onrender.com/api/dashboard/ventes-aujourdhui

# Réponse attendue :
# {"total_eur": 2847.50, "pourcentage_vs_hier": 12.3}
```

### 2. Vérifier dans le Frontend

Ouvrir la console du navigateur (F12) et vérifier :
- Les appels API dans l'onglet "Network"
- Les logs dans l'onglet "Console"

---

## 📊 Format des Données

### Ventes Aujourd'hui
```json
{
  "total_eur": 2847.50,
  "pourcentage_vs_hier": 12.3
}
```

### Ventes de la Semaine
```json
[
  { "jour": "Lun", "ventes_eur": 2800 },
  { "jour": "Mar", "ventes_eur": 3200 },
  { "jour": "Mer", "ventes_eur": 2900 },
  { "jour": "Jeu", "ventes_eur": 4500 },
  { "jour": "Ven", "ventes_eur": 5100 },
  { "jour": "Sam", "ventes_eur": 4800 },
  { "jour": "Dim", "ventes_eur": 3500 }
]
```

### Statistiques Dashboard
```json
{
  "ventes_aujourdhui_eur": 2847.50,
  "utilisateurs_actifs": 1234,
  "reclamations": 23,
  "points_fidelite": 45678
}
```

---

## 💰 Conversion EUR → XAF

Le service `dashboard.js` gère automatiquement la conversion :
- **Taux fixe** : 1 EUR = 655.957 XAF
- **Formatage** : Séparateurs de milliers + "XAF"
- **Exemple** : 2847.50 EUR → 1 867 432 XAF

---

## ✅ Checklist de Vérification

- [ ] Backend Laravel configuré avec les routes API
- [ ] Fonctions PostgreSQL testées (get_ventes_aujourdhui, etc.)
- [ ] Service `dashboard.js` modifié avec les vrais appels API
- [ ] CORS configuré sur le backend pour accepter les requêtes du frontend
- [ ] Tests effectués dans la console du navigateur
- [ ] Montants affichés en XAF dans l'interface

---

## 🚨 Problèmes Courants

### Erreur CORS
```javascript
// Ajouter dans backend/config/cors.php
'paths' => ['api/*'],
'allowed_origins' => ['http://localhost:5173'],
```

### Token d'authentification
```javascript
// Ajouter le token dans les headers
headers: {
  'Authorization': `Bearer ${recupererToken()}`
}
```

### Données nulles
Vérifier que :
- La table `Paiement` contient des données
- Le statut est bien `'reussi'`
- Les dates sont correctes

---

## 📞 Besoin d'Aide ?

Si tu rencontres un problème :
1. Vérifie les logs Laravel : `backend/storage/logs/laravel.log`
2. Vérifie la console du navigateur (F12)
3. Teste les requêtes SQL directement dans pgAdmin

Bon courage ! 🚀
