import {createHmac,createPublicKey,createVerify,timingSafeEqual} from 'node:crypto';
// Members sign in with Google. The ID token is checked against Google's published keys, then the member gets
// a session cookie of our own: Google ID tokens last one hour, a returning child should stay signed in for weeks.
export const COOKIE='sprout_session';
export const SESSION_DAYS=60;
const LETTERS=44,CHAPTERS=11,ISSUERS=['accounts.google.com','https://accounts.google.com'];
const b64url=buf=>Buffer.from(buf).toString('base64url');
const fromB64url=s=>Buffer.from(s,'base64url');
let jwksCache={keys:null,until:0};
async function googleKeys(fetchImpl){
 if(jwksCache.keys&&Date.now()<jwksCache.until)return jwksCache.keys;
 const r=await fetchImpl('https://www.googleapis.com/oauth2/v3/certs');
 if(!r.ok)throw new Error('google_keys_unavailable');
 const age=Number(/max-age=(\d+)/.exec(r.headers.get('cache-control')||'')?.[1]||3600);
 jwksCache={keys:(await r.json()).keys,until:Date.now()+age*1000};
 return jwksCache.keys;
}
export function resetKeyCache(){jwksCache={keys:null,until:0}}
export async function verifyGoogleIdToken(token,clientId,{fetchImpl=fetch,now=Date.now()}={}){
 const parts=String(token||'').split('.');
 if(parts.length!==3||!clientId)throw new Error('invalid_token');
 const [h,p,s]=parts;let header,payload;
 try{header=JSON.parse(fromB64url(h));payload=JSON.parse(fromB64url(p))}catch{throw new Error('invalid_token')}
 if(header.alg!=='RS256'||!header.kid)throw new Error('invalid_token');
 const jwk=(await googleKeys(fetchImpl)).find(k=>k.kid===header.kid);
 if(!jwk)throw new Error('invalid_token');
 const ok=createVerify('RSA-SHA256').update(`${h}.${p}`).verify(createPublicKey({key:jwk,format:'jwk'}),fromB64url(s));
 if(!ok)throw new Error('invalid_token');
 const seconds=now/1000;
 if(payload.aud!==clientId||!ISSUERS.includes(payload.iss)||!(payload.exp>seconds-60)||!payload.sub)throw new Error('invalid_token');
 return {sub:String(payload.sub),email:payload.email_verified?String(payload.email||''):'',name:String(payload.name||payload.given_name||'').slice(0,80),picture:/^https:\/\/[a-z0-9.-]+\.googleusercontent\.com\//.test(payload.picture||'')?payload.picture:''};
}
// LINE Login (OpenID Connect, code flow): the server trades the one-time code for an ID token using the channel secret,
// then LINE's verify endpoint checks signature, audience, expiry and our nonce.
export const LINE_AUTHORIZE='https://access.line.me/oauth2/v2.1/authorize';
export async function lineSignIn({code,redirectUri,channelId,channelSecret,nonce},{fetchImpl=fetch}={}){
 if(!code||!channelId||!channelSecret||!nonce)throw new Error('invalid_login');
 const form=body=>({method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(body)});
 const t=await fetchImpl('https://api.line.me/oauth2/v2.1/token',form({grant_type:'authorization_code',code,redirect_uri:redirectUri,client_id:channelId,client_secret:channelSecret}));
 if(!t.ok)throw new Error('invalid_login');
 const {id_token:idToken}=await t.json();if(!idToken)throw new Error('invalid_login');
 const v=await fetchImpl('https://api.line.me/oauth2/v2.1/verify',form({id_token:idToken,client_id:channelId,nonce}));
 if(!v.ok)throw new Error('invalid_login');
 const c=await v.json();
 if(c.iss!=='https://access.line.me'||c.aud!==channelId||c.nonce!==nonce||!c.sub)throw new Error('invalid_login');
 return {sub:String(c.sub),email:'',name:String(c.name||'').slice(0,80),picture:/^https:\/\/profile\.line-scdn\.net\//.test(c.picture||'')?c.picture:''};
}
const sign=(body,secret)=>b64url(createHmac('sha256',secret).update(body).digest());
export function makeSession(sub,secret,now=Date.now()){
 const body=b64url(JSON.stringify({sub,exp:Math.floor(now/1000)+SESSION_DAYS*86400}));
 return `${body}.${sign(body,secret)}`;
}
export function readSession(cookieHeader,secret,now=Date.now()){
 if(!secret)return null;
 const raw=parseCookies(cookieHeader)[COOKIE];if(!raw)return null;
 const [body,mac]=raw.split('.');if(!body||!mac)return null;
 const want=Buffer.from(sign(body,secret)),got=Buffer.from(mac);
 if(want.length!==got.length||!timingSafeEqual(want,got))return null;
 try{const s=JSON.parse(fromB64url(body));return typeof s.sub==='string'&&s.exp>now/1000?s:null}catch{return null}
}
export function parseCookies(header){
 const out={};for(const part of String(header||'').split(';')){const i=part.indexOf('=');if(i>0)out[part.slice(0,i).trim()]=decodeURIComponent(part.slice(i+1).trim())}return out;
}
export function sessionCookie(value,secure,maxAge=SESSION_DAYS*86400){
 return `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure?'; Secure':''}`;
}
// Only the learning record the app itself keeps is stored: language, last letter, finished steps, woken islands, quiz arrangements.
export function cleanData(input){
 const d=input&&typeof input==='object'?input:{},out={lang:d.lang==='zh'?'zh':'en',progress:{},revived:[],quizOrders:{}};
 const id=Number(d.id),chapter=Number(d.chapter);
 if(Number.isInteger(id)&&id>=1&&id<=LETTERS)out.id=id;
 if(Number.isInteger(chapter)&&chapter>=0&&chapter<CHAPTERS)out.chapter=chapter;
 for(let n=1;n<=LETTERS;n++){
  const p=d.progress?.[n];if(p&&typeof p==='object'){const flags={};for(const k of ['heard','wrote','quiz'])if(p[k]===true)flags[k]=true;if(Object.keys(flags).length)out.progress[n]=flags}
  const q=d.quizOrders?.[n];if(Array.isArray(q)&&q.length<=3&&q.every(x=>Number.isInteger(x)&&x>=1&&x<=LETTERS))out.quizOrders[n]=q.slice();
 }
 if(Array.isArray(d.revived))out.revived=[...new Set(d.revived.filter(x=>typeof x==='string'&&x.length<=40))].slice(0,CHAPTERS);
 return out;
}
// Progress only grows when two devices meet: a step finished anywhere stays finished. The newest write wins for everything else.
export function mergeData(stored,incoming){
 const a=cleanData(stored),b=cleanData(incoming),progress={...a.progress};
 for(const [n,flags] of Object.entries(b.progress))progress[n]={...progress[n],...flags};
 return cleanData({...a,...b,progress,revived:[...a.revived,...b.revived]});
}
