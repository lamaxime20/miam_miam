<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class Concerner_menuCRUDTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        DB::statement('DELETE FROM concerner_menu');
        DB::statement('DELETE FROM promotion');
        DB::statement('DELETE FROM menu');
        DB::statement('DELETE FROM categorie_menu');
        DB::statement('DELETE FROM restaurant');
        DB::statement('DELETE FROM administrateur');
        DB::statement('DELETE FROM "Utilisateur"');
        DB::statement('DELETE FROM file');
    }

    protected function tearDown(): void
    {
        DB::statement('DELETE FROM concerner_menu');
        DB::statement('DELETE FROM promotion');
        DB::statement('DELETE FROM menu');
        DB::statement('DELETE FROM categorie_menu');
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
            'num_user' => '+237622222222',
            'date_inscription' => now(),
            'last_connexion' => now(),
            'statut_account' => 'actif'
        ], 'id_user');
    }

    private function creerPromotion(): int
    {
        $fileId = DB::table('file')->insertGetId([
            'nom_fichier' => 'promo_file',
            'extension' => 'jpg',
            'chemin' => '/uploads/promo.jpg'
        ], 'id_file');

        return DB::table('promotion')->insertGetId([
            'titre' => 'PromoTest',
            'description_promotion' => 'Desc',
            'date_debut' => now(),
            'date_fin' => now()->addDays(5),
            'image_promo' => $fileId,
            'pourcentage_reduction' => 10.00
        ], 'id_promo');
    }

    private function creerMenu(): int
    {
        $adminId = $this->creerUtilisateur('AdminConc', 'adminconc@test.com');
        DB::table('administrateur')->insert(['id_user' => $adminId]);
        $fileId = DB::table('file')->insertGetId([
            'nom_fichier' => 'logo_conc',
            'extension' => 'png',
            'chemin' => '/uploads/logo_conc.png'
        ], 'id_file');

        $restoId = DB::table('restaurant')->insertGetId([
            'nom_restaurant' => 'RestoConc',
            'localisation' => 'Douala',
            'type_localisation' => 'googleMap',
            'logo_restaurant' => $fileId,
            'politique' => 'OK',
            'administrateur' => $adminId
        ], 'id_restaurant');

        DB::table('categorie_menu')->insert(['libelle' => 'dessert', 'description_categorie' => 'desserts']);

        return DB::table('menu')->insertGetId([
            'nom_menu' => 'MenuConc',
            'description_menu' => 'desc',
            'image_menu' => $fileId,
            'prix_menu' => 3000,
            'fidelity_point' => 5,
            'statut_menu' => 'disponible',
            'restaurant_hote' => $restoId,
            'libelle_menu' => 'dessert'
        ], 'id_menu');
    }

    private function creerConcerner(): array
    {
        $promoId = $this->creerPromotion();
        $menuId = $this->creerMenu();

        DB::table('concerner_menu')->insert(['id_promo' => $promoId, 'id_menu' => $menuId]);

        return ['id_promo' => $promoId, 'id_menu' => $menuId];
    }

    public function testCreationConcernerMenu()
    {
        $promoId = $this->creerPromotion();
        $menuId = $this->creerMenu();
        $response = $this->postJson('/api/concerner_menus', ['id_promo' => $promoId, 'id_menu' => $menuId]);
        $response->assertStatus(201);
        $this->assertDatabaseHas('concerner_menu', ['id_promo' => $promoId, 'id_menu' => $menuId]);
    }

    public function testGetAllConcernerMenu()
    {
        $this->creerConcerner();
        $response = $this->getJson('/api/concerner_menus');
        $response->assertStatus(200)->assertJsonStructure(['*' => ['id_promo','id_menu']]);
    }

    public function testGetOneConcernerMenu()
    {
        $c = $this->creerConcerner();
        $response = $this->getJson("/api/concerner_menus/{$c['id_promo']}/{$c['id_menu']}");
        $response->assertStatus(200)->assertJsonFragment(['id_promo' => $c['id_promo'], 'id_menu' => $c['id_menu']]);
    }

    public function testDeleteConcernerMenu()
    {
        $c = $this->creerConcerner();
        $response = $this->deleteJson("/api/concerner_menus/{$c['id_promo']}/{$c['id_menu']}");
        $response->assertStatus(204);
        $this->assertDatabaseMissing('concerner_menu', ['id_promo' => $c['id_promo'], 'id_menu' => $c['id_menu']]);
    }
}