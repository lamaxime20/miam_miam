<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class PaiementCRUDTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        DB::statement('DELETE FROM paiement');
        DB::statement('DELETE FROM commande');
        DB::statement('DELETE FROM client');
        DB::statement('DELETE FROM "Utilisateur"');
        DB::statement('DELETE FROM file');
        DB::statement('DELETE FROM restaurant');
        DB::statement('DELETE FROM administrateur');
        DB::statement('DELETE FROM categorie_menu');
        DB::statement('DELETE FROM menu');
    }

    protected function tearDown(): void
    {
        DB::statement('DELETE FROM paiement');
        DB::statement('DELETE FROM commande');
        DB::statement('DELETE FROM client');
        DB::statement('DELETE FROM "Utilisateur"');
        DB::statement('DELETE FROM file');
        DB::statement('DELETE FROM restaurant');
        DB::statement('DELETE FROM administrateur');
        DB::statement('DELETE FROM categorie_menu');
        DB::statement('DELETE FROM menu');
        parent::tearDown();
    }

    private function creerClientAndCommande(): int
    {
        // create utilisateur + client
        $userId = DB::table('Utilisateur')->insertGetId([
            'nom_user' => 'ClientPay',
            'email_user' => 'clientpay@test.com',
            'password_user' => Hash::make('123456'),
            'num_user' => '+237633333333',
            'date_inscription' => now(),
            'last_connexion' => now(),
            'statut_account' => 'actif'
        ], 'id_user');

        // create a simple commande
        return DB::table('commande')->insertGetId([
            'date_commande' => now(),
            'date_heure_livraison' => now()->addHour(),
            'localisation_client' => 'Douala',
            'type_localisation' => 'googleMap',
            'statut_commande' => 'en_cours',
            'acheteur' => $userId
        ], 'id_commande');
    }

    public function testCreationPaiement()
    {
        $commandeId = $this->creerClientAndCommande();

        $response = $this->postJson('/api/paiements', [
            'id_commande' => $commandeId,
            'montant' => 12000.50,
            'moyen_paiement' => 'carte',
            'statut_paiement' => 'en_attente',
            'reference_transaction' => 'REF123'
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('paiement', ['id_commande' => $commandeId, 'montant' => 12000.50]);
    }

    public function testGetAllPaiements()
    {
        $commandeId = $this->creerClientAndCommande();
        DB::table('paiement')->insert([
            'id_commande' => $commandeId,
            'montant' => 1000,
            'moyen_paiement' => 'especes',
            'statut_paiement' => 'reussi',
            'reference_transaction' => 'R1'
        ]);
        $response = $this->getJson('/api/paiements');
        $response->assertStatus(200)->assertJsonStructure(['*' => ['id_paiement','id_commande','montant','moyen_paiement','statut_paiement','reference_transaction','date_paiement']]);
    }

    public function testGetOnePaiement()
    {
        $commandeId = $this->creerClientAndCommande();
        $paiementId = DB::table('paiement')->insertGetId([
            'id_commande' => $commandeId,
            'montant' => 2000,
            'moyen_paiement' => 'mobile_money',
            'statut_paiement' => 'reussi',
            'reference_transaction' => 'R2'
        ], 'id_paiement');

        $response = $this->getJson("/api/paiements/{$paiementId}");
        $response->assertStatus(200)->assertJsonFragment(['id_paiement' => $paiementId]);
    }

    public function testUpdatePaiement()
    {
        $commandeId = $this->creerClientAndCommande();
        $paiementId = DB::table('paiement')->insertGetId([
            'id_commande' => $commandeId,
            'montant' => 2500,
            'moyen_paiement' => 'carte',
            'statut_paiement' => 'en_attente',
            'reference_transaction' => 'R3'
        ], 'id_paiement');

        $response = $this->putJson("/api/paiements/{$paiementId}", ['statut_paiement' => 'reussi']);
        $response->assertStatus(200);
        $this->assertDatabaseHas('paiement', ['id_paiement' => $paiementId, 'statut_paiement' => 'reussi']);
    }

    public function testDeletePaiement()
    {
        $commandeId = $this->creerClientAndCommande();
        $paiementId = DB::table('paiement')->insertGetId([
            'id_commande' => $commandeId,
            'montant' => 3000,
            'moyen_paiement' => 'carte',
            'statut_paiement' => 'reussi',
            'reference_transaction' => 'R4'
        ], 'id_paiement');

        $response = $this->deleteJson("/api/paiements/{$paiementId}");
        $response->assertStatus(204);
        $this->assertDatabaseMissing('paiement', ['id_paiement' => $paiementId]);
    }
}