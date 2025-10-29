import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login.jsx'
import AcceuilStudent from './pages/accueil/AcceuilStudent.jsx'
import Signup from './pages/signup.jsx'
import Employer from './pages/employer/Employer.jsx'
import Admin from './pages/Admin/Admin.jsx'
import Gerant from './pages/gerant/GerantIframe.jsx'
import { recupererToken, recupererAuth } from './services/user.js';
import MentionsLegales from './pages/Legal_pages/MentionsLegales.jsx'
import PolitiqueUtilisation from './pages/Legal_pages/PolitiqueUtilisation.jsx'
import PolitiqueCookies from './pages/Legal_pages/PolitiquesCookies.jsx'

export const roleAdmin = 'administrateur'
export const roleGerant = 'gerant'
export const roleLivreur = 'livreur'
export const roleEmploye = 'employe'
export const roleClient = 'client'
import { recupererToken } from './services/user.js';
import MentionsLegales from './pages/Legal_pages/MentionsLegales.jsx'
import PolitiqueUtilisation from './pages/Legal_pages/PolitiqueUtilisation.jsx'
import PolitiqueCookies from './pages/Legal_pages/PolitiquesCookies.jsx'

function App() {
    const token = recupererAuth();

    return (
        <Routes>
            <Route path="/" element={<AcceuilStudent />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/gerant" element={<Gerant />} />
            <Route path="/employer" element={<Employer />} />
            <Route path="/etudiants" element={<AcceuilStudent />} />
            <Route path="/mentions-legales" element={<MentionsLegales />} />
            <Route path="/politique-utilisation" element={<PolitiqueUtilisation />} />
            <Route path="/politique-cookies" element={<PolitiqueCookies />} />
            {recupererToken() != null && (<Route path="/create-restaurant" element={<Login />} />
            )}

            {recupererToken()}
            
            
            {token == null && (
                <Route path='/create-restaurant' element={<AcceuilStudent />} />
            )}
            {token && token.role === roleAdmin && token.restaurant != null && (
                <Route path='/admin' element={<Admin />} />
            )}

            {token && token.role === roleGerant && token.restaurant != null && (
                <Route path='/gerant' element={<Gerant />} />
            )}

            {token && token.role === roleLivreur && token.restaurant != null && (
                <Route path='/livreur-dashboard' element={<Gerant />} />
            )}

            {token && token.role === roleEmploye && token.restaurant != null && (
                <Route path='/employer' element={<Employer />} />
            )}

            {token && token.role === roleClient && token.restaurant != null && (
                <Route path='/' element={<AcceuilStudent />} />
            )}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}

export default App