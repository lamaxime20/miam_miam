<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('client', function (Blueprint $table) {
            $table->unsignedBigInteger('id_user');
            $table->integer('fidelity');
            $table->string('code_parrainage', 50)->unique();
            $table->unsignedBigInteger('parrain')->nullable();

            $table->primary('id_user');
            $table->foreign('id_user')->references('id_user')->on('Utilisateur')->onDelete('cascade');
            $table->foreign('parrain')->references('id_user')->on('Utilisateur')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('client');
    }
};