'use client';

import { motion } from 'framer-motion';
import {
    Wallet,
    TrendingUp,
    TrendingDown,
    PiggyBank,
    CreditCard,
    DollarSign,
    ArrowUpRight,
    ArrowDownLeft,
    BarChart3,
    Target
} from 'lucide-react';

export default function FinancePage() {
    const stats = {
        balance: 12450.00,
        income: 8500.00,
        expenses: 4230.00,
        savings: 1500.00,
        investiments: 15600.00,
    };

    const transactions = [
        { id: '1', title: 'Salário', amount: 6500, type: 'income', date: '24/12' },
        { id: '2', title: 'Freelance - Design', amount: 2000, type: 'income', date: '22/12' },
        { id: '3', title: 'Aluguel', amount: -1800, type: 'expense', date: '20/12' },
        { id: '4', title: 'Mercado', amount: -450, type: 'expense', date: '19/12' },
        { id: '5', title: 'Streaming', amount: -89, type: 'expense', date: '18/12' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">Finanças</h1>
                <p className="text-gray-400 mt-1">Gerencie sua renda, gastos e investimentos</p>
            </div>

            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                    className="glass-card p-5"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center">
                            <DollarSign size={24} className="text-teal-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Saldo Atual</p>
                            <p className="text-2xl font-bold">R$ {stats.balance.toLocaleString('pt-BR')}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="glass-card p-5"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                            <TrendingUp size={24} className="text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Receitas</p>
                            <p className="text-2xl font-bold text-green-400">+R$ {stats.income.toLocaleString('pt-BR')}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="glass-card p-5"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                            <TrendingDown size={24} className="text-red-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Despesas</p>
                            <p className="text-2xl font-bold text-red-400">-R$ {stats.expenses.toLocaleString('pt-BR')}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="glass-card p-5"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                            <PiggyBank size={24} className="text-purple-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Poupança Mensal</p>
                            <p className="text-2xl font-bold text-purple-400">R$ {stats.savings.toLocaleString('pt-BR')}</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Charts & Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfico placeholder */}
                <motion.div
                    className="glass-card p-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-semibold">Fluxo Mensal</h3>
                        <select className="bg-white/10 border border-white/10 rounded-lg px-3 py-1 text-sm">
                            <option>Dezembro</option>
                            <option>Novembro</option>
                        </select>
                    </div>
                    <div className="h-48 flex items-center justify-center bg-white/5 rounded-lg">
                        <div className="text-center text-gray-500">
                            <BarChart3 size={48} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Gráfico de fluxo financeiro</p>
                            <p className="text-xs">(Em desenvolvimento)</p>
                        </div>
                    </div>
                </motion.div>

                {/* Recent Transactions */}
                <motion.div
                    className="glass-card p-6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h3 className="font-semibold mb-4">Transações Recentes</h3>
                    <div className="space-y-3">
                        {transactions.map((t, i) => (
                            <motion.div
                                key={t.id}
                                className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${t.type === 'income' ? 'bg-green-500/20' : 'bg-red-500/20'
                                        }`}>
                                        {t.type === 'income' ? (
                                            <ArrowDownLeft size={16} className="text-green-400" />
                                        ) : (
                                            <ArrowUpRight size={16} className="text-red-400" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium">{t.title}</p>
                                        <p className="text-xs text-gray-500">{t.date}</p>
                                    </div>
                                </div>
                                <span className={`font-semibold ${t.amount > 0 ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                    {t.amount > 0 ? '+' : ''}R$ {Math.abs(t.amount).toLocaleString('pt-BR')}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Meta financeira */}
            <motion.div
                className="glass-card p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <div className="flex items-center gap-3 mb-4">
                    <Target size={20} className="text-teal-400" />
                    <h3 className="font-semibold">Meta: Atingir €4.000/mês</h3>
                </div>
                <div className="mb-2 flex justify-between text-sm">
                    <span className="text-gray-400">Progresso</span>
                    <span className="text-teal-400">R$ 8.500 / R$ 16.500 (€4.000)</span>
                </div>
                <div className="progress-bar h-3">
                    <motion.div
                        className="progress-bar-fill"
                        initial={{ width: 0 }}
                        animate={{ width: '52%' }}
                        transition={{ duration: 1 }}
                    />
                </div>
                <p className="text-sm text-gray-400 mt-2">
                    Você está a R$8.000 de atingir sua meta. A IA sugere aumentar freelas em 2 projetos/mês.
                </p>
            </motion.div>
        </div>
    );
}
