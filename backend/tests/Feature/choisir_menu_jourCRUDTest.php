<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class Choisir_Menu_JourCRUDTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        DB::statement('DELETE FROM choisir_menu_jour');
        DB::statement('DELETE FROM employe');
        DB::statement('DELETE FROM "Utilisateur"');
        DB::statement('DELETE FROM menu');
        DB::statement('DELETE FROM categorie_menu');
        DB::statement('DELETE FROM restaurant');
        DB::statement('DELETE FROM administrateur');
        DB::statement('DELETE FROM file');
    }

    protected function tearDown(): void
    {
        DB::statement('DELETE FROM choisir_menu_jour');
        DB::statement('DELETE FROM employe');
        DB::statement('DELETE FROM "Utilisateur"');
        DB::statement('DELETE FROM menu');
        DB::statement('DELETE FROM categorie_menu');
        DB::statement('DELETE FROM restaurant');
        DB::statement('DELETE FROM administrateur');
        DB::statement('DELETE FROM file');
        parent::tearDown();
    }

    private function creerEmployeEtMenu(): array
    {
        $userEmp = DB::table('Utilisateur')->insertGetId([
            'nom_user' => 'EmpTest',
            'email_user' => 'emptest@test.com',
            'password_user' => Hash::make('123456'),
            'num_user' => '+237690000100',
            'date_inscription' => now(),
            'last_connexion' => now(),
            'statut_account' => 'actif'
        ], 'id_user');

        DB::table('employe')->insert(['id_user' => $userEmp]);

        // menu creation
        $admin = DB::table('Utilisateur')->insertGetId([
            'nom_user' => 'AdminMenu2',
            'email_user' => 'adminmenu2@test.com',
            'password_user' => Hash::make('123456'),
            'num_user' => '+237690000101',
            'date_inscription' => now(),
            'last_connexion' => now(),
            'statut_account' => 'actif'
        ], 'id_user');

        DB::table('administrateur')->insert(['id_user' => $admin]);

        $fileId = DB::table('file')->insertGetId([
            'nom_fichier' => 'logo_menu2',
            'extension' => 'jpg',
            'chemin' => '/uploads/menu2.jpg'
        ], 'id_file');

        $restoId = DB::table('restaurant')->insertGetId([
            'nom_restaurant' => 'RestoMenu2',
            'localisation' => 'Akwa',
            'type_localisation' => 'googleMap',
            'logo_restaurant' => $fileId,
            'politique' => 'OK',
            'administrateur' => $admin
        ], 'id_restaurant');

        DB::table('categorie_menu')->insert(['libelle' => 'entree', 'description_categorie' => 'Entrées']);

        $menuId = DB::table('menu')->insertGetId([
            'nom_menu' => 'MenuJour',
            'description_menu' => 'Desc',
            'image_menu' => $fileId,
            'prix_menu' => 2000,
            'fidelity_point' => 2,
            'statut_menu' => 'disponible',
            'restaurant_hote' => $restoId,
            'libelle_menu' => 'entree'
        ], 'id_menu');

        return ['employe' => $userEmp, 'menu' => $menuId];
    }

    public function testCreationChoisirMenuJour()
    {
        $ids = $this->creerEmployeEtMenu();

        $response = $this->postJson('/api/choisir_menu_jours', [
            'id_menu' => $ids['menu'],
            'id_employe' => $ids['employe'],
            'date_jour' => now()->toDateString()
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('choisir_menu_jour', ['id_menu' => $ids['menu'], 'id_employe' => $ids['employe']]);
    }

    public function testGetAllChoisirMenuJour()
    {
        $ids = $this->creerEmployeEtMenu();

        DB::table('choisir_menu_jour')->insert([
            'id_menu' => $ids['menu'],
            'id_employe' => $ids['employe'],
            'date_jour' => now()->toDateString()
        ]);

        $response = $this->getJson('/api/choisir_menu_jours');
        $response->assertStatus(200)->assertJsonStructure(['*' => ['id_menu','id_employe','date_jour']]);
    }

    public function testGetOneChoisirMenuJour()
    {
        $ids = $this->creerEmployeEtMenu();

        DB::table('choisir_menu_jour')->insert([
            'id_menu' => $ids['menu'],
            'id_employe' => $ids['employe'],
            'date_jour' => now()->toDateString()
        ]);

        $response = $this->getJson("/api/choisir_menu_jours/{$ids['employe']}/{$ids['menu']}/" . now()->toDateString());
        $response->assertStatus(200);
        $response->assertJsonStructure(['id_menu','id_employe','date_jour']);
    }

    public function testDeleteChoisirMenuJour()
    {
        $ids = $this->creerEmployeEtMenu();

        DB::table('choisir_menu_jour')->insert([
            'id_menu' => $ids['menu'],
            'id_employe' => $ids['employe'],
            'date_jour' => now()->toDateString()
        ]);

        $response = $this->deleteJson("/api/choisir_menu_jours/{$ids['id_menu']}/{$ids['date_jour']}/");
        $response->assertStatus(204);
        $this->assertDatabaseMissing('choisir_menu_jour', ['id_menu' => $ids['menu'], 'id_employe' => $ids['employe'], 'date_jour' => now()->toDateString()]);
    }
}