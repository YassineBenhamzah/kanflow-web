'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Palette, UserPlus, Trash2, Crown, Users } from 'lucide-react';
import axios from '@/lib/axios';

const COLORS = [
    '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
    '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
];

export default function BoardSettingsModal({ board, isOpen, onClose, onUpdate }) {
    const [name, setName] = useState('');
    const [bgColor, setBgColor] = useState('#6366f1');
    const [saving, setSaving] = useState(false);
    const [members, setMembers] = useState([]);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteError, setInviteError] = useState('');
    const [inviting, setInviting] = useState(false);

    useEffect(() => {
        if (board) {
            setName(board.name || '');
            setBgColor(board.bg_color || '#6366f1');
            setMembers(board.members || []);
            setInviteError('');
        }
    }, [board]);

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
                        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/50">
                            <h2 className="text-lg font-bold text-white">Board Settings</h2>
                            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-all">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="px-6 py-5 space-y-6">
                            {/* Board Name */}
                            <div>
                                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Board Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                />
                            </div>

                            {/* Board Color */}
                            <div>
                                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <Palette className="w-3.5 h-3.5" /> Board Color
                                </label>
                                <div className="flex gap-2 flex-wrap">
                                    {COLORS.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setBgColor(color)}
                                            className={`w-9 h-9 rounded-xl transition-all ${bgColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900 scale-110' : 'hover:scale-110'}`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Members Section */}
                            <div>
                                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                    <Users className="w-3.5 h-3.5" /> Members ({members.length})
                                </label>

                                {/* Member List */}
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
                                                <button
                                                    onClick={() => handleRemoveMember(member.id)}
                                                    className="text-zinc-600 hover:text-red-400 transition-colors"
                                                    title="Remove member"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Invite Input */}
                                <div className="flex gap-2">
                                    <input
                                        type="email"
                                        value={inviteEmail}
                                        onChange={(e) => { setInviteEmail(e.target.value); setInviteError(''); }}
                                        onKeyDown={(e) => { if (e.key === 'Enter') handleInvite(); }}
                                        placeholder="Invite by email..."
                                        className="flex-1 bg-zinc-950/50 border border-zinc-800 rounded-xl py-2 px-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition-all"
                                    />
                                    <button
                                        onClick={handleInvite}
                                        disabled={inviting}
                                        className="bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white px-3 rounded-xl transition-all"
                                    >
                                        <UserPlus className="w-4 h-4" />
                                    </button>
                                </div>
                                {inviteError && (
                                    <p className="text-xs text-red-400 mt-1.5">{inviteError}</p>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
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
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
