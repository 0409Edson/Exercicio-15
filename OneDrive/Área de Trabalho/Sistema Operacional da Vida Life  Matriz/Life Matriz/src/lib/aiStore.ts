import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AIMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    metadata?: {
        model?: string;
        tokens?: number;
        searchResults?: any[];
    };
}

export interface AIConversation {
    id: string;
    title: string;
    messages: AIMessage[];
    createdAt: Date;
    updatedAt: Date;
}

export interface AIMemory {
    key: string;
    value: string;
    category: 'preference' | 'fact' | 'context' | 'goal';
    createdAt: Date;
}

interface AIState {
    // Conversations
    conversations: AIConversation[];
    activeConversationId: string | null;

    // Memory (persistent knowledge about user)
    memories: AIMemory[];

    // Settings
    preferredModel: 'gpt-4' | 'gpt-3.5-turbo' | 'claude' | 'gemini';
    enableWebSearch: boolean;
    enableMemory: boolean;
    maxTokens: number;
    temperature: number;

    // Actions
    createConversation: (title?: string) => string;
    deleteConversation: (id: string) => void;
    setActiveConversation: (id: string) => void;
    addMessage: (conversationId: string, message: Omit<AIMessage, 'id' | 'timestamp'>) => void;

    // Memory actions
    addMemory: (memory: Omit<AIMemory, 'createdAt'>) => void;
    deleteMemory: (key: string) => void;
    getMemoriesByCategory: (category: AIMemory['category']) => AIMemory[];

    // Settings actions
    updateSettings: (settings: Partial<Pick<AIState, 'preferredModel' | 'enableWebSearch' | 'enableMemory' | 'maxTokens' | 'temperature'>>) => void;
}

// Generate unique ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useAIStore = create<AIState>()(
    persist(
        (set, get) => ({
            // Initial state
            conversations: [],
            activeConversationId: null,
            memories: [],
            preferredModel: 'gpt-3.5-turbo',
            enableWebSearch: true,
            enableMemory: true,
            maxTokens: 2048,
            temperature: 0.7,

            // Conversation actions
            createConversation: (title = 'Nova conversa') => {
                const id = generateId();
                const conversation: AIConversation = {
                    id,
                    title,
                    messages: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                set((state) => ({
                    conversations: [conversation, ...state.conversations],
                    activeConversationId: id,
                }));

                return id;
            },

            deleteConversation: (id: string) => {
                set((state) => ({
                    conversations: state.conversations.filter((c) => c.id !== id),
                    activeConversationId: state.activeConversationId === id ? null : state.activeConversationId,
                }));
            },

            setActiveConversation: (id: string) => {
                set({ activeConversationId: id });
            },

            addMessage: (conversationId: string, message) => {
                const newMessage: AIMessage = {
                    ...message,
                    id: generateId(),
                    timestamp: new Date(),
                };

                set((state) => ({
                    conversations: state.conversations.map((conv) =>
                        conv.id === conversationId
                            ? {
                                ...conv,
                                messages: [...conv.messages, newMessage],
                                updatedAt: new Date(),
                                title: conv.messages.length === 0 && message.role === 'user'
                                    ? message.content.slice(0, 50) + '...'
                                    : conv.title,
                            }
                            : conv
                    ),
                }));
            },

            // Memory actions
            addMemory: (memory) => {
                const newMemory: AIMemory = {
                    ...memory,
                    createdAt: new Date(),
                };

                set((state) => ({
                    memories: [
                        ...state.memories.filter((m) => m.key !== memory.key),
                        newMemory,
                    ],
                }));
            },

            deleteMemory: (key: string) => {
                set((state) => ({
                    memories: state.memories.filter((m) => m.key !== key),
                }));
            },

            getMemoriesByCategory: (category) => {
                return get().memories.filter((m) => m.category === category);
            },

            // Settings
            updateSettings: (settings) => {
                set(settings);
            },
        }),
        {
            name: 'lifeos-ai-store',
        }
    )
);

// Helper to get conversation context
export function getConversationContext(conversation: AIConversation, memories: AIMemory[]): string {
    const memoryContext = memories.map((m) => `${m.key}: ${m.value}`).join('\n');

    return `
Você é Juliana, a assistente de IA do LifeOS - Sistema Operacional da Vida.
Você foi criada por Edson de Azevedo Martins.

Você ajuda o usuário com:
- Gestão de objetivos e metas
- Finanças pessoais
- Saúde e bem-estar
- Carreira e desenvolvimento
- Organização da rotina
- Buscas na internet
- Qualquer dúvida que ele tiver

Memórias sobre o usuário:
${memoryContext || 'Nenhuma memória salva ainda.'}

Seja amigável, proativa e útil. Use emojis quando apropriado.
Responda em português brasileiro.
`.trim();
}
