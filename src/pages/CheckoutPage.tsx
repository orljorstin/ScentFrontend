import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Truck, CreditCard } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api';

export default function CheckoutPage() {
    const navigate = useNavigate();
    const { cart, cartTotal, clearCart } = useCart();
    const { user } = useAuth();

    const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Success
    const [loading, setLoading] = useState(false);

    const deliveryFee = 5.00;
    const total = cartTotal + deliveryFee;

    const handlePlaceOrder = async () => {
        setLoading(true);
        // Simulate API call
        setTimeout(async () => {
            try {
                // Ideally create order in DB via API
                // For now, just clear cart and show success
                await clearCart();
                setStep(3);
            } catch (e) {
                alert("Failed to place order");
            } finally {
                setLoading(false);
            }
        }, 1500);
    };

    if (cart.length === 0 && step !== 3) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <p>Your cart is empty</p>
                <button onClick={() => navigate('/shop')} className="text-[#961E20] underline">Shop Now</button>
            </div>
        );
    }

    if (step === 3) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#FDFBF4] p-6 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600">
                    <Check size={40} />
                </div>
                <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">Order Confirmed!</h1>
                <p className="text-gray-500 mb-8">Thank you for your purchase. You will receive an email confirmation shortly.</p>
                <button onClick={() => navigate('/orders')} className="bg-[#961E20] text-white px-8 py-3 rounded-xl font-bold shadow-lg">
                    View My Orders
                </button>
                <button onClick={() => navigate('/shop')} className="mt-4 text-gray-500 text-sm hover:text-[#961E20]">
                    Continue Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#FDFBF4] min-h-screen pb-20">
            <div className="p-4 flex items-center relative bg-white shadow-sm z-10">
                <button onClick={() => navigate(-1)} className="mr-4"><ArrowLeft className="text-[#1A1A1A]" /></button>
                <h1 className="text-lg font-bold text-[#1A1A1A] flex-1">Checkout</h1>
            </div>

            <div className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full">
                {/* Progress */}
                <div className="flex justify-center mb-8 gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-[#961E20] text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
                    <div className="w-12 h-0.5 bg-gray-200 self-center"></div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-[#961E20] text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
                </div>

                {step === 1 && (
                    <div className="space-y-6">
                        <div className="bg-white p-4 rounded-xl shadow-sm">
                            <h3 className="font-bold mb-4 flex items-center gap-2"><Truck size={18} /> Shipping Address</h3>
                            <div className="space-y-3">
                                <input type="text" placeholder="Full Name" defaultValue={user?.name} className="w-full border-b border-gray-200 py-2 outline-none" />
                                <input type="text" placeholder="Address" className="w-full border-b border-gray-200 py-2 outline-none" />
                                <input type="text" placeholder="City, State, ZIP" className="w-full border-b border-gray-200 py-2 outline-none" />
                                <input type="tel" placeholder="Phone Number" className="w-full border-b border-gray-200 py-2 outline-none" />
                            </div>
                        </div>
                        <button onClick={() => setStep(2)} className="w-full bg-[#1A1A1A] text-white py-4 rounded-xl font-bold shadow-lg">
                            Continue to Payment
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <div className="bg-white p-4 rounded-xl shadow-sm">
                            <h3 className="font-bold mb-4 flex items-center gap-2"><CreditCard size={18} /> Payment Method</h3>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:border-[#961E20]">
                                    <input type="radio" name="payment" defaultChecked />
                                    <span>Credit Card</span>
                                </label>
                                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:border-[#961E20]">
                                    <input type="radio" name="payment" />
                                    <span>PayPal</span>
                                </label>
                                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:border-[#961E20]">
                                    <input type="radio" name="payment" />
                                    <span>Cash on Delivery</span>
                                </label>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl shadow-sm">
                            <h3 className="font-bold mb-4">Order Summary</h3>
                            {cart.map(item => (
                                <div key={`${item.id}-${item.size}`} className="flex justify-between text-sm mb-2">
                                    <span>{item.qty}x {item.name} ({item.size}ml)</span>
                                    <span>${(item.price * item.qty).toFixed(2)}</span>
                                </div>
                            ))}
                            <div className="border-t border-gray-100 mt-2 pt-2 flex justify-between font-bold">
                                <span>Total</span>
                                <span className="text-[#961E20]">${total.toFixed(2)}</span>
                            </div>
                        </div>

                        <button onClick={handlePlaceOrder} disabled={loading} className="w-full bg-[#961E20] text-white py-4 rounded-xl font-bold shadow-lg disabled:opacity-50">
                            {loading ? 'Processing...' : `Pay $${total.toFixed(2)}`}
                        </button>
                        <button onClick={() => setStep(1)} className="w-full text-center mt-2 text-gray-500">Back</button>
                    </div>
                )}

            </div>
        </div>
    );
}
