window.TeacherVoice=(()=>{
 const base=location.hostname.endsWith('netlify.app')?'':'https://thai-sprout-learning.netlify.app';
 let context,source,gapTimer,generation=0,configured=null,apiPausedUntil=0,busyId=null,playingId=null;
 const downloads=new Map(),buffers=new Map();
 const tr=(en,zh)=>document.documentElement.lang==='zh-Hant'?zh:en;
 const apiURL=id=>`${base}/api/voice?clip=${encodeURIComponent(id)}&v=5`;
 // One download per clip: extra taps and prefetches share it, and stop() never cancels it, so the sound is ready next time.
 function download(url,timeout,needsAudio){
  if(downloads.has(url))return downloads.get(url);
  const job={started:performance.now(),loaded:0,total:0};
  job.promise=(async()=>{const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeout);
   try{const r=await fetch(url,{signal:controller.signal});if(!r.ok||needsAudio&&!r.headers.get('content-type')?.startsWith('audio/'))throw new Error('unavailable');
    job.total=Number(r.headers.get('content-length'))||0;if(!r.body?.getReader)return await r.arrayBuffer();
    const reader=r.body.getReader(),parts=[];for(;;){const {done,value}=await reader.read();if(done)break;parts.push(value);job.loaded+=value.length}
    const out=new Uint8Array(job.loaded);let at=0;for(const p of parts){out.set(p,at);at+=p.length}return out.buffer}
   finally{clearTimeout(timer)}})();
  job.promise.catch(()=>downloads.delete(url));downloads.set(url,job);return job}
 // The server may spend seconds generating before the first byte, so the bar creeps forward on time, then follows the bytes.
 function progressOf(job){const waited=(performance.now()-job.started)/1000;let p=.65*(1-Math.exp(-waited/4));if(job.total)p=Math.max(p,.65+.33*Math.min(1,job.loaded/job.total));else if(job.loaded)p=Math.max(p,.8);return Math.min(.98,p)}
 function mark(button,mode){document.querySelectorAll('.is-loading,.is-playing').forEach(b=>{b.classList.remove('is-loading','is-playing');b.removeAttribute('aria-busy');b.style.removeProperty('--p')});if(button&&mode){button.classList.add('is-'+mode);if(mode==='loading'){button.setAttribute('aria-busy','true');button.style.setProperty('--p','0')}}}
 async function decode(job){const data=await job.promise;return await context.decodeAudioData(data.slice(0))}
 const announce=(id,phase)=>document.dispatchEvent(new CustomEvent('teacher-voice-state',{detail:{id,phase}}));
 function stop(){const previous=busyId||playingId;generation++;clearTimeout(gapTimer);busyId=playingId=null;if(previous)announce(previous,'idle');try{source?.stop()}catch{}source=null;mark(null)}
 async function status(){try{let r=await fetch(`${base}/api/voice?status=1`,{cache:'no-store'});let j=await r.json();configured=j.configured===true;return {configured,...j}}catch{configured=false;return{configured:false}}}
 function prefetch(id){if(configured===false||buffers.has(id)||Date.now()<apiPausedUntil)return;download(apiURL(id),28000,true).promise.catch(()=>{})}
 // times: how often to say it in a row (a letter name is heard twice), with a short breath between.
 async function play(id,fallback,button,times=1){
  const AC=window.AudioContext||window.webkitAudioContext;
  if(!AC){setHint(tr('Read the words together. This browser cannot play the teacher voice.','一起讀讀文字吧。這個瀏覽器無法播放老師語音。'));return false}
  context??=new AC();const unlocked=context.resume();
  // Little fingers tap again and again while waiting: the same sound keeps loading or playing instead of starting over.
  if(id===busyId||id===playingId)return false;
  stop();const ticket=generation;busyId=id;announce(id,'loading');
  let buffer=buffers.get(id),backup=false,job=null,shown=0,slowTimer;
  if(!buffer){mark(button,'loading');
   const meter=()=>{if(ticket!==generation||busyId!==id)return;shown=Math.max(shown,progressOf(job));button?.style.setProperty('--p',shown.toFixed(3));requestAnimationFrame(meter)};
   slowTimer=setTimeout(()=>{if(ticket===generation)toast(tr('The teacher is getting the sound ready. Just a moment! 🌱','老師正在準備聲音，等一下下喔！🌱'))},5000);
   try{
    try{if(configured===false||Date.now()<apiPausedUntil)throw new Error('skip_api');job=download(apiURL(id),28000,true);meter();buffer=await decode(job);buffers.set(id,buffer);downloads.delete(apiURL(id))}
    catch(error){if(ticket!==generation)return false;if(error.message!=='skip_api')apiPausedUntil=Date.now()+60000;if(!fallback)throw error;job=download(fallback,8000,false);buffer=await decode(job);backup=true}
   }catch{clearTimeout(slowTimer);if(ticket===generation){busyId=null;mark(null);announce(id,'error');setHint(tr('Read the hint with a grown-up. The teacher voice is not ready yet.','先和大人一起讀提示。老師語音還沒準備好。'))}return false}
   clearTimeout(slowTimer);if(ticket!==generation)return false;button?.style.setProperty('--p','1')}
  try{await unlocked;if(context.state!=='running')throw new Error('audio_locked')}catch{if(ticket===generation){busyId=null;mark(null);announce(id,'error');setHint(tr('Tap the sound once more to listen.','再點一次聲音，就可以聽囉。'))}return false}
  if(ticket!==generation)return false;
  busyId=null;playingId=id;
  const say=left=>{source=context.createBufferSource();source.buffer=buffer;source.connect(context.destination);
   source.onended=()=>{if(ticket!==generation)return;if(left>1)gapTimer=setTimeout(()=>{if(ticket===generation)say(left-1)},650);else{playingId=null;mark(null)}};source.start()};
  say(times);mark(button,'playing');announce(id,'playing');
  if(backup)toast(tr('Playing the original Thai recording.','播放泰語原聲錄音。'));return true;
 }
 // Short reward sounds made on the device, so they play instantly even offline.
 function effect(kind){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;context??=new AC();context.resume().catch(()=>{});
  const now=context.currentTime,notes=kind==='yay'?[523.25,659.25,783.99,1046.5]:[392,311.13];
  notes.forEach((f,i)=>{const o=context.createOscillator(),g=context.createGain(),at=now+i*(kind==='yay'?.09:.16);o.type=kind==='yay'?'triangle':'sine';o.frequency.value=f;g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(kind==='yay'?.22:.16,at+.02);g.gain.exponentialRampToValueAtTime(.001,at+(kind==='yay'?.35:.3));o.connect(g).connect(context.destination);o.start(at);o.stop(at+.4)})}
 status();return{play,stop,status,prefetch,effect};
})();
