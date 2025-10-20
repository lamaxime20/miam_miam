<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class noter extends Model
{
    use HasFactory;

    protected $table = 'noter';
    protected $primaryKey = null;
    public $incrementing = false;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'id_client',
        'id_menu',
        'note_menu',
        'commentaire',
    ];
}