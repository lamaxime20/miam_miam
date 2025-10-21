<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ContenirCRUDTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        DB::statement('DELETE FROM contenir');
        DB::statement('DELETE FROM commande');
        DB::statement('DELETE FROM client');
        DB::statement('DELETE FROM menu');
        DB::statement('DELETE FROM categorie_menu');
        DB::statement('DELETE FROM restaurant');
        DB::statement('DELETE FROM administrateur');
        DB::statement('DELETE FROM file');
        DB::statement('DELETE FROM "Utilisateur"');
    }

    protected function tearDown(): void
    {
        DB::statement('DELETE FROM contenir');
        DB::statement('DELETE FROM commande');
        DB::statement('DELETE FROM client');
        DB::statement('DELETE FROM menu');
        DB::statement('DELETE FROM categorie_menu');
        DB::statement('DELETE FROM restaurant');
        DB::statement('DELETE FROM administrateur');
        DB::statement('DELETE FROM file');
        DB::statement('DELETE FROM "Utilisateur"');
        parent::tearDown();
    }

    private function creerCommandeEtMenu(): array
    {
        $clientUser = DB::table('Utilisateur')->insertGetId([
            'nom_user' => 'ContClient',
            'email_user' => 'contclient@test.com',
            'password_user' => Hash::make('123456'),
            'num_user' => '+237690000110',
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

        // create menu
        $admin = DB::table('Utilisateur')->insertGetId([
            'nom_user' => 'AdminCont',
            'email_user' => 'admincont@test.com',
            'password_user' => Hash::make('123456'),
            'num_user' => '+237690000111',
            'date_inscription' => now(),
            'last_connexion' => now(),
            'statut_account' => 'actif'
        ], 'id_user');
        DB::table('administrateur')->insert(['id_user' => $admin]);

        $fileId = DB::table('file')->insertGetId([
            'nom_fichier' => 'logo_cont',
            'extension' => 'jpg',
            'chemin' => '/uploads/cont.jpg'
        ], 'id_file');

        $restoId = DB::table('restaurant')->insertGetId([
            'nom_restaurant' => 'RestoCont',
            'localisation' => 'Bonanjo',
            'type_localisation' => 'googleMap',
            'logo_restaurant' => $fileId,
            'politique' => 'OK',
            'administrateur' => $admin
        ], 'id_restaurant');

        DB::table('categorie_menu')->insert(['libelle' => 'dessert', 'description_categorie' => 'Desserts']);
        $menuId = DB::table('menu')->insertGetId([
            'nom_menu' => 'MenuCont',
            'description_menu' => 'Desc',
            'image_menu' => $fileId,
            'prix_menu' => 1500,
            'fidelity_point' => 1,
            'statut_menu' => 'disponible',
            'restaurant_hote' => $restoId,
            'libelle_menu' => 'dessert'
        ], 'id_menu');

        return ['commande' => $cmdId, 'menu' => $menuId];
    }

    public function testCreationContenir()
    {
        $ids = $this->creerCommandeEtMenu();

        $response = $this->postJson('/api/contenirs', [
            'id_commande' => $ids['commande'],
            'id_menu' => $ids['menu'],
            'quantite' => 2,
            'prix_unitaire' => 1500.00
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('contenir', ['id_commande' => $ids['commande'], 'id_menu' => $ids['menu']]);
    }

    public function testGetAllContenir()
    {
        $ids = $this->creerCommandeEtMenu();

        DB::table('contenir')->insert([
            'id_commande' => $ids['commande'],
            'id_menu' => $ids['menu'],
            'quantite' => 1,
            'prix_unitaire' => 1500.00
        ]);

        $response = $this->getJson('/api/contenirs');
        $response->assertStatus(200)->assertJsonStructure(['*' => ['id_commande','id_menu','quantite','prix_unitaire']]);
    }

    public function testGetOneContenir()
    {
        $ids = $this->creerCommandeEtMenu();

        DB::table('contenir')->insert([
            'id_commande' => $ids['commande'],
            'id_menu' => $ids['menu'],
            'quantite' => 1,
            'prix_unitaire' => 1500.00
        ]);

        $response = $this->getJson("/api/contenirs/{$ids['commande']}/{$ids['menu']}");
        $response->assertStatus(200);
        $response->assertJsonStructure(['id_commande','id_menu','quantite','prix_unitaire']);
    }

    public function testUpdateContenir()
    {
        $ids = $this->creerCommandeEtMenu();

        DB::table('contenir')->insert([
            'id_commande' => $ids['commande'],
            'id_menu' => $ids['menu'],
            'quantite' => 1,
            'prix_unitaire' => 1500.00
        ]);

        $response = $this->putJson("/api/contenirs/{$ids['commande']}/{$ids['menu']}", ['quantite' => 3]);
        $response->assertStatus(200);
        $this->assertDatabaseHas('contenir', ['id_commande' => $ids['commande'], 'id_menu' => $ids['menu'], 'quantite' => 3]);
    }

    public function testDeleteContenir()
    {
        $ids = $this->creerCommandeEtMenu();

        DB::table('contenir')->insert([
            'id_commande' => $ids['commande'],
            'id_menu' => $ids['menu'],
            'quantite' => 1,
            'prix_unitaire' => 1500.00
        ]);

        $response = $this->deleteJson("/api/contenirs/{$ids['commande']}/{$ids['menu']}");
        $response->assertStatus(204);
        $this->assertDatabaseMissing('contenir', ['id_commande' => $ids['commande'], 'id_menu' => $ids['menu']]);
    }
}