<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class SessionCRUDTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        DB::statement('DELETE FROM session');
        DB::statement('DELETE FROM "Utilisateur"');
    }

    protected function tearDown(): void
    {
        DB::statement('DELETE FROM session');
        DB::statement('DELETE FROM "Utilisateur"');
        parent::tearDown();
    }

    private function creerUtilisateur(): int
    {
        return DB::table('Utilisateur')->insertGetId([
            'nom_user' => 'SessionUser',
            'email_user' => 'session@test.com',
            'password_user' => Hash::make('123456'),
            'num_user' => '+237688888888',
            'date_inscription' => now(),
            'last_connexion' => now(),
            'statut_account' => 'actif'
        ], 'id_user');
    }

    public function testCreationSession()
    {
        $u = $this->creerUtilisateur();

        $response = $this->postJson('/api/sessions', [
            'id_user' => $u,
            'token' => 'tokentest123',
            'ip_client' => '127.0.0.1',
            'user_agent' => 'PHPUnit'
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('session', ['id_user' => $u, 'token' => 'tokentest123']);
    }

    public function testGetAllSessions()
    {
        $u = $this->creerUtilisateur();
        DB::table('session')->insert(['id_session' => \Illuminate\Support\Str::uuid()->toString(), 'id_user' => $u, 'token' => 't1', 'ip_client' => '127.0.0.1']);
        $response = $this->getJson('/api/sessions');
        $response->assertStatus(200)->assertJsonStructure(['*' => ['id_session','id_user','token','ip_client','date_connexion','actif']]);
    }

    public function testGetOneSession()
    {
        $u = $this->creerUtilisateur();
        $uuid = \Illuminate\Support\Str::uuid()->toString();
        DB::table('session')->insert(['id_session' => $uuid, 'id_user' => $u, 'token' => 't2', 'ip_client' => '127.0.0.1']);
        $response = $this->getJson("/api/sessions/{$uuid}");
        $response->assertStatus(200)->assertJsonFragment(['id_session' => $uuid]);
    }

    public function testUpdateSession()
    {
        $u = $this->creerUtilisateur();
        $uuid = \Illuminate\Support\Str::uuid()->toString();
        DB::table('session')->insert(['id_session' => $uuid, 'id_user' => $u, 'token' => 't3', 'ip_client' => '127.0.0.1', 'actif' => true]);
        $response = $this->putJson("/api/sessions/{$uuid}", ['actif' => false]);
        $response->assertStatus(200);
        $this->assertDatabaseHas('session', ['id_session' => $uuid, 'actif' => false]);
    }

    public function testDeleteSession()
    {
        $u = $this->creerUtilisateur();
        $uuid = \Illuminate\Support\Str::uuid()->toString();
        DB::table('session')->insert(['id_session' => $uuid, 'id_user' => $u, 'token' => 't4', 'ip_client' => '127.0.0.1']);
        $response = $this->deleteJson("/api/sessions/{$uuid}");
        $response->assertStatus(204);
        $this->assertDatabaseMissing('session', ['id_session' => $uuid]);
    }
}