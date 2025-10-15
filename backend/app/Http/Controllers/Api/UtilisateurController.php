<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rule;

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
}