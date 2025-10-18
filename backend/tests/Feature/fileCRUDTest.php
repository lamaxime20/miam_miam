<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\File;

class FileCRUDTest extends TestCase
{
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