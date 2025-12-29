import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

interface AIRequest {
    messages: Message[];
    model?: 'gpt-4' | 'gpt-3.5-turbo' | 'claude' | 'gemini';
    maxTokens?: number;
    temperature?: number;
    systemPrompt?: string;
    enableSearch?: boolean;
    searchQuery?: string;
}

export async function POST(request: NextRequest) {
    try {
        const body: AIRequest = await request.json();
        const {
            messages,
            model = 'gpt-3.5-turbo',
            maxTokens = 2048,
            temperature = 0.7,
            systemPrompt,
            enableSearch,
            searchQuery,
        } = body;

        // Check if any API key is configured
        const hasApiKey = OPENAI_API_KEY || ANTHROPIC_API_KEY || GOOGLE_API_KEY;

        // If no API key, use local smart responses
        if (!hasApiKey) {
            const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
            const localResponse = getSmartLocalResponse(lastUserMessage);

            return NextResponse.json({
                success: true,
                response: localResponse,
                model: 'local-ai',
                tokens: 0,
                searchResults: null,
            });
        }

        // If search is enabled, do web search first
        let searchResults = null;
        if (enableSearch && searchQuery) {
            searchResults = await performWebSearch(searchQuery);
        }

        // Add search results to context if available
        let enhancedMessages = [...messages];
        if (searchResults) {
            const searchContext = `
Resultados da busca na web para "${searchQuery}":
${searchResults.map((r: any, i: number) => `${i + 1}. ${r.title}: ${r.snippet}`).join('\n')}

Use essas informações para responder à pergunta do usuário.
`;
            enhancedMessages = [
                { role: 'system', content: systemPrompt + '\n\n' + searchContext },
                ...messages.filter(m => m.role !== 'system'),
            ];
        } else if (systemPrompt) {
            enhancedMessages = [
                { role: 'system', content: systemPrompt },
                ...messages.filter(m => m.role !== 'system'),
            ];
        }

        let response;

        // Route to appropriate AI provider
        switch (model) {
            case 'gpt-4':
            case 'gpt-3.5-turbo':
                response = await callOpenAI(enhancedMessages, model, maxTokens, temperature);
                break;
            case 'claude':
                response = await callClaude(enhancedMessages, maxTokens, temperature);
                break;
            case 'gemini':
                response = await callGemini(enhancedMessages, maxTokens, temperature);
                break;
            default:
                response = await callOpenAI(enhancedMessages, 'gpt-3.5-turbo', maxTokens, temperature);
        }

        return NextResponse.json({
            success: true,
            response: response.content,
            model: response.model,
            tokens: response.tokens,
            searchResults,
        });

    } catch (error: any) {
        console.error('AI API Error:', error);

        // Return helpful error message
        return NextResponse.json({
            success: false,
            error: error.message,
            response: getFallbackResponse(error.message),
        }, { status: 500 });
    }
}

// Smart local responses without API
function getSmartLocalResponse(userMessage: string): string {
    const msg = userMessage.toLowerCase();

    // Greetings
    if (msg.includes('olá') || msg.includes('oi') || msg.includes('hey') || msg.includes('bom dia') || msg.includes('boa tarde') || msg.includes('boa noite')) {
        return `Olá! 👋 Sou a Juliana, sua assistente do Life Matriz!

Posso te ajudar com:
- 📊 **Objetivos**: Organizar suas metas
- 💰 **Finanças**: Dicas de economia
- 🏃 **Hábitos**: Criar rotinas saudáveis
- 📅 **Agenda**: Planejar seu dia

O que você gostaria de fazer hoje?`;
    }

    // Goals/Objectives
    if (msg.includes('objetivo') || msg.includes('meta') || msg.includes('sonho')) {
        return `🎯 **Sobre objetivos e metas:**

Para definir um bom objetivo, use o método SMART:
- **S**pecífico: O que exatamente você quer?
- **M**ensurável: Como saber se alcançou?
- **A**lcançável: É realista?
- **R**elevante: Por que é importante?
- **T**emporal: Quando você quer alcançar?

📝 Exemplo: "Economizar R$5.000 até dezembro para minha viagem"

Quer que eu te ajude a definir uma meta específica? Me conte o que você tem em mente!`;
    }

    // Finances
    if (msg.includes('finanç') || msg.includes('dinheir') || msg.includes('economi') || msg.includes('gasto') || msg.includes('despesa')) {
        return `💰 **Dicas de finanças pessoais:**

1. **Regra 50/30/20**:
   - 50% para necessidades
   - 30% para desejos
   - 20% para poupança

2. **Registre tudo**: Anote cada gasto, por menor que seja

3. **Emergência primeiro**: Tenha 3-6 meses de despesas guardados

4. **Evite dívidas**: Juros consomem seu dinheiro

💡 Acesse a aba **Finanças** do Life Matriz para registrar suas transações!`;
    }

    // Health
    if (msg.includes('saúde') || msg.includes('exercício') || msg.includes('dormir') || msg.includes('dieta')) {
        return `❤️ **Dicas de saúde:**

**Sono**: Durma 7-9 horas por noite
**Água**: Beba pelo menos 2 litros por dia
**Movimento**: 30 minutos de atividade diária
**Alimentação**: Priorize alimentos naturais

🏃 Pequenos hábitos fazem grande diferença!

Quer registrar algum dado de saúde? Acesse a aba **Saúde** no menu lateral.`;
    }

    // Habits
    if (msg.includes('hábito') || msg.includes('rotina') || msg.includes('consistência')) {
        return `⚡ **Criando hábitos duradouros:**

1. **Comece pequeno**: 2 minutos por dia é melhor que nada
2. **Associe a algo**: "Depois de X, farei Y"
3. **Celebre vitórias**: Cada dia conta!
4. **Não quebre a corrente**: Mantenha o streak!

📊 Dica: Use a aba **Hábitos** para acompanhar seus progressos diários!`;
    }

    // Help
    if (msg.includes('ajuda') || msg.includes('help') || msg.includes('o que você faz') || msg.includes('como funciona')) {
        return `🤖 **Sou a Juliana, sua assistente virtual!**

No Life Matriz, posso te ajudar com:

📊 **Gestão de vida**:
- Definir e acompanhar objetivos
- Organizar finanças pessoais
- Criar hábitos saudáveis
- Registrar no diário

💡 **Dicas personalizadas**:
- Baseadas no seu momento do dia
- Sugestões de produtividade
- Insights de progresso

Para ativar a IA completa com GPT-4, Claude ou Gemini, configure as API keys em Settings!`;
    }

    // Default response
    return `Entendi! 💭

Como sua assistente local, posso te dar dicas sobre:
- 🎯 Objetivos e metas
- 💰 Finanças pessoais
- ❤️ Saúde e bem-estar
- ⚡ Hábitos e produtividade

Me conte mais sobre o que você precisa! 

💡 *Para respostas mais avançadas, configure uma API key nas configurações do chat.*`;
}

// OpenAI API Call
async function callOpenAI(messages: Message[], model: string, maxTokens: number, temperature: number) {
    if (!OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model,
            messages,
            max_tokens: maxTokens,
            temperature,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'OpenAI API error');
    }

    const data = await response.json();

    return {
        content: data.choices[0].message.content,
        model,
        tokens: data.usage?.total_tokens,
    };
}

// Anthropic Claude API Call
async function callClaude(messages: Message[], maxTokens: number, temperature: number) {
    if (!ANTHROPIC_API_KEY) {
        throw new Error('Anthropic API key not configured');
    }

    // Convert messages format for Claude
    const systemMessage = messages.find(m => m.role === 'system')?.content || '';
    const conversationMessages = messages.filter(m => m.role !== 'system');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
            model: 'claude-3-sonnet-20240229',
            system: systemMessage,
            messages: conversationMessages,
            max_tokens: maxTokens,
            temperature,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Claude API error');
    }

    const data = await response.json();

    return {
        content: data.content[0].text,
        model: 'claude',
        tokens: data.usage?.input_tokens + data.usage?.output_tokens,
    };
}

// Google Gemini API Call
async function callGemini(messages: Message[], maxTokens: number, temperature: number) {
    if (!GOOGLE_API_KEY) {
        throw new Error('Google API key not configured');
    }

    // Convert messages for Gemini
    const contents = messages
        .filter(m => m.role !== 'system')
        .map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
        }));

    const systemInstruction = messages.find(m => m.role === 'system')?.content;

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GOOGLE_API_KEY}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents,
                systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
                generationConfig: {
                    maxOutputTokens: maxTokens,
                    temperature,
                },
            }),
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Gemini API error');
    }

    const data = await response.json();

    return {
        content: data.candidates[0].content.parts[0].text,
        model: 'gemini',
        tokens: null,
    };
}

// Web search using free API or scraping
async function performWebSearch(query: string) {
    try {
        // Try SerpAPI if configured
        const serpApiKey = process.env.SERPAPI_KEY;
        if (serpApiKey) {
            const response = await fetch(
                `https://serpapi.com/search?engine=google&q=${encodeURIComponent(query)}&api_key=${serpApiKey}&num=5`
            );
            const data = await response.json();

            return (data.organic_results || []).slice(0, 5).map((r: any) => ({
                title: r.title,
                snippet: r.snippet,
                url: r.link,
            }));
        }

        // Fallback: return null (no search)
        return null;
    } catch (error) {
        console.error('Search error:', error);
        return null;
    }
}

// Fallback response when API fails
function getFallbackResponse(errorMessage: string): string {
    if (errorMessage.includes('API key not configured')) {
        return `⚠️ Para usar a IA avançada, você precisa configurar as API keys no arquivo .env.local:

\`\`\`
OPENAI_API_KEY=sua_chave_openai
# ou
ANTHROPIC_API_KEY=sua_chave_anthropic
# ou  
GOOGLE_API_KEY=sua_chave_gemini
\`\`\`

Obtenha suas chaves em:
- OpenAI: https://platform.openai.com/api-keys
- Anthropic: https://console.anthropic.com
- Google: https://makersuite.google.com/app/apikey`;
    }

    return `Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.

Erro: ${errorMessage}`;
}
