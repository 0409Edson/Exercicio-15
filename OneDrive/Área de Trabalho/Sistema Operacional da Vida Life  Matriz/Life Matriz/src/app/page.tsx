'use client';

import { motion } from 'framer-motion';
import {
  Target,
  Calendar,
  Wallet,
  Heart,
  GraduationCap,
  TrendingUp,
  Clock,
  Zap,
  Plus,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  LifeScoreRing,
  StatCard,
  ModuleCard,
  QuickAction,
  InsightCard,
  ActivityTracker,
  AIInsightsPanel,
  AIRecommendations,
  DailyProgress
} from '@/components/dashboard';
import { useCurrentDate } from '@/hooks/useCurrentDate';

export default function DashboardPage() {
  // Data dinâmica do dispositivo (funciona offline)
  const dateInfo = useCurrentDate();

  // Dados mockados - futuramente virão da API/Store
  const stats = {
    lifeScore: 73,
    goalsCompleted: 12,
    goalsTotal: 18,
    tasksToday: 5,
    hoursProductive: 6.5,
    streak: 14,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold">{dateInfo.greeting}, Edson! 👋</h1>
        <p className="text-gray-400 mt-1">
          {dateInfo.formatted} • Aqui está o resumo do seu dia
        </p>
      </motion.div>

      {/* Life Score + Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Life Score Card */}
        <motion.div
          className="glass-card p-6 lg:col-span-1 flex flex-col items-center justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <LifeScoreRing score={stats.lifeScore} />
          <p className="text-sm text-gray-400 mt-4 text-center">
            Seu progresso geral está <span className="text-teal-400 font-medium">acima da média</span>
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            icon={<Target size={24} className="text-teal-400" />}
            iconBg="bg-teal-500/20"
            title="Objetivos Concluídos"
            value={`${stats.goalsCompleted}/${stats.goalsTotal}`}
            change={8}
            delay={0.1}
          />
          <StatCard
            icon={<CheckCircle2 size={24} className="text-green-400" />}
            iconBg="bg-green-500/20"
            title="Tarefas Hoje"
            value={stats.tasksToday}
            subtitle="3 pendentes"
            delay={0.2}
          />
          <StatCard
            icon={<Clock size={24} className="text-purple-400" />}
            iconBg="bg-purple-500/20"
            title="Horas Produtivas"
            value={`${stats.hoursProductive}h`}
            change={12}
            delay={0.3}
          />
          <StatCard
            icon={<Zap size={24} className="text-yellow-400" />}
            iconBg="bg-yellow-500/20"
            title="Streak Atual"
            value={`${stats.streak} dias`}
            change={7}
            delay={0.4}
          />
          <StatCard
            icon={<TrendingUp size={24} className="text-blue-400" />}
            iconBg="bg-blue-500/20"
            title="Progresso Semanal"
            value="87%"
            change={15}
            delay={0.5}
          />
          <StatCard
            icon={<AlertCircle size={24} className="text-orange-400" />}
            iconBg="bg-orange-500/20"
            title="Alertas Pendentes"
            value="2"
            subtitle="Ver detalhes"
            delay={0.6}
          />
        </div>
      </div>

      {/* Modules Grid */}
      <div>
        <motion.h2
          className="text-xl font-semibold mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Seus Módulos
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <ModuleCard
            icon={<Target size={24} />}
            iconClass="goals"
            title="Objetivos"
            description="Defina e rastreie suas metas de vida"
            progress={67}
            href="/goals"
            delay={0.4}
          />
          <ModuleCard
            icon={<Calendar size={24} />}
            iconClass="calendar"
            title="Agenda"
            description="Organize sua rotina inteligente"
            progress={82}
            href="/calendar"
            delay={0.5}
          />
          <ModuleCard
            icon={<Wallet size={24} />}
            iconClass="finance"
            title="Finanças"
            description="Gerencie renda e investimentos"
            progress={45}
            href="/finance"
            delay={0.6}
          />
          <ModuleCard
            icon={<Heart size={24} />}
            iconClass="health"
            title="Saúde"
            description="Monitore bem-estar físico e mental"
            progress={58}
            href="/health"
            delay={0.7}
          />
          <ModuleCard
            icon={<GraduationCap size={24} />}
            iconClass="career"
            title="Carreira"
            description="Evolua profissionalmente"
            progress={33}
            href="/career"
            delay={0.8}
          />
        </div>
      </div>

      {/* Bottom Row: Quick Actions + AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Ações Rápidas</h3>
            <button className="btn-icon">
              <Plus size={18} />
            </button>
          </div>
          <div className="space-y-3">
            <QuickAction
              icon={<Target size={18} className="text-teal-400" />}
              iconBg="bg-teal-500/20"
              title="Adicionar novo objetivo"
              description="Defina uma nova meta de vida"
              delay={0.6}
            />
            <QuickAction
              icon={<Calendar size={18} className="text-purple-400" />}
              iconBg="bg-purple-500/20"
              title="Agendar tarefa"
              description="Adicione à sua agenda"
              delay={0.7}
            />
            <QuickAction
              icon={<Wallet size={18} className="text-green-400" />}
              iconBg="bg-green-500/20"
              title="Registrar transação"
              description="Atualize suas finanças"
              delay={0.8}
            />
          </div>
        </motion.div>

        {/* AI Insights */}
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-lg font-semibold mb-4">Insights da IA 🤖</h3>
          <div className="space-y-4">
            <InsightCard
              type="ai"
              title="Recomendação de foco"
              description="Baseado no seu padrão, sugiro focar em 'Aprender inglês' hoje. Seu pico de concentração é às 10h."
              action="Ver detalhes"
              delay={0.7}
            />
            <InsightCard
              type="tip"
              title="Dica de produtividade"
              description="Você completou 3 tarefas antes do almoço! Mantenha esse ritmo para bater sua meta semanal."
              delay={0.8}
            />
            <InsightCard
              type="alert"
              title="Atenção: Orçamento"
              description="Você está a R$150 do limite mensal de gastos com lazer. Considere ajustar."
              action="Ajustar orçamento"
              delay={0.9}
            />
          </div>
        </motion.div>
      </div>

      {/* Activity Tracking */}
      <div>
        <motion.h2
          className="text-xl font-semibold mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          Rastreamento de Atividades 🖥️
        </motion.h2>
        <ActivityTracker />
      </div>

      {/* AI Section - Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Recommendations */}
        <div>
          <motion.h2
            className="text-xl font-semibold mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            Recomendações 💡
          </motion.h2>
          <AIRecommendations />
        </div>

        {/* Daily Progress */}
        <div>
          <motion.h2
            className="text-xl font-semibold mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            Seu Progresso 📊
          </motion.h2>
          <DailyProgress />
        </div>
      </div>

      {/* AI Learning */}
      <div>
        <motion.h2
          className="text-xl font-semibold mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
        >
          IA Aprendendo 🧠
        </motion.h2>
        <AIInsightsPanel />
      </div>
    </div>
  );
}
