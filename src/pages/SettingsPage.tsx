import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ToggleSwitch from '../components/ToggleSwitch';
import BottomNav from '../components/layout/BottomNav';

export default function SettingsPage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Local state for settings - in real app, fetch from API
    const [orderUpdates, setOrderUpdates] = useState(true);
    const [promos, setPromos] = useState(false);

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
                            <input type="text" defaultValue={user?.name || ""} className="w-full text-sm border-b border-gray-200 py-1 outline-none focus:border-[#961E20]" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">Email Address</label>
                            <input type="email" defaultValue={user?.email || ""} className="w-full text-sm border-b border-gray-200 py-1 outline-none focus:border-[#961E20]" />
                        </div>
                        <div className="pt-2">
                            <button className="text-xs bg-[#961E20] text-white px-3 py-1.5 rounded">Save Changes</button>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Password</h3>
                    <div className="space-y-3">
                        <input type="password" placeholder="Current Password" className="w-full text-sm border-b border-gray-200 py-1 outline-none" />
                        <input type="password" placeholder="New Password" className="w-full text-sm border-b border-gray-200 py-1 outline-none" />
                        <div className="pt-2">
                            <button className="text-xs bg-gray-800 text-white px-3 py-1.5 rounded">Update Password</button>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Notification Preferences</h3>
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-gray-700">Order Updates</span>
                        <ToggleSwitch checked={orderUpdates} onChange={() => setOrderUpdates(!orderUpdates)} />
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">Promotional Emails</span>
                        <ToggleSwitch checked={promos} onChange={() => setPromos(!promos)} />
                    </div>
                </div>
            </div>
            <BottomNav />
        </div>
    );
}
