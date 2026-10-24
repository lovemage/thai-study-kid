const fs=require('node:fs'),vm=require('node:vm');let c={};vm.createContext(c);vm.runInContext(fs.readFileSync('dist/data.js','utf8')+fs.readFileSync('dist/vocab.js','utf8')+';globalThis.lettersOut=letters;globalThis.vocabOut=vocab',c);const clips={};
// What the picture shows, said naturally on the letter's first page (index = letter id - 1).
const pictures=['A chicken','An egg','A bottle','A water buffalo','A person','A temple bell','A snake','A plate','Small Thai cymbals','An elephant','A chain','A tree','A woman','A Thai dance crown','A goad, a stick for guiding cattle','A pedestal','Montho, a queen from a Thai story','An old man','A young novice monk','A child','A turtle','A bag','A soldier','A flag','A mouse','A leaf','A fish','A bee','A lid','A tray on a stand','A tooth','A sailing ship','A horse','A giant','A boat','A monkey','A ring','A pavilion','A hermit','A tiger','A chest','A star-shaped kite','A basin','An owl'];
// ฃ and ฅ are no longer written; their pages say so.
const historical={3:true,5:true};
for(const l of c.lettersOut){
 // Said once; the app plays a letter name twice, so the AI voice and the original recordings repeat the same way.
 clips[`letter-${l.id}`]={lang:'th',text:`${l.char}อ ${l.word}`};clips[`word-${l.id}`]={lang:'th',text:`${l.word}... ${l.word}`};
 clips[`explain-${l.id}`]={lang:'en',text:`Look! ${pictures[l.id-1]}. ${historical[l.id]?'This is an old Thai letter we do not write any more, but it still has a name.':'This is its Thai letter friend.'} Listen, then say it with me!`};
 c.vocabOut[l.id].forEach(([th],k)=>clips[`vocab-${l.id}-${k+1}`]={lang:'th',text:th})}
// One prompt per page: each plays when the page opens, and the Hint button repeats it.
Object.assign(clips,{
 'hint-listen':{lang:'en',text:'Tap the big sound button. Listen carefully, then say it with me. You can listen again!'},
 'hint-write':{lang:'en',text:'First, watch the moving line. Now use your finger to follow the pale letter. Go slowly. You can do it!'},
 'hint-play':{lang:'en',text:'Look at the picture. Listen to the sound, then tap its letter friend. Take your time!'},
 'try-again':{lang:'en',text:'A good try! Have another look. You can listen to the sound again.'},
 'well-done':{lang:'en',text:'You found it! Lovely work!'},
 'intro-words':{lang:'en',text:'Here are three more words with this letter. Tap each picture and listen to the end.'},
 'words-done':{lang:'en',text:'Wonderful listening! When you are ready, tap Next letter.'},
 'island-done':{lang:'en',text:'Look at you grow! You learned four new letter friends. Tap the button to see your island wake up!'},
 'chapter-done':{lang:'en',text:'Look how much you have learned! Give yourself a little clap. Now stretch your arms and take a break.'},
 'intro-map':{lang:'en',text:'Choose an island. Tap the island with the little sprout to start!'},
 'intro-library':{lang:'en',text:'Here are all forty-four Thai letters. Tap a letter to explore it.'}});
fs.writeFileSync('netlify/voice-catalog.json',JSON.stringify(clips,null,2));console.log(Object.keys(clips).length+' fixed voice clips prepared.');
