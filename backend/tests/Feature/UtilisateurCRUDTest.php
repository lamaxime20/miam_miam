<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UtilisateurCRUDTest extends TestCase
{
    /**
     * Nettoie la table avant chaque test pour éviter les doublons.
     */
    protected function setUp(): void
    {
        parent::setUp();
        DB::statement('DELETE FROM "Utilisateur"');
        DB::statement('ALTER SEQUENCE utilisateur_id_user_seq RESTART WITH 1');
    }

    /**
     * Nettoie la table après chaque test pour être sûr.
     */
    protected function tearDown(): void
    {
        DB::statement('DELETE FROM "Utilisateur"');
        DB::statement('ALTER SEQUENCE utilisateur_id_user_seq RESTART WITH 1');
        parent::tearDown();
    }

    public function test_example(): void
    {
        $response = $this->get('/');
        $response->assertStatus(200);
    }

    public function testGetAllUtilisateurs()
    {
        $response = $this->get('/api/utilisateurs');
        $response->assertStatus(200);
        $response->assertJsonStructure([
            '*' => [
                'id_user',
                'nom_user',
                'email_user',
                'password_user',
                'num_user',
                'date_inscription',
                'last_connexion',
                'statut_account',
                'updated_at',
            ]
        ]);
    }

    public function testGetOneUser()
    {
        $result = DB::select('SELECT ajouter_utilisateur(:nom, :email, :password, :num, :statut)', [
            'nom' => 'Alice Doe',
            'email' => 'alice@example.com',
            'password' => bcrypt('password123'),
            'num' => '690000000',
            'statut' => 'actif',
        ]);

        $user = $result[0]->ajouter_utilisateur;

        $response = $this->get("/api/utilisateurs/{$user}");
        $response->assertStatus(200);

        $response->assertJsonStructure([
            'id_user',
            'nom_user',
            'email_user',
            'password_user',
            'num_user',
            'date_inscription',
            'last_connexion',
            'statut_account',
            'updated_at',
        ]);
    }

    public function testCreationUser()
    {
        $response = $this->post('/api/utilisateurs', [
            'nom' => 'Test User',
            'email' => 'test@gmail.com',
            'mot_de_passe' => Hash::make('password123'),
            'telephone' => '1234567890',
            'userState' => 'actif',
        ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('Utilisateur', [
            'email_user' => 'test@gmail.com'
        ]);
    }

    public function testUpdateUser()
    {
        $result = DB::select('SELECT ajouter_utilisateur(:nom, :email, :password, :num, :statut)', [
            'nom' => 'Alice Doe',
            'email' => 'update@example.com',
            'password' => bcrypt('password123'),
            'num' => '690000000',
            'statut' => 'inactif',
        ]);

        $user = $result[0]->ajouter_utilisateur;

        $response = $this->put("/api/utilisateurs/{$user}", [
            'nom_user' => 'Nouveau Nom',
            'email_user' => 'nouveau@mail.com',
            'num_user' => '690000001',
            'statut_account' => 'actif',
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('Utilisateur', [
            'id_user' => $user,
            'nom_user' => 'Nouveau Nom',
            'email_user' => 'nouveau@mail.com',
            'statut_account' => 'actif'
        ]);
    }

    public function testDeleteUser()
    {
        $result = DB::select('SELECT ajouter_utilisateur(:nom, :email, :password, :num, :statut)', [
            'nom' => 'Alice Doe',
            'email' => 'delete@example.com',
            'password' => bcrypt('password123'),
            'num' => '690000000',
            'statut' => 'actif',
        ]);

        $user = $result[0]->ajouter_utilisateur;

        $response = $this->delete("/api/utilisateurs/{$user}");
        $response->assertStatus(200);

        $this->assertDatabaseMissing('Utilisateur', [
            'id_user' => $user
        ]);
    }
}