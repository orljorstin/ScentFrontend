import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function OnboardingPage() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col h-full min-h-screen bg-[#FDFBF4] relative overflow-hidden">
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
                    onClick={() => navigate('/shop')}
                    className="bg-[#961E20] text-white px-10 py-4 rounded-full font-medium shadow-lg hover:bg-[#7a181a] hover:shadow-xl transition-all active:scale-95"
                >
                    Get Started
                </button>
            </div>
        </div>
    );
}
