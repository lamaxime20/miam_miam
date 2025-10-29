import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { 
  Store, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Globe,
  Save,
  Edit,
  X,
  Facebook,
  Instagram,
  Twitter
} from 'lucide-react';

interface RestaurantInfo {
  // Informations générales
  nom: string;
  description: string;
  slogan: string;
  
  // Contact
  email: string;
  telephone: string;
  telephoneSecondaire?: string;
  
  // Adresse
  adresse: string;
  codePostal: string;
  ville: string;
  pays: string;
  
  // Horaires
  horairesLunVen: string;
  horairesSamedi: string;
  horairesDimanche: string;
  
  // Réseaux sociaux
  facebook?: string;
  instagram?: string;
  twitter?: string;
  siteWeb?: string;
  
  // Informations légales
  siret: string;
  tva: string;
  capitalSocial: string;
  formeJuridique: string;
}

const defaultInfo: RestaurantInfo = {
  nom: 'Restaurant Miam Miam',
  description: 'Découvrez une cuisine authentique et savoureuse dans un cadre chaleureux',
  slogan: 'La passion du goût',
  email: 'contact@miammiam.com',
  telephone: '+237 6 XX XX XX XX',
  telephoneSecondaire: '+237 6 YY YY YY YY',
  adresse: '123 Avenue de la République',
  codePostal: 'BP 1234',
  ville: 'Yaoundé',
  pays: 'Cameroun',
  horairesLunVen: '11h00 - 22h00',
  horairesSamedi: '11h00 - 23h00',
  horairesDimanche: '12h00 - 21h00',
  facebook: 'https://facebook.com/miammiam',
  instagram: 'https://instagram.com/miammiam',
  twitter: 'https://twitter.com/miammiam',
  siteWeb: 'https://miammiam.com',
  siret: '123 456 789 00012',
  tva: 'FR12345678900',
  capitalSocial: '50 000 €',
  formeJuridique: 'SARL',
};

export function RestaurantSettingsPage() {
  const [restaurantInfo, setRestaurantInfo] = useState<RestaurantInfo>(defaultInfo);
  const [editMode, setEditMode] = useState(false);
  const [editedInfo, setEditedInfo] = useState<RestaurantInfo>(defaultInfo);
  const [isLoading, setIsLoading] = useState(false);

  // Charger les informations du restaurant
  useEffect(() => {
    loadRestaurantInfo();
  }, []);

  const loadRestaurantInfo = async () => {
    try {
      // TODO: Remplacer par un appel API réel
      // const response = await fetch('/api/admin/restaurant-info');
      // const data = await response.json();
      // setRestaurantInfo(data);
      // setEditedInfo(data);

      // DONNÉES MOCKÉES (à remplacer)
      setRestaurantInfo(defaultInfo);
      setEditedInfo(defaultInfo);
    } catch (error) {
      console.error('Erreur lors du chargement des informations:', error);
    }
  };

  const handleEdit = () => {
    setEditedInfo(restaurantInfo);
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    setEditedInfo(restaurantInfo);
  };

  const handleSave = async () => {
    try {
      // Validation
      if (!editedInfo.nom || !editedInfo.email || !editedInfo.telephone) {
        alert('Veuillez remplir tous les champs obligatoires (nom, email, téléphone)');
        return;
      }

      setIsLoading(true);

      // TODO: Remplacer par un appel API réel
      // await fetch('/api/admin/restaurant-info', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(editedInfo),
      // });

      setRestaurantInfo(editedInfo);
      setEditMode(false);
      alert('Informations mises à jour avec succès !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la mise à jour des informations');
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: keyof RestaurantInfo, value: string) => {
    setEditedInfo({
      ...editedInfo,
      [field]: value,
    });
  };

  const info = editMode ? editedInfo : restaurantInfo;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl">Paramètres du Restaurant</h2>
          <p className="text-sm text-gray-500">
            Gérez les informations de votre restaurant affichées sur le site
          </p>
        </div>
        {!editMode ? (
          <Button
            onClick={handleEdit}
            className="bg-[#cfbd97] hover:bg-[#bfad87] text-black gap-2"
          >
            <Edit className="h-4 w-4" />
            Modifier
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-[#cfbd97] hover:bg-[#bfad87] text-black gap-2"
            >
              <Save className="h-4 w-4" />
              {isLoading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations Générales */}
        <Card className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#cfbd97] p-2 rounded-lg">
                <Store className="h-5 w-5 text-black" />
              </div>
              <h3 className="text-lg font-semibold">Informations Générales</h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Nom du restaurant *</Label>
                {editMode ? (
                  <Input
                    value={info.nom}
                    onChange={(e) => updateField('nom', e.target.value)}
                    className="mt-1"
                    placeholder="Restaurant Miam Miam"
                  />
                ) : (
                  <p className="text-sm text-gray-600 mt-1">{info.nom}</p>
                )}
              </div>

              <div>
                <Label>Slogan</Label>
                {editMode ? (
                  <Input
                    value={info.slogan}
                    onChange={(e) => updateField('slogan', e.target.value)}
                    className="mt-1"
                    placeholder="La passion du goût"
                  />
                ) : (
                  <p className="text-sm text-gray-600 mt-1">{info.slogan}</p>
                )}
              </div>

              <div>
                <Label>Description</Label>
                {editMode ? (
                  <Textarea
                    value={info.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    className="mt-1"
                    rows={3}
                    placeholder="Découvrez une cuisine authentique..."
                  />
                ) : (
                  <p className="text-sm text-gray-600 mt-1">{info.description}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Phone className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold">Contact</h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Email *</Label>
                {editMode ? (
                  <Input
                    type="email"
                    value={info.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="mt-1"
                    placeholder="contact@miammiam.com"
                  />
                ) : (
                  <p className="text-sm text-gray-600 mt-1">{info.email}</p>
                )}
              </div>

              <div>
                <Label>Téléphone principal *</Label>
                {editMode ? (
                  <Input
                    value={info.telephone}
                    onChange={(e) => updateField('telephone', e.target.value)}
                    className="mt-1"
                    placeholder="+237 6 XX XX XX XX"
                  />
                ) : (
                  <p className="text-sm text-gray-600 mt-1">{info.telephone}</p>
                )}
              </div>

              <div>
                <Label>Téléphone secondaire</Label>
                {editMode ? (
                  <Input
                    value={info.telephoneSecondaire || ''}
                    onChange={(e) => updateField('telephoneSecondaire', e.target.value)}
                    className="mt-1"
                    placeholder="+237 6 YY YY YY YY"
                  />
                ) : (
                  <p className="text-sm text-gray-600 mt-1">
                    {info.telephoneSecondaire || 'Non renseigné'}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Adresse */}
        <Card className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-100 p-2 rounded-lg">
                <MapPin className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold">Adresse</h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Adresse *</Label>
                {editMode ? (
                  <Input
                    value={info.adresse}
                    onChange={(e) => updateField('adresse', e.target.value)}
                    className="mt-1"
                    placeholder="123 Avenue de la République"
                  />
                ) : (
                  <p className="text-sm text-gray-600 mt-1">{info.adresse}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Code postal</Label>
                  {editMode ? (
                    <Input
                      value={info.codePostal}
                      onChange={(e) => updateField('codePostal', e.target.value)}
                      className="mt-1"
                      placeholder="BP 1234"
                    />
                  ) : (
                    <p className="text-sm text-gray-600 mt-1">{info.codePostal}</p>
                  )}
                </div>

                <div>
                  <Label>Ville *</Label>
                  {editMode ? (
                    <Input
                      value={info.ville}
                      onChange={(e) => updateField('ville', e.target.value)}
                      className="mt-1"
                      placeholder="Yaoundé"
                    />
                  ) : (
                    <p className="text-sm text-gray-600 mt-1">{info.ville}</p>
                  )}
                </div>
              </div>

              <div>
                <Label>Pays *</Label>
                {editMode ? (
                  <Input
                    value={info.pays}
                    onChange={(e) => updateField('pays', e.target.value)}
                    className="mt-1"
                    placeholder="Cameroun"
                  />
                ) : (
                  <p className="text-sm text-gray-600 mt-1">{info.pays}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Horaires */}
        <Card className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-orange-100 p-2 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold">Horaires d'ouverture</h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Lundi - Vendredi</Label>
                {editMode ? (
                  <Input
                    value={info.horairesLunVen}
                    onChange={(e) => updateField('horairesLunVen', e.target.value)}
                    className="mt-1"
                    placeholder="11h00 - 22h00"
                  />
                ) : (
                  <p className="text-sm text-gray-600 mt-1">{info.horairesLunVen}</p>
                )}
              </div>

              <div>
                <Label>Samedi</Label>
                {editMode ? (
                  <Input
                    value={info.horairesSamedi}
                    onChange={(e) => updateField('horairesSamedi', e.target.value)}
                    className="mt-1"
                    placeholder="11h00 - 23h00"
                  />
                ) : (
                  <p className="text-sm text-gray-600 mt-1">{info.horairesSamedi}</p>
                )}
              </div>

              <div>
                <Label>Dimanche</Label>
                {editMode ? (
                  <Input
                    value={info.horairesDimanche}
                    onChange={(e) => updateField('horairesDimanche', e.target.value)}
                    className="mt-1"
                    placeholder="12h00 - 21h00"
                  />
                ) : (
                  <p className="text-sm text-gray-600 mt-1">{info.horairesDimanche}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Réseaux Sociaux */}
        <Card className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Globe className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold">Réseaux Sociaux</h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="flex items-center gap-2">
                  <Facebook className="h-4 w-4" />
                  Facebook
                </Label>
                {editMode ? (
                  <Input
                    value={info.facebook || ''}
                    onChange={(e) => updateField('facebook', e.target.value)}
                    className="mt-1"
                    placeholder="https://facebook.com/miammiam"
                  />
                ) : (
                  <p className="text-sm text-gray-600 mt-1">
                    {info.facebook || 'Non renseigné'}
                  </p>
                )}
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  <Instagram className="h-4 w-4" />
                  Instagram
                </Label>
                {editMode ? (
                  <Input
                    value={info.instagram || ''}
                    onChange={(e) => updateField('instagram', e.target.value)}
                    className="mt-1"
                    placeholder="https://instagram.com/miammiam"
                  />
                ) : (
                  <p className="text-sm text-gray-600 mt-1">
                    {info.instagram || 'Non renseigné'}
                  </p>
                )}
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  <Twitter className="h-4 w-4" />
                  Twitter
                </Label>
                {editMode ? (
                  <Input
                    value={info.twitter || ''}
                    onChange={(e) => updateField('twitter', e.target.value)}
                    className="mt-1"
                    placeholder="https://twitter.com/miammiam"
                  />
                ) : (
                  <p className="text-sm text-gray-600 mt-1">
                    {info.twitter || 'Non renseigné'}
                  </p>
                )}
              </div>

              <div>
                <Label>Site Web</Label>
                {editMode ? (
                  <Input
                    value={info.siteWeb || ''}
                    onChange={(e) => updateField('siteWeb', e.target.value)}
                    className="mt-1"
                    placeholder="https://miammiam.com"
                  />
                ) : (
                  <p className="text-sm text-gray-600 mt-1">
                    {info.siteWeb || 'Non renseigné'}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations Légales */}
        <Card className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-red-100 p-2 rounded-lg">
                <Mail className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold">Informations Légales</h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Forme juridique</Label>
                {editMode ? (
                  <Input
                    value={info.formeJuridique}
                    onChange={(e) => updateField('formeJuridique', e.target.value)}
                    className="mt-1"
                    placeholder="SARL"
                  />
                ) : (
                  <p className="text-sm text-gray-600 mt-1">{info.formeJuridique}</p>
                )}
              </div>

              <div>
                <Label>SIRET</Label>
                {editMode ? (
                  <Input
                    value={info.siret}
                    onChange={(e) => updateField('siret', e.target.value)}
                    className="mt-1"
                    placeholder="123 456 789 00012"
                  />
                ) : (
                  <p className="text-sm text-gray-600 mt-1">{info.siret}</p>
                )}
              </div>

              <div>
                <Label>TVA intracommunautaire</Label>
                {editMode ? (
                  <Input
                    value={info.tva}
                    onChange={(e) => updateField('tva', e.target.value)}
                    className="mt-1"
                    placeholder="FR12345678900"
                  />
                ) : (
                  <p className="text-sm text-gray-600 mt-1">{info.tva}</p>
                )}
              </div>

              <div>
                <Label>Capital social</Label>
                {editMode ? (
                  <Input
                    value={info.capitalSocial}
                    onChange={(e) => updateField('capitalSocial', e.target.value)}
                    className="mt-1"
                    placeholder="50 000 €"
                  />
                ) : (
                  <p className="text-sm text-gray-600 mt-1">{info.capitalSocial}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Box */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <p className="text-sm text-blue-800">
            <strong>ℹ️ Information :</strong> Ces informations seront affichées sur tout le site 
            (page d'accueil, footer, mentions légales, page de contact, etc.)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
