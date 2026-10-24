import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';

// Loads dist/speech.js against fake dictation, microphone and teacher voice.
function harness({dictation=true}={}){
 const nodes={},events={},timers=[],tracks=[{stopped:false,stop(){this.stopped=true}}],played=[],effects=[],recognizers=[];
 const node=()=>({dataset:{},textContent:'',hidden:false,setAttribute(){},after(){},append(){},remove(){},showModal(){},close(){},addEventListener(){},querySelector:s=>nodes[s]??=node()});
 nodes['.learn-area']=node();nodes['.speech-practice']=node();
 let permissionResolve,permissionReject;
 const permission=new Promise((a,b)=>{permissionResolve=a;permissionReject=b});
 class Recognition{constructor(){recognizers.push(this);this.started=false;this.aborted=false}start(){this.started=true}stop(){this.stopped=true;this.onend?.()}abort(){this.aborted=true}}
 class Recorder{static isTypeSupported(){return true}constructor(){this.state='inactive';Recorder.last=this}start(){this.state='recording'}stop(){this.state='inactive';this.onstop?.()}}
 class Audio{resume(){return Promise.resolve()}close(){return Promise.resolve()}decodeAudioData(){return Promise.reject(new Error('test audio'))}}
 const window={AudioContext:Audio,MediaRecorder:Recorder,addEventListener:(n,f)=>events['window:'+n]=f};
 if(dictation)window.webkitSpeechRecognition=Recognition;
 const ctx={console,window,isSecureContext:true,URL:{createObjectURL:()=>'blob:x',revokeObjectURL(){}},Audio:class{play(){return Promise.reject(new Error('no autoplay'))}pause(){}},
  navigator:{mediaDevices:{getUserMedia:()=>permission}},document:{documentElement:{lang:'en'},querySelector:s=>nodes[s]??=node(),createElement:node,body:{append(){}},addEventListener:(n,f)=>events[n]=f},
  MediaRecorder:Recorder,TeacherVoice:{stop(){},play:(...a)=>played.push(a),effect:k=>effects.push(k)},
  setTimeout:(f,ms)=>{timers.push({f,ms});return timers.length},setInterval:()=>1,clearInterval(){},clearTimeout(){},Blob};
 vm.createContext(ctx);
 // speech.js imports the matcher lazily; point that import at the real module.
 const src=fs.readFileSync('dist/speech.js','utf8').replace("import('./speech-core.mjs')",`import(${JSON.stringify(pathToFileURL('dist/speech-core.mjs').href)})`);
 vm.runInContext(src,ctx,{importModuleDynamically:vm.constants.USE_MAIN_CONTEXT_DEFAULT_LOADER});
 const api=ctx.window.SpeechPractice;api.mount({id:1,char:'ก',word:'ไก่'});
 const phase=()=>nodes['.speech-practice'].dataset.phase,message=()=>nodes['#speech-message'].textContent;
 return{api,nodes,events,timers,tracks,played,effects,recognizers,Recorder,ctx,phase,message,
  resolve:()=>permissionResolve({getTracks:()=>tracks}),reject:()=>permissionReject(Object.assign(new Error(),{name:'NotAllowedError'})),click:()=>nodes['#speak'].onclick()};
}
const settle=()=>new Promise(r=>setTimeout(r,20));
const say=(r,...words)=>r.onresult?.({results:[words.map(transcript=>({transcript}))]});

test('dictation listens in Thai and celebrates when any guess is the word',async()=>{
 const h=harness();h.click();const r=h.recognizers[0];assert.equal(r.lang,'th-TH');assert(r.started);assert.equal(h.phase(),'recording');
 say(r,'กาย','ไก่');r.onend();await settle();assert.equal(h.phase(),'match');assert.deepEqual(h.effects,['yay']);
});
test('a different word is a gentle retry that replays the teacher, never a grade',async()=>{
 const h=harness();h.click();const r=h.recognizers[0];say(r,'ไข่');r.onend();await settle();
 assert.equal(h.phase(),'retry');assert.equal(h.played[0][0],'word-1');assert.match(h.nodes['#speech-heard'].textContent,/ไข่/);
});
test('listening stops at six seconds, and a second tap means done',()=>{
 const h=harness();h.click();const r=h.recognizers[0];const limit=h.timers.find(t=>t.ms===6000);assert(limit);limit.f();assert(r.stopped);
 const s=harness();s.click();s.click();assert(s.recognizers[0].stopped);
});
test('leaving, backgrounding or the teacher talking ends listening and ignores late results',async()=>{
 const h=harness();h.click();const r=h.recognizers[0];h.api.cancel();assert(r.aborted);say(r,'ไก่');r.onend?.();await settle();assert.equal(h.phase(),'idle');assert.deepEqual(h.effects,[]);
 const b=harness();b.click();b.ctx.document.hidden=true;b.events.visibilitychange();assert(b.recognizers[0].aborted);
 const v=harness();v.click();v.events['teacher-voice-state']({detail:{phase:'loading'}});assert(v.recognizers[0].aborted);assert.equal(v.phase(),'idle');
});
test('blocked permission asks a grown-up; switched-off dictation falls back to record and compare',async()=>{
 const h=harness();h.click();h.recognizers[0].onerror({error:'not-allowed'});assert.match(h.message(),/grown-up/);
 h.click();assert.equal(h.recognizers.length,2,'dictation is still tried after a permission prompt');
 const s=harness();s.click();s.recognizers[0].onerror({error:'service-not-allowed'});assert.match(s.message(),/record and compare/);
 const pending=s.click();assert.equal(s.recognizers.length,1);s.resolve();await pending;assert.equal(s.Recorder.last.state,'recording');
});
test('without dictation: late microphone streams are released and denial is friendly',async()=>{
 const h=harness({dictation:false});const pending=h.click();h.api.cancel();h.resolve();await pending;assert(h.tracks.every(t=>t.stopped));assert(!h.Recorder.last);
 const d=harness({dictation:false});const p=d.click();d.reject();await p;assert.match(d.message(),/grown-up/);assert.equal(d.phase(),'idle');
});
test('without dictation: the recording stops at six seconds and the teacher follows',async()=>{
 const h=harness({dictation:false});const pending=h.click();h.resolve();await pending;const rec=h.Recorder.last;rec.ondataavailable({data:{size:10}});
 h.timers.find(t=>t.ms===6000).f();assert(h.tracks.every(t=>t.stopped));await settle();await settle();
 assert.equal(h.phase(),'match');assert.equal(h.played[0][0],'word-1');
});
