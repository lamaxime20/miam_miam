"use client"

import { useEffect, useMemo, useState } from "react";
import { Star, Gift, Users, Copy, Check } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import { getAuthInfo, recupererToken } from "../../../../services/user";

const API_URL = import.meta.env.VITE_API_URL;
const URL_React = "http://localhost:5173/";

const rewards = [
  { points: 500, reward: "Boisson gratuite", description: "Une boisson de votre choix offerte", icon: "🥤" },
  { points: 1000, reward: "Dessert gratuit", description: "Un dessert au choix", icon: "🍰" },
  { points: 1500, reward: "Plat gratuit", description: "Un plat principal offert", icon: "🍕" },
  { points: 2500, reward: "Menu complet", description: "Menu entrée + plat + dessert", icon: "🍽️" },
  { points: 5000, reward: "VIP Gold", description: "Statut VIP pendant 1 mois", icon: "👑" },
];

function Fidelite() {
  const [currentPoints, setCurrentPoints] = useState(0);
  const [referralCode, setReferralCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [linkParrainage, setLinkParrainage] = useState("");
  const [referrals, setReferrals] = useState([]);
  const [totalReferralPoints, setTotalReferralPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bonusClaimedToday, setBonusClaimedToday] = useState(false);

  const auth = useMemo(() => getAuthInfo(), []);
  const restaurantId = auth?.restaurant ? parseInt(auth.restaurant, 10) : undefined; // ne pas mettre 1 par défaut
  const token = useMemo(() => recupererToken(), []);

  // ID du client (à adapter selon votre logique d'authentification)
  const clientId = 1;

  useEffect(() => {
    async function bootstrap() {
      try {
        setLoading(true);
        await Promise.all([
          fetchPoints(clientId).then((p) => setCurrentPoints(p)),
          fetchReferralDetails(clientId).then((d) => {
            if (d?.referral?.code) setReferralCode(d.referral.code);
            if (Array.isArray(d?.referrals)) setReferrals(d.referrals);
            if (typeof d?.referral?.total_points === 'number') setTotalReferralPoints(d.referral.total_points);
          })
        ]);
      } catch (e) {
        setError("Impossible de charger les données de fidélité");
      } finally {
        setLoading(false);
      }
    }
    bootstrap();
  }, []);

  useEffect(() => {
    if (referralCode) {
      setLinkParrainage(URL_React + "signup/" + referralCode);
    }
  }, [referralCode]);

  useEffect(() => {
    const key = makeDailyBonusKey(clientId, restaurantId);
    if (key && localStorage.getItem(key) === '1') {
      setBonusClaimedToday(true);
    }
  }, [clientId, restaurantId]);

  const copyReferralCode = () => {
    if (!linkParrainage) return;
    navigator.clipboard.writeText(linkParrainage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onClaimBonus = async () => {
    try {
      const res = await claimDailyBonusAndRefresh(clientId, restaurantId, token);
      if (res.success) {
        setCurrentPoints(res.new_points);
        const key = makeDailyBonusKey(clientId, restaurantId);
        if (key) localStorage.setItem(key, '1');
        setBonusClaimedToday(true);
      } else if (res.message) {
        if (res.message.toLowerCase().includes('déjà')) {
          const key = makeDailyBonusKey(clientId, restaurantId);
          if (key) localStorage.setItem(key, '1');
          setBonusClaimedToday(true);
        }
        setError(res.message);
      }
    } catch (e) {
      setError("Échec de la récupération du bonus");
    }
  };

  const progressToNextReward = rewards.find((r) => r.points > currentPoints);
  const progress = progressToNextReward ? (currentPoints / progressToNextReward.points) * 100 : 100;

  if (loading) {
    return <div className="container py-4">Chargement...</div>;
  }
  if (error) {
    return <div className="container py-4 text-danger">{error}</div>;
  }

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
          <div className="progress" role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">
            <div className="progress-bar bg-warning" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-4">
          <div className="card p-3 mb-3">
            <h5>Comment gagner des points ?</h5>
            <ul className="list-group list-group-flush">
              <li className="list-group-item d-flex align-items-center gap-2"><span>🛒</span><div><div>Commandes</div><small className="text-muted">1 point par 1000 FCFA dépensés</small></div></li>
              <li className="list-group-item d-flex align-items-center gap-2"><Users size={18} /><div><div>Parrainage</div><small className="text-muted">5 points par filleul</small></div></li>
              <li className="list-group-item d-flex align-items-center gap-2"><Star size={18} /><div><div>Avis</div><small className="text-muted">1 point par avis laissé</small></div></li>
              <li className="list-group-item d-flex align-items-center gap-2"><Gift size={18} /><div><div>Bonus quotidien</div><small className="text-muted">1 point par jour de connexion</small></div></li>
            </ul>
          </div>

          <div className="card text-center p-3 text-black mb-3" style={{ background: "linear-gradient(to right, #f97316, #f97316cc)" }}>
            <Gift size={32} className="mb-2" />
            <h6>Bonus du jour</h6>
            <p className="small">Connectez-vous chaque jour pour gagner des points</p>
            <button onClick={onClaimBonus} disabled={bonusClaimedToday || !restaurantId} className="btn btn-light btn-sm text-orange-600 w-100">{bonusClaimedToday ? "Déjà récupéré aujourd'hui" : "Récupérer 1 point"}</button>
          </div>
        </div>
      </div>

      <div className="card p-3 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5>Programme de Parrainage</h5>
            <small className="text-muted">Invitez vos amis et gagnez 5 points par filleul</small>
          </div>
          <div className="text-end">
            <small className="text-muted">Total gagné</small>
            <div className="text-warning">{totalReferralPoints} points</div>
          </div>
        </div>

        <div className="card p-3 mb-3 bg-light text-center">
          <div className="mb-2">Votre lien de parrainage</div>
          <div className="d-flex justify-content-center gap-2 mb-2">
            <div className="bg-white px-3 py-2 rounded fw-bold">{linkParrainage || "Chargement..."}</div>
            <button onClick={copyReferralCode} disabled={!linkParrainage} className="btn btn-warning btn-sm d-flex align-items-center gap-1">
              {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Copié !" : "Copier"}
            </button>
          </div>
          <small className="text-muted">Partagez ce lien avec vos amis pour gagner des points</small>
        </div>

        <h6>Vos filleuls ({referrals.length})</h6>
        <div className="list-group">
          {referrals.map((r, idx) => (
            <div key={idx} className="list-group-item d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-warning text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                  {(r.nom || r.name || "?").toString().split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <div>{r.nom || r.name || "Client"}</div>
                  {r.date && <small className="text-muted">Inscrit le {r.date}</small>}
                </div>
              </div>
              <div className="text-end">
                {r.status === "active" || r.actif ? (
                  <>
                    <div className="text-success mb-1">✓ Actif</div>
                    {typeof r.points === 'number' && <div className="text-warning">+{r.points} points</div>}
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

function makeDailyBonusKey(clientId, restaurantId) {
  if (!clientId || !restaurantId) return null;
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const dateStr = `${y}-${m}-${day}`;
  return `daily_bonus_claimed:${clientId}:${restaurantId}:${dateStr}`;
}

// ===== Helpers API
async function fetchPoints(clientId) {
  const res = await fetch(`${API_URL}api/client/${clientId}/points`);
  if (!res.ok) return 0;
  const data = await res.json();
  return typeof data?.points_fidelite === 'number' ? data.points_fidelite : 0;
}

async function fetchReferralDetails(clientId) {
  const res = await fetch(`${API_URL}api/client/${clientId}/referral-details`);
  if (!res.ok) return { referral: null, referrals: [] };
  return res.json();
}

async function claimDailyBonusAndRefresh(clientId, restaurantId, token) {
  try {
    const res = await fetch(`${API_URL}api/client/${clientId}/claim-daily-bonus`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ restaurant_id: restaurantId })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, message: data?.message || 'Erreur' };
    }
    return { success: !!data.success, new_points: data.new_points };
  } catch (e) {
    return { success: false, message: 'Erreur réseau' };
  }
}
