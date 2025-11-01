import React, { useEffect, useMemo, useState } from 'react';
import { fetchReclamationsByRestaurant, updateReclamationStatusDb, addReponse } from '../../../services/Reclamations';
import { getAuthInfo, recupererUser } from '../../../services/user';

const IconAlert = (props) => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const IconCheck = (props) => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M20 6L9 17l-5-5"/>
  </svg>
);

export default function Complaints() {
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [type, setType] = useState('all');
  const [flash, setFlash] = useState('');

  const [page, setPage] = useState(1);
  const pageSize = 6;

  const auth = getAuthInfo();
  const restaurantId = auth?.restaurant;

  const [rows, setRows] = useState([]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!restaurantId) { setRows([]); return; }
      try {
        const data = await fetchReclamationsByRestaurant(restaurantId);
        if (mounted) setRows(data);
      } catch (e) {
        console.error('Erreur chargement réclamations restaurant', e);
        if (mounted) setRows([]);
      }
    }
    load();
    return () => { mounted = false; };
  }, [restaurantId]);

  const kpis = useMemo(() => {
    const total = rows.length;
    const open = rows.filter(r=>r.status==='ouverte').length;
    const inProgress = rows.filter(r=>r.status==='en_traitement').length;
    const resolved = rows.filter(r=>r.status==='fermée').length;
    return { total, open, inProgress, resolved };
  }, [rows]);

  const filtered = useMemo(() => rows.filter(r => {
    if (search && !r.customer.toLowerCase().includes(search.toLowerCase())) return false;
    if (status !== 'all' && r.status !== status) return false;
    if (type !== 'all' && r.type !== type) return false;
    return true;
  }), [rows, search, status, type]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page-1)*pageSize, page*pageSize);

  function setFlashMessage(m){ setFlash(m); setTimeout(()=>setFlash(''), 1500); }
  function updateAndSave(next){ setRows(next); }
  async function startProgress(id){
    try {
      await updateReclamationStatusDb(id, 'en_traitement');
      const next = rows.map(r=>r.id===id?{...r,status:'en_traitement'}:r);
      updateAndSave(next);
      setFlashMessage('Réclamation en cours.');
    } catch (e) {
      console.error('Erreur MAJ statut', e);
    }
  }
  async function resolve(id){
    try {
      await updateReclamationStatusDb(id, 'fermée');
      const next = rows.map(r=>r.id===id?{...r,status:'fermée'}:r);
      updateAndSave(next);
      setFlashMessage('Réclamation résolue.');
    } catch (e) {
      console.error('Erreur MAJ statut', e);
    }
  }

  return (
    <section className="container reveal" style={{ paddingTop: 0, paddingBottom: '2rem' }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
            <IconAlert />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Réclamations</div>
            <div style={{ color: '#6b7280', fontSize: 12 }}>Suivez et traitez les réclamations clients</div>
          </div>
        </div>
      </div>

      {flash && (<div style={{ marginTop: 12, background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '8px 12px', borderRadius: 8 }}>{flash}</div>)}

      <div className="cards" style={{ display: 'grid', gridTemplateColumns: windowWidth > 992 ? 'repeat(4, 1fr)' : windowWidth > 576 ? 'repeat(2, 1fr)' : '1fr', gap: '1rem', marginTop: '1rem' }}>
        <div className="card" style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 6px rgba(0,0,0,0.05)', position: 'relative' }}>
          <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 8 }}>Total</div>
          <div style={{ fontWeight: 700, fontSize: 22 }}>{kpis.total}</div>
        </div>
        <div className="card" style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 6px rgba(0,0,0,0.05)', position: 'relative' }}>
          <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 8 }}>Ouvertes</div>
          <div style={{ fontWeight: 700, fontSize: 22 }}>{kpis.open}</div>
        </div>
        <div className="card" style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 6px rgba(0,0,0,0.05)', position: 'relative' }}>
          <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 8 }}>En cours</div>
          <div style={{ fontWeight: 700, fontSize: 22 }}>{kpis.inProgress}</div>
        </div>
        <div className="card" style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 6px rgba(0,0,0,0.05)', position: 'relative' }}>
          <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 8 }}>Résolues</div>
          <div style={{ fontWeight: 700, fontSize: 22 }}>{kpis.resolved}</div>
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
            <option value="open">Ouverte</option>
            <option value="in_progress">En cours</option>
            <option value="resolved">Résolue</option>
          </select>
        </div>
        <div>
          <select value={type} onChange={(e)=>{ setType(e.target.value); setPage(1); }} style={{ border: '1px solid #e5e7eb', background: '#fff', padding: '8px 12px', borderRadius: 8 }}>
            <option value="all">Tous types</option>
            <option value="service">Service</option>
            <option value="produit">Produit</option>
            <option value="livraison">Livraison</option>
          </select>
        </div>
      </div>

      <div className="table-wrapper" style={{ marginTop: '0.75rem', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
        <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f7f7f8' }}>
            <tr>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#6b7280', fontWeight: 500 }}>Client</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#6b7280', fontWeight: 500 }}>Type</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#6b7280', fontWeight: 500 }}>Statut</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#6b7280', fontWeight: 500 }}>Créée le</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#6b7280', fontWeight: 500 }}>Message</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#6b7280', fontWeight: 500 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map(r => (
              <tr key={r.id} style={{ borderTop: '1px solid #eef2f7' }}>
                <td style={{ padding: '12px 16px' }}>{r.customer}</td>
                <td style={{ padding: '12px 16px' }}>{r.type}</td>
                <td style={{ padding: '12px 16px' }}>
                  {r.status === 'open' && <span style={{ background: '#FEF9C3', color: '#a16207', borderRadius: 999, padding: '4px 10px', fontSize: 12, fontWeight: 600 }}>Ouverte</span>}
                  {r.status === 'in_progress' && <span style={{ background: '#DBEAFE', color: '#2563eb', borderRadius: 999, padding: '4px 10px', fontSize: 12, fontWeight: 600 }}>En cours</span>}
                  {r.status === 'resolved' && <span style={{ background: '#DCFCE7', color: '#16a34a', borderRadius: 999, padding: '4px 10px', fontSize: 12, fontWeight: 600 }}>Résolue</span>}
                </td>
                <td style={{ padding: '12px 16px' }}>{r.createdAt}</td>
                <td style={{ padding: '12px 16px' }}>{r.message}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    {r.status === 'open' && (<a href="#" onClick={(e)=>{e.preventDefault(); startProgress(r.id);}} style={{ color: '#2563eb' }}>Démarrer</a>)}
                    {r.status !== 'resolved' && (<a href="#" onClick={(e)=>{e.preventDefault(); resolve(r.id);}} style={{ color: '#10b981' }}><IconCheck /></a>)}
                  </div>
                </td>
              </tr>
            ))}
            {pageItems.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 16, color: '#6b7280' }}>Aucune réclamation trouvée.</td></tr>
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
    </section>
  );
}
