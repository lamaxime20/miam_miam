import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { getPromotions } from '../../../services/GestionPromotion';
import { Plus, Edit, Trash2, Tag, TrendingUp, Calendar, Percent } from 'lucide-react';

interface Promotion {
  id: string;
  name: string;
  description: string;
  image_path?: string;
  discount: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'scheduled' | 'expired';
}

interface FormData {
  name: string;
  description: string;
  discount: string;
  startDate: string;
  endDate: string;
}

const statusConfig = {
  active: { label: 'Active', color: 'bg-green-100 text-green-700 border-green-200' },
  scheduled: { label: 'Programmée', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  expired: { label: 'Expirée', color: 'bg-gray-100 text-gray-700 border-gray-200' },
};

export function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [selectedPromo, setSelectedPromo] = useState<Promotion | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    discount: '',
    startDate: '',
    endDate: '',
  });
  const [editFormData, setEditFormData] = useState<FormData>({
    name: '',
    description: '',
    discount: '',
    startDate: '',
    endDate: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPromotions = async () => {
      setIsLoading(true);
      try {
        const data = await getPromotions();
        const formattedPromotions = data.map((p: any) => ({
          id: p.id_promo.toString(),
          name: p.titre,
          description: p.description_promotion,
          discount: parseFloat(p.pourcentage_reduction),
          startDate: new Date(p.date_debut).toISOString().split('T')[0],
          endDate: new Date(p.date_fin).toISOString().split('T')[0],
          status: calculateStatus(p.date_debut, p.date_fin),
          image_path: p.image_path,
        }));
        setPromotions(formattedPromotions);
      } catch (error) {
        console.error("Erreur lors de la récupération des promotions:", error);
        alert("Impossible de charger les promotions.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPromotions();
  }, []);


  const stats = {
    total: promotions.length,
    active: promotions.filter(p => p.status === 'active').length,
    expired: promotions.filter(p => p.status === 'expired').length,
    scheduled: promotions.filter(p => p.status === 'scheduled').length,
  };

  const deletePromotion = (id: string) => {
    setPromotions(promotions.filter(p => p.id !== id));
    setSelectedPromo(null);
  };

  // Calculer le statut d'une promotion
  const calculateStatus = (startDate: string, endDate: string): 'active' | 'scheduled' | 'expired' => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (now < start) return 'scheduled';
    if (now > end) return 'expired';
    return 'active';
  };

  // Ajouter une promotion
  const handleAddPromotion = () => {
    try {
      // Validation
      if (!formData.name || !formData.description || !formData.discount || !formData.startDate || !formData.endDate) {
        alert('Veuillez remplir tous les champs');
        return;
      }

      const discountNum = parseFloat(formData.discount);
      if (isNaN(discountNum) || discountNum <= 0 || discountNum > 100) {
        alert('Le pourcentage doit être entre 1 et 100');
        return;
      }

      // Vérifier que la date de fin est après la date de début
      if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        alert('La date de fin doit être après la date de début');
        return;
      }

      setIsLoading(true);

      // Créer la nouvelle promotion
      const newPromo: Promotion = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        discount: discountNum,
        image_path: undefined, // Pas d'image à la création pour l'instant
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: calculateStatus(formData.startDate, formData.endDate),
      };

      // TODO: Décommenter quand l'API est prête
      // await sauvegarderPromotion(newPromo);

      // Ajouter à la liste
      setPromotions([...promotions, newPromo]);

      // Réinitialiser le formulaire
      setFormData({
        name: '',
        description: '',
        discount: '',
        startDate: '',
        endDate: '',
      });

      setShowAddDialog(false);
      alert('Promotion créée avec succès !');
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      alert('Erreur lors de la création de la promotion');
    } finally {
      setIsLoading(false);
    }
  };

  // Modifier une promotion
  const handleEditPromotion = () => {
    if (!selectedPromo) return;

    try {
      // Validation
      if (!editFormData.name || !editFormData.description || !editFormData.discount || !editFormData.startDate || !editFormData.endDate) {
        alert('Veuillez remplir tous les champs');
        return;
      }

      const discountNum = parseFloat(editFormData.discount);
      if (isNaN(discountNum) || discountNum <= 0 || discountNum > 100) {
        alert('Le pourcentage doit être entre 1 et 100');
        return;
      }

      if (new Date(editFormData.endDate) <= new Date(editFormData.startDate)) {
        alert('La date de fin doit être après la date de début');
        return;
      }

      setIsLoading(true);

      // Mettre à jour la promotion
      const updatedPromo: Promotion = {
        ...selectedPromo,
        name: editFormData.name,
        description: editFormData.description,
        discount: discountNum,
        startDate: editFormData.startDate,
        endDate: editFormData.endDate,
        status: calculateStatus(editFormData.startDate, editFormData.endDate),
      };

      // TODO: Décommenter quand l'API est prête
      // await modifierPromotion(updatedPromo);

      // Mettre à jour dans la liste
      setPromotions(promotions.map(p => p.id === selectedPromo.id ? updatedPromo : p));

      setSelectedPromo(null);
      alert('Promotion modifiée avec succès !');
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      alert('Erreur lors de la modification de la promotion');
    } finally {
      setIsLoading(false);
    }
  };

  // Ouvrir le dialogue de modification avec les données
  const openEditDialog = (promo: Promotion) => {
    setEditFormData({
      name: promo.name,
      description: promo.description,
      discount: promo.discount.toString(),
      startDate: promo.startDate,
      endDate: promo.endDate,
    });
    setSelectedPromo(promo);
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
                  <p className="text-sm text-gray-500">Total Promotions</p>
                  <p className="text-3xl">{stats.total}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Tag className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Promotions Actives</p>
                  <p className="text-3xl">{stats.active}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Expirées</p>
                  <p className="text-3xl">{stats.expired}</p>
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <Percent className="h-6 w-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Programmées</p>
                  <p className="text-3xl">{stats.scheduled}</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-lg">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Promotions List */}
        <Card className="border-gray-200">
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl">Gestion des Promotions</h2>
                <p className="text-sm text-gray-500">Créez et gérez vos offres promotionnelles</p>
              </div>
              <Button 
                className="bg-[#cfbd97] hover:bg-[#bfad87] text-black gap-2"
                onClick={() => setShowAddDialog(true)}
              >
                <Plus className="h-4 w-4" />
                Nouvelle promotion
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {promotions.map((promo) => (
                <Card key={promo.id} className="border-gray-200">
                  <CardContent className="p-6">
                    {promo.image_path && (
                      <div className="mb-4 rounded-lg overflow-hidden h-40">
                        <img 
                          src={`http://localhost:8000${promo.image_path}`} 
                          alt={promo.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg mb-1">{promo.name}</h3>
                          <p className="text-sm text-gray-500">{promo.description}</p>
                        </div>
                        <Badge className={`${statusConfig[promo.status].color} border`} variant="outline">
                          {statusConfig[promo.status].label}
                        </Badge>
                      </div>

                      <div className="bg-[#cfbd97]/10 rounded-lg p-4 text-center">
                        <p className="text-3xl text-[#cfbd97]">
                          {promo.discount}%
                        </p>
                        <p className="text-xs text-gray-500 mt-1">de réduction</p>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Période:</span>
                          <span className="text-xs">
                            {new Date(promo.startDate).toLocaleDateString('fr-FR')} - {new Date(promo.endDate).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => openEditDialog(promo)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Modifier
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (confirm('Êtes-vous sûr de vouloir supprimer cette promotion ?')) {
                              deletePromotion(promo.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {promotions.length === 0 && (
              <div className="text-center py-12 text-gray-500 ">
                {isLoading ? (
                  <div className="spinner-border text-primary" role="status"></div>
                ) : (
                  "Aucune promotion créée"
                )}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Edit Promotion Dialog */}
      <Dialog open={!!selectedPromo} onOpenChange={() => setSelectedPromo(null)}>
        <DialogContent className="max-w-lg">
          {selectedPromo && (
            <>
              <DialogHeader>
                <DialogTitle>Modifier la promotion</DialogTitle>
                <DialogDescription>
                  Modifiez les détails de votre promotion
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nom de la promotion *</Label>
                  <Input 
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description *</Label>
                  <Textarea 
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    rows={2} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pourcentage de réduction (%) *</Label>
                  <Input 
                    type="number" 
                    value={editFormData.discount}
                    onChange={(e) => setEditFormData({ ...editFormData, discount: e.target.value })}
                    min="1" 
                    max="100" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date de début *</Label>
                    <Input 
                      type="date" 
                      value={editFormData.startDate}
                      onChange={(e) => setEditFormData({ ...editFormData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Date de fin *</Label>
                    <Input 
                      type="date" 
                      value={editFormData.endDate}
                      onChange={(e) => setEditFormData({ ...editFormData, endDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedPromo(null)}
                  disabled={isLoading}
                >
                  Annuler
                </Button>
                <Button 
                  className="bg-[#cfbd97] hover:bg-[#bfad87] text-black"
                  onClick={handleEditPromotion}
                  disabled={isLoading}
                >
                  {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Promotion Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nouvelle promotion</DialogTitle>
            <DialogDescription>
              Créez une nouvelle offre promotionnelle
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nom de la promotion *</Label>
              <Input 
                placeholder="Ex: Promo Été" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea 
                placeholder="Description de la promotion..." 
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Pourcentage de réduction (%) *</Label>
              <Input 
                type="number" 
                placeholder="20" 
                min="1" 
                max="100"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
              />
              <p className="text-xs text-gray-500">Entre 1% et 100%</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date de début *</Label>
                <Input 
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Date de fin *</Label>
                <Input 
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowAddDialog(false);
                setFormData({
                  name: '',
                  description: '',
                  discount: '',
                  startDate: '',
                  endDate: '',
                });
              }}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button 
              className="bg-[#cfbd97] hover:bg-[#bfad87] text-black"
              onClick={handleAddPromotion}
              disabled={isLoading}
            >
              {isLoading ? 'Création...' : 'Créer la promotion'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
