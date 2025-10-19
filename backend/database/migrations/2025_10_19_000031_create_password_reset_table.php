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

        Schema::create('password_reset', function (Blueprint $table) {
            $table->id('id_reset');
            $table->unsignedBigInteger('id_user');
            $table->string('token', 255)->unique();
            $table->timestamp('date_creation')->useCurrent();
            $table->timestamp('date_expiration');
            $table->boolean('utilise')->default(false);

            $table->foreign('id_user')->references('id_user')->on('Utilisateur')->onDelete('cascade');
            $table->check('date_expiration > date_creation');
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('password_reset');
    }
};
