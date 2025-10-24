import React, { useState } from 'react';
import { validateSignupFormName, User, codeVerified } from '../services/user';
import LoaderOverlay from '../components/loaderOverlay';

const SignupFormName = ({ onNext }) => {
  const [name, setName] = useState(User.name || '');
  const [email, setEmail] = useState(User.email || '');
  const [phone, setPhone] = useState(User.phone || '');
  const [errors, setErrors] = useState({});
  const [initialEmail] = useState(User.email || '');
  const [isLoading, setIsLoading] = useState(false); // 🔹 état loading

  const handleNext = async () => {
    setIsLoading(true); // 🔹 active le loader

    let validationErrors = {};

    try {
      if (email !== initialEmail) {
        validationErrors = await validateSignupFormName({ name, email, phone });
      } else {
        if (!name.trim()) validationErrors.name = "Le nom est obligatoire.";
        if (!phone.trim()) validationErrors.phone = "Le numéro de téléphone est obligatoire.";
        else if (!/^\+?[0-9\s\-()]{7,20}$/.test(phone)) {
          validationErrors.phone = "Numéro de téléphone invalide.";
        }

        if (codeVerified && Object.keys(validationErrors).length === 0) {
          onNext(3);
          return;
        }
      }

      if (Object.keys(validationErrors).length === 0) {
        onNext();
      } else {
        setErrors(validationErrors);
      }
    } catch (err) {
      console.error(err);
      setErrors({ global: "Erreur inattendue. Réessaie." });
    } finally {
      setIsLoading(false); // 🔹 désactive le loader
    }
  };

  return (
    <div className="signup-form-name-container">
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="signup-form-group">
          <label htmlFor="name">Nom</label>
          <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} />
          {errors.name && <p className="signup-error-message">{errors.name}</p>}
        </div>

        <div className="signup-form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          {errors.email && <p className="signup-error-message">{errors.email}</p>}
        </div>

        <div className="signup-form-group">
          <label htmlFor="phone">Téléphone</label>
          <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          {errors.phone && <p className="signup-error-message">{errors.phone}</p>}
        </div>

        {errors.global && <p className="signup-error-message">{errors.global}</p>}
      </form>

      <div className="signup-button-container">
        <button className="signup-btn" type="button" onClick={handleNext} disabled={isLoading}>
          {isLoading ? "Chargement..." : "Suivant"}
        </button>
      </div>

      <LoaderOverlay isLoading={isLoading} /> {/* 🔹 overlay */}
    </div>
  );
};

export default SignupFormName;
