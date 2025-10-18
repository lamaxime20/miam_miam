<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Livreur;
use App\Models\Utilisateur;

class LivreurCRUDTest extends TestCase
{
    public function testCreationLivreur()
    {
        $u = Utilisateur::create([
            'nom_user' => 'lamaxime',
            'email_user' => 'lamaxime@example.com',
            'password_user' => bcrypt('123456'),
            'num_user' => '+237690000002',
            'date_inscription' => now(),
            'last_connexion' => now(),
            'statut_account' => 'actif',
        ]);

        $data = [
            'id_user' => $u->id_user,
            'code_payement' => 'PAY-001',
        ];

        $response = $this->postJson('/api/livreurs', $data);
        $response->assertStatus(201)->assertJsonFragment(['code_payement' => 'PAY-001']);
    }

    public function testGetAllLivreurs()
    {
        $response = $this->getJson('/api/livreurs');
        $response->assertStatus(200);
        $response->assertJsonStructure([
            '*' => ['id_user', 'code_payement'],
        ]);
    }

    public function testGetOneLivreur()
    {
        $livreur = Livreur::first();
        $response = $this->getJson("/api/livreurs/{$livreur->id_user}");
        $response->assertStatus(200);
        $response->assertJsonStructure(['id_user', 'code_payement']);
    }

    public function testUpdateLivreur()
    {
        $livreur = Livreur::first();
        $response = $this->putJson("/api/livreurs/{$livreur->id_user}", [
            'code_payement' => 'UPDATED-PAY',
        ]);
        $response->assertStatus(200);
        $response->assertJsonStructure(['message' => 'Livreur updated successfully']);
    }

    public function testDeleteLivreur()
    {
        $livreur = Livreur::first();
        $response = $this->deleteJson("/api/livreurs/{$livreur->id_user}");
        $response->assertStatus(204);
        $response->assertJsonStructure(['message' => 'Livreur deleted successfully']);
    }
}