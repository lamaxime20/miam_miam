// LoaderOverlay.jsx
import React from 'react';
import '../assets/styles/loaderOverlay.css'; // pour le style du spinner et overlay

export default function LoaderOverlay({ isLoading }) {
  if (!isLoading) return null;

  return (
    <div className="overlay">
      <div className="spinner"></div>
    </div>
  );
}