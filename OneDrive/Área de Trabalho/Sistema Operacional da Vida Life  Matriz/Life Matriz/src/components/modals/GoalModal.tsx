'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2 } from 'lucide-react';
import { useLifeOSStore, Goal } from '@/lib/store';
import { generateUniqueId } from '@/lib/generateId';

interface GoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    editGoal?: Goal | null;
}

const categoryOptions = [
    { id: 'career', label: 'Carreira' },
    { id: 'finance', label: 'Finanças' },
    { id: 'health', label: 'Saúde' },
    { id: 'education', label: 'Educação' },
    { id: 'personal', label: 'Pessoal' },
];

const priorityOptions = [
    { id: 'high', label: 'Alta', color: 'text-red-400' },
    { id: 'medium', label: 'Média', color: 'text-yellow-400' },
    { id: 'low', label: 'Baixa', color: 'text-blue-400' },
];

export default function GoalModal({ isOpen, onClose, editGoal }: GoalModalProps) {
    const { addGoal, updateGoal, user } = useLifeOSStore();

    const [formData, setFormData] = useState<{
        title: string;
        description: string;
        category: 'career' | 'finance' | 'health' | 'education' | 'personal';
        priority: 'high' | 'medium' | 'low';
        deadline: string;
        subgoals: { id: string; title: string; completed: boolean }[];
    }>({
        title: '',
        description: '',
        category: 'personal',
        priority: 'medium',
        deadline: '',
        subgoals: [],
    });

    const [newSubgoal, setNewSubgoal] = useState('');

    useEffect(() => {
        if (editGoal) {
            setFormData({
                title: editGoal.title,
                description: editGoal.description,
                category: editGoal.category,
                priority: editGoal.priority,
                deadline: editGoal.deadline.split('T')[0],
                subgoals: editGoal.subgoals,
            });
        } else {
            setFormData({
                title: '',
                description: '',
                category: 'personal',
                priority: 'medium',
                deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                subgoals: [],
            });
        }
    }, [editGoal, isOpen]);

    const handleAddSubgoal = () => {
        if (!newSubgoal.trim()) return;
        setFormData({
            ...formData,
            subgoals: [
                ...formData.subgoals,
                { id: generateUniqueId('subgoal-'), title: newSubgoal.trim(), completed: false },
            ],
        });
        setNewSubgoal('');
    };

    const handleRemoveSubgoal = (id: string) => {
        setFormData({
            ...formData,
            subgoals: formData.subgoals.filter(sg => sg.id !== id),
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editGoal) {
            updateGoal(editGoal.id, {
                ...formData,
                deadline: formData.deadline,
            });
        } else {
            addGoal({
                userId: user?.id || 'demo-user',
                title: formData.title,
                description: formData.description,
                category: formData.category,
                priority: formData.priority,
                progress: 0,
                deadline: formData.deadline,
                subgoals: formData.subgoals,
            });
        }

        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/10">
                        <h2 className="text-xl font-bold">
                            {editGoal ? 'Editar Objetivo' : 'Novo Objetivo'}
                        </h2>
                        <button onClick={onClose} className="btn-icon">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        {/* Title */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Título *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Ex: Estudar no exterior"
                                className="input-field"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Descrição</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Descreva seu objetivo..."
                                className="input-field resize-none"
                                rows={3}
                            />
                        </div>

                        {/* Category & Priority */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Categoria</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                                    className="input-field"
                                >
                                    {categoryOptions.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Prioridade</label>
                                <select
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                                    className="input-field"
                                >
                                    {priorityOptions.map(p => (
                                        <option key={p.id} value={p.id}>{p.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Deadline */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Prazo</label>
                            <input
                                type="date"
                                value={formData.deadline}
                                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                className="input-field"
                            />
                        </div>

                        {/* Subgoals */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Sub-objetivos</label>
                            <div className="space-y-2 mb-3">
                                {formData.subgoals.map(sg => (
                                    <div key={sg.id} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                                        <span className="flex-1 text-sm">{sg.title}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveSubgoal(sg.id)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newSubgoal}
                                    onChange={(e) => setNewSubgoal(e.target.value)}
                                    placeholder="Adicionar etapa..."
                                    className="input-field flex-1"
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubgoal())}
                                />
                                <button
                                    type="button"
                                    onClick={handleAddSubgoal}
                                    className="btn-secondary"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="flex gap-3 pt-4">
                            <button type="button" onClick={onClose} className="btn-secondary flex-1">
                                Cancelar
                            </button>
                            <button type="submit" className="btn-primary flex-1">
                                {editGoal ? 'Salvar' : 'Criar Objetivo'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
