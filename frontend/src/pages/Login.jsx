import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Mail, Lock, Loader2, GraduationCap } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, isAuthenticated } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await api.post('/auth/login', { email, password });
            const { access_token, user } = response.data;
            login(access_token, user);
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full items-center justify-center bg-slate-50">
            <div className="z-10 w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-slate-200">
                <div className="flex flex-col items-center mb-8">
                    <div className="p-3 bg-primary-600 rounded-xl shadow-lg shadow-primary-500/30 mb-4">
                        <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome Back</h2>
                    <p className="text-slate-500 mt-2 text-sm font-medium">Sign in to your EduManager account</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl flex items-center shadow-sm">
                        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 mr-2 text-red-500"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /><path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Email Address</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                            </div>
                            <input
                                type="email"
                                autoComplete="email"
                                required
                                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200 sm:text-sm shadow-sm"
                                placeholder="name@university.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Password</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                            </div>
                            <input
                                type="password"
                                autoComplete="current-password"
                                required
                                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200 sm:text-sm shadow-sm"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-primary-500/20 text-sm font-bold text-white transition-all duration-200 ${isLoading
                                ? 'bg-primary-400 cursor-not-allowed'
                                : 'bg-primary-600 hover:bg-primary-700 hover:shadow-primary-500/40 hover:-translate-y-0.5 active:translate-y-0'
                                }`}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                                    Signing In...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-8 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                    <p className="font-bold text-slate-700 mb-2 uppercase tracking-wide">Demo Credentials</p>
                    <div className="grid grid-cols-1 gap-2 text-slate-600">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                            <span className="font-semibold text-primary-700">Super Admin</span>
                            <span className="font-mono bg-white px-1 rounded border">admin@university.com / admin123</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                            <span className="font-semibold text-primary-700">School Admin</span>
                            <span className="font-mono bg-white px-1 rounded border">dean@university.com / 123456</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                            <span className="font-semibold text-primary-700">Faculty</span>
                            <span className="font-mono bg-white px-1 rounded border">turing@university.com / 123456</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-primary-700">Student</span>
                            <span className="font-mono bg-white px-1 rounded border">student1@university.com / 123456</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
