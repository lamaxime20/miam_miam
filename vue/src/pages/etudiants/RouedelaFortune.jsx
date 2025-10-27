import { useState } from "react";
import { Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

const RouedelaFortune = ({ onBack, onComplete }) => {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [prize, setPrize] = useState(null);
  const [hasPlayed, setHasPlayed] = useState(false);

  const segments = [
    { color: '#FF6B6B', text: '10%', value: 10, discount: true },
    { color: '#4ECDC4', text: 'RIEN', value: 0 },
    { color: '#FFD166', text: '25%', value: 25, discount: true },
    { color: '#06D6A0', text: '5%', value: 5, discount: true },
    { color: '#118AB2', text: '50%', value: 50, discount: true },
    { color: '#073B4C', text: '15%', value: 15, discount: true },
    { color: '#EF476F', text: 'RIEN', value: 0 },
    { color: '#FFD166', text: '30%', value: 30, discount: true },
  ];

  // 🎊 Fonction confettis
  const launchConfetti = () => {
    const duration = 2 * 1000; // 2 secondes
    const end = Date.now() + duration;

    const frame = () => {
      // Effet en rafale
      confetti({
        particleCount: 5,
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
        colors: ['#FFD166', '#FF6B6B', '#06D6A0', '#4ECDC4'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const spinWheel = () => {
    if (isSpinning || hasPlayed) return;
    setIsSpinning(true);
    setPrize(null);

    const spins = 5 + Math.random() * 5;
    const degrees = 360 * spins + Math.floor(Math.random() * 360);
    setRotation(rotation + degrees);

    setTimeout(() => {
      const segmentIndex = Math.floor(((360 - (degrees % 360)) / 360) * segments.length) % segments.length;
      const wonPrize = segments[segmentIndex];
      setPrize(wonPrize);
      setIsSpinning(false);
      setHasPlayed(true);

      if (wonPrize.value > 0) {
        // 🎉 Confettis ici
        launchConfetti();
        onComplete(wonPrize.value, `Réduction de ${wonPrize.value}%`);
      }
    }, 4000);
  };

  return (
    <div
      className="text-center text-white min-vh-100 d-flex flex-column justify-content-center align-items-center"
      style={{
        background: 'radial-gradient(circle at center, #111 0%, #000 100%)',
        overflow: 'hidden',
      }}
    >
      <h2 className="mb-4 fw-bold display-5 text-warning d-flex align-items-center gap-2">
        <Sparkles className="text-warning" /> Roue de la Fortune
      </h2>

      <div className="position-relative d-inline-block mb-5">
        <div
          className="wheel-container position-relative"
          style={{
            width: '340px',
            height: '340px',
            transition: 'transform 4s cubic-bezier(0.25, 1, 0.3, 1)',
            transform: `rotate(${rotation}deg)`,
            boxShadow:
              '0 0 50px rgba(255, 215, 0, 0.4), 0 0 100px rgba(255, 255, 255, 0.2)',
          }}
        >
          {/* Roue colorée */}
          <div
            className="position-absolute w-100 h-100 rounded-circle"
            style={{
              background:
                'conic-gradient(from 0deg, ' +
                segments
                  .map((seg, i) => {
                    const startAngle = (360 / segments.length) * i;
                    const endAngle = (360 / segments.length) * (i + 1);
                    return `${seg.color} ${startAngle}deg ${endAngle}deg`;
                  })
                  .join(', ') +
                ')',
              borderRadius: '50%',
              filter: 'brightness(1.1)',
            }}
          />

          {/* Texte segments */}
          {segments.map((segment, index) => {
            const segmentAngle = 360 / segments.length;
            const startAngle = segmentAngle * index;
            const middleAngle = startAngle + segmentAngle / 2;
            const textDistance = 100;
            return (
              <div
                key={index}
                className="position-absolute top-50 start-50"
                style={{
                  transform: `rotate(${middleAngle}deg) translateY(-${textDistance}px) rotate(-${middleAngle}deg)`,
                  transformOrigin: 'center',
                  color: 'white',
                  fontWeight: '700',
                  fontSize: '17px',
                  textShadow: '0 0 6px rgba(0,0,0,0.9)',
                }}
              >
                {segment.text}
              </div>
            );
          })}

          {/* Lignes de séparation */}
          {segments.map((_, index) => {
            const angle = (360 / segments.length) * index;
            return (
              <div
                key={`line-${index}`}
                className="position-absolute top-0 start-50"
                style={{
                  height: '50%',
                  width: '2px',
                  background: 'rgba(255,255,255,0.8)',
                  transform: `rotate(${angle}deg)`,
                  transformOrigin: 'bottom center',
                }}
              />
            );
          })}
        </div>

        {/* Pointeur */}
        <div
          className="position-absolute top-0 start-50 translate-middle"
          style={{
            width: '0',
            height: '0',
            borderLeft: '20px solid transparent',
            borderRight: '20px solid transparent',
            borderTop: '35px solid #FFD166',
            zIndex: 10,
            filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.5))',
          }}
        />
      </div>

      {/* Boutons */}
      {!hasPlayed ? (
        <button
          className="btn btn-lg px-5 py-3"
          style={{
            background: 'linear-gradient(90deg, #FFD166, #FF6B6B)',
            border: 'none',
            color: '#000',
            fontWeight: '700',
            borderRadius: '50px',
            boxShadow: '0 0 20px rgba(255, 215, 102, 0.5)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          }}
          onClick={spinWheel}
          disabled={isSpinning}
          onMouseEnter={(e) => (e.target.style.transform = 'scale(1.1)')}
          onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
        >
          {isSpinning ? '🎯 La roue tourne...' : '🎡 Tourner la roue !'}
        </button>
      ) : (
        <button className="btn btn-outline-light btn-lg px-5 mt-3" onClick={onBack}>
          ⬅ Retour aux jeux
        </button>
      )}

      {/* Résultat */}
      {prize && (
        <div
          className="mt-5 p-4 rounded-4"
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(6px)',
            width: '90%',
            maxWidth: '400px',
            animation: 'fadeIn 1s ease-in',
          }}
        >
          <h3 className="text-warning fw-bold mb-3">
            {prize.value > 0 ? '🎉 Félicitations !' : '😔 Dommage...'}
          </h3>
          <p className="fs-5">
            {prize.value > 0
              ? `Vous avez gagné ${prize.text} de réduction !`
              : "Vous n'avez rien remporté cette fois."}
          </p>
          {prize.value > 0 && (
            <div className="mt-3 p-3 rounded bg-dark bg-opacity-50">
              <strong>Votre code promo :</strong>
              <br />
              <code className="fs-4 text-warning">MIAM{prize.value}</code>
            </div>
          )}
          <p className="text-secondary mt-3">💡 Code valable 24h</p>
        </div>
      )}

      <style jsx>{`
        .wheel-container {
          border: 4px solid #fff;
          border-radius: 50%;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.4);
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default RouedelaFortune;
