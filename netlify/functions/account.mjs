import {getStore} from '@netlify/blobs';
import {randomBytes} from 'node:crypto';
import {verifyGoogleIdToken,lineSignIn,LINE_AUTHORIZE,makeSession,readSession,parseCookies,sessionCookie,cleanData,mergeData} from '../account-core.mjs';
// Client and channel IDs are public (every browser sees them); the session secret and LINE channel secret live only in Netlify environment variables.
export const CLIENT_ID='728760931091-fu8m0utt53tn4ejd9hdsgahv33n72lhs.apps.googleusercontent.com';
export const LINE_CHANNEL_ID='2012186443';
const MAX_BODY=64*1024,LINE_COOKIE='sprout_line';
const store=()=>getStore({name:'thai-sprout-members',consistency:'strong'});
// A member is one Google or one LINE account: "google:<sub>" or "line:<sub>", stored at google/<sub> or line/<sub>.
const memberKey=id=>id.replace(':','/');
const json=(body,status=200,extra={})=>Response.json(body,{status,headers:{'Cache-Control':'no-store',...extra}});
const back=(location,cookies=[])=>{const headers=new Headers({Location:location,'Cache-Control':'no-store'});for(const c of cookies)headers.append('Set-Cookie',c);return new Response(null,{status:303,headers})};
const publicUser=(id,profile={})=>({id,provider:id.split(':')[0],name:profile.name||'',email:profile.email||'',picture:profile.picture||''});
async function readBody(req){const text=await req.text();if(text.length>MAX_BODY)throw new Error('too_large');return text}
async function remember(id,who){
 const s=store(),old=await s.get(memberKey(id),{type:'json'}),now=new Date().toISOString();
 await s.setJSON(memberKey(id),{data:old?.data||null,createdAt:old?.createdAt||now,updatedAt:old?.updatedAt||now,profile:{name:who.name,email:who.email,picture:who.picture}});
}
async function googleLogin(req,url,env){
 const type=req.headers.get('content-type')||'',form=type.startsWith('application/x-www-form-urlencoded');
 // Redirect sign-in (installed iPad app): Google posts the form here. Popup sign-in: the page posts JSON from our own origin.
 const fail=code=>form?back(`/?login=${code}`):json({error:code},400);
 let credential;
 try{
  const text=await readBody(req);
  if(form){const f=new URLSearchParams(text),csrf=f.get('g_csrf_token');if(!csrf||csrf!==parseCookies(req.headers.get('cookie')).g_csrf_token)return fail('failed');credential=f.get('credential')}
  else{if(req.headers.get('origin')!==url.origin)return json({error:'origin_not_allowed'},403);credential=JSON.parse(text).credential}
 }catch{return fail('failed')}
 let who;try{who=await verifyGoogleIdToken(credential,env.clientId)}catch{return fail('failed')}
 const id=`google:${who.sub}`;
 try{await remember(id,who)}catch{return fail('unavailable')}
 const cookie=sessionCookie(makeSession(id,env.secret),url.protocol==='https:');
 if(form)return back('/',[cookie]);
 return json({user:publicUser(id,who)},200,{'Set-Cookie':cookie});
}
// LINE: /api/auth/line sends the browser to LINE with a fresh state and nonce, kept in a short-lived cookie; LINE returns to /callback.
async function lineLogin(req,url,env){
 const secure=url.protocol==='https:',redirectUri=`${url.origin}/api/auth/line/callback`;
 const scoped=(value,maxAge)=>`${LINE_COOKIE}=${value}; Path=/api/auth/line; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure?'; Secure':''}`;
 if(url.pathname==='/api/auth/line'){
  const state=randomBytes(16).toString('base64url'),nonce=randomBytes(16).toString('base64url');
  const to=new URL(LINE_AUTHORIZE);to.search=new URLSearchParams({response_type:'code',client_id:env.lineId,redirect_uri:redirectUri,state,scope:'profile openid',nonce});
  return new Response(null,{status:302,headers:{Location:to.href,'Set-Cookie':scoped(`${state}.${nonce}`,600),'Cache-Control':'no-store'}});
 }
 const clear=scoped('',0),[state,nonce]=(parseCookies(req.headers.get('cookie'))[LINE_COOKIE]||'').split('.');
 if(!state||url.searchParams.get('state')!==state)return back('/?login=failed',[clear]);
 if(url.searchParams.get('error'))return back('/?login=cancelled',[clear]);
 let who;try{who=await lineSignIn({code:url.searchParams.get('code'),redirectUri,channelId:env.lineId,channelSecret:env.lineSecret,nonce})}catch{return back('/?login=failed',[clear])}
 const id=`line:${who.sub}`;
 try{await remember(id,who)}catch{return back('/?login=unavailable',[clear])}
 return back('/',[clear,sessionCookie(makeSession(id,env.secret),secure)]);
}
export default async function handler(req){
 const url=new URL(req.url),secret=process.env.SESSION_SECRET||'',lineSecret=process.env.LINE_CHANNEL_SECRET||'';
 const env={secret,clientId:process.env.GOOGLE_CLIENT_ID||CLIENT_ID,lineId:process.env.LINE_CHANNEL_ID||LINE_CHANNEL_ID,lineSecret};
 const configured=secret.length>=32,lineReady=configured&&!!env.lineId&&!!lineSecret;
 if(url.pathname==='/api/auth/google'){
  if(req.method!=='POST')return json({error:'method_not_allowed'},405);
  if(!configured)return json({error:'auth_not_configured'},503);
  return googleLogin(req,url,env);
 }
 if(url.pathname.startsWith('/api/auth/line')){
  if(req.method!=='GET')return json({error:'method_not_allowed'},405);
  if(!lineReady)return back('/?login=unavailable');
  return lineLogin(req,url,env);
 }
 if(req.method!=='GET'&&req.headers.get('origin')!==url.origin)return json({error:'origin_not_allowed'},403);
 const session=configured?readSession(req.headers.get('cookie'),secret):null;
 if(req.method==='DELETE')return json({ok:true},200,{'Set-Cookie':sessionCookie('',url.protocol==='https:',0)});
 const providers={clientId:configured?env.clientId:'',line:lineReady};
 if(req.method==='GET'){
  if(!session)return json({...providers,user:null});
  try{const rec=await store().get(memberKey(session.sub),{type:'json'});if(!rec)return json({...providers,user:null});return json({...providers,user:publicUser(session.sub,rec.profile),data:rec.data?cleanData(rec.data):null,updatedAt:rec.updatedAt})}
  catch{return json({error:'account_unavailable'},503)}
 }
 if(req.method==='PUT'){
  if(!session)return json({error:'signed_out'},401);
  let body;try{body=JSON.parse(await readBody(req))}catch{return json({error:'bad_request'},400)}
  try{
   const s=store(),rec=await s.get(memberKey(session.sub),{type:'json'});
   if(!rec)return json({error:'signed_out'},401);
   // Merge by default so two devices never undo each other's work. A grown-up's reset replaces the record.
   const data=body.replace===true||!rec.data?cleanData(body.data):mergeData(rec.data,body.data),updatedAt=new Date().toISOString();
   await s.setJSON(memberKey(session.sub),{...rec,data,updatedAt});
   return json({data,updatedAt});
  }catch{return json({error:'account_unavailable'},503)}
 }
 return json({error:'method_not_allowed'},405);
}
export const config={path:['/api/me','/api/auth/google','/api/auth/line','/api/auth/line/callback'],rateLimit:{windowLimit:60,windowSize:60,aggregateBy:['ip','domain'],action:'rate_limit'}};
