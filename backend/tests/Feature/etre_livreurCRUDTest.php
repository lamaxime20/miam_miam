<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class Etre_livreurCRUDTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        DB::statement('DELETE FROM etre_livreur');
        DB::statement('DELETE FROM livreur');
        DB::statement('DELETE FROM restaurant');
        DB::statement('DELETE FROM administrateur');
        DB::statement('DELETE FROM "Utilisateur"');
        DB::statement('DELETE FROM file');
    }

    protected function tearDown(): void
    {
        DB::statement('DELETE FROM etre_livreur');
        DB::statement('DELETE FROM livreur');
        DB::statement('DELETE FROM restaurant');
        DB::statement('DELETE FROM administrateur');
        DB::statement('DELETE FROM "Utilisateur"');
        DB::statement('DELETE FROM file');
        parent::tearDown();
    }

    private function creerUtilisateur(string $nom, string $email): int
    {
        return DB::table('Utilisateur')->insertGetId([
            'nom_user' => $nom,
            'email_user' => $email,
            'password_user' => Hash::make('123456'),
            'num_user' => '+237611111111',
            'date_inscription' => now(),
            'last_connexion' => now(),
            'statut_account' => 'actif'
        ], 'id_user');
    }

    private function creerLivreurUser(): int
    {
        $id = $this->creerUtilisateur('LivreurUser', 'livreuruser@test.com');
        DB::table('livreur')->insert(['id_user' => $id, 'code_payement' => 'LPAY123']);
        return $id;
    }

    private function creerFile(): int
    {
        return DB::table('file')->insertGetId([
            'nom_fichier' => 'logo_el',
            'extension' => 'jpg',
            'chemin' => '/uploads/logo_el.jpg'
        ], 'id_file');
    }

    private function creerAdminAndRestaurant(): int
    {
        $adminId = $this->creerUtilisateur('AdminEL', 'adminel@test.com');
        DB::table('administrateur')->insert(['id_user' => $adminId]);
        $fileId = $this->creerFile();
        return DB::table('restaurant')->insertGetId([
            'nom_restaurant' => 'RestoEL',
            'localisation' => 'Douala',
            'type_localisation' => 'googleMap',
            'logo_restaurant' => $fileId,
            'politique' => 'Ok',
            'administrateur' => $adminId
        ], 'id_restaurant');
    }

    private function creerEtreLivreur(): array
    {
        $livreurId = $this->creerLivreurUser();
        $restoId = $this->creerAdminAndRestaurant();

        DB::table('etre_livreur')->insert([
            'id_livreur' => $livreurId,
            'id_restaurant' => $restoId,
            'note_livreur' => 4,
            'date_debut' => now(),
            'service_employe' => true
        ]);

        return ['id_livreur' => $livreurId, 'id_restaurant' => $restoId];
    }

    public function testCreationEtreLivreur()
    {
        $livreurId = $this->creerLivreurUser();
        $restoId = $this->creerAdminAndRestaurant();
        $response = $this->postJson('/api/etre_livreurs', [
            'id_livreur' => $livreurId,
            'id_restaurant' => $restoId,
            'note_livreur' => 4,
            'date_debut' => now()->toDateString(),
            'service_employe' => true
        ]);
        $response->assertStatus(201);
        $this->assertDatabaseHas('etre_livreur', ['id_livreur' => $livreurId, 'id_restaurant' => $restoId, 'note_livreur' => 4, 'date_debut' => now(), 'service_employe' => true]);
    }

    public function testGetAllEtreLivreur()
    {
        $this->creerEtreLivreur();
        $response = $this->getJson('/api/etre_livreurs');
        $response->assertStatus(200)->assertJsonStructure(['*' => ['id_livreur','id_restaurant','note_livreur','date_debut','service_employe']]);
    }

    public function testGetOneEtreLivreur()
    {
        $e = $this->creerEtreLivreur();
        $response = $this->getJson("/api/etre_livreurs/{$e['id_livreur']}/{$e['id_restaurant']}");
        $response->assertStatus(200)->assertJsonFragment(['id_livreur' => $e['id_livreur'], 'id_restaurant' => $e['id_restaurant']]);
    }

    public function testUpdateEtreLivreur()
    {
        $e = $this->creerEtreLivreur();
        $response = $this->putJson("/api/etre_livreurs/{$e['id_livreur']}/{$e['id_restaurant']}", ['note_livreur' => 5]);
        $response->assertStatus(200);
        $this->assertDatabaseHas('etre_livreur', ['id_livreur' => $e['id_livreur'], 'id_restaurant' => $e['id_restaurant'], 'note_livreur' => 5]);
    }

    public function testDeleteEtreLivreur()
    {
        $e = $this->creerEtreLivreur();
        $response = $this->deleteJson("/api/etre_livreurs/{$e['id_livreur']}/{$e['id_restaurant']}");
        $response->assertStatus(204);
        $this->assertDatabaseMissing('etre_livreur', ['id_livreur' => $e['id_livreur'], 'id_restaurant' => $e['id_restaurant']]);
    }
}