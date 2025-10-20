<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class etre_livreur extends Model
{
    use HasFactory;

    protected $table = 'etre_livreur';
    protected $primaryKey = null;
    public $incrementing = false;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'id_livreur',
        'id_restaurant',
        'note_livreur',
        'date_debut',
        'service_employe',
    ];
}