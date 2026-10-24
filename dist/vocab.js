// Three everyday words per letter, shown after the matching game: [Thai, English, Chinese, emoji, kind].
// Each word contains its letter (highlighted on screen). Rare and historical letters have almost no words a child would use,
// so vocabTwin names the everyday letter with the same sound and those cards highlight that letter instead.
// Needs a native speaker's review, like the rest of the lesson content.
const vocabKinds={animal:['Animal','動物'],food:['Food','食物'],fruit:['Fruit','水果'],veg:['Vegetable','蔬菜'],plant:['Plant','植物'],body:['Body','身體'],family:['Family','家人'],home:['At home','家裡'],nature:['Nature','自然'],school:['School','學校'],play:['Play','遊戲'],word:['Everyday word','日常用語']};
const vocab={
1:[['กบ','frog','青蛙','🐸','animal'],['กล้วย','banana','香蕉','🍌','fruit'],['กุหลาบ','rose','玫瑰','🌹','plant']],
2:[['ข้าว','rice','米飯','🍚','food'],['ขา','leg','腿','🦵','body'],['ขนม','sweets','點心','🍡','food']],
3:[['ขวาน','axe','斧頭','🪓','home'],['ขนมปัง','bread','麵包','🍞','food'],['ข้าวโพด','corn','玉米','🌽','veg']],
4:[['แครอท','carrot','紅蘿蔔','🥕','veg'],['คุกกี้','cookie','餅乾','🍪','food'],['ค้างคาว','bat','蝙蝠','🦇','animal']],
5:[['คอมพิวเตอร์','computer','電腦','💻','home'],['ครู','teacher','老師','🧑‍🏫','school'],['เค้ก','cake','蛋糕','🎂','food']],
6:[['เมฆ','cloud','雲','☁️','nature'],['โฆษณา','advertisement','廣告','📺','word'],['พยัคฆ์','tiger (story word)','老虎（故事用語）','🐯','animal']],
7:[['ลิง','monkey','猴子','🐒','animal'],['กุ้ง','shrimp','蝦子','🦐','animal'],['แตงโม','watermelon','西瓜','🍉','fruit']],
8:[['จมูก','nose','鼻子','👃','body'],['จักรยาน','bicycle','腳踏車','🚲','play'],['จิ้งจก','gecko','壁虎','🦎','animal']],
9:[['ฉลาม','shark','鯊魚','🦈','animal'],['ฉัน','I, me','我','🙋','word'],['ฉลาด','clever','聰明','🧠','word']],
10:[['ช้อน','spoon','湯匙','🥄','home'],['ชา','tea','茶','🍵','food'],['เชอร์รี่','cherry','櫻桃','🍒','fruit']],
11:[['ซุป','soup','湯','🍲','food'],['ซาลาเปา','steamed bun','包子','🥟','food'],['ซ้าย','left','左邊','⬅️','word']],
12:[['ชาม','bowl','碗','🥣','home'],['ชีส','cheese','起司','🧀','food'],['ชาวนา','farmer','農夫','🧑‍🌾','family']],
13:[['หญ้า','grass','草','🌿','plant'],['ใหญ่','big','大','🐘','word'],['ญาติ','relatives','親戚','👨‍👩‍👧','family']],
14:[['ชฎา','crown (Thai dance)','泰式頭冠','👑','play'],['กฎ','rule','規則','📜','school'],['กฎจราจร','traffic rules','交通規則','🚦','word']],
15:[['ปฏิทิน','calendar','月曆','📅','home'],['ปรากฏ','to appear','出現','✨','word'],['ปฏิเสธ','to say no','拒絕','🙅','word']],
16:[['อิฐ','brick','磚塊','🧱','home'],['เศรษฐี','rich man (stories)','富翁（故事）','💰','word'],['ประเสริฐ','excellent','優秀','🌟','word']],
17:[['บัณฑิต','graduate','畢業生','🎓','school'],['กรีฑา','athletics','田徑','🏃','play'],['มณฑป','pavilion','亭子','🛕','home']],
18:[['เฒ่า','old (person)','年老的','👴','family'],['วัฒนธรรม','culture','文化','🎎','word'],['พัฒนา','to grow better','進步','🌱','word']],
19:[['คุณแม่','mother','媽媽','👩','family'],['คุณพ่อ','father','爸爸','👨','family'],['คุณครู','teacher','老師','🧑‍🏫','school']],
20:[['ดอกไม้','flower','花','🌸','plant'],['เป็ด','duck','鴨子','🦆','animal'],['ดินสอ','pencil','鉛筆','✏️','school']],
21:[['ต้นไม้','tree','樹','🌳','plant'],['ตุ๊กตา','doll','娃娃','🧸','play'],['แตงกวา','cucumber','小黃瓜','🥒','veg']],
22:[['รถ','car','汽車','🚗','word'],['ถั่ว','beans, nuts','豆子','🥜','food'],['ถ้วย','cup','杯子','☕','home']],
23:[['ทะเล','sea','大海','🌊','nature'],['ท้องฟ้า','sky','天空','🌤️','nature'],['หอยทาก','snail','蝸牛','🐌','animal']],
24:[['ธนู','bow and arrow','弓箭','🏹','play'],['ธรรมชาติ','nature','大自然','🏞️','nature'],['ธนาคาร','bank','銀行','🏦','word']],
25:[['นก','bird','鳥','🐦','animal'],['นม','milk','牛奶','🥛','food'],['น้ำ','water','水','💧','nature']],
26:[['บ้าน','house','房子','🏠','home'],['ลูกบอล','ball','球','⚽','play'],['บันได','stairs','樓梯','🪜','home']],
27:[['ปู','crab','螃蟹','🦀','animal'],['ปาก','mouth','嘴巴','👄','body'],['แปรงสีฟัน','toothbrush','牙刷','🪥','home']],
28:[['ผีเสื้อ','butterfly','蝴蝶','🦋','animal'],['ผัก','vegetables','蔬菜','🥬','veg'],['ผลไม้','fruit','水果','🍎','fruit']],
29:[['ฝน','rain','雨','🌧️','nature'],['ฝัน','dream','夢','💭','word'],['ฝาแฝด','twins','雙胞胎','👯','family']],
30:[['พ่อ','father','爸爸','👨','family'],['พระอาทิตย์','sun','太陽','☀️','nature'],['พริก','chili','辣椒','🌶️','veg']],
31:[['ไฟ','fire','火','🔥','nature'],['ฟักทอง','pumpkin','南瓜','🎃','veg'],['ฟ้าร้อง','thunder','打雷','⛈️','nature']],
32:[['ภูเขา','mountain','山','⛰️','nature'],['ภาพ','picture','圖畫','🖼️','school'],['ภาชนะ','dish, container','器皿','🍽️','home']],
33:[['แมว','cat','貓','🐱','animal'],['มะม่วง','mango','芒果','🥭','fruit'],['มือ','hand','手','✋','body']],
34:[['ยีราฟ','giraffe','長頸鹿','🦒','animal'],['ยาย','grandma','外婆','👵','family'],['ยิ้ม','smile','微笑','😊','word']],
35:[['รุ้ง','rainbow','彩虹','🌈','nature'],['รองเท้า','shoes','鞋子','👟','home'],['กระรอก','squirrel','松鼠','🐿️','animal']],
36:[['ปลา','fish','魚','🐟','animal'],['ลูกโป่ง','balloon','氣球','🎈','play'],['ลม','wind','風','🌬️','nature']],
37:[['วัว','cow','牛','🐄','animal'],['ว่าว','kite','風箏','🪁','play'],['แว่นตา','glasses','眼鏡','👓','home']],
38:[['ศิลปะ','art','美術','🎨','school'],['ประเทศ','country','國家','🌏','word'],['ศีรษะ','head','頭','🙆','body']],
39:[['กระดาษ','paper','紙','📄','school'],['ยักษ์','giant','巨人','👹','play'],['ภาษา','language','語言','🗣️','word']],
40:[['สิงโต','lion','獅子','🦁','animal'],['ส้ม','orange','橘子','🍊','fruit'],['สุนัข','dog','狗','🐶','animal']],
41:[['หมู','pig','豬','🐷','animal'],['หมี','bear','熊','🐻','animal'],['หมวก','hat','帽子','🧢','home']],
42:[['นาฬิกา','clock','時鐘','⏰','home'],['กีฬา','sport','運動','🏅','play'],['ปลาวาฬ','whale','鯨魚','🐋','animal']],
43:[['อาหาร','food','食物','🍱','food'],['องุ่น','grapes','葡萄','🍇','fruit'],['อูฐ','camel','駱駝','🐫','animal']],
44:[['ฮิปโป','hippo','河馬','🦛','animal'],['แฮมเบอร์เกอร์','hamburger','漢堡','🍔','food'],['เฮลิคอปเตอร์','helicopter','直升機','🚁','play']]
};
// ฃ and ฅ are no longer written, and ฌ appears almost only in its own lesson word เฌอ: their cards use the sound twin.
// ฎ keeps its lesson word ชฎา, since the other ฎ words are about rules.
const vocabTwin={3:'ข',5:'ค',12:'ช'};
// Switch on once the sticker illustrations are in dist/assets/vocab/ (see docs/design/codex-assets.md).
const vocabArt=true;
