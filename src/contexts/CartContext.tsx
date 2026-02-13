import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../api';

export interface CartItem {
    id: number; // perfume id
    cartItemId?: number; // database cart_items.id (if logged in)
    name: string;
    brand: string;
    price: number;
    image: string;
    image_url?: string;
    size: number;
    qty: number;
}

interface CartContextType {
    cart: CartItem[];
    cartTotal: number;
    cartCount: number;
    addToCart: (product: any, size: number) => void;
    removeFromCart: (id: number, size: number) => void;
    updateQty: (id: number, size: number, delta: number) => void;
    clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

const CART_STORAGE_KEY = 'scentsmiths_cart';

export function CartProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated, user } = useAuth();
    const [cart, setCart] = useState<CartItem[]>(() => {
        try {
            const saved = localStorage.getItem(CART_STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });

    // Save to localStorage whenever cart changes (for guests)
    useEffect(() => {
        if (!isAuthenticated) {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        }
    }, [cart, isAuthenticated]);

    // When user logs in, merge localStorage cart and sync
    useEffect(() => {
        if (isAuthenticated && user) {
            // Load server cart
            api.get('/api/user/cart').then((serverCart: any[]) => {
                const serverItems: CartItem[] = serverCart.map(item => ({
                    id: item.perfume_id,
                    cartItemId: item.id,
                    name: item.perfumes?.name || '',
                    brand: item.perfumes?.brand || '',
                    price: item.size_ml === 100
                        ? (item.perfumes?.price_100ml || item.perfumes?.price || 0)
                        : (item.perfumes?.price_50ml || item.perfumes?.price || 0),
                    image: item.perfumes?.image_url || '',
                    size: item.size_ml,
                    qty: item.qty,
                }));

                // Merge any guest cart items
                const guestCart = cart.filter(g => !g.cartItemId);
                if (guestCart.length > 0) {
                    guestCart.forEach(item => {
                        api.post('/api/user/cart', {
                            perfume_id: item.id,
                            size_ml: item.size,
                            qty: item.qty,
                        }).catch(() => { });
                    });
                    localStorage.removeItem(CART_STORAGE_KEY);
                }

                setCart(serverItems.length > 0 ? serverItems : guestCart);
            }).catch(() => { /* keep local cart */ });
        }
    }, [isAuthenticated, user?.id]);

    // Clear cart on logout
    const prevAuth = React.useRef(isAuthenticated);
    useEffect(() => {
        if (prevAuth.current && !isAuthenticated) {
            setCart([]);
            localStorage.removeItem(CART_STORAGE_KEY);
        }
        prevAuth.current = isAuthenticated;
    }, [isAuthenticated]);

    const addToCart = useCallback((product: any, size: number) => {
        const price = size === 100
            ? (product.price_100ml || product.price || 0)
            : (product.price_50ml || product.price || 0);

        setCart(prev => {
            const existing = prev.find(item => item.id === product.id && item.size === size);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id && item.size === size
                        ? { ...item, qty: item.qty + 1 }
                        : item
                );
            }
            return [...prev, {
                id: product.id,
                name: product.name,
                brand: product.brand || '',
                price,
                image: product.image_url || product.image || '',
                size,
                qty: 1,
            }];
        });

        if (isAuthenticated) {
            api.post('/api/user/cart', { perfume_id: product.id, size_ml: size }).catch(() => { });
        }
    }, [isAuthenticated]);

    const removeFromCart = useCallback((id: number, size: number) => {
        setCart(prev => {
            const item = prev.find(i => i.id === id && i.size === size);
            if (item?.cartItemId && isAuthenticated) {
                api.delete(`/api/user/cart/${item.cartItemId}`).catch(() => { });
            }
            return prev.filter(i => !(i.id === id && i.size === size));
        });
    }, [isAuthenticated]);

    const updateQty = useCallback((id: number, size: number, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id && item.size === size) {
                const newQty = Math.max(1, item.qty + delta);
                if (item.cartItemId && isAuthenticated) {
                    api.post('/api/user/cart', { perfume_id: id, size_ml: size, qty: newQty }).catch(() => { });
                }
                return { ...item, qty: newQty };
            }
            return item;
        }));
    }, [isAuthenticated]);

    const clearCart = useCallback(() => {
        setCart([]);
        if (isAuthenticated) {
            api.delete('/api/user/cart').catch(() => { });
        }
        localStorage.removeItem(CART_STORAGE_KEY);
    }, [isAuthenticated]);

    const cartTotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
    const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

    return (
        <CartContext.Provider value={{ cart, cartTotal, cartCount, addToCart, removeFromCart, updateQty, clearCart }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
}
