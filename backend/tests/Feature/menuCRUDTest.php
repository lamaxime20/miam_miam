<?php

namespace Tests\Feature;

use App\Models\administrateur;
use Tests\TestCase;
use App\Models\Menu;
use App\Models\Restaurant;
use App\Models\File;
use App\Models\Utilisateur;
use Illuminate\Support\Facades\DB;

class MenuCRUDTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        DB::statement('DELETE FROM menu');
        DB::statement('DELETE FROM categorie_menu');
        DB::statement('DELETE FROM restaurant');
        DB::statement('DELETE FROM file');
        DB::statement('DELETE FROM administrateur');
        DB::statement('DELETE FROM "Utilisateur"');
    }

    protected function tearDown(): void
    {
        DB::statement('DELETE FROM menu');
        DB::statement('DELETE FROM categorie_menu');
        DB::statement('DELETE FROM restaurant');
        DB::statement('DELETE FROM file');
        DB::statement('DELETE FROM administrateur');
        DB::statement('DELETE FROM "Utilisateur"');
        parent::tearDown();
    }

    private function creer_menu(){
        // Créer utilisateur admin
        $userId = Utilisateur::create([
            'nom_user' => 'AdminMenu',
            'email_user' => 'adminmenu@test.com',
            'password_user' => bcrypt('123456'),
            'num_user' => '+237690000011',
            'date_inscription' => now(),
            'last_connexion' => now(),
            'statut_account' => 'actif',
        ]);

        administrateur::create(['id_user' => $userId->id_user]);

        // Créer logo
        $fileId = DB::table('file')->insertGetId([
            'nom_fichier' => 'logo_menu',
            'extension' => 'jpg',
            'chemin' => '/uploads/menu.jpg',
        ], 'id_file');

        // Créer restaurant
        $restoId = DB::table('restaurant')->insertGetId([
            'nom_restaurant' => 'RestoMenu',
            'localisation' => 'Douala Akwa',
            'type_localisation' => 'googleMap',
            'logo_restaurant' => $fileId,
            'politique' => 'Test',
            'administrateur' => $userId->id_user,
        ], 'id_restaurant');

        // Créer catégorie
        DB::table('categorie_menu')->insert([
            'libelle' => 'plat',
            'description_categorie' => 'Plats délicieux',
        ]);

        // Créer menu
        return Menu::create([
            'nom_menu' => 'MenuTest',
            'description_menu' => 'Description test',
            'image_menu' => $fileId,
            'prix_menu' => 5000,
            'fidelity_point' => 10,
            'statut_menu' => 'disponible',
            'restaurant_hote' => $restoId,
            'libelle_menu' => 'plat',
        ]);
    }

    public function testCreationMenu()
    {
        $response = $this->postJson('/api/menus', [
            'nom_menu' => 'MenuTest',
            'description_menu' => 'Description test',
            'image_menu' => null,
            'prix_menu' => 5000,
            'fidelity_point' => 10,
            'statut_menu' => 'disponible',
            'restaurant_hote' => null,
            'libelle_menu' => 'plat',
        ]);
        $response->assertStatus(201);
        $response->assertJsonStructure([
            'message' => 'Menu created successfully.',
        ]);
    }

    public function testGetAllMenus()
    {
        $this->creer_menu();
        $response = $this->getJson('/api/menus');
        $response->assertStatus(200)->assertJsonStructure([['id_menu','nom_menu','description_menu','image_menu','prix_menu','fidelity_point','statut_menu','restaurant_hote','libelle_menu','updated_at']]);
    }

    public function testGetOneMenu()
    {
        $menu = $this->creer_menu();
        $response = $this->getJson("/api/menus/{$menu->id_menu}");
        $response->assertStatus(200);
        $response->assertJsonStructure(['id_menu','nom_menu','description_menu','image_menu','prix_menu','fidelity_point','statut_menu','restaurant_hote','libelle_menu','updated_at']);
    }

    public function testUpdateMenu()
    {
        $menu = $this->creer_menu();
        $response = $this->putJson("/api/menus/{$menu->id_menu}", ['prix_menu' => 6000]);
        $response->assertStatus(200);
        $this->assertDatabaseHas('menu', ['id_menu' => $menu->id_menu, 'prix_menu' => 6000]);
    }

    public function testDeleteMenu()
    {
        $menu = $this->creer_menu();
        $response = $this->deleteJson("/api/menus/{$menu->id_menu}");
        $response->assertStatus(204);
        $this->assertDatabaseMissing('menu', ['id_menu' => $menu->id_menu]);
        $response->assertJsonStructure([
            'message' => 'Menu deleted successfully.',
        ]);
    }
}