'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Play, Pause, RotateCcw, Coffee, Zap, Check } from 'lucide-react';

type SessionType = 'focus' | 'shortBreak' | 'longBreak';

interface PomodoroSession {
    type: SessionType;
    startTime: Date;
    duration: number;
    completed: boolean;
}

const DURATIONS = {
    focus: 25 * 60,      // 25 minutes
    shortBreak: 5 * 60,  // 5 minutes
    longBreak: 15 * 60,  // 15 minutes
};

export default function PomodoroTimer() {
    const [sessionType, setSessionType] = useState<SessionType>('focus');
    const [timeLeft, setTimeLeft] = useState(DURATIONS.focus);
    const [isRunning, setIsRunning] = useState(false);
    const [sessionsCompleted, setSessionsCompleted] = useState(0);
    const [showNotification, setShowNotification] = useState(false);

    useEffect(() => {
        // Load saved sessions
        const saved = localStorage.getItem('lifeos-pomodoro-sessions');
        if (saved) {
            const today = new Date().toISOString().split('T')[0];
            const data = JSON.parse(saved);
            if (data.date === today) {
                setSessionsCompleted(data.count || 0);
            }
        }
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            handleSessionComplete();
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isRunning, timeLeft]);

    const handleSessionComplete = useCallback(() => {
        setIsRunning(false);
        setShowNotification(true);

        // Play notification sound (optional)
        try {
            const audio = new Audio('/notification.mp3');
            audio.play().catch(() => { });
        } catch (e) { }

        if (sessionType === 'focus') {
            const newCount = sessionsCompleted + 1;
            setSessionsCompleted(newCount);

            // Save to localStorage
            localStorage.setItem('lifeos-pomodoro-sessions', JSON.stringify({
                date: new Date().toISOString().split('T')[0],
                count: newCount,
            }));

            // Every 4 sessions, suggest a long break
            if (newCount % 4 === 0) {
                setSessionType('longBreak');
                setTimeLeft(DURATIONS.longBreak);
            } else {
                setSessionType('shortBreak');
                setTimeLeft(DURATIONS.shortBreak);
            }
        } else {
            setSessionType('focus');
            setTimeLeft(DURATIONS.focus);
        }

        // Hide notification after 5 seconds
        setTimeout(() => setShowNotification(false), 5000);
    }, [sessionType, sessionsCompleted]);

    const toggleTimer = () => {
        setIsRunning(!isRunning);
    };

    const resetTimer = () => {
        setIsRunning(false);
        setTimeLeft(DURATIONS[sessionType]);
    };

    const switchSession = (type: SessionType) => {
        setSessionType(type);
        setTimeLeft(DURATIONS[type]);
        setIsRunning(false);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = ((DURATIONS[sessionType] - timeLeft) / DURATIONS[sessionType]) * 100;

    const getSessionColor = () => {
        switch (sessionType) {
            case 'focus': return 'teal';
            case 'shortBreak': return 'blue';
            case 'longBreak': return 'purple';
        }
    };

    return (
        <motion.div
            className="glass-card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Session notification */}
            <AnimatePresence>
                {showNotification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`absolute -top-2 left-0 right-0 mx-4 p-3 rounded-lg text-center text-sm font-medium ${sessionType === 'focus'
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            }`}
                    >
                        {sessionType === 'shortBreak' || sessionType === 'longBreak'
                            ? '🎉 Sessão de foco concluída! Hora de uma pausa.'
                            : '☕ Pausa encerrada! Pronto para focar?'}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Timer size={20} className={`text-${getSessionColor()}-400`} />
                    <h3 className="font-semibold">Pomodoro</h3>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded-full">
                    <Zap size={14} className="text-orange-400" />
                    <span className="text-xs font-medium">{sessionsCompleted} sessões</span>
                </div>
            </div>

            {/* Session type buttons */}
            <div className="flex gap-2 mb-6">
                {(['focus', 'shortBreak', 'longBreak'] as SessionType[]).map((type) => (
                    <button
                        key={type}
                        onClick={() => switchSession(type)}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${sessionType === type
                                ? type === 'focus'
                                    ? 'bg-teal-500/20 text-teal-400 border border-teal-500/50'
                                    : type === 'shortBreak'
                                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                                        : 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                    >
                        {type === 'focus' ? '🎯 Foco' : type === 'shortBreak' ? '☕ Pausa' : '🧘 Longa'}
                    </button>
                ))}
            </div>

            {/* Timer display */}
            <div className="relative mb-6">
                {/* Progress ring */}
                <svg className="w-32 h-32 mx-auto transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        className="text-white/10"
                    />
                    <motion.circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 45}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                        animate={{
                            strokeDashoffset: 2 * Math.PI * 45 * (1 - progress / 100)
                        }}
                        className={`text-${getSessionColor()}-500`}
                    />
                </svg>

                {/* Time display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold font-mono">{formatTime(timeLeft)}</span>
                    <span className="text-xs text-gray-500 mt-1">
                        {sessionType === 'focus' ? 'Focando' :
                            sessionType === 'shortBreak' ? 'Pausa curta' : 'Pausa longa'}
                    </span>
                </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4">
                <button
                    onClick={resetTimer}
                    className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                    title="Reiniciar"
                >
                    <RotateCcw size={18} className="text-gray-400" />
                </button>

                <motion.button
                    onClick={toggleTimer}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isRunning
                            ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                            : `bg-${getSessionColor()}-500/20 hover:bg-${getSessionColor()}-500/30 text-${getSessionColor()}-400`
                        }`}
                    whileTap={{ scale: 0.95 }}
                    title={isRunning ? 'Pausar' : 'Iniciar'}
                >
                    {isRunning ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                </motion.button>

                <button
                    onClick={() => switchSession(sessionType === 'focus' ? 'shortBreak' : 'focus')}
                    className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                    title="Próxima sessão"
                >
                    <Check size={18} className="text-gray-400" />
                </button>
            </div>

            {/* Tip */}
            <p className="text-center text-xs text-gray-500 mt-4">
                {isRunning
                    ? sessionType === 'focus'
                        ? '🧠 Mantenha o foco! Evite distrações.'
                        : '😌 Relaxe, alongue-se ou tome água.'
                    : 'Clique para iniciar uma sessão de foco'}
            </p>
        </motion.div>
    );
}
