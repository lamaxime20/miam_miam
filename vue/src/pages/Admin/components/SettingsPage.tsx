import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Settings, Bell, Lock, Mail, Globe, DollarSign } from 'lucide-react';

export function SettingsPage() {
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
              {[
                { icon: Settings, label: 'Général', active: true },
                { icon: Bell, label: 'Notifications', active: false },
                { icon: Lock, label: 'Sécurité', active: false },
                { icon: Mail, label: 'Email', active: false },
                { icon: Globe, label: 'Langue & Région', active: false },
                { icon: DollarSign, label: 'Paiement', active: false },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      item.active 
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
          <Card className="border-gray-200">
            <div className="p-6">
              <h3 className="text-lg mb-1">Paramètres généraux</h3>
              <p className="text-sm text-gray-500 mb-6">Informations de base de votre restaurant</p>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nom du restaurant</Label>
                    <Input defaultValue="Restaurant Le Gourmet" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email de contact</Label>
                    <Input type="email" defaultValue="contact@legourmet.fr" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Adresse</Label>
                  <Input defaultValue="123 Avenue des Champs-Élysées, 75008 Paris" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Téléphone</Label>
                    <Input defaultValue="+33 1 42 56 78 90" />
                  </div>
                  <div className="space-y-2">
                    <Label>Site web</Label>
                    <Input defaultValue="www.legourmet.fr" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea 
                    rows={3}
                    defaultValue="Restaurant gastronomique au cœur de Paris, spécialisé dans la cuisine française moderne."
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm">Horaires d'ouverture</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Lundi - Vendredi</Label>
                      <Input defaultValue="11:00 - 23:00" />
                    </div>
                    <div className="space-y-2">
                      <Label>Samedi - Dimanche</Label>
                      <Input defaultValue="10:00 - 00:00" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button className="bg-[#cfbd97] hover:bg-[#bfad87] text-black">
                    Enregistrer les modifications
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Notifications */}
          <Card className="border-gray-200">
            <div className="p-6">
              <h3 className="text-lg mb-1">Notifications</h3>
              <p className="text-sm text-gray-500 mb-6">Gérez vos préférences de notification</p>

              <div className="space-y-4">
                {[
                  { label: 'Nouvelles commandes', description: 'Recevoir une alerte pour chaque nouvelle commande' },
                  { label: 'Réclamations urgentes', description: 'Alertes pour les réclamations prioritaires' },
                  { label: 'Rapports quotidiens', description: 'Recevoir un résumé quotidien par email' },
                  { label: 'Notifications push', description: 'Activer les notifications push sur mobile' },
                  { label: 'Alertes de stock', description: 'Notifications quand un article est en rupture' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div className="flex-1">
                      <p className="text-sm">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.description}</p>
                    </div>
                    <Switch defaultChecked={index < 3} />
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Security */}
          <Card className="border-gray-200">
            <div className="p-6">
              <h3 className="text-lg mb-1">Sécurité</h3>
              <p className="text-sm text-gray-500 mb-6">Gérez la sécurité de votre compte</p>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Mot de passe actuel</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nouveau mot de passe</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirmer le mot de passe</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">Authentification à deux facteurs</p>
                      <p className="text-xs text-gray-500">Ajoutez une couche de sécurité supplémentaire</p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">Sessions actives</p>
                      <p className="text-xs text-gray-500">Gérer vos sessions de connexion</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Voir les sessions
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button className="bg-[#cfbd97] hover:bg-[#bfad87] text-black">
                    Modifier le mot de passe
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
