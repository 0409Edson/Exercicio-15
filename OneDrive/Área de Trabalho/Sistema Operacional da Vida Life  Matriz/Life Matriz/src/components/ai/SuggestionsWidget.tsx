'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Lightbulb,
    Sparkles,
    TrendingUp,
    Target,
    Zap,
    Clock,
    CheckCircle,
    X,
    ChevronRight,
    Flag,
    Heart,
    Wallet,
    Brain
} from 'lucide-react';

interface Suggestion {
    id: string;
    type: 'improvement' | 'feature' | 'goal' | 'habit' | 'insight';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    action?: {
        label: string;
        url?: string;
        onClick?: () => void;
    };
    dismissed: boolean;
    createdAt: Date;
}

// Sistema de sugestões inteligentes baseado no uso do app
function generateSuggestions(): Suggestion[] {
    const suggestions: Suggestion[] = [];
    const now = new Date();
    const hour = now.getHours();

    // Sugestões baseadas no horário
    if (hour >= 6 && hour < 10) {
        suggestions.push({
            id: 'morning-1',
            type: 'habit',
            title: '🌅 Defina suas prioridades do dia',
            description: 'Comece o dia definindo 3 tarefas principais. Isso aumenta a produtividade em 25%.',
            priority: 'high',
            action: { label: 'Abrir Agenda', url: '/calendar' },
            dismissed: false,
            createdAt: now,
        });
    }

    if (hour >= 12 && hour < 14) {
        suggestions.push({
            id: 'lunch-1',
            type: 'insight',
            title: '🍽️ Pausa para almoço',
            description: 'Fazer pausas regulares melhora o foco. Que tal revisar seus objetivos?',
            priority: 'medium',
            action: { label: 'Ver Objetivos', url: '/goals' },
            dismissed: false,
            createdAt: now,
        });
    }

    if (hour >= 18 && hour < 22) {
        suggestions.push({
            id: 'evening-1',
            type: 'habit',
            title: '📝 Reflexão do dia',
            description: 'Registre o que você conquistou hoje no diário. Isso fortalece a motivação.',
            priority: 'medium',
            action: { label: 'Abrir Diário', url: '/journal' },
            dismissed: false,
            createdAt: now,
        });
    }

    // Sugestões gerais
    suggestions.push({
        id: 'backup-1',
        type: 'improvement',
        title: '💾 Exporte seus dados',
        description: 'É sempre bom ter um backup externo. Exporte seus dados para segurança extra.',
        priority: 'low',
        action: { label: 'Ir para Backup', url: '/backup' },
        dismissed: false,
        createdAt: now,
    });

    suggestions.push({
        id: 'ai-1',
        type: 'feature',
        title: '🤖 Converse com a IA',
        description: 'A Juliana pode te ajudar a organizar ideias, definir metas ou resolver problemas.',
        priority: 'medium',
        action: { label: 'Abrir IA', url: '/ai' },
        dismissed: false,
        createdAt: now,
    });

    // Sugestões de evolução do app
    suggestions.push({
        id: 'evolution-1',
        type: 'feature',
        title: '🚀 Life Matriz está evoluindo!',
        description: 'Versão 1.1 em desenvolvimento: tema escuro/claro, widgets e gráficos.',
        priority: 'low',
        dismissed: false,
        createdAt: now,
    });

    return suggestions;
}

export function SuggestionsWidget() {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [dismissed, setDismissed] = useState<string[]>([]);

    useEffect(() => {
        // Load dismissed from localStorage
        const saved = localStorage.getItem('lifematriz-dismissed-suggestions');
        if (saved) {
            setDismissed(JSON.parse(saved));
        }

        // Generate suggestions
        const generated = generateSuggestions();
        setSuggestions(generated);

        // Refresh every hour
        const interval = setInterval(() => {
            setSuggestions(generateSuggestions());
        }, 60 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    const visibleSuggestions = suggestions.filter(s => !dismissed.includes(s.id));

    const dismissSuggestion = (id: string) => {
        const updated = [...dismissed, id];
        setDismissed(updated);
        localStorage.setItem('lifematriz-dismissed-suggestions', JSON.stringify(updated));
    };

    const getIcon = (type: Suggestion['type']) => {
        switch (type) {
            case 'improvement': return <TrendingUp size={16} />;
            case 'feature': return <Sparkles size={16} />;
            case 'goal': return <Target size={16} />;
            case 'habit': return <Zap size={16} />;
            case 'insight': return <Brain size={16} />;
        }
    };

    const getColor = (type: Suggestion['type']) => {
        switch (type) {
            case 'improvement': return 'text-green-400';
            case 'feature': return 'text-purple-400';
            case 'goal': return 'text-teal-400';
            case 'habit': return 'text-yellow-400';
            case 'insight': return 'text-blue-400';
        }
    };

    if (visibleSuggestions.length === 0) return null;

    return (
        <>
            {/* Floating Button */}
            <motion.button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg flex items-center justify-center z-40"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                animate={{
                    boxShadow: ['0 0 20px rgba(168, 85, 247, 0.3)', '0 0 40px rgba(168, 85, 247, 0.5)', '0 0 20px rgba(168, 85, 247, 0.3)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                <Lightbulb size={24} className="text-white" />
                {visibleSuggestions.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                        {visibleSuggestions.length}
                    </span>
                )}
            </motion.button>

            {/* Modal */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                    >
                        <motion.div
                            className="w-full max-w-md glass-card p-6 max-h-[80vh] overflow-y-auto"
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <Lightbulb className="text-yellow-400" />
                                    Sugestões Inteligentes
                                </h2>
                                <button onClick={() => setIsOpen(false)} className="btn-icon">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="space-y-3">
                                {visibleSuggestions.map((suggestion, index) => (
                                    <motion.div
                                        key={suggestion.id}
                                        className="p-4 bg-white/5 rounded-xl"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-start gap-3">
                                                <span className={getColor(suggestion.type)}>
                                                    {getIcon(suggestion.type)}
                                                </span>
                                                <div>
                                                    <p className="font-medium text-sm">{suggestion.title}</p>
                                                    <p className="text-xs text-gray-400 mt-1">{suggestion.description}</p>
                                                    {suggestion.action && (
                                                        <a
                                                            href={suggestion.action.url}
                                                            className="inline-flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 mt-2"
                                                        >
                                                            {suggestion.action.label}
                                                            <ChevronRight size={12} />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => dismissSuggestion(suggestion.id)}
                                                className="text-gray-500 hover:text-gray-300"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <p className="text-xs text-gray-500 mt-4 text-center">
                                💡 Sugestões são geradas com base no seu uso e horário
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

export default SuggestionsWidget;
