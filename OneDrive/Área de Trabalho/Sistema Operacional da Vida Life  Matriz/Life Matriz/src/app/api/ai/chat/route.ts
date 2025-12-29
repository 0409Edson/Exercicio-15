import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
    try {
        const { message, context, history } = await request.json();

        // Check if API key is configured
        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({
                response: getMockResponse(message),
                success: true,
                mock: true,
            });
        }

        const systemPrompt = `Você é o assistente de IA do LifeOS - Sistema Operacional da Vida.
Você é um coach de vida inteligente que APRENDE sobre o usuário.

Sua missão:
- Lembrar tudo que o usuário te conta
- Aprender padrões e preferências
- Dar respostas personalizadas baseadas no histórico
- Ajudar com objetivos, finanças, saúde e carreira

Sua personalidade:
- Amigável e encorajador
- Direto e prático
- Empático mas realista
- Focado em soluções

Conhecimento sobre este usuário:
${context?.personalityContext || 'Ainda aprendendo sobre o usuário...'}

Responda sempre em português brasileiro de forma conversacional.
Seja conciso - respostas devem ter no máximo 3 parágrafos.
Mencione fatos que você lembra sobre o usuário quando relevante.`;

        const messages: OpenAI.ChatCompletionMessageParam[] = [
            { role: 'system', content: systemPrompt },
            ...(history || []).slice(-10),
            { role: 'user', content: message },
        ];

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages,
            temperature: 0.8,
            max_tokens: 500,
        });

        const response = completion.choices[0]?.message?.content;

        return NextResponse.json({
            response,
            success: true,
        });
    } catch (error: any) {
        console.error('Chat API Error:', error);

        return NextResponse.json({
            response: getMockResponse('erro'),
            success: true,
            mock: true,
            error: error.message,
        });
    }
}

function getMockResponse(message: string): string {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('objetivo') || lowerMessage.includes('meta')) {
        return 'Para definir um novo objetivo, recomendo usar o framework SMART: Específico, Mensurável, Atingível, Relevante e Temporal. Qual área você gostaria de focar primeiro - carreira, finanças, saúde ou desenvolvimento pessoal?';
    }

    if (lowerMessage.includes('finanç') || lowerMessage.includes('dinheir') || lowerMessage.includes('gast')) {
        return 'Para melhorar suas finanças, sugiro começar com a regra 50/30/20: 50% para necessidades, 30% para desejos e 20% para poupança/investimentos. Quer que eu analise seus gastos atuais e sugira ajustes?';
    }

    if (lowerMessage.includes('saúde') || lowerMessage.includes('exercício') || lowerMessage.includes('sono')) {
        return 'Saúde é a base de tudo! Os três pilares são: sono de qualidade (7-8h), exercício regular (150min/semana) e alimentação balanceada. Qual desses você gostaria de melhorar primeiro?';
    }

    if (lowerMessage.includes('produtiv') || lowerMessage.includes('tempo') || lowerMessage.includes('foco')) {
        return 'Para aumentar sua produtividade, experimente a técnica Pomodoro: 25 minutos de foco intenso seguidos de 5 minutos de pausa. Também recomendo definir as 3 tarefas mais importantes logo pela manhã. Quer que eu ajude a organizar sua agenda?';
    }

    if (lowerMessage.includes('carreira') || lowerMessage.includes('trabalho') || lowerMessage.includes('estud')) {
        return 'Desenvolvimento de carreira requer estratégia! Sugiro: 1) Definir onde você quer estar em 3-5 anos, 2) Identificar as habilidades necessárias, 3) Criar um plano de aprendizado. Em qual área você gostaria de crescer?';
    }

    return 'Olá! Sou seu assistente pessoal do LifeOS. Posso ajudar você a organizar seus objetivos, gerenciar seu tempo, planejar finanças ou melhorar sua saúde. No que posso ajudar hoje?';
}
