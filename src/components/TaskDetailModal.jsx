'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flag, Calendar, Trash2, Save, AlignLeft } from 'lucide-react';
import axios from '@/lib/axios';

const PRIORITIES = [
    { value: 'low', label: 'Low', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
    { value: 'high', label: 'High', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
];

export default function TaskDetailModal({ task, isOpen, onClose, onUpdate, onDelete }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('medium');
    const [dueDate, setDueDate] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (task) {
            setTitle(task.title || '');
            setDescription(task.description || '');
            setPriority(task.priority || 'medium');
            setDueDate(task.due_date ? task.due_date.split('T')[0] : '');
        }
    }, [task]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await axios.put(`/tasks/${task.id}`, {
                title,
                description: description || null,
                priority,
                due_date: dueDate || null,
            });
            onUpdate(response.data);
            onClose();
        } catch (error) {
            console.error('Failed to update task', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Delete this task permanently?')) return;
        try {
            await axios.delete(`/tasks/${task.id}`);
            onDelete(task.id);
            onClose();
        } catch (error) {
            console.error('Failed to delete task', error);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && task && (
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
                        className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/50">
                            <h2 className="text-lg font-bold text-white">Task Details</h2>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleDelete}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                    title="Delete task"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-all">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-5 space-y-5">
                            {/* Title */}
                            <div>
                                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl py-2.5 px-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <AlignLeft className="w-3.5 h-3.5" /> Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    placeholder="Add a description..."
                                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl py-2.5 px-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                                />
                            </div>

                            {/* Priority */}
                            <div>
                                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <Flag className="w-3.5 h-3.5" /> Priority
                                </label>
                                <div className="flex gap-2">
                                    {PRIORITIES.map((p) => (
                                        <button
                                            key={p.value}
                                            type="button"
                                            onClick={() => setPriority(p.value)}
                                            className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                                                priority === p.value
                                                    ? p.color + ' ring-1 ring-current'
                                                    : 'bg-zinc-800/50 text-zinc-500 border-zinc-800 hover:border-zinc-700'
                                            }`}
                                        >
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Due Date */}
                            <div>
                                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" /> Due Date
                                </label>
                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-zinc-800/50 flex justify-end">
                            <button
                                onClick={handleSave}
                                disabled={saving || !title.trim()}
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
