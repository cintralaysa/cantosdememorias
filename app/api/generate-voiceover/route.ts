import { NextRequest, NextResponse } from 'next/server';
import { sanitizeString, checkRateLimit, getClientIP, isNotEmpty } from '@/lib/security';

// Configuração do OpenAI
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface VoiceoverRequest {
  voiceoverPurpose: string;
  voiceoverPurposeLabel: string;
  voiceoverName: string;
  voiceoverType: string;
  voiceoverTypeLabel: string;
  voiceoverStyle: string;
  voiceoverStyleLabel: string;
  voicePreference: string;
  voiceoverScript?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting por IP
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(`voiceover:${clientIP}`, 10, 60000); // 10 requisições por minuto

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Muitas requisições. Aguarde um momento.' },
        { status: 429 }
      );
    }

    const rawData = await request.json();

    // Sanitizar todos os inputs
    const data: VoiceoverRequest = {
      voiceoverPurpose: sanitizeString(rawData.voiceoverPurpose, 50),
      voiceoverPurposeLabel: sanitizeString(rawData.voiceoverPurposeLabel, 50),
      voiceoverName: sanitizeString(rawData.voiceoverName, 100),
      voiceoverType: sanitizeString(rawData.voiceoverType, 50),
      voiceoverTypeLabel: sanitizeString(rawData.voiceoverTypeLabel, 50),
      voiceoverStyle: sanitizeString(rawData.voiceoverStyle, 50),
      voiceoverStyleLabel: sanitizeString(rawData.voiceoverStyleLabel, 50),
      voicePreference: sanitizeString(rawData.voicePreference, 30),
      voiceoverScript: sanitizeString(rawData.voiceoverScript, 1000),
    };

    // Validação básica
    if (!isNotEmpty(data.voiceoverName, 2)) {
      return NextResponse.json(
        { error: 'Nome da empresa/pessoa é obrigatório' },
        { status: 400 }
      );
    }

    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'Serviço temporariamente indisponível' },
        { status: 503 }
      );
    }

    // Construir o prompt para o GPT
    const prompt = buildPrompt(data);

    // Chamar a API do OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Você é um redator publicitário brasileiro experiente, especializado em criar textos para locução profissional.

REGRAS IMPORTANTES:
1. Escreva textos em português brasileiro claro e natural
2. Use o nome da empresa/pessoa naturalmente no texto
3. Adapte o tom ao estilo solicitado (profissional, acolhedor, animado, etc.)
4. O texto deve ser conciso e fácil de ler em voz alta
5. Evite frases muito longas - locuções precisam de pausas naturais
6. O texto deve ter entre 50-150 palavras (ideal para locução de 30-60 segundos)
7. Seja persuasivo mas autêntico, evite clichês excessivos
8. Inclua uma abertura impactante e um fechamento memorável

FORMATO DE SAÍDA:
Retorne APENAS o texto da locução, sem explicações ou comentários.
Use quebras de linha para indicar pausas naturais na leitura.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      return NextResponse.json(
        { error: 'Erro ao gerar texto. Tente novamente.' },
        { status: 500 }
      );
    }

    const result = await response.json();
    const script = result.choices[0]?.message?.content?.trim();

    if (!script) {
      return NextResponse.json(
        { error: 'Não foi possível gerar o texto. Tente novamente.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      script,
      success: true
    });

  } catch (error) {
    console.error('Error generating voiceover script:', error);
    return NextResponse.json(
      { error: 'Erro interno ao gerar texto.' },
      { status: 500 }
    );
  }
}

function buildPrompt(data: VoiceoverRequest): string {
  let prompt = `Crie um texto de locução profissional com as seguintes informações:

📋 DETALHES DO PEDIDO:
- Objetivo: ${data.voiceoverPurposeLabel} (${data.voiceoverPurpose})
- Nome da empresa/pessoa: ${data.voiceoverName}
- Tipo de locução: ${data.voiceoverTypeLabel}
- Estilo desejado: ${data.voiceoverStyleLabel}
- Voz: ${data.voicePreference === 'feminina' ? 'Voz feminina' : data.voicePreference === 'masculina' ? 'Voz masculina' : 'Sem preferência'}
`;

  // Se o cliente já tem uma ideia do que quer
  if (data.voiceoverScript && data.voiceoverScript.trim()) {
    prompt += `\n💡 IDEIA/RASCUNHO DO CLIENTE:
${data.voiceoverScript}

Use essa ideia como base, mas melhore e profissionalize o texto mantendo a essência.`;
  }

  // Instruções específicas por tipo
  prompt += `\n\n🎯 INSTRUÇÕES ESPECÍFICAS:`;

  switch (data.voiceoverType) {
    case 'boas-vindas':
      prompt += `\n- Crie uma mensagem de boas-vindas calorosa e acolhedora
- Faça o ouvinte se sentir especial e bem-vindo
- Mencione ${data.voiceoverName} de forma natural`;
      break;
    case 'convite':
      prompt += `\n- Crie um convite envolvente e persuasivo
- Desperte curiosidade e vontade de participar
- Inclua elementos que gerem urgência positiva`;
      break;
    case 'agradecimento':
      prompt += `\n- Crie uma mensagem de agradecimento sincera e emotiva
- Reconheça a importância do ouvinte
- Transmita gratidão genuína`;
      break;
    case 'aviso':
      prompt += `\n- Crie um aviso claro e objetivo
- Seja informativo sem ser monótono
- Destaque as informações importantes`;
      break;
    case 'apresentacao':
      prompt += `\n- Crie uma apresentação impactante
- Destaque os pontos fortes de ${data.voiceoverName}
- Gere credibilidade e interesse`;
      break;
    case 'promocao':
      prompt += `\n- Crie um texto promocional persuasivo
- Destaque benefícios e vantagens
- Inclua call-to-action claro`;
      break;
    case 'homenagem':
      prompt += `\n- Crie uma homenagem emocionante e respeitosa
- Celebre conquistas e qualidades
- Transmita admiração e carinho`;
      break;
    default:
      prompt += `\n- Crie um texto adequado ao objetivo
- Seja criativo e profissional
- Adapte ao contexto solicitado`;
  }

  // Instruções por estilo
  prompt += `\n\n🎨 TOM E ESTILO:`;

  switch (data.voiceoverStyle) {
    case 'profissional':
      prompt += `\n- Tom formal e corporativo
- Linguagem técnica quando apropriado
- Transmita seriedade e competência`;
      break;
    case 'acolhedor':
      prompt += `\n- Tom caloroso e amigável
- Linguagem próxima e pessoal
- Transmita conforto e confiança`;
      break;
    case 'animado':
      prompt += `\n- Tom energético e vibrante
- Use palavras que transmitam entusiasmo
- Crie dinamismo na leitura`;
      break;
    case 'suave':
      prompt += `\n- Tom calmo e delicado
- Linguagem suave e tranquila
- Transmita paz e serenidade`;
      break;
    case 'serio':
      prompt += `\n- Tom sério e direto
- Linguagem objetiva e precisa
- Transmita autoridade e respeito`;
      break;
    case 'divertido':
      prompt += `\n- Tom leve e descontraído
- Pode incluir humor sutil
- Transmita alegria e leveza`;
      break;
  }

  prompt += `\n\n📝 LEMBRE-SE:
- O texto será lido em voz alta por um locutor profissional
- Evite siglas ou abreviações que dificultem a leitura
- Use pontuação para indicar pausas naturais
- O texto deve fluir naturalmente quando lido`;

  return prompt;
}
