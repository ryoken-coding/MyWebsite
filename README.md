# Site pessoal — currículo e portefólio

Site estático, em 21 variantes de idioma, para apresentar trabalho de desenvolvimento web e captar projetos freelance à distância. Não procura emprego e não inclui pedidos de candidatura.

## Tecnologia

- **[Astro](https://astro.build) 7**, com saída 100 % estática. Não há base de dados nem lógica de servidor.
- CSS próprio, sem framework: um único ficheiro com tokens de tema, componentes e utilitários.
- Cerca de 12 KB de JavaScript clássico (`public/scripts/site.js`, ~4 KB comprimido) para tema, menu, seletor de idioma, consentimento e formulário.
- Sem bibliotecas de UI, sem fontes externas, sem imagens de stock.

Escolha justificada: 128 páginas (21 idiomas × 6 rotas + 404, sitemap e robots) ficam pré-renderizadas em HTML, com apenas o JS necessário. O conteúdo vive em ficheiros TypeScript separados da apresentação, o que torna a atualização simples sem sacrificar desempenho.

## Arranque local

```bash
npm install
cp .env.example .env      # opcional, para site URL e formulário
npm run dev               # http://localhost:4321
npm run build             # gera /dist + verificações de traduções e links
npm run preview
```

## Estrutura

```
src/
  data/
    site.ts           contactos, currículo, integrações, textos legais pendentes
    projects.ts       cartões e páginas de projeto (slug, estado, tecnologias, links)
    stack.ts          tecnologias agrupadas por família de ferramentas
  i18n/
    locales.ts        as 21 variantes (código de URL, hreflang, direção)
    pt-PT.ts          idioma-fonte; as chaves são partilhadas por todos
    pt-BR.ts … ro.ts  traduções
  layouts/BaseLayout.astro    <head>, SEO, hreflang, header/footer, scripts
  components/                 Header, Footer, ProjectCard, ContactForm, ConsentBanner, Icon
  pages/
    index.astro                 redireciona para o idioma guardado (ou /pt/)
    [lang]/index.astro          página inicial
    [lang]/projects/[slug].astro página de projeto
    [lang]/privacy.astro        privacidade
    404.astro, sitemap.xml.ts, robots.txt.ts
  styles/global.css
public/
  scripts/site.js    comportamento do site
  favicon.svg
```

## Onde editar

### Contactos e currículo — `src/data/site.ts`

| Campo | Efeito |
| --- | --- |
| `contact.email` | link `mailto:` e email no formulário |
| `contact.github` | link para o perfil |
| `contact.whatsapp` | link `https://wa.me/...` |
| `cv.file` | caminho em `/public`, ex. `/curriculo.pdf` |
| `analytics.enabled` | liga/desliga a integração de analytics |

Enquanto um valor estiver vazio, o site mostra um marcador (`[EMAIL]`, `[PERFIL GITHUB]`, …) e não cria um link falso. O nome público pode constar do PDF; o site nunca o apresenta e a verificação de build falha se aparecer em `src/` ou `public/`.

### Projetos — `src/data/projects.ts`

Cada projeto tem `slug`, `titleKey`, `status`, `tech`, `repo`, `demo` e `images`. Os textos ficam em `src/i18n/*.ts` nas chaves `project.<slug>.*`. Para adicionar um projeto:

1. Copie um objeto em `projects` e ajuste `slug`/`titleKey`.
2. Adicione as chaves `project.<slug>.title`, `.summary`, `.context` e `.feature1…n` em **todos** os ficheiros de idioma.
3. `npm run build` — a verificação indica qualquer chave em falta.

O blogue e a loja não tinham um estado indicado no briefing, por isso aparecem como `notSpecified` («Estado não indicado») em vez de lhes atribuir um estado. O RPG em Unity está `inProgress`.

O estado do RPG em C++ está como `pendingConfirmation` até o autor confirmar que terminou. Para o publicar como concluído, acrescente `completed` a `ProjectStatus` em `projects.ts`, ao estilo em `ProjectCard.astro`/página de projeto e a chave `status.completed` em cada idioma.

### Traduções — `src/i18n/`

As chaves de `pt-PT.ts` são a referência. `npm run check:i18n` (e o próprio `build`) falha se:
- faltar uma chave ou houver chaves a mais;
- existir um valor vazio;
- faltarem metadados;
- o nome proibido aparecer no código;
- houver referência a uma API de tradução em tempo de execução.

As 21 variantes são servidas em `/<código>/` com `lang` e `hreflang` corretos. O árabe usa `dir="rtl"` no `<html>`; a folha de estilos espelha ícones direcionais e usa propriedades lógicas (`inset-inline`, `margin-inline`, …). O idioma escolhido fica em `localStorage` e a raiz `/` redireciona para ele.

> As traduções foram escritas manualmente para este projeto, mas **não foram validadas por falantes nativos**. Antes de publicar para um público internacional, vale a pena pedir revisão, sobretudo aos textos legais.

## Formulário de contacto

O formulário pede apenas nome, email e mensagem, valida no cliente (campo obrigatório, formato de email, mínimo de 10 caracteres), tem estado de envio/erro/sucesso e um campo honeypot (`_gotcha`).

Integração prevista: **[Formspree](https://formspree.io)** (plano gratuito, sem base de dados própria, com proteção anti-spam). Passos:

1. Criar conta gratuita e um formulário com o email de destino.
2. Copiar o endpoint (`https://formspree.io/f/xxxxxxxx`).
3. Definir `PUBLIC_FORMSPREE_ENDPOINT` em `.env` e na Vercel.
4. Testar um envio real; confirmar o email de verificação do Formspree.

Sem endpoint configurado, o site **não simula sucesso**: mostra um aviso permanente no cartão e, ao submeter, uma mensagem de erro a remeter para o email direto. Confirme os limites do plano gratuito no momento em que criar a conta.

## Analytics e consentimento

Fornecedor escolhido: **Vercel Web Analytics** (sem cookies, incluído no plano Hobby). O script não é incluído no HTML: só é injetado depois de o visitante aceitar, e nunca em `localhost`. A recusa fica guardada e pode ser alterada em *Privacidade → Preferências de analytics*.

O aviso de consentimento aparece apenas se `analytics.enabled` for `true`. Se mudar de fornecedor, atualize `src/data/site.ts` e os textos de privacidade.

> O analytics é uma integração pendente de ativação no projeto Vercel. Até lá, nada é recolhido. A plataforma pode exigir ativar o produto no dashboard e o script pode ser servido pela própria Vercel — o site já não o carrega sem consentimento.

## Publicação na Vercel (plano gratuito)

1. Importar o repositório na Vercel; o framework é detetado como Astro.
2. Build command `npm run build`, output `dist`.
3. Definir `PUBLIC_SITE_URL` com o endereço `*.vercel.app` atribuído (sem barra final) e `PUBLIC_FORMSPREE_ENDPOINT` quando existir.
4. Sem domínio próprio é usado o endereço gratuito `*.vercel.app`. Não é necessário mudar de plano.

`vercel.json` acrescenta cabeçalhos básicos de segurança. O sitemap, `robots.txt`, `canonical`, Open Graph e `hreflang` usam `PUBLIC_SITE_URL`; sem essa variável, usam o placeholder documentado em `astro.config.mjs` — **atualize-a antes de publicar**.

## Verificações incluídas

- `npm run build`: 128 páginas + verificação de i18n (21 idiomas × 159 chaves, sem valores vazios) + verificação de links, âncoras, `hreflang` e `dir`.
- `npx astro check`: 0 erros.
- `npm run check:site`: links internos, âncoras, metadados por idioma, `dir` do árabe e sitemap contra `/dist`.
- Formulário testado nos estados inválido e “não configurado”; o estado de sucesso depende de credenciais reais.
- Tema: preferência do sistema por omissão, alternância manual persistida, e atualização automática quando a preferência é “sistema”.
- `prefers-reduced-motion`, foco visível, skip link, HTML semântico, rótulos e `aria-live` no formulário.

## Pendentes (não inventados)

- `[EMAIL]`, `[PERFIL GITHUB]`, `[LINK OU NÚMERO WHATSAPP]`
- `[FICHEIRO DO CURRÍCULO PDF]`
- `[LINK DO REPOSITÓRIO OU DEMONSTRAÇÃO DE CADA PROJETO]`
- `[IMAGENS OU CAPTURAS DOS PROJETOS]`
- `[FORNECEDOR DO FORMULÁRIO E CONFIGURAÇÃO]`
- `[FORNECEDOR E CONFIGURAÇÃO DE ANALYTICS]`
- `[DADOS VERDADEIROS PARA A PÁGINA DE PRIVACIDADE]`
- `[ESTADO DO JOGO C++ CONFIRMADO ANTES DA PUBLICAÇÃO]`
- `[DOMÍNIO PRÓPRIO FUTURO, SE ADQUIRIDO]`
