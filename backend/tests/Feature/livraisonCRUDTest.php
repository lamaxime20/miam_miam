<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class LivraisonCRUDTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        DB::statement('DELETE FROM livraison');
        DB::statement('DELETE FROM bon_commande');
        DB::statement('DELETE FROM commande');
        DB::statement('DELETE FROM livreur');
        DB::statement('DELETE FROM client');
        DB::statement('DELETE FROM "Utilisateur"');
    }

    protected function tearDown(): void
    {
        DB::statement('DELETE FROM livraison');
        DB::statement('DELETE FROM bon_commande');
        DB::statement('DELETE FROM commande');
        DB::statement('DELETE FROM livreur');
        DB::statement('DELETE FROM client');
        DB::statement('DELETE FROM "Utilisateur"');
        parent::tearDown();
    }

    private function creerLivreur(): int
    {
        $userId = DB::table('Utilisateur')->insertGetId([
            'nom_user' => 'LivreurLiv',
            'email_user' => 'livreurliv@test.com',
            'password_user' => Hash::make('123456'),
            'num_user' => '+237690000050',
            'date_inscription' => now(),
            'last_connexion' => now(),
            'statut_account' => 'actif'
        ], 'id_user');

        DB::table('livreur')->insert([
            'id_user' => $userId,
            'code_payement' => 'LIVPAY'
        ]);

        return $userId;
    }

    private function creerBonAssocie(): int
    {
        // create validator
        $validator = DB::table('Utilisateur')->insertGetId([
            'nom_user' => 'ValLiv',
            'email_user' => 'valliv@test.com',
            'password_user' => Hash::make('123456'),
            'num_user' => '+237690000051',
            'date_inscription' => now(),
            'last_connexion' => now(),
            'statut_account' => 'actif'
        ], 'id_user');

        // create client + commande
        $clientUser = DB::table('Utilisateur')->insertGetId([
            'nom_user' => 'AcheteurLiv',
            'email_user' => 'acheteurliv@test.com',
            'password_user' => Hash::make('123456'),
            'num_user' => '+237690000052',
            'date_inscription' => now(),
            'last_connexion' => now(),
            'statut_account' => 'actif'
        ], 'id_user');

        $cmdId = DB::table('commande')->insertGetId([
            'date_commande' => now(),
            'date_heure_livraison' => now()->addHour(),
            'localisation_client' => 'Akwa',
            'type_localisation' => 'googleMap',
            'statut_commande' => 'en_cours',
            'acheteur' => $clientUser
        ], 'id_commande');

        return DB::table('bon_commande')->insertGetId([
            'statut_bon' => 'en_cours',
            'validateur' => $validator,
            'commande_associe' => $cmdId
        ], 'id_bon');
    }

    public function testCreationLivraison()
    {
        $livreurId = $this->creerLivreur();
        $bonId = $this->creerBonAssocie();

        $data = [
            'date_livraison' => now()->toDateTimeString(),
            'statut_livraison' => 'en_cours',
            'commentaire' => 'Livraison test',
            'note_livraison' => 4,
            'livreur' => $livreurId,
            'bon_associe' => $bonId
        ];

        $response = $this->postJson('/api/livraisons', $data);
        $response->assertStatus(201);
        $this->assertDatabaseHas('livraison', ['bon_associe' => $bonId, 'livreur' => $livreurId]);
    }

    public function testGetAllLivraisons()
    {
        $livreurId = $this->creerLivreur();
        $bonId = $this->creerBonAssocie();

        DB::table('livraison')->insert([
            'date_livraison' => now(),
            'statut_livraison' => 'en_cours',
            'commentaire' => 'Test',
            'note_livraison' => 5,
            'livreur' => $livreurId,
            'bon_associe' => $bonId
        ], 'id_livraison');

        $response = $this->getJson('/api/livraisons');
        $response->assertStatus(200)->assertJsonStructure(['*' => ['id_livraison','date_livraison','statut_livraison','commentaire','note_livraison','livreur','bon_associe']]);
    }

    public function testGetOneLivraison()
    {
        $livreurId = $this->creerLivreur();
        $bonId = $this->creerBonAssocie();

        $livId = DB::table('livraison')->insertGetId([
            'date_livraison' => now(),
            'statut_livraison' => 'en_cours',
            'commentaire' => 'Test One',
            'note_livraison' => 3,
            'livreur' => $livreurId,
            'bon_associe' => $bonId
        ], 'id_livraison');

        $response = $this->getJson("/api/livraisons/{$livId}");
        $response->assertStatus(200)->assertJsonFragment(['id_livraison' => $livId]);
    }

    public function testUpdateLivraison()
    {
        $livreurId = $this->creerLivreur();
        $bonId = $this->creerBonAssocie();

        $livId = DB::table('livraison')->insertGetId([
            'date_livraison' => now(),
            'statut_livraison' => 'en_cours',
            'commentaire' => 'Avant update',
            'note_livraison' => 3,
            'livreur' => $livreurId,
            'bon_associe' => $bonId
        ], 'id_livraison');

        $response = $this->putJson("/api/livraisons/{$livId}", ['commentaire' => 'Après update', 'note_livraison' => 5]);
        $response->assertStatus(200);
        $this->assertDatabaseHas('livraison', ['id_livraison' => $livId, 'commentaire' => 'Après update', 'note_livraison' => 5]);
    }

    public function testDeleteLivraison()
    {
        $livreurId = $this->creerLivreur();
        $bonId = $this->creerBonAssocie();

        $livId = DB::table('livraison')->insertGetId([
            'date_livraison' => now(),
            'statut_livraison' => 'en_cours',
            'commentaire' => 'To delete',
            'note_livraison' => 2,
            'livreur' => $livreurId,
            'bon_associe' => $bonId
        ], 'id_livraison');

        $response = $this->deleteJson("/api/livraisons/{$livId}");
        $response->assertStatus(204);
        $this->assertDatabaseMissing('livraison', ['id_livraison' => $livId]);
    }
}