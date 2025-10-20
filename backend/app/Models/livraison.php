<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class livraison extends Model
{
    use HasFactory;

    protected $table = 'livraison';
    protected $primaryKey = 'id_livraison';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'date_livraison',
        'statut_livraison',
        'commentaire',
        'note_livraison',
        'livreur',
        'bon_associe',
    ];

    // Relations
    public function bon()
    {
        return $this->belongsTo(bon_commande::class, 'bon_associe', 'id_bon');
    }
}