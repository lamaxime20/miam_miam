import React, { useEffect, useMemo, useState } from 'react';
import CountUp from '../components/common/CountUp';
import { getOrders, saveOrders } from '../services/mockApi';
import { 
  getCommandesEmployeur,
  validerCommandeNonLue,
  validerCommandeEnPreparation,
  annulerCommande,
  doitAfficherBoutons,
  getConfigBoutonValider,
  updateCommandeStatus,
  fetchCommandes as fetchCommandesService
} from './commande';
import { getEmployerDashboardKpis } from '../../../services/employe';
import ChoixLivreurCommande from '../../../components/choixLivreurCommande';
import CommandeFlottant from '../../../components/commandeFlottant';
import DetailsCommandeEmploye from '../../../components/detailsCommandeEmploye';
import { Spinner } from 'react-bootstrap';

const IconBag = (props) => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M6 2l.34 2H18l.66-2"/><path d="M3 6h18l-1.5 14a2 2 0 0 1-2 2H6.5a2 2 0 0 1-2-2L3 6z"/><path d="M9 10v2"/><path d="M15 10v2"/>
  </svg>
);
const IconPlus = (props) => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IconCheck = (props) => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M20 6L9 17l-5-5"/>
  </svg>
);
const IconX = (props) => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconEye = (props) => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

export default function Orders() {
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [channel, setChannel] = useState('all');
  const [flash, setFlash] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLivreurModalOpen, setIsLivreurModalOpen] = useState(false);
  const [selectedCommande, setSelectedCommande] = useState(null);

  const [rows, setRows] = useState([]);
  const [commandes, setCommandes] = useState([]); // État pour les nouvelles commandes
  const [loading, setLoading] = useState(true); // État de chargement
  const [employerKpis, setEmployerKpis] = useState({ daily_orders_count: 0, daily_revenue: 0, open_complaints_count: 0, active_employees_count: 0 });
  const defaultRows = [];

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fonction pour rafraîchir les commandes
  const fetchCommandes = async () => {
    setLoading(true);
    try {
      const data = await fetchCommandesService(status);
      setCommandes(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des commandes :", error);
      setFlashMessage("Erreur lors du chargement des commandes");
    } finally {
      setLoading(false);
    }
  };

  // Charger les commandes au montage et quand le statut change
  useEffect(() => {
    fetchCommandes();
  }, [status]);

  // Charger les KPIs du backend
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const kpis = await getEmployerDashboardKpis();
        if (mounted && kpis) setEmployerKpis(kpis);
      } catch (e) {
        // getEmployerDashboardKpis gère déjà les erreurs et renvoie des valeurs par défaut
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    getOrders(defaultRows).then(data => {
      if (!mounted) return;
      const demoNames = new Set(['Alice','Bob','Claire','David','Emma','Fatou','Gaston','Hawa','Ibrahim','Julie']);
      const hasDemo = (data||[]).some(r => demoNames.has(r.customer));
      if (hasDemo) {
        const cleaned = data.filter(r => !demoNames.has(r.customer));
        setRows(cleaned);
        saveOrders(cleaned);
      } else {
        setRows(data);
      }
    });
    return () => { mounted = false; };
  }, []);

  const money = (n)=> new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(Math.round(Number(n||0)));

  const kpis = useMemo(() => {
    // total et revenue depuis l'API backend
    const total = Number(employerKpis?.daily_orders_count || 0);
    const revenue = Number(employerKpis?.daily_revenue || 0);
    // pending et delivered dérivés de la liste réelle des commandes (front)
    const pending = (commandes || []).filter(c => ['non lu','en préparation','en livraison'].includes((c.statut||'').toLowerCase())).length;
    const delivered = (commandes || []).filter(c => (c.statut||'').toLowerCase() === 'validé').length;
    return { total, pending, delivered, revenue };
  }, [employerKpis, commandes]);

  const filtered = useMemo(() => rows.filter(r => {
    if (search && !r.customer?.toLowerCase().includes(search.toLowerCase())) return false;
    if (status !== 'all' && r.status !== status) return false;
    if (channel !== 'all' && r.channel !== channel) return false;
    return true;
  }), [rows, search, status, channel]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page-1)*pageSize, page*pageSize);

  function setFlashMessage(m){ setFlash(m); setTimeout(()=>setFlash(''), 1500); }
  function updateAndSave(next){ setRows(next); saveOrders(next); }
  function markPreparing(id){ const next = rows.map(r=>r.id===id?{...r,status:'preparing'}:r); updateAndSave(next); setFlashMessage('Commande en préparation.'); }
  function markDelivered(id){ const next = rows.map(r=>r.id===id?{...r,status:'delivered'}:r); updateAndSave(next); setFlashMessage('Commande livrée.'); }
  function cancelOrder(id){ const next = rows.map(r=>r.id===id?{...r,status:'cancelled'}:r); updateAndSave(next); setFlashMessage('Commande annulée.'); }

  // Gestionnaire pour la validation des commandes
  const handleValider = async (id) => {
    try {
      const commande = commandes.find(c => c.id_commande === id);
      if (!commande) return;

      let commandeModifiee;
      if (commande.statut === 'non lu') {
        commandeModifiee = await validerCommandeNonLue(id);
      } else if (commande.statut === 'en préparation') {
        commandeModifiee = await validerCommandeEnPreparation(id);
        // Ouvrir la fenêtre de sélection du livreur
        setSelectedCommande(commandeModifiee);
        setIsLivreurModalOpen(true);
      }

      // Mettre à jour la liste des commandes
      setCommandes(prev => prev.map(c => 
        c.id_commande === id ? { ...c, statut: commandeModifiee.statut } : c
      ));

      setFlashMessage(`Commande ${id} ${commande.statut === 'non lu' ? 'mise en préparation' : 'validée'}`);
    } catch (error) {
      console.error('Erreur lors de la validation de la commande:', error);
      setFlashMessage('Erreur lors de la validation de la commande');
    }
  };

  // Gestionnaire pour l'annulation des commandes
  const handleAnnuler = async (id) => {
    try {
      await annulerCommande(id);
      
      // Mettre à jour la liste des commandes
      setCommandes(prev => prev.map(c => 
        c.id_commande === id ? { ...c, statut: 'annulé' } : c
      ));

      setFlashMessage(`Commande ${id} annulée`);
    } catch (error) {
      console.error('Erreur lors de l\'annulation de la commande:', error);
      setFlashMessage('Erreur lors de l\'annulation de la commande');
    }
  };
  
  // Gestionnaire pour l'affichage des détails
  const handleDetails = (commandeId) => {
    const commande = commandes.find(c => c.id_commande === commandeId);
    if (commande) {
      setSelectedCommande(commande);
      setIsModalOpen(true);
    }
  };

  // Gestionnaire pour remettre une commande en préparation
  const handleValiderRetourEnPreparation = async (commandeId) => {
    if (!commandeId) return;
    try {
      console.log('Commande à remettre en préparation:', commandeId);
      const commandeModifiee = await updateCommandeStatus(commandeId, 'en préparation');
      console.log('Commande mise en préparation:', commandeModifiee);
      setCommandes(prev => prev.map(c => 
        c.id_commande === commandeId ? { ...c, statut: 'en préparation' } : c
      ));
      setFlashMessage('Commande remise en préparation');
    } catch (error) {
      console.error('Erreur lors de la remise en préparation:', error);
      setFlashMessage('Erreur lors de la remise en préparation');
    }
  };

  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <section className="container reveal" style={{ paddingTop: 0, paddingBottom: '2rem' }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0369a1' }}>
            <IconBag />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Gestion des commandes</div>
            <div style={{ color: '#6b7280', fontSize: 12 }}>Suivez, préparez et livrez vos commandes</div>
          </div>
        </div>
      </div>

      {flash && (<div style={{ marginTop: 12, background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '8px 12px', borderRadius: 8 }}>{flash}</div>)}

      <div className="cards" style={{ display: 'grid', gridTemplateColumns: windowWidth > 992 ? 'repeat(4, 1fr)' : windowWidth > 576 ? 'repeat(2, 1fr)' : '1fr', gap: '1rem', marginTop: '1rem' }}>
        <div className="card" style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 6px rgba(0,0,0,0.05)', position: 'relative' }}>
          <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 8 }}>Total commandes</div>
          <div style={{ fontWeight: 700, fontSize: 22 }}><CountUp end={kpis.total} /></div>
        </div>
        <div className="card" style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 6px rgba(0,0,0,0.05)', position: 'relative' }}>
          <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 8 }}>En attente</div>
          <div style={{ fontWeight: 700, fontSize: 22 }}><CountUp end={kpis.pending} /></div>
        </div>
        <div className="card" style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 6px rgba(0,0,0,0.05)', position: 'relative' }}>
          <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 8 }}>Livrées</div>
          <div style={{ fontWeight: 700, fontSize: 22 }}><CountUp end={kpis.delivered} /></div>
        </div>
        <div className="card" style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 6px rgba(0,0,0,0.05)', position: 'relative' }}>
          <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 8 }}>Revenu (jour)</div>
          <div style={{ fontWeight: 700, fontSize: 22 }}><CountUp end={kpis.revenue} format suffix=" FCFA" /></div>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, padding: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.04)', marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <span style={{ position: 'absolute', left: 12, top: 10, color: '#9ca3af' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </span>
          <input value={search} onChange={(e)=>{ setSearch(e.target.value); setPage(1); }} placeholder="Rechercher par client..." style={{ width: '100%', border: '1px solid #e5e7eb', padding: '8px 12px 8px 36px', borderRadius: 8, outline: 'none' }} />
        </div>
        <div className="d-flex flex-wrap gap-2">
          <button className={`btn ${status === 'all' ? 'btn-dark' : 'btn-outline-secondary'} btn-sm`} onClick={() => setStatus('all')}>Tous</button>
          <button className={`btn ${status === 'non lu' ? 'btn-dark' : 'btn-outline-secondary'} btn-sm`} onClick={() => setStatus('non lu')}>Non lues</button>
          <button className={`btn ${status === 'en cours' ? 'btn-dark' : 'btn-outline-secondary'} btn-sm`} onClick={() => setStatus('en cours')}>En cours</button>
          <button className={`btn ${status === 'validé' ? 'btn-dark' : 'btn-outline-secondary'} btn-sm`} onClick={() => setStatus('validé')}>Validées</button>
        </div>
      </div>

      <div className="order-list" style={{ marginTop: '1.5rem' }}>
        {loading ? (
          <div className="text-center p-4">
            <Spinner animation="border" variant="warning" />
            <p className="mt-2 text-muted">Chargement des commandes...</p>
          </div>
        ) : commandes.length === 0 ? (
          <div className="text-center p-4 text-muted">
            <IconBag size={32} className="mb-2" />
            <p>Aucune commande ne correspond à ce filtre.</p>
          </div>
        ) : (
          commandes.map(commande => (
            <CommandeFlottant
              key={commande.id_commande}
              id_commande={commande.id_commande}
              nom_client={commande.nom_client}
              statut={commande.statut}
              onValider={() => handleValider(commande.id_commande)}
              onAnnuler={() => handleAnnuler(commande.id_commande)}
              onDetails={() => handleDetails(commande.id_commande)}
            />
          ))
        )}
      </div>

      {selectedCommande && (
        <>
          <DetailsCommandeEmploye
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            id_commande={selectedCommande.id_commande}
            menus={selectedCommande.menus}
            typeLocalisation={selectedCommande.type_localisation}
            Localisation={selectedCommande.localisation_client}
            date_livraison={selectedCommande.date_livraison}
            statut={selectedCommande.statut}
            onValider={() => handleValider(selectedCommande.id_commande)}
            onAnnuler={() => handleAnnuler(selectedCommande.id_commande)}
          />
          {selectedCommande.statut === 'validé' && (
            <ChoixLivreurCommande
              isOpen={isLivreurModalOpen}
              onClose={() => {
                handleValiderRetourEnPreparation(selectedCommande.id_commande);
                setIsLivreurModalOpen(false);
                handleCloseModal();
              }}
              commande={selectedCommande}
              onSuccess={(livreur) => {
                setFlashMessage(`Livreur ${livreur.nom} assigné à la commande ${selectedCommande.id_commande}`);
                setIsLivreurModalOpen(false);
                handleCloseModal();
                // Rafraîchir la liste des commandes
                fetchCommandes();
              }}
              onError={(error) => {
                setFlashMessage('Erreur lors de l\'assignation du livreur');
                handleValiderRetourEnPreparation(selectedCommande.id_commande);
                setIsLivreurModalOpen(false);
                handleCloseModal();
              }}
            />
          )}
        </>
      )}

    </section>
  );
}
