'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Activity,
    Monitor,
    Clock,
    TrendingUp,
    Play,
    Pause,
    RefreshCw,
    AlertCircle
} from 'lucide-react';

interface AppUsage {
    name: string;
    totalSeconds: number;
    totalMinutes: number;
    formattedTime: string;
    category?: string;
}

interface WebsiteUsage {
    domain: string;
    totalSeconds: number;
    totalMinutes: number;
    formattedTime: string;
    visits: number;
    category?: string;
}

interface CategoryData {
    productive: number;
    entertainment: number;
    social: number;
    other: number;
}

interface ActivitySummary {
    date: string;
    totalTime: string;
    totalMinutes: number;
    apps: AppUsage[];
    websites?: WebsiteUsage[];
    webHistory?: Array<{ domain: string; title: string; timestamp: string; duration: number; category: string }>;
    categories?: CategoryData;
    categoryPercentages?: CategoryData;
    currentApp: string | null;
    currentUrl?: string | null;
    isTracking: boolean;
}

// Check if running in Electron
function isElectron(): boolean {
    if (typeof window === 'undefined') return false;

    // Check for Electron-specific globals
    const win = window as any;
    return !!(win.process && win.process.versions && win.process.versions.electron) ||
        !!(win.electronAPI) ||
        !!(win.activityAPI);
}

// Get activity API from Electron (exposed via preload or global)
function getActivityAPI() {
    if (typeof window === 'undefined') return null;
    const win = window as any;

    // Try different ways to access the API
    if (win.activityAPI) {
        return win.activityAPI as {
            getSummary: () => ActivitySummary;
            start: () => void;
            stop: () => void;
            isTracking: () => boolean;
        };
    }

    return null;
}

export default function ActivityTracker() {
    const [summary, setSummary] = useState<ActivitySummary | null>(null);
    const [isElectronMode, setIsElectronMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const electron = isElectron();
        setIsElectronMode(electron);

        if (electron) {
            fetchActivity();
            // Update every 10 seconds
            const interval = setInterval(fetchActivity, 10000);
            return () => clearInterval(interval);
        } else {
            setIsLoading(false);
        }
    }, []);

    const fetchActivity = () => {
        const api = getActivityAPI();
        if (api) {
            const data = api.getSummary();
            setSummary(data);
        }
        setIsLoading(false);
    };

    const toggleTracking = () => {
        const api = getActivityAPI();
        if (api && summary) {
            if (summary.isTracking) {
                api.stop();
            } else {
                api.start();
            }
            fetchActivity();
        }
    };

    // Show message if not in Electron mode
    if (!isElectronMode && !isLoading) {
        return (
            <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                        <AlertCircle size={20} className="text-orange-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold">Rastreamento de Atividades</h3>
                        <p className="text-sm text-gray-400">Disponível apenas no modo Desktop</p>
                    </div>
                </div>
                <p className="text-sm text-gray-500">
                    Para rastrear suas atividades, execute o Life Matriz como aplicativo desktop via Electron.
                </p>
                <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                    <p className="text-xs text-blue-400">
                        💡 Para usar: <code className="bg-white/10 px-1 rounded">cd electron && npm start</code>
                    </p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="glass-card p-6 flex items-center justify-center">
                <RefreshCw size={20} className="animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <motion.div
            className="glass-card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center">
                        <Activity size={20} className="text-teal-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold">Atividades do PC</h3>
                        <p className="text-sm text-gray-400">
                            {summary?.isTracking ? (
                                <span className="text-green-400">● Rastreando</span>
                            ) : (
                                <span className="text-gray-500">○ Pausado</span>
                            )}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchActivity} className="btn-icon" title="Atualizar">
                        <RefreshCw size={16} />
                    </button>
                    <button
                        onClick={toggleTracking}
                        className={`btn-icon ${summary?.isTracking ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}
                        title={summary?.isTracking ? 'Pausar' : 'Iniciar'}
                    >
                        {summary?.isTracking ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                </div>
            </div>

            {/* Current App */}
            {summary?.currentApp && (
                <div className="mb-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                    <div className="flex items-center gap-2">
                        <Monitor size={16} className="text-purple-400" />
                        <span className="text-sm text-gray-400">App atual:</span>
                        <span className="text-sm font-medium text-purple-300">{summary.currentApp}</span>
                    </div>
                </div>
            )}

            {/* Total Time */}
            <div className="flex items-center gap-2 mb-4">
                <Clock size={16} className="text-gray-400" />
                <span className="text-sm text-gray-400">Tempo total hoje:</span>
                <span className="text-lg font-bold text-teal-400">{summary?.totalTime || '0m'}</span>
            </div>

            {/* Apps List */}
            <div className="space-y-2 mb-4">
                <h4 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <TrendingUp size={14} />
                    Top Aplicativos
                </h4>
                {summary?.apps.slice(0, 5).map((app, index) => (
                    <motion.div
                        key={app.name}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <div className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                                index === 1 ? 'bg-gray-400/20 text-gray-300' :
                                    index === 2 ? 'bg-orange-500/20 text-orange-400' :
                                        'bg-white/10 text-gray-400'
                                }`}>
                                {index + 1}
                            </span>
                            <span className="text-sm font-medium">{app.name}</span>
                        </div>
                        <span className="text-sm text-teal-400 font-medium">{app.formattedTime}</span>
                    </motion.div>
                ))}
                {(!summary?.apps || summary.apps.length === 0) && (
                    <p className="text-sm text-gray-500 text-center py-4">
                        Nenhuma atividade registrada ainda
                    </p>
                )}
            </div>

            {/* Websites Section */}
            {summary?.websites && summary.websites.length > 0 && (
                <div className="space-y-2 mb-4">
                    <h4 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                        🌐 Top Sites Visitados
                    </h4>
                    {summary.websites.slice(0, 5).map((site, index) => (
                        <motion.div
                            key={site.domain}
                            className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-blue-300">{site.domain}</span>
                                <span className="text-xs text-gray-500">({site.visits} visitas)</span>
                            </div>
                            <span className="text-sm text-blue-400 font-medium">{site.formattedTime}</span>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Current URL */}
            {summary?.currentUrl && (
                <div className="mb-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                    <div className="flex items-center gap-2">
                        <span className="text-sm">🌐</span>
                        <span className="text-sm text-gray-400">Site atual:</span>
                        <span className="text-sm font-medium text-blue-300 truncate">{summary.currentUrl}</span>
                    </div>
                </div>
            )}

            {/* Category Breakdown */}
            {summary?.categoryPercentages && (
                <div className="space-y-2 pt-4 border-t border-white/10">
                    <h4 className="text-sm font-medium text-gray-400">📊 Uso por Categoria</h4>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs w-24 text-green-400">Produtivo</span>
                            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 rounded-full" style={{ width: `${summary.categoryPercentages.productive}%` }} />
                            </div>
                            <span className="text-xs text-gray-400 w-10">{summary.categoryPercentages.productive}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs w-24 text-red-400">Entretenimento</span>
                            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-red-500 rounded-full" style={{ width: `${summary.categoryPercentages.entertainment}%` }} />
                            </div>
                            <span className="text-xs text-gray-400 w-10">{summary.categoryPercentages.entertainment}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs w-24 text-purple-400">Social</span>
                            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${summary.categoryPercentages.social}%` }} />
                            </div>
                            <span className="text-xs text-gray-400 w-10">{summary.categoryPercentages.social}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs w-24 text-gray-400">Outros</span>
                            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-gray-500 rounded-full" style={{ width: `${summary.categoryPercentages.other}%` }} />
                            </div>
                            <span className="text-xs text-gray-400 w-10">{summary.categoryPercentages.other}%</span>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
