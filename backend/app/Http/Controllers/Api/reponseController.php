<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;

class reponseController extends Controller
{
    private function toUiStatus(string $db)
    {
        switch ($db) {
            case 'ouverte': return 'open';
            case 'en_traitement': return 'in-progress';
            case 'fermée': return 'resolved';
            default: return 'open';
        }
    }

    private function toDbStatus(?string $ui)
    {
        if ($ui === null) return null;
        switch ($ui) {
            case 'open': return 'ouverte';
            case 'in-progress': return 'en_traitement';
            case 'resolved': return 'fermée';
            default: return null;
        }
    }

    public function index(int $id_reclamation)
    {
        $rows = DB::select('SELECT * FROM get_reclamation_with_responses(?)', [$id_reclamation]);
        $reponses = array_values(array_filter(array_map(function ($r) {
            if ($r->id_reponse === null) return null;
            return [
                'id_reponse' => $r->id_reponse,
                'message_reponse' => $r->message_reponse,
                'statut_reponse' => $this->toUiStatus($r->statut_reponse),
                'auteur' => $r->auteur,
            ];
        }, $rows)));

        return response()->json($reponses);
    }

    public function store(int $id_reclamation, Request $request)
    {
        $data = $request->validate([
            'message' => 'required|string',
            'auteur' => 'required|integer',
            'statut' => 'nullable|string',
        ]);

        $dbStatut = $this->toDbStatus($data['statut'] ?? null);

        $row = DB::select('SELECT add_reponse(?, ?, ?, ?) AS id', [
            $id_reclamation,
            $data['message'],
            $data['auteur'],
            $dbStatut,
        ]);

        return response()->json(['id' => $row[0]->id], 201);
    }
}