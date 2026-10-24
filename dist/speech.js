window.SpeechPractice=(()=>{
 const tr=(en,zh)=>document.documentElement.lang==='zh-Hant'?zh:en;
 const mic='<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="24" y="8" width="16" height="30" rx="8"/><path d="M17 28v4a15 15 0 0 0 30 0v-4M32 47v9M23 56h18" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>';
 let worker,ready=false,loading,loadResolve,phase='idle',target,ticket=0,recorder,stream,context,timer,deadline,modelTimer,dialog;
 let core;const utils=()=>core??=import('./speech-core.mjs');
 const supported=()=>isSecureContext&&navigator.mediaDevices?.getUserMedia&&window.MediaRecorder&&window.Worker&&window.WebAssembly&&(window.AudioContext||window.webkitAudioContext);
 const text=message=>{const el=document.querySelector('#speech-message');if(el)el.textContent=message};
 function paint(next,message){
  phase=next;const panel=document.querySelector('.speech-practice'),button=document.querySelector('#speak');
  if(panel)panel.dataset.phase=next;
  if(button){button.disabled=next==='thinking'||next==='permission';button.setAttribute('aria-label',next==='recording'?tr('Stop recording','結束錄音'):tr('Say the picture word','說出圖片的泰語詞彙'));button.innerHTML=next==='recording'?'<span class="record-stop" aria-hidden="true"></span>':next==='match'?'<span aria-hidden="true">★</span>':mic}
  const cancelButton=document.querySelector('#speech-cancel');if(cancelButton)cancelButton.hidden=!['thinking','recording','permission'].includes(next);
  text(message);
 }
 function stopTracks(){stream?.getTracks().forEach(t=>t.stop());stream=null;clearInterval(timer);clearTimeout(deadline)}
 function resetWorker(){worker?.terminate();worker=null;ready=false;clearTimeout(modelTimer);loadResolve?.(false);loadResolve=null;loading=null}
 function cancel(){
  ticket++;stopTracks();if(recorder){recorder.onstop=null;recorder.ondataavailable=null;if(recorder.state!=='inactive')recorder.stop();recorder=null}
  if(context){context.close().catch(()=>{});context=null}
  if(phase==='thinking')resetWorker();
  paint('idle',tr('Tap the microphone. Say the picture word!','點麥克風，說說圖片的泰語名字！'));
 }
 function load(){
  if(ready)return Promise.resolve(true);if(loading)return loading;
  loading=new Promise(resolve=>loadResolve=resolve);
  const progress=new Map();
  const fail=(detail)=>{console.warn('Whisper preparation failed',detail?.message||detail?.diagnostic||'timeout or runtime error');resetWorker();const p=document.querySelector('#model-message');if(p)p.textContent=tr('Could not prepare Whisper. Check Wi-Fi, then try again. Older devices may not have enough memory.','Whisper 尚未準備好。請確認 Wi-Fi 後重試；較舊裝置可能記憶體不足。');const b=document.querySelector('#prepare-model');if(b){b.disabled=false;b.textContent=tr('Try download again','重新下載')}if(phase==='thinking')paint('idle',tr('Let’s try later. You can still listen and play!','晚點再試，也可以繼續聽聲音、玩遊戲喔！'))};
  try{worker=new Worker('./speech-worker.mjs',{type:'module'})}catch(error){fail(error);return Promise.resolve(false)}
  worker.onerror=fail;
  worker.onmessage=({data})=>{
   if(data.type==='progress'){
    if(data.file&&Number.isFinite(data.loaded))progress.set(data.file,data.loaded);
    const mb=Math.round([...progress.values()].reduce((a,b)=>a+b,0)/1e6),p=document.querySelector('#model-message');
    if(p)p.textContent=mb?tr(`Preparing Whisper · ${mb} MB received. Keep this screen open…`,`準備 Whisper・已讀取 ${mb} MB，請保持畫面開啟…`):tr('Preparing Whisper… saved files are reused when available.','準備 Whisper 中…可使用已儲存的模型檔。');
   }else if(data.type==='ready'){
    ready=true;clearTimeout(modelTimer);loadResolve?.(true);loadResolve=null;loading=null;
    try{localStorage.setItem('sprout-speech-consent','yes')}catch{}
    const p=document.querySelector('#model-message');if(p)p.textContent=tr('Ready! Close this window and tap the microphone to speak.','準備好了！關閉視窗，點麥克風就能跟讀。');
    const b=document.querySelector('#prepare-model');if(b){b.textContent=tr('Ready ✓','準備好了 ✓');b.disabled=true}
   }else if(data.type==='result'){
    if(data.id!==ticket||phase!=='thinking')return;
    clearTimeout(deadline);const current=target;
    utils().then(({assessTranscript})=>{
     if(data.id!==ticket)return;
     const verdict=assessTranscript(data.text,current);
     if(verdict==='match'){paint('match',tr('I heard our word! Lovely trying!','我聽到這個詞了！很棒的嘗試！'));TeacherVoice.effect('yay')}
     else{paint('retry',tr('Let’s listen, then tap the microphone and try again.','再聽一次，點麥克風試試看。'));TeacherVoice.play(`word-${current.id}`,`assets/letter-${current.id}.mp3`)}
     const heard=document.querySelector('#speech-heard');if(heard)heard.textContent=data.text?tr('I heard: ','我聽到：')+data.text.slice(0,80):tr('I could not hear clearly.','剛才沒有聽清楚。');
    });
   }else if(data.type==='error')fail(data);
  };
  modelTimer=setTimeout(fail,240000);worker.postMessage({type:'load'});return loading;
 }
 function setup(){
  cancel();dialog?.remove();dialog=document.createElement('dialog');dialog.className='speech-setup';
  dialog.innerHTML=`<div class="dialog-head"><h2>${tr('A little speaking helper','跟讀小幫手')}</h2><button aria-label="${tr('Close','關閉')}">×</button></div><div class="model-mascot">${mic}</div><p>${tr('For grown-ups: free Whisper recognition runs on this device. Download about 110 MB once over Wi-Fi. It needs no API key. Saved model files can be reused offline, unless the browser clears them.','請家長協助：免費 Whisper 辨識在裝置內運行，不需 API 金鑰。首次請用 Wi-Fi 下載約 110 MB。模型儲存後可離線使用，但瀏覽器可能清除快取。')}</p><p>${tr('Your child taps the microphone to record up to 6 seconds. Audio stays on this device and is discarded after checking. This compares recognized words, not pronunciation or Thai tones. Short words and children’s voices can be misunderstood; a retry does not mean your child was wrong. Older iPads may be slow or unsupported.','孩子點麥克風才開始錄音，每次最多 6 秒。聲音留在裝置內，檢查後丟棄。本功能比對辨識出的詞，不評分發音或泰語聲調。短詞、童聲可能辨識不準；提示重試不代表孩子唸錯。較舊 iPad 可能較慢或不支援。')}</p><p id="model-message" role="status">${ready?tr('Whisper is ready on this device.','Whisper 已準備好。'):tr('A grown-up can prepare the helper below.','請家長按下方按鈕準備模型。')}</p><button id="prepare-model" class="dialog-button" ${ready?'disabled':''}>${ready?tr('Ready ✓','準備好了 ✓'):tr('Download free helper','下載免費辨識模型')}</button>`;
  document.body.append(dialog);
  const close=()=>{if(!ready&&loading)resetWorker();dialog.close();dialog.remove();dialog=null};
  dialog.querySelector('.dialog-head button').onclick=close;dialog.addEventListener('cancel',e=>{e.preventDefault();close()});
  dialog.querySelector('#prepare-model').onclick=e=>{e.currentTarget.disabled=true;load()};dialog.showModal();
  // Once a grown-up has enabled it, reuse cached files without asking them again.
  try{if(!ready&&localStorage.getItem('sprout-speech-consent')==='yes'){dialog.querySelector('#prepare-model').disabled=true;load()}}catch{}
 }
 async function record(){
  if(phase==='recording'){recorder?.stop();return}
  if(!supported()){paint('idle',tr('Ask a grown-up to open this site in Safari or Chrome with microphone access.','請大人用 Safari 或 Chrome 開啟網站，並允許麥克風。'));return}
  if(!ready){setup();return}
  cancel();TeacherVoice.stop();const id=++ticket,current=target;
  const AC=window.AudioContext||window.webkitAudioContext;
  context=new AC();const ac=context;ac.resume().catch(()=>{});
  paint('permission',tr('Allow the microphone to say a word.','允許麥克風，就能說說看囉。'));
  try{
   const input=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,channelCount:1},video:false});
   if(id!==ticket){input.getTracks().forEach(t=>t.stop());return}stream=input;
   const mime=['audio/webm;codecs=opus','audio/mp4','audio/webm'].find(m=>MediaRecorder.isTypeSupported(m));
   recorder=new MediaRecorder(input,mime?{mimeType:mime}:{});const r=recorder,parts=[];
   r.ondataavailable=e=>{if(id===ticket&&e.data.size)parts.push(e.data)};
   r.onerror=()=>{if(id===ticket){cancel();paint('idle',tr('The microphone stopped. Tap to try again.','麥克風停下來了，點一下再試。'))}};
   r.onstop=async()=>{
    stopTracks();recorder=null;if(id!==ticket)return;
    paint('thinking',tr('Thinking… your voice stays here.','想一想…聲音留在這台裝置。'));
    try{
     const data=await new Blob(parts,{type:r.mimeType}).arrayBuffer();parts.length=0;
     const buffer=await ac.decodeAudioData(data);const {resample,isQuiet}=await utils();
     const audio=resample(Array.from({length:buffer.numberOfChannels},(_,i)=>buffer.getChannelData(i)),buffer.sampleRate);
     await ac.close();if(context===ac)context=null;if(id!==ticket)return;
     if(isQuiet(audio)){paint('retry',tr('A little louder? Tap and say the word again.','大聲一點點好嗎？點一下，再說一次。'));return}
     deadline=setTimeout(()=>{if(id===ticket){cancel();paint('idle',tr('This device needs a rest. Listen and try again later.','裝置需要休息一下，先聽聽看，晚點再試。'))}},90000);
     worker.postMessage({type:'transcribe',id,audio},[audio.buffer]);
    }catch{if(id===ticket){cancel();paint('idle',tr('I could not hear that. Tap to try again.','剛才沒有聽清楚，點一下再試。'))}}
   };
   r.start();let seconds=6;
   const prompt=()=>tr(`Say ${current.word} · ${seconds}`,`說說看 ${current.word}・${seconds}`);
   paint('recording',prompt());timer=setInterval(()=>{seconds=Math.max(0,seconds-1);text(prompt())},1000);
   deadline=setTimeout(()=>{if(r.state==='recording')r.stop()},6000);
  }catch(error){if(id===ticket){cancel();paint('idle',error.name==='NotAllowedError'?tr('Ask a grown-up to allow the microphone in browser settings.','請大人在瀏覽器設定允許麥克風。'):tr('Microphone unavailable. You can still listen and play.','暫時無法使用麥克風，仍可繼續聽和玩。'))}}
 }
 function mount(letter){
  target=letter;const anchor=document.querySelector('.learn-area');if(!anchor)return;
  const panel=document.createElement('section');panel.className='speech-practice';panel.dataset.phase='idle';
  panel.innerHTML=`<button id="speak" class="speak-button" aria-label="${tr('Say the picture word','說出圖片的泰語詞彙')}">${mic}</button><div class="speech-copy"><strong>${tr('Your turn!','換你說！')} <span lang="th">${letter.word}</span></strong><p id="speech-message" role="status">${tr('Tap the microphone. Say the picture word!','點麥克風，說說圖片的泰語名字！')}</p><small id="speech-heard"></small><div class="voice-ripples" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div></div><button id="speech-cancel" hidden class="speech-cancel">${tr('Cancel','取消')}</button>`;
  anchor.after(panel);panel.querySelector('#speak').onclick=record;panel.querySelector('#speech-cancel').onclick=cancel;
 }
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancel();if(loading){resetWorker();const b=document.querySelector('#prepare-model');if(b){b.disabled=false;b.textContent=tr('Resume download','繼續下載')}const p=document.querySelector('#model-message');if(p)p.textContent=tr('Download paused while the app was away.','離開畫面時，模型下載已暫停。')}}});
 window.addEventListener('pagehide',()=>{cancel();resetWorker()});
 document.addEventListener('teacher-voice-state',({detail})=>{if(['permission','recording','thinking'].includes(phase)&&detail.phase==='loading')cancel()});
 return{mount,setup,cancel};
})();
