import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, ChevronRight } from 'lucide-react';
import BottomNav from '../components/layout/BottomNav';
import { api } from '../api';
import { formatOrderId } from '../utils/orderId';

export default function OrdersPage() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/orders')
            .then(setOrders)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="flex flex-col h-full bg-[#FDFBF4] min-h-screen pb-20">
            <div className="p-4 flex items-center bg-white shadow-sm z-10 relative">
                <button onClick={() => navigate(-1)} className="mr-4"><ArrowLeft className="text-[#1A1A1A]" /></button>
                <h1 className="text-lg font-bold text-[#1A1A1A] flex-1">My Orders</h1>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? <div className="text-center p-10">Loading orders...</div> : orders.length === 0 ? (
                    <div className="text-center py-20 opacity-50">
                        <Package size={48} className="mx-auto mb-4" />
                        <p>No orders yet</p>
                    </div>
                ) : (
                    orders.map(order => (
                        <div
                            key={order.id}
                            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => navigate(`/orders/${order.id}`)}
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-orange-50 p-3 rounded-lg"><Package className="text-orange-600" size={20} /></div>
                                <div>
                                    <h3 className="font-bold text-[#1A1A1A] text-sm">Order #{order.id}</h3>
                                    <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
                                    <span className={`inline-block px-2 py-0.5 text-[10px] uppercase font-bold rounded mt-1 
                                        ${order.status === 'Delivered' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-[#1A1A1A] text-sm">${Number(order.total).toFixed(2)}</p>
                                <ChevronRight size={16} className="text-gray-400 ml-auto mt-1" />
                            </div>
                        </div>
                    ))
                )}
            </div>
            <BottomNav />
        </div>
    );
}
