// Speaking practice. The child says the picture word and the device's own dictation listens in Thai
// (Web Speech API: Safari on iPad, the same engine as keyboard dictation). Where dictation is missing or
// switched off, the child records, hears their own voice, then the teacher's: no judging, only encouragement.
window.SpeechPractice=(()=>{
 const tr=(en,zh)=>document.documentElement.lang==='zh-Hant'?zh:en;
 const mic='<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="24" y="8" width="16" height="30" rx="8"/><path d="M17 28v4a15 15 0 0 0 30 0v-4M32 47v9M23 56h18" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>';
 const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
 const LIMIT=6000;
 let phase='idle',target,ticket=0,recognizer,recorder,stream,timer,deadline,playback,dictationOff=false,dialog,core;
 const utils=()=>core??=import('./speech-core.mjs');
 const canRecord=()=>isSecureContext&&navigator.mediaDevices?.getUserMedia&&window.MediaRecorder;
 const useDictation=()=>!!Recognition&&!dictationOff;
 const text=message=>{const el=document.querySelector('#speech-message');if(el)el.textContent=message};
 const heardText=message=>{const el=document.querySelector('#speech-heard');if(el)el.textContent=message};
 const idleMessage=()=>useDictation()?tr('Tap the microphone. Say the picture word!','點麥克風，說說圖片的泰語名字！'):tr('Tap the microphone, say the word, then listen and compare!','點麥克風說一說，再聽聽看和老師比一比！');
 function paint(next,message){
  phase=next;const panel=document.querySelector('.speech-practice'),button=document.querySelector('#speak');
  if(panel)panel.dataset.phase=next;
  if(button){button.disabled=next==='thinking'||next==='permission'||next==='playback';button.setAttribute('aria-label',next==='recording'?tr('Stop','停止'):tr('Say the picture word','說出圖片的泰語詞彙'));button.innerHTML=next==='recording'?'<span class="record-stop" aria-hidden="true"></span>':next==='match'?'<span aria-hidden="true">★</span>':mic}
  const cancelButton=document.querySelector('#speech-cancel');if(cancelButton)cancelButton.hidden=!['thinking','recording','permission','playback'].includes(next);
  text(message);
 }
 function stopAll(){
  clearInterval(timer);clearTimeout(deadline);
  if(recognizer){recognizer.onresult=recognizer.onerror=recognizer.onend=null;try{recognizer.abort()}catch{}recognizer=null}
  if(recorder){recorder.ondataavailable=recorder.onstop=null;if(recorder.state!=='inactive')try{recorder.stop()}catch{}recorder=null}
  stream?.getTracks().forEach(t=>t.stop());stream=null;
  if(playback){playback.onended=null;playback.pause();URL.revokeObjectURL(playback.src);playback=null}
 }
 function cancel(){ticket++;stopAll();paint('idle',idleMessage())}
 function countdown(id,word){let seconds=LIMIT/1000;const label=()=>tr(`Say ${word} · ${seconds}`,`說說看 ${word}・${seconds}`);paint('recording',label());timer=setInterval(()=>{if(id!==ticket)return clearInterval(timer);seconds=Math.max(0,seconds-1);text(label())},1000)}
 function mount(letter){
  target=letter;const anchor=document.querySelector('.learn-area');if(!anchor)return;
  const panel=document.createElement('section');panel.className='speech-practice';panel.dataset.phase='idle';
  panel.innerHTML=`<button id="speak" class="speak-button" aria-label="${tr('Say the picture word','說出圖片的泰語詞彙')}">${mic}</button><div class="speech-copy"><strong>${tr('Your turn!','換你說！')} <span lang="th">${letter.word}</span></strong><p id="speech-message" role="status">${idleMessage()}</p><small id="speech-heard"></small><div class="voice-ripples" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div></div><button id="speech-cancel" hidden class="speech-cancel">${tr('Cancel','取消')}</button>`;
  anchor.after(panel);panel.querySelector('#speak').onclick=record;panel.querySelector('#speech-cancel').onclick=cancel;phase='idle';
 }
 function record(){
  // A second tap while listening means "I'm done".
  if(phase==='recording'){if(recognizer)recognizer.stop();else if(recorder?.state==='recording')recorder.stop();return}
  if(['thinking','permission','playback'].includes(phase))return;
  cancel();TeacherVoice.stop();heardText('');const id=++ticket,current=target;
  // Dictation has to start inside the tap itself, so nothing here waits before listen().
  if(useDictation())return listen(id,current);
  if(canRecord())return compare(id,current);
  paint('idle',tr('Ask a grown-up to open this site in Safari with the microphone allowed.','請大人用 Safari 開啟網站，並允許麥克風。'));
 }
 function listen(id,current){
  const r=new Recognition(),heard=[];recognizer=r;
  r.lang='th-TH';r.interimResults=false;r.continuous=false;r.maxAlternatives=5;
  r.onresult=e=>{for(const result of e.results)for(const alternative of result)if(alternative.transcript)heard.push(alternative.transcript)};
  r.onerror=e=>{
   if(id!==ticket)return;stopAll();
   if(e.error==='no-speech')return paint('retry',tr('A little louder? Tap and say the word again.','大聲一點點好嗎？點一下，再說一次。'));
   if(e.error==='aborted')return paint('idle',idleMessage());
   if(e.error==='not-allowed')return paint('idle',tr('Ask a grown-up to allow the microphone and speech recognition, then tap again.','請大人允許麥克風和語音辨識，再點一次。'));
   // Dictation switched off, unavailable or offline: keep practising with record-and-compare instead.
   dictationOff=true;paint('idle',tr('Let’s record and compare instead. Tap the microphone!','改成錄音比一比吧！點麥克風。'));
  };
  r.onend=()=>{if(id!==ticket||recognizer!==r)return;recognizer=null;clearInterval(timer);clearTimeout(deadline);judge(id,current,heard)};
  try{r.start()}catch{dictationOff=true;recognizer=null;return canRecord()?compare(id,current):paint('idle',idleMessage())}
  countdown(id,current.word);deadline=setTimeout(()=>{if(id===ticket&&recognizer===r)r.stop()},LIMIT);
 }
 async function judge(id,current,heard){
  if(!heard.length)return paint('retry',tr('I could not hear clearly. Tap and try again.','剛才沒有聽清楚，點一下再試。'));
  paint('thinking',tr('Listening…','聽一聽…'));
  const {assessTranscript}=await utils();if(id!==ticket)return;
  // Dictation offers several guesses; the child gets the benefit of the doubt if any of them is the word.
  if(heard.some(t=>assessTranscript(t,current)==='match')){paint('match',tr('I heard our word! Lovely!','我聽到了！說得真好！'));TeacherVoice.effect('yay');heardText('')}
  else{paint('retry',tr('Good try! Listen once more, then tap and try again.','很棒的嘗試！再聽一次，點麥克風再試試。'));heardText(tr('I heard: ','我聽到：')+heard[0].slice(0,60));TeacherVoice.play(`word-${current.id}`,`assets/letter-${current.id}.mp3`)}
 }
 async function compare(id,current){
  // iPad Safari only plays sound unlocked by a tap, so the speaker for the child's own voice is opened now, inside the tap.
  const AC=window.AudioContext||window.webkitAudioContext,speaker=AC?new AC():null;speaker?.resume().catch(()=>{});
  paint('permission',tr('Allow the microphone to say a word.','允許麥克風，就能說說看囉。'));
  try{
   const input=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true},video:false});
   if(id!==ticket){input.getTracks().forEach(t=>t.stop());return}stream=input;
   const mime=['audio/mp4','audio/webm;codecs=opus','audio/webm'].find(m=>MediaRecorder.isTypeSupported?.(m));
   const rec=new MediaRecorder(input,mime?{mimeType:mime}:{}),parts=[];recorder=rec;
   rec.ondataavailable=e=>{if(id===ticket&&e.data.size)parts.push(e.data)};
   rec.onstop=()=>{
    stream?.getTracks().forEach(t=>t.stop());stream=null;recorder=null;clearInterval(timer);clearTimeout(deadline);if(id!==ticket){speaker?.close().catch(()=>{});return}
    const blob=new Blob(parts,{type:rec.mimeType||mime||'audio/mp4'});
    if(!blob.size)return paint('retry',tr('I could not hear that. Tap to try again.','剛才沒有錄到，點一下再試。'));
    const teacher=()=>{speaker?.close().catch(()=>{});if(id!==ticket)return;if(playback){URL.revokeObjectURL(playback.src);playback=null}paint('match',tr('Now the teacher. Do you sound alike?','換老師說，像不像呢？'));TeacherVoice.play(`word-${current.id}`,`assets/letter-${current.id}.mp3`)};
    paint('playback',tr('Here is your voice!','這是你的聲音！'));
    blob.arrayBuffer().then(data=>speaker.decodeAudioData(data)).then(buffer=>{if(id!==ticket)return;const source=speaker.createBufferSource();source.buffer=buffer;source.connect(speaker.destination);source.onended=teacher;source.start()})
     .catch(()=>{if(id!==ticket)return;playback=new Audio(URL.createObjectURL(blob));playback.onended=teacher;playback.play().catch(teacher)});
   };
   rec.start();countdown(id,current.word);deadline=setTimeout(()=>{if(rec.state==='recording')rec.stop()},LIMIT);
  }catch(error){speaker?.close().catch(()=>{});if(id===ticket){stopAll();paint('idle',error.name==='NotAllowedError'?tr('Ask a grown-up to allow the microphone in browser settings.','請大人在瀏覽器設定允許麥克風。'):tr('Microphone unavailable. You can still listen and play.','暫時無法使用麥克風，仍可繼續聽和玩。'))}}
 }
 // For grown-ups: what speaking practice needs on this device.
 function setup(){
  cancel();dialog?.remove();dialog=document.createElement('dialog');dialog.className='speech-setup';
  dialog.innerHTML=`<div class="dialog-head"><h2>${tr('Speaking practice','跟讀練習')}</h2><button aria-label="${tr('Close','關閉')}">×</button></div><div class="model-mascot">${mic}</div>
   <p>${Recognition?tr('This device can listen to Thai with its built-in dictation. Nothing to download.','這台裝置可以用內建聽寫聽泰語，不需要下載任何東西。'):tr('This browser has no built-in dictation. Children can still record, hear themselves and compare with the teacher.','這個瀏覽器沒有內建聽寫，孩子仍可錄音、聽自己的聲音，再和老師比一比。')}</p>
   <h3>${tr('On iPad','iPad 設定')}</h3><ol class="install-steps"><li><b>1</b><span>${tr('Settings → General → Keyboard → turn on Enable Dictation.','設定 → 一般 → 鍵盤 → 開啟「聽寫」。')}</span></li><li><b>2</b><span>${tr('Settings → Safari → Microphone → Ask or Allow.','設定 → Safari → 麥克風 → 詢問或允許。')}</span></li><li><b>3</b><span>${tr('When asked, tap Allow for the microphone and speech recognition.','出現提示時，允許使用麥克風與語音辨識。')}</span></li></ol>
   <p>${tr('Dictation is processed by Apple and may be sent to Apple’s servers. Thai Sprout itself does not upload or keep recordings. Short words and children’s voices are hard to recognise, so a “try again” is never a grade.','聽寫由 Apple 處理，可能會傳送到 Apple 伺服器；Thai Sprout 本身不上傳、不保存錄音。短詞和童聲不容易辨識，「再試一次」不代表念錯。')}</p>`;
  document.body.append(dialog);const close=()=>{dialog.close();dialog.remove();dialog=null};
  dialog.querySelector('.dialog-head button').onclick=close;dialog.addEventListener('cancel',e=>{e.preventDefault();close()});dialog.showModal();
 }
 document.addEventListener('visibilitychange',()=>{if(document.hidden)cancel()});
 window.addEventListener('pagehide',cancel);
 // The teacher starting to talk ends any listening, so the microphone never records the teacher.
 document.addEventListener('teacher-voice-state',({detail})=>{if(['permission','recording'].includes(phase)&&detail.phase==='loading')cancel()});
 return{mount,setup,cancel};
})();
