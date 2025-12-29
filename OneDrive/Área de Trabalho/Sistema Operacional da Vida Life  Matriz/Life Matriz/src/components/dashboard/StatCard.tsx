'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
    icon: ReactNode;
    iconBg: string;
    title: string;
    value: string | number;
    change?: number;
    subtitle?: string;
    delay?: number;
}

export default function StatCard({
    icon,
    iconBg,
    title,
    value,
    change,
    subtitle,
    delay = 0
}: StatCardProps) {
    const isPositive = change && change > 0;
    const isNegative = change && change < 0;

    return (
        <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
        >
            <div className={`stat-icon ${iconBg}`}>
                {icon}
            </div>
            <div className="stat-content">
                <p className="stat-label">{title}</p>
                <p className="stat-value">{value}</p>
                {(change !== undefined || subtitle) && (
                    <div className="flex items-center gap-1 mt-1">
                        {change !== undefined && (
                            <>
                                {isPositive && <TrendingUp size={12} className="text-green-400" />}
                                {isNegative && <TrendingDown size={12} className="text-red-400" />}
                                <span className={`stat-change ${isPositive ? 'positive' : 'negative'}`}>
                                    {isPositive ? '+' : ''}{change}%
                                </span>
                            </>
                        )}
                        {subtitle && <span className="text-xs text-gray-500">{subtitle}</span>}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
