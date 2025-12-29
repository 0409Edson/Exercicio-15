'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Quote,
    RefreshCw,
    Share2,
    Heart,
    Copy,
    Check
} from 'lucide-react';

interface DailyQuote {
    text: string;
    author: string;
    category: string;
}

const QUOTES: DailyQuote[] = [
    { text: "O sucesso é a soma de pequenos esforços repetidos dia após dia.", author: "Robert Collier", category: "sucesso" },
    { text: "A única maneira de fazer um ótimo trabalho é amar o que você faz.", author: "Steve Jobs", category: "trabalho" },
    { text: "Não espere por uma crise para descobrir o que é importante em sua vida.", author: "Platão", category: "vida" },
    { text: "O único limite para nossa realização de amanhã são nossas dúvidas de hoje.", author: "Franklin D. Roosevelt", category: "motivação" },
    { text: "Acredite em si mesmo e em tudo que você é. Saiba que há algo dentro de você maior que qualquer obstáculo.", author: "Christian D. Larson", category: "autoestima" },
    { text: "O progresso é impossível sem mudança, e aqueles que não conseguem mudar suas mentes não podem mudar nada.", author: "George Bernard Shaw", category: "mudança" },
    { text: "Você não pode mudar seu destino da noite para o dia, mas pode mudar sua direção.", author: "Jim Rohn", category: "direção" },
    { text: "A disciplina é a ponte entre metas e conquistas.", author: "Jim Rohn", category: "disciplina" },
    { text: "Faça hoje o que os outros não fazem, para ter amanhã o que os outros não terão.", author: "Autor Desconhecido", category: "esforço" },
    { text: "Sua mente é um jardim, seus pensamentos são as sementes. Você pode cultivar flores ou ervas daninhas.", author: "Autor Desconhecido", category: "mentalidade" },
    { text: "Não conte os dias, faça os dias contarem.", author: "Muhammad Ali", category: "tempo" },
    { text: "O melhor momento para plantar uma árvore foi há 20 anos. O segundo melhor momento é agora.", author: "Provérbio Chinês", category: "ação" },
    { text: "Você é a média das cinco pessoas com quem mais convive.", author: "Jim Rohn", category: "relacionamentos" },
    { text: "Fracasso é o condimento que dá sabor ao sucesso.", author: "Truman Capote", category: "fracasso" },
    { text: "A persistência é o caminho do êxito.", author: "Charles Chaplin", category: "persistência" },
];

export default function DailyQuoteWidget() {
    const [quote, setQuote] = useState<DailyQuote | null>(null);
    const [isLiked, setIsLiked] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        loadDailyQuote();
    }, []);

    const loadDailyQuote = () => {
        // Get quote based on day (consistent per day)
        const today = new Date();
        const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
        const index = dayOfYear % QUOTES.length;
        setQuote(QUOTES[index]);

        // Check if liked
        const likedQuotes = JSON.parse(localStorage.getItem('lifeos-liked-quotes') || '[]');
        setIsLiked(likedQuotes.includes(QUOTES[index].text));
    };

    const getRandomQuote = () => {
        const randomIndex = Math.floor(Math.random() * QUOTES.length);
        setQuote(QUOTES[randomIndex]);
        setIsLiked(false);
    };

    const toggleLike = () => {
        if (!quote) return;

        const likedQuotes = JSON.parse(localStorage.getItem('lifeos-liked-quotes') || '[]');

        if (isLiked) {
            const updated = likedQuotes.filter((q: string) => q !== quote.text);
            localStorage.setItem('lifeos-liked-quotes', JSON.stringify(updated));
        } else {
            likedQuotes.push(quote.text);
            localStorage.setItem('lifeos-liked-quotes', JSON.stringify(likedQuotes));
        }

        setIsLiked(!isLiked);
    };

    const copyToClipboard = async () => {
        if (!quote) return;

        try {
            await navigator.clipboard.writeText(`"${quote.text}" - ${quote.author}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (e) {
            console.error('Failed to copy');
        }
    };

    const shareQuote = async () => {
        if (!quote) return;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'Citação do Dia - Life Matriz',
                    text: `"${quote.text}" - ${quote.author}`,
                });
            } else {
                copyToClipboard();
            }
        } catch (e) {
            copyToClipboard();
        }
    };

    if (!quote) return null;

    return (
        <motion.div
            className="glass-card p-6 relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Background decoration */}
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl" />

            {/* Quote icon */}
            <Quote size={40} className="text-purple-500/30 mb-4" />

            {/* Quote text */}
            <motion.p
                className="text-lg font-medium leading-relaxed mb-4"
                key={quote.text}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                "{quote.text}"
            </motion.p>

            {/* Author */}
            <p className="text-sm text-purple-400 mb-4">— {quote.author}</p>

            {/* Actions */}
            <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 capitalize">#{quote.category}</span>

                <div className="flex gap-2">
                    <button
                        onClick={toggleLike}
                        className={`p-2 rounded-lg transition-colors ${isLiked ? 'bg-pink-500/20 text-pink-400' : 'hover:bg-white/10 text-gray-400'
                            }`}
                        title="Salvar citação"
                    >
                        <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
                    </button>

                    <button
                        onClick={copyToClipboard}
                        className="p-2 rounded-lg hover:bg-white/10 text-gray-400 transition-colors"
                        title="Copiar"
                    >
                        {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                    </button>

                    <button
                        onClick={shareQuote}
                        className="p-2 rounded-lg hover:bg-white/10 text-gray-400 transition-colors"
                        title="Compartilhar"
                    >
                        <Share2 size={16} />
                    </button>

                    <button
                        onClick={getRandomQuote}
                        className="p-2 rounded-lg hover:bg-white/10 text-gray-400 transition-colors"
                        title="Nova citação"
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
