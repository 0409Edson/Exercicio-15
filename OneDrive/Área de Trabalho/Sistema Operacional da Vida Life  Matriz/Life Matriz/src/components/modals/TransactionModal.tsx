'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useLifeOSStore, Transaction } from '@/lib/store';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const categories = {
    income: [
        'Salário',
        'Freelance',
        'Investimentos',
        'Vendas',
        'Outros',
    ],
    expense: [
        'Moradia',
        'Alimentação',
        'Transporte',
        'Lazer',
        'Saúde',
        'Educação',
        'Compras',
        'Assinaturas',
        'Outros',
    ],
};

export default function TransactionModal({ isOpen, onClose }: TransactionModalProps) {
    const { addTransaction, user } = useLifeOSStore();

    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        type: 'expense' as 'income' | 'expense',
        category: 'Outros',
        date: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        if (isOpen) {
            setFormData({
                title: '',
                amount: '',
                type: 'expense',
                category: 'Outros',
                date: new Date().toISOString().split('T')[0],
            });
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const amount = parseFloat(formData.amount);
        if (isNaN(amount)) return;

        addTransaction({
            userId: user?.id || 'demo-user',
            title: formData.title,
            amount: formData.type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
            type: formData.type,
            category: formData.category,
            date: formData.date,
        });

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
                    className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-md"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/10">
                        <h2 className="text-xl font-bold">Nova Transação</h2>
                        <button onClick={onClose} className="btn-icon">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        {/* Type Toggle */}
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: 'income', category: 'Outros' })}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${formData.type === 'income'
                                        ? 'bg-green-500 text-white'
                                        : 'bg-white/10 text-gray-400 hover:bg-white/20'
                                    }`}
                            >
                                <ArrowDownLeft size={18} />
                                Receita
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: 'expense', category: 'Outros' })}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${formData.type === 'expense'
                                        ? 'bg-red-500 text-white'
                                        : 'bg-white/10 text-gray-400 hover:bg-white/20'
                                    }`}
                            >
                                <ArrowUpRight size={18} />
                                Despesa
                            </button>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Descrição *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Ex: Salário, Mercado, Netflix..."
                                className="input-field"
                                required
                            />
                        </div>

                        {/* Amount */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Valor (R$) *</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                placeholder="0,00"
                                className="input-field text-2xl font-bold"
                                required
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Categoria</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="input-field"
                            >
                                {categories[formData.type].map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Date */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Data</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="input-field"
                            />
                        </div>

                        {/* Submit */}
                        <div className="flex gap-3 pt-4">
                            <button type="button" onClick={onClose} className="btn-secondary flex-1">
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className={`flex-1 font-semibold py-3 rounded-lg transition-all ${formData.type === 'income'
                                        ? 'bg-green-500 hover:bg-green-600 text-white'
                                        : 'bg-red-500 hover:bg-red-600 text-white'
                                    }`}
                            >
                                Adicionar {formData.type === 'income' ? 'Receita' : 'Despesa'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
