import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    createdAt: string;
}

export interface Goal {
    id: string;
    userId: string;
    title: string;
    description: string;
    category: 'career' | 'finance' | 'health' | 'education' | 'personal';
    priority: 'high' | 'medium' | 'low';
    progress: number;
    deadline: string;
    subgoals: { id: string; title: string; completed: boolean }[];
    createdAt: string;
    updatedAt: string;
}

export interface Task {
    id: string;
    userId: string;
    title: string;
    description?: string;
    date: string;
    time: string;
    duration: string;
    type: 'task' | 'meeting' | 'focus' | 'break' | 'personal';
    completed: boolean;
    goalId?: string;
    energy: 'high' | 'medium' | 'low';
}

export interface Transaction {
    id: string;
    userId: string;
    title: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    date: string;
}

export interface HealthEntry {
    id: string;
    userId: string;
    date: string;
    mood: 'excellent' | 'good' | 'neutral' | 'bad';
    sleepHours: number;
    waterIntake: number;
    steps: number;
    stressLevel: number;
}

// Store State
interface LifeOSState {
    // Auth
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    // Goals
    goals: Goal[];

    // Tasks
    tasks: Task[];

    // Finance
    transactions: Transaction[];

    // Health
    healthEntries: HealthEntry[];

    // Life Score (calculated)
    lifeScore: number;

    // Actions
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
    logout: () => void;

    // Goals actions
    addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateGoal: (id: string, updates: Partial<Goal>) => void;
    deleteGoal: (id: string) => void;
    toggleSubgoal: (goalId: string, subgoalId: string) => void;

    // Tasks actions
    addTask: (task: Omit<Task, 'id'>) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;
    deleteTask: (id: string) => void;
    toggleTaskComplete: (id: string) => void;

    // Finance actions
    addTransaction: (transaction: Omit<Transaction, 'id'>) => void;

    // Health actions
    addHealthEntry: (entry: Omit<HealthEntry, 'id'>) => void;

    // Utils
    calculateLifeScore: () => void;
}

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 15);

export const useLifeOSStore = create<LifeOSState>()(
    persist(
        (set, get) => ({
            // Initial state
            user: null,
            isAuthenticated: false,
            isLoading: true,
            goals: [],
            tasks: [],
            transactions: [],
            healthEntries: [],
            lifeScore: 0,

            // Auth actions
            setUser: (user) => set({
                user,
                isAuthenticated: !!user,
                isLoading: false
            }),

            setLoading: (isLoading) => set({ isLoading }),

            logout: () => set({
                user: null,
                isAuthenticated: false,
                goals: [],
                tasks: [],
                transactions: [],
                healthEntries: [],
                lifeScore: 0
            }),

            // Goals actions
            addGoal: (goal) => {
                const newGoal: Goal = {
                    ...goal,
                    id: generateId(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
                set((state) => ({
                    goals: [...state.goals, newGoal]
                }));
                get().calculateLifeScore();
            },

            updateGoal: (id, updates) => {
                set((state) => ({
                    goals: state.goals.map((g) =>
                        g.id === id
                            ? { ...g, ...updates, updatedAt: new Date().toISOString() }
                            : g
                    ),
                }));
                get().calculateLifeScore();
            },

            deleteGoal: (id) => {
                set((state) => ({
                    goals: state.goals.filter((g) => g.id !== id),
                }));
                get().calculateLifeScore();
            },

            toggleSubgoal: (goalId, subgoalId) => {
                set((state) => ({
                    goals: state.goals.map((goal) => {
                        if (goal.id === goalId) {
                            const updatedSubgoals = goal.subgoals.map((sg) =>
                                sg.id === subgoalId ? { ...sg, completed: !sg.completed } : sg
                            );
                            const completedCount = updatedSubgoals.filter((sg) => sg.completed).length;
                            const progress = Math.round((completedCount / updatedSubgoals.length) * 100);
                            return {
                                ...goal,
                                subgoals: updatedSubgoals,
                                progress,
                                updatedAt: new Date().toISOString()
                            };
                        }
                        return goal;
                    }),
                }));
                get().calculateLifeScore();
            },

            // Tasks actions
            addTask: (task) => {
                const newTask: Task = { ...task, id: generateId() };
                set((state) => ({ tasks: [...state.tasks, newTask] }));
            },

            updateTask: (id, updates) => {
                set((state) => ({
                    tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
                }));
            },

            deleteTask: (id) => {
                set((state) => ({
                    tasks: state.tasks.filter((t) => t.id !== id),
                }));
            },

            toggleTaskComplete: (id) => {
                set((state) => ({
                    tasks: state.tasks.map((t) =>
                        t.id === id ? { ...t, completed: !t.completed } : t
                    ),
                }));
                get().calculateLifeScore();
            },

            // Finance actions
            addTransaction: (transaction) => {
                const newTransaction: Transaction = { ...transaction, id: generateId() };
                set((state) => ({
                    transactions: [...state.transactions, newTransaction]
                }));
            },

            // Health actions
            addHealthEntry: (entry) => {
                const newEntry: HealthEntry = { ...entry, id: generateId() };
                set((state) => ({
                    healthEntries: [...state.healthEntries, newEntry]
                }));
                get().calculateLifeScore();
            },

            // Calculate Life Score based on all metrics
            calculateLifeScore: () => {
                const { goals, tasks, healthEntries } = get();

                // Goals progress (40% weight)
                const goalsScore = goals.length > 0
                    ? goals.reduce((acc, g) => acc + g.progress, 0) / goals.length
                    : 50;

                // Tasks completion rate (30% weight)
                const completedTasks = tasks.filter((t) => t.completed).length;
                const tasksScore = tasks.length > 0
                    ? (completedTasks / tasks.length) * 100
                    : 50;

                // Health score (30% weight)
                const latestHealth = healthEntries[healthEntries.length - 1];
                let healthScore = 50;
                if (latestHealth) {
                    const moodScore = { excellent: 100, good: 75, neutral: 50, bad: 25 }[latestHealth.mood];
                    const sleepScore = Math.min(latestHealth.sleepHours / 8, 1) * 100;
                    const stressScore = 100 - latestHealth.stressLevel;
                    healthScore = (moodScore + sleepScore + stressScore) / 3;
                }

                const lifeScore = Math.round(
                    goalsScore * 0.4 + tasksScore * 0.3 + healthScore * 0.3
                );

                set({ lifeScore });
            },
        }),
        {
            name: 'lifeos-storage',
            partialize: (state) => ({
                user: state.user,
                goals: state.goals,
                tasks: state.tasks,
                transactions: state.transactions,
                healthEntries: state.healthEntries,
            }),
        }
    )
);
