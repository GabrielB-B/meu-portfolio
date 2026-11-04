# Imagens dos projetos

Esta pasta está reservada para capturas reais e públicas dos projetos apresentados no portfólio.

## Convenção sugerida

- `siscon.webp`
- `precatorios-pdf-excel.webp`
- `cesta-digital.webp`
- `nat1-rpg-engine.webp`
- `assistente-vampiro.webp`

Use imagens em proporção **16:10**, preferencialmente com pelo menos `1280 × 800 px`, formato WebP e tamanho otimizado. Antes da publicação, remova ou anonimize nomes, documentos, valores, URLs internas, credenciais e qualquer dado operacional.

## Como substituir um placeholder

Em `index.html`, localize o bloco `.project-media` do projeto desejado e insira a imagem como primeiro elemento:

```html
<img
    class="project-screenshot"
    src="assets/projects/siscon.webp"
    alt="Painel inicial do SISCON com dados demonstrativos"
    width="1280"
    height="800"
    loading="lazy"
    decoding="async"
>
```

Depois, adicione ao fim do bloco correspondente em `style.css`:

```css
.project-screenshot {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.project-media:has(.project-screenshot) > :not(.project-screenshot, .media-overlay) {
    display: none;
}
```

O overlay e as proporções do cartão continuarão funcionando sem reconstruir o layout.

## Capturas públicas candidatas

O repositório `siscon-controle-rpv` mantém capturas sanitizadas em `docs/screenshots/`, incluindo painel inicial, BI operacional e cotas. Elas são as candidatas mais seguras para uma futura seleção, desde que passem por nova revisão visual e de privacidade antes de serem copiadas para esta pasta.
