# Codex task: sticker illustrations for the word cards

You are adding 132 small illustrations to **Thai Sprout** (`D:\thai-sprout`), a Thai alphabet app for children aged 6–8 that runs on iPad in landscape. After the matching game, each letter shows three everyday words as cards. The cards currently use emoji. Your job is to replace them with illustrations in the app's **Korean sticker style**.

Everything else (layout, card colours, text, sound) is already built. Do not change any code except the one switch in step 4 and the version bump in step 5.

## Style reference

Open these before you start; the illustrations must look like they belong in them:

- `midjourney/u3485956878_iPad_app_lesson_screen_for_kids_a_big_rounded_cre_…_3.png`: the word cards (frog, banana, rose). **This is the target look.**
- `midjourney/0_1.png`, `midjourney/0_2.png`: the island map.
- `midjourney/u3485956878_iPad_app_sign-in_screen_for_a_childrens_Thai_alph_…_3.png`: the mascot and stickers.

Style rules:

- Korean sticker / kawaii: chunky rounded shapes, soft clay-like shading with a gentle top highlight, small dot eyes and blush cheeks on animals and food where it fits, friendly and calm.
- **Thick white die-cut border** around the whole subject (about 4% of the image width), like a vinyl sticker. No drop shadow; the app adds one.
- Warm pastel palette that sits well on the card colours: green `#B9D993`, yellow `#F5D06E`, teal `#95CFCA`. Avoid pure black outlines; use darker shades of each colour.
- One subject per image, centred, filling about 80% of the canvas, facing slightly toward the viewer.
- **No text, letters, numbers or logos** in the picture. The Thai word is printed by the app.
- People: friendly, simple, diverse; Thai cultural items (ชฎา crown, มณฑป pavilion, ซาลาเปา bun, Thai sweets) must look authentically Thai.
- Child-safe: nothing scary. The "giant" (ยักษ์) is a cute Thai temple guardian, and the "tiger" (พยัคฆ์) is a smiling storybook tiger.

## Files

- Format **WebP**, **512 × 512 px**, **transparent background** (alpha), sRGB, quality about 85. Aim for under 60 KB each.
- Save to `dist/assets/vocab/` with the exact names in the table below: `<letter number>-<card 1..3>.webp`, for example `1-1.webp`.
- The table is generated from `dist/vocab.js`, which is the source of truth. If you notice a mismatch, follow `vocab.js` and report it.

## Steps

1. Read the style reference images and this brief.
2. Make a test batch of the first 6 (`1-1` … `2-3`), put them in `dist/assets/vocab/`, and check them in the app: run `npx netlify dev` or `python -m http.server 5173 --directory dist`, sign in, set `vocabArt` to `true` (step 4), and finish a letter's game to see the cards. Adjust until they match the reference, then do the rest.
3. Produce all 132 files from the table.
4. In `dist/vocab.js`, change `const vocabArt=false;` to `const vocabArt=true;`. The cards then show the pictures; any missing file falls back to the emoji automatically.
5. In `dist/sw.js`, increase the number in `const VERSION='sprout-pwa-NN';` by one, so installed iPads pick up the change.
6. Run `npm test` and `npm run check`; both must pass. Check that `dist/assets/vocab/` contains exactly 132 `.webp` files with the names below.
7. Report: the list of files, total size, any word you drew differently from the hint and why, and any `vocab.js` mismatch.

## The 132 illustrations

"What to draw" is a hint; the English meaning is what the child must recognise.

| File | Letter | Thai | English | 中文 | What to draw |
|---|---|---|---|---|---|
| `1-1.webp` | ก | กบ | frog | 青蛙 | a cute frog |
| `1-2.webp` | ก | กล้วย | banana | 香蕉 | a cute banana |
| `1-3.webp` | ก | กุหลาบ | rose | 玫瑰 | a cute rose |
| `2-1.webp` | ข | ข้าว | rice | 米飯 | a bowl of steamed white rice |
| `2-2.webp` | ข | ขา | leg | 腿 | a child's leg with a striped sock and sneaker |
| `2-3.webp` | ข | ขนม | sweets | 點心 | colourful Thai sweets on a plate |
| `3-1.webp` | ฃ | ขวาน | axe | 斧頭 | a cute axe |
| `3-2.webp` | ฃ | ขนมปัง | bread | 麵包 | a loaf of bread |
| `3-3.webp` | ฃ | ข้าวโพด | corn | 玉米 | an ear of corn |
| `4-1.webp` | ค | แครอท | carrot | 紅蘿蔔 | a cute carrot |
| `4-2.webp` | ค | คุกกี้ | cookie | 餅乾 | a cute cookie |
| `4-3.webp` | ค | ค้างคาว | bat | 蝙蝠 | a cute bat |
| `5-1.webp` | ฅ | คอมพิวเตอร์ | computer | 電腦 | a cute computer |
| `5-2.webp` | ฅ | ครู | teacher | 老師 | a cute teacher |
| `5-3.webp` | ฅ | เค้ก | cake | 蛋糕 | a cute cake |
| `6-1.webp` | ฆ | เมฆ | cloud | 雲 | a fluffy white cloud with a face |
| `6-2.webp` | ฆ | โฆษณา | advertisement | 廣告 | a little TV showing a cheerful advert |
| `6-3.webp` | ฆ | พยัคฆ์ | tiger (story word) | 老虎（故事用語） | a storybook tiger |
| `7-1.webp` | ง | ลิง | monkey | 猴子 | a cute monkey |
| `7-2.webp` | ง | กุ้ง | shrimp | 蝦子 | a cute shrimp |
| `7-3.webp` | ง | แตงโม | watermelon | 西瓜 | a cute watermelon |
| `8-1.webp` | จ | จมูก | nose | 鼻子 | a cute smiling face with the nose highlighted |
| `8-2.webp` | จ | จักรยาน | bicycle | 腳踏車 | a cute bicycle |
| `8-3.webp` | จ | จิ้งจก | gecko | 壁虎 | a cute gecko |
| `9-1.webp` | ฉ | ฉลาม | shark | 鯊魚 | a cute shark |
| `9-2.webp` | ฉ | ฉัน | I, me | 我 | a smiling child pointing at themself |
| `9-3.webp` | ฉ | ฉลาด | clever | 聰明 | a happy child with a glowing light bulb above the head |
| `10-1.webp` | ช | ช้อน | spoon | 湯匙 | a spoon |
| `10-2.webp` | ช | ชา | tea | 茶 | a cute tea |
| `10-3.webp` | ช | เชอร์รี่ | cherry | 櫻桃 | a cute cherry |
| `11-1.webp` | ซ | ซุป | soup | 湯 | a cute soup |
| `11-2.webp` | ซ | ซาลาเปา | steamed bun | 包子 | a Thai steamed bun (salapao) |
| `11-3.webp` | ซ | ซ้าย | left | 左邊 | a cute arrow pointing left with a waving hand |
| `12-1.webp` | ฌ | ชาม | bowl | 碗 | a cute bowl |
| `12-2.webp` | ฌ | ชีส | cheese | 起司 | a cute cheese |
| `12-3.webp` | ฌ | ชาวนา | farmer | 農夫 | a Thai farmer with a straw hat and rice stalks |
| `13-1.webp` | ญ | หญ้า | grass | 草 | a tuft of green grass with a tiny flower |
| `13-2.webp` | ญ | ใหญ่ | big | 大 | a big elephant next to a tiny mouse |
| `13-3.webp` | ญ | ญาติ | relatives | 親戚 | a small family group: grandma, parents and two children |
| `14-1.webp` | ฎ | ชฎา | crown (Thai dance) | 泰式頭冠 | a golden Thai dance crown (chada) |
| `14-2.webp` | ฎ | กฎ | rule | 規則 | a rolled paper scroll with a tick list |
| `14-3.webp` | ฎ | กฎจราจร | traffic rules | 交通規則 | a cute traffic light and a zebra crossing |
| `15-1.webp` | ฏ | ปฏิทิน | calendar | 月曆 | a cute calendar |
| `15-2.webp` | ฏ | ปรากฏ | to appear | 出現 | a little star popping out of a magic puff with sparkles |
| `15-3.webp` | ฏ | ปฏิเสธ | to say no | 拒絕 | a child crossing both arms in an X, shaking head, friendly |
| `16-1.webp` | ฐ | อิฐ | brick | 磚塊 | a cute brick |
| `16-2.webp` | ฐ | เศรษฐี | rich man (stories) | 富翁（故事） | a jolly storybook rich man with a bag of gold coins |
| `16-3.webp` | ฐ | ประเสริฐ | excellent | 優秀 | a shining gold medal with a big star |
| `17-1.webp` | ฑ | บัณฑิต | graduate | 畢業生 | a graduate in cap and gown |
| `17-2.webp` | ฑ | กรีฑา | athletics | 田徑 | a child running a race |
| `17-3.webp` | ฑ | มณฑป | pavilion | 亭子 | a small Thai temple pavilion with a pointed roof |
| `18-1.webp` | ฒ | เฒ่า | old (person) | 年老的 | a kind old man with a walking stick |
| `18-2.webp` | ฒ | วัฒนธรรม | culture | 文化 | a Thai girl in traditional dress doing a wai |
| `18-3.webp` | ฒ | พัฒนา | to grow better | 進步 | a seedling growing into a small tree in three steps |
| `19-1.webp` | ณ | คุณแม่ | mother | 媽媽 | a smiling mother |
| `19-2.webp` | ณ | คุณพ่อ | father | 爸爸 | a smiling father |
| `19-3.webp` | ณ | คุณครู | teacher | 老師 | a kind teacher holding a book |
| `20-1.webp` | ด | ดอกไม้ | flower | 花 | a cute flower |
| `20-2.webp` | ด | เป็ด | duck | 鴨子 | a cute duck |
| `20-3.webp` | ด | ดินสอ | pencil | 鉛筆 | a cute pencil |
| `21-1.webp` | ต | ต้นไม้ | tree | 樹 | a cute tree |
| `21-2.webp` | ต | ตุ๊กตา | doll | 娃娃 | a cute doll |
| `21-3.webp` | ต | แตงกวา | cucumber | 小黃瓜 | a cute cucumber |
| `22-1.webp` | ถ | รถ | car | 汽車 | a small red car |
| `22-2.webp` | ถ | ถั่ว | beans, nuts | 豆子 | a handful of peanuts in shells |
| `22-3.webp` | ถ | ถ้วย | cup | 杯子 | a cute cup |
| `23-1.webp` | ท | ทะเล | sea | 大海 | a sea wave with a little boat |
| `23-2.webp` | ท | ท้องฟ้า | sky | 天空 | blue sky with a sun and a cloud |
| `23-3.webp` | ท | หอยทาก | snail | 蝸牛 | a cute snail |
| `24-1.webp` | ธ | ธนู | bow and arrow | 弓箭 | a cute bow and arrow |
| `24-2.webp` | ธ | ธรรมชาติ | nature | 大自然 | hills, a tree, a river and the sun |
| `24-3.webp` | ธ | ธนาคาร | bank | 銀行 | a cute bank |
| `25-1.webp` | น | นก | bird | 鳥 | a cute bird |
| `25-2.webp` | น | นม | milk | 牛奶 | a glass bottle of milk |
| `25-3.webp` | น | น้ำ | water | 水 | a big water drop with a happy face |
| `26-1.webp` | บ | บ้าน | house | 房子 | a cute house |
| `26-2.webp` | บ | ลูกบอล | ball | 球 | a colourful ball |
| `26-3.webp` | บ | บันได | stairs | 樓梯 | a cute stairs |
| `27-1.webp` | ป | ปู | crab | 螃蟹 | a cute crab |
| `27-2.webp` | ป | ปาก | mouth | 嘴巴 | a smiling mouth with a little tongue |
| `27-3.webp` | ป | แปรงสีฟัน | toothbrush | 牙刷 | a cute toothbrush |
| `28-1.webp` | ผ | ผีเสื้อ | butterfly | 蝴蝶 | a cute butterfly |
| `28-2.webp` | ผ | ผัก | vegetables | 蔬菜 | a bunch of leafy green vegetables |
| `28-3.webp` | ผ | ผลไม้ | fruit | 水果 | a basket of mixed fruit |
| `29-1.webp` | ฝ | ฝน | rain | 雨 | a rain cloud with drops |
| `29-2.webp` | ฝ | ฝัน | dream | 夢 | a sleeping child with a dream cloud of stars |
| `29-3.webp` | ฝ | ฝาแฝด | twins | 雙胞胎 | a cute twins |
| `30-1.webp` | พ | พ่อ | father | 爸爸 | a cute father |
| `30-2.webp` | พ | พระอาทิตย์ | sun | 太陽 | a cute sun |
| `30-3.webp` | พ | พริก | chili | 辣椒 | a cute chili |
| `31-1.webp` | ฟ | ไฟ | fire | 火 | a small friendly campfire flame |
| `31-2.webp` | ฟ | ฟักทอง | pumpkin | 南瓜 | a cute pumpkin |
| `31-3.webp` | ฟ | ฟ้าร้อง | thunder | 打雷 | a cloud with a zigzag lightning bolt |
| `32-1.webp` | ภ | ภูเขา | mountain | 山 | a cute mountain |
| `32-2.webp` | ภ | ภาพ | picture | 圖畫 | a framed picture of a sun and hill |
| `32-3.webp` | ภ | ภาชนะ | dish, container | 器皿 | a stack of bowls and a plate |
| `33-1.webp` | ม | แมว | cat | 貓 | a cute cat |
| `33-2.webp` | ม | มะม่วง | mango | 芒果 | a cute mango |
| `33-3.webp` | ม | มือ | hand | 手 | an open waving hand |
| `34-1.webp` | ย | ยีราฟ | giraffe | 長頸鹿 | a cute giraffe |
| `34-2.webp` | ย | ยาย | grandma | 外婆 | a cute grandma |
| `34-3.webp` | ย | ยิ้ม | smile | 微笑 | a big happy smiling face |
| `35-1.webp` | ร | รุ้ง | rainbow | 彩虹 | a cute rainbow |
| `35-2.webp` | ร | รองเท้า | shoes | 鞋子 | a cute shoes |
| `35-3.webp` | ร | กระรอก | squirrel | 松鼠 | a cute squirrel |
| `36-1.webp` | ล | ปลา | fish | 魚 | a cute fish |
| `36-2.webp` | ล | ลูกโป่ง | balloon | 氣球 | a cute balloon |
| `36-3.webp` | ล | ลม | wind | 風 | swirling wind lines blowing leaves |
| `37-1.webp` | ว | วัว | cow | 牛 | a cute cow |
| `37-2.webp` | ว | ว่าว | kite | 風箏 | a cute kite |
| `37-3.webp` | ว | แว่นตา | glasses | 眼鏡 | a cute glasses |
| `38-1.webp` | ศ | ศิลปะ | art | 美術 | a paint palette with a brush |
| `38-2.webp` | ศ | ประเทศ | country | 國家 | a cute globe with a little flag |
| `38-3.webp` | ศ | ศีรษะ | head | 頭 | a child pointing at their head |
| `39-1.webp` | ษ | กระดาษ | paper | 紙 | a cute paper |
| `39-2.webp` | ษ | ยักษ์ | giant | 巨人 | a cute Thai temple guardian giant (yak) with a friendly face |
| `39-3.webp` | ษ | ภาษา | language | 語言 | two speech bubbles with letters |
| `40-1.webp` | ส | สิงโต | lion | 獅子 | a cute lion |
| `40-2.webp` | ส | ส้ม | orange | 橘子 | a cute orange |
| `40-3.webp` | ส | สุนัข | dog | 狗 | a cute dog |
| `41-1.webp` | ห | หมู | pig | 豬 | a cute pig |
| `41-2.webp` | ห | หมี | bear | 熊 | a cute bear |
| `41-3.webp` | ห | หมวก | hat | 帽子 | a cute hat |
| `42-1.webp` | ฬ | นาฬิกา | clock | 時鐘 | a cute clock |
| `42-2.webp` | ฬ | กีฬา | sport | 運動 | a cute sport |
| `42-3.webp` | ฬ | ปลาวาฬ | whale | 鯨魚 | a cute whale |
| `43-1.webp` | อ | อาหาร | food | 食物 | a Thai meal: rice, curry and an egg on a tray |
| `43-2.webp` | อ | องุ่น | grapes | 葡萄 | a cute grapes |
| `43-3.webp` | อ | อูฐ | camel | 駱駝 | a cute camel |
| `44-1.webp` | ฮ | ฮิปโป | hippo | 河馬 | a cute hippo |
| `44-2.webp` | ฮ | แฮมเบอร์เกอร์ | hamburger | 漢堡 | a cute hamburger |
| `44-3.webp` | ฮ | เฮลิคอปเตอร์ | helicopter | 直升機 | a cute helicopter |
