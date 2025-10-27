import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { TrendingUp, TrendingDown, Euro, Users, AlertTriangle, Gift } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { CheckCircle, Clock, Package } from 'lucide-react';
import { getVentesAujourdhui, getVentesSemaine, getStatsDashboard } from '../../../services/dashboard';

/**
 * DONNÉES INITIALES (seront remplacées par les données du service)
 * Ces valeurs sont affichées pendant le chargement des données réelles
 */
const statsCardsInitiales = [
  {
    title: 'Ventes Aujourd\'hui',
    value: 'Chargement...',
    change: '+0% vs hier',
    trend: 'up',
    icon: Euro,
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  {
    title: 'Utilisateurs Actifs',
    value: '1,247',
    change: '+8.2% ce mois',
    trend: 'up',
    icon: Users,
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    title: 'Réclamations',
    value: '23',
    change: '5 non traitées',
    trend: 'down',
    icon: AlertTriangle,
    bgColor: 'bg-red-100',
    iconColor: 'text-red-600',
  },
  {
    title: 'Points Fidélité',
    value: '45,892',
    change: 'Points distribués',
    trend: 'up',
    icon: Gift,
    bgColor: 'bg-[#cfbd97]/20',
    iconColor: 'text-[#cfbd97]',
  },
];

/**
 * DONNÉES INITIALES DES VENTES (seront remplacées par les données du service)
 */
const salesDataInitiales = [
  { name: 'Lun', ventes: 0 },
  { name: 'Mar', ventes: 0 },
  { name: 'Mer', ventes: 0 },
  { name: 'Jeu', ventes: 0 },
  { name: 'Ven', ventes: 0 },
  { name: 'Sam', ventes: 0 },
  { name: 'Dim', ventes: 0 },
];

const userDistribution = [
  { name: 'Clients actifs', value: 450, color: '#cfbd97' },
  { name: 'Nouveaux clients', value: 280, color: '#6b7280' },
  { name: 'Clients fidèles', value: 380, color: '#000000' },
];

/**
 * COMMANDES RÉCENTES (montants en XAF)
 * TODO: Connecter à l'API pour récupérer les vraies commandes
 */
const recentOrders = [
  { id: '#1234', amount: '29 856 XAF', status: 'Livré', time: 'il y a 5 min', statusColor: 'bg-green-100 text-green-700', icon: CheckCircle },
  { id: '#1235', amount: '21 511 XAF', status: 'En cours', time: 'il y a 12 min', statusColor: 'bg-yellow-100 text-yellow-700', icon: Clock },
  { id: '#1236', amount: '18 957 XAF', status: 'Préparation', time: 'il y a 18 min', statusColor: 'bg-blue-100 text-blue-700', icon: Package },
];

const recentComplaints = [
  { 
    id: '#2341', 
    title: 'Commande froide',
    client: 'Client: Marie Dubois',
    time: 'il y a 2h',
    priority: 'Urgent',
    priorityColor: 'bg-red-100 text-red-700',
    icon: 'bg-red-100 text-red-600'
  },
  { 
    id: '#2340', 
    title: 'Retard livraison',
    client: 'Client: Pierre Martin',
    time: 'il y a 4h',
    priority: 'Moyen',
    priorityColor: 'bg-yellow-100 text-yellow-700',
    icon: 'bg-yellow-100 text-yellow-600'
  },
  { 
    id: '#2339', 
    title: 'Problème résolu',
    client: 'Client: Sophie Leroy',
    time: 'il y a 5h',
    priority: 'Résolu',
    priorityColor: 'bg-green-100 text-green-700',
    icon: 'bg-green-100 text-green-600'
  },
];

export function Dashboard() {
  // ========================================================================
  // ÉTAT DU COMPOSANT
  // ========================================================================
  
  /**
   * État pour stocker les statistiques du dashboard
   * Ces données sont chargées depuis le service dashboard.js
   */
  const [statsCards, setStatsCards] = useState(statsCardsInitiales);
  const [salesData, setSalesData] = useState(salesDataInitiales);
  const [loading, setLoading] = useState(true);

  // ========================================================================
  // CHARGEMENT DES DONNÉES
  // ========================================================================
  
  /**
   * Charger toutes les statistiques au montage du composant
   * 
   * POUR TON COLLÈGUE QUI FERA LA CONNEXION BDD :
   * ----------------------------------------------
   * 1. Les fonctions getVentesAujourdhui(), getVentesSemaine(), etc.
   *    sont dans src/services/dashboard.js
   * 2. Il suffit de remplacer les données mockées par des appels API
   * 3. Le format des données est documenté dans dashboard.js
   * 4. Les montants sont automatiquement convertis EUR -> XAF
   */
  useEffect(() => {
    async function chargerDonnees() {
      try {
        setLoading(true);
        
        // Charger les ventes du jour
        const ventesData = await getVentesAujourdhui();
        
        // Charger les ventes de la semaine
        const ventesSemaineData = await getVentesSemaine();
        
        // Charger toutes les stats
        const statsData = await getStatsDashboard();
        
        // Mettre à jour les cartes de statistiques
        if (statsData) {
          setStatsCards([
            {
              title: 'Ventes Aujourd\'hui',
              value: statsData.ventesAujourdhui.totalFormate,
              change: `+${ventesData.pourcentage_vs_hier}% vs hier`,
              trend: ventesData.pourcentage_vs_hier >= 0 ? 'up' : 'down',
              icon: Euro,
              bgColor: 'bg-green-100',
              iconColor: 'text-green-600',
            },
            {
              title: 'Utilisateurs Actifs',
              value: statsData.utilisateursActifs.toLocaleString('fr-FR'),
              change: '+8.2% ce mois',
              trend: 'up',
              icon: Users,
              bgColor: 'bg-blue-100',
              iconColor: 'text-blue-600',
            },
            {
              title: 'Réclamations',
              value: statsData.reclamations.toString(),
              change: '5 non traitées',
              trend: 'down',
              icon: AlertTriangle,
              bgColor: 'bg-red-100',
              iconColor: 'text-red-600',
            },
            {
              title: 'Points Fidélité',
              value: statsData.pointsFidelite.toLocaleString('fr-FR'),
              change: 'Points distribués',
              trend: 'up',
              icon: Gift,
              bgColor: 'bg-[#cfbd97]/20',
              iconColor: 'text-[#cfbd97]',
            },
          ]);
        }
        
        // Mettre à jour les données de ventes de la semaine
        if (ventesSemaineData && ventesSemaineData.length > 0) {
          setSalesData(ventesSemaineData.map(jour => ({
            name: jour.jour,
            ventes: jour.ventes
          })));
        }
        
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    }
    
    chargerDonnees();
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <p className="text-sm text-gray-500">{stat.title}</p>
                    <p className="text-2xl">{stat.value}</p>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      {stat.trend === 'up' ? (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      )}
                      <span className="text-xs">{stat.change}</span>
                    </div>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolution des Ventes */}
        <Card className="border-gray-200">
          <div className="p-6">
            <h3 className="text-lg mb-1">Évolution des Ventes</h3>
            <p className="text-sm text-gray-500 mb-6">Ventes par jour (7 derniers jours)</p>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                  formatter={(value) => [`${value} €`, 'Ventes']}
                />
                <Line 
                  type="monotone" 
                  dataKey="ventes" 
                  stroke="#cfbd97" 
                  strokeWidth={3}
                  dot={{ fill: '#cfbd97', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Répartition des Utilisateurs */}
        <Card className="border-gray-200">
          <div className="p-6">
            <h3 className="text-lg mb-1">Répartition des Clients</h3>
            <p className="text-sm text-gray-500 mb-6">Par catégorie</p>
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={userDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {userDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-3 gap-4 w-full">
                {userDistribution.map((item) => (
                  <div key={item.name} className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs text-gray-600">{item.name}</span>
                    </div>
                    <p className="text-sm">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Commandes Récentes */}
        <Card className="border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg">Commandes Récentes</h3>
              <button className="text-sm text-[#cfbd97] hover:underline">
                Voir tout
              </button>
            </div>
            <div className="space-y-4">
              {recentOrders.map((order) => {
                const Icon = order.icon;
                return (
                  <div 
                    key={order.id} 
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className={`${order.statusColor} p-2 rounded-lg`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">Commande {order.id}</p>
                      <p className="text-xs text-gray-500">{order.amount} • {order.status}</p>
                    </div>
                    <p className="text-xs text-gray-400">{order.time}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Réclamations Récentes */}
        <Card className="border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg">Réclamations Récentes</h3>
              <button className="text-sm text-[#cfbd97] hover:underline">
                Gérer
              </button>
            </div>
            <div className="space-y-4">
              {recentComplaints.map((complaint) => (
                <div 
                  key={complaint.id} 
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className={`${complaint.icon} p-2 rounded-lg`}>
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{complaint.title}</p>
                    <p className="text-xs text-gray-500">{complaint.client}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${complaint.priorityColor}`}>
                      {complaint.priority}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">{complaint.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
