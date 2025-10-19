<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class categorie_menu extends Model
{
    use HasFactory;

    protected $table = 'categorie_menu';
    protected $primaryKey = 'libelle';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'libelle',
        'description_categorie',
    ];
}