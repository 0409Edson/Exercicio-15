'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Clock,
    TrendingUp,
    Target,
    Zap,
    Award,
    BarChart3
} from 'lucide-react';

interface DailyStats {
    focusTime: number;
    tasksCompleted: number;
    habitsCompleted: number;
    productivityScore: number;
    streak: number;
}

export default function DailyProgress() {
    const [stats, setStats] = useState<DailyStats>({
        focusTime: 0,
        tasksCompleted: 0,
        habitsCompleted: 0,
        productivityScore: 0,
        streak: 0,
    });

    useEffect(() => {
        calculateStats();
        const interval = setInterval(calculateStats, 30000);
        return () => clearInterval(interval);
    }, []);

    const calculateStats = () => {
        let focusTime = 0;
        let tasksCompleted = 0;
        let habitsCompleted = 0;
        let productivityScore = 0;

        // Get activity data
        if (typeof window !== 'undefined') {
            const win = window as any;
            if (win.__activitySummary) {
                const data = win.__activitySummary;
                focusTime = data.categories?.productive || 0;
                productivityScore = data.categoryPercentages?.productive || 0;
            }
        }

        // Get goals data
        try {
            const goalsData = localStorage.getItem('goals-store');
            if (goalsData) {
                const goals = JSON.parse(goalsData);
                const today = new Date().toISOString().split('T')[0];
                tasksCompleted = goals.state?.goals?.filter((g: any) =>
                    g.status === 'completed' && g.updatedAt?.startsWith(today)
                ).length || 0;
            }
        } catch (e) { }

        // Get habits data
        try {
            const habitsData = localStorage.getItem('habit-store');
            if (habitsData) {
                const habits = JSON.parse(habitsData);
                const today = new Date().toISOString().split('T')[0];
                habitsCompleted = habits.state?.habits?.filter((h: any) =>
                    h.completedDates?.includes(today)
                ).length || 0;
            }
        } catch (e) { }

        // Calculate streak
        let streak = 0;
        try {
            const streakData = localStorage.getItem('lifeos-streak');
            if (streakData) {
                streak = parseInt(streakData) || 0;
            }
            // Update streak if first visit today
            const lastVisit = localStorage.getItem('lifeos-last-visit');
            const today = new Date().toISOString().split('T')[0];
            if (lastVisit !== today) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];

                if (lastVisit === yesterdayStr) {
                    streak++;
                } else if (lastVisit !== today) {
                    streak = 1;
                }
                localStorage.setItem('lifeos-streak', streak.toString());
                localStorage.setItem('lifeos-last-visit', today);
            }
        } catch (e) { }

        setStats({
            focusTime: Math.round(focusTime / 60), // Convert to minutes
            tasksCompleted,
            habitsCompleted,
            productivityScore,
            streak,
        });
    };

    const formatTime = (minutes: number) => {
        if (minutes < 60) return `${minutes}min`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    return (
        <motion.div
            className="glass-card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                    <BarChart3 size={18} className="text-teal-400" />
                    Progresso de Hoje
                </h3>
                {stats.streak > 0 && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 rounded-full">
                        <Zap size={14} className="text-orange-400" />
                        <span className="text-xs font-medium text-orange-400">{stats.streak} dias</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Focus Time */}
                <div className="p-4 bg-blue-500/10 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock size={16} className="text-blue-400" />
                        <span className="text-xs text-gray-400">Tempo Focado</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-400">{formatTime(stats.focusTime)}</p>
                </div>

                {/* Productivity Score */}
                <div className="p-4 bg-green-500/10 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={16} className="text-green-400" />
                        <span className="text-xs text-gray-400">Produtividade</span>
                    </div>
                    <p className="text-2xl font-bold text-green-400">{stats.productivityScore}%</p>
                </div>

                {/* Tasks */}
                <div className="p-4 bg-purple-500/10 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <Target size={16} className="text-purple-400" />
                        <span className="text-xs text-gray-400">Tarefas</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-400">{stats.tasksCompleted}</p>
                </div>

                {/* Habits */}
                <div className="p-4 bg-orange-500/10 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <Award size={16} className="text-orange-400" />
                        <span className="text-xs text-gray-400">Hábitos</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-400">{stats.habitsCompleted}</p>
                </div>
            </div>

            {/* Motivation */}
            {stats.productivityScore >= 50 && (
                <motion.div
                    className="mt-4 p-3 bg-gradient-to-r from-teal-500/20 to-purple-500/20 rounded-lg text-center"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <p className="text-sm">
                        {stats.productivityScore >= 80 ? '🔥 Você está on fire! Continue assim!' :
                            stats.productivityScore >= 60 ? '💪 Ótimo progresso! Você consegue!' :
                                '👍 Bom começo! Mantenha o ritmo!'}
                    </p>
                </motion.div>
            )}
        </motion.div>
    );
}
