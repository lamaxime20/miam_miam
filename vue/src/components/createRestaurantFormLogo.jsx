import React, { useRef, useState } from "react";
import '../assets/styles/createRestaurant.css';
import { restaurant } from "../services/restaurant";
import LoaderOverlay from "./loaderOverlay"; // 🔹 import du loader
import { uploadImage, updateImage } from "../services/GestionMenu";
const API_URL = import.meta.env.VITE_API_URL;

const CreateRestaurantFormLogo = ({ onNext, handlePrevious }) => {
    // On utilise maintenant l'état local pour gérer l'image et les messages
    const [image, setImage] = useState(
        restaurant.restoLogo instanceof File
            ? URL.createObjectURL(restaurant.restoLogo)
            : restaurant.restoLogo || null
    );
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    const fileInputRef = useRef();
    const [isLoading, setIsLoading] = useState(false); // 🔹 état du loader

    const onDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleImageUpload = async (file) => {
        if (!file) return;

        // Vérification du type de fichier
        if (!file.type.startsWith("image/")) {
            setError("Le fichier doit être une image (jpeg, png, etc.).");
            return;
        }

        setIsLoading(true);
        setError(null);
        setMessage(null);

        try {
            // Aperçu immédiat en local
            const localPreviewUrl = URL.createObjectURL(file);
            setImage(localPreviewUrl);

            console.log(`Trying to upload image: ${localPreviewUrl} ${file}`)

            const hasExisting = !!restaurant.restoIdFileLogo;
            const response = hasExisting
                ? await updateImage(restaurant.restoIdFileLogo, file)
                : await uploadImage(file);

            const returnedId = response?.id ?? response?.id_file ?? response?.data?.id ?? response?.data?.id_file;
            const url = response?.url ?? response?.path ?? response?.data?.url ?? response?.data?.path ?? null;

            const finalId = returnedId || restaurant.restoIdFileLogo || null;
            if (!finalId) {
                throw new Error("Réponse de l'API invalide: identifiant de fichier manquant.");
            }

            restaurant.restoIdFileLogo = finalId;

            if (url) {
                const imageUrl = url.startsWith('http') ? url : `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
                restaurant.restoLogo = imageUrl;
                setImage(imageUrl);
            }

            setMessage(hasExisting ? "Image mise à jour avec succès !" : "Image téléversée avec succès !");
        } catch (err) {
            setError(err.message || "Une erreur est survenue lors du téléversement.");
            console.error(err);
        } finally {
            setIsLoading(false);
            // Réinitialiser l'input pour permettre de re-sélectionner le même fichier
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const onDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files[0];
        await handleImageUpload(file);
    };

    const onFileChange = async (e) => {
        await handleImageUpload(e.target.files[0]);
    };

    const onRemoveImage = async () => {
        if (isLoading) return;
        setIsLoading(true);
        setError(null);
        setMessage(null);
        try {
            const fileId = restaurant.restoIdFileLogo;
            if (fileId) {
                const res = await fetch(`${API_URL}api/files/${fileId}`, { method: 'DELETE' });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                    throw new Error(data.message || 'Erreur lors de la suppression du fichier.');
                }
            }
            restaurant.restoIdFileLogo = null;
            restaurant.restoLogo = null;
            setImage(null);
            setMessage('Image retirée.');
        } catch (err) {
            setError(err.message || 'Impossible de supprimer l\'image.');
        } finally {
            setIsLoading(false);
            // Réinitialiser l'input ici aussi
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleNext = () => {
        restaurant.imagechoisi = true;
        onNext();
    };

    const handleSkip = () => {
        // L’utilisateur choisit de passer sans image
        restaurant.restoIdFileLogo = null;
        restaurant.restoLogo = null;
        restaurant.imagechoisi = true;
        onNext();
    };

    return (
        <div className="createRestaurantFormLogo-container">
            {/* 🔹 Loader */}
            <LoaderOverlay isLoading={isLoading} />

            <h2 className="createRestaurantFormLogo-title">Logo du restaurant</h2>

            {/* Zone de drop ou upload */}
            <div
                className={`createRestaurantFormLogo-dropzone ${image ? "has-image" : ""}`}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onClick={() => fileInputRef.current.click()}
            >
                {!image ? (
                    <p className="createRestaurantFormLogo-text">
                        Glissez une image ici ou cliquez pour en charger une
                    </p>
                ) : (
                    <img
                        src={image}
                        alt="Aperçu du logo"
                        className="createRestaurantFormLogo-preview"
                    />
                )}
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={onFileChange}
                    style={{ display: "none" }}
                />
            </div>

            {/* Boutons Change / Remove */}
            {image && (
                <div className="createRestaurantFormLogo-actions">
                    <button
                        className="createRestaurantFormLogo-button change"
                        onClick={() => fileInputRef.current.click()}
                        disabled={isLoading}
                    >
                        Changer
                    </button>
                    <button
                        className="createRestaurantFormLogo-button remove"
                        onClick={onRemoveImage}
                        disabled={isLoading}
                    >
                        Retirer
                    </button>
                </div>
            )}

            {/* Messages */}
            {error && (
                <p className="createRestaurantFormLogo-error-message">{error}</p>
            )}
            {message && (
                <p className="createRestaurantFormLogo-warning-message">{message}</p>
            )}

            {/* Navigation */}
            <div className="createRestaurantFormLogo-nav">
                <button
                    className="createRestaurantFormLogo-navButton previous"
                    onClick={handlePrevious}
                    disabled={isLoading}
                >
                    Previous
                </button>

                {image ? (
                    <button
                        className="createRestaurantFormLogo-navButton next"
                        onClick={handleNext}
                        disabled={isLoading}
                    >
                        Next
                    </button>
                ) : (
                    <button
                        className="createRestaurantFormLogo-navButton skip"
                        onClick={handleSkip}
                        disabled={isLoading}
                    >
                        Skip
                    </button>
                )}
            </div>
        </div>
    );
};

export default CreateRestaurantFormLogo;
