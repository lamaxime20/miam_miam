<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class Travailler_pourCRUDTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        DB::statement('DELETE FROM travailler_pour');
        DB::statement('DELETE FROM employe');
        DB::statement('DELETE FROM restaurant');
        DB::statement('DELETE FROM administrateur');
        DB::statement('DELETE FROM "Utilisateur"');
        DB::statement('DELETE FROM file');
    }

    protected function tearDown(): void
    {
        DB::statement('DELETE FROM travailler_pour');
        DB::statement('DELETE FROM employe');
        DB::statement('DELETE FROM restaurant');
        DB::statement('DELETE FROM administrateur');
        DB::statement('DELETE FROM "Utilisateur"');
        DB::statement('DELETE FROM file');
        parent::tearDown();
    }

    private function creerEmployeEtRestaurant(): array
    {
        $userEmp = DB::table('Utilisateur')->insertGetId([
            'nom_user' => 'EmpWork',
            'email_user' => 'empwork@test.com',
            'password_user' => Hash::make('123456'),
            'num_user' => '+237690000120',
            'date_inscription' => now(),
            'last_connexion' => now(),
            'statut_account' => 'actif'
        ], 'id_user');

        DB::table('employe')->insert(['id_user' => $userEmp]);

        $admin = DB::table('Utilisateur')->insertGetId([
            'nom_user' => 'AdminWork',
            'email_user' => 'adminwork@test.com',
            'password_user' => Hash::make('123456'),
            'num_user' => '+237690000121',
            'date_inscription' => now(),
            'last_connexion' => now(),
            'statut_account' => 'actif'
        ], 'id_user');

        DB::table('administrateur')->insert(['id_user' => $admin]);

        $fileId = DB::table('file')->insertGetId([
            'nom_fichier' => 'logo_work',
            'extension' => 'jpg',
            'chemin' => '/uploads/work.jpg'
        ], 'id_file');

        $restoId = DB::table('restaurant')->insertGetId([
            'nom_restaurant' => 'RestoWork',
            'localisation' => 'Bonanjo',
            'type_localisation' => 'googleMap',
            'logo_restaurant' => $fileId,
            'politique' => 'OK',
            'administrateur' => $admin
        ], 'id_restaurant');

        return ['employe' => $userEmp, 'restaurant' => $restoId];
    }

    public function testCreationTravaillerPour()
    {
        $ids = $this->creerEmployeEtRestaurant();

        $response = $this->postJson('/api/travailler_pours', [
            'id_employe' => $ids['employe'],
            'id_restaurant' => $ids['restaurant'],
            'date_debut' => now()->toDateTimeString(),
            'service_employe' => true
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('travailler_pour', ['id_employe' => $ids['employe'], 'id_restaurant' => $ids['restaurant']]);
    }

    public function testGetAllTravaillerPour()
    {
        $ids = $this->creerEmployeEtRestaurant();

        DB::table('travailler_pour')->insert([
            'id_employe' => $ids['employe'],
            'id_restaurant' => $ids['restaurant'],
            'date_debut' => now(),
            'service_employe' => true
        ]);

        $response = $this->getJson('/api/travailler_pours');
        $response->assertStatus(200)->assertJsonStructure(['*' => ['id_employe','id_restaurant','date_debut','service_employe']]);
    }

    public function testGetOneTravaillerPour()
    {
        $ids = $this->creerEmployeEtRestaurant();

        DB::table('travailler_pour')->insert([
            'id_employe' => $ids['employe'],
            'id_restaurant' => $ids['restaurant'],
            'date_debut' => now(),
            'service_employe' => true
        ]);

        $response = $this->getJson("/api/travailler_pours/{$ids['employe']}/{$ids['restaurant']}");
        $response->assertStatus(200);
        $response->assertJsonFragment(['id_employe' => $ids['employe'], 'id_restaurant' => $ids['restaurant']]);
    }

    public function testUpdateTravaillerPour()
    {
        $ids = $this->creerEmployeEtRestaurant();

        DB::table('travailler_pour')->insert([
            'id_employe' => $ids['employe'],
            'id_restaurant' => $ids['restaurant'],
            'date_debut' => now(),
            'service_employe' => true
        ]);

        $response = $this->putJson("/api/travailler_pours/{$ids['employe']}/{$ids['restaurant']}", ['service_employe' => false]);
        $response->assertStatus(200);
        $this->assertDatabaseHas('travailler_pour', ['id_employe' => $ids['employe'], 'id_restaurant' => $ids['restaurant'], 'service_employe' => false]);
    }

    public function testDeleteTravaillerPour()
    {
        $ids = $this->creerEmployeEtRestaurant();

        DB::table('travailler_pour')->insert([
            'id_employe' => $ids['employe'],
            'id_restaurant' => $ids['restaurant'],
            'date_debut' => now(),
            'service_employe' => true
        ]);

        $response = $this->deleteJson("/api/travailler_pours/{$ids['employe']}/{$ids['restaurant']}");
        $response->assertStatus(204);
        $this->assertDatabaseMissing('travailler_pour', ['id_employe' => $ids['employe'], 'id_restaurant' => $ids['restaurant']]);
    }
}