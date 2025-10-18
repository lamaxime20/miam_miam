<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\File;
use Illuminate\Support\Facades\DB;

class FileCRUDTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        DB::statement('DELETE FROM file'); // Clear the files table before each test
    }

    protected function tearDown(): void
    {
        DB::statement('DELETE FROM file'); // Clear the files table after each test
        parent::tearDown();
    }

    private function creerFileTest()
    {
        return File::create([
            'nom_fichier' => 'test_file',
            'extension' => 'txt',
            'chemin' => '/uploads/test_file.txt',
        ]);
    }

    public function testCreationFile()
    {
        $data = [
            'nom_fichier' => 'logo',
            'extension' => 'png',
            'chemin' => '/uploads/logo.png',
        ];

        $response = $this->postJson('/api/files', $data);
        $response->assertStatus(201);
        $response->assertJsonStructure([
            'message' => 'fichier created successfully',
        ]);
    }

    public function testGetAllFiles()
    {
        $this->creerFileTest(); // Ensure at least one file exists for testing
        $response = $this->getJson('/api/files');
        $response->assertStatus(200);
        $response->assertJsonStructure([
            '*' => [
                'id_File',
                'nom_fichier',
                'extension',
                'chemin',
            ],
        ]);
    }

    public function testGetOneFile()
    {
        $this->creerFileTest(); // Ensure at least one file exists for testing
        $file = File::first();
        $response = $this->getJson("/api/files/{$file->id_File}");
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'id_File',
            'nom_fichier',
            'extension',
            'chemin',
        ]);
    }

    public function testUpdateFile()
    {
        $this->creerFileTest(); // Ensure at least one file exists for testing
        $file = File::first();
        $response = $this->putJson("/api/files/{$file->id_File}", [
            'chemin' => '/uploads/updated_logo.png',
        ]);
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'message' => 'fichier updated successfully',
        ]);
    }

    public function testDeleteFile()
    {
        $file = File::first();
        $response = $this->deleteJson("/api/files/{$file->id_File}");
        $response->assertStatus(204);
        $response->assertJsonStructure([
            'message' => 'fichier deleted successfully',
        ]);
    }
}