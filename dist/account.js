// Google and LINE sign-in and the member's saved record. Progress is also kept in the browser, so a remembered member can keep learning offline.
window.SproutAccount=(()=>{
 let clientId='',line=false,checked=false,user=null,timer=null,queued=null,changed=()=>{},gis=null,initialized=false;
 const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
 async function call(method,body,keepalive=false){
  const r=await fetch('/api/me',{method,credentials:'same-origin',cache:'no-store',keepalive,headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined});
  if(r.status===401)user=null;
  if(!r.ok)throw new Error(String(r.status));
  return r.json();
 }
 // owner: the member whose progress is in this browser ('' for a guest). A guest's progress joins the account on first sign-in;
 // another member's progress is never mixed in, the account's own record replaces it.
 async function start(owner,local){
  let me;try{me=await call('GET')}catch{checked=true;return null}
  checked=true;clientId=me.clientId||'';line=!!me.line;user=me.user||null;
  if(!user)return {user:null};
  if(owner&&owner!==user.id)return {user,data:me.data||{},replaced:true};
  try{const r=await call('PUT',{data:local});return {user,data:r.data}}catch{return {user,data:me.data}}
 }
 function flush(keepalive=false){clearTimeout(timer);if(!queued||!user)return;const data=queued;queued=null;call('PUT',{data},keepalive).catch(()=>{if(!queued)queued=data})}
 function save(data){if(!user)return;queued=data;clearTimeout(timer);timer=setTimeout(flush,1500)}
 async function reset(data){if(!user)return;queued=null;clearTimeout(timer);try{await call('PUT',{data,replace:true})}catch{}}
 async function signOut(){queued=null;clearTimeout(timer);try{await call('DELETE')}catch{}user=null;try{window.google?.accounts.id.disableAutoSelect()}catch{}}
 function loadGis(){
  return gis||=new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://accounts.google.com/gsi/client';s.async=true;s.onload=()=>resolve(window.google);s.onerror=()=>{gis=null;reject(new Error('gis'))};document.head.append(s)});
 }
 async function popupSignedIn({credential}){
  try{const r=await fetch('/api/auth/google',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({credential})});if(!r.ok)throw new Error();changed('signed-in')}
  catch{changed('failed')}
 }
 // The installed iPad app cannot rely on popups, so it signs in by redirect: Google posts back to the server, which returns to the island map.
 async function mountButton(el,lang,compact=false){
  if(!el||!clientId)return;
  try{
   const google=await loadGis();if(!el.isConnected)return;
   if(!initialized){google.accounts.id.initialize(standalone()?{client_id:clientId,ux_mode:'redirect',login_uri:location.origin+'/api/auth/google'}:{client_id:clientId,callback:popupSignedIn});initialized=true}
   el.replaceChildren();
   google.accounts.id.renderButton(el,{type:compact?'icon':'standard',theme:'outline',size:'large',shape:'pill',text:'signin_with',locale:lang==='zh'?'zh-TW':'en'});
  }catch{}
 }
 addEventListener('online',()=>flush());
 document.addEventListener('visibilitychange',()=>{if(document.hidden)flush(true)});
 return {start,save,reset,signOut,mountButton,onChange:fn=>changed=fn,get user(){return user},get available(){return !!clientId},get lineAvailable(){return line},get checked(){return checked}};
})();
