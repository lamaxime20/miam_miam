<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;


class administrateurController extends Controller
{

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
                $admin = DB::select('SELECT * FROM lister_admin()');
        return response()->json($admin);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_user' => 'required|integer|exists:Utilisateur,id_user',
        ]);

        $utilisateurs = DB::select('SELECT * FROM ajouter_admin(?)', [
            $validated['id_user']
        ]);

        return response()->json(['message' => 'Administrateur créé avec succès'], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
         $admin = DB::select('SELECT * FROM supprimer_admin(?)', [$id]);
               return response()->json(['message' => 'Administrateur supprimé avec succès'], 200);  
    }

    public function getEmployees($restaurantId)
    {
        try {
            // Convertir en entier et valider
            $restaurantId = (int)$restaurantId;
            
            if ($restaurantId <= 0) {
                return response()->json(['error' => 'ID de restaurant invalide'], 400);
            }

            // Les bindings doivent être dans un tableau
            $results = DB::select('SELECT * FROM get_employees(?)', [$restaurantId]);
            
            // array_map avec seulement 2 arguments
            $employees = array_map(function($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'email' => $item->email,
                    'position' => $item->employee_position,
                    'status' => $item->status,
                    'hireDate' => $item->hire_date,
                    'phone' => $item->phone
                ];
            }, $results); // Retirer le troisième argument "205"
            
            return response()->json($employees);
            
        } catch (\Exception $e) {
            \Log::error('Erreur lors de la récupération des employés:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            
            return response()->json(['error' => 'Erreur interne du serveur'], 500);
        }
    }

    /**
     * Crée un nouvel employé
     */
    public function createEmployee(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'role' => 'required|string|in:gérant,employé,livreur',
                'restaurant' => 'required|integer|min:1'
            ]);

            $email = $request->input('email');
            $role = $request->input('role');
            $restaurantId = $request->input('restaurant');

            $result = DB::select('SELECT create_employee(?, ?, ?) as resultat', [$email, $role, $restaurantId]);
            
            if (empty($result)) {
                return response()->json(['error' => 'Erreur lors de la création'], 500);
            }
            
            $resultat = $result[0]->resultat;
            
            // Gérer les différents retours
            switch ($resultat) {
                case 'EMPLOYE_CREE':
                    return response()->json(['success' => 'Employé créé avec succès']);
                    
                case 'EMPLOYE_REACTIVE':
                    return response()->json(['success' => 'Employé réactivé avec succès']);
                    
                case 'UTILISATEUR_NON_TROUVE':
                    return response()->json(['error' => 'Utilisateur non trouvé'], 404);
                    
                case 'ROLE_INVALIDE':
                    return response()->json(['error' => 'Rôle invalide'], 400);
                    
                default:
                    if (str_starts_with($resultat, 'ERREUR:')) {
                        \Log::error('Erreur PostgreSQL create_employee: ' . $resultat);
                        return response()->json(['error' => 'Erreur lors de la création'], 500);
                    }
                    return response()->json(['error' => 'Erreur inconnue'], 500);
            }
            
        } catch (\Exception $e) {
            \Log::error('Erreur lors de la création employé:', [
                'message' => $e->getMessage(),
                'email' => $request->input('email'),
                'role' => $request->input('role'),
                'restaurant' => $request->input('restaurant')
            ]);
            
            return response()->json(['error' => 'Erreur interne du serveur'], 500);
        }
    }

    /**
     * Désactive un employé
    */
    public function desactiverEmploye(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'role' => 'required|string|in:gérant,employé,livreur',
                'restaurant' => 'required|integer|min:1'
            ]);

            $email = $request->input('email');
            $role = $request->input('role');
            $restaurantId = $request->input('restaurant');

            $result = DB::select('SELECT desactiver_employe(?, ?, ?) as resultat', [$email, $role, $restaurantId]);
            
            if (empty($result)) {
                return response()->json(['error' => 'Erreur lors de la désactivation'], 500);
            }
            
            $resultat = $result[0]->resultat;
            
            // Gérer les différents retours
            switch ($resultat) {
                case 'EMPLOYE_DESACTIVE':
                    return response()->json(['success' => 'Employé désactivé avec succès']);
                    
                case 'UTILISATEUR_NON_TROUVE':
                    return response()->json(['error' => 'Utilisateur non trouvé'], 404);
                    
                case 'EMPLOYE_NON_TROUVE':
                    return response()->json(['error' => 'Employé non trouvé dans ce restaurant'], 404);
                    
                case 'ROLE_INVALIDE':
                    return response()->json(['error' => 'Rôle invalide'], 400);
                    
                default:
                    if (str_starts_with($resultat, 'ERREUR:')) {
                        \Log::error('Erreur PostgreSQL desactiver_employe: ' . $resultat);
                        return response()->json(['error' => 'Erreur lors de la désactivation'], 500);
                    }
                    return response()->json(['error' => 'Erreur inconnue'], 500);
            }
            
        } catch (\Exception $e) {
            \Log::error('Erreur lors de la désactivation employé:', [
                'message' => $e->getMessage(),
                'email' => $request->input('email'),
                'role' => $request->input('role'),
                'restaurant' => $request->input('restaurant')
            ]);
            
            return response()->json(['error' => 'Erreur interne du serveur'], 500);
        }
    }
}