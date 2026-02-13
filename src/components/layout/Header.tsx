import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, Heart, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
    onMenuClick: () => void;
    searchTerm?: string;
    onSearchChange?: (term: string) => void;
}

export default function Header({ onMenuClick, searchTerm, onSearchChange }: HeaderProps) {
    const navigate = useNavigate();
    const { cart } = useCart();
    const { user } = useAuth();
    const cartCount = cart.reduce((a, b) => a + b.qty, 0);

    return (
        <div className="p-4 flex justify-between items-center sticky top-0 bg-[#FDFBF4]/95 backdrop-blur-sm z-20 shadow-sm transition-all">
            {/* Mobile: hamburger */}
            <button onClick={onMenuClick} className="lg:hidden p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors">
                <Menu className="text-[#961E20]" />
            </button>

            {/* Logo */}
            <Link to="/shop" className="flex items-center gap-2 group">
                <img src="/logo.png" alt="Scentsmiths" className="h-8 w-auto object-contain group-hover:scale-105 transition-transform" />
                <span className="hidden lg:block font-serif text-lg font-bold tracking-widest text-[#961E20]">SCENTSMITHS</span>
            </Link>

            {/* Desktop: nav links */}
            <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-gray-600 ml-8">
                <Link to="/shop" className="hover:text-[#961E20] transition-colors relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-[-4px] after:left-0 after:bg-[#961E20] after:origin-bottom-right after:transition-transform hover:after:scale-x-100 hover:after:origin-bottom-left">Shop</Link>
                <Link to="/favorites" className="hover:text-[#961E20] transition-colors">Favorites</Link>
                {user && <Link to="/orders" className="hover:text-[#961E20] transition-colors">Orders</Link>}
                <Link to="/profile" className="hover:text-[#961E20] transition-colors">Profile</Link>
            </nav>

            {/* Search Bar - Desktop & Mobile (Responsive) */}
            <div className="relative flex-1 max-w-md ml-4 hidden md:block group">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#961E20] transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Search perfumes..."
                        className="w-full bg-white rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none border border-transparent focus:border-[#961E20]/20 focus:bg-white focus:shadow-sm transition-all"
                        value={searchTerm || ''}
                        onChange={e => onSearchChange?.(e.target.value)}
                    />
                </div>
            </div>

            {/* Right icons */}
            <div className="flex items-center gap-2 ml-4">
                {/* Mobile Search Trigger? For now hidden, assuming distinct mobile search bar in page or handled here. 
            HomePage has its own mobile search bar. */}

                <Link to="/favorites" className="hidden lg:flex p-2 hover:bg-black/5 rounded-full transition-colors text-gray-600 hover:text-[#961E20]">
                    <Heart size={20} />
                </Link>

                <Link to="/cart" className="relative p-2 hover:bg-black/5 rounded-full transition-colors text-gray-600 hover:text-[#961E20]">
                    <ShoppingBag size={20} />
                    {cartCount > 0 && <span className="absolute top-0 right-0 bg-[#961E20] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-bounce-small">{cartCount}</span>}
                </Link>

                <Link to="/profile" className="hidden lg:flex p-2 hover:bg-black/5 rounded-full transition-colors text-gray-600 hover:text-[#961E20]">
                    <User size={20} />
                </Link>
            </div>
        </div>
    );
}
