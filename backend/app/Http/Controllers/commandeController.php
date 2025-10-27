<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class commandeController extends Controller
{
    public function store(Request $request)
    {
        // 🔹 Validation des champs reçus
        $validated = $request->validate([
            'date_heure_livraison' => 'required|date_format:Y-m-d H:i:s',
            'localisation_client' => 'required|string',
            'type_localisation' => 'required|string', // correspond au domain location
            'statut_commande' => 'required|string',   // correspond au domain commandeState
            'acheteur' => 'required|integer|exists:Client,id_user',
            'menus' => 'required|array|min:1',
            'menus.*.id_menu' => 'required|integer|exists:Menu,id_menu',
            'menus.*.quantite' => 'required|integer|min:1',
            'menus.*.prix_unitaire' => 'required|numeric|min:0'
        ]);

        try {
            // 🔹 Appel de la fonction PostgreSQL creer_commande()
            $result = DB::select('SELECT creer_commande(?, ?, ?, ?, ?, ?)', [
                $validated['date_heure_livraison'],
                $validated['localisation_client'],
                $validated['type_localisation'],
                $validated['statut_commande'],
                $validated['acheteur'],
                json_encode($validated['menus'])
            ]);

            $id_commande = $result[0]->creer_commande ?? null;

            if ($id_commande) {
                return response()->json([
                    'message' => 'Commande créée avec succès.',
                    'id_commande' => $id_commande
                ], 201);
            } else {
                return response()->json([
                    'message' => 'Erreur lors de la création de la commande.'
                ], 400);
            }
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur serveur : ' . $e->getMessage()
            ], 500);
        }
    }
}
