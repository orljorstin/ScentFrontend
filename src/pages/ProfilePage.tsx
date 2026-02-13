import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Settings, Package, MapPin, CreditCard, Bell, ChevronRight, Shield, ArrowLeft, Download } from 'lucide-react';
import BottomNav from '../components/layout/BottomNav';
import { usePWAInstall } from '../hooks/usePWAInstall';
import LoginPage from './LoginPage';

export default function ProfilePage() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { isInstallable, install } = usePWAInstall();

    // If used without RequireAuth wrapper, handle null user
    if (!user) {
        // Redirect or show login
        // Ideally this component isn't rendered if not auth
        return <LoginPage isEmbedded={true} />;
    }

    return (
        <div className="flex flex-col h-full bg-[#FDFBF4] min-h-screen pb-20">
            <div className="p-6 bg-[#961E20] text-white pt-10 pb-16 rounded-b-[2.5rem] shadow-xl relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="text-white hover:text-white/80"><ArrowLeft size={24} /></button>
                        <h1 className="text-2xl font-bold">My Profile</h1>
                    </div>
                    <button onClick={() => navigate('/settings')}><Settings size={20} /></button>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-serif italic border-2 border-white/50">{user.name.charAt(0)}</div>
                    <div>
                        <p className="font-bold text-lg">{user.name}</p>
                        <p className="text-white/70 text-sm">{user.email}</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 -mt-8 pt-12">
                <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-[#1A1A1A]">My Orders</h3>
                        <button onClick={() => navigate('/orders')} className="text-[#961E20] text-xs font-bold">View All</button>
                    </div>
                    {/* Recent Order Preview - Mock or Fetch? */}
                    {/* For now static placeholder or simplified fetch */}
                    <div
                        className="flex gap-4 items-center border-b border-gray-100 pb-3 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors"
                        onClick={() => navigate('/orders')}
                    >
                        <div className="bg-gray-100 p-2 rounded-lg"><Package size={20} className="text-gray-600" /></div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-[#1A1A1A]">View Order History</p>
                            <p className="text-xs text-green-600 font-medium">Check status & details</p>
                        </div>
                        <ChevronRight size={16} className="text-gray-400" />
                    </div>
                </div>

                {isInstallable && (
                    <div className="bg-white rounded-2xl p-4 shadow-sm mb-4 border border-rose-100">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-[#1A1A1A]">App Installation</h3>
                        </div>
                        <button
                            onClick={install}
                            className="w-full flex items-center gap-3 p-3 rounded-xl bg-rose-50 hover:bg-rose-100 transition-colors text-left text-rose-700 font-medium"
                        >
                            <Download size={20} />
                            <div>
                                <p>Install Scentsmiths</p>
                                <p className="text-xs text-rose-500 font-normal">Add to Home Screen</p>
                            </div>
                        </button>
                    </div>
                )}

                <div className="bg-white rounded-2xl p-2 shadow-sm space-y-1">
                    <button onClick={() => navigate('/shipping-addresses')} className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                        <div className="flex items-center gap-3">
                            <MapPin size={18} className="text-gray-500" />
                            <span className="text-sm font-medium">Shipping Addresses</span>
                        </div>
                        <ChevronRight size={16} className="text-gray-400" />
                    </button>
                    <button onClick={() => navigate('/payment-methods')} className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                        <div className="flex items-center gap-3">
                            <CreditCard size={18} className="text-gray-500" />
                            <span className="text-sm font-medium">Payment Methods</span>
                        </div>
                        <ChevronRight size={16} className="text-gray-400" />
                    </button>
                    <button onClick={() => navigate('/notifications')} className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                        <div className="flex items-center gap-3">
                            <Bell size={18} className="text-gray-500" />
                            <span className="text-sm font-medium">Notifications</span>
                        </div>
                        <ChevronRight size={16} className="text-gray-400" />
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
                    onClick={() => { logout(); navigate('/'); }}
                    className="w-full text-center mt-4 text-gray-400 text-sm font-medium hover:text-[#961E20]"
                >
                    Log Out
                </button>
            </div>
            <BottomNav />
        </div>
    );
}
