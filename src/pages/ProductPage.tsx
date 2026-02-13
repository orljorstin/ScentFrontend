import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, Star, ShoppingBag, Droplets, Wind, Sun, Moon, Briefcase, Clock } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api';
import AuthRequiredModal from '../components/AuthRequiredModal';
import { useToast } from '../contexts/ToastContext';

// Types for Fragella enrichment data
interface FragellaNote {
    name: string;
    imageUrl?: string;
}

interface FragellaData {
    Name: string;
    Brand: string;
    Year?: string;
    rating?: string;
    Gender?: string;
    Longevity?: string;
    Sillage?: string;
    Popularity?: string;
    'Price Value'?: string;
    OilType?: string;
    'Image URL'?: string;
    'General Notes'?: string[];
    'Main Accords'?: string[];
    'Main Accords Percentage'?: Record<string, string>;
    Notes?: {
        Top?: FragellaNote[];
        Middle?: FragellaNote[];
        Base?: FragellaNote[];
    };
    'Season Ranking'?: { name: string; score: number }[];
    'Occasion Ranking'?: { name: string; score: number }[];
}

// Accord strength → color mapping
const accordColors: Record<string, string> = {
    Dominant: 'bg-rose-600 text-white',
    Prominent: 'bg-rose-400 text-white',
    Moderate: 'bg-amber-100 text-amber-800 border border-amber-200',
    Subtle: 'bg-gray-100 text-gray-500 border border-gray-200',
    Trace: 'bg-gray-50 text-gray-400 border border-gray-100',
};

// Season icons
const seasonIcons: Record<string, React.ReactNode> = {
    spring: <Sun size={14} className="text-green-500" />,
    summer: <Sun size={14} className="text-yellow-500" />,
    fall: <Moon size={14} className="text-orange-500" />,
    winter: <Moon size={14} className="text-blue-400" />,
};

const occasionIcons: Record<string, React.ReactNode> = {
    casual: <Sun size={14} className="text-blue-400" />,
    'night out': <Moon size={14} className="text-purple-500" />,
    professional: <Briefcase size={14} className="text-gray-600" />,
};

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

    // Fragella enrichment state
    const [fragella, setFragella] = useState<FragellaData | null>(null);
    const [fragellaLoading, setFragellaLoading] = useState(false);

    useEffect(() => {
        // Fetch product details from Supabase
        api.get(`/api/products/${id}`)
            .then(data => {
                if (data) {
                    const p = Array.isArray(data) ? data[0] : data;

                    const has50 = p.price_50ml && Number(p.price_50ml) > 0;
                    const has100 = p.price_100ml && Number(p.price_100ml) > 0;
                    let sizes: number[] = [];
                    if (has50) sizes.push(50);
                    if (has100) sizes.push(100);
                    if (sizes.length === 0) sizes.push(p.size_ml || 50);

                    const normalized = {
                        ...p,
                        sizes: sizes,
                        notes: p.notes || {
                            top: p.notes_top || 'Various',
                            middle: p.notes_middle || 'Various',
                            base: p.notes_base || 'Various'
                        },
                        price_50ml: Number(p.price_50ml || p.price || 0),
                        price_100ml: Number(p.price_100ml || 0)
                    };
                    setProduct(normalized);
                    setSelectedSize(sizes[0] || 50);

                    // Fetch Fragella enrichment data
                    setFragellaLoading(true);
                    const searchName = `${p.brand || ''} ${p.name}`.trim();
                    api.get(`/api/fragella/search?name=${encodeURIComponent(searchName)}&limit=1`)
                        .then(fragellaData => {
                            if (fragellaData && Array.isArray(fragellaData) && fragellaData.length > 0) {
                                setFragella(fragellaData[0]);
                            }
                        })
                        .catch(err => console.warn('Fragella enrichment unavailable:', err.message))
                        .finally(() => setFragellaLoading(false));
                }
            })
            .catch(err => console.error("Failed to load product", err))
            .finally(() => setLoading(false));
    }, [id]);

    const { addToast } = useToast(); // Added hook

    const handleAddToCart = () => {
        if (!isAuthenticated) {
            setAuthAction('addToCart');
            setShowAuthModal(true);
            return;
        }
        if (product) {
            addToCart(product, selectedSize);
            addToast(`Added ${product.name} to cart`, 'success');
        }
    };

    const handleFavorite = () => {
        if (!isAuthenticated) {
            setAuthAction('toggleFavorite');
            setShowAuthModal(true);
            return;
        }
        if (product) {
            toggleFavorite(product);
            const isFav = isFavorite(product.id);
            addToast(isFav ? "Removed from favorites" : "Saved to favorites", 'info');
        }
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

    const currentPrice = selectedSize === 100
        ? (product.price_100ml || product.price_50ml * 2)
        : product.price_50ml;

    // Use Fragella image (transparent .webp) as fallback
    const productImage = product.image || product.image_url ||
        (fragella?.['Image URL'] ? fragella['Image URL'].replace('.jpg', '.webp') : '');

    // Build notes display: prefer Fragella detailed notes, fall back to Supabase strings
    const hasFragellaNotes = fragella?.Notes && (
        (fragella.Notes.Top && fragella.Notes.Top.length > 0) ||
        (fragella.Notes.Middle && fragella.Notes.Middle.length > 0) ||
        (fragella.Notes.Base && fragella.Notes.Base.length > 0)
    );

    return (
        <div className="flex flex-col h-full bg-[#FDFBF4] min-h-screen">
            <div className="p-4 flex justify-between items-center sticky top-0 z-20">
                <button onClick={() => navigate(-1)} className="bg-white/50 p-2 rounded-full backdrop-blur-sm shadow-sm"><ArrowLeft className="text-[#961E20]" size={20} /></button>
                <div className="flex gap-3">
                    <button onClick={handleFavorite} className="bg-white/50 p-2 rounded-full backdrop-blur-sm shadow-sm">
                        <Heart size={20} className={isFavorite(product.id) ? "fill-[#961E20] text-[#961E20]" : "text-[#961E20]"} />
                    </button>
                    <button onClick={async () => {
                        const shareData = {
                            title: product.name,
                            text: `Check out ${product.name} on Scentsmiths!`,
                            url: window.location.href,
                        };
                        try {
                            if (navigator.share) {
                                await navigator.share(shareData);
                            } else {
                                await navigator.clipboard.writeText(window.location.href);
                                addToast('Link copied to clipboard!', 'success');
                            }
                        } catch (err) {
                            console.warn('Share failed:', err);
                        }
                    }} className="bg-white/50 p-2 rounded-full backdrop-blur-sm shadow-sm hover:scale-105 active:scale-95 transition-all">
                        <Share2 className="text-[#961E20]" size={20} />
                    </button>
                </div>
            </div>

            <div className="mx-4 -mt-10 pt-12 rounded-[2.5rem] bg-gradient-to-b from-rose-200 via-rose-300 to-rose-400 h-96 flex items-center justify-center relative shadow-inner">
                {fragella?.OilType && (
                    <div className="absolute top-6 left-6 bg-white/30 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs border border-white/20 shadow-lg">
                        {fragella.OilType}
                    </div>
                )}
                <div className="absolute top-16 right-6 bg-white/30 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs border border-white/20 shadow-lg animate-bounce-slow">
                    ✨ AI Scent Profile
                </div>
                <img src={productImage} alt={product.name} className="w-64 h-64 object-contain drop-shadow-2xl z-10" />
            </div>

            <div className="p-6 -mt-8 bg-[#FDFBF4] rounded-t-[2.5rem] relative z-10 flex-1">
                <div className="flex justify-between items-start mb-2">
                    <h1 className="text-2xl font-bold text-[#1A1A1A] w-3/4">{product.name}</h1>
                    <div className="text-right">
                        <p className="text-xl font-bold text-[#961E20]">
                            ${currentPrice.toFixed(2)}
                        </p>
                    </div>
                </div>

                {/* Brand & Year */}
                <p className="text-sm text-gray-400 mb-1">
                    {product.brand}{fragella?.Year ? ` • Est. ${fragella.Year}` : ''}{fragella?.Gender ? ` • ${fragella.Gender}` : ''}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-6">
                    <Star className="fill-yellow-400 text-yellow-400 w-4 h-4" />
                    <span className="text-sm font-bold text-[#1A1A1A]">
                        {fragella?.rating || product.rating?.toFixed(1) || '4.5'}
                    </span>
                    <span className="text-sm text-gray-400">
                        ({product.reviews || 0} reviews)
                        {fragella?.Popularity && <span className="ml-1">• {fragella.Popularity} popularity</span>}
                    </span>
                </div>

                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                    {product.description}
                </p>

                {/* ═══════════ FRAGELLA ENRICHMENT ═══════════ */}

                {/* Performance Badges (Longevity & Sillage) */}
                {fragella && (fragella.Longevity || fragella.Sillage) && (
                    <div className="flex gap-3 mb-6">
                        {fragella.Longevity && (
                            <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl shadow-sm border border-rose-100 flex-1">
                                <Clock size={16} className="text-[#961E20]" />
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Longevity</p>
                                    <p className="text-sm font-bold text-[#1A1A1A]">{fragella.Longevity}</p>
                                </div>
                            </div>
                        )}
                        {fragella.Sillage && (
                            <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl shadow-sm border border-rose-100 flex-1">
                                <Wind size={16} className="text-[#961E20]" />
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Sillage</p>
                                    <p className="text-sm font-bold text-[#1A1A1A]">{fragella.Sillage}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Olfactory Notes — Fragella detailed or Supabase fallback */}
                <div className="mb-8 bg-white p-5 rounded-2xl shadow-sm border border-rose-100 relative overflow-hidden">
                    <h3 className="text-[#961E20] font-bold text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-[#961E20] rounded-full"></div>
                        Olfactory Notes
                    </h3>
                    {hasFragellaNotes ? (
                        <div className="space-y-4">
                            {fragella!.Notes!.Top && fragella!.Notes!.Top.length > 0 && (
                                <div>
                                    <span className="text-xs font-bold text-orange-700 uppercase tracking-wider mb-2 block">Top Notes</span>
                                    <div className="flex flex-wrap gap-2">
                                        {fragella!.Notes!.Top.map((note, i) => (
                                            <div key={i} className="flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
                                                {note.imageUrl && note.imageUrl !== '...' && (
                                                    <img src={note.imageUrl} alt={note.name} className="w-4 h-4 rounded-full object-cover" />
                                                )}
                                                <span className="text-xs text-orange-800">{note.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {fragella!.Notes!.Middle && fragella!.Notes!.Middle.length > 0 && (
                                <div>
                                    <span className="text-xs font-bold text-pink-700 uppercase tracking-wider mb-2 block">Heart Notes</span>
                                    <div className="flex flex-wrap gap-2">
                                        {fragella!.Notes!.Middle.map((note, i) => (
                                            <div key={i} className="flex items-center gap-1.5 bg-pink-50 px-3 py-1.5 rounded-full border border-pink-100">
                                                {note.imageUrl && note.imageUrl !== '...' && (
                                                    <img src={note.imageUrl} alt={note.name} className="w-4 h-4 rounded-full object-cover" />
                                                )}
                                                <span className="text-xs text-pink-800">{note.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {fragella!.Notes!.Base && fragella!.Notes!.Base.length > 0 && (
                                <div>
                                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2 block">Base Notes</span>
                                    <div className="flex flex-wrap gap-2">
                                        {fragella!.Notes!.Base.map((note, i) => (
                                            <div key={i} className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
                                                {note.imageUrl && note.imageUrl !== '...' && (
                                                    <img src={note.imageUrl} alt={note.name} className="w-4 h-4 rounded-full object-cover" />
                                                )}
                                                <span className="text-xs text-amber-900">{note.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
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
                    )}
                </div>

                {/* Main Accords */}
                {fragella?.['Main Accords'] && fragella['Main Accords'].length > 0 && (
                    <div className="mb-8 bg-white p-5 rounded-2xl shadow-sm border border-rose-100">
                        <h3 className="text-[#961E20] font-bold text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Droplets size={12} className="text-[#961E20]" />
                            Main Accords
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {fragella['Main Accords'].map((accord, i) => {
                                const strength = fragella['Main Accords Percentage']?.[accord] || 'Moderate';
                                const colorClass = accordColors[strength] || accordColors.Moderate;
                                return (
                                    <div key={i} className={`px-3 py-1.5 rounded-full text-xs font-medium ${colorClass}`}>
                                        {accord}
                                        <span className="ml-1 opacity-70 text-[10px]">({strength})</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Season & Occasion Rankings */}
                {(fragella?.['Season Ranking'] || fragella?.['Occasion Ranking']) && (
                    <div className="mb-8 grid grid-cols-2 gap-3">
                        {/* Seasons */}
                        {fragella['Season Ranking'] && fragella['Season Ranking'].length > 0 && (
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-rose-100">
                                <h4 className="text-[#961E20] font-bold text-[10px] uppercase tracking-wider mb-3">Best Seasons</h4>
                                <div className="space-y-2">
                                    {fragella['Season Ranking']
                                        .sort((a, b) => b.score - a.score)
                                        .map((season, i) => {
                                            const maxScore = 3.5;
                                            const pct = Math.min((season.score / maxScore) * 100, 100);
                                            return (
                                                <div key={i} className="flex items-center gap-2">
                                                    {seasonIcons[season.name] || <Sun size={14} />}
                                                    <span className="text-xs text-gray-600 capitalize w-14">{season.name}</span>
                                                    <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                                                        <div className="bg-[#961E20] h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                        )}

                        {/* Occasions */}
                        {fragella['Occasion Ranking'] && fragella['Occasion Ranking'].length > 0 && (
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-rose-100">
                                <h4 className="text-[#961E20] font-bold text-[10px] uppercase tracking-wider mb-3">Best For</h4>
                                <div className="space-y-2">
                                    {fragella['Occasion Ranking']
                                        .sort((a, b) => b.score - a.score)
                                        .map((occ, i) => {
                                            const maxScore = 3.5;
                                            const pct = Math.min((occ.score / maxScore) * 100, 100);
                                            return (
                                                <div key={i} className="flex items-center gap-2">
                                                    {occasionIcons[occ.name] || <Star size={14} />}
                                                    <span className="text-xs text-gray-600 capitalize w-14">{occ.name}</span>
                                                    <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                                                        <div className="bg-[#961E20] h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Fragella loading indicator */}
                {fragellaLoading && (
                    <div className="mb-6 text-center">
                        <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-rose-100 text-xs text-gray-400">
                            <div className="w-3 h-3 border-2 border-[#961E20] border-t-transparent rounded-full animate-spin" />
                            Loading scent profile...
                        </div>
                    </div>
                )}

                {/* Size Selector */}
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
                    Add to Cart - ${currentPrice.toFixed(2)}
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
