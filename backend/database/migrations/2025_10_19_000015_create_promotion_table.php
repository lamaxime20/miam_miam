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

        Schema::create('promotion', function (Blueprint $table) {
            $table->id('id_promo');
            $table->string('titre', 100);
            $table->text('description_promotion');
            $table->timestamp('date_debut');
            $table->timestamp('date_fin');
            $table->unsignedBigInteger('image_promo')->nullable();
            $table->decimal('pourcentage_reduction', 5, 2);

            $table->foreign('image_promo')->references('id_file')->on('file')->onDelete('set null');
            $table->check('date_fin > date_debut');
            $table->check('pourcentage_reduction > 0 AND pourcentage_reduction <= 100');
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('promotion');
    }
};
