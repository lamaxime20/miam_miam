<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class bon_commande extends Model
{
    use HasFactory;

    protected $table = 'bon_commande';
    protected $primaryKey = 'id_bon';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'statut_bon',
        'validateur',
        'commande_associe',
    ];

    // Relations
    public function validateur_utilisateur()
    {
        return $this->belongsTo(Utilisateur::class, 'validateur', 'id_user');
    }

    public function commande()
    {
        return $this->belongsTo(commande::class, 'commande_associe', 'id_commande');
    }

    public function livraisons()
    {
        return $this->hasMany(livraison::class, 'bon_associe', 'id_bon');
    }
}