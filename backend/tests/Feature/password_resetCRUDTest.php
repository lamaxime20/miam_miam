<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class Password_ResetCRUDTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        DB::statement('DELETE FROM password_reset');
        DB::statement('DELETE FROM "Utilisateur"');
    }

    protected function tearDown(): void
    {
        DB::statement('DELETE FROM password_reset');
        DB::statement('DELETE FROM "Utilisateur"');
        parent::tearDown();
    }

    private function creerUtilisateur(): int
    {
        return DB::table('Utilisateur')->insertGetId([
            'nom_user' => 'PwdUser',
            'email_user' => 'pwd@test.com',
            'password_user' => Hash::make('123456'),
            'num_user' => '+237699999999',
            'date_inscription' => now(),
            'last_connexion' => now(),
            'statut_account' => 'actif'
        ], 'id_user');
    }

    public function testCreationPasswordReset()
    {
        $u = $this->creerUtilisateur();

        $response = $this->postJson('/api/password_resets', [
            'id_user' => $u,
            'token' => 'reset123',
            'date_expiration' => now()->addMinutes(60)
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('password_reset', ['id_user' => $u, 'token' => 'reset123']);
    }

    public function testGetAllPasswordResets()
    {
        $u = $this->creerUtilisateur();
        DB::table('password_reset')->insert(['id_user' => $u, 'token' => 'r1', 'date_expiration' => now()->addMinutes(30)]);
        $response = $this->getJson('/api/password_resets');
        $response->assertStatus(200)->assertJsonStructure(['*' => ['id_reset','id_user','token','date_creation','date_expiration','utilise']]);
    }

    public function testGetOnePasswordReset()
    {
        $u = $this->creerUtilisateur();
        $id = DB::table('password_reset')->insertGetId(['id_user' => $u, 'token' => 'r2', 'date_expiration' => now()->addMinutes(30)], 'id_reset');
        $response = $this->getJson("/api/password_resets/{$id}");
        $response->assertStatus(200)->assertJsonFragment(['id_reset' => $id]);
    }

    public function testUpdatePasswordReset()
    {
        $u = $this->creerUtilisateur();
        $id = DB::table('password_reset')->insertGetId(['id_user' => $u, 'token' => 'r3', 'date_expiration' => now()->addMinutes(30), 'utilise' => false], 'id_reset');
        $response = $this->putJson("/api/password_resets/{$id}", ['utilise' => true]);
        $response->assertStatus(200);
        $this->assertDatabaseHas('password_reset', ['id_reset' => $id, 'utilise' => true]);
    }

    public function testDeletePasswordReset()
    {
        $u = $this->creerUtilisateur();
        $id = DB::table('password_reset')->insertGetId(['id_user' => $u, 'token' => 'r4', 'date_expiration' => now()->addMinutes(30)], 'id_reset');
        $response = $this->deleteJson("/api/password_resets/{$id}");
        $response->assertStatus(204);
        $this->assertDatabaseMissing('password_reset', ['id_reset' => $id]);
    }
}