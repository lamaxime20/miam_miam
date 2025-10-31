import React from 'react';
import { Navigate } from 'react-router-dom';
import { recupererToken } from '../services/user.js';

const PrivateRoute = ({ children }) => {
    const token = recupererToken();
    return token ? children : <Navigate to="/" replace />;
};

export default PrivateRoute;