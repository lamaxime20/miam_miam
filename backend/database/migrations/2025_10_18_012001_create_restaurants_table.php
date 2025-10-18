<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('restaurant', function (Blueprint $table) {
            $table->id('id_restaurant');
            $table->string('nom_restaurant', 100);
            $table->text('localisation');
            $table->string('type_localisation', 255);
            $table->unsignedBigInteger('logo_restaurant')->nullable();
            $table->text('politique')->nullable();
            $table->unsignedBigInteger('administrateur');
            $table->timestamp('updated_at')->useCurrent();

            $table->foreign('administrateur')->references('id_user')->on('administrateur')->onDelete('cascade');
            $table->foreign('logo_restaurant')->references('id_file')->on('file')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('restaurant');
    }
};