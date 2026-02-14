import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Plus, Trash2, X } from 'lucide-react';
import { api } from '../api';

export default function PaymentMethodsPage() {
    const navigate = useNavigate();
    const [methods, setMethods] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Detailed Form State
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [cardType, setCardType] = useState('Unknown');
    const [isDefault, setIsDefault] = useState(false);

    useEffect(() => {
        fetchMethods();
    }, []);

    const fetchMethods = () => {
        api.get('/api/payment-methods')
            .then(data => {
                setMethods(Array.isArray(data) ? data : []);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    const handleDelete = async (id: any) => {
        if (!window.confirm('Delete this card?')) return;
        try {
            await api.delete(`/api/payment-methods/${id}`);
            setMethods(prev => prev.filter(m => m.id !== id));
        } catch (err) {
            console.error(err);
            alert('Failed to delete payment method');
        }
    };

    const handleSetDefault = async (id: any) => {
        try {
            // Optimistic update
            const newMethods = methods.map(m => ({
                ...m,
                is_default: m.id === id
            }));
            setMethods(newMethods);

            await api.patch(`/api/payment-methods/${id}/default`, { is_default: true });
        } catch (err) {
            console.error(err);
            alert('Failed to set default payment method');
            fetchMethods(); // Revert
        }
    };

    // --- Validation & Formatting Logic ---

    const detectCardType = (num: string) => {
        const clean = num.replace(/\D/g, '');
        if (/^4/.test(clean)) return 'Visa';
        if (/^5[1-5]/.test(clean) || /^2[2-7]/.test(clean)) return 'MasterCard';
        if (/^3[47]/.test(clean)) return 'Amex';
        return 'Unknown';
    };

    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 16) val = val.substring(0, 16);

        // Format with spaces: 1234 5678 1234 5678
        const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
        setCardNumber(formatted);
        setCardType(detectCardType(val));
    };

    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length >= 3) {
            val = val.substring(0, 2) + '/' + val.substring(2, 4);
        }
        setExpiry(val);
    };

    const luhnCheck = (num: string) => {
        let arr = (num + '')
            .split('')
            .reverse()
            .map(x => parseInt(x));
        let lastDigit = arr.splice(0, 1)[0];
        let sum = arr.reduce((acc, val, i) => (i % 2 !== 0 ? acc + val : acc + ((val * 2) % 9) || 9), 0);
        sum += lastDigit;
        return sum % 10 === 0;
    };

    const validateForm = () => {
        const cleanNum = cardNumber.replace(/\D/g, '');
        if (cleanNum.length < 13 || !luhnCheck(cleanNum)) {
            alert("Invalid Card Number.");
            return false;
        }

        const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
        if (!expiryRegex.test(expiry)) {
            alert("Invalid expiry format. Use MM/YY.");
            return false;
        }

        // Expiry Date Check
        const [month, year] = expiry.split('/').map(Number);
        const now = new Date();
        const currentYear = Number(now.getFullYear().toString().substr(-2));
        const currentMonth = now.getMonth() + 1;

        if (year < currentYear || (year === currentYear && month < currentMonth)) {
            alert("Card has expired.");
            return false;
        }

        if (cvv.length < 3) {
            alert("Invalid CVV.");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        const cleanNum = cardNumber.replace(/\D/g, '');
        const last4 = cleanNum.slice(-4);

        const payload = {
            type: cardType === 'Unknown' ? 'Visa' : cardType, // Default to Visa if unknown but valid
            last4: last4,
            expiry: expiry,
            is_default: isDefault
        };

        try {
            const newMethod = await api.post('/api/payment-methods', payload);
            setMethods(prev => [...prev, newMethod]);
            setShowForm(false);
            // Reset
            setCardNumber('');
            setExpiry('');
            setCvv('');
            setCardType('Unknown');
            setIsDefault(false);
            fetchMethods();
        } catch (err: any) {
            alert('Failed to add payment method: ' + (err.message || 'Unknown error'));
            console.error(err);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#FDFBF4] min-h-screen pb-20">
            <div className="p-4 flex items-center relative bg-white shadow-sm z-10">
                <button onClick={() => navigate(-1)} className="mr-4"><ArrowLeft className="text-[#1A1A1A]" /></button>
                <h1 className="text-lg font-bold text-[#1A1A1A] flex-1">Payment Methods</h1>
                <button onClick={() => setShowForm(true)}><Plus className="text-[#961E20]" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {showForm && (
                    <div className="bg-white p-4 rounded-xl shadow-md mb-4 border border-[#961E20]/20 animate-fade-in">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold">Add Card</h3>
                            <button onClick={() => setShowForm(false)}><X size={16} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            {/* Card Number & Type Icon */}
                            <div className="relative">
                                <input
                                    required
                                    maxLength={19} // 16 digits + 3 spaces
                                    placeholder="Card Number"
                                    value={cardNumber}
                                    onChange={handleCardNumberChange}
                                    className="w-full border-b border-gray-200 py-2 outline-none text-sm text-gray-900 placeholder-gray-400 pl-8"
                                />
                                <div className="absolute left-0 top-2 text-gray-400">
                                    <CreditCard size={18} />
                                </div>
                                {cardNumber && (
                                    <div className="absolute right-0 top-2 text-xs font-bold text-[#961E20]">
                                        {cardType}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    required
                                    maxLength={5}
                                    placeholder="Expiry (MM/YY)"
                                    value={expiry}
                                    onChange={handleExpiryChange}
                                    className="w-full border-b border-gray-200 py-2 outline-none text-sm text-gray-900 placeholder-gray-400"
                                />
                                <input
                                    required
                                    maxLength={4}
                                    type="password"
                                    placeholder="CVV"
                                    value={cvv}
                                    onChange={e => setCvv(e.target.value.replace(/\D/g, ''))}
                                    className="w-full border-b border-gray-200 py-2 outline-none text-sm text-gray-900 placeholder-gray-400"
                                />
                            </div>

                            <label className="flex items-center gap-2 text-sm text-gray-600">
                                <input type="checkbox" checked={isDefault} onChange={e => setIsDefault(e.target.checked)} />
                                Set as default
                            </label>
                            <button type="submit" className="w-full bg-[#961E20] text-white py-3 rounded-xl font-bold text-sm mt-2">Save Card</button>
                        </form>
                    </div>
                )}

                {loading ? <div className="text-center p-10">Loading...</div> : methods.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <CreditCard size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No payment methods found.</p>
                        <button onClick={() => setShowForm(true)} className="mt-4 text-[#961E20] font-bold">Add New Card</button>
                    </div>
                ) : (
                    methods.map(method => (
                        <div key={method.id} className={`bg-white p-4 rounded-xl shadow-sm border ${method.is_default ? 'border-[#961E20] bg-orange-50/10' : 'border-gray-100'} flex justify-between items-center`}>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded font-bold uppercase text-gray-600">{method.type}</span>
                                    {method.is_default && <span className="text-[10px] text-[#961E20] font-bold border border-[#961E20] px-1 rounded">DEFAULT</span>}
                                </div>
                                <p className="font-bold text-[#1A1A1A]">**** **** **** {method.last4}</p>
                                <p className="text-xs text-gray-400 mb-2">Expires {method.expiry}</p>

                                {!method.is_default && (
                                    <button onClick={() => handleSetDefault(method.id)} className="text-xs font-bold text-gray-500 hover:text-[#961E20]">
                                        Set as Default
                                    </button>
                                )}
                            </div>
                            <button onClick={() => handleDelete(method.id)} className="text-gray-300 hover:text-red-600 p-2">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
