const fs=require('fs'),vm=require('vm'),assert=require('assert');
let ctx={};vm.createContext(ctx);vm.runInContext(fs.readFileSync('dist/data.js','utf8')+';globalThis.data={letters,chapters}',ctx);
const {letters,chapters}=ctx.data;assert.equal(letters.length,44);assert.equal(new Set(letters.map(l=>l.char)).size,44);assert.equal(chapters.flatMap(c=>c.ids).length,16);
let meta=JSON.parse(fs.readFileSync('dist/assets/writing.json','utf8'));
for(const l of letters){let m=meta[l.id];assert(m&&m.frames>1,`Writing animation for ${l.char}`);assert.equal(m.frames,m.durations.length);assert(fs.statSync(`dist/assets/letter-${l.id}.mp3`).size>1000);let png=fs.readFileSync(`dist/assets/writing-${l.id}.png`);assert.equal(png.readUInt32BE(16),m.width*m.frames);assert.equal(png.readUInt32BE(20),m.height)}
console.log('PASS: 44 unique letters, 16 starter lessons, 44 audio files and 44 correctly sized animation sheets.');
