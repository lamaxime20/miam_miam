<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class PromotionCRUDTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        DB::statement('DELETE FROM promotion');
        DB::statement('DELETE FROM file');
        DB::statement('DELETE FROM administrateur');
        DB::statement('DELETE FROM "Utilisateur"');
    }

    protected function tearDown(): void
    {
        DB::statement('DELETE FROM promotion');
        DB::statement('DELETE FROM file');
        DB::statement('DELETE FROM administrateur');
        DB::statement('DELETE FROM "Utilisateur"');
        parent::tearDown();
    }

    private function creerImage(): int
    {
        return DB::table('file')->insertGetId([
            'nom_fichier' => 'promo_img',
            'extension' => 'png',
            'chemin' => '/uploads/promo.png'
        ], 'id_file');
    }

    private function creerAdmin(): int
    {
        return DB::table('Utilisateur')->insertGetId([
            'nom_user' => 'PromoAdmin',
            'email_user' => 'promoadmin@test.com',
            'password_user' => Hash::make('123456'),
            'num_user' => '+237690000060',
            'date_inscription' => now(),
            'last_connexion' => now(),
            'statut_account' => 'actif'
        ], 'id_user');
    }

    public function testCreationPromotion()
    {
        $imgId = $this->creerImage();
        $adminId = $this->creerAdmin();
        // add administrateur row because restaurant uses it elsewhere; promotions only need image
        DB::table('promotion')->insert([
            'titre' => 'PromoTest',
            'description_promotion' => 'Réduction',
            'date_debut' => now(),
            'date_fin' => now()->addDays(5),
            'image_promo' => $imgId,
            'pourcentage_reduction' => 10.00
        ], 'id_promo');

        $response = $this->postJson('/api/promotions', [
            'titre' => 'PromoTest2',
            'description_promotion' => 'Réduction 2',
            'date_debut' => now()->toDateTimeString(),
            'date_fin' => now()->addDays(3)->toDateTimeString(),
            'image_promo' => $imgId,
            'pourcentage_reduction' => 15.00
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('promotion', ['titre' => 'PromoTest2']);
    }

    public function testGetAllPromotions()
    {
        $imgId = $this->creerImage();
        DB::table('promotion')->insert([
            'titre' => 'PromoAll',
            'description_promotion' => 'Desc',
            'date_debut' => now(),
            'date_fin' => now()->addDays(2),
            'image_promo' => $imgId,
            'pourcentage_reduction' => 5.00
        ], 'id_promo');

        $response = $this->getJson('/api/promotions');
        $response->assertStatus(200)->assertJsonStructure(['*' => ['id_promo','titre','description_promotion','date_debut','date_fin','image_promo','pourcentage_reduction']]);
    }

    public function testGetOnePromotion()
    {
        $imgId = $this->creerImage();
        $promoId = DB::table('promotion')->insertGetId([
            'titre' => 'PromoOne',
            'description_promotion' => 'Desc',
            'date_debut' => now(),
            'date_fin' => now()->addDays(4),
            'image_promo' => $imgId,
            'pourcentage_reduction' => 20.00
        ], 'id_promo');

        $response = $this->getJson("/api/promotions/{$promoId}");
        $response->assertStatus(200)->assertJsonFragment(['id_promo' => $promoId]);
    }

    public function testUpdatePromotion()
    {
        $imgId = $this->creerImage();
        $promoId = DB::table('promotion')->insertGetId([
            'titre' => 'PromoUp',
            'description_promotion' => 'Desc',
            'date_debut' => now(),
            'date_fin' => now()->addDays(4),
            'image_promo' => $imgId,
            'pourcentage_reduction' => 20.00
        ], 'id_promo');

        $response = $this->putJson("/api/promotions/{$promoId}", ['titre' => 'PromoUpdated']);
        $response->assertStatus(200);
        $this->assertDatabaseHas('promotion', ['id_promo' => $promoId, 'titre' => 'PromoUpdated']);
    }

    public function testDeletePromotion()
    {
        $imgId = $this->creerImage();
        $promoId = DB::table('promotion')->insertGetId([
            'titre' => 'PromoDel',
            'description_promotion' => 'Desc',
            'date_debut' => now(),
            'date_fin' => now()->addDays(2),
            'image_promo' => $imgId,
            'pourcentage_reduction' => 10.00
        ], 'id_promo');

        $response = $this->deleteJson("/api/promotions/{$promoId}");
        $response->assertStatus(204);
        $this->assertDatabaseMissing('promotion', ['id_promo' => $promoId]);
    }
}