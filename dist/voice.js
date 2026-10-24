window.TeacherVoice=(()=>{
 const base=location.hostname.endsWith('netlify.app')?'':'https://thai-sprout-learning.netlify.app';
 let context,source,request,generation=0,configured=null,cache=new Map();
 const statusText=text=>{const e=document.querySelector('#voice-status');if(e)e.textContent=text};
 function stop(){generation++;request?.abort();request=null;try{source?.stop()}catch{}source=null;statusText('');document.querySelector('#stop-voice')?.setAttribute('hidden','')}
 async function status(){try{let r=await fetch(`${base}/api/voice?status=1`,{cache:'no-store'});let j=await r.json();configured=j.configured===true;return {configured,...j}}catch{configured=false;return{configured:false}}}
 async function play(id,fallback){
  stop();const ticket=generation;const tr=(en,zh)=>document.documentElement.lang==='zh-Hant'?zh:en;
  const AC=window.AudioContext||window.webkitAudioContext;
  if(!AC){setHint(tr('Read the words together. This browser cannot play the teacher voice.','一起讀讀文字吧。這個瀏覽器無法播放老師語音。'));return false}
  context??=new AC();await context.resume();if(ticket!==generation)return false;
  document.querySelector('#stop-voice')?.removeAttribute('hidden');statusText(tr('Getting the sound ready…','聲音準備中…'));
  let buffer=cache.get(id),backup=false;
  try{
   if(!buffer){request=new AbortController();const controller=request;let timer=setTimeout(()=>controller.abort(),28000);
    try{if(configured===false)throw new Error('not_configured');let r=await fetch(`${base}/api/voice?clip=${encodeURIComponent(id)}&v=4`,{signal:controller.signal});if(!r.ok||!r.headers.get('content-type')?.startsWith('audio/'))throw new Error('unavailable');buffer=await context.decodeAudioData(await r.arrayBuffer());cache.set(id,buffer)}
    catch(error){if(ticket!==generation)return false;if(!fallback)throw error;clearTimeout(timer);request=new AbortController();const backupController=request;timer=setTimeout(()=>backupController.abort(),8000);let r=await fetch(fallback,{signal:backupController.signal});if(!r.ok)throw new Error('fallback_unavailable');buffer=await context.decodeAudioData(await r.arrayBuffer());backup=true}
    finally{clearTimeout(timer)}
   }
   if(ticket!==generation)return false;source=context.createBufferSource();source.buffer=buffer;source.connect(context.destination);source.onended=()=>{if(ticket===generation){statusText('');document.querySelector('#stop-voice')?.setAttribute('hidden','')}};source.start();statusText(backup?tr('Original Thai recording','泰語原聲錄音'):tr('AI teacher voice','AI 老師語音'));return true;
  }catch{if(ticket===generation){statusText('');document.querySelector('#stop-voice')?.setAttribute('hidden','');setHint(tr('Read the hint with a grown-up. The teacher voice is not ready yet.','先和大人一起讀提示。老師語音還沒準備好。'))}return false}
 }
 status();return{play,stop,status};
})();
