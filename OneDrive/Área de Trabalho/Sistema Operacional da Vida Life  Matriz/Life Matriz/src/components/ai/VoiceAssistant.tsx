'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mic,
    MicOff,
    X,
    Loader2,
    Sparkles,
    Volume2,
    Search
} from 'lucide-react';
import { useSettingsStore } from '@/lib/settingsStore';

interface VoiceAssistantProps {
    onResult?: (text: string, aiResponse: string) => void;
}

export default function VoiceAssistant({ onResult }: VoiceAssistantProps) {
    const { enableVoiceAssistant } = useSettingsStore();
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState('');

    const recognitionRef = useRef<any>(null);
    const isListeningRef = useRef(false);
    const transcriptRef = useRef('');

    // Keep refs in sync with state
    useEffect(() => {
        isListeningRef.current = isListening;
    }, [isListening]);

    useEffect(() => {
        transcriptRef.current = transcript;
    }, [transcript]);


    useEffect(() => {
        // Check for browser support
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = true;
                recognitionRef.current.interimResults = true;
                recognitionRef.current.lang = 'pt-BR';

                recognitionRef.current.onresult = (event: any) => {
                    let finalTranscript = '';
                    let interimTranscript = '';

                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const transcript = event.results[i][0].transcript;
                        if (event.results[i].isFinal) {
                            finalTranscript += transcript + ' ';
                        } else {
                            interimTranscript += transcript;
                        }
                    }

                    setTranscript(finalTranscript || interimTranscript);
                };

                recognitionRef.current.onerror = (event: any) => {
                    console.error('Speech recognition error:', event.error);
                    if (event.error === 'not-allowed') {
                        setError('Permissão de microfone negada. Clique no ícone de cadeado na barra de endereço para permitir.');
                    } else {
                        setError(`Erro: ${event.error}`);
                    }
                    setIsListening(false);
                };

                recognitionRef.current.onend = () => {
                    if (isListeningRef.current) {
                        // Auto-stop after silence
                        setIsListening(false);
                        if (transcriptRef.current) {
                            processWithAI(transcriptRef.current);
                        }
                    }
                };
            }
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const startListening = async () => {
        setError('');
        setTranscript('');
        setAiResponse('');

        if (!recognitionRef.current) {
            setError('Seu navegador não suporta reconhecimento de voz. Use Chrome ou Edge.');
            return;
        }

        try {
            // Request microphone permission
            await navigator.mediaDevices.getUserMedia({ audio: true });
            recognitionRef.current.start();
            setIsListening(true);
        } catch (err) {
            setError('Não foi possível acessar o microfone. Verifique as permissões.');
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsListening(false);

        if (transcript) {
            processWithAI(transcript);
        }
    };

    const processWithAI = async (text: string) => {
        setIsProcessing(true);

        try {
            const response = await fetch('/api/ai/voice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    transcript: text,
                    context: 'voice_assistant'
                }),
            });

            const data = await response.json();
            setAiResponse(data.response || 'Desculpe, não consegui processar sua solicitação.');

            if (onResult) {
                onResult(text, data.response);
            }

            // Text-to-speech response
            if ('speechSynthesis' in window && data.response) {
                const utterance = new SpeechSynthesisUtterance(data.response);
                utterance.lang = 'pt-BR';
                utterance.rate = 1;
                speechSynthesis.speak(utterance);
            }
        } catch (error) {
            setAiResponse('Erro ao processar. Tente novamente.');
        } finally {
            setIsProcessing(false);
        }
    };

    // Don't render if disabled in settings
    if (!enableVoiceAssistant) return null;

    return (
        <>
            {/* Voice Button */}
            <motion.button
                className="fixed bottom-6 left-6 w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg flex items-center justify-center z-50"
                onClick={() => setIsOpen(true)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
            >
                <Mic size={24} className="text-white" />
            </motion.button>

            {/* Voice Modal */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => !isListening && !isProcessing && setIsOpen(false)}
                    >
                        <motion.div
                            className="bg-gray-900 border border-white/10 rounded-3xl w-full max-w-md p-8 text-center"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white"
                                disabled={isListening || isProcessing}
                            >
                                <X size={24} />
                            </button>

                            {/* Header */}
                            <div className="mb-6">
                                <h2 className="text-xl font-bold mb-2">Assistente de Voz</h2>
                                <p className="text-sm text-gray-400">
                                    Fale o que você precisa. A IA vai te ajudar.
                                </p>
                            </div>

                            {/* Microphone Button */}
                            <div className="mb-6">
                                <motion.button
                                    onClick={isListening ? stopListening : startListening}
                                    disabled={isProcessing}
                                    className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto transition-all ${isListening
                                        ? 'bg-red-500 animate-pulse'
                                        : isProcessing
                                            ? 'bg-gray-600'
                                            : 'bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400'
                                        }`}
                                    whileHover={!isProcessing ? { scale: 1.05 } : {}}
                                    whileTap={!isProcessing ? { scale: 0.95 } : {}}
                                >
                                    {isProcessing ? (
                                        <Loader2 size={40} className="text-white animate-spin" />
                                    ) : isListening ? (
                                        <MicOff size={40} className="text-white" />
                                    ) : (
                                        <Mic size={40} className="text-white" />
                                    )}
                                </motion.button>

                                {/* Status */}
                                <p className="mt-4 text-sm font-medium">
                                    {isListening ? (
                                        <span className="text-red-400 flex items-center justify-center gap-2">
                                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                            Ouvindo... (clique para parar)
                                        </span>
                                    ) : isProcessing ? (
                                        <span className="text-purple-400">Processando...</span>
                                    ) : (
                                        <span className="text-gray-400">Clique para falar</span>
                                    )}
                                </p>
                            </div>

                            {/* Transcript */}
                            {transcript && (
                                <motion.div
                                    className="mb-4 p-4 bg-white/5 rounded-xl text-left"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <p className="text-xs text-gray-500 mb-1">Você disse:</p>
                                    <p className="text-gray-200">{transcript}</p>
                                </motion.div>
                            )}

                            {/* AI Response */}
                            {aiResponse && (
                                <motion.div
                                    className="mb-4 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl text-left"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <Sparkles size={14} className="text-purple-400" />
                                        <p className="text-xs text-purple-400">Assistente LifeOS:</p>
                                        <button
                                            onClick={() => {
                                                const utterance = new SpeechSynthesisUtterance(aiResponse);
                                                utterance.lang = 'pt-BR';
                                                speechSynthesis.speak(utterance);
                                            }}
                                            className="ml-auto text-gray-400 hover:text-purple-400"
                                        >
                                            <Volume2 size={14} />
                                        </button>
                                    </div>
                                    <p className="text-gray-200">{aiResponse}</p>
                                </motion.div>
                            )}

                            {/* Error */}
                            {error && (
                                <motion.div
                                    className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    {error}
                                </motion.div>
                            )}

                            {/* Suggestions */}
                            {!transcript && !aiResponse && (
                                <div className="mt-6">
                                    <p className="text-xs text-gray-500 mb-3">Experimente dizer:</p>
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {[
                                            'Quero estudar no exterior',
                                            'Me ajuda com finanças',
                                            'Estou estressado',
                                            'Criar um objetivo novo',
                                        ].map((suggestion) => (
                                            <span
                                                key={suggestion}
                                                className="px-3 py-1.5 bg-white/5 rounded-full text-xs text-gray-400"
                                            >
                                                &quot;{suggestion}&quot;
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
