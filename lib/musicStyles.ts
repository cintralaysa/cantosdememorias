// Mapeamento de estilos do formulário → prompts de estilo para o Suno AI
// Os valores de 'value' correspondem aos usados em SimpleBookingForm.tsx

export const SUNO_STYLE_MAP: Record<string, string> = {
  'romantico': 'Romantic Ballad, Acoustic Guitar, Emotional, Soft Vocals, Brazilian',
  'sertanejo': 'Brazilian Sertanejo, Country, Acoustic Guitar, Romantic',
  'mpb': 'MPB, Brazilian Popular Music, Bossa Nova, Acoustic',
  'pop': 'Pop, Upbeat, Modern, Catchy Melody, Brazilian Portuguese',
  'gospel': 'Gospel, Worship, Inspirational, Piano, Emotional',
  'forro': 'Forró, Northeast Brazilian, Accordion, Zabumba, Festive',
  'pagode': 'Pagode, Samba, Brazilian Percussion, Party, Cavaco',
  'samba': 'Samba, Brazilian, Percussion, Pandeiro, Festive',
  'rock': 'Rock Ballad, Electric Guitar, Emotional, Power Ballad',
  'bossa-nova': 'Bossa Nova, Jazz, Acoustic Guitar, Smooth, Brazilian',
  'reggae': 'Reggae, Laid-back, Tropical, Groove, Positive Vibes',
  'infantil': 'Children Music, Playful, Happy, Fun, Acoustic, Simple Melody',
  'classico': 'Classical, Orchestra, Piano, Elegant, Emotional',
  'funk-melody': 'Funk Melody, Brazilian Funk, Romantic Funk, R&B, Groove',
  'eletronico': 'Electronic, Synthpop, EDM, Modern, Dance, Emotional',
};

// Retorna o prompt de estilo para o Suno com base no valor do formulário
export function getSunoStylePrompt(styleValue: string): string {
  return SUNO_STYLE_MAP[styleValue] || 'Pop, Acoustic, Emotional, Brazilian Portuguese';
}

// Gera o título da música baseado no homenageado e ocasião
export function generateSongTitle(honoreeName: string, occasion: string): string {
  const titleMap: Record<string, string> = {
    'aniversario': `Parabéns ${honoreeName}`,
    'casamento': `Nosso Amor, ${honoreeName}`,
    'dia-das-maes': `Para Você, ${honoreeName}`,
    'dia-dos-pais': `Meu Herói, ${honoreeName}`,
    'dia-dos-namorados': `Meu Amor, ${honoreeName}`,
    'cha-revelacao': `Bem-Vindo ao Mundo`,
    'formatura': `Conquista de ${honoreeName}`,
    'bodas': `Nossa História, ${honoreeName}`,
    'mesversario': `Meses de Amor, ${honoreeName}`,
    'homenagem-postuma': `Saudade de ${honoreeName}`,
    'outro': `Para ${honoreeName}`,
  };

  return titleMap[occasion] || `Para ${honoreeName}`;
}
