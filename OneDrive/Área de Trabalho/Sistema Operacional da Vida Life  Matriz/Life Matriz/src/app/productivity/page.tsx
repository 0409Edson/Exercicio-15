'use client';

import { motion } from 'framer-motion';
import { Timer, Zap, Target, Brain, TrendingUp, Calendar } from 'lucide-react';
import { PomodoroTimer } from '@/components/productivity';
import { DailyQuoteWidget, QuickGoalsWidget } from '@/components/widgets';
import { DailyProgress, RealTimeProductivity, AIRecommendations, WeeklyActivityChart } from '@/components/dashboard';

export default function ProductivityPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Timer className="text-teal-400" />
                    Central de Produtividade
                </h1>
                <p className="text-gray-400 mt-1">
                    Ferramentas para maximizar seu foco e performance
                </p>
            </motion.div>

            {/* Real-time productivity status */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <RealTimeProductivity />
            </motion.div>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pomodoro Timer */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <PomodoroTimer />
                </motion.div>

                {/* Quick Goals */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <QuickGoalsWidget />
                </motion.div>
            </div>

            {/* Weekly Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <WeeklyActivityChart />
            </motion.div>

            {/* Secondary grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily Progress */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <DailyProgress />
                </motion.div>

                {/* AI Recommendations */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <AIRecommendations />
                </motion.div>
            </div>

            {/* Daily Quote */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
            >
                <DailyQuoteWidget />
            </motion.div>

            {/* Quick Tips */}
            <motion.div
                className="glass-card p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
            >
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Brain size={18} className="text-purple-400" />
                    Dicas de Produtividade
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-teal-500/10 rounded-lg border border-teal-500/30">
                        <Zap size={24} className="text-teal-400 mb-2" />
                        <h4 className="font-medium text-sm mb-1">Técnica Pomodoro</h4>
                        <p className="text-xs text-gray-400">
                            25 minutos de foco intenso, seguidos de 5 minutos de pausa.
                        </p>
                    </div>
                    <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
                        <Target size={24} className="text-purple-400 mb-2" />
                        <h4 className="font-medium text-sm mb-1">Regra 2-Minutos</h4>
                        <p className="text-xs text-gray-400">
                            Se uma tarefa leva menos de 2 minutos, faça agora.
                        </p>
                    </div>
                    <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/30">
                        <Calendar size={24} className="text-orange-400 mb-2" />
                        <h4 className="font-medium text-sm mb-1">Time Blocking</h4>
                        <p className="text-xs text-gray-400">
                            Agende blocos de tempo para tarefas específicas no calendário.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
