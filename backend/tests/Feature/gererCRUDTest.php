<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class GererCRUDTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        DB::statement('DELETE FROM gerer');
        DB::statement('DELETE FROM restaurant');
        DB::statement('DELETE FROM administrateur');
        DB::statement('DELETE FROM gerant');
        DB::statement('DELETE FROM "Utilisateur"');
        DB::statement('DELETE FROM file');
    }

    protected function tearDown(): void
    {
        DB::statement('DELETE FROM gerer');
        DB::statement('DELETE FROM restaurant');
        DB::statement('DELETE FROM administrateur');
        DB::statement('DELETE FROM gerant');
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
            'num_user' => '+237600000000',
            'date_inscription' => now(),
            'last_connexion' => now(),
            'statut_account' => 'actif'
        ], 'id_user');
    }

    private function creerAdministrateur(int $userId): void
    {
        DB::table('administrateur')->insert(['id_user' => $userId]);
    }

    private function creerGerantUser(): int
    {
        $id = $this->creerUtilisateur('GerantTest', 'gerant@test.com');
        DB::table('gerant')->insert(['id_user' => $id]);
        return $id;
    }

    private function creerFile(): int
    {
        return DB::table('file')->insertGetId([
            'nom_fichier' => 'logo_gerer',
            'extension' => 'png',
            'chemin' => '/uploads/logo_gerer.png'
        ], 'id_file');
    }

    private function creerRestaurant(int $adminId, int $fileId): int
    {
        return DB::table('restaurant')->insertGetId([
            'nom_restaurant' => 'RestoGerer',
            'localisation' => 'Douala',
            'type_localisation' => 'googleMap',
            'logo_restaurant' => $fileId,
            'politique' => 'Politique',
            'administrateur' => $adminId
        ], 'id_restaurant');
    }

    private function creerGerer(): array
    {
        $adminUser = $this->creerUtilisateur('AdminGerer', 'admingerer@test.com');
        $this->creerAdministrateur($adminUser);

        $gerantUser = $this->creerGerantUser();

        $fileId = $this->creerFile();
        $restoId = $this->creerRestaurant($adminUser, $fileId);

        DB::table('gerer')->insert([
            'id_restaurant' => $restoId,
            'id_gerant' => $gerantUser,
            'date_debut' => now(),
            'service_employe' => true
        ]);

        return ['id_restaurant' => $restoId, 'id_gerant' => $gerantUser];
    }

    public function testCreationGerer()
    {
        $idGerant = $this->creerGerantUser();
        $adminId = $this->creerUtilisateur('AdminForGerer', 'adminforgerer@test.com');
        $this->creerAdministrateur($adminId);
        $idRestaurant = $this->creerRestaurant(
            $adminId,
            $this->creerFile()
        );
        $response = $this->postJson('/api/gerer', [
            'id_restaurant' => $idRestaurant,
            'id_gerant' => $idGerant,
            'date_debut' => now()->toDateString(),
            'service_employe' => true
        ]);
        $response->assertStatus(201);
        $this->assertDatabaseHas('gerer', ['id_restaurant' => $idRestaurant, 'id_gerant' => $idGerant]);
    }

    public function testGetAllGerer()
    {
        $this->creerGerer();
        $response = $this->getJson('/api/gerer');
        $response->assertStatus(200)->assertJsonStructure(['*' => ['id_restaurant','id_gerant','date_debut','service_employe']]);
    }

    public function testGetOneGerer()
    {
        $g = $this->creerGerer();
        $response = $this->getJson("/api/gerer/{$g['id_restaurant']}/{$g['id_gerant']}");
        $response->assertStatus(200)->assertJsonFragment(['id_restaurant' => $g['id_restaurant'], 'id_gerant' => $g['id_gerant']]);
    }

    public function testUpdateGerer()
    {
        $g = $this->creerGerer();
        $response = $this->putJson("/api/gerer/{$g['id_restaurant']}/{$g['id_gerant']}", ['service_employe' => false]);
        $response->assertStatus(200);
        $this->assertDatabaseHas('gerer', ['id_restaurant' => $g['id_restaurant'], 'id_gerant' => $g['id_gerant'], 'service_employe' => false]);
    }

    public function testDeleteGerer()
    {
        $g = $this->creerGerer();
        $response = $this->deleteJson("/api/gerer/{$g['id_restaurant']}/{$g['id_gerant']}");
        $response->assertStatus(204);
        $this->assertDatabaseMissing('gerer', ['id_restaurant' => $g['id_restaurant'], 'id_gerant' => $g['id_gerant']]);
    }
}