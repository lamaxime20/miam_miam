<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('Utilisateur', function (Blueprint $table) {
            $table->id('id_user');
            $table->string('nom_user');
            $table->string('email_user')->unique();
            $table->string('password_user');
            $table->string('num_user');
            $table->timestamp('date_inscription')->useCurrent();
            $table->timestamp('last_connexion')->nullable();
            $table->string('statut_account');
            $table->timestamp('updated_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('utilisateur');
    }
};
