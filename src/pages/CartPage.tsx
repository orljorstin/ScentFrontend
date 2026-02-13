import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Minus, Plus } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import BottomNav from '../components/layout/BottomNav';
import { useCurrency } from '../hooks/useCurrency';

export default function CartPage() {
    const navigate = useNavigate();
    const { cart, removeFromCart, updateQty, cartTotal } = useCart();
    const { formatPrice } = useCurrency();

    // Future: dynamic delivery fee based on address
    const deliveryFee = 5.00;
    const grandTotal = cartTotal + deliveryFee;

    return (
        <div className="flex flex-col h-full bg-[#FDFBF4] min-h-screen pb-20">
            <div className="p-4 flex items-center relative shadow-sm z-10 bg-white">
                <button onClick={() => navigate(-1)} className="mr-4"><ArrowLeft className="text-[#1A1A1A]" /></button>
                <h1 className="text-xl font-bold text-[#1A1A1A]">My Cart</h1>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
                {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <p>Your cart is empty</p>
                        <button onClick={() => navigate('/')} className="mt-4 text-[#961E20] font-bold">Start Shopping</button>
                    </div>
                ) : (
                    <>
                        {cart.map(item => (
                            <div key={`${item.id}-${item.size}`} className="bg-white p-4 rounded-2xl mb-4 shadow-sm border border-rose-50 flex gap-4 animate-fade-in">
                                <div className="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center">
                                    <img src={item.image} alt={item.name} className="w-16 h-16 object-contain" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <div>
                                            <h3 className="font-bold text-[#1A1A1A]">{item.name}</h3>
                                            <p className="text-xs text-gray-400">{item.brand} • {item.size}ml</p>
                                        </div>
                                        <button onClick={() => removeFromCart(item.id, item.size)} className="text-gray-300 hover:text-[#961E20]">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <div className="flex justify-between items-end mt-2">
                                        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                                            <button
                                                onClick={() => updateQty(item.id, item.size, -1)}
                                                className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-[#961E20] disabled:opacity-50"
                                                disabled={item.qty <= 1}
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="font-bold text-sm w-4 text-center">{item.qty}</span>
                                            <button
                                                onClick={() => updateQty(item.id, item.size, 1)}
                                                className="w-6 h-6 flex items-center justify-center bg-[#961E20] rounded shadow-sm text-white"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                        <p className="font-bold text-[#961E20]">{formatPrice(item.price * item.qty)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="mt-8 pt-4 border-t border-gray-200">
                            <div className="flex justify-between mb-2 text-sm">
                                <span className="text-gray-500">Subtotal</span>
                                <span className="font-medium">{formatPrice(cartTotal)}</span>
                            </div>
                            <div className="flex justify-between mb-4 text-sm">
                                <span className="text-gray-500">Delivery (Est.)</span>
                                <span className="font-medium">{formatPrice(deliveryFee)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-[#1A1A1A]">
                                <span>Total</span>
                                <span className="text-[#961E20]">{formatPrice(grandTotal)}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/checkout')}
                            className="w-full bg-[#961E20] text-white py-4 rounded-xl font-bold shadow-lg mt-8 hover:bg-[#7a181a] transition-colors"
                        >
                            Proceed to Checkout
                        </button>
                    </>
                )}
            </div>
            <BottomNav />
        </div>
    );
}
