import {getStore} from '@netlify/blobs';
import {createHash} from 'node:crypto';
import catalog from '../voice-catalog.json' with {type:'json'};
import {generateVoice,MODEL,VOICE} from '../voice-core.mjs';
const origins=new Set(['https://thai-sprout-learning.netlify.app','https://thai-sprout-learning-7.stonymug34.chatgpt.site','http://127.0.0.1:5173','http://localhost:8888']);
const inflight=new Map();
export default async function handler(req){
  const origin=req.headers.get('origin');
  const headers={'Cache-Control':'no-store','Vary':'Origin','Access-Control-Allow-Methods':'GET, OPTIONS','Access-Control-Expose-Headers':'X-Voice-Source'};
  if(origin){if(!origins.has(origin))return new Response('Origin not allowed',{status:403});headers['Access-Control-Allow-Origin']=origin}
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
  if(req.method!=='GET')return new Response('Method not allowed',{status:405,headers});
  const url=new URL(req.url),id=url.searchParams.get('clip');
  const key=process.env.OPENROUTER_API_KEY||'';
  const configured=Boolean(key.trim());
  if(url.searchParams.get('status')==='1')return Response.json({configured,provider:'OpenRouter',model:MODEL,voice:VOICE,aiGenerated:true},{headers});
  if(!id||!Object.hasOwn(catalog,id)||[...url.searchParams.keys()].some(k=>!['clip','v'].includes(k)))return Response.json({error:'unknown_clip'},{status:400,headers});
  const clip=catalog[id];
  const cacheKey=createHash('sha256').update(JSON.stringify({clip,MODEL,VOICE,version:4})).digest('hex');
  let store;
  try{
    store=getStore({name:'thai-sprout-teacher-voice',consistency:'strong'});
    let cached=await store.get(cacheKey,{type:'arrayBuffer'});
    if(cached)return new Response(cached,{headers:{...headers,'Content-Type':'audio/wav','Cache-Control':'public, max-age=604800','Netlify-CDN-Cache-Control':'public, durable, s-maxage=31536000','X-Voice-Source':'ai-cached'}});
  }catch{return Response.json({error:'voice_cache_unavailable'},{status:503,headers})}
  if(!configured)return Response.json({error:'voice_not_configured'},{status:503,headers});
  try{
    if(!inflight.has(cacheKey))inflight.set(cacheKey,(async()=>{const wav=await generateVoice(clip,key);await store.set(cacheKey,wav);return wav})().finally(()=>inflight.delete(cacheKey)));
    const audio=await inflight.get(cacheKey);
    return new Response(audio,{headers:{...headers,'Content-Type':'audio/wav','Cache-Control':'public, max-age=604800','Netlify-CDN-Cache-Control':'public, durable, s-maxage=31536000','X-Voice-Source':'ai-generated'}});
  }catch{return Response.json({error:'voice_temporarily_unavailable'},{status:502,headers})}
}
export const config={path:'/api/voice',rateLimit:{windowLimit:24,windowSize:60,aggregateBy:['ip','domain'],action:'rate_limit'}};
