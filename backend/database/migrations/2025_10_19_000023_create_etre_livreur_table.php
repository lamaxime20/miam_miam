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

        Schema::create('etre_livreur', function (Blueprint $table) {
            $table->unsignedBigInteger('id_livreur');
            $table->unsignedBigInteger('id_restaurant');
            $table->integer('note_livreur')->default(0);
            $table->timestamp('date_debut');
            $table->boolean('service_employe')->default(true);

            $table->primary(['id_livreur', 'id_restaurant']);
            $table->foreign('id_livreur')->references('id_user')->on('livreur')->onDelete('cascade');
            $table->foreign('id_restaurant')->references('id_restaurant')->on('restaurant')->onDelete('cascade');
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('etre_livreur');
    }
};
