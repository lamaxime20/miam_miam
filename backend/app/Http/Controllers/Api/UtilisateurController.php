<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

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
        $utilisateurs = DB::select('SELECT * FROM ajouter_utilisateur(?, ?, ?, ?, ?)', [
            $request->input('nom'),
            $request->input('email'),
            Hash::make($request->input('mot_de_passe')),
            $request->input('telephone'),
            $request->input('userState'),
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
        $utilisateurs = DB::select('SELECT * FROM modifier_utilisateur(?, ?, ?, ?, ?)', [
            $id,
            $request->input('nom_user'),
            $request->input('email_user'),
            $request->input('num_user'),
            $request->input('statut_account'),
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