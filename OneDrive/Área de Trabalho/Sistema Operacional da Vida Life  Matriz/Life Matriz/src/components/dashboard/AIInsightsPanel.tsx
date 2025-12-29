'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Zap, Target, AlertTriangle, Sparkles } from 'lucide-react';
import { getProductivityAI, getSpendingAI, getHabitAI } from '@/lib/tensorflowAI';

export default function AIInsightsPanel() {
    const [productivityPrediction, setProductivityPrediction] = useState<{
        probability: number;
        recommendation: string;
    } | null>(null);
    const [bestHours, setBestHours] = useState<number[]>([]);
    const [spendingInsights, setSpendingInsights] = useState<string[]>([]);
    const [aiStats, setAiStats] = useState({ dataPoints: 0, isReady: false, percentageComplete: 0 });
    const [isLearning, setIsLearning] = useState(false);
    const isTrainingRef = useRef(false); // Ref to track training state across re-renders

    useEffect(() => {
        loadAIData();

        // Auto-train periodically (every 2 minutes to reduce conflicts)
        const interval = setInterval(() => {
            trainAI();
        }, 120000); // Every 2 minutes instead of 1

        return () => clearInterval(interval);
    }, []);

    const loadAIData = () => {
        try {
            const productivityAI = getProductivityAI();
            const spendingAI = getSpendingAI();

            const now = new Date();
            const prediction = productivityAI.predictProductivity({
                hourOfDay: now.getHours(),
                dayOfWeek: now.getDay(),
                tasksCompleted: 0,
                energyLevel: 7,
                focusTime: 0,
                breaks: 0,
                sleepHours: 7
            });

            setProductivityPrediction(prediction);
            setBestHours(productivityAI.getBestHours());
            setSpendingInsights(spendingAI.getInsights());
            setAiStats(productivityAI.getStats());
        } catch (e) {
            console.error('AI Error:', e);
        }
    };

    const trainAI = async () => {
        // Prevent concurrent training using ref
        if (isTrainingRef.current) {
            return;
        }

        isTrainingRef.current = true;
        setIsLearning(true);

        try {
            const productivityAI = getProductivityAI();
            await productivityAI.train();
            loadAIData();
        } catch (e) {
            console.error('Training error:', e);
        } finally {
            isTrainingRef.current = false;
            setIsLearning(false);
        }
    };

    const addSampleData = () => {
        const productivityAI = getProductivityAI();
        const now = new Date();

        // Add current moment as a data point
        productivityAI.addDataPoint({
            hourOfDay: now.getHours(),
            dayOfWeek: now.getDay(),
            tasksCompleted: Math.floor(Math.random() * 5) + 1,
            energyLevel: Math.floor(Math.random() * 4) + 6,
            focusTime: Math.floor(Math.random() * 120) + 30,
            breaks: Math.floor(Math.random() * 3),
            sleepHours: Math.floor(Math.random() * 2) + 6,
            wasProductive: Math.random() > 0.3
        });

        loadAIData();
    };

    return (
        <motion.div
            className="glass-card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                        <Brain size={20} className="text-purple-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold">IA Aprendendo</h3>
                        <p className="text-xs text-gray-400">
                            {isLearning ? (
                                <span className="text-purple-400">🔄 Treinando...</span>
                            ) : aiStats.isReady ? (
                                <span className="text-green-400">✅ Pronta</span>
                            ) : (
                                <span>{aiStats.percentageComplete.toFixed(0)}% dos dados necessários</span>
                            )}
                        </p>
                    </div>
                </div>
                <button
                    onClick={addSampleData}
                    className="btn-icon bg-purple-500/20 text-purple-400"
                    title="Adicionar dados"
                >
                    <Sparkles size={16} />
                </button>
            </div>

            {/* Training Progress */}
            {!aiStats.isReady && (
                <div className="mb-4">
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${aiStats.percentageComplete}%` }}
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        {aiStats.dataPoints}/10 pontos de dados para começar
                    </p>
                </div>
            )}

            {/* Productivity Prediction */}
            {productivityPrediction && (
                <div className="mb-4 p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <Zap size={16} className="text-yellow-400" />
                        <span className="text-sm font-medium">Produtividade Agora</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">
                            {(productivityPrediction.probability * 100).toFixed(0)}%
                        </span>
                        <span className="text-xs text-gray-400 max-w-[60%] text-right">
                            {productivityPrediction.recommendation}
                        </span>
                    </div>
                </div>
            )}

            {/* Best Hours */}
            {bestHours.length > 0 && aiStats.isReady && (
                <div className="mb-4 p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={16} className="text-green-400" />
                        <span className="text-sm font-medium">Seus Melhores Horários</span>
                    </div>
                    <div className="flex gap-2">
                        {bestHours.map((hour, i) => (
                            <span
                                key={hour}
                                className={`px-3 py-1 rounded-lg text-sm ${i === 0
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-white/10 text-gray-400'
                                    }`}
                            >
                                {hour}:00
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Spending Insights */}
            {spendingInsights.length > 0 && (
                <div className="p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <Target size={16} className="text-teal-400" />
                        <span className="text-sm font-medium">Insights Financeiros</span>
                    </div>
                    {spendingInsights.map((insight, i) => (
                        <p key={i} className="text-xs text-gray-400">{insight}</p>
                    ))}
                </div>
            )}

            {/* Data Info */}
            <div className="mt-4 pt-4 border-t border-white/10 text-center">
                <p className="text-xs text-gray-500">
                    📊 {aiStats.dataPoints} pontos coletados • A IA melhora com uso
                </p>
            </div>
        </motion.div>
    );
}
