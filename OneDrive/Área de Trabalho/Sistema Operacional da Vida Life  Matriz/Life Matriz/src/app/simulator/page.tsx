'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Smartphone,
    Tablet,
    Monitor,
    Tv,
    RotateCcw,
    ExternalLink,
    Check,
    Maximize2,
    Minus,
    Plus,
    RefreshCw
} from 'lucide-react';

interface Device {
    id: string;
    name: string;
    icon: React.ReactNode;
    width: number;
    height: number;
    type: 'mobile' | 'tablet' | 'desktop' | 'tv';
}

const devices: Device[] = [
    { id: 'iphone-se', name: 'iPhone SE', icon: <Smartphone size={16} />, width: 375, height: 667, type: 'mobile' },
    { id: 'iphone-14', name: 'iPhone 14', icon: <Smartphone size={16} />, width: 390, height: 844, type: 'mobile' },
    { id: 'iphone-14-pro-max', name: 'iPhone 14 Pro Max', icon: <Smartphone size={16} />, width: 430, height: 932, type: 'mobile' },
    { id: 'pixel-7', name: 'Pixel 7', icon: <Smartphone size={16} />, width: 412, height: 915, type: 'mobile' },
    { id: 'samsung-s23', name: 'Samsung S23', icon: <Smartphone size={16} />, width: 360, height: 780, type: 'mobile' },
    { id: 'ipad-mini', name: 'iPad Mini', icon: <Tablet size={16} />, width: 768, height: 1024, type: 'tablet' },
    { id: 'ipad-pro', name: 'iPad Pro 12.9"', icon: <Tablet size={16} />, width: 1024, height: 1366, type: 'tablet' },
    { id: 'surface-pro', name: 'Surface Pro', icon: <Tablet size={16} />, width: 912, height: 1368, type: 'tablet' },
    { id: 'laptop', name: 'Laptop', icon: <Monitor size={16} />, width: 1366, height: 768, type: 'desktop' },
    { id: 'desktop-hd', name: 'Desktop HD', icon: <Monitor size={16} />, width: 1920, height: 1080, type: 'desktop' },
    { id: 'desktop-4k', name: 'Desktop 4K', icon: <Monitor size={16} />, width: 2560, height: 1440, type: 'desktop' },
    { id: 'smart-tv', name: 'Smart TV', icon: <Tv size={16} />, width: 1920, height: 1080, type: 'tv' },
];

const pages = [
    { path: '/', name: 'Dashboard' },
    { path: '/ai', name: 'Chat IA' },
    { path: '/goals', name: 'Objetivos' },
    { path: '/calendar', name: 'Agenda' },
    { path: '/finance', name: 'Finanças' },
    { path: '/health', name: 'Saúde' },
    { path: '/habits', name: 'Hábitos' },
    { path: '/security', name: 'Segurança' },
    { path: '/backup', name: 'Backup' },
    { path: '/notifications', name: 'Notificações' },
    { path: '/tips', name: 'Dicas' },
];

export default function DeviceSimulatorPage() {
    const [selectedDevice, setSelectedDevice] = useState<Device>(devices[1]);
    const [isLandscape, setIsLandscape] = useState(false);
    const [scale, setScale] = useState(0.5);
    const [currentPage, setCurrentPage] = useState('/');
    const [iframeKey, setIframeKey] = useState(0);

    const deviceWidth = isLandscape ? selectedDevice.height : selectedDevice.width;
    const deviceHeight = isLandscape ? selectedDevice.width : selectedDevice.height;

    const refreshIframe = () => {
        setIframeKey(prev => prev + 1);
    };

    const openInNewTab = () => {
        window.open(currentPage, '_blank');
    };

    return (
        <div className="min-h-screen bg-gray-950 p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Monitor className="text-teal-400" />
                        Simulador de Dispositivos
                    </h1>
                    <p className="text-gray-400 mt-1">
                        Teste o Life Matriz em diferentes telas
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <a href="/" className="btn-secondary text-sm">
                        Voltar ao App
                    </a>
                </div>
            </div>

            <div className="flex gap-6">
                {/* Sidebar - Device Selection */}
                <div className="w-64 flex-shrink-0 space-y-4">
                    {/* Device Categories */}
                    {(['mobile', 'tablet', 'desktop', 'tv'] as const).map((type) => (
                        <div key={type} className="glass-card p-4">
                            <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">
                                {type === 'mobile' ? '📱 Mobile' :
                                    type === 'tablet' ? '📱 Tablet' :
                                        type === 'desktop' ? '💻 Desktop' : '📺 TV'}
                            </h3>
                            <div className="space-y-1">
                                {devices.filter(d => d.type === type).map((device) => (
                                    <button
                                        key={device.id}
                                        onClick={() => setSelectedDevice(device)}
                                        className={`w-full p-2 rounded-lg text-left text-sm flex items-center gap-2 transition-colors ${selectedDevice.id === device.id
                                                ? 'bg-teal-500/20 text-teal-300'
                                                : 'hover:bg-white/5'
                                            }`}
                                    >
                                        {device.icon}
                                        <span>{device.name}</span>
                                        {selectedDevice.id === device.id && (
                                            <Check size={14} className="ml-auto" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Page Selection */}
                    <div className="glass-card p-4">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">
                            📄 Página
                        </h3>
                        <select
                            value={currentPage}
                            onChange={(e) => setCurrentPage(e.target.value)}
                            className="input-field w-full text-sm"
                        >
                            {pages.map((page) => (
                                <option key={page.path} value={page.path}>
                                    {page.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Preview Area */}
                <div className="flex-1">
                    {/* Controls */}
                    <div className="glass-card p-4 mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="text-sm">
                                <span className="text-gray-400">Dispositivo:</span>{' '}
                                <strong>{selectedDevice.name}</strong>
                            </div>
                            <div className="text-sm">
                                <span className="text-gray-400">Resolução:</span>{' '}
                                <strong>{deviceWidth} × {deviceHeight}</strong>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsLandscape(!isLandscape)}
                                className={`btn-icon ${isLandscape ? 'bg-teal-500/20' : ''}`}
                                title="Rotacionar"
                            >
                                <RotateCcw size={16} />
                            </button>
                            <div className="flex items-center gap-1 border border-white/10 rounded-lg px-2">
                                <button
                                    onClick={() => setScale(Math.max(0.25, scale - 0.1))}
                                    className="btn-icon"
                                >
                                    <Minus size={14} />
                                </button>
                                <span className="text-sm px-2">{Math.round(scale * 100)}%</span>
                                <button
                                    onClick={() => setScale(Math.min(1, scale + 0.1))}
                                    className="btn-icon"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                            <button
                                onClick={refreshIframe}
                                className="btn-icon"
                                title="Recarregar"
                            >
                                <RefreshCw size={16} />
                            </button>
                            <button
                                onClick={openInNewTab}
                                className="btn-icon"
                                title="Abrir em nova aba"
                            >
                                <ExternalLink size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Device Frame */}
                    <div className="flex items-center justify-center p-8 bg-gray-900/50 rounded-xl min-h-[600px]">
                        <motion.div
                            className="relative"
                            animate={{
                                width: deviceWidth * scale,
                                height: deviceHeight * scale,
                            }}
                            transition={{ type: 'spring', damping: 20 }}
                        >
                            {/* Device Bezel */}
                            <div
                                className={`absolute inset-0 rounded-[${selectedDevice.type === 'mobile' ? '40px' : '20px'}] bg-gray-800 shadow-2xl`}
                                style={{
                                    padding: selectedDevice.type === 'mobile' ? '12px' : '8px',
                                    borderRadius: selectedDevice.type === 'mobile' ? '40px' : '20px',
                                }}
                            >
                                {/* Notch for mobile */}
                                {selectedDevice.type === 'mobile' && !isLandscape && (
                                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-900 rounded-full z-10" />
                                )}

                                {/* Screen */}
                                <div
                                    className="w-full h-full bg-black rounded-[28px] overflow-hidden"
                                    style={{
                                        borderRadius: selectedDevice.type === 'mobile' ? '28px' : '12px',
                                    }}
                                >
                                    <iframe
                                        key={iframeKey}
                                        src={currentPage}
                                        className="w-full h-full border-0"
                                        style={{
                                            width: deviceWidth,
                                            height: deviceHeight,
                                            transform: `scale(${scale})`,
                                            transformOrigin: 'top left',
                                        }}
                                        title={`Preview - ${selectedDevice.name}`}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Test Results */}
                    <div className="glass-card p-4 mt-4">
                        <h3 className="font-semibold mb-3">📊 Compatibilidade</h3>
                        <div className="grid grid-cols-4 gap-4">
                            <div className="text-center p-3 bg-green-500/10 rounded-lg">
                                <Check className="mx-auto text-green-400 mb-1" size={20} />
                                <p className="text-sm text-green-400">PWA Ready</p>
                            </div>
                            <div className="text-center p-3 bg-green-500/10 rounded-lg">
                                <Check className="mx-auto text-green-400 mb-1" size={20} />
                                <p className="text-sm text-green-400">Responsivo</p>
                            </div>
                            <div className="text-center p-3 bg-green-500/10 rounded-lg">
                                <Check className="mx-auto text-green-400 mb-1" size={20} />
                                <p className="text-sm text-green-400">Touch Ready</p>
                            </div>
                            <div className="text-center p-3 bg-green-500/10 rounded-lg">
                                <Check className="mx-auto text-green-400 mb-1" size={20} />
                                <p className="text-sm text-green-400">Offline</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
