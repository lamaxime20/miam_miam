<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class travailler_pour extends Model
{
    use HasFactory;

    protected $table = 'travailler_pour';
    protected $primaryKey = null;
    public $incrementing = false;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'id_employe',
        'id_restaurant',
        'date_debut',
        'service_employe',
    ];
}