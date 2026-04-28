'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import axios from '@/lib/axios';
import { Plus, ArrowLeft, MoreHorizontal, GripVertical, Calendar, Flag, Loader2 } from 'lucide-react';
import TaskDetailModal from '@/components/TaskDetailModal';

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
                <div>
                    <h1 className="text-xl font-bold tracking-tight">{board?.name || 'Board'}</h1>
                    <p className="text-xs text-zinc-500 mt-0.5">{columns.reduce((a, c) => a + c.tasks.length, 0)} tasks across {columns.length} columns</p>
                </div>
            </div>

            {/* Columns Container */}
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex-1 flex gap-5 p-6 overflow-x-auto">
                    {columns.map((column) => (
                        <div key={column.id} className="w-80 flex-shrink-0 flex flex-col">
                            {/* Column Header */}
                            <div className="flex items-center justify-between mb-3 px-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-semibold text-zinc-300">{column.name}</h3>
                                    <span className="text-xs font-medium text-zinc-600 bg-zinc-800/50 px-2 py-0.5 rounded-full">
                                        {column.tasks.length}
                                    </span>
                                </div>
                                <button className="text-zinc-600 hover:text-zinc-300 transition-colors">
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>
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
                                                                <div className="flex items-center gap-2 mt-2.5">
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
                    <TaskDetailModal
    task={selectedTask}
    isOpen={!!selectedTask}
    onClose={() => setSelectedTask(null)}
    onUpdate={handleTaskUpdate}
    onDelete={handleTaskDelete}
/>
                </div>
            </DragDropContext>
        </div>
    );
}
