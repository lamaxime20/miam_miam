import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/login.css';
import { loginUser, recupererToken } from '../services/user';
import { avoirRoleUser } from '../services/login';

const LoginFormChoixRole = ({ onBack }) => {
    const navigate = useNavigate();
    const [sections, setSections] = useState({
        administrateur: [],
        gerant: [],
        livreur: [],
        employe: [],
        client: [],
    });
    const [loading, setLoading] = useState(true);
    const [credentials, setCredentials] = useState(null);

    const rolesOrder = useMemo(() => [
        { key: 'administrateur', label: 'Administrateur' },
        { key: 'gerant', label: 'Gérant' },
        { key: 'livreur', label: 'Livreur' },
        { key: 'employe', label: 'Employé' },
        { key: 'client', label: 'Client' },
    ], []);

    function mapRestaurant(r) {
        const id = r?.restaurant_id ?? r?.id ?? r?.restaurantId ?? r?.id_restaurant ?? r?.ID ?? r?.Id ?? null;
        const name = r?.restaurant_nom ?? r?.nom ?? r?.name ?? r?.libelle ?? r?.titre ?? r?.Title ?? '';
        const logoUrl = r?.restaurant_logo ?? r?.logo ?? r?.logo_url ?? r?.logoRestaurant ?? r?.image ?? r?.photo ?? r?.picture ?? null;
        return { id, name, logoUrl };
    }

    function normalizeRoleData(data) {
        const base = { administrateur: [], gerant: [], livreur: [], employe: [], client: [] };
        if (!data) return base;

        const toKey = (s) => {
            if (!s) return '';
            const k = s.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            if (k.startsWith('admin')) return 'administrateur';
            if (k.startsWith('ger')) return 'gerant';
            if (k.startsWith('livr')) return 'livreur';
            if (k.startsWith('empl')) return 'employe';
            if (k.startsWith('cli')) return 'client';
            return k;
        };

        if (Array.isArray(data)) {
            data.forEach(item => {
                const roleKey = toKey(item?.role_utilisateur);
                if (base.hasOwnProperty(roleKey)) {
                    const mapped = mapRestaurant(item);
                    if (mapped.id) base[roleKey] = [...base[roleKey], mapped];
                }
            });
            return base;
        }

        if (typeof data === 'object') {
            Object.keys(data).forEach(key => {
                const roleKey = toKey(key);
                const list = Array.isArray(data[key]) ? data[key] : (Array.isArray(data[key]?.restaurants) ? data[key].restaurants : []);
                if (base.hasOwnProperty(roleKey)) base[roleKey] = list.map(mapRestaurant).filter(x => x.id);
            });
            return base;
        }
        return base;
    }

    useEffect(() => {
        const stored = localStorage.getItem('loginCredentials');
        const creds = stored ? JSON.parse(stored) : null;
        if (!creds || !creds.email || !creds.password) {
            onBack();
            return;
        }
        setCredentials(creds);
        let active = true;
        (async () => {
            try {
                const data = await avoirRoleUser(creds.email);
                if (!active) return;
                const normalized = normalizeRoleData(data);
                console.log(normalized);
                setSections(normalized);
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => { active = false; };
    }, [onBack]);

    const handleSelect = async (roleKey, restaurantId) => {
        if (!credentials) return;
        const { email, password } = credentials;
        const res = await loginUser({ email, password, role: roleKey, restaurant: String(restaurantId) });
        console.log(recupererToken());
        if (res.success) {
            switch (roleKey) {
                case 'administrateur':
                    navigate('/admin');
                    break;
                case 'gerant':
                case 'employe':
                    navigate('/employer');
                    break;
                case 'livreur':
                    navigate('/livreur-dashboard');
                    break;
                case 'client':
                    navigate('/');
                    break;
                default:
                    navigate('/');
                    break;
            }
            localStorage.removeItem('loginCredentials');
        } else {
            onBack();
        }
    };

    if (loading) {
        return (
            <div className="login-container">
                <button className="back-button" onClick={onBack}>&#8592; Retour</button>
                <h2 className="text-center mb-4">Chargement...</h2>
            </div>
        );
    }

    return (
        <div className="login-container">
            <button className="back-button" onClick={onBack}>&#8592; Retour</button>
            {rolesOrder.map(role => (
                sections[role.key] && sections[role.key].length > 0 ? (
                    <div key={role.key} className="role-section">
                        <div className="role-title">--------- {role.label} --------------</div>
                        <div className="restaurants-list">
                            {sections[role.key].map(r => (
                                <button key={`${role.key}-${r.id}`} className="restaurant-item" onClick={() => handleSelect(role.key, r.id)}>
                                    {r.logoUrl ? (
                                        <img src={r.logoUrl} alt={r.name} className="restaurant-logo" />
                                    ) : null}
                                    <span className="restaurant-name">{r.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : null
            ))}

            <div className="role-section">
                <div className="link-group" style={{ textAlign: 'center', marginTop: '20px' }}>
                    <span 
                        className="create-restaurant-link" 
                        onClick={() => handleSelect('client', '1')}
                    >
                        Continuer en tant que client
                    </span>
                </div>
            </div>
        </div>
    );
};

export default LoginFormChoixRole;
