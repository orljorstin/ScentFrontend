import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, ChevronRight } from 'lucide-react';
import BottomNav from '../components/layout/BottomNav';

// Mock orders for now, or fetch
const MOCK_ORDERS = [
    { id: 'SCENT-8821', date: 'Jan 24, 2026', status: 'Delivered', total: 458.00 },
    { id: 'SCENT-8765', date: 'Jan 15, 2026', status: 'Shipped', total: 165.00 },
    { id: 'SCENT-8600', date: 'Dec 28, 2025', status: 'Delivered', total: 310.00 },
];

export default function OrdersPage() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col h-full bg-[#FDFBF4] min-h-screen pb-20">
            <div className="p-4 flex items-center bg-white shadow-sm z-10 relative">
                <button onClick={() => navigate(-1)} className="mr-4"><ArrowLeft className="text-[#1A1A1A]" /></button>
                <h1 className="text-lg font-bold text-[#1A1A1A] flex-1">My Orders</h1>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {MOCK_ORDERS.map(order => (
                    <div
                        key={order.id}
                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between"
                        onClick={() => navigate(`/orders/${order.id}`)}
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-orange-50 p-3 rounded-lg"><Package className="text-orange-600" size={20} /></div>
                            <div>
                                <h3 className="font-bold text-[#1A1A1A] text-sm">Order #{order.id}</h3>
                                <p className="text-xs text-gray-400">{order.date}</p>
                                <span className="inline-block px-2 py-0.5 bg-green-50 text-green-700 text-[10px] uppercase font-bold rounded mt-1">{order.status}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-[#1A1A1A] text-sm">${order.total.toFixed(2)}</p>
                            <ChevronRight size={16} className="text-gray-400 ml-auto mt-1" />
                        </div>
                    </div>
                ))}
            </div>
            <BottomNav />
        </div>
    );
}
