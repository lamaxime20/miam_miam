import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { TrendingUp, TrendingDown, Euro, Users, AlertTriangle, Gift } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { CheckCircle, Clock, Package } from 'lucide-react';
import { getVentesAujourdhui, getVentesSemaine, getStatsDashboard, getUserdistribution, getRecentOrder, getRecentComplaints } from '../../../services/dashboard';

// Types des données renvoyées par l'API
interface VenteJour { jour: string; ventes: number }
interface StatsData {
  ventesAujourdhui: { total?: number; totalFormate?: string }
  utilisateursActifs: number
  pourcentage_utilisateurs_ajoutes_ce_mois: number
  reclamations: number
  reclamations_non_traitees: number
  pourcentage_reclamation_non_traite_ajoute_ce_mois: number
  pointsFidelite: number
  pourcentage_points_donne_ce_mois: number
}
interface UserDistribItem { name: string; value: number; color: string }
type OrderStatus = 'Livré' | 'En cours' | 'Préparation' | string
interface Order { id: string; amount: number | string; status: OrderStatus; time: string }
interface DecoratedOrder extends Order { statusColor: string; icon: any }
interface Complaint { id: string; title: string; client: string; time: string; priority: string; priorityColor: string; icon?: string }

// Utilitaires
const formatCurrency = (value: number | string, currency: 'XAF' | 'EUR' = 'XAF') => {
  const num = typeof value === 'string' ? Number(value) : value;
  if (Number.isNaN(num)) return String(value);
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(num);
};

const statusMeta: Record<string, { Icon: any; statusColor: string }> = {
  'Livré': { Icon: CheckCircle, statusColor: 'bg-green-100 text-green-700' },
  'En cours': { Icon: Clock, statusColor: 'bg-yellow-100 text-yellow-700' },
  'Préparation': { Icon: Package, statusColor: 'bg-blue-100 text-blue-700' },
};

const decorateOrder = (o: Order): DecoratedOrder => {
  const meta = statusMeta[o.status] ?? { Icon: Package, statusColor: 'bg-gray-100 text-gray-700' };
  return {
    ...o,
    icon: meta.Icon,
    statusColor: meta.statusColor,
    amount: typeof o.amount === 'number' ? formatCurrency(o.amount, 'XAF') : o.amount,
  };
};

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
  const [distributionuser, setDistributionUser] = useState<UserDistribItem[]>(userDistribution);
  const [commandesRecentes, setCommandesRecentes] = useState<DecoratedOrder[]>(recentOrders as unknown as DecoratedOrder[]);
  const [plaintes, setPlaintes] = useState<Complaint[]>(recentComplaints);
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
      setLoading(true);
      try {
        const [ventesRes, semaineRes, statsRes, distribRes, ordersRes, complaintsRes] = await Promise.allSettled([
          getVentesAujourdhui(),
          getVentesSemaine(),
          getStatsDashboard(),
          getUserdistribution(),
          getRecentOrder(),
          getRecentComplaints(),
        ]);

        const ventesData = ventesRes.status === 'fulfilled' ? ventesRes.value as any : undefined;
        const ventesSemaineData = semaineRes.status === 'fulfilled' ? (semaineRes.value as VenteJour[]) : [];
        const statsData = statsRes.status === 'fulfilled' ? (statsRes.value as StatsData) : undefined;
        const userDistrib = distribRes.status === 'fulfilled' ? (distribRes.value as UserDistribItem[]) : undefined;
        const orders = ordersRes.status === 'fulfilled' ? (ordersRes.value as Order[]) : undefined;
        const reclamationRecents = complaintsRes.status === 'fulfilled' ? (complaintsRes.value as Complaint[]) : undefined;
        const dataSales = getVentesSemaine();

        if (statsData) {
          const pct = ventesData && typeof ventesData.pourcentage_vs_hier === 'number' ? ventesData.pourcentage_vs_hier : 0;
          const ventesValue = statsData.ventesAujourdhui?.totalFormate ?? (statsData.ventesAujourdhui?.total != null ? formatCurrency(statsData.ventesAujourdhui.total, 'XAF') : formatCurrency(0, 'XAF'));
          setStatsCards([
            {
              title: 'Ventes Aujourd\'hui',
              value: ventesValue,
              change: `${pct >= 0 ? '+' : ''}${pct}% vs hier`,
              trend: pct >= 0 ? 'up' : 'down',
              icon: Euro,
              bgColor: 'bg-green-100',
              iconColor: 'text-green-600',
            },
            {
              title: 'Utilisateurs Actifs',
              value: statsData.utilisateursActifs.toLocaleString('fr-FR'),
              change: `${statsData.pourcentage_utilisateurs_ajoutes_ce_mois >= 0 ? '+' : ''}${statsData.pourcentage_utilisateurs_ajoutes_ce_mois}% ce mois`,
              trend: statsData.pourcentage_utilisateurs_ajoutes_ce_mois >= 0 ? 'up' : 'down',
              icon: Users,
              bgColor: 'bg-blue-100',
              iconColor: 'text-blue-600',
            },
            {
              title: 'Réclamations',
              value: statsData.reclamations.toString(),
              change: `${statsData.reclamations_non_traitees} non traitées`,
              trend: statsData.pourcentage_reclamation_non_traite_ajoute_ce_mois <= 0 ? 'up' : 'down',
              icon: AlertTriangle,
              bgColor: 'bg-red-100',
              iconColor: 'text-red-600',
            },
            {
              title: 'Points Fidélité',
              value: statsData.pointsFidelite.toLocaleString('fr-FR'),
              change: 'Points distribués',
              trend: statsData.pourcentage_points_donne_ce_mois >= 0 ? 'up' : 'down',
              icon: Gift,
              bgColor: 'bg-[#cfbd97]/20',
              iconColor: 'text-[#cfbd97]',
            },
          ]);
        }

        if (ventesSemaineData && ventesSemaineData.length > 0) {
          setSalesData(ventesSemaineData.map((jour) => ({ name: jour.jour, ventes: jour.ventes })));
        }

        if (userDistrib) {
          setDistributionUser(userDistrib);
        }

        if (orders) {
          setCommandesRecentes(orders.map(decorateOrder));
        }

        if (reclamationRecents) {
          setPlaintes(reclamationRecents);
        }
        // Await the promise returned by getVentesSemaine()
        if(dataSales) {
          setSalesData(await dataSales);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    }

    chargerDonnees();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map((i) => (
            <Card key={i} className="border-gray-200">
              <CardContent className="p-6 animate-pulse">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="h-3 w-24 bg-gray-200 rounded" />
                    <div className="h-6 w-32 bg-gray-200 rounded" />
                    <div className="h-3 w-28 bg-gray-200 rounded" />
                  </div>
                  <div className="p-3 rounded-lg bg-gray-100 h-10 w-10" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1,2].map((i) => (
            <Card key={i} className="border-gray-200">
              <div className="p-6 animate-pulse">
                <div className="h-4 w-48 bg-gray-200 rounded mb-2" />
                <div className="h-3 w-60 bg-gray-200 rounded mb-6" />
                <div className="h-72 w-full bg-gray-100 rounded" />
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1,2].map((i) => (
            <Card key={i} className="border-gray-200">
              <div className="p-6 animate-pulse space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-40 bg-gray-200 rounded" />
                  <div className="h-4 w-16 bg-gray-200 rounded" />
                </div>
                {[1,2,3].map((j) => (
                  <div key={j} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="p-2 rounded-lg bg-gray-100 h-8 w-8" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-40 bg-gray-200 rounded" />
                      <div className="h-3 w-32 bg-gray-200 rounded" />
                    </div>
                    <div className="h-3 w-20 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

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
                  formatter={(value: number) => [formatCurrency(value, 'XAF'), 'Ventes (XAF)']}
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
                    data={distributionuser}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {distributionuser.map((entry, index) => (
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
                {distributionuser.map((item) => (
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
              {commandesRecentes.map((order) => {
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
              {plaintes.map((complaint) => (
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
