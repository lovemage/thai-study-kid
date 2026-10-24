import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../netlify/functions/voice.mjs';
import {pcmToWav,generateVoice,MODEL,VOICE} from '../netlify/voice-core.mjs';
import catalog from '../netlify/voice-catalog.json' with {type:'json'};
test('WAV preserves PCM samples and declares the matching byte length',()=>{const pcm=Buffer.from([1,0,255,127,0,128]);const wav=pcmToWav(pcm);assert.equal(wav.toString('ascii',0,4),'RIFF');assert.equal(wav.readUInt32LE(4),wav.length-8);assert.equal(wav.readUInt32LE(24),24000);assert.equal(wav.readUInt32LE(40),pcm.length);assert.deepEqual(wav.subarray(44),pcm);assert.throws(()=>pcmToWav(Buffer.alloc(0)))});
test('arbitrary prompts and invalid clip IDs are rejected before provider access',async()=>{for(const query of ['clip=letter-999','clip=__proto__','clip=letter-1&text=hello','text=hello']){let r=await handler(new Request('https://thai-sprout-learning.netlify.app/api/voice?'+query));assert.equal(r.status,400)}});
test('untrusted origins and mutation requests cannot generate audio',async()=>{assert.equal((await handler(new Request('https://x/api/voice?clip=letter-1',{headers:{origin:'https://unrelated.example'}}))).status,403);assert.equal((await handler(new Request('https://x/api/voice',{method:'POST'}))).status,405)});
test('status never returns credentials and reports missing configuration',async()=>{const prior=process.env.OPENROUTER_API_KEY;delete process.env.OPENROUTER_API_KEY;try{const response=await handler(new Request('https://x/api/voice?status=1'));const s=await response.json();assert.equal(s.configured,false);assert(!Object.keys(s).some(k=>/key|token|secret/i.test(k)))}finally{if(prior)process.env.OPENROUTER_API_KEY=prior}});
test('all 44 letters have Thai names, Thai words, three word-friend clips and English explanations',()=>{for(let i=1;i<=44;i++){for(const type of ['letter','word','explain','vocab'])for(const id of type==='vocab'?[1,2,3].map(k=>`vocab-${i}-${k}`):[`${type}-${i}`])assert(catalog[id]?.text.length>0,id);assert(!catalog[`letter-${i}`].text.includes('...'),'a letter name is said once; the app repeats it')}assert.equal(Object.keys(catalog).length,270,'fixed catalog: 44 x (letter, word, explain, 3 words) + 6 coach lines')});

test('OpenRouter receives fixed text and style separately and returns playable WAV',async()=>{
 const wav=await generateVoice({lang:'th',text:'ไก่'},'test-placeholder',async(url,options)=>{
  assert.equal(url,'https://openrouter.ai/api/v1/audio/speech');assert.equal(options.method,'POST');assert.equal(options.headers.Authorization,'Bearer test-placeholder');
  const body=JSON.parse(options.body);assert.equal(body.input,'ไก่');assert.equal(body.model,MODEL);assert.equal(body.voice,VOICE);assert.equal(body.response_format,'pcm');assert.match(body.instructions,/Thai/);
  return new Response(Buffer.from([1,0,2,0]),{headers:{'Content-Type':'audio/pcm'}});
 });assert.equal(wav.length,48);
});
test('provider errors, non-audio and oversized audio are rejected',async()=>{
 for(const response of [new Response('denied',{status:401}),new Response('{}',{headers:{'Content-Type':'application/json'}}),new Response(Buffer.alloc(24000*2*36),{headers:{'Content-Type':'audio/pcm'}})]){
  await assert.rejects(generateVoice({lang:'en',text:'Hello'},'test-placeholder',async()=>response));
 }
});
