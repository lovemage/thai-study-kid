# Thai Sprout — Midjourney design drafts

Goal: style drafts for three screens, used as the visual reference for rebuilding the UI in HTML/CSS/SVG.
Midjourney gives the look (shapes, stickers, colour, texture). Text in its images will be gibberish; the real text comes from the app.

## Our parameters

- Product: Thai alphabet adventure for children aged 6–8, used with a grown-up, on **iPad held sideways** (landscape, about 4:3; 1133×744 to 1376×1032).
- Style: **Korean sticker style**: die-cut stickers with thick white borders and a soft drop shadow, chunky rounded shapes, kawaii faces (small dot eyes, blush cheeks), pastel but warm, paper texture, hand-drawn doodles, playful.
- Palette (keep): paper `#FAF7ED`, ink `#364333`, leaf green `#526F43`, sprout green `#8BA668`, soft green `#E4ECCC`, honey gold `#E5BC6B` / `#E5A64A`, coral highlight `#D0663F`, sea blue `#9FD7E6` → `#86C9DC`, blush pink `#F28A9B`.
- Type in the app: DM Sans (Latin), Noto Sans Thai Looped (Thai, looped letterforms), rounded and friendly.
- Mascot: a little two-leaf sprout with a happy face.
- Big touch targets (at least 48 pt), lots of breathing room, no clutter, no ads.

## Prompts (Midjourney v7)

Shared style suffix (appended to every prompt):

```
korean sticker style, die-cut stickers with thick white outline and soft drop shadow, kawaii cute, chunky rounded shapes, pastel warm palette of cream paper #FAF7ED, leaf green #526F43, sprout green #8BA668, honey gold #E5BC6B, coral #D0663F, sea blue #9FD7E6, subtle paper grain, children's educational app UI design, iPad landscape app screen, flat vector illustration, clean layout, high detail --ar 4:3 --v 7 --style raw
```

### 1. Login

```
iPad app sign-in screen for a children's Thai alphabet app called "thai sprout", centered rounded cream card, a cute two-leaf sprout mascot sticker with a happy face above a bold rounded wordmark, a small pill-shaped language toggle "English | 中文" at the top right of the card, two large pill buttons stacked: a white Google sign-in button and a green LINE login button, tiny terms line at the bottom, scattered small stickers around the card edges (Thai letters ก ข ค as stickers, a tiny island, stars, leaves), soft cream background with doodle sparkles, <shared style suffix>
```

### 2. Islands map

```
iPad app adventure map screen, a horizontal sea map in soft blue with gentle wave doodles, eleven small round island stickers along a dotted winding route alternating high and low, the first island colourful and alive (red barn, chicken, tree, flowers, sun), the next islands grey and withered with little rain clouds and a padlock in white fog, a cute sprout mascot sticker with a "Go!" tag on the current island, each island has a white name label pill and gold stars, top bar with a "Map" pill button on the left, the "thai sprout" wordmark in the centre, a round member avatar chip and a small "Grown-ups" link on the right, title text above the map, <shared style suffix>
```

### 3. Word friends (after the matching game)

```
iPad app lesson screen for kids, a big rounded cream lesson card, top row: a round step badge "3" and a title, a speech bubble with the sprout mascot giving a hint, in the middle three large die-cut sticker word cards side by side: a frog, a banana, a red rose, each card has a small category tag on top, a big cute illustration, a Thai word in large rounded letters with the first letter in coral, a small meaning below and a round check-mark badge in the corner when heard, a small progress line "2 / 3" under the cards, bottom bar with a soft "Previous letter" pill on the left and a big honey-gold "Next letter" pill on the right, <shared style suffix>
```

## After the drafts

Pick one variation per screen (or upscale), save it to `docs/design/` and rebuild the UI to match. Image elements the browser cannot draw well from code (sticker illustrations, textures) go to Codex with the instructions in `docs/design/codex-assets.md` (written once the drafts are chosen).
