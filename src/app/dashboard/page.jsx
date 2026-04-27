'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/store/useAuth';
import axios from '@/lib/axios';
import { Plus, LayoutTemplate, LogOut, Loader2 } from 'lucide-react';
import CreateBoardModal from '@/components/CreateBoardModal';
import { useRouter } from 'next/navigation';


export default function DashboardPage() {
    // Look! We grab the user's name directly from our Zustand Global Brain!
    const { user, logout } = useAuth();
    const [boards, setBoards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const handleCreateBoard = async (boardData) => {
        try {
            const response = await axios.post('/boards', boardData);
            setBoards([...boards, response.data]);
        } catch (error) {
            console.error('Failed to create board', error);
        }
    };

    const router = useRouter();
    const handleLogout = async () => {
        try {
            // Hit the Laravel API to securely destroy the session token
            await axios.post('/auth/logout');
            logout(); // Clear the Zustand brain
            window.location.href = '/login'; // Kick to login screen
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    useEffect(() => {
        const fetchBoards = async () => {
            try {
                // Fetch the boards dynamically from the Hostinger backend
                const response = await axios.get('/boards');
                setBoards(response.data);
            } catch (error) {
                console.error("Failed to load boards");
            } finally {
                setLoading(false);
            }
        };
        fetchBoards();
    }, []);

    return (
        <div className="flex-1 w-full p-10 max-w-7xl mx-auto">
            {/* Top Navigation Profile */}
            <div className="flex items-center justify-between mb-12">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        Welcome back, <span className="text-indigo-400">{user?.name}</span>
                    </h1>
                    <p className="text-zinc-400 mt-1">Here is your workspace overview.</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center text-sm font-medium text-zinc-400 hover:text-red-400 transition-colors bg-zinc-900/50 px-4 py-2 rounded-xl border border-zinc-800 hover:border-red-900/50 hover:bg-red-500/10"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                </button>
            </div>

            {/* Boards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Create New Board Card */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setShowCreateModal(true)}
                    className="h-40 rounded-2xl border-2 border-dashed border-zinc-800 hover:border-indigo-500/50 bg-zinc-900/20 hover:bg-indigo-500/5 transition-all flex flex-col items-center justify-center cursor-pointer group"
                >
                    <div className="w-10 h-10 rounded-full bg-zinc-800 group-hover:bg-indigo-500/20 flex items-center justify-center mb-3 transition-colors">
                        <Plus className="w-5 h-5 text-zinc-400 group-hover:text-indigo-400" />
                    </div>
                    <span className="text-sm font-medium text-zinc-400 group-hover:text-indigo-400 transition-colors">
                        Create New Board
                    </span>
                </motion.div>

                {/* Loading state or actual boards mapped out */}
                {loading ? (
                    <div className="h-40 rounded-2xl border border-zinc-800 bg-zinc-900/30 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-zinc-600 animate-spin" />
                    </div>
                ) : (
                    boards.map((board) => (
                        <motion.div
                            key={board.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => router.push(`/dashboard/board/${board.id}`)}
                            className="h-40 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 flex flex-col cursor-pointer hover:border-zinc-600 transition-all shadow-lg"
                        >
                            <div className="flex items-center gap-3 mb-auto">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: board.bg_color || '#4f46e5' }}>
                                    <LayoutTemplate className="w-4 h-4 text-white/80" />
                                </div>
                                <h3 className="font-semibold text-zinc-100">{board.name}</h3>
                            </div>
                            <div className="text-xs font-medium text-zinc-500 mt-auto flex justify-between items-center">
                                <span>Personal Board</span>
                                <span className="bg-zinc-800 px-3 py-1.5 rounded-lg text-zinc-300 font-semibold group-hover:bg-zinc-700 transition-colors">View Board &rarr;</span>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
            <CreateBoardModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreate={handleCreateBoard}
            />
        </div>
    );
}
