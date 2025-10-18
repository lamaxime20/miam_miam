<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Restaurant;
use App\Models\Administrateur;
use App\Models\Utilisateur;
use App\Models\File;

class RestaurantCRUDTest extends TestCase
{
    public function testCreationRestaurant()
    {
        $adminUser = Utilisateur::create([
            'nom_user' => 'AdminRestau',
            'email_user' => 'admin@restau.com',
            'password_user' => bcrypt('123456'),
            'num_user' => '+237690000003',
            'date_inscription' => now(),
            'last_connexion' => now(),
            'statut_account' => 'actif',
        ]);

        Administrateur::create(['id_user' => $adminUser->id_user]);
        $file = File::create(['nom_fichier' => 'logo_restau', 'extension' => 'jpg', 'chemin' => '/uploads/resto.jpg']);

        $data = [
            'nom_restaurant' => 'Le Gourmet',
            'localisation' => 'Douala Bonapriso',
            'type_localisation' => 'googleMap',
            'logo_restaurant' => $file->id_File,
            'politique' => 'Satisfait ou remboursé',
            'administrateur' => $adminUser->id_user,
        ];

        $response = $this->postJson('/api/restaurants', $data);
        $response->assertStatus(201);
        $this->assertDatabaseHas('restaurant', ['nom_restaurant' => 'Le Gourmet']);
    }

    public function testGetAllRestaurants()
    {
        $response = $this->getJson('/api/restaurants');
        $response->assertStatus(200);
        $response->assertJsonStructure([
            '*' => ['id_restaurant', 'nom_restaurant', 'localisation', 'type_localisation', 'logo_restaurant', 'politique', 'administrateur', 'updated_at'],
        ]);
    }

    public function testGetOneRestaurant()
    {
        $resto = Restaurant::first();
        $response = $this->getJson("/api/restaurants/{$resto->id_restaurant}");
        $response->assertStatus(200);
        $response->assertJsonStructure(['id_restaurant', 'nom_restaurant', 'localisation', 'type_localisation', 'logo_restaurant', 'politique', 'administrateur', 'updated_at']);
    }

    public function testUpdateRestaurant()
    {
        $resto = Restaurant::first();
        $response = $this->putJson("/api/restaurants/{$resto->id_restaurant}", ['politique' => 'Politique mise à jour']);
        $response->assertStatus(200);
        $this->assertDatabaseHas('restaurant', ['id_restaurant' => $resto->id_restaurant, 'politique' => 'Politique mise à jour']);
    }

    public function testDeleteRestaurant()
    {
        $resto = Restaurant::first();
        $response = $this->deleteJson("/api/restaurants/{$resto->id_restaurant}");
        $response->assertStatus(204);
        $response->assertJsonStructure(['message' => 'Restaurant supprimé avec succès.']);
    }
}