import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Plus, Trash2 } from 'lucide-react';

export default function AddressPage() {
    const navigate = useNavigate();
    // Fetch from DB in real implementation. Empty for now as requested.
    const [addresses, setAddresses] = useState<any[]>([]);

    const handleAdd = () => {
        // Logic to add address (modal or form)
        const newAddr = { id: Date.now(), name: 'New Address', address: '123 Street', type: 'Home' };
        setAddresses([...addresses, newAddr]);
    };

    return (
        <div className="flex flex-col h-full bg-[#FDFBF4] min-h-screen pb-20">
            <div className="p-4 flex items-center relative bg-white shadow-sm z-10">
                <button onClick={() => navigate(-1)} className="mr-4"><ArrowLeft className="text-[#1A1A1A]" /></button>
                <h1 className="text-lg font-bold text-[#1A1A1A] flex-1">Shipping Addresses</h1>
                <button onClick={handleAdd}><Plus className="text-[#961E20]" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {addresses.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <MapPin size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No addresses found.</p>
                        <button onClick={handleAdd} className="mt-4 text-[#961E20] font-bold">Add New Address</button>
                    </div>
                ) : (
                    addresses.map(addr => (
                        <div key={addr.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                            <div>
                                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded font-bold uppercase">{addr.type}</span>
                                <p className="font-bold mt-1">{addr.name}</p>
                                <p className="text-sm text-gray-500">{addr.address}</p>
                            </div>
                            <button className="text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
