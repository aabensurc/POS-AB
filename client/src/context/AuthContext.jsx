import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
             const token = localStorage.getItem('token');
             if (token) {
                 try {
                     // Verify token and get fresh user data (photo, role, etc)
                     const { data } = await api.get('/auth/me');
                     setUser(data);
                     localStorage.setItem('user', JSON.stringify(data)); // Update cache
                 } catch (error) {
                     console.error("Session expired or invalid", error);
                     localStorage.removeItem('token');
                     localStorage.removeItem('user');
                 }
             }
             setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (username, password) => {
        try {
            const { data } = await api.post('/auth/login', { username, password });
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
            if (data.token) localStorage.setItem('token', data.token);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    const refreshUser = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const { data } = await api.get('/auth/me');
                setUser(data);
                localStorage.setItem('user', JSON.stringify(data));
                return true;
            } catch (error) {
                console.error("Error refreshing user", error);
                return false;
            }
        }
        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    const value = {
        user,
        login,
        logout,
        refreshUser,
        isAuthenticated: !!user,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
