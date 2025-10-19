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

        Schema::create('menu', function (Blueprint $table) {
            $table->id('id_menu');
            $table->string('nom_menu', 100);
            $table->text('description_menu');
            $table->unsignedBigInteger('image_menu')->nullable();
            $table->decimal('prix_menu', 10, 2);
            $table->integer('fidelity_point');
            $table->string('statut_menu', 50);
            $table->unsignedBigInteger('restaurant_hote');
            $table->string('libelle_menu', 50);
            $table->timestamp('updated_at')->useCurrent();

            $table->unique(['nom_menu', 'restaurant_hote']);
            $table->foreign('restaurant_hote')->references('id_restaurant')->on('restaurant')->onDelete('cascade');
            $table->foreign('image_menu')->references('id_file')->on('file')->onDelete('set null');
            $table->foreign('libelle_menu')->references('libelle')->on('categorie_menu')->onDelete('cascade');
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menu');
    }
};
