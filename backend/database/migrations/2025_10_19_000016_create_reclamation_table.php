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

        Schema::create('reclamation', function (Blueprint $table) {
            $table->id('id_reclamation');
            $table->text('message_reclamation');
            $table->timestamp('date_soummission');
            $table->string('statut_reclamation', 50);
            $table->unsignedBigInteger('restaurant_cible');
            $table->unsignedBigInteger('acheteur');

            $table->foreign('restaurant_cible')->references('id_restaurant')->on('restaurant')->onDelete('cascade');
            $table->foreign('acheteur')->references('id_user')->on('client')->onDelete('cascade');
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reclamation');
    }
};
