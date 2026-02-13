import React, { useState, useEffect } from 'react';
import {
  ShoppingBag, Heart, User, Home, Search, Menu, ArrowLeft, Share2,
  Minus, Plus, Trash2, Check, Truck, CreditCard, MapPin, ChevronRight,
  Package, X, LogOut, Settings, Bell, Star, Filter, Eye, EyeOff, Edit3, Shield
} from 'lucide-react';
import { api, auth } from './api';
import { useAuth } from './contexts/AuthContext';
import { useCart } from './contexts/CartContext';
import { useFavorites } from './contexts/FavoritesContext';
import AuthRequiredModal from './components/AuthRequiredModal';
import ToggleSwitch from './components/ToggleSwitch';

// --- MOCK DATA ---
const INITIAL_PERFUMES = [
  {
    id: 1, name: "BVLGARI Rose Goldea", brand: "Bvlgari", price: 229.00, rating: 4.5, reviews: 85,
    image: "https://images.unsplash.com/photo-1594035910387-fea4779426e9?auto=format&fit=crop&q=80&w=600",
    description: "With its exclusive olfactory notes and its precious golden bottle, Rose Goldea embodies the essence of femininity.",
    notes: { top: "Pomegranate, Rose", middle: "Damascus Rose, Jasmine", base: "Musk, Sandalwood" },
    sizes: [50, 100], category: "Best Seller"
  },
  {
    id: 2, name: "Chopard Happy Bigaradia", brand: "Chopard", price: 249.00, rating: 4.7, reviews: 42,
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=600",
    description: "A fragrance that exudes happiness and positive energy with citrusy notes.",
    notes: { top: "Bitter Orange", middle: "Orange Blossom", base: "Cedar" },
    sizes: [50, 100], category: "Best Seller"
  },
  {
    id: 3, name: "Lancome Idôle Nectar", brand: "Lancome", price: 109.00, rating: 4.8, reviews: 120,
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600",
    description: "A clean and glowing addiction, breaking the codes of traditional perfumery.",
    notes: { top: "Pear, Bergamot", middle: "Rose, Jasmine", base: "White Musk" },
    sizes: [50, 100], category: "Just Arrived"
  },
  {
    id: 4, name: "Christian Dior Happy Hour", brand: "Dior", price: 219.00, rating: 4.6, reviews: 65,
    image: "https://images.unsplash.com/photo-1595535373192-fc0437bcce92?auto=format&fit=crop&q=80&w=600",
    description: "The promise of a sweet, carefree hour where life tastes of cranberries.",
    notes: { top: "Cranberry", middle: "Jasmine", base: "Ylang-Ylang" },
    sizes: [50], category: "Just Arrived"
  },
  {
    id: 5, name: "Chanel Chance Eau Tendre", brand: "Chanel", price: 165.00, rating: 4.9, reviews: 300,
    image: "https://images.unsplash.com/photo-1523293188086-b46e0a804132?auto=format&fit=crop&q=80&w=600",
    description: "A fruity-floral fragrance with a tender and romantic character.",
    notes: { top: "Quince, Grapefruit", middle: "Hyacinth", base: "Musk" },
    sizes: [50, 100], category: "Best Seller"
  },
  {
    id: 6, name: "YSL Libre", brand: "Yves Saint Laurent", price: 130.00, rating: 4.7, reviews: 210,
    image: "https://images.unsplash.com/photo-1620756779435-0816a36b567d?auto=format&fit=crop&q=80&w=600",
    description: "The freedom to live everything with excess. The perfume of a strong, bold woman.",
    notes: { top: "Lavender", middle: "Orange Blossom", base: "Vanilla" },
    sizes: [30, 50, 90], category: "Best Seller"
  },
  {
    id: 7, name: "Gucci Bloom", brand: "Gucci", price: 155.00, rating: 4.4, reviews: 98,
    image: "https://images.unsplash.com/photo-1615108395433-8a30d70d2b27?auto=format&fit=crop&q=80&w=600",
    description: "Designed to unfold like its name, capturing the rich scent of a thriving garden.",
    notes: { top: "Jasmine", middle: "Tuberose", base: "Rangoon Creeper" },
    sizes: [50, 100], category: "Just Arrived"
  },
  {
    id: 8, name: "Jo Malone Wood Sage", brand: "Jo Malone", price: 145.00, rating: 4.8, reviews: 150,
    image: "https://images.unsplash.com/photo-1557173820-22c60c87747e?auto=format&fit=crop&q=80&w=600",
    description: "Escape the everyday along the windswept shore.",
    notes: { top: "Ambrette Seeds", middle: "Sea Salt", base: "Sage" },
    sizes: [30, 100], category: "Best Seller"
  },
  {
    id: 9, name: "Tom Ford Black Orchid", brand: "Tom Ford", price: 295.00, rating: 4.3, reviews: 200,
    image: "https://images.unsplash.com/photo-1590156546946-ce55a12a6a5d?auto=format&fit=crop&q=80&w=600",
    description: "A luxurious and sensual fragrance of rich, dark accords.",
    notes: { top: "Truffle", middle: "Orchid", base: "Patchouli" },
    sizes: [50, 100], category: "Luxury"
  },
  {
    id: 10, name: "Le Labo Santal 33", brand: "Le Labo", price: 310.00, rating: 4.6, reviews: 180,
    image: "https://images.unsplash.com/photo-1512318536856-747d9342718e?auto=format&fit=crop&q=80&w=600",
    description: "An open fire. The soft drift of smoke. Where sensuality rises after the light has gone.",
    notes: { top: "Violet Accord", middle: "Cardamom", base: "Cedarwood" },
    sizes: [50, 100], category: "Luxury"
  }
];

const MOCK_ORDERS = [
  { id: 'SCENT-8821', date: 'Jan 24, 2026', status: 'Delivered', total: 458.00, items: [{ name: 'BVLGARI Rose Goldea', size: 50, qty: 1, price: 229.00 }, { name: 'Chopard Happy Bigaradia', size: 100, qty: 1, price: 249.00 }], address: '6720 Main Street, New York, NY 10001', paymentMethod: 'Visa **** 4242' },
  { id: 'SCENT-8765', date: 'Jan 15, 2026', status: 'Shipped', total: 165.00, items: [{ name: 'Chanel Chance Eau Tendre', size: 50, qty: 1, price: 165.00 }], address: '6720 Main Street, New York, NY 10001', paymentMethod: 'Cash on Delivery' },
  { id: 'SCENT-8600', date: 'Dec 28, 2025', status: 'Delivered', total: 310.00, items: [{ name: 'Le Labo Santal 33', size: 100, qty: 1, price: 310.00 }], address: '45 Business Park, Manila', paymentMethod: 'Visa **** 4242' },
];

const MOCK_NOTIFICATIONS = [
  { id: 1, title: 'Order Delivered', message: 'Your order #SCENT-8821 has been delivered.', time: '2h ago', read: false, type: 'order', targetOrderId: 'SCENT-8821' },
  { id: 2, title: 'New Arrival', message: 'Check out the new summer collection!', time: '1d ago', read: true, type: 'promo', targetCategory: 'Just Arrived' },
  { id: 3, title: 'Exclusive Offer', message: '20% off on all Bvlgari perfumes.', time: '3d ago', read: true, type: 'promo', targetCategory: 'Best Seller' },
];

const MOCK_ADDRESSES = [
  { id: 1, type: 'Home', name: 'Nateman', phone: '+63 9825676767', address: '6720 Main Street, New York, NY 10001', default: true },
  { id: 2, type: 'Work', name: 'Nateman Office', phone: '+63 9825676767', address: '45 Business Park, Manila', default: false },
];

const MOCK_PAYMENTS = [
  { id: 1, type: 'Visa', number: '**** **** **** 4242', holder: 'NATEMAN', expiry: '12/28' },
];

export default function ScentsmithsApp() {
  const { user, isAuthenticated, login, register, logout: doLogout } = useAuth();
  const { cart, cartTotal, cartCount, addToCart, removeFromCart, updateQty, clearCart } = useCart();
  const { favorites, isFavorite, toggleFavorite: doToggleFavorite } = useFavorites();

  const [currentView, setCurrentView] = useState('onboarding');
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Auth modal for guest-first flow
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalAction, setAuthModalAction] = useState<'addToCart' | 'toggleFavorite'>('addToCart');
  const [pendingProduct, setPendingProduct] = useState<any>(null);
  const [pendingSize, setPendingSize] = useState(50);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering & Category
  const [seeAllCategory, setSeeAllCategory] = useState('');
  const [filteredPerfumes, setFilteredPerfumes] = useState([]);
  const [activeSort, setActiveSort] = useState('popular'); // popular, price-asc, price-desc, rating

  // Sub-pages state
  const [addresses, setAddresses] = useState(MOCK_ADDRESSES);
  const [payments, setPayments] = useState(MOCK_PAYMENTS);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [mockOrders] = useState(MOCK_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Address & Payment form state
  const [editingAddress, setEditingAddress] = useState(null); // null | 'new' | address obj
  const [showCardForm, setShowCardForm] = useState(false);

  // Checkout State
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [selectedSize, setSelectedSize] = useState(50);
  const [selectedDelivery, setSelectedDelivery] = useState('standard');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // If user has seen onboarding in this session, default to shop
    if (hasSeenOnboarding && currentView === 'onboarding') {
      setCurrentView('shop');
    }
  }, [hasSeenOnboarding]);

  // --- API DATA FETCHING ---
  const [perfumes, setPerfumes] = useState(INITIAL_PERFUMES);

  useEffect(() => {
    // Try to load products from API; fall back to mock data on failure
    api.get('/api/products')
      .then(data => {
        if (data && data.length) {
          // Normalize DB data to match UI expectations
          const normalized = data.map(p => ({
            ...p,
            // Ensure sizes array exists (DB has size_ml)
            sizes: p.sizes || (p.size_ml ? [p.size_ml] : [50]),
            // Ensure notes object exists (DB has notes_top etc)
            notes: p.notes || {
              top: p.notes_top || 'Various',
              middle: p.notes_middle || 'Various',
              base: p.notes_base || 'Various'
            },
            // Ensure price exists
            price: Number(p.price || p.price_50ml || 0)
          }));
          setPerfumes(normalized);
        }
      })
      .catch(() => { /* keep mock data */ });
  }, []);

  // Auth session is now handled by AuthContext

  // --- ACTIONS ---
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setSelectedSize(product.sizes?.[0] || '50ml');
    setCurrentView('product-details');
    setIsMenuOpen(false);
  };

  // Guest-gated cart action
  const handleAddToCart = (product, size) => {
    if (!isAuthenticated) {
      setPendingProduct(product);
      setPendingSize(size);
      setAuthModalAction('addToCart');
      setShowAuthModal(true);
      return;
    }
    addToCart(product, size);
  };

  // Guest-gated favorite action
  const toggleFavorite = (e, product) => {
    if (e) e.stopPropagation();
    if (!isAuthenticated) {
      setPendingProduct(product);
      setAuthModalAction('toggleFavorite');
      setShowAuthModal(true);
      return;
    }
    doToggleFavorite(product);
  };

  const handleAuthModalLogin = () => {
    setShowAuthModal(false);
    setCurrentView('profile'); // goes to login form
  };

  // After login, execute any pending action
  useEffect(() => {
    if (isAuthenticated && pendingProduct) {
      if (authModalAction === 'addToCart') {
        addToCart(pendingProduct, pendingSize);
      } else if (authModalAction === 'toggleFavorite') {
        doToggleFavorite(pendingProduct);
      }
      setPendingProduct(null);
    }
  }, [isAuthenticated]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value.length > 0 && currentView !== 'search') setCurrentView('search');
    if (e.target.value.length === 0 && currentView === 'search') setCurrentView('shop');
  };

  const [loginError, setLoginError] = useState('');
  const [signupError, setSignupError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    const form = new FormData(e.target);
    try {
      await login(
        form.get('email') as string,
        form.get('password') as string,
      );
      setCurrentView('profile');
    } catch (err: any) {
      setLoginError(err?.message || 'Login failed. Please try again.');
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setSignupError('');
    setSignupSuccess(false);
    const form = new FormData(e.target);
    try {
      await register(
        form.get('email') as string,
        form.get('password') as string,
        form.get('name') as string,
      );
      setSignupSuccess(true);
      // Redirect to login after showing success message
      setTimeout(() => {
        setSignupSuccess(false);
        setCurrentView('profile');
      }, 1500);
    } catch (err: any) {
      setSignupError(err?.message || 'Sign up failed. Please check your connection and try again.');
    }
  };

  const applyFilter = (category, sortType) => {
    let base = perfumes.filter(p => p.category === category);
    if (sortType === 'price-asc') base.sort((a, b) => a.price - b.price);
    if (sortType === 'price-desc') base.sort((a, b) => b.price - a.price);
    if (sortType === 'rating') base.sort((a, b) => b.rating - a.rating);
    setFilteredPerfumes(base);
    setActiveSort(sortType);
  };

  // Logic to determine back button destination
  const goBack = () => {
    if (['product-details', 'see-all', 'search', 'favorites', 'cart', 'profile'].includes(currentView)) {
      setCurrentView('shop');
    } else if (['signup'].includes(currentView)) {
      setCurrentView('profile'); // Back to login view
    } else if (['shipping-addresses', 'payment-methods', 'notifications', 'settings', 'orders-list'].includes(currentView)) {
      setCurrentView('profile');
    } else if (currentView === 'order-details') {
      setCurrentView('orders-list');
    } else if (currentView === 'checkout') {
      if (checkoutStep === 1) setCurrentView('cart');
      else setCheckoutStep(checkoutStep - 1);
    } else {
      setCurrentView('shop');
    }
  };

  const deliveryFee = 5.00;
  const grandTotal = cartTotal + deliveryFee;

  // --- VIEWS ---

  const SideMenu = () => (
    <>
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={toggleMenu}></div>
          <div className="relative w-64 bg-[#FDFBF4] h-full shadow-2xl flex flex-col p-6 animate-slide-right">
            <div className="flex justify-between items-center mb-8">
              <span className="text-[#961E20] font-serif font-bold text-xl">SCENTSMITHS</span>
              <button onClick={toggleMenu}><X className="text-[#1A1A1A]" /></button>
            </div>

            <nav className="flex flex-col gap-6 text-[#1A1A1A] font-medium">
              <button onClick={() => { setCurrentView('shop'); toggleMenu(); }} className="text-left flex items-center gap-3"><Home size={20} /> Home</button>
              <button onClick={() => { setCurrentView('shop'); toggleMenu(); }} className="text-left flex items-center gap-3"><ShoppingBag size={20} /> Shop</button>
              <button onClick={() => { setCurrentView('favorites'); toggleMenu(); }} className="text-left flex items-center gap-3"><Heart size={20} /> Favorites</button>
              <button onClick={() => { setCurrentView('profile'); toggleMenu(); }} className="text-left flex items-center gap-3"><User size={20} /> Profile</button>
              <button onClick={() => { setCurrentView('settings'); toggleMenu(); }} className="text-left flex items-center gap-3"><Settings size={20} /> Settings</button>
              <div className="h-px bg-gray-200 my-2"></div>
              {user?.role === 'admin' && (
                <a href="/admin" className="text-left flex items-center gap-3 text-[#961E20] font-bold"><Shield size={20} /> Admin Panel</a>
              )}
              {user ? (
                <button onClick={() => { doLogout(); toggleMenu(); }} className="text-left flex items-center gap-3 text-red-600"><LogOut size={20} /> Log Out</button>
              ) : (
                <button onClick={() => { setCurrentView('profile'); toggleMenu(); }} className="text-left flex items-center gap-3 text-[#961E20]">Sign In</button>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );

  const OnboardingView = () => (
    <div className="flex flex-col h-full bg-[#FDFBF4] relative overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10 animate-fade-in">
        <div className="mb-4">
          <img src="/logo.png" alt="Scentsmiths" className="h-16 w-auto object-contain" />
        </div>

        <div className="relative w-72 h-72 mb-8">
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=600"
              className="w-48 h-48 object-contain rounded-full shadow-2xl z-20"
              alt="Hero Perfume"
            />
          </div>
          <div className="absolute top-0 right-0 w-20 h-20 bg-pink-100 rounded-full opacity-50 blur-xl animate-pulse"></div>
          <div className="absolute bottom-10 left-0 w-24 h-24 bg-red-100 rounded-full opacity-50 blur-xl animate-pulse delay-700"></div>
        </div>

        <h2 className="text-[#961E20] font-serif text-xl mb-8 leading-relaxed">
          Experience the Essence of<br />Luxury Perfumes
        </h2>

        <button
          onClick={() => { setHasSeenOnboarding(true); setCurrentView('shop'); }}
          className="bg-[#961E20] text-white px-10 py-4 rounded-full font-medium shadow-lg hover:bg-[#7a181a] hover:shadow-xl transition-all active:scale-95"
        >
          Get Started
        </button>
      </div>
    </div>
  );

  const ProductCard = ({ product }) => (
    <div
      onClick={() => handleProductClick(product)}
      className="bg-white rounded-2xl p-3 shadow-sm flex flex-col items-center cursor-pointer hover:shadow-lg transition-all group relative border border-transparent hover:border-red-50"
    >
      <button
        onClick={(e) => toggleFavorite(e, product)}
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
        <img src={product.image || product.image_url} alt={product.name} className="w-3/4 h-3/4 object-contain group-hover:scale-110 transition-transform duration-300" />
      </div>
      <div className="mt-auto w-full flex justify-between items-end">
        <div className="text-sm font-semibold text-gray-600">${(product.price_50ml || product.price || 0).toFixed(2)}</div>
        <button onClick={(e) => { e.stopPropagation(); handleAddToCart(product, 50); }} className="bg-[#961E20] text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
          <Plus size={14} />
        </button>
      </div>
    </div>
  );

  const ShopView = () => (
    <div className="flex flex-col h-full bg-[#FDFBF4]">
      {/* Header — mobile: hamburger/logo/search, desktop: full nav bar */}
      <div className="p-4 flex justify-between items-center sticky top-0 bg-[#FDFBF4]/95 backdrop-blur-sm z-20">
        {/* Mobile: hamburger */}
        <button onClick={toggleMenu} className="lg:hidden"><Menu className="text-[#961E20]" /></button>

        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Scentsmiths" className="h-8 w-auto object-contain" />
          <span className="hidden lg:block font-serif text-lg font-bold tracking-widest text-[#961E20]">SCENTSMITHS</span>
        </div>

        {/* Desktop: nav links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-600">
          <button onClick={() => setCurrentView('shop')} className="hover:text-[#961E20] transition-colors">Shop</button>
          <button onClick={() => { setSeeAllCategory('Best Seller'); applyFilter('Best Seller', 'popular'); setCurrentView('see-all'); }} className="hover:text-[#961E20] transition-colors">Best Sellers</button>
          <button onClick={() => { setSeeAllCategory('Just Arrived'); applyFilter('Just Arrived', 'popular'); setCurrentView('see-all'); }} className="hover:text-[#961E20] transition-colors">New Arrivals</button>
        </nav>

        {/* Right icons */}
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentView('search')}><Search className="text-[#961E20]" size={20} /></button>
          <button onClick={() => setCurrentView('favorites')} className="hidden lg:block"><Heart className="text-[#961E20]" size={20} /></button>
          <button onClick={() => setCurrentView('cart')} className="hidden lg:block relative">
            <ShoppingBag className="text-[#961E20]" size={20} />
            {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-[#961E20] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{cartCount}</span>}
          </button>
          <button onClick={() => setCurrentView('profile')} className="hidden lg:block">
            <User className="text-[#961E20]" size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 px-4 scrollbar-hide">
        {/* Best Sellers */}
        <div className="flex justify-between items-center mb-4 mt-2">
          <div>
            <h2 className="text-2xl font-bold text-[#1A1A1A]">Best Sellers</h2>
            <p className="text-gray-400 text-sm">The Best Parfums Ever</p>
          </div>
          <button
            onClick={() => {
              setSeeAllCategory('Best Seller');
              applyFilter('Best Seller', 'popular');
              setCurrentView('see-all');
            }}
            className="text-[#961E20] bg-[#961E20]/10 px-3 py-1 rounded-full text-sm font-medium hover:bg-[#961E20]/20 transition-colors"
          >
            see all &gt;
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {perfumes.filter(p => p.category === "Best Seller").slice(0, 4).map(perfume => (
            <ProductCard key={perfume.id} product={perfume} />
          ))}
        </div>

        {/* Just Arrived */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-[#1A1A1A]">Just Arrived</h2>
            <p className="text-gray-400 text-sm">Recently Arrived Parfums</p>
          </div>
          <button
            onClick={() => {
              setSeeAllCategory('Just Arrived');
              applyFilter('Just Arrived', 'popular');
              setCurrentView('see-all');
            }}
            className="text-[#961E20] bg-[#961E20]/10 px-3 py-1 rounded-full text-sm font-medium hover:bg-[#961E20]/20 transition-colors"
          >
            see all &gt;
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
          {perfumes.filter(p => p.category === "Just Arrived").slice(0, 4).map(perfume => (
            <ProductCard key={perfume.id} product={perfume} />
          ))}
        </div>
      </div>
      <BottomNav active="shop" />
    </div>
  );

  const SeeAllView = () => {
    const [showFilter, setShowFilter] = useState(false);

    return (
      <div className="flex flex-col h-full bg-[#FDFBF4]">
        <div className="p-4 flex items-center gap-4 sticky top-0 bg-[#FDFBF4] z-20">
          <button onClick={() => setCurrentView('shop')}><ArrowLeft className="text-[#1A1A1A]" /></button>
          <div>
            <h1 className="text-xl font-bold text-[#1A1A1A]">{seeAllCategory}</h1>
            <p className="text-xs text-gray-400">{filteredPerfumes.length} items available</p>
          </div>
          <button onClick={() => setShowFilter(!showFilter)} className={`ml-auto p-2 rounded-full ${showFilter ? 'bg-[#961E20] text-white' : 'bg-gray-100 text-gray-600'}`}>
            <Filter size={18} />
          </button>
        </div>

        {/* Filter Bar */}
        {showFilter && (
          <div className="px-4 py-3 bg-white border-b border-gray-100 flex gap-2 overflow-x-auto">
            <button onClick={() => applyFilter(seeAllCategory, 'popular')} className={`px-3 py-1 rounded-full text-xs border ${activeSort === 'popular' ? 'bg-[#961E20] text-white border-[#961E20]' : 'border-gray-200 text-gray-600'}`}>Popular</button>
            <button onClick={() => applyFilter(seeAllCategory, 'price-asc')} className={`px-3 py-1 rounded-full text-xs border ${activeSort === 'price-asc' ? 'bg-[#961E20] text-white border-[#961E20]' : 'border-gray-200 text-gray-600'}`}>Price: Low to High</button>
            <button onClick={() => applyFilter(seeAllCategory, 'price-desc')} className={`px-3 py-1 rounded-full text-xs border ${activeSort === 'price-desc' ? 'bg-[#961E20] text-white border-[#961E20]' : 'border-gray-200 text-gray-600'}`}>Price: High to Low</button>
            <button onClick={() => applyFilter(seeAllCategory, 'rating')} className={`px-3 py-1 rounded-full text-xs border ${activeSort === 'rating' ? 'bg-[#961E20] text-white border-[#961E20]' : 'border-gray-200 text-gray-600'}`}>Top Rated</button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 pb-24 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPerfumes.map(perfume => (
            <ProductCard key={perfume.id} product={perfume} />
          ))}
        </div>
        <BottomNav active="shop" />
      </div>
    );
  };

  const SearchView = () => (
    <div className="flex flex-col h-full bg-[#FDFBF4]">
      <div className="p-4 flex items-center gap-3 sticky top-0 bg-[#FDFBF4] z-20 shadow-sm">
        <button onClick={() => setCurrentView('shop')}><ArrowLeft className="text-[#1A1A1A]" /></button>
        <div className="flex-1 bg-gray-100 rounded-full px-4 py-2 flex items-center gap-2">
          <Search size={18} className="text-gray-400" />
          <input
            autoFocus
            type="text"
            placeholder="Search perfumes, brands..."
            className="bg-transparent outline-none flex-1 text-sm"
            value={searchQuery}
            onChange={handleSearch}
          />
          {searchQuery && <button onClick={() => setSearchQuery('')}><X size={16} className="text-gray-400" /></button>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {searchQuery ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {perfumes.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase())).map(perfume => (
              <ProductCard key={perfume.id} product={perfume} />
            ))}
          </div>
        ) : (
          <div className="text-center mt-10 text-gray-400">
            <Search size={48} className="mx-auto mb-4 opacity-20" />
            <p>Type to search your favorite scents</p>
          </div>
        )}
      </div>
      <BottomNav active="shop" />
    </div>
  );

  const FavoritesView = () => (
    <div className="flex flex-col h-full bg-[#FDFBF4]">
      <div className="p-4 flex items-center sticky top-0 bg-[#FDFBF4] z-20">
        <button onClick={goBack} className="mr-4"><ArrowLeft className="text-[#1A1A1A]" /></button>
        <h1 className="text-xl font-bold text-[#1A1A1A] flex-1">My Favorites</h1>
        <span className="text-sm text-gray-500">{favorites.length} items</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-2/3 text-gray-400">
            <Heart size={64} className="mb-4 opacity-20" />
            <p>No favorites yet.</p>
            <button onClick={() => setCurrentView('shop')} className="mt-4 text-[#961E20] font-bold text-sm">Start Browsing</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {favorites.map(perfume => (
              <ProductCard key={perfume.id} product={perfume} />
            ))}
          </div>
        )}
      </div>
      <BottomNav active="favorites" />
    </div>
  );

  const SignUpView = () => (
    <div className="flex flex-col h-full bg-[#FDFBF4]">
      <div className="p-4">
        <button onClick={() => setCurrentView('profile')}><ArrowLeft className="text-[#1A1A1A]" /></button>
      </div>
      <div className="flex-1 flex flex-col p-8 justify-center">
        <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">Create Account</h1>
        <p className="text-gray-500 mb-8">Join Scentsmiths today</p>

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Full Name</label>
            <input name="name" type="text" required className="w-full border-b border-gray-300 py-2 outline-none focus:border-[#961E20] bg-transparent" placeholder="John Doe" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Email</label>
            <input name="email" type="email" required className="w-full border-b border-gray-300 py-2 outline-none focus:border-[#961E20] bg-transparent" placeholder="name@example.com" />
          </div>
          <div className="mb-4">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Password</label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                className="w-full border-b border-gray-300 py-2 outline-none focus:border-[#961E20] bg-transparent pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button type="submit" className="w-full bg-[#961E20] text-white py-4 rounded-xl font-bold shadow-lg mt-8">
            Sign Up
          </button>
        </form>
        {signupSuccess && <p className="mt-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3 text-center font-medium">Account created! Redirecting to login...</p>}
        {signupError && <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-center">{signupError}</p>}
        <p className="text-center mt-4 text-sm text-gray-600">Already have an account? <button onClick={() => setCurrentView('profile')} className="text-[#961E20] font-bold ml-1">Sign In</button></p>
      </div>
    </div>
  );

  const ProfileView = () => {
    if (!user) {
      // LOGIN STATE
      return (
        <div className="flex flex-col h-full bg-[#FDFBF4]">
          <div className="p-4">
            <button onClick={() => setCurrentView('shop')}><ArrowLeft className="text-[#1A1A1A]" /></button>
          </div>
          <div className="flex-1 flex flex-col p-8 justify-center">
            <div className="w-16 h-16 bg-[#961E20] rounded-lg flex items-center justify-center mb-6 shadow-lg">
              <span className="font-serif text-3xl italic text-white">S</span>
            </div>
            <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">Welcome Back</h1>
            <p className="text-gray-500 mb-8">Sign in to access your orders and wishlist</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Email</label>
                <input name="email" type="email" className="w-full border-b border-gray-300 py-2 outline-none focus:border-[#961E20] bg-transparent" placeholder="name@example.com" />
              </div>
              <div className="mb-4">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className="w-full border-b border-gray-300 py-2 outline-none focus:border-[#961E20] bg-transparent pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <button type="submit" className="w-full bg-[#961E20] text-white py-4 rounded-xl font-bold shadow-lg mt-8">
                Sign In
              </button>
            </form>
            {loginError && <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-center">{loginError}</p>}
            <p className="text-center mt-6 text-sm text-gray-600">Don't have an account? <button onClick={() => setCurrentView('signup')} className="text-[#961E20] font-bold ml-1">Sign Up</button></p>
          </div>
          <BottomNav active="profile" />
        </div>
      );
    }

    // LOGGED IN STATE
    return (
      <div className="flex flex-col h-full bg-[#FDFBF4]">
        <div className="p-6 bg-[#961E20] text-white pt-10 pb-16 rounded-b-[2.5rem] shadow-xl relative z-10">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-2xl font-bold">My Profile</h1>
            <button onClick={() => setCurrentView('settings')}><Settings size={20} /></button>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-serif italic border-2 border-white/50">{user.name.charAt(0)}</div>
            <div>
              <p className="font-bold text-lg">{user.name}</p>
              <p className="text-white/70 text-sm">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 -mt-8 pt-12 pb-24">
          <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-[#1A1A1A]">My Orders</h3>
              <button onClick={() => setCurrentView('orders-list')} className="text-[#961E20] text-xs font-bold">View All</button>
            </div>
            {/* Mock Recent Order */}
            <div
              className="flex gap-4 items-center border-b border-gray-100 pb-3 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => { setSelectedOrder(mockOrders[0]); setCurrentView('order-details'); }}
            >
              <div className="bg-gray-100 p-2 rounded-lg"><Package size={20} className="text-gray-600" /></div>
              <div className="flex-1">
                <p className="text-sm font-bold text-[#1A1A1A]">Order #{mockOrders[0].id}</p>
                <p className="text-xs text-green-600 font-medium">{mockOrders[0].status} • {mockOrders[0].date}</p>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-2 shadow-sm space-y-1">
            <button onClick={() => setCurrentView('shipping-addresses')} className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <MapPin size={18} className="text-gray-500" />
                <span className="text-sm font-medium">Shipping Addresses</span>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
            <button onClick={() => setCurrentView('payment-methods')} className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <CreditCard size={18} className="text-gray-500" />
                <span className="text-sm font-medium">Payment Methods</span>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
            <button onClick={() => setCurrentView('notifications')} className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <Bell size={18} className="text-gray-500" />
                <span className="text-sm font-medium">Notifications</span>
              </div>
              <div className="flex items-center gap-2">
                {notifications.filter(n => !n.read).length > 0 && <div className="w-2 h-2 rounded-full bg-[#961E20]"></div>}
                <ChevronRight size={16} className="text-gray-400" />
              </div>
            </button>
          </div>

          {user?.role === 'admin' && (
            <a
              href="/admin"
              className="w-full flex items-center justify-center gap-2 mt-4 bg-[#961E20] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#7a181a] transition-colors"
            >
              <Shield size={16} /> Admin Dashboard
            </a>
          )}

          <button
            onClick={() => doLogout()}
            className="w-full text-center mt-4 text-gray-400 text-sm font-medium hover:text-[#961E20]"
          >
            Log Out
          </button>
        </div>
        <BottomNav active="profile" />
      </div>
    );
  };

  const SubPageHeader = ({ title }) => (
    <div className="p-4 flex items-center bg-white shadow-sm z-10 relative">
      <button onClick={goBack} className="mr-4"><ArrowLeft className="text-[#1A1A1A]" /></button>
      <h1 className="text-lg font-bold text-[#1A1A1A] flex-1">{title}</h1>
    </div>
  );

  const ShippingAddressesView = () => {
    const handleDeleteAddress = (id) => {
      if (window.confirm('Are you sure you want to delete this address?')) {
        setAddresses(addresses.filter(a => a.id !== id));
      }
    };
    const handleSaveAddress = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const addrData = {
        id: editingAddress === 'new' ? Date.now() : editingAddress.id,
        type: fd.get('type') as string,
        name: fd.get('name') as string,
        phone: fd.get('phone') as string,
        address: fd.get('address') as string,
        default: fd.get('isDefault') === 'on',
      };
      if (addrData.default) {
        setAddresses(prev => {
          const cleared = prev.map(a => ({ ...a, default: false }));
          if (editingAddress === 'new') return [...cleared, addrData];
          return cleared.map(a => a.id === addrData.id ? addrData : a);
        });
      } else {
        if (editingAddress === 'new') setAddresses(prev => [...prev, addrData]);
        else setAddresses(prev => prev.map(a => a.id === addrData.id ? addrData : a));
      }
      setEditingAddress(null);
    };
    return (
      <div className="flex flex-col h-full bg-[#FDFBF4]">
        <SubPageHeader title="Shipping Addresses" />
        <div className="flex-1 overflow-y-auto p-4 pb-24">
          {addresses.map(addr => (
            <div key={addr.id} className="bg-white p-4 rounded-xl shadow-sm mb-4 border border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <span className="bg-gray-100 text-xs px-2 py-1 rounded font-bold uppercase">{addr.type}</span>
                {addr.default && <span className="text-[#961E20] text-xs font-bold">Default</span>}
              </div>
              <p className="font-bold text-[#1A1A1A]">{addr.name}</p>
              <p className="text-gray-500 text-sm">{addr.phone}</p>
              <p className="text-gray-500 text-sm">{addr.address}</p>
              <div className="mt-3 pt-3 border-t border-gray-100 flex gap-4">
                <button onClick={() => setEditingAddress(addr)} className="text-xs font-bold text-gray-500">Edit</button>
                <button onClick={() => handleDeleteAddress(addr.id)} className="text-xs font-bold text-red-500">Delete</button>
              </div>
            </div>
          ))}
          <button onClick={() => setEditingAddress('new')} className="w-full py-3 border border-dashed border-gray-400 rounded-xl text-gray-500 text-sm font-bold hover:bg-gray-50">+ Add New Address</button>
        </div>

        {/* Address Form Modal */}
        {editingAddress && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center backdrop-blur-sm">
            <div className="bg-white rounded-t-3xl w-full max-w-md p-6 animate-slide-up">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">{editingAddress === 'new' ? 'Add New Address' : 'Edit Address'}</h3>
                <button onClick={() => setEditingAddress(null)}><X className="text-gray-400" /></button>
              </div>
              <form onSubmit={handleSaveAddress} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Type</label>
                  <select name="type" defaultValue={editingAddress === 'new' ? 'Home' : editingAddress.type} className="w-full border-b border-gray-300 py-2 outline-none focus:border-[#961E20] bg-transparent text-sm">
                    <option>Home</option><option>Work</option><option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                  <input name="name" required defaultValue={editingAddress !== 'new' ? editingAddress.name : ''} className="w-full border-b border-gray-300 py-2 outline-none focus:border-[#961E20] bg-transparent text-sm" placeholder="John Doe" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Phone</label>
                  <input name="phone" required defaultValue={editingAddress !== 'new' ? editingAddress.phone : ''} className="w-full border-b border-gray-300 py-2 outline-none focus:border-[#961E20] bg-transparent text-sm" placeholder="+63 9XX XXX XXXX" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Full Address</label>
                  <input name="address" required defaultValue={editingAddress !== 'new' ? editingAddress.address : ''} className="w-full border-b border-gray-300 py-2 outline-none focus:border-[#961E20] bg-transparent text-sm" placeholder="123 Main St, City, Country" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="isDefault" defaultChecked={editingAddress !== 'new' ? editingAddress.default : false} className="accent-[#961E20] w-4 h-4" />
                  <span className="text-sm text-gray-700">Set as default address</span>
                </label>
                <button type="submit" className="w-full bg-[#961E20] text-white py-3 rounded-xl font-bold mt-2">Save Address</button>
              </form>
            </div>
          </div>
        )}
        <BottomNav active="profile" />
      </div>
    );
  };

  const PaymentMethodsView = () => {
    const handleRemoveCard = (id) => {
      if (window.confirm('Are you sure you want to remove this card?')) {
        setPayments(payments.filter(c => c.id !== id));
      }
    };
    const handleAddCard = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const newCard = {
        id: Date.now(),
        type: fd.get('cardType') as string,
        number: `**** **** **** ${fd.get('last4')}`,
        holder: (fd.get('holder') as string).toUpperCase(),
        expiry: fd.get('expiry') as string,
      };
      setPayments(prev => [...prev, newCard]);
      setShowCardForm(false);
    };
    return (
      <div className="flex flex-col h-full bg-[#FDFBF4]">
        <SubPageHeader title="Payment Methods" />
        <div className="flex-1 overflow-y-auto p-4 pb-24">
          {payments.map(card => (
            <div key={card.id} className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-5 rounded-xl shadow-lg mb-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-20"><CreditCard size={48} /></div>
              <button onClick={() => handleRemoveCard(card.id)} className="absolute top-3 right-3 text-white/60 hover:text-red-400 text-xs font-bold z-10">Remove</button>
              <p className="text-sm opacity-70 mb-6">{card.type}</p>
              <p className="text-xl font-mono tracking-widest mb-4">{card.number}</p>
              <div className="flex justify-between text-xs opacity-70 uppercase">
                <span>{card.holder}</span>
                <span>{card.expiry}</span>
              </div>
            </div>
          ))}
          <button onClick={() => setShowCardForm(true)} className="w-full py-3 border border-dashed border-gray-400 rounded-xl text-gray-500 text-sm font-bold hover:bg-gray-50">+ Add New Card</button>
        </div>

        {/* Add Card Modal */}
        {showCardForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center backdrop-blur-sm">
            <div className="bg-white rounded-t-3xl w-full max-w-md p-6 animate-slide-up">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Add New Card</h3>
                <button onClick={() => setShowCardForm(false)}><X className="text-gray-400" /></button>
              </div>
              <form onSubmit={handleAddCard} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Card Type</label>
                  <select name="cardType" className="w-full border-b border-gray-300 py-2 outline-none focus:border-[#961E20] bg-transparent text-sm text-gray-900">
                    <option>Visa</option><option>Mastercard</option><option>Amex</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Cardholder Name</label>
                  <input name="holder" required className="w-full border-b border-gray-300 py-2 outline-none focus:border-[#961E20] bg-transparent text-sm text-gray-900" placeholder="JOHN DOE" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Last 4 Digits</label>
                  <input name="last4" required maxLength={4} pattern="\d{4}" className="w-full border-b border-gray-300 py-2 outline-none focus:border-[#961E20] bg-transparent text-sm text-gray-900" placeholder="1234" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Expiry Date</label>
                  <input name="expiry" required pattern="\d{2}/\d{2}" className="w-full border-b border-gray-300 py-2 outline-none focus:border-[#961E20] bg-transparent text-sm text-gray-900" placeholder="MM/YY" />
                </div>
                <button type="submit" className="w-full bg-[#961E20] text-white py-3 rounded-xl font-bold mt-2">Add Card</button>
              </form>
            </div>
          </div>
        )}
        <BottomNav active="profile" />
      </div>
    );
  };

  const NotificationsView = () => {
    const markAllRead = () => {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };
    const handleNotificationClick = (n) => {
      // Mark this one as read
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
      if (n.type === 'order' && n.targetOrderId) {
        const order = mockOrders.find(o => o.id === n.targetOrderId);
        if (order) {
          setSelectedOrder(order);
          setCurrentView('order-details');
        }
      } else if (n.type === 'promo' && n.targetCategory) {
        setSeeAllCategory(n.targetCategory);
        applyFilter(n.targetCategory, 'popular');
        setCurrentView('see-all');
      }
    };
    return (
      <div className="flex flex-col h-full bg-[#FDFBF4]">
        <SubPageHeader title="Notifications" />
        <div className="flex-1 overflow-y-auto p-4 pb-24">
          <div className="flex justify-end mb-2"><button onClick={markAllRead} className="text-xs text-[#961E20] font-bold">Mark all as read</button></div>
          {notifications.map(n => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className={`p-4 rounded-xl mb-3 border cursor-pointer hover:shadow-md transition-all ${n.read ? 'bg-white border-gray-100' : 'bg-red-50 border-red-100'}`}
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className={`text-sm ${n.read ? 'font-medium' : 'font-bold text-[#961E20]'}`}>{n.title}</h3>
                <span className="text-[10px] text-gray-400">{n.time}</span>
              </div>
              <p className="text-xs text-gray-600">{n.message}</p>
            </div>
          ))}
        </div>
        <BottomNav active="profile" />
      </div>
    );
  };

  const SettingsView = () => (
    <div className="flex flex-col h-full bg-[#FDFBF4]">
      <SubPageHeader title="Account Settings" />
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <h3 className="text-sm font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Personal Info</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500">Display Name</label>
              <input type="text" defaultValue={user?.name || "Nateman"} className="w-full text-sm border-b border-gray-200 py-1 outline-none focus:border-[#961E20]" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Email Address</label>
              <input type="email" defaultValue={user?.email || "nate@example.com"} className="w-full text-sm border-b border-gray-200 py-1 outline-none focus:border-[#961E20]" />
            </div>
            <div className="pt-2">
              <button className="text-xs bg-[#961E20] text-white px-3 py-1.5 rounded">Save Changes</button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <h3 className="text-sm font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Password</h3>
          <div className="space-y-3">
            <input type="password" placeholder="Current Password" className="w-full text-sm border-b border-gray-200 py-1 outline-none" />
            <input type="password" placeholder="New Password" className="w-full text-sm border-b border-gray-200 py-1 outline-none" />
            <div className="pt-2">
              <button className="text-xs bg-gray-800 text-white px-3 py-1.5 rounded">Update Password</button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Preferences</h3>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-700">Order Updates</span>
            <ToggleSwitch checked={true} onChange={() => { }} />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">Promotional Emails</span>
            <ToggleSwitch checked={false} onChange={() => { }} />
          </div>
        </div>
      </div>
      <BottomNav active="profile" />
    </div>
  );

  const ProductDetailsView = () => (
    <div className="flex flex-col h-full bg-[#FDFBF4] overflow-y-auto">
      <div className="p-4 flex justify-between items-center sticky top-0 z-20">
        <button onClick={goBack} className="bg-white/50 p-2 rounded-full backdrop-blur-sm shadow-sm"><ArrowLeft className="text-[#961E20]" size={20} /></button>
        <div className="flex gap-3">
          <button onClick={(e) => toggleFavorite(e, selectedProduct)} className="bg-white/50 p-2 rounded-full backdrop-blur-sm shadow-sm">
            <Heart size={20} className={isFavorite(selectedProduct?.id) ? "fill-[#961E20] text-[#961E20]" : "text-[#961E20]"} />
          </button>
          <button className="bg-white/50 p-2 rounded-full backdrop-blur-sm shadow-sm"><Share2 className="text-[#961E20]" size={20} /></button>
        </div>
      </div>

      <div className="mx-4 -mt-10 pt-12 rounded-[2.5rem] bg-gradient-to-b from-rose-200 via-rose-300 to-rose-400 h-96 flex items-center justify-center relative shadow-inner">
        <div className="absolute top-16 right-6 bg-white/30 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs border border-white/20 shadow-lg animate-bounce-slow">
          ✨ AI Scent Profile
        </div>
        <img src={selectedProduct.image || selectedProduct.image_url} alt={selectedProduct.name} className="w-64 h-64 object-contain drop-shadow-2xl z-10" />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-40 h-4 bg-black/20 blur-xl rounded-full"></div>
      </div>

      <div className="p-6 -mt-8 bg-[#FDFBF4] rounded-t-[2.5rem] relative z-10 min-h-[500px]">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-2xl font-bold text-[#1A1A1A] w-3/4">{selectedProduct.name}</h1>
          <div className="text-right">
            <p className="text-xl font-bold text-[#961E20]">${(selectedProduct.price_50ml || selectedProduct.price || 0).toFixed(2)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <Star className="fill-yellow-400 text-yellow-400 w-4 h-4" />
          <span className="text-sm font-bold text-[#1A1A1A]">{selectedProduct.rating.toFixed(1)}</span>
          <span className="text-sm text-gray-400">({selectedProduct.reviews} reviews)</span>
        </div>

        <p className="text-gray-600 text-sm mb-6 leading-relaxed">
          {selectedProduct.description}
        </p>

        {/* Simulated Fragella API Data */}
        <div className="mb-8 bg-white p-5 rounded-2xl shadow-sm border border-rose-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-rose-50 rounded-bl-full -mr-8 -mt-8"></div>
          <h3 className="text-[#961E20] font-bold text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-[#961E20] rounded-full"></div>
            Olfactory Notes
          </h3>
          <div className="grid grid-cols-3 gap-2 text-xs text-center">
            <div className="bg-orange-50/80 p-3 rounded-xl border border-orange-100">
              <span className="block font-bold text-orange-800 mb-1">Top</span>
              {selectedProduct.notes.top}
            </div>
            <div className="bg-pink-50/80 p-3 rounded-xl border border-pink-100">
              <span className="block font-bold text-pink-800 mb-1">Heart</span>
              {selectedProduct.notes.middle}
            </div>
            <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-100">
              <span className="block font-bold text-amber-900 mb-1">Base</span>
              {selectedProduct.notes.base}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-8">
          <span className="font-bold text-[#1A1A1A]">Select Size</span>
          <div className="flex gap-2">
            {selectedProduct.sizes.map(size => (
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
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex items-center gap-4 z-30 max-w-md lg:max-w-7xl mx-auto">
        <button
          onClick={() => handleAddToCart(selectedProduct, selectedSize)}
          className="flex-1 bg-[#961E20] text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-[#7a181a] active:scale-95 transition-all flex justify-center items-center gap-2"
        >
          <ShoppingBag size={18} className="text-white/80" />
          Add to Cart - ${(selectedSize === 100 ? (selectedProduct.price_100ml || selectedProduct.price * 1.6) : (selectedProduct.price_50ml || selectedProduct.price || 0)).toFixed(2)}
        </button>
      </div>
      {/* Spacer for sticky bottom */}
      <div className="h-24 bg-[#FDFBF4]"></div>
    </div>
  );

  const CartView = () => (
    <div className="flex flex-col h-full bg-[#FDFBF4]">
      <div className="p-4 flex items-center relative shadow-sm z-10">
        <button onClick={goBack}><ArrowLeft className="text-[#1A1A1A]" /></button>
        <h1 className="flex-1 text-center font-bold text-lg">My Cart</h1>
        <div className="w-8"></div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-32 pt-4">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-2/3 opacity-50">
            <ShoppingBag size={64} className="mb-4" />
            <p>Your cart is empty.</p>
            <button onClick={() => setCurrentView('shop')} className="mt-4 text-[#961E20] font-bold">Start Shopping</button>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {cart.map((item, idx) => (
                <div key={`${item.id}-${idx}`} className="bg-[#EBCBCB] rounded-2xl p-4 flex gap-4 relative animate-fade-in-up">
                  <div
                    className="bg-white/60 rounded-xl p-2 w-20 h-20 flex items-center justify-center flex-shrink-0 cursor-pointer"
                    onClick={() => handleProductClick(item)}
                  >
                    <img src={item.image} className="w-16 h-16 object-contain" alt={item.name} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3
                        className="font-medium text-[#1A1A1A] text-sm pr-6 leading-tight cursor-pointer hover:underline"
                        onClick={() => handleProductClick(item)}
                      >
                        {item.name}
                      </h3>
                      <button onClick={() => removeFromCart(item.id, item.size)}><Trash2 size={16} className="text-gray-500 hover:text-red-600" /></button>
                    </div>
                    <p className="text-gray-600 text-xs mt-1">{item.size}ml</p>
                    <div className="flex justify-between items-end mt-3">
                      <span className="text-[#1A1A1A] font-bold text-lg">${(item.price * item.qty).toFixed(2)}</span>
                      <div className="flex items-center gap-3 bg-white/40 rounded-full px-2 py-1">
                        <button onClick={() => updateQty(item.id, item.size, -1)} className="w-6 h-6 flex items-center justify-center"><Minus className="w-3 h-3 text-[#1A1A1A]" /></button>
                        <span className="text-sm font-medium w-4 text-center">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, item.size, 1)} className="w-6 h-6 flex items-center justify-center"><Plus className="w-3 h-3 text-[#1A1A1A]" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white border border-gray-100 p-5 rounded-2xl mb-24 shadow-sm">
              <div className="flex justify-between text-sm mb-3 text-[#1A1A1A]">
                <span>Subtotal</span>
                <span className="font-bold">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mb-3 text-gray-500">
                <span>Delivery</span>
                <span>${deliveryFee.toFixed(2)}</span>
              </div>
              <div className="h-px bg-gray-100 my-3"></div>
              <div className="flex justify-between text-base font-bold text-[#1A1A1A]">
                <span>Total</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom Nav remains visible in Cart */}
      <BottomNav active="cart" />

      {cart.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 p-4 pb-8 pointer-events-none z-30 max-w-md lg:max-w-7xl mx-auto">
          {/* Positioned above BottomNav */}
          <button
            onClick={() => { setCheckoutStep(1); setCurrentView('checkout'); }}
            className="pointer-events-auto w-full bg-[#961E20] text-white py-4 rounded-full font-bold shadow-lg hover:bg-[#7a181a] flex justify-between px-8"
          >
            <span>Checkout</span>
            <span>${grandTotal.toFixed(2)}</span>
          </button>
        </div>
      )}
    </div>
  );

  const CheckoutView = () => (
    <div className="flex flex-col h-full bg-[#FDFBF4]">
      <div className="p-4 flex items-center shadow-sm z-10">
        <button onClick={goBack}>
          <ArrowLeft className="text-[#1A1A1A]" />
        </button>
        <h1 className="flex-1 text-center font-bold text-lg">Checkout</h1>
        <div className="w-6"></div>
      </div>

      <div className="flex justify-center items-center gap-2 my-6 text-sm px-8">
        <div className={`flex flex-col items-center ${checkoutStep >= 1 ? 'text-[#961E20]' : 'text-gray-300'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 text-xs font-bold ${checkoutStep >= 1 ? 'bg-[#961E20] text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
          <span className="text-[10px] font-bold uppercase tracking-wider">Address</span>
        </div>
        <div className={`h-[2px] w-12 mb-4 ${checkoutStep >= 2 ? 'bg-[#961E20]' : 'bg-gray-200'}`}></div>
        <div className={`flex flex-col items-center ${checkoutStep >= 2 ? 'text-[#961E20]' : 'text-gray-300'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 text-xs font-bold ${checkoutStep >= 2 ? 'bg-[#961E20] text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
          <span className="text-[10px] font-bold uppercase tracking-wider">Method</span>
        </div>
        <div className={`h-[2px] w-12 mb-4 ${checkoutStep >= 3 ? 'bg-[#961E20]' : 'bg-gray-200'}`}></div>
        <div className={`flex flex-col items-center ${checkoutStep >= 3 ? 'text-[#961E20]' : 'text-gray-300'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 text-xs font-bold ${checkoutStep >= 3 ? 'bg-[#961E20] text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
          <span className="text-[10px] font-bold uppercase tracking-wider">Pay</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-32">
        {checkoutStep === 1 && (() => {
          const defaultAddr = addresses.find(a => a.default) || addresses[0];
          return (
            <div className="animate-fade-in">
              <h2 className="text-lg font-bold mb-4">Delivery Address</h2>
              {defaultAddr ? (
                <div className="bg-[#EBCBCB] rounded-2xl p-5 mb-4 relative border-2 border-[#961E20] shadow-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="bg-[#961E20] text-white text-[10px] px-2 py-0.5 rounded w-fit mb-2">{defaultAddr.type}</div>
                      <h3 className="font-bold text-[#1A1A1A] text-lg">{defaultAddr.name}</h3>
                      <p className="text-gray-800 text-sm mt-1 font-medium">{defaultAddr.phone}</p>
                      <p className="text-gray-700 text-sm mt-1">{defaultAddr.address}</p>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-[#961E20] border-2 border-white shadow-sm flex items-center justify-center">
                      <Check size={14} className="text-white" />
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm mb-4">No addresses saved. Add one below.</p>
              )}
              <button
                onClick={() => setCurrentView('shipping-addresses')}
                className="w-full bg-white border border-dashed border-gray-400 text-gray-600 py-4 rounded-xl font-medium mb-6 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <Plus className="w-4 h-4" /> Manage Addresses
              </button>
            </div>
          );
        })()}

        {checkoutStep === 2 && (
          <div className="animate-fade-in">
            <h2 className="text-lg font-bold mb-4">Shipping Method</h2>
            <div className="space-y-3">
              {['standard', 'express'].map((method) => (
                <div
                  key={method}
                  onClick={() => setSelectedDelivery(method)}
                  className={`bg-white rounded-xl p-4 flex items-center gap-4 cursor-pointer border-2 transition-all ${selectedDelivery === method ? 'border-[#961E20] shadow-md bg-red-50/50' : 'border-transparent shadow-sm'}`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedDelivery === method ? 'border-[#961E20]' : 'border-gray-300'}`}>
                    {selectedDelivery === method && <div className="w-2.5 h-2.5 rounded-full bg-[#961E20]"></div>}
                  </div>
                  <div className="flex-1">
                    <span className="font-bold block text-sm capitalize">{method} Delivery</span>
                    <span className="text-gray-500 text-xs">{method === 'standard' ? '11-12 Days' : '3-5 Days'}</span>
                  </div>
                  <span className="font-bold text-sm">{method === 'standard' ? 'Free' : '$14.00'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {checkoutStep === 3 && (
          <div className="animate-fade-in">
            <h2 className="text-lg font-bold mb-4">Review & Pay</h2>
            <div className="bg-[#EBCBCB] rounded-2xl p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold">Total Payable</span>
                <span className="font-bold text-xl">${grandTotal.toFixed(2)}</span>
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-3 bg-white/50 p-3 rounded-xl cursor-pointer">
                  <input type="radio" name="payment" className="accent-[#961E20] w-4 h-4" />
                  <div className="flex-1">
                    <span className="block font-bold text-sm">Credit Card</span>
                  </div>
                  <div className="flex gap-1"><div className="w-6 h-4 bg-blue-900 rounded"></div><div className="w-6 h-4 bg-orange-500 rounded"></div></div>
                </label>
                <label className="flex items-center gap-3 bg-white p-3 rounded-xl border border-[#961E20] cursor-pointer shadow-sm">
                  <input type="radio" name="payment" defaultChecked className="accent-[#961E20] w-4 h-4" />
                  <div className="flex-1">
                    <span className="block font-bold text-sm">Cash on Delivery</span>
                    <span className="block text-gray-600 text-xs">Pay upon receipt</span>
                  </div>
                  <Truck size={18} className="text-[#961E20]" />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#FDFBF4] pb-8 border-t border-gray-100 max-w-md mx-auto">
        <button
          onClick={() => {
            if (checkoutStep < 3) setCheckoutStep(checkoutStep + 1);
            else setCurrentView('order-placed');
          }}
          className="w-full bg-[#961E20] text-white py-4 rounded-full font-bold shadow-lg hover:bg-[#7a181a] uppercase tracking-wide transition-all active:scale-95"
        >
          {checkoutStep === 1 ? 'Continue to Delivery' : checkoutStep === 2 ? 'Continue to Payment' : 'Confirm Order'}
        </button>
      </div>
    </div>
  );

  const OrderPlacedView = () => (
    <div className="flex flex-col h-full bg-[#FDFBF4]">
      <div className="flex-1 flex flex-col items-center justify-center px-6 animate-scale-up">
        <div className="w-24 h-24 bg-[#EBCBCB] rounded-full flex items-center justify-center mb-6 shadow-xl relative">
          <div className="absolute inset-0 bg-green-400 rounded-full opacity-20 animate-ping"></div>
          <Check className="w-10 h-10 text-[#961E20]" strokeWidth={4} />
        </div>

        <h1 className="text-2xl font-serif font-bold mb-2 uppercase tracking-wider text-[#961E20]">Order Confirmed!</h1>
        <p className="text-gray-500 mb-8 text-center max-w-[250px]">Your exclusive scent is being prepared with care.</p>

        <div className="w-full bg-white border border-gray-100 rounded-3xl p-6 shadow-lg mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#961E20] to-transparent"></div>
          <div className="flex justify-between mb-4 border-b border-gray-100 pb-4">
            <span className="text-gray-500 text-sm">Order ID</span>
            <span className="font-bold text-[#1A1A1A]">#SCENT-8821</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-gray-50 p-3 rounded-xl"><Truck className="text-[#961E20]" /></div>
            <div>
              <p className="font-bold text-sm">Estimated Delivery</p>
              <p className="text-xs text-gray-500">Jan 27, 2026</p>
            </div>
          </div>
        </div>

        <button onClick={() => { clearCart(); setCurrentView('shop'); }} className="w-full bg-[#961E20] text-white py-4 rounded-full font-bold shadow-lg hover:bg-[#7a181a] transition-all">
          Continue Shopping
        </button>
      </div>
    </div>
  );

  // ============ ORDERS VIEWS ============
  const OrdersListView = () => (
    <div className="flex flex-col h-full bg-[#FDFBF4]">
      <SubPageHeader title="My Orders" />
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {mockOrders.length === 0 && <p className="text-center text-gray-400 mt-12">No orders yet.</p>}
        {mockOrders.map(order => (
          <div
            key={order.id}
            onClick={() => { setSelectedOrder(order); setCurrentView('order-details'); }}
            className="bg-white p-4 rounded-xl shadow-sm mb-4 border border-gray-100 cursor-pointer hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-sm text-[#1A1A1A]">#{order.id}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>{order.status}</span>
            </div>
            <p className="text-gray-500 text-xs mb-2">{order.date}</p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
              <span className="font-bold text-sm">${order.total.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
      <BottomNav active="profile" />
    </div>
  );

  const OrderDetailsView = () => {
    const order = selectedOrder;
    if (!order) return null;
    return (
      <div className="flex flex-col h-full bg-[#FDFBF4]">
        <SubPageHeader title={`Order #${order.id}`} />
        <div className="flex-1 overflow-y-auto p-4 pb-24">
          {/* Status badge */}
          <div className="flex justify-between items-center mb-4">
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
              order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>{order.status}</span>
            <span className="text-xs text-gray-500">{order.date}</span>
          </div>

          {/* Items */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
            <h3 className="font-bold text-sm mb-3">Items</h3>
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-[#1A1A1A]">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.size}ml × {item.qty}</p>
                </div>
                <span className="text-sm font-bold">${item.price.toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Delivery Info */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
            <h3 className="font-bold text-sm mb-2">Delivery Address</h3>
            <p className="text-sm text-gray-600">{order.address}</p>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
            <h3 className="font-bold text-sm mb-2">Payment Method</h3>
            <p className="text-sm text-gray-600">{order.paymentMethod}</p>
          </div>

          {/* Total */}
          <div className="bg-[#EBCBCB] rounded-xl p-4 flex justify-between items-center">
            <span className="font-bold text-[#1A1A1A]">Total</span>
            <span className="font-bold text-xl text-[#961E20]">${order.total.toFixed(2)}</span>
          </div>
        </div>
        <BottomNav active="profile" />
      </div>
    );
  };

  const BottomNav = ({ active }) => (
    <div className="fixed bottom-0 left-0 right-0 bg-[#FDFBF4]/95 backdrop-blur-md border-t border-gray-100 p-4 pb-8 flex justify-around items-center text-gray-400 z-40 max-w-md mx-auto">
      <button onClick={() => setCurrentView('shop')} className={`transition-colors ${active === 'shop' ? "text-[#961E20]" : "hover:text-[#961E20]/50"}`}><Home className={active === 'shop' ? "fill-current" : ""} /></button>
      <button onClick={() => setCurrentView('favorites')} className={`transition-colors ${active === 'favorites' ? "text-[#961E20]" : "hover:text-[#961E20]/50"}`}><Heart className={active === 'favorites' ? "fill-current" : ""} /></button>
      <button onClick={() => setCurrentView('cart')} className={`relative transition-colors ${active === 'cart' ? "text-[#961E20]" : "hover:text-[#961E20]/50"}`}>
        <ShoppingBag className={active === 'cart' ? "fill-current" : ""} />
        {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-[#961E20] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full animate-bounce-small">{cart.reduce((a, b) => a + b.qty, 0)}</span>}
      </button>
      <button onClick={() => setCurrentView('profile')} className={`transition-colors ${active === 'profile' ? "text-[#961E20]" : "hover:text-[#961E20]/50"}`}><User className={active === 'profile' ? "fill-current" : ""} /></button>
    </div>
  );

  return (
    <div className="min-h-screen w-full max-w-md lg:max-w-7xl mx-auto bg-[#FDFBF4] shadow-2xl relative text-[#1A1A1A] font-sans selection:bg-[#961E20] selection:text-white">
      <SideMenu />
      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onGoToLogin={handleAuthModalLogin}
        actionType={authModalAction}
      />
      {currentView === 'onboarding' && <OnboardingView />}
      {currentView === 'shop' && <ShopView />}
      {currentView === 'see-all' && <SeeAllView />}
      {currentView === 'search' && <SearchView />}
      {currentView === 'product-details' && <ProductDetailsView />}
      {currentView === 'cart' && <CartView />}
      {currentView === 'favorites' && <FavoritesView />}
      {currentView === 'profile' && <ProfileView />}
      {currentView === 'signup' && <SignUpView />}
      {currentView === 'shipping-addresses' && <ShippingAddressesView />}
      {currentView === 'payment-methods' && <PaymentMethodsView />}
      {currentView === 'notifications' && <NotificationsView />}
      {currentView === 'settings' && <SettingsView />}
      {currentView === 'checkout' && <CheckoutView />}
      {currentView === 'order-placed' && <OrderPlacedView />}
      {currentView === 'orders-list' && <OrdersListView />}
      {currentView === 'order-details' && selectedOrder && <OrderDetailsView />}
    </div>
  );
}