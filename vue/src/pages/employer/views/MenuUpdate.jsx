import React, { useEffect, useMemo, useState } from 'react';
import CountUp from '../components/common/CountUp';
import { getMenuEditable, saveMenuEditable } from '../services/mockApi';
import { fetchMenuData, updateFile, createFile, createMenu, updateMenu, fetchMenusDuJourIds, addMenusDuJour, removeMenusDuJour } from '../../../services/MenusEmploye';
import { getAuthInfo, getUserByEmail } from '../../../services/user';

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
  const [form, setForm] = useState({ name: '', description: '', category: 'Plat', price: 0, available: true, image: '', image_id: null });
  const [isSubmitting, setIsSubmitting] = useState(false); // Pour figer l'interface
  const [dragActive, setDragActive] = useState(false);
  const restaurantId = getAuthInfo().restaurant; // TODO: remplacer par l'ID du restaurant de l'employé connecté

  const defaultRows = [
    { id: 1, name: 'Burger Maison', category: 'Plat', price: 2500, available: true, updatedAt: '2025-10-10' },
    { id: 2, name: 'Salade César', category: 'Entrée', price: 2000, available: true, updatedAt: '2025-10-11' },
    { id: 3, name: 'Tiramisu', category: 'Dessert', price: 1500, available: false, updatedAt: '2025-10-09' }
  ];
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayIds, setTodayIds] = useState([]);
  const [showManageToday, setShowManageToday] = useState(false);
  const [initialTodayIds, setInitialTodayIds] = useState([]);
  const [topList, setTopList] = useState([]);
  const [bottomList, setBottomList] = useState([]);
  const [bottomSearch, setBottomSearch] = useState('');

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    async function loadMenu() {
      setLoading(true);
      try {
        const menuData = await fetchMenuData(restaurantId);
        const dataWithDate = menuData.map(item => ({
          ...item,
          image: item.image || null,
          updatedAt: item.updatedAt || new Date().toISOString().slice(0, 10)
        }));
        setRows(dataWithDate);
        const ids = await fetchMenusDuJourIds();
        setTodayIds(ids);
      } catch (error) {
        console.error("Erreur lors du chargement du menu:", error);
        setFlashMessage("Erreur lors du chargement du menu.");
      } finally {
        setLoading(false);
      }
    }
    loadMenu();
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

  function openNew(){ setEditing(null); setForm({ name: '', description: '', category: 'Plat', price: 0, available: true, image: '', image_id: null }); setShowModal(true); }
  function openEdit(r){ setEditing(r); setForm({ name: r.name, description: r.description || '', category: r.category, price: r.price, available: r.available, image: r.image || '', image_id: r.image_id || null }); setShowModal(true); }
  
  async function handleImageChange(eOrFile) {
    const file = eOrFile?.target ? eOrFile.target.files?.[0] : eOrFile;
    if (!file) return;

    setIsSubmitting(true);
    setFlashMessage("Téléversement de l'image...");
    try {
      const oldImageId = form.image_id || (editing ? editing.image_id : null);
      const newFile = await (oldImageId ? updateFile(file, oldImageId) : createFile(file));
      setForm(prev => ({ ...prev, image_id: newFile.id_file, image: newFile.url || prev.image }));
      setFlashMessage("Image téléversée avec succès !");
    } catch (error) {
      console.error("Erreur lors du téléversement de l'image:", error);
      setFlashMessage("Erreur lors du téléversement.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function saveForm(e) {
    e.preventDefault();
    if (!form.name) return;
    setIsSubmitting(true);

    if (editing) {
      try {
        await updateMenu(editing.id, form, restaurantId);
        const refreshed = await fetchMenuData(restaurantId);
        setRows(refreshed);
        setFlashMessage('Plat mis à jour avec succès !');
        setShowModal(false);
      } catch (error) {
        console.error(error);
        setFlashMessage("Erreur lors de la mise à jour du plat.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      try {
        // Appel de l'API pour créer le menu
        await createMenu(form, restaurantId);
        const refreshed = await fetchMenuData(restaurantId);
        setRows(refreshed);
        setFlashMessage('Plat ajouté avec succès !');
        setShowModal(false);
      } catch (error) {
        setFlashMessage("Erreur lors de l'ajout du plat.");
      } finally {
        setIsSubmitting(false);
      }
    }
  }

  function openManageToday() {
    const currentToday = todayIds;
    setInitialTodayIds(currentToday);
    const top = rows.filter(r => currentToday.includes(r.id));
    const bottom = rows.filter(r => !currentToday.includes(r.id));
    setTopList(top);
    setBottomList(bottom);
    setBottomSearch('');
    setShowManageToday(true);
  }

  function moveToTop(item) {
    setBottomList(prev => prev.filter(x => x.id !== item.id));
    setTopList(prev => [...prev, item]);
  }

  function moveToBottom(item) {
    setTopList(prev => prev.filter(x => x.id !== item.id));
    setBottomList(prev => [...prev, item]);
  }

  async function confirmManageToday() {
    const currentTopIds = topList.map(x => x.id);
    const plus = currentTopIds.filter(id => !initialTodayIds.includes(id));
    const moins = initialTodayIds.filter(id => !currentTopIds.includes(id));
    try {
      const email = getAuthInfo().display_name;
      const employe = await getUserByEmail(email);
      console.log(employe);
      const employeId = employe.id_user;
      console.log(employeId);
      if (plus.length) await addMenusDuJour(employeId, plus);
      if (moins.length) await removeMenusDuJour(moins);
      const ids = await fetchMenusDuJourIds();
      setTodayIds(ids);
      setShowManageToday(false);
      setFlashMessage('Menus du jour mis à jour.');
    } catch (e) {
      setFlashMessage("Erreur lors de la mise à jour des menus du jour.");
    }
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
            <option value="Boisson">Boisson</option>
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
            {loading ? (
              <tr>
                <td colSpan="7" style={{ padding: '16px', textAlign: 'center', color: '#6b7280' }}>Chargement du menu...</td>
              </tr>
            ) : pageItems.length > 0 ? (pageItems.map(r => (
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
            ))) : (
              <tr><td colSpan="7" style={{ padding: 16, textAlign: 'center', color: '#6b7280' }}>Aucun plat trouvé.</td></tr>
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

      <div style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Menus du jour</div>
          <button onClick={openManageToday} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            Gérer les menus du jour
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: windowWidth > 992 ? 'repeat(4, 1fr)' : windowWidth > 576 ? 'repeat(2, 1fr)' : '1fr', gap: '1rem', marginTop: '1rem' }}>
          {rows.filter(r => todayIds.includes(r.id)).map(r => (
            <div key={r.id} style={{ background: '#fff', borderRadius: 12, padding: 12, boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
              <img src={r.image || 'https://images.unsplash.com/photo-1550317138-10000687a72b?w=400&q=70&auto=format&fit=crop'} alt="mini" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8 }} onError={(e)=>{ e.currentTarget.src = 'https://images.unsplash.com/photo-1550317138-10000687a72b?w=400&q=70&auto=format&fit=crop'; }} />
              <div style={{ marginTop: 8, fontWeight: 600 }}>{r.name}</div>
              <div style={{ color: '#6b7280', fontSize: 12 }}>{r.category} • {money(r.price)}</div>
            </div>
          ))}
          <button onClick={openManageToday} style={{ border: '2px dashed #e5e7eb', background: '#fff', borderRadius: 12, padding: 12, minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+
          </button>
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: isSubmitting ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, pointerEvents: isSubmitting ? 'auto' : 'all' }}>
          <div style={{ width: 'min(520px, 92vw)', background: '#fff', borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
            <div style={{ padding: 16, borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: '#e8f1ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                  <IconPlus />
                </div>
                <div style={{ fontWeight: 700 }}>{editing ? 'Éditer le plat' : 'Nouveau plat'}</div>
              </div>
              <button onClick={()=>setShowModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }} aria-label="Fermer" disabled={isSubmitting}>
                <IconX />
              </button>
            </div>
            <form onSubmit={saveForm} style={{ padding: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Nom</label>
                  <input required value={form.name} onChange={(e)=>setForm({ ...form, name: e.target.value })} placeholder="Nom du plat" style={{ width: '100%', border: '1px solid #e5e7eb', padding: '8px 12px', borderRadius: 8 }} disabled={isSubmitting} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Description</label>
                  <textarea value={form.description} onChange={(e)=>setForm({ ...form, description: e.target.value })} placeholder="Description du plat" style={{ width: '100%', border: '1px solid #e5e7eb', padding: '8px 12px', borderRadius: 8, minHeight: '80px' }} disabled={isSubmitting} />
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
                    <input type="number" value={form.price} onChange={(e)=>setForm({ ...form, price: Number(e.target.value) })} style={{ width: '100%', border: '1px solid #e5e7eb', padding: '8px 12px', borderRadius: 8 }} disabled={isSubmitting} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Image du plat</label>
                  {form.image && (
                    <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center' }}>
                      <img src={form.image} alt="aperçu" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }} />
                      <button type="button" onClick={()=>setForm({ ...form, image: '', image_id: null })} style={{ marginLeft: 8, border: '1px solid #e5e7eb', background: '#fff', padding: '6px 10px', borderRadius: 8 }} disabled={isSubmitting}>Retirer</button>
                    </div>
                  )}
                  <div
                    onDragOver={(e)=>{e.preventDefault(); setDragActive(true);}}
                    onDragLeave={()=>setDragActive(false)}
                    onDrop={(e)=>{e.preventDefault(); setDragActive(false); const f = e.dataTransfer.files?.[0]; if (f) handleImageChange(f);}}
                    style={{
                      border: `2px dashed ${dragActive ? '#2563eb' : '#e5e7eb'}`,
                      padding: 16,
                      borderRadius: 8,
                      textAlign: 'center',
                      color: '#6b7280',
                      background: dragActive ? '#eff6ff' : '#fff'
                    }}
                  >
                    Déposez l'image ici ou cliquez pour sélectionner
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={isSubmitting}
                      style={{ display: 'block', margin: '8px auto' }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Disponibilité</label>
                  <select value={form.available ? 'yes' : 'no'} onChange={(e)=>setForm({ ...form, available: e.target.value==='yes' })} style={{ width: '100%', border: '1px solid #e5e7eb', padding: '8px 12px', borderRadius: 8 }} disabled={isSubmitting}>
                    <option value="yes">Disponible</option>
                    <option value="no">Indisponible</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
                <button type="button" onClick={()=>setShowModal(false)} style={{ border: '1px solid #e5e7eb', background: '#fff', padding: '8px 12px', borderRadius: 8 }} disabled={isSubmitting}>Annuler</button>
                <button type="submit" style={{ border: '1px solid #2563eb', background: '#2563eb', color: '#fff', padding: '8px 12px', borderRadius: 8 }} disabled={isSubmitting}>{isSubmitting ? 'Sauvegarde...' : (editing ? 'Enregistrer' : 'Créer')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showManageToday && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ width: 'min(680px, 96vw)', background: '#fff', borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
            <div style={{ padding: 16, borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 700 }}>Gérer les menus du jour</div>
              <button onClick={()=>setShowManageToday(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }} aria-label="Fermer">
                ✕
              </button>
            </div>
            <div style={{ padding: 16, display: 'grid', gap: 16 }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Sélectionnés pour aujourd'hui</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 10 }}>
                  {topList.map(item => (
                    <div key={item.id} style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 10 }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <img src={item.image || 'https://images.unsplash.com/photo-1550317138-10000687a72b?w=200&q=70&auto=format&fit=crop'} alt="" style={{ width: 56, height: 40, objectFit: 'cover', borderRadius: 6 }} onError={(e)=>{ e.currentTarget.src = 'https://images.unsplash.com/photo-1550317138-10000687a72b?w=200&q=70&auto=format&fit=crop'; }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div>
                          <div style={{ color: '#6b7280', fontSize: 12 }}>{money(item.price)}</div>
                        </div>
                        <button onClick={()=>moveToBottom(item)} style={{ border: '1px solid #e5e7eb', background: '#fff', padding: '6px 10px', borderRadius: 8 }}>−</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Autres menus</div>
                <div style={{ marginBottom: 10 }}>
                  <input
                    value={bottomSearch}
                    onChange={(e)=>setBottomSearch(e.target.value)}
                    placeholder="Rechercher dans les autres menus..."
                    style={{ width: '100%', border: '1px solid #e5e7eb', padding: '8px 12px', borderRadius: 8 }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 10 }}>
                  {bottomList.filter(item => item.name.toLowerCase().includes(bottomSearch.toLowerCase())).map(item => (
                    <div key={item.id} style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 10 }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <img src={item.image || 'https://images.unsplash.com/photo-1550317138-10000687a72b?w=200&q=70&auto=format&fit=crop'} alt="" style={{ width: 56, height: 40, objectFit: 'cover', borderRadius: 6 }} onError={(e)=>{ e.currentTarget.src = 'https://images.unsplash.com/photo-1550317138-10000687a72b?w=200&q=70&auto=format&fit=crop'; }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div>
                          <div style={{ color: '#6b7280', fontSize: 12 }}>{money(item.price)}</div>
                        </div>
                        <button onClick={()=>moveToTop(item)} style={{ border: '1px solid #e5e7eb', background: '#fff', padding: '6px 10px', borderRadius: 8 }}>+</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ padding: 12, display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid #f1f5f9' }}>
              <button onClick={()=>setShowManageToday(false)} style={{ border: '1px solid #e5e7eb', background: '#fff', padding: '8px 12px', borderRadius: 8 }}>Annuler</button>
              <button onClick={confirmManageToday} style={{ border: '1px solid #2563eb', background: '#2563eb', color: '#fff', padding: '8px 12px', borderRadius: 8 }}>Confirmer</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
