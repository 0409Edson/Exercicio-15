'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles,
    Mail,
    Lock,
    User,
    ArrowRight,
    Eye,
    EyeOff,
    Chrome,
    AlertCircle,
    Check
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type AuthMode = 'login' | 'register';

export default function LoginPage() {
    const [mode, setMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const router = useRouter();
    const { signIn, signUp, signInWithGoogle } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            if (mode === 'login') {
                const { error } = await signIn(email, password);
                if (error) throw error;
                router.push('/');
            } else {
                const { error } = await signUp(email, password, name);
                if (error) throw error;
                setSuccess('Conta criada! Verifique seu email para confirmar.');
            }
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await signInWithGoogle();
        } catch (err: any) {
            setError(err.message || 'Erro ao conectar com Google.');
        }
    };

    const features = [
        'Gerencie todos os aspectos da sua vida',
        'IA que entende seus objetivos',
        'Organize finanças, saúde e carreira',
        'Insights personalizados',
    ];

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-12 flex-col justify-between relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-16">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-purple-500 flex items-center justify-center">
                            <Sparkles size={24} className="text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white">LifeOS</span>
                    </div>

                    {/* Headline */}
                    <motion.h1
                        className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        O Sistema Operacional<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-purple-400">
                            da Sua Vida
                        </span>
                    </motion.h1>

                    <motion.p
                        className="text-gray-400 text-lg mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        Um sistema inteligente que integra objetivos, finanças, saúde e carreira em um único lugar.
                    </motion.p>

                    {/* Features */}
                    <div className="space-y-4">
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature}
                                className="flex items-center gap-3"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + index * 0.1 }}
                            >
                                <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center">
                                    <Check size={14} className="text-teal-400" />
                                </div>
                                <span className="text-gray-300">{feature}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Footer Quote */}
                <div className="relative z-10">
                    <p className="text-gray-500 text-sm">
                        &quot;Transforme sua vida com inteligência artificial.&quot;
                    </p>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-950">
                <motion.div
                    className="w-full max-w-md"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-purple-500 flex items-center justify-center">
                            <Sparkles size={20} className="text-white" />
                        </div>
                        <span className="text-xl font-bold text-white">LifeOS</span>
                    </div>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-white">
                            {mode === 'login' ? 'Bem-vindo de volta!' : 'Crie sua conta'}
                        </h2>
                        <p className="text-gray-400 mt-2">
                            {mode === 'login'
                                ? 'Entre para acessar seu LifeOS'
                                : 'Comece sua jornada de transformação'}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <AnimatePresence mode="wait">
                            {mode === 'register' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    <label className="block text-sm text-gray-400 mb-2">Nome</label>
                                    <div className="relative">
                                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Seu nome"
                                            className="input-field pl-12"
                                            required={mode === 'register'}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Email</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                    className="input-field pl-12"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Senha</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="input-field pl-12 pr-12"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg"
                            >
                                <AlertCircle size={16} />
                                {error}
                            </motion.div>
                        )}

                        {/* Success Message */}
                        {success && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 p-3 rounded-lg"
                            >
                                <Check size={16} />
                                {success}
                            </motion.div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {mode === 'login' ? 'Entrar' : 'Criar conta'}
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-white/10" />
                        <span className="text-gray-500 text-sm">ou</span>
                        <div className="flex-1 h-px bg-white/10" />
                    </div>

                    {/* Google Login */}
                    <button
                        onClick={handleGoogleLogin}
                        className="btn-secondary w-full flex items-center justify-center gap-3 py-3"
                    >
                        <Chrome size={18} />
                        Continuar com Google
                    </button>

                    {/* Toggle Mode */}
                    <p className="text-center text-gray-400 mt-6">
                        {mode === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                        <button
                            type="button"
                            onClick={() => {
                                setMode(mode === 'login' ? 'register' : 'login');
                                setError('');
                                setSuccess('');
                            }}
                            className="text-teal-400 font-medium ml-2 hover:text-teal-300"
                        >
                            {mode === 'login' ? 'Criar conta' : 'Fazer login'}
                        </button>
                    </p>

                    {/* Demo Mode */}
                    <div className="mt-8 text-center">
                        <button
                            type="button"
                            onClick={() => router.push('/')}
                            className="text-gray-500 text-sm hover:text-gray-300"
                        >
                            Continuar em modo demonstração →
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
