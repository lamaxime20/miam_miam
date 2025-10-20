<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class reclamation extends Model
{
    use HasFactory;

    protected $table = 'reclamation';
    protected $primaryKey = 'id_reclamation';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'message_reclamation',
        'date_soummission',
        'statut_reclamation',
        'restaurant_cible',
        'acheteur',
    ];

    public function reponses()
    {
        return $this->hasMany(reponse::class, 'reclamation_cible', 'id_reclamation');
    }
}