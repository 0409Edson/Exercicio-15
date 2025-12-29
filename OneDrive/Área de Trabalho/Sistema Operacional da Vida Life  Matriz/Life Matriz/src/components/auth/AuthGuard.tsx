'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Lock,
    Eye,
    EyeOff,
    User,
    Shield,
    Sparkles,
    AlertCircle,
    Check,
    Fingerprint,
    Camera
} from 'lucide-react';
import { useAuthStore } from '@/lib/authStore';
import BiometricAuth from './BiometricAuth';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const {
        isAuthenticated,
        isFirstTime,
        user,
        login,
        setupPassword,
        checkSession,
        updateActivity
    } = useAuthStore();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [userName, setUserName] = useState('Edson de Azevedo Martins');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSetup, setIsSetup] = useState(false);
    const [showBiometric, setShowBiometric] = useState(false);
    const [hasBiometric, setHasBiometric] = useState(false);

    // Check for saved biometric data
    useEffect(() => {
        const savedFace = localStorage.getItem('lifeos-face-data');
        const savedFingerprint = localStorage.getItem('lifeos-fingerprint');
        setHasBiometric(!!(savedFace || savedFingerprint));
    }, []);

    // Check session on mount and activity
    useEffect(() => {
        const interval = setInterval(() => {
            checkSession();
        }, 60000); // Check every minute

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Update activity on user interaction
    useEffect(() => {
        const handleActivity = () => updateActivity();

        window.addEventListener('mousemove', handleActivity);
        window.addEventListener('keypress', handleActivity);

        return () => {
            window.removeEventListener('mousemove', handleActivity);
            window.removeEventListener('keypress', handleActivity);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // If first time, show setup screen
    useEffect(() => {
        if (isFirstTime) {
            setIsSetup(true);
        }
    }, [isFirstTime]);

    const handleBiometricSuccess = () => {
        // Manually set authenticated
        useAuthStore.setState({ isAuthenticated: true, lastActivity: new Date() });
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const success = await login(password);

            if (!success) {
                setError('Senha incorreta. Tente novamente.');
            }
        } catch (err) {
            setError('Erro ao fazer login.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSetup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 4) {
            setError('A senha deve ter pelo menos 4 caracteres.');
            return;
        }

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        if (!userName.trim()) {
            setError('Digite seu nome.');
            return;
        }

        setIsLoading(true);

        try {
            const success = await setupPassword(password, userName);

            if (success) {
                setIsSetup(false);
            } else {
                setError('Erro ao configurar senha.');
            }
        } catch (err) {
            setError('Erro ao configurar.');
        } finally {
            setIsLoading(false);
        }
    };

    // If authenticated, show children
    if (isAuthenticated) {
        return <>{children}</>;
    }

    // Show login or setup screen
    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
            </div>

            <motion.div
                className="relative w-full max-w-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <motion.div
                        className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-teal-500 to-purple-500 flex items-center justify-center mb-4"
                        animate={{
                            boxShadow: ['0 0 20px rgba(20, 184, 166, 0.3)', '0 0 40px rgba(168, 85, 247, 0.3)', '0 0 20px rgba(20, 184, 166, 0.3)']
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                    >
                        <Sparkles size={40} className="text-white" />
                    </motion.div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-purple-400">
                        Life Matriz
                    </h1>
                    <p className="text-gray-400 mt-2">
                        {isSetup ? 'Configure sua senha de acesso' : 'Sistema Operacional da Vida'}
                    </p>
                </div>

                {/* Card */}
                <div className="glass-card p-8">
                    <AnimatePresence mode="wait">
                        {showBiometric ? (
                            // Biometric Auth
                            <motion.div
                                key="biometric"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <BiometricAuth
                                    mode={isSetup ? 'setup' : 'verify'}
                                    onSuccess={handleBiometricSuccess}
                                    onCancel={() => setShowBiometric(false)}
                                />
                            </motion.div>
                        ) : isSetup ? (
                            // Setup Screen
                            <motion.form
                                key="setup"
                                onSubmit={handleSetup}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center">
                                        <Shield size={20} className="text-teal-400" />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold">Bem-vindo ao LifeOS</h2>
                                        <p className="text-sm text-gray-400">Configure sua segurança</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Seu nome</label>
                                        <div className="relative">
                                            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                value={userName}
                                                onChange={(e) => setUserName(e.target.value)}
                                                className="input-field pl-12"
                                                placeholder="Digite seu nome"
                                            />
                                        </div>
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Crie uma senha</label>
                                        <div className="relative">
                                            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="input-field pl-12 pr-12"
                                                placeholder="Mínimo 4 caracteres"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Confirme a senha</label>
                                        <div className="relative">
                                            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="input-field pl-12"
                                                placeholder="Digite novamente"
                                            />
                                            {confirmPassword && password === confirmPassword && (
                                                <Check size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-green-400" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Error */}
                                {error && (
                                    <motion.div
                                        className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 text-sm"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        <AlertCircle size={16} />
                                        {error}
                                    </motion.div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full btn-primary mt-6 py-3 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Shield size={18} />
                                            Proteger meu LifeOS
                                        </>
                                    )}
                                </button>

                                {/* Biometric Setup Option */}
                                <button
                                    type="button"
                                    onClick={() => setShowBiometric(true)}
                                    className="w-full mt-3 py-3 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    <Fingerprint size={18} />
                                    <Camera size={18} />
                                    Configurar Digital ou Face
                                </button>
                            </motion.form>
                        ) : (
                            // Login Screen
                            <motion.form
                                key="login"
                                onSubmit={handleLogin}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                        <Fingerprint size={20} className="text-purple-400" />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold">Olá, {user?.name || 'Usuário'}</h2>
                                        <p className="text-sm text-gray-400">Escolha como deseja entrar</p>
                                    </div>
                                </div>

                                {/* Biometric Options */}
                                {hasBiometric && (
                                    <div className="mb-6">
                                        <button
                                            type="button"
                                            onClick={() => setShowBiometric(true)}
                                            className="w-full p-4 bg-gradient-to-r from-purple-500/20 to-teal-500/20 border border-purple-500/30 rounded-xl flex items-center justify-center gap-3 hover:from-purple-500/30 hover:to-teal-500/30 transition-colors"
                                        >
                                            <Fingerprint size={24} className="text-purple-400" />
                                            <span className="font-medium">Entrar com Digital ou Face</span>
                                            <Camera size={24} className="text-teal-400" />
                                        </button>
                                        <div className="flex items-center gap-3 my-4">
                                            <div className="flex-1 h-px bg-white/10" />
                                            <span className="text-sm text-gray-500">ou use senha</span>
                                            <div className="flex-1 h-px bg-white/10" />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {/* Password */}
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Senha</label>
                                        <div className="relative">
                                            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="input-field pl-12 pr-12"
                                                placeholder="Digite sua senha"
                                                autoFocus={!hasBiometric}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Error */}
                                {error && (
                                    <motion.div
                                        className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 text-sm"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        <AlertCircle size={16} />
                                        {error}
                                    </motion.div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading || !password}
                                    className="w-full btn-primary mt-6 py-3 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Lock size={18} />
                                            Entrar com Senha
                                        </>
                                    )}
                                </button>

                                {/* Setup biometric if not configured */}
                                {!hasBiometric && (
                                    <button
                                        type="button"
                                        onClick={() => setShowBiometric(true)}
                                        className="w-full mt-3 py-3 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors"
                                    >
                                        <Fingerprint size={18} />
                                        <Camera size={18} />
                                        Configurar Digital ou Face
                                    </button>
                                )}
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <p className="text-center text-gray-500 text-sm mt-6">
                    🔒 Seus dados estão protegidos localmente
                </p>
            </motion.div>
        </div>
    );
}
