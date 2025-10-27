import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Settings, Bell, Lock, Mail, Globe, DollarSign, Save, Eye, EyeOff } from 'lucide-react';

type SettingsSection = 'general' | 'notifications' | 'security' | 'email' | 'language' | 'payment';

interface GeneralSettings {
  restaurantName: string;
  contactEmail: string;
  address: string;
  phone: string;
  website: string;
  description: string;
  hoursWeekday: string;
  hoursWeekend: string;
}

interface NotificationSettings {
  newOrders: boolean;
  urgentComplaints: boolean;
  dailyReports: boolean;
  pushNotifications: boolean;
  stockAlerts: boolean;
}

interface SecuritySettings {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  twoFactorAuth: boolean;
}

const defaultGeneralSettings: GeneralSettings = {
  restaurantName: 'Restaurant Le Gourmet',
  contactEmail: 'contact@legourmet.fr',
  address: '123 Avenue des Champs-Élysées, 75008 Paris',
  phone: '+33 1 42 56 78 90',
  website: 'www.legourmet.fr',
  description: 'Restaurant gastronomique au cœur de Paris, spécialisé dans la cuisine française moderne.',
  hoursWeekday: '11:00 - 23:00',
  hoursWeekend: '10:00 - 00:00',
};

const defaultNotificationSettings: NotificationSettings = {
  newOrders: true,
  urgentComplaints: true,
  dailyReports: true,
  pushNotifications: false,
  stockAlerts: false,
};

export function SettingsPageFunctional() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('general');
  const [isLoading, setIsLoading] = useState(false);
  
  // États pour les paramètres généraux
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>(defaultGeneralSettings);
  const [editedGeneralSettings, setEditedGeneralSettings] = useState<GeneralSettings>(defaultGeneralSettings);
  
  // États pour les notifications
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(defaultNotificationSettings);
  
  // États pour la sécurité
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorAuth: false,
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Charger les paramètres
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // TODO: Remplacer par un appel API réel
      // const response = await fetch('/api/admin/settings');
      // const data = await response.json();
      // setGeneralSettings(data.general);
      // setNotificationSettings(data.notifications);

      // DONNÉES MOCKÉES (à remplacer)
      setGeneralSettings(defaultGeneralSettings);
      setEditedGeneralSettings(defaultGeneralSettings);
      setNotificationSettings(defaultNotificationSettings);
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
    }
  };

  // Sauvegarder les paramètres généraux
  const handleSaveGeneral = async () => {
    try {
      // Validation
      if (!editedGeneralSettings.restaurantName || !editedGeneralSettings.contactEmail) {
        alert('Le nom du restaurant et l\'email sont obligatoires');
        return;
      }

      setIsLoading(true);

      // TODO: Remplacer par un appel API réel
      // await fetch('/api/admin/settings/general', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(editedGeneralSettings),
      // });

      setGeneralSettings(editedGeneralSettings);
      alert('Paramètres généraux mis à jour avec succès !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la mise à jour des paramètres');
    } finally {
      setIsLoading(false);
    }
  };

  // Sauvegarder les notifications
  const handleSaveNotifications = async () => {
    try {
      setIsLoading(true);

      // TODO: Remplacer par un appel API réel
      // await fetch('/api/admin/settings/notifications', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(notificationSettings),
      // });

      alert('Préférences de notification mises à jour avec succès !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la mise à jour des notifications');
    } finally {
      setIsLoading(false);
    }
  };

  // Changer le mot de passe
  const handleChangePassword = async () => {
    try {
      // Validation
      if (!securitySettings.currentPassword || !securitySettings.newPassword || !securitySettings.confirmPassword) {
        alert('Veuillez remplir tous les champs');
        return;
      }

      if (securitySettings.newPassword !== securitySettings.confirmPassword) {
        alert('Les mots de passe ne correspondent pas');
        return;
      }

      if (securitySettings.newPassword.length < 8) {
        alert('Le mot de passe doit contenir au moins 8 caractères');
        return;
      }

      setIsLoading(true);

      // TODO: Remplacer par un appel API réel
      // await fetch('/api/admin/settings/change-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     currentPassword: securitySettings.currentPassword,
      //     newPassword: securitySettings.newPassword,
      //   }),
      // });

      // Réinitialiser les champs
      setSecuritySettings({
        ...securitySettings,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      alert('Mot de passe modifié avec succès !');
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      alert('Erreur lors du changement de mot de passe');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle 2FA
  const handleToggle2FA = async (enabled: boolean) => {
    try {
      setIsLoading(true);

      // TODO: Remplacer par un appel API réel
      // await fetch('/api/admin/settings/2fa', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ enabled }),
      // });

      setSecuritySettings({
        ...securitySettings,
        twoFactorAuth: enabled,
      });

      alert(enabled ? 'Authentification à deux facteurs activée' : 'Authentification à deux facteurs désactivée');
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateGeneralField = (field: keyof GeneralSettings, value: string) => {
    setEditedGeneralSettings({
      ...editedGeneralSettings,
      [field]: value,
    });
  };

  const updateNotificationField = (field: keyof NotificationSettings, value: boolean) => {
    setNotificationSettings({
      ...notificationSettings,
      [field]: value,
    });
  };

  const menuItems = [
    { id: 'general' as SettingsSection, icon: Settings, label: 'Général' },
    { id: 'notifications' as SettingsSection, icon: Bell, label: 'Notifications' },
    { id: 'security' as SettingsSection, icon: Lock, label: 'Sécurité' },
    { id: 'email' as SettingsSection, icon: Mail, label: 'Email' },
    { id: 'language' as SettingsSection, icon: Globe, label: 'Langue & Région' },
    { id: 'payment' as SettingsSection, icon: DollarSign, label: 'Paiement' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl">Paramètres</h2>
        <p className="text-sm text-gray-500">Configurez les paramètres de votre système</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Menu */}
        <Card className="border-gray-200 lg:col-span-1">
          <CardContent className="p-6">
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-[#cfbd97] text-black' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </CardContent>
        </Card>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Settings */}
          {activeSection === 'general' && (
            <Card className="border-gray-200">
              <div className="p-6">
                <h3 className="text-lg mb-1">Paramètres généraux</h3>
                <p className="text-sm text-gray-500 mb-6">Informations de base de votre restaurant</p>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nom du restaurant *</Label>
                      <Input 
                        value={editedGeneralSettings.restaurantName}
                        onChange={(e) => updateGeneralField('restaurantName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email de contact *</Label>
                      <Input 
                        type="email" 
                        value={editedGeneralSettings.contactEmail}
                        onChange={(e) => updateGeneralField('contactEmail', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Adresse</Label>
                    <Input 
                      value={editedGeneralSettings.address}
                      onChange={(e) => updateGeneralField('address', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Téléphone</Label>
                      <Input 
                        value={editedGeneralSettings.phone}
                        onChange={(e) => updateGeneralField('phone', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Site web</Label>
                      <Input 
                        value={editedGeneralSettings.website}
                        onChange={(e) => updateGeneralField('website', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea 
                      rows={3}
                      value={editedGeneralSettings.description}
                      onChange={(e) => updateGeneralField('description', e.target.value)}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold">Horaires d'ouverture</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Lundi - Vendredi</Label>
                        <Input 
                          value={editedGeneralSettings.hoursWeekday}
                          onChange={(e) => updateGeneralField('hoursWeekday', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Samedi - Dimanche</Label>
                        <Input 
                          value={editedGeneralSettings.hoursWeekend}
                          onChange={(e) => updateGeneralField('hoursWeekend', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      onClick={handleSaveGeneral}
                      disabled={isLoading}
                      className="bg-[#cfbd97] hover:bg-[#bfad87] text-black gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Notifications */}
          {activeSection === 'notifications' && (
            <Card className="border-gray-200">
              <div className="p-6">
                <h3 className="text-lg mb-1">Notifications</h3>
                <p className="text-sm text-gray-500 mb-6">Gérez vos préférences de notification</p>

                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b">
                    <div className="flex-1">
                      <p className="text-sm font-medium">Nouvelles commandes</p>
                      <p className="text-xs text-gray-500">Recevoir une alerte pour chaque nouvelle commande</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.newOrders}
                      onCheckedChange={(checked: boolean) => updateNotificationField('newOrders', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between py-3 border-b">
                    <div className="flex-1">
                      <p className="text-sm font-medium">Réclamations urgentes</p>
                      <p className="text-xs text-gray-500">Alertes pour les réclamations prioritaires</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.urgentComplaints}
                      onCheckedChange={(checked: boolean) => updateNotificationField('urgentComplaints', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between py-3 border-b">
                    <div className="flex-1">
                      <p className="text-sm font-medium">Rapports quotidiens</p>
                      <p className="text-xs text-gray-500">Recevoir un résumé quotidien par email</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.dailyReports}
                      onCheckedChange={(checked: boolean) => updateNotificationField('dailyReports', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between py-3 border-b">
                    <div className="flex-1">
                      <p className="text-sm font-medium">Notifications push</p>
                      <p className="text-xs text-gray-500">Activer les notifications push sur mobile</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(checked: boolean) => updateNotificationField('pushNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium">Alertes de stock</p>
                      <p className="text-xs text-gray-500">Notifications quand un article est en rupture</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.stockAlerts}
                      onCheckedChange={(checked: boolean) => updateNotificationField('stockAlerts', checked)}
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <Button 
                    onClick={handleSaveNotifications}
                    disabled={isLoading}
                    className="bg-[#cfbd97] hover:bg-[#bfad87] text-black gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isLoading ? 'Enregistrement...' : 'Enregistrer les préférences'}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Security */}
          {activeSection === 'security' && (
            <Card className="border-gray-200">
              <div className="p-6">
                <h3 className="text-lg mb-1">Sécurité</h3>
                <p className="text-sm text-gray-500 mb-6">Gérez la sécurité de votre compte</p>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Mot de passe actuel *</Label>
                    <div className="relative">
                      <Input 
                        type={showPasswords.current ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={securitySettings.currentPassword}
                        onChange={(e) => setSecuritySettings({...securitySettings, currentPassword: e.target.value})}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      >
                        {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nouveau mot de passe *</Label>
                      <div className="relative">
                        <Input 
                          type={showPasswords.new ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={securitySettings.newPassword}
                          onChange={(e) => setSecuritySettings({...securitySettings, newPassword: e.target.value})}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                        >
                          {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Confirmer le mot de passe *</Label>
                      <div className="relative">
                        <Input 
                          type={showPasswords.confirm ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={securitySettings.confirmPassword}
                          onChange={(e) => setSecuritySettings({...securitySettings, confirmPassword: e.target.value})}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                        >
                          {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Authentification à deux facteurs</p>
                        <p className="text-xs text-gray-500">Ajoutez une couche de sécurité supplémentaire</p>
                      </div>
                      <Switch 
                        checked={securitySettings.twoFactorAuth}
                        onCheckedChange={handleToggle2FA}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Sessions actives</p>
                        <p className="text-xs text-gray-500">Gérer vos sessions de connexion</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Voir les sessions
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      onClick={handleChangePassword}
                      disabled={isLoading}
                      className="bg-[#cfbd97] hover:bg-[#bfad87] text-black gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {isLoading ? 'Modification...' : 'Modifier le mot de passe'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Placeholder pour autres sections */}
          {!['general', 'notifications', 'security'].includes(activeSection) && (
            <Card className="border-gray-200">
              <div className="p-8 text-center">
                <p className="text-gray-500">
                  Section "{menuItems.find(m => m.id === activeSection)?.label}" à implémenter
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Utilisez le même principe que les sections Général, Notifications et Sécurité
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
