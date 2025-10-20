<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class CommandeCRUDTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        DB::statement('DELETE FROM commande');
        DB::statement('DELETE FROM client');
        DB::statement('DELETE FROM "Utilisateur"');
    }

    protected function tearDown(): void
    {
        DB::statement('DELETE FROM commande');
        DB::statement('DELETE FROM client');
        DB::statement('DELETE FROM "Utilisateur"');
        parent::tearDown();
    }

    private function creerClient(): int
    {
        $userId = DB::table('Utilisateur')->insertGetId([
            'nom_user' => 'ClientCmd',
            'email_user' => 'clientcmd@test.com',
            'password_user' => Hash::make('123456'),
            'num_user' => '+237600000001',
            'date_inscription' => now(),
            'last_connexion' => now(),
            'statut_account' => 'actif'
        ], 'id_user');

        return $userId;
    }

    public function testCreationCommande()
    {
        $clientId = $this->creerClient();
        $data = [
            'date_commande' => now()->toDateTimeString(),
            'date_heure_livraison' => now()->addHour()->toDateTimeString(),
            'localisation_client' => 'Douala Akwa',
            'type_localisation' => 'googleMap',
            'statut_commande' => 'en_cours',
            'acheteur' => $clientId
        ];

        $response = $this->postJson('/api/commandes', $data);
        $response->assertStatus(201);
        $this->assertDatabaseHas('commande', ['acheteur' => $clientId]);
    }

    public function testGetAllCommandes()
    {
        $clientId = $this->creerClient();
        DB::table('commande')->insert([
            'date_commande' => now(),
            'date_heure_livraison' => now()->addHour(),
            'localisation_client' => 'A',
            'type_localisation' => 'estimation',
            'statut_commande' => 'en_cours',
            'acheteur' => $clientId
        ]);
        $response = $this->getJson('/api/commandes');
        $response->assertStatus(200)->assertJsonStructure(['*' => ['id_commande','date_commande','date_heure_livraison','localisation_client','type_localisation','statut_commande','acheteur']]);
    }

    public function testGetOneCommande()
    {
        $clientId = $this->creerClient();
        $id = DB::table('commande')->insertGetId([
            'date_commande' => now(),
            'date_heure_livraison' => now()->addHour(),
            'localisation_client' => 'A',
            'type_localisation' => 'estimation',
            'statut_commande' => 'en_cours',
            'acheteur' => $clientId
        ], 'id_commande');

        $response = $this->getJson("/api/commandes/{$id}");
        $response->assertStatus(200)->assertJsonFragment(['id_commande' => $id]);
    }

    public function testUpdateCommande()
    {
        $clientId = $this->creerClient();
        $id = DB::table('commande')->insertGetId([
            'date_commande' => now(),
            'date_heure_livraison' => now()->addHour(),
            'localisation_client' => 'A',
            'type_localisation' => 'estimation',
            'statut_commande' => 'en_cours',
            'acheteur' => $clientId
        ], 'id_commande');

        $response = $this->putJson("/api/commandes/{$id}", ['statut_commande' => 'validée']);
        $response->assertStatus(200);
        $this->assertDatabaseHas('commande', ['id_commande' => $id, 'statut_commande' => 'validée']);
    }

    public function testDeleteCommande()
    {
        $clientId = $this->creerClient();
        $id = DB::table('commande')->insertGetId([
            'date_commande' => now(),
            'date_heure_livraison' => now()->addHour(),
            'localisation_client' => 'A',
            'type_localisation' => 'estimation',
            'statut_commande' => 'en_cours',
            'acheteur' => $clientId
        ], 'id_commande');

        $response = $this->deleteJson("/api/commandes/{$id}");
        $response->assertStatus(204);
        $this->assertDatabaseMissing('commande', ['id_commande' => $id]);
    }
}