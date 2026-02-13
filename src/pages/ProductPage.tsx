import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, Star, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api';
import AuthRequiredModal from '../components/AuthRequiredModal';

export default function ProductPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { isFavorite, toggleFavorite } = useFavorites();
    const { isAuthenticated } = useAuth();

    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState<number>(50);

    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authAction, setAuthAction] = useState<'addToCart' | 'toggleFavorite'>('addToCart');

    useEffect(() => {
        // Fetch product details
        // Ensure we handle the normalization here too!
        api.get(`/api/products/${id}`)
            .then(data => {
                if (data) {
                    // Normalize single product
                    const p = Array.isArray(data) ? data[0] : data; // API might return array or object
                    const normalized = {
                        ...p,
                        sizes: p.sizes || (p.size_ml ? [p.size_ml] : [50]),
                        notes: p.notes || {
                            top: p.notes_top || 'Various',
                            middle: p.notes_middle || 'Various',
                            base: p.notes_base || 'Various'
                        },
                        price: Number(p.price || p.price_50ml || 0)
                    };
                    setProduct(normalized);
                    setSelectedSize(normalized.sizes[0] || 50);
                }
            })
            .catch(err => console.error("Failed to load product", err))
            .finally(() => setLoading(false));
    }, [id]);

    const handleAddToCart = () => {
        if (!isAuthenticated) {
            setAuthAction('addToCart');
            setShowAuthModal(true);
            return;
        }
        if (product) addToCart(product, selectedSize);
    };

    const handleFavorite = () => {
        if (!isAuthenticated) {
            setAuthAction('toggleFavorite');
            setShowAuthModal(true);
            return;
        }
        if (product) toggleFavorite(product);
    };

    const handleLoginRedirect = () => {
        navigate('/login', {
            state: {
                from: window.location.pathname,
                pendingAction: { type: authAction, product, size: selectedSize }
            }
        });
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;
    if (!product) return <div className="p-10 text-center">Product not found</div>;

    return (
        <div className="flex flex-col h-full bg-[#FDFBF4] min-h-screen">
            <div className="p-4 flex justify-between items-center sticky top-0 z-20">
                <button onClick={() => navigate(-1)} className="bg-white/50 p-2 rounded-full backdrop-blur-sm shadow-sm"><ArrowLeft className="text-[#961E20]" size={20} /></button>
                <div className="flex gap-3">
                    <button onClick={handleFavorite} className="bg-white/50 p-2 rounded-full backdrop-blur-sm shadow-sm">
                        <Heart size={20} className={isFavorite(product.id) ? "fill-[#961E20] text-[#961E20]" : "text-[#961E20]"} />
                    </button>
                    <button className="bg-white/50 p-2 rounded-full backdrop-blur-sm shadow-sm"><Share2 className="text-[#961E20]" size={20} /></button>
                </div>
            </div>

            <div className="mx-4 -mt-10 pt-12 rounded-[2.5rem] bg-gradient-to-b from-rose-200 via-rose-300 to-rose-400 h-96 flex items-center justify-center relative shadow-inner">
                <div className="absolute top-16 right-6 bg-white/30 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs border border-white/20 shadow-lg animate-bounce-slow">
                    ✨ AI Scent Profile
                </div>
                <img src={product.image || product.image_url} alt={product.name} className="w-64 h-64 object-contain drop-shadow-2xl z-10" />
            </div>

            <div className="p-6 -mt-8 bg-[#FDFBF4] rounded-t-[2.5rem] relative z-10 flex-1">
                <div className="flex justify-between items-start mb-2">
                    <h1 className="text-2xl font-bold text-[#1A1A1A] w-3/4">{product.name}</h1>
                    <div className="text-right">
                        <p className="text-xl font-bold text-[#961E20]">
                            ${(selectedSize === 100 ? (product.price_100ml || product.price * 1.6) : (product.price_50ml || product.price)).toFixed(2)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-6">
                    <Star className="fill-yellow-400 text-yellow-400 w-4 h-4" />
                    <span className="text-sm font-bold text-[#1A1A1A]">{product.rating?.toFixed(1) || '4.5'}</span>
                    <span className="text-sm text-gray-400">({product.reviews || 0} reviews)</span>
                </div>

                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                    {product.description}
                </p>

                {/* Notes */}
                <div className="mb-8 bg-white p-5 rounded-2xl shadow-sm border border-rose-100 relative overflow-hidden">
                    <h3 className="text-[#961E20] font-bold text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-[#961E20] rounded-full"></div>
                        Olfactory Notes
                    </h3>
                    <div className="grid grid-cols-3 gap-2 text-xs text-center">
                        <div className="bg-orange-50/80 p-3 rounded-xl border border-orange-100">
                            <span className="block font-bold text-orange-800 mb-1">Top</span>
                            {product.notes.top}
                        </div>
                        <div className="bg-pink-50/80 p-3 rounded-xl border border-pink-100">
                            <span className="block font-bold text-pink-800 mb-1">Heart</span>
                            {product.notes.middle}
                        </div>
                        <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-100">
                            <span className="block font-bold text-amber-900 mb-1">Base</span>
                            {product.notes.base}
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-8">
                    <span className="font-bold text-[#1A1A1A]">Select Size</span>
                    <div className="flex gap-2">
                        {product.sizes.map((size: number) => (
                            <button
                                key={size}
                                onClick={() => setSelectedSize(size)}
                                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${selectedSize === size ? 'bg-[#961E20] text-white border-[#961E20] shadow-md' : 'bg-transparent text-gray-500 border-gray-200'}`}
                            >
                                {size}ml
                            </button>
                        ))}
                    </div>
                </div>

                {/* Spacer for fixed bottom bar */}
                <div className="h-20"></div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex items-center gap-4 z-30 max-w-md lg:max-w-7xl mx-auto">
                <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-[#961E20] text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-[#7a181a] active:scale-95 transition-all flex justify-center items-center gap-2"
                >
                    <ShoppingBag size={18} className="text-white/80" />
                    Add to Cart - ${(selectedSize === 100 ? (product.price_100ml || product.price * 1.6) : (product.price_50ml || product.price)).toFixed(2)}
                </button>
            </div>

            <AuthRequiredModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                onGoToLogin={handleLoginRedirect}
                actionType={authAction}
            />
        </div>
    );
}
