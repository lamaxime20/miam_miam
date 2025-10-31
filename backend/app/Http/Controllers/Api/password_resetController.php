<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;
use App\Models\password_reset as PasswordReset;
use App\Models\Utilisateur;
use App\Mail\UserVerificationMail;

class password_resetController extends Controller
{
    // POST /api/password-reset/request
    public function requestReset(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email'
        ]);

        // Trouver l'utilisateur par email
        $user = Utilisateur::where('email_user', $validated['email'])->first();
        if (!$user) {
            // Pour sécurité, ne pas révéler si l'email existe ou non
            return response()->json(['message' => 'Si un compte existe, un code a été envoyé.'], 200);
        }

        // Générer un code à 6 chiffres
        $code = strval(random_int(100000, 999999));

        // Définir expiration à +1 heure
        $now = Carbon::now();
        $expiresAt = $now->copy()->addHour();

        // Optionnel: invalider anciens codes non utilisés
        PasswordReset::where('id_user', $user->id_user)
            ->where('utilise', false)
            ->update(['utilise' => true]);

        // Créer un enregistrement
        PasswordReset::create([
            'id_user' => $user->id_user,
            'token' => $code,
            'date_creation' => $now,
            'date_expiration' => $expiresAt,
            'utilise' => false,
        ]);

        // Envoyer l'email
        $messageContent = "Ton code de réinitialisation à 06 chiffres est : {$code}. Ce code est valide pendant 1 heure.";
        Mail::to($validated['email'])->send(new UserVerificationMail($messageContent));

        return response()->json([
            'message' => 'Si un compte existe, un code a été envoyé.'
        ], 200);
    }

    // POST /api/password-reset/verify
    public function verifyCode(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6'
        ]);

        $user = Utilisateur::where('email_user', $validated['email'])->first();
        if (!$user) {
            return response()->json(['valid' => false], 200);
        }

        $now = Carbon::now();
        $record = PasswordReset::where('id_user', $user->id_user)
            ->where('token', $validated['code'])
            ->where('utilise', false)
            ->where('date_expiration', '>', $now)
            ->orderByDesc('date_creation')
            ->first();

        return response()->json(['valid' => (bool) $record], 200);
    }

    // POST /api/password-reset/reset
    public function resetPassword(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
            'password' => 'required|string|min:6|max:255',
            'password_confirmation' => 'required|same:password',
        ]);

        $user = Utilisateur::where('email_user', $validated['email'])->first();
        if (!$user) {
            return response()->json(['message' => 'Code invalide ou expiré'], 400);
        }

        $now = Carbon::now();
        $record = PasswordReset::where('id_user', $user->id_user)
            ->where('token', $validated['code'])
            ->where('utilise', false)
            ->where('date_expiration', '>', $now)
            ->orderByDesc('date_creation')
            ->first();

        if (!$record) {
            return response()->json(['message' => 'Code invalide ou expiré'], 400);
        }

        // Mettre à jour le mot de passe
        $user->password_user = Hash::make($validated['password']);
        $user->save();

        // Marquer le code comme utilisé
        $record->utilise = true;
        $record->save();

        return response()->json(['message' => 'Mot de passe réinitialisé avec succès'], 200);
    }
}
