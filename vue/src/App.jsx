import { useState } from 'react'
import { Routes, Route } from 'react-router-dom';
import Login from './pages/login.jsx'
import AcceuilStudent from './pages/etudiants/Acceuil.jsx'
import Signup from './pages/signup.jsx'
import CreateRestaurant from './pages/createRestaurant.jsx';
import { recupererToken } from './services/user.js';

function App() {

    return (
        <Routes>
            <Route path="/" element={<AcceuilStudent />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/etudiants" element={<AcceuilStudent />} />
            {recupererToken() != null && (
                <Route path="/create-restaurant" element={<CreateRestaurant />} />
            )}
            {recupererToken() == null && (
                <Route path='/create-restaurant' element={<AcceuilStudent />} />
            )}
        </Routes>
    )
}

export default App
