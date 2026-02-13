import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Truck, CreditCard, Plus } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api';

export default function CheckoutPage() {
    const navigate = useNavigate();
    const { cart, cartTotal, clearCart } = useCart();
    const { user } = useAuth();

    const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Success
    const [loading, setLoading] = useState(false);
    const [addresses, setAddresses] = useState<any[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [selectedPaymentId, setSelectedPaymentId] = useState<any>(null); // 'cod' or ID

    const deliveryFee = 5.00;
    const total = cartTotal + deliveryFee;

    useEffect(() => {
        // Fetch addresses and payment methods
        api.get('/api/addresses').then(data => {
            setAddresses(data);
            const defaultAddr = data.find((a: any) => a.is_default);
            if (defaultAddr) setSelectedAddressId(defaultAddr.id);
            else if (data.length > 0) setSelectedAddressId(data[0].id);
        }).catch(console.error);

        api.get('/api/payment-methods').then(data => {
            setPaymentMethods(data);
            const defaultPay = data.find((p: any) => p.is_default);
            if (defaultPay) setSelectedPaymentId(defaultPay.id);
            else setSelectedPaymentId('cod'); // Default to COD if no cards
        }).catch(console.error);
    }, []);

    const handlePlaceOrder = async () => {
        if (!selectedAddressId) {
            alert('Please select a shipping address.');
            setStep(1);
            return;
        }

        setLoading(true);
        try {
            const addressObj = addresses.find(a => a.id === selectedAddressId);
            const addressStr = `${addressObj.name}, ${addressObj.address}`;

            let paymentStr = 'Cash on Delivery';
            if (selectedPaymentId !== 'cod') {
                const method = paymentMethods.find(m => m.id === selectedPaymentId);
                paymentStr = `${method.type} ending in ${method.last4}`;
            }

            const payload = {
                items: cart,
                total,
                address: addressStr,
                payment_method: paymentStr
            };

            const order = await api.post('/api/orders', payload);
            await clearCart();
            // Go to success
            setStep(3);
        } catch (e: any) {
            alert(e.message || "Failed to place order");
        } finally {
            setLoading(false);
        }
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
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold flex items-center gap-2"><Truck size={18} /> Shipping Address</h3>
                                <button onClick={() => navigate('/shipping-addresses')} className="text-[#961E20] text-xs font-bold flex items-center gap-1"><Plus size={12} /> Add New</button>
                            </div>
                            {addresses.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-4">No addresses found. Please add one.</p>
                            ) : (
                                <div className="space-y-3">
                                    {addresses.map(addr => (
                                        <label key={addr.id} className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all ${selectedAddressId === addr.id ? 'border-[#961E20] bg-red-50' : 'border-gray-200'}`}>
                                            <input type="radio" name="address" checked={selectedAddressId === addr.id} onChange={() => setSelectedAddressId(addr.id)} className="mt-1" />
                                            <div>
                                                <p className="font-bold text-sm">{addr.label}</p>
                                                <p className="text-sm text-gray-600">{addr.address}</p>
                                                <p className="text-xs text-gray-400">{addr.name} • {addr.phone}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button onClick={() => { if (addresses.length === 0) return alert('Add an address first'); setStep(2); }} className="w-full bg-[#1A1A1A] text-white py-4 rounded-xl font-bold shadow-lg">
                            Continue to Payment
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <div className="bg-white p-4 rounded-xl shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold flex items-center gap-2"><CreditCard size={18} /> Payment Method</h3>
                                <button onClick={() => navigate('/payment-methods')} className="text-[#961E20] text-xs font-bold flex items-center gap-1"><Plus size={12} /> Add New</button>
                            </div>
                            <div className="space-y-3">
                                <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${selectedPaymentId === 'cod' ? 'border-[#961E20] bg-red-50' : 'border-gray-200'}`}>
                                    <input type="radio" name="payment" checked={selectedPaymentId === 'cod'} onChange={() => setSelectedPaymentId('cod')} />
                                    <span className="font-medium">Cash on Delivery</span>
                                </label>
                                {paymentMethods.map(method => (
                                    <label key={method.id} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${selectedPaymentId === method.id ? 'border-[#961E20] bg-red-50' : 'border-gray-200'}`}>
                                        <input type="radio" name="payment" checked={selectedPaymentId === method.id} onChange={() => setSelectedPaymentId(method.id)} />
                                        <div>
                                            <span className="font-medium">{method.type}</span>
                                            <span className="text-gray-500 ml-2">**** {method.last4}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl shadow-sm">
                            <h3 className="font-bold mb-4">Order Summary</h3>
                            {cart.map(item => (
                                <div key={`${item.id}-${item.size}`} className="flex justify-between text-sm mb-2">
                                    <span className="flex-1 truncate pr-4">{item.qty}x {item.name} ({item.size}ml)</span>
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
