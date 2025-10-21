<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ReclamationCRUDTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        DB::statement('DELETE FROM reponse');
        DB::statement('DELETE FROM reclamation');
        DB::statement('DELETE FROM promotion');
        DB::statement('DELETE FROM restaurant');
        DB::statement('DELETE FROM administrateur');
        DB::statement('DELETE FROM client');
        DB::statement('DELETE FROM "Utilisateur"');
        DB::statement('DELETE FROM file');
        DB::statement('DELETE FROM categorie_menu');
        DB::statement('DELETE FROM menu');
    }

    protected function tearDown(): void
    {
        DB::statement('DELETE FROM reponse');
        DB::statement('DELETE FROM reclamation');
        DB::statement('DELETE FROM promotion');
        DB::statement('DELETE FROM restaurant');
        DB::statement('DELETE FROM administrateur');
        DB::statement('DELETE FROM client');
        DB::statement('DELETE FROM "Utilisateur"');
        DB::statement('DELETE FROM file');
        DB::statement('DELETE FROM categorie_menu');
        DB::statement('DELETE FROM menu');
        parent::tearDown();
    }

    private function creerRestaurantAvecClient(): array
    {
        $clientUser = DB::table('Utilisateur')->insertGetId([
            'nom_user' => 'ReclClient',
            'email_user' => 'reclclient@test.com',
            'password_user' => Hash::make('123456'),
            'num_user' => '+237690000070',
            'date_inscription' => now(),
            'last_connexion' => now(),
            'statut_account' => 'actif'
        ], 'id_user');

        $adminUser = DB::table('Utilisateur')->insertGetId([
            'nom_user' => 'AdminRcl',
            'email_user' => 'adminrcl@test.com',
            'password_user' => Hash::make('123456'),
            'num_user' => '+237690000071',
            'date_inscription' => now(),
            'last_connexion' => now(),
            'statut_account' => 'actif'
        ], 'id_user');

        DB::table('administrateur')->insert(['id_user' => $adminUser]);

        $fileId = DB::table('file')->insertGetId([
            'nom_fichier' => 'logo_rcl',
            'extension' => 'jpg',
            'chemin' => '/uploads/rcl.jpg'
        ], 'id_file');

        $restoId = DB::table('restaurant')->insertGetId([
            'nom_restaurant' => 'RestoRcl',
            'localisation' => 'Bonapriso',
            'type_localisation' => 'googleMap',
            'logo_restaurant' => $fileId,
            'politique' => 'OK',
            'administrateur' => $adminUser
        ], 'id_restaurant');

        return ['client' => $clientUser, 'restaurant' => $restoId];
    }

    public function testCreationReclamation()
    {
        $ids = $this->creerRestaurantAvecClient();

        $data = [
            'message_reclamation' => 'Problème avec la commande',
            'date_soummission' => now()->toDateTimeString(),
            'statut_reclamation' => 'ouverte',
            'restaurant_cible' => $ids['restaurant'],
            'acheteur' => $ids['client']
        ];

        $response = $this->postJson('/api/reclamations', $data);
        $response->assertStatus(201);
        $this->assertDatabaseHas('reclamation', ['acheteur' => $ids['client']]);
    }

    public function testGetAllReclamations()
    {
        $ids = $this->creerRestaurantAvecClient();

        DB::table('reclamation')->insert([
            'message_reclamation' => 'Test',
            'date_soummission' => now(),
            'statut_reclamation' => 'ouverte',
            'restaurant_cible' => $ids['restaurant'],
            'acheteur' => $ids['client']
        ], 'id_reclamation');

        $response = $this->getJson('/api/reclamations');
        $response->assertStatus(200)->assertJsonStructure(['*' => ['id_reclamation','message_reclamation','date_soummission','statut_reclamation','restaurant_cible','acheteur']]);
    }

    public function testGetOneReclamation()
    {
        $ids = $this->creerRestaurantAvecClient();
        $recId = DB::table('reclamation')->insertGetId([
            'message_reclamation' => 'Test One',
            'date_soummission' => now(),
            'statut_reclamation' => 'ouverte',
            'restaurant_cible' => $ids['restaurant'],
            'acheteur' => $ids['client']
        ], 'id_reclamation');

        $response = $this->getJson("/api/reclamations/{$recId}");
        $response->assertStatus(200)->assertJsonFragment(['id_reclamation' => $recId]);
    }

    public function testUpdateReclamation()
    {
        $ids = $this->creerRestaurantAvecClient();
        $recId = DB::table('reclamation')->insertGetId([
            'message_reclamation' => 'Avant',
            'date_soummission' => now(),
            'statut_reclamation' => 'ouverte',
            'restaurant_cible' => $ids['restaurant'],
            'acheteur' => $ids['client']
        ], 'id_reclamation');

        $response = $this->putJson("/api/reclamations/{$recId}", ['statut_reclamation' => 'en_traitement']);
        $response->assertStatus(200);
        $this->assertDatabaseHas('reclamation', ['id_reclamation' => $recId, 'statut_reclamation' => 'en_traitement']);
    }

    public function testDeleteReclamation()
    {
        $ids = $this->creerRestaurantAvecClient();
        $recId = DB::table('reclamation')->insertGetId([
            'message_reclamation' => 'To delete',
            'date_soummission' => now(),
            'statut_reclamation' => 'ouverte',
            'restaurant_cible' => $ids['restaurant'],
            'acheteur' => $ids['client']
        ], 'id_reclamation');

        $response = $this->deleteJson("/api/reclamations/{$recId}");
        $response->assertStatus(204);
        $this->assertDatabaseMissing('reclamation', ['id_reclamation' => $recId]);
    }
}