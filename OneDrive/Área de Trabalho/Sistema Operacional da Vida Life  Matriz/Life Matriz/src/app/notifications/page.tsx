'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell,
    BellOff,
    Check,
    Trash2,
    Clock,
    Target,
    Heart,
    Info,
    AlertTriangle,
    CheckCircle,
    X,
    Settings
} from 'lucide-react';
import { useNotificationStore, type Notification } from '@/lib/notificationStore';

export default function NotificationsPage() {
    const {
        notifications,
        permission,
        pushEnabled,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        requestPermission,
        setPushEnabled,
        addNotification,
    } = useNotificationStore();

    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const filteredNotifications = notifications.filter((n) =>
        filter === 'all' ? true : !n.read
    );

    const unreadCount = notifications.filter((n) => !n.read).length;

    const getTypeIcon = (type: Notification['type']) => {
        switch (type) {
            case 'success': return <CheckCircle size={18} className="text-green-400" />;
            case 'warning': return <AlertTriangle size={18} className="text-yellow-400" />;
            case 'reminder': return <Clock size={18} className="text-blue-400" />;
            case 'goal': return <Target size={18} className="text-purple-400" />;
            case 'health': return <Heart size={18} className="text-red-400" />;
            default: return <Info size={18} className="text-teal-400" />;
        }
    };

    const getTypeBg = (type: Notification['type']) => {
        switch (type) {
            case 'success': return 'bg-green-500/20';
            case 'warning': return 'bg-yellow-500/20';
            case 'reminder': return 'bg-blue-500/20';
            case 'goal': return 'bg-purple-500/20';
            case 'health': return 'bg-red-500/20';
            default: return 'bg-teal-500/20';
        }
    };

    const sendTestNotification = () => {
        addNotification({
            title: '🎉 Notificação de Teste',
            body: 'As notificações do LifeOS estão funcionando perfeitamente!',
            type: 'success',
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Bell className="text-teal-400" />
                        Central de Notificações
                    </h1>
                    <p className="text-gray-400 mt-1">
                        {unreadCount > 0 ? `${unreadCount} não lida(s)` : 'Todas as notificações lidas'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={sendTestNotification}
                        className="btn-secondary text-sm"
                    >
                        Testar
                    </button>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="btn-secondary text-sm"
                        >
                            Marcar todas como lidas
                        </button>
                    )}
                </div>
            </div>

            {/* Permission Banner */}
            {permission !== 'granted' && (
                <motion.div
                    className="glass-card p-4 border border-yellow-500/30"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                                <BellOff size={20} className="text-yellow-400" />
                            </div>
                            <div>
                                <p className="font-medium">Notificações desativadas</p>
                                <p className="text-sm text-gray-400">
                                    Ative para receber lembretes e alertas
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={requestPermission}
                            className="btn-primary"
                        >
                            Ativar
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Settings */}
            <motion.div
                className="glass-card p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Settings size={20} className="text-gray-400" />
                        <span>Notificações Push</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={pushEnabled}
                            onChange={(e) => setPushEnabled(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:ring-2 peer-focus:ring-teal-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                    </label>
                </div>
            </motion.div>

            {/* Filters */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${filter === 'all' ? 'bg-teal-500 text-white' : 'bg-white/5 hover:bg-white/10'
                        }`}
                >
                    Todas ({notifications.length})
                </button>
                <button
                    onClick={() => setFilter('unread')}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${filter === 'unread' ? 'bg-teal-500 text-white' : 'bg-white/5 hover:bg-white/10'
                        }`}
                >
                    Não lidas ({unreadCount})
                </button>
                {notifications.length > 0 && (
                    <button
                        onClick={clearAll}
                        className="ml-auto text-sm text-red-400 hover:text-red-300"
                    >
                        Limpar tudo
                    </button>
                )}
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                    {filteredNotifications.length === 0 ? (
                        <motion.div
                            className="text-center py-12"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <Bell size={48} className="mx-auto text-gray-600 mb-4" />
                            <p className="text-gray-400">
                                {filter === 'unread' ? 'Nenhuma notificação não lida' : 'Nenhuma notificação'}
                            </p>
                        </motion.div>
                    ) : (
                        filteredNotifications.map((notification, index) => (
                            <motion.div
                                key={notification.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.03 }}
                                className={`glass-card p-4 ${!notification.read ? 'border-l-4 border-teal-500' : ''}`}
                                onClick={() => !notification.read && markAsRead(notification.id)}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className={`w-10 h-10 rounded-lg ${getTypeBg(notification.type)} flex items-center justify-center flex-shrink-0`}>
                                            {getTypeIcon(notification.type)}
                                        </div>
                                        <div>
                                            <p className={`font-medium ${notification.read ? 'text-gray-400' : ''}`}>
                                                {notification.title}
                                            </p>
                                            <p className="text-sm text-gray-400 mt-1">{notification.body}</p>
                                            <p className="text-xs text-gray-500 mt-2">
                                                {new Date(notification.timestamp).toLocaleString('pt-BR')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {!notification.read && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    markAsRead(notification.id);
                                                }}
                                                className="btn-icon text-teal-400"
                                                title="Marcar como lida"
                                            >
                                                <Check size={16} />
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteNotification(notification.id);
                                            }}
                                            className="btn-icon text-gray-400 hover:text-red-400"
                                            title="Excluir"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
