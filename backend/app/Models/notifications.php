<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class notifications extends Model
{
    use HasFactory;

    protected $table = 'notifications';
    protected $primaryKey = 'id_notification';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'message_notification',
        'date_notif',
        'restaurant_auteur',
    ];

    // Relations

    public function cibles()
    {
        return $this->hasMany(cible_notifications::class, 'id_notification', 'id_notification');
    }

    public function utilisateurs()
    {
        return $this->belongsToMany(Utilisateur::class, 'cible_notifications', 'id_notification', 'id_cible')->withPivot('ouvert');
    }
}