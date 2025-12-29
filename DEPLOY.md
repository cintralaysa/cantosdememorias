# Como fazer deploy na Vercel

## Passo 1: Conecte seu repositório

1. Acesse https://vercel.com
2. Clique em "Add New Project"
3. Importe o repositório do GitHub
4. Clique em "Deploy"

## Passo 2: Configure as variáveis de ambiente

Depois do primeiro deploy, vá para:
https://vercel.com/dashboard -> Seu projeto -> Settings -> Environment Variables

Adicione as seguintes variáveis (pegue os valores no seu painel Stripe e OpenAI):

- `STRIPE_SECRET_KEY` = sua chave secreta do Stripe
- `OPENAI_API_KEY` = sua chave da OpenAI
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = sua chave pública do Stripe
- `NEXT_PUBLIC_APP_URL` = a URL do seu site na Vercel (ex: https://cantosdememorias.vercel.app)

## Passo 3: Redeploy

Depois de adicionar as variáveis, clique em "Redeploy" para aplicar as configurações.

Pronto! Seu site estará online.
