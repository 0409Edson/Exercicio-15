import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Memory types
export interface Memory {
    id: string;
    type: 'fact' | 'preference' | 'behavior' | 'feedback' | 'interaction';
    key: string;
    value: string;
    confidence: number; // 0-100
    source: string; // where it was learned from
    createdAt: Date;
    lastUsed: Date;
    useCount: number;
}

export interface Interaction {
    id: string;
    userMessage: string;
    aiResponse: string;
    timestamp: Date;
    rating?: 'good' | 'bad' | 'neutral';
    feedback?: string;
    topics: string[];
}

export interface LearningPattern {
    pattern: string;
    frequency: number;
    lastSeen: Date;
    context: string;
}

interface LearningAIState {
    // Memory System
    memories: Memory[];
    interactions: Interaction[];
    patterns: LearningPattern[];

    // Knowledge Base
    userFacts: Record<string, string>;
    preferences: Record<string, string>;
    behaviors: Record<string, number>;

    // Stats
    totalInteractions: number;
    positiveRatings: number;
    negativeRatings: number;
    learningScore: number;

    // Actions - Memory
    addMemory: (memory: Omit<Memory, 'id' | 'createdAt' | 'lastUsed' | 'useCount'>) => void;
    updateMemoryConfidence: (id: string, change: number) => void;
    useMemory: (id: string) => void;
    getRelevantMemories: (query: string, limit?: number) => Memory[];

    // Actions - Interactions
    addInteraction: (interaction: Omit<Interaction, 'id' | 'timestamp'>) => void;
    rateInteraction: (id: string, rating: 'good' | 'bad' | 'neutral', feedback?: string) => void;

    // Actions - Learning
    learnFromInteraction: (userMessage: string, aiResponse: string) => void;
    extractPatterns: () => void;

    // Actions - Knowledge Base
    setUserFact: (key: string, value: string) => void;
    setPreference: (key: string, value: string) => void;
    trackBehavior: (behavior: string) => void;

    // Computed
    getPersonalityContext: () => string;
    getLearningStats: () => { score: number; memories: number; patterns: number };
}

const generateId = () => crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Keywords for topic extraction
const topicKeywords: Record<string, string[]> = {
    'finanças': ['dinheiro', 'economia', 'investir', 'gastar', 'salário', 'renda', 'poupança'],
    'saúde': ['exercício', 'dieta', 'dormir', 'sono', 'médico', 'doença', 'treino', 'academia'],
    'trabalho': ['emprego', 'trabalho', 'carreira', 'profissão', 'empresa', 'chefe', 'reunião'],
    'relacionamentos': ['família', 'amigos', 'namoro', 'casamento', 'filho', 'pai', 'mãe'],
    'estudos': ['estudar', 'curso', 'faculdade', 'aprender', 'livro', 'prova', 'aula'],
    'produtividade': ['produtivo', 'organizar', 'planejar', 'rotina', 'hábito', 'foco', 'meta'],
};

function extractTopics(text: string): string[] {
    const lower = text.toLowerCase();
    const topics: string[] = [];

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
        if (keywords.some(kw => lower.includes(kw))) {
            topics.push(topic);
        }
    }

    return topics.length > 0 ? topics : ['geral'];
}

function extractFacts(text: string): Array<{ key: string; value: string }> {
    const facts: Array<{ key: string; value: string }> = [];

    const patterns = [
        { regex: /(?:meu nome é|me chamo)\s+(\w+)/i, key: 'nome' },
        { regex: /tenho\s+(\d+)\s+anos/i, key: 'idade' },
        { regex: /(?:moro em|vivo em)\s+(\w+)/i, key: 'cidade' },
        { regex: /trabalho (?:como|na)\s+(.+?)(?:\.|,|$)/i, key: 'profissao' },
        { regex: /(?:estudo|faço)\s+(.+?)(?:\.|,|$)/i, key: 'estudos' },
        { regex: /(?:gosto de|adoro|amo)\s+(.+?)(?:\.|,|$)/i, key: 'preferencia' },
        { regex: /(?:não gosto de|odeio)\s+(.+?)(?:\.|,|$)/i, key: 'aversao' },
        { regex: /(?:minha meta é|meu objetivo é)\s+(.+?)(?:\.|,|$)/i, key: 'objetivo' },
    ];

    for (const { regex, key } of patterns) {
        const match = text.match(regex);
        if (match && match[1]) {
            facts.push({ key, value: match[1].trim() });
        }
    }

    return facts;
}

export const useLearningAIStore = create<LearningAIState>()(
    persist(
        (set, get) => ({
            // Initial state
            memories: [],
            interactions: [],
            patterns: [],
            userFacts: {},
            preferences: {},
            behaviors: {},
            totalInteractions: 0,
            positiveRatings: 0,
            negativeRatings: 0,
            learningScore: 0,

            // Memory actions
            addMemory: (memoryData) => {
                const memory: Memory = {
                    ...memoryData,
                    id: generateId(),
                    createdAt: new Date(),
                    lastUsed: new Date(),
                    useCount: 0,
                };

                set(state => {
                    // Check if similar memory exists
                    const existing = state.memories.find(m => m.key === memory.key);
                    if (existing) {
                        return {
                            memories: state.memories.map(m =>
                                m.id === existing.id
                                    ? { ...m, value: memory.value, confidence: Math.min(100, m.confidence + 10) }
                                    : m
                            )
                        };
                    }
                    return { memories: [...state.memories, memory] };
                });
            },

            updateMemoryConfidence: (id, change) => {
                set(state => ({
                    memories: state.memories.map(m =>
                        m.id === id
                            ? { ...m, confidence: Math.max(0, Math.min(100, m.confidence + change)) }
                            : m
                    )
                }));
            },

            useMemory: (id) => {
                set(state => ({
                    memories: state.memories.map(m =>
                        m.id === id
                            ? { ...m, lastUsed: new Date(), useCount: m.useCount + 1 }
                            : m
                    )
                }));
            },

            getRelevantMemories: (query, limit = 5) => {
                const lower = query.toLowerCase();
                return get().memories
                    .filter(m =>
                        m.key.toLowerCase().includes(lower) ||
                        m.value.toLowerCase().includes(lower)
                    )
                    .sort((a, b) => b.confidence - a.confidence)
                    .slice(0, limit);
            },

            // Interaction actions
            addInteraction: (interactionData) => {
                const interaction: Interaction = {
                    ...interactionData,
                    id: generateId(),
                    timestamp: new Date(),
                };

                set(state => ({
                    interactions: [...state.interactions.slice(-500), interaction],
                    totalInteractions: state.totalInteractions + 1,
                }));

                // Learn from this interaction
                get().learnFromInteraction(interactionData.userMessage, interactionData.aiResponse);
            },

            rateInteraction: (id, rating, feedback) => {
                set(state => {
                    const isPositive = rating === 'good';
                    const isNegative = rating === 'bad';

                    return {
                        interactions: state.interactions.map(i =>
                            i.id === id ? { ...i, rating, feedback } : i
                        ),
                        positiveRatings: state.positiveRatings + (isPositive ? 1 : 0),
                        negativeRatings: state.negativeRatings + (isNegative ? 1 : 0),
                        learningScore: Math.round(
                            ((state.positiveRatings + (isPositive ? 1 : 0)) /
                                (state.totalInteractions || 1)) * 100
                        ),
                    };
                });

                // Add feedback as memory if provided
                if (feedback) {
                    get().addMemory({
                        type: 'feedback',
                        key: `feedback_${Date.now()}`,
                        value: feedback,
                        confidence: 80,
                        source: 'user_feedback',
                    });
                }
            },

            // Learning actions
            learnFromInteraction: (userMessage, aiResponse) => {
                // Extract facts from user message
                const facts = extractFacts(userMessage);
                facts.forEach(({ key, value }) => {
                    get().addMemory({
                        type: 'fact',
                        key,
                        value,
                        confidence: 70,
                        source: 'conversation',
                    });
                    get().setUserFact(key, value);
                });

                // Extract topics and track
                const topics = extractTopics(userMessage);
                topics.forEach(topic => {
                    get().trackBehavior(`topic_${topic}`);
                });

                // Update patterns
                get().extractPatterns();
            },

            extractPatterns: () => {
                const { interactions, behaviors } = get();

                // Find most discussed topics
                const topicCounts: Record<string, number> = {};
                interactions.forEach(i => {
                    i.topics.forEach(t => {
                        topicCounts[t] = (topicCounts[t] || 0) + 1;
                    });
                });

                // Create patterns from behaviors
                const patterns: LearningPattern[] = Object.entries(behaviors)
                    .filter(([_, count]) => count > 2)
                    .map(([pattern, frequency]) => ({
                        pattern,
                        frequency,
                        lastSeen: new Date(),
                        context: 'behavior',
                    }));

                set({ patterns });
            },

            // Knowledge Base
            setUserFact: (key, value) => {
                set(state => ({
                    userFacts: { ...state.userFacts, [key]: value }
                }));
            },

            setPreference: (key, value) => {
                set(state => ({
                    preferences: { ...state.preferences, [key]: value }
                }));
            },

            trackBehavior: (behavior) => {
                set(state => ({
                    behaviors: {
                        ...state.behaviors,
                        [behavior]: (state.behaviors[behavior] || 0) + 1
                    }
                }));
            },

            // Computed
            getPersonalityContext: () => {
                const { userFacts, preferences, behaviors, memories, patterns, learningScore } = get();

                let context = `=== CONHECIMENTO SOBRE O USUÁRIO ===\n`;

                // User facts
                if (Object.keys(userFacts).length > 0) {
                    context += `\nFatos conhecidos:\n`;
                    Object.entries(userFacts).forEach(([key, value]) => {
                        context += `- ${key}: ${value}\n`;
                    });
                }

                // Preferences
                if (Object.keys(preferences).length > 0) {
                    context += `\nPreferências:\n`;
                    Object.entries(preferences).forEach(([key, value]) => {
                        context += `- ${key}: ${value}\n`;
                    });
                }

                // Top behaviors/interests
                const topBehaviors = Object.entries(behaviors)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5);

                if (topBehaviors.length > 0) {
                    context += `\nInteresses principais:\n`;
                    topBehaviors.forEach(([behavior, count]) => {
                        context += `- ${behavior.replace('topic_', '')}: ${count}x mencionado\n`;
                    });
                }

                // Important memories
                const topMemories = memories
                    .filter(m => m.confidence > 60)
                    .sort((a, b) => b.confidence - a.confidence)
                    .slice(0, 10);

                if (topMemories.length > 0) {
                    context += `\nMemórias importantes:\n`;
                    topMemories.forEach(m => {
                        context += `- ${m.key}: ${m.value} (${m.confidence}% confiança)\n`;
                    });
                }

                context += `\nScore de aprendizado: ${learningScore}%\n`;

                return context;
            },

            getLearningStats: () => {
                const { memories, patterns, learningScore } = get();
                return {
                    score: learningScore,
                    memories: memories.length,
                    patterns: patterns.length,
                };
            },
        }),
        {
            name: 'lifematriz-learning-ai',
            partialize: (state) => ({
                memories: state.memories.slice(-200),
                interactions: state.interactions.slice(-100),
                patterns: state.patterns,
                userFacts: state.userFacts,
                preferences: state.preferences,
                behaviors: state.behaviors,
                totalInteractions: state.totalInteractions,
                positiveRatings: state.positiveRatings,
                negativeRatings: state.negativeRatings,
                learningScore: state.learningScore,
            }),
        }
    )
);
