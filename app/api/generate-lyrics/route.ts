import { NextRequest, NextResponse } from 'next/server';
import { sanitizeString, checkRateLimit, getClientIP, isNotEmpty } from '@/lib/security';

// Configuração do OpenAI
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface LyricsRequest {
  relationship: string;
  relationshipLabel: string;
  honoreeName: string;
  occasion: string;
  occasionLabel: string;
  musicStyle: string;
  musicStyleLabel: string;
  voicePreference: string;
  qualities: string;
  memories: string;
  heartMessage: string;
  familyNames?: string;
  knowsBabySex?: string;
  babySex?: string;
  babyNameBoy?: string;
  babyNameGirl?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting por IP
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(`lyrics:${clientIP}`, 10, 60000); // 10 requisições por minuto

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Muitas requisições. Aguarde um momento.' },
        { status: 429 }
      );
    }

    const rawData = await request.json();

    // Sanitizar todos os inputs
    const data: LyricsRequest = {
      relationship: sanitizeString(rawData.relationship, 50),
      relationshipLabel: sanitizeString(rawData.relationshipLabel, 50),
      honoreeName: sanitizeString(rawData.honoreeName, 100),
      occasion: sanitizeString(rawData.occasion, 50),
      occasionLabel: sanitizeString(rawData.occasionLabel, 50),
      musicStyle: sanitizeString(rawData.musicStyle, 50),
      musicStyleLabel: sanitizeString(rawData.musicStyleLabel, 50),
      voicePreference: sanitizeString(rawData.voicePreference, 30),
      qualities: sanitizeString(rawData.qualities, 500),
      memories: sanitizeString(rawData.memories, 800),
      heartMessage: sanitizeString(rawData.heartMessage, 500),
      familyNames: sanitizeString(rawData.familyNames, 300),
      knowsBabySex: sanitizeString(rawData.knowsBabySex, 10),
      babySex: sanitizeString(rawData.babySex, 20),
      babyNameBoy: sanitizeString(rawData.babyNameBoy, 100),
      babyNameGirl: sanitizeString(rawData.babyNameGirl, 100),
    };

    // Validação básica
    if (!isNotEmpty(data.honoreeName, 2)) {
      return NextResponse.json(
        { error: 'Nome do homenageado é obrigatório' },
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
            content: `Você é um compositor musical brasileiro talentoso e sensível. Sua especialidade é criar letras de músicas personalizadas e emocionantes para momentos especiais.

REGRAS IMPORTANTES:
1. Escreva letras em português brasileiro
2. Use o nome da pessoa homenageada naturalmente na letra
3. Incorpore as qualidades, memórias e mensagens fornecidas
4. Adapte o tom ao estilo musical escolhido
5. Crie uma estrutura com: Verso 1, Refrão, Verso 2, Refrão, Ponte (opcional), Refrão Final
6. A letra deve ter entre 150-250 palavras (exceto chá revelação com dois finais)
7. Seja emotivo mas autêntico, evite clichês excessivos
8. Use rimas quando natural, mas priorize o sentimento

REGRA ESPECIAL PARA CHÁ REVELAÇÃO/CHÁ DE BEBÊ (quando os pais NÃO sabem o sexo):
- Siga OBRIGATORIAMENTE a estrutura especial com contagem de suspense e dois finais
- A letra terá: Parte Comum + Contagem de Suspense + Final Menino + Final Menina
- A contagem deve criar tensão: "3... 2... 1..." ou similar
- Os dois finais devem ter mesma estrutura rítmica para funcionar com a mesma melodia

FORMATO DE SAÍDA:
Retorne APENAS a letra da música, sem explicações ou comentários.
Use quebras de linha para separar as seções.
Coloque o nome da seção em colchetes: [Verso 1], [Refrão], [Contagem do Suspense], [Final Versão Menino 💙], [Final Versão Menina 💖], etc.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      return NextResponse.json(
        { error: 'Erro ao gerar letra. Tente novamente.' },
        { status: 500 }
      );
    }

    const result = await response.json();
    const lyrics = result.choices[0]?.message?.content?.trim();

    if (!lyrics) {
      return NextResponse.json(
        { error: 'Não foi possível gerar a letra. Tente novamente.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      lyrics,
      success: true
    });

  } catch (error) {
    console.error('Error generating lyrics:', error);
    return NextResponse.json(
      { error: 'Erro interno ao gerar letra.' },
      { status: 500 }
    );
  }
}

function buildPrompt(data: LyricsRequest): string {
  let prompt = `Crie uma letra de música personalizada com as seguintes informações:

📋 DETALHES DO PEDIDO:
- Para quem: ${data.honoreeName} (${data.relationshipLabel})
- Ocasião: ${data.occasionLabel}
- Estilo musical: ${data.musicStyleLabel}
- Preferência de voz: ${data.voicePreference === 'feminina' ? 'Voz feminina' : data.voicePreference === 'masculina' ? 'Voz masculina' : 'Sem preferência'}
`;

  // Adicionar informações de chá revelação se aplicável
  if (data.occasion === 'cha-revelacao' || data.occasion === 'cha-bebe') {
    prompt += `\n🎀 INFORMAÇÕES DO CHÁ REVELAÇÃO:`;
    if (data.knowsBabySex === 'sim' && data.babySex) {
      const babyName = data.babySex === 'menino' ? data.babyNameBoy : data.babyNameGirl;
      prompt += `\n- Sexo do bebê: ${data.babySex === 'menino' ? 'Menino 💙' : 'Menina 💖'}`;
      prompt += `\n- Nome do bebê: ${babyName}`;
      prompt += `\n- A letra deve celebrar a revelação do sexo e incluir o nome ${babyName}`;
    } else if (data.knowsBabySex === 'nao') {
      prompt += `\n- OS PAIS NÃO SABEM O SEXO DO BEBÊ - FORMATO ESPECIAL OBRIGATÓRIO!`;
      prompt += `\n- Nome se for menino: ${data.babyNameBoy || '[Nome do menino]'}`;
      prompt += `\n- Nome se for menina: ${data.babyNameGirl || '[Nome da menina]'}`;
      prompt += `\n
⚠️ INSTRUÇÕES ESPECIAIS PARA CHÁ REVELAÇÃO (SEXO DESCONHECIDO):
A letra DEVE seguir esta estrutura obrigatória:

1. PARTE COMUM (Versos iniciais):
   - Fale sobre a expectativa, a alegria da família, a ansiedade do momento
   - Não mencione o sexo ainda

2. CONTAGEM DE SUSPENSE (Obrigatório):
   - Inclua uma seção [Contagem do Suspense] antes da revelação
   - Use algo como: "Três... Dois... Um... É hora de saber!"
   - Ou: "O coração acelera, a hora chegou... 3, 2, 1!"
   - Crie tensão e emoção para o momento da revelação

3. DOIS FINAIS DIFERENTES (Obrigatório):
   Após a contagem, escreva:

   [Final Versão Menino 💙]
   - Celebre a chegada do menino
   - Use o nome ${data.babyNameBoy || 'do bebê'}
   - Frases como "É um menino!", "Um príncipe chegou!"

   [Final Versão Menina 💖]
   - Celebre a chegada da menina
   - Use o nome ${data.babyNameGirl || 'da bebê'}
   - Frases como "É uma menina!", "Uma princesa chegou!"

IMPORTANTE: Os dois finais devem ter a mesma melodia/ritmo para funcionar com a mesma música!`;
    }
  }

  if (data.qualities && data.qualities.trim()) {
    prompt += `\n\n💝 QUALIDADES DA PESSOA:
${data.qualities}`;
  }

  if (data.memories && data.memories.trim()) {
    prompt += `\n\n🎵 MEMÓRIAS ESPECIAIS:
${data.memories}`;
  }

  if (data.heartMessage && data.heartMessage.trim()) {
    prompt += `\n\n💌 MENSAGEM DO CORAÇÃO:
${data.heartMessage}`;
  }

  if (data.familyNames && data.familyNames.trim()) {
    prompt += `\n\n👨‍👩‍👧‍👦 FAMILIARES PARA MENCIONAR NA MÚSICA:
${data.familyNames}
(Use esses nomes naturalmente na letra quando fizer sentido, até 10 nomes)`;
  }

  prompt += `\n\n🎼 INSTRUÇÕES ADICIONAIS:
- Estilo: ${data.musicStyleLabel} - adapte o vocabulário e ritmo ao estilo
- Ocasião: ${data.occasionLabel} - capture o espírito desse momento
- Faça uma letra emocionante que vai tocar o coração de ${data.honoreeName}
- Inclua detalhes pessoais fornecidos para tornar a música única`;

  return prompt;
}
