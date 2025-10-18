<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('livreur', function (Blueprint $table) {
            $table->unsignedBigInteger('id_user')->primary();
            $table->string('code_payement', 100)->nullable();
            $table->foreign('id_user')->references('id_user')->on('Utilisateur')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('livreur');
    }
};