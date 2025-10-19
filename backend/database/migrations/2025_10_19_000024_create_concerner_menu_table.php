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

        Schema::create('concerner_menu', function (Blueprint $table) {
            $table->unsignedBigInteger('id_promo');
            $table->unsignedBigInteger('id_menu');

            $table->primary(['id_promo', 'id_menu']);
            $table->foreign('id_promo')->references('id_promo')->on('promotion')->onDelete('cascade');
            $table->foreign('id_menu')->references('id_menu')->on('menu')->onDelete('cascade');
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('concerner_menu');
    }
};
