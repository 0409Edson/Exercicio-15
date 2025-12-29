'use client';

import { motion } from 'framer-motion';
import { Sparkles, Lightbulb, Zap, Brain } from 'lucide-react';

interface InsightCardProps {
    type: 'tip' | 'alert' | 'insight' | 'ai';
    title: string;
    description: string;
    action?: string;
    delay?: number;
}

const iconMap = {
    tip: { icon: Lightbulb, bg: 'bg-yellow-500/20', color: 'text-yellow-400' },
    alert: { icon: Zap, bg: 'bg-red-500/20', color: 'text-red-400' },
    insight: { icon: Sparkles, bg: 'bg-purple-500/20', color: 'text-purple-400' },
    ai: { icon: Brain, bg: 'bg-teal-500/20', color: 'text-teal-400' },
};

export default function InsightCard({
    type,
    title,
    description,
    action,
    delay = 0
}: InsightCardProps) {
    const { icon: Icon, bg, color } = iconMap[type];

    return (
        <motion.div
            className="glass-card p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
        >
            <div className="flex gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${bg}`}>
                    <Icon size={20} className={color} />
                </div>
                <div className="flex-1">
                    <h4 className="font-semibold mb-1">{title}</h4>
                    <p className="text-sm text-gray-400 mb-2">{description}</p>
                    {action && (
                        <button className="text-sm text-teal-400 font-medium hover:text-teal-300 transition-colors">
                            {action} →
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
