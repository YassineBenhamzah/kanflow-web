'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import axios from '@/lib/axios';
import { useAuth } from '@/store/useAuth';
import {
    LayoutDashboard, Plus, ChevronLeft, ChevronRight,
    LayoutTemplate, LogOut, Trash2, User, Settings
} from 'lucide-react';

export default function Sidebar() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [boards, setBoards] = useState([]);
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        const fetchBoards = async () => {
            try {
                const response = await axios.get('/boards');
                setBoards(response.data);
            } catch (error) {
                console.error('Failed to load boards');
            }
        };
        fetchBoards();
    }, [pathname]);

    const handleLogout = async () => {
        try {
            await axios.post('/auth/logout');
            logout();
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    const handleDeleteBoard = async (e, boardId) => {
        e.stopPropagation();
        if (!confirm('Delete this board and all its tasks?')) return;
        try {
            await axios.delete(`/boards/${boardId}`);
            setBoards(boards.filter(b => b.id !== boardId));
            if (pathname.includes(`/board/${boardId}`)) {
                router.push('/dashboard');
            }
        } catch (error) {
            console.error('Failed to delete board', error);
        }
    };

    return (
        <motion.aside
            animate={{ width: collapsed ? 72 : 260 }}
            transition={{ duration: 0.2 }}
            className="h-screen flex flex-col bg-zinc-950 border-r border-zinc-800/50 overflow-hidden"
        >
            {/* Logo */}
            <div className="flex items-center justify-between px-4 py-5 border-b border-zinc-800/30">
                {!collapsed && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <LayoutTemplate className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-lg font-bold text-white tracking-tight">KanFlow</span>
                    </motion.div>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="w-8 h-8 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-all"
                >
                    {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-3 px-2">
                {/* Dashboard Link */}
                <button
                    onClick={() => router.push('/dashboard')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all ${
                        pathname === '/dashboard'
                            ? 'bg-indigo-500/10 text-indigo-400'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                    }`}
                >
                    <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span className="text-sm font-medium">Dashboard</span>}
                </button>

                {/* Boards Section */}
                {!collapsed && (
                    <div className="mt-5 mb-2 px-3 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Your Boards</span>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="w-5 h-5 rounded flex items-center justify-center text-zinc-600 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
                        >
                            <Plus className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}

                {/* Board List */}
                <div className="space-y-0.5">
                    {boards.map((board) => {
                        const isActive = pathname === `/dashboard/board/${board.id}`;
                        return (
                            <div
                                key={board.id}
                                onClick={() => router.push(`/dashboard/board/${board.id}`)}
                                className={`group w-full flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all ${
                                    isActive
                                        ? 'bg-zinc-800/80 text-white'
                                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30'
                                }`}
                            >
                                <div
                                    className="w-5 h-5 rounded flex-shrink-0 flex items-center justify-center"
                                    style={{ backgroundColor: board.bg_color || '#6366f1' }}
                                >
                                    <LayoutTemplate className="w-3 h-3 text-white/80" />
                                </div>
                                {!collapsed && (
                                    <>
                                        <span className="text-sm font-medium truncate flex-1">{board.name}</span>
                                        <button
                                            onClick={(e) => handleDeleteBoard(e, board.id)}
                                            className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded flex items-center justify-center text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* User Section */}
            <div className="border-t border-zinc-800/30 p-3">
                <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-2'}`}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-white" />
                    </div>
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-zinc-200 truncate">{user?.name}</p>
                            <p className="text-[10px] text-zinc-600 truncate">{user?.email}</p>
                        </div>
                    )}
                    {!collapsed && (
                        <button
                            onClick={handleLogout}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            title="Sign Out"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </motion.aside>
    );
}
