import { Card } from './ui/card';
import { Separator } from './ui/separator';
import { FileText, Shield, Eye, Cookie } from 'lucide-react';

export function LegalPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl">Mentions Légales</h2>
        <p className="text-sm text-gray-500">Informations légales et politique de confidentialité</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Menu */}
        <Card className="border-gray-200 p-6 md:col-span-1 h-fit">
          <nav className="space-y-1">
            {[
              { icon: FileText, label: 'Mentions Légales' },
              { icon: Shield, label: 'Politique de Confidentialité' },
              { icon: Cookie, label: 'Politique des Cookies' },
              { icon: Eye, label: 'Conditions d\'Utilisation' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </Card>

        {/* Content */}
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
                  Dernière mise à jour: 24 octobre 2025
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm mb-2">1. Éditeur du site</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Raison sociale:</strong> Restaurant Le Gourmet SAS</p>
                    <p><strong>Siège social:</strong> 123 Avenue des Champs-Élysées, 75008 Paris, France</p>
                    <p><strong>Capital social:</strong> 50 000 €</p>
                    <p><strong>SIRET:</strong> 123 456 789 00012</p>
                    <p><strong>TVA intracommunautaire:</strong> FR12345678900</p>
                    <p><strong>Directeur de la publication:</strong> Jean Dupont</p>
                    <p><strong>Email:</strong> contact@legourmet.fr</p>
                    <p><strong>Téléphone:</strong> +33 1 42 56 78 90</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm mb-2">2. Hébergeur</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Hébergeur:</strong> OVH SAS</p>
                    <p><strong>Siège social:</strong> 2 rue Kellermann, 59100 Roubaix, France</p>
                    <p><strong>Téléphone:</strong> 1007</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm mb-2">3. Propriété intellectuelle</h4>
                  <p className="text-sm text-gray-600">
                    L'ensemble du contenu de ce site (textes, images, vidéos, logos, graphismes, etc.) est la propriété exclusive de Restaurant Le Gourmet SAS, sauf mention contraire. Toute reproduction, distribution, modification, adaptation, retransmission ou publication de ces différents éléments est strictement interdite sans l'accord écrit de Restaurant Le Gourmet SAS.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm mb-2">4. Protection des données personnelles</h4>
                  <p className="text-sm text-gray-600">
                    Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition aux données personnelles vous concernant. Pour exercer ce droit, vous pouvez nous contacter à l'adresse: privacy@legourmet.fr
                  </p>
                </div>

                <div>
                  <h4 className="text-sm mb-2">5. Cookies</h4>
                  <p className="text-sm text-gray-600">
                    Ce site utilise des cookies pour améliorer l'expérience utilisateur et analyser le trafic. En continuant à naviguer sur ce site, vous acceptez l'utilisation de cookies. Vous pouvez configurer vos préférences de cookies à tout moment dans les paramètres de votre navigateur.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm mb-2">6. Responsabilité</h4>
                  <p className="text-sm text-gray-600">
                    Restaurant Le Gourmet SAS s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur ce site. Toutefois, Restaurant Le Gourmet SAS ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations mises à disposition sur ce site.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm mb-2">7. Droit applicable</h4>
                  <p className="text-sm text-gray-600">
                    Les présentes mentions légales sont régies par le droit français. Tout litige relatif à l'utilisation de ce site sera soumis à la compétence exclusive des tribunaux français.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-gray-200 p-8">
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl">Politique de Confidentialité</h3>
                </div>
                <p className="text-sm text-gray-500">
                  Notre engagement pour la protection de vos données
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm mb-2">1. Collecte des données</h4>
                  <p className="text-sm text-gray-600">
                    Nous collectons les informations que vous nous fournissez directement lorsque vous créez un compte, passez une commande, ou nous contactez. Ces informations peuvent inclure: nom, prénom, adresse email, numéro de téléphone, adresse de livraison, et informations de paiement.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm mb-2">2. Utilisation des données</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Vos données personnelles sont utilisées pour:
                  </p>
                  <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                    <li>Traiter et livrer vos commandes</li>
                    <li>Communiquer avec vous concernant vos commandes</li>
                    <li>Améliorer nos services et votre expérience</li>
                    <li>Vous envoyer des communications marketing (avec votre consentement)</li>
                    <li>Respecter nos obligations légales</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm mb-2">3. Partage des données</h4>
                  <p className="text-sm text-gray-600">
                    Nous ne vendons jamais vos données personnelles. Nous pouvons partager vos informations avec des prestataires de services tiers qui nous aident à exploiter notre entreprise (livraison, paiement, hébergement), dans le strict respect de la réglementation applicable.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm mb-2">4. Sécurité des données</h4>
                  <p className="text-sm text-gray-600">
                    Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos données personnelles contre tout accès non autorisé, perte ou destruction.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm mb-2">5. Vos droits</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Conformément au RGPD, vous disposez des droits suivants:
                  </p>
                  <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                    <li>Droit d'accès à vos données personnelles</li>
                    <li>Droit de rectification de vos données</li>
                    <li>Droit à l'effacement (droit à l'oubli)</li>
                    <li>Droit à la limitation du traitement</li>
                    <li>Droit à la portabilité de vos données</li>
                    <li>Droit d'opposition au traitement</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm mb-2">6. Contact</h4>
                  <p className="text-sm text-gray-600">
                    Pour toute question concernant notre politique de confidentialité ou pour exercer vos droits, contactez-nous à: privacy@legourmet.fr
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-gray-200 p-8">
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <Cookie className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="text-xl">Politique des Cookies</h3>
                </div>
                <p className="text-sm text-gray-500">
                  Comment nous utilisons les cookies
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm mb-2">1. Qu'est-ce qu'un cookie ?</h4>
                  <p className="text-sm text-gray-600">
                    Un cookie est un petit fichier texte stocké sur votre appareil lorsque vous visitez notre site. Les cookies nous permettent de mémoriser vos préférences et d'améliorer votre expérience de navigation.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm mb-2">2. Types de cookies utilisés</h4>
                  <div className="text-sm text-gray-600 space-y-2">
                    <p><strong>Cookies essentiels:</strong> Nécessaires au fonctionnement du site (panier, connexion)</p>
                    <p><strong>Cookies de performance:</strong> Analysent l'utilisation du site pour améliorer nos services</p>
                    <p><strong>Cookies fonctionnels:</strong> Mémorisent vos préférences (langue, région)</p>
                    <p><strong>Cookies marketing:</strong> Permettent de vous proposer des offres personnalisées</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm mb-2">3. Gestion des cookies</h4>
                  <p className="text-sm text-gray-600">
                    Vous pouvez à tout moment modifier vos préférences de cookies ou les désactiver via les paramètres de votre navigateur. Notez que la désactivation de certains cookies peut affecter le fonctionnement du site.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
