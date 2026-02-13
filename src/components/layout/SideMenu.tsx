import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ShoppingBag, Heart, User, Settings, Shield, LogOut, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SideMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SideMenu({ isOpen, onClose }: SideMenuProps) {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleNav = (path: string) => {
        navigate(path);
        onClose();
    };

    const handleLogout = () => {
        logout();
        onClose();
        navigate('/profile'); // or login? Profile will show login form.
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-64 bg-[#FDFBF4] h-full shadow-2xl flex flex-col p-6 animate-slide-right">
                <div className="flex justify-between items-center mb-8">
                    <span className="text-[#961E20] font-serif font-bold text-xl">SCENTSMITHS</span>
                    <button onClick={onClose}><X className="text-[#1A1A1A]" /></button>
                </div>

                <nav className="flex flex-col gap-6 text-[#1A1A1A] font-medium">
                    <button onClick={() => handleNav('/')} className="text-left flex items-center gap-3"><Home size={20} /> Home</button>
                    <button onClick={() => handleNav('/shop')} className="text-left flex items-center gap-3"><ShoppingBag size={20} /> Shop</button>
                    <button onClick={() => handleNav('/favorites')} className="text-left flex items-center gap-3"><Heart size={20} /> Favorites</button>
                    <button onClick={() => handleNav('/profile')} className="text-left flex items-center gap-3"><User size={20} /> Profile</button>
                    <button onClick={() => handleNav('/settings')} className="text-left flex items-center gap-3"><Settings size={20} /> Settings</button>
                    <div className="h-px bg-gray-200 my-2"></div>
                    {user?.role === 'admin' && (
                        <a href="/admin" className="text-left flex items-center gap-3 text-[#961E20] font-bold"><Shield size={20} /> Admin Panel</a>
                    )}
                    {user ? (
                        <button onClick={handleLogout} className="text-left flex items-center gap-3 text-red-600"><LogOut size={20} /> Log Out</button>
                    ) : (
                        <button onClick={() => handleNav('/profile')} className="text-left flex items-center gap-3 text-[#961E20]">Sign In</button>
                    )}
                </nav>
            </div>
        </div>
    );
}
