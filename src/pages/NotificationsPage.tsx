import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell } from 'lucide-react';
import { api } from '../api';

export default function NotificationsPage() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/user/notifications')
            .then(setNotifications)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleRead = (id: number) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        api.patch(`/api/user/notifications/${id}/read`, {}).catch(() => { });
    };

    return (
        <div className="flex flex-col h-full bg-[#FDFBF4] min-h-screen pb-20">
            <div className="p-4 flex items-center relative bg-white shadow-sm z-10">
                <button onClick={() => navigate(-1)} className="mr-4"><ArrowLeft className="text-[#1A1A1A]" /></button>
                <h1 className="text-lg font-bold text-[#1A1A1A] flex-1">Notifications</h1>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {loading ? <div className="text-center p-10">Loading...</div> : notifications.length === 0 ? (
                    <div className="text-center py-20 opacity-50">
                        <Bell size={48} className="mx-auto mb-4" />
                        <p>No notifications</p>
                    </div>
                ) : (
                    notifications.map(n => (
                        <div key={n.id} onClick={() => handleRead(n.id)} className={`p-4 rounded-xl border ${n.is_read ? 'bg-white border-gray-100' : 'bg-red-50 border-red-100'} cursor-pointer hover:shadow-md transition-shadow`}>
                            <div className="flex gap-3">
                                <div className={`p-2 rounded-full ${n.is_read ? 'bg-gray-100 text-gray-400' : 'bg-[#961E20] text-white'}`}>
                                    <Bell size={16} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-[#1A1A1A]">{n.title}</h4>
                                    <p className="text-xs text-gray-500 mt-1">{n.message}</p>
                                    <p className="text-[10px] text-gray-400 mt-2">{new Date(n.created_at).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
