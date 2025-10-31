import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, TrendingUp, Users, ShoppingBag, DollarSign, Calendar } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { fetchReportsPageData } from '../../../services/ReportAdmin';
import { useEffect, useState } from 'react';

export function ReportsPage() {
  const [revenueData, setRevenueData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);
  const [kpis, setKpis] = useState({
    total_revenue: 0,
    total_orders: 0,
    avg_basket: 0,
    unique_customers: 0
  });
  const [summary, setSummary] = useState({
    best_day: 'N/A',
    avg_orders: 0,
    peak_hour: 'N/A',
    peak_hour_orders: 0,
    satisfaction_percent: 0
  });
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fonction pour calculer les dates de début/fin selon la période
  const getDateRange = (period: 'week' | 'month' | 'quarter' | 'year') => {
    const now = new Date();
    let start = new Date();
    let end = now;

    switch (period) {
      case 'week':
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        start.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(now.getFullYear(), 0, 1);
        break;
      default:
        start.setMonth(now.getMonth() - 1);
    }

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const stored = localStorage.getItem('auth_token');
      const restaurantId = stored ? Number(JSON.parse(stored)?.restaurant) : null;
      if (!restaurantId) {
        throw new Error('Aucun restaurant sélectionné');
      }

      const dateRange = getDateRange(period);
      const data = await fetchReportsPageData({
        restaurantId,
        startDate: dateRange.start,
        endDate: dateRange.end,
        months: 10,
        limit: 5
      });

      setRevenueData(data.revenueData);
      setCategoryData(data.categoryData);
      setTopProducts(data.topProducts);
      setHourlyData(data.hourlyData);
      setKpis(data.kpis);
      setSummary(data.summary);
    } catch (err) {
      // @ts-ignore
      setError((err && err.message) ? err.message : 'Erreur inconnue');
      console.error('Erreur chargement données:', err);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données au montage et quand la période change
  useEffect(() => {
    loadData();
  }, [period]);

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
  };

  if (loading) {
    return <div className="p-8 text-center">Chargement des données...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">Erreur: {error}</div>;
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl">Rapports & Analyses</h2>
          <p className="text-sm text-gray-500">Vue d'ensemble de vos performances</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[180px] border-gray-300">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">7 derniers jours</SelectItem>
              <SelectItem value="month">30 derniers jours</SelectItem>
              <SelectItem value="quarter">3 derniers mois</SelectItem>
              <SelectItem value="year">12 derniers mois</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-[#cfbd97] hover:bg-[#bfad87] text-black gap-2">
            <Download className="h-4 w-4" />
            Exporter PDF
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Revenus Totaux</p>
                <p className="text-2xl">{kpis.total_revenue.toLocaleString('fr-FR', { style: 'currency', currency: 'XAF' })}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Total Commandes</p>
                <p className="text-2xl">{kpis.total_orders.toLocaleString('fr-FR')}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Panier Moyen</p>
                <p className="text-2xl">{kpis.avg_basket.toLocaleString('fr-FR', { style: 'currency', currency: 'XAF' })}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Clients Uniques</p>
                <p className="text-2xl">{kpis.unique_customers.toLocaleString('fr-FR')}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-gray-200">
          <div className="p-6">
            <h3 className="text-lg mb-1">Évolution des Revenus</h3>
            <p className="text-sm text-gray-500 mb-6">Revenus par période</p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => value.toLocaleString('fr-FR')}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => [Number(value).toLocaleString('fr-FR', { style: 'currency', currency: 'XAF' }), 'Revenus']}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenus" 
                  stroke="#cfbd97" 
                  strokeWidth={3}
                  dot={{ fill: '#cfbd97', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="border-gray-200">
          <div className="p-6">
            <h3 className="text-lg mb-1">Répartition par Catégorie</h3>
            <p className="text-sm text-gray-500 mb-6">Ventes par catégorie de produits</p>
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                    formatter={(value) => [`${value}%`, 'Part']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2 w-full">
                {categoryData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-600">{item.name}: {item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-gray-200">
          <div className="p-6">
            <h3 className="text-lg mb-1">Commandes par Heure</h3>
            <p className="text-sm text-gray-500 mb-6">Distribution journalière</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="hour" 
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
                    borderRadius: '8px'
                  }}
                  formatter={(value) => [value, 'Commandes']}
                />
                <Bar dataKey="commandes" fill="#cfbd97" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="border-gray-200">
          <div className="p-6">
            <h3 className="text-lg mb-1">Top 5 Produits</h3>
            <p className="text-sm text-gray-500 mb-6">Articles les plus vendus</p>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#cfbd97] text-black text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.sales.toLocaleString('fr-FR')} ventes</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{product.revenue.toLocaleString('fr-FR', { style: 'currency', currency: 'XAF' })}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Summary */}
      <Card className="border-gray-200">
        <div className="p-6">
          <h3 className="text-lg mb-4">Résumé Mensuel</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-2">Meilleur jour</p>
              <p className="text-xl">{summary.best_day}</p>
              <p className="text-sm text-gray-600">Moyenne: {summary.avg_orders} commandes</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-2">Heure de pointe</p>
              <p className="text-xl">{summary.peak_hour}</p>
              <p className="text-sm text-gray-600">{summary.peak_hour_orders} commandes/heure</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-2">Taux de satisfaction</p>
              <p className="text-xl">{summary.satisfaction_percent.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
