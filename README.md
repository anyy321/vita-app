# Vita — App Web

Este projeto foi gerado a partir do seu `vita-app.jsx` para rodar como um **app web de verdade** (fora do ambiente do Claude), instalável no celular como PWA.

## O que foi ajustado no código original

- **`window.storage`** (API exclusiva do ambiente de artifacts do Claude) foi substituída por um "polyfill" em `src/storage-polyfill.js`, que implementa a mesma API usando `localStorage` do navegador. Nenhuma linha do `App.jsx` precisou ser alterada — os dados (diário, vídeos, ebooks) agora ficam salvos no navegador da pessoa.
- Adicionado suporte a **Tailwind CSS** (o app já usava classes Tailwind).
- Adicionado suporte a **PWA** (Progressive Web App) — instalável direto do navegador, sem loja de apps.
- `speechSynthesis` e `window.open` já são APIs padrão do navegador — funcionam sem alteração.

## Rodar localmente

Você vai precisar do [Node.js](https://nodejs.org) instalado (versão 18+).

```bash
npm install
npm run dev
```

Abra o endereço que aparecer no terminal (normalmente `http://localhost:5173`).

## Gerar a versão de produção

```bash
npm run build
```

Isso cria a pasta `dist/` com os arquivos prontos para publicar.

## Deploy (hospedagem gratuita)

### Opção 1: Vercel (mais simples)
1. Crie uma conta em [vercel.com](https://vercel.com)
2. Instale a CLI: `npm i -g vercel`
3. Rode `vercel` dentro da pasta do projeto e siga as instruções

### Opção 2: Netlify
1. Crie uma conta em [netlify.com](https://netlify.com)
2. Arraste a pasta `dist/` (depois de rodar `npm run build`) para o Netlify Drop: https://app.netlify.com/drop

### Opção 3: GitHub Pages
1. Suba este projeto para um repositório no GitHub
2. Configure o deploy via GitHub Actions apontando para a pasta `dist/` gerada pelo build

## Ícones do app (PWA)

Os arquivos `public/icon-192.png` e `public/icon-512.png` são placeholders simples (letra "V"). Troque por ícones reais do Vita antes de publicar — qualquer PNG quadrado nesses tamanhos funciona.

## Observação sobre dados salvos

Como os dados agora usam `localStorage`, eles ficam **só no navegador/dispositivo de cada pessoa** — não são sincronizados entre aparelhos. Se no futuro você quiser sincronizar entre dispositivos, será necessário um backend (ex: Supabase, Firebase) no lugar do `localStorage`.
