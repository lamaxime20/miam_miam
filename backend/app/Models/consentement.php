<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class consentement extends Model
{
    use HasFactory;

    protected $table = 'consentement';
    protected $primaryKey = 'id_consentement';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'id_user',
        'type_consentement',
        'version_texte',
        'accepte',
        'date_action',
        'ip_client',
        'user_agent',
    ];

    // Relations
    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class, 'id_user', 'id_user');
    }
}