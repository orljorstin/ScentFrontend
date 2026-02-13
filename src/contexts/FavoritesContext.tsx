import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../api';

interface FavoritesContextType {
    favorites: any[];
    isFavorite: (productId: number) => boolean;
    toggleFavorite: (product: any) => void;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated, user } = useAuth();
    const [favorites, setFavorites] = useState<any[]>([]);

    // Load favorites from API when user logs in
    useEffect(() => {
        if (isAuthenticated && user) {
            api.get('/api/user/favorites')
                .then(data => { if (data?.length) setFavorites(data); })
                .catch(() => { });
        } else {
            setFavorites([]);
        }
    }, [isAuthenticated, user?.id]);

    const isFavorite = useCallback((productId: number) => {
        return favorites.some(f => f.id === productId);
    }, [favorites]);

    const toggleFavorite = useCallback((product: any) => {
        if (isFavorite(product.id)) {
            setFavorites(prev => prev.filter(f => f.id !== product.id));
        } else {
            setFavorites(prev => [...prev, product]);
        }

        if (isAuthenticated) {
            api.post('/api/user/favorites', { perfume_id: product.id }).catch(() => { });
        }
    }, [isAuthenticated, isFavorite]);

    return (
        <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
}

export function useFavorites() {
    const ctx = useContext(FavoritesContext);
    if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
    return ctx;
}
