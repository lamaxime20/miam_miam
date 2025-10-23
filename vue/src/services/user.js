import { useNavigate } from 'react-router-dom';
const API_URL = import.meta.env.VITE_API_URL;
console.log(API_URL);
// Vérifie les champs du premier formulaire (nom, email, téléphone)
let code_verification;

export let User = {
    email: null,
    name: null,
    phone: null,
    password: null,
    confirmPassword: null,
};
async function envoyerEmail({ email }) {
    try {
        const response = await fetch('/backend/validationEmail.json');
        if (!response.ok) throw new Error(`Erreur serveur : ${response.status}`);
        const data = await response.json();
        console.log('Données reçues :', data);
        code_verification = data.validation_code.toString(); // ok pour lecture
        return true;
    } catch (error) {
        console.error('Erreur lors de la lecture du fichier JSON:', error);
        return false;
    }
}

export async function validateSignupFormName({ name, email, phone }) {
    const errors = {};

    User.name = name;
    User.email = email;
    User.phone = phone;

    if (!name.trim()) {
        errors.name = "Le nom est obligatoire.";
        User.name = null;
    
    }

    if (!email.trim()) {
        errors.email = "L'email est obligatoire.";
        User.email = null;
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/i.test(email)) {
        errors.email = "L'adresse email n'est pas valide.";
        User.email = null;
    } else if (!envoyerEmail(email)) {
        errors.global = "Vérifies ta connexion";
        User.email = null;
    } else {
        const emailExiste = await VerifEmailExist(email);
        if (emailExiste){
            errors.email = "L'email existe déjà.";
            User.email = null;
        }
    }

    if (!phone.trim()) {
        errors.phone = "Le numéro de téléphone est obligatoire.";
        User.phone = null;
    } else if (!/^\+?[0-9\s\-()]{7,20}$/.test(phone)) {
        errors.phone = "Le numéro de téléphone doit être valide (7 à 20 caractères, chiffres, espaces, +, - ou parenthèses).";
        User.phone = null;
    }

    return errors;
}

// Vérifie le code de vérification (6 chiffres)
export function validateVerificationCode(codeArray) {
    const code = codeArray.join("");
    const errors = {};

    if (code.length !== 6) {
        errors.code = "Le code de vérification doit contenir 6 chiffres.";
    } else if (!/^\d{6}$/.test(code)) {
        errors.code = "Le code doit contenir uniquement des chiffres.";
    } else if (code !== code_verification) {
        errors.code = "Code incorrect.";
        console.log(code_verification);
    }

    return errors;
}

export function validateSignupFormPassword({ password, confirmPassword }) {
    const errors = {};

    User.password = password;
    User.confirmPassword = confirmPassword;
    if (!password.trim()) {
        errors.password = "Le mot de passe est obligatoire.";
        User.password = null;
    }else if(password.trim() !== confirmPassword.trim()){
        errors.confirmPassword = "Les mots de passe ne correspondent pas.";
        User.confirmPassword = null;
    }else if(password.length < 6){
        errors.password = "Le mot de passe doit contenir au moins 6 caractères.";
        User.password = null;
    }

    return errors;
}

export async function creerUser(onNext) {
    try {
        const utilisateur = {
            nom: User.name,
            email: User.email,
            mot_de_passe: User.password,
            telephone: User.phone,
            userState: 'actif',
        };

        const response = await fetch(`${import.meta.env.VITE_API_URL}api/utilisateurs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(utilisateur),
        });

        // Si le serveur renvoie une erreur (ex: 422)
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Erreur API :', errorData);

            if (response.status === 422) {
                console.warn('⚠️ Erreur de validation :', errorData.errors);
            }

            throw new Error(`Erreur serveur : ${response.status}`);
        }

        // Si tout est bon
        const data = await response.json();
        console.log('✅ Utilisateur créé avec succès :', data);

        // Redirection
        onNext();
        return true;

    } catch (error) {
        console.error('❌ Erreur lors de la création de l\'utilisateur :', error);
        return false;
    }
}

export async function VerifEmailExist(email) {
    try {
        const response = await fetch(API_URL +'api/checkEmailExiste', {
            method: 'POST', // POST pour envoyer un body
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ email }), // Envoie l'email dans le body
        });

        if (!response.ok) {
            return false; // email invalide ou erreur serveur
        }

        const data = await response.json();

        // Si la fonction SQL retourne un objet, on considère que l'email existe
        console.log('Vérification email existant :', data.verifier_email_existant);
        if(data.verifier_email_existant == false){
            console.log('Vérification email existant :', data.verifier_email_existant);
            return false;
        }else{
            return true;
        }
    } catch (error) {
        console.error('Erreur lors de la vérification de l’email :', error);
        return false;
    }
}