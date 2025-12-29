'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell,
    X,
    Plane,
    ShoppingBag,
    TrendingDown,
    ExternalLink,
    Sparkles,
    Check,
    Clock
} from 'lucide-react';
import { useSettingsStore } from '@/lib/settingsStore';
import { generateUniqueId } from '@/lib/generateId';

interface ProactiveOffer {
    id: string;
    type: 'flight' | 'hotel' | 'product' | 'habit' | 'goal';
    title: string;
    description: string;
    action: string;
    url?: string;
    savings?: number;
    timestamp: Date;
}

// Simulated behavior detection - in real app, this would come from browser extension
const simulatedDetections: ProactiveOffer[] = [
    {
        id: '1',
        type: 'flight',
        title: '✈️ Detectei interesse em voos para Lisboa',
        description: 'Encontrei passagens a partir de R$ 2.847 pela TAP (15% mais barato que a média)',
        action: 'Ver ofertas',
        url: '/search?category=flights&query=lisboa',
        savings: 400,
        timestamp: new Date(),
    },
    {
        id: '2',
        type: 'product',
        title: '📱 iPhone 15 Pro em promoção',
        description: 'O produto que você pesquisou está R$ 1.500 mais barato na Amazon',
        action: 'Ver oferta',
        url: '/search?category=products&query=iphone',
        savings: 1500,
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
    },
    {
        id: '3',
        type: 'habit',
        title: '💧 Lembrete de hidratação',
        description: 'Você está há 2h sem beber água. Meta diária: 500ml restantes.',
        action: 'Marcar como feito',
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
    },
    {
        id: '4',
        type: 'goal',
        title: '🎯 Progresso no objetivo',
        description: 'Você está a 2 tarefas de completar "Documentação para visto"',
        action: 'Ver objetivo',
        url: '/goals',
        timestamp: new Date(Date.now() - 90 * 60 * 1000),
    },
];

export default function ProactiveNotifications() {
    const { enableProactiveAssistant, enableNotifications } = useSettingsStore();
    const [notifications, setNotifications] = useState<ProactiveOffer[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showToast, setShowToast] = useState(false);
    const [currentToast, setCurrentToast] = useState<ProactiveOffer | null>(null);

    useEffect(() => {
        // Simulate receiving proactive notifications
        // In a real app, this would be WebSocket or polling from server

        // Initial load
        const storedNotifs = localStorage.getItem('lifeos-proactive-notifs');
        if (storedNotifs) {
            setNotifications(JSON.parse(storedNotifs));
        } else {
            // First time - show simulated detections
            setNotifications(simulatedDetections);
            setUnreadCount(simulatedDetections.length);
        }

        // Simulate new detection every 2 minutes
        const interval = setInterval(() => {
            const newDetection: ProactiveOffer = {
                id: generateUniqueId('notif-'),
                type: 'flight',
                title: '✈️ Novo alerta de preço baixo!',
                description: 'Passagem para Lisboa caiu para R$ 2.599 (recorde de preço baixo!)',
                action: 'Ver agora',
                url: '/search?category=flights&query=lisboa',
                savings: 650,
                timestamp: new Date(),
            };

            setCurrentToast(newDetection);
            setShowToast(true);
            setNotifications(prev => [newDetection, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Hide toast after 8 seconds
            setTimeout(() => setShowToast(false), 8000);
        }, 120000); // Every 2 minutes

        return () => clearInterval(interval);
    }, []);

    const handleDismiss = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const handleClearAll = () => {
        setNotifications([]);
        setUnreadCount(0);
        setIsOpen(false);
    };

    const handleOpen = () => {
        setIsOpen(true);
        setUnreadCount(0);
    };

    // Don't render if disabled in settings
    if (!enableProactiveAssistant || !enableNotifications) return null;

    return (
        <>
            {/* Notification Bell in Header - This would be in AppLayout */}
            {/* For now, we'll create a floating bell */}
            <motion.button
                className="fixed top-6 right-20 w-10 h-10 rounded-full bg-gray-800 border border-white/10 flex items-center justify-center z-40"
                onClick={handleOpen}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
            >
                <Bell size={18} className="text-gray-300" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </motion.button>

            {/* Toast Notification - appears when new detection happens */}
            <AnimatePresence>
                {showToast && currentToast && (
                    <motion.div
                        className="fixed top-20 right-6 w-96 glass-card p-4 z-50 border-l-4 border-green-500"
                        initial={{ opacity: 0, x: 100, y: -20 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                    >
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                <Sparkles size={20} className="text-green-400" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-sm">{currentToast.title}</p>
                                <p className="text-xs text-gray-400 mt-1">{currentToast.description}</p>
                                {currentToast.savings && (
                                    <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                                        <TrendingDown size={12} />
                                        Economia de R$ {currentToast.savings}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={() => setShowToast(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <div className="flex gap-2 mt-3">
                            <a
                                href={currentToast.url || '#'}
                                className="flex-1 btn-primary text-sm py-2 text-center"
                            >
                                {currentToast.action}
                            </a>
                            <button
                                onClick={() => setShowToast(false)}
                                className="btn-secondary text-sm py-2 px-4"
                            >
                                Depois
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Notifications Panel */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            className="fixed inset-0 bg-black/50 z-40"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Panel */}
                        <motion.div
                            className="fixed top-0 right-0 w-[420px] h-full bg-gray-900 border-l border-white/10 z-50 overflow-hidden flex flex-col"
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25 }}
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-white/10 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold">Assistente Proativo</h2>
                                    <p className="text-sm text-gray-400">Detectei isso para você</p>
                                </div>
                                <button onClick={() => setIsOpen(false)} className="btn-icon">
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Info Banner */}
                            <div className="px-6 py-3 bg-teal-500/10 border-b border-teal-500/30">
                                <p className="text-xs text-teal-400">
                                    💡 <strong>Modo Simulação:</strong> Estas são notificações de exemplo.
                                    Para detecção real, seria necessária uma extensão de navegador.
                                </p>
                            </div>

                            {/* Notifications List */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {notifications.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Bell size={40} className="mx-auto text-gray-600 mb-3" />
                                        <p className="text-gray-400">Nenhuma notificação</p>
                                    </div>
                                ) : (
                                    notifications.map((notif, index) => (
                                        <motion.div
                                            key={notif.id}
                                            className="glass-card p-4"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm">{notif.title}</p>
                                                    <p className="text-xs text-gray-400 mt-1">{notif.description}</p>
                                                    {notif.savings && (
                                                        <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                                                            <TrendingDown size={12} />
                                                            Economia de R$ {notif.savings}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Clock size={10} className="text-gray-500" />
                                                        <span className="text-xs text-gray-500">
                                                            {formatTimeAgo(notif.timestamp)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDismiss(notif.id)}
                                                    className="text-gray-500 hover:text-gray-300"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                            <div className="flex gap-2 mt-3">
                                                {notif.url ? (
                                                    <a
                                                        href={notif.url}
                                                        className="flex-1 btn-primary text-xs py-2 text-center"
                                                        onClick={() => setIsOpen(false)}
                                                    >
                                                        {notif.action}
                                                    </a>
                                                ) : (
                                                    <button
                                                        className="flex-1 btn-primary text-xs py-2"
                                                        onClick={() => handleDismiss(notif.id)}
                                                    >
                                                        <Check size={14} className="mr-1" />
                                                        {notif.action}
                                                    </button>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>

                            {/* Footer */}
                            {notifications.length > 0 && (
                                <div className="p-4 border-t border-white/10">
                                    <button
                                        onClick={handleClearAll}
                                        className="w-full btn-secondary text-sm"
                                    >
                                        Limpar todas
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'agora';
    if (minutes < 60) return `${minutes}min atrás`;
    if (hours < 24) return `${hours}h atrás`;
    return new Date(date).toLocaleDateString('pt-BR');
}
