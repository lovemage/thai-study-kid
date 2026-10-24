import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {assessTranscript,resample,isQuiet} from '../dist/speech-core.mjs';
test('matching keeps Thai tones and rejects other words without a pronunciation score',()=>{
 const target={word:'ไก่',char:'ก'};
 assert.equal(assessTranscript(' ไก่! ',target),'match');
 assert.equal(assessTranscript('กอ ไก่',target),'match');
 assert.equal(assessTranscript('ไก่ ไก่',target),'match');
 for(const text of ['ไข่','ไก้','กาย','ไก่ไข่'])assert.equal(assessTranscript(text,target),'retry');
 for(const text of ['', 'Gai!', '...'])assert.equal(assessTranscript(text,target),'unclear');
});
test('resampling caps recording length and silence never enters recognition',()=>{
 assert(isQuiet(new Float32Array(16000)));
 const signal=Float32Array.from({length:48000*8},(_,i)=>.2*Math.sin(2*Math.PI*440*i/48000));
 const output=resample([signal,signal],48000);
 assert.equal(output.length,104000);assert(!isQuiet(output));
 assert(Math.max(...output)<.201);
});
test('all required PWA assets exist and model files are opt-in rather than precached',()=>{
 const manifest=JSON.parse(fs.readFileSync('dist/manifest.webmanifest'));
 assert.equal(manifest.display,'standalone');assert.equal(manifest.start_url,'/?source=pwa');
 for(const icon of manifest.icons)assert(fs.existsSync('dist/'+icon.src));
 const ctx={self:{addEventListener(){}},URL};vm.createContext(ctx);
 vm.runInContext(fs.readFileSync('dist/sw.js','utf8')+';globalThis.shell=SHELL;',ctx);
 for(const path of ctx.shell)assert(fs.existsSync(path==='./'?'dist/index.html':'dist/'+path.slice(2)),path);
 assert(!ctx.shell.some(p=>p.includes('/vendor/')||p.endsWith('.onnx')));
});
test('service worker never caches audio uploads or status requests',()=>{
 let handler;const ctx={self:{location:{origin:'https://example.test'},addEventListener:(name,fn)=>{if(name==='fetch')handler=fn}},URL};vm.createContext(ctx);vm.runInContext(fs.readFileSync('dist/sw.js','utf8'),ctx);
 for(const [method,url] of [['POST','https://example.test/api/voice'],['GET','https://example.test/api/voice?status=1']]){
  let intercepted=false;handler({request:{method,url},respondWith:()=>intercepted=true});assert.equal(intercepted,false);
 }
});
test('entering the play step renders first and invokes the question automatically',()=>{
 const src=fs.readFileSync('dist/app.js','utf8'),nodes={};
 const ctx={window:{},document:{querySelector:s=>nodes[s]||null,querySelectorAll:()=>[]},localStorage:{getItem:()=>null},matchMedia:()=>({matches:false})};
 vm.createContext(ctx);vm.runInContext(fs.readFileSync('dist/data.js','utf8')+fs.readFileSync('dist/islands.js','utf8')+src,ctx);
 const next={};nodes['#next']=next;
 vm.runInContext("var events=[];render=()=>events.push('render');playQuizPrompt=()=>events.push('sound');state.tab='write';strokesById[1]=[{points:[1,2,3,4,5]}];bind();",ctx);
 next.onclick();assert.deepEqual(Array.from(vm.runInContext('events',ctx)),['render','sound']);
});
