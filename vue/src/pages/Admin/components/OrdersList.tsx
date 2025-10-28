import { useState, useEffect } from 'react';
import { convertirPrix } from '../../../services/dashboard';
import { getOrders } from '../../../services/OrderList.js';
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
  numero: string;
  products: { name: string; quantity: number; price: number }[];
}

const statusConfig = {
  en_cours: { label: 'En cours', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock },
  validée: { label: 'Validée', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
  annulée: { label: 'Annulée', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
};

export function OrdersList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getOrders();
        setOrders(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des commandes:", error);
      }
    };
    fetchOrders();
  }, []);

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
                      <span className="text-sm text-gray-600">Numéro</span>
                      <span className="text-sm text-right">{selectedOrder.numero}</span>
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
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
