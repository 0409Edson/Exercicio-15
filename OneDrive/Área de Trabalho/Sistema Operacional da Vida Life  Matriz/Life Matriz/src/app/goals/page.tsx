'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Target,
    Plus,
    ChevronRight,
    Calendar,
    CheckCircle2,
    Circle,
    MoreVertical,
    Sparkles,
    TrendingUp,
    Trash2,
    Edit3
} from 'lucide-react';
import { useLifeOSStore } from '@/lib/store';
import { GoalModal } from '@/components/modals';

const categoryColors: Record<string, string> = {
    career: 'from-blue-500/20 to-blue-600/10 text-blue-400 border-blue-500/30',
    finance: 'from-green-500/20 to-green-600/10 text-green-400 border-green-500/30',
    health: 'from-red-500/20 to-red-600/10 text-red-400 border-red-500/30',
    education: 'from-purple-500/20 to-purple-600/10 text-purple-400 border-purple-500/30',
    personal: 'from-teal-500/20 to-teal-600/10 text-teal-400 border-teal-500/30',
};

const priorityLabels = {
    high: { label: 'Alta', class: 'badge-danger' },
    medium: { label: 'Média', class: 'badge-warning' },
    low: { label: 'Baixa', class: 'badge-info' },
};

export default function GoalsPage() {
    const { goals, toggleSubgoal, deleteGoal } = useLifeOSStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState<typeof goals[0] | null>(null);
    const [menuOpen, setMenuOpen] = useState<string | null>(null);

    const handleEdit = (goal: typeof goals[0]) => {
        setEditingGoal(goal);
        setIsModalOpen(true);
        setMenuOpen(null);
    };

    const handleDelete = (id: string) => {
        if (confirm('Tem certeza que deseja excluir este objetivo?')) {
            deleteGoal(id);
        }
        setMenuOpen(null);
    };

    const handleNewGoal = () => {
        setEditingGoal(null);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Objetivos de Vida</h1>
                    <p className="text-gray-400 mt-1">Defina e rastreie suas metas de longo prazo</p>
                </div>
                <motion.button
                    onClick={handleNewGoal}
                    className="btn-primary flex items-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Plus size={18} />
                    <span>Novo Objetivo</span>
                </motion.button>
            </div>

            {/* Empty State */}
            {goals.length === 0 ? (
                <motion.div
                    className="glass-card p-12 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="w-20 h-20 mx-auto rounded-full bg-teal-500/20 flex items-center justify-center mb-4">
                        <Target size={40} className="text-teal-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Nenhum objetivo definido</h3>
                    <p className="text-gray-400 mb-6 max-w-md mx-auto">
                        Comece definindo seus objetivos de vida. A IA irá te ajudar a alcançá-los de forma organizada.
                    </p>
                    <button onClick={handleNewGoal} className="btn-primary">
                        <Plus size={18} className="mr-2" />
                        Criar primeiro objetivo
                    </button>
                </motion.div>
            ) : (
                <>
                    {/* AI Suggestion */}
                    <motion.div
                        className="glass-card p-4 border-l-4 border-teal-500"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center flex-shrink-0">
                                <Sparkles size={20} className="text-teal-400" />
                            </div>
                            <div>
                                <h4 className="font-semibold">Sugestão da IA</h4>
                                <p className="text-sm text-gray-400 mt-1">
                                    {goals.length > 0 && goals[0].subgoals.some(sg => !sg.completed)
                                        ? `Focando no objetivo "${goals[0].title}", sugiro trabalhar em "${goals[0].subgoals.find(sg => !sg.completed)?.title}" hoje.`
                                        : 'Adicione sub-objetivos aos seus goals para receber sugestões personalizadas.'
                                    }
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Goals Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {goals.map((goal, index) => (
                            <motion.div
                                key={goal.id}
                                className="glass-card p-6 relative"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${categoryColors[goal.category] || categoryColors.personal} border`}>
                                        {goal.category.charAt(0).toUpperCase() + goal.category.slice(1)}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`badge ${priorityLabels[goal.priority].class}`}>
                                            {priorityLabels[goal.priority].label}
                                        </span>
                                        <div className="relative">
                                            <button
                                                className="btn-icon w-8 h-8"
                                                onClick={() => setMenuOpen(menuOpen === goal.id ? null : goal.id)}
                                            >
                                                <MoreVertical size={16} />
                                            </button>
                                            {menuOpen === goal.id && (
                                                <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-white/10 rounded-lg shadow-lg z-10 py-1 min-w-[120px]">
                                                    <button
                                                        onClick={() => handleEdit(goal)}
                                                        className="w-full px-3 py-2 text-left text-sm hover:bg-white/10 flex items-center gap-2"
                                                    >
                                                        <Edit3 size={14} />
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(goal.id)}
                                                        className="w-full px-3 py-2 text-left text-sm hover:bg-white/10 flex items-center gap-2 text-red-400"
                                                    >
                                                        <Trash2 size={14} />
                                                        Excluir
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <h3 className="text-lg font-semibold mb-2">{goal.title}</h3>
                                <p className="text-sm text-gray-400 mb-4">{goal.description}</p>

                                {/* Progress */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-400">Progresso</span>
                                        <span className="text-teal-400 font-medium">{goal.progress}%</span>
                                    </div>
                                    <div className="progress-bar">
                                        <motion.div
                                            className="progress-bar-fill"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${goal.progress}%` }}
                                            transition={{ duration: 0.8 }}
                                        />
                                    </div>
                                </div>

                                {/* Subgoals */}
                                {goal.subgoals.length > 0 && (
                                    <div className="space-y-2 mb-4">
                                        {goal.subgoals.map(subgoal => (
                                            <button
                                                key={subgoal.id}
                                                className="flex items-center gap-2 text-sm w-full text-left hover:bg-white/5 p-1 rounded"
                                                onClick={() => toggleSubgoal(goal.id, subgoal.id)}
                                            >
                                                {subgoal.completed ? (
                                                    <CheckCircle2 size={16} className="text-green-400" />
                                                ) : (
                                                    <Circle size={16} className="text-gray-500" />
                                                )}
                                                <span className={subgoal.completed ? 'text-gray-500 line-through' : ''}>
                                                    {subgoal.title}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <Calendar size={14} />
                                        <span>Prazo: {new Date(goal.deadline).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                    <button
                                        onClick={() => handleEdit(goal)}
                                        className="text-teal-400 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
                                    >
                                        Detalhes <ChevronRight size={14} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}

                        {/* Add New Goal Card */}
                        <motion.div
                            className="glass-card p-6 flex flex-col items-center justify-center min-h-[300px] cursor-pointer border-dashed border-2 border-white/10 hover:border-teal-500/50 transition-colors"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            whileHover={{ scale: 1.01 }}
                            onClick={handleNewGoal}
                        >
                            <div className="w-16 h-16 rounded-full bg-teal-500/20 flex items-center justify-center mb-4">
                                <Plus size={28} className="text-teal-400" />
                            </div>
                            <h3 className="font-semibold text-lg">Novo Objetivo</h3>
                            <p className="text-sm text-gray-400 text-center mt-2">
                                Clique para adicionar um novo objetivo de vida
                            </p>
                        </motion.div>
                    </div>

                    {/* Quick Stats */}
                    <motion.div
                        className="glass-card p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <TrendingUp size={20} className="text-teal-400" />
                            Resumo dos Objetivos
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-white/5 rounded-lg">
                                <p className="text-3xl font-bold text-teal-400">{goals.length}</p>
                                <p className="text-sm text-gray-400">Total</p>
                            </div>
                            <div className="text-center p-4 bg-white/5 rounded-lg">
                                <p className="text-3xl font-bold text-green-400">
                                    {goals.filter(g => g.progress === 100).length}
                                </p>
                                <p className="text-sm text-gray-400">Concluídos</p>
                            </div>
                            <div className="text-center p-4 bg-white/5 rounded-lg">
                                <p className="text-3xl font-bold text-yellow-400">
                                    {goals.filter(g => g.progress > 0 && g.progress < 100).length}
                                </p>
                                <p className="text-sm text-gray-400">Em progresso</p>
                            </div>
                            <div className="text-center p-4 bg-white/5 rounded-lg">
                                <p className="text-3xl font-bold text-purple-400">
                                    {goals.length > 0 ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length) : 0}%
                                </p>
                                <p className="text-sm text-gray-400">Média geral</p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}

            {/* Goal Modal */}
            <GoalModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingGoal(null);
                }}
                editGoal={editingGoal}
            />
        </div>
    );
}
