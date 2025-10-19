<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class menu extends Model
{
    use HasFactory;

    protected $table = 'menu';
    protected $primaryKey = 'id_menu';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'nom_menu',
        'description_menu',
        'image_menu',
        'prix_menu',
        'fidelity_point',
        'statut_menu',
        'restaurant_hote',
        'libelle_menu',
        'updated_at',
    ];
}