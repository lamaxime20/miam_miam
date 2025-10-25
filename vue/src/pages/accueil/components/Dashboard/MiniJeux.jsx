"use client"

import { useState } from "react";
import { FaGamepad, FaGift, FaTrophy, FaBolt, FaCalendarAlt, FaStar, FaClock } from "react-icons/fa";
import RouedelaFortune from "../../../etudiants/RouedelaFortune.jsx";
import QuizGourmand from "../../../etudiants/QuizGourmand.jsx";
import MemoryFood from "../../../etudiants/MemoryFood.jsx";

const games = [
  { id: 1, name: 'Roue de la Fortune', description: 'Tournez la roue et gagnez des réductions', icon: '🎡', prize: 'Jusqu\'à 50% de réduction', available: true, nextPlay: null },
  { id: 2, name: 'Quiz Gourmand', description: 'Testez vos connaissances culinaires', icon: '🧠', prize: '100 points de fidélité', available: true, nextPlay: null },
  { id: 3, name: 'Carte à Gratter', description: 'Grattez et découvrez votre gain', icon: '🎫', prize: 'Plat gratuit possible', available: false, nextPlay: '22 Oct 2025, 14:00' },
  { id: 4, name: 'Memory Food', description: 'Retrouvez les paires de plats', icon: '🎴', prize: '50 points de fidélité', available: true, nextPlay: null },
];

const events = [
  { id: 1, name: 'Grand Concours Octobre', description: 'Participez pour gagner un menu VIP pour 2 personnes', image: 'https://images.unsplash.com/photo-1563245738-9169ff58eccf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', endDate: '31 Oct 2025', participants: 234, status: 'active' },
  { id: 2, name: 'Happy Hour Digital', description: 'Profitez de -30% tous les jours de 14h à 16h', image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', endDate: 'Permanent', participants: null, status: 'active' },
  { id: 3, name: 'Menu Étudiant', description: 'Menu spécial étudiant à prix réduit', image: 'https://images.unsplash.com/photo-1747852628136-e612ace24a23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', endDate: '31 Mars 2026', participants: null, status: 'active' },
];

const achievements = [
  { name: 'Premier pas', description: 'Première commande', unlocked: true, icon: '🎯' },
  { name: 'Gourmet', description: '10 commandes', unlocked: true, icon: '🍽️' },
  { name: 'VIP', description: '50 commandes', unlocked: true, icon: '👑' },
  { name: 'Ambassadeur', description: '5 parrainages', unlocked: true, icon: '🌟' },
  { name: 'Chanceux', description: 'Gagner le gros lot', unlocked: false, icon: '🍀' },
  { name: 'Expert', description: 'Score parfait au quiz', unlocked: false, icon: '🎓' },
];

export function MiniJeux() {
  const [selectedGame, setSelectedGame] = useState(null); // 'wheel' | 'quiz' | 'memory'
  const [spinning, setSpinning] = useState(false);
  const [reward, setReward] = useState(null);

  const playGame = (gameId) => {
    // 1: Roue, 2: Quiz, 4: Memory
    if (gameId === 1) setSelectedGame('wheel');
    if (gameId === 2) setSelectedGame('quiz');
    if (gameId === 4) setSelectedGame('memory');
  };

  const handleBack = () => { setSelectedGame(null); setReward(null); };

  const handleComplete = (value, label) => { setReward({ value, label }); };

  const renderSelected = () => {
    if (selectedGame === 'wheel') return <RouedelaFortune onBack={handleBack} onComplete={handleComplete} />;
    if (selectedGame === 'quiz') return <QuizGourmand onBack={handleBack} />;
    if (selectedGame === 'memory') return <MemoryFood onBack={handleBack} onComplete={handleComplete} />;
    return null;
  };

  if (selectedGame) {
    return (
      <div className="container py-5" style={{ backgroundColor: "#000000", minHeight: "100vh" }}>
        {renderSelected()}
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ backgroundColor: "#000000", minHeight: "100vh" }}>
      <h1 className="text-white mb-3">Mini-jeux & Événements</h1>
      <p className="text-white-50 mb-5">Jouez et gagnez des récompenses</p>

      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card text-center shadow-sm p-3" style={{ backgroundColor: "#ffffff" }}>
            <FaGamepad size={32} className="mb-2 text-warning" />
            <h6>Parties jouées</h6>
            <strong>47</strong>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center shadow-sm p-3">
            <FaGift size={32} className="mb-2 text-success" />
            <h6>Récompenses</h6>
            <strong>12</strong>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center shadow-sm p-3">
            <FaTrophy size={32} className="mb-2 text-warning" />
            <h6>Succès</h6>
            <strong>4/6</strong>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center shadow-sm p-3">
            <FaBolt size={32} className="mb-2 text-info" />
            <h6>Streak</h6>
            <strong>7 jours</strong>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-lg-8">
          <h2 className="text-white mb-3">Jeux disponibles</h2>
          <div className="row g-3">
            {games.map((game) => (
              <div key={game.id} className="col-md-6">
                <div className={`card p-3 shadow-sm ${!game.available ? "opacity-50" : ""}`}>
                  <div className="text-center mb-3">
                    <div className="display-1">{game.icon}</div>
                    <h5>{game.name}</h5>
                    <p className="text-muted">{game.description}</p>
                  </div>
                  <div className="bg-light p-2 rounded mb-3 text-center">
                    <FaGift className="me-1 text-warning" />
                    {game.prize}
                  </div>
                  {game.available ? (
                    <button className="btn w-100" style={{ backgroundColor: "#cfbd97", color: "#000000" }} onClick={() => playGame(game.id)}>
                      Jouer maintenant
                    </button>
                  ) : (
                    <div className="text-center text-muted">
                      <FaClock className="mb-1" /> Disponible dans <br /> {game.nextPlay}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-lg-4">
          <h2 className="text-white mb-3">Succès</h2>
          <div className="card p-3 shadow-sm">
            {achievements.map((ach, i) => (
              <div key={i} className={`d-flex align-items-center mb-2 p-2 rounded ${ach.unlocked ? "bg-warning bg-opacity-25" : "bg-light text-muted"}`}>
                <div className="display-6 me-2">{ach.icon}</div>
                <div className="flex-grow-1">
                  <div>{ach.name}</div>
                  <small>{ach.description}</small>
                </div>
                {ach.unlocked && <FaStar className="text-success" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="text-white">Événements en cours</h2>
          <button className="btn btn-outline-warning">
            <FaCalendarAlt className="me-1" /> Voir le calendrier
          </button>
        </div>
        <div className="row g-3">
          {events.map((event) => (
            <div key={event.id} className="col-md-4">
              <div className="card shadow-sm h-100">
                <img src={event.image} alt={event.name} className="card-img-top" />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{event.name}</h5>
                  <p className="card-text text-muted">{event.description}</p>
                  <small className="text-muted mb-2">Jusqu'au {event.endDate}</small>
                  {event.participants && <small className="text-muted mb-2">{event.participants} participants</small>}
                  <button className="btn mt-auto" style={{ backgroundColor: "#cfbd97", color: "#000000" }}>Participer</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Affichage d'une bannière de récompense après retour d'un jeu */}
      {reward && (
        <div className="alert alert-success mt-4" role="alert">
          🎁 Récompense: {reward.label}
        </div>
      )}
    </div>
  );
}

export default MiniJeux;
