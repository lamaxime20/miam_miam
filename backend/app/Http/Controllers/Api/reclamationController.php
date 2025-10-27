<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;

class reclamationController extends Controller
{
    private function toDbStatus(string $ui)
    {
        switch ($ui) {
            case 'open': return 'ouverte';
            case 'in-progress': return 'en_traitement';
            case 'resolved': return 'fermée';
            default: return 'ouverte';
        }
    }

    private function toUiStatus(string $db)
    {
        switch ($db) {
            case 'ouverte': return 'open';
            case 'en_traitement': return 'in-progress';
            case 'fermée': return 'resolved';
            default: return 'open';
        }
    }

    public function indexClient(int $id_client)
    {
        $rows = DB::select('SELECT * FROM list_reclamations_by_client(?)', [$id_client]);
        $mapped = array_map(function ($r) {
            $r->statut_reclamation = $this->toUiStatus($r->statut_reclamation);
            return $r;
        }, $rows);
        return response()->json($mapped);
    }

    public function indexRestaurant(int $id_restaurant)
    {
        $rows = DB::select('SELECT * FROM list_reclamations_by_restaurant(?)', [$id_restaurant]);
        $mapped = array_map(function ($r) {
            $r->statut_reclamation = $this->toUiStatus($r->statut_reclamation);
            return $r;
        }, $rows);
        return response()->json($mapped);
    }

    public function show(int $id)
    {
        $rows = DB::select('SELECT * FROM get_reclamation_with_responses(?)', [$id]);
        if (empty($rows)) {
            return response()->json(null, 404);
        }

        $base = [
            'id_reclamation' => $rows[0]->id_reclamation,
            'message_reclamation' => $rows[0]->message_reclamation,
            'date_soummission' => $rows[0]->date_soummission,
            'statut_reclamation' => $this->toUiStatus($rows[0]->statut_reclamation),
            'restaurant_cible' => $rows[0]->restaurant_cible,
            'acheteur' => $rows[0]->acheteur,
        ];

        $reponses = [];
        foreach ($rows as $r) {
            if ($r->id_reponse !== null) {
                $reponses[] = [
                    'id_reponse' => $r->id_reponse,
                    'message_reponse' => $r->message_reponse,
                    'statut_reponse' => $this->toUiStatus($r->statut_reponse),
                    'auteur' => $r->auteur,
                ];
            }
        }

        return response()->json(array_merge($base, ['reponses' => $reponses]));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'message' => 'required|string',
            'restaurant_cible' => 'required|integer',
            'acheteur' => 'required|integer',
        ]);

        $row = DB::select('SELECT create_reclamation(?, ?, ?) AS id', [
            $data['message'],
            $data['restaurant_cible'],
            $data['acheteur'],
        ]);

        return response()->json(['id' => $row[0]->id], 201);
    }

    public function updateStatus(int $id, Request $request)
    {
        $request->validate([
            'statut' => 'required|string',
        ]);

        $dbStatut = $this->toDbStatus($request->input('statut'));
        DB::statement('SELECT update_reclamation_status(?, ?)', [$id, $dbStatut]);

        return response()->json(['ok' => true]);
    }

    public function close(int $id)
    {
        DB::statement('SELECT close_reclamation(?)', [$id]);
        return response()->json(['ok' => true]);
    }
}