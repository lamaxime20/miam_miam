<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ReponseCRUDTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        DB::statement('DELETE FROM reponse');
        DB::statement('DELETE FROM reclamation');
        DB::statement('DELETE FROM restaurant');
        DB::statement('DELETE FROM administrateur');
        DB::statement('DELETE FROM client');
        DB::statement('DELETE FROM "Utilisateur"');
        DB::statement('DELETE FROM file');
    }

    protected function tearDown(): void
    {
        DB::statement('DELETE FROM reponse');
        DB::statement('DELETE FROM reclamation');
        DB::statement('DELETE FROM restaurant');
        DB::statement('DELETE FROM administrateur');
        DB::statement('DELETE FROM client');
        DB::statement('DELETE FROM "Utilisateur"');
        DB::statement('DELETE FROM file');
        parent::tearDown();
    }

    private function creerReclamationAvecAuteur(): array
    {
        // auteur (utilisateur)
        $auteur = DB::table('Utilisateur')->insertGetId([
            'nom_user' => 'AuteurRep',
            'email_user' => 'auteurrep@test.com',
            'password_user' => Hash::make('123456'),
            'num_user' => '+237690000080',
            'date_inscription' => now(),
            'last_connexion' => now(),
            'statut_account' => 'actif'
        ], 'id_user');

        // client + restaurant + reclamation
        $clientUser = DB::table('Utilisateur')->insertGetId([
            'nom_user' => 'ClientRep',
            'email_user' => 'clientrep@test.com',
            'password_user' => Hash::make('123456'),
            'num_user' => '+237690000081',
            'date_inscription' => now(),
            'last_connexion' => now(),
            'statut_account' => 'actif'
        ], 'id_user');

        $admin = DB::table('Utilisateur')->insertGetId([
            'nom_user' => 'AdminRep',
            'email_user' => 'adminrep@test.com',
            'password_user' => Hash::make('123456'),
            'num_user' => '+237690000082',
            'date_inscription' => now(),
            'last_connexion' => now(),
            'statut_account' => 'actif'
        ], 'id_user');

        DB::table('administrateur')->insert(['id_user' => $admin]);

        $fileId = DB::table('file')->insertGetId([
            'nom_fichier' => 'logo_rep',
            'extension' => 'jpg',
            'chemin' => '/uploads/rep.jpg'
        ], 'id_file');

        $restoId = DB::table('restaurant')->insertGetId([
            'nom_restaurant' => 'RestoRep',
            'localisation' => 'Bonapriso',
            'type_localisation' => 'googleMap',
            'logo_restaurant' => $fileId,
            'politique' => 'OK',
            'administrateur' => $admin
        ], 'id_restaurant');

        $recId = DB::table('reclamation')->insertGetId([
            'message_reclamation' => 'Problème',
            'date_soummission' => now(),
            'statut_reclamation' => 'ouverte',
            'restaurant_cible' => $restoId,
            'acheteur' => $clientUser
        ], 'id_reclamation');

        return ['reclamation' => $recId, 'auteur' => $auteur];
    }

    public function testCreationReponse()
    {
        $ids = $this->creerReclamationAvecAuteur();

        $response = $this->postJson('/api/reponses', [
            'statut_reponse' => 'en_traitement',
            'reclamation_cible' => $ids['reclamation'],
            'auteur' => $ids['auteur'],
            'message_reponse' => 'Nous regardons cela'
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('reponse', ['reclamation_cible' => $ids['reclamation'], 'auteur' => $ids['auteur']]);
    }

    public function testGetAllReponses()
    {
        $ids = $this->creerReclamationAvecAuteur();
        DB::table('reponse')->insert([
            'statut_reponse' => 'ouverte',
            'reclamation_cible' => $ids['reclamation'],
            'auteur' => $ids['auteur'],
            'message_reponse' => 'OK'
        ], 'id_reponse');

        $response = $this->getJson('/api/reponses');
        $response->assertStatus(200)->assertJsonStructure(['*' => ['id_reponse','statut_reponse','reclamation_cible','auteur','message_reponse']]);
    }

    public function testGetOneReponse()
    {
        $ids = $this->creerReclamationAvecAuteur();
        $repId = DB::table('reponse')->insertGetId([
            'statut_reponse' => 'ouverte',
            'reclamation_cible' => $ids['reclamation'],
            'auteur' => $ids['auteur'],
            'message_reponse' => 'OK'
        ], 'id_reponse');

        $response = $this->getJson("/api/reponses/{$repId}");
        $response->assertStatus(200)->assertJsonFragment(['id_reponse' => $repId]);
    }

    public function testUpdateReponse()
    {
        $ids = $this->creerReclamationAvecAuteur();
        $repId = DB::table('reponse')->insertGetId([
            'statut_reponse' => 'ouverte',
            'reclamation_cible' => $ids['reclamation'],
            'auteur' => $ids['auteur'],
            'message_reponse' => 'Avant'
        ], 'id_reponse');

        $response = $this->putJson("/api/reponses/{$repId}", ['message_reponse' => 'Après']);
        $response->assertStatus(200);
        $this->assertDatabaseHas('reponse', ['id_reponse' => $repId, 'message_reponse' => 'Après']);
    }

    public function testDeleteReponse()
    {
        $ids = $this->creerReclamationAvecAuteur();
        $repId = DB::table('reponse')->insertGetId([
            'statut_reponse' => 'ouverte',
            'reclamation_cible' => $ids['reclamation'],
            'auteur' => $ids['auteur'],
            'message_reponse' => 'ToDel'
        ], 'id_reponse');

        $response = $this->deleteJson("/api/reponses/{$repId}");
        $response->assertStatus(204);
        $this->assertDatabaseMissing('reponse', ['id_reponse' => $repId]);
    }
}