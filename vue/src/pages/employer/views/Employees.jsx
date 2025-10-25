import React, { useEffect, useState } from 'react';
import CountUp from '../components/common/CountUp';

const IconPlus = (props) => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const IconUsersSolid = (props) => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M16 11c1.66 0 3-1.57 3-3.5S17.66 4 16 4s-3 1.57-3 3.5 1.34 3.5 3 3.5zm-8 0c1.66 0 3-1.57 3-3.5S9.66 4 8 4 5 5.57 5 7.5 6.34 11 8 11zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
  </svg>
);

const IconCheck = (props) => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M20 6L9 17l-5-5"/>
  </svg>
);

const IconCalendar = (props) => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const IconUserPlus = (props) => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <line x1="19" y1="8" x2="19" y2="14"/>
    <line x1="16" y1="11" x2="22" y2="11"/>
  </svg>
);

export default function Employees() {
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section className="container reveal" style={{ paddingTop: 0, paddingBottom: '2rem' }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Gestion des Employés</div>
          <div style={{ color: '#6b7280', fontSize: 12 }}>Gérez et organisez votre équipe</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} />
      </div>

      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#e8f1ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
            <IconUsersSolid />
          </div>
          <div>
            <h2 className="section-title" style={{ margin: 0 }}>Liste des Employés</h2>
            <p className="section-subtitle" style={{ margin: 0, color: '#6b7280' }}>Gérez les informations de vos employés</p>
          </div>
        </div>
        <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconPlus />
          Créer un employé
        </button>
      </div>

      <div className="cards" style={{ display: 'grid', gridTemplateColumns: windowWidth > 992 ? 'repeat(4, 1fr)' : windowWidth > 576 ? 'repeat(2, 1fr)' : '1fr', gap: '1rem', marginTop: '1rem' }}>
        <div className="card" style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 6px rgba(0,0,0,0.05)', position: 'relative' }}>
          <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 8 }}>Total Employés</div>
          <div style={{ fontWeight: 700, fontSize: 22 }}><CountUp end={124} /></div>
          <div style={{ position: 'absolute', right: 12, top: 12, width: 36, height: 36, borderRadius: 10, background: '#e8f1ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
            <IconUsersSolid />
          </div>
        </div>
        <div className="card" style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 6px rgba(0,0,0,0.05)', position: 'relative' }}>
          <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 8 }}>Présents Aujourd'hui</div>
          <div style={{ fontWeight: 700, fontSize: 22 }}><CountUp end={98} /></div>
          <div style={{ position: 'absolute', right: 12, top: 12, width: 36, height: 36, borderRadius: 10, background: '#E8FFF3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
            <IconCheck />
          </div>
        </div>
        <div className="card" style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 6px rgba(0,0,0,0.05)', position: 'relative' }}>
          <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 8 }}>En Congé</div>
          <div style={{ fontWeight: 700, fontSize: 22 }}><CountUp end={12} /></div>
          <div style={{ position: 'absolute', right: 12, top: 12, width: 36, height: 36, borderRadius: 10, background: '#FFF6E5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
            <IconCalendar />
          </div>
        </div>
        <div className="card" style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 6px rgba(0,0,0,0.05)', position: 'relative' }}>
          <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 8 }}>Nouveaux ce mois</div>
          <div style={{ fontWeight: 700, fontSize: 22 }}><CountUp end={8} /></div>
          <div style={{ position: 'absolute', right: 12, top: 12, width: 36, height: 36, borderRadius: 10, background: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6' }}>
            <IconUserPlus />
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, padding: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.04)', marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <span style={{ position: 'absolute', left: 12, top: 10, color: '#9ca3af' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </span>
          <input placeholder="Rechercher un employé..." style={{ width: '100%', border: '1px solid #e5e7eb', padding: '8px 12px 8px 36px', borderRadius: 8, outline: 'none' }} />
        </div>
        <div>
          <button style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #e5e7eb', background: '#fff', padding: '8px 12px', borderRadius: 8 }}>
            Tous les départements
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
        </div>
      </div>

      <div className="table-wrapper" style={{ marginTop: '0.75rem', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
        <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f7f7f8' }}>
            <tr>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#6b7280', fontWeight: 500 }}>Employé</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#6b7280', fontWeight: 500 }}>Poste</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#6b7280', fontWeight: 500 }}>Département</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#6b7280', fontWeight: 500 }}>Statut</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#6b7280', fontWeight: 500 }}>Date d'embauche</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#6b7280', fontWeight: 500 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {[
              {name: 'Marie Dubois', email: 'marie.dubois@company.com', avatar: 'https://i.pravatar.cc/80?img=5', role: 'Développeuse Senior', dept: 'IT', status: 'Actif', statusColor: '#DCFCE7', statusTextColor: '#16a34a', date: '15/03/2022'},
              {name: 'Jean Martin', email: 'jean.martin@company.com', avatar: 'https://i.pravatar.cc/80?img=12', role: 'Chef de Projet', dept: 'IT', status: 'Actif', statusColor: '#DCFCE7', statusTextColor: '#16a34a', date: '08/01/2021'},
              {name: 'Sophie Laurent', email: 'sophie.laurent@company.com', avatar: 'https://i.pravatar.cc/80?img=47', role: 'Responsable RH', dept: 'RH', status: 'En congé', statusColor: '#FEF9C3', statusTextColor: '#a16207', date: '12/06/2020'},
              {name: 'Pierre Durand', email: 'pierre.durand@company.com', avatar: 'https://i.pravatar.cc/80?img=30', role: 'Analyste Financier', dept: 'Finance', status: 'Actif', statusColor: '#DCFCE7', statusTextColor: '#16a34a', date: '22/09/2023'}
            ].map((u, i) => (
              <tr key={i} style={{ borderTop: '1px solid #eef2f7' }}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img src={u.avatar} alt={u.name} style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</div>
                      <div style={{ color: '#6b7280', fontSize: 12 }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>{u.role}</td>
                <td style={{ padding: '12px 16px' }}>{u.dept}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ background: u.statusColor, color: u.statusTextColor, borderRadius: 999, padding: '4px 10px', fontSize: 12, fontWeight: 600 }}>{u.status}</span>
                </td>
                <td style={{ padding: '12px 16px' }}>{u.date}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <a href="#" aria-label="Voir" onClick={(e)=>e.preventDefault()} style={{ color: '#3b82f6' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </a>
                    <a href="#" aria-label="Éditer" onClick={(e)=>e.preventDefault()} style={{ color: '#10b981' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
                    </a>
                    <a href="#" aria-label="Supprimer" onClick={(e)=>e.preventDefault()} style={{ color: '#ef4444' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: '#fff' }}>
          <div style={{ color: '#6b7280', fontSize: 12 }}>Affichage de 1 à 4 sur 124 résultats</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button style={{ border: '1px solid #e5e7eb', background: '#fff', padding: '6px 10px', borderRadius: 8 }}>Précédent</button>
            <button style={{ border: '1px solid #2563eb', background: '#2563eb', color: '#fff', padding: '6px 10px', borderRadius: 8 }}>1</button>
            <button style={{ border: '1px solid #e5e7eb', background: '#fff', padding: '6px 10px', borderRadius: 8 }}>2</button>
            <button style={{ border: '1px solid #e5e7eb', background: '#fff', padding: '6px 10px', borderRadius: 8 }}>3</button>
            <button style={{ border: '1px solid #e5e7eb', background: '#fff', padding: '6px 10px', borderRadius: 8 }}>Suivant</button>
          </div>
        </div>
      </div>
    </section>
  );
}
