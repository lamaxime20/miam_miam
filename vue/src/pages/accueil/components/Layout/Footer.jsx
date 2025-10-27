import "./Footer.css";
import { Link } from "react-router-dom";
import IconStopwatch from "../../assets/images/icons/icons8-stopwatch-50.png";
import IconStar from "../../assets/images/icons/icons8-star-24.png";
import IconTruck from "../../assets/images/icons/icons8-truck-50.png";
import IconSponsorship from "../../assets/images/icons/icons8-sponsorship-64.png";
import IconLocation from "../../assets/images/icons/icons8-location-50.png";
import IconPhone from "../../assets/images/icons/icons8-telephone-30.png";
import IconMail from "../../assets/images/icons/icons8-envelope-30.png";

function Footer() {
  return (
    <footer className="footer">
      <div className="why-choose-section">
        <div className="container-fluid">
          <h2 className="why-choose-title">Pourquoi choisir Mon miam miam ?</h2>
          <p className="why-choose-subtitle">Une expérience culinaire simplifiée pour tous</p>

          <div className="row features-row">
            <div className="col-12 col-sm-6 col-lg-3 feature-col">
              <div className="feature-box">
                <div className="feature-icon">
                  <img src={IconStopwatch} alt="Commande rapide" className="feature-img" />
                </div>
                <h4 className="feature-title">Commande rapide</h4>
                <p className="feature-description">Passez votre commande en moins de 5 minutes</p>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3 feature-col">
              <div className="feature-box">
                <div className="feature-icon">
                  <img src={IconStar} alt="Points fidélité" className="feature-img" />
                </div>
                <h4 className="feature-title">Points fidélité</h4>
                <p className="feature-description">Gagnez des points à chaque commande</p>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3 feature-col">
              <div className="feature-box">
                <div className="feature-icon">
                  <img src={IconTruck} alt="Livraison rapide" className="feature-img" />
                </div>
                <h4 className="feature-title">Livraison rapide</h4>
                <p className="feature-description">Livraison en moins de 30 minutes</p>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3 feature-col">
              <div className="feature-box">
                <div className="feature-icon">
                  <img src={IconSponsorship} alt="Parrainage" className="feature-img" />
                </div>
                <h4 className="feature-title">Parrainage</h4>
                <p className="feature-description">Invitez vos amis et gagnez des réductions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid">
        <div className="row footer-content">
          <div className="col-12 col-md-6 col-lg-3 footer-column">
            <h3 className="footer-title">Contact</h3>
            <ul className="footer-list">
              <li className="footer-item">
                <img src={IconLocation} alt="Position" className="feature-img" />
                <span>
                  Résidence La Terrasse
                  <br />
                  Ucac-Icam Douala
                </span>
              </li>
              <li className="footer-item">
                <img src={IconPhone} alt="Phone" className="feature-img" />
                <span>+237 687 62 65 34</span>
              </li>
              <li className="footer-item">
                <img src={IconMail} alt="Email" className="feature-img" />
                <span>contact@zeduc-space.com</span>
              </li>
            </ul>
          </div>

          <div className="col-12 col-md-6 col-lg-3 footer-column">
            <h3 className="footer-title">Société</h3>
            <ul className="footer-list">
              <li><a href="#" className="footer-link">À propos</a></li>
              <li><a href="#" className="footer-link">Carrières</a></li>
              <li><a href="#" className="footer-link">Notre équipe</a></li>
            </ul>
          </div>

          <div className="col-12 col-md-6 col-lg-3 footer-column">
            <h3 className="footer-title">Soutien</h3>
            <ul className="footer-list">
              <li><a href="#" className="footer-link">FAQ</a></li>
              <li><a href="#" className="footer-link">Contact</a></li>
              <li><Link to="/mentions-legales" className="footer-link">Mentions légales</Link></li>
              <li><Link to="/politique-utilisation" className="footer-link">Politique d’utilisation</Link></li>
              <li><Link to="/politique-cookies" className="footer-link">Politique de cookies</Link></li>
            </ul>
          </div>

          <div className="col-12 col-md-6 col-lg-3 footer-column">
            <h3 className="footer-title">Horaires</h3>
            <ul className="footer-list">
              <li className="footer-hours">Lundi - Vendredi : 9h - 23h</li>
              <li className="footer-hours">Samedi : 8h - 23h</li>
              <li className="footer-hours">Dimanche : 10h - 21h</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">© 2025 Zeduc-Space. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
