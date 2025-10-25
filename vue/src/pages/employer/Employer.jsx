import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import UnifiedSidebar from './components/UnifiedSidebar';
import CountUp from './components/common/CountUp';
import Orders from './views/Orders';
import MenuUpdate from './views/MenuUpdate';
import Complaints from './views/Complaints';
import Stats from './views/Stats';
import Employees from './views/Employees';
import './employer.css';

function DashboardView() {
  return (
    <section style={{ paddingTop: 0, paddingBottom: '2rem' }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Tableau de bord</div>
          <div style={{ color: '#6b7280', fontSize: 12 }}>Vue d'ensemble des métriques</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '1rem', marginTop: '1rem' }}>
        {[
          { label: 'Commandes du jour', end: 42 },
          { label: 'CA (K FCFA)', end: 350 },
          { label: 'Tickets ouverts', end: 7 },
          { label: 'Employés actifs', end: 98 },
        ].map((kpi, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
            <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 8 }}>{kpi.label}</div>
            <div style={{ fontWeight: 700, fontSize: 22 }}><CountUp end={kpi.end} /></div>
          </div>
        ))}
      </div>
    </section>
  );
}

function OrdersView() {
  return <div style={{ background:'#fff', borderRadius:12, padding:16 }}>Gestion des commandes (liste, statut, actions)...</div>;
}
function MenuUpdateView() {
  return <div style={{ background:'#fff', borderRadius:12, padding:16 }}>Mise à jour du menu (plats, prix)...</div>;
}
function ComplaintsView() {
  return <div style={{ background:'#fff', borderRadius:12, padding:16 }}>Réclamations clients (tickets)...</div>;
}
function StatsView() {
  return <div style={{ background:'#fff', borderRadius:12, padding:16 }}>Statistiques et graphiques...</div>;
}
function SettingsView() {
  return <div style={{ background:'#fff', borderRadius:12, padding:16 }}>Paramètres de l'espace employeur...</div>;
}

export default function Employer() {
  const [isOpen, setIsOpen] = React.useState(true);
  const [windowWidth, setWindowWidth] = React.useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [activeItem, setActiveItem] = React.useState('admin-dashboard');
  const navigate = useNavigate();

  React.useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Reveal animation on scroll
  React.useEffect(() => {
    const els = Array.from(document.querySelectorAll('.reveal'));
    if (!('IntersectionObserver' in window) || els.length === 0) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [activeItem]);

  const toggleSidebar = useCallback(() => setIsOpen((v) => !v), []);
  const handleNavigate = useCallback((route) => {
    if (route === '/' || route === '/home') {
      navigate('/');
      return;
    }
    setActiveItem(route);
  }, [navigate]);

  const renderView = () => {
    switch (activeItem) {
      case 'admin-dashboard':
        return <DashboardView />;
      case 'orders':
        return <Orders />;
      case 'menu-update':
        return <MenuUpdate />;
      case 'complaints':
        return <Complaints />;
      case 'stats':
        return <Stats />;
      case 'parametres':
        return <SettingsView />;
      case 'employees':
        return <Employees />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div style={{ display: 'flex' }}>
        <UnifiedSidebar isOpen={isOpen} toggleSidebar={toggleSidebar} onNavigate={handleNavigate} activeItem={activeItem} />
        <main style={{
          marginLeft: isOpen ? (windowWidth > 768 ? 260 : 0) : (windowWidth > 768 ? 70 : 0),
          padding: windowWidth > 768 ? 32 : 16,
          minHeight: '100vh',
          background: '#f9f5f0',
          width: '100%'
        }}>
          {renderView()}
        </main>
      </div>
    </div>
  );
}
