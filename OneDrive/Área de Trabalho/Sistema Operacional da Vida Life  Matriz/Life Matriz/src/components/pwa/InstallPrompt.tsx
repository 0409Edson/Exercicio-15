'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Monitor, Tv, Check } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
    const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop' | 'tv'>('desktop');

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        // Detect platform
        const userAgent = navigator.userAgent.toLowerCase();
        if (/iphone|ipad|ipod/.test(userAgent)) {
            setPlatform('ios');
        } else if (/android/.test(userAgent)) {
            setPlatform('android');
        } else if (/smart-tv|smarttv|googletv|appletv|hbbtv|pov_tv|netcast.tv/.test(userAgent)) {
            setPlatform('tv');
        }

        // Listen for install prompt
        const handleBeforeInstall = (e: Event) => {
            e.preventDefault();
            setInstallPrompt(e as BeforeInstallPromptEvent);

            // Show prompt after 5 seconds
            setTimeout(() => setShowPrompt(true), 5000);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstall);

        // Check if should show iOS instructions
        if (platform === 'ios' && !isInstalled) {
            setTimeout(() => setShowPrompt(true), 5000);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
        };
    }, [platform, isInstalled]);

    const handleInstall = async () => {
        if (!installPrompt) return;

        await installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;

        if (outcome === 'accepted') {
            setIsInstalled(true);
            setShowPrompt(false);
        }
    };

    const getPlatformIcon = () => {
        switch (platform) {
            case 'ios':
            case 'android':
                return <Smartphone size={24} className="text-teal-400" />;
            case 'tv':
                return <Tv size={24} className="text-purple-400" />;
            default:
                return <Monitor size={24} className="text-blue-400" />;
        }
    };

    const getPlatformInstructions = () => {
        switch (platform) {
            case 'ios':
                return (
                    <div className="text-sm text-gray-400 space-y-2">
                        <p>Para instalar no iPhone/iPad:</p>
                        <ol className="list-decimal list-inside space-y-1">
                            <li>Toque no botão <strong>Compartilhar</strong> (ícone de quadrado com seta)</li>
                            <li>Role e toque em <strong>"Adicionar à Tela Inicial"</strong></li>
                            <li>Toque em <strong>"Adicionar"</strong></li>
                        </ol>
                    </div>
                );
            case 'android':
                return (
                    <p className="text-sm text-gray-400">
                        Toque no botão abaixo para instalar o LifeOS no seu Android
                    </p>
                );
            case 'tv':
                return (
                    <p className="text-sm text-gray-400">
                        Adicione este endereço aos favoritos da sua Smart TV para acesso rápido
                    </p>
                );
            default:
                return (
                    <p className="text-sm text-gray-400">
                        Instale o LifeOS como aplicativo para acesso mais rápido
                    </p>
                );
        }
    };

    if (isInstalled || !showPrompt) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 glass-card p-5 z-50 border border-teal-500/30"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
            >
                <button
                    onClick={() => setShowPrompt(false)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-white"
                >
                    <X size={18} />
                </button>

                <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                        {getPlatformIcon()}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">Instalar LifeOS</h3>
                        {getPlatformInstructions()}
                    </div>
                </div>

                {platform !== 'ios' && installPrompt && (
                    <button
                        onClick={handleInstall}
                        className="w-full btn-primary mt-4 py-3 flex items-center justify-center gap-2"
                    >
                        <Download size={18} />
                        Instalar Agora
                    </button>
                )}

                {platform === 'ios' && (
                    <button
                        onClick={() => setShowPrompt(false)}
                        className="w-full btn-secondary mt-4 py-3"
                    >
                        Entendi
                    </button>
                )}
            </motion.div>
        </AnimatePresence>
    );
}
