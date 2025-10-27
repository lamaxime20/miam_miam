import "bootstrap/dist/css/bootstrap.min.css"
import "./LegalPages.css"

function PolitiqueUtilisation() {
  return (
    <div className="container mt-5">
      <div className="legal-container">
        <h2 className="legal-title text-center mb-4">Politique d’utilisation</h2>

        <p className="text-center">
          Cette politique définit les règles d’utilisation du site <strong>Mon miam miam</strong> et de ses services.
        </p>

        <div className="legal-section">
          <h5>1. Acceptation des conditions</h5>
          <p>
            En accédant au site, vous acceptez les présentes conditions d’utilisation. 
            Si vous n’êtes pas d’accord, veuillez ne pas utiliser nos services.
          </p>

          <h5>2. Utilisation du service</h5>
          <p>
            Vous vous engagez à utiliser le site de manière légale et respectueuse. 
            Tout comportement abusif ou frauduleux est interdit.
          </p>

          <h5>3. Compte utilisateur</h5>
          <p>
            Vous êtes responsable de la confidentialité de vos identifiants et des actions effectuées sur votre compte.
          </p>

          <h5>4. Contenu utilisateur</h5>
          <p>
            Vous êtes seul responsable du contenu publié sur la plateforme.
          </p>

          <h5>5. Modifications</h5>
          <p>
            Mon miam miam se réserve le droit de modifier cette politique à tout moment.
          </p>
        </div>
      </div>
    </div>
  )
}

export default PolitiqueUtilisation
