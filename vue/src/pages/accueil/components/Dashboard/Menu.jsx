import { Search, Filter, ShoppingCart, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Eru from "../../assets/images/utilsImages/Eru.jpg"
import Okok from "../../assets/images/utilsImages/Okok.png"
import Ndole from "../../assets/images/utilsImages/Ndole.png"
import PouletDG from "../../assets/images/utilsImages/PouletDG.png"
import RepasCardMenu from './RepasCardMenu';
import { 
  getMenusParPopularite, 
  addToCart, 
  incrementCartQuantity, 
  decrementCartQuantity, 
  getTotalCartItems,
  getMenuQuantityInCart,
  filterAndSearchMenus,
  getSearchSuggestions
} from '../../../../services/Menu.js';
const categories = ['Tous','entree','plat','dessert','boisson'];

// Fonction pour obtenir le libellé français d'une catégorie
const getCategoryLabel = (category) => {
  const labels = {
    'Tous': 'Tous',
    'entree': 'Entrées',
    'plat': 'Plats',
    'dessert': 'Desserts',
    'boisson': 'Boissons'
  };
  return labels[category] || category;
};

export default function Menu() {
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Chargement des menus depuis l'API
  useEffect(() => {
    const loadMenus = async () => {
      try {
        setLoading(true);
        const menus = await getMenusParPopularite();
        setMenuItems(menus);
      } catch (error) {
        console.error('Erreur lors du chargement des menus:', error);
        // En cas d'erreur, on garde les données statiques comme fallback
        setMenuItems([
          {
            id: 1,
            name: "Eru",
            category:'plat',
            image: Eru,
            description: "Délicieux Eru accompagné de coucous Tapioca",
            price:1000,
            rating: 5,
            popular: true,
            nomResto: "Le Resto de Mama"
          },
          {
            id: 2,
            name: "Okok salé",
            category:'plat',
            image: Okok,
            description: "Du okok sale savoureux accompagné de baton de manioc",
            price: 1000,
            rating: 4.6,
            popular: true,
            nomResto: "Le Resto de Mama"
          },
          {
            id: 3,
            name: "Ndolé",
            category:'plat',
            image: Ndole,
            description: "Ndole avec au choix du riz, plantain ou baton de manioc pour accompagnement",
            price: 1500,
            rating: 4.7,
            nomResto: "Le Resto de Mama"
          },
          {
            id: 4,
            name: "Poulet DG",
            category:'plat',
            image: PouletDG,
            description: "Poulet DG accompagné de plantains frits et d'une sauce épicée",
            price: 2000 ,
            rating: 4.9,
            popular: true,
            nomResto: "Le Resto de Mama"
          },
          {
            id: 5,
            name: 'Salade César',
            category: 'entree',
            description: 'Poulet grillé, parmesan, croûtons, sauce César',
            price: 900,
            image: 'https://images.unsplash.com/photo-1708184528305-33ce7daced65',
            rating: 4.5,
            nomResto: "Le Resto de Mama"
          },
          {
            id: 6,
            name: 'Tiramisu',
            category: 'dessert',
            description: 'Mascarpone, café, cacao, biscuits',
            price: 600,
            image: 'https://images.unsplash.com/photo-1705933774160-24298027a349',
            rating: 4.8,
            nomResto: "Le Resto de Mama"
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadMenus();
  }, []);

  // Mise à jour du compteur du panier
  useEffect(() => {
    const updateCartCount = () => {
      setCartCount(getTotalCartItems());
    };
    
    updateCartCount();
    
    // Écouter les changements dans le localStorage
    window.addEventListener('storage', updateCartCount);
    
    return () => {
      window.removeEventListener('storage', updateCartCount);
    };
  }, []);

  // Filtrage et recherche des menus
  const filteredItems = filterAndSearchMenus(menuItems, selectedCategory, searchQuery);

  // Gestion des suggestions de recherche
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim().length > 0) {
      const suggestions = getSearchSuggestions(menuItems, query);
      setSearchSuggestions(suggestions);
      setShowSuggestions(true);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
  };

  const handleSearchFocus = () => {
    if (searchQuery.trim().length > 0 && searchSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleSearchBlur = () => {
    // Délai pour permettre le clic sur une suggestion
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  // Fonctions de gestion du panier
  const handleAddToCart = (menuItem) => {
    addToCart(menuItem);
    setCartCount(getTotalCartItems());
  };

  const handleIncrementQuantity = (menuId) => {
    incrementCartQuantity(menuId);
    setCartCount(getTotalCartItems());
  };

  const handleDecrementQuantity = (menuId) => {
    decrementCartQuantity(menuId);
    setCartCount(getTotalCartItems());
  };

  // Affichage du chargement
  if (loading) {
    return (
      <div className="container my-5">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
            <p className="mt-3 text-secondary">Chargement des menus...</p>
          </div>
        </div>
      </div>
    );
  }

    return (
      <div className="container my-5">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="fw-bold mb-1">Notre Menu</h1>
            <p className="text-secondary mb-0">Découvrez nos délicieux plats</p>
          </div>
          {cartCount > 0 && (
            <div className="bg-warning text-dark px-4 py-2 rounded-pill d-flex align-items-center gap-2">
              <ShoppingCart size={18} />
              <span>{cartCount} article{cartCount > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
  
        {/* Barre de recherche */}
        <div className="bg-light p-3 rounded mb-4 d-flex gap-2">
          <div className="flex-grow-1 position-relative">
            <Search
              className="position-absolute"
              style={{ left: 10, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }}
            />
            <input
              type="text"
              className="form-control ps-5"
              placeholder="Rechercher un plat, restaurant, catégorie..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
            />
            
            {/* Suggestions de recherche */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="position-absolute w-100 bg-white border rounded shadow-lg" style={{ top: '100%', left: 0, zIndex: 1000 }}>
                {searchSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="px-3 py-2 cursor-pointer hover-bg-light"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSuggestionClick(suggestion)}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                  >
                    <small className="text-muted">{suggestion}</small>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button className="btn btn-outline-secondary d-flex align-items-center gap-1">
            <Filter size={18} />
            <span>Filtres</span>
          </button>
        </div>
  
        {/* Catégories */}
        <div className="d-flex gap-2 flex-wrap mb-4">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`btn rounded-pill px-4 py-2 ${
                selectedCategory === category ? 'btn-warning text-white' : 'btn-outline-secondary'
              }`}
            >
              {getCategoryLabel(category)}
            </button>
          ))}
        </div>
  
        {/* Indicateur de résultats */}
        {(searchQuery || selectedCategory !== 'Tous') && (
          <div className="mb-3">
            <small className="text-muted">
              {filteredItems.length} résultat{filteredItems.length > 1 ? 's' : ''} trouvé{filteredItems.length > 1 ? 's' : ''}
              {searchQuery && ` pour "${searchQuery}"`}
              {selectedCategory !== 'Tous' && ` dans ${getCategoryLabel(selectedCategory)}`}
            </small>
          </div>
        )}

        {/* Grille des plats */}
        <div className="row row-cols-1 row-cols-md-3 g-4">
    {filteredItems.map(item => (
      <RepasCardMenu 
        key={item.id} 
        item={item} 
        onAddToCart={handleAddToCart}
        onIncrementQuantity={handleIncrementQuantity}
        onDecrementQuantity={handleDecrementQuantity}
        quantityInCart={getMenuQuantityInCart(item.id)}
      />
    ))}
  
    {filteredItems.length === 0 && !loading && (
      <div className="text-center py-5 text-secondary">
        <div className="mb-3">
          <Search size={48} className="text-muted" />
        </div>
        <h5>Aucun plat trouvé</h5>
        <p>
          {searchQuery ? (
            <>Essayez une autre recherche ou <button 
              className="btn btn-link p-0" 
              onClick={() => setSearchQuery('')}
            >
              effacez la recherche
            </button></>
          ) : (
            <>Essayez une autre catégorie</>
          )}
        </p>
      </div>
    )}
        </div>
      </div>
    );
  }
