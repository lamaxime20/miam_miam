<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class clientCRUDTest extends TestCase
{
    /**
     * Nettoie les tables avant chaque test.
     */
    protected function setUp(): void
    {
        parent::setUp();
        // La suppression en cascade sur Utilisateur nettoiera Client
        DB::statement('DELETE FROM "Utilisateur"');
        DB::statement('ALTER SEQUENCE utilisateur_id_user_seq RESTART WITH 1');
    }

    /**
     * Crée un utilisateur et retourne son ID.
     */
    private function createUtilisateur(string $email): int
    {
        $result = DB::select('SELECT ajouter_utilisateur(?, ?, ?, ?, ?)', [
            'Test User',
            $email,
            bcrypt('password'),
            '123456789',
            'actif'
        ]);
        return $result[0]->ajouter_utilisateur;
    }

    public function testGetAllClients()
    {
        // Crée 2 clients pour le test
        $this->createUtilisateur('client1@example.com');
        $this->createUtilisateur('client2@example.com');

        $response = $this->get('/api/clients');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            '*' => [
                'id_user',
                'fidelity',
                'code_parrainage',
                'parrain',
            ]
        ]);
        $this->assertCount(2, $response->json());
    }

    public function testGetOneClient()
    {
        $clientId = $this->createUtilisateur('example@gmail.com');

        $response = $this->get("/api/clients/{$clientId}");

        $response->assertStatus(200);
        $response->assertJson([
            'id_user' => $clientId,
        ]);
        $response->assertJsonStructure([
            'id_user',
            'fidelity',
            'code_parrainage',
            'parrain',
        ]);
    }

    public function testUpdateClient()
    {
        $clientId = $this->createUtilisateur('client.update@example.com');

        $updateData = [
            'fidelity' => 250,
        ];

        $response = $this->put("/api/clients/{$clientId}", $updateData);

        $response->assertStatus(200);
        $this->assertDatabaseHas('client', [
            'id_user' => $clientId,
            'fidelity' => 250,
        ]);
    }

    public function testDeleteClient()
    {
        $clientId = $this->createUtilisateur('client.delete@example.com');

        $response = $this->delete("/api/clients/{$clientId}");

        $response->assertStatus(200); // Ou 204 No Content
        $this->assertDatabaseMissing('client', ['id_user' => $clientId]);
        $response->assertJson([
            'message' => 'Client deleted successfully',
        ]);
    }
}
