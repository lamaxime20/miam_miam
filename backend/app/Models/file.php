<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class file extends Model
{
    use HasFactory;

    protected $table = 'file';
    protected $primaryKey = 'id_file';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'nom_fichier',
        'extension',
        'chemin',
    ];
}