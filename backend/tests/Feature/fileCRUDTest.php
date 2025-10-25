<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;

class FileCRUDTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        // Utiliser le disque de test pour ne pas polluer le vrai stockage
        Storage::fake('public');
        // Nettoyer la table via une fonction ou une troncature si nécessaire
        DB::statement('TRUNCATE TABLE "File" RESTART IDENTITY CASCADE;');
    }

    /**
     * Crée un fichier de test en base de données et sur le disque simulé.
     * @return array Les données du fichier créé.
     */
    private function creerFileTest(): array
    {
        $file = UploadedFile::fake()->image('test_image.jpg');
        $path = $file->store('uploads', 'public'); // Stocke dans storage/app/public/uploads

        $result = DB::select("SELECT * FROM creer_file(?, ?, ?)", ['test_image', 'jpg', $path]);
        
        return ['id' => $result[0]->id, 'path' => $path];
    }

    public function testCreationFile()
    {
        $data = [
            'nom_fichier' => 'logo',
            'extension' => 'png',
            'chemin' => 'uploads/logo.png',
        ];

        $response = $this->postJson('/api/files', $data);
        $response->assertStatus(201);
        $response->assertJsonStructure([
            'message',
            'id',
        ]);
    }

    public function testGetAllFiles()
    {
        $this->creerFileTest();
        $response = $this->getJson('/api/files');
        $response->assertStatus(200);
        $response->assertJsonStructure([
            '0' => [
                'id_file',
                'nom_fichier',
                'extension',
                'chemin',
            ],
        ]);
    }

    public function testGetOneFile()
    {
        $fileData = $this->creerFileTest();
        
        // Vérifier que le fichier existe sur le disque simulé
        Storage::disk('public')->assertExists($fileData['path']);

        $response = $this->getJson("/api/files/{$fileData['id']}");
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'id_File',
            'nom_fichier',
            'extension',
            'chemin',
            'contenu_base64'
        ]);
    }

    public function testUpdateFile()
    {
        $fileData = $this->creerFileTest();
        $response = $this->putJson("/api/files/{$fileData['id']}", [
            'chemin' => '/uploads/updated_logo.png',
        ]);
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'message',
        ]);
    }

    public function testDeleteFile()
    {
        $fileData = $this->creerFileTest();
        $response = $this->deleteJson("/api/files/{$fileData['id']}");
        $response->assertStatus(204);
    }
}