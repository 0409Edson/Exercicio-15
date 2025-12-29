'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Plus,
    Clock,
    MapPin,
    Tag,
    Users,
    Zap,
    Sun,
    Moon,
    Coffee
} from 'lucide-react';

interface Event {
    id: string;
    title: string;
    time: string;
    duration: string;
    type: 'task' | 'meeting' | 'focus' | 'break' | 'personal';
    location?: string;
    energy: 'high' | 'medium' | 'low';
}

const eventColors = {
    task: 'bg-teal-500/20 border-teal-500/50 text-teal-400',
    meeting: 'bg-purple-500/20 border-purple-500/50 text-purple-400',
    focus: 'bg-blue-500/20 border-blue-500/50 text-blue-400',
    break: 'bg-green-500/20 border-green-500/50 text-green-400',
    personal: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
};

const energyIcons = {
    high: <Zap size={14} className="text-yellow-400" />,
    medium: <Sun size={14} className="text-orange-400" />,
    low: <Moon size={14} className="text-blue-400" />,
};

// Eventos mockados para hoje
const todayEvents: Event[] = [
    { id: '1', title: 'Morning Focus - Estudar React', time: '08:00', duration: '2h', type: 'focus', energy: 'high' },
    { id: '2', title: 'Daily Standup', time: '10:00', duration: '15min', type: 'meeting', location: 'Meet', energy: 'medium' },
    { id: '3', title: 'Pausa para Café', time: '10:30', duration: '15min', type: 'break', energy: 'low' },
    { id: '4', title: 'Deep Work - Projeto LifeOS', time: '11:00', duration: '2h', type: 'focus', energy: 'high' },
    { id: '5', title: 'Almoço', time: '13:00', duration: '1h', type: 'personal', energy: 'low' },
    { id: '6', title: 'Revisão de PRs', time: '14:00', duration: '1h', type: 'task', energy: 'medium' },
    { id: '7', title: 'Reunião com cliente', time: '15:00', duration: '1h', type: 'meeting', location: 'Zoom', energy: 'medium' },
    { id: '8', title: 'Exercício físico', time: '18:00', duration: '1h', type: 'personal', energy: 'high' },
];

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days: (number | null)[] = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(i);

        return days;
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentDate(new Date(currentDate.setMonth(
            currentDate.getMonth() + (direction === 'next' ? 1 : -1)
        )));
    };

    const isToday = (day: number) => {
        const today = new Date();
        return day === today.getDate() &&
            currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear();
    };

    const isSelected = (day: number) => {
        return day === selectedDate.getDate() &&
            currentDate.getMonth() === selectedDate.getMonth() &&
            currentDate.getFullYear() === selectedDate.getFullYear();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Agenda Inteligente</h1>
                    <p className="text-gray-400 mt-1">Organize sua rotina de forma otimizada pela IA</p>
                </div>
                <motion.button
                    className="btn-primary flex items-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Plus size={18} />
                    <span>Novo Evento</span>
                </motion.button>
            </div>

            {/* Energy Indicator */}
            <motion.div
                className="glass-card p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Coffee size={20} className="text-teal-400" />
                        <span className="font-medium">Seu nível de energia:</span>
                    </div>
                    <div className="flex-1">
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full w-3/4 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full" />
                        </div>
                    </div>
                    <span className="text-teal-400 font-medium">Alto</span>
                </div>
                <p className="text-sm text-gray-400 mt-2">
                    ⚡ Suas próximas 3h são ideais para trabalho focado. Aproveite para tarefas que exigem concentração.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar */}
                <motion.div
                    className="glass-card p-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-semibold text-lg">
                            {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                        </h3>
                        <div className="flex gap-2">
                            <button
                                className="btn-icon w-8 h-8"
                                onClick={() => navigateMonth('prev')}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                className="btn-icon w-8 h-8"
                                onClick={() => navigateMonth('next')}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Week Days */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {weekDays.map(day => (
                            <div key={day} className="text-center text-xs text-gray-500 font-medium py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {getDaysInMonth(currentDate).map((day, index) => (
                            <button
                                key={index}
                                className={`
                  aspect-square rounded-lg flex items-center justify-center text-sm transition-all
                  ${day === null ? 'invisible' : 'hover:bg-white/10'}
                  ${isToday(day!) ? 'bg-teal-500 text-white font-bold' : ''}
                  ${isSelected(day!) && !isToday(day!) ? 'bg-white/20 ring-1 ring-teal-500' : ''}
                `}
                                onClick={() => day && setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                                disabled={day === null}
                            >
                                {day}
                            </button>
                        ))}
                    </div>

                    {/* Legend */}
                    <div className="mt-6 pt-4 border-t border-white/10">
                        <p className="text-xs text-gray-500 mb-3">Tipos de evento:</p>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(eventColors).map(([type, classes]) => (
                                <span key={type} className={`px-2 py-1 rounded text-xs border ${classes}`}>
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </span>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Today's Schedule */}
                <motion.div
                    className="lg:col-span-2 glass-card p-6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-semibold text-lg">Hoje, {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}</h3>
                            <p className="text-sm text-gray-400">{todayEvents.length} eventos programados</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="btn-secondary text-sm">Dia</button>
                            <button className="text-sm px-3 py-1.5 text-gray-400 hover:text-white transition-colors">Semana</button>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                        {todayEvents.map((event, index) => (
                            <motion.div
                                key={event.id}
                                className="flex gap-4 group"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                {/* Time Column */}
                                <div className="w-16 flex-shrink-0 text-right pt-4">
                                    <span className="text-sm font-bold text-teal-400">{event.time}</span>
                                </div>

                                {/* Timeline Dot */}
                                <div className="flex flex-col items-center">
                                    <div className="w-3 h-3 rounded-full bg-teal-500 mt-4 flex-shrink-0" />
                                    <div className="w-0.5 flex-1 bg-white/20" />
                                </div>

                                {/* Event Card */}
                                <div className={`flex-1 p-4 rounded-lg border-l-4 ${eventColors[event.type]} bg-white/10 hover:bg-white/15 transition-colors cursor-pointer mb-2`}>
                                    <h4 className="font-semibold text-white text-base">{event.title}</h4>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-300">
                                        <span className="flex items-center gap-1">
                                            <Clock size={14} />
                                            {event.duration}
                                        </span>
                                        {event.location && (
                                            <span className="flex items-center gap-1">
                                                <MapPin size={14} />
                                                {event.location}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1">
                                            {energyIcons[event.energy]}
                                            Energia {event.energy === 'high' ? 'Alta' : event.energy === 'medium' ? 'Média' : 'Baixa'}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* AI Suggestion */}
                    <div className="mt-6 pt-4 border-t border-white/10">
                        <div className="flex items-center gap-2 text-sm">
                            <Zap size={16} className="text-yellow-400" />
                            <span className="text-gray-400">
                                <strong className="text-white">Sugestão da IA:</strong> Adicione uma pausa de 15min às 16:30 para manter a produtividade.
                            </span>
                            <button className="text-teal-400 font-medium hover:text-teal-300">Adicionar</button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
