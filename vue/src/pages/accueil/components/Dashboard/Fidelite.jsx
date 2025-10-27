"use client"

import { useState, useEffect } from "react";
import { Star, Gift, Users, Copy, Check } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import { loadFideliteData, claimDailyBonusAndRefresh } from "../../../../services/Fidelite.js";

const rewards = [
  { points: 500, reward: "Boisson gratuite", description: "Une boisson de votre choix offerte", icon: "🥤" },
  { points: 1000, reward: "Dessert gratuit", description: "Un dessert au choix", icon: "🍰" },
  { points: 1500, reward: "Plat gratuit", description: "Un plat principal offert", icon: "🍕" },
  { points: 2500, reward: "Menu complet", description: "Menu entrée + plat + dessert", icon: "🍽️" },
  { points: 5000, reward: "VIP Gold", description: "Statut VIP pendant 1 mois", icon: "👑" },
];


function Fidelite() {
  const Vue_lien = "http://localhost:5173/";
  const [currentPoints, setCurrentPoints] = useState(0);
  const [referralCode, setReferralCode] = useState("");
  const [totalReferralPoints, setTotalReferralPoints] = useState(0);
  const [referralHistory, setReferralHistory] = useState([]);
  const [copied, setCopied] = useState(false);

  const clientId = 1;
  useEffect(() => {
    let mounted = true;
    (async () => {
      const data = await loadFideliteData(clientId);
      if (!mounted) return;
      setCurrentPoints(data.currentPoints);
      setReferralCode(Vue_lien + data.referralCode);
      setTotalReferralPoints(data.totalReferralPoints);
      setReferralHistory(data.referralHistory);
    })();
    return () => { mounted = false; };
  }, [clientId]);

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onClaimBonus = async () => {
    const res = await claimDailyBonusAndRefresh(clientId, 1);
    if (res.success) {
      setCurrentPoints(res.currentPoints);
    }
  };

  const progressToNextReward = rewards.find((r) => r.points > currentPoints);
  const progress = progressToNextReward ? (currentPoints / progressToNextReward.points) * 100 : 100;

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h1>Fidélité & Parrainage</h1>
        <p className="text-muted">Gagnez des points et parrainez vos amis</p>
      </div>

      <div className="card mb-4 bg-gradient text-black p-4" style={{ background: "linear-gradient(to right, #e0bc7fff, #c4b498)" }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <small className="text-black-50">Vos Points de Fidélité</small>
            <div className="d-flex align-items-center">
              <h2 className="me-2">{currentPoints}</h2>
              <Star className="text-white" size={24} />
            </div>
          </div>
          <div className="text-end">
            <small className="text-black-50">Niveau</small>
            <span className="badge bg-light text-dark">Gold</span>
          </div>
        </div>

        {progressToNextReward && (
          <>
            <div className="d-flex justify-content-between text-black-50 mb-2">
              <span>Prochaine récompense: {progressToNextReward.reward}</span>
              <span>{progressToNextReward.points - currentPoints} points restants</span>
            </div>
            <div className="progress" style={{ height: "10px" }}>
              <div className="progress-bar bg-yellow" role="progressbar" style={{ width: `${progress}%` }}></div>
            </div>
          </>
        )}
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-4">
          <div className="card p-3 mb-3">
            <h5>Comment gagner des points ?</h5>
            <ul className="list-group list-group-flush">
              <li className="list-group-item d-flex align-items-center gap-2"><span>🛒</span><div><div>Commandes</div><small className="text-muted">1 point par 10 FCFA dépensés</small></div></li>
              <li className="list-group-item d-flex align-items-center gap-2"><Users size={18} /><div><div>Parrainage</div><small className="text-muted">200 points par filleul</small></div></li>
              <li className="list-group-item d-flex align-items-center gap-2"><Star size={18} /><div><div>Avis</div><small className="text-muted">50 points par avis laissé</small></div></li>
              <li className="list-group-item d-flex align-items-center gap-2"><Gift size={18} /><div><div>Bonus quotidien</div><small className="text-muted">10 points par jour de connexion</small></div></li>
            </ul>
          </div>

          <div className="card text-center p-3 text-black mb-3" style={{ background: "linear-gradient(to right, #f97316, #f97316cc)" }}>
            <Gift size={32} className="mb-2" />
            <h6>Bonus du jour</h6>
            <p className="small">Connectez-vous chaque jour pour gagner des points</p>
            <button className="btn btn-light btn-sm text-orange-600 w-100" onClick={onClaimBonus}>Récupérer 10 points</button>
          </div>
        </div>
      </div>

      <div className="card p-3 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5>Programme de Parrainage</h5>
            <small className="text-muted">Invitez vos amis et gagnez 200 points par filleul</small>
          </div>
          <div className="text-end">
            <small className="text-muted">Total gagné</small>
            <div className="text-warning">{totalReferralPoints.toLocaleString()} points</div>
          </div>
        </div>

        <div className="card p-3 mb-3 bg-light text-center">
          <div className="mb-2">Votre lien de Parrainage</div>
          <div className="d-flex justify-content-center gap-2 mb-2">
            <div className="bg-white px-3 py-2 rounded fw-bold">{referralCode}</div>
            <button onClick={copyReferralCode} className="btn btn-warning btn-sm d-flex align-items-center gap-1">
              {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Copié !" : "Copier"}
            </button>
          </div>
          <small className="text-muted">Partagez ce lien avec vos amis pour gagner des points</small>
        </div>

        <h6>Vos filleuls ({referralHistory.length})</h6>
        <div className="list-group">
          {referralHistory.map((referral, idx) => (
            <div key={idx} className="list-group-item d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-warning text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                  {referral.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <div>{referral.name}</div>
                  <small className="text-muted">Inscrit le {referral.date}</small>
                </div>
              </div>
              <div className="text-end">
                {referral.status === "active" ? (
                  <>
                    <div className="text-success mb-1">✓ Actif</div>
                    <div className="text-warning">+{referral.points} points</div>
                  </>
                ) : (
                  <div className="text-warning">En attente</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Fidelite;
