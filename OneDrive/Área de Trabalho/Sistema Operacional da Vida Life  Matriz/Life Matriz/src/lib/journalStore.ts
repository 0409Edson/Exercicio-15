import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface JournalEntry {
    id: string;
    userId: string;
    date: string;
    type: 'reflection' | 'desire' | 'gratitude' | 'dream' | 'challenge';
    title: string;
    content: string;
    mood?: 'excellent' | 'good' | 'neutral' | 'bad';
    tags: string[];
    isPrivate: boolean;
    createdAt: string;
}

export interface Habit {
    id: string;
    userId: string;
    name: string;
    description?: string;
    frequency: 'daily' | 'weekly' | 'custom';
    category: 'health' | 'productivity' | 'learning' | 'mindfulness' | 'social' | 'finance';
    icon: string;
    color: string;
    targetDays?: number[]; // 0 = Sunday, 1 = Monday, etc.
    streak: number;
    bestStreak: number;
    completedDates: string[]; // ISO date strings
    createdAt: string;
}

interface JournalState {
    entries: JournalEntry[];
    habits: Habit[];

    // Journal actions
    addEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => void;
    updateEntry: (id: string, updates: Partial<JournalEntry>) => void;
    deleteEntry: (id: string) => void;

    // Habit actions
    addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'streak' | 'bestStreak' | 'completedDates'>) => void;
    updateHabit: (id: string, updates: Partial<Habit>) => void;
    deleteHabit: (id: string) => void;
    toggleHabitComplete: (habitId: string, date: string) => void;

    // Analytics
    getEntriesByType: (type: JournalEntry['type']) => JournalEntry[];
    getHabitStreak: (habitId: string) => number;
    getTodayCompletedHabits: () => string[];
    getWeeklyProgress: () => { day: string; completed: number; total: number }[];
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useJournalStore = create<JournalState>()(
    persist(
        (set, get) => ({
            entries: [],
            habits: [],

            // Journal actions
            addEntry: (entry) => {
                const newEntry: JournalEntry = {
                    ...entry,
                    id: generateId(),
                    createdAt: new Date().toISOString(),
                };
                set((state) => ({
                    entries: [newEntry, ...state.entries],
                }));
            },

            updateEntry: (id, updates) => {
                set((state) => ({
                    entries: state.entries.map((e) =>
                        e.id === id ? { ...e, ...updates } : e
                    ),
                }));
            },

            deleteEntry: (id) => {
                set((state) => ({
                    entries: state.entries.filter((e) => e.id !== id),
                }));
            },

            // Habit actions
            addHabit: (habit) => {
                const newHabit: Habit = {
                    ...habit,
                    id: generateId(),
                    streak: 0,
                    bestStreak: 0,
                    completedDates: [],
                    createdAt: new Date().toISOString(),
                };
                set((state) => ({
                    habits: [...state.habits, newHabit],
                }));
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

            toggleHabitComplete: (habitId, date) => {
                set((state) => ({
                    habits: state.habits.map((habit) => {
                        if (habit.id !== habitId) return habit;

                        const dateStr = date.split('T')[0];
                        const isCompleted = habit.completedDates.includes(dateStr);

                        let newCompletedDates: string[];
                        if (isCompleted) {
                            newCompletedDates = habit.completedDates.filter((d) => d !== dateStr);
                        } else {
                            newCompletedDates = [...habit.completedDates, dateStr];
                        }

                        // Calculate streak
                        let streak = 0;
                        const today = new Date();
                        const sortedDates = newCompletedDates.sort().reverse();

                        for (let i = 0; i < 365; i++) {
                            const checkDate = new Date(today);
                            checkDate.setDate(checkDate.getDate() - i);
                            const checkDateStr = checkDate.toISOString().split('T')[0];

                            if (sortedDates.includes(checkDateStr)) {
                                streak++;
                            } else if (i > 0) {
                                break;
                            }
                        }

                        return {
                            ...habit,
                            completedDates: newCompletedDates,
                            streak,
                            bestStreak: Math.max(habit.bestStreak, streak),
                        };
                    }),
                }));
            },

            // Analytics
            getEntriesByType: (type) => {
                return get().entries.filter((e) => e.type === type);
            },

            getHabitStreak: (habitId) => {
                const habit = get().habits.find((h) => h.id === habitId);
                return habit?.streak || 0;
            },

            getTodayCompletedHabits: () => {
                const today = new Date().toISOString().split('T')[0];
                return get().habits
                    .filter((h) => h.completedDates.includes(today))
                    .map((h) => h.id);
            },

            getWeeklyProgress: () => {
                const { habits } = get();
                const result = [];
                const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

                for (let i = 6; i >= 0; i--) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    const dateStr = date.toISOString().split('T')[0];
                    const dayName = days[date.getDay()];

                    const completed = habits.filter((h) =>
                        h.completedDates.includes(dateStr)
                    ).length;

                    result.push({
                        day: dayName,
                        completed,
                        total: habits.length,
                    });
                }

                return result;
            },
        }),
        {
            name: 'lifeos-journal-storage',
            partialize: (state) => ({
                entries: state.entries,
                habits: state.habits,
            }),
        }
    )
);
