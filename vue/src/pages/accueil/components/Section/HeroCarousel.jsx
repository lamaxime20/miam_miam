import { useEffect } from "react";
import "./HeroCarousel.css";
import PromoImage from "../../assets/images/utilsImages/Promotions.png";
import EventImage from "../../assets/images/utilsImages/Evenements.jpg";

function HeroCarousel() {
  useEffect(() => {
    const carouselElement = document.querySelector("#heroCarousel");
    if (carouselElement && window.bootstrap) {
      new window.bootstrap.Carousel(carouselElement, {
        interval: 5000,
        ride: "carousel",
      });
    }
  }, []);

  return (
    <div id="heroCarousel" className="carousel slide hero-carousel" data-bs-ride="carousel">
      <div className="carousel-indicators">
        <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="0" className="active"></button>
        <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="1"></button>
      </div>

      <div className="carousel-inner">
        <div className="carousel-item active">
          <div className="carousel-content">
            <div className="carousel-overlay"></div>
            <img src={PromoImage} alt="Promotion image" className="carousel-image" />
            <div className="carousel-caption-custom">
              <h2 className="carousel-title">Promotions Spéciales</h2>
              <p className="carousel-subtitle">Découvrez nos offres exceptionnelles</p>
              <p className="carousel-description">
                Profitez de réductions allant jusqu'à 30% sur une sélection de plats. Offre valable du lundi au vendredi
                de 12h à 15h.
              </p>
              <button className="btn-carousel">Voir les promotions</button>
            </div>
          </div>
        </div>

        <div className="carousel-item">
          <div className="carousel-content">
            <div className="carousel-overlay"></div>
            <img src={EventImage} alt="Événements à venir" className="carousel-image" />
            <div className="carousel-caption-custom">
              <h2 className="carousel-title">Événements à venir</h2>
              <p className="carousel-subtitle">Rejoignez-nous pour des moments inoubliables</p>
              <p className="carousel-description">
                Soirée étudiante tous les vendredis soirs avec DJ live et menu spécial. Réservation recommandée.
              </p>
              <button className="btn-carousel">En savoir plus</button>
            </div>
          </div>
        </div>
      </div>

      <button className="carousel-control-prev" type="button" data-bs-target="#heroCarousel" data-bs-slide="prev">
        <span className="carousel-control-prev-icon"></span>
      </button>
      <button className="carousel-control-next" type="button" data-bs-target="#heroCarousel" data-bs-slide="next">
        <span className="carousel-control-next-icon"></span>
      </button>
    </div>
  );
}

export default HeroCarousel;
