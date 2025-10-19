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

        Schema::create('cible_notifications', function (Blueprint $table) {
            $table->unsignedBigInteger('id_notification');
            $table->unsignedBigInteger('id_cible');
            $table->boolean('ouvert')->default(false);

            $table->primary(['id_notification', 'id_cible']);
            $table->foreign('id_notification')->references('id_notification')->on('notifications');
            $table->foreign('id_cible')->references('id_user')->on('Utilisateur');
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cible_notifications');
    }
};
