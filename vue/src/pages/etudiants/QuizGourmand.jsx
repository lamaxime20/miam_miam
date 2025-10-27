import { useState, useEffect } from "react";
import Confetti from "react-confetti";

const QuizGourmand = ({ onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false); // 🎊 nouveau

  const questions = [
    { question: "Le riz jollof est originaire de quel pays?", options: ["Nigeria", "Ghana", "Senegal", "Cameroun"], answer: "Senegal" },
    { question: "Quel ingrédient n’est pas traditionnel dans une pizza Margherita ?", options: ["Tomate", "Mozzarella", "Basilic", "Jambon"], answer: "Jambon" },
    { question: "Le pays de la pasta est originaire de quel continent?", options: ["Europe", "Asie", "Afrique", "Océanie"], answer: "Europe" },
    { question: "Quel dessert français est à base de pâte à choux ?", options: ["Éclair", "Crêpe", "Macaron", "Tarte Tatin"], answer: "Éclair" },
    { question: "Quel fromage est utilisé dans le tiramisu ?", options: ["Ricotta", "Mascarpone", "Mozzarella", "Parmesan"], answer: "Mascarpone" },
  ];

  // ⏲ Timer global
  useEffect(() => {
    if (showResult) return;
    if (timeLeft === 0) {
      setShowResult(true);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, showResult]);

  const handleAnswer = (option) => {
    if (selectedOption) return;
    setSelectedOption(option);

    const correct = option === questions[currentQuestion].answer;
    setFeedback(correct ? "correct" : "incorrect");

    if (correct) setScore(score + 1);

    setTimeout(() => {
      const next = currentQuestion + 1;
      if (next < questions.length) {
        setCurrentQuestion(next);
        setSelectedOption(null);
        setFeedback(null);
      } else {
        setShowResult(true);
      }
    }, 1000);
  };

  // Affiche les confettis si score élevé
  useEffect(() => {
    if (showResult && score >= 4) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 7000); // 7s d’effet
      return () => clearTimeout(timer);
    }
  }, [showResult, score]);

  return (
    <div
      className="text-center text-white d-flex flex-column justify-content-center align-items-center min-vh-100"
      style={{
        background: "radial-gradient(circle at center, #111 0%, #000 100%)",
        overflow: "hidden",
        padding: "1rem",
        position: "relative",
      }}
    >
      {/* 🎉 Confettis */}
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} />}

      <h2 className="mb-4 fw-bold display-5 text-warning">🍽️ Quiz Gourmand</h2>

      {!showResult ? (
        <>
          {/* Barre de temps */}
          <div
            className="progress mx-auto mb-4"
            style={{
              width: "80%",
              height: "10px",
              background: "#333",
              borderRadius: "5px",
              overflow: "hidden",
            }}
          >
            <div
              className="progress-bar"
              style={{
                width: `${(timeLeft / 60) * 100}%`,
                backgroundColor: timeLeft <= 10 ? "#ff4d4d" : "#FFD166",
                transition: "width 1s linear",
              }}
            />
          </div>

          <p className="fw-bold mb-3">
            Temps restant :{" "}
            <span style={{ color: timeLeft <= 10 ? "#ff4d4d" : "#FFD166" }}>
              {timeLeft}s
            </span>
          </p>

          {/* Question */}
          <div
            className="question-card mb-4 p-4 rounded-4"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.2)",
              backdropFilter: "blur(4px)",
              width: "90%",
              maxWidth: "600px",
              transition: "all 0.4s ease",
            }}
          >
            <h4 className="mb-3">{questions[currentQuestion].question}</h4>

            <div className="d-flex flex-column align-items-center">
              {questions[currentQuestion].options.map((option, index) => {
                const isSelected = selectedOption === option;
                const isCorrect = option === questions[currentQuestion].answer;
                let btnColor = "btn-outline-warning";

                if (feedback) {
                  if (isSelected && feedback === "correct") btnColor = "btn-success";
                  else if (isSelected && feedback === "incorrect") btnColor = "btn-danger";
                  else if (feedback === "incorrect" && isCorrect) btnColor = "btn-success";
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    className={`btn my-2 px-4 py-2 ${btnColor}`}
                    style={{
                      width: "70%",
                      fontWeight: "600",
                      borderRadius: "30px",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
                    onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <div className="mt-4">
          <h3 className="text-warning fw-bold">
            Résultat : {score}/{questions.length}
          </h3>
          {timeLeft === 0 && <p className="text-danger">⏰ Temps écoulé !</p>}
          <p className="text-secondary mt-3">
            {score >= 4
              ? "Bravo, tu es un vrai chef gourmand 👨‍🍳"
              : "Tu feras mieux la prochaine fois 🍰"}
          </p>
          <button className="btn btn-outline-light mt-3 px-4 py-2" onClick={onBack}>
            ⬅ Retour aux jeux
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizGourmand;