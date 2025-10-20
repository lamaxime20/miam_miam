<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class historique_fidelite extends Model
{
    use HasFactory;

    protected $table = 'historique_fidelite';
    protected $primaryKey = 'id_historique';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'id_client',
        'changement',
        'raison',
        'date_changement',
    ];
}