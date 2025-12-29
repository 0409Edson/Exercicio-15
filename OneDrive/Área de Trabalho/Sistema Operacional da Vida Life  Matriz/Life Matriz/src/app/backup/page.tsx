'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    Cloud,
    CloudOff,
    Download,
    Upload,
    Trash2,
    RefreshCw,
    Clock,
    HardDrive,
    Check,
    AlertCircle,
    Settings,
    Archive
} from 'lucide-react';
import { useSyncStore } from '@/lib/syncStore';

export default function BackupPage() {
    const {
        isOnline,
        lastSync,
        isSyncing,
        backups,
        autoBackupEnabled,
        createBackup,
        restoreBackup,
        deleteBackup,
        setAutoBackup,
        exportAllData,
        importAllData,
    } = useSyncStore();

    const [showImportModal, setShowImportModal] = useState(false);
    const [importData, setImportData] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        const data = exportAllData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lifeos-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        setMessage({ type: 'success', text: 'Backup exportado com sucesso!' });
    };

    const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            setImportData(content);
            setShowImportModal(true);
        };
        reader.readAsText(file);
    };

    const confirmImport = () => {
        const success = importAllData(importData);
        if (success) {
            setMessage({ type: 'success', text: 'Dados importados! Recarregando...' });
        } else {
            setMessage({ type: 'error', text: 'Erro ao importar dados.' });
        }
        setShowImportModal(false);
    };

    const handleRestore = (id: string) => {
        if (confirm('Isso vai substituir todos os dados atuais. Continuar?')) {
            restoreBackup(id);
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Cloud className="text-teal-400" />
                        Backup & Sincronização
                    </h1>
                    <p className="text-gray-400 mt-1">
                        Proteja seus dados com backups automáticos
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {isOnline ? (
                        <span className="flex items-center gap-1 text-green-400 text-sm">
                            <Cloud size={16} /> Online
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-red-400 text-sm">
                            <CloudOff size={16} /> Offline
                        </span>
                    )}
                </div>
            </div>

            {/* Message */}
            {message && (
                <motion.div
                    className={`p-4 rounded-xl flex items-center gap-2 ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                    {message.text}
                </motion.div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.button
                    onClick={() => createBackup('manual')}
                    className="glass-card p-6 text-left hover:bg-white/10 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center mb-4">
                        <Archive size={24} className="text-teal-400" />
                    </div>
                    <h3 className="font-semibold">Criar Backup</h3>
                    <p className="text-sm text-gray-400 mt-1">Salvar estado atual</p>
                </motion.button>

                <motion.button
                    onClick={handleExport}
                    className="glass-card p-6 text-left hover:bg-white/10 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
                        <Download size={24} className="text-purple-400" />
                    </div>
                    <h3 className="font-semibold">Exportar Dados</h3>
                    <p className="text-sm text-gray-400 mt-1">Baixar arquivo JSON</p>
                </motion.button>

                <motion.button
                    onClick={() => fileInputRef.current?.click()}
                    className="glass-card p-6 text-left hover:bg-white/10 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
                        <Upload size={24} className="text-blue-400" />
                    </div>
                    <h3 className="font-semibold">Importar Dados</h3>
                    <p className="text-sm text-gray-400 mt-1">Restaurar de arquivo</p>
                </motion.button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleImportFile}
                />
            </div>

            {/* Auto Backup Settings */}
            <motion.div
                className="glass-card p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                            <RefreshCw size={20} className="text-green-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Backup Automático</h3>
                            <p className="text-sm text-gray-400">Salva seus dados a cada 24 horas</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={autoBackupEnabled}
                            onChange={(e) => setAutoBackup(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:ring-2 peer-focus:ring-teal-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                    </label>
                </div>

                {lastSync && (
                    <p className="text-sm text-gray-500 mt-4">
                        <Clock size={14} className="inline mr-1" />
                        Último backup: {new Date(lastSync).toLocaleString('pt-BR')}
                    </p>
                )}
            </motion.div>

            {/* Backup History */}
            <motion.div
                className="glass-card p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div className="flex items-center gap-2 mb-6">
                    <HardDrive size={20} className="text-teal-400" />
                    <h2 className="text-lg font-semibold">Histórico de Backups</h2>
                </div>

                {backups.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        <Archive size={40} className="mx-auto mb-3 opacity-50" />
                        <p>Nenhum backup ainda</p>
                        <p className="text-sm">Clique em "Criar Backup" para começar</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {backups.map((backup, index) => (
                            <motion.div
                                key={backup.id}
                                className="flex items-center justify-between p-4 bg-white/5 rounded-xl"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${backup.type === 'auto' ? 'bg-green-500/20' : 'bg-purple-500/20'
                                        }`}>
                                        {backup.type === 'auto' ? (
                                            <RefreshCw size={18} className="text-green-400" />
                                        ) : (
                                            <Archive size={18} className="text-purple-400" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium">
                                            {backup.type === 'auto' ? 'Backup Automático' : 'Backup Manual'}
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            {new Date(backup.timestamp).toLocaleString('pt-BR')} • {formatSize(backup.size)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleRestore(backup.id)}
                                        className="btn-secondary text-sm px-3 py-1"
                                    >
                                        Restaurar
                                    </button>
                                    <button
                                        onClick={() => deleteBackup(backup.id)}
                                        className="btn-icon text-red-400 hover:text-red-300"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Import Modal */}
            {showImportModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        className="glass-card p-6 max-w-md w-full"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                    >
                        <h3 className="text-lg font-semibold mb-4">Confirmar Importação</h3>
                        <p className="text-gray-400 mb-6">
                            Isso vai substituir todos os dados atuais pelos dados do arquivo importado.
                            Esta ação não pode ser desfeita.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowImportModal(false)}
                                className="flex-1 btn-secondary"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmImport}
                                className="flex-1 btn-primary"
                            >
                                Importar
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
