const VERSION='sprout-pwa-16';
const SHELL=[ './assets/ui/paper.webp','./assets/ui/grain.webp','./assets/ui/kraft.webp','./assets/ui/sea.webp','./assets/ui/dots.webp','./','./index.html','./style.css','./data.js','./vocab.js','./art.js','./islands.js','./voice.js','./app.js','./drawing.js','./speech.js','./speech-core.mjs','./pwa.js','./account.js','./terms.html','./privacy.html','./legal.css','./manifest.webmanifest','./assets/writing.json','./assets/icon-180.png','./assets/icon-192.png','./assets/icon-512.png','./assets/icon-maskable.png',...Array.from({length:44},(_,i)=>`./assets/letter-${i+1}.mp3`) ];
// Do not skipWaiting: a new release activates after all old app windows close.
// This avoids replacing a lesson while a child is drawing or speaking.
// Fetch the release straight from the server: a stale browser HTTP cache would otherwise freeze an old file into the new version.
self.addEventListener('install',event=>event.waitUntil(caches.open(VERSION).then(cache=>cache.addAll(SHELL.map(path=>new Request(path,{cache:'reload'}))))));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 for(const name of await caches.keys())if(name.startsWith('sprout-pwa-')&&name!==VERSION||name==='sprout-lesson-audio-v1')await caches.delete(name);
 await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url);
 if(req.method!=='GET')return;
 // Only fixed public lesson audio is cached from the API, never status responses.
 if(url.pathname==='/api/voice'&&url.searchParams.has('clip')&&[self.location.origin,'https://thai-sprout-learning.netlify.app'].includes(url.origin)){
  event.respondWith((async()=>{const cache=await caches.open('sprout-lesson-audio-v2'),hit=await cache.match(req);if(hit)return hit;
   const response=await fetch(req);if(response.ok&&response.headers.get('content-type')?.startsWith('audio/'))await cache.put(req,response.clone());return response;})());return;
 }
 if(url.origin!==self.location.origin||url.pathname.startsWith('/api/'))return;
 if(req.mode==='navigate'){
  event.respondWith((async()=>{
   // Use this worker's complete release, keeping HTML and JS in sync. The terms and privacy pages are their own documents.
   const cache=await caches.open(VERSION),page=/^\/(terms|privacy)(\.html)?$/.exec(url.pathname);
   if(page)return await cache.match(`./${page[1]}.html`)||fetch(req);
   return await cache.match('./index.html')||fetch(req);
  })());return;
 }
 event.respondWith((async()=>{
  const cache=await caches.open(VERSION),hit=await cache.match(req,{ignoreSearch:true});if(hit)return hit;
  const response=await fetch(req);
  // Word-card illustrations are kept once seen, so a finished letter's cards also work offline.
  if(response.ok&&(SHELL.some(path=>new URL(path,self.location).pathname===url.pathname)||/^\/assets\/(vocab|letters)\//.test(url.pathname)))await cache.put(req,response.clone());
  return response;
 })());
});
