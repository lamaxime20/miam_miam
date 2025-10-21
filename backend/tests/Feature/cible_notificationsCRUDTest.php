<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class Cible_NotificationsCRUDTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        DB::statement('DELETE FROM cible_notifications');
        DB::statement('DELETE FROM notifications');
        DB::statement('DELETE FROM "Utilisateur"');
    }

    protected function tearDown(): void
    {
        DB::statement('DELETE FROM cible_notifications');
        DB::statement('DELETE FROM notifications');
        DB::statement('DELETE FROM "Utilisateur"');
        parent::tearDown();
    }

    private function creerUtilisateur(string $nom, string $email): int
    {
        return DB::table('Utilisateur')->insertGetId([
            'nom_user' => $nom,
            'email_user' => $email,
            'password_user' => Hash::make('123456'),
            'num_user' => '+237666666666',
            'date_inscription' => now(),
            'last_connexion' => now(),
            'statut_account' => 'actif'
        ], 'id_user');
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
        $id = DB::table('notifications')->insertGetId([
            'message_notification' => 'Hello',
            'date_notif' => now(),
            'restaurant_auteur' => $restoId // placeholder (no FK enforcement here for creation simplicity). If your DB enforces FK, create restaurant beforehand.
        ], 'id_notification');

        return $id;
    }

    private function creerCibleNotification(): array
    {
        $userId = $this->creerUtilisateur('CibleUser', 'cible@test.com');
        $notifId = $this->creerNotification();

        DB::table('cible_notifications')->insert([
            'id_notification' => $notifId,
            'id_cible' => $userId,
            'ouvert' => false
        ]);

        return ['id_notification' => $notifId, 'id_cible' => $userId];
    }

    public function testCreationCibleNotification()
    {
        $userId = $this->creerUtilisateur('CibleUser', 'cible@test.com');
        $notifId = $this->creerNotification();
        $response = $this->postJson('/api/cible_notifications', [
            'id_notification' => $notifId,
            'id_cible' => $userId,
            'ouvert' => false
        ]);
        $response->assertStatus(201);
        $this->assertDatabaseHas('cible_notifications', ['id_notification' => $notifId, 'id_cible' => $userId]);
    }

    public function testGetAllCibleNotifications()
    {
        $this->creerCibleNotification();
        $response = $this->getJson('/api/cible_notifications');
        $response->assertStatus(200)->assertJsonStructure(['*' => ['id_notification','id_cible','ouvert']]);
    }

    public function testGetOneCibleNotification()
    {
        $c = $this->creerCibleNotification();
        $response = $this->getJson("/api/cible_notifications/{$c['id_notification']}/{$c['id_cible']}");
        $response->assertStatus(200)->assertJsonFragment(['id_notification' => $c['id_notification'], 'id_cible' => $c['id_cible']]);
    }

    public function testUpdateCibleNotification()
    {
        $c = $this->creerCibleNotification();
        $response = $this->putJson("/api/cible_notifications/{$c['id_notification']}/{$c['id_cible']}", ['ouvert' => true]);
        $response->assertStatus(200);
        $this->assertDatabaseHas('cible_notifications', ['id_notification' => $c['id_notification'], 'id_cible' => $c['id_cible'], 'ouvert' => true]);
    }

    public function testDeleteCibleNotification()
    {
        $c = $this->creerCibleNotification();
        $response = $this->deleteJson("/api/cible_notifications/{$c['id_notification']}/{$c['id_cible']}");
        $response->assertStatus(204);
        $this->assertDatabaseMissing('cible_notifications', ['id_notification' => $c['id_notification'], 'id_cible' => $c['id_cible']]);
    }
}