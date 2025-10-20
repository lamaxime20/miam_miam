<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class reponse extends Model
{
    use HasFactory;

    protected $table = 'reponse';
    protected $primaryKey = 'id_reponse';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'statut_reponse',
        'reclamation_cible',
        'auteur',
        'message_reponse',
    ];

    // Relations
    public function reclamation()
    {
        return $this->belongsTo(reclamation::class, 'reclamation_cible', 'id_reclamation');
    }

    public function auteur_utilisateur()
    {
        return $this->belongsTo(Utilisateur::class, 'auteur', 'id_user');
    }
}