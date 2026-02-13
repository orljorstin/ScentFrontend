import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell } from 'lucide-react';

const MOCK_NOTIFICATIONS = [
    { id: 1, title: 'Order Delivered', message: 'Your order #SCENT-8821 has been delivered.', time: '2h ago', read: false },
    { id: 2, title: 'New Arrival', message: 'Check out the new summer collection!', time: '1d ago', read: true },
];

export default function NotificationsPage() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col h-full bg-[#FDFBF4] min-h-screen pb-20">
            <div className="p-4 flex items-center relative bg-white shadow-sm z-10">
                <button onClick={() => navigate(-1)} className="mr-4"><ArrowLeft className="text-[#1A1A1A]" /></button>
                <h1 className="text-lg font-bold text-[#1A1A1A] flex-1">Notifications</h1>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {MOCK_NOTIFICATIONS.map(n => (
                    <div key={n.id} className={`p-4 rounded-xl border ${n.read ? 'bg-white border-gray-100' : 'bg-red-50 border-red-100'} cursor-pointer hover:shadow-md transition-shadow`}>
                        <div className="flex gap-3">
                            <div className={`p-2 rounded-full ${n.read ? 'bg-gray-100 text-gray-400' : 'bg-[#961E20] text-white'}`}>
                                <Bell size={16} />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-[#1A1A1A]">{n.title}</h4>
                                <p className="text-xs text-gray-500 mt-1">{n.message}</p>
                                <p className="text-[10px] text-gray-400 mt-2">{n.time}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
