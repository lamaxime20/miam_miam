import { useState } from 'react'
import { Routes, Route } from 'react-router-dom';
import './App.css'
import Login from './pages/login.jsx'
import AcceuilStudent from './pages/etudiants/Acceuil.jsx'
import Signup from './pages/signup.jsx'

function App() {

    return (
        <Routes>
            <Route path="/" element={<AcceuilStudent />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/etudiants" element={<AcceuilStudent />} />
        </Routes>
    )
}

export default App
