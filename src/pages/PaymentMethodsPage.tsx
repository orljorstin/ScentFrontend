import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Plus, Trash2 } from 'lucide-react';

export default function PaymentMethodsPage() {
    const navigate = useNavigate();
    const [methods, setMethods] = useState<any[]>([]);

    const handleAdd = () => {
        const newMethod = { id: Date.now(), type: 'Visa', number: '**** 4242' };
        setMethods([...methods, newMethod]);
    };

    return (
        <div className="flex flex-col h-full bg-[#FDFBF4] min-h-screen pb-20">
            <div className="p-4 flex items-center relative bg-white shadow-sm z-10">
                <button onClick={() => navigate(-1)} className="mr-4"><ArrowLeft className="text-[#1A1A1A]" /></button>
                <h1 className="text-lg font-bold text-[#1A1A1A] flex-1">Payment Methods</h1>
                <button onClick={handleAdd}><Plus className="text-[#961E20]" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {methods.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <CreditCard size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No payment methods found.</p>
                        <button onClick={handleAdd} className="mt-4 text-[#961E20] font-bold">Add New Card</button>
                    </div>
                ) : (
                    methods.map(method => (
                        <div key={method.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                            <div>
                                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded font-bold uppercase">{method.type}</span>
                                <p className="font-bold mt-1 text-[#1A1A1A]">{method.number}</p>
                            </div>
                            <button className="text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
