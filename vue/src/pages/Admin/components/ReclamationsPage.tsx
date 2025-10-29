import { useState } from 'react';
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
  DialogFooter,
} from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Search, Eye, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';

interface Complaint {
  id: string;
  orderId: string;
  customer: string;
  email: string;
  subject: string;
  description: string;
  status: 'ouverte' | 'en_traitement' | 'fermée';
  createdAt: string;
  response?: string;
}

const mockComplaints: Complaint[] = [
  {
    id: '2341',
    orderId: 'CMD-1284',
    customer: 'Marie Dubois',
    email: 'marie.dubois@email.com',
    subject: 'Commande froide',
    description: 'La nourriture est arrivée froide malgré le délai de livraison respecté.',
    status: 'ouverte',
    createdAt: '2025-10-24T14:30:00',
  },
  {
    id: '2340',
    orderId: 'CMD-1280',
    customer: 'Pierre Martin',
    email: 'pierre.martin@email.com',
    subject: 'Retard de livraison',
    description: 'Ma commande a pris 45 minutes de retard.',
    status: 'en_traitement',
    createdAt: '2025-10-24T12:15:00',
    response: 'Nous avons contacté le livreur et nous vous offrons un bon de réduction.',
  },
  {
    id: '2339',
    orderId: 'CMD-1278',
    customer: 'Sophie Laurent',
    email: 'sophie.laurent@email.com',
    subject: 'Produit manquant',
    description: 'Il manquait les frites dans ma commande.',
    status: 'fermée',
    createdAt: '2025-10-23T19:20:00',
    response: 'Produit manquant renvoyé et remboursement effectué.',
  },
  {
    id: '2338',
    orderId: 'CMD-1275',
    customer: 'Luc Bernard',
    email: 'luc.bernard@email.com',
    subject: 'Qualité du produit',
    description: 'Le burger n\'était pas assez cuit à mon goût.',
    status: 'fermée',
    createdAt: '2025-10-22T18:45:00',
    response: 'Nous avons pris note de vos remarques pour améliorer notre service.',
  },
  {
    id: '2337',
    orderId: 'CMD-1270',
    customer: 'Julie Petit',
    email: 'julie.petit@email.com',
    subject: 'Erreur de commande',
    description: 'J\'ai reçu une pizza végétarienne au lieu d\'une pizza pepperoni.',
    status: 'en_traitement',
    createdAt: '2025-10-22T13:10:00',
  },
];

const statusConfig = {
  ouverte: { label: 'Ouverte', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: Clock },
  en_traitement: { label: 'En traitement', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: AlertTriangle },
  fermée: { label: 'Fermée', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: CheckCircle },
};

export function ReclamationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>(mockComplaints);
  const [responseText, setResponseText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch = 
      complaint.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: complaints.length,
    ouverte: complaints.filter(c => c.status === 'ouverte').length,
    en_traitement: complaints.filter(c => c.status === 'en_traitement').length,
    fermee: complaints.filter(c => c.status === 'fermée').length,
  };

  const updateStatus = (id: string, newStatus: Complaint['status']) => {
    setComplaints(complaints.map(c => 
      c.id === id ? { ...c, status: newStatus } : c
    ));
    if (selectedComplaint?.id === id) {
      setSelectedComplaint({ ...selectedComplaint, status: newStatus });
    }
  };

  // Ouvrir le dialogue avec réinitialisation de la réponse
  const openComplaintDialog = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setResponseText(complaint.response || '');
  };

  // Sauvegarder la réponse et mettre à jour le statut
  const handleSaveResponse = () => {
    if (!selectedComplaint) return;

    try {
      // Validation
      if (!responseText.trim() && !selectedComplaint.response) {
        alert('Veuillez ajouter une réponse avant d\'enregistrer');
        return;
      }

      setIsLoading(true);

      // Mettre à jour la réclamation avec la réponse
      const updatedComplaint: Complaint = {
        ...selectedComplaint,
        response: responseText.trim() || selectedComplaint.response,
        // Si on ajoute une réponse et que le statut est "ouverte", passer à "en_traitement"
        status: responseText.trim() && selectedComplaint.status === 'ouverte' 
          ? 'en_traitement' 
          : selectedComplaint.status,
      };

      // TODO: Décommenter quand l'API est prête
      // await sauvegarderReclamation(updatedComplaint);

      // Mettre à jour dans la liste
      setComplaints(complaints.map(c => 
        c.id === selectedComplaint.id ? updatedComplaint : c
      ));

      setSelectedComplaint(null);
      setResponseText('');
      alert('Réclamation mise à jour avec succès !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la mise à jour de la réclamation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Total Réclamations</p>
                  <p className="text-3xl">{stats.total}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Ouvertes</p>
                  <p className="text-3xl">{stats.ouverte}</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-lg">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">En Traitement</p>
                  <p className="text-3xl">{stats.en_traitement}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Fermées</p>
                  <p className="text-3xl">{stats.fermee}</p>
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Complaints Table */}
        <Card className="border-gray-200">
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-xl">Gestion des Réclamations</h2>
              <p className="text-sm text-gray-500">Traitez les plaintes et réclamations clients</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher une réclamation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px] border-gray-300">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="ouverte">Ouverte</SelectItem>
                  <SelectItem value="en_traitement">En traitement</SelectItem>
                  <SelectItem value="fermée">Fermée</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>ID</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Sujet</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredComplaints.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          Aucune réclamation trouvée
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredComplaints.map((complaint) => (
                        <TableRow key={complaint.id} className="hover:bg-gray-50">
                          <TableCell className="text-sm">#{complaint.id}</TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm">{complaint.customer}</p>
                              <p className="text-xs text-gray-500">{complaint.email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{complaint.subject}</TableCell>
                          <TableCell>
                            <Badge className={`${statusConfig[complaint.status].color} border`} variant="outline">
                              {statusConfig[complaint.status].label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(complaint.createdAt).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openComplaintDialog(complaint)}
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

            <div className="text-sm text-gray-500 mt-4">
              Affichage de {filteredComplaints.length} réclamation(s) sur {complaints.length}
            </div>
          </div>
        </Card>
      </div>

      {/* Complaint Details Dialog */}
      <Dialog open={!!selectedComplaint} onOpenChange={() => setSelectedComplaint(null)}>
        <DialogContent className="max-w-2xl">
          {selectedComplaint && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>Réclamation #{selectedComplaint.id}</span>
                  <Badge className={`${statusConfig[selectedComplaint.status].color} border`} variant="outline">
                    {statusConfig[selectedComplaint.status].label}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  Déposée le {new Date(selectedComplaint.createdAt).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Customer Info */}
                <div>
                  <h4 className="text-sm mb-3">Informations client</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Nom</span>
                      <span className="text-sm">{selectedComplaint.customer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Email</span>
                      <span className="text-sm">{selectedComplaint.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Commande associée</span>
                      <span className="text-sm">{selectedComplaint.orderId}</span>
                    </div>
                  </div>
                </div>

                {/* Complaint Details */}
                <div>
                  <h4 className="text-sm mb-3">Détails de la réclamation</h4>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm text-gray-600">Sujet</Label>
                      <p className="text-sm mt-1">{selectedComplaint.subject}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Description</Label>
                      <p className="text-sm mt-1 bg-gray-50 rounded-lg p-3">
                        {selectedComplaint.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Response */}
                {selectedComplaint.response && (
                  <div>
                    <h4 className="text-sm mb-3">Réponse apportée</h4>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm">{selectedComplaint.response}</p>
                    </div>
                  </div>
                )}

                {/* Add Response */}
                {!selectedComplaint.response && (
                  <div>
                    <Label className="text-sm mb-2">Ajouter une réponse *</Label>
                    <Textarea 
                      placeholder="Tapez votre réponse ici..."
                      rows={4}
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Cette réponse sera envoyée au client par email
                    </p>
                  </div>
                )}

                {/* Update Status */}
                <div>
                  <h4 className="text-sm mb-3">Modifier le statut</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(statusConfig).map(([status, config]) => {
                      const Icon = config.icon;
                      const isActive = selectedComplaint.status === status;
                      return (
                        <Button
                          key={status}
                          variant={isActive ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateStatus(selectedComplaint.id, status as Complaint['status'])}
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

              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedComplaint(null);
                    setResponseText('');
                  }}
                  disabled={isLoading}
                >
                  Fermer
                </Button>
                <Button 
                  className="bg-[#cfbd97] hover:bg-[#bfad87] text-black"
                  onClick={handleSaveResponse}
                  disabled={isLoading}
                >
                  {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
