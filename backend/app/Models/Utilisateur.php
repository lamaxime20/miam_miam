<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Utilisateur extends Model
{
    use HasFactory;

    protected $table = '"Utilisateur"';       // Nom exact de ta table
    protected $primaryKey = 'id_user';      // Clé primaire personnalisée
    public $incrementing = true;            // La PK est auto-incrémentée (SERIAL)
    protected $keyType = 'int';             // Type entier pour la PK
    public $timestamps = false;             // On gère updated_at manuellement

    protected $fillable = [
        'nom_user',
        'email_user',
        'password_user',
        'num_user',
        'date_inscription',
        'last_connexion',
        'statut_account',
        'updated_at',
    ];
}