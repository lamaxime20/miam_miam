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

const revenueData = [
  { month: 'Jan', revenus: 12500, commandes: 342 },
  { month: 'Fév', revenus: 11800, commandes: 318 },
  { month: 'Mar', revenus: 15200, commandes: 425 },
  { month: 'Avr', revenus: 14600, commandes: 398 },
  { month: 'Mai', revenus: 18100, commandes: 512 },
  { month: 'Jun', revenus: 17800, commandes: 489 },
  { month: 'Jul', revenus: 21200, commandes: 598 },
  { month: 'Aoû', revenus: 19500, commandes: 542 },
  { month: 'Sep', revenus: 16800, commandes: 467 },
  { month: 'Oct', revenus: 18900, commandes: 523 },
];

const categoryData = [
  { name: 'Plats', value: 45, color: '#cfbd97' },
  { name: 'Entrées', value: 20, color: '#6b7280' },
  { name: 'Desserts', value: 18, color: '#000000' },
  { name: 'Boissons', value: 17, color: '#3b82f6' },
];

const topProducts = [
  { name: 'Burger Premium', sales: 1234, revenue: 19620.60 },
  { name: 'Pizza Margherita', sales: 987, revenue: 12732.30 },
  { name: 'Salade César', sales: 845, revenue: 8027.50 },
  { name: 'Pâtes Carbonara', sales: 756, revenue: 10508.40 },
  { name: 'Tiramisu Maison', sales: 623, revenue: 4049.50 },
];

const hourlyData = [
  { hour: '11h', commandes: 12 },
  { hour: '12h', commandes: 45 },
  { hour: '13h', commandes: 38 },
  { hour: '14h', commandes: 22 },
  { hour: '18h', commandes: 28 },
  { hour: '19h', commandes: 52 },
  { hour: '20h', commandes: 48 },
  { hour: '21h', commandes: 35 },
  { hour: '22h', commandes: 18 },
];

export function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl">Rapports & Analyses</h2>
          <p className="text-sm text-gray-500">Vue d'ensemble de vos performances</p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="month">
            <SelectTrigger className="w-[180px] border-gray-300">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="quarter">Ce trimestre</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
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
                <p className="text-2xl">156,420 €</p>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>+12.5%</span>
                </div>
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
                <p className="text-2xl">4,614</p>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>+8.3%</span>
                </div>
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
                <p className="text-2xl">33.90 €</p>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>+3.8%</span>
                </div>
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
                <p className="text-2xl">2,847</p>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>+15.2%</span>
                </div>
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
            <p className="text-sm text-gray-500 mb-6">Revenus mensuels (10 derniers mois)</p>
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
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => [`${value} €`, 'Revenus']}
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
                    <p className="text-xs text-gray-500">{product.sales} ventes</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{product.revenue.toFixed(2)} €</p>
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
              <p className="text-xl">Samedi</p>
              <p className="text-sm text-gray-600">Moyenne: 78 commandes</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-2">Heure de pointe</p>
              <p className="text-xl">19h - 20h</p>
              <p className="text-sm text-gray-600">52 commandes/heure</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-2">Taux de satisfaction</p>
              <p className="text-xl">94.5%</p>
              <p className="text-sm text-gray-600">+2.3% vs mois dernier</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
