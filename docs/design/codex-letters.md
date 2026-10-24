# Codex task: the 44 letter pictures

**Thai Sprout** (`D:\thai-sprout`) teaches the 44 Thai consonants to children aged 6–8 on iPad (landscape). Each consonant has a traditional picture word (ก ไก่ "chicken", ข ไข่ "egg" …). That picture is the first thing a child sees on a letter's page, and it appears again in the matching game. Today these are simple built-in drawings, and some letters wrongly share one (ฅ and ด both show the same child, ฑ and ญ the same woman, ษ and ฒ the same old man).

You are making **one illustration per letter, 44 in total**, in the app's paper + Korean sticker style. Only two code lines change (steps 4–5).

## Style reference

- `midjourney/u3485956878_iPad_app_lesson_screen_…_3.png`: target look (sticker illustrations on pastel cards).
- `dist/assets/vocab/*.webp`: the 132 word illustrations already made for this app. **Match their style exactly** (same rendering, outline, shading and palette) so the whole app feels like one sticker book. `output/vocab/contact-*.png` shows them at a glance.
- `docs/design/ui-system.md`: colours and rules.

Rules:

- Korean sticker / kawaii, chunky rounded shapes, soft clay-like shading, friendly faces on animals.
- **Thick white die-cut border** around the subject, no drop shadow (the app adds one), **transparent background**.
- **One clear subject**, centred, facing slightly toward the viewer, recognisable at a glance by a 6-year-old. **No text, letters or numbers.**
- These are the "hero" pictures of each letter, a little richer than the word stickers. Where a subject also appears as a word card (ลิง monkey, ยักษ์ giant, เสือ tiger, ปลา fish), draw a fresh picture; it does not have to match the word card.
- Thai cultural subjects must be **authentic and respectful**: ชฎา crown, ฉิ่ง cymbals, พาน tray, ศาลา pavilion, สำเภา junk, เณร novice monk, ฤๅษี hermit, มณโฑ (Ramakien queen), ยักษ์ temple guardian. Nothing scary (giant, tiger, snake are friendly), no weapons (the soldier salutes; the goad is a plain bamboo stick).

## Files

- **WebP**, **768 × 640 px** (the picture area is landscape), **transparent background**, sRGB, quality about 85, under 90 KB each.
- Save to `dist/assets/letters/` named by letter number: `1.webp` … `44.webp` (see table).
- The table is generated from `dist/data.js`, the source of truth. If something does not match, follow `data.js` and report it.

## Steps

1. Study the references, especially `dist/assets/vocab/` for style consistency.
2. Make a test batch of 4 (`1`, `9`, `17`, `32`), save them, switch on (step 4) and check them in the app: run `python -m http.server 5173 --directory dist`, open http://127.0.0.1:5173, sign in, open a letter. The picture appears on the left of the Listen page and above the cards in the game. Adjust until they sit well, then make the rest.
3. Produce all 44.
4. In `dist/data.js`, change `const letterArt=false;` to `const letterArt=true;`. Any missing file falls back to the old drawing automatically.
5. In `dist/sw.js`, increase the number in `const VERSION='sprout-pwa-NN';` by one.
6. Run `npm test` and `npm run check`; both must pass. Check `dist/assets/letters/` has exactly 44 `.webp` files named `1.webp`–`44.webp`.
7. Report: the files and total size, a contact sheet of all 44 labelled with letter and word (save it in `output/letters/`), and any subject you drew differently from the hint and why.

Put working files in `output/letters/`, not in `dist/`.

## The 44 pictures

| File | Letter | Thai word | English | 中文 | What to draw |
|---|---|---|---|---|---|
| `1.webp` | ก | ไก่ | chicken | 雞 | a Thai farmyard chicken (hen) standing |
| `2.webp` | ข | ไข่ | egg | 蛋 | a single egg (the picture for ข; keep it different from a breakfast plate) |
| `3.webp` | ฃ | ขวด | bottle | 瓶子 | a glass bottle |
| `4.webp` | ค | ควาย | buffalo | 水牛 | a Thai water buffalo with curved horns |
| `5.webp` | ฅ | คน | person | 人 | one friendly person (an adult, waving) |
| `6.webp` | ฆ | ระฆัง | bell | 鐘 | a Thai temple bell (ระฆัง) hanging from a small frame |
| `7.webp` | ง | งู | snake | 蛇 | a friendly green snake, coiled |
| `8.webp` | จ | จาน | plate | 盤子 | an empty round plate |
| `9.webp` | ฉ | ฉิ่ง | small cymbals | 小鈸 | a pair of ching: two small cup-shaped Thai cymbals joined by a cord |
| `10.webp` | ช | ช้าง | elephant | 大象 | a Thai elephant |
| `11.webp` | ซ | โซ่ | chain | 鏈條 | a short metal chain |
| `12.webp` | ฌ | เฌอ | tree | 樹 | a leafy tree (เฌอ is an old word for tree) |
| `13.webp` | ญ | หญิง | woman | 女性 | a Thai woman (young adult, simple modern clothes) |
| `14.webp` | ฎ | ชฎา | headdress | 傳統頭冠 | a golden chada: a tall pointed Thai classical dance crown |
| `15.webp` | ฏ | ปฏัก | goad | 趕牛棒 | a pa-tak goad: a long bamboo stick a farmer uses to guide cattle (no sharp metal point, child-friendly) |
| `16.webp` | ฐ | ฐาน | pedestal | 底座 | a Thai stepped pedestal base (ฐาน), like the stand under a Buddha image or vase, shown empty |
| `17.webp` | ฑ | มณโฑ | Montho | 蒙托（角色名） | Montho (มณโฑ), the queen from the Ramakien: a Thai classical lady in a golden crown and traditional costume, gentle smile |
| `18.webp` | ฒ | ผู้เฒ่า | elder | 長者 | a kind elderly Thai man with a walking stick |
| `19.webp` | ณ | เณร | novice monk | 小沙彌 | a young novice monk (เณร), a boy in a saffron robe, shaved head, hands together, respectful |
| `20.webp` | ด | เด็ก | child | 孩子 | a happy small child |
| `21.webp` | ต | เต่า | turtle | 烏龜 | a turtle |
| `22.webp` | ถ | ถุง | bag | 袋子 | a cloth shopping bag |
| `23.webp` | ท | ทหาร | soldier | 士兵 | a friendly Thai soldier saluting, no weapon |
| `24.webp` | ธ | ธง | flag | 旗子 | a plain waving flag on a pole |
| `25.webp` | น | หนู | mouse | 老鼠 | a small mouse |
| `26.webp` | บ | ใบไม้ | leaf | 葉子 | a single green leaf |
| `27.webp` | ป | ปลา | fish | 魚 | a fish |
| `28.webp` | ผ | ผึ้ง | bee | 蜜蜂 | a bee |
| `29.webp` | ฝ | ฝา | lid | 蓋子 | a pot lid (ฝา) with a knob, shown on its own |
| `30.webp` | พ | พาน | tray with a pedestal | 高腳托盤 | a phan (พาน): a Thai footed tray with a flower offering |
| `31.webp` | ฟ | ฟัน | tooth | 牙齒 | a single tooth (a cute baby tooth) |
| `32.webp` | ภ | สำเภา | sailing ship | 帆船 | a sam-phao: a Chinese-style junk sailing ship with batten sails |
| `33.webp` | ม | ม้า | horse | 馬 | a horse |
| `34.webp` | ย | ยักษ์ | giant | 巨人 | a yak (ยักษ์): a Thai temple guardian giant with a crown, friendly and not scary |
| `35.webp` | ร | เรือ | boat | 船 | a Thai long-tail boat |
| `36.webp` | ล | ลิง | monkey | 猴子 | a monkey |
| `37.webp` | ว | แหวน | ring | 戒指 | a ring with a small gem |
| `38.webp` | ศ | ศาลา | pavilion | 涼亭 | a sala (ศาลา): an open Thai pavilion with a tiered roof |
| `39.webp` | ษ | ฤๅษี | hermit | 隱士 | a ruesi (ฤๅษี): a Thai hermit sage with a white beard and a leopard-print cloth hat, kind |
| `40.webp` | ส | เสือ | tiger | 老虎 | a tiger |
| `41.webp` | ห | หีบ | chest | 箱子 | a wooden treasure chest (หีบ), closed |
| `42.webp` | ฬ | จุฬา | star-shaped kite | 星形風箏 | a chula (จุฬา): a large five-pointed star-shaped Thai kite |
| `43.webp` | อ | อ่าง | basin | 盆子 | a round washing basin (อ่าง) |
| `44.webp` | ฮ | นกฮูก | owl | 貓頭鷹 | an owl |
