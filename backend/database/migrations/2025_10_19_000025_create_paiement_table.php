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

        Schema::create('paiement', function (Blueprint $table) {
            $table->id('id_paiement');
            $table->unsignedBigInteger('id_commande');
            $table->decimal('montant', 10, 2);
            $table->string('moyen_paiement', 50);
            $table->string('statut_paiement', 50);
            $table->string('reference_transaction', 100)->unique()->nullable();
            $table->timestamp('date_paiement')->useCurrent();

            $table->foreign('id_commande')->references('id_commande')->on('commande')->onDelete('cascade');
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('paiement');
    }
};
