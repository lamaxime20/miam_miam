<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class Log_ActiviteCRUDTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        DB::statement('DELETE FROM log_activite');
        DB::statement('DELETE FROM "Utilisateur"');
    }

    protected function tearDown(): void
    {
        DB::statement('DELETE FROM log_activite');
        DB::statement('DELETE FROM "Utilisateur"');
        parent::tearDown();
    }

    private function creerUtilisateur(): int
    {
        return DB::table('Utilisateur')->insertGetId([
            'nom_user' => 'LogUser',
            'email_user' => 'loguser@test.com',
            'password_user' => Hash::make('123456'),
            'num_user' => '+237611111112',
            'date_inscription' => now(),
            'last_connexion' => now(),
            'statut_account' => 'actif'
        ], 'id_user');
    }

    public function testCreationLogActivite()
    {
        $u = $this->creerUtilisateur();

        $response = $this->postJson('/api/log_activite', [
            'id_user' => $u,
            'action' => 'connexion',
            'cible' => 'Utilisateur',
            'id_cible' => $u,
            'details' => 'Test login',
            'ip_client' => '127.0.0.1'
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('log_activite', ['id_user' => $u, 'action' => 'connexion']);
    }

    public function testGetAllLogActivite()
    {
        $u = $this->creerUtilisateur();
        DB::table('log_activite')->insert(['id_user' => $u, 'action' => 'connexion', 'cible' => 'Menu', 'id_cible' => $u, 'details' => 'd']);
        $response = $this->getJson('/api/log_activite');
        $response->assertStatus(200)->assertJsonStructure(['*' => ['id_log','id_user','action','cible','id_cible','details','ip_client','date_action']]);
    }

    public function testGetOneLogActivite()
    {
        $u = $this->creerUtilisateur();
        $id = DB::table('log_activite')->insertGetId(['id_user' => $u, 'action' => 'deconnexion', 'cible' => 'Menu', 'id_cible' => $u, 'details' => 'd'], 'id_log');
        $response = $this->getJson("/api/log_activite/{$id}");
        $response->assertStatus(200)->assertJsonFragment(['id_log' => $id]);
    }

    public function testUpdateLogActivite()
    {
        $u = $this->creerUtilisateur();
        $id = DB::table('log_activite')->insertGetId(['id_user' => $u, 'action' => 'connexion', 'cible' => 'Menu', 'id_cible' => $u, 'details' => 'd'], 'id_log');
        $response = $this->putJson("/api/log_activite/{$id}", ['details' => 'updated']);
        $response->assertStatus(200);
        $this->assertDatabaseHas('log_activite', ['id_log' => $id, 'details' => 'updated']);
    }

    public function testDeleteLogActivite()
    {
        $u = $this->creerUtilisateur();
        $id = DB::table('log_activite')->insertGetId(['id_user' => $u, 'action' => 'connexion', 'cible' => 'Menu', 'id_cible' => $u, 'details' => 'd'], 'id_log');
        $response = $this->deleteJson("/api/log_activite/{$id}");
        $response->assertStatus(204);
        $this->assertDatabaseMissing('log_activite', ['id_log' => $id]);
    }
}