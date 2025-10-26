<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class notificationsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
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
        //
    }

    /**
     * Retourne les notifications/événements pour un client.
     */
    public function notificationsClient(int $id_client)
    {
        $notifications = DB::select('SELECT * FROM get_notifications_client(?)', [$id_client]);

        return response()->json([
            'id_client' => $id_client,
            'notifications' => $notifications,
        ], 200);
    }

    /**
     * Marque une notification comme lue.
     */
    public function marquerLue(int $id_notification, int $id_client)
    {
        $result = DB::select('SELECT marquer_notification_lue(?, ?) AS success', [$id_notification, $id_client]);

        return response()->json([
            'success' => $result[0]->success ?? false,
            'message' => $result[0]->success ? 'Notification marquée comme lue' : 'Erreur lors de la mise à jour',
        ], 200);
    }
}
