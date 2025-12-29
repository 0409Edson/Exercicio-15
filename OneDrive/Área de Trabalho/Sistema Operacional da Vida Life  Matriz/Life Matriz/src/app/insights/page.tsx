'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Activity,
    Play,
    Search,
    Youtube,
    TrendingUp,
    Brain,
    Clock,
    Star,
    Lightbulb,
    BarChart3,
    History,
    RefreshCw
} from 'lucide-react';

interface ContentItem {
    platform: string;
    contentTitle: string;
    contentType: string;
    channel?: string;
    timestamp: string;
    duration: number;
}

interface Interest {
    topic: string;
    count: number;
    totalTime: number;
}

interface ActivityInsights {
    contentHistory: ContentItem[];
    youtubeVideos: Array<{ title: string; channel?: string; timestamp: string; duration: number }>;
    searchQueries: Array<{ query: string; platform: string; timestamp: string }>;
    topInterests: Interest[];
    currentContent?: string;
}

export default function ActivityInsightsPage() {
    const [insights, setInsights] = useState<ActivityInsights | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isElectronMode, setIsElectronMode] = useState(false);

    useEffect(() => {
        const checkElectron = () => {
            if (typeof window !== 'undefined') {
                const win = window as any;
                if (win.activityAPI || win.electronAPI) {
                    setIsElectronMode(true);
                    fetchInsights();
                } else {
                    setIsElectronMode(false);
                    setIsLoading(false);
                }
            }
        };

        checkElectron();
        const interval = setInterval(fetchInsights, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchInsights = () => {
        if (typeof window !== 'undefined') {
            const win = window as any;
            if (win.__activitySummary) {
                setInsights(win.__activitySummary);
            }
        }
        setIsLoading(false);
    };

    if (!isElectronMode && !isLoading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Insights de Atividades</h1>
                    <p className="text-gray-400 mt-1">Disponível apenas no modo Desktop (Electron)</p>
                </div>
                <div className="glass-card p-12 text-center">
                    <Activity size={48} className="mx-auto text-gray-500 mb-4" />
                    <p className="text-gray-500">Execute o Life Matriz via Electron para ver seus insights.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Insights de Atividades 🧠</h1>
                    <p className="text-gray-400 mt-1">IA aprendendo seus padrões de uso</p>
                </div>
                <button onClick={fetchInsights} className="btn-secondary flex items-center gap-2">
                    <RefreshCw size={16} />
                    Atualizar
                </button>
            </div>

            {/* Current Content */}
            {insights?.currentContent && (
                <motion.div
                    className="glass-card p-4 border-l-4 border-purple-500"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center gap-3">
                        <Play size={20} className="text-purple-400" />
                        <div>
                            <p className="text-sm text-gray-400">Visualizando agora:</p>
                            <p className="font-semibold text-purple-300">{insights.currentContent}</p>
                        </div>
                    </div>
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Interests */}
                <motion.div
                    className="glass-card p-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Star size={18} className="text-yellow-400" />
                        Seus Interesses
                    </h3>
                    {insights?.topInterests && insights.topInterests.length > 0 ? (
                        <div className="space-y-3">
                            {insights.topInterests.map((interest, i) => (
                                <div key={interest.topic} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{
                                            interest.topic === 'programação' ? '💻' :
                                                interest.topic === 'música' ? '🎵' :
                                                    interest.topic === 'jogos' ? '🎮' :
                                                        interest.topic === 'educação' ? '📚' :
                                                            interest.topic === 'fitness' ? '💪' :
                                                                interest.topic === 'negócios' ? '💼' : '⭐'
                                        }</span>
                                        <div>
                                            <p className="font-medium capitalize">{interest.topic}</p>
                                            <p className="text-xs text-gray-500">{interest.count} interações</p>
                                        </div>
                                    </div>
                                    <span className="text-sm text-teal-400">{Math.round(interest.totalTime / 60)}min</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4">
                            Navegue na web para a IA identificar seus interesses
                        </p>
                    )}
                </motion.div>

                {/* Recent Searches */}
                <motion.div
                    className="glass-card p-6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Search size={18} className="text-blue-400" />
                        Suas Pesquisas
                    </h3>
                    {insights?.searchQueries && insights.searchQueries.length > 0 ? (
                        <div className="space-y-2">
                            {insights.searchQueries.slice(0, 10).map((search, i) => (
                                <div key={i} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                                    <Search size={14} className="text-gray-500" />
                                    <span className="text-sm flex-1 truncate">{search.query}</span>
                                    <span className="text-xs text-gray-500">{search.platform}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4">
                            Nenhuma pesquisa registrada ainda
                        </p>
                    )}
                </motion.div>

                {/* YouTube Videos */}
                <motion.div
                    className="glass-card p-6 lg:col-span-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Youtube size={18} className="text-red-400" />
                        Vídeos Assistidos
                    </h3>
                    {insights?.youtubeVideos && insights.youtubeVideos.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {insights.youtubeVideos.slice(0, 10).map((video, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 bg-red-500/10 rounded-lg">
                                    <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                                        <Play size={16} className="text-red-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-medium text-sm truncate">{video.title}</p>
                                        {video.channel && (
                                            <p className="text-xs text-gray-500">{video.channel}</p>
                                        )}
                                        <p className="text-xs text-red-400 mt-1">
                                            {Math.round(video.duration / 60)}min assistidos
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4">
                            Assista vídeos no YouTube para ver aqui
                        </p>
                    )}
                </motion.div>

                {/* Content History */}
                <motion.div
                    className="glass-card p-6 lg:col-span-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <History size={18} className="text-gray-400" />
                        Histórico de Conteúdo
                    </h3>
                    {insights?.contentHistory && insights.contentHistory.length > 0 ? (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {insights.contentHistory.slice().reverse().map((item, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                                    <span className="text-xl">{
                                        item.platform === 'YouTube' ? '📺' :
                                            item.contentType === 'search' ? '🔍' :
                                                item.platform === 'Netflix' ? '🎬' :
                                                    item.platform === 'Spotify' ? '🎵' :
                                                        item.platform === 'GitHub' ? '💻' :
                                                            item.platform === 'Instagram' ? '📷' :
                                                                item.platform === 'TikTok' ? '📱' : '🌐'
                                    }</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{item.contentTitle}</p>
                                        <p className="text-xs text-gray-500">
                                            {item.platform} • {Math.round(item.duration / 60)}min
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4">
                            Navegue na web para ver seu histórico
                        </p>
                    )}
                </motion.div>
            </div>

            {/* AI Insights */}
            <motion.div
                className="glass-card p-6 border-2 border-purple-500/30"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Brain size={20} className="text-purple-400" />
                    O que a IA Aprendeu Sobre Você
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-purple-500/10 rounded-lg">
                        <Lightbulb size={24} className="text-purple-400 mb-2" />
                        <p className="font-medium">Interesses</p>
                        <p className="text-sm text-gray-400">
                            {insights?.topInterests && insights.topInterests.length > 0
                                ? `Você gosta de: ${insights.topInterests.map(i => i.topic).join(', ')}`
                                : 'Continue navegando para descobrir'
                            }
                        </p>
                    </div>
                    <div className="p-4 bg-blue-500/10 rounded-lg">
                        <TrendingUp size={24} className="text-blue-400 mb-2" />
                        <p className="font-medium">Padrão de Uso</p>
                        <p className="text-sm text-gray-400">
                            {insights?.contentHistory && insights.contentHistory.length > 5
                                ? `Você acessou ${insights.contentHistory.length} conteúdos diferentes`
                                : 'Mais dados necessários'
                            }
                        </p>
                    </div>
                    <div className="p-4 bg-teal-500/10 rounded-lg">
                        <BarChart3 size={24} className="text-teal-400 mb-2" />
                        <p className="font-medium">Recomendações</p>
                        <p className="text-sm text-gray-400">
                            A IA está aprendendo para sugerir conteúdo relevante
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
