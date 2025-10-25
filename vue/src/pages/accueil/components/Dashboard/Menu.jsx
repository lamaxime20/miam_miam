import { Search, Filter, ShoppingCart, Star } from 'lucide-react';
import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Eru from "../../assets/images/utilsImages/Eru.jpg"
import Okok from "../../assets/images/utilsImages/Okok.png"
import Ndole from "../../assets/images/utilsImages/Ndole.png"
import PouletDG from "../../assets/images/utilsImages/PouletDG.png"
const categories = ['Tous','Entrées','Plats','Desserts'];

const menuItems = [
  {
    id: 1,
    name: "Eru",
    category:'Plats',
    image: Eru,
    description: "Délicieux Eru accompagné de coucous Tapioca",
    price:1000,
    rating: 5,
    popular: true,
  },
  {
    id: 2,
    name: "Okok salé",
    category:'Plats',
    image: Okok,
    description: "Du okok sale savoureux accompagné de baton de manioc",
    price: 1000,
    rating: 4.6,
    popular: true,
  },
  {
    id: 3,
    name: "Ndolé",
    category:'Plats',
    image: Ndole,
    description: "Ndole avec au choix du riz, plantain ou baton de manioc pour accompagnement",
    price: 1500,
    rating: 4.7,
  },
  {
    id: 4,
    name: "Poulet DG",
    category:'Plats',
    image: PouletDG,
    description: "Poulet DG accompagné de plantains frits et d'une sauce épicée",
    price: 2000 ,
    rating: 4.9,
    popular: true,
  },
  {
    id: 5,
    name: 'Salade César',
    category: 'Entrées',
    description: 'Poulet grillé, parmesan, croûtons, sauce César',
    price: 900,
    image: 'https://images.unsplash.com/photo-1708184528305-33ce7daced65',
    rating: 4.5,
  },
  {
    id: 6,
    name: 'Tiramisu',
    category: 'Desserts',
    description: 'Mascarpone, café, cacao, biscuits',
    price: 600,
    image: 'https://images.unsplash.com/photo-1705933774160-24298027a349',
    rating: 4.8,
  },
];

export default function Menu() {
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState({});

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'Tous' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (itemId) => {
    setCart(prev => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
  };

  const cartCount = Object.values(cart).reduce((sum, count) => sum + count, 0);

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
              placeholder="Rechercher un plat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
              {category}
            </button>
          ))}
        </div>
  
        {/* Grille des plats */}
        <div className="row row-cols-1 row-cols-md-3 g-4">
    {filteredItems.map(item => (
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
              <p className="card-text text-secondary">{item.description}</p>
            </div>
  
            <div className="d-flex justify-content-between align-items-center mt-3">
              <span className="fw-bold text-warning">{item.price} FCFA</span>
              <button
                onClick={() => addToCart(item.id)}
                className="btn btn-warning text-white d-flex align-items-center gap-1"
              >
                <ShoppingCart size={16} />
                Ajouter
              </button>
            </div>
          </div>
        </div>
      </div>
    ))}
  
    {filteredItems.length === 0 && (
      <div className="text-center py-5 text-secondary">
        <p>Aucun plat trouvé. Essayez une autre recherche ou catégorie.</p>
      </div>
    )}
        </div>
      </div>
    );
  }
