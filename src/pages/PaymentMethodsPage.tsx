import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Plus, Trash2, X } from 'lucide-react';
import { api } from '../api';

export default function PaymentMethodsPage() {
    const navigate = useNavigate();
    const [methods, setMethods] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ type: 'Visa', last4: '', expiry: '', is_default: false });

    useEffect(() => {
        fetchMethods();
    }, []);

    const fetchMethods = () => {
        api.get('/api/payment-methods')
            .then(setMethods)
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Delete this card?')) return;
        try {
            await api.delete(`/api/payment-methods/${id}`);
            setMethods(methods.filter(m => m.id !== id));
        } catch (err) {
            alert('Failed to delete payment method');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/api/payment-methods', formData);
            setShowForm(false);
            setFormData({ type: 'Visa', last4: '', expiry: '', is_default: false });
            fetchMethods();
        } catch (err) {
            alert('Failed to add payment method');
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
                            <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full border-b border-gray-200 py-2 outline-none text-sm bg-transparent">
                                <option value="Visa">Visa</option>
                                <option value="MasterCard">MasterCard</option>
                                <option value="Amex">Amex</option>
                            </select>
                            <input required maxLength={4} placeholder="Last 4 Digits" value={formData.last4} onChange={e => setFormData({ ...formData, last4: e.target.value })} className="w-full border-b border-gray-200 py-2 outline-none text-sm" />
                            <input required placeholder="Expiry (MM/YY)" value={formData.expiry} onChange={e => setFormData({ ...formData, expiry: e.target.value })} className="w-full border-b border-gray-200 py-2 outline-none text-sm" />
                            <label className="flex items-center gap-2 text-sm text-gray-600">
                                <input type="checkbox" checked={formData.is_default} onChange={e => setFormData({ ...formData, is_default: e.target.checked })} />
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
                        <div key={method.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded font-bold uppercase">{method.type}</span>
                                    {method.is_default && <span className="text-[10px] text-[#961E20] font-bold border border-[#961E20] px-1 rounded">DEFAULT</span>}
                                </div>
                                <p className="font-bold mt-1 text-[#1A1A1A]">**** **** **** {method.last4}</p>
                                <p className="text-xs text-gray-400">Expires {method.expiry}</p>
                            </div>
                            <button onClick={() => handleDelete(method.id)} className="text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
