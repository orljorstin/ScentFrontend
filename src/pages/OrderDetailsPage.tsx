import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, CreditCard } from 'lucide-react';
import { api } from '../api';

export default function OrderDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            api.get(`/api/orders/${id}`)
                .then(setOrder)
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [id]);

    if (loading) return <div className="p-10 text-center">Loading...</div>;
    if (!order) return <div className="p-10 text-center">Order not found</div>;

    const subtotal = order.order_items.reduce((s: number, i: any) => s + (i.price * i.qty), 0);
    const shipping = Number(order.total) - subtotal; // Approximate

    return (
        <div className="flex flex-col h-full bg-[#FDFBF4] min-h-screen pb-20">
            <div className="p-4 flex items-center bg-white shadow-sm z-10 sticky top-0">
                <button onClick={() => navigate(-1)} className="mr-4"><ArrowLeft className="text-[#1A1A1A]" /></button>
                <h1 className="text-lg font-bold text-[#1A1A1A] flex-1">Order Details</h1>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Status Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm text-center">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                        <Package size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-[#1A1A1A] mb-1">{order.status}</h2>
                    <p className="text-gray-500 text-sm">Order #{order.id}</p>
                    <p className="text-gray-400 text-xs mt-1">{new Date(order.created_at).toLocaleString()}</p>
                </div>

                {/* Items */}
                <div className="bg-white p-4 rounded-2xl shadow-sm">
                    <h3 className="font-bold mb-4 text-sm uppercase text-gray-400">Items</h3>
                    <div className="space-y-4">
                        {order.order_items.map((item: any) => (
                            <div key={item.id} className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="bg-gray-100 w-12 h-12 rounded-lg flex items-center justify-center text-xs font-bold text-gray-500">
                                        {item.qty}x
                                    </div>
                                    <div>
                                        <p className="font-bold text-[#1A1A1A] text-sm">{item.name}</p>
                                        <p className="text-xs text-gray-500">{item.size_ml}ml</p>
                                    </div>
                                </div>
                                <p className="font-medium">${Number(item.price).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-gray-100 mt-4 pt-4 space-y-2">
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>Subtotal</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>Shipping</span>
                            <span>${shipping.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg text-[#1A1A1A] pt-2">
                            <span>Total</span>
                            <span className="text-[#961E20]">${Number(order.total).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Info */}
                <div className="bg-white p-4 rounded-2xl shadow-sm space-y-4">
                    <div>
                        <h3 className="font-bold mb-2 text-sm uppercase text-gray-400 flex items-center gap-2"><MapPin size={16} /> Shipping Address</h3>
                        <p className="text-sm text-[#1A1A1A]">{order.address}</p>
                    </div>
                    <div className="border-t border-gray-100 pt-4">
                        <h3 className="font-bold mb-2 text-sm uppercase text-gray-400 flex items-center gap-2"><CreditCard size={16} /> Payment Method</h3>
                        <p className="text-sm text-[#1A1A1A]">{order.payment_method}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
