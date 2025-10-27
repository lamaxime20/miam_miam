import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login.jsx'
import AcceuilStudent from './pages/accueil/AcceuilStudent.jsx'
import Signup from './pages/signup.jsx'
import Employer from './pages/employer/Employer.jsx'
import Admin from './pages/Admin/Admin.jsx'
import Gerant from './pages/gerant/GerantIframe.jsx'
import { recupererToken } from './services/user.js';
import MentionsLegales from './pages/Legal_pages/MentionsLegales.jsx'
import PolitiqueUtilisation from './pages/Legal_pages/PolitiqueUtilisation.jsx'
import PolitiqueCookies from './pages/Legal_pages/PolitiquesCookies.jsx'

function App() {

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
            {recupererToken() != null && (
                <Route path="/create-restaurant" element={<Login />} />
            )}
            {recupererToken() == null && (
                <Route path='/create-restaurant' element={<AcceuilStudent />} />
            )}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}

export default App
