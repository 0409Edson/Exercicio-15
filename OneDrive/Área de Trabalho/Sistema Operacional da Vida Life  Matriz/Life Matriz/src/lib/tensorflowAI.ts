'use client';

import * as tf from '@tensorflow/tfjs';

// Neural Network for pattern learning
class PatternLearner {
    private model: tf.Sequential | null = null;
    private trained: boolean = false;
    private isTraining: boolean = false; // Lock to prevent concurrent training

    constructor() {
        this.initModel();
    }

    private initModel() {
        this.model = tf.sequential({
            layers: [
                tf.layers.dense({ inputShape: [7], units: 16, activation: 'relu' }),
                tf.layers.dense({ units: 8, activation: 'relu' }),
                tf.layers.dense({ units: 1, activation: 'sigmoid' })
            ]
        });

        this.model.compile({
            optimizer: tf.train.adam(0.01),
            loss: 'binaryCrossentropy',
            metrics: ['accuracy']
        });
    }

    // Train on user patterns
    async train(data: Array<{ input: number[]; output: number }>) {
        // Prevent concurrent training
        if (!this.model || data.length < 5 || this.isTraining) {
            return false;
        }

        this.isTraining = true;

        try {
            const xs = tf.tensor2d(data.map(d => d.input));
            const ys = tf.tensor2d(data.map(d => [d.output]));

            await this.model.fit(xs, ys, {
                epochs: 50,
                verbose: 0,
            });

            xs.dispose();
            ys.dispose();
            this.trained = true;
            return true;
        } catch (error) {
            console.warn('Training error:', error);
            return false;
        } finally {
            this.isTraining = false;
        }
    }

    // Predict
    predict(input: number[]): number {
        if (!this.model || !this.trained) return 0.5;

        const result = this.model.predict(tf.tensor2d([input])) as tf.Tensor;
        const prediction = result.dataSync()[0];
        result.dispose();
        return prediction;
    }

    // Check if currently training
    getIsTraining(): boolean {
        return this.isTraining;
    }
}

// Productivity Predictor
export class ProductivityAI {
    private learner: PatternLearner;
    private trainingData: Array<{ input: number[]; output: number }> = [];

    constructor() {
        this.learner = new PatternLearner();
        this.loadData();
    }

    private loadData() {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('lifematriz-ai-training');
            if (saved) {
                this.trainingData = JSON.parse(saved);
            }
        }
    }

    private saveData() {
        if (typeof window !== 'undefined') {
            localStorage.setItem('lifematriz-ai-training', JSON.stringify(this.trainingData.slice(-500)));
        }
    }

    // Record a productivity data point
    addDataPoint(data: {
        hourOfDay: number;        // 0-23
        dayOfWeek: number;        // 0-6
        tasksCompleted: number;   // 0-10
        energyLevel: number;      // 0-10
        focusTime: number;        // minutes
        breaks: number;           // count
        sleepHours: number;       // hours
        wasProductive: boolean;   // label
    }) {
        const input = [
            data.hourOfDay / 23,
            data.dayOfWeek / 6,
            data.tasksCompleted / 10,
            data.energyLevel / 10,
            data.focusTime / 480,
            data.breaks / 10,
            data.sleepHours / 12
        ];

        this.trainingData.push({
            input,
            output: data.wasProductive ? 1 : 0
        });

        this.saveData();
    }

    // Train the model
    async train() {
        // Check if learner is already training
        if (this.learner.getIsTraining()) {
            return false; // Skip if already training
        }

        if (this.trainingData.length >= 10) {
            const result = await this.learner.train(this.trainingData);
            return result;
        }
        return false;
    }

    // Predict productivity for given conditions
    predictProductivity(data: {
        hourOfDay: number;
        dayOfWeek: number;
        tasksCompleted: number;
        energyLevel: number;
        focusTime: number;
        breaks: number;
        sleepHours: number;
    }): { probability: number; recommendation: string } {
        const input = [
            data.hourOfDay / 23,
            data.dayOfWeek / 6,
            data.tasksCompleted / 10,
            data.energyLevel / 10,
            data.focusTime / 480,
            data.breaks / 10,
            data.sleepHours / 12
        ];

        const probability = this.learner.predict(input);

        let recommendation = '';
        if (probability > 0.7) {
            recommendation = '🚀 Ótimo momento para tarefas difíceis!';
        } else if (probability > 0.4) {
            recommendation = '⚡ Bom para tarefas moderadas';
        } else {
            recommendation = '😴 Considere descansar ou tarefas leves';
        }

        return { probability, recommendation };
    }

    // Get best hours for productivity
    getBestHours(): number[] {
        const hours: Array<{ hour: number; score: number }> = [];

        for (let h = 6; h < 23; h++) {
            const score = this.learner.predict([
                h / 23, 1 / 6, 0.5, 0.7, 0.5, 0.2, 7 / 12
            ]);
            hours.push({ hour: h, score });
        }

        return hours
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .map(h => h.hour);
    }

    // Get training stats
    getStats() {
        return {
            dataPoints: this.trainingData.length,
            isReady: this.trainingData.length >= 10,
            percentageComplete: Math.min(100, (this.trainingData.length / 10) * 100)
        };
    }
}

// Spending Pattern Predictor
export class SpendingAI {
    private patterns: Map<string, number[]> = new Map();

    constructor() {
        this.loadPatterns();
    }

    private loadPatterns() {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('lifematriz-spending-patterns');
            if (saved) {
                this.patterns = new Map(JSON.parse(saved));
            }
        }
    }

    private savePatterns() {
        if (typeof window !== 'undefined') {
            localStorage.setItem('lifematriz-spending-patterns',
                JSON.stringify(Array.from(this.patterns.entries())));
        }
    }

    // Record spending
    addSpending(category: string, amount: number, dayOfWeek: number) {
        const key = `${category}_${dayOfWeek}`;
        const existing = this.patterns.get(key) || [];
        existing.push(amount);
        this.patterns.set(key, existing.slice(-20));
        this.savePatterns();
    }

    // Predict spending for day/category
    predictSpending(category: string, dayOfWeek: number): {
        predicted: number;
        confidence: number;
        warning: string | null;
    } {
        const key = `${category}_${dayOfWeek}`;
        const data = this.patterns.get(key) || [];

        if (data.length < 3) {
            return { predicted: 0, confidence: 0, warning: null };
        }

        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        const confidence = Math.min(100, data.length * 10);

        let warning = null;
        if (avg > 200) {
            warning = `⚠️ Você costuma gastar R$${avg.toFixed(0)} em ${category} neste dia`;
        }

        return { predicted: avg, confidence, warning };
    }

    // Get spending insights
    getInsights(): string[] {
        const insights: string[] = [];
        const categoryTotals: Map<string, number> = new Map();

        this.patterns.forEach((amounts, key) => {
            const category = key.split('_')[0];
            const total = amounts.reduce((a, b) => a + b, 0);
            categoryTotals.set(category, (categoryTotals.get(category) || 0) + total);
        });

        const sorted = Array.from(categoryTotals.entries()).sort((a, b) => b[1] - a[1]);

        if (sorted.length > 0) {
            insights.push(`💰 Maior gasto: ${sorted[0][0]} (R$${sorted[0][1].toFixed(0)})`);
        }

        return insights;
    }
}

// Habit Success Predictor
export class HabitAI {
    private successRates: Map<string, boolean[]> = new Map();

    constructor() {
        this.loadData();
    }

    private loadData() {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('lifematriz-habit-ai');
            if (saved) {
                this.successRates = new Map(JSON.parse(saved));
            }
        }
    }

    private saveData() {
        if (typeof window !== 'undefined') {
            localStorage.setItem('lifematriz-habit-ai',
                JSON.stringify(Array.from(this.successRates.entries())));
        }
    }

    // Record habit completion
    recordHabit(habitId: string, completed: boolean) {
        const existing = this.successRates.get(habitId) || [];
        existing.push(completed);
        this.successRates.set(habitId, existing.slice(-30));
        this.saveData();
    }

    // Predict success rate
    predictSuccess(habitId: string): number {
        const data = this.successRates.get(habitId) || [];
        if (data.length === 0) return 50;

        const successCount = data.filter(Boolean).length;
        return Math.round((successCount / data.length) * 100);
    }

    // Get at-risk habits (low success rate)
    getAtRiskHabits(): string[] {
        const atRisk: string[] = [];

        this.successRates.forEach((data, habitId) => {
            if (data.length >= 7) {
                const rate = data.filter(Boolean).length / data.length;
                if (rate < 0.5) {
                    atRisk.push(habitId);
                }
            }
        });

        return atRisk;
    }
}

// Global AI instances
let productivityAI: ProductivityAI | null = null;
let spendingAI: SpendingAI | null = null;
let habitAI: HabitAI | null = null;

export function getProductivityAI(): ProductivityAI {
    if (!productivityAI) {
        productivityAI = new ProductivityAI();
    }
    return productivityAI;
}

export function getSpendingAI(): SpendingAI {
    if (!spendingAI) {
        spendingAI = new SpendingAI();
    }
    return spendingAI;
}

export function getHabitAI(): HabitAI {
    if (!habitAI) {
        habitAI = new HabitAI();
    }
    return habitAI;
}
