import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login.jsx'
import CreateRestaurant from './pages/createRestaurant.jsx';
import AcceuilStudent from './pages/accueil/AcceuilStudent.jsx'
import Signup from './pages/signup.jsx'
import Employer from './pages/employer/Employer.jsx'
import Admin from './pages/Admin/Admin.jsx'
import Gerant from './pages/gerant/GerantIframe.jsx'
import MentionsLegales from './pages/Legal_pages/MentionsLegales.jsx'
import PolitiqueUtilisation from './pages/Legal_pages/PolitiqueUtilisation.jsx'
import PolitiqueCookies from './pages/Legal_pages/PolitiquesCookies.jsx'
import { getAuthInfo } from './services/user.js';
import ForgotPassword from './pages/Forgotpassword.jsx';

export const roleAdmin = 'administrateur'
export const roleGerant = 'gerant'
export const roleLivreur = 'livreur'
export const roleEmploye = 'employe'
export const roleClient = 'client'

function App() {
    const token = getAuthInfo();
    console.log(token);

    const Guard = ({ allowed, children, fallback = <Navigate to="/login" replace /> }) => (
        allowed ? children : fallback
    );

    return (
        <Routes>
            <Route path="/" element={<AcceuilStudent />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/etudiants" element={<AcceuilStudent />} />
            <Route path="/mentions-legales" element={<MentionsLegales />} />
            <Route path="/politique-utilisation" element={<PolitiqueUtilisation />} />
            <Route path="/politique-cookies" element={<PolitiqueCookies />} />
            <Route path="/create-restaurant" element={<CreateRestaurant />} />
            <Route path='/forgot-password' element={<ForgotPassword />} />
            <Route path='/admin' element={
                <Guard allowed={token && token.role === roleAdmin && token.restaurant != null}>
                    <Admin />
                </Guard>
            } />

            <Route path='/gerant' element={
                <Guard allowed={token && token.role === roleGerant && token.restaurant != null}>
                    <Gerant />
                </Guard>
            } />

            <Route path='/livreur-dashboard' element={
                <Guard allowed={token && token.role === roleLivreur && token.restaurant != null}>
                    <Gerant />
                </Guard>
            } />

            <Route path='/employer' element={
                <Guard allowed={token && token.role === roleEmploye && token.restaurant != null}>
                    <Employer />
                </Guard>
            } />

            <Route path='/create-restaurant' element={
                <Guard allowed={token && token.role }>
                    <CreateRestaurant />
                </Guard>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}

export default App
