<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Livreur;
use App\Models\Utilisateur;
use Illuminate\Support\Facades\DB;

class LivreurCRUDTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        DB::statement('DELETE FROM livreur');
        DB::statement('DELETE FROM "Utilisateur"');
    }

    protected function tearDown(): void
    {
        DB::statement('DELETE FROM livreur');
        DB::statement('DELETE FROM "Utilisateur"');
        parent::tearDown();
    }

    private function creer_Utilisateur()
    {
        return Utilisateur::create([
            'nom_user' => 'lamaxime',
            'email_user' => 'lamaxime@example.com',
            'password_user' => bcrypt('123456'),
            'num_user' => '+237690000002',
            'date_inscription' => now(),
            'last_connexion' => now(),
            'statut_account' => 'actif',
        ]);
    }
    public function testCreationLivreur()
    {
        $u = $this->creer_Utilisateur();

        $data = [
            'id_user' => $u->id_user,
            'code_payement' => 'PAY-001',
        ];

        $response = $this->postJson('/api/livreurs', $data);
        $response->assertStatus(201)->assertJsonFragment(['code_payement' => 'PAY-001']);
    }

    public function testGetAllLivreurs()
    {
        $this->creer_Utilisateur(); // Ensure at least one user exists
        $response = $this->getJson('/api/livreurs');
        $response->assertStatus(200);
        $response->assertJsonStructure([
            '*' => ['id_user', 'code_payement'],
        ]);
    }

    public function testGetOneLivreur()
    {
        $this->creer_Utilisateur(); // Ensure at least one user exists
        $livreur = Livreur::first();
        $response = $this->getJson("/api/livreurs/{$livreur->id_user}");
        $response->assertStatus(200);
        $response->assertJsonStructure(['id_user', 'code_payement']);
    }

    public function testUpdateLivreur()
    {
        $this->creer_Utilisateur(); // Ensure at least one user exists
        $livreur = Livreur::first();
        $response = $this->putJson("/api/livreurs/{$livreur->id_user}", [
            'code_payement' => 'UPDATED-PAY',
        ]);
        $response->assertStatus(200);
        $response->assertJsonStructure(['message' => 'Livreur updated successfully']);
    }

    public function testDeleteLivreur()
    {
        $this->creer_Utilisateur(); // Ensure at least one user exists
        $livreur = Livreur::first();
        $response = $this->deleteJson("/api/livreurs/{$livreur->id_user}");
        $response->assertStatus(204);
        $response->assertJsonStructure(['message' => 'Livreur deleted successfully']);
    }
}