<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class promotion extends Model
{
    use HasFactory;

    protected $table = 'promotion';
    protected $primaryKey = 'id_promo';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'titre',
        'description_promotion',
        'date_debut',
        'date_fin',
        'image_promo',
        'pourcentage_reduction',
    ];
}