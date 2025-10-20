<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class gerer extends Model
{
    use HasFactory;

    protected $table = 'gerer';
    protected $primaryKey = null;
    public $incrementing = false;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'id_restaurant',
        'id_gerant',
        'date_debut',
        'service_employe',
    ];
}