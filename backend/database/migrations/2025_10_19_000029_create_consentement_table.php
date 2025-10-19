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

        Schema::create('consentement', function (Blueprint $table) {
            $table->id('id_consentement');
            $table->unsignedBigInteger('id_user')->nullable();
            $table->string('type_consentement', 100);
            $table->string('version_texte', 50);
            $table->boolean('accepte');
            $table->timestamp('date_action')->useCurrent();
            $table->string('ip_client', 50)->nullable();
            $table->text('user_agent')->nullable();

            $table->foreign('id_user')->references('id_user')->on('Utilisateur')->onDelete('set null');
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('consentement');
    }
};
