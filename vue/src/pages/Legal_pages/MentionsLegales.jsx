import "bootstrap/dist/css/bootstrap.min.css"
import "./LegalPages.css"

function MentionsLegales() {
  return (
    <div className="container mt-5">
      <div className="legal-container">
        <h2 className="legal-title text-center mb-4">Mentions légales</h2>

        <p className="text-center">
          Conformément à la législation en vigueur, voici les informations légales relatives à <strong>Mon miam miam</strong>.
        </p>

        <div className="legal-section">
          <h5>1. Éditeur du site</h5>
          <p>
            Nom : Mon miam miam <br />
            Statut : Auto-entreprise immatriculée au registre du commerce de Douala] <br />
            Siège social : Terasse, Yansoki, Douala, Cameroun <br />
            Téléphone : +237 687 62 65 30 <br />
            Email : contact@zeduc-space.com <br />
            Responsable : Miam resp.
          </p>

          <h5>2. Hébergeur</h5>
          <p>
            Hébergeur : Vercel Inc<br/>
            Adresse : Résidence La Terrasse Ucac-Icam Douala <br />
            Téléphone : +237 687 62 65 30/ +242 068 12 49 58
          </p>

          <h5>3. Propriété intellectuelle</h5>
          <p>
            Tous les contenus présents sur ce site sont la propriété exclusive de <strong>Mon miam miam</strong>.
            Toute reproduction, modification ou distribution sans autorisation est interdite.
          </p>

          <h5>4. Données personnelles</h5>
          <p>
            Les données collectées sont traitées conformément à notre politique de confidentialité.
          </p>

          <h5>5. Contact</h5>
          <p>
            Email : <a href="mailto:contact@monmiammiam.com" className="legal-link">contact@monmiammiam.com</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default MentionsLegales
