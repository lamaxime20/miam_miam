import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Separator } from './ui/separator';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { FileText, Shield, Eye, Cookie, Edit, Save, X } from 'lucide-react';

interface LegalSection {
  id: string;
  type: 'mentions' | 'confidentialite' | 'cookies' | 'conditions';
  title: string;
  lastUpdate: string;
  content: {
    [key: string]: string;
  };
}

const defaultSections: LegalSection[] = [
  {
    id: 'mentions',
    type: 'mentions',
    title: 'Mentions Légales',
    lastUpdate: '24 octobre 2025',
    content: {
      raisonSociale: 'Restaurant Le Gourmet SAS',
      siegeSocial: '123 Avenue des Champs-Élysées, 75008 Paris, France',
      capitalSocial: '50 000 €',
      siret: '123 456 789 00012',
      tva: 'FR12345678900',
      directeur: 'Jean Dupont',
      email: 'contact@legourmet.fr',
      telephone: '+33 1 42 56 78 90',
      hebergeur: 'OVH SAS',
      hebergeurAdresse: '2 rue Kellermann, 59100 Roubaix, France',
      hebergeurTel: '1007',
      proprieteIntellectuelle: 'L\'ensemble du contenu de ce site (textes, images, vidéos, logos, graphismes, etc.) est la propriété exclusive de Restaurant Le Gourmet SAS...',
      protectionDonnees: 'Conformément au Règlement Général sur la Protection des Données (RGPD)...',
      cookies: 'Ce site utilise des cookies pour améliorer l\'expérience utilisateur...',
      responsabilite: 'Restaurant Le Gourmet SAS s\'efforce d\'assurer l\'exactitude...',
      droitApplicable: 'Les présentes mentions légales sont régies par le droit français...',
    },
  },
];

export function LegalPageEditable() {
  const [sections, setSections] = useState<LegalSection[]>(defaultSections);
  const [activeSection, setActiveSection] = useState<string>('mentions');
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editedContent, setEditedContent] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  // Charger les sections légales
  useEffect(() => {
    loadLegalSections();
  }, []);

  const loadLegalSections = async () => {
    try {
      // TODO: Remplacer par un appel API réel
      // const response = await fetch('/api/admin/legal-sections');
      // const data = await response.json();
      // setSections(data);

      // DONNÉES MOCKÉES (à remplacer)
      setSections(defaultSections);
    } catch (error) {
      console.error('Erreur lors du chargement des sections légales:', error);
    }
  };

  const getCurrentSection = () => {
    return sections.find(s => s.id === activeSection) || sections[0];
  };

  const handleEdit = () => {
    const currentSection = getCurrentSection();
    setEditedContent(currentSection.content);
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    setEditedContent({});
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);

      const currentSection = getCurrentSection();
      const updatedSection = {
        ...currentSection,
        content: editedContent,
        lastUpdate: new Date().toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
      };

      // TODO: Remplacer par un appel API réel
      // await fetch(`/api/admin/legal-sections/${activeSection}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(updatedSection),
      // });

      // Mettre à jour localement
      setSections(sections.map(s => 
        s.id === activeSection ? updatedSection : s
      ));

      setEditMode(false);
      setEditedContent({});
      alert('Section mise à jour avec succès !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (key: string, value: string) => {
    setEditedContent({
      ...editedContent,
      [key]: value,
    });
  };

  const currentSection = getCurrentSection();
  const content = editMode ? editedContent : currentSection.content;

  const menuItems = [
    { id: 'mentions', icon: FileText, label: 'Mentions Légales' },
    { id: 'confidentialite', icon: Shield, label: 'Politique de Confidentialité' },
    { id: 'cookies', icon: Cookie, label: 'Politique des Cookies' },
    { id: 'conditions', icon: Eye, label: 'Conditions d\'Utilisation' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl">Gestion des Mentions Légales</h2>
          <p className="text-sm text-gray-500">Modifiez les informations légales de votre site</p>
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Menu */}
        <Card className="border-gray-200 p-6 md:col-span-1 h-fit">
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (!editMode) {
                      setActiveSection(item.id);
                    }
                  }}
                  disabled={editMode}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[#cfbd97] text-black'
                      : 'text-gray-600 hover:bg-gray-50'
                  } ${editMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </Card>

        {/* Content - Mentions Légales */}
        {activeSection === 'mentions' && (
          <div className="md:col-span-3 space-y-6">
            <Card className="border-gray-200 p-8">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-[#cfbd97] p-2 rounded-lg">
                      <FileText className="h-6 w-6 text-black" />
                    </div>
                    <h3 className="text-xl">Mentions Légales</h3>
                  </div>
                  <p className="text-sm text-gray-500">
                    Dernière mise à jour: {currentSection.lastUpdate}
                  </p>
                </div>

                <Separator />

                <div className="space-y-6">
                  {/* Éditeur du site */}
                  <div>
                    <h4 className="text-sm font-semibold mb-4">1. Éditeur du site</h4>
                    <div className="space-y-4">
                      <div>
                        <Label>Raison sociale *</Label>
                        {editMode ? (
                          <Input
                            value={content.raisonSociale}
                            onChange={(e) => updateField('raisonSociale', e.target.value)}
                            className="mt-1"
                          />
                        ) : (
                          <p className="text-sm text-gray-600 mt-1">{content.raisonSociale}</p>
                        )}
                      </div>

                      <div>
                        <Label>Siège social *</Label>
                        {editMode ? (
                          <Input
                            value={content.siegeSocial}
                            onChange={(e) => updateField('siegeSocial', e.target.value)}
                            className="mt-1"
                          />
                        ) : (
                          <p className="text-sm text-gray-600 mt-1">{content.siegeSocial}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Capital social *</Label>
                          {editMode ? (
                            <Input
                              value={content.capitalSocial}
                              onChange={(e) => updateField('capitalSocial', e.target.value)}
                              className="mt-1"
                            />
                          ) : (
                            <p className="text-sm text-gray-600 mt-1">{content.capitalSocial}</p>
                          )}
                        </div>

                        <div>
                          <Label>SIRET *</Label>
                          {editMode ? (
                            <Input
                              value={content.siret}
                              onChange={(e) => updateField('siret', e.target.value)}
                              className="mt-1"
                            />
                          ) : (
                            <p className="text-sm text-gray-600 mt-1">{content.siret}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>TVA intracommunautaire *</Label>
                          {editMode ? (
                            <Input
                              value={content.tva}
                              onChange={(e) => updateField('tva', e.target.value)}
                              className="mt-1"
                            />
                          ) : (
                            <p className="text-sm text-gray-600 mt-1">{content.tva}</p>
                          )}
                        </div>

                        <div>
                          <Label>Directeur de la publication *</Label>
                          {editMode ? (
                            <Input
                              value={content.directeur}
                              onChange={(e) => updateField('directeur', e.target.value)}
                              className="mt-1"
                            />
                          ) : (
                            <p className="text-sm text-gray-600 mt-1">{content.directeur}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Email *</Label>
                          {editMode ? (
                            <Input
                              type="email"
                              value={content.email}
                              onChange={(e) => updateField('email', e.target.value)}
                              className="mt-1"
                            />
                          ) : (
                            <p className="text-sm text-gray-600 mt-1">{content.email}</p>
                          )}
                        </div>

                        <div>
                          <Label>Téléphone *</Label>
                          {editMode ? (
                            <Input
                              value={content.telephone}
                              onChange={(e) => updateField('telephone', e.target.value)}
                              className="mt-1"
                            />
                          ) : (
                            <p className="text-sm text-gray-600 mt-1">{content.telephone}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hébergeur */}
                  <div>
                    <h4 className="text-sm font-semibold mb-4">2. Hébergeur</h4>
                    <div className="space-y-4">
                      <div>
                        <Label>Hébergeur *</Label>
                        {editMode ? (
                          <Input
                            value={content.hebergeur}
                            onChange={(e) => updateField('hebergeur', e.target.value)}
                            className="mt-1"
                          />
                        ) : (
                          <p className="text-sm text-gray-600 mt-1">{content.hebergeur}</p>
                        )}
                      </div>

                      <div>
                        <Label>Siège social de l'hébergeur *</Label>
                        {editMode ? (
                          <Input
                            value={content.hebergeurAdresse}
                            onChange={(e) => updateField('hebergeurAdresse', e.target.value)}
                            className="mt-1"
                          />
                        ) : (
                          <p className="text-sm text-gray-600 mt-1">{content.hebergeurAdresse}</p>
                        )}
                      </div>

                      <div>
                        <Label>Téléphone de l'hébergeur</Label>
                        {editMode ? (
                          <Input
                            value={content.hebergeurTel}
                            onChange={(e) => updateField('hebergeurTel', e.target.value)}
                            className="mt-1"
                          />
                        ) : (
                          <p className="text-sm text-gray-600 mt-1">{content.hebergeurTel}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Textes longs */}
                  <div>
                    <h4 className="text-sm font-semibold mb-4">3. Propriété intellectuelle</h4>
                    {editMode ? (
                      <Textarea
                        value={content.proprieteIntellectuelle}
                        onChange={(e) => updateField('proprieteIntellectuelle', e.target.value)}
                        rows={4}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-sm text-gray-600">{content.proprieteIntellectuelle}</p>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-4">4. Protection des données personnelles</h4>
                    {editMode ? (
                      <Textarea
                        value={content.protectionDonnees}
                        onChange={(e) => updateField('protectionDonnees', e.target.value)}
                        rows={4}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-sm text-gray-600">{content.protectionDonnees}</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Placeholder pour autres sections */}
        {activeSection !== 'mentions' && (
          <div className="md:col-span-3">
            <Card className="border-gray-200 p-8">
              <div className="text-center py-12">
                <p className="text-gray-500">
                  Section "{menuItems.find(m => m.id === activeSection)?.label}" à implémenter
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Utilisez le même principe que les Mentions Légales
                </p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
