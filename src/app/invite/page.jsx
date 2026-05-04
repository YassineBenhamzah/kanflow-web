'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/store/useAuth';
import axios from '@/lib/axios';

function InviteContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const { user, isLoading, checkAuth } = useAuth();
    
    const [invitation, setInvitation] = useState(null);
    const [error, setError] = useState(null);
    const [accepting, setAccepting] = useState(false);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    useEffect(() => {
        if (!token) {
            setError('Invalid or missing invitation token.');
            return;
        }

        const fetchInvitation = async () => {
            try {
                const response = await axios.get(`/invitations/${token}`);
                setInvitation(response.data);
            } catch (err) {
                setError('This invitation is invalid, has expired, or has already been accepted.');
            }
        };

        fetchInvitation();
    }, [token]);

    const handleAccept = async () => {
        if (!user) return;
        
        try {
            setAccepting(true);
            const response = await axios.post(`/invitations/${token}/accept`);
            router.push(`/dashboard/board/${response.data.board_id}`);
        } catch (err) {
            setAccepting(false);
            setError(err.response?.data?.message || 'Failed to accept invitation.');
        }
    };

    if (isLoading || (!invitation && !error)) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-md w-full bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 p-8 rounded-3xl text-center relative z-10 shadow-2xl">
                <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/20">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                    </svg>
                </div>

                {error ? (
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Oops!</h2>
                        <p className="text-red-400/90 text-sm mb-6">{error}</p>
                        <button 
                            onClick={() => router.push('/')}
                            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 rounded-xl transition-colors"
                        >
                            Go to Homepage
                        </button>
                    </div>
                ) : (
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">You're Invited!</h2>
                        <p className="text-zinc-400 mb-8">
                            <span className="text-white font-medium">{invitation.inviter_name}</span> has invited you to collaborate on the board <span className="text-white font-medium">"{invitation.board_name}"</span>.
                        </p>

                        {user ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl mb-6">
                                    <p className="text-sm text-indigo-300">
                                        Logged in as <strong>{user.email}</strong>
                                    </p>
                                </div>
                                <button
                                    onClick={handleAccept}
                                    disabled={accepting}
                                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50"
                                >
                                    {accepting ? 'Accepting...' : 'Accept Invitation'}
                                </button>
                                <button 
                                    onClick={() => router.push('/dashboard')}
                                    className="text-sm text-zinc-500 hover:text-white transition-colors mt-4 block mx-auto"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-sm text-zinc-500 mb-6">You need to log in or create an account to join.</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        onClick={() => router.push(`/login?redirect=${encodeURIComponent(`/invite?token=${token}`)}`)}
                                        className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 rounded-xl transition-colors"
                                    >
                                        Log In
                                    </button>
                                    <button 
                                        onClick={() => router.push(`/register?redirect=${encodeURIComponent(`/invite?token=${token}`)}`)}
                                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-medium py-3 rounded-xl shadow-lg shadow-indigo-500/25 transition-all"
                                    >
                                        Register
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function InvitePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
            </div>
        }>
            <InviteContent />
        </Suspense>
    );
}
