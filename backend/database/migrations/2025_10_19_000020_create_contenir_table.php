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

        Schema::create('contenir', function (Blueprint $table) {
            $table->unsignedBigInteger('id_commande');
            $table->unsignedBigInteger('id_menu');
            $table->integer('quantite');
            $table->decimal('prix_unitaire', 10, 2);

            $table->primary(['id_commande', 'id_menu']);
            $table->foreign('id_commande')->references('id_commande')->on('commande')->onDelete('cascade');
            $table->foreign('id_menu')->references('id_menu')->on('menu')->onDelete('cascade');
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contenir');
    }
};
