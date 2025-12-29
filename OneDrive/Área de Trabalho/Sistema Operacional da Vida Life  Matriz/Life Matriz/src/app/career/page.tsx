'use client';

import { motion } from 'framer-motion';
import {
    GraduationCap,
    BookOpen,
    Trophy,
    Target,
    Globe,
    Briefcase,
    Star,
    TrendingUp,
    Clock,
    CheckCircle2
} from 'lucide-react';

export default function CareerPage() {
    const skills = [
        { name: 'React/Next.js', level: 85, category: 'tech' },
        { name: 'TypeScript', level: 70, category: 'tech' },
        { name: 'Node.js', level: 65, category: 'tech' },
        { name: 'UI/UX Design', level: 60, category: 'design' },
        { name: 'Inglês', level: 55, category: 'language' },
    ];

    const courses = [
        { id: '1', title: 'Advanced React Patterns', platform: 'Udemy', progress: 68, hours: 12 },
        { id: '2', title: 'AWS Solutions Architect', platform: 'Coursera', progress: 25, hours: 40 },
        { id: '3', title: 'IELTS Preparation', platform: 'British Council', progress: 40, hours: 20 },
    ];

    const goals = [
        { id: '1', title: 'Certificação AWS', deadline: 'Mar 2025', status: 'in-progress' },
        { id: '2', title: 'IELTS Score 7+', deadline: 'Jun 2025', status: 'in-progress' },
        { id: '3', title: 'Portfolio Internacional', deadline: 'Fev 2025', status: 'pending' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">Carreira & Estudos</h1>
                <p className="text-gray-400 mt-1">Desenvolva suas habilidades e alcance seus objetivos profissionais</p>
            </div>

            {/* Career Goal */}
            <motion.div
                className="glass-card p-6 border-l-4 border-purple-500"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                        <Globe size={28} className="text-purple-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-lg">Objetivo: Trabalhar na Europa</h3>
                        <p className="text-gray-400 text-sm mt-1">
                            Conseguir uma posição como desenvolvedor sênior em uma empresa europeia até 2026
                        </p>
                        <div className="mt-4">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-400">Progresso geral</span>
                                <span className="text-purple-400">33%</span>
                            </div>
                            <div className="progress-bar">
                                <motion.div
                                    className="progress-bar-fill"
                                    initial={{ width: 0 }}
                                    animate={{ width: '33%' }}
                                    transition={{ duration: 1 }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Skills & Courses Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Skills */}
                <motion.div
                    className="glass-card p-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Star size={20} className="text-yellow-400" />
                        Suas Habilidades
                    </h3>
                    <div className="space-y-4">
                        {skills.map((skill, index) => (
                            <div key={skill.name}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>{skill.name}</span>
                                    <span className="text-teal-400">{skill.level}%</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-teal-500 to-purple-500 rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${skill.level}%` }}
                                        transition={{ delay: index * 0.1, duration: 0.8 }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="btn-secondary w-full mt-4 text-sm">
                        + Adicionar Habilidade
                    </button>
                </motion.div>

                {/* Active Courses */}
                <motion.div
                    className="glass-card p-6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <BookOpen size={20} className="text-blue-400" />
                        Cursos em Andamento
                    </h3>
                    <div className="space-y-4">
                        {courses.map((course, index) => (
                            <motion.div
                                key={course.id}
                                className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="font-medium">{course.title}</p>
                                        <p className="text-xs text-gray-500">{course.platform} • {course.hours}h</p>
                                    </div>
                                    <span className="text-sm text-teal-400 font-medium">{course.progress}%</span>
                                </div>
                                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-teal-500 rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${course.progress}%` }}
                                        transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    <button className="btn-primary w-full mt-4 text-sm">
                        Descobrir Novos Cursos
                    </button>
                </motion.div>
            </div>

            {/* Milestones */}
            <motion.div
                className="glass-card p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Trophy size={20} className="text-yellow-400" />
                    Marcos de Carreira
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {goals.map((goal, index) => (
                        <motion.div
                            key={goal.id}
                            className={`p-4 rounded-lg border ${goal.status === 'in-progress'
                                    ? 'bg-teal-500/10 border-teal-500/30'
                                    : 'bg-white/5 border-white/10'
                                }`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                        >
                            <div className="flex items-start gap-3">
                                {goal.status === 'in-progress' ? (
                                    <TrendingUp size={18} className="text-teal-400 mt-0.5" />
                                ) : (
                                    <Target size={18} className="text-gray-400 mt-0.5" />
                                )}
                                <div>
                                    <p className="font-medium">{goal.title}</p>
                                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                        <Clock size={12} />
                                        {goal.deadline}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* AI Suggestions */}
            <motion.div
                className="glass-card p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Briefcase size={20} className="text-teal-400" />
                    Sugestões da IA para sua Carreira
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-lg">
                        <p className="font-medium text-teal-400 mb-2">📍 Países recomendados</p>
                        <p className="text-sm text-gray-400">
                            Com seu perfil, Alemanha, Portugal e Holanda têm mais oportunidades para desenvolvedores React.
                        </p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-lg">
                        <p className="font-medium text-purple-400 mb-2">📚 Próximo passo</p>
                        <p className="text-sm text-gray-400">
                            Complete o curso de AWS esta semana. Isso aumentará suas chances em 35% segundo análise de vagas.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
