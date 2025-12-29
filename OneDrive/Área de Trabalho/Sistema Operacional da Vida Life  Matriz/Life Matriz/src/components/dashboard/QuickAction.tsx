'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

interface QuickActionProps {
    icon: ReactNode;
    iconBg: string;
    title: string;
    description: string;
    onClick?: () => void;
    delay?: number;
}

export default function QuickAction({
    icon,
    iconBg,
    title,
    description,
    onClick,
    delay = 0
}: QuickActionProps) {
    return (
        <motion.button
            className="quick-action w-full text-left group"
            onClick={onClick}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay, duration: 0.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}>
                {icon}
            </div>
            <div className="flex-1">
                <p className="font-medium">{title}</p>
                <p className="text-sm text-gray-400">{description}</p>
            </div>
            <ChevronRight size={18} className="text-gray-500 group-hover:text-teal-400 group-hover:translate-x-1 transition-all" />
        </motion.button>
    );
}
