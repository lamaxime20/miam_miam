<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Utilisateur;
use Illuminate\Support\Facades\DB;

class EmployeCRUDTest extends TestCase
{
    public function test_creation_employe()
    {
        $user = Utilisateur::create([
            'nom_user' => 'Employe Test',
            'email_user' => 'employe@test.com',
            'password_user' => 'emp1234',
            'num_user' => '+237644444444',
            'date_inscription' => now(),
            'last_connexion' => now(),
            'statut_account' => 'actif'
        ]);

        $response = $this->postJson('/api/employe', [
            'id_user' => $user->id_user
        ]);
        $response->assertStatus(201);
        $this->assertDatabaseHas('employe', ['id_user' => $user->id_user]);
    }

    public function test_lecture_employes()
    {
        $response = $this->getJson('/api/employe');
        $response->assertStatus(200);
        $response->assertJsonStructure([
            '*' => ['id_user']
        ]);
    }

    public function test_suppression_employe()
    {
        $employe = DB::table('employe')->first();
        $response = $this->deleteJson("/api/employe/{$employe->id_user}");
        $response->assertStatus(200);
        $this->assertDatabaseMissing('employe', ['id_user' => $employe->id_user]);
    }
}