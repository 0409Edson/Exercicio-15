'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Target,
  Calendar,
  Wallet,
  Heart,
  GraduationCap,
  Settings,
  Bell,
  Search,
  Sparkles,
  BookOpen,
  Activity,
  Shield,
  Bot,
  Cloud,
  Lightbulb,
  MessageCircle,
  ExternalLink,
  Brain,
  Timer
} from 'lucide-react';

interface NavItem {
  icon: ReactNode;
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { icon: <LayoutDashboard size={20} />, label: 'Dashboard', href: '/' },
  { icon: <Timer size={20} />, label: 'Produtividade', href: '/productivity' },
  { icon: <Brain size={20} />, label: 'Insights IA', href: '/insights' },
  { icon: <ExternalLink size={20} />, label: 'Redes Sociais', href: '/links' },
  { icon: <Target size={20} />, label: 'Objetivos', href: '/goals' },
  { icon: <BookOpen size={20} />, label: 'Diário', href: '/journal' },
  { icon: <Activity size={20} />, label: 'Hábitos', href: '/habits' },
  { icon: <Calendar size={20} />, label: 'Agenda', href: '/calendar' },
  { icon: <Wallet size={20} />, label: 'Finanças', href: '/finance' },
  { icon: <Heart size={20} />, label: 'Saúde', href: '/health' },
  { icon: <GraduationCap size={20} />, label: 'Carreira', href: '/career' },
  { icon: <Cloud size={20} />, label: 'Backup', href: '/backup' },
  { icon: <Shield size={20} />, label: 'Segurança', href: '/security' },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Sparkles size={20} color="white" />
          </div>
          <span className="sidebar-logo-text">Life Matriz</span>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav flex-1 flex flex-col justify-center">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${pathname === item.href ? 'active' : ''}`}
            >
              <span className="nav-item-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Settings */}
        <div className="mt-auto pt-4 border-t border-white/10">
          <Link href="/settings" className="nav-item">
            <span className="nav-item-icon"><Settings size={20} /></span>
            <span>Configurações</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Bar */}
        <header className="flex items-center justify-end mb-8">
          <div className="flex items-center gap-3">
            {/* Lâmpada - Dicas */}
            <Link
              href="/tips"
              className="btn-icon bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 relative"
              title="Dicas e Sugestões"
            >
              <Lightbulb size={18} className="text-yellow-400" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white shadow-lg animate-pulse">
                3
              </span>
            </Link>

            {/* Balão - Chat IA */}
            <Link
              href="/ai"
              className="btn-icon bg-gradient-to-r from-teal-500/20 to-purple-500/20 hover:from-teal-500/30 hover:to-purple-500/30 relative"
              title="Chat IA Juliana"
            >
              <MessageCircle size={18} className="text-teal-400" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-teal-400 to-purple-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white shadow-lg">
                !
              </span>
            </Link>

            {/* Sino - Notificações */}
            <Link href="/notifications" className="btn-icon relative" title="Notificações">
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-400 to-pink-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white shadow-lg">
                2
              </span>
            </Link>

            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-purple-500 flex items-center justify-center text-white font-semibold">
              E
            </div>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
