<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\reponse;
use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Mail;
use App\Mail\UserVerificationMail;
use App\Models\User;

class UtilisateurController extends Controller
{
    public function index()
    {
        $utilisateurs = DB::select('SELECT * FROM lister_utilisateurs()');
        return response()->json($utilisateurs);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:100',
            'email' => [
                'required',
                'email',
                'max:255',
                'unique:Utilisateur,email_user'
            ],
            'mot_de_passe' => 'required|string|min:6|max:255',
            'telephone' => [
                'required',
                'regex:/^\+?[0-9\s\-()]{7,20}$/'
            ],
            'userState' => 'required|in:actif,inactif,suspendu',
        ]);

        $utilisateurs = DB::select('SELECT * FROM ajouter_utilisateur(?, ?, ?, ?, ?)', [
            $validated['nom'],
            $validated['email'],
            Hash::make($validated['mot_de_passe']),
            $validated['telephone'],
            $validated['userState'],
        ]);

        return response()->json($utilisateurs, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $utilisateurs = DB::select('SELECT * FROM obtenir_utilisateur_par_id(?)', [$id]);
        if (empty($utilisateurs)) {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        // Renvoie directement le premier élément du tableau
        return response()->json($utilisateurs[0]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'nom_user' => 'required|string|max:100',
            'email_user' => [
                'required',
                'email',
                'max:255',
                Rule::unique('Utilisateur', 'email_user')->ignore($id, 'id_user')
            ],
            'num_user' => [
                'required',
                'regex:/^\+?[0-9\s\-()]{7,20}$/'
            ],
            'statut_account' => 'required|in:actif,inactif,suspendu',
        ]);

        $utilisateurs = DB::select('SELECT * FROM modifier_utilisateur(?, ?, ?, ?, ?)', [
            $id,
            $validated['nom_user'],
            $validated['email_user'],
            $validated['num_user'],
            $validated['statut_account'],
        ]);

        return response()->json($utilisateurs);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $utilisateurs = DB::select('SELECT * FROM supprimer_utilisateur(?)', [$id]);
        return response()->json($utilisateurs);
    }

    public function checkEmailExiste(Request $request) 
    {
        $validate = $request->validate([
            'email' => 'required|email|max:255'
        ]);
        $email = $validate['email'];
        $reponse = DB::select('SELECT * FROM verifier_email_existant(?)', [$email]);
        return response()->json($reponse[0]);
    }

    public function checkPasswordCorrect(Request $request) 
    {
        $validate = $request->validate([
            'email' => 'required|email|max:255',
            'password' => 'required|string|min:6|max:255'
        ]);

        $user = DB::select('SELECT* FROM "Utilisateur" WHERE email_user = ?', [$validate['email']]);
        if ($user && Hash::check($validate['password'], $user[0]->password_user)){
            return response()->json(['correct' => true], 200);
        } else {
            return response()->json(['correct' => false], 200);
        }
        
    }

    public function login(Request $request)
    {
        $validate = $request->validate([
            'email' => 'required|email|max:255',
            'password' => 'required|string|min:6|max:255',
            'role' => 'sometimes|string',
            'restaurant' => 'sometimes|string',
        ]);

        // Rechercher l'utilisateur par email
        $user = Utilisateur::where('email_user', $validate['email'])->first();

        // Utilisateur non trouvé
        if (!$user) {
            return response()->json([
                'message' => 'Identifiants invalides.'
            ], 401);
        }

        // Vérifier le mot de passe
        if (!Hash::check($validate['password'], $user->password_user)) {
            return response()->json([
                'message' => 'Identifiants invalides.'
            ], 401);
        }

        // Générer un token valable 2h avec rôle et restaurant
        $role = $validate['role'] ?? 'client';
        $restaurant = $validate['restaurant'] ?? '1';
        $token = $user->createExpiringToken('auth_token', [$role . ':' . $restaurant], 2);

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'role' => $role,
            'restaurant' => $restaurant
        ], 200);
    }

    public function inscription(Request $request){
        $validated = $request->validate([
            'nom' => 'required|string|max:100',
            'email' => [
                'required',
                'email',
                'max:255',
                'unique:Utilisateur,email_user'
            ],
            'mot_de_passe' => 'required|string|min:6|max:255',
            'telephone' => [
                'required',
                'regex:/^\+?[0-9\s\-()]{7,20}$/'
            ],
            'userState' => 'required|in:actif,inactif,suspendu',
        ]);

        $utilisateurs = DB::select('SELECT * FROM ajouter_utilisateur(?, ?, ?, ?, ?)', [
            $validated['nom'],
            $validated['email'],
            Hash::make($validated['mot_de_passe']),
            $validated['telephone'],
            $validated['userState'],
        ]);

        return response()->json([
            'message' => 'Utilisateur crée',
        ], 205);
    }

    public function token_inscription(Request $request){
        $validated = $request->validate([
            'email' => [
                'required',
                'email',
                'max:255'
            ],
            'role' => 'required|string',
            'restaurant' => 'required|string',
        ]);
        $user = Utilisateur::where('email_user', $validated['email'])->first();

        $role = $validated['role'];
        $restaurant = $validated['restaurant'];
        $token = $user->createExpiringToken('auth_token', [$role. ':' .$restaurant], 2);

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'role' => $role
        ], 200);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnecté avec succès'], 200);
    }

    public function sendCodeVerification(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $code = rand(100000, 999999);

        $email = $request->email;
        $messageContent = "Ton code de vérification à 06 chiffres est : {$code} . Ce code est valide pendant 10 minutes.";

        Mail::to($email)->send(new UserVerificationMail($messageContent));

        return response()->json([
            'message' => 'Code de vérification envoyé avec succès',
            'code' => $code
        ], 200);
    }

    public function getByEmail(Request $request)
    {
        // Validation simple de l'email
        $validated = $request->validate([
            'email' => 'required|email'
        ]);

        try {
            // Appel de la fonction PostgreSQL
            $user = DB::select('SELECT * FROM get_utilisateur_par_email(?)', [
                $validated['email']
            ]);

            if (empty($user)) {
                return response()->json([
                    'message' => 'Utilisateur introuvable.'
                ], 404);
            }

            // Retourne le premier utilisateur trouvé
            return response()->json($user[0], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur serveur : ' . $e->getMessage()
            ], 500);
        }
    }

    public function getCommandesByUser($id_user)
    {
        try {
            // 🔹 Appel de la fonction PostgreSQL
            $commandes = DB::select('SELECT * FROM get_commandes_by_user(?)', [$id_user]);

            if (empty($commandes)) {
                return response()->json([
                    'message' => 'Aucune commande trouvée pour cet utilisateur.'
                ], 404);
            }

            // 🔹 Regroupement des résultats par commande
            $result = [];

            foreach ($commandes as $cmd) {
                $id = $cmd->id_commande;

                // Si la commande n'existe pas encore dans le tableau, on la crée
                if (!isset($result[$id])) {
                    $result[$id] = [
                        'id_commande' => $cmd->id_commande,
                        'date_commande' => $cmd->date_commande,
                        'date_heure_livraison' => $cmd->date_heure_livraison,
                        'localisation_client' => $cmd->localisation_client,
                        'type_localisation' => $cmd->type_localisation,
                        'statut_commande' => $cmd->statut_commande,
                        'acheteur' => $cmd->acheteur,
                        'statut' => $cmd->statut,
                        'liste_menus' => [] // tableau des menus de cette commande
                    ];
                }

                // Ajouter les infos du menu associé à cette commande
                $result[$id]['liste_menus'][] = [
                    'id_menu' => $cmd->id_menu,
                    'nom_menu' => $cmd->nom_menu,
                    'quantite' => $cmd->quantite,
                    'prix_unitaire' => $cmd->prix_unitaire,
                    'prix_total' => $cmd->prix_total
                ];
            }

            // 🔹 Réindexer le tableau final (pour éviter les clés de hash)
            $final = array_values($result);

            return response()->json($final, 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur serveur : ' . $e->getMessage()
            ], 500);
        }
    }

    public function updateCommande(Request $request, $id_commande)
    {
        // ✅ Validation des données reçues
        $validated = $request->validate([
            'date_heure_livraison' => 'required|date_format:Y-m-d H:i:s',
            'localisation_client' => 'required|string',
            'type_localisation' => 'required|string', // correspond au domain location
            'statut_commande' => 'required|string',   // correspond au domain commandeState
        ]);

        try {
            // 🔹 Appel de la fonction PostgreSQL modifier_commande()
            $result = \DB::select('SELECT * FROM modifier_commande(?, ?, ?, ?, ?)', [
                $id_commande,
                $validated['date_heure_livraison'],
                $validated['localisation_client'],
                $validated['type_localisation'],
                $validated['statut_commande']
            ]);

            // Vérifie si un résultat a été retourné
            if (!empty($result)) {
                return response()->json([
                    'message' => 'Commande modifiée avec succès.',
                    'commande' => $result[0]
                ], 200);
            } else {
                return response()->json([
                    'message' => 'Aucune commande mise à jour.'
                ], 404);
            }

        } catch (\Illuminate\Database\QueryException $e) {
            // Erreurs SQL (par exemple si l’ID n’existe pas)
            return response()->json([
                'message' => 'Erreur SQL : ' . $e->getMessage()
            ], 400);

        } catch (\Exception $e) {
            // Autres erreurs (serveur, validation, etc.)
            return response()->json([
                'message' => 'Erreur serveur : ' . $e->getMessage()
            ], 500);
        }
    }

    public function dashboardKpis()
    {
        try {
            $kpis = DB::select('SELECT * FROM get_dashboard_kpis()');

            // La fonction retourne un tableau avec un seul objet
            if (empty($kpis)) {
                // Si la fonction ne retourne rien, on envoie des valeurs par défaut
                return response()->json([
                    'daily_orders_count' => 0,
                    'daily_revenue' => 0,
                    'open_complaints_count' => 0,
                    'active_employees_count' => 0,
                ]);
            }

            // Retourne le premier (et unique) résultat
            return response()->json($kpis[0]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur serveur lors de la récupération des KPIs du tableau de bord.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getRestaurantsUtilisateur(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email'
            ]);

            $email = $request->input('email');

            $results = DB::select('SELECT * FROM get_restaurants_utilisateur(?)', [$email]);
            
            $restaurants = array_map(function($item) {
                return [
                    'restaurant_id' => (int)$item->restaurant_id,
                    'restaurant_nom' => $item->restaurant_nom,
                    'restaurant_logo' => $item->restaurant_logo,
                    'role_utilisateur' => $item->role_utilisateur,
                    'date_debut' => $item->date_debut
                ];
            }, $results);
            
            return response()->json($restaurants);
            
        } catch (\Exception $e) {
            \Log::error('Erreur lors de la récupération des restaurants utilisateur:', [
                'message' => $e->getMessage(),
                'email' => $request->input('email')
            ]);
            
            return response()->json([], 500);
        }
    }
}