import { useState } from 'react';
import { convertirPrix } from '../../../services/dashboard';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Search, Filter, Download, Eye, Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';

type OrderStatus = 'en_cours' | 'validée' | 'annulée';

interface Order {
  id: string;
  customer: string;
  email: string;
  date: string;
  total: number;
  status: OrderStatus;
  items: number;
  paymentMethod: string;
  shippingAddress: string;
  products: { name: string; quantity: number; price: number }[];
}

const mockOrders: Order[] = [
  {
    id: 'CMD-1284',
    customer: 'Marie Dubois',
    email: 'marie.dubois@email.com',
    date: '2025-10-24',
    total: 245.00,
    status: 'validée',
    items: 3,
    paymentMethod: 'Carte bancaire',
    shippingAddress: '15 Rue de la Paix, 75002 Paris',
    products: [
      { name: 'Burger Premium', quantity: 2, price: 15.90 },
      { name: 'Frites Maison', quantity: 2, price: 4.50 },
      { name: 'Dessert du jour', quantity: 1, price: 6.50 },
    ],
  },
  {
    id: 'CMD-1283',
    customer: 'Pierre Martin',
    email: 'pierre.martin@email.com',
    date: '2025-10-24',
    total: 128.50,
    status: 'en_cours',
    items: 2,
    paymentMethod: 'PayPal',
    shippingAddress: '28 Avenue des Champs-Élysées, 75008 Paris',
    products: [
      { name: 'Pizza Margherita', quantity: 1, price: 12.90 },
      { name: 'Salade César', quantity: 1, price: 9.50 },
    ],
  },
  {
    id: 'CMD-1282',
    customer: 'Sophie Laurent',
    email: 'sophie.laurent@email.com',
    date: '2025-10-23',
    total: 320.00,
    status: 'en_cours',
    items: 4,
    paymentMethod: 'Carte bancaire',
    shippingAddress: '42 Boulevard Saint-Germain, 75005 Paris',
    products: [
      { name: 'Menu Famille', quantity: 1, price: 45.00 },
      { name: 'Boissons x4', quantity: 4, price: 3.00 },
    ],
  },
  {
    id: 'CMD-1281',
    customer: 'Luc Bernard',
    email: 'luc.bernard@email.com',
    date: '2025-10-23',
    total: 95.00,
    status: 'validée',
    items: 1,
    paymentMethod: 'Virement',
    shippingAddress: '10 Rue du Commerce, 69001 Lyon',
    products: [
      { name: 'Plat du jour', quantity: 1, price: 14.90 },
    ],
  },
  {
    id: 'CMD-1280',
    customer: 'Julie Petit',
    email: 'julie.petit@email.com',
    date: '2025-10-22',
    total: 410.00,
    status: 'en_cours',
    items: 5,
    paymentMethod: 'Carte bancaire',
    shippingAddress: '8 Place Bellecour, 69002 Lyon',
    products: [
      { name: 'Menu Groupe', quantity: 1, price: 89.00 },
    ],
  },
  {
    id: 'CMD-1279',
    customer: 'Thomas Rousseau',
    email: 'thomas.rousseau@email.com',
    date: '2025-10-22',
    total: 185.00,
    status: 'en_cours',
    items: 2,
    paymentMethod: 'Carte bancaire',
    shippingAddress: '33 Rue de la République, 13001 Marseille',
    products: [
      { name: 'Sushi Mix', quantity: 2, price: 24.50 },
    ],
  },
  {
    id: 'CMD-1278',
    customer: 'Émilie Moreau',
    email: 'emilie.moreau@email.com',
    date: '2025-10-21',
    total: 75.00,
    status: 'annulée',
    items: 1,
    paymentMethod: 'PayPal',
    shippingAddress: '5 Avenue du Prado, 13006 Marseille',
    products: [
      { name: 'Plateau Dégustation', quantity: 1, price: 32.00 },
    ],
  },
  {
    id: 'CMD-1277',
    customer: 'Antoine Leroy',
    email: 'antoine.leroy@email.com',
    date: '2025-10-21',
    total: 560.00,
    status: 'validée',
    items: 3,
    paymentMethod: 'Carte bancaire',
    shippingAddress: '12 Rue Nationale, 59000 Lille',
    products: [
      { name: 'Buffet Traiteur', quantity: 1, price: 150.00 },
    ],
  },
];

const statusConfig = {
  en_cours: { label: 'En cours', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock },
  validée: { label: 'Validée', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
  annulée: { label: 'Annulée', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
};

export function OrdersList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>(mockOrders);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  return (
    <>
      <Card className="border-gray-200">
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl">Gestion des Commandes</h2>
              <p className="text-sm text-gray-500">Liste complète des commandes</p>
            </div>
            <Button className="bg-[#cfbd97] hover:bg-[#bfad87] text-black gap-2">
              <Download className="h-4 w-4" />
              Exporter
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par numéro, client ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px] border-gray-300">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="en_cours">En cours</SelectItem>
                <SelectItem value="validée">Validée</SelectItem>
                <SelectItem value="annulée">Annulée</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Orders Table */}
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Commande</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Articles</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        Aucune commande trouvée
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-gray-50">
                        <TableCell>
                          <p className="text-sm">{order.id}</p>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{order.customer}</p>
                            <p className="text-xs text-gray-500">{order.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(order.date).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell className="text-sm">{order.items}</TableCell>
                        <TableCell className="text-sm font-bold text-[#cfbd97]">
                          {(convertirPrix(order.total) as { xafFormate: string }).xafFormate}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${statusConfig[order.status].color} border`} variant="outline">
                            {statusConfig[order.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                            className="gap-2 hover:bg-[#cfbd97]/10"
                          >
                            <Eye className="h-4 w-4" />
                            Voir
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Results count */}
          <div className="text-sm text-gray-500 mt-4">
            Affichage de {filteredOrders.length} commande(s) sur {orders.length}
          </div>
        </div>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>Détails de la commande {selectedOrder.id}</span>
                  <Badge className={`${statusConfig[selectedOrder.status].color} border`} variant="outline">
                    {statusConfig[selectedOrder.status].label}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  Commandé le {new Date(selectedOrder.date).toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Customer Info */}
                <div>
                  <h4 className="text-sm mb-3">Informations client</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Nom</span>
                      <span className="text-sm">{selectedOrder.customer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Email</span>
                      <span className="text-sm">{selectedOrder.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Adresse</span>
                      <span className="text-sm text-right">{selectedOrder.shippingAddress}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Paiement</span>
                      <span className="text-sm">{selectedOrder.paymentMethod}</span>
                    </div>
                  </div>
                </div>

                {/* Products */}
                <div>
                  <h4 className="text-sm mb-3">Produits commandés</h4>
                  <div className="border border-gray-200 rounded-lg divide-y">
                    {selectedOrder.products.map((product, index) => (
                      <div key={index} className="p-4 flex justify-between items-center">
                        <div>
                          <p className="text-sm">{product.name}</p>
                          <p className="text-xs text-gray-500">Quantité: {product.quantity}</p>
                        </div>
                        <p className="text-sm font-bold text-[#cfbd97]">
                          {(convertirPrix(product.price) as { xafFormate: string }).xafFormate}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="bg-[#cfbd97]/10 border border-[#cfbd97]/30 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg">Total de la commande</span>
                    <span className="text-2xl font-bold text-[#cfbd97]">
                      {(convertirPrix(selectedOrder.total) as { xafFormate: string }).xafFormate}
                    </span>
                  </div>
                </div>

                {/* Update Status */}
                <div>
                  <h4 className="text-sm mb-3">Modifier le statut</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(statusConfig).map(([status, config]) => {
                      const Icon = config.icon;
                      const isActive = selectedOrder.status === status;
                      return (
                        <Button
                          key={status}
                          variant={isActive ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateOrderStatus(selectedOrder.id, status as OrderStatus)}
                          className={`gap-2 ${isActive ? 'bg-[#cfbd97] hover:bg-[#bfad87] text-black' : ''}`}
                        >
                          <Icon className="h-4 w-4" />
                          {config.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
