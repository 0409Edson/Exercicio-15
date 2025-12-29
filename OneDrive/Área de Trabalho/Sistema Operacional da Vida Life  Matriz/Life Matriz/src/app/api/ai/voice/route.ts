import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
    try {
        const { transcript, context } = await request.json();

        if (!transcript) {
            return NextResponse.json({ error: 'No transcript provided' }, { status: 400 });
        }

        // Check if API key is configured
        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({
                response: getSmartMockResponse(transcript),
                success: true,
                mock: true,
            });
        }

        const systemPrompt = `Você é o assistente de voz do LifeOS - Sistema Operacional da Vida.
O usuário acabou de falar algo com você por voz. Sua resposta será lida em voz alta.

Diretrizes:
- Seja conciso (máximo 2-3 frases)
- Fale de forma natural, como uma conversa
- Dê dicas práticas e acionáveis
- Se o usuário mencionar um objetivo, ofereça ajuda para rastreá-lo
- Se mencionar um problema, sugira soluções do LifeOS
- Se pedir pesquisa, faça um resumo do que você sabe

Tópicos que você pode ajudar:
- Objetivos de vida (estudar fora, carreira, etc.)
- Finanças pessoais
- Saúde e bem-estar
- Produtividade e hábitos
- Desenvolvimento pessoal

Responda sempre em português brasileiro, de forma amigável.`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `O usuário disse: "${transcript}"` },
            ],
            temperature: 0.8,
            max_tokens: 200,
        });

        const response = completion.choices[0]?.message?.content;

        return NextResponse.json({
            response,
            success: true,
        });
    } catch (error: any) {
        console.error('Voice API Error:', error);

        return NextResponse.json({
            response: 'Desculpe, tive um problema. Pode repetir?',
            success: true,
            mock: true,
            error: error.message,
        });
    }
}

// Smart mock responses based on keywords
function getSmartMockResponse(transcript: string): string {
    const text = transcript.toLowerCase();

    // Estudar no exterior
    if (text.includes('estud') && (text.includes('fora') || text.includes('exterior'))) {
        return 'Que legal que você quer estudar no exterior! Posso te ajudar a criar um objetivo com todas as etapas: pesquisa de universidades, exames de idioma, documentação e financiamento. Quer começar?';
    }

    // Finanças
    if (text.includes('dinheir') || text.includes('finanç') || text.includes('econom') || text.includes('gast')) {
        return 'Sobre finanças, posso te ajudar! No módulo Finanças você pode registrar suas receitas e despesas, definir metas de economia e acompanhar seu progresso. Quer que eu te leve lá?';
    }

    // Saúde / Estresse
    if (text.includes('estress') || text.includes('ansied') || text.includes('cansa')) {
        return 'Entendo que você está se sentindo assim. Que tal registrar isso no Diário de Reflexão? Também sugiro criar um hábito de meditação de 10 minutos. Pequenas pausas fazem diferença!';
    }

    // Objetivo / Meta
    if (text.includes('objetivo') || text.includes('meta') || text.includes('quer')) {
        return 'Ótimo que você quer definir um objetivo! Posso te levar ao módulo de Objetivos onde você pode criar sua meta com prazo, sub-tarefas e acompanhar o progresso. Vamos lá?';
    }

    // Hábitos
    if (text.includes('hábit') || text.includes('rotina') || text.includes('todo dia')) {
        return 'Construir hábitos é essencial! No Tracker de Hábitos você pode criar qualquer hábito e acompanhar seu streak diário. Que tal começar com algo simples como beber 2L de água por dia?';
    }

    // Carreira
    if (text.includes('carreir') || text.includes('trabalh') || text.includes('emprego')) {
        return 'Sobre carreira, posso ajudar! No módulo Carreira você pode mapear suas habilidades, acompanhar cursos e definir marcos profissionais. Qual é seu objetivo de carreira principal?';
    }

    // Ajuda geral
    if (text.includes('ajud') || text.includes('precis')) {
        return 'Estou aqui para ajudar! Você pode me pedir ajuda com objetivos, finanças, saúde, hábitos ou carreira. O que está precisando?';
    }

    // Saudação
    if (text.includes('olá') || text.includes('oi') || text.includes('ola')) {
        return 'Olá! Sou o assistente de voz do LifeOS. Pode me falar sobre seus objetivos, dúvidas ou o que você precisa de ajuda. Estou ouvindo!';
    }

    // Default
    return 'Entendi! Posso te ajudar a transformar isso em um objetivo ou hábito no LifeOS. Me conta mais sobre o que você quer alcançar.';
}
