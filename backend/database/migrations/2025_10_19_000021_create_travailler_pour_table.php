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

        Schema::create('travailler_pour', function (Blueprint $table) {
            $table->unsignedBigInteger('id_employe');
            $table->unsignedBigInteger('id_restaurant');
            $table->timestamp('date_debut');
            $table->boolean('service_employe')->default(true);

            $table->primary(['id_employe', 'id_restaurant']);
            $table->foreign('id_employe')->references('id_user')->on('employe')->onDelete('cascade');
            $table->foreign('id_restaurant')->references('id_restaurant')->on('restaurant')->onDelete('cascade');
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('travailler_pour');
    }
};
