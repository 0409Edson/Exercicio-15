import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
    try {
        const { goals, tasks, health, finance, context } = await request.json();

        // Check if API key is configured
        if (!process.env.OPENAI_API_KEY) {
            // Return mock insights when no API key is configured
            return NextResponse.json({
                insights: getMockInsights(context),
                success: true,
                mock: true,
            });
        }

        const systemPrompt = `Você é um assistente de IA do LifeOS - Sistema Operacional da Vida.
Seu papel é analisar os dados do usuário e fornecer insights personalizados, recomendações e sugestões de otimização.

Diretrizes:
- Seja conciso e direto
- Foque em ações práticas
- Priorize o equilíbrio entre objetivos
- Considere o contexto de energia e humor do usuário
- Sugira ajustes de rotina quando necessário

Responda SEMPRE em português brasileiro.
Formate sua resposta como JSON com a estrutura:
{
  "insights": [
    {
      "type": "tip" | "alert" | "insight" | "recommendation",
      "title": "string",
      "description": "string",
      "action": "string (opcional)",
      "priority": "high" | "medium" | "low"
    }
  ],
  "dailyFocus": "string - sugestão de foco principal para hoje",
  "nextAction": "string - próxima ação recomendada"
}`;

        const userPrompt = `Analise os dados do usuário e forneça insights personalizados:

OBJETIVOS:
${JSON.stringify(goals, null, 2)}

TAREFAS DE HOJE:
${JSON.stringify(tasks, null, 2)}

DADOS DE SAÚDE:
${JSON.stringify(health, null, 2)}

DADOS FINANCEIROS:
${JSON.stringify(finance, null, 2)}

CONTEXTO ATUAL:
${JSON.stringify(context, null, 2)}

Forneça 3-5 insights relevantes baseados nesses dados.`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
            max_tokens: 1000,
        });

        const response = completion.choices[0]?.message?.content;

        if (!response) {
            throw new Error('No response from AI');
        }

        const parsedResponse = JSON.parse(response);

        return NextResponse.json({
            ...parsedResponse,
            success: true,
        });
    } catch (error: any) {
        console.error('AI API Error:', error);

        // Return mock insights on error
        return NextResponse.json({
            insights: getMockInsights('fallback'),
            success: true,
            mock: true,
            error: error.message,
        });
    }
}

// Mock insights for demo/fallback
function getMockInsights(context: string) {
    const mockInsights = {
        goals: [
            {
                type: 'insight',
                title: 'Foco recomendado',
                description: 'Baseado no seu padrão, sugiro focar em "Preparar documentação" hoje. Isso desbloqueará as próximas etapas.',
                action: 'Ver objetivo',
                priority: 'high',
            },
            {
                type: 'tip',
                title: 'Progresso consistente',
                description: 'Você está mantendo um bom ritmo! Continue assim para atingir sua meta até o prazo.',
                priority: 'medium',
            },
        ],
        calendar: [
            {
                type: 'recommendation',
                title: 'Pausa recomendada',
                description: 'Você está focado há 2h. Uma pausa de 10min às 16:30 ajudará sua produtividade.',
                action: 'Agendar pausa',
                priority: 'medium',
            },
            {
                type: 'alert',
                title: 'Conflito de agenda',
                description: 'Você tem 2 reuniões sobrepostas às 15h. Considere reagendar uma delas.',
                action: 'Ver conflitos',
                priority: 'high',
            },
        ],
        finance: [
            {
                type: 'alert',
                title: 'Atenção: Orçamento',
                description: 'Você está a R$150 do limite mensal de gastos com lazer. Considere ajustar.',
                action: 'Ajustar orçamento',
                priority: 'high',
            },
            {
                type: 'tip',
                title: 'Oportunidade de economia',
                description: 'Identificamos assinaturas pouco usadas. Você poderia economizar R$89/mês.',
                action: 'Ver detalhes',
                priority: 'medium',
            },
        ],
        health: [
            {
                type: 'recommendation',
                title: 'Beba mais água',
                description: 'Você está a 700ml da meta. Lembrete: beber água às 15:00.',
                action: 'Definir lembrete',
                priority: 'medium',
            },
            {
                type: 'insight',
                title: 'Padrão de sono',
                description: 'Seu sono melhorou 15% esta semana. Continue com o horário regular de dormir.',
                priority: 'low',
            },
        ],
        fallback: [
            {
                type: 'tip',
                title: 'Dica do dia',
                description: 'Comece o dia priorizando as 3 tarefas mais importantes. Isso aumenta sua produtividade em 25%.',
                priority: 'medium',
            },
            {
                type: 'insight',
                title: 'Análise disponível',
                description: 'Configure sua API Key do OpenAI para receber insights personalizados baseados em IA.',
                action: 'Configurar',
                priority: 'low',
            },
        ],
    };

    return mockInsights[context as keyof typeof mockInsights] || mockInsights.fallback;
}
