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

        Schema::create('historique_fidelite', function (Blueprint $table) {
            $table->id('id_historique');
            $table->unsignedBigInteger('id_client');
            $table->integer('changement');
            $table->string('raison', 255);
            $table->timestamp('date_changement')->useCurrent();

            $table->foreign('id_client')->references('id_user')->on('client')->onDelete('cascade');
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('historique_fidelite');
    }
};
