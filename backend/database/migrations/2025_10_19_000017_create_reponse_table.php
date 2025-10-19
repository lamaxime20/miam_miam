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

        Schema::create('reponse', function (Blueprint $table) {
            $table->id('id_reponse');
            $table->string('statut_reponse', 50);
            $table->unsignedBigInteger('reclamation_cible');
            $table->unsignedBigInteger('auteur');
            $table->text('message_reponse');

            $table->foreign('reclamation_cible')->references('id_reclamation')->on('reclamation')->onDelete('cascade');
            $table->foreign('auteur')->references('id_user')->on('Utilisateur')->onDelete('cascade');
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reponse');
    }
};
