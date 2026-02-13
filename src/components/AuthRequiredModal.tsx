import React from 'react';
import { X, LogIn, ShoppingBag } from 'lucide-react';

interface AuthRequiredModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGoToLogin: () => void;
    actionType?: 'addToCart' | 'toggleFavorite';
}

export default function AuthRequiredModal({ isOpen, onClose, onGoToLogin, actionType }: AuthRequiredModalProps) {
    if (!isOpen) return null;

    const message = actionType === 'addToCart'
        ? 'Please log in to add items to your cart'
        : actionType === 'toggleFavorite'
            ? 'Please log in to save items to your favorites'
            : 'Please log in to continue';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div
                className="relative bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-fade-in text-center"
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="w-16 h-16 bg-[#961E20]/10 rounded-full flex items-center justify-center mx-auto mb-5">
                    <LogIn className="text-[#961E20]" size={28} />
                </div>

                <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Login Required</h2>
                <p className="text-gray-500 text-sm mb-8 leading-relaxed">{message}</p>

                <div className="space-y-3">
                    <button
                        onClick={onGoToLogin}
                        className="w-full bg-[#961E20] text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-[#7a181a] transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <LogIn size={18} />
                        Go to Login
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full bg-gray-100 text-gray-600 py-3.5 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                    >
                        Continue Browsing
                    </button>
                </div>
            </div>
        </div>
    );
}
