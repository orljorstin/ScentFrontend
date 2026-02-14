import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { api } from '../api';

interface CollectionPageProps {
    perfumes: any[];
}

export default function CollectionPage({ perfumes }: CollectionPageProps) {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const collection = useMemo(() => {
        switch (id) {
            case 'best-sellers':
                return { title: 'Best Sellers', items: perfumes.slice(0, 4) }; // Mock logic matching HomePage
            case 'new-fragrances':
                return { title: 'New Fragrances', items: perfumes.slice(4, 8) }; // Mock logic matching HomePage
            default:
                return { title: 'Collection', items: [] };
        }
    }, [id, perfumes]);

    return (
        <div className="p-4 pb-32">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-[#961E20]">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold text-[#1A1A1A]">{collection.title}</h1>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {collection.items.length > 0 ? (
                    collection.items.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))
                ) : (
                    <div className="col-span-full text-center py-20 text-gray-400">
                        No products found in this collection.
                    </div>
                )}
            </div>
        </div>
    );
}
