'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, TrendingDown, Minus, Timer } from 'lucide-react';

interface ProductivityState {
    score: number;
    trend: 'up' | 'down' | 'stable';
    focusMinutes: number;
    status: 'deep_focus' | 'focused' | 'distracted' | 'idle';
    message: string;
}

export default function RealTimeProductivity() {
    const [productivity, setProductivity] = useState<ProductivityState>({
        score: 0,
        trend: 'stable',
        focusMinutes: 0,
        status: 'idle',
        message: 'Iniciando monitoramento...',
    });
    const [pulse, setPulse] = useState(false);

    useEffect(() => {
        calculateProductivity();
        const interval = setInterval(() => {
            calculateProductivity();
            setPulse(true);
            setTimeout(() => setPulse(false), 500);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const calculateProductivity = () => {
        if (typeof window === 'undefined') return;

        const win = window as any;
        const data = win.__activitySummary;

        if (!data) {
            setProductivity({
                score: 0,
                trend: 'stable',
                focusMinutes: 0,
                status: 'idle',
                message: 'Aguardando dados...',
            });
            return;
        }

        const { categoryPercentages, currentApp, categories } = data;
        const productivePercent = categoryPercentages?.productive || 0;
        const focusMinutes = Math.round((categories?.productive || 0) / 60);

        // Determine status based on current app
        let status: ProductivityState['status'] = 'idle';
        let message = '';

        if (currentApp) {
            const app = currentApp.toLowerCase();
            const productiveApps = ['code', 'vscode', 'visual studio', 'word', 'excel', 'notion', 'figma', 'terminal'];
            const distractingApps = ['youtube', 'netflix', 'twitter', 'instagram', 'tiktok', 'discord', 'game'];

            if (productiveApps.some(a => app.includes(a))) {
                status = productivePercent > 70 ? 'deep_focus' : 'focused';
                message = status === 'deep_focus' ? '🔥 Deep Work Mode!' : '💪 Mantendo o foco!';
            } else if (distractingApps.some(a => app.includes(a))) {
                status = 'distracted';
                message = '⚠️ Possível distração detectada';
            } else {
                status = 'focused';
                message = '👍 Trabalhando normalmente';
            }
        } else {
            message = '💤 Sem atividade detectada';
        }

        // Calculate trend (would normally compare with past data)
        const prevScore = productivity.score;
        const trend = productivePercent > prevScore + 5 ? 'up' :
            productivePercent < prevScore - 5 ? 'down' : 'stable';

        setProductivity({
            score: productivePercent,
            trend,
            focusMinutes,
            status,
            message,
        });
    };

    const getStatusColor = () => {
        switch (productivity.status) {
            case 'deep_focus': return 'from-green-500 to-emerald-500';
            case 'focused': return 'from-teal-500 to-cyan-500';
            case 'distracted': return 'from-orange-500 to-red-500';
            default: return 'from-gray-500 to-gray-600';
        }
    };

    const getTrendIcon = () => {
        switch (productivity.trend) {
            case 'up': return <TrendingUp size={14} className="text-green-400" />;
            case 'down': return <TrendingDown size={14} className="text-red-400" />;
            default: return <Minus size={14} className="text-gray-400" />;
        }
    };

    return (
        <motion.div
            className={`glass-card p-4 border-2 ${productivity.status === 'deep_focus' ? 'border-green-500/50' :
                    productivity.status === 'distracted' ? 'border-orange-500/50' :
                        'border-white/10'
                }`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* Animated productivity indicator */}
                    <motion.div
                        className={`w-12 h-12 rounded-full bg-gradient-to-br ${getStatusColor()} flex items-center justify-center`}
                        animate={{
                            scale: pulse ? 1.1 : 1,
                            boxShadow: pulse ? '0 0 20px rgba(20, 184, 166, 0.5)' : '0 0 0px transparent',
                        }}
                        transition={{ duration: 0.3 }}
                    >
                        <Zap size={24} className="text-white" />
                    </motion.div>

                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold">{productivity.score}%</span>
                            {getTrendIcon()}
                        </div>
                        <p className="text-xs text-gray-400">{productivity.message}</p>
                    </div>
                </div>

                {/* Focus time */}
                <div className="text-right">
                    <div className="flex items-center gap-1 text-sm text-teal-400">
                        <Timer size={14} />
                        <span>{productivity.focusMinutes}min</span>
                    </div>
                    <p className="text-xs text-gray-500">Tempo focado</p>
                </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    className={`h-full bg-gradient-to-r ${getStatusColor()}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${productivity.score}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                />
            </div>

            {/* Quick tips */}
            {productivity.status === 'distracted' && (
                <motion.div
                    className="mt-3 p-2 bg-orange-500/10 rounded-lg text-xs text-orange-300"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    💡 Dica: Use a técnica Pomodoro - 25min de foco, 5min de pausa
                </motion.div>
            )}

            {productivity.status === 'deep_focus' && (
                <motion.div
                    className="mt-3 p-2 bg-green-500/10 rounded-lg text-xs text-green-300"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    🎯 Excelente! Continue assim, você está no fluxo!
                </motion.div>
            )}
        </motion.div>
    );
}
