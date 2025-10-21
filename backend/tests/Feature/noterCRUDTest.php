<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class NoterCRUDTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        DB::statement('DELETE FROM noter');
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
        DB::statement('DELETE FROM noter');
        DB::statement('DELETE FROM client');
        DB::statement('DELETE FROM menu');
        DB::statement('DELETE FROM categorie_menu');
        DB::statement('DELETE FROM restaurant');
        DB::statement('DELETE FROM administrateur');
        DB::statement('DELETE FROM file');
        DB::statement('DELETE FROM "Utilisateur"');
        parent::tearDown();
    }

    private function creerMenuEtClient(): array
    {
        $clientUser = DB::table('Utilisateur')->insertGetId([
            'nom_user' => 'NoteClient',
            'email_user' => 'noteclient@test.com',
            'password_user' => Hash::make('123456'),
            'num_user' => '+237690000090',
            'date_inscription' => now(),
            'last_connexion' => now(),
            'statut_account' => 'actif'
        ], 'id_user');

        $admin = DB::table('Utilisateur')->insertGetId([
            'nom_user' => 'AdminNote',
            'email_user' => 'adminnote@test.com',
            'password_user' => Hash::make('123456'),
            'num_user' => '+237690000091',
            'date_inscription' => now(),
            'last_connexion' => now(),
            'statut_account' => 'actif'
        ], 'id_user');

        DB::table('administrateur')->insert(['id_user' => $admin]);

        $fileId = DB::table('file')->insertGetId([
            'nom_fichier' => 'logo_note',
            'extension' => 'jpg',
            'chemin' => '/uploads/note.jpg'
        ], 'id_file');

        $restoId = DB::table('restaurant')->insertGetId([
            'nom_restaurant' => 'RestoNote',
            'localisation' => 'Akwa',
            'type_localisation' => 'googleMap',
            'logo_restaurant' => $fileId,
            'politique' => 'OK',
            'administrateur' => $admin
        ], 'id_restaurant');

        DB::table('categorie_menu')->insert(['libelle' => 'plat', 'description_categorie' => 'Plats']);

        $menuId = DB::table('menu')->insertGetId([
            'nom_menu' => 'MenuNote',
            'description_menu' => 'Desc',
            'image_menu' => $fileId,
            'prix_menu' => 3000,
            'fidelity_point' => 5,
            'statut_menu' => 'disponible',
            'restaurant_hote' => $restoId,
            'libelle_menu' => 'plat'
        ], 'id_menu');

        return ['client' => $clientUser, 'menu' => $menuId];
    }

    public function testCreationNoter()
    {
        $ids = $this->creerMenuEtClient();

        $response = $this->postJson('/api/noters', [
            'id_client' => $ids['client'],
            'id_menu' => $ids['menu'],
            'note_menu' => 5,
            'commentaire' => 'Excellent'
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('noter', ['id_client' => $ids['client'], 'id_menu' => $ids['menu'], 'note_menu' => 5]);
    }

    public function testGetAllNoters()
    {
        $ids = $this->creerMenuEtClient();

        DB::table('noter')->insert([
            'id_client' => $ids['client'],
            'id_menu' => $ids['menu'],
            'note_menu' => 4,
            'commentaire' => 'Bien'
        ]);

        $response = $this->getJson('/api/noters');
        $response->assertStatus(200)->assertJsonStructure(['*' => ['id_client','id_menu','note_menu','commentaire']]);
    }

    public function testGetOneNoter()
    {
        $ids = $this->creerMenuEtClient();

        DB::table('noter')->insert([
            'id_client' => $ids['client'],
            'id_menu' => $ids['menu'],
            'note_menu' => 4,
            'commentaire' => 'Bien'
        ]);

        $response = $this->getJson("/api/noters/{$ids['client']}/{$ids['menu']}");
        $response->assertStatus(200)->assertJsonFragment(['id_client' => $ids['client'], 'id_menu' => $ids['menu']]);
    }

    public function testUpdateNoter()
    {
        $ids = $this->creerMenuEtClient();

        DB::table('noter')->insert([
            'id_client' => $ids['client'],
            'id_menu' => $ids['menu'],
            'note_menu' => 3,
            'commentaire' => 'Moyen'
        ]);

        $response = $this->putJson("/api/noters/{$ids['client']}/{$ids['menu']}", ['note_menu' => 5, 'commentaire' => 'Super']);
        $response->assertStatus(200);
        $this->assertDatabaseHas('noter', ['id_client' => $ids['client'], 'id_menu' => $ids['menu'], 'note_menu' => 5]);
    }

    public function testDeleteNoter()
    {
        $ids = $this->creerMenuEtClient();

        DB::table('noter')->insert([
            'id_client' => $ids['client'],
            'id_menu' => $ids['menu'],
            'note_menu' => 2,
            'commentaire' => 'Pas bon'
        ]);

        $response = $this->deleteJson("/api/noters/{$ids['client']}/{$ids['menu']}");
        $response->assertStatus(204);
        $this->assertDatabaseMissing('noter', ['id_client' => $ids['client'], 'id_menu' => $ids['menu']]);
    }
}