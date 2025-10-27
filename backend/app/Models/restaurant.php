<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class restaurant extends Model
{
    use HasFactory;

    protected $table = 'restaurant';
    protected $primaryKey = 'id_restaurant';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'nom_restaurant',
        'localisation',
        'type_localisation',
        'logo_restaurant',
        'politique',
        'administrateur',
        'updated_at',
    ];
}