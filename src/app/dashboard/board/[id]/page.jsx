'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import axios from '@/lib/axios';
import { Plus, ArrowLeft, MoreHorizontal, GripVertical, Calendar, Flag, Loader2, Trash2, Check, Pencil, Users } from 'lucide-react';
import TaskDetailModal from '@/components/TaskDetailModal';
import BoardSettingsModal from '@/components/BoardSettingsModal';
import { Settings } from 'lucide-react';
import echo from '@/lib/echo';

const PRIORITY_CONFIG = {
    high: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'High' },
    medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', label: 'Medium' },
    low: { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', label: 'Low' },
};

export default function BoardPage() {
    const { id } = useParams();
    const router = useRouter();
    const [board, setBoard] = useState(null);
    const [columns, setColumns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newTaskCol, setNewTaskCol] = useState(null);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [selectedTask, setSelectedTask] = useState(null);
    const [editingColId, setEditingColId] = useState(null);
    const [editingColName, setEditingColName] = useState('');
    const [addingColumn, setAddingColumn] = useState(false);
    const [newColName, setNewColName] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState([]);



    // Fetch real board data from API
    useEffect(() => {
        const fetchBoard = async () => {
            try {
                const response = await axios.get(`/boards/${id}`);
                setBoard(response.data);
                setColumns(response.data.columns || []);
            } catch (error) {
                console.error('Failed to load board', error);
                router.push('/dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchBoard();
    }, [id, router]);

    // Real-time listeners for all board events
    useEffect(() => {
        if (!board || !echo) return;

        const channel = echo.private(`board.${board.id}`);

        // Task moved
        channel.listen('.task.moved', (e) => {
            setColumns(prevColumns => {
                let taskToMove = null;
                for (const col of prevColumns) {
                    const t = col.tasks.find(t => t.id === e.task_id);
                    if (t) { taskToMove = t; break; }
                }
                if (!taskToMove) return prevColumns;
                return prevColumns.map(col => {
                    if (col.id === e.old_column) return { ...col, tasks: col.tasks.filter(t => t.id !== e.task_id) };
                    if (col.id === e.column_id) {
                        const newTasks = [...col.tasks.filter(t => t.id !== e.task_id), { ...taskToMove, column_id: e.column_id, position: e.position }].sort((a, b) => a.position - b.position);
                        return { ...col, tasks: newTasks };
                    }
                    return col;
                });
            });
        });

        // Task created by another user
        channel.listen('.task.created', (e) => {
            setColumns(prev => prev.map(col => {
                if (col.id === e.column_id) return { ...col, tasks: [...col.tasks, e.task].sort((a, b) => a.position - b.position) };
                return col;
            }));
        });

        // Task updated by another user
        channel.listen('.task.updated', (e) => {
            setColumns(prev => prev.map(col => ({
                ...col,
                tasks: col.tasks.map(t => t.id === e.task.id ? { ...t, ...e.task } : t)
            })));
            setSelectedTask(prev => prev && prev.id === e.task.id ? { ...prev, ...e.task } : prev);
        });

        // Task deleted by another user
        channel.listen('.task.deleted', (e) => {
            setColumns(prev => prev.map(col => ({
                ...col,
                tasks: col.tasks.filter(t => t.id !== e.task_id)
            })));
            setSelectedTask(prev => prev && prev.id === e.task_id ? null : prev);
        });

        // Comment added
        channel.listen('.comment.added', (e) => {
            setSelectedTask(prevTask => {
                if (prevTask && prevTask.id === e.comment.task_id) return { ...prevTask, new_comment: e.comment };
                return prevTask;
            });
        });

        // Presence channel — track who's online
        const presenceChannel = echo.join(`presence-board.${board.id}`);
        presenceChannel.here((users) => setOnlineUsers(users));
        presenceChannel.joining((user) => setOnlineUsers(prev => [...prev.filter(u => u.id !== user.id), user]));
        presenceChannel.leaving((user) => setOnlineUsers(prev => prev.filter(u => u.id !== user.id)));

        return () => {
            channel.stopListening('.task.moved');
            channel.stopListening('.task.created');
            channel.stopListening('.task.updated');
            channel.stopListening('.task.deleted');
            channel.stopListening('.comment.added');
            echo.leave(`board.${board.id}`);
            echo.leave(`presence-board.${board.id}`);
        };
    }, [board]);

    // Drag and Drop handler — saves to API
    const onDragEnd = async (result) => {
        const { source, destination } = result;
        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        const newColumns = columns.map(col => ({ ...col, tasks: [...col.tasks] }));
        const sourceCol = newColumns.find((c) => c.id.toString() === source.droppableId);
        const destCol = newColumns.find((c) => c.id.toString() === destination.droppableId);
        const [movedTask] = sourceCol.tasks.splice(source.index, 1);
        destCol.tasks.splice(destination.index, 0, movedTask);
        setColumns(newColumns);

        // Persist the move to the backend
        try {
            await axios.patch(`/tasks/${movedTask.id}/move`, {
                column_id: parseInt(destination.droppableId),
                position: destination.index + 1,
            });
        } catch (error) {
            console.error('Failed to move task', error);
        }
    };

    // Quick-add task — saves to API
    const handleAddTask = async (colId) => {
        if (!newTaskTitle.trim()) { setNewTaskCol(null); return; }
        try {
            const response = await axios.post(`/columns/${colId}/tasks`, {
                title: newTaskTitle,
                priority: 'medium',
            });
            setColumns(columns.map((col) => {
                if (col.id === colId) {
                    return { ...col, tasks: [...col.tasks, response.data] };
                }
                return col;
            }));
        } catch (error) {
            console.error('Failed to add task', error);
        }
        setNewTaskTitle('');
        setNewTaskCol(null);
    };
    const handleTaskUpdate = (updatedTask) => {
    setColumns(columns.map(col => ({
        ...col,
        tasks: col.tasks.map(t => t.id === updatedTask.id ? updatedTask : t)
    })));
};

    const handleTaskDelete = (taskId) => {
        setColumns(columns.map(col => ({
            ...col,
            tasks: col.tasks.filter(t => t.id !== taskId)
        })));
    };

    // Column Management
    const handleAddColumn = async () => {
        if (!newColName.trim()) { setAddingColumn(false); return; }
        try {
            const response = await axios.post(`/boards/${id}/columns`, { name: newColName });
            setColumns([...columns, { ...response.data, tasks: [] }]);
        } catch (error) {
            console.error('Failed to add column', error);
        }
        setNewColName('');
        setAddingColumn(false);
    };

    const handleRenameColumn = async (colId) => {
        if (!editingColName.trim()) { setEditingColId(null); return; }
        try {
            await axios.put(`/columns/${colId}`, { name: editingColName });
            setColumns(columns.map(col => col.id === colId ? { ...col, name: editingColName } : col));
        } catch (error) {
            console.error('Failed to rename column', error);
        }
        setEditingColId(null);
    };

    const handleDeleteColumn = async (colId) => {
        if (!confirm('Delete this column and all its tasks?')) return;
        try {
            await axios.delete(`/columns/${colId}`);
            setColumns(columns.filter(col => col.id !== colId));
        } catch (error) {
            console.error('Failed to delete column', error);
        }
    };
    const handleBoardUpdate = (updatedBoard) => {
    setBoard(updatedBoard);
};


    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center h-screen bg-zinc-950">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-screen bg-zinc-950 text-white">
            {/* Board Header */}
            <div className="flex items-center gap-4 px-8 py-5 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-sm">
                <button
                    onClick={() => router.push('/dashboard')}
                    className="w-9 h-9 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 flex items-center justify-center transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 text-zinc-400" />
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-bold tracking-tight">{board?.name || 'Board'}</h1>
                    <p className="text-xs text-zinc-500 mt-0.5">{columns.reduce((a, c) => a + c.tasks.length, 0)} tasks across {columns.length} columns</p>
                </div>

                {/* Online Users */}
                {onlineUsers.length > 0 && (
                    <div className="flex items-center gap-1.5">
                        <div className="flex -space-x-2">
                            {onlineUsers.slice(0, 5).map((user, i) => (
                                <div
                                    key={user.id}
                                    className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[11px] font-bold text-white ring-2 ring-zinc-950 relative"
                                    title={`${user.name} (online)`}
                                    style={{ zIndex: 5 - i }}
                                >
                                    {user.name?.charAt(0).toUpperCase()}
                                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-zinc-950" />
                                </div>
                            ))}
                            {onlineUsers.length > 5 && (
                                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-medium text-zinc-400 ring-2 ring-zinc-950">
                                    +{onlineUsers.length - 5}
                                </div>
                            )}
                        </div>
                        <span className="text-[10px] text-zinc-600 ml-1">{onlineUsers.length} online</span>
                    </div>
                )}

                <button
                    onClick={() => setShowSettings(true)}
                    className="w-9 h-9 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 flex items-center justify-center transition-colors"
                    title="Board Settings"
                >
                    <Settings className="w-4 h-4 text-zinc-400" />
                </button>
            </div>

            {/* Columns Container */}
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex-1 flex gap-5 p-6 overflow-x-auto">
                    {columns.map((column) => (
                        <div key={column.id} className="w-80 flex-shrink-0 flex flex-col">
                            {/* Column Header */}
                            <div className="flex items-center justify-between mb-3 px-1">
                                <div className="flex items-center gap-2">
                                    {editingColId === column.id ? (
                                        <div className="flex items-center gap-1">
                                            <input
                                                autoFocus
                                                value={editingColName}
                                                onChange={(e) => setEditingColName(e.target.value)}
                                                onKeyDown={(e) => { if (e.key === 'Enter') handleRenameColumn(column.id); if (e.key === 'Escape') setEditingColId(null); }}
                                                className="bg-zinc-800 border border-zinc-700 rounded-lg py-1 px-2 text-sm text-white focus:outline-none focus:border-indigo-500 w-32"
                                            />
                                            <button onClick={() => handleRenameColumn(column.id)} className="text-green-400 hover:text-green-300"><Check className="w-4 h-4" /></button>
                                        </div>
                                    ) : (
                                        <h3
                                            onDoubleClick={() => { setEditingColId(column.id); setEditingColName(column.name); }}
                                            className="text-sm font-semibold text-zinc-300 cursor-pointer hover:text-white transition-colors"
                                            title="Double-click to rename"
                                        >{column.name}</h3>
                                    )}
                                    <span className="text-xs font-medium text-zinc-600 bg-zinc-800/50 px-2 py-0.5 rounded-full">
                                        {column.tasks.length}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => { setEditingColId(column.id); setEditingColName(column.name); }}
                                        className="text-zinc-600 hover:text-zinc-300 transition-colors"
                                        title="Rename column"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteColumn(column.id)}
                                        className="text-zinc-600 hover:text-red-400 transition-colors"
                                        title="Delete column"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* Droppable Task List */}
                            <Droppable droppableId={column.id.toString()}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`flex-1 rounded-xl p-2 space-y-2 transition-colors min-h-[120px] ${
                                            snapshot.isDraggingOver ? 'bg-indigo-500/5 ring-1 ring-indigo-500/20' : 'bg-zinc-900/30'
                                        }`}
                                    >
                                        {column.tasks.map((task, index) => (
                                            <Draggable key={task.id.toString()} draggableId={task.id.toString()} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        onClick={() => setSelectedTask(task)}
                                                        className={`group bg-zinc-900 border rounded-xl p-3.5 cursor-grab active:cursor-grabbing transition-all ${
                                                            snapshot.isDragging
                                                                ? 'border-indigo-500/50 shadow-xl shadow-indigo-500/10 rotate-[2deg] scale-105'
                                                                : 'border-zinc-800 hover:border-zinc-700'
                                                        }`}
                                                    >
                                                        <div className="flex items-start gap-2">
                                                            <div className="mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <GripVertical className="w-3.5 h-3.5 text-zinc-600" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-zinc-200 leading-snug">{task.title}</p>
                                                                <div className="flex items-center justify-between mt-2.5">
                                                                    <div className="flex items-center gap-2">
                                                                        {task.priority && PRIORITY_CONFIG[task.priority] && (
                                                                            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-md border ${PRIORITY_CONFIG[task.priority].bg} ${PRIORITY_CONFIG[task.priority].color} ${PRIORITY_CONFIG[task.priority].border}`}>
                                                                                <Flag className="w-2.5 h-2.5" />
                                                                                {PRIORITY_CONFIG[task.priority].label}
                                                                            </span>
                                                                        )}
                                                                        {task.due_date && (
                                                                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-zinc-500">
                                                                                <Calendar className="w-2.5 h-2.5" />
                                                                                {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {task.assignee && (
                                                                        <div 
                                                                            className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-[9px] font-bold text-white shadow-sm shrink-0"
                                                                            title={`Assigned to ${task.assignee.name}`}
                                                                        >
                                                                            {task.assignee.name.charAt(0).toUpperCase()}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}

                                        {/* Quick Add Task */}
                                        {newTaskCol === column.id ? (
                                            <div className="p-2">
                                                <input
                                                    autoFocus
                                                    value={newTaskTitle}
                                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddTask(column.id); if (e.key === 'Escape') setNewTaskCol(null); }}
                                                    placeholder="Task title..."
                                                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg py-2 px-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
                                                />
                                                <div className="flex gap-2 mt-2">
                                                    <button onClick={() => handleAddTask(column.id)} className="text-xs font-medium bg-indigo-500 hover:bg-indigo-400 text-white px-3 py-1.5 rounded-lg transition-colors">Add</button>
                                                    <button onClick={() => setNewTaskCol(null)} className="text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors">Cancel</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setNewTaskCol(column.id)}
                                                className="w-full flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-300 p-2 rounded-lg hover:bg-zinc-800/50 transition-all"
                                            >
                                                <Plus className="w-4 h-4" /> Add task
                                            </button>
                                        )}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    ))}

                    {/* Add Column Button */}
                    <div className="w-80 flex-shrink-0">
                        {addingColumn ? (
                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3">
                                <input
                                    autoFocus
                                    value={newColName}
                                    onChange={(e) => setNewColName(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddColumn(); if (e.key === 'Escape') setAddingColumn(false); }}
                                    placeholder="Column name..."
                                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg py-2 px-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 mb-2"
                                />
                                <div className="flex gap-2">
                                    <button onClick={handleAddColumn} className="text-xs font-medium bg-indigo-500 hover:bg-indigo-400 text-white px-3 py-1.5 rounded-lg transition-colors">Add Column</button>
                                    <button onClick={() => setAddingColumn(false)} className="text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors">Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setAddingColumn(true)}
                                className="w-full h-12 rounded-xl border-2 border-dashed border-zinc-800 hover:border-indigo-500/50 bg-zinc-900/20 hover:bg-indigo-500/5 flex items-center justify-center gap-2 text-sm text-zinc-600 hover:text-indigo-400 transition-all"
                            >
                                <Plus className="w-4 h-4" /> Add Column
                            </button>
                        )}
                    </div>
                </div>
            </DragDropContext>

            <TaskDetailModal
                task={selectedTask}
                isOpen={!!selectedTask}
                onClose={() => setSelectedTask(null)}
                onUpdate={handleTaskUpdate}
                onDelete={handleTaskDelete}
                members={board?.members || []}
            />
            <BoardSettingsModal
                board={board}
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                onUpdate={handleBoardUpdate}
            />
        </div>
    );
}
