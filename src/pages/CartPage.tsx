import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Minus, Plus } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import BottomNav from '../components/layout/BottomNav';

export default function CartPage() {
    const navigate = useNavigate();
    const { cart, removeFromCart, updateQty, cartTotal } = useCart();
    const deliveryFee = 5.00;
    const grandTotal = cartTotal + deliveryFee;

    return (
        <div className="flex flex-col h-full bg-[#FDFBF4] min-h-screen pb-20">
            <div className="p-4 flex items-center relative shadow-sm z-10 bg-white">
                <button onClick={() => navigate(-1)}><ArrowLeft className="text-[#1A1A1A]" /></button>
                <h1 className="flex-1 text-center font-bold text-lg">My Cart</h1>
                <div className="w-8"></div>
            </div>

            <div className="flex-1 p-4">
                {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 opacity-50">
                        <p>Your cart is empty</p>
                        <button onClick={() => navigate('/')} className="mt-4 text-[#961E20] font-bold underline">Start Shopping</button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {cart.map((item, index) => (
                            <div key={`${item.id}-${item.size}-${index}`} className="bg-white p-3 rounded-2xl flex gap-4 shadow-sm">
                                <div className="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center">
                                    <img src={item.image || item.image_url} className="w-16 h-16 object-contain" alt={item.name} />
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-sm text-[#1A1A1A] line-clamp-1">{item.name}</h3>
                                            <button onClick={() => removeFromCart(item.id, item.size)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                                        </div>
                                        <p className="text-xs text-gray-500">{item.size}ml • ${item.price.toFixed(2)}</p>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                                            <button onClick={() => updateQty(item.id, item.size, item.qty - 1)} className="p-1 hover:bg-white rounded-md transition-colors"><Minus size={14} /></button>
                                            <span className="text-xs font-bold w-4 text-center">{item.qty}</span>
                                            <button onClick={() => updateQty(item.id, item.size, item.qty + 1)} className="p-1 hover:bg-white rounded-md transition-colors"><Plus size={14} /></button>
                                        </div>
                                        <p className="font-bold text-[#961E20]">${(item.price * item.qty).toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="mt-8 pt-4 border-t border-gray-200">
                            <div className="flex justify-between mb-2 text-sm">
                                <span className="text-gray-500">Subtotal</span>
                                <span className="font-medium">${cartTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between mb-4 text-sm">
                                <span className="text-gray-500">Delivery</span>
                                <span className="font-medium">${deliveryFee.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-[#1A1A1A]">
                                <span>Total</span>
                                <span className="text-[#961E20]">${grandTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        <button className="w-full bg-[#1A1A1A] text-white py-4 rounded-xl font-bold shadow-lg mt-6">
                            Proceed to Checkout
                        </button>
                    </div>
                )}
            </div>
            <BottomNav />
        </div>
    );
}
