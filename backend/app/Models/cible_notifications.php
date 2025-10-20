<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class cible_notifications extends Model
{
    use HasFactory;

    protected $table = 'cible_notifications';
    protected $primaryKey = null;
    public $incrementing = false;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'id_notification',
        'id_cible',
        'ouvert',
    ];

    // Relations
    public function notification()
    {
        return $this->belongsTo(notifications::class, 'id_notification', 'id_notification');
    }

    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class, 'id_cible', 'id_user');
    }
}