<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class commande extends Model
{
    use HasFactory;

    protected $table = 'commande';
    protected $primaryKey = 'id_commande';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'date_commande',
        'date_heure_livraison',
        'localisation_client',
        'type_localisation',
        'statut_commande',
        'acheteur',
    ];
}