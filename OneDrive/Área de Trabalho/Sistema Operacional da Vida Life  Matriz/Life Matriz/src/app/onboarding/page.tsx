'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    Sparkles,
    Target,
    Wallet,
    Heart,
    GraduationCap,
    Globe,
    ArrowRight,
    ArrowLeft,
    Check,
    Plus,
    X
} from 'lucide-react';
import { useLifeOSStore } from '@/lib/store';
import { generateUniqueId } from '@/lib/generateId';

interface LifeGoal {
    id: string;
    title: string;
    category: 'career' | 'finance' | 'health' | 'education' | 'personal';
    description: string;
    deadline: string;
}

const categoryOptions = [
    { id: 'career', label: 'Carreira', icon: GraduationCap, color: 'from-blue-500 to-blue-600' },
    { id: 'finance', label: 'Finanças', icon: Wallet, color: 'from-green-500 to-green-600' },
    { id: 'health', label: 'Saúde', icon: Heart, color: 'from-red-500 to-red-600' },
    { id: 'education', label: 'Educação', icon: Globe, color: 'from-purple-500 to-purple-600' },
    { id: 'personal', label: 'Pessoal', icon: Target, color: 'from-teal-500 to-teal-600' },
];

const suggestedGoals = [
    { title: 'Estudar no exterior', category: 'education' as const, description: 'Conseguir admissão em universidade internacional' },
    { title: 'Atingir €4.000/mês', category: 'finance' as const, description: 'Aumentar renda mensal com trabalho e freelas' },
    { title: 'Manter saúde mental', category: 'health' as const, description: 'Equilibrar trabalho e vida pessoal' },
    { title: 'Aprender novo idioma', category: 'education' as const, description: 'Alcançar fluência em inglês ou outro idioma' },
    { title: 'Mudar de carreira', category: 'career' as const, description: 'Transição para uma nova área profissional' },
    { title: 'Economizar para reserva', category: 'finance' as const, description: 'Construir reserva de emergência de 6 meses' },
];

export default function OnboardingPage() {
    const router = useRouter();
    const { addGoal, setUser } = useLifeOSStore();
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [selectedGoals, setSelectedGoals] = useState<LifeGoal[]>([]);
    const [customGoal, setCustomGoal] = useState({ title: '', category: 'personal' as const, description: '', deadline: '' });
    const [showCustomForm, setShowCustomForm] = useState(false);

    const totalSteps = 3;

    const handleAddSuggestedGoal = (goal: typeof suggestedGoals[0]) => {
        const newGoal: LifeGoal = {
            id: generateUniqueId('goal-'),
            title: goal.title,
            category: goal.category,
            description: goal.description,
            deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 ano
        };
        setSelectedGoals([...selectedGoals, newGoal]);
    };

    const handleRemoveGoal = (id: string) => {
        setSelectedGoals(selectedGoals.filter(g => g.id !== id));
    };

    const handleAddCustomGoal = () => {
        if (!customGoal.title) return;

        const newGoal: LifeGoal = {
            id: generateUniqueId('goal-'),
            title: customGoal.title,
            category: customGoal.category,
            description: customGoal.description,
            deadline: customGoal.deadline || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        };
        setSelectedGoals([...selectedGoals, newGoal]);
        setCustomGoal({ title: '', category: 'personal', description: '', deadline: '' });
        setShowCustomForm(false);
    };

    const handleComplete = () => {
        // Set demo user
        setUser({
            id: 'demo-user',
            email: 'demo@lifeos.app',
            name: name || 'Usuário',
            createdAt: new Date().toISOString(),
        });

        // Add all goals to store
        selectedGoals.forEach(goal => {
            addGoal({
                userId: 'demo-user',
                title: goal.title,
                description: goal.description,
                category: goal.category,
                priority: 'high',
                progress: 0,
                deadline: goal.deadline,
                subgoals: [],
            });
        });

        // Mark onboarding as complete
        localStorage.setItem('lifeos-onboarding-complete', 'true');

        router.push('/');
    };

    const canProceed = () => {
        if (step === 1) return name.length >= 2;
        if (step === 2) return selectedGoals.length >= 1;
        return true;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-20 left-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            </div>

            <motion.div
                className="w-full max-w-2xl relative z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                        <span>Passo {step} de {totalSteps}</span>
                        <span>{Math.round((step / totalSteps) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-teal-500 to-purple-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${(step / totalSteps) * 100}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                </div>

                {/* Card */}
                <div className="glass-card p-8">
                    <AnimatePresence mode="wait">
                        {/* Step 1: Welcome & Name */}
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center">
                                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-teal-500 to-purple-500 flex items-center justify-center mb-4">
                                        <Sparkles size={32} className="text-white" />
                                    </div>
                                    <h1 className="text-2xl font-bold mb-2">Bem-vindo ao LifeOS!</h1>
                                    <p className="text-gray-400">
                                        Vamos configurar seu sistema operacional da vida.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Como posso te chamar?</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Seu nome"
                                        className="input-field text-lg text-center"
                                        autoFocus
                                    />
                                </div>

                                <div className="bg-white/5 rounded-lg p-4">
                                    <p className="text-sm text-gray-400">
                                        <strong className="text-teal-400">O que é o LifeOS?</strong><br />
                                        Um sistema que integra seus objetivos, finanças, saúde e carreira em um único lugar,
                                        com IA que te ajuda a tomar decisões e otimizar sua rotina.
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Goals */}
                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold mb-2">
                                        {name ? `${name}, ` : ''}quais são seus objetivos de vida?
                                    </h2>
                                    <p className="text-gray-400">
                                        Selecione ou adicione os objetivos que você quer alcançar
                                    </p>
                                </div>

                                {/* Selected Goals */}
                                {selectedGoals.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-sm text-gray-400">Seus objetivos:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedGoals.map(goal => {
                                                const cat = categoryOptions.find(c => c.id === goal.category);
                                                return (
                                                    <motion.div
                                                        key={goal.id}
                                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r ${cat?.color} text-white text-sm`}
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                    >
                                                        <span>{goal.title}</span>
                                                        <button onClick={() => handleRemoveGoal(goal.id)}>
                                                            <X size={14} />
                                                        </button>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Suggested Goals */}
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-400">Sugestões populares:</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {suggestedGoals
                                            .filter(sg => !selectedGoals.some(g => g.title === sg.title))
                                            .map(goal => {
                                                const cat = categoryOptions.find(c => c.id === goal.category);
                                                const Icon = cat?.icon || Target;
                                                return (
                                                    <button
                                                        key={goal.title}
                                                        onClick={() => handleAddSuggestedGoal(goal)}
                                                        className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-left"
                                                    >
                                                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${cat?.color} flex items-center justify-center`}>
                                                            <Icon size={16} className="text-white" />
                                                        </div>
                                                        <span className="text-sm font-medium">{goal.title}</span>
                                                    </button>
                                                );
                                            })}
                                    </div>
                                </div>

                                {/* Custom Goal Form */}
                                {showCustomForm ? (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="space-y-3 p-4 bg-white/5 rounded-lg"
                                    >
                                        <input
                                            type="text"
                                            value={customGoal.title}
                                            onChange={(e) => setCustomGoal({ ...customGoal, title: e.target.value })}
                                            placeholder="Nome do objetivo"
                                            className="input-field"
                                            autoFocus
                                        />
                                        <select
                                            value={customGoal.category}
                                            onChange={(e) => setCustomGoal({ ...customGoal, category: e.target.value as any })}
                                            className="input-field"
                                        >
                                            {categoryOptions.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.label}</option>
                                            ))}
                                        </select>
                                        <textarea
                                            value={customGoal.description}
                                            onChange={(e) => setCustomGoal({ ...customGoal, description: e.target.value })}
                                            placeholder="Descrição (opcional)"
                                            className="input-field resize-none"
                                            rows={2}
                                        />
                                        <div className="flex gap-2">
                                            <button onClick={handleAddCustomGoal} className="btn-primary flex-1">
                                                Adicionar
                                            </button>
                                            <button onClick={() => setShowCustomForm(false)} className="btn-secondary">
                                                Cancelar
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <button
                                        onClick={() => setShowCustomForm(true)}
                                        className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-white/20 rounded-lg hover:border-teal-500/50 transition-colors text-gray-400 hover:text-teal-400"
                                    >
                                        <Plus size={18} />
                                        <span>Adicionar objetivo personalizado</span>
                                    </button>
                                )}
                            </motion.div>
                        )}

                        {/* Step 3: Confirmation */}
                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center">
                                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center mb-4">
                                        <Check size={32} className="text-white" />
                                    </div>
                                    <h2 className="text-2xl font-bold mb-2">Tudo pronto, {name}!</h2>
                                    <p className="text-gray-400">
                                        Seu LifeOS está configurado com {selectedGoals.length} objetivo{selectedGoals.length !== 1 ? 's' : ''}
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    {selectedGoals.map((goal, index) => {
                                        const cat = categoryOptions.find(c => c.id === goal.category);
                                        const Icon = cat?.icon || Target;
                                        return (
                                            <motion.div
                                                key={goal.id}
                                                className="flex items-center gap-3 p-4 bg-white/5 rounded-lg"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                            >
                                                <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${cat?.color} flex items-center justify-center`}>
                                                    <Icon size={20} className="text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium">{goal.title}</p>
                                                    <p className="text-sm text-gray-400">{goal.description}</p>
                                                </div>
                                                <Check size={18} className="text-green-400" />
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                <div className="bg-teal-500/10 border border-teal-500/30 rounded-lg p-4">
                                    <p className="text-sm text-teal-400">
                                        <strong>🤖 IA Ativada!</strong><br />
                                        Vou analisar seus objetivos e te dar sugestões personalizadas todos os dias.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="flex gap-3 mt-8">
                        {step > 1 && (
                            <button
                                onClick={() => setStep(step - 1)}
                                className="btn-secondary flex items-center gap-2"
                            >
                                <ArrowLeft size={18} />
                                Voltar
                            </button>
                        )}
                        <button
                            onClick={() => step < totalSteps ? setStep(step + 1) : handleComplete()}
                            disabled={!canProceed()}
                            className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {step === totalSteps ? (
                                <>
                                    Começar a usar
                                    <Sparkles size={18} />
                                </>
                            ) : (
                                <>
                                    Continuar
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Skip Option */}
                {step === 1 && (
                    <p className="text-center mt-4">
                        <button
                            onClick={() => {
                                localStorage.setItem('lifeos-onboarding-complete', 'true');
                                router.push('/');
                            }}
                            className="text-gray-500 text-sm hover:text-gray-300"
                        >
                            Pular configuração e explorar →
                        </button>
                    </p>
                )}
            </motion.div>
        </div>
    );
}
