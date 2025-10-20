<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class paiement extends Model
{
    use HasFactory;

    protected $table = 'paiement';
    protected $primaryKey = 'id_paiement';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'id_commande',
        'montant',
        'moyen_paiement',
        'statut_paiement',
        'reference_transaction',
        'date_paiement',
    ];

    // Relations
    public function commande()
    {
        return $this->belongsTo(commande::class, 'id_commande', 'id_commande');
    }
}