import React from 'react';
import { logout } from '../../../services/user';

const IconDashboard = (props) => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="3" width="7" height="7"/>
    <rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
  </svg>
);

const IconAlert = (props) => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const IconBars = (props) => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

const IconBag = (props) => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M6 2l.01 4M18 2l-.01 4"/>
    <path d="M3 7h18l-1.5 12a2 2 0 0 1-2 2H6.5a2 2 0 0 1-2-2L3 7z"/>
    <path d="M7 7a5 5 0 0 0 10 0"/>
  </svg>
);

const IconForkSpoon = (props) => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 3v7a2 2 0 0 0 2 2h0V3"/>
    <path d="M8 3v7a2 2 0 0 1-2 2h0"/>
    <path d="M12 3v7"/>
    <path d="M19 3c-1.657 0-3 1.79-3 4v6"/>
    <path d="M12 14v7"/>
    <path d="M19 13v8"/>
  </svg>
);

const IconSettings = (props) => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c0 .66.26 1.3.73 1.77.47.47 1.11.73 1.77.73H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

const IconHome = (props) => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 10l9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9z"/>
    <path d="M9 22V12h6v10"/>
  </svg>
);

const UnifiedSidebar = ({ isOpen, toggleSidebar, onNavigate, activeItem }) => {
  const menuItems = [
    { icon: IconDashboard, label: 'Dashboard', route: 'admin-dashboard' },
    { icon: IconBag, label: 'Gestion des commandes', route: 'orders' },
    { icon: IconForkSpoon, label: 'Mise à jour du menu', route: 'menu-update' },
    { icon: IconAlert, label: 'Réclamations', route: 'complaints' },
    { icon: IconBars, label: 'Statistiques', route: 'stats' },
    { icon: IconSettings, label: 'Paramètres', route: 'parametres' }
  ];

  const subMenuItems = [];
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  return (
    <>
      {isMobile && isOpen && (
        <div onClick={toggleSidebar} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', zIndex: 900 }} />
      )}

      {isMobile && !isOpen && (
        <button aria-label="Ouvrir le menu" onClick={toggleSidebar} style={{
          position: 'fixed', left: 12, bottom: 16, zIndex: 1100,
          width: 44, height: 44, borderRadius: 999, border: '1px solid #e5e7eb', background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(0,0,0,0.15)'
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      )}

      <aside style={{
        width: isOpen ? 260 : 70,
        padding: '1.5rem',
        background: '#f7f7f8',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        display: isMobile && !isOpen ? 'none' : 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        zIndex: 1001
      }}>
        <div style={{ position: 'absolute', right: '-40px', top: '10px', width: 40, height: 40, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderRadius: '0 8px 8px 0', boxShadow: '4px 0 8px rgba(0,0,0,0.1)' }} onClick={toggleSidebar}>
          <span style={{ fontSize: 18, fontWeight: 700 }}>{isOpen ? '<' : '>'}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{ width: 40, height: 40, borderRadius: 8, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="3"/>
              <path d="M8 3v18M16 3v18"/>
            </svg>
          </div>
          {isOpen && (
            <div>
              <div style={{fontWeight: 700, fontSize: 18}}>Employer</div>
              <div style={{fontSize: 12, color: '#666', marginTop: 2}}>Espace Admin</div>
            </div>
          )}
        </div>

        <div style={{flex: 1}}>
          {menuItems.map((item, index) => (
            <div key={index} onClick={() => item.route && onNavigate && onNavigate(item.route)} style={{ padding: '12px 16px', background: activeItem === item.route ? '#e7f0ff' : 'transparent', borderRadius: 8, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 12, color: activeItem === item.route ? '#1d4ed8' : '#444', cursor: 'pointer', transition: 'all 0.2s', fontSize: 14 }}>
              <item.icon />
              {isOpen && <span>{item.label}</span>}
            </div>
          ))}
        </div>
      </aside>

      <div style={{ position: 'fixed', left: 0, bottom: 16, width: isOpen ? 260 : 70, padding: isOpen ? '0 16px' : '0', display: 'flex', justifyContent: 'center', zIndex: 1002 }}>
        <button onClick={async () => { await logout(); onNavigate && onNavigate('/'); }} style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#111', padding: '8px 12px', borderRadius: 8, width: isOpen ? '100%' : 44, justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} aria-label="Déconnexion">
          <IconHome />
          {isOpen && <span>Déconnexion</span>}
        </button>
      </div>
    </>
  );
};

export default UnifiedSidebar;
