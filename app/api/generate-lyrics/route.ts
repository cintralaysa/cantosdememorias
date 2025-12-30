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
            content: `Você é um compositor musical brasileiro EXCEPCIONAL. Você cria letras que EMOCIONAM PROFUNDAMENTE, fazem as pessoas CHORAREM de alegria e guardam para sempre no coração.

🎯 SUA MISSÃO:
Criar a letra mais BONITA, EMOCIONANTE e TOCANTE que essa família já ouviu. Cada palavra deve ser escolhida com carinho. A música deve fazer quem ouvir sentir um aperto no peito de tanta emoção.

📝 REGRAS DE COMPOSIÇÃO:
1. Escreva em português brasileiro, com linguagem poética mas acessível
2. Use o nome da pessoa homenageada de forma natural e carinhosa
3. Transforme as memórias e qualidades em versos que toquem a alma
4. Adapte o vocabulário e ritmo ao estilo musical escolhido
5. Estrutura: Verso 1, Refrão, Verso 2, Refrão, Ponte (opcional), Refrão Final
6. Entre 150-250 palavras (exceto chá revelação com dois finais)
7. Seja GENUINAMENTE emotivo - faça quem ouvir chorar de emoção
8. Use metáforas bonitas, imagens poéticas, expressões que tocam o coração
9. Evite clichês vazios - cada verso deve ter significado profundo

🍼 REGRA ESPECIAL PARA CHÁ REVELAÇÃO:
- Se os pais JÁ SABEM o sexo: Crie UMA letra única celebrando o bebê com seu nome
- Se os pais NÃO SABEM o sexo: Crie com dois finais (menino/menina) após contagem de suspense

FORMATO DE SAÍDA:
Retorne APENAS a letra da música, sem explicações.
Use quebras de linha para separar as seções.
Coloque o nome da seção em colchetes: [Verso 1], [Refrão], etc.`
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
    prompt += `\n\n🍼 INFORMAÇÕES DO CHÁ REVELAÇÃO:`;

    if (data.knowsBabySex === 'sim' && data.babySex) {
      // CLIENTE JÁ SABE O SEXO - LETRA ÚNICA
      const babyName = data.babySex === 'menino' ? data.babyNameBoy : data.babyNameGirl;
      const emoji = data.babySex === 'menino' ? '💙' : '💖';
      const genero = data.babySex === 'menino' ? 'menino' : 'menina';

      prompt += `\n
✅ OS PAIS JÁ SABEM O SEXO DO BEBÊ!
- É ${genero === 'menino' ? 'um MENINO' : 'uma MENINA'}! ${emoji}
- Nome do bebê: ${babyName}

📝 INSTRUÇÕES (LETRA ÚNICA):
Crie UMA letra completa e emocionante que:
- Celebre a chegada de ${babyName}
- Use o nome "${babyName}" de forma carinhosa ao longo da letra
- Fale sobre a expectativa, o amor, os sonhos para ${genero === 'menino' ? 'ele' : 'ela'}
- Inclua a revelação de forma emocionante: "É ${genero === 'menino' ? 'um menino' : 'uma menina'}!"
- Faça os pais chorarem de emoção
- NÃO faça dois finais - apenas UMA letra completa`;

    } else if (data.knowsBabySex === 'nao') {
      // CLIENTE NÃO SABE O SEXO - DOIS FINAIS
      prompt += `\n
⚠️ OS PAIS NÃO SABEM O SEXO DO BEBÊ - DOIS FINAIS OBRIGATÓRIOS!
- Nome se for menino: ${data.babyNameBoy || '[Nome do menino]'}
- Nome se for menina: ${data.babyNameGirl || '[Nome da menina]'}

📝 INSTRUÇÕES (ESTRUTURA ESPECIAL COM DOIS FINAIS):

1. PARTE COMUM (Versos iniciais):
   - Fale sobre a expectativa, a alegria da família, a ansiedade do momento
   - Crie emoção e suspense - "Quem será que vem aí?"
   - NÃO mencione o sexo ainda

2. [Contagem do Suspense] (OBRIGATÓRIO):
   - Crie tensão máxima para o momento da revelação
   - Exemplo: "O coração dispara, a hora chegou... Três... Dois... Um..."
   - Faça todo mundo prender a respiração!

3. DOIS FINAIS DIFERENTES (OBRIGATÓRIO):

   [Final Versão Menino 💙]
   - "É um menino!" de forma emocionante
   - Use o nome ${data.babyNameBoy}
   - Celebre a chegada do príncipe

   [Final Versão Menina 💖]
   - "É uma menina!" de forma emocionante
   - Use o nome ${data.babyNameGirl}
   - Celebre a chegada da princesa

⚠️ IMPORTANTE: Os dois finais devem ter a mesma estrutura rítmica para funcionar com a mesma melodia!`;
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

  prompt += `\n\n🎼 INSTRUÇÕES FINAIS - FAÇA UMA OBRA-PRIMA:
- Estilo: ${data.musicStyleLabel} - adapte o vocabulário e ritmo ao estilo
- Ocasião: ${data.occasionLabel} - capture toda a emoção desse momento
- Use as memórias e qualidades fornecidas para criar versos ÚNICOS e PESSOAIS
- Cada verso deve ter significado profundo - nada genérico!
- Faça ${data.honoreeName} e toda a família CHORAREM de emoção
- Use metáforas poéticas, imagens bonitas, expressões que tocam a alma
- Esta música será guardada para sempre - faça valer a pena!

🌟 LEMBRE-SE: Você está criando uma memória eterna. Dê o seu melhor!`;

  return prompt;
}
