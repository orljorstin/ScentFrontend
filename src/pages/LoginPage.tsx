import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';
import BottomNav from '../components/layout/BottomNav';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const fd = new FormData(e.target as HTMLFormElement);
        try {
            await login(fd.get('email') as string, fd.get('password') as string);
            navigate('/profile'); // or back to previous
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#FDFBF4] min-h-screen">
            <div className="p-4">
                <button onClick={() => navigate('/')}><ArrowLeft className="text-[#1A1A1A]" /></button>
            </div>
            <div className="flex-1 flex flex-col p-8 justify-center">
                <div className="w-16 h-16 bg-[#961E20] rounded-lg flex items-center justify-center mb-6 shadow-lg">
                    <span className="font-serif text-3xl italic text-white">S</span>
                </div>
                <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">Welcome Back</h1>
                <p className="text-gray-500 mb-8">Sign in to access your orders and wishlist</p>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Email</label>
                        <input name="email" type="email" className="w-full border-b border-gray-300 py-2 outline-none focus:border-[#961E20] bg-transparent" placeholder="name@example.com" />
                    </div>
                    <div className="mb-4">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Password</label>
                        <input name="password" type="password" className="w-full border-b border-gray-300 py-2 outline-none focus:border-[#961E20] bg-transparent" placeholder="••••••••" />
                    </div>
                    <button type="submit" className="w-full bg-[#961E20] text-white py-4 rounded-xl font-bold shadow-lg mt-8">
                        Sign In
                    </button>
                </form>
                {error && <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-center">{error}</p>}
                <p className="text-center mt-6 text-sm text-gray-600">Don't have an account? <button onClick={() => navigate('/signup')} className="text-[#961E20] font-bold ml-1">Sign Up</button></p>
            </div>
            <BottomNav />
        </div>
    );
}
