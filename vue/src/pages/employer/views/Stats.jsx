import React, { useEffect, useMemo, useState } from 'react';
import CountUp from '../components/common/CountUp';
import SimpleLineChart from '../components/common/SimpleLineChart';
import SimplePieChart from '../components/common/SimplePieChart';
import SimpleBarChart from '../components/common/SimpleBarChart';
import { getEmployerStats } from '../../../services/EmployerStats';

const IconBars = (props) => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

const money = (n)=> new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(Math.round(Number(n||0)));

export default function Stats() {
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [period, setPeriod] = useState('30');

  const [data, setData] = useState({ orders: 0, delivered: 0, revenue: 0, avgTicket: 0, complaints: 0, newDishes: 0 });

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const days = Number(period) || 30;
        const stats = await getEmployerStats({ restaurantId: 1, days });
        if (!mounted) return;
        setData(d => ({
          ...d,
          orders: stats?.orders ?? 0,
          delivered: stats?.delivered ?? 0,
          revenue: stats?.revenue ?? 0,
          avgTicket: stats?.avgTicket ?? 0,
          newDishes: stats?.newDishes ?? 0,
        }));
      } catch (e) {
        console.error('Erreur récupération stats employeur:', e);
      }
    })();
    return () => { mounted = false; };
  }, [period]);

  const trends = useMemo(() => {
    const growth = ((data.delivered / Math.max(1, data.orders)) * 100).toFixed(0);
    const conv = ((data.revenue / Math.max(1, data.orders)) ).toFixed(2);
    return { growth, conv };
  }, [data]);

  const table = useMemo(() => ([
    { metric: 'Commandes', value: data.orders },
    { metric: 'Livrées', value: data.delivered },
    { metric: 'Revenu', value: money(data.revenue) },
    { metric: 'Panier moyen', value: money(data.avgTicket) },
    { metric: 'Réclamations', value: data.complaints },
    { metric: 'Nouveaux plats', value: data.newDishes },
  ]), [data]);

  return (
    <section className="container reveal" style={{ paddingTop: 0, paddingBottom: '2rem' }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#faf5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9333ea' }}>
            <IconBars />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Statistiques</div>
            <div style={{ color: '#6b7280', fontSize: 12 }}>Vue d’ensemble des performances</div>
          </div>
        </div>
        <div>
          <select value={period} onChange={(e)=>setPeriod(e.target.value)} style={{ border: '1px solid #e5e7eb', background: '#fff', padding: '8px 12px', borderRadius: 8 }}>
            <option value="7">7 jours</option>
            <option value="30">30 jours</option>
            <option value="90">90 jours</option>
          </select>
        </div>
      </div>

      <div className="cards" style={{ display: 'grid', gridTemplateColumns: windowWidth > 992 ? 'repeat(4, 1fr)' : windowWidth > 576 ? 'repeat(2, 1fr)' : '1fr', gap: '1rem', marginTop: '1rem' }}>
        <div className="card" style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
          <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 8 }}>Commandes</div>
          <div style={{ fontWeight: 700, fontSize: 22 }}><CountUp end={data.orders} /></div>
        </div>
        <div className="card" style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
          <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 8 }}>Livrées</div>
          <div style={{ fontWeight: 700, fontSize: 22 }}><CountUp end={data.delivered} /></div>
        </div>
        <div className="card" style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
          <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 8 }}>Revenu</div>
          <div style={{ fontWeight: 700, fontSize: 22 }}><CountUp end={data.revenue} format suffix=" FCFA" /></div>
        </div>
        <div className="card" style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
          <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 8 }}>Panier moyen</div>
          <div style={{ fontWeight: 700, fontSize: 22 }}><CountUp end={data.avgTicket} format suffix=" FCFA" /></div>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, padding: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.04)', marginTop: '1.25rem' }}>
        <div style={{ fontWeight: 600, marginBottom: 10 }}>Synthèse</div>
        <ul style={{ color: '#374151', lineHeight: 1.8 }}>
          <li>Taux de livraison: <strong><CountUp end={Number(trends.growth)} suffix="%" /></strong></li>
          <li>Revenu par commande: <strong><CountUp end={Number(trends.conv)} format suffix=" FCFA" /></strong></li>
          <li>Réclamations sur la période: <strong><CountUp end={data.complaints} /></strong></li>
          <li>Nouveaux plats publiés: <strong><CountUp end={data.newDishes} /></strong></li>
        </ul>
      </div>

      <div className="reveal" style={{ display:'grid', gridTemplateColumns: windowWidth > 992 ? '1fr 1fr' : '1fr', gap: 16, marginTop: 16 }}>
        <div style={{ background:'#fff', borderRadius:12, padding:16, boxShadow:'0 2px 6px rgba(0,0,0,0.05)' }}>
          <div style={{ fontWeight:600, marginBottom:8 }}>Taux de livraison (%)</div>
          <SimpleLineChart height={120} data={[65,70,72,68,75,80,79]} labels={["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"]} color="#10b981" />
        </div>
        <div style={{ background:'#fff', borderRadius:12, padding:16, boxShadow:'0 2px 6px rgba(0,0,0,0.05)' }}>
          <div style={{ fontWeight:600, marginBottom:8 }}>Revenu par commande (FCFA)</div>
          <SimpleLineChart height={120} data={[38500,40200,39100,41000,42300,43000,42200]} labels={["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"]} color="#cfbd97" />
        </div>
        <div style={{ background:'#fff', borderRadius:12, padding:16, boxShadow:'0 2px 6px rgba(0,0,0,0.05)' }}>
          <div style={{ fontWeight:600, marginBottom:8 }}>Réclamations (nb)</div>
          <SimpleBarChart height={120} data={[1,0,2,3,1,0,1]} labels={["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"]} color="#ef4444" />
        </div>
        <div style={{ background:'#fff', borderRadius:12, padding:16, boxShadow:'0 2px 6px rgba(0,0,0,0.05)' }}>
          <div style={{ fontWeight:600, marginBottom:8 }}>Nouveaux plats (nb)</div>
          <SimpleBarChart height={120} data={[0,1,0,0,2,1,1]} labels={["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"]} color="#8b5cf6" />
        </div>
      </div>

      <div className="reveal" style={{ display:'grid', gridTemplateColumns: windowWidth > 992 ? '1fr 1fr' : '1fr', gap: 16, marginTop: '1rem' }}>
        <div style={{ background:'#fff', borderRadius:12, padding:16, boxShadow:'0 2px 6px rgba(0,0,0,0.05)' }}>
          <div style={{ fontWeight:600, marginBottom:10 }}>Ventes par jour</div>
          <SimpleLineChart height={200} data={[2000,2400,2200,2800,3200,4100,3500]} labels={["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"]} color="#cfbd97" />
        </div>
        <div style={{ background:'#fff', borderRadius:12, padding:16, boxShadow:'0 2px 6px rgba(0,0,0,0.05)' }}>
          <div style={{ fontWeight:600, marginBottom:10 }}>Répartition des commandes</div>
          <SimplePieChart size={220} innerRadius={70} values={[45,30,25]} labels={["Sur place","Livraison","À emporter"]} colors={["#cfbd97","#6b7280","#111"]} />
        </div>
      </div>

      <div className="table-wrapper" style={{ marginTop: '0.75rem', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
        <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f7f7f8' }}>
            <tr>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#6b7280', fontWeight: 500 }}>Métrique</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#6b7280', fontWeight: 500 }}>Valeur</th>
            </tr>
          </thead>
          <tbody>
            {table.map((row, idx) => (
              <tr key={idx} style={{ borderTop: '1px solid #eef2f7' }}>
                <td style={{ padding: '12px 16px' }}>{row.metric}</td>
                <td style={{ padding: '12px 16px' }}>{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
