'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Plane,
    Hotel,
    ShoppingBag,
    Sparkles,
    ExternalLink,
    TrendingDown,
    Clock,
    MapPin,
    Calendar,
    Loader2,
    Mic,
    ArrowRight,
    Star,
    AlertCircle
} from 'lucide-react';

interface SearchResult {
    id: string;
    provider: string;
    providerLogo?: string;
    title: string;
    description: string;
    price: number;
    originalPrice?: number;
    currency: string;
    url: string;
    rating?: number;
    tags?: string[];
    isBestDeal?: boolean;
}

interface SearchCategory {
    id: string;
    label: string;
    icon: any;
    placeholder: string;
    color: string;
}

const categories: SearchCategory[] = [
    { id: 'flights', label: 'Voos', icon: Plane, placeholder: 'Ex: São Paulo para Lisboa em Janeiro', color: 'from-blue-500 to-cyan-500' },
    { id: 'hotels', label: 'Hotéis', icon: Hotel, placeholder: 'Ex: Hotel em Lisboa centro', color: 'from-purple-500 to-pink-500' },
    { id: 'products', label: 'Produtos', icon: ShoppingBag, placeholder: 'Ex: iPhone 15 Pro', color: 'from-orange-500 to-red-500' },
];

// Simulated search function (would connect to real APIs in production)
async function searchDeals(category: string, query: string): Promise<SearchResult[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Parse query for flight searches
    const queryLower = query.toLowerCase();

    if (category === 'flights') {
        // Simulated flight results
        const destinations = ['lisboa', 'porto', 'paris', 'londres', 'madrid', 'berlim', 'roma', 'amsterdam'];
        const matchedDest = destinations.find(d => queryLower.includes(d)) || 'europa';

        return [
            {
                id: '1',
                provider: 'TAP Portugal',
                title: `São Paulo → ${matchedDest.charAt(0).toUpperCase() + matchedDest.slice(1)}`,
                description: 'Voo direto • 10h • Classe Econômica',
                price: 2847,
                originalPrice: 3200,
                currency: 'R$',
                url: 'https://www.flytap.com',
                rating: 4.2,
                tags: ['Melhor preço', 'Direto'],
                isBestDeal: true,
            },
            {
                id: '2',
                provider: 'LATAM',
                title: `São Paulo → ${matchedDest.charAt(0).toUpperCase() + matchedDest.slice(1)}`,
                description: '1 escala (MAD) • 14h • Classe Econômica',
                price: 2950,
                currency: 'R$',
                url: 'https://www.latam.com',
                rating: 4.0,
                tags: ['Programa de pontos'],
            },
            {
                id: '3',
                provider: 'Air France',
                title: `São Paulo → ${matchedDest.charAt(0).toUpperCase() + matchedDest.slice(1)}`,
                description: '1 escala (CDG) • 15h • Classe Econômica',
                price: 3100,
                originalPrice: 3500,
                currency: 'R$',
                url: 'https://www.airfrance.com',
                rating: 4.5,
                tags: ['Boa comida'],
            },
            {
                id: '4',
                provider: 'Iberia',
                title: `São Paulo → ${matchedDest.charAt(0).toUpperCase() + matchedDest.slice(1)}`,
                description: '1 escala (MAD) • 13h30 • Classe Econômica',
                price: 3250,
                currency: 'R$',
                url: 'https://www.iberia.com',
                rating: 3.8,
            },
        ];
    }

    if (category === 'hotels') {
        return [
            {
                id: '1',
                provider: 'Booking.com',
                title: 'Hotel Central Lisboa',
                description: 'Centro • 4 estrelas • Café da manhã incluso',
                price: 450,
                originalPrice: 580,
                currency: 'R$',
                url: 'https://www.booking.com',
                rating: 4.6,
                tags: ['Cancelamento grátis', 'Café incluso'],
                isBestDeal: true,
            },
            {
                id: '2',
                provider: 'Hotels.com',
                title: 'Lisbon Downtown Suites',
                description: 'Baixa • 3 estrelas • Apartamento',
                price: 380,
                currency: 'R$',
                url: 'https://www.hotels.com',
                rating: 4.2,
                tags: ['Cozinha'],
            },
            {
                id: '3',
                provider: 'Airbnb',
                title: 'Apartamento com vista Tejo',
                description: 'Alfama • Inteiro • 2 quartos',
                price: 520,
                currency: 'R$',
                url: 'https://www.airbnb.com',
                rating: 4.8,
                tags: ['Superhost'],
            },
        ];
    }

    if (category === 'products') {
        return [
            {
                id: '1',
                provider: 'Amazon',
                title: query,
                description: 'Novo • Frete grátis • Prime',
                price: 7499,
                originalPrice: 8999,
                currency: 'R$',
                url: 'https://www.amazon.com.br',
                rating: 4.7,
                tags: ['Frete grátis', 'Prime'],
                isBestDeal: true,
            },
            {
                id: '2',
                provider: 'Mercado Livre',
                title: query,
                description: 'Novo • Full • Garantia',
                price: 7650,
                currency: 'R$',
                url: 'https://www.mercadolivre.com.br',
                rating: 4.5,
                tags: ['Full'],
            },
            {
                id: '3',
                provider: 'Magazine Luiza',
                title: query,
                description: 'Novo • Retire na loja',
                price: 7899,
                originalPrice: 8499,
                currency: 'R$',
                url: 'https://www.magazineluiza.com.br',
                rating: 4.3,
            },
        ];
    }

    return [];
}

export default function SearchAgentPage() {
    const [category, setCategory] = useState<string>('flights');
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsSearching(true);
        setHasSearched(true);

        try {
            const searchResults = await searchDeals(category, query);
            setResults(searchResults);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const selectedCategory = categories.find(c => c.id === category)!;
    const CategoryIcon = selectedCategory.icon;
    const savings = results.length > 0 && results[0].originalPrice
        ? results[0].originalPrice - results[0].price
        : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">Agente de Buscas</h1>
                <p className="text-gray-400 mt-1">
                    Encontro os melhores preços para você automaticamente
                </p>
            </div>

            {/* Search Card */}
            <motion.div
                className="glass-card p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* Category Selector */}
                <div className="flex gap-2 mb-6">
                    {categories.map(cat => {
                        const Icon = cat.icon;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setCategory(cat.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${category === cat.id
                                        ? `bg-gradient-to-r ${cat.color} text-white`
                                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                    }`}
                            >
                                <Icon size={18} />
                                {cat.label}
                            </button>
                        );
                    })}
                </div>

                {/* Search Form */}
                <form onSubmit={handleSearch} className="flex gap-3">
                    <div className="relative flex-1">
                        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={selectedCategory.placeholder}
                            className="input-field pl-12 pr-12 text-lg"
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-400"
                            onClick={() => {
                                // Voice input would go here
                                alert('Use o botão de voz no canto inferior esquerdo para falar!');
                            }}
                        >
                            <Mic size={20} />
                        </button>
                    </div>
                    <button
                        type="submit"
                        disabled={isSearching || !query.trim()}
                        className={`btn-primary px-8 flex items-center gap-2 bg-gradient-to-r ${selectedCategory.color}`}
                    >
                        {isSearching ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <>
                                <Search size={20} />
                                Buscar
                            </>
                        )}
                    </button>
                </form>

                {/* AI Tip */}
                <div className="flex items-center gap-2 mt-4 text-sm text-gray-400">
                    <Sparkles size={14} className="text-teal-400" />
                    <span>
                        Dica: Seja específico! Inclua datas, destino e quantidade de pessoas.
                    </span>
                </div>
            </motion.div>

            {/* Loading State */}
            <AnimatePresence>
                {isSearching && (
                    <motion.div
                        className="glass-card p-8 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-teal-500 to-purple-500 flex items-center justify-center animate-pulse">
                                <Search size={28} className="text-white" />
                            </div>
                            <div>
                                <p className="font-semibold">Buscando melhores ofertas...</p>
                                <p className="text-sm text-gray-400 mt-1">
                                    Analisando múltiplos parceiros para encontrar o menor preço
                                </p>
                            </div>
                            <div className="flex gap-2 text-xs text-gray-500">
                                {['TAP', 'LATAM', 'Gol', 'Azul', 'Air France', 'Iberia'].map((airline, i) => (
                                    <motion.span
                                        key={airline}
                                        className="px-2 py-1 bg-white/5 rounded"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.2 }}
                                    >
                                        {airline}
                                    </motion.span>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results */}
            {!isSearching && hasSearched && results.length > 0 && (
                <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    {/* Summary */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">
                            {results.length} ofertas encontradas
                        </h2>
                        {savings > 0 && (
                            <span className="flex items-center gap-1 text-green-400 font-medium">
                                <TrendingDown size={18} />
                                Economize até {results[0].currency} {savings.toLocaleString()}
                            </span>
                        )}
                    </div>

                    {/* Results List */}
                    {results.map((result, index) => (
                        <motion.div
                            key={result.id}
                            className={`glass-card p-5 ${result.isBestDeal ? 'ring-2 ring-green-500/50' : ''}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            {result.isBestDeal && (
                                <div className="absolute -top-3 left-4 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                                    MELHOR PREÇO
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${selectedCategory.color} flex items-center justify-center`}>
                                        <CategoryIcon size={24} className="text-white" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold">{result.title}</h3>
                                            {result.rating && (
                                                <span className="flex items-center gap-1 text-xs text-yellow-400">
                                                    <Star size={12} fill="currentColor" />
                                                    {result.rating}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-400">{result.description}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-gray-500">{result.provider}</span>
                                            {result.tags?.map(tag => (
                                                <span key={tag} className="px-2 py-0.5 bg-teal-500/20 text-teal-400 text-xs rounded">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="flex items-baseline gap-2">
                                        {result.originalPrice && (
                                            <span className="text-sm text-gray-500 line-through">
                                                {result.currency} {result.originalPrice.toLocaleString()}
                                            </span>
                                        )}
                                        <span className="text-2xl font-bold text-green-400">
                                            {result.currency} {result.price.toLocaleString()}
                                        </span>
                                    </div>
                                    <a
                                        href={result.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-sm text-teal-400 hover:text-teal-300 mt-2"
                                    >
                                        Ver oferta <ExternalLink size={14} />
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {/* Disclaimer */}
                    <div className="flex items-start gap-2 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-sm">
                        <AlertCircle size={18} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-yellow-400 font-medium">Simulação de preços</p>
                            <p className="text-gray-400 mt-1">
                                Estes são preços simulados para demonstração. Para buscar preços reais,
                                seria necessário integrar com APIs como Amadeus (voos), Booking (hotéis) ou
                                afiliados de e-commerce. Clique nos links para verificar os preços atuais.
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Empty State */}
            {!isSearching && hasSearched && results.length === 0 && (
                <motion.div
                    className="glass-card p-8 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <p className="text-gray-400">Nenhum resultado encontrado. Tente outra busca.</p>
                </motion.div>
            )}

            {/* Initial State */}
            {!hasSearched && (
                <motion.div
                    className="glass-card p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center flex-shrink-0">
                            <Sparkles size={20} className="text-teal-400" />
                        </div>
                        <div>
                            <h4 className="font-semibold">Como o Agente de Buscas funciona</h4>
                            <ul className="text-sm text-gray-400 mt-2 space-y-1">
                                <li>• Digite o que você está procurando (voo, hotel, produto)</li>
                                <li>• O agente busca em múltiplos parceiros simultaneamente</li>
                                <li>• Apresenta as melhores ofertas ordenadas por preço</li>
                                <li>• Clique para acessar diretamente o site do parceiro</li>
                            </ul>
                            <p className="text-xs text-gray-500 mt-4">
                                💡 Use o assistente de voz (🎤) para falar o que você quer buscar!
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
