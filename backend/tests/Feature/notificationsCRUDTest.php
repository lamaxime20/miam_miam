<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class NotificationsCRUDTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        DB::statement('DELETE FROM notifications');
        DB::statement('DELETE FROM restaurant');
        DB::statement('DELETE FROM administrateur');
        DB::statement('DELETE FROM "Utilisateur"');
        DB::statement('DELETE FROM file');
    }

    protected function tearDown(): void
    {
        DB::statement('DELETE FROM notifications');
        DB::statement('DELETE FROM restaurant');
        DB::statement('DELETE FROM administrateur');
        DB::statement('DELETE FROM "Utilisateur"');
        DB::statement('DELETE FROM file');
        parent::tearDown();
    }

    private function creerAdminAndRestaurant(): int
    {
        $admin = DB::table('Utilisateur')->insertGetId([
            'nom_user' => 'NotifAdmin',
            'email_user' => 'notifadmin@test.com',
            'password_user' => Hash::make('123456'),
            'num_user' => '+237655555555',
            'date_inscription' => now(),
            'last_connexion' => now(),
            'statut_account' => 'actif'
        ], 'id_user');

        DB::table('administrateur')->insert(['id_user' => $admin]);

        $fileId = DB::table('file')->insertGetId(['nom_fichier' => 'logo_n', 'extension' => 'jpg', 'chemin' => '/uploads/n.jpg'], 'id_file');

        return DB::table('restaurant')->insertGetId([
            'nom_restaurant' => 'RestoNotif',
            'localisation' => 'Douala',
            'type_localisation' => 'googleMap',
            'logo_restaurant' => $fileId,
            'politique' => 'P',
            'administrateur' => $admin
        ], 'id_restaurant');
    }

    private function creerNotification(): int
    {
        $restoId = $this->creerAdminAndRestaurant();
        return DB::table('notifications')->insertGetId([
            'message_notification' => 'Promo!',
            'date_notif' => now(),
            'restaurant_auteur' => $restoId
        ], 'id_notification');
    }

    public function testCreationNotification()
    {
        $restoId = $this->creerAdminAndRestaurant();
        $this->assertDatabaseHas('notifications', ['id_notification' => $restoId, 'message_notification' => 'Promo!']);
    }

    public function testGetAllNotifications()
    {
        $this->creerNotification();
        $response = $this->getJson('/api/notifications');
        $response->assertStatus(200)->assertJsonStructure(['*' => ['id_notification','message_notification','date_notif','restaurant_auteur']]);
    }

    public function testGetOdneNotification()
    {
        $id = $this->creerNotification();
        $response = $this->getJson("/api/notifications/{$id}");
        $response->assertStatus(200)->assertJsonFragment(['id_notification' => $id]);
    }

    public function testUpdateNotification()
    {
        $id = $this->creerNotification();
        $response = $this->putJson("/api/notifications/{$id}", ['message_notification' => 'Nouveau']);
        $response->assertStatus(200);
        $this->assertDatabaseHas('notifications', ['id_notification' => $id, 'message_notification' => 'Nouveau']);
    }

    public function testDeleteNotification()
    {
        $id = $this->creerNotification();
        $response = $this->deleteJson("/api/notifications/{$id}");
        $response->assertStatus(204);
        $this->assertDatabaseMissing('notifications', ['id_notification' => $id]);
    }
}