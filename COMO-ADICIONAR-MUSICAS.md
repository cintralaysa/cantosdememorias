# Como Adicionar Músicas e Fotos ao Portfólio

## Passo 1: Preparar os arquivos

### Músicas (MP3)
1. Baixe o MP3 da música do Suno ou de onde você criou
2. Renomeie o arquivo para algo simples, sem espaços ou acentos
   - Exemplo: `mae-porto-seguro.mp3`
3. Coloque na pasta: `public/portfolio/audios/`

### Fotos (JPG/PNG)
1. Use uma foto relacionada à música (pode ser do cliente, da ocasião, etc.)
2. Tamanho recomendado: 800x800 pixels (quadrado)
3. Renomeie sem espaços ou acentos
   - Exemplo: `mae-porto-seguro.jpg`
4. Coloque na pasta: `public/portfolio/fotos/`

---

## Passo 2: Adicionar no código

Abra o arquivo: `lib/portfolio.ts`

Encontre a lista `PORTFOLIO_ITEMS` e adicione um novo item:

```typescript
{
  id: '4',                                    // Número único
  type: 'music',                              // 'music' ou 'voiceover'
  title: 'Nome da Música',                    // Título que aparece no site
  description: 'Descrição breve da música',   // Texto pequeno
  occasion: 'Aniversário',                    // Ocasião (Aniversário, Casamento, etc.)
  audioUrl: '/portfolio/audios/nome-do-arquivo.mp3',  // Caminho do MP3
  imageUrl: '/portfolio/fotos/nome-da-foto.jpg',       // Caminho da foto (opcional)
  clientName: 'Nome do Cliente',              // Nome do cliente (opcional)
  relationship: 'Filha → Mãe',                // Relação (opcional)
  createdAt: '2024-12-28',                    // Data (YYYY-MM-DD)
  featured: true,                             // true = aparece em destaque
},
```

---

## Exemplo Completo

Se você fez uma música chamada "Amor Eterno" para um casamento:

1. **Salve o MP3** como: `public/portfolio/audios/amor-eterno.mp3`
2. **Salve a foto** como: `public/portfolio/fotos/amor-eterno.jpg`
3. **Adicione no código**:

```typescript
{
  id: '5',
  type: 'music',
  title: 'Amor Eterno',
  description: 'Música especial para cerimônia de casamento',
  occasion: 'Casamento',
  audioUrl: '/portfolio/audios/amor-eterno.mp3',
  imageUrl: '/portfolio/fotos/amor-eterno.jpg',
  clientName: 'Maria e João',
  relationship: 'Noivos',
  createdAt: '2024-12-28',
  featured: true,
},
```

---

## Usando links externos (Suno, etc.)

Se preferir não baixar o MP3, você pode usar o link direto:

```typescript
{
  id: '6',
  type: 'music',
  title: 'Minha Música',
  description: 'Descrição',
  occasion: 'Aniversário',
  audioUrl: 'https://cdn1.suno.ai/seu-arquivo.mp3',  // Link direto do MP3
  imageUrl: 'https://cdn2.suno.ai/image_seu-arquivo.jpeg',  // Link da imagem
  clientName: 'Cliente',
  createdAt: '2024-12-28',
  featured: false,
},
```

### Como pegar o link do Suno:
1. Abra a música no Suno
2. Clique com botão direito no player → "Copiar endereço do áudio"
3. Cole como `audioUrl`

---

## Dicas

- **IDs únicos**: Cada item precisa de um `id` diferente
- **featured**: Coloque `true` nos melhores trabalhos para destacar
- **Tipos**: Use `'music'` para músicas e `'voiceover'` para locuções
- **Ocasiões sugeridas**: Aniversário, Casamento, Dia das Mães, Dia dos Pais, Formatura, Natal, Declaração de Amor, Homenagem

---

## Estrutura de pastas

```
app cantos cb/
├── public/
│   └── portfolio/
│       ├── audios/        ← Coloque os MP3 aqui
│       │   ├── musica1.mp3
│       │   └── musica2.mp3
│       └── fotos/         ← Coloque as fotos aqui
│           ├── musica1.jpg
│           └── musica2.jpg
└── lib/
    └── portfolio.ts       ← Edite este arquivo para adicionar itens
```
