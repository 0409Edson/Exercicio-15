import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Habit {
    id: string;
    name: string;
    icon: string;
    category: 'health' | 'productivity' | 'finance' | 'personal' | 'learning';
    frequency: 'daily' | 'weekly' | 'custom';
    customDays?: number[]; // 0-6 for Sunday-Saturday
    targetTime?: string; // HH:MM format
    reminderEnabled: boolean;
    streak: number;
    bestStreak: number;
    completedDates: string[]; // ISO date strings
    createdAt: Date;
    isAutoDetected: boolean;
    autoDetectedReason?: string;
}

export interface UsagePattern {
    timestamp: Date;
    page: string;
    duration: number; // seconds
    dayOfWeek: number;
    hourOfDay: number;
}

export interface HabitSuggestion {
    id: string;
    name: string;
    icon: string;
    category: Habit['category'];
    reason: string;
    confidence: number; // 0-100
    dismissed: boolean;
}

interface HabitState {
    // User habits
    habits: Habit[];
    suggestions: HabitSuggestion[];

    // Usage tracking
    usagePatterns: UsagePattern[];
    lastVisit: Date | null;
    totalVisits: number;
    favoritePages: Record<string, number>;

    // Questionnaire
    questionnaireCompleted: boolean;
    userProfile: {
        wakeUpTime?: string;
        sleepTime?: string;
        workStartTime?: string;
        workEndTime?: string;
        exercisePreference?: 'morning' | 'afternoon' | 'evening' | 'none';
        goals?: string[];
    };

    // Actions - Habits
    addHabit: (habit: Omit<Habit, 'id' | 'streak' | 'bestStreak' | 'completedDates' | 'createdAt'>) => void;
    updateHabit: (id: string, updates: Partial<Habit>) => void;
    deleteHabit: (id: string) => void;
    completeHabit: (id: string) => void;
    uncompleteHabit: (id: string) => void;

    // Actions - Usage Tracking
    trackPageVisit: (page: string) => void;

    // Actions - Suggestions
    addSuggestion: (suggestion: Omit<HabitSuggestion, 'id' | 'dismissed'>) => void;
    acceptSuggestion: (id: string) => void;
    dismissSuggestion: (id: string) => void;

    // Actions - Questionnaire
    completeQuestionnaire: (profile: HabitState['userProfile']) => void;

    // Computed
    getTodayHabits: () => Habit[];
    getHabitProgress: (id: string) => number;
    analyzePatterns: () => void;
}

const today = () => new Date().toISOString().split('T')[0];

// Generate unique ID using crypto for better uniqueness
const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${Math.random().toString(36).substr(2, 9)}`;
};

export const useHabitStore = create<HabitState>()(
    persist(
        (set, get) => ({
            habits: [],
            suggestions: [],
            usagePatterns: [],
            lastVisit: null,
            totalVisits: 0,
            favoritePages: {},
            questionnaireCompleted: false,
            userProfile: {},

            addHabit: (habitData) => {
                const habit: Habit = {
                    ...habitData,
                    id: generateId(),
                    streak: 0,
                    bestStreak: 0,
                    completedDates: [],
                    createdAt: new Date(),
                };
                set((state) => ({ habits: [...state.habits, habit] }));
            },

            updateHabit: (id, updates) => {
                set((state) => ({
                    habits: state.habits.map((h) =>
                        h.id === id ? { ...h, ...updates } : h
                    ),
                }));
            },

            deleteHabit: (id) => {
                set((state) => ({
                    habits: state.habits.filter((h) => h.id !== id),
                }));
            },

            completeHabit: (id) => {
                const todayStr = today();
                set((state) => ({
                    habits: state.habits.map((h) => {
                        if (h.id !== id) return h;
                        if (h.completedDates.includes(todayStr)) return h;

                        const newStreak = h.streak + 1;
                        return {
                            ...h,
                            completedDates: [...h.completedDates, todayStr],
                            streak: newStreak,
                            bestStreak: Math.max(h.bestStreak, newStreak),
                        };
                    }),
                }));
            },

            uncompleteHabit: (id) => {
                const todayStr = today();
                set((state) => ({
                    habits: state.habits.map((h) => {
                        if (h.id !== id) return h;
                        return {
                            ...h,
                            completedDates: h.completedDates.filter((d) => d !== todayStr),
                            streak: Math.max(0, h.streak - 1),
                        };
                    }),
                }));
            },

            trackPageVisit: (page) => {
                const now = new Date();
                const pattern: UsagePattern = {
                    timestamp: now,
                    page,
                    duration: 0,
                    dayOfWeek: now.getDay(),
                    hourOfDay: now.getHours(),
                };

                set((state) => ({
                    usagePatterns: [...state.usagePatterns.slice(-500), pattern], // Keep last 500
                    lastVisit: now,
                    totalVisits: state.totalVisits + 1,
                    favoritePages: {
                        ...state.favoritePages,
                        [page]: (state.favoritePages[page] || 0) + 1,
                    },
                }));

                // Analyze patterns periodically
                if (get().totalVisits % 10 === 0) {
                    get().analyzePatterns();
                }
            },

            addSuggestion: (suggestionData) => {
                const suggestion: HabitSuggestion = {
                    ...suggestionData,
                    id: generateId(),
                    dismissed: false,
                };
                set((state) => ({
                    suggestions: [...state.suggestions, suggestion],
                }));
            },

            acceptSuggestion: (id) => {
                const suggestion = get().suggestions.find((s) => s.id === id);
                if (suggestion) {
                    get().addHabit({
                        name: suggestion.name,
                        icon: suggestion.icon,
                        category: suggestion.category,
                        frequency: 'daily',
                        reminderEnabled: true,
                        isAutoDetected: true,
                        autoDetectedReason: suggestion.reason,
                    });
                    set((state) => ({
                        suggestions: state.suggestions.filter((s) => s.id !== id),
                    }));
                }
            },

            dismissSuggestion: (id) => {
                set((state) => ({
                    suggestions: state.suggestions.map((s) =>
                        s.id === id ? { ...s, dismissed: true } : s
                    ),
                }));
            },

            completeQuestionnaire: (profile) => {
                set({ userProfile: profile, questionnaireCompleted: true });

                // Generate initial habit suggestions based on profile
                const suggestions: Array<Omit<HabitSuggestion, 'id' | 'dismissed'>> = [];

                if (profile.wakeUpTime) {
                    suggestions.push({
                        name: 'Rotina matinal',
                        icon: '🌅',
                        category: 'personal',
                        reason: `Baseado no seu horário de acordar (${profile.wakeUpTime})`,
                        confidence: 90,
                    });
                }

                if (profile.exercisePreference && profile.exercisePreference !== 'none') {
                    const timeLabel = {
                        morning: 'pela manhã',
                        afternoon: 'à tarde',
                        evening: 'à noite',
                    };
                    suggestions.push({
                        name: `Exercício ${timeLabel[profile.exercisePreference]}`,
                        icon: '🏃',
                        category: 'health',
                        reason: `Você prefere se exercitar ${timeLabel[profile.exercisePreference]}`,
                        confidence: 95,
                    });
                }

                if (profile.goals?.includes('financas')) {
                    suggestions.push({
                        name: 'Revisar gastos do dia',
                        icon: '💰',
                        category: 'finance',
                        reason: 'Você indicou finanças como um objetivo',
                        confidence: 85,
                    });
                }

                if (profile.goals?.includes('saude')) {
                    suggestions.push({
                        name: 'Beber 2L de água',
                        icon: '💧',
                        category: 'health',
                        reason: 'Você indicou saúde como um objetivo',
                        confidence: 90,
                    });
                }

                if (profile.goals?.includes('produtividade')) {
                    suggestions.push({
                        name: 'Planejar o dia',
                        icon: '📝',
                        category: 'productivity',
                        reason: 'Você indicou produtividade como um objetivo',
                        confidence: 88,
                    });
                }

                suggestions.forEach((s) => get().addSuggestion(s));
            },

            getTodayHabits: () => {
                const dayOfWeek = new Date().getDay();
                return get().habits.filter((h) => {
                    if (h.frequency === 'daily') return true;
                    if (h.frequency === 'custom' && h.customDays) {
                        return h.customDays.includes(dayOfWeek);
                    }
                    return false;
                });
            },

            getHabitProgress: (id) => {
                const habit = get().habits.find((h) => h.id === id);
                if (!habit) return 0;

                // Calculate progress for the last 7 days
                const last7Days = Array.from({ length: 7 }, (_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    return date.toISOString().split('T')[0];
                });

                const completed = habit.completedDates.filter((d) =>
                    last7Days.includes(d)
                ).length;

                return Math.round((completed / 7) * 100);
            },

            analyzePatterns: () => {
                const { usagePatterns, favoritePages, suggestions, habits } = get();

                // Find most used hours
                const hourCounts: Record<number, number> = {};
                usagePatterns.forEach((p) => {
                    hourCounts[p.hourOfDay] = (hourCounts[p.hourOfDay] || 0) + 1;
                });

                // Check for morning pattern
                const morningVisits = [6, 7, 8, 9].reduce((sum, h) => sum + (hourCounts[h] || 0), 0);
                if (morningVisits > 5) {
                    const existing = habits.some((h) => h.name.toLowerCase().includes('manhã'));
                    const suggested = suggestions.some((s) => s.name.toLowerCase().includes('manhã'));

                    if (!existing && !suggested) {
                        get().addSuggestion({
                            name: 'Check-in matinal',
                            icon: '☀️',
                            category: 'productivity',
                            reason: `Você acessa frequentemente pela manhã (${morningVisits}x)`,
                            confidence: 75,
                        });
                    }
                }

                // Check for night pattern
                const nightVisits = [21, 22, 23].reduce((sum, h) => sum + (hourCounts[h] || 0), 0);
                if (nightVisits > 5) {
                    const existing = habits.some((h) => h.name.toLowerCase().includes('noite'));
                    const suggested = suggestions.some((s) => s.name.toLowerCase().includes('noite'));

                    if (!existing && !suggested) {
                        get().addSuggestion({
                            name: 'Reflexão noturna',
                            icon: '🌙',
                            category: 'personal',
                            reason: `Você acessa frequentemente à noite (${nightVisits}x)`,
                            confidence: 70,
                        });
                    }
                }

                // Check favorite pages
                if (favoritePages['/finance'] > 10) {
                    const existing = habits.some((h) => h.category === 'finance');
                    const suggested = suggestions.some((s) => s.category === 'finance');

                    if (!existing && !suggested) {
                        get().addSuggestion({
                            name: 'Controle financeiro diário',
                            icon: '📊',
                            category: 'finance',
                            reason: 'Você visita a página de finanças frequentemente',
                            confidence: 80,
                        });
                    }
                }

                if (favoritePages['/health'] > 10) {
                    const existing = habits.some((h) => h.category === 'health');
                    const suggested = suggestions.some((s) => s.category === 'health');

                    if (!existing && !suggested) {
                        get().addSuggestion({
                            name: 'Registro de saúde',
                            icon: '❤️',
                            category: 'health',
                            reason: 'Você visita a página de saúde frequentemente',
                            confidence: 80,
                        });
                    }
                }
            },
        }),
        {
            name: 'lifematriz-habits',
            partialize: (state) => ({
                habits: state.habits,
                suggestions: state.suggestions.filter((s) => !s.dismissed),
                usagePatterns: state.usagePatterns.slice(-100),
                totalVisits: state.totalVisits,
                favoritePages: state.favoritePages,
                questionnaireCompleted: state.questionnaireCompleted,
                userProfile: state.userProfile,
            }),
        }
    )
);

// Auto-track usage when store is used
if (typeof window !== 'undefined') {
    // Track page on load
    setTimeout(() => {
        const path = window.location.pathname;
        useHabitStore.getState().trackPageVisit(path);
    }, 1000);
}
