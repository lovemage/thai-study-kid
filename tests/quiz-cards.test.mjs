import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
function element(){const classes=new Set(),attrs={};return{classes,attrs,textContent:'',classList:{add:x=>classes.add(x),toggle:(x,on)=>on?classes.add(x):classes.delete(x)},setAttribute:(k,v)=>attrs[k]=v}}
function app(){const nodes=Object.fromEntries(['.answers','#quiz-listen','#feedback','#hint-text'].map(s=>[s,element()])),buttons=[],timers=[],storage=new Map();const context={localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},matchMedia:()=>({matches:false}),setTimeout:f=>timers.push(f),document:{querySelector:s=>nodes[s]||null,querySelectorAll:s=>s==='[data-answer]'?buttons:[]}};vm.createContext(context);vm.runInContext(fs.readFileSync('dist/data.js','utf8')+fs.readFileSync('dist/islands.js','utf8')+fs.readFileSync('dist/app.js','utf8'),context);const run=code=>vm.runInContext(code,context);run("state.tab='play';makeQuiz()");for(const id of run('quiz.choices')){const b=element();b.dataset={answer:String(id)};b.front=element();b.querySelector=()=>b.front;buttons.push(b)}return{run,nodes,buttons,timers,storage}}
test('new rounds have three distinct choices, one answer, varied positions and no identical repeat',()=>{
 const h=app(),positions=new Set();let previous=[];for(let i=0;i<120;i++){h.run('makeQuiz()');const choices=Array.from(h.run('quiz.choices'));assert.equal(new Set(choices).size,3);assert.equal(choices.filter(n=>n===1).length,1);assert.notDeepEqual(choices,previous);positions.add(choices.indexOf(1));previous=choices}assert.equal(positions.size,3);assert.deepEqual(JSON.parse(h.storage.get('thai-sprout-v1')).quizOrders['1'],previous);
});
test('only matching prompt playback reveals quiz; decoding and hint audio do not',()=>{
 const h=app();h.run("updateQuizCards({detail:{id:'letter-1',phase:'loading'}})");assert.equal(h.run('quiz.revealed'),false);assert(h.nodes['.answers'].classes.has('cards-waiting'));
 h.run("updateQuizCards({detail:{id:'hint-play',phase:'playing'}})");assert.equal(h.run('quiz.revealed'),false);
 h.run("updateQuizCards({detail:{id:'letter-1',phase:'playing'}})");assert.equal(h.run('quiz.revealed'),true);assert.equal(h.run('quiz.ready'),false);assert(h.nodes['.answers'].classes.has('cards-revealed'));h.timers.forEach(f=>f());assert.equal(h.run('quiz.ready'),true);assert(h.buttons.every(b=>b.attrs['aria-disabled']==='false'));
});
test('failed prompt audio still turns the cards over; playback after leaving the game does not',()=>{
 const h=app();h.run("state.screen='lesson';updateQuizCards({detail:{id:'letter-1',phase:'error'}})");assert.equal(h.run('quiz.revealed'),true);
 const s=app();s.run("state.screen='home';updateQuizCards({detail:{id:'letter-1',phase:'playing'}})");assert.equal(s.run('quiz.revealed'),false);
});
test('covered cards turn over by themselves when the question sound never comes',()=>{
 const h=app();h.run("state.screen='lesson';playQuizPrompt=playQuizPrompt");h.run("quiz.asked=true;updateQuizCards({detail:{id:'letter-1',phase:'idle'}})");assert.equal(h.run('quiz.revealed'),true);
 const s=app();s.run("state.screen='lesson'");const before=s.timers.length;s.run("TeacherVoice={play:()=>new Promise(()=>{})};playQuizPrompt()");assert.equal(s.run('quiz.revealed'),false);s.timers.slice(before).forEach(f=>f());assert.equal(s.run('quiz.revealed'),true);
});
test('a letter is learned once written and found; listening is never required',()=>{
 const h=app();h.run("progress={5:{wrote:true,quiz:true}}");assert.equal(h.run('done(5)'),true);h.run("progress={5:{heard:true,wrote:true}}");assert.equal(h.run('done(5)'),false);
});

test('home map renders all chapter cards and keeps later islands locked',()=>{const h=app();const html=h.run('homeHTML()');assert.equal((html.match(/data-chapter=/g)||[]).length,h.run('chapters.length'));assert.equal(h.run('unlocked(0)'),true);assert.equal(h.run('unlocked(1)'),false)});
