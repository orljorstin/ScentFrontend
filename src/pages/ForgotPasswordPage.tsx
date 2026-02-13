import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Mail, Loader2 } from 'lucide-react';
import { api } from '../api';
import { useToast } from '../contexts/ToastContext';

export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            setSent(true);
            addToast('Reset link sent to your email', 'success');
        } catch (err: any) {
            addToast(err.message || 'Failed to send reset link', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFBF4] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-[#961E20]/10">
                <button onClick={() => navigate('/login')} className="mb-6 text-gray-400 hover:text-[#961E20] flex items-center gap-2">
                    <ArrowLeft size={18} /> Back to Login
                </button>

                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">Forgot Password?</h1>
                    <p className="text-gray-500 text-sm">Enter your email and we'll send you a link to reset your password.</p>
                </div>

                {sent ? (
                    <div className="text-center animate-fade-in">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mail size={32} />
                        </div>
                        <h3 className="text-lg font-bold mb-2">Check your mail</h3>
                        <p className="text-gray-500 mb-6">We have sent a password recover instructions to your email.</p>
                        <button onClick={() => navigate('/login')} className="w-full bg-[#961E20] text-white py-3 rounded-xl font-bold hover:bg-[#7a181a] transition-colors">
                            Back to Login
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#1A1A1A]">Email Address</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#961E20] focus:ring-1 focus:ring-[#961E20] outline-none pl-11 transition-all"
                                    placeholder="name@example.com"
                                />
                                <Mail className="absolute left-4 top-3.5 text-gray-400" size={18} />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#961E20] text-white py-3 rounded-xl font-bold shadow-lg hover:bg-[#7a181a] transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Send Reset Link'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
