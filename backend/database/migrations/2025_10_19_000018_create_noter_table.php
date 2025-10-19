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

        Schema::create('noter', function (Blueprint $table) {
            $table->unsignedBigInteger('id_client');
            $table->unsignedBigInteger('id_menu');
            $table->integer('note_menu');
            $table->text('commentaire')->default('RAS');

            $table->primary(['id_client', 'id_menu']);
            $table->foreign('id_client')->references('id_user')->on('client')->onDelete('cascade');
            $table->foreign('id_menu')->references('id_menu')->on('menu')->onDelete('cascade');
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('noter');
    }
};
