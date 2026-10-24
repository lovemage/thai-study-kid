import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
function harness(){
 let finishDecode,failDecode,startCount=0;const events=[],sources=[];
 class AudioContext{state='running';resume(){return Promise.resolve()}decodeAudioData(){return new Promise((r,j)=>{finishDecode=r;failDecode=j})}createBufferSource(){const s={connect(){},stop(){},start(){startCount++}};sources.push(s);return s}}
 const ctx={location:{hostname:'test.netlify.app'},document:{documentElement:{lang:'en'},querySelectorAll:()=>[],dispatchEvent:e=>events.push(e.detail)},CustomEvent:class{constructor(type,{detail}){this.detail=detail}},window:{AudioContext},fetch:async url=>url.includes('status=1')?{json:async()=>({configured:true})}:{ok:true,headers:{get:n=>n==='content-type'?'audio/wav':null},arrayBuffer:async()=>new ArrayBuffer(4)},performance,setTimeout,clearTimeout,requestAnimationFrame:()=>{},AbortController,Uint8Array,Map,Date,Math,setHint(){},toast(){}};
 vm.runInNewContext(fs.readFileSync('dist/voice.js','utf8'),ctx);return{voice:ctx.window.TeacherVoice,events,ready:()=>finishDecode({}),fail:()=>failDecode(new Error("decode_failed")),started:()=>startCount,sources};
}
const flush=()=>new Promise(r=>setImmediate(r));
test('letter stays covered through download and decoding; ready event follows audio start',async()=>{
 const h=harness();await flush();const result=h.voice.play('letter-1');await flush();assert.deepEqual(h.events.map(e=>e.phase),['loading']);assert.equal(h.started(),0);
 h.ready();assert.equal(await result,true);assert.equal(h.started(),1);assert.equal(h.events.at(-1).phase,'playing');
});
test('rapid repeat taps share playback and do not reveal early',async()=>{
 const h=harness();await flush();const first=h.voice.play('letter-1');await flush();assert.equal(await h.voice.play('letter-1'),false);assert.equal(h.events.length,1);h.ready();await first;assert.equal(h.started(),1);
});
test('leaving while loading never starts delayed audio or reveals another card',async()=>{
 const h=harness();await flush();const result=h.voice.play('letter-1');await flush();h.voice.stop();h.ready();assert.equal(await result,false);assert.equal(h.started(),0);assert(!h.events.some(e=>e.phase==='playing'));
});

test('failed audio never reveals the covered letter',async()=>{
 const h=harness();await flush();const result=h.voice.play('letter-1');await flush();h.fail();assert.equal(await result,false);assert.equal(h.started(),0);assert.equal(h.events.at(-1).phase,'error');assert(!h.events.some(e=>e.phase==='playing'));
});
test('a letter name is said twice with a pause, and stopping cancels the second time',async()=>{
 const h=harness();await flush();const result=h.voice.play('letter-1',null,null,2);await flush();h.ready();assert.equal(await result,true);assert.equal(h.started(),1);
 h.sources[0].onended();assert.equal(h.started(),1,'waits a breath before repeating');await new Promise(r=>setTimeout(r,700));assert.equal(h.started(),2);
 h.sources[1].onended();await new Promise(r=>setTimeout(r,700));assert.equal(h.started(),2,'only twice');
 const again=h.voice.play('letter-2',null,null,2);await flush();h.ready();await again;h.sources.at(-1).onended();h.voice.stop();await new Promise(r=>setTimeout(r,700));assert.equal(h.started(),3,'stop() cancels the pending repeat');
});
