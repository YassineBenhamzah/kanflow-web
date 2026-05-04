'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Palette, UserPlus, Trash2, Crown, Users, Clock, AlertTriangle } from 'lucide-react';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';

const COLORS = [
    '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
    '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
];

const ACTION_LABELS = {
    'task.created': { label: 'created a task', icon: '➕' },
    'task.updated': { label: 'updated a task', icon: '✏️' },
    'task.deleted': { label: 'deleted a task', icon: '🗑️' },
    'task.moved':   { label: 'moved a task', icon: '↔️' },
};

export default function BoardSettingsModal({ board, isOpen, onClose, onUpdate }) {
    const router = useRouter();
    const [name, setName] = useState('');
    const [bgColor, setBgColor] = useState('#6366f1');
    const [saving, setSaving] = useState(false);
    const [members, setMembers] = useState([]);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteError, setInviteError] = useState('');
    const [inviting, setInviting] = useState(false);
    const [activeTab, setActiveTab] = useState('settings');
    const [activityLogs, setActivityLogs] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (board) {
            setName(board.name || '');
            setBgColor(board.bg_color || '#6366f1');
            setMembers(board.members || []);
            setInviteError('');
            setShowDeleteConfirm(false);
        }
    }, [board]);

    useEffect(() => {
        if (activeTab === 'activity' && board && activityLogs.length === 0) {
            setLoadingLogs(true);
            axios.get(`/boards/${board.id}/activity`)
                .then(res => setActivityLogs(res.data))
                .catch(() => {})
                .finally(() => setLoadingLogs(false));
        }
    }, [activeTab, board]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await axios.put(`/boards/${board.id}`, { name, bg_color: bgColor });
            onUpdate(response.data);
            onClose();
        } catch (error) {
            console.error('Failed to update board', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteBoard = async () => {
        setDeleting(true);
        try {
            await axios.delete(`/boards/${board.id}`);
            onClose();
            router.push('/dashboard');
        } catch (error) {
            console.error('Failed to delete board', error);
        } finally {
            setDeleting(false);
        }
    };

    const handleInvite = async () => {
        if (!inviteEmail.trim()) return;
        setInviting(true);
        setInviteError('');
        try {
            const response = await axios.post(`/boards/${board.id}/members`, { email: inviteEmail });
            setMembers([...members, response.data]);
            setInviteEmail('');
        } catch (error) {
            setInviteError(error.response?.data?.message || 'User not found');
        } finally {
            setInviting(false);
        }
    };

    const handleRemoveMember = async (userId) => {
        if (!confirm('Remove this member from the board?')) return;
        try {
            await axios.delete(`/boards/${board.id}/members/${userId}`);
            setMembers(members.filter(m => m.id !== userId));
        } catch (error) {
            console.error('Failed to remove member', error);
        }
    };

    const timeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header with Tabs */}
                        <div className="border-b border-zinc-800/50">
                            <div className="flex items-center justify-between px-6 py-4">
                                <h2 className="text-lg font-bold text-white">Board Settings</h2>
                                <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-all">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex gap-1 px-6 pb-2">
                                {['settings', 'activity'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all capitalize ${activeTab === tab ? 'bg-indigo-500/20 text-indigo-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                                    >
                                        {tab === 'settings' ? '⚙️ Settings' : '📋 Activity'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="overflow-y-auto flex-1">
                            {activeTab === 'settings' ? (
                                <div className="px-6 py-5 space-y-6">
                                    {/* Board Name */}
                                    <div>
                                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Board Name</label>
                                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
                                    </div>

                                    {/* Board Color */}
                                    <div>
                                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                            <Palette className="w-3.5 h-3.5" /> Board Color
                                        </label>
                                        <div className="flex gap-2 flex-wrap">
                                            {COLORS.map((color) => (
                                                <button key={color} type="button" onClick={() => setBgColor(color)} className={`w-9 h-9 rounded-xl transition-all ${bgColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900 scale-110' : 'hover:scale-110'}`} style={{ backgroundColor: color }} />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Members */}
                                    <div>
                                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                            <Users className="w-3.5 h-3.5" /> Members ({members.length})
                                        </label>
                                        <div className="space-y-2 mb-3">
                                            {members.map((member) => (
                                                <div key={member.id} className="flex items-center gap-3 bg-zinc-800/30 rounded-xl px-3 py-2.5">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                                        <span className="text-xs font-bold text-white">{member.name?.charAt(0).toUpperCase()}</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-zinc-200 truncate">{member.name}</p>
                                                        <p className="text-[10px] text-zinc-500 truncate">{member.email}</p>
                                                    </div>
                                                    {member.pivot?.role === 'owner' ? (
                                                        <span className="flex items-center gap-1 text-[10px] font-semibold text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded-lg">
                                                            <Crown className="w-3 h-3" /> Owner
                                                        </span>
                                                    ) : (
                                                        <button onClick={() => handleRemoveMember(member.id)} className="text-zinc-600 hover:text-red-400 transition-colors" title="Remove member">
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <input type="email" value={inviteEmail} onChange={(e) => { setInviteEmail(e.target.value); setInviteError(''); }} onKeyDown={(e) => { if (e.key === 'Enter') handleInvite(); }} placeholder="Invite by email..." className="flex-1 bg-zinc-950/50 border border-zinc-800 rounded-xl py-2 px-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition-all" />
                                            <button onClick={handleInvite} disabled={inviting} className="bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white px-3 rounded-xl transition-all">
                                                <UserPlus className="w-4 h-4" />
                                            </button>
                                        </div>
                                        {inviteError && <p className="text-xs text-red-400 mt-1.5">{inviteError}</p>}
                                    </div>

                                    {/* Danger Zone */}
                                    <div className="border-t border-zinc-800/50 pt-5">
                                        <label className="text-xs font-semibold text-red-400/80 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                            <AlertTriangle className="w-3.5 h-3.5" /> Danger Zone
                                        </label>
                                        {!showDeleteConfirm ? (
                                            <button onClick={() => setShowDeleteConfirm(true)} className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 py-2.5 rounded-xl text-sm font-medium transition-all">
                                                <Trash2 className="w-4 h-4" /> Delete Board
                                            </button>
                                        ) : (
                                            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                                                <p className="text-xs text-red-300 mb-3">This will permanently delete the board, all columns, tasks, and comments. This cannot be undone.</p>
                                                <div className="flex gap-2">
                                                    <button onClick={handleDeleteBoard} disabled={deleting} className="flex-1 bg-red-500 hover:bg-red-400 disabled:opacity-50 text-white py-2 rounded-lg text-xs font-medium transition-all">
                                                        {deleting ? 'Deleting...' : 'Yes, Delete'}
                                                    </button>
                                                    <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2 rounded-lg text-xs font-medium transition-all">
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                /* Activity Log Tab */
                                <div className="px-6 py-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Clock className="w-4 h-4 text-zinc-500" />
                                        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Recent Activity</span>
                                    </div>
                                    {loadingLogs ? (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                                        </div>
                                    ) : activityLogs.length === 0 ? (
                                        <p className="text-sm text-zinc-600 text-center py-8">No activity yet</p>
                                    ) : (
                                        <div className="space-y-1">
                                            {activityLogs.map(log => {
                                                const actionInfo = ACTION_LABELS[log.action] || { label: log.action, icon: '📌' };
                                                return (
                                                    <div key={log.id} className="flex items-start gap-3 py-2.5 border-b border-zinc-800/30 last:border-0">
                                                        <span className="text-sm mt-0.5">{actionInfo.icon}</span>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs text-zinc-300">
                                                                <span className="font-semibold text-zinc-200">{log.user?.name}</span>
                                                                {' '}{actionInfo.label}
                                                                {log.meta?.task_title && (
                                                                    <span className="text-indigo-400"> &quot;{log.meta.task_title}&quot;</span>
                                                                )}
                                                                {log.meta?.from_column && log.meta?.to_column && (
                                                                    <span className="text-zinc-500"> from {log.meta.from_column} → {log.meta.to_column}</span>
                                                                )}
                                                            </p>
                                                            <p className="text-[10px] text-zinc-600 mt-0.5">{timeAgo(log.created_at)}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer — only show save on settings tab */}
                        {activeTab === 'settings' && (
                            <div className="px-6 py-4 border-t border-zinc-800/50 flex justify-end">
                                <button
                                    onClick={handleSave}
                                    disabled={saving || !name.trim()}
                                    className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 disabled:opacity-50 text-white font-medium py-2.5 px-5 rounded-xl transition-all shadow-lg shadow-indigo-500/25"
                                >
                                    <Save className="w-4 h-4" />
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
