import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';
import BottomNav from '../components/layout/BottomNav';

export default function SignupPage() {
    const navigate = useNavigate();
    const { register, user } = useAuth(); // Added user
    const [error, setError] = useState('');

    // Redirect if already logged in
    React.useEffect(() => {
        if (user) {
            navigate('/profile', { replace: true });
        }
    }, [user, navigate]);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        const fd = new FormData(e.target as HTMLFormElement);
        try {
            await register(
                fd.get('email') as string,
                fd.get('password') as string,
                fd.get('name') as string,
                fd.get('phone') as string
            );
            navigate('/profile');
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#FDFBF4] min-h-screen">
            <div className="p-4">
                <button onClick={() => navigate(-1)}><ArrowLeft className="text-[#1A1A1A]" /></button>
            </div>
            <div className="flex-1 flex flex-col p-8 justify-center">
                <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">Create Account</h1>
                <p className="text-gray-500 mb-8">Join Scentsmiths for exclusive offers</p>

                <form onSubmit={handleSignup} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Full Name</label>
                        <input name="name" type="text" className="w-full border-b border-gray-300 py-2 outline-none focus:border-[#961E20] bg-transparent" placeholder="John Doe" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Email</label>
                        <input name="email" type="email" className="w-full border-b border-gray-300 py-2 outline-none focus:border-[#961E20] bg-transparent" placeholder="name@example.com" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Phone Number</label>
                        <input name="phone" type="tel" className="w-full border-b border-gray-300 py-2 outline-none focus:border-[#961E20] bg-transparent" placeholder="09xxxxxxxxx" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Password</label>
                        <input name="password" type="password" className="w-full border-b border-gray-300 py-2 outline-none focus:border-[#961E20] bg-transparent" placeholder="••••••••" />
                    </div>
                    <button type="submit" className="w-full bg-[#961E20] text-white py-4 rounded-xl font-bold shadow-lg mt-8">
                        Sign Up
                    </button>
                </form>
                {error && <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-center">{error}</p>}
                <p className="text-center mt-4 text-sm text-gray-600">Already have an account? <button onClick={() => navigate('/login')} className="text-[#961E20] font-bold ml-1">Sign In</button></p>
            </div>
            <BottomNav />
        </div>
    );
}
