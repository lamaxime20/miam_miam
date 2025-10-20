<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class Bon_commandeCRUDTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        DB::statement('DELETE FROM bon_commande');
        DB::statement('DELETE FROM commande');
        DB::statement('DELETE FROM client');
        DB::statement('DELETE FROM "Utilisateur"');
    }

    protected function tearDown(): void
    {
        DB::statement('DELETE FROM bon_commande');
        DB::statement('DELETE FROM commande');
        DB::statement('DELETE FROM client');
        DB::statement('DELETE FROM "Utilisateur"');
        parent::tearDown();
    }

    private function creerUtilisateur(): int
    {
        return DB::table('Utilisateur')->insertGetId([
            'nom_user' => 'Validateur',
            'email_user' => 'validateur@test.com',
            'password_user' => Hash::make('123456'),
            'num_user' => '+237690000040',
            'date_inscription' => now(),
            'last_connexion' => now(),
            'statut_account' => 'actif'
        ], 'id_user');
    }

    private function creerCommande(): int
    {
        $clientId = DB::table('Utilisateur')->insertGetId([
            'nom_user' => 'AcheteurBon',
            'email_user' => 'acheteurbon@test.com',
            'password_user' => Hash::make('123456'),
            'num_user' => '+237690000041',
            'date_inscription' => now(),
            'last_connexion' => now(),
            'statut_account' => 'actif'
        ], 'id_user');

        return DB::table('commande')->insertGetId([
            'date_commande' => now(),
            'date_heure_livraison' => now()->addHour(),
            'localisation_client' => 'Bonapriso',
            'type_localisation' => 'googleMap',
            'statut_commande' => 'en_cours',
            'acheteur' => $clientId
        ], 'id_commande');
    }

    public function testCreationBonCommande()
    {
        $validatorId = $this->creerUtilisateur();
        $cmdId = $this->creerCommande();

        $data = [
            'statut_bon' => 'en_cours',
            'validateur' => $validatorId,
            'commande_associe' => $cmdId
        ];

        $response = $this->postJson('/api/bon_commandes', $data);
        $response->assertStatus(201);
        $this->assertDatabaseHas('bon_commande', ['commande_associe' => $cmdId]);
    }

    public function testGetAllBonCommandes()
    {
        $validatorId = $this->creerUtilisateur();
        $cmdId = $this->creerCommande();

        DB::table('bon_commande')->insert([
            'statut_bon' => 'en_cours',
            'validateur' => $validatorId,
            'commande_associe' => $cmdId
        ], 'id_bon');

        $response = $this->getJson('/api/bon_commandes');
        $response->assertStatus(200)->assertJsonStructure(['*' => ['id_bon','statut_bon','validateur','commande_associe']]);
    }

    public function testGetOneBonCommande()
    {
        $validatorId = $this->creerUtilisateur();
        $cmdId = $this->creerCommande();

        $bonId = DB::table('bon_commande')->insertGetId([
            'statut_bon' => 'en_cours',
            'validateur' => $validatorId,
            'commande_associe' => $cmdId
        ], 'id_bon');

        $response = $this->getJson("/api/bon_commandes/{$bonId}");
        $response->assertStatus(200)->assertJsonFragment(['id_bon' => $bonId]);
    }

    public function testUpdateBonCommande()
    {
        $validatorId = $this->creerUtilisateur();
        $cmdId = $this->creerCommande();

        $bonId = DB::table('bon_commande')->insertGetId([
            'statut_bon' => 'en_cours',
            'validateur' => $validatorId,
            'commande_associe' => $cmdId
        ], 'id_bon');

        $response = $this->putJson("/api/bon_commandes/{$bonId}", ['statut_bon' => 'validée']);
        $response->assertStatus(200);
        $this->assertDatabaseHas('bon_commande', ['id_bon' => $bonId, 'statut_bon' => 'validée']);
    }

    public function testDeleteBonCommande()
    {
        $validatorId = $this->creerUtilisateur();
        $cmdId = $this->creerCommande();

        $bonId = DB::table('bon_commande')->insertGetId([
            'statut_bon' => 'en_cours',
            'validateur' => $validatorId,
            'commande_associe' => $cmdId
        ], 'id_bon');

        $response = $this->deleteJson("/api/bon_commandes/{$bonId}");
        $response->assertStatus(204);
        $this->assertDatabaseMissing('bon_commande', ['id_bon' => $bonId]);
    }
}