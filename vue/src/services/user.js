// Vérifie les champs du premier formulaire (nom, email, téléphone)

async function envoyerEmail({email}) {
}

export function validateSignupFormName({ name, email, phone }) {
    const errors = {};

    if (!name.trim()) {
        errors.name = "Le nom est obligatoire.";
    }

    if (!email.trim()) {
        errors.email = "L'email est obligatoire.";
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/i.test(email)) {
        errors.email = "L'adresse email n'est pas valide.";
    }

    if (!phone.trim()) {
        errors.phone = "Le numéro de téléphone est obligatoire.";
    } else if (!/^[0-9]{8,15}$/.test(phone)) {
        errors.phone = "Le numéro de téléphone doit contenir uniquement des chiffres (8 à 15 max).";
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
    }

    return errors;
}