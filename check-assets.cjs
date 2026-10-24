const fs=require('fs'),vm=require('vm'),assert=require('assert');
let ctx={};vm.createContext(ctx);vm.runInContext(fs.readFileSync('dist/data.js','utf8')+';globalThis.data={letters,chapters}',ctx);
const {letters,chapters}=ctx.data;assert.equal(letters.length,44);assert.equal(new Set(letters.map(l=>l.char)).size,44);assert.equal(chapters.flatMap(c=>c.ids).length,16);
let meta=JSON.parse(fs.readFileSync('dist/assets/writing.json','utf8'));
for(const l of letters){let m=meta[l.id];assert(m&&m.strokes?.length>=1,`Stroke path for ${l.char}`);let length=0;for(const s of m.strokes){assert(s.length>1);for(const [x,y] of s)assert(x>=0&&x<=m.width&&y>=0&&y<=m.height,`Point inside box for ${l.char}`);for(let i=1;i<s.length;i++)length+=Math.hypot(s[i][0]-s[i-1][0],s[i][1]-s[i-1][1])}assert(length>m.height,`Stroke path long enough for ${l.char}`);assert(fs.statSync(`dist/assets/letter-${l.id}.mp3`).size>1000)}
console.log('PASS: 44 unique letters, 16 starter lessons, 44 audio files and 44 stroke paths.');
