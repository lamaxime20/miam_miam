<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Categorie_menu;
use Illuminate\Support\Facades\DB;

class categorie_menuCRUDTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        DB::statement('DELETE FROM categorie_menu;');
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        DB::statement('DELETE FROM categorie_menu;');
    }

    private function creerCategorie_menu(){
        return Categorie_menu::create([
            'libelle' => 'entree',
            'description_categorie' => 'Entrées fraîches',
        ]);
    }

    public function testCreationCategorie()
    {
        $data = [
            'libelle' => 'plat',
            'description_categorie' => 'Plats principaux du jour',
        ];

        $response = $this->postJson('/api/categories_menu', $data);
        $response->assertStatus(201);
        $response->assertJsonStructure([
            'message' => 'categorie_menu created successfully',
        ]);
    }

    public function testGetAllCategories()
    {
        $this->creerCategorie_menu();
        $response = $this->getJson('/api/categories_menu');
        $response->assertStatus(200);
        $response->assertJsonStructure([
            '*' => [
                'libelle',
                'description_categorie',
            ],
        ]);
    }

    public function testGetOneCategorie()
    {
        $this->creerCategorie_menu();

        $cat = Categorie_menu::first();
        if ($cat) {
            $response = $this->getJson("/api/categories_menu/{$cat->libelle}");
            $response->assertStatus(200);
            $response->assertJsonStructure([
                'libelle',
                'description_categorie',
            ]);
        }
    }

    public function testUpdateCategorie()
    {
        $this->creerCategorie_menu();

        $cat = Categorie_menu::first();
        if ($cat) {
            $response = $this->putJson("/api/categories_menu/{$cat->libelle}", [
                'description_categorie' => 'Nouveaux plats du chef',
            ]);
            $response->assertStatus(200);
            $response->assertJsonStructure([
                'message' => 'categorie_menu updated successfully',
            ]);
        }
    }

    public function testDeleteCategorie()
    {
        $this->creerCategorie_menu();

        $cat = Categorie_menu::first();
        if ($cat) {
            $response = $this->deleteJson("/api/categories_menu/{$cat->libelle}");
            $response->assertStatus(204);
            $response->assertJsonStructure([
                'message' => 'categorie_menu deleted successfully',
            ]);
        }
    }
}