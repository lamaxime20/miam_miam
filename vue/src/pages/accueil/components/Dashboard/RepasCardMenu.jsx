import { Star, ShoppingCart, Plus, Minus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AvoirRestaurantById } from '../../../../services/restaurant';

const RepasCardMenu = ({ 
  item, 
  onAddToCart, 
  onIncrementQuantity, 
  onDecrementQuantity, 
  quantityInCart = 0 
}) => {
  const [restaurant, setRestaurant] = useState(null);

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (item.idresto) {
        try {
          console.log(item.idresto);
          const restaurantData = await AvoirRestaurantById(item.idresto);
          console.log(restaurantData);
          setRestaurant(restaurantData);
        } catch (error) {
          console.error(`Erreur lors de la récupération du restaurant ${item.idresto}:`, error);
        }
      }
      console.log(restaurant);
    };
    fetchRestaurant();
  }, [item.idresto]);

  return (
    <div className="col" key={item.id}>
      <div className="card h-100 shadow-sm">
        <div className="position-relative">
          <img
            src={item.image}
            className="card-img-top"
            alt={item.name}
            style={{ height: '200px', objectFit: 'cover' }}
          />
          {item.popular && (
            <div className="position-absolute top-0 start-0 m-2 bg-danger text-white px-2 py-1 rounded d-flex align-items-center gap-1">
              <Star size={14} />
              <small>Populaire</small>
            </div>
          )}
          <div className="position-absolute top-0 end-0 m-2 bg-light px-2 py-1 rounded d-flex align-items-center gap-1">
            <Star size={14} className="text-warning" />
            <small>{item.rating}</small>
          </div>
        </div>

        <div className="card-body d-flex flex-column justify-content-between">
          <div>
            <h5 className="card-title">{item.name}</h5>
            <p className="card-text text-secondary">{restaurant ? restaurant.nom_restaurant : 'Chargement...'}</p>
            <p className="card-text text-secondary">{item.description}</p>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-3">
            <span className="fw-bold text-warning">{item.price} FCFA</span>
            
            {quantityInCart === 0 ? (
              <button
                onClick={() => onAddToCart(item)}
                className="btn btn-warning text-white d-flex align-items-center gap-1"
              >
                <ShoppingCart size={16} />
                Ajouter
              </button>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <button
                  onClick={() => onDecrementQuantity(item.id)}
                  className="btn btn-outline-warning d-flex align-items-center justify-content-center"
                  style={{ width: '36px', height: '36px' }}
                >
                  <Minus size={16} />
                </button>
                
                <span className="fw-bold text-dark" style={{ minWidth: '24px', textAlign: 'center' }}>
                  {quantityInCart}
                </span>
                
                <button
                  onClick={() => onIncrementQuantity(item.id)}
                  className="btn btn-warning text-white d-flex align-items-center justify-content-center"
                  style={{ width: '36px', height: '36px' }}
                >
                  <Plus size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepasCardMenu;
