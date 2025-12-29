'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain,
    Sparkles,
    TrendingUp,
    Clock,
    Target,
    Lightbulb,
    ChevronRight,
    Play,
    BookOpen,
    Zap
} from 'lucide-react';

interface Recommendation {
    id: string;
    type: 'productivity' | 'learning' | 'break' | 'habit' | 'content';
    title: string;
    description: string;
    icon: string;
    action?: string;
    priority: number;
}

export default function AIRecommendations() {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userContext, setUserContext] = useState<any>(null);

    useEffect(() => {
        generateRecommendations();
        const interval = setInterval(generateRecommendations, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    const generateRecommendations = () => {
        const now = new Date();
        const hour = now.getHours();
        const dayOfWeek = now.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        // Get activity data if available
        let activityData = null;
        if (typeof window !== 'undefined') {
            const win = window as any;
            activityData = win.__activitySummary;
        }

        const recs: Recommendation[] = [];

        // Time-based recommendations
        if (hour >= 6 && hour < 9) {
            recs.push({
                id: 'morning-routine',
                type: 'productivity',
                title: 'Bom dia! Hora de começar bem',
                description: 'Revise suas metas do dia e planeje suas tarefas prioritárias.',
                icon: '🌅',
                action: '/goals',
                priority: 1,
            });
        }

        if (hour >= 9 && hour < 12) {
            recs.push({
                id: 'peak-focus',
                type: 'productivity',
                title: 'Período de Alta Produtividade',
                description: 'Seu cérebro está no pico de performance. Foque em tarefas complexas.',
                icon: '🧠',
                priority: 2,
            });
        }

        if (hour >= 12 && hour < 14) {
            recs.push({
                id: 'lunch-break',
                type: 'break',
                title: 'Hora de uma pausa',
                description: 'Faça uma pausa para almoço. Desconectar ajuda a recarregar.',
                icon: '🍽️',
                priority: 1,
            });
        }

        if (hour >= 14 && hour < 16) {
            recs.push({
                id: 'afternoon-slump',
                type: 'break',
                title: 'Energia baixando?',
                description: 'Normal ter queda de energia à tarde. Uma caminhada rápida ou café pode ajudar.',
                icon: '☕',
                priority: 3,
            });
        }

        if (hour >= 18 && hour < 20) {
            recs.push({
                id: 'evening-review',
                type: 'habit',
                title: 'Revise seu dia',
                description: 'Escreva no diário sobre o que conquistou hoje.',
                icon: '📝',
                action: '/journal',
                priority: 2,
            });
        }

        if (hour >= 22 || hour < 6) {
            recs.push({
                id: 'sleep-time',
                type: 'break',
                title: 'Hora de descansar',
                description: 'Sono de qualidade é essencial para produtividade. Considere se preparar para dormir.',
                icon: '😴',
                priority: 1,
            });
        }

        // Weekend-specific
        if (isWeekend) {
            recs.push({
                id: 'weekend-balance',
                type: 'break',
                title: 'É fim de semana!',
                description: 'Aproveite para relaxar, mas não esqueça de manter alguns hábitos.',
                icon: '🎉',
                priority: 3,
            });
        }

        // Activity-based recommendations
        if (activityData) {
            const { categoryPercentages, topInterests, currentApp } = activityData;

            // If too much entertainment
            if (categoryPercentages?.entertainment > 60) {
                recs.push({
                    id: 'balance-entertainment',
                    type: 'productivity',
                    title: 'Balanceie seu tempo',
                    description: 'Você passou muito tempo em entretenimento. Que tal focar em algo produtivo?',
                    icon: '⚖️',
                    priority: 1,
                });
            }

            // If very productive
            if (categoryPercentages?.productive > 70) {
                recs.push({
                    id: 'take-break',
                    type: 'break',
                    title: 'Você está arrasando!',
                    description: 'Excelente produtividade! Mas lembre-se de fazer pausas para manter o ritmo.',
                    icon: '🏆',
                    priority: 2,
                });
            }

            // Based on interests
            if (topInterests && topInterests.length > 0) {
                const topInterest = topInterests[0];
                recs.push({
                    id: 'interest-based',
                    type: 'content',
                    title: `Continue aprendendo sobre ${topInterest.topic}`,
                    description: `Você demonstrou interesse em ${topInterest.topic}. A IA pode encontrar conteúdo relacionado.`,
                    icon: '📚',
                    priority: 3,
                });
            }
        }

        // Habit reminders (simulated)
        const storedHabits = typeof localStorage !== 'undefined'
            ? localStorage.getItem('habit-store')
            : null;

        if (storedHabits) {
            try {
                const habits = JSON.parse(storedHabits);
                if (habits.state?.habits?.length > 0) {
                    const pendingHabits = habits.state.habits.filter((h: any) => {
                        const today = new Date().toISOString().split('T')[0];
                        return !h.completedDates?.includes(today);
                    });

                    if (pendingHabits.length > 0) {
                        recs.push({
                            id: 'pending-habits',
                            type: 'habit',
                            title: `${pendingHabits.length} hábitos pendentes`,
                            description: 'Você tem hábitos para completar hoje. Mantenha a sequência!',
                            icon: '✅',
                            action: '/habits',
                            priority: 1,
                        });
                    }
                }
            } catch (e) { }
        }

        // Sort by priority and limit
        const sortedRecs = recs
            .sort((a, b) => a.priority - b.priority)
            .slice(0, 4);

        setRecommendations(sortedRecs);
        setIsLoading(false);
    };

    if (isLoading) {
        return (
            <div className="glass-card p-6 flex items-center justify-center">
                <Sparkles className="animate-pulse text-purple-400" />
            </div>
        );
    }

    return (
        <motion.div
            className="glass-card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Brain size={20} className="text-white" />
                </div>
                <div>
                    <h3 className="font-semibold">Recomendações da IA</h3>
                    <p className="text-xs text-gray-500">Baseado em seus padrões</p>
                </div>
            </div>

            <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                    {recommendations.map((rec, index) => (
                        <motion.div
                            key={rec.id}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-4 rounded-lg border cursor-pointer hover:scale-[1.02] transition-transform ${rec.type === 'productivity' ? 'bg-green-500/10 border-green-500/30' :
                                    rec.type === 'break' ? 'bg-blue-500/10 border-blue-500/30' :
                                        rec.type === 'habit' ? 'bg-orange-500/10 border-orange-500/30' :
                                            rec.type === 'learning' ? 'bg-purple-500/10 border-purple-500/30' :
                                                'bg-white/5 border-white/10'
                                }`}
                            onClick={() => {
                                if (rec.action && typeof window !== 'undefined') {
                                    window.location.href = rec.action;
                                }
                            }}
                        >
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">{rec.icon}</span>
                                <div className="flex-1">
                                    <p className="font-medium text-sm">{rec.title}</p>
                                    <p className="text-xs text-gray-400 mt-1">{rec.description}</p>
                                </div>
                                {rec.action && (
                                    <ChevronRight size={16} className="text-gray-500 mt-1" />
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {recommendations.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                    <Lightbulb size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Continue usando o app para receber recomendações personalizadas</p>
                </div>
            )}
        </motion.div>
    );
}
