import "bootstrap/dist/css/bootstrap.min.css"
import "./LegalPages.css"

function PolitiqueCookies() {
  return (
    <div className="container mt-5">
      <div className="legal-container">
        <h2 className="legal-title text-center mb-4">Politique de cookies</h2>

        <p className="text-center">
          Cette politique explique comment <strong>Mon miam miam</strong> utilise les cookies et technologies similaires.
        </p>

        <div className="legal-section">
          <h5>1. Qu’est-ce qu’un cookie ?</h5>
          <p>
            Un cookie est un petit fichier stocké sur votre appareil pour améliorer votre expérience utilisateur.
          </p>

          <h5>2. Types de cookies utilisés</h5>
          <ul>
            <li><strong>Cookies essentiels :</strong> assurent le bon fonctionnement du site.</li>
            <li><strong>Cookies analytiques :</strong> aident à mesurer l’audience.</li>
            <li><strong>Cookies de personnalisation :</strong> adaptent le contenu selon vos préférences.</li>
          </ul>

          <h5>3. Gestion des cookies</h5>
          <p>
            Vous pouvez à tout moment désactiver les cookies via les paramètres de votre navigateur.
          </p>

          <h5>4. Consentement</h5>
          <p>
            En continuant à utiliser le site, vous acceptez notre politique de cookies.
          </p>

          <h5>5. Contact</h5>
          <p>
            Pour toute question : <a href="mailto:contact@monmiammiam.com" className="legal-link">contact@monmiammiam.com</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default PolitiqueCookies
