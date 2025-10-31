import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge'; 
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Search, Plus, Edit, Trash2, UtensilsCrossed, ChefHat, Coffee, Cake, Image as ImageIcon, UploadCloud, X } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { getAllMenuItems, convertirPrix, uploadImage, createMenuItem, updateImage, updateMenuItem } from '../../../services/GestionMenu';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  priceXAF?: number;
  priceFormatted: string;
  category: string;
  status: 'available' | 'unavailable';
  image?: string;
  imageId?: number;
}

interface FormData {
  name: string;
  description: string;
  priceFCFA: string;
  category: string;
  imageUrl: string;
  id_file?: number; // ID du fichier téléversé
  available: boolean;
}

// Fonction pour convertir les plats mockés en format avec XAF
const convertMockItems = (items: any[]): MenuItem[] => {
  return items.map(item => {
    const prix = convertirPrix(item.price);
    return {
      ...item,
      priceXAF: prix.xaf,
      priceFormatted: prix.xafFormate, // prix.xafFormate est déjà en FCFA
    };
  });
};

const categories = ['Entrées', 'Plats', 'Desserts', 'Boissons'];

const categoryIcons = {
  'Entrées': UtensilsCrossed,
  'Plats': ChefHat,
  'Desserts': Cake,
  'Boissons': Coffee,
};

export function MenuPage() {
  const API_URL = import.meta.env.VITE_API_URL;

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    priceFCFA: '',
    category: '',
    imageUrl: '',
    id_file: undefined,
    available: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [editFormData, setEditFormData] = useState<FormData>({
    name: '',
    description: '',
    priceFCFA: '',
    category: '',
    imageUrl: '',
    id_file: undefined,
    available: true,
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Charger les plats depuis l'API (optionnel)
  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      setIsLoading(true);
      const plats = await getAllMenuItems();
      console.log(plats);
      const converted = convertMockItems(plats);
      setMenuItems(converted);
    } catch (error) {
      console.error('Erreur lors du chargement des plats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = menuItems.filter((item) => {
    const name = (item.name ?? '').toString();
    const desc = (item.description ?? '').toString();
    const matchesSearch = 
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      desc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const stats = categories.map(cat => ({
    category: cat,
    count: menuItems.filter(item => item.category === cat).length,
    icon: categoryIcons[cat as keyof typeof categoryIcons],
  }));

  const deleteItem = async (id: string) => {
    try {
      // TODO: Décommenter quand l'API est prête
      // await supprimerPlat(parseInt(id));
      setMenuItems(menuItems.filter(item => item.id !== id));
      setSelectedItem(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du plat');
    }
  };

  const handleFileSelect = async (file: File | null) => {
    if (!file) return;

    // Vérification du type de fichier
    if (!file.type.startsWith('image/')) {
      alert("Veuillez sélectionner un fichier image (jpeg, png, etc.).");
      return;
    }

    setIsUploading(true);
    try {
      // Appel de la nouvelle fonction d'upload
      const response = await uploadImage(file);
      
      // Assumant que l'API retourne un objet avec `url` et `data.id_file`
      if (response && response.url && response.data?.id_file) {
        console.log(API_URL +response.url, response.data.id_file);
        setFormData({ ...formData, imageUrl: API_URL + response.url, id_file: response.data.id_file as number });
      } else {
        alert("L'image a été téléversée, mais l'URL n'a pas pu être récupérée.");
      }
    } catch (error) {
      console.error("Erreur lors du téléversement:", error);
      alert(error.message || "Une erreur est survenue lors du téléversement de l'image.");
      // Optionnel: réinitialiser l'image si l'upload échoue
      setFormData({ ...formData, imageUrl: '' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditFileSelect = async (file: File | null) => {
    if (!file || !selectedItem) return;
  
    if (!file.type.startsWith('image/')) {
      alert("Veuillez sélectionner un fichier image.");
      return;
    }
  
    setIsUploading(true);
    try {
      // Utiliser l'ID de l'image existante pour la mise à jour
      const oldImageId = selectedItem.imageId;
      if (oldImageId === undefined) {
        throw new Error("L'ID de l'image originale est manquant.");
      }
      const response = await updateImage(oldImageId, file);
  
      if (response && response.url && response.data?.id_file) {
        setEditFormData({ ...editFormData, imageUrl: API_URL + response.url, id_file: response.data.id_file as number });
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'image:", error);
      alert(error.message || "Une erreur est survenue lors de la mise à jour de l'image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddItem = async () => {
    try {
      setFormError(null);

      // Validation
      if (!formData.name || !formData.description || !formData.priceFCFA || !formData.category) {
        setFormError('Veuillez remplir tous les champs obligatoires.');
        return;
      }

      const priceNum = parseFloat(formData.priceFCFA);
      if (isNaN(priceNum) || priceNum <= 0) {
        setFormError('Le prix saisi est invalide. Il doit être un nombre positif.');
        return;
      }

      setIsLoading(true);

      // Convertir le prix en XAF
      const prix = convertirPrix(priceNum);

      // Préparer les données pour l'API
      const newItemData = {
        name: formData.name,
        description: formData.description,
        price: priceNum, // prix en FCFA
        category: formData.category,
        status: formData.available ? 'available' : 'unavailable',
        id_file: formData.id_file,
      };

      // Appeler le service puis recharger la liste depuis l'API pour garantir le bon mapping
      await createMenuItem(newItemData);
      await loadMenuItems();

      // Réinitialiser le formulaire
      setFormData({
        name: '',
        description: '',
        priceFCFA: '',
        category: '',
        imageUrl: '',
        id_file: undefined,
        available: true,
      });

      setShowAddDialog(false);
      alert('Plat ajouté avec succès !');
    } catch (error) {
      console.error("Erreur lors de l'ajout:", error);
      setFormError(error.message || "Une erreur inconnue est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditItem = async () => {
    if (!selectedItem) return;
  
    try {
      setFormError(null);
  
      if (!editFormData.name || !editFormData.description || !editFormData.priceFCFA || !editFormData.category) {
        setFormError('Veuillez remplir tous les champs obligatoires.');
        return;
      }
  
      const priceNum = parseFloat(editFormData.priceFCFA);
      if (isNaN(priceNum) || priceNum <= 0) {
        setFormError('Le prix saisi est invalide. Il doit être un nombre positif.');
        return;
      }
  
      setIsLoading(true);
  
      const updatedItemData = {
        name: editFormData.name,
        description: editFormData.description,
        price: priceNum,
        category: editFormData.category,
        status: editFormData.available ? 'available' : 'unavailable',
        id_file: editFormData.id_file ?? selectedItem.imageId,
      };
  
      await updateMenuItem(selectedItem.id, updatedItemData);
      await loadMenuItems();
  
      setSelectedItem(null);
      alert('Article modifié avec succès !');
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
      setFormError(error.message || "Une erreur inconnue est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStatus = (id: string) => {
    setMenuItems(menuItems.map(item => 
      item.id === id 
        ? { ...item, status: item.status === 'available' ? 'unavailable' : 'available' as const }
        : item
    ));
  };

  const openEditDialog = (item: MenuItem) => {
    setSelectedItem(item);
    setEditFormData({
      name: item.name,
      description: item.description,
      priceFCFA: item.price.toString(),
      category: item.category,
      imageUrl: item.image || '',
      id_file: item.imageId,
      available: item.status === 'available',
    });
    setFormError(null);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.category} className="border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">{stat.category}</p>
                      <p className="text-2xl">{stat.count}</p>
                    </div>
                    <div className="bg-[#cfbd97]/20 p-3 rounded-lg">
                      <Icon className="h-5 w-5 text-[#cfbd97]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Menu Items */}
        <Card className="border-gray-200">
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl">Gestion du Menu</h2>
                <p className="text-sm text-gray-500">Gérez les plats et articles de votre menu</p>
              </div>
              <Button 
                className="bg-[#cfbd97] hover:bg-[#bfad87] text-black gap-2"
                onClick={() => setShowAddDialog(true)}
              >
                <Plus className="h-4 w-4" />
                Ajouter un plat
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher un plat..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[200px] border-gray-300">
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Menu Grid */}
            {filteredItems.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                Aucun article trouvé
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item) => (
                  <Card key={item.id} className="border-gray-200 overflow-hidden">
                    <div className="aspect-video bg-gray-100 relative">
                      <ImageWithFallback
                        src={item.image || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop`}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      <Badge 
                        className={`absolute top-2 right-2 ${
                          item.status === 'available' 
                            ? 'bg-green-500 text-white' 
                            : 'bg-red-500 text-white'
                        }`}
                      >
                        {item.status === 'available' ? 'Disponible' : 'Indisponible'}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-sm">{item.name}</h3>
                            <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-lg font-bold text-[#cfbd97]">{item.priceFormatted}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(item)}
                            >
                              <Edit className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => { if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
                                deleteItem(item.id);
                              } }}
                              style={{
                                display: 'none'
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className="text-sm text-gray-500 mt-6">
              Affichage de {filteredItems.length} article(s) sur {menuItems.length}
            </div>
          </div>
        </Card>
      </div>

      {/* Edit Item Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-lg">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle>Modifier l'article</DialogTitle>
                <DialogDescription>
                  Modifiez les informations de l'article du menu
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nom du plat *</Label>
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
                    rows={3} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Prix en FCFA *</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    value={editFormData.priceFCFA}
                    onChange={(e) => setEditFormData({ ...editFormData, priceFCFA: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Image du plat</Label>
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                      ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      handleEditFileSelect(e.dataTransfer.files[0]);
                    }}
                    onClick={() => document.getElementById('edit-file-upload')?.click()}
                  >
                    <input 
                      id="edit-file-upload" 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => handleEditFileSelect(e.target.files ? e.target.files[0] : null)}
                    />
                    <div className="flex flex-col items-center justify-center space-y-2 text-gray-500">
                      <UploadCloud className="h-8 w-8" />
                      <p className="text-sm">{isUploading ? 'Téléversement...' : 'Glissez une image ou cliquez'}</p>
                    </div>
                  </div>
                  {editFormData.imageUrl && (
                    <div className="mt-2 relative">
                      <ImageWithFallback src={editFormData.imageUrl} alt="Aperçu" className="w-full h-auto rounded-lg" />
                      <Button variant="destructive" size="sm" className="absolute top-2 right-2 h-7 w-7 p-0" onClick={() => setEditFormData({ ...editFormData, imageUrl: '', id_file: undefined })}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Catégorie *</Label>
                  <Select value={editFormData.category} onValueChange={(value) => setEditFormData({ ...editFormData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox"
                    id="available-edit"
                    checked={editFormData.available}
                    onChange={(e) => setEditFormData({ ...editFormData, available: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="available-edit">Article disponible</Label>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedItem(null)}>
                  Annuler
                </Button>
                <Button 
                  className="bg-[#cfbd97] hover:bg-[#bfad87] text-black"
                  onClick={handleEditItem}
                  disabled={isLoading || isUploading}
                >
                  {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Item Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Ajouter un article</DialogTitle>
            <DialogDescription>
              Créez un nouvel article pour votre menu
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nom du plat *</Label>
              <Input 
                placeholder="Ex: Burger Premium" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea 
                placeholder="Description du plat..." 
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Prix en FCFA *</Label>
              <Input 
                type="number" 
                step="0.01" 
                placeholder="9500"
                value={formData.priceFCFA}
                onChange={(e) => setFormData({ ...formData, priceFCFA: e.target.value })}
              />
            </div>
            <div className="space-y-2"> 
              <Label>Image du plat</Label>
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                  ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files[0];
                  handleFileSelect(file);
                }}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <input 
                  id="file-upload" 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e.target.files ? e.target.files[0] : null)}
                />
                <div className="flex flex-col items-center justify-center space-y-2 text-gray-500">
                  <UploadCloud className="h-8 w-8" />
                  <p className="text-sm">
                    {isUploading ? 'Téléversement en cours...' : 'Glissez-déposez une image ou cliquez pour choisir'}
                  </p>
                  <p className="text-xs">PNG, JPG, GIF jusqu'à 5Mo</p>
                </div>
              </div>
              {formData.imageUrl && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">Aperçu :</p>
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
                    <ImageWithFallback
                      src={formData.imageUrl}
                      alt="Aperçu"
                      className="w-full h-full object-cover"
                    />
                    <Button variant="destructive" size="sm" className="absolute top-2 right-2 h-7 w-7 p-0" onClick={() => setFormData({ ...formData, imageUrl: '' })}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Catégorie *</Label>
              <Select value={formData.category} onValueChange={(value: string) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="available-add"
                checked={formData.available}
                onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="available-add">Article disponible</Label>
            </div>
            {formError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Erreur : </strong>
                <span className="block sm:inline">{formError}</span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowAddDialog(false);
                setFormData({
                  name: '',
                  description: '',
                  priceFCFA: '',
                  category: '',
                  imageUrl: '',
                  id_file: undefined,
                  available: true,
                });
                setFormError(null);
              }}
              disabled={isLoading || isUploading}
            >
              Annuler
            </Button>
            <Button 
              className="bg-[#cfbd97] hover:bg-[#bfad87] text-black"
              onClick={handleAddItem}
              disabled={isLoading || isUploading}
            >
              {isUploading ? 'Téléversement...' : (isLoading ? 'Création...' : 'Créer l\'article')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
