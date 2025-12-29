'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen,
    Plus,
    Heart,
    Star,
    Target,
    Lightbulb,
    AlertTriangle,
    Calendar,
    Search,
    Filter,
    MoreVertical,
    Edit3,
    Trash2,
    Sparkles
} from 'lucide-react';
import { useJournalStore, JournalEntry } from '@/lib/journalStore';

const entryTypes = [
    { id: 'reflection', label: 'Reflexão', icon: BookOpen, color: 'bg-blue-500', description: 'Pensamentos e aprendizados' },
    { id: 'desire', label: 'Desejo', icon: Star, color: 'bg-purple-500', description: 'O que você quer alcançar' },
    { id: 'gratitude', label: 'Gratidão', icon: Heart, color: 'bg-pink-500', description: 'Pelo que você é grato' },
    { id: 'dream', label: 'Sonho', icon: Lightbulb, color: 'bg-yellow-500', description: 'Seus sonhos e visões' },
    { id: 'challenge', label: 'Desafio', icon: AlertTriangle, color: 'bg-orange-500', description: 'Obstáculos a superar' },
];

const moodEmojis = {
    excellent: '😄',
    good: '🙂',
    neutral: '😐',
    bad: '😔',
};

export default function JournalPage() {
    const { entries, addEntry, deleteEntry } = useJournalStore();
    const [showNewEntry, setShowNewEntry] = useState(false);
    const [selectedType, setSelectedType] = useState<JournalEntry['type']>('reflection');
    const [filterType, setFilterType] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [menuOpen, setMenuOpen] = useState<string | null>(null);

    const [newEntry, setNewEntry] = useState({
        title: '',
        content: '',
        mood: 'good' as JournalEntry['mood'],
        tags: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEntry.title || !newEntry.content) return;

        addEntry({
            userId: 'demo-user',
            date: new Date().toISOString(),
            type: selectedType,
            title: newEntry.title,
            content: newEntry.content,
            mood: newEntry.mood,
            tags: newEntry.tags.split(',').map(t => t.trim()).filter(Boolean),
            isPrivate: true,
        });

        setNewEntry({ title: '', content: '', mood: 'good', tags: '' });
        setShowNewEntry(false);
    };

    const filteredEntries = entries.filter(entry => {
        if (filterType !== 'all' && entry.type !== filterType) return false;
        if (searchQuery && !entry.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !entry.content.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const handleDelete = (id: string) => {
        if (confirm('Excluir esta entrada do diário?')) {
            deleteEntry(id);
        }
        setMenuOpen(null);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Diário de Reflexão</h1>
                    <p className="text-gray-400 mt-1">Registre seus pensamentos, desejos e aprendizados</p>
                </div>
                <motion.button
                    onClick={() => setShowNewEntry(true)}
                    className="btn-primary flex items-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Plus size={18} />
                    <span>Nova Entrada</span>
                </motion.button>
            </div>

            {/* AI Insight */}
            <motion.div
                className="glass-card p-4 border-l-4 border-purple-500"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                        <Sparkles size={20} className="text-purple-400" />
                    </div>
                    <div>
                        <h4 className="font-semibold">Análise do seu Diário</h4>
                        <p className="text-sm text-gray-400 mt-1">
                            {entries.length > 0
                                ? `Você tem ${entries.length} entradas no diário. ${entries.filter(e => e.type === 'desire').length > 0
                                    ? `Seus desejos mais recentes incluem: "${entries.find(e => e.type === 'desire')?.title}".`
                                    : 'Que tal registrar um desejo ou sonho hoje?'
                                }`
                                : 'Comece registrando seus pensamentos. A IA irá analisar padrões e te ajudar a evoluir.'
                            }
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* New Entry Form */}
            <AnimatePresence>
                {showNewEntry && (
                    <motion.div
                        className="glass-card p-6"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <h3 className="text-lg font-semibold mb-4">Nova Entrada</h3>

                        {/* Type Selection */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {entryTypes.map(type => {
                                const Icon = type.icon;
                                return (
                                    <button
                                        key={type.id}
                                        type="button"
                                        onClick={() => setSelectedType(type.id as JournalEntry['type'])}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${selectedType === type.id
                                                ? `${type.color} text-white`
                                                : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                            }`}
                                    >
                                        <Icon size={16} />
                                        {type.label}
                                    </button>
                                );
                            })}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <input
                                    type="text"
                                    value={newEntry.title}
                                    onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                                    placeholder="Título da entrada..."
                                    className="input-field"
                                    required
                                />
                            </div>

                            <div>
                                <textarea
                                    value={newEntry.content}
                                    onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                                    placeholder="Escreva seus pensamentos aqui... Seja honesto consigo mesmo."
                                    className="input-field resize-none"
                                    rows={5}
                                    required
                                />
                            </div>

                            <div className="flex gap-4">
                                {/* Mood Selection */}
                                <div className="flex-1">
                                    <label className="block text-sm text-gray-400 mb-2">Como você está se sentindo?</label>
                                    <div className="flex gap-2">
                                        {Object.entries(moodEmojis).map(([mood, emoji]) => (
                                            <button
                                                key={mood}
                                                type="button"
                                                onClick={() => setNewEntry({ ...newEntry, mood: mood as JournalEntry['mood'] })}
                                                className={`w-10 h-10 rounded-lg text-xl transition-all ${newEntry.mood === mood
                                                        ? 'bg-teal-500/30 ring-2 ring-teal-500 scale-110'
                                                        : 'bg-white/10 hover:bg-white/20'
                                                    }`}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Tags */}
                                <div className="flex-1">
                                    <label className="block text-sm text-gray-400 mb-2">Tags (separadas por vírgula)</label>
                                    <input
                                        type="text"
                                        value={newEntry.tags}
                                        onChange={(e) => setNewEntry({ ...newEntry, tags: e.target.value })}
                                        placeholder="carreira, sonhos, vida..."
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button type="button" onClick={() => setShowNewEntry(false)} className="btn-secondary flex-1">
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary flex-1">
                                    Salvar Entrada
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar no diário..."
                        className="input-field pl-10"
                    />
                </div>
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="input-field w-auto"
                >
                    <option value="all">Todos os tipos</option>
                    {entryTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.label}</option>
                    ))}
                </select>
            </div>

            {/* Entries List */}
            {filteredEntries.length === 0 ? (
                <motion.div
                    className="glass-card p-12 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="w-20 h-20 mx-auto rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
                        <BookOpen size={40} className="text-purple-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Seu diário está vazio</h3>
                    <p className="text-gray-400 mb-6 max-w-md mx-auto">
                        Comece a registrar seus pensamentos, desejos e reflexões. A IA irá analisar padrões para te ajudar a evoluir.
                    </p>
                    <button onClick={() => setShowNewEntry(true)} className="btn-primary">
                        <Plus size={18} className="mr-2" />
                        Criar primeira entrada
                    </button>
                </motion.div>
            ) : (
                <div className="space-y-4">
                    {filteredEntries.map((entry, index) => {
                        const typeInfo = entryTypes.find(t => t.id === entry.type);
                        const Icon = typeInfo?.icon || BookOpen;

                        return (
                            <motion.div
                                key={entry.id}
                                className="glass-card p-5"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`w-10 h-10 rounded-lg ${typeInfo?.color} flex items-center justify-center flex-shrink-0`}>
                                        <Icon size={20} className="text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h3 className="font-semibold">{entry.title}</h3>
                                                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={12} />
                                                        {new Date(entry.createdAt).toLocaleDateString('pt-BR', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                    {entry.mood && (
                                                        <span>{moodEmojis[entry.mood]}</span>
                                                    )}
                                                    <span className={`px-2 py-0.5 rounded ${typeInfo?.color} text-white`}>
                                                        {typeInfo?.label}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="relative">
                                                <button
                                                    onClick={() => setMenuOpen(menuOpen === entry.id ? null : entry.id)}
                                                    className="btn-icon w-8 h-8"
                                                >
                                                    <MoreVertical size={16} />
                                                </button>
                                                {menuOpen === entry.id && (
                                                    <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-white/10 rounded-lg shadow-lg z-10 py-1 min-w-[100px]">
                                                        <button
                                                            onClick={() => handleDelete(entry.id)}
                                                            className="w-full px-3 py-2 text-left text-sm hover:bg-white/10 flex items-center gap-2 text-red-400"
                                                        >
                                                            <Trash2 size={14} />
                                                            Excluir
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-gray-400 mt-3 whitespace-pre-wrap">{entry.content}</p>
                                        {entry.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-3">
                                                {entry.tags.map(tag => (
                                                    <span key={tag} className="px-2 py-0.5 bg-white/10 rounded text-xs text-gray-400">
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
