# Portfólio profissional — Gabriel Bomfim Bispo

Site pessoal de Gabriel Bomfim Bispo, desenvolvedor de software graduado em Análise e Desenvolvimento de Sistemas pela Universidade Tiradentes (UNIT). O portfólio apresenta projetos de backend, automação, processamento de documentos, dados e aplicações web construídos para necessidades reais.

## Tecnologias do site

- HTML5 semântico
- CSS3 responsivo, com animações e suporte a `prefers-reduced-motion`
- JavaScript moderno, sem frameworks ou dependências de runtime
- GitHub Pages

## Estrutura

```text
.
├── index.html                 # Conteúdo e estrutura semântica
├── style.css                  # Design system, layout e responsividade
├── script.js                  # Menu, navegação ativa e revelações no scroll
├── robots.txt e sitemap.xml   # Descoberta e indexação do site
├── assets/
│   ├── favicon.svg
│   └── projects/              # Capturas reais dos projetos
├── imagens/                   # Fotografias e arquivos visuais preservados
└── docs/screenshots/          # Evidências visuais desta versão
```

## Executar localmente

O site não exige instalação de dependências. Na raiz do projeto, execute um servidor HTTP simples:

```powershell
python -m http.server 8000
```

Depois acesse `http://localhost:8000`. Abrir o `index.html` diretamente também funciona, mas um servidor local reproduz melhor o comportamento do GitHub Pages.

## Atualizar projetos

1. Edite o artigo correspondente em `index.html` dentro de `.project-list`.
2. Mantenha status, descrição e tecnologias coerentes com o repositório público.
3. Use links absolutos somente para destinos externos; recursos do site devem usar caminhos relativos.
4. Para adicionar um cartão, copie a estrutura de `.project-card` e atualize título, status, descrição, tags e URL.
5. Verifique o resultado em desktop, tablet e celular.

Evite transformar funcionalidades planejadas em entregas concluídas. Revise o README e o código do projeto antes de atualizar seu estado no portfólio.

## Adicionar imagens reais

As instruções completas estão em [`assets/projects/README.md`](assets/projects/README.md). Em resumo:

- use proporção 16:10 e formato WebP otimizado;
- prefira pelo menos `1280 × 800 px`;
- escreva um texto alternativo que descreva o conteúdo útil da tela;
- use `loading="lazy"` e dimensões explícitas;
- remova dados pessoais, operacionais, credenciais e endereços internos.

Enquanto uma captura real não estiver disponível, o cartão mantém um placeholder tipográfico neutro, sem representar uma interface fictícia.

## Manutenção e validação

Antes de publicar:

1. valide HTML, CSS e JavaScript;
2. teste todos os links e recursos estáticos;
3. verifique o console do navegador;
4. navegue apenas com teclado;
5. teste `prefers-reduced-motion`;
6. revise as larguras de 1920, 1440, 1366, 768, 390 e 360 px;
7. confirme que não há informações profissionais desatualizadas.

## Publicação no GitHub Pages

O site usa apenas caminhos relativos e está preparado para a rota `/meu-portfolio/`.

Após revisar e aprovar uma branch de alteração:

1. integre a branch na `main` pelo fluxo Git adotado no repositório;
2. em **Settings → Pages**, selecione **Deploy from a branch**;
3. escolha a branch `main` e a pasta `/ (root)`;
4. aguarde o workflow do Pages finalizar;
5. valide `https://gabrielb-b.github.io/meu-portfolio/` em desktop e mobile.

Nenhuma publicação deve ser feita sem revisão do conteúdo e aprovação expressa do proprietário.

## Projetos apresentados

- [SISCON Controle de RPVs](https://github.com/GabrielB-B/siscon-controle-rpv)
- [Precatórios PDF to Excel](https://github.com/GabrielB-B/precatorios-pdf-to-excel)
- [Cesta Digital](https://github.com/GabrielB-B/Cesta-Digital)
- [Nat 1 RPG Engine](https://github.com/GabrielB-B/nat1-rpg-engine)
- [Assistente Vampiro](https://github.com/GabrielB-B/Assistente_Vampiro)
