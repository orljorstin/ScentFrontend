import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { api } from '../api';
import { useToast } from '../contexts/ToastContext';

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const { addToast } = useToast();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [success, setSuccess] = useState(false);

    if (!token) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <p className="text-red-500 font-bold">Invalid or missing reset token.</p>
                <button onClick={() => navigate('/login')} className="mt-4 text-[#961E20] underline">Back to Login</button>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword.length < 6) {
            return addToast('Password must be at least 6 characters', 'error');
        }
        if (newPassword !== confirmPassword) {
            return addToast('Passwords do not match', 'error');
        }

        setLoading(true);
        try {
            await api.post('/auth/reset-password', { token, newPassword });
            setSuccess(true);
            addToast('Password reset successfully!', 'success');
        } catch (err: any) {
            addToast(err.message || 'Failed to reset password', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFBF4] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-[#961E20]/10">

                {success ? (
                    <div className="text-center animate-fade-in">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle size={32} />
                        </div>
                        <h3 className="text-lg font-bold mb-2">Password Reset Successful</h3>
                        <p className="text-gray-500 mb-6">Your password has been updated. You can now login with your new password.</p>
                        <button onClick={() => navigate('/login')} className="w-full bg-[#961E20] text-white py-3 rounded-xl font-bold hover:bg-[#7a181a] transition-colors">
                            Continue to Login
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">Set New Password</h1>
                            <p className="text-gray-500 text-sm">Please create a new password that you don't use on any other site.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[#1A1A1A]">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#961E20] focus:ring-1 focus:ring-[#961E20] outline-none pl-10 pr-10 transition-all"
                                        placeholder="••••••••"
                                    />
                                    <Lock className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600">
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[#1A1A1A]">Confirm Password</label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#961E20] focus:ring-1 focus:ring-[#961E20] outline-none pl-10 transition-all"
                                        placeholder="••••••••"
                                    />
                                    <Lock className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#961E20] text-white py-3 rounded-xl font-bold shadow-lg hover:bg-[#7a181a] transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Reset Password'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
