'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/store/useAuth';
import axios from '@/lib/axios';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get('redirect') || '/dashboard';
    
    // Pulling the login function from our Zustand memory brain!
    const { login } = useAuth();
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            // Hit the live Hostinger API securely
            const response = await axios.post('/auth/login', { email, password });
            login(response.data.token, response.data.user);
            window.location.href = redirectUrl; // Redirect on success
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-violet-600/20 blur-[120px]" />

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-zinc-900/50 backdrop-blur-xl rounded-2xl border border-zinc-800/50 p-8 shadow-2xl">
                    
                    <div className="text-center mb-8">
                        <motion.div 
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 mb-4"
                        >
                            <Lock className="w-6 h-6" />
                        </motion.div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h1>
                        <p className="text-zinc-400 mt-2 text-sm">Sign in to your KanFlow workspace.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                                {error}
                            </motion.div>
                        )}

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                                <input 
                                    type="email" 
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                    placeholder="yassine@example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Password</label>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                                <input 
                                    type="password" 
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full mt-2 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-white font-medium py-3 px-4 rounded-xl transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center group disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>
                                    Sign In 
                                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-zinc-400 text-sm">
                        Don't have an account?{' '}
                        <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                            Create workspace
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
