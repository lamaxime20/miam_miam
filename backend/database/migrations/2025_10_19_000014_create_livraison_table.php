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

        Schema::create('livraison', function (Blueprint $table) {
            $table->id('id_livraison');
            $table->timestamp('date_livraison')->nullable();
            $table->string('statut_livraison', 50);
            $table->text('commentaire');
            $table->integer('note_livraison')->default(0);
            $table->unsignedBigInteger('livreur');
            $table->unsignedBigInteger('bon_associe');

            $table->foreign('livreur')->references('id_user')->on('livreur')->onDelete('cascade');
            $table->foreign('bon_associe')->references('id_bon')->on('bon_commande')->onDelete('cascade');
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('livraison');
    }
};
