<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class etre_livreurController extends Controller
{
    public function disponibles(Request $request)
    {
        // Optionally filter by restaurant: ?restaurant_id=...
        $restaurantId = $request->query('restaurant_id');

        $params = [];
        $sql = 'SELECT el.id_livreur AS id, u.nom_user AS nom, u.num_user AS tel, el.note_livreur AS evaluation
                FROM Etre_livreur el
                JOIN Livreur l ON l.id_user = el.id_livreur
                JOIN "Utilisateur" u ON u.id_user = el.id_livreur
                WHERE el.service_employe = TRUE';
        if ($restaurantId) {
            $sql .= ' AND el.id_restaurant = ?';
            $params[] = $restaurantId;
        }
        $sql .= ' ORDER BY evaluation DESC, nom ASC';

        $rows = DB::select($sql, $params);
        return response()->json($rows);
    }
}
