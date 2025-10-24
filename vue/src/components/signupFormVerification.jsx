import { useState, useRef, useEffect } from "react";
import { 
    validateVerificationCode, 
    startVerificationCodeTimer, 
    stopVerificationCodeTimer, 
    envoyerEmail, 
    User 
} from "../services/user";
import LoaderOverlay from '../components/loaderOverlay';

function SignupFormVerification({ onPrevious, onNext }) {
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const [error, setError] = useState("");
    const [compteRebours, setCompteRebours] = useState(() => {
        const stored = localStorage.getItem('code_verification');
        if (!stored) return "10:00";
        const { expiresAt } = JSON.parse(stored);
        const timeLeft = expiresAt - Date.now();
        if (timeLeft <= 0) return "00:00";
        const minutes = Math.floor(timeLeft / 1000 / 60);
        const seconds = Math.floor((timeLeft / 1000) % 60);
        return `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
    });
    const [isTimerFinished, setIsTimerFinished] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // 🔹 état loading
    const inputsRef = useRef([]);

    useEffect(() => {
        const stored = localStorage.getItem('code_verification');
        if (User.email && stored) {
            const { expiresAt } = JSON.parse(stored);
            if (Date.now() < expiresAt) {
                startVerificationCodeTimer(setCompteRebours, setIsTimerFinished);
            } else {
                setCompteRebours("00:00");
                setIsTimerFinished(true);
                localStorage.removeItem('code_verification'); // code expiré
            }
        }
        return () => stopVerificationCodeTimer();
    }, []);

    const handleResendEmail = async () => {
        if (!isTimerFinished) return;

        setIsLoading(true); // 🔹 active le loader

        try {
            const emailSent = await envoyerEmail({ email: User.email });
            if (emailSent) startVerificationCodeTimer(setCompteRebours, setIsTimerFinished);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false); // 🔹 désactive le loader
        }
    };

    const handleChange = (e, index) => {
        const value = e.target.value.replace(/\D/, "");
        if (value.length > 1) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        if (value && index < 5) inputsRef.current[index + 1]?.focus();
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    const handleNext = () => {
        const validationErrors = validateVerificationCode(code);
        if (Object.keys(validationErrors).length === 0) {
            onNext(); // ✅ code correct
        } else {
            setError(validationErrors.code);
        }
    };

    return (
        <form className="signup-verification-form" onSubmit={(e) => e.preventDefault()}>
            <h2 className="signup-verification-title">Vérification de l'email</h2>

            <div className="signup-code-inputs">
                {code.map((digit, index) => (
                    <input
                        key={index}
                        ref={(el) => (inputsRef.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleChange(e, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        className="signup-code-box"
                    />
                ))}
            </div>

            {error && <p className="signup-error-message">{error}</p>}

            <div className="signup-form-buttons">
                <button type="button" className="signup-btn-previous" onClick={onPrevious} disabled={isLoading}>
                    Précédent
                </button>
                <button type="button" className="signup-btn-next" onClick={handleNext} disabled={isLoading}>
                    Suivant
                </button>
            </div>

            <a
                onClick={handleResendEmail}
                style={{ cursor: isTimerFinished && !isLoading ? 'pointer' : 'not-allowed', color: isTimerFinished && !isLoading ? 'blue' : 'grey' }}
            >
                Renvoyer un email... {compteRebours}
            </a>

            <LoaderOverlay isLoading={isLoading} /> {/* 🔹 overlay */}
        </form>
    );
}

export default SignupFormVerification;