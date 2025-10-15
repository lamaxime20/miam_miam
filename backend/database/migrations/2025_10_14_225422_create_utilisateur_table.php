<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('Utilisateur', function (Blueprint $table) {
            $table->id('id_user');
            $table->string('nom_user');
            $table->string('email_user')->unique();
            $table->string('password_user');
            $table->string('num_user');
            $table->timestamp('date_inscription')->useCurrent();
            $table->timestamp('last_connexion')->useCurrent();
            $table->string('statut_account');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('Utilisateur');
    }
};
