<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('file', function (Blueprint $table) {
            $table->id('id_file');
            $table->string('nom_fichier', 100);
            $table->string('extension', 10);
            $table->text('chemin');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('file');
    }
};