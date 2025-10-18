<?php

namespace Tests\Feature;

use App\Models\administrateur;
use Tests\TestCase;
use App\Models\Utilisateur;
use Illuminate\Support\Facades\DB;

class AdministrateurCRUDTest extends TestCase
{
    private function resetDatabase()
    {
        DB::statement('DELETE FROM administrateur');
        DB::statement('DELETE FROM "Utilisateur"');
    }
    protected function setUp(): void
    {
        parent::setUp();
        $this->resetDatabase();
    }

    protected function tearDown(): void
    {
        $this->resetDatabase();
        parent::tearDown();
    }

    public function test_creation_administrateur()
    {
        $user = Utilisateur::create([
            'nom_user' => 'Admin Test',
            'email_user' => 'admin@test.com',
            'password_user' => 'admin123',
            'num_user' => '+237622222222',
            'date_inscription' => now(),
            'last_connexion' => now(),
            'statut_account' => 'actif'
        ]);

        $response = $this->postJson('/api/administrateurs', [
            'id_user' => $user->id_user
        ]);
        $response->assertStatus(201);
        $this->assertDatabaseHas('administrateur', ['id_user' => $user->id_user]);
    }

    public function test_lecture_admins()
    {
        $user = Utilisateur::create([
            'nom_user' => 'Admin Test',
            'email_user' => 'admin@test.com',
            'password_user' => 'admin123',
            'num_user' => '+237622222222',
            'date_inscription' => now(),
            'last_connexion' => now(),
            'statut_account' => 'actif'
        ]);

        administrateur::create([
            'id_user' => $user->id_user
        ]);
        $response = $this->getJson('/api/administrateurs');
        $response->assertStatus(200);
        $response->assertJsonStructure([
            '*' => [
                'id_user',
            ]
        ]);
    }

    public function test_suppression_admin()
    {
        $user = Utilisateur::create([
            'nom_user' => 'Admin Test',
            'email_user' => 'admin@test.com',
            'password_user' => 'admin123',
            'num_user' => '+237622222222',
            'date_inscription' => now(),
            'last_connexion' => now(),
            'statut_account' => 'actif'
        ]);

        administrateur::create([
            'id_user' => $user->id_user
        ]);
        $admin = DB::table('administrateur')->first();
        $response = $this->deleteJson("/api/administrateurs/{$admin->id_user}");
        $response->assertStatus(200);
        $this->assertDatabaseMissing('administrateur', ['id_user' => $admin->id_user]);
    }
}