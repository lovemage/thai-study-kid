export const MODEL='google/gemini-3.8-flash-tts';
export const VOICE='Sulafat';
export function pcmToWav(pcm){
  if(!pcm.length||pcm.length%2)throw new Error('invalid_audio');
  const h=Buffer.alloc(44);h.write('RIFF');h.writeUInt32LE(pcm.length+36,4);h.write('WAVE',8);h.write('fmt ',12);h.writeUInt32LE(16,16);h.writeUInt16LE(1,20);h.writeUInt16LE(1,22);h.writeUInt32LE(24000,24);h.writeUInt32LE(48000,28);h.writeUInt16LE(2,32);h.writeUInt16LE(16,34);h.write('data',36);h.writeUInt32LE(pcm.length,40);return Buffer.concat([h,pcm]);
}
export async function generateVoice(clip,key,fetcher=fetch){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),23000);
  try{
    const response=await fetcher('https://openrouter.ai/api/v1/audio/speech',{
      method:'POST',signal:controller.signal,
      headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json','HTTP-Referer':'https://thai-sprout-learning.netlify.app','X-Title':'Thai Sprout'},
      body:JSON.stringify({model:MODEL,voice:VOICE,input:clip.text,response_format:'pcm',
        instructions:`Warm, patient primary-school teacher speaking to a seven-year-old. Natural, gently playful and encouraging. Clear articulation, short relaxed pauses and a slightly slower pace. ${clip.lang==='th'?'Standard Central Thai with accurate lexical tones.':'Clear friendly English.'}`})
    });
    if(!response.ok)throw new Error(`provider_http_${response.status}`);
    if(!response.headers.get('content-type')?.startsWith('audio/pcm'))throw new Error('invalid_audio_type');
    const reader=response.body.getReader();const chunks=[];let size=0;
    for(;;){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>24000*2*35){await reader.cancel();throw new Error('audio_too_long')}chunks.push(Buffer.from(value))}
    return pcmToWav(Buffer.concat(chunks));
  }finally{clearTimeout(timer)}
}
