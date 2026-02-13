import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import BottomNav from '../components/layout/BottomNav';
import ToggleSwitch from '../components/ToggleSwitch';
import { api } from '../api';

export default function SettingsPage() {
    const navigate = useNavigate();
    const { user, isLoading } = useAuth();

    // Redirect to profile (login) if not authenticated
    useEffect(() => {
        if (!isLoading && !user) {
            navigate('/profile', { replace: true });
        }
    }, [user, isLoading, navigate]);

    const [name, setName] = useState(user?.name || "");
    const [phone, setPhone] = useState(user?.phone || "");
    const [loading, setLoading] = useState(false);

    const [orderUpdates, setOrderUpdates] = useState(true);
    const [promos, setPromos] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name);
            setPhone(user.phone || "");
            // Fetch notification settings
            api.get('/api/user/notification-settings').then(data => {
                setOrderUpdates(data.order_updates);
                setPromos(data.promotions);
            }).catch(() => { });
        }
    }, [user]);

    const handleSaveProfile = async () => {
        setLoading(true);
        try {
            const updated = await api.patch('/api/user/me', { name, phone });
            alert("Profile updated successfully");
            // Here you might want to update the AuthContext user state locally
            // But since AuthContext usually fetches /me, a refresh might be needed or simple alert is enough
        } catch (e: any) {
            alert("Failed to update profile: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationUpdate = (key: string, val: boolean) => {
        if (key === 'order_updates') setOrderUpdates(val);
        if (key === 'promotions') setPromos(val);

        api.put('/api/user/notification-settings', { [key]: val }).catch(console.error);
    };

    return (
        <div className="flex flex-col h-full bg-[#FDFBF4] min-h-screen pb-20">
            <div className="p-4 flex items-center bg-white shadow-sm z-10 relative">
                <button onClick={() => navigate(-1)} className="mr-4"><ArrowLeft className="text-[#1A1A1A]" /></button>
                <h1 className="text-lg font-bold text-[#1A1A1A] flex-1">Account Settings</h1>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Personal Info</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs text-gray-500">Display Name</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full text-sm border-b border-gray-200 py-1 outline-none focus:border-[#961E20]" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">Phone</label>
                            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full text-sm border-b border-gray-200 py-1 outline-none focus:border-[#961E20]" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">Email Address</label>
                            <input type="email" value={user?.email || ""} disabled className="w-full text-sm border-b border-gray-200 py-1 outline-none text-gray-400 bg-transparent" />
                        </div>
                        <div className="pt-2">
                            <button onClick={handleSaveProfile} disabled={loading} className="text-xs bg-[#961E20] text-white px-3 py-1.5 rounded disabled:opacity-50">
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Notification Preferences</h3>
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-gray-700">Order Updates</span>
                        <ToggleSwitch checked={orderUpdates} onChange={() => handleNotificationUpdate('order_updates', !orderUpdates)} />
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">Promotional Emails</span>
                        <ToggleSwitch checked={promos} onChange={() => handleNotificationUpdate('promotions', !promos)} />
                    </div>
                </div>
            </div>
            <BottomNav />
        </div>
    );
}
