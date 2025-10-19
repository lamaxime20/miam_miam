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

        Schema::create('gerer', function (Blueprint $table) {
            $table->unsignedBigInteger('id_restaurant');
            $table->unsignedBigInteger('id_gerant');
            $table->timestamp('date_debut');
            $table->boolean('service_employe')->default(true);

            $table->primary(['id_restaurant', 'id_gerant']);
            $table->foreign('id_restaurant')->references('id_restaurant')->on('restaurant')->onDelete('cascade');
            $table->foreign('id_gerant')->references('id_user')->on('gerant')->onDelete('cascade');
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gerer');
    }
};
