import React, { useState } from 'react';
import { Menu, Search, X } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../contexts/FavoritesContext';
import ProductCard from '../components/ProductCard';
import Header from '../components/layout/Header';
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
    const isDefaultView = !searchTerm && !selectedCategory;

    // Derived lists (mock logic for now, or use real data if available)
    // In a real app, these would be API queries or properties like `is_bestseller`
    const bestSellers = perfumes.slice(0, 4);
    const newArrivals = perfumes.slice(4, 8);

    const filteredPerfumes = perfumes.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.brand.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
        return matchesSearch && matchesCategory;
    });

    const categories = ['Citrus', 'Floral', 'Woody', 'Oriental', 'Fresh']; // Updated to real categories

    return (
        <div className="flex flex-col h-full bg-[#FDFBF4] min-h-screen pb-20">
            {/* Header - Sticky */}
            <div className="sticky top-0 z-50 w-full">
                <Header
                    onMenuClick={() => setIsMenuOpen(true)}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                />
            </div>

            {/* Mobile Search */}
            <div className="px-4 mb-6 md:hidden mt-4">
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

            {/* Main Content */}
            <div className="px-4 space-y-8">
                {isLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-3 h-64 animate-pulse"></div>
                        ))}
                    </div>
                ) : isDefaultView ? (
                    <>
                        {/* Best Sellers Section */}
                        <section>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-[#1A1A1A]">Best Sellers</h2>
                                <button onClick={() => setSelectedCategory(null)} className="text-[#961E20] text-xs font-bold">View All</button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {bestSellers.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        </section>

                        {/* New Fragrances Section */}
                        <section>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-[#1A1A1A]">New Fragrances</h2>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {newArrivals.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        </section>

                        {/* All Products Fallback (optional, or just keep sections) */}
                        <section>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-[#1A1A1A]">All Requests</h2>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {perfumes.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        </section>
                    </>
                ) : (
                    // Filtered Results
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredPerfumes.length > 0 ? (
                            filteredPerfumes.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-20 text-gray-400">
                                No perfumes found.
                            </div>
                        )}
                    </div>
                )}
            </div>

            <BottomNav />
            <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        </div>
    );
}
