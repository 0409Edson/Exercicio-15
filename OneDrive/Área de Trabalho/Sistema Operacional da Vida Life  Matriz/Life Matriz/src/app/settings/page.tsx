'use client';

import { motion } from 'framer-motion';
import {
    User,
    Bell,
    Palette,
    Link2,
    Shield,
    Sparkles,
    Mic,
    MessageSquare,
    Search,
    Moon,
    Volume2,
    Mail,
    Smartphone,
    BarChart3,
    Share2,
    Check,
    Trash2,
    RefreshCw
} from 'lucide-react';
import { useSettingsStore } from '@/lib/settingsStore';
import { useLifeOSStore } from '@/lib/store';

// Toggle Component
function Toggle({
    enabled,
    onChange,
    disabled = false
}: {
    enabled: boolean;
    onChange: (value: boolean) => void;
    disabled?: boolean;
}) {
    return (
        <button
            onClick={() => !disabled && onChange(!enabled)}
            disabled={disabled}
            className={`relative w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-teal-500' : 'bg-gray-600'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
            <motion.div
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                animate={{ left: enabled ? '28px' : '4px' }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
        </button>
    );
}

// Setting Row Component
function SettingRow({
    icon: Icon,
    title,
    description,
    children
}: {
    icon: any;
    title: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                    <Icon size={18} className="text-gray-400" />
                </div>
                <div>
                    <p className="font-medium">{title}</p>
                    {description && <p className="text-sm text-gray-500">{description}</p>}
                </div>
            </div>
            {children}
        </div>
    );
}

export default function SettingsPage() {
    const settings = useSettingsStore();
    const { user, logout } = useLifeOSStore();

    const handleClearData = () => {
        if (confirm('Tem certeza? Isso irá apagar todos os seus dados (objetivos, hábitos, diário, etc). Esta ação não pode ser desfeita.')) {
            localStorage.clear();
            window.location.reload();
        }
    };

    const handleResetSettings = () => {
        if (confirm('Restaurar configurações padrão?')) {
            settings.resetSettings();
        }
    };

    return (
        <div className="space-y-6 max-w-3xl">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">Configurações</h1>
                <p className="text-gray-400 mt-1">Personalize o LifeOS do seu jeito</p>
            </div>

            {/* Profile Section */}
            <motion.div
                className="glass-card p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <User size={20} className="text-teal-400" />
                    Perfil
                </h2>

                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-purple-500 flex items-center justify-center text-2xl font-bold">
                        {(user?.name || settings.userName || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                        <input
                            type="text"
                            value={settings.userName || user?.name || ''}
                            onChange={(e) => settings.updateSetting('userName', e.target.value)}
                            placeholder="Seu nome"
                            className="input-field mb-2"
                        />
                        <input
                            type="email"
                            value={settings.userEmail || user?.email || ''}
                            onChange={(e) => settings.updateSetting('userEmail', e.target.value)}
                            placeholder="seu@email.com"
                            className="input-field"
                        />
                    </div>
                </div>
            </motion.div>

            {/* Notifications Section */}
            <motion.div
                className="glass-card p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Bell size={20} className="text-teal-400" />
                    Notificações
                </h2>

                <SettingRow
                    icon={Bell}
                    title="Notificações gerais"
                    description="Ativar todas as notificações"
                >
                    <Toggle
                        enabled={settings.enableNotifications}
                        onChange={(v) => settings.updateSetting('enableNotifications', v)}
                    />
                </SettingRow>

                <SettingRow
                    icon={Smartphone}
                    title="Notificações push"
                    description="Receber no navegador"
                >
                    <Toggle
                        enabled={settings.enablePushNotifications}
                        onChange={(v) => settings.updateSetting('enablePushNotifications', v)}
                        disabled={!settings.enableNotifications}
                    />
                </SettingRow>

                <SettingRow
                    icon={Mail}
                    title="Notificações por email"
                    description="Resumos e alertas importantes"
                >
                    <Toggle
                        enabled={settings.enableEmailNotifications}
                        onChange={(v) => settings.updateSetting('enableEmailNotifications', v)}
                        disabled={!settings.enableNotifications}
                    />
                </SettingRow>

                <SettingRow
                    icon={Volume2}
                    title="Sons"
                    description="Tocar som nas notificações"
                >
                    <Toggle
                        enabled={settings.enableSoundNotifications}
                        onChange={(v) => settings.updateSetting('enableSoundNotifications', v)}
                        disabled={!settings.enableNotifications}
                    />
                </SettingRow>
            </motion.div>

            {/* AI Assistant Section */}
            <motion.div
                className="glass-card p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Sparkles size={20} className="text-teal-400" />
                    Assistente de IA
                </h2>

                <SettingRow
                    icon={MessageSquare}
                    title="Chat com IA"
                    description="Botão de chat no canto inferior direito"
                >
                    <Toggle
                        enabled={settings.enableAIChat}
                        onChange={(v) => settings.updateSetting('enableAIChat', v)}
                    />
                </SettingRow>

                <SettingRow
                    icon={Mic}
                    title="Assistente de Voz"
                    description="Botão de voz no canto inferior esquerdo"
                >
                    <Toggle
                        enabled={settings.enableVoiceAssistant}
                        onChange={(v) => settings.updateSetting('enableVoiceAssistant', v)}
                    />
                </SettingRow>

                <SettingRow
                    icon={Bell}
                    title="Assistente Proativo"
                    description="Notificações automáticas de ofertas e lembretes"
                >
                    <Toggle
                        enabled={settings.enableProactiveAssistant}
                        onChange={(v) => settings.updateSetting('enableProactiveAssistant', v)}
                    />
                </SettingRow>

                <SettingRow
                    icon={Search}
                    title="Busca Automática"
                    description="Buscar ofertas baseado no seu comportamento"
                >
                    <Toggle
                        enabled={settings.enableAutoSearch}
                        onChange={(v) => settings.updateSetting('enableAutoSearch', v)}
                        disabled={!settings.enableProactiveAssistant}
                    />
                </SettingRow>
            </motion.div>

            {/* Appearance Section */}
            <motion.div
                className="glass-card p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Palette size={20} className="text-teal-400" />
                    Aparência
                </h2>

                <SettingRow
                    icon={Moon}
                    title="Tema"
                    description="Escolha o tema do aplicativo"
                >
                    <select
                        value={settings.theme}
                        onChange={(e) => settings.updateSetting('theme', e.target.value as any)}
                        className="input-field w-auto"
                    >
                        <option value="dark">Escuro</option>
                        <option value="light">Claro (em breve)</option>
                        <option value="system">Sistema</option>
                    </select>
                </SettingRow>

                <SettingRow
                    icon={Palette}
                    title="Cor de destaque"
                    description="Cor principal do app"
                >
                    <div className="flex gap-2">
                        {(['teal', 'purple', 'blue', 'green', 'orange'] as const).map(color => {
                            const colors = {
                                teal: 'bg-teal-500',
                                purple: 'bg-purple-500',
                                blue: 'bg-blue-500',
                                green: 'bg-green-500',
                                orange: 'bg-orange-500',
                            };
                            return (
                                <button
                                    key={color}
                                    onClick={() => settings.updateSetting('accentColor', color)}
                                    className={`w-8 h-8 rounded-full ${colors[color]} flex items-center justify-center ${settings.accentColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' : ''
                                        }`}
                                >
                                    {settings.accentColor === color && <Check size={14} className="text-white" />}
                                </button>
                            );
                        })}
                    </div>
                </SettingRow>
            </motion.div>

            {/* Privacy Section */}
            <motion.div
                className="glass-card p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Shield size={20} className="text-teal-400" />
                    Privacidade
                </h2>

                <SettingRow
                    icon={BarChart3}
                    title="Analytics"
                    description="Ajudar a melhorar o app com dados anônimos"
                >
                    <Toggle
                        enabled={settings.enableAnalytics}
                        onChange={(v) => settings.updateSetting('enableAnalytics', v)}
                    />
                </SettingRow>

                <SettingRow
                    icon={Share2}
                    title="Compartilhar dados de uso"
                    description="Para recomendações personalizadas"
                >
                    <Toggle
                        enabled={settings.shareUsageData}
                        onChange={(v) => settings.updateSetting('shareUsageData', v)}
                    />
                </SettingRow>
            </motion.div>

            {/* Integrations Section */}
            <motion.div
                className="glass-card p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Link2 size={20} className="text-teal-400" />
                    Integrações
                </h2>

                <SettingRow
                    icon={Link2}
                    title="Google Calendar"
                    description="Sincronizar eventos"
                >
                    <button
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${settings.googleCalendarConnected
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-white/10 text-gray-300 hover:bg-white/20'
                            }`}
                        onClick={() => settings.updateSetting('googleCalendarConnected', !settings.googleCalendarConnected)}
                    >
                        {settings.googleCalendarConnected ? 'Conectado ✓' : 'Conectar'}
                    </button>
                </SettingRow>

                <SettingRow
                    icon={Link2}
                    title="Notion"
                    description="Sincronizar notas e documentos"
                >
                    <button
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${settings.notionConnected
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-white/10 text-gray-300 hover:bg-white/20'
                            }`}
                        onClick={() => settings.updateSetting('notionConnected', !settings.notionConnected)}
                    >
                        {settings.notionConnected ? 'Conectado ✓' : 'Conectar'}
                    </button>
                </SettingRow>

                <SettingRow
                    icon={Link2}
                    title="Spotify"
                    description="Músicas para foco e relaxamento"
                >
                    <button
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${settings.spotifyConnected
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-white/10 text-gray-300 hover:bg-white/20'
                            }`}
                        onClick={() => settings.updateSetting('spotifyConnected', !settings.spotifyConnected)}
                    >
                        {settings.spotifyConnected ? 'Conectado ✓' : 'Conectar'}
                    </button>
                </SettingRow>
            </motion.div>

            {/* Danger Zone */}
            <motion.div
                className="glass-card p-6 border-red-500/30"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <h2 className="text-lg font-semibold mb-4 text-red-400">Zona de Perigo</h2>

                <div className="flex gap-3">
                    <button
                        onClick={handleResetSettings}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
                    >
                        <RefreshCw size={16} />
                        Restaurar configurações
                    </button>
                    <button
                        onClick={handleClearData}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm"
                    >
                        <Trash2 size={16} />
                        Apagar todos os dados
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
