'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface ModuleCardProps {
    icon: ReactNode;
    iconClass: string;
    title: string;
    description: string;
    progress?: number;
    href: string;
    delay?: number;
}

export default function ModuleCard({
    icon,
    iconClass,
    title,
    description,
    progress,
    href,
    delay = 0
}: ModuleCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
        >
            <Link href={href} className="block">
                <div className="module-card group">
                    <div className={`module-icon ${iconClass}`}>
                        {icon}
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{title}</h3>
                    <p className="text-sm text-gray-400 mb-3">{description}</p>

                    {progress !== undefined && (
                        <div className="mb-3">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-400">Progresso</span>
                                <span className="text-teal-400 font-medium">{progress}%</span>
                            </div>
                            <div className="progress-bar">
                                <motion.div
                                    className="progress-bar-fill"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ delay: delay + 0.3, duration: 0.8 }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex items-center text-teal-400 text-sm font-medium group-hover:gap-2 transition-all">
                        <span>Acessar</span>
                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
