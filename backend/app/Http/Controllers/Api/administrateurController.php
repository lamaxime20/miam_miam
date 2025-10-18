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
}