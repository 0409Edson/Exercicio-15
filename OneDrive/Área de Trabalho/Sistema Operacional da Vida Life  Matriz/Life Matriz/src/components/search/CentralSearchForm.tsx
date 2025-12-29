'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    X,
    Plane,
    Hotel,
    ShoppingBag,
    Sparkles,
    Loader2,
    TrendingDown,
    ExternalLink,
    Lightbulb,
    Target,
    Heart,
    Wallet,
    GraduationCap
} from 'lucide-react';

interface SearchFormProps {
    isOpen: boolean;
    onClose: () => void;
}

interface SearchResult {
    id: string;
    provider: string;
    title: string;
    description: string;
    price?: number;
    originalPrice?: number;
    currency?: string;
    url?: string;
    suggestion?: string;
    isBestDeal?: boolean;
}

const categories = [
    { id: 'flights', label: 'Passagens', icon: Plane, color: 'from-blue-500 to-cyan-500', placeholder: 'De onde para onde? Quando?' },
    { id: 'hotels', label: 'Hotéis', icon: Hotel, color: 'from-purple-500 to-pink-500', placeholder: 'Onde você quer ficar?' },
    { id: 'products', label: 'Produtos', icon: ShoppingBag, color: 'from-orange-500 to-red-500', placeholder: 'O que você quer comprar?' },
    { id: 'goals', label: 'Objetivos', icon: Target, color: 'from-teal-500 to-green-500', placeholder: 'Qual objetivo quer alcançar?' },
    { id: 'health', label: 'Saúde', icon: Heart, color: 'from-red-500 to-pink-500', placeholder: 'Como posso ajudar com sua saúde?' },
    { id: 'finance', label: 'Finanças', icon: Wallet, color: 'from-green-500 to-emerald-500', placeholder: 'Qual sua dúvida financeira?' },
    { id: 'career', label: 'Carreira', icon: GraduationCap, color: 'from-indigo-500 to-purple-500', placeholder: 'Em que posso ajudar na carreira?' },
];

// Real search function - calls our API that uses SerpAPI
async function searchAI(category: string, query: string): Promise<SearchResult[]> {
    // For categories that don't need external search, use local AI suggestions
    if (['goals', 'health', 'finance', 'career'].includes(category)) {
        return [
            {
                id: '1',
                provider: 'LifeOS AI',
                title: 'Sugestão personalizada',
                description: `Baseado no que você informou, posso te ajudar a criar um plano estruturado.`,
                suggestion: getAISuggestion(category, query),
            },
        ];
    }

    // For products, flights, hotels - call real API
    try {
        const response = await fetch('/api/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category, query }),
        });

        const data = await response.json();

        if (data.mock) {
            console.log('Using mock data - configure SERPAPI_KEY for real results');
        }

        return data.results || [];
    } catch (error) {
        console.error('Search error:', error);
        // Fallback to showing an error message
        return [
            {
                id: 'error',
                provider: 'LifeOS',
                title: 'Erro na busca',
                description: 'Não foi possível buscar. Verifique sua conexão.',
            },
        ];
    }
}

function getAISuggestion(category: string, query: string): string {
    const suggestions: Record<string, string> = {
        goals: `Para alcançar "${query}", sugiro dividir em etapas menores:\n\n1. Defina um prazo realista\n2. Liste as sub-tarefas necessárias\n3. Crie um hábito diário relacionado\n4. Acompanhe o progresso semanalmente\n\nPosso criar esse objetivo automaticamente para você?`,
        health: `Sobre "${query}", algumas dicas:\n\n• Mantenha consistência - pequenas ações diárias\n• Registre seu progresso no módulo de Saúde\n• Crie lembretes para hábitos saudáveis\n• Consulte um profissional quando necessário\n\nQuer que eu crie um hábito de acompanhamento?`,
        finance: `Para "${query}", recomendo:\n\n1. Registre todas as transações no módulo Finanças\n2. Defina uma meta de economia mensal\n3. Revise gastos por categoria\n4. Use a regra 50/30/20 (necessidades/desejos/poupança)\n\nPosso te levar ao módulo de Finanças?`,
        career: `Sobre "${query}":\n\n• Identifique as habilidades necessárias\n• Crie um plano de desenvolvimento\n• Defina marcos de progresso\n• Busque mentores ou cursos\n\nQuer que eu adicione isso aos seus objetivos de carreira?`,
        hotels: `Para hospedagem, encontrei algumas opções. Recomendo reservar com antecedência para melhores preços e verificar políticas de cancelamento.`,
    };
    return suggestions[category] || 'Posso te ajudar a organizar isso melhor no LifeOS!';
}

export default function CentralSearchForm({ isOpen, onClose }: SearchFormProps) {
    const [category, setCategory] = useState('flights');
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [hasSearched, setHasSearched] = useState(false);

    const selectedCategory = categories.find(c => c.id === category)!;
    const Icon = selectedCategory.icon;

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsSearching(true);
        setHasSearched(true);

        try {
            const searchResults = await searchAI(category, query);
            setResults(searchResults);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleClose = () => {
        setQuery('');
        setResults([]);
        setHasSearched(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleClose}
            >
                <motion.div
                    className="bg-gray-900 border border-white/10 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedCategory.color} flex items-center justify-center`}>
                                    <Sparkles size={24} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">O que você está buscando?</h2>
                                    <p className="text-sm text-gray-400">Me conte e eu encontro as melhores opções</p>
                                </div>
                            </div>
                            <button onClick={handleClose} className="btn-icon">
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="p-4 border-b border-white/10 overflow-x-auto">
                        <div className="flex gap-2">
                            {categories.map(cat => {
                                const CatIcon = cat.icon;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => {
                                            setCategory(cat.id);
                                            setResults([]);
                                            setHasSearched(false);
                                        }}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${category === cat.id
                                            ? `bg-gradient-to-r ${cat.color} text-white`
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                            }`}
                                    >
                                        <CatIcon size={16} />
                                        {cat.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Search Input */}
                    <form onSubmit={handleSearch} className="p-6">
                        <div className="relative">
                            <Icon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={selectedCategory.placeholder}
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-lg focus:outline-none focus:border-teal-500 placeholder:text-gray-500"
                                autoFocus
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSearching || !query.trim()}
                            className={`w-full mt-4 py-4 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 bg-gradient-to-r ${selectedCategory.color} disabled:opacity-50`}
                        >
                            {isSearching ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Buscando...
                                </>
                            ) : (
                                <>
                                    <Search size={20} />
                                    Buscar melhores opções
                                </>
                            )}
                        </button>
                    </form>

                    {/* Results */}
                    <div className="flex-1 overflow-y-auto px-6 pb-6">
                        {hasSearched && !isSearching && (
                            <div className="space-y-4">
                                {results.map((result, index) => (
                                    <motion.div
                                        key={result.id}
                                        className={`p-5 rounded-xl ${result.isBestDeal ? 'bg-green-500/10 border border-green-500/30' : 'bg-white/5'}`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        {result.isBestDeal && (
                                            <span className="inline-block px-2 py-1 bg-green-500 text-white text-xs font-bold rounded mb-3">
                                                MELHOR OPÇÃO
                                            </span>
                                        )}

                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-500 mb-1">{result.provider}</p>
                                                <h3 className="font-semibold text-lg">{result.title}</h3>
                                                <p className="text-sm text-gray-400 mt-1">{result.description}</p>

                                                {result.suggestion && (
                                                    <div className="mt-4 p-4 bg-teal-500/10 border border-teal-500/30 rounded-lg">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Lightbulb size={14} className="text-teal-400" />
                                                            <span className="text-xs text-teal-400 font-medium">Sugestão da IA</span>
                                                        </div>
                                                        <p className="text-sm text-gray-300 whitespace-pre-line">{result.suggestion}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {result.price && (
                                                <div className="text-right ml-4">
                                                    {result.originalPrice && (
                                                        <p className="text-sm text-gray-500 line-through">
                                                            {result.currency} {result.originalPrice.toLocaleString()}
                                                        </p>
                                                    )}
                                                    <p className="text-2xl font-bold text-green-400">
                                                        {result.currency} {result.price.toLocaleString()}
                                                    </p>
                                                    {result.originalPrice && (
                                                        <p className="text-xs text-green-400 flex items-center gap-1 justify-end mt-1">
                                                            <TrendingDown size={12} />
                                                            Economia de {result.currency} {(result.originalPrice - result.price).toLocaleString()}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {result.url && (
                                            <a
                                                href={result.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-4 w-full btn-primary py-3 flex items-center justify-center gap-2"
                                            >
                                                Ver oferta <ExternalLink size={16} />
                                            </a>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {/* Initial Tips */}
                        {!hasSearched && (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 mx-auto rounded-full bg-white/5 flex items-center justify-center mb-4">
                                    <Lightbulb size={28} className="text-gray-500" />
                                </div>
                                <p className="text-gray-400 mb-4">
                                    Me conte o que você está buscando e eu encontro as melhores opções para você!
                                </p>
                                <div className="flex flex-wrap justify-center gap-2">
                                    {[
                                        'Passagem para Lisboa em março',
                                        'iPhone 15 Pro 256GB',
                                        'Hotel no centro de Paris',
                                        'Como economizar R$1000/mês',
                                    ].map((example) => (
                                        <button
                                            key={example}
                                            onClick={() => setQuery(example)}
                                            className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-400 transition-colors"
                                        >
                                            {example}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
