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

        Schema::create('bon_commande', function (Blueprint $table) {
            $table->id('id_bon');
            $table->string('statut_bon', 50);
            $table->unsignedBigInteger('validateur');
            $table->unsignedBigInteger('commande_associe');

            $table->foreign('validateur')->references('id_user')->on('Utilisateur')->onDelete('cascade');
            $table->foreign('commande_associe')->references('id_commande')->on('commande')->onDelete('cascade');
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bon_commande');
    }
};
