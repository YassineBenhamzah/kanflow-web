'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/useAuth';
import { Loader2 } from 'lucide-react';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }) {
    const { user, isLoading, checkAuth } = useAuth();
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                <p className="text-zinc-500 text-sm font-medium animate-pulse">Authenticating...</p>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-zinc-950 flex text-white font-sans">
            <Sidebar />
            <main className="flex-1 overflow-auto bg-zinc-950/50">
                {children}
            </main>
        </div>
    );
}
