import { useState, useRef } from "react";
import { validateVerificationCode } from "../services/user";

function SignupFormVerification({ onPrevious, onNext }) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const inputsRef = useRef([]);

  const handleChange = (e, index) => {
    const value = e.target.value.replace(/\D/, "");
    if (value.length > 1) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) inputsRef.current[index + 1].focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleNext = () => {
    const validationErrors = validateVerificationCode(code);
    console.log(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      onNext(); // ✅ passe à l’étape suivante
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
        <button type="button" className="signup-btn-previous" onClick={onPrevious}>
          Previous
        </button>
        <button type="button" className="signup-btn-next" onClick={handleNext}>
          Next
        </button>
      </div>
    </form>
  );
}

export default SignupFormVerification;