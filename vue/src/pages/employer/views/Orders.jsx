import React, { useEffect, useMemo, useState } from 'react';
import CountUp from '../components/common/CountUp';
import { getOrders, saveOrders } from '../services/mockApi';

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

  const [showDetail, setShowDetail] = useState(false);
  const [detail, setDetail] = useState(null);

  const [rows, setRows] = useState([]);
  const defaultRows = [];

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
    const total = rows.length;
    const pending = rows.filter(r=>r.status==='pending').length;
    const delivered = rows.filter(r=>r.status==='delivered').length;
    const revenue = rows.filter(r=>r.status==='delivered').reduce((s,r)=>s+r.total,0);
    return { total, pending, delivered, revenue };
  }, [rows]);

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

  function openDetail(order){ setDetail(order); setShowDetail(true); }

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
          <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 8 }}>Revenu livré</div>
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
        <div>
          <select value={status} onChange={(e)=>{ setStatus(e.target.value); setPage(1); }} style={{ border: '1px solid #e5e7eb', background: '#fff', padding: '8px 12px', borderRadius: 8 }}>
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="preparing">En préparation</option>
            <option value="delivered">Livrée</option>
            <option value="cancelled">Annulée</option>
          </select>
        </div>
        <div>
          <select value={channel} onChange={(e)=>{ setChannel(e.target.value); setPage(1); }} style={{ border: '1px solid #e5e7eb', background: '#fff', padding: '8px 12px', borderRadius: 8 }}>
            <option value="all">Tous les canaux</option>
            <option value="online">En ligne</option>
            <option value="sur place">Sur place</option>
            <option value="a emporter">À emporter</option>
          </select>
        </div>
      </div>

      <div className="table-wrapper" style={{ marginTop: '0.75rem', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
        <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f7f7f8' }}>
            <tr>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#6b7280', fontWeight: 500 }}>N°</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#6b7280', fontWeight: 500 }}>Client</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#6b7280', fontWeight: 500 }}>Total</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#6b7280', fontWeight: 500 }}>Canal</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#6b7280', fontWeight: 500 }}>Statut</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#6b7280', fontWeight: 500 }}>Créée le</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#6b7280', fontWeight: 500 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map(r => (
              <tr key={r.id} style={{ borderTop: '1px solid #eef2f7' }}>
                <td style={{ padding: '12px 16px' }}>#{r.id}</td>
                <td style={{ padding: '12px 16px' }}>{r.customer}</td>
                <td style={{ padding: '12px 16px' }}>{money(r.total)}</td>
                <td style={{ padding: '12px 16px' }}>{r.channel}</td>
                <td style={{ padding: '12px 16px' }}>
                  {r.status === 'pending' && <span style={{ background: '#FEF9C3', color: '#a16207', borderRadius: 999, padding: '4px 10px', fontSize: 12, fontWeight: 600 }}>En attente</span>}
                  {r.status === 'preparing' && <span style={{ background: '#DBEAFE', color: '#2563eb', borderRadius: 999, padding: '4px 10px', fontSize: 12, fontWeight: 600 }}>En préparation</span>}
                  {r.status === 'delivered' && <span style={{ background: '#DCFCE7', color: '#16a34a', borderRadius: 999, padding: '4px 10px', fontSize: 12, fontWeight: 600 }}>Livrée</span>}
                  {r.status === 'cancelled' && <span style={{ background: '#FEE2E2', color: '#dc2626', borderRadius: 999, padding: '4px 10px', fontSize: 12, fontWeight: 600 }}>Annulée</span>}
                </td>
                <td style={{ padding: '12px 16px' }}>{r.createdAt}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <a href="#" aria-label="Voir" onClick={(e)=>{e.preventDefault(); openDetail(r);}} style={{ color: '#3b82f6' }}><IconEye /></a>
                    {r.status === 'pending' && (<a href="#" onClick={(e)=>{e.preventDefault(); markPreparing(r.id);}} style={{ color: '#2563eb' }}>Préparer</a>)}
                    {r.status !== 'delivered' && (<a href="#" onClick={(e)=>{e.preventDefault(); markDelivered(r.id);}} style={{ color: '#10b981' }}><IconCheck /></a>)}
                    {r.status !== 'cancelled' && (<a href="#" onClick={(e)=>{e.preventDefault(); cancelOrder(r.id);}} style={{ color: '#ef4444' }}><IconX /></a>)}
                  </div>
                </td>
              </tr>
            ))}
            {pageItems.length === 0 && (
              <tr><td colSpan={7} style={{ padding: 16, color: '#6b7280' }}>Aucune commande trouvée.</td></tr>
            )}
          </tbody>
        </table>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: '#fff' }}>
          <div style={{ color: '#6b7280', fontSize: 12 }}>Affichage de {(page - 1) * pageSize + 1} à {Math.min(page * pageSize, filtered.length)} sur {filtered.length} résultats</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{ border: '1px solid #e5e7eb', background: '#fff', padding: '6px 10px', borderRadius: 8, opacity: page===1?0.5:1 }}>Précédent</button>
            {Array.from({ length: totalPages }).slice(0, 3).map((_, i) => { const n = i + 1; return (
              <button key={n} onClick={()=>setPage(n)} style={{ border: `1px solid ${page===n?'#2563eb':'#e5e7eb'}`, background: page===n?'#2563eb':'#fff', color: page===n?'#fff':'#111', padding: '6px 10px', borderRadius: 8 }}>{n}</button>
            );})}
            <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} style={{ border: '1px solid #e5e7eb', background: '#fff', padding: '6px 10px', borderRadius: 8, opacity: page===totalPages?0.5:1 }}>Suivant</button>
          </div>
        </div>
      </div>

      {showDetail && detail && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
          <div style={{ width: 'min(760px, 94vw)', background: '#fff', borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            <div style={{ padding: 14, borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 700 }}>Commande #{detail.id} — {detail.customer}</div>
              <button onClick={()=>setShowDetail(false)} style={{ border:'none', background:'transparent', cursor:'pointer' }}>✕</button>
            </div>
            <div style={{ padding: 16, display: 'grid', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:8, padding:12 }}>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Informations</div>
                  <div style={{ color:'#374151', fontSize:14 }}>Statut: <strong>{detail.status}</strong></div>
                  <div style={{ color:'#374151', fontSize:14 }}>Canal: <strong>{detail.channel}</strong></div>
                  <div style={{ color:'#374151', fontSize:14 }}>Créée le: <strong>{detail.createdAt}</strong></div>
                  <div style={{ color:'#374151', fontSize:14 }}>Total: <strong>{money(detail.total)}</strong></div>
                </div>
                <div style={{ background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:8, padding:12 }}>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Paiement</div>
                  <div style={{ color:'#374151', fontSize:14 }}>Méthode: <strong>{detail.meta?.payment?.method || '—'}</strong></div>
                  <div style={{ color:'#374151', fontSize:14 }}>Opérateur: <strong>{detail.meta?.payment?.operator || '—'}</strong></div>
                  <div style={{ color:'#374151', fontSize:14 }}>Téléphone: <strong>{detail.meta?.payment?.phone || '—'}</strong></div>
                </div>
              </div>
              <div style={{ background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:8, padding:12 }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Livraison</div>
                <div style={{ color:'#374151', fontSize:14 }}>Adresse: <strong>{detail.meta?.delivery?.address || '—'}</strong></div>
                {detail.meta?.delivery?.address2 && (<div style={{ color:'#374151', fontSize:14 }}>Complément: <strong>{detail.meta?.delivery?.address2}</strong></div>)}
                <div style={{ color:'#374151', fontSize:14 }}>Ville/Quartier: <strong>{detail.meta?.delivery?.city || '—'}</strong></div>
                <div style={{ color:'#374151', fontSize:14 }}>Téléphone: <strong>{detail.meta?.delivery?.phone || '—'}</strong></div>
                {detail.meta?.delivery?.instructions && (<div style={{ color:'#374151', fontSize:14 }}>Consignes: <strong>{detail.meta?.delivery?.instructions}</strong></div>)}
              </div>
              <div style={{ background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:8, padding:12 }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Articles</div>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr style={{ background:'#eef2f7' }}>
                      <th style={{ textAlign:'left', padding:'8px 10px' }}>Article</th>
                      <th style={{ textAlign:'left', padding:'8px 10px' }}>Qté</th>
                      <th style={{ textAlign:'left', padding:'8px 10px' }}>PU</th>
                      <th style={{ textAlign:'left', padding:'8px 10px' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(detail.items||[]).map((it, i)=> (
                      <tr key={i} style={{ borderTop:'1px solid #e5e7eb' }}>
                        <td style={{ padding:'8px 10px' }}>{it.name}</td>
                        <td style={{ padding:'8px 10px' }}>{it.qty}</td>
                        <td style={{ padding:'8px 10px' }}>{money(it.unitPrice)}</td>
                        <td style={{ padding:'8px 10px' }}>{money((Number(it.unitPrice)||0)*(Number(it.qty)||0))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ display:'flex', justifyContent:'flex-end' }}>
                <button onClick={()=>setShowDetail(false)} className="btn btn-primary">Fermer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
