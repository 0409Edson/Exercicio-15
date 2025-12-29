'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useLifeOSStore, Task } from '@/lib/store';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    editTask?: Task | null;
    selectedDate?: string;
}

const typeOptions = [
    { id: 'task', label: 'Tarefa', color: 'bg-teal-500' },
    { id: 'meeting', label: 'Reunião', color: 'bg-purple-500' },
    { id: 'focus', label: 'Foco', color: 'bg-blue-500' },
    { id: 'break', label: 'Pausa', color: 'bg-green-500' },
    { id: 'personal', label: 'Pessoal', color: 'bg-yellow-500' },
];

const energyOptions = [
    { id: 'high', label: 'Alta - preciso de foco' },
    { id: 'medium', label: 'Média - normal' },
    { id: 'low', label: 'Baixa - posso relaxar' },
];

export default function TaskModal({ isOpen, onClose, editTask, selectedDate }: TaskModalProps) {
    const { addTask, updateTask, user, goals } = useLifeOSStore();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        time: '09:00',
        duration: '1h',
        type: 'task' as const,
        energy: 'medium' as const,
        goalId: '',
    });

    useEffect(() => {
        if (editTask) {
            setFormData({
                title: editTask.title,
                description: editTask.description || '',
                date: editTask.date,
                time: editTask.time,
                duration: editTask.duration,
                type: editTask.type,
                energy: editTask.energy,
                goalId: editTask.goalId || '',
            });
        } else {
            setFormData({
                title: '',
                description: '',
                date: selectedDate || new Date().toISOString().split('T')[0],
                time: '09:00',
                duration: '1h',
                type: 'task',
                energy: 'medium',
                goalId: '',
            });
        }
    }, [editTask, selectedDate, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editTask) {
            updateTask(editTask.id, formData);
        } else {
            addTask({
                userId: user?.id || 'demo-user',
                ...formData,
                completed: false,
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
                    className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-lg"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/10">
                        <h2 className="text-xl font-bold">
                            {editTask ? 'Editar Tarefa' : 'Nova Tarefa'}
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
                                placeholder="Ex: Estudar React"
                                className="input-field"
                                required
                            />
                        </div>

                        {/* Type Selection */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Tipo</label>
                            <div className="flex flex-wrap gap-2">
                                {typeOptions.map(type => (
                                    <button
                                        key={type.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: type.id as any })}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${formData.type === type.id
                                                ? `${type.color} text-white`
                                                : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                            }`}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Date, Time, Duration */}
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Data</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Hora</label>
                                <input
                                    type="time"
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Duração</label>
                                <select
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="15min">15 min</option>
                                    <option value="30min">30 min</option>
                                    <option value="1h">1 hora</option>
                                    <option value="1h30">1h 30min</option>
                                    <option value="2h">2 horas</option>
                                    <option value="3h">3 horas</option>
                                </select>
                            </div>
                        </div>

                        {/* Energy Level */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Nível de energia necessário</label>
                            <select
                                value={formData.energy}
                                onChange={(e) => setFormData({ ...formData, energy: e.target.value as any })}
                                className="input-field"
                            >
                                {energyOptions.map(e => (
                                    <option key={e.id} value={e.id}>{e.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Link to Goal */}
                        {goals.length > 0 && (
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Vincular a objetivo (opcional)</label>
                                <select
                                    value={formData.goalId}
                                    onChange={(e) => setFormData({ ...formData, goalId: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="">Nenhum</option>
                                    {goals.map(goal => (
                                        <option key={goal.id} value={goal.id}>{goal.title}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Description */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Notas (opcional)</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Anotações sobre esta tarefa..."
                                className="input-field resize-none"
                                rows={2}
                            />
                        </div>

                        {/* Submit */}
                        <div className="flex gap-3 pt-4">
                            <button type="button" onClick={onClose} className="btn-secondary flex-1">
                                Cancelar
                            </button>
                            <button type="submit" className="btn-primary flex-1">
                                {editTask ? 'Salvar' : 'Criar Tarefa'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
