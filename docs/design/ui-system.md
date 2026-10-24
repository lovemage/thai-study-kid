# Thai Sprout UI system: paper + Korean sticker style

One visual language for every screen. The CSS lives in the last block of `dist/style.css` ("design system"); the drafts it follows are in `midjourney/`. New UI reuses these tokens and families: no new colours, shadows or corner sizes.

## Principles

1. **Paper underneath, stickers on top.** Pages are warm paper. Everything a child touches looks like a sticker: a thick **white die-cut edge**, a soft drop shadow and rounded, chunky shapes.
2. **Puffy, not flat.** Buttons and chips are pills with a white edge, a small bottom ledge and a soft shadow, as if pressed out of soft vinyl.
3. **Calm pastels, one accent.** Pastels for tiles, honey gold for the main action and for "done", coral only for the highlighted letter.
4. **Big and friendly.** Touch targets of at least 48 px (most are 58–80 px). Text never sits directly on a busy texture.

## Tokens

| Token | Value | Use |
|---|---|---|
| `--paper` | `#FAF5E6` | page |
| `--cream` | `#FFFAF0` | sheets (cards, dialogs) |
| `--kraft` | `#F6EEDB` | recessed panels inside a sheet |
| `--ink` / `--ink-soft` / `--muted` | `#364333` / `#6B6A52` / `#77745C` | text |
| `--leaf` / `--leaf-deep` | `#7CB35A` / `#5B8D3F` | green actions, speech bubble on the map |
| `--honey` / `--honey-light` / `--honey-deep` | `#F0C763` / `#F8DC85` / `#C9953A` | primary button, selected toggle, "done" badges, progress |
| `--coral` | `#E0704A` | the target letter in words |
| `--pastel-green/yellow/teal/pink/lilac` | `#B9D993` `#F5D06E` `#95CFCA` `#F6C1B8` `#D6C8EE` | sticker tiles, cycling in this order |
| `--edge` / `--edge-w` | white / 4 px (sheets 6 px, word cards 7 px) | die-cut edge |
| `--shadow-pill` / `--shadow-sheet` / `--shadow-tile` / `--shadow-inset` | see CSS | depth per family |
| `--r-pill` / `--r-sheet` / `--r-tile` / `--r-panel` | 999 / 36 / 26 / 24 px | corners |
| `--outline-text` | 8 white text-shadows + soft shadow | puffy sticker text (big Thai letters, titles on tiles) |
| `--outline-pic` | 4 white drop-shadows + soft shadow | sticker edge around emoji and small pictures |
| `--tex-paper/grain/kraft/sea/dots` | images from `codex-backgrounds.md` | textures; `none` until `<html class="ui-art">` |

SVG art gets its die-cut edge from the filters in `index.html`: `#sticker` (300-unit island drawings) and `#sticker-sm` (80-unit mascot and icons).

## Component families

| # | Family | Look | Members |
|---|---|---|---|
| 1 | Page | paper texture | `body` |
| 2 | Sheet | cream + grain, 6 px white edge, `--shadow-sheet`, 36 px corners | lesson card, sign-in card, dialogs, finish screen, install banner (pill), cheer banner |
| 3 | Panel | kraft, 4 px white edge, inset shadow | writing demo, writing pad (white), picture card, speaking practice |
| 4 | Sticker tile | pastel + grain, white edge, `--shadow-tile` | word cards, alphabet explorer, celebration letters, writing-mode buttons, flip letter card, game cards |
| 5 | Buttons | **primary**: honey pill (Next, install, done). **secondary**: white pill (Map, Previous, Grown-ups, Replay, Listen again, dialog buttons, hint in light honey). **action**: green pill (Listen). **icon**: white circle/squircle (undo, erase, close, speak). **quiet**: green underlined text | `.next` … see CSS |
| 6 | Chips, toggles, progress | white pill chip; selected = honey fill; progress = honey→orange segments on a warm track | language toggle, account chip, step dots, word progress, step number |
| 7 | Bubbles and feedback | white or tinted sticker pills | coach hint, "Go!" bubble, toast (ink pill), "Try again" (pink), cheer banner |
| 8 | Sea map | sea texture + white wave doodles, white-edged frame | island map, island labels and stars, padlock in fog |

States: **selected / done** = pastel green tile or honey fill + the round **gold check badge**. **Playing** = soft honey glow ring. **Locked** = faded and greyscale.

## Illustrations

- Letter pictures: `codex-letters.md` (44 hero WebPs, `dist/assets/letters/`, switch `letterArt` in `data.js`).
- Word cards: `codex-assets.md` (132 sticker WebPs, `dist/assets/vocab/`).
- Textures: `codex-backgrounds.md` (5 tileable WebPs, `dist/assets/ui/`).
- Island residents: each island's four letter pictures, placed on its beach by `islandResidents()` (`islands.js`).
- Mascot, islands, padlock, icons: inline SVG in `app.js` / `islands.js`.
