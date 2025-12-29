'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageCircle,
    X,
    Send,
    Bot,
    User,
    Sparkles,
    Loader2
} from 'lucide-react';
import { useSettingsStore } from '@/lib/settingsStore';
import { generateUniqueId } from '@/lib/generateId';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export default function AIChatWidget() {
    const { enableAIChat } = useSettingsStore();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Olá! 👋 Sou seu assistente pessoal do LifeOS. Posso ajudar com objetivos, finanças, saúde ou produtividade. Como posso ajudar?',
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: generateUniqueId('msg-'),
            role: 'user',
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: input.trim(),
                    context: { timestamp: new Date().toISOString() },
                    history: messages.map((m) => ({ role: m.role, content: m.content })),
                }),
            });

            const data = await response.json();

            const assistantMessage: Message = {
                id: generateUniqueId('msg-'),
                role: 'assistant',
                content: data.response || 'Desculpe, ocorreu um erro. Tente novamente.',
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            const errorMessage: Message = {
                id: generateUniqueId('msg-'),
                role: 'assistant',
                content: 'Desculpe, houve um problema de conexão. Tente novamente em instantes.',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const quickActions = [
        'Como ser mais produtivo?',
        'Me ajuda com finanças',
        'Dicas de saúde',
        'Definir um objetivo',
    ];

    // Don't render if disabled in settings
    if (!enableAIChat) return null;

    return (
        <>
            {/* Chat Toggle Button */}
            <motion.button
                className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-purple-500 shadow-lg flex items-center justify-center z-50"
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                        >
                            <X size={24} className="text-white" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="chat"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                        >
                            <MessageCircle size={24} className="text-white" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="fixed bottom-24 right-6 w-[380px] h-[500px] bg-gray-900 rounded-2xl shadow-2xl border border-white/10 z-50 flex flex-col overflow-hidden"
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    >
                        {/* Header */}
                        <div className="p-4 bg-gradient-to-r from-teal-500/10 to-purple-500/10 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-purple-500 flex items-center justify-center">
                                    <Sparkles size={18} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">Assistente LifeOS</h3>
                                    <p className="text-xs text-gray-400">Sempre disponível para ajudar</p>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    {message.role === 'assistant' && (
                                        <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0">
                                            <Bot size={16} className="text-teal-400" />
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${message.role === 'user'
                                            ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-tr-none'
                                            : 'bg-white/10 text-gray-200 rounded-tl-none'
                                            }`}
                                    >
                                        <p className="text-sm">{message.content}</p>
                                    </div>
                                    {message.role === 'user' && (
                                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                                            <User size={16} className="text-purple-400" />
                                        </div>
                                    )}
                                </motion.div>
                            ))}

                            {isLoading && (
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0">
                                        <Bot size={16} className="text-teal-400" />
                                    </div>
                                    <div className="bg-white/10 rounded-2xl rounded-tl-none px-4 py-3">
                                        <Loader2 size={16} className="text-teal-400 animate-spin" />
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Actions */}
                        {messages.length <= 2 && (
                            <div className="px-4 pb-2">
                                <p className="text-xs text-gray-500 mb-2">Sugestões:</p>
                                <div className="flex flex-wrap gap-2">
                                    {quickActions.map((action) => (
                                        <button
                                            key={action}
                                            onClick={() => setInput(action)}
                                            className="text-xs px-3 py-1.5 rounded-full bg-white/5 text-gray-300 hover:bg-white/10 transition-colors"
                                        >
                                            {action}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input */}
                        <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Digite sua mensagem..."
                                    className="flex-1 bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-teal-500"
                                    disabled={isLoading}
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    className="w-10 h-10 rounded-xl bg-gradient-to-r from-teal-500 to-purple-500 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send size={18} className="text-white" />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
