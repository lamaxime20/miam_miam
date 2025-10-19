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

        Schema::create('commande', function (Blueprint $table) {
            $table->id('id_commande');
            $table->timestamp('date_commande');
            $table->timestamp('date_heure_livraison');
            $table->text('localisation_client');
            $table->string('type_localisation', 255);
            $table->string('statut_commande', 50);
            $table->unsignedBigInteger('acheteur');

            $table->foreign('acheteur')->references('id_user')->on('client')->onDelete('cascade');
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('commande');
    }
};
