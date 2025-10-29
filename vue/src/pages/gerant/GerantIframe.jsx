import { useState } from 'react';

function GerantIframe() {
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#333' }}>
          Espace Gérant
        </h1>
        <p style={{ color: '#666', fontSize: '1.1rem' }}>
          Cette page est en cours de développement.
        </p>
        <p style={{ color: '#999', marginTop: '1rem' }}>
          Fonctionnalités à venir : gestion du restaurant, statistiques, etc.
        </p>
      </div>
    </div>
  );
}

export default GerantIframe;
