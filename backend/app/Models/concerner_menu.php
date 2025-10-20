<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class concerner_menu extends Model
{
    use HasFactory;

    protected $table = 'concerner_menu';
    protected $primaryKey = null;
    public $incrementing = false;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'id_promo',
        'id_menu',
    ];

    // Relations
    public function promotion()
    {
        return $this->belongsTo(promotion::class, 'id_promo', 'id_promo');
    }
}