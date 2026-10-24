import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
// The app with a tiny DOM: the Next button and status line are real objects; render() is stubbed.
function app(){
 const node=()=>{const classes=new Set(),attrs={};return{classes,attrs,textContent:'',classList:{add:x=>classes.add(x),remove:x=>classes.delete(x),toggle:(x,on)=>on?classes.add(x):classes.delete(x),contains:x=>classes.has(x)},setAttribute:(k,v)=>attrs[k]=v,querySelector:()=>({textContent:''})}};
 const nodes={'#next':node(),'#words-count':node(),'#hint-text':node(),'#toast':node()},effects=[];
 const ctx={window:{},globalThis:{},document:{querySelector:s=>nodes[s]||null,querySelectorAll:()=>[],addEventListener(){}},localStorage:{getItem:()=>null,setItem(){}},matchMedia:()=>({matches:false}),setTimeout:()=>0,clearTimeout(){},
  TeacherVoice:{play:()=>Promise.resolve(false),stop(){},prefetch(){},effect:k=>effects.push(k)}};
 vm.createContext(ctx);vm.runInContext(['data.js','vocab.js','islands.js','app.js'].map(f=>fs.readFileSync('dist/'+f,'utf8')).join('\n'),ctx);
 const run=code=>vm.runInContext(code,ctx);
 run("render=()=>{};member={id:'google:1'};state.screen='lesson';state.tab='play';state.chapter=0;state.id=1;makeQuiz();quiz.solved=true;quiz.words=true;bind()");
 return {run,nodes,effects,heard:(k,phase='ended',letter=1)=>run(`updateWordCards({detail:{id:'vocab-${letter}-${k}',phase:'${phase}'}})`)};
}
test('Next letter waits until all three word cards have been heard to the end',()=>{
 const h=app();h.run('refreshWords()');assert.equal(h.nodes['#next'].attrs['aria-disabled'],'true');
 h.nodes['#next'].onclick();assert.equal(h.run('state.id'),1,'blocked before any word');assert.ok(h.effects.includes('oops'));
 h.heard(1);h.heard(1);h.heard(2);h.heard(1,'playing');h.heard(3,'idle');
 assert.equal(h.run('wordsHeard()'),2,'repeats, starts and interrupted plays do not count');
 h.nodes['#next'].onclick();assert.equal(h.run('state.id'),1);
 h.heard(3,'ended',2);assert.equal(h.run('wordsHeard()'),2,'another letter\'s word does not count');
 h.heard(3);assert.equal(h.run('wordsDone()'),true);assert.equal(h.nodes['#next'].attrs['aria-disabled'],'false');assert.match(h.nodes['#words-count'].textContent,/three|3/);
 h.nodes['#next'].onclick();assert.equal(h.run('state.id'),2,'moves on once every word is heard');
});
test('a word whose sound cannot load counts once tapped, so missing audio never blocks a child',()=>{
 const h=app();h.heard(1,'error');h.heard(2,'error');h.heard(3,'ended');assert.equal(h.run('wordsDone()'),true);
});
test('tapping Next after solving shows the words first instead of skipping them',()=>{
 const h=app();h.run("quiz.words=false;showWords=q=>{q.words='shown'}");h.nodes['#next'].onclick();assert.equal(h.run('quiz.words'),'shown');assert.equal(h.run('state.id'),1);
});
test('Back goes to the previous letter from any step, and to the map from an island\'s first letter',()=>{
 const h=app();h.nodes['#back']={};h.run("state.id=3;state.tab='write';bind()");h.nodes['#back'].onclick();
 assert.deepEqual([h.run('state.id'),h.run('state.tab'),h.run('state.screen')],[2,'learn','lesson']);
 h.run("bind()");h.nodes['#back'].onclick();assert.equal(h.run('state.id'),1);
 h.run("bind()");h.nodes['#back'].onclick();assert.equal(h.run('state.screen'),'home','first letter of the island returns to the map');
 h.run("state.screen='lesson';state.explorer=true;state.id=1;bind()");h.nodes['#back'].onclick();assert.equal(h.run('state.id'),44,'the explorer wraps around like Next');
});
test('skipping the game still shows the three words before the next letter, and the letter stays unfinished',()=>{
 const h=app();h.run("quiz.solved=false;quiz.words=false;showWords=q=>{q.words=true}");h.nodes['#next'].onclick();
 assert.equal(h.run('quiz.words'),true);assert.equal(h.run('state.id'),1);assert.equal(h.run('!!progress[1]?.quiz'),false);
 h.nodes['#next'].onclick();assert.equal(h.run('state.id'),1,'words still have to be heard');
});
