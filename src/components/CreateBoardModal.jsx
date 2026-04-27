'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Palette, LayoutTemplate } from 'lucide-react';

const COLORS = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
    '#f97316', '#eab308', '#22c55e', '#14b8a6',
    '#06b6d4', '#3b82f6',
];

export default function CreateBoardModal({ isOpen, onClose, onCreate }) {
    const [name, setName] = useState('');
    const [selectedColor, setSelectedColor] = useState(COLORS[0]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        onCreate({ name, bg_color: selectedColor });
        setName('');
        setSelectedColor(COLORS[0]);
        onClose();
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
                        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                                    <LayoutTemplate className="w-5 h-5 text-indigo-400" />
                                </div>
                                <h2 className="text-xl font-bold text-white">New Board</h2>
                            </div>
                            <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Board Name */}
                            <div>
                                <label className="text-sm font-medium text-zinc-400 mb-2 block">Board Name</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Sprint Planning"
                                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl py-3 px-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                    autoFocus
                                />
                            </div>

                            {/* Color Picker */}
                            <div>
                                <label className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
                                    <Palette className="w-4 h-4" /> Board Color
                                </label>
                                <div className="flex gap-2 flex-wrap">
                                    {COLORS.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setSelectedColor(color)}
                                            className="w-8 h-8 rounded-full transition-all duration-200"
                                            style={{
                                                backgroundColor: color,
                                                outline: selectedColor === color ? '2px solid white' : 'none',
                                                outlineOffset: '2px',
                                                transform: selectedColor === color ? 'scale(1.15)' : 'scale(1)',
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Preview */}
                            <div
                                className="h-20 rounded-xl flex items-center justify-center transition-colors"
                                style={{ backgroundColor: selectedColor + '20', borderColor: selectedColor + '40', borderWidth: '1px' }}
                            >
                                <span className="text-sm font-semibold" style={{ color: selectedColor }}>
                                    {name || 'Board Preview'}
                                </span>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-medium py-3 px-4 rounded-xl transition-all shadow-lg shadow-indigo-500/25"
                            >
                                Create Board
                            </button>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
