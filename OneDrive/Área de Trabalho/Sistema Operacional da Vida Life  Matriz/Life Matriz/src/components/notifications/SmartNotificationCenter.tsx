'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Clock, Zap, Target, Brain } from 'lucide-react';

interface SmartNotification {
    id: string;
    type: 'reminder' | 'achievement' | 'insight' | 'warning';
    title: string;
    message: string;
    icon: string;
    timestamp: Date;
    read: boolean;
    action?: {
        label: string;
        href: string;
    };
}

export default function SmartNotificationCenter() {
    const [notifications, setNotifications] = useState<SmartNotification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const generateSmartNotifications = useCallback(() => {
        const now = new Date();
        const hour = now.getHours();
        const newNotifications: SmartNotification[] = [];

        // Morning motivation
        if (hour >= 6 && hour < 9) {
            newNotifications.push({
                id: 'morning-1',
                type: 'reminder',
                title: 'Bom dia! 🌅',
                message: 'Um novo dia de oportunidades. Que tal revisar suas metas?',
                icon: '☀️',
                timestamp: now,
                read: false,
                action: { label: 'Ver metas', href: '/goals' }
            });
        }

        // Lunch break reminder
        if (hour >= 12 && hour < 13) {
            newNotifications.push({
                id: 'lunch-break',
                type: 'reminder',
                title: 'Hora do almoço! 🍽️',
                message: 'Faça uma pausa. Comer bem melhora sua produtividade.',
                icon: '🍽️',
                timestamp: now,
                read: false,
            });
        }

        // End of day review
        if (hour >= 18 && hour < 20) {
            newNotifications.push({
                id: 'day-review',
                type: 'insight',
                title: 'Revise seu dia 📝',
                message: 'Escreva no diário sobre suas conquistas de hoje.',
                icon: '📝',
                timestamp: now,
                read: false,
                action: { label: 'Abrir diário', href: '/journal' }
            });
        }

        // Check habits
        try {
            const habitsData = localStorage.getItem('habit-store');
            if (habitsData) {
                const habits = JSON.parse(habitsData);
                const today = now.toISOString().split('T')[0];
                const pendingHabits = habits.state?.habits?.filter((h: any) =>
                    !h.completedDates?.includes(today)
                ) || [];

                if (pendingHabits.length > 0 && hour >= 10) {
                    newNotifications.push({
                        id: 'habits-pending',
                        type: 'warning',
                        title: `${pendingHabits.length} hábitos pendentes`,
                        message: 'Não quebre sua sequência! Complete seus hábitos.',
                        icon: '⚡',
                        timestamp: now,
                        read: false,
                        action: { label: 'Ver hábitos', href: '/habits' }
                    });
                }
            }
        } catch (e) { }

        // AI learning progress
        if (typeof window !== 'undefined') {
            const win = window as any;
            if (win.__activitySummary?.topInterests?.length > 0) {
                const topInterest = win.__activitySummary.topInterests[0];
                newNotifications.push({
                    id: 'ai-learning',
                    type: 'insight',
                    title: 'IA aprendendo! 🧠',
                    message: `Detectei que você gosta de ${topInterest.topic}. Vou personalizar suas recomendações.`,
                    icon: '🧠',
                    timestamp: now,
                    read: false,
                    action: { label: 'Ver insights', href: '/insights' }
                });
            }
        }

        // Merge with existing, avoiding duplicates
        setNotifications(prev => {
            const existingIds = prev.map(n => n.id);
            const unique = newNotifications.filter(n => !existingIds.includes(n.id));
            return [...unique, ...prev].slice(0, 20);
        });
    }, []);

    useEffect(() => {
        // Load saved notifications
        const saved = localStorage.getItem('lifeos-notifications');
        if (saved) {
            try {
                setNotifications(JSON.parse(saved));
            } catch (e) { }
        }

        // Generate new ones
        generateSmartNotifications();

        // Update every 5 minutes
        const interval = setInterval(generateSmartNotifications, 300000);
        return () => clearInterval(interval);
    }, [generateSmartNotifications]);

    useEffect(() => {
        // Save and count unread
        localStorage.setItem('lifeos-notifications', JSON.stringify(notifications));
        setUnreadCount(notifications.filter(n => !n.read).length);
    }, [notifications]);

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const clearAll = () => {
        setNotifications([]);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
                <Bell size={20} className={unreadCount > 0 ? 'text-teal-400' : 'text-gray-400'} />
                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center"
                    >
                        {unreadCount}
                    </motion.span>
                )}
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 top-12 w-80 max-h-96 overflow-y-auto glass-card border border-white/10 rounded-xl shadow-2xl z-50"
                    >
                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                            <h3 className="font-semibold">Notificações</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-teal-400 hover:text-teal-300"
                                >
                                    Marcar lidas
                                </button>
                                <button
                                    onClick={clearAll}
                                    className="text-xs text-gray-400 hover:text-gray-300"
                                >
                                    Limpar
                                </button>
                            </div>
                        </div>

                        <div className="divide-y divide-white/5">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <Bell size={32} className="mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">Nenhuma notificação</p>
                                </div>
                            ) : (
                                notifications.slice(0, 10).map((notif) => (
                                    <motion.div
                                        key={notif.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className={`p-4 hover:bg-white/5 cursor-pointer ${!notif.read ? 'bg-teal-500/5' : ''
                                            }`}
                                        onClick={() => {
                                            markAsRead(notif.id);
                                            if (notif.action) {
                                                window.location.href = notif.action.href;
                                            }
                                        }}
                                    >
                                        <div className="flex gap-3">
                                            <span className="text-2xl">{notif.icon}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-medium ${!notif.read ? 'text-white' : 'text-gray-300'
                                                    }`}>
                                                    {notif.title}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                    {notif.message}
                                                </p>
                                                {notif.action && (
                                                    <span className="text-xs text-teal-400 mt-2 inline-block">
                                                        {notif.action.label} →
                                                    </span>
                                                )}
                                            </div>
                                            {!notif.read && (
                                                <div className="w-2 h-2 bg-teal-400 rounded-full flex-shrink-0 mt-2" />
                                            )}
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
