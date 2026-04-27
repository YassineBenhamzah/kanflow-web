'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/useAuth';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({ children }) {
    const { user, isLoading, checkAuth } = useAuth();
    const router = useRouter();

    // 1. The microsecond they visit /dashboard, we silently check their token
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    // 2. If we pinged Laravel and it said they aren't remembered, kick them to login
    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    // 3. While Next.js is talking to Laravel, show a beautiful full screen loader
    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                <p className="text-zinc-500 text-sm font-medium animate-pulse">Authenticating...</p>
            </div>
        );
    }

    // 4. If they aren't logged in, return nothing so the screen doesn't flash secrets while redirecting
    if (!user) {
        return null;
    }

    // 5. If they ARE authenticated, show the Dashboard Wrapper!
    return (
        <div className="min-h-screen bg-zinc-950 flex text-white font-sans">
            {/* (In the very next step, we will paste the Sidebar code right here) */}
            
            <main className="flex-1 overflow-auto bg-zinc-950/50">
                {children}
            </main>
        </div>
    );
}
