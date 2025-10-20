<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class choisir_menu_jour extends Model
{
    use HasFactory;

    protected $table = 'choisir_menu_jour';
    protected $primaryKey = null;
    public $incrementing = false;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'id_menu',
        'id_employe',
        'date_jour',
    ];
}