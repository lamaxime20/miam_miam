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

        Schema::create('notifications', function (Blueprint $table) {
            $table->id('id_notification');
            $table->text('message_notification');
            $table->timestamp('date_notif')->useCurrent();
            $table->unsignedBigInteger('restaurant_auteur');

            $table->foreign('restaurant_auteur')->references('id_restaurant')->on('restaurant');
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
