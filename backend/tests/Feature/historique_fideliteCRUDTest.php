<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class Historique_fideliteCRUDTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        DB::statement('DELETE FROM Historique_fidelite');
        DB::statement('DELETE FROM client');
        DB::statement('DELETE FROM "Utilisateur"');
        DB::statement('DELETE FROM restaurant');
        DB::statement('DELETE FROM file');
        DB::statement('DELETE FROM administrateur');
    }

    protected function tearDown(): void
    {
        DB::statement('DELETE FROM Historique_fidelite');
        DB::statement('DELETE FROM client');
        DB::statement('DELETE FROM "Utilisateur"');
        DB::statement('DELETE FROM restaurant');
        DB::statement('DELETE FROM file');
        DB::statement('DELETE FROM administrateur');
        parent::tearDown();
    }

    /**
     * Crée un utilisateur client complet.
     */
    private function creerClient(): int
    {
        $userId = DB::table('Utilisateur')->insertGetId([
            'nom_user' => 'HistClient',
            'email_user' => 'histclient@test.com',
            'password_user' => Hash::make('123456'),
            'num_user' => '+237644444444',
            'date_inscription' => now(),
            'last_connexion' => now(),
            'statut_account' => 'actif'
        ], 'id_user');

        return $userId;
    }

    /**
     * Crée un restaurant minimal pour les tests.
     */
    private function creerRestaurant(): int
    {
        // Admin pour le restaurant
        $adminId = DB::table('Utilisateur')->insertGetId([
            'nom_user' => 'AdminResto',
            'email_user' => 'adminresto@test.com',
            'password_user' => Hash::make('123456'),
            'num_user' => '+237677777777',
            'date_inscription' => now(),
            'last_connexion' => now(),
            'statut_account' => 'actif'
        ], 'id_user');

        DB::table('administrateur')->insert(['id_user' => $adminId]);

        // Fichier du logo
        $fileId = DB::table('file')->insertGetId([
            'nom_fichier' => 'logo_resto',
            'extension' => 'png',
            'chemin' => '/uploads/logo_resto.png'
        ], 'id_file');

        // Restaurant
        $restoId = DB::table('restaurant')->insertGetId([
            'nom_restaurant' => 'RestoFid',
            'localisation' => 'Douala',
            'type_localisation' => 'googleMap',
            'logo_restaurant' => $fileId,
            'politique' => 'PolitiqueTest',
            'administrateur' => $adminId
        ], 'id_restaurant');

        return $restoId;
    }

    public function testCreationHistoriqueFidelite()
    {
        $clientId = $this->creerClient();
        $restaurantId = $this->creerRestaurant();

        $response = $this->postJson('/api/historique_fidelite', [
            'id_client' => $clientId,
            'changement' => 10,
            'raison' => 'Achat menu test',
            'restaurant' => $restaurantId
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('historique_fidelite', [
            'id_client' => $clientId,
            'changement' => 10,
            'restaurant' => $restaurantId
        ]);
    }

    public function testGetAllHistoriqueFidelite()
    {
        $clientId = $this->creerClient();
        $restaurantId = $this->creerRestaurant();

        DB::table('historique_fidelite')->insert([
            'id_client' => $clientId,
            'changement' => 5,
            'raison' => 'Test fidélité',
            'restaurant' => $restaurantId
        ]);

        $response = $this->getJson('/api/historique_fidelite');
        $response->assertStatus(200)->assertJsonStructure([
            '*' => [
                'id_historique',
                'id_client',
                'changement',
                'raison',
                'restaurant',
                'date_changement'
            ]
        ]);
    }

    public function testGetOneHistoriqueFidelite()
    {
        $clientId = $this->creerClient();
        $restaurantId = $this->creerRestaurant();

        $id = DB::table('historique_fidelite')->insertGetId([
            'id_client' => $clientId,
            'changement' => 3,
            'raison' => 'Récupération',
            'restaurant' => $restaurantId
        ], 'id_historique');

        $response = $this->getJson("/api/historique_fidelite/{$id}");
        $response->assertStatus(200)->assertJsonFragment(['id_historique' => $id]);
    }

    public function testUpdateHistoriqueFidelite()
    {
        $clientId = $this->creerClient();
        $restaurantId = $this->creerRestaurant();

        $id = DB::table('historique_fidelite')->insertGetId([
            'id_client' => $clientId,
            'changement' => 2,
            'raison' => 'Ancienne raison',
            'restaurant' => $restaurantId
        ], 'id_historique');

        $response = $this->putJson("/api/historique_fidelite/{$id}", [
            'raison' => 'Mise à jour fidélité'
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('historique_fidelite', [
            'id_historique' => $id,
            'raison' => 'Mise à jour fidélité'
        ]);
    }

    public function testDeleteHistoriqueFidelite()
    {
        $clientId = $this->creerClient();
        $restaurantId = $this->creerRestaurant();

        $id = DB::table('historique_fidelite')->insertGetId([
            'id_client' => $clientId,
            'changement' => -2,
            'raison' => 'Suppression test',
            'restaurant' => $restaurantId
        ], 'id_historique');

        $response = $this->deleteJson("/api/historique_fidelite/{$id}");
        $response->assertStatus(204);
        $this->assertDatabaseMissing('historique_fidelite', ['id_historique' => $id]);
    }
}