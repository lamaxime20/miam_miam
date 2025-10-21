<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ConsentementCRUDTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        DB::statement('DELETE FROM consentement');
        DB::statement('DELETE FROM "Utilisateur"');
    }

    protected function tearDown(): void
    {
        DB::statement('DELETE FROM consentement');
        DB::statement('DELETE FROM "Utilisateur"');
        parent::tearDown();
    }

    private function creerUtilisateur(): int
    {
        return DB::table('Utilisateur')->insertGetId([
            'nom_user' => 'ConsentUser',
            'email_user' => 'consent@test.com',
            'password_user' => Hash::make('123456'),
            'num_user' => '+237677777777',
            'date_inscription' => now(),
            'last_connexion' => now(),
            'statut_account' => 'actif'
        ], 'id_user');
    }

    public function testCreationConsentement()
    {
        $u = $this->creerUtilisateur();

        $response = $this->postJson('/api/consentements', [
            'id_user' => $u,
            'type_consentement' => 'cookies',
            'version_texte' => 'v1.0',
            'accepte' => true,
            'ip_client' => '127.0.0.1',
            'user_agent' => 'PHPUnit'
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('consentement', ['id_user' => $u, 'type_consentement' => 'cookies']);
    }

    public function testGetAllConsentements()
    {
        $u = $this->creerUtilisateur();
        DB::table('consentement')->insert(['id_user' => $u, 'type_consentement' => 'newsletter', 'version_texte' => 'v1', 'accepte' => false, 'ip_client' => '127.0.0.1', 'user_agent' => 'X']);
        $response = $this->getJson('/api/consentements');
        $response->assertStatus(200)->assertJsonStructure(['*' => ['id_consentement','id_user','type_consentement','version_texte','accepte','date_action']]);
    }

    public function testGetOneConsentement()
    {
        $u = $this->creerUtilisateur();
        $id = DB::table('consentement')->insertGetId(['id_user' => $u, 'type_consentement' => 'c', 'version_texte' => 'v1', 'accepte' => true], 'id_consentement');
        $response = $this->getJson("/api/consentements/{$id}");
        $response->assertStatus(200)->assertJsonFragment(['id_consentement' => $id]);
    }

    public function testUpdateConsentement()
    {
        $u = $this->creerUtilisateur();
        $id = DB::table('consentement')->insertGetId(['id_user' => $u, 'type_consentement' => 'c', 'version_texte' => 'v1', 'accepte' => false], 'id_consentement');
        $response = $this->putJson("/api/consentements/{$id}", ['accepte' => true]);
        $response->assertStatus(200);
        $this->assertDatabaseHas('consentement', ['id_consentement' => $id, 'accepte' => true]);
    }

    public function testDeleteConsentement()
    {
        $u = $this->creerUtilisateur();
        $id = DB::table('consentement')->insertGetId(['id_user' => $u, 'type_consentement' => 'c', 'version_texte' => 'v1', 'accepte' => true], 'id_consentement');
        $response = $this->deleteJson("/api/consentements/{$id}");
        $response->assertStatus(204);
        $this->assertDatabaseMissing('consentement', ['id_consentement' => $id]);
    }
}