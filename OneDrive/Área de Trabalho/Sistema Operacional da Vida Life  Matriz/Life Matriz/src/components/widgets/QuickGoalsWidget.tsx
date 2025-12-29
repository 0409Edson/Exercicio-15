'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, Trash2, Target, Sparkles } from 'lucide-react';
import { generateUniqueId } from '@/lib/generateId';

interface QuickGoal {
    id: string;
    text: string;
    completed: boolean;
    createdAt: string;
}

export default function QuickGoalsWidget() {
    const [goals, setGoals] = useState<QuickGoal[]>([]);
    const [newGoal, setNewGoal] = useState('');
    const [showInput, setShowInput] = useState(false);

    useEffect(() => {
        loadGoals();
    }, []);

    useEffect(() => {
        saveGoals();
    }, [goals]);

    const loadGoals = () => {
        const today = new Date().toISOString().split('T')[0];
        const saved = localStorage.getItem('lifeos-quick-goals');

        if (saved) {
            const data = JSON.parse(saved);
            // Only load today's goals
            if (data.date === today) {
                setGoals(data.goals || []);
            } else {
                // New day, clear goals
                setGoals([]);
            }
        }
    };

    const saveGoals = () => {
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem('lifeos-quick-goals', JSON.stringify({
            date: today,
            goals,
        }));
    };

    const addGoal = () => {
        if (!newGoal.trim()) return;

        const goal: QuickGoal = {
            id: generateUniqueId('goal-'),
            text: newGoal.trim(),
            completed: false,
            createdAt: new Date().toISOString(),
        };

        setGoals(prev => [goal, ...prev]);
        setNewGoal('');
        setShowInput(false);
    };

    const toggleGoal = (id: string) => {
        setGoals(prev =>
            prev.map(g => g.id === id ? { ...g, completed: !g.completed } : g)
        );
    };

    const deleteGoal = (id: string) => {
        setGoals(prev => prev.filter(g => g.id !== id));
    };

    const completedCount = goals.filter(g => g.completed).length;
    const progress = goals.length > 0 ? (completedCount / goals.length) * 100 : 0;

    return (
        <motion.div
            className="glass-card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Target size={18} className="text-orange-400" />
                    <h3 className="font-semibold">Metas de Hoje</h3>
                </div>
                <button
                    onClick={() => setShowInput(!showInput)}
                    className="w-8 h-8 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 flex items-center justify-center transition-colors"
                >
                    <Plus size={16} className="text-orange-400" />
                </button>
            </div>

            {/* Progress bar */}
            {goals.length > 0 && (
                <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>{completedCount} de {goals.length} concluídas</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-orange-500 to-yellow-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Add goal input */}
            <AnimatePresence>
                {showInput && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mb-4 overflow-hidden"
                    >
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newGoal}
                                onChange={(e) => setNewGoal(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addGoal()}
                                placeholder="Nova meta para hoje..."
                                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-orange-500/50"
                                autoFocus
                            />
                            <button
                                onClick={addGoal}
                                className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg text-sm transition-colors"
                            >
                                Adicionar
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Goals list */}
            <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                    {goals.map((goal) => (
                        <motion.div
                            key={goal.id}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${goal.completed ? 'bg-green-500/10' : 'bg-white/5 hover:bg-white/10'
                                }`}
                        >
                            <button
                                onClick={() => toggleGoal(goal.id)}
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${goal.completed
                                    ? 'bg-green-500 border-green-500'
                                    : 'border-gray-500 hover:border-orange-400'
                                    }`}
                            >
                                {goal.completed && <Check size={12} className="text-white" />}
                            </button>

                            <span className={`flex-1 text-sm ${goal.completed ? 'line-through text-gray-500' : ''
                                }`}>
                                {goal.text}
                            </span>

                            <button
                                onClick={() => deleteGoal(goal.id)}
                                className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                            >
                                <Trash2 size={14} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {goals.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <Sparkles size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Nenhuma meta para hoje</p>
                        <p className="text-xs mt-1">Clique em + para adicionar</p>
                    </div>
                )}
            </div>

            {/* Celebration */}
            {goals.length > 0 && completedCount === goals.length && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4 p-3 bg-gradient-to-r from-green-500/20 to-teal-500/20 rounded-lg text-center"
                >
                    <p className="text-sm font-medium text-green-400">
                        🎉 Parabéns! Todas as metas concluídas!
                    </p>
                </motion.div>
            )}
        </motion.div>
    );
}
