"use client"

import { useEffect, useMemo, useState } from "react";
import { Star, Gift, Users, Copy, Check } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import { getAuthInfo, recupererToken, getUserByEmail } from "../../../../services/user";

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
  const [clientId, setClientId] = useState(null); // ✅ Changé en état React

  const auth = useMemo(() => getAuthInfo(), []);
  const restaurantId = auth?.restaurant ? parseInt(auth.restaurant, 10) : undefined;
  const token = useMemo(() => recupererToken(), []);

  useEffect(() => {
    async function bootstrap() {
      try {
        setLoading(true); 
        setError(null);
        
        // Vérifier si l'utilisateur est connecté
        const authInfo = getAuthInfo();
        console.log("Auth info:", authInfo);
        
        if (!authInfo || !authInfo.display_name) {
          throw new Error("Aucun utilisateur connecté");
        }

        const emailClient = authInfo.display_name;
        console.log("Email client:", emailClient);
        
        // Récupérer les infos du client
        const client = await getUserByEmail(emailClient);
        console.log("Client récupéré:", client);
        
        if (!client || !client.id_user) {
          throw new Error("Client non trouvé dans la base de données");
        }

        // ✅ Stocker l'ID client dans l'état React
        setClientId(client.id_user);
        console.log("ID Client défini:", client.id_user);

        // Charger les données de fidélité
        await Promise.all([
          fetchPoints(client.id_user).then((p) => {
            console.log("Points récupérés:", p);
            setCurrentPoints(p);
          }),
          fetchReferralDetails(client.id_user).then((d) => {
            console.log("Détails parrainage:", d);
            if (d?.referral?.code) setReferralCode(d.referral.code);
            if (Array.isArray(d?.referrals)) setReferrals(d.referrals);
            if (typeof d?.referral?.total_points === 'number') setTotalReferralPoints(d.referral.total_points);
          })
        ]);
        
      } catch (e) {
        console.error("Erreur détaillée:", e);
        setError(`Impossible de charger les données de fidélité: ${e.message}`);
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
    if (clientId && restaurantId) {
      const key = makeDailyBonusKey(clientId, restaurantId);
      if (key && localStorage.getItem(key) === '1') {
        setBonusClaimedToday(true);
      }
    }
  }, [clientId, restaurantId]);

  const copyReferralCode = () => {
    if (!linkParrainage) return;
    navigator.clipboard.writeText(linkParrainage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onClaimBonus = async () => {
    if (!clientId || !restaurantId) {
      setError("Client ou restaurant non identifié");
      return;
    }

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
      console.error("Erreur bonus:", e);
      setError("Échec de la récupération du bonus");
    }
  };

  const progressToNextReward = rewards.find((r) => r.points > currentPoints);
  const progress = progressToNextReward ? (currentPoints / progressToNextReward.points) * 100 : 100;

  if (loading) {
    return (
      <div className="container py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <span className="ms-3">Chargement de vos données de fidélité...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger" role="alert">
          <h5>Erreur</h5>
          <p>{error}</p>
          <div className="mt-2">
            <button 
              className="btn btn-warning btn-sm" 
              onClick={() => window.location.reload()}
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!clientId) {
    return (
      <div className="container py-4">
        <div className="alert alert-warning" role="alert">
          <h5>Connexion requise</h5>
          <p>Veuillez vous connecter pour accéder à votre programme de fidélité.</p>
        </div>
      </div>
    );
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
            <button 
              onClick={onClaimBonus} 
              disabled={bonusClaimedToday || !restaurantId || !clientId} 
              className="btn btn-light btn-sm text-orange-600 w-100"
            >
              {bonusClaimedToday ? "Déjà récupéré aujourd'hui" : "Récupérer 1 point"}
            </button>
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
            <div className="bg-white px-3 py-2 rounded fw-bold text-break" style={{ maxWidth: '300px' }}>
              {linkParrainage || "Chargement..."}
            </div>
            <button 
              onClick={copyReferralCode} 
              disabled={!linkParrainage} 
              className="btn btn-warning btn-sm d-flex align-items-center gap-1"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />} 
              {copied ? "Copié !" : "Copier"}
            </button>
          </div>
          <small className="text-muted">Partagez ce lien avec vos amis pour gagner des points</small>
        </div>

        <h6>Vos filleuls ({referrals.length})</h6>
        <div className="list-group">
          {referrals.length === 0 ? (
            <div className="list-group-item text-center text-muted py-4">
              Aucun filleul pour le moment
            </div>
          ) : (
            referrals.map((r, idx) => (
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
            ))
          )}
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
  try {
    console.log(`Fetching points for client ${clientId}`);
    const res = await fetch(`${API_URL}api/client/${clientId}/points`);
    console.log("Points response status:", res.status);
    
    if (!res.ok) {
      console.error("Points fetch failed:", res.status, res.statusText);
      return 0;
    }
    
    const data = await res.json();
    console.log("Points data:", data);
    return typeof data?.points_fidelite === 'number' ? data.points_fidelite : 0;
  } catch (error) {
    console.error("Erreur fetchPoints:", error);
    return 0;
  }
}

async function fetchReferralDetails(clientId) {
  try {
    console.log(`Fetching referral details for client ${clientId}`);
    const res = await fetch(`${API_URL}api/client/${clientId}/referral-details`);
    console.log("Referral response status:", res.status);
    
    if (!res.ok) {
      console.error("Referral fetch failed:", res.status, res.statusText);
      return { referral: null, referrals: [] };
    }
    
    const data = await res.json();
    console.log("Referral data:", data);
    return data;
  } catch (error) {
    console.error("Erreur fetchReferralDetails:", error);
    return { referral: null, referrals: [] };
  }
}

async function claimDailyBonusAndRefresh(clientId, restaurantId, token) {
  try {
    console.log(`Claiming bonus for client ${clientId}, restaurant ${restaurantId}`);
    const res = await fetch(`${API_URL}api/client/${clientId}/claim-daily-bonus`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ restaurant_id: restaurantId })
    });
    
    const data = await res.json().catch(() => ({}));
    console.log("Bonus claim response:", data);
    
    if (!res.ok) {
      return { success: false, message: data?.message || 'Erreur' };
    }
    return { success: !!data.success, new_points: data.new_points };
  } catch (e) {
    console.error("Erreur claimDailyBonusAndRefresh:", e);
    return { success: false, message: 'Erreur réseau' };
  }
}