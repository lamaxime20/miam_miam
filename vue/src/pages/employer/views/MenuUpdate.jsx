import React, { useEffect, useMemo, useState } from 'react';
import CountUp from '../components/common/CountUp';
import { getMenuEditable, saveMenuEditable } from '../services/mockApi';

const IconForkSpoon = (props) => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 3v8a2 2 0 0 0 2 2h0V3"/>
    <path d="M10 3v8a2 2 0 0 1-2 2h0"/>
    <path d="M14 3v18"/>
    <path d="M19 3c0 3-2 5-5 5"/>
  </svg>
);
const IconPlus = (props) => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IconX = (props) => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconCheck = (props) => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M20 6L9 17l-5-5"/>
  </svg>
);

const money = (n)=> new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(Math.round(Number(n||0)));

export default function MenuUpdate() {
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [available, setAvailable] = useState('all');
  const [flash, setFlash] = useState('');

  const [page, setPage] = useState(1);
  const pageSize = 8;

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', category: 'Plat', price: 0, available: true, image: '' });

  const defaultRows = [
    { id: 1, name: 'Burger Maison', category: 'Plat', price: 2500, available: true, updatedAt: '2025-10-10' },
    { id: 2, name: 'Salade César', category: 'Entrée', price: 2000, available: true, updatedAt: '2025-10-11' },
    { id: 3, name: 'Tiramisu', category: 'Dessert', price: 1500, available: false, updatedAt: '2025-10-09' }
  ];
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  useEffect(() => {
    let mounted = true;
    getMenuEditable(defaultRows).then(data => { if (mounted) setRows(data); });
    return () => { mounted = false; };
  }, []);

  const kpis = useMemo(() => {
    const total = rows.length;
    const inStock = rows.filter(r=>r.available).length;
    const outStock = total - inStock;
    const avgPrice = total ? (rows.reduce((s,r)=>s+r.price,0)/total) : 0;
    return { total, inStock, outStock, avgPrice };
  }, [rows]);

  const filtered = useMemo(() => rows.filter(r => {
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (category !== 'all' && r.category !== category) return false;
    if (available !== 'all' && (available === 'yes') !== r.available) return false;
    return true;
  }), [rows, search, category, available]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page-1)*pageSize, page*pageSize);

  function setFlashMessage(m){ setFlash(m); setTimeout(()=>setFlash(''), 1500); }
  function updateAndSave(next){ setRows(next); saveMenuEditable(next); }
  function toggleAvailable(id){ const next = rows.map(r=>r.id===id?{...r, available: !r.available, updatedAt: new Date().toISOString().slice(0,10)}:r); updateAndSave(next); setFlashMessage('Disponibilité mise à jour.'); }

  function openNew(){ setEditing(null); setForm({ name: '', category: 'Plat', price: 0, available: true, image: '' }); setShowModal(true); }
  function openEdit(r){ setEditing(r.id); setForm({ name: r.name, category: r.category, price: r.price, available: r.available, image: r.image || '' }); setShowModal(true); }
  function saveForm(e){
    e.preventDefault();
    if (!form.name) return;
    if (editing){
      const next = rows.map(r=>r.id===editing?{...r, ...form, updatedAt: new Date().toISOString().slice(0,10)}:r);
      updateAndSave(next);
      setFlashMessage('Plat mis à jour.');
    } else {
      const id = Math.max(0, ...rows.map(r=>r.id)) + 1;
      const next = [{ id, ...form, updatedAt: new Date().toISOString().slice(0,10) }, ...rows];
      updateAndSave(next);
      setFlashMessage('Plat ajouté.');
    }
    setShowModal(false);
  }

  return (
    <section className="container reveal" style={{ paddingTop: 0, paddingBottom: '2rem' }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
            <IconForkSpoon />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Mise à jour du menu</div>
            <div style={{ color: '#6b7280', fontSize: 12 }}>Gérez vos plats, prix et disponibilités</div>
          </div>
        </div>
        <button onClick={openNew} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconPlus />
          Nouveau plat
        </button>
      </div>

      {flash && (<div style={{ marginTop: 12, background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '8px 12px', borderRadius: 8 }}>{flash}</div>)}

      <div className="cards" style={{ display: 'grid', gridTemplateColumns: windowWidth > 992 ? 'repeat(4, 1fr)' : windowWidth > 576 ? 'repeat(2, 1fr)' : '1fr', gap: '1rem', marginTop: '1rem' }}>
        <div className="card" style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 6px rgba(0,0,0,0.05)', position: 'relative' }}>
          <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 8 }}>Plats</div>
          <div style={{ fontWeight: 700, fontSize: 22 }}><CountUp end={kpis.total} /></div>
        </div>
        <div className="card" style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 6px rgba(0,0,0,0.05)', position: 'relative' }}>
          <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 8 }}>Disponibles</div>
          <div style={{ fontWeight: 700, fontSize: 22 }}><CountUp end={kpis.inStock} /></div>
        </div>
        <div className="card" style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 6px rgba(0,0,0,0.05)', position: 'relative' }}>
          <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 8 }}>Indisponibles</div>
          <div style={{ fontWeight: 700, fontSize: 22 }}><CountUp end={kpis.outStock} /></div>
        </div>
        <div className="card" style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 6px rgba(0,0,0,0.05)', position: 'relative' }}>
          <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 8 }}>Prix moyen</div>
          <div style={{ fontWeight: 700, fontSize: 22 }}><CountUp end={kpis.avgPrice} format suffix=" FCFA" /></div>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, padding: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.04)', marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <span style={{ position: 'absolute', left: 12, top: 10, color: '#9ca3af' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </span>
          <input value={search} onChange={(e)=>{ setSearch(e.target.value); setPage(1); }} placeholder="Rechercher un plat..." style={{ width: '100%', border: '1px solid #e5e7eb', padding: '8px 12px 8px 36px', borderRadius: 8, outline: 'none' }} />
        </div>
        <div>
          <select value={category} onChange={(e)=>{ setCategory(e.target.value); setPage(1); }} style={{ border: '1px solid #e5e7eb', background: '#fff', padding: '8px 12px', borderRadius: 8 }}>
            <option value="all">Toutes catégories</option>
            <option value="Entrée">Entrée</option>
            <option value="Plat">Plat</option>
            <option value="Dessert">Dessert</option>
          </select>
        </div>
        <div>
          <select value={available} onChange={(e)=>{ setAvailable(e.target.value); setPage(1); }} style={{ border: '1px solid #e5e7eb', background: '#fff', padding: '8px 12px', borderRadius: 8 }}>
            <option value="all">Disponibilité</option>
            <option value="yes">Disponible</option>
            <option value="no">Indisponible</option>
          </select>
        </div>
      </div>

      <div className="table-wrapper" style={{ marginTop: '0.75rem', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
        <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f7f7f8' }}>
            <tr>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#6b7280', fontWeight: 500 }}>Image</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#6b7280', fontWeight: 500 }}>Nom</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#6b7280', fontWeight: 500 }}>Catégorie</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#6b7280', fontWeight: 500 }}>Prix</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#6b7280', fontWeight: 500 }}>Disponibilité</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#6b7280', fontWeight: 500 }}>Modifié le</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#6b7280', fontWeight: 500 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map(r => (
              <tr key={r.id} style={{ borderTop: '1px solid #eef2f7' }}>
                <td style={{ padding: '12px 16px' }}>
                  <img
                    src={r.image || "https://images.unsplash.com/photo-1550317138-10000687a72b?w=400&q=70&auto=format&fit=crop"}
                    alt="miniature"
                    style={{ width: 56, height: 40, objectFit: 'cover', borderRadius: 6, border: '1px solid #e5e7eb' }}
                    onError={(e)=>{ e.currentTarget.src = 'https://images.unsplash.com/photo-1550317138-10000687a72b?w=400&q=70&auto=format&fit=crop'; }}
                  />
                </td>
                <td style={{ padding: '12px 16px' }}>{r.name}</td>
                <td style={{ padding: '12px 16px' }}>{r.category}</td>
                <td style={{ padding: '12px 16px' }}>{money(r.price)}</td>
                <td style={{ padding: '12px 16px' }}>{r.available ? <span style={{ background: '#DCFCE7', color: '#16a34a', borderRadius: 999, padding: '4px 10px', fontSize: 12, fontWeight: 600 }}>Disponible</span> : <span style={{ background: '#FEE2E2', color: '#dc2626', borderRadius: 999, padding: '4px 10px', fontSize: 12, fontWeight: 600 }}>Indispo</span>}</td>
                <td style={{ padding: '12px 16px' }}>{r.updatedAt}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <a href="#" onClick={(e)=>{e.preventDefault(); openEdit(r);}} style={{ color: '#2563eb' }}>Éditer</a>
                    <a href="#" onClick={(e)=>{e.preventDefault(); toggleAvailable(r.id);}} style={{ color: '#10b981' }}><IconCheck /></a>
                  </div>
                </td>
              </tr>
            ))}
            {pageItems.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 16, color: '#6b7280' }}>Aucun plat trouvé.</td></tr>
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

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ width: 'min(520px, 92vw)', background: '#fff', borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
            <div style={{ padding: 16, borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: '#e8f1ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                  <IconPlus />
                </div>
                <div style={{ fontWeight: 700 }}>{editing ? 'Éditer le plat' : 'Nouveau plat'}</div>
              </div>
              <button onClick={()=>setShowModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }} aria-label="Fermer">
                <IconX />
              </button>
            </div>
            <form onSubmit={saveForm} style={{ padding: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Nom</label>
                  <input required value={form.name} onChange={(e)=>setForm({ ...form, name: e.target.value })} placeholder="Nom du plat" style={{ width: '100%', border: '1px solid #e5e7eb', padding: '8px 12px', borderRadius: 8 }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Catégorie</label>
                    <select value={form.category} onChange={(e)=>setForm({ ...form, category: e.target.value })} style={{ width: '100%', border: '1px solid #e5e7eb', padding: '8px 12px', borderRadius: 8 }}>
                      <option value="Entrée">Entrée</option>
                      <option value="Plat">Plat</option>
                      <option value="Dessert">Dessert</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Prix (FCFA)</label>
                    <input type="number" value={form.price} onChange={(e)=>setForm({ ...form, price: Number(e.target.value) })} style={{ width: '100%', border: '1px solid #e5e7eb', padding: '8px 12px', borderRadius: 8 }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Image du plat</label>
                  {form.image && (
                    <div style={{ marginBottom: 8 }}>
                      <img src={form.image} alt="aperçu" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }} />
                      <button type="button" onClick={()=>setForm({ ...form, image: '' })} style={{ marginLeft: 8, border: '1px solid #e5e7eb', background: '#fff', padding: '6px 10px', borderRadius: 8 }}>Retirer</button>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e)=>{
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => setForm({ ...form, image: String(reader.result||'') });
                      reader.readAsDataURL(file);
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Disponibilité</label>
                  <select value={form.available ? 'yes' : 'no'} onChange={(e)=>setForm({ ...form, available: e.target.value==='yes' })} style={{ width: '100%', border: '1px solid #e5e7eb', padding: '8px 12px', borderRadius: 8 }}>
                    <option value="yes">Disponible</option>
                    <option value="no">Indisponible</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
                <button type="button" onClick={()=>setShowModal(false)} style={{ border: '1px solid #e5e7eb', background: '#fff', padding: '8px 12px', borderRadius: 8 }}>Annuler</button>
                <button type="submit" style={{ border: '1px solid #2563eb', background: '#2563eb', color: '#fff', padding: '8px 12px', borderRadius: 8 }}>{editing ? 'Enregistrer' : 'Créer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
