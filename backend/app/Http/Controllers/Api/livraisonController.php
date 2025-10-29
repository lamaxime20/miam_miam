<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class livraisonController extends Controller
{
    public function updateStatus(Request $request, int $id)
    {
        $validated = $request->validate([
            'statut' => 'required|string' // 'en_cours' | 'validée' | 'annulée'
        ]);
        $statut = $validated['statut'];

        $liv = DB::selectOne('SELECT * FROM Livraison WHERE id_livraison = ?', [$id]);
        if (!$liv) return response()->json(['message' => 'Livraison introuvable'], 404);

        // Si passage à validée, définir la date de livraison maintenant
        if ($statut === 'validée') {
            DB::update('UPDATE Livraison SET statut_livraison = ?, date_livraison = NOW() WHERE id_livraison = ?', [$statut, $id]);
        } else {
            DB::update('UPDATE Livraison SET statut_livraison = ? WHERE id_livraison = ?', [$statut, $id]);
        }

        // Renvoyer un statut frontend recalculé pour la commande rattachée
        $row = DB::selectOne('SELECT c.id_commande, c.statut_commande, b.statut_bon, l.statut_livraison
                               FROM Livraison l
                               JOIN Bon_commande b ON b.id_bon = l.bon_associe
                               JOIN Commande c ON c.id_commande = b.commande_associe
                               WHERE l.id_livraison = ?', [$id]);
        if (!$row) return response()->json(['message' => 'Commande associée introuvable'], 404);

        $statutFront = 'non lu';
        if ($row->statut_commande === 'annulée' || $row->statut_bon === 'annulée' || $row->statut_livraison === 'annulée') $statutFront = 'annulé';
        elseif ($row->statut_commande === 'en_cours') $statutFront = 'non lu';
        elseif ($row->statut_commande === 'validée' && $row->statut_bon === 'en_cours') $statutFront = 'en préparation';
        elseif ($row->statut_commande === 'validée' && $row->statut_bon === 'validée' && $row->statut_livraison === 'en_cours') $statutFront = 'en livraison';
        elseif ($row->statut_commande === 'validée' && $row->statut_bon === 'validée' && $row->statut_livraison === 'validée') $statutFront = 'validé';

        return response()->json(['id_commande' => $row->id_commande, 'statut' => $statutFront]);
    }
}
