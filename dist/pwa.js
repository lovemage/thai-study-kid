window.SproutPWA=(()=>{
 const tr=(en,zh)=>document.documentElement.lang==='zh-Hant'?zh:en;
 let promptEvent,registration,installDialog,banner;
 const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
 const ios=()=>/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
 const share='<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 30V5m-8 8 8-8 8 8M15 22H8v20h32V22h-7"/></svg>';
 const home='<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="7" y="7" width="34" height="34" rx="7"/><path d="M24 15v18m-9-9h18"/></svg>';
 function dismiss(){banner?.remove();banner=null;try{localStorage.setItem('sprout-install-dismissed',String(Date.now()))}catch{}}
 async function install(){
  if(!promptEvent){guide();return}
  const event=promptEvent;promptEvent=null;await event.prompt();const result=await event.userChoice;
  if(result.outcome==='accepted'){dismiss();installDialog?.close()}
  else guide();
 }
 function guide(){
  installDialog?.remove();installDialog=document.createElement('dialog');installDialog.className='install-guide';
  const isApple=ios();
  installDialog.innerHTML=`<div class="dialog-head"><h2>${tr('A little home for Thai Sprout','把小芽帶回主畫面')}</h2><button aria-label="${tr('Close','關閉')}">×</button></div><img class="install-icon" src="assets/icon-192.png" width="80" height="80" alt="Thai Sprout"><p>${tr('A grown-up can add Thai Sprout to the Home Screen. Next time, tap the little sprout to learn. No account needed.','請家長把 Thai Sprout 加入主畫面，下次點小芽圖示就能學習，不需要帳號。')}</p>${standalone()?`<p>${tr('You are already using the installed app.','你已在主畫面 App 裡了！')}</p>`:promptEvent?`<button class="dialog-button install-now">${tr('Install Thai Sprout','安裝 Thai Sprout')}</button>`:isApple?`<ol class="install-steps"><li><b>1</b><span>${tr('Open this website in Safari.','使用 Safari 開啟這個網站。')}</span></li><li><b>2</b>${share}<span>${tr('Tap Share. It may be inside the ••• menu.','點「分享」，有時在 ••• 選單裡。')}</span></li><li><b>3</b>${home}<span>${tr('Choose Add to Home Screen, then Add. Leave Open as Web App on if shown.','選「加入主畫面」→「新增」。若出現「作為網頁 App 開啟」，請保持開啟。')}</span></li></ol>`:`<ol class="install-steps"><li><b>1</b><span>${tr('Open this website in Chrome on Android.','Android 請用 Chrome 開啟網站。')}</span></li><li><b>2</b><span class="menu-dots" aria-hidden="true">⋮</span><span>${tr('Open the browser menu.','點瀏覽器選單。')}</span></li><li><b>3</b>${home}<span>${tr('Choose Install app or Add to Home screen. On a computer, look for the install icon beside the address bar.','選「安裝應用程式」或「加到主畫面」。電腦可找網址列旁的安裝圖示。')}</span></li></ol>`}<p class="install-footnote">${tr('Open online once to save lessons. Writing and original Thai recordings work offline after saving. New AI teacher sounds and speaking practice need internet. Progress belongs to this browser or installed app and may not transfer automatically.','先連網開啟，儲存後可離線寫字、聽原聲錄音。新的 AI 老師語音和跟讀辨識需要網路。進度存在目前的瀏覽器或 App，安裝後不一定自動帶入。')}</p><button class="dialog-button guide-done">${tr('Got it — let’s learn','知道了，開始學習')}</button>`;
  document.body.append(installDialog);const close=()=>{installDialog.close();dismiss()};
  installDialog.querySelector('.dialog-head button').onclick=close;installDialog.querySelector('.guide-done').onclick=close;
  installDialog.querySelector('.install-now')?.addEventListener('click',install);
  installDialog.addEventListener('cancel',e=>{e.preventDefault();close()});installDialog.showModal();
 }
 function offer(){
  if(standalone()||banner)return;
  try{if(Date.now()-Number(localStorage.getItem('sprout-install-dismissed')||0)<7*86400000)return}catch{}
  banner=document.createElement('aside');banner.className='install-banner';banner.setAttribute('aria-label',tr('Install Thai Sprout','安裝 Thai Sprout'));
  banner.innerHTML=`<img src="assets/icon-192.png" width="52" height="52" alt=""><div><strong>${tr('Keep a little sprout on your Home Screen','把小芽放到主畫面')}</strong><span>${tr('Ask a grown-up to help.','請大人幫忙，下次點圖示就能學習。')}</span></div><button class="install-open">${promptEvent?tr('Install','安裝'):tr('Show me','看看怎麼做')}</button><button class="install-dismiss" aria-label="${tr('Maybe later','稍後再說')}">×</button>`;
  document.querySelector('header')?.after(banner);banner.querySelector('.install-open').onclick=guide;banner.querySelector('.install-dismiss').onclick=dismiss;
 }
 window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();promptEvent=e;offer()});
 window.addEventListener('appinstalled',()=>{promptEvent=null;dismiss();installDialog?.close()});
 window.addEventListener('load',async()=>{
  offer();
  // Reinsert only after a page render; app renders replace the header and banner.
  new MutationObserver(()=>{if(banner&&!banner.isConnected){banner=null;offer()}}).observe(document.querySelector('#app'),{childList:true});
  if(!('serviceWorker' in navigator))return;
  try{registration=await navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'});registration.update().catch(()=>{})}catch{}
 });
 return{guide};
})();
