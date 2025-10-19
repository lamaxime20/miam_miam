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

        Schema::create('session', function (Blueprint $table) {
            $table->uuid('id_session')->primary();
            $table->unsignedBigInteger('id_user');
            $table->string('token', 255)->unique();
            $table->string('ip_client', 50)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('date_connexion')->useCurrent();
            $table->timestamp('date_deconnexion')->nullable();
            $table->boolean('actif')->default(true);

            $table->foreign('id_user')->references('id_user')->on('Utilisateur')->onDelete('cascade');
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('session');
    }
};
