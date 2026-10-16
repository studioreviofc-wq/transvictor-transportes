# Transvictor Transportes — Landing page

Página estática (HTML + CSS + JS vanilla), sem build.

```
index.html   style.css   script.js   _headers
assets/  globe.avif · globe.webp · globe-900.webp · logo-transvictor.svg · favicon.svg
```

## Rodar localmente
Na pasta do projeto: `python3 -m http.server 8080` e abra http://localhost:8080

## Publicar no Cloudflare Pages
1. dash.cloudflare.com → Workers & Pages → Create → Pages → **Upload assets** (ou conectar o repositório Git).
2. Envie a pasta inteira. Build command: *(vazio)* · Output directory: `/`.
3. Em **Custom domains**, aponte o domínio (ex.: transvictor.com.br).

Via CLI: `npx wrangler pages deploy . --project-name=transvictor`

## Trocar o logotipo
Substitua `assets/logo-transvictor.svg` pelo arquivo original (mesmo nome) — proporção atual 402×88.

## Coordenadas do mapa
Globo e rota usam o mesmo viewBox 1000×1000 (projeção ortográfica, rotação [80, -8]).
Brasil = (705.7, 639.6) · EUA = (399.3, 274.6).
