

const API_URL = import.meta.env.VITE_API_URL;
console.log("API_URL:", API_URL);

export let User = {
    email: null,
    name: null,
    phone: null,
    password: null,
    confirmPassword: null,
};

export let verificationCode = null;
export let codeVerified = false;

// =====================================
// Envoi du code de vérification par email
// =====================================
export async function envoyerEmail({ email }) {
    try {
        const response = await fetch(`${API_URL}api/codeVerification`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        if (!response.ok) throw new Error(`Erreur serveur : ${response.status}`);
        const data = await response.json();

        if (data.code) {
            verificationCode = data.code;

            const expiresAt = Date.now() + 10 * 60 * 1000; // 10 min
            const codeData = { code: verificationCode, expiresAt };
            localStorage.setItem('code_verification', JSON.stringify(codeData));
            console.log('[envoyerEmail] Réponse serveur:', data);
            console.log('[envoyerEmail] Code généré:', verificationCode);
            console.log('[envoyerEmail] Objet stocké en localStorage (code_verification):', codeData);
            console.log('[envoyerEmail] Code stocké jusqu’à :', new Date(expiresAt).toLocaleTimeString());

            return true;
        } else {
            console.warn('[envoyerEmail] Aucun code reçu du serveur.');
            return false;
        }
    } catch (error) {
        console.error('Erreur lors de l’envoi de l’email :', error);
        return false;
    }
}

// =====================================
// Vérification si l'email existe déjà
// =====================================
export async function VerifEmailExist(email) {
    try {
        const response = await fetch(`${API_URL}api/checkEmailExiste`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ email }),
        });

        if (!response.ok) return false;

        const data = await response.json();
        return !!data.verifier_email_existant;
    } catch (error) {
        console.error('Erreur vérification email :', error);
        return false;
    }
}

// =====================================
// Validation du formulaire Nom/Email/Phone
// =====================================
export async function validateSignupFormName({ name, email, phone }) {
    const errors = {};
    console.log('[validateSignupFormName] Début validation', { name, email, phone, prevUser: User });

    if (email.trim() !== User.email) {
        resetVerificationCodeTimer();
    }

    if (!name.trim()) {
        errors.name = "Le nom est obligatoire.";
    }

    if (!email.trim()) {
        errors.email = "L'email est obligatoire.";
    } else if (!/^["'`\w-.]+@([\w-]+\.)+[\w-]{2,4}$/i.test(email)) {
        errors.email = "L'adresse email n'est pas valide.";
    } else {
        // Vérifier si l'email existe
        const emailExiste = await VerifEmailExist(email);
        if (emailExiste) {
            errors.email = "L'email existe déjà.";
        } else {
            // Envoi du code seulement si tout est ok
            const emailSent = await envoyerEmail({ email });
            if (!emailSent) {
                errors.global = "Impossible d'envoyer le code. Vérifie ta connexion.";
            }
        }
    }

    if (!phone.trim()) {
        errors.phone = "Le numéro de téléphone est obligatoire.";
    } else if (!/^\+?[0-9\s\-()]{7,20}$/.test(phone)) {
        errors.phone = "Numéro de téléphone invalide (7 à 20 caractères).";
    }

    // Mettre à jour User seulement si pas d'erreur
    User.name = name;
    User.email = email;
    User.phone = phone;

    localStorage.setItem('User', JSON.stringify(User));
    console.log('[validateSignupFormName] User sauvegardé en localStorage:', User);

    return errors;
}

// =====================================
// Validation du code de vérification
// =====================================
export function validateVerificationCode(codeArray) {
    const codeSaisi = codeArray.join("");
    const errors = {};
    console.log('[validateVerificationCode] Code saisi:', codeSaisi);

    const storedData = localStorage.getItem('code_verification');
    if (!storedData) {
        errors.code = "Code expiré ou absent.";
        codeVerified = false;
        return errors;
    }

    const { code, expiresAt } = JSON.parse(storedData);
    console.log('[validateVerificationCode] Code stocké:', code, 'expiresAt:', new Date(expiresAt).toLocaleString());
    if (Date.now() > expiresAt) {
        localStorage.removeItem('code_verification');
        errors.code = "Code expiré.";
        codeVerified = false;
        return errors;
    }

    if (!/^\d{6}$/.test(codeSaisi)) {
        errors.code = "Le code doit contenir 6 chiffres.";
        codeVerified = false;
    } else if (codeSaisi != code) {
        errors.code = "Code incorrect.";
        console.log('[validateVerificationCode] Code incorrect - attendu:', code, 'reçu:', codeSaisi);
        codeVerified = false;
    } else {
        codeVerified = true;
    }
    
    User.codeVerified = codeVerified;
    localStorage.setItem('User', JSON.stringify(User));

    return errors;
}

// =====================================
// Validation mot de passe
// =====================================
export function validateSignupFormPassword({ password, confirmPassword }) {
    const errors = {};

    if (!password.trim()) {
        errors.password = "Le mot de passe est obligatoire.";
    } else if (password.length < 6) {
        errors.password = "Le mot de passe doit contenir au moins 6 caractères.";
    }

    if (password.trim() !== confirmPassword.trim()) {
        errors.confirmPassword = "Les mots de passe ne correspondent pas.";
    }

    // Mettre à jour User seulement si tout est ok
    if (Object.keys(errors).length === 0) {
        User.password = password;
        User.confirmPassword = confirmPassword;
    }

    localStorage.setItem('User', JSON.stringify(User));
    console.log('[validateSignupFormPassword] User sauvegardé en localStorage (mot de passe mis):', { name: User.name, email: User.email, phone: User.phone, hasPassword: !!User.password });

    return errors;
}

// =====================================
// Création de l'utilisateur côté serveur
// =====================================
export async function creerUser() {
    try {
        console.log(User.name, User.email, User.phone, User.password);
        const utilisateur = {
            nom: User.name,
            email: User.email,
            mot_de_passe: User.password,
            telephone: User.phone,
            userState: 'actif',
        };

        const response = await fetch(`${API_URL}api/utilisateurs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(utilisateur),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Erreur API :', errorData);
            throw new Error(`Erreur serveur : ${response.status}`);
        }

        const data = await response.json();
        console.log('Utilisateur créé :', data);
        return true;
    } catch (error) {
        console.error('Erreur création utilisateur :', error);
        return false;
    }
}

// =====================================
// Timer pour le code de vérification
// =====================================
let timerInterval = null;

export function startVerificationCodeTimer(setCompteRebours, onTimerEnd) {
    stopVerificationCodeTimer();

    const storedData = localStorage.getItem('code_verification');
    if (!storedData) return;

    const { code, expiresAt } = JSON.parse(storedData);
    console.log('[startVerificationCodeTimer] Démarrage timer pour code:', code, 'expiresAt:', new Date(expiresAt).toLocaleString());

    const updateTimer = () => {
        const now = Date.now();
        const timeLeft = expiresAt - now; // ⬅️ temps restant exact

        if (timeLeft <= 0) {
            stopVerificationCodeTimer();
            setCompteRebours("00:00");
            onTimerEnd(true);
            localStorage.removeItem('code_verification'); // expire seulement à la fin
            return;
        }

        const minutes = Math.floor(timeLeft / 1000 / 60);
        const seconds = Math.floor((timeLeft / 1000) % 60);
        setCompteRebours(`${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`);
    };

    updateTimer(); // update immédiat
    timerInterval = setInterval(updateTimer, 1000);
    onTimerEnd(false);
}

export function stopVerificationCodeTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

export function resetVerificationCodeTimer() {
    stopVerificationCodeTimer();
    localStorage.removeItem('code_verification');
    verificationCode = null;
    codeVerified = false;
    console.log('[resetVerificationCodeTimer] Code de vérification réinitialisé et supprimé du localStorage');
}

export function clearSignupStorageUser() {
    // Clear only signup-related keys (keep auth_token handling separate)
    localStorage.removeItem('User');
    localStorage.removeItem('signupStep');
    localStorage.removeItem('code_verification');
    // extra keys that older code sometimes used — safe to remove as well
    localStorage.removeItem('verificationTimer');
    localStorage.removeItem('isEmailVerified');
    localStorage.removeItem('verificationCode');
    console.log('[clearSignupStorageUser] Supprimé: User, signupStep, code_verification, verificationTimer, isEmailVerified, verificationCode');
}

export function loadUserFromStorage() {
    // Load signup progress from localStorage when present.
    // Do NOT clear signup storage here based on auth token: signup is an unauthenticated flow
    const storedUser = localStorage.getItem('User');
    console.log('[loadUserFromStorage] Lecture localStorage User:', storedUser);
    if(storedUser){
        const data = JSON.parse(storedUser);
        User.name = data.name;
        User.email = data.email;
        User.phone = data.phone;
        User.password = data.password;
        User.confirmPassword = data.confirmPassword;
        codeVerified = data.codeVerified || false;
    }

    if(User.name || User.email || User.phone){
        localStorage.setItem('signupStep', '2');
        if(codeVerified){
            localStorage.setItem('signupStep', '3');
            if(User.password){
                localStorage.setItem('signupStep', '4');
            }
        }
    } else {
        localStorage.setItem('signupStep', '1');
    }
}

export function infoUserExistsInStorage() {
    const storedUser = localStorage.getItem('User');
    return !!storedUser;
}

export function saveUserToStorage() {
    localStorage.setItem('User', JSON.stringify(User));
    console.log('[saveUserToStorage] User sauvegardé:', User);
}

export async function genererTokenInscription({ email, role, restaurant }) {
    try {
        const response = await fetch(API_URL + 'api/token_inscription', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ email, role, restaurant })
        });

        if (!response.ok) {
            // Log de la réponse d'erreur pour le débogage
            const errorData = await response.json().catch(() => ({ message: "Réponse invalide du serveur" }));
            console.error('Erreur serveur :', response.status, errorData);
            return false;
        }

        const data = await response.json();
        console.log('Réponse du serveur :', data);

        if (data.access_token) {
            // Stockage du token avec expiration
            const expiresAt = Date.now() + 2 * 60 * 60 * 1000; // 2 heures en millisecondes (comme dans la fonction Laravel)
            const tokenData = {
                access_token: data.access_token,
                token_type: data.token_type,
                role: data.role,
                restaurant: data.restaurant,
                expiresAt: expiresAt
            };

            localStorage.setItem('auth_token', JSON.stringify(tokenData));
            console.log('Token stocké dans localStorage jusqu’à :', new Date(expiresAt).toLocaleTimeString());

            return true;
        } else {
            console.warn('Pas de token reçu du serveur.');
            return false;
        }

    } catch (error) {
        console.error('Erreur lors de la génération du token :', error);
        return false;
    }
}

export function recupererToken() {
    const stored = localStorage.getItem('auth_token');
    if (!stored) return null;

    const { access_token, expiresAt } = JSON.parse(stored);

    // Vérifie l'expiration
    if (Date.now() > expiresAt) {
        localStorage.removeItem('auth_token');
        clearSignupStorageUser();
        console.log('Token expiré et supprimé.');
        return null;
    }

    return access_token;
}

export const recupererUser = async () => {
    try {
        const token = recupererToken();
        console.log(token);
        if (!token) return null;

        const response = await fetch(API_URL + "api/me", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`, // en-tête pour Sanctum API token
            },
        });

        if (!response.ok) {
            console.error("Erreur lors de la récupération de l'utilisateur :", response.status);
            return null;
        }

        const user = await response.json();
        return user;
    } catch (err) {
        console.error("Erreur :", err);
        return null;
    }
};

export const creerAdmin = async () => {
    console.log("creer admin");    
    try{
        const user = await recupererUser();
        if (!user) return null;
        const id_user = user.user_id;
        const token = recupererToken();

        if (!token) return null;
        if(id_user == null) return null;
        console.log("id_user");

        const formData = new FormData();
        formData.append("id_user", id_user);

        const response = await fetch(API_URL + "api/administrateurs", {
            method: "POST",
            body: formData, // simple request, pas de JSON
        });

        if (!response.ok) {
            console.error("Erreur lors de la création de l'admin :", response.status);
            return null;
        }

        return id_user; // retourne l'ID de l'utilisateur
    } catch (err) {
        console.error("Erreur :", err);
        return null;
    }
}

export async function logout() {
    try {
        // Récupérer le token stocké
        const token = recupererToken();

        if (!token) {
            console.warn('Aucun token trouvé');
            return;
        }

        // Appel à l'endpoint logout
        const response = await fetch(`${API_URL}api/deconnexion`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
        });

        if (!response.ok) {
            throw new Error('Échec de la déconnexion');
        }

        // Supprimer le token du localStorage
        localStorage.removeItem('auth_token');
        console.log('Déconnecté avec succès');

        return true;
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
        return false;
    }
}

export async function genererTokenConnexion({ email, role, restaurant }) {
    const deconnecte = await logout();

    if (!deconnecte) return false;

    console.log("Génération du token de connexion pour l’administrateur...");
    console.log(email, role, restaurant);


    try {
        const response = await fetch(API_URL + 'api/token_inscription', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ email, role, restaurant })
        });

        if (!response.ok) {
            // Log de la réponse d'erreur pour le débogage
            const errorData = await response.json().catch(() => ({ message: "Réponse invalide du serveur" }));
            console.error('Erreur serveur :', response.status, errorData);
            return false;
        }

        const data = await response.json();
        console.log('Réponse du serveur :', data);

        if (data.access_token) {
            // Stockage du token avec expiration
            const expiresAt = Date.now() + 2 * 60 * 60 * 1000; // 2 heures en millisecondes (comme dans Laravel)
            const tokenData = {
                access_token: data.access_token,
                token_type: data.token_type,
                role: data.role,
                restaurant: data.restaurant,
                expiresAt: expiresAt
            };

            localStorage.setItem('auth_token', JSON.stringify(tokenData));
            console.log('Token stocké dans localStorage jusqu’à :', new Date(expiresAt).toLocaleTimeString());

            return true;
        } else {
            console.warn('Pas de token reçu du serveur.');
            return false;
        }

    } catch (error) {
        console.error('Erreur lors de la génération du token :', error);
        return false;
    }
}