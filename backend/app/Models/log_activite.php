<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class log_activite extends Model
{
    use HasFactory;

    protected $table = 'log_activite';
    protected $primaryKey = 'id_log';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'id_user',
        'action',
        'cible',
        'id_cible',
        'details',
        'ip_client',
        'date_action',
    ];

    // Relations
    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class, 'id_user', 'id_user');
    }
}