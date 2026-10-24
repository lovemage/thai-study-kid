# Codex task: paper and background textures

**Thai Sprout** (`D:\thai-sprout`) is a Thai alphabet app for children aged 6–8, used on iPad in landscape. The whole UI follows one design system, **paper + Korean sticker style**: warm paper pages, cream card sheets with thick white die-cut edges, pastel sticker tiles, puffy pill buttons and a blue sea map.

Colour, edges, shadows and shapes are already done in CSS. What CSS cannot do convincingly is **real paper and painted textures**. You are making **five tileable texture images**. The CSS already references them behind one switch. Until the switch is on, CSS-drawn stand-ins show instead.

Do not change any code other than the steps below.

## Style reference

- `midjourney/0_1.png`, `midjourney/0_2.png`: the sea map (hand-drawn white wave doodles on soft watercolour blue).
- `midjourney/u3485956878_iPad_app_lesson_screen_…_3.png`: cream card paper and pastel cards.
- `midjourney/u3485956878_iPad_app_sign-in_screen_…_3.png`: the page paper.
- `docs/design/ui-system.md`: the design tokens. Keep to the colours listed there.

Overall feel: soft, warm, calm, handmade. Light Korean stationery paper (washi / drawing paper), never dirty, crumpled, aged or high-contrast. Textures must stay quiet behind text and pictures. A child should notice "paper", not "pattern".

## The five images

All are **WebP**, **seamlessly tileable** on every edge (check by tiling 3×3; no visible seams or repeating blotches), sRGB, saved in `dist/assets/ui/`.

| File | Size | Alpha | Used for | Description |
|---|---|---|---|---|
| `paper.webp` | 512×512 | no (opaque) | page background behind every screen | Warm cream drawing paper, base colour very close to `#FAF5E6`. Fine fibres and a very soft tooth; variation at most ±4% lightness. No stains, folds or vignettes. |
| `grain.webp` | 512×512 | **yes** | laid over cream sheets, pastel cards and tiles (whatever colour is under it shows through) | **Neutral, transparent** paper grain: soft fibres and specks in warm grey-brown (`#6b5a3a`-ish) at **4–8% opacity**, the rest fully transparent. It must look right on cream `#FFFAF0`, green `#B9D993`, yellow `#F5D06E`, teal `#95CFCA`, pink `#F6C1B8` and lilac `#D6C8EE`. |
| `kraft.webp` | 512×512 | no | recessed panels inside a card (writing demo, picture panel, speaking practice) | Slightly deeper cream kraft paper, base close to `#F6EEDB`, a little more fibre than `paper.webp` but still calm. |
| `sea.webp` | 1024×512 | no | the island map (scrolls sideways, so horizontal tiling matters most) | Soft watercolour sea: top lighter `#B9E3EC`, middle `#9DD3E2`, bottom `#A9DBE7`. Gentle paper grain, a few loose hand-drawn **white** wave doodles (thin rounded strokes, about 3–5 small groups per tile, 50–60% white), no boats, islands or text. Calm enough for island stickers to read clearly on top. |
| `dots.webp` | 256×256 | **yes** | back of the flip letter card and the covered game cards (over pastel green `#B9D993`) | A playful, transparent sticker-paper pattern: small **white** polka dots (about 5 px) in an even offset grid, with an occasional tiny white sparkle/star. Dots about 55% white, everything else transparent. |

Size targets: `paper`, `kraft`, `grain` under 80 KB each; `sea` under 200 KB; `dots` under 30 KB.

## Steps

1. Read the references and `docs/design/ui-system.md`.
2. Make the five files and save them in `dist/assets/ui/` with exactly these names.
3. Check tiling: make a 3×3 tiled preview of each and look for seams; fix before continuing.
4. Switch the textures on: in `dist/index.html`, `dist/terms.html` and `dist/privacy.html` change `<html lang="en">` to `<html lang="en" class="ui-art">` (only add the class; keep everything else).
5. Add the five files to the precache list `SHELL` in `dist/sw.js` (for example `'./assets/ui/paper.webp'`), and increase the number in `const VERSION='sprout-pwa-NN';` by one.
6. Check in the app (`python -m http.server 5173 --directory dist`, open http://127.0.0.1:5173): the sign-in page, the island map, a lesson (Listen, Write, game, word cards) and the Grown-ups panel. Text must stay easy to read, and the paper must not look dirty or busy. Compare with the screens before the switch.
7. Run `npm test` and `npm run check`; both must pass.
8. Report: the five files with sizes, a screenshot of the map and of a lesson with the textures on, and anything you changed from this brief and why.

Put any working files (previews, scripts) in `output/`, not in `dist/`.
