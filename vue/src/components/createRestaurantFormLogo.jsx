import React from "react";
import "../assets/styles/createRestaurantFormLogo.css";
import { useRestaurantFormLogo } from "../services/restaurant";

const CreateRestaurantFormLogo = ({ handleNext, handlePrevious }) => {
    const {
        image,
        error,
        message,
        handleImageUpload,
        handleRemoveImage,
        handleChangeImage,
    } = useRestaurantFormLogo();

    const fileInputRef = useRef();

    const onDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        handleImageUpload(file);
    };

    const onFileChange = (e) => {
        const file = e.target.files[0];
        handleImageUpload(file);
    };

    return (
        <div className="createRestaurantFormLogo-container">
            <h2 className="createRestaurantFormLogo-title">Logo du restaurant</h2>

            {/* Zone de drop ou upload */}
            <div
                className={`createRestaurantFormLogo-dropzone ${
                    image ? "has-image" : ""
                }`}
                onDrop={onDrop}
                onDragOver={(e) => e.preventDefault()}
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
                    >
                        Changer
                    </button>
                    <button
                        className="createRestaurantFormLogo-button remove"
                        onClick={handleRemoveImage}
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
                >
                    Previous
                </button>
                <button
                    className="createRestaurantFormLogo-navButton next"
                    onClick={handleNext}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default CreateRestaurantFormLogo;