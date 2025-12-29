'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Clock, TrendingUp, Calendar as CalendarIcon } from 'lucide-react';

interface DayData {
    date: string;
    productiveMinutes: number;
    totalMinutes: number;
    productivityScore: number;
}

export default function WeeklyActivityChart() {
    const [weekData, setWeekData] = useState<DayData[]>([]);
    const [selectedDay, setSelectedDay] = useState<DayData | null>(null);

    useEffect(() => {
        loadWeekData();
    }, []);

    const loadWeekData = () => {
        const data: DayData[] = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            // Try to load from localStorage or generate sample data
            let dayData: DayData;

            try {
                const saved = localStorage.getItem(`lifeos-activity-${dateStr}`);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    dayData = {
                        date: dateStr,
                        productiveMinutes: Math.round((parsed.categories?.productive || 0) / 60),
                        totalMinutes: Object.values(parsed.apps || {}).reduce((sum: number, app: any) =>
                            sum + (app.totalSeconds || 0), 0) / 60,
                        productivityScore: parsed.categoryPercentages?.productive || 0,
                    };
                } else {
                    // Generate sample data for demo
                    dayData = {
                        date: dateStr,
                        productiveMinutes: Math.floor(Math.random() * 180) + 60,
                        totalMinutes: Math.floor(Math.random() * 300) + 120,
                        productivityScore: Math.floor(Math.random() * 40) + 40,
                    };
                }
            } catch (e) {
                dayData = {
                    date: dateStr,
                    productiveMinutes: Math.floor(Math.random() * 180) + 60,
                    totalMinutes: Math.floor(Math.random() * 300) + 120,
                    productivityScore: Math.floor(Math.random() * 40) + 40,
                };
            }

            data.push(dayData);
        }

        setWeekData(data);
        setSelectedDay(data[data.length - 1]); // Select today
    };

    const getDayName = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (dateStr === today.toISOString().split('T')[0]) return 'Hoje';
        if (dateStr === yesterday.toISOString().split('T')[0]) return 'Ontem';

        return date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
    };

    const maxMinutes = Math.max(...weekData.map(d => d.productiveMinutes), 60);

    const avgProductivity = weekData.length > 0
        ? Math.round(weekData.reduce((sum, d) => sum + d.productivityScore, 0) / weekData.length)
        : 0;

    const totalWeekMinutes = weekData.reduce((sum, d) => sum + d.productiveMinutes, 0);

    return (
        <motion.div
            className="glass-card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <BarChart3 size={18} className="text-blue-400" />
                    <h3 className="font-semibold">Atividade da Semana</h3>
                </div>
                <div className="flex gap-4 text-xs">
                    <div className="flex items-center gap-1">
                        <TrendingUp size={14} className="text-green-400" />
                        <span className="text-gray-400">Média:</span>
                        <span className="font-medium text-green-400">{avgProductivity}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock size={14} className="text-teal-400" />
                        <span className="text-gray-400">Total:</span>
                        <span className="font-medium text-teal-400">{Math.round(totalWeekMinutes / 60)}h</span>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="flex items-end justify-between gap-2 h-32 mb-4">
                {weekData.map((day, index) => {
                    const height = (day.productiveMinutes / maxMinutes) * 100;
                    const isSelected = selectedDay?.date === day.date;
                    const isToday = day.date === new Date().toISOString().split('T')[0];

                    return (
                        <motion.div
                            key={day.date}
                            className="flex-1 flex flex-col items-center cursor-pointer"
                            onClick={() => setSelectedDay(day)}
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <motion.div
                                className={`w-full rounded-t-lg transition-all ${isSelected
                                        ? 'bg-gradient-to-t from-teal-500 to-teal-400'
                                        : 'bg-gradient-to-t from-teal-500/50 to-teal-400/30 hover:from-teal-500/70 hover:to-teal-400/50'
                                    }`}
                                initial={{ height: 0 }}
                                animate={{ height: `${height}%` }}
                                transition={{ delay: index * 0.1, duration: 0.5, ease: 'easeOut' }}
                            />
                            <span className={`text-xs mt-2 ${isToday ? 'text-teal-400 font-medium' : 'text-gray-500'
                                }`}>
                                {getDayName(day.date)}
                            </span>
                        </motion.div>
                    );
                })}
            </div>

            {/* Selected day details */}
            {selectedDay && (
                <motion.div
                    key={selectedDay.date}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-white/5 rounded-lg"
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <CalendarIcon size={14} className="text-gray-400" />
                            <span className="text-sm font-medium">
                                {new Date(selectedDay.date).toLocaleDateString('pt-BR', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'short',
                                })}
                            </span>
                        </div>
                        <span className={`text-sm font-medium ${selectedDay.productivityScore >= 60 ? 'text-green-400' :
                                selectedDay.productivityScore >= 40 ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                            {selectedDay.productivityScore}% produtivo
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-500">Tempo focado:</span>
                            <span className="ml-2 font-medium text-teal-400">
                                {Math.floor(selectedDay.productiveMinutes / 60)}h {selectedDay.productiveMinutes % 60}m
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-500">Tempo total:</span>
                            <span className="ml-2 font-medium">
                                {Math.floor(selectedDay.totalMinutes / 60)}h {Math.round(selectedDay.totalMinutes % 60)}m
                            </span>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
