import React, { useState } from 'react';
import { Menu, Search, X } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../contexts/FavoritesContext';
import ProductCard from '../components/ProductCard';
import BottomNav from '../components/layout/BottomNav';
import SideMenu from '../components/layout/SideMenu';

// Mock data or pass as prop? Ideally fetch from Context or API hook.
// For refactor, we should move the API fetching to a hook or keep it in the page.
// We'll accept perfumes as props for now to keep App.tsx as the data container, 
// OR better: use a custom hook `useProducts`? 
// For now, let's copy the data fetching logic into HomePage or assume passed as props.
// Passing as props is safer for valid refactor step 1.

interface HomePageProps {
    perfumes: any[];
    isLoading: boolean;
}

export default function HomePage({ perfumes, isLoading }: HomePageProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Filter logic
    const filteredPerfumes = perfumes.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.brand.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
        return matchesSearch && matchesCategory;
    });

    const categories = ['Best Seller', 'Just Arrived', 'Luxury'];

    return (
        <div className="flex flex-col h-full bg-[#FDFBF4] min-h-screen pb-20">
            {/* Header */}
            <div className="p-4 flex justify-between items-center sticky top-0 bg-[#FDFBF4]/95 backdrop-blur-sm z-20">
                <button onClick={() => setIsMenuOpen(true)} className="lg:hidden"><Menu className="text-[#961E20]" /></button>

                <div className="flex items-center gap-2">
                    <img src="/logo.png" alt="Scentsmiths" className="h-8 w-auto object-contain" />
                    <span className="hidden lg:block font-serif text-lg font-bold tracking-widest text-[#961E20]">SCENTSMITHS</span>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-600">
                    {/* Simple nav for now */}
                </nav>

                {/* Search Bar - simplified */}
                <div className="relative w-full max-w-xs ml-4 hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search perfumes..."
                        className="w-full bg-white rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none border border-transparent focus:border-[#961E20]"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Mobile Search */}
            <div className="px-4 mb-6 md:hidden">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search perfumes..."
                        className="w-full bg-white rounded-full py-3 pl-10 pr-4 text-sm focus:outline-none border border-transparent focus:border-[#961E20] shadow-sm"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Categories */}
            <div className="px-4 mb-8 overflow-x-auto flex gap-2 no-scrollbar">
                <button
                    onClick={() => setSelectedCategory(null)}
                    className={`whitespace-nowrap px-6 py-2 rounded-full text-sm font-medium transition-all ${!selectedCategory ? 'bg-[#961E20] text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-100'}`}
                >
                    All
                </button>
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                        className={`whitespace-nowrap px-6 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === cat ? 'bg-[#961E20] text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-100'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Product Grid */}
            <div className="px-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {isLoading ? (
                    // Skeleton
                    [...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl p-3 h-64 animate-pulse"></div>
                    ))
                ) : filteredPerfumes.length > 0 ? (
                    filteredPerfumes.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))
                ) : (
                    <div className="col-span-full text-center py-20 text-gray-400">
                        No perfumes found.
                    </div>
                )}
            </div>

            <BottomNav />
            <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        </div>
    );
}
