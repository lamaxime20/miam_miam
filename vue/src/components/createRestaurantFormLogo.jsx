import React, { useRef, useState } from "react";
import '../assets/styles/createRestaurant.css';
import { useRestaurantFormLogo, restaurant } from "../services/restaurant";
import LoaderOverlay from "./loaderOverlay"; // 🔹 import du loader

const CreateRestaurantFormLogo = ({ onNext, handlePrevious }) => {
    const {
        image,
        error,
        message,
        handleImageUpload,
        handleRemoveImage,
    } = useRestaurantFormLogo();

    const fileInputRef = useRef();
    const [isLoading, setIsLoading] = useState(false); // 🔹 état du loader

    const onDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const onDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const file = e.dataTransfer.files[0];
        if (!file) return;

        setIsLoading(true);
        await handleImageUpload(file);
        setIsLoading(false);
    };

    const onFileChange = async (e) => {
        if (!e.target.files[0]) return;

        setIsLoading(true);
        await handleImageUpload(e.target.files[0]);
        setIsLoading(false);
    };

    const onRemoveImage = async () => {
        setIsLoading(true);
        await handleRemoveImage();
        setIsLoading(false);
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
