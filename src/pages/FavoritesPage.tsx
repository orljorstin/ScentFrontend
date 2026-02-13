import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useFavorites } from '../contexts/FavoritesContext';
import ProductCard from '../components/ProductCard';
import BottomNav from '../components/layout/BottomNav';

export default function FavoritesPage() {
    const navigate = useNavigate();
    const { favorites } = useFavorites();

    return (
        <div className="flex flex-col h-full bg-[#FDFBF4] min-h-screen pb-20">
            <div className="p-4 flex items-center shadow-sm z-10 bg-white">
                <button onClick={() => navigate(-1)}><ArrowLeft className="text-[#1A1A1A]" /></button>
                <h1 className="flex-1 text-center font-bold text-lg">My Favorites</h1>
                <div className="w-8"></div>
            </div>

            <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {favorites.length === 0 ? (
                    <div className="col-span-full text-center py-20 opacity-50">
                        <p>No favorites yet</p>
                        <button onClick={() => navigate('/')} className="mt-4 text-[#961E20] font-bold underline">Browse Shop</button>
                    </div>
                ) : (
                    favorites.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))
                )}
            </div>
            <BottomNav />
        </div>
    );
}
