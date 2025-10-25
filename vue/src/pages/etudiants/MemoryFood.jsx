"use client"

import { useState, useEffect } from "react";

const MemoryFood = ({ onBack, onComplete }) => {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [solved, setSolved] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);

  const foodItems = ['🍕', '🍔', '🍟', '🌭', '🍣', '🍦', '🍩', '☕'];

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const gameCards = [...foodItems, ...foodItems]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        flipped: false
      }));
    
    setCards(gameCards);
    setFlipped([]);
    setSolved([]);
    setMoves(0);
    setGameCompleted(false);
  };

  const handleCardClick = (id) => {
    if (flipped.length === 2 || flipped.includes(id) || solved.includes(id)) {
      return;
    }

    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find(card => card.id === firstId);
      const secondCard = cards.find(card => card.id === secondId);

      if (firstCard.emoji === secondCard.emoji) {
        setSolved([...solved, firstId, secondId]);
        setFlipped([]);

        if (solved.length + 2 === cards.length) {
          setGameCompleted(true);
          onComplete(50, "50 points de fidélité");
        }
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  return (
    <div className="text-white">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>🎴 Memory Food</h2>
        <div className="d-flex gap-3">
          <span className="badge bg-warning text-dark">Mouvements: {moves}</span>
          <span className="badge bg-success">Trouvés: {solved.length / 2}/{foodItems.length}</span>
        </div>
      </div>

      {gameCompleted ? (
        <div className="text-center">
          <div className="card bg-dark border-warning p-5 mb-4">
            <div className="display-1 mb-3">🎉</div>
            <h3 className="text-warning">Félicitations !</h3>
            <p>Vous avez terminé le jeu en {moves} mouvements !</p>
            <div className="mt-4 p-3 bg-success bg-opacity-25 rounded">
              <h5 className="text-success">🎁 Récompense gagnée !</h5>
              <p className="h4 mb-0">+ 50 points de fidélité</p>
            </div>
          </div>
          <div className="d-flex gap-2 justify-content-center">
            <button className="btn btn-warning" onClick={initializeGame}>
              Rejouer
            </button>
            <button className="btn btn-outline-warning" onClick={onBack}>
              Retour aux jeux
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="row g-3 mb-4">
            {cards.map(card => (
              <div key={card.id} className="col-3 col-sm-2">
                <div 
                  className={`card aspect-ratio-1 d-flex align-items-center justify-content-center ${
                    flipped.includes(card.id) || solved.includes(card.id) 
                      ? 'bg-warning' 
                      : 'bg-secondary'
                  }`}
                  style={{ 
                    height: '80px', 
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onClick={() => handleCardClick(card.id)}
                >
                  <span className="display-6">
                    {(flipped.includes(card.id) || solved.includes(card.id)) 
                      ? card.emoji 
                      : '❓'
                    }
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="d-flex gap-2 justify-content-center">
            <button className="btn btn-warning" onClick={initializeGame}>
              Nouvelle partie
            </button>
            <button className="btn btn-outline-warning" onClick={onBack}>
              Retour aux jeux
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MemoryFood;