<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class FavorisCRUDTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        DB::statement('DELETE FROM favoris');
        DB::statement('DELETE FROM menu');
        DB::statement('DELETE FROM categorie_menu');
        DB::statement('DELETE FROM restaurant');
        DB::statement('DELETE FROM administrateur');
        DB::statement('DELETE FROM "Utilisateur"');
        DB::statement('DELETE FROM client');
        DB::statement('DELETE FROM file');
    }

    protected function tearDown(): void
    {
        DB::statement('DELETE FROM favoris');
        DB::statement('DELETE FROM menu');
        DB::statement('DELETE FROM categorie_menu');
        DB::statement('DELETE FROM restaurant');
        DB::statement('DELETE FROM administrateur');
        DB::statement('DELETE FROM "Utilisateur"');
        DB::statement('DELETE FROM client');
        DB::statement('DELETE FROM file');
        parent::tearDown();
    }

    // Crée un utilisateur et un client et retourne l'id
    private function creerClient(): int
    {
        // Insérer l'utilisateur et récupérer son ID
        $userId = DB::table('Utilisateur')->insertGetId([
            'nom_user' => 'ClientTest',
            'email_user' => 'client@test.com',
            'password_user' => Hash::make('123456'),
            'num_user' => '+237690000020',
            'date_inscription' => now(),
            'last_connexion' => now(),
            'statut_account' => 'actif'
        ], 'id_user');

        // S'assurer que l'utilisateur est bien inséré avant de créer le client
        $utilisateur = DB::table('Utilisateur')->where('id_user', $userId)->first();
        if (!$utilisateur) {
            throw new \Exception("L'utilisateur n'a pas été créé correctement.");
        }

        return $userId;
    }


    // Crée un menu complet avec admin, restaurant, file et catégorie
    private function creerMenu(): int
    {
        $adminId = DB::table('Utilisateur')->insertGetId([
            'nom_user' => 'AdminMenu',
            'email_user' => 'adminmenu2@test.com',
            'password_user' => Hash::make('123456'),
            'num_user' => '+237690000021',
            'date_inscription' => now(),
            'last_connexion' => now(),
            'statut_account' => 'actif'
        ], 'id_user');

        DB::table('administrateur')->insert(['id_user' => $adminId]);

        $fileId = DB::table('file')->insertGetId([
            'nom_fichier' => 'logo_menu',
            'extension' => 'jpg',
            'chemin' => '/uploads/menu.jpg'
        ], 'id_file');

        $restoId = DB::table('restaurant')->insertGetId([
            'nom_restaurant' => 'RestoMenu',
            'localisation' => 'Douala Bonanjo',
            'type_localisation' => 'googleMap',
            'logo_restaurant' => $fileId,
            'politique' => 'Test',
            'administrateur' => $adminId
        ], 'id_restaurant');

        DB::table('categorie_menu')->insert([
            'libelle' => 'plat',
            'description_categorie' => 'Plats variés'
        ]);

        $menuId = DB::table('menu')->insertGetId([
            'nom_menu' => 'MenuTest',
            'description_menu' => 'Menu test',
            'image_menu' => $fileId,
            'prix_menu' => 5000,
            'fidelity_point' => 10,
            'statut_menu' => 'disponible',
            'restaurant_hote' => $restoId,
            'libelle_menu' => 'plat'
        ], 'id_menu');

        return $menuId;
    }

    // Crée un favoris complet et retourne les IDs
    private function creerFavoris(): array
    {
        $id_client = $this->creerClient();
        $id_menu = $this->creerMenu();

        DB::table('favoris')->insert([
            'id_menu' => $id_menu,
            'id_client' => $id_client
        ]);

        return ['id_menu' => $id_menu, 'id_client' => $id_client];
    }

    public function testCreationFavoris()
    {
        $id_client = $this->creerClient();
        $id_menu = $this->creerMenu();

        $response = $this->postJson('/api/favoris', [
            'id_menu' => $id_menu,
            'id_client' => $id_client
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('favoris', [
            'id_menu' => $id_menu,
            'id_client' => $id_client
        ]);
    }

    public function testGetAllFavoris()
    {
        $this->creerFavoris();
        $response = $this->getJson('/api/favoris');
        $response->assertStatus(200)->assertJsonStructure([
            '*' => ['id_menu','id_client']
        ]);
    }

    public function testGetOneFavoris()
    {
        $fav = $this->creerFavoris();
        $response = $this->getJson("/api/favoris/{$fav['id_menu']}/{$fav['id_client']}");
        $response->assertStatus(200)->assertJson([
            'id_menu' => $fav['id_menu'],
            'id_client' => $fav['id_client']
        ]);
    }

    public function testDeleteFavoris()
    {
        $fav = $this->creerFavoris();
        $response = $this->deleteJson("/api/favoris/{$fav['id_menu']}/{$fav['id_client']}");
        $response->assertStatus(204);
        $this->assertDatabaseMissing('favoris', [
            'id_menu' => $fav['id_menu'],
            'id_client' => $fav['id_client']
        ]);
    }
}