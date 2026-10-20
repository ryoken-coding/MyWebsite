# Site pessoal — currículo e portefólio

Site estático para apresentar projetos de desenvolvimento web e trabalho remoto. Inclui 21 variantes de idioma; não procura emprego nem inclui pedidos de candidatura.

## Tecnologia

- **Astro 7** com geração estática; não há base de dados nem lógica de servidor própria.
- CSS próprio, com tokens de tema, componentes e utilitários.
- JavaScript clássico em `public/scripts/site.js` para tema, navegação, seletor de idioma e integrações opcionais.
- Sem fontes externas, imagens de stock ou bibliotecas de interface.

## Arranque local

```bash
npm ci
cp .env.example .env  # opcional; os valores permanecem vazios até serem configurados
npm run dev            # http://localhost:4321
npm run check
npm run build          # gera /dist e executa as verificações de conteúdo e ligações
npm run preview
```

É possível compilar sem configurar domínio, contactos, CV, formulário ou analytics. Nesses casos, o site omite metadados absolutos e ações que não tenham um destino real.

## Estrutura

```text
src/
  data/site.ts                 origem pública, contactos, CV, formulário e privacidade
  data/projects.ts             dados partilhados dos projetos e recursos opcionais
  data/stack.ts                tecnologias agrupadas por área
  i18n/                        21 dicionários e metadados de idioma
  layouts/BaseLayout.astro     head, SEO, header/footer e scripts comuns
  components/                  header, footer, cartões, formulário e ícones
  pages/
    index.astro                encaminha para o idioma guardado ou /pt/
    [lang]/index.astro         página inicial de cada idioma
    [lang]/projects/[slug].astro páginas de projeto
    [lang]/privacy.astro       explicação da configuração de privacidade
    404.astro                  página de erro com escolha de idioma
    sitemap.xml.ts, robots.txt.ts
  styles/global.css
public/
  scripts/site.js
  favicon.svg
```

Idiomas servidos: `pt-PT`, `pt-BR`, `en`, `es`, `fr`, `zh-CN`, `zh-TW`, `ru`, `uk`, `it`, `de`, `pl`, `hi`, `ko`, `ja`, `ar`, `bg`, `nl`, `sv`, `el` e `ro`.

## Configuração e destinos

### Origem pública e SEO

Defina `PUBLIC_SITE_URL` apenas quando existir uma origem pública verdadeira, sem barra final. Enquanto estiver vazia, o site não inventa um domínio: omite `canonical`, Open Graph URL e ligações `hreflang` absolutas; o sitemap fica sem URLs e `robots.txt` não anuncia um sitemap.

### Contactos, currículo e projetos

Os contactos e o caminho do CV são configurados em `src/data/site.ts`. Os endereços de repositório, demonstração e imagens ficam em `src/data/projects.ts`. Os valores estão vazios quando o destino ou recurso não foi fornecido. Um valor vazio oculta a ligação, o botão, a secção ou o cartão associado; não é substituído por um marcador ou endereço fictício.

O site não mostra estados de projeto não confirmados. O conteúdo e as tecnologias de cada projeto são publicados apenas a partir dos dados mantidos nos ficheiros do repositório.

### Formulário

O formulário só aparece quando `PUBLIC_FORMSPREE_ENDPOINT` contém o endpoint real de um formulário criado e verificado pelo respetivo fornecedor. Sem endpoint, o formulário, a secção de contacto e os respetivos botões de navegação não são apresentados. A configuração de um fornecedor externo implica atualizar a informação de privacidade e testar o envio real antes da publicação.

### Analytics e privacidade

A integração de analytics está desativada em `src/data/site.ts`; por isso não são carregados scripts de analytics nem é mostrado o aviso de consentimento. A página de privacidade descreve a configuração atualmente ativa: formulário e analytics indisponíveis, sem mensagens recolhidas pelo site, com preferências de idioma e tema guardadas localmente no navegador.

A configuração da integração de alojamento existente em `vercel.json` é técnica e não acrescenta atribuição, badge ou logótipo visível no site.

## Traduções

As chaves de `src/i18n/pt-PT.ts` definem a estrutura comum. `npm run check:i18n` (também executado no build) falha se faltar uma chave, houver chaves extra, valores vazios, metadados em falta ou conteúdo proibido no código público.

A consulta de traduções é estrita: locale desconhecido ou tradução vazia provoca erro, em vez de recorrer silenciosamente a outro idioma. O árabe usa `dir="rtl"`; emails, nomes de tecnologias e outros fragmentos LTR são isolados da direção do texto. A raiz `/` continua utilizável sem JavaScript.

As traduções foram escritas manualmente, mas **não foram revistas por falantes nativos**. Textos legais e formulações que exijam precisão cultural ou jurídica devem ser revistos por pessoas qualificadas antes de publicação internacional.

## Verificações

- `npm run check`: valida tipos e componentes Astro.
- `npm run check:i18n`: compara a estrutura e os valores dos 21 dicionários.
- `npm run build`: gera as páginas e executa as verificações de idioma, ligações internas, âncoras, metadados, direção RTL, sitemap e conteúdo emitido.
- `npm run check:site`: volta a verificar a saída existente em `/dist`.

A geração do site não depende de serviços externos. O formulário depende de um fornecedor externo apenas depois de um endpoint real ser configurado; analytics permanece desligado. Não foi feita revisão por falantes nativos nem validação de envios para serviços externos.

## Informação ainda não fornecida

Antes de ativar ações públicas ou metadados absolutos, é necessário receber/configurar destinos verdadeiros: email ou outros contactos, ficheiro de currículo, links e imagens dos projetos, endpoint de formulário e origem pública. Não foram inventados nomes, dados legais, links ou ficheiros para preencher essas lacunas.
