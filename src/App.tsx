import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { api } from './api';

// Pages
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import FavoritesPage from './pages/FavoritesPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import SettingsPage from './pages/SettingsPage';
import OrdersPage from './pages/OrdersPage';
import ScentsmithsAdmin from './ScentsmithsAdmin';

export default function App() {
    const [perfumes, setPerfumes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Initial Data / Mock Data Fallback
    const INITIAL_PERFUMES = [
        {
            id: 1, name: "BVLGARI Rose Goldea", brand: "Bvlgari", price: 229.00, rating: 4.5, reviews: 85,
            image: "https://images.unsplash.com/photo-1594035910387-fea4779426e9?auto=format&fit=crop&q=80&w=600",
            description: "With its exclusive olfactory notes...",
            notes: { top: "Pomegranate, Rose", middle: "Damascus Rose, Jasmine", base: "Musk, Sandalwood" },
            sizes: [50, 100], category: "Best Seller"
        },
        // ... minimal fallback to prevent total blank screen if API fails completely
    ];

    useEffect(() => {
        // Fetch products
        api.get('/api/products')
            .then(data => {
                if (data && data.length) {
                    // Normalize DB data to match UI expectations
                    const normalized = data.map((p: any) => ({
                        ...p,
                        sizes: p.sizes || (p.size_ml ? [p.size_ml] : [50]),
                        notes: p.notes || {
                            top: p.notes_top || 'Various',
                            middle: p.notes_middle || 'Various',
                            base: p.notes_base || 'Various'
                        },
                        price: Number(p.price || p.price_50ml || 0)
                    }));
                    setPerfumes(normalized);
                } else {
                    setPerfumes(INITIAL_PERFUMES);
                }
            })
            .catch(() => setPerfumes(INITIAL_PERFUMES))
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <Router>
            <AuthProvider>
                <CartProvider>
                    <FavoritesProvider>
                        <Routes>
                            {/* Admin Routes */}
                            <Route path="/admin/*" element={<ScentsmithsAdmin />} />

                            {/* Consumer App Routes */}
                            <Route path="/" element={<HomePage perfumes={perfumes} isLoading={isLoading} />} />
                            <Route path="/shop" element={<HomePage perfumes={perfumes} isLoading={isLoading} />} />
                            <Route path="/product/:id" element={<ProductPage />} />
                            <Route path="/cart" element={<CartPage />} />
                            <Route path="/favorites" element={<FavoritesPage />} />

                            <Route path="/profile" element={<ProfilePage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/signup" element={<SignupPage />} />

                            <Route path="/settings" element={<SettingsPage />} />
                            <Route path="/orders" element={<OrdersPage />} />

                            {/* Catch all */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </FavoritesProvider>
                </CartProvider>
            </AuthProvider>
        </Router>
    );
}
