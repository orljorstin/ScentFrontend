import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { api } from './api';

// Pages
import OnboardingPage from './pages/OnboardingPage';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import FavoritesPage from './pages/FavoritesPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import SettingsPage from './pages/SettingsPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import CheckoutPage from './pages/CheckoutPage';
import NotificationsPage from './pages/NotificationsPage';
import AddressPage from './pages/AddressPage';
import PaymentMethodsPage from './pages/PaymentMethodsPage';
import ScentsmithsAdmin from './ScentsmithsAdmin';

export default function App() {
    const [perfumes, setPerfumes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Fetch products
        api.get('/api/products')
            .then(data => {
                if (data && data.length) {
                    // Normalize DB data to match UI expectations
                    const normalized = data.map((p: any) => {
                        // Determine sizes based on price columns availability
                        const has50 = p.price_50ml && Number(p.price_50ml) > 0;
                        const has100 = p.price_100ml && Number(p.price_100ml) > 0;
                        let sizes: number[] = [];
                        if (has50) sizes.push(50);
                        if (has100) sizes.push(100);
                        if (sizes.length === 0) sizes.push(p.size_ml || 50);

                        return {
                            ...p,
                            sizes: sizes,
                            notes: p.notes || {
                                top: p.notes_top || 'Various',
                                middle: p.notes_middle || 'Various',
                                base: p.notes_base || 'Various'
                            },
                            // Default display price (prefer 50ml, then generic price)
                            price: has50 ? Number(p.price_50ml) : Number(p.price || 0),
                            // Ensure backend columns are accessible as camelCase if needed, but we used p.price_50ml
                        };
                    });
                    setPerfumes(normalized);
                } else {
                    setPerfumes([]); // No mock data, clean slate
                }
            })
            .catch(() => setPerfumes([]))
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
                            <Route path="/" element={<OnboardingPage />} />
                            <Route path="/shop" element={<HomePage perfumes={perfumes} isLoading={isLoading} />} />

                            <Route path="/product/:id" element={<ProductPage />} />
                            <Route path="/cart" element={<CartPage />} />
                            <Route path="/checkout" element={<CheckoutPage />} />
                            <Route path="/favorites" element={<FavoritesPage />} />

                            <Route path="/profile" element={<ProfilePage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/signup" element={<SignupPage />} />

                            <Route path="/settings" element={<SettingsPage />} />
                            <Route path="/orders" element={<OrdersPage />} />
                            <Route path="/orders/:id" element={<OrderDetailsPage />} />
                            <Route path="/notifications" element={<NotificationsPage />} />
                            <Route path="/shipping-addresses" element={<AddressPage />} />
                            <Route path="/payment-methods" element={<PaymentMethodsPage />} />

                            {/* Catch all */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </FavoritesProvider>
                </CartProvider>
            </AuthProvider>
        </Router>
    );
}
