<?php

namespace App\Models;

use Illuminate\Auth\Middleware\Authenticate;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Utilisateur extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $table = 'Utilisateur';       // Nom exact de ta table
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

    public function createExpiringToken($name, $abilities = [], $hours = 2)
    {
        $tokenResult = $this->createToken($name, $abilities);
        $token = $tokenResult->plainTextToken;
        $accessToken = $tokenResult->accessToken;
        $accessToken->expires_at = now()->addHours($hours);
        $accessToken->save();

        return $token;
    }
}