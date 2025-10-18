<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Utilisateur;
use Illuminate\Support\Facades\DB;

class GerantCRUDTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        DB::statement('DELETE FROM gerant');
        DB::statement('DELETE FROM "Utilisateur"');
    }

    protected function tearDown(): void
    {
        DB::statement('DELETE FROM gerant');
        DB::statement('DELETE FROM "Utilisateur"');
        parent::tearDown();
    }

    private function creer_User(){
        return Utilisateur::create([
            'nom_user' => 'Gerant Test',
            'email_user' => 'gerant@test.com',
            'password_user' => 'gerant123',
            'num_user' => '+237633333333',
            'date_inscription' => now(),
            'last_connexion' => now(),
            'statut_account' => 'actif'
        ]);
    }

    public function test_creation_gerant()
    {
        $user = $this->creer_User();
        $response = $this->postJson('/api/gerant', [
            'id_user' => $user->id_user
        ]);
        $response->assertStatus(201);
        $this->assertDatabaseHas('gerant', ['id_user' => $user->id_user]);
    }

    public function test_lecture_gerants()
    {
        $this->creer_User();
        $response = $this->getJson('/api/gerant');
        $response->assertStatus(200);
        $response->assertJsonStructure([
            '*' => ['id_user']
        ]);
    }

    public function test_suppression_gerant()
    {
        $this->creer_User();
        $gerant = DB::table('gerant')->first();
        $response = $this->deleteJson("/api/gerant/{$gerant->id_user}");
        $response->assertStatus(200);
        $this->assertDatabaseMissing('gerant', ['id_user' => $gerant->id_user]);
    }
}