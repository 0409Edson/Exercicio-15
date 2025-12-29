'use client';

import { motion } from 'framer-motion';
import {
    Lightbulb,
    Sparkles,
    TrendingUp,
    Target,
    Zap,
    Clock,
    Brain,
    Book,
    Heart,
    Wallet,
    ChevronRight,
    Sunrise,
    Sun,
    Moon
} from 'lucide-react';
import Link from 'next/link';
import { useCurrentDate } from '@/hooks/useCurrentDate';

export default function TipsPage() {
    const dateInfo = useCurrentDate();

    // Dicas baseadas no horário
    const getTimeTips = () => {
        const hour = dateInfo.date.getHours();

        if (hour >= 5 && hour < 12) {
            return {
                icon: <Sunrise className="text-orange-400" />,
                period: 'Manhã',
                tips: [
                    { title: 'Defina 3 prioridades do dia', desc: 'Comece focado no que mais importa', link: '/goals', action: 'Ver Objetivos' },
                    { title: 'Revise sua agenda', desc: 'Prepare-se para compromissos', link: '/calendar', action: 'Ver Agenda' },
                    { title: 'Momento de alta energia', desc: 'Use para tarefas difíceis', link: '/habits', action: 'Ver Hábitos' },
                ]
            };
        } else if (hour >= 12 && hour < 18) {
            return {
                icon: <Sun className="text-yellow-400" />,
                period: 'Tarde',
                tips: [
                    { title: 'Pausa produtiva', desc: 'Descanse para manter o foco', link: '/health', action: 'Ver Saúde' },
                    { title: 'Revise suas finanças', desc: 'Acompanhe gastos do dia', link: '/finance', action: 'Ver Finanças' },
                    { title: 'Continue seus objetivos', desc: 'Avance mais uma etapa', link: '/goals', action: 'Ver Objetivos' },
                ]
            };
        } else {
            return {
                icon: <Moon className="text-purple-400" />,
                period: 'Noite',
                tips: [
                    { title: 'Reflexão do dia', desc: 'Registre conquistas no diário', link: '/journal', action: 'Abrir Diário' },
                    { title: 'Prepare o amanhã', desc: 'Planeje suas tarefas', link: '/calendar', action: 'Ver Agenda' },
                    { title: 'Cuide do seu descanso', desc: 'Sono é fundamental', link: '/health', action: 'Ver Saúde' },
                ]
            };
        }
    };

    const timeTips = getTimeTips();

    // Sugestões gerais
    const generalTips = [
        { icon: <Brain className="text-purple-400" />, title: 'Converse com a IA', desc: 'Juliana pode te ajudar com qualquer dúvida', link: '/ai', color: 'purple' },
        { icon: <Target className="text-teal-400" />, title: 'Defina metas SMART', desc: 'Específicas, Mensuráveis, Alcançáveis', link: '/goals', color: 'teal' },
        { icon: <Wallet className="text-green-400" />, title: 'Registre despesas', desc: 'Controle financeiro diário', link: '/finance', color: 'green' },
        { icon: <Heart className="text-red-400" />, title: 'Monitore sua saúde', desc: 'Pequenos hábitos fazem diferença', link: '/health', color: 'red' },
        { icon: <Book className="text-blue-400" />, title: 'Escreva no diário', desc: 'Reflexão melhora autoconhecimento', link: '/journal', color: 'blue' },
        { icon: <Zap className="text-yellow-400" />, title: 'Mantenha seu streak', desc: 'Consistência gera resultados', link: '/habits', color: 'yellow' },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Lightbulb className="text-yellow-400" />
                    Dicas e Sugestões
                </h1>
                <p className="text-gray-400 mt-1">
                    Sugestões personalizadas para seu momento
                </p>
            </motion.div>

            {/* Time-based Tips */}
            <motion.div
                className="glass-card p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-yellow-500/20 flex items-center justify-center">
                        {timeTips.icon}
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">Dicas para a {timeTips.period}</h2>
                        <p className="text-sm text-gray-400">{dateInfo.time} - {dateInfo.formatted}</p>
                    </div>
                </div>

                <div className="grid gap-4">
                    {timeTips.tips.map((tip, index) => (
                        <motion.div
                            key={tip.title}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link
                                href={tip.link}
                                className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                            >
                                <div>
                                    <p className="font-medium">{tip.title}</p>
                                    <p className="text-sm text-gray-400">{tip.desc}</p>
                                </div>
                                <div className="flex items-center gap-2 text-teal-400 text-sm">
                                    {tip.action}
                                    <ChevronRight size={16} />
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* General Tips */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Sparkles className="text-purple-400" />
                    Sugestões Gerais
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {generalTips.map((tip, index) => (
                        <motion.div
                            key={tip.title}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 + index * 0.05 }}
                        >
                            <Link
                                href={tip.link}
                                className="glass-card p-5 block hover:bg-white/5 transition-colors"
                            >
                                <div className={`w-10 h-10 rounded-lg bg-${tip.color}-500/20 flex items-center justify-center mb-3`}>
                                    {tip.icon}
                                </div>
                                <h3 className="font-medium">{tip.title}</h3>
                                <p className="text-sm text-gray-400 mt-1">{tip.desc}</p>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* AI Suggestion */}
            <motion.div
                className="glass-card p-6 border border-teal-500/30"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <Brain size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold">💡 Dica da Juliana</h3>
                        <p className="text-gray-400 mt-2">
                            Olá Edson! Percebi que você está usando o Life Matriz às {dateInfo.time}.
                            {timeTips.period === 'Manhã' && ' Este é um ótimo momento para definir suas prioridades!'}
                            {timeTips.period === 'Tarde' && ' Lembre-se de fazer pausas curtas para manter o foco.'}
                            {timeTips.period === 'Noite' && ' Que tal registrar o que você conquistou hoje no diário?'}
                        </p>
                        <Link
                            href="/ai"
                            className="inline-flex items-center gap-2 text-teal-400 text-sm mt-3 hover:text-teal-300"
                        >
                            Conversar com Juliana
                            <ChevronRight size={14} />
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
