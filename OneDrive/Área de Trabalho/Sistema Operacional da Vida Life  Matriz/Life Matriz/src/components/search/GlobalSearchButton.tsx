'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Command } from 'lucide-react';
import CentralSearchForm from './CentralSearchForm';

export default function GlobalSearchButton() {
    const [isOpen, setIsOpen] = useState(false);

    // Keyboard shortcut (Ctrl+K or Cmd+K)
    useEffect(() => {
        const handleKeydown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(true);
            }
        };

        window.addEventListener('keydown', handleKeydown);
        return () => window.removeEventListener('keydown', handleKeydown);
    }, []);

    return (
        <>
            {/* Search Button - appears in the header area */}
            <motion.button
                onClick={() => setIsOpen(true)}
                className="fixed top-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 bg-gray-800/80 backdrop-blur-sm border border-white/10 rounded-full shadow-lg z-40 hover:bg-gray-700/80 transition-colors group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <Search size={18} className="text-gray-400 group-hover:text-teal-400" />
                <span className="text-gray-400 group-hover:text-white">O que você está buscando?</span>
                <div className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded text-xs text-gray-500">
                    <Command size={12} />
                    <span>K</span>
                </div>
            </motion.button>

            {/* Search Form Modal */}
            <CentralSearchForm isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}
