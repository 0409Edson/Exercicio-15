'use client';

import { motion } from 'framer-motion';
import {
    Heart,
    Activity,
    Droplets,
    Moon,
    Apple,
    Brain,
    Smile,
    TrendingUp,
    Clock,
    Zap
} from 'lucide-react';

export default function HealthPage() {
    const healthData = {
        sleepHours: 7.2,
        waterIntake: 1.8,
        steps: 6543,
        stepsGoal: 10000,
        calories: 1850,
        mood: 'good',
        stressLevel: 35,
    };

    const moodEmojis = {
        excellent: '😄',
        good: '🙂',
        neutral: '😐',
        bad: '😔',
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">Saúde & Bem-estar</h1>
                <p className="text-gray-400 mt-1">Monitore sua saúde física e mental</p>
            </div>

            {/* Mood & Energy */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                    className="glass-card p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Smile size={20} className="text-yellow-400" />
                        Como você está hoje?
                    </h3>
                    <div className="flex justify-around">
                        {Object.entries(moodEmojis).map(([mood, emoji]) => (
                            <button
                                key={mood}
                                className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl transition-all ${healthData.mood === mood
                                        ? 'bg-teal-500/30 ring-2 ring-teal-500 scale-110'
                                        : 'bg-white/5 hover:bg-white/10'
                                    }`}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                    <p className="text-center text-sm text-gray-400 mt-4">
                        Você está se sentindo <span className="text-teal-400">bem</span> hoje!
                    </p>
                </motion.div>

                <motion.div
                    className="glass-card p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Brain size={20} className="text-purple-400" />
                        Nível de Estresse
                    </h3>
                    <div className="relative h-4 bg-white/10 rounded-full overflow-hidden mb-3">
                        <motion.div
                            className="h-full rounded-full"
                            style={{
                                background: healthData.stressLevel < 40
                                    ? 'linear-gradient(90deg, #22c55e, #86efac)'
                                    : healthData.stressLevel < 70
                                        ? 'linear-gradient(90deg, #eab308, #fde047)'
                                        : 'linear-gradient(90deg, #ef4444, #fca5a5)',
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${healthData.stressLevel}%` }}
                            transition={{ duration: 1 }}
                        />
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Relaxado</span>
                        <span className="text-green-400 font-medium">{healthData.stressLevel}% - Baixo</span>
                        <span className="text-gray-400">Estressado</span>
                    </div>
                </motion.div>
            </div>

            {/* Health Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div
                    className="glass-card p-5 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                >
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mx-auto mb-3">
                        <Moon size={24} className="text-blue-400" />
                    </div>
                    <p className="text-2xl font-bold">{healthData.sleepHours}h</p>
                    <p className="text-sm text-gray-400">Sono</p>
                    <p className="text-xs text-green-400 mt-1">↑ Dentro da meta</p>
                </motion.div>

                <motion.div
                    className="glass-card p-5 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mx-auto mb-3">
                        <Droplets size={24} className="text-cyan-400" />
                    </div>
                    <p className="text-2xl font-bold">{healthData.waterIntake}L</p>
                    <p className="text-sm text-gray-400">Água</p>
                    <p className="text-xs text-yellow-400 mt-1">Faltam 0.7L</p>
                </motion.div>

                <motion.div
                    className="glass-card p-5 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                >
                    <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center mx-auto mb-3">
                        <Activity size={24} className="text-orange-400" />
                    </div>
                    <p className="text-2xl font-bold">{healthData.steps.toLocaleString()}</p>
                    <p className="text-sm text-gray-400">Passos</p>
                    <p className="text-xs text-gray-500 mt-1">Meta: {healthData.stepsGoal.toLocaleString()}</p>
                </motion.div>

                <motion.div
                    className="glass-card p-5 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center mx-auto mb-3">
                        <Apple size={24} className="text-red-400" />
                    </div>
                    <p className="text-2xl font-bold">{healthData.calories}</p>
                    <p className="text-sm text-gray-400">Calorias</p>
                    <p className="text-xs text-green-400 mt-1">Balanceado</p>
                </motion.div>
            </div>

            {/* AI Recommendations */}
            <motion.div
                className="glass-card p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Zap size={20} className="text-teal-400" />
                    Recomendações da IA
                </h3>
                <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                        <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                            <TrendingUp size={16} className="text-green-400" />
                        </div>
                        <div>
                            <p className="font-medium">Ótimo ritmo de sono!</p>
                            <p className="text-sm text-gray-400">Continue dormindo entre 7-8h para manter sua produtividade.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                        <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                            <Droplets size={16} className="text-yellow-400" />
                        </div>
                        <div>
                            <p className="font-medium">Beba mais água!</p>
                            <p className="text-sm text-gray-400">Você está a 700ml da meta. Lembrete: beber água às 15:00.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                            <Clock size={16} className="text-purple-400" />
                        </div>
                        <div>
                            <p className="font-medium">Pausa recomendada</p>
                            <p className="text-sm text-gray-400">Você está focado há 2h. Uma pausa de 10min às 16:30 ajudará.</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
