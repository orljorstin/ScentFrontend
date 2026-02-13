import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Truck, CreditCard, Plus } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api';
import { useToast } from '../contexts/ToastContext';
import { useCurrency } from '../hooks/useCurrency';
import { usePhAddress } from '../hooks/usePhAddress';

export default function CheckoutPage() {
    const navigate = useNavigate();
    const { cart, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const { addToast } = useToast();
    const { formatPrice } = useCurrency();

    // Address Hook
    const { regions, provinces, cities, barangays, fetchProvinces, fetchCities, fetchBarangays } = usePhAddress();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [addresses, setAddresses] = useState<any[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [selectedPaymentId, setSelectedPaymentId] = useState<any>(null);

    // Dynamic Shipping State
    const [selectedCountry, setSelectedCountry] = useState('Philippines');

    // Inline Address Form State
    const [showAddressForm, setShowAddressForm] = useState(false);

    // Detailed Address State
    const [addrRegion, setAddrRegion] = useState<any>(null);
    const [addrProvince, setAddrProvince] = useState<any>(null);
    const [addrCity, setAddrCity] = useState<any>(null);
    const [addrBarangay, setAddrBarangay] = useState<any>(null);

    const [formData, setFormData] = useState({
        label: 'Home',
        name: '',
        phone: '',
        street: '',
        is_default: false
    });

    // Reset address form
    const resetAddressForm = () => {
        setFormData({ label: 'Home', name: '', phone: '', street: '', is_default: false });
        setAddrRegion(null);
        setAddrProvince(null);
        setAddrCity(null);
        setAddrBarangay(null);
        setShowAddressForm(false);
    };

    const handleCountryChange = (e: any) => {
        const country = e.target.value;
        setSelectedCountry(country);
        if (country !== 'Philippines') {
            setAddrRegion(null);
            setAddrProvince(null);
            setAddrCity(null);
            setAddrBarangay(null);
        }
    };

    const handleRegionChange = async (e: any) => {
        const code = e.target.value;
        const region = regions.find(r => r.code === code);
        setAddrRegion(region);
        setAddrProvince(null);
        setAddrCity(null);
        setAddrBarangay(null);

        if (code) {
            const provs = await fetchProvinces(code);
            // If no provinces (NCR), fetch cities directly
            if (!provs || provs.length === 0) {
                fetchCities(code);
            }
        }
    };

    const handleProvinceChange = (e: any) => {
        const code = e.target.value;
        const prov = provinces.find(p => p.code === code);
        setAddrProvince(prov);
        setAddrCity(null);
        setAddrBarangay(null);
        if (code && addrRegion) fetchCities(addrRegion.code, code);
    };

    const handleCityChange = (e: any) => {
        const code = e.target.value;
        const city = cities.find(c => c.code === code);
        setAddrCity(city);
        setAddrBarangay(null);
        if (code) fetchBarangays(code);
    };

    const handleSaveAddress = async () => {
        // Validation
        const phoneRegex = /^09\d{9}$/;
        if (!formData.name || !formData.street || !formData.label || !formData.phone) {
            return addToast("Please fill in all address fields", 'error');
        }

        // Specific validation for Philippines
        if (selectedCountry === 'Philippines') {
            if (!addrRegion || !addrCity || !addrBarangay) {
                return addToast("Please select Region, City, and Barangay", 'error');
            }
            if (!phoneRegex.test(formData.phone)) {
                return addToast("Invalid phone format (09xxxxxxxxx)", 'error');
            }
        }

        // Construct full address string
        let fullAddress = '';
        if (selectedCountry === 'Philippines') {
            const provinceStr = addrProvince ? `${addrProvince.name}, ` : '';
            fullAddress = `${formData.street}, ${addrBarangay.name}, ${addrCity.name}, ${provinceStr}${addrRegion.name}, Philippines`;
        } else {
            fullAddress = `${formData.street}, ${selectedCountry}`; // Simple fallback for Intl
        }

        try {
            const payload = {
                label: formData.label,
                name: formData.name,
                phone: formData.phone,
                address: fullAddress,
                is_default: formData.is_default
            };

            const newAddr = await api.post('/api/addresses', payload);
            const updated = await api.get('/api/addresses');
            setAddresses(updated);
            setSelectedAddressId(newAddr.id || updated[updated.length - 1].id);
            resetAddressForm();
            addToast("Address saved!", 'success');
        } catch (e: any) {
            addToast("Failed to save address", 'error');
        }
    };

    // calculate delivery fee: 100 PHP (~1.79 USD) for PH, 1500 PHP (~26.79 USD) for Intl
    // using rate 56: 100/56 = 1.785, 1500/56 = 26.785
    const deliveryFee = selectedCountry === 'Philippines' ? (100 / 56) : (1500 / 56);
    const total = cartTotal + deliveryFee;

    useEffect(() => {
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
            else setSelectedPaymentId('cod');
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
            const addressStr = `${addressObj.name} (${addressObj.phone}), ${addressObj.address}`;

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
            setStep(3);
            addToast('Order placed successfully!', 'success');
        } catch (e: any) {
            addToast(e.message || "Failed to place order", 'error');
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
                                {!showAddressForm && (
                                    <button onClick={() => setShowAddressForm(true)} className="text-[#961E20] text-xs font-bold flex items-center gap-1"><Plus size={12} /> Add New</button>
                                )}
                            </div>

                            {/* Inline Address Form */}
                            {showAddressForm && (
                                <div className="mb-6 p-4 border border-[#961E20]/20 rounded-xl bg-red-50/10 animate-fade-in">
                                    <h4 className="font-bold text-sm mb-3">New Address Details</h4>
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <input placeholder="Label (e.g. Home)" value={formData.label} onChange={e => setFormData({ ...formData, label: e.target.value })} className="border p-2 rounded text-sm w-full" />
                                            <input placeholder="Phone (09xxxxxxxxx)" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="border p-2 rounded text-sm w-full" />
                                        </div>
                                        <input placeholder="Full Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="border p-2 rounded text-sm w-full" />

                                        {/* Country Selection */}
                                        <select className="border p-2 rounded text-sm w-full" onChange={handleCountryChange} value={selectedCountry}>
                                            <option value="Philippines">Philippines</option>
                                            <option value="International">International</option>
                                        </select>

                                        {/* Cascading Dropdowns (Only for PH) */}
                                        {selectedCountry === 'Philippines' && (
                                            <>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <select className="border p-2 rounded text-sm w-full" onChange={handleRegionChange} value={addrRegion?.code || ''}>
                                                        <option value="">Select Region</option>
                                                        {regions.map((r: any) => <option key={r.code} value={r.code}>{r.name}</option>)}
                                                    </select>
                                                </div>

                                                {provinces.length > 0 && (
                                                    <select className="border p-2 rounded text-sm w-full" onChange={handleProvinceChange} value={addrProvince?.code || ''}>
                                                        <option value="">Select Province</option>
                                                        {provinces.map((p: any) => <option key={p.code} value={p.code}>{p.name}</option>)}
                                                    </select>
                                                )}

                                                <div className="grid grid-cols-2 gap-3">
                                                    <select className="border p-2 rounded text-sm w-full" onChange={handleCityChange} value={addrCity?.code || ''} disabled={!cities.length}>
                                                        <option value="">Select City</option>
                                                        {cities.map((c: any) => <option key={c.code} value={c.code}>{c.name}</option>)}
                                                    </select>
                                                    <select className="border p-2 rounded text-sm w-full" onChange={e => {
                                                        const b = barangays.find(b => b.code === e.target.value);
                                                        setAddrBarangay(b);
                                                    }} value={addrBarangay?.code || ''} disabled={!barangays.length}>
                                                        <option value="">Select Barangay</option>
                                                        {barangays.map((b: any) => <option key={b.code} value={b.code}>{b.name}</option>)}
                                                    </select>
                                                </div>
                                            </>
                                        )}

                                        <input placeholder="Street Address, Unit, Building" value={formData.street} onChange={e => setFormData({ ...formData, street: e.target.value })} className="border p-2 rounded text-sm w-full" />

                                        <div className="flex gap-2 pt-2">
                                            <button onClick={handleSaveAddress} className="flex-1 bg-[#961E20] text-white py-2 rounded-lg text-sm font-bold">Save & Select</button>
                                            <button onClick={resetAddressForm} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600">Cancel</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {addresses.length === 0 && !showAddressForm ? (
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
                        <button onClick={() => { if (!selectedAddressId) return addToast('Please select an address', 'error'); setStep(2); }} className="w-full bg-[#1A1A1A] text-white py-4 rounded-xl font-bold shadow-lg">
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
                                    <span>{formatPrice(item.price * item.qty)}</span>
                                </div>
                            ))}
                            <div className="flex justify-between text-sm mb-2 text-gray-500">
                                <span>Shipping ({selectedCountry})</span>
                                <span>{formatPrice(deliveryFee)}</span>
                            </div>
                            <div className="border-t border-gray-100 mt-2 pt-2 flex justify-between font-bold">
                                <span>Total</span>
                                <span className="text-[#961E20]">{formatPrice(total)}</span>
                            </div>
                        </div>

                        <button onClick={handlePlaceOrder} disabled={loading} className="w-full bg-[#961E20] text-white py-4 rounded-xl font-bold shadow-lg disabled:opacity-50">
                            {loading ? 'Processing...' : `Pay ${formatPrice(total)}`}
                        </button>
                        <button onClick={() => setStep(1)} className="w-full text-center mt-2 text-gray-500">Back</button>
                    </div>
                )}

            </div>
        </div>
    );
}
