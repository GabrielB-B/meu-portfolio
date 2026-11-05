# Imagens dos projetos

Esta pasta está reservada para capturas reais e públicas dos projetos apresentados no portfólio.

## Arquivos em uso

- `siscon-hd.webp`
- `precatorios-pdf-excel-hd.webp`
- `cesta-digital-hd.webp`
- `nat1-rpg-engine.webp`
- `assistente-vampiro-hd.webp`

Preserve a proporção original de cada captura e use WebP lossless quando houver textos pequenos de interface. Antes da publicação, remova ou anonimize nomes, documentos, valores, URLs internas, credenciais e qualquer dado operacional.

## Como substituir um placeholder

Em `index.html`, atualize `data-image-src`, as dimensões originais e `--project-image` no botão `.project-media-image`. A mesma origem alimenta o card e a visualização ampliada:

```html
<button
    class="project-media project-media-image"
    data-project-media
    data-image-src="assets/projects/siscon-hd.webp"
    data-media-width="1773"
    data-media-height="887"
    style="--project-image: url('assets/projects/siscon-hd.webp'); --media-aspect: 1773 / 887"
>
    ...
</button>
```

O CSS usa `contain`, proporção por projeto e zoom sem recortar a imagem-base.

## Capturas públicas candidatas

O repositório `siscon-controle-rpv` mantém capturas sanitizadas em `docs/screenshots/`, incluindo painel inicial, BI operacional e cotas. Elas são as candidatas mais seguras para uma futura seleção, desde que passem por nova revisão visual e de privacidade antes de serem copiadas para esta pasta.
