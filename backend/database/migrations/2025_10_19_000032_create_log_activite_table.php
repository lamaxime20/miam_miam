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

        Schema::create('log_activite', function (Blueprint $table) {
            $table->id('id_log');
            $table->unsignedBigInteger('id_user')->nullable();
            $table->string('action', 100);
            $table->string('cible', 100);
            $table->unsignedBigInteger('id_cible')->nullable();
            $table->text('details')->nullable();
            $table->string('ip_client', 50)->nullable();
            $table->timestamp('date_action')->useCurrent();

            $table->foreign('id_user')->references('id_user')->on('Utilisateur')->onDelete('set null');
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('log_activite');
    }
};
