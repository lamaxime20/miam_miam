<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class session extends Model
{
    use HasFactory;

    protected $table = 'session';
    protected $primaryKey = 'id_session';
    public $incrementing = false; // UUID
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'id_session',
        'id_user',
        'token',
        'ip_client',
        'user_agent',
        'date_connexion',
        'date_deconnexion',
        'actif',
    ];

    // Relations
    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class, 'id_user', 'id_user');
    }
}