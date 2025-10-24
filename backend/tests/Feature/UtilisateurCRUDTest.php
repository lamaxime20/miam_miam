<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\UserVerificationMail;

class UtilisateurCRUDTest extends TestCase
{
    /**
     * Nettoie la table avant chaque test pour éviter les doublons.
     */
    protected function setUp(): void
    {
        parent::setUp();
        DB::statement('DELETE FROM "Utilisateur"');
    }

    /**
     * Nettoie la table après chaque test pour être sûr.
     */
    protected function tearDown(): void
    {
        DB::statement('DELETE FROM "Utilisateur"');
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

    public function testCheckEmailExiste()
    {
        DB::select('SELECT ajouter_utilisateur(:nom, :email, :password, :num, :statut)', [
            'nom' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
            'num' => '1234567890',
            'statut' => 'actif',
        ]);

        // Test with existing email
        $response = $this->getJson('/api/checkEmailExiste?email=test@example.com');
        $response->assertStatus(200)->assertJson(['verifier_email_existant' => true]);

        // Test with non-existing email
        $response = $this->getJson('/api/checkEmailExiste?email=nonexistent@example.com');
        $response->assertStatus(200)->assertJson(['verifier_email_existant' => false]);
     }

    public function testCheckPasswordCorrect()
    {
        DB::select('SELECT ajouter_utilisateur(:nom, :email, :password, :num, :statut)', [
            'nom' => 'Test User',
            'email' => 'testpass@example.com',
            'password' => bcrypt('password123'),
            'num' => '1234567890',
            'statut' => 'actif',
        ]);

        // Test with correct password
        $response = $this->getJson('/api/checkPasswordCorrect?email=testpass@example.com&password=password123');
        $response->assertStatus(200)->assertJson(['correct' => true]);

        // Test with incorrect password
        $response = $this->getJson('/api/checkPasswordCorrect?email=testpass@example.com&password=wrongpassword');
        $response->assertStatus(200)->assertJson(['correct' => false]);
    }

    public function testLogin()
    {
        // Ajouter un utilisateur en base
        DB::select('SELECT ajouter_utilisateur(:nom, :email, :password, :num, :statut)', [
            'nom' => 'Login User',
            'email' => 'login@example.com',
            'password' => bcrypt('password123'),
            'num' => '1234567890',
            'statut' => 'actif',
        ]);

        // Test login réussi
        $response = $this->postJson('/api/login', [
            'email' => 'login@example.com',
            'password' => 'password123',
            'role' => 'admin',          // Role pour Sanctum
            'restaurant' => 'resto1',   // Restaurant choisi
        ]);
        $response->assertStatus(200)
                ->assertJsonStructure(['access_token', 'token_type', 'role']);
    }

    public function testInscription()
    {
        $userData = [
            'nom' => 'Inscription User',
            'email' => 'inscription@example.com',
            'mot_de_passe' => 'password123',
            'telephone' => '0987654321',
            'userState' => 'actif'
        ];

        $response = $this->postJson('/api/inscription', $userData);

        $response->assertStatus(205)
                ->assertJson(['message' => 'Utilisateur crée']);

        $this->assertDatabaseHas('Utilisateur', [
            'email_user' => 'inscription@example.com'
        ]);
    }

    public function testTokenInscription()
    {
        // Crée un utilisateur d'abord
        DB::select('SELECT ajouter_utilisateur(:nom, :email, :password, :num, :statut)', [
            'nom' => 'Token User',
            'email' => 'token@example.com',
            'password' => bcrypt('password123'),
            'num' => '1234567890',
            'statut' => 'actif',
        ]);

        $response = $this->postJson('/api/token_inscription', [
            'email' => 'token@example.com',
            'role' => 'admin',
            'restaurant' => 'resto1'
        ]);

        $response->assertStatus(200)
                ->assertJsonStructure(['access_token', 'token_type', 'role']);
    }

    public function test_envoi_code_verification_email_valide()
    {
        // On "fake" le mail pour ne pas réellement envoyer d'email
        Mail::fake();

        // Données de test
        $payload = [
            'email' => 'utilisateur@test.com'
        ];

        // Appel de la route API
        $response = $this->postJson('/api/envoyerCodeVerification', $payload);

        // ✅ Vérifie le code HTTP
        $response->assertStatus(200);

        // ✅ Vérifie la structure JSON
        $response->assertJsonStructure([
            'message',
            'code'
        ]);

        // ✅ Vérifie que le mail a bien été "envoyé" virtuellement
        Mail::assertSent(UserVerificationMail::class, function ($mail) use ($payload) {
            return $mail->hasTo($payload['email']);
        });
    }
}