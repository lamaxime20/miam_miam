<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class contenir extends Model
{
    use HasFactory;

    protected $table = 'contenir';
    protected $primaryKey = null;
    public $incrementing = false;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'id_commande',
        'id_menu',
        'quantite',
        'prix_unitaire',
    ];

    // Relations
    public function commande()
    {
        return $this->belongsTo(commande::class, 'id_commande', 'id_commande');
    }
}