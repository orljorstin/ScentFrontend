import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Plus, Trash2, X } from 'lucide-react';
import { api } from '../api';

export default function AddressPage() {
    const navigate = useNavigate();
    const [addresses, setAddresses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ label: 'Home', name: '', phone: '', address: '', is_default: false });

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = () => {
        api.get('/api/addresses')
            .then(setAddresses)
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Delete this address?')) return;
        try {
            await api.delete(`/api/addresses/${id}`);
            setAddresses(addresses.filter(a => a.id !== id));
        } catch (err) {
            alert('Failed to delete address');
        }
    };

    const validateForm = () => {
        // Phone validation 09xxxxxxxxx (11 digits)
        const phoneRegex = /^09\d{9}$/;
        if (!phoneRegex.test(formData.phone)) {
            alert("Please enter a valid PH phone number starting with 09 (11 digits).");
            return false;
        }
        if (!formData.name || !formData.address || !formData.label) {
            alert("Please fill in all required fields.");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            await api.post('/api/addresses', formData);
            setShowForm(false);
            setFormData({ label: 'Home', name: '', phone: '', address: '', is_default: false });
            fetchAddresses();
        } catch (err) {
            alert('Failed to add address');
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#FDFBF4] min-h-screen pb-20">
            <div className="p-4 flex items-center relative bg-white shadow-sm z-10">
                <button onClick={() => navigate(-1)} className="mr-4"><ArrowLeft className="text-[#1A1A1A]" /></button>
                <h1 className="text-lg font-bold text-[#1A1A1A] flex-1">Shipping Addresses</h1>
                <button onClick={() => setShowForm(true)}><Plus className="text-[#961E20]" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {showForm && (
                    <div className="bg-white p-4 rounded-xl shadow-md mb-4 border border-[#961E20]/20 animate-fade-in">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold">New Address</h3>
                            <button onClick={() => setShowForm(false)}><X size={16} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <input required placeholder="Label (e.g. Home, Work)" value={formData.label} onChange={e => setFormData({ ...formData, label: e.target.value })} className="w-full border-b border-gray-200 py-2 outline-none text-sm" />
                            <input required placeholder="Full Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border-b border-gray-200 py-2 outline-none text-sm" />
                            <input required placeholder="Phone Number (e.g. 09123456789)" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full border-b border-gray-200 py-2 outline-none text-sm" />
                            <input required placeholder="Address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full border-b border-gray-200 py-2 outline-none text-sm" />
                            <label className="flex items-center gap-2 text-sm text-gray-600">
                                <input type="checkbox" checked={formData.is_default} onChange={e => setFormData({ ...formData, is_default: e.target.checked })} />
                                Set as default
                            </label>
                            <button type="submit" className="w-full bg-[#961E20] text-white py-3 rounded-xl font-bold text-sm mt-2">Save Address</button>
                        </form>
                    </div>
                )}

                {loading ? <div className="text-center p-10">Loading...</div> : addresses.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <MapPin size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No addresses found.</p>
                        <button onClick={() => setShowForm(true)} className="mt-4 text-[#961E20] font-bold">Add New Address</button>
                    </div>
                ) : (
                    addresses.map(addr => (
                        <div key={addr.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded font-bold uppercase">{addr.label}</span>
                                    {addr.is_default && <span className="text-[10px] text-[#961E20] font-bold border border-[#961E20] px-1 rounded">DEFAULT</span>}
                                </div>
                                <p className="font-bold mt-1">{addr.name}</p>
                                <p className="text-sm text-gray-500">{addr.address}</p>
                                <p className="text-xs text-gray-400">{addr.phone}</p>
                            </div>
                            <button onClick={() => handleDelete(addr.id)} className="text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
