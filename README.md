Game Developer Assignment (PixiJS v7 + TypeScript)

Three small demos implemented per the brief:

- **Ace of Shadows** – 144 sprites stacked like cards. Every 1s, the top card moves to another stack with a 2s tween.
- **Magic Words** – Dialogue renderer that mixes text with custom emoji images, pulling data from the given endpoint (with robust fallback and CORS-safe loading).
- **Phoenix Flame** – Lightweight particle fire effect, capped at 10 sprites on screen.

**Notes on Requirements**

- TypeScript + Pixi v7 – project pinned to pixi.js@7.3.3.

- In-game menu – top-right buttons switch scenes.

- Responsive – auto-resizes to window (desktop + mobile).

- FPS – shown top-left.

- Fullscreen – canvas fills the window.

**Magic Words (data + images)**

Primary source: https://private-624120-softgamesassignment.apiary-mock.com/v2/magicwords.

If the endpoint or CORS fails, it falls back to /src/data/magicwords.json.

Image loading is done via <img> → Pixi Texture (no parser warnings).

Optional CORS proxy can be enabled in MagicWords.ts by setting USE_PROXY_FOR_IMAGES = true.

## Tech
- TypeScript
- PixiJS **v7** (pinned)
- Vite

## Run locally
```bash
npm install
npm run dev
# open the printed localhost URL
