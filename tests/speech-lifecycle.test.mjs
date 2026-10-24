import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
function harness(){
 const nodes={},events={},timers=[],tracks=[{stopped:false,stop(){this.stopped=true}}],workers=[];
 const node=()=>({dataset:{},setAttribute(){},after(){},append(){},remove(){},showModal(){},close(){},addEventListener(){},querySelector:s=>nodes[s]??=node()});
 nodes['.learn-area']=node();nodes['.speech-practice']=node();
 let permissionResolve,permissionReject;
 const permission=new Promise((a,b)=>{permissionResolve=a;permissionReject=b});
 class Recorder{static isTypeSupported(){return true}constructor(){this.state='inactive';Recorder.last=this}start(){this.state='recording'}stop(){this.state='inactive';this.onstop?.()}}
 class Audio{resume(){return Promise.resolve()}close(){return Promise.resolve()}decodeAudioData(){return Promise.reject(new Error('invalid test audio'))}}
 const ctx={console,window:{AudioContext:Audio,MediaRecorder:Recorder,Worker:true,WebAssembly:true,addEventListener:(n,f)=>events[n]=f},isSecureContext:true,navigator:{mediaDevices:{getUserMedia:()=>permission}},document:{documentElement:{lang:'en'},querySelector:s=>nodes[s]??=node(),createElement:node,body:{append(){}},addEventListener:(n,f)=>events[n]=f},localStorage:{getItem(){},setItem(){}},Worker:class{constructor(){workers.push(this)}postMessage(){}terminate(){this.terminated=true}},MediaRecorder:Recorder,TeacherVoice:{stop(){},play(){},effect(){}},setTimeout:(f,ms)=>{timers.push({f,ms});return timers.length},setInterval:()=>1,clearInterval(){},clearTimeout(){},Blob,Float32Array};
 vm.createContext(ctx);vm.runInContext(fs.readFileSync('dist/speech.js','utf8'),ctx);
 const api=ctx.window.SpeechPractice;api.mount({id:1,char:'ก',word:'ไก่'});api.setup();nodes['#prepare-model'].onclick({currentTarget:nodes['#prepare-model']});workers[0].onmessage({data:{type:'ready'}});
 return{api,nodes,events,timers,tracks,workers,Recorder,ctx,resolve:()=>permissionResolve({getTracks:()=>tracks}),reject:()=>permissionReject(Object.assign(new Error(),{name:'NotAllowedError'})),click:()=>nodes['#speak'].onclick()};
}
const turn=()=>new Promise(r=>setImmediate(r));
test('navigation during microphone permission releases late streams',async()=>{const h=harness();const pending=h.click();h.api.cancel();h.resolve();await pending;assert(h.tracks.every(t=>t.stopped));assert(!h.Recorder.last)});
test('permission denial leaves friendly retry',async()=>{const h=harness();const pending=h.click();h.reject();await pending;assert.match(h.nodes['#speech-message'].textContent,/grown-up/);assert.equal(h.nodes['.speech-practice'].dataset.phase,'idle')});
test('recording stops at six seconds before decoding',async()=>{const h=harness();const pending=h.click();h.resolve();await pending;assert.equal(h.Recorder.last.state,'recording');const limit=h.timers.find(t=>t.ms===6000);assert(limit);limit.f();assert(h.tracks.every(t=>t.stopped));await turn();assert.equal(h.nodes['.speech-practice'].dataset.phase,'idle')});
test('backgrounding stops recording and ignores stale recognition',async()=>{const h=harness();const pending=h.click();h.resolve();await pending;h.ctx.document.hidden=true;h.events.visibilitychange();assert(h.tracks.every(t=>t.stopped));assert.equal(h.Recorder.last.state,'inactive');h.workers[0].onmessage({data:{type:'result',id:0,text:'ไก่'}});assert.equal(h.nodes['.speech-practice'].dataset.phase,'idle')});
