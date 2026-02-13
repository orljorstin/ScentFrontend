import React, { useState } from 'react';
import { Heart, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useAuth } from '../contexts/AuthContext';
import AuthRequiredModal from './AuthRequiredModal';

interface ProductCardProps {
    product: any;
}

export default function ProductCard({ product }: ProductCardProps) {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { isFavorite, toggleFavorite } = useFavorites();
    const { isAuthenticated } = useAuth();

    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authAction, setAuthAction] = useState<'addToCart' | 'toggleFavorite'>('addToCart');

    const handleClick = () => {
        navigate(`/product/${product.id}`);
        window.scrollTo(0, 0);
    };

    const handleFavorite = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isAuthenticated) {
            setAuthAction('toggleFavorite');
            setShowAuthModal(true);
            return;
        }
        toggleFavorite(product);
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isAuthenticated) {
            setAuthAction('addToCart');
            setShowAuthModal(true);
            return;
        }
        addToCart(product, 50); // Default to 50ml or first available size logic? 
        // App uses 50ml default.
    };

    const handleLoginRedirect = () => {
        // Navigate to login with state to preserve action
        // In multi-page app, /login is a route.
        // We can pass state to useLocation() in LoginPage.
        navigate('/login', {
            state: {
                from: window.location.pathname,
                pendingAction: {
                    type: authAction,
                    product: product,
                    size: 50
                }
            }
        });
    };

    return (
        <>
            <div
                onClick={handleClick}
                className="bg-white rounded-2xl p-3 shadow-sm flex flex-col items-center cursor-pointer hover:shadow-lg transition-all group relative border border-transparent hover:border-red-50"
            >
                <button
                    onClick={handleFavorite}
                    className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/80 hover:bg-white shadow-sm transition-all"
                >
                    <Heart
                        size={16}
                        className={isFavorite(product.id) ? "fill-[#961E20] text-[#961E20]" : "text-gray-400"}
                    />
                </button>

                <div className="w-full text-left mb-2">
                    <h3 className="font-medium text-sm text-[#1A1A1A] line-clamp-2 h-10 leading-tight">{product.name}</h3>
                    <p className="text-xs text-gray-400">{product.brand} • 50ml</p>
                </div>
                <div className="relative w-full aspect-square mb-3 flex items-center justify-center bg-gray-50 rounded-xl overflow-hidden">
                    <img
                        src={product.image || product.image_url}
                        alt={product.name}
                        className="w-3/4 h-3/4 object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                </div>
                <div className="mt-auto w-full flex justify-between items-end">
                    <div className="text-sm font-semibold text-gray-600">${(product.price_50ml || product.price || 0).toFixed(2)}</div>
                    <button onClick={handleAddToCart} className="bg-[#961E20] text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus size={14} />
                    </button>
                </div>
            </div>

            <AuthRequiredModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                onGoToLogin={handleLoginRedirect}
                actionType={authAction}
            />
        </>
    );
}
