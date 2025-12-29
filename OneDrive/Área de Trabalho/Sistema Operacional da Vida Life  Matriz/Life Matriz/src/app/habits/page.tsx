'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap,
    Plus,
    Target,
    Check,
    X,
    Flame,
    Trophy,
    Calendar,
    Clock,
    Sparkles,
    ChevronRight,
    Heart,
    Brain,
    Wallet,
    GraduationCap,
    Sun,
    Moon,
    Sunrise,
    Edit2,
    Trash2,
    TrendingUp
} from 'lucide-react';
import { useHabitStore, type Habit } from '@/lib/habitStore';
import { useCurrentDate } from '@/hooks/useCurrentDate';

const categoryIcons: Record<string, JSX.Element> = {
    health: <Heart size={16} className="text-red-400" />,
    productivity: <Brain size={16} className="text-purple-400" />,
    finance: <Wallet size={16} className="text-green-400" />,
    personal: <Sparkles size={16} className="text-yellow-400" />,
    learning: <GraduationCap size={16} className="text-blue-400" />,
};

const categoryColors: Record<string, string> = {
    health: 'from-red-500/20 to-pink-500/20',
    productivity: 'from-purple-500/20 to-indigo-500/20',
    finance: 'from-green-500/20 to-emerald-500/20',
    personal: 'from-yellow-500/20 to-orange-500/20',
    learning: 'from-blue-500/20 to-cyan-500/20',
};

export default function HabitsPage() {
    const dateInfo = useCurrentDate();
    const {
        habits,
        suggestions,
        questionnaireCompleted,
        getTodayHabits,
        getHabitProgress,
        completeHabit,
        uncompleteHabit,
        deleteHabit,
        acceptSuggestion,
        dismissSuggestion,
        completeQuestionnaire,
        addHabit,
        trackPageVisit,
    } = useHabitStore();

    const [showQuestionnaire, setShowQuestionnaire] = useState(false);
    const [showAddHabit, setShowAddHabit] = useState(false);
    const [newHabit, setNewHabit] = useState({
        name: '',
        icon: '⭐',
        category: 'personal' as Habit['category'],
        frequency: 'daily' as Habit['frequency'],
        targetTime: '',
    });

    // Questionnaire state
    const [questionStep, setQuestionStep] = useState(0);
    const [answers, setAnswers] = useState({
        wakeUpTime: '',
        sleepTime: '',
        workStartTime: '',
        workEndTime: '',
        exercisePreference: '' as 'morning' | 'afternoon' | 'evening' | 'none' | '',
        goals: [] as string[],
    });

    useEffect(() => {
        trackPageVisit('/habits');
        if (!questionnaireCompleted) {
            setShowQuestionnaire(true);
        }
    }, []);

    const todayHabits = getTodayHabits();
    const completedToday = todayHabits.filter((h) =>
        h.completedDates.includes(new Date().toISOString().split('T')[0])
    ).length;
    const progress = todayHabits.length > 0 ? Math.round((completedToday / todayHabits.length) * 100) : 0;

    const activeSuggestions = suggestions.filter((s) => !s.dismissed);

    const handleCompleteQuestionnaire = () => {
        completeQuestionnaire({
            wakeUpTime: answers.wakeUpTime,
            sleepTime: answers.sleepTime,
            workStartTime: answers.workStartTime,
            workEndTime: answers.workEndTime,
            exercisePreference: answers.exercisePreference || undefined,
            goals: answers.goals,
        });
        setShowQuestionnaire(false);
    };

    const handleAddHabit = () => {
        if (!newHabit.name.trim()) return;
        addHabit({
            name: newHabit.name,
            icon: newHabit.icon,
            category: newHabit.category,
            frequency: newHabit.frequency,
            targetTime: newHabit.targetTime || undefined,
            reminderEnabled: true,
            isAutoDetected: false,
        });
        setNewHabit({ name: '', icon: '⭐', category: 'personal', frequency: 'daily', targetTime: '' });
        setShowAddHabit(false);
    };

    const toggleGoal = (goal: string) => {
        setAnswers((prev) => ({
            ...prev,
            goals: prev.goals.includes(goal)
                ? prev.goals.filter((g) => g !== goal)
                : [...prev.goals, goal],
        }));
    };

    const questions = [
        {
            title: 'Que horas você costuma acordar?',
            icon: <Sunrise className="text-orange-400" />,
            content: (
                <input
                    type="time"
                    value={answers.wakeUpTime}
                    onChange={(e) => setAnswers({ ...answers, wakeUpTime: e.target.value })}
                    className="input-field text-2xl text-center"
                />
            ),
        },
        {
            title: 'Que horas você costuma dormir?',
            icon: <Moon className="text-purple-400" />,
            content: (
                <input
                    type="time"
                    value={answers.sleepTime}
                    onChange={(e) => setAnswers({ ...answers, sleepTime: e.target.value })}
                    className="input-field text-2xl text-center"
                />
            ),
        },
        {
            title: 'Quando você prefere se exercitar?',
            icon: <Zap className="text-yellow-400" />,
            content: (
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { value: 'morning', label: '🌅 Manhã', icon: <Sun /> },
                        { value: 'afternoon', label: '☀️ Tarde', icon: <Sun /> },
                        { value: 'evening', label: '🌙 Noite', icon: <Moon /> },
                        { value: 'none', label: '❌ Não pratico', icon: <X /> },
                    ].map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setAnswers({ ...answers, exercisePreference: opt.value as any })}
                            className={`p-4 rounded-xl text-left transition-all ${answers.exercisePreference === opt.value
                                    ? 'bg-teal-500/20 border-teal-500 border-2'
                                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                                }`}
                        >
                            <span className="text-lg">{opt.label}</span>
                        </button>
                    ))}
                </div>
            ),
        },
        {
            title: 'Quais são seus objetivos principais?',
            icon: <Target className="text-teal-400" />,
            content: (
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { value: 'saude', label: '❤️ Saúde' },
                        { value: 'financas', label: '💰 Finanças' },
                        { value: 'produtividade', label: '⚡ Produtividade' },
                        { value: 'aprendizado', label: '📚 Aprendizado' },
                        { value: 'relacionamentos', label: '👥 Relacionamentos' },
                        { value: 'carreira', label: '💼 Carreira' },
                    ].map((goal) => (
                        <button
                            key={goal.value}
                            onClick={() => toggleGoal(goal.value)}
                            className={`p-4 rounded-xl text-left transition-all ${answers.goals.includes(goal.value)
                                    ? 'bg-teal-500/20 border-teal-500 border-2'
                                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                                }`}
                        >
                            <span className="text-lg">{goal.label}</span>
                        </button>
                    ))}
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Zap className="text-yellow-400" />
                    Meus Hábitos
                </h1>
                <p className="text-gray-400 mt-1">
                    {dateInfo.formatted}
                </p>
            </motion.div>

            {/* Progress Card */}
            <motion.div
                className="glass-card p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold">Progresso de Hoje</h2>
                    <span className="text-2xl font-bold text-teal-400">{progress}%</span>
                </div>
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-teal-400 to-purple-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                </div>
                <div className="flex items-center justify-between mt-3 text-sm text-gray-400">
                    <span>{completedToday} de {todayHabits.length} hábitos</span>
                    <div className="flex items-center gap-1">
                        <Flame className="text-orange-400" size={14} />
                        <span>Streak máximo: {habits.reduce((max, h) => Math.max(max, h.bestStreak), 0)} dias</span>
                    </div>
                </div>
            </motion.div>

            {/* AI Suggestions */}
            {activeSuggestions.length > 0 && (
                <motion.div
                    className="glass-card p-6 border border-purple-500/30"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="text-purple-400" />
                        <h2 className="font-semibold">Sugestões da IA</h2>
                        <span className="text-xs bg-purple-500/20 px-2 py-1 rounded-full text-purple-300">
                            Detectado automaticamente
                        </span>
                    </div>
                    <div className="space-y-3">
                        {activeSuggestions.map((suggestion) => (
                            <div
                                key={suggestion.id}
                                className="flex items-center justify-between p-4 bg-white/5 rounded-xl"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{suggestion.icon}</span>
                                    <div>
                                        <p className="font-medium">{suggestion.name}</p>
                                        <p className="text-xs text-gray-400">{suggestion.reason}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400">{suggestion.confidence}% confiança</span>
                                    <button
                                        onClick={() => acceptSuggestion(suggestion.id)}
                                        className="btn-icon bg-green-500/20 hover:bg-green-500/30 text-green-400"
                                    >
                                        <Check size={16} />
                                    </button>
                                    <button
                                        onClick={() => dismissSuggestion(suggestion.id)}
                                        className="btn-icon bg-red-500/20 hover:bg-red-500/30 text-red-400"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Today's Habits */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold">Hábitos de Hoje</h2>
                    <button
                        onClick={() => setShowAddHabit(true)}
                        className="btn-primary text-sm flex items-center gap-2"
                    >
                        <Plus size={16} />
                        Novo Hábito
                    </button>
                </div>

                {todayHabits.length === 0 ? (
                    <div className="glass-card p-8 text-center">
                        <Sparkles className="mx-auto text-gray-400 mb-3" size={40} />
                        <p className="text-gray-400">Nenhum hábito para hoje</p>
                        <p className="text-sm text-gray-500 mt-1">
                            {questionnaireCompleted
                                ? 'Adicione seu primeiro hábito!'
                                : 'Complete o questionário para receber sugestões personalizadas'}
                        </p>
                        {!questionnaireCompleted && (
                            <button
                                onClick={() => setShowQuestionnaire(true)}
                                className="btn-primary mt-4"
                            >
                                Começar Questionário
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {todayHabits.map((habit, index) => {
                            const isCompleted = habit.completedDates.includes(
                                new Date().toISOString().split('T')[0]
                            );
                            return (
                                <motion.div
                                    key={habit.id}
                                    className={`glass-card p-4 flex items-center gap-4 ${isCompleted ? 'opacity-75' : ''
                                        }`}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <button
                                        onClick={() =>
                                            isCompleted ? uncompleteHabit(habit.id) : completeHabit(habit.id)
                                        }
                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isCompleted
                                                ? 'bg-green-500 text-white'
                                                : 'bg-white/10 hover:bg-white/20'
                                            }`}
                                    >
                                        <Check size={18} />
                                    </button>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">{habit.icon}</span>
                                            <span className={isCompleted ? 'line-through text-gray-400' : ''}>
                                                {habit.name}
                                            </span>
                                            {habit.isAutoDetected && (
                                                <span className="text-xs bg-purple-500/20 px-2 py-0.5 rounded-full text-purple-300">
                                                    <Sparkles size={10} className="inline mr-1" />
                                                    Auto
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                            {categoryIcons[habit.category]}
                                            <span className="flex items-center gap-1">
                                                <Flame size={12} className="text-orange-400" />
                                                {habit.streak} dias
                                            </span>
                                            {habit.targetTime && (
                                                <span className="flex items-center gap-1">
                                                    <Clock size={12} />
                                                    {habit.targetTime}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => deleteHabit(habit.id)}
                                        className="btn-icon text-red-400 opacity-50 hover:opacity-100"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Questionnaire Modal */}
            <AnimatePresence>
                {showQuestionnaire && (
                    <motion.div
                        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="glass-card w-full max-w-lg p-8"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                {questions[questionStep].icon}
                                <h2 className="text-xl font-semibold">
                                    {questions[questionStep].title}
                                </h2>
                            </div>

                            <div className="mb-8">{questions[questionStep].content}</div>

                            <div className="flex items-center justify-between">
                                <div className="flex gap-1">
                                    {questions.map((_, i) => (
                                        <div
                                            key={i}
                                            className={`w-2 h-2 rounded-full transition-colors ${i === questionStep ? 'bg-teal-400' : 'bg-white/20'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    {questionStep > 0 && (
                                        <button
                                            onClick={() => setQuestionStep(questionStep - 1)}
                                            className="btn-secondary"
                                        >
                                            Voltar
                                        </button>
                                    )}
                                    {questionStep < questions.length - 1 ? (
                                        <button
                                            onClick={() => setQuestionStep(questionStep + 1)}
                                            className="btn-primary"
                                        >
                                            Próximo
                                            <ChevronRight size={16} className="inline ml-1" />
                                        </button>
                                    ) : (
                                        <button onClick={handleCompleteQuestionnaire} className="btn-primary">
                                            Finalizar
                                            <Check size={16} className="inline ml-1" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Habit Modal */}
            <AnimatePresence>
                {showAddHabit && (
                    <motion.div
                        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowAddHabit(false)}
                    >
                        <motion.div
                            className="glass-card w-full max-w-md p-6"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                <Plus className="text-teal-400" />
                                Novo Hábito
                            </h2>

                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={newHabit.icon}
                                        onChange={(e) => setNewHabit({ ...newHabit, icon: e.target.value })}
                                        className="input-field w-16 text-center text-2xl"
                                        maxLength={2}
                                        placeholder="⭐"
                                    />
                                    <input
                                        type="text"
                                        value={newHabit.name}
                                        onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                                        className="input-field flex-1"
                                        placeholder="Nome do hábito"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm text-gray-400 block mb-2">Categoria</label>
                                    <select
                                        value={newHabit.category}
                                        onChange={(e) => setNewHabit({ ...newHabit, category: e.target.value as any })}
                                        className="input-field"
                                    >
                                        <option value="health">❤️ Saúde</option>
                                        <option value="productivity">⚡ Produtividade</option>
                                        <option value="finance">💰 Finanças</option>
                                        <option value="personal">✨ Pessoal</option>
                                        <option value="learning">📚 Aprendizado</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm text-gray-400 block mb-2">Frequência</label>
                                    <select
                                        value={newHabit.frequency}
                                        onChange={(e) => setNewHabit({ ...newHabit, frequency: e.target.value as any })}
                                        className="input-field"
                                    >
                                        <option value="daily">📅 Diário</option>
                                        <option value="weekly">📆 Semanal</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm text-gray-400 block mb-2">Horário alvo (opcional)</label>
                                    <input
                                        type="time"
                                        value={newHabit.targetTime}
                                        onChange={(e) => setNewHabit({ ...newHabit, targetTime: e.target.value })}
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button onClick={() => setShowAddHabit(false)} className="btn-secondary flex-1">
                                    Cancelar
                                </button>
                                <button onClick={handleAddHabit} className="btn-primary flex-1">
                                    Criar Hábito
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
