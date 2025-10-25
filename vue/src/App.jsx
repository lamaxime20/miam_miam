import { Routes, Route } from 'react-router-dom';
import Login from './pages/login.jsx';
import AcceuilStudent from './pages/etudiants/Acceuil.jsx';
import Signup from './pages/signup.jsx';
import CreateRestaurant from './pages/createRestaurant.jsx';
import PrivateRoute from './components/privateRoute.jsx';

function App() {
    return (
        <Routes>
            <Route path="/" element={<AcceuilStudent />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/etudiants" element={<AcceuilStudent />} />

            {/* Route protégée */}
            <Route 
                path="/create-restaurant" 
                element={
                    <PrivateRoute>
                        <CreateRestaurant />
                    </PrivateRoute>
                } 
            />
        </Routes>
    )
}

export default App;