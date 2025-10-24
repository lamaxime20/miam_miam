<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\reponse;
use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Mail;
use App\Mail\UserVerificationMail;
use App\Models\User;

class UtilisateurController extends Controller
{
    public function index()
    {
        $utilisateurs = DB::select('SELECT * FROM lister_utilisateurs()');
        return response()->json($utilisateurs);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:100',
            'email' => [
                'required',
                'email',
                'max:255',
                'unique:Utilisateur,email_user'
            ],
            'mot_de_passe' => 'required|string|min:6|max:255',
            'telephone' => [
                'required',
                'regex:/^\+?[0-9\s\-()]{7,20}$/'
            ],
            'userState' => 'required|in:actif,inactif,suspendu',
        ]);

        $utilisateurs = DB::select('SELECT * FROM ajouter_utilisateur(?, ?, ?, ?, ?)', [
            $validated['nom'],
            $validated['email'],
            Hash::make($validated['mot_de_passe']),
            $validated['telephone'],
            $validated['userState'],
        ]);

        return response()->json($utilisateurs, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $utilisateurs = DB::select('SELECT * FROM obtenir_utilisateur_par_id(?)', [$id]);
        if (empty($utilisateurs)) {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        // Renvoie directement le premier élément du tableau
        return response()->json($utilisateurs[0]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'nom_user' => 'required|string|max:100',
            'email_user' => [
                'required',
                'email',
                'max:255',
                Rule::unique('Utilisateur', 'email_user')->ignore($id, 'id_user')
            ],
            'num_user' => [
                'required',
                'regex:/^\+?[0-9\s\-()]{7,20}$/'
            ],
            'statut_account' => 'required|in:actif,inactif,suspendu',
        ]);

        $utilisateurs = DB::select('SELECT * FROM modifier_utilisateur(?, ?, ?, ?, ?)', [
            $id,
            $validated['nom_user'],
            $validated['email_user'],
            $validated['num_user'],
            $validated['statut_account'],
        ]);

        return response()->json($utilisateurs);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $utilisateurs = DB::select('SELECT * FROM supprimer_utilisateur(?)', [$id]);
        return response()->json($utilisateurs);
    }

    public function checkEmailExiste(Request $request) 
    {
        $validate = $request->validate([
            'email' => 'required|email|max:255'
        ]);
        $email = $validate['email'];
        $reponse = DB::select('SELECT * FROM verifier_email_existant(?)', [$email]);
        return response()->json($reponse[0]);
    }

    public function checkPasswordCorrect(Request $request) 
    {
        $validate = $request->validate([
            'email' => 'required|email|max:255',
            'password' => 'required|string|min:6|max:255'
        ]);

        $user = DB::select('SELECT* FROM "Utilisateur" WHERE email_user = ?', [$validate['email']]);
        if ($user && Hash::check($validate['password'], $user[0]->password_user)){
            return response()->json(['correct' => true], 200);
        } else {
            return response()->json(['correct' => false], 200);
        }
        
    }

    public function login(Request $request)
    {
        $validate = $request->validate([
            'email' => 'required|email|max:255',
            'password' => 'required|string|min:6|max:255',
            'role' => 'required|string',
            'restaurant' => 'required|string',
        ]);

        $user = Utilisateur::where('email_user', $validate['email'])->first();

        $role = $validate['role'];
        $restaurant = $validate['restaurant'];
        $token = $user->createExpiringToken('auth_token', [$role. ':' .$restaurant], 2);

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'role' => $role
        ], 200);
    }

    public function inscription(Request $request){
        $validated = $request->validate([
            'nom' => 'required|string|max:100',
            'email' => [
                'required',
                'email',
                'max:255',
                'unique:Utilisateur,email_user'
            ],
            'mot_de_passe' => 'required|string|min:6|max:255',
            'telephone' => [
                'required',
                'regex:/^\+?[0-9\s\-()]{7,20}$/'
            ],
            'userState' => 'required|in:actif,inactif,suspendu',
        ]);

        $utilisateurs = DB::select('SELECT * FROM ajouter_utilisateur(?, ?, ?, ?, ?)', [
            $validated['nom'],
            $validated['email'],
            Hash::make($validated['mot_de_passe']),
            $validated['telephone'],
            $validated['userState'],
        ]);

        return response()->json([
            'message' => 'Utilisateur crée',
        ], 205);
    }

    public function token_inscription(Request $request){
        $validated = $request->validate([
            'email' => [
                'required',
                'email',
                'max:255'
            ],
            'role' => 'required|string',
            'restaurant' => 'required|string',
        ]);
        $user = Utilisateur::where('email_user', $validated['email'])->first();

        $role = $validated['role'];
        $restaurant = $validated['restaurant'];
        $token = $user->createExpiringToken('auth_token', [$role. ':' .$restaurant], 2);

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'role' => $role
        ], 200);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnecté avec succès'], 200);
    }

    public function sendCodeVerification(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $code = rand(100000, 999999);

        $email = $request->email;
        $messageContent = "Ton code de vérification à 06 chiffres est : {$code} . Ce code est valide pendant 10 minutes.";

        Mail::to($email)->send(new UserVerificationMail($messageContent));

        return response()->json([
            'message' => 'Code de vérification envoyé avec succès',
            'code' => $code
        ], 200);
    }
}