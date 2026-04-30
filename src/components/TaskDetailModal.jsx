'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flag, Calendar, Trash2, Save, AlignLeft, MessageSquare, Send, Loader2, CheckCircle2, Circle, Trash, ListTodo, Plus } from 'lucide-react';
import axios from '@/lib/axios';
import { useAuth } from '@/store/useAuth';

const PRIORITIES = [
    { value: 'low', label: 'Low', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
    { value: 'high', label: 'High', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
];

export default function TaskDetailModal({ task, isOpen, onClose, onUpdate, onDelete, members }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('medium');
    const [dueDate, setDueDate] = useState('');
    const [assignedTo, setAssignedTo] = useState(null);
    const [saving, setSaving] = useState(false);
    
    // Checklist state
    const [checklist, setChecklist] = useState([]);
    const [newItemTitle, setNewItemTitle] = useState('');
    const [addingItem, setAddingItem] = useState(false);
    
    // Comments state
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);
    const [postingComment, setPostingComment] = useState(false);
    const commentsEndRef = useRef(null);

    useEffect(() => {
        if (task) {
            setTitle(task.title || '');
            setDescription(task.description || '');
            setPriority(task.priority || 'medium');
            setDueDate(task.due_date ? task.due_date.split('T')[0] : '');
            setAssignedTo(task.assigned_to || null);
            setChecklist(task.checklist_items || []);
            
            // Fetch comments
            const fetchComments = async () => {
                try {
                    setLoadingComments(true);
                    const res = await axios.get(`/tasks/${task.id}/comments`);
                    setComments(res.data);
                } catch (error) {
                    console.error('Failed to fetch comments', error);
                } finally {
                    setLoadingComments(false);
                }
            };
            fetchComments();
        }
    }, [task]);

    // Expose comments state to parent so it can inject real-time updates
    useEffect(() => {
        if (task && onUpdate && task.new_comment) {
            // Save a reference before deleting it
            const incomingComment = task.new_comment;
            
            // If parent passes a new comment via task object updates
            // (We will handle this via board page listening)
            setComments(prev => {
                if (prev.find(c => c.id === incomingComment.id)) return prev;
                return [...prev, incomingComment];
            });
            
            // Clear the trigger
            delete task.new_comment;
        }
    }, [task, onUpdate]);

    useEffect(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [comments]);

    const handlePostComment = async () => {
        if (!newComment.trim()) return;
        setPostingComment(true);
        try {
            const res = await axios.post(`/tasks/${task.id}/comments`, { body: newComment });
            setComments(prev => [...prev, res.data]);
            setNewComment('');
        } catch (error) {
            console.error('Failed to post comment', error);
        } finally {
            setPostingComment(false);
        }
    };
    
    const handleDeleteComment = async (commentId) => {
        try {
            await axios.delete(`/comments/${commentId}`);
            setComments(prev => prev.filter(c => c.id !== commentId));
        } catch (error) {
            console.error('Failed to delete comment', error);
        }
    };

    // Checklist functions
    const handleAddChecklistItem = async (e) => {
        if (e) e.preventDefault();
        if (!newItemTitle.trim()) return;
        
        try {
            setAddingItem(true);
            const res = await axios.post(`/tasks/${task.id}/checklist`, { title: newItemTitle });
            setChecklist(prev => [...prev, res.data]);
            setNewItemTitle('');
        } catch (error) {
            console.error('Failed to add checklist item', error);
        } finally {
            setAddingItem(false);
        }
    };

    const handleToggleChecklistItem = async (item) => {
        const originalStatus = item.is_completed;
        // Optimistic update
        setChecklist(prev => prev.map(i => i.id === item.id ? { ...i, is_completed: !originalStatus } : i));
        
        try {
            await axios.put(`/checklist/${item.id}`, { is_completed: !originalStatus });
        } catch (error) {
            // Revert on failure
            setChecklist(prev => prev.map(i => i.id === item.id ? { ...i, is_completed: originalStatus } : i));
            console.error('Failed to toggle checklist item', error);
        }
    };

    const handleDeleteChecklistItem = async (id) => {
        try {
            await axios.delete(`/checklist/${id}`);
            setChecklist(prev => prev.filter(i => i.id !== id));
        } catch (error) {
            console.error('Failed to delete checklist item', error);
        }
    };

    const completedCount = checklist.filter(i => i.is_completed).length;
    const totalCount = checklist.length;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await axios.put(`/tasks/${task.id}`, {
                title,
                description: description || null,
                priority,
                due_date: dueDate || null,
                assigned_to: assignedTo,
            });
            onUpdate({ ...response.data, checklist_items: checklist });
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
                        className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
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
                        <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
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

                            {/* Checklist Section */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                                        <ListTodo className="w-3.5 h-3.5" /> Checklist
                                    </label>
                                    {totalCount > 0 && (
                                        <span className="text-[10px] font-medium text-zinc-500">
                                            {completedCount}/{totalCount} ({Math.round(progress)}%)
                                        </span>
                                    )}
                                </div>
                                
                                {totalCount > 0 && (
                                    <div className="w-full bg-zinc-800 h-1 rounded-full mb-4 overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            className="h-full bg-indigo-500"
                                        />
                                    </div>
                                )}

                                <div className="space-y-2 mb-4">
                                    {checklist.map((item) => (
                                        <div key={item.id} className="group flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800/30 transition-colors">
                                            <button 
                                                onClick={() => handleToggleChecklistItem(item)}
                                                className={`shrink-0 transition-colors ${item.is_completed ? 'text-indigo-500' : 'text-zinc-600 hover:text-zinc-400'}`}
                                            >
                                                {item.is_completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                                            </button>
                                            <span className={`flex-1 text-sm transition-all ${item.is_completed ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                                                {item.title}
                                            </span>
                                            <button 
                                                onClick={() => handleDeleteChecklistItem(item.id)}
                                                className="opacity-0 group-hover:opacity-100 p-1 text-zinc-600 hover:text-red-400 transition-all"
                                            >
                                                <Trash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <form onSubmit={handleAddChecklistItem} className="relative group">
                                    <input 
                                        type="text"
                                        value={newItemTitle}
                                        onChange={(e) => setNewItemTitle(e.target.value)}
                                        placeholder="Add a subtask..."
                                        className="w-full bg-zinc-950/30 border border-zinc-800 rounded-xl py-2 pl-4 pr-10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition-all"
                                    />
                                    <button 
                                        type="submit"
                                        disabled={addingItem || !newItemTitle.trim()}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-zinc-500 hover:text-indigo-400 disabled:opacity-0 transition-all"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </form>
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

                            {/* Assign To */}
                            <div>
                                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    Assign To
                                </label>
                                <select
                                    value={assignedTo || ''}
                                    onChange={(e) => setAssignedTo(e.target.value ? parseInt(e.target.value) : null)}
                                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                >
                                    <option value="">Unassigned</option>
                                    {(members || []).map((m) => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <hr className="border-zinc-800/50 my-6" />

                            {/* Comments Section */}
                            <div>
                                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                                    <MessageSquare className="w-3.5 h-3.5" /> Team Chat & Comments
                                </label>
                                
                                <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-4 flex flex-col h-64">
                                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                                        {loadingComments ? (
                                            <div className="flex justify-center items-center h-full">
                                                <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                                            </div>
                                        ) : comments.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-2">
                                                <MessageSquare className="w-8 h-8 opacity-20" />
                                                <p className="text-sm">No comments yet. Start the conversation!</p>
                                            </div>
                                        ) : (
                                            comments.map((comment) => (
                                                <div key={comment.id} className={`flex gap-3 ${comment.user_id === user?.id ? 'flex-row-reverse' : ''}`}>
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-lg shadow-indigo-500/20">
                                                        {comment.user?.name ? comment.user.name.charAt(0).toUpperCase() : '?'}
                                                    </div>
                                                    <div className={`flex flex-col max-w-[80%] ${comment.user_id === user?.id ? 'items-end' : 'items-start'}`}>
                                                        <div className="flex items-baseline gap-2 mb-1">
                                                            <span className="text-xs font-medium text-zinc-300">
                                                                {comment.user_id === user?.id ? 'You' : (comment.user?.name || 'Unknown')}
                                                            </span>
                                                            <span className="text-[10px] text-zinc-600">
                                                                {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                                            comment.user_id === user?.id 
                                                                ? 'bg-indigo-500 text-white rounded-tr-sm shadow-md shadow-indigo-500/10' 
                                                                : 'bg-zinc-800 text-zinc-200 rounded-tl-sm'
                                                        }`}>
                                                            {comment.body}
                                                        </div>
                                                        {comment.user_id === user?.id && (
                                                            <button 
                                                                onClick={() => handleDeleteComment(comment.id)}
                                                                className="text-[10px] text-zinc-600 hover:text-red-400 mt-1 mr-1 transition-colors"
                                                            >
                                                                Delete
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                        <div ref={commentsEndRef} />
                                    </div>
                                    
                                    <div className="mt-4 flex gap-2">
                                        <input
                                            type="text"
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') handlePostComment(); }}
                                            placeholder="Type a message..."
                                            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl py-2 px-4 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                                        />
                                        <button
                                            onClick={handlePostComment}
                                            disabled={postingComment || !newComment.trim()}
                                            className="w-10 h-10 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white flex items-center justify-center transition-colors shadow-lg shadow-indigo-500/25 shrink-0"
                                        >
                                            {postingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
                                        </button>
                                    </div>
                                </div>
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
