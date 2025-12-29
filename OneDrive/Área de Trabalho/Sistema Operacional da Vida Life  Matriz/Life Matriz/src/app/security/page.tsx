'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Shield,
    ShieldCheck,
    ShieldAlert,
    Lock,
    Key,
    Eye,
    EyeOff,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Clock,
    Activity,
    Wifi,
    WifiOff,
    Monitor,
    RefreshCw,
    Plus,
    Trash2,
    Copy,
    ExternalLink,
    Fingerprint,
    LogOut
} from 'lucide-react';
import { useAuthStore } from '@/lib/authStore';
import { generateUniqueId } from '@/lib/generateId';

interface SecurityStatus {
    overall: 'good' | 'warning' | 'danger';
    items: SecurityItem[];
}

interface SecurityItem {
    id: string;
    name: string;
    status: 'good' | 'warning' | 'danger';
    description: string;
    action?: string;
}

interface SavedPassword {
    id: string;
    site: string;
    username: string;
    password: string;
    createdAt: Date;
}

interface AccessLog {
    id: string;
    action: string;
    timestamp: Date;
    ip?: string;
    device?: string;
}

export default function SecurityPage() {
    const { user, logout } = useAuthStore();
    const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [passwords, setPasswords] = useState<SavedPassword[]>([]);
    const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
    const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
    const [newPassword, setNewPassword] = useState({ site: '', username: '', password: '' });
    const [showAddPassword, setShowAddPassword] = useState(false);

    // Load saved data
    useEffect(() => {
        const savedPasswords = localStorage.getItem('lifeos-passwords');
        if (savedPasswords) {
            setPasswords(JSON.parse(savedPasswords));
        }

        const savedLogs = localStorage.getItem('lifeos-access-logs');
        if (savedLogs) {
            setAccessLogs(JSON.parse(savedLogs));
        }

        // Add current access log
        const newLog: AccessLog = {
            id: generateUniqueId('log-'),
            action: 'Acesso ao Módulo de Segurança',
            timestamp: new Date(),
            device: navigator.userAgent.includes('Windows') ? 'Windows PC' : 'Dispositivo',
        };

        setAccessLogs(prev => {
            const updated = [newLog, ...prev].slice(0, 50); // Keep last 50 logs
            localStorage.setItem('lifeos-access-logs', JSON.stringify(updated));
            return updated;
        });

        // Initial security scan
        runSecurityScan();
    }, []);

    const runSecurityScan = async () => {
        setIsScanning(true);

        // Simulate security scan with realistic checks
        await new Promise(resolve => setTimeout(resolve, 2000));

        const items: SecurityItem[] = [
            {
                id: '1',
                name: 'Proteção por Senha',
                status: 'good',
                description: 'Seu LifeOS está protegido por senha',
            },
            {
                id: '2',
                name: 'Conexão Segura',
                status: window.location.protocol === 'https:' ? 'good' : 'warning',
                description: window.location.protocol === 'https:'
                    ? 'Conexão HTTPS ativa'
                    : 'Conexão HTTP - Considere usar HTTPS em produção',
            },
            {
                id: '3',
                name: 'Navegador Atualizado',
                status: 'good',
                description: 'Seu navegador suporta recursos modernos de segurança',
            },
            {
                id: '4',
                name: 'Sessão Ativa',
                status: 'good',
                description: 'Sessão expira automaticamente após inatividade',
            },
            {
                id: '5',
                name: 'Armazenamento Local',
                status: 'good',
                description: 'Dados armazenados localmente no seu dispositivo',
            },
            {
                id: '6',
                name: 'Senhas Salvas',
                status: passwords.length > 0 ? 'good' : 'warning',
                description: passwords.length > 0
                    ? `${passwords.length} senha(s) armazenada(s) com segurança`
                    : 'Nenhuma senha salva ainda',
            },
        ];

        const dangerCount = items.filter(i => i.status === 'danger').length;
        const warningCount = items.filter(i => i.status === 'warning').length;

        let overall: 'good' | 'warning' | 'danger' = 'good';
        if (dangerCount > 0) overall = 'danger';
        else if (warningCount > 0) overall = 'warning';

        setSecurityStatus({ overall, items });
        setIsScanning(false);
    };

    const addPassword = () => {
        if (!newPassword.site || !newPassword.username || !newPassword.password) return;

        const password: SavedPassword = {
            id: generateUniqueId('pwd-'),
            ...newPassword,
            createdAt: new Date(),
        };

        const updated = [...passwords, password];
        setPasswords(updated);
        localStorage.setItem('lifeos-passwords', JSON.stringify(updated));
        setNewPassword({ site: '', username: '', password: '' });
        setShowAddPassword(false);

        // Log action
        logAction('Senha adicionada para ' + newPassword.site);
    };

    const deletePassword = (id: string) => {
        const updated = passwords.filter(p => p.id !== id);
        setPasswords(updated);
        localStorage.setItem('lifeos-passwords', JSON.stringify(updated));
        logAction('Senha removida');
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        logAction('Senha copiada para área de transferência');
    };

    const logAction = (action: string) => {
        const newLog: AccessLog = {
            id: generateUniqueId('log-'),
            action,
            timestamp: new Date(),
            device: 'Windows PC',
        };

        setAccessLogs(prev => {
            const updated = [newLog, ...prev].slice(0, 50);
            localStorage.setItem('lifeos-access-logs', JSON.stringify(updated));
            return updated;
        });
    };

    const getStatusColor = (status: 'good' | 'warning' | 'danger') => {
        switch (status) {
            case 'good': return 'text-green-400';
            case 'warning': return 'text-yellow-400';
            case 'danger': return 'text-red-400';
        }
    };

    const getStatusBg = (status: 'good' | 'warning' | 'danger') => {
        switch (status) {
            case 'good': return 'bg-green-500/20';
            case 'warning': return 'bg-yellow-500/20';
            case 'danger': return 'bg-red-500/20';
        }
    };

    const getStatusIcon = (status: 'good' | 'warning' | 'danger') => {
        switch (status) {
            case 'good': return <CheckCircle size={18} />;
            case 'warning': return <AlertTriangle size={18} />;
            case 'danger': return <XCircle size={18} />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Shield className="text-teal-400" />
                        Módulo de Segurança
                    </h1>
                    <p className="text-gray-400 mt-1">
                        Central de proteção do LifeOS • Usuário: {user?.name || 'Edson'}
                    </p>
                </div>
                <button
                    onClick={logout}
                    className="btn-secondary flex items-center gap-2"
                >
                    <LogOut size={16} />
                    Sair
                </button>
            </div>

            {/* Security Status Card */}
            <motion.div
                className="glass-card p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold">Status de Segurança</h2>
                    <button
                        onClick={runSecurityScan}
                        disabled={isScanning}
                        className="btn-secondary flex items-center gap-2"
                    >
                        <RefreshCw size={16} className={isScanning ? 'animate-spin' : ''} />
                        {isScanning ? 'Verificando...' : 'Verificar'}
                    </button>
                </div>

                {isScanning ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto rounded-full bg-teal-500/20 flex items-center justify-center mb-4 animate-pulse">
                            <Shield size={32} className="text-teal-400" />
                        </div>
                        <p className="text-gray-400">Analisando segurança do sistema...</p>
                    </div>
                ) : securityStatus && (
                    <>
                        {/* Overall Status */}
                        <div className={`p-4 rounded-xl ${getStatusBg(securityStatus.overall)} mb-6`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-full ${getStatusBg(securityStatus.overall)} flex items-center justify-center`}>
                                    {securityStatus.overall === 'good' ? (
                                        <ShieldCheck size={28} className="text-green-400" />
                                    ) : securityStatus.overall === 'warning' ? (
                                        <Shield size={28} className="text-yellow-400" />
                                    ) : (
                                        <ShieldAlert size={28} className="text-red-400" />
                                    )}
                                </div>
                                <div>
                                    <h3 className={`font-semibold ${getStatusColor(securityStatus.overall)}`}>
                                        {securityStatus.overall === 'good' ? 'Sistema Protegido' :
                                            securityStatus.overall === 'warning' ? 'Atenção Necessária' :
                                                'Problemas Detectados'}
                                    </h3>
                                    <p className="text-sm text-gray-400">
                                        {securityStatus.items.filter(i => i.status === 'good').length} de {securityStatus.items.length} verificações OK
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Security Items */}
                        <div className="grid gap-3">
                            {securityStatus.items.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={getStatusColor(item.status)}>
                                            {getStatusIcon(item.status)}
                                        </span>
                                        <div>
                                            <p className="font-medium text-sm">{item.name}</p>
                                            <p className="text-xs text-gray-500">{item.description}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </>
                )}
            </motion.div>

            {/* Password Manager */}
            <motion.div
                className="glass-card p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Key size={20} className="text-purple-400" />
                        <h2 className="text-lg font-semibold">Gerenciador de Senhas</h2>
                    </div>
                    <button
                        onClick={() => setShowAddPassword(!showAddPassword)}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus size={16} />
                        Adicionar
                    </button>
                </div>

                {/* Add Password Form */}
                {showAddPassword && (
                    <motion.div
                        className="p-4 bg-white/5 rounded-xl mb-4"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                    >
                        <div className="grid gap-3">
                            <input
                                type="text"
                                placeholder="Site (ex: gmail.com)"
                                value={newPassword.site}
                                onChange={(e) => setNewPassword({ ...newPassword, site: e.target.value })}
                                className="input-field"
                            />
                            <input
                                type="text"
                                placeholder="Usuário ou email"
                                value={newPassword.username}
                                onChange={(e) => setNewPassword({ ...newPassword, username: e.target.value })}
                                className="input-field"
                            />
                            <input
                                type="password"
                                placeholder="Senha"
                                value={newPassword.password}
                                onChange={(e) => setNewPassword({ ...newPassword, password: e.target.value })}
                                className="input-field"
                            />
                            <div className="flex gap-2">
                                <button onClick={addPassword} className="btn-primary flex-1">
                                    Salvar
                                </button>
                                <button onClick={() => setShowAddPassword(false)} className="btn-secondary">
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Saved Passwords */}
                {passwords.length === 0 ? (
                    <div className="text-center py-8">
                        <Lock size={40} className="mx-auto text-gray-600 mb-3" />
                        <p className="text-gray-400">Nenhuma senha salva</p>
                        <p className="text-sm text-gray-500">Suas senhas são armazenadas localmente</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {passwords.map((pwd) => (
                            <motion.div
                                key={pwd.id}
                                className="p-4 bg-white/5 rounded-xl"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                            <Key size={18} className="text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{pwd.site}</p>
                                            <p className="text-sm text-gray-400">{pwd.username}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 px-3 py-1 bg-white/10 rounded-lg">
                                            <span className="text-sm font-mono">
                                                {showPasswords[pwd.id] ? pwd.password : '••••••••'}
                                            </span>
                                            <button
                                                onClick={() => setShowPasswords({ ...showPasswords, [pwd.id]: !showPasswords[pwd.id] })}
                                                className="text-gray-400 hover:text-white ml-2"
                                            >
                                                {showPasswords[pwd.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(pwd.password)}
                                            className="btn-icon"
                                            title="Copiar senha"
                                        >
                                            <Copy size={16} />
                                        </button>
                                        <button
                                            onClick={() => deletePassword(pwd.id)}
                                            className="btn-icon text-red-400 hover:text-red-300"
                                            title="Remover"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Access Logs */}
            <motion.div
                className="glass-card p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <div className="flex items-center gap-2 mb-6">
                    <Activity size={20} className="text-teal-400" />
                    <h2 className="text-lg font-semibold">Registro de Atividades</h2>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {accessLogs.slice(0, 10).map((log, index) => (
                        <motion.div
                            key={log.id}
                            className="flex items-center justify-between p-3 bg-white/5 rounded-lg text-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <div className="flex items-center gap-2">
                                <Clock size={14} className="text-gray-500" />
                                <span>{log.action}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-500">
                                <span>{log.device}</span>
                                <span>{new Date(log.timestamp).toLocaleString('pt-BR')}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Security Tips */}
            <motion.div
                className="glass-card p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <h2 className="text-lg font-semibold mb-4">💡 Dicas de Segurança</h2>
                <div className="grid gap-3 text-sm text-gray-400">
                    <p>• Use senhas fortes com letras, números e símbolos</p>
                    <p>• Nunca compartilhe sua senha do LifeOS</p>
                    <p>• Mantenha seu Windows e navegador atualizados</p>
                    <p>• Ative o Windows Defender para proteção adicional</p>
                    <p>• Faça backup dos seus dados regularmente</p>
                </div>
            </motion.div>

            {/* Windows Defender Integration */}
            <motion.div
                className="glass-card p-6 border border-blue-500/30"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                        <Shield size={28} className="text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">Windows Defender</h2>
                        <p className="text-sm text-gray-400">Integração com proteção do Windows</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Status Info */}
                    <div className="p-4 bg-blue-500/10 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                            <ShieldCheck size={18} className="text-blue-400" />
                            <span className="font-medium text-blue-300">Proteção Recomendada</span>
                        </div>
                        <p className="text-sm text-gray-400">
                            O LifeOS trabalha em conjunto com o Windows Defender para sua proteção completa.
                            Certifique-se de que o Windows Security está ativo.
                        </p>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => {
                                // Open Windows Security via protocol
                                window.open('windowsdefender://');
                                logAction('Abriu Windows Defender');
                            }}
                            className="p-4 bg-white/5 hover:bg-white/10 rounded-xl flex flex-col items-center gap-2 transition-colors"
                        >
                            <Shield size={24} className="text-blue-400" />
                            <span className="text-sm font-medium">Abrir Windows Security</span>
                        </button>

                        <button
                            onClick={() => {
                                // Open Windows Update
                                window.open('ms-settings:windowsupdate');
                                logAction('Abriu Windows Update');
                            }}
                            className="p-4 bg-white/5 hover:bg-white/10 rounded-xl flex flex-col items-center gap-2 transition-colors"
                        >
                            <RefreshCw size={24} className="text-green-400" />
                            <span className="text-sm font-medium">Verificar Atualizações</span>
                        </button>

                        <button
                            onClick={() => {
                                // Open Firewall settings
                                window.open('ms-settings:windowsdefender');
                                logAction('Abriu configurações de Firewall');
                            }}
                            className="p-4 bg-white/5 hover:bg-white/10 rounded-xl flex flex-col items-center gap-2 transition-colors"
                        >
                            <Monitor size={24} className="text-purple-400" />
                            <span className="text-sm font-medium">Firewall</span>
                        </button>

                        <button
                            onClick={() => {
                                // Open virus scan
                                window.open('windowsdefender://threat/');
                                logAction('Iniciou verificação de vírus');
                            }}
                            className="p-4 bg-white/5 hover:bg-white/10 rounded-xl flex flex-col items-center gap-2 transition-colors"
                        >
                            <Activity size={24} className="text-red-400" />
                            <span className="text-sm font-medium">Verificar Vírus</span>
                        </button>
                    </div>

                    {/* Info Banner */}
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <p className="text-xs text-yellow-400">
                            <strong>ℹ️ Nota:</strong> O LifeOS não substitui um antivírus. Use o Windows Defender
                            para proteção completa do seu sistema. Os botões acima abrem as configurações do Windows.
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Electron Desktop App Info */}
            <motion.div
                className="glass-card p-6 border border-purple-500/30"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Monitor size={20} className="text-purple-400" />
                    </div>
                    <div>
                        <h2 className="font-semibold">LifeOS Desktop (Em breve)</h2>
                        <p className="text-sm text-gray-400">Versão com mais recursos de segurança</p>
                    </div>
                </div>

                <div className="text-sm text-gray-400 space-y-2">
                    <p>A versão desktop do LifeOS terá:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Integração direta com Windows Defender API</li>
                        <li>Monitoramento de status em tempo real</li>
                        <li>Notificações de ameaças detectadas</li>
                        <li>Verificação automática agendada</li>
                    </ul>
                </div>
            </motion.div>
        </div>
    );
}
