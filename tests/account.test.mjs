import test from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPairSync,createSign} from 'node:crypto';
import {verifyGoogleIdToken,resetKeyCache,makeSession,readSession,cleanData,mergeData,lineSignIn,COOKIE} from '../netlify/account-core.mjs';
import handler from '../netlify/functions/account.mjs';
const CLIENT='client-123.apps.googleusercontent.com',SECRET='x'.repeat(40);
const {privateKey,publicKey}=generateKeyPairSync('rsa',{modulusLength:2048});
const jwks={keys:[{...publicKey.export({format:'jwk'}),kid:'k1',alg:'RS256',use:'sig'}]};
const fetchImpl=async()=>new Response(JSON.stringify(jwks),{headers:{'cache-control':'max-age=60'}});
const b64=o=>Buffer.from(JSON.stringify(o)).toString('base64url');
function token(claims,{kid='k1',key=privateKey}={}){const head=b64({alg:'RS256',kid,typ:'JWT'}),body=b64(claims);return `${head}.${body}.${createSign('RSA-SHA256').update(`${head}.${body}`).sign(key).toString('base64url')}`}
const good=()=>({iss:'https://accounts.google.com',aud:CLIENT,sub:'1001',email:'kid@example.com',email_verified:true,name:'Mali Test',picture:'https://lh3.googleusercontent.com/a/x',exp:Math.floor(Date.now()/1000)+600});
test('a Google ID token signed by Google for this client is accepted',async()=>{resetKeyCache();
 const who=await verifyGoogleIdToken(token(good()),CLIENT,{fetchImpl});
 assert.deepEqual(who,{sub:'1001',email:'kid@example.com',name:'Mali Test',picture:'https://lh3.googleusercontent.com/a/x'});
});
test('tokens for another client, issuer, expired, unsigned or forged are rejected',async()=>{resetKeyCache();
 const other=generateKeyPairSync('rsa',{modulusLength:2048}).privateKey;
 for(const t of [token({...good(),aud:'someone-else'}),token({...good(),iss:'https://evil.example'}),token({...good(),exp:Math.floor(Date.now()/1000)-3600}),token(good(),{key:other}),token(good(),{kid:'missing'}),`${b64({alg:'none'})}.${b64(good())}.`,'not-a-token'])
  await assert.rejects(verifyGoogleIdToken(t,CLIENT,{fetchImpl}));
});
test('session cookies expire and cannot be altered',()=>{
 const value=makeSession('1001',SECRET);
 assert.equal(readSession(`${COOKIE}=${value}`,SECRET).sub,'1001');
 assert.equal(readSession(`${COOKIE}=${value}`,'y'.repeat(40)),null);
 const [body,mac]=value.split('.'),forged=Buffer.from(JSON.stringify({sub:'2002',exp:9e9})).toString('base64url');
 assert.equal(readSession(`${COOKIE}=${forged}.${mac}`,SECRET),null);
 assert.equal(readSession(`${COOKIE}=${makeSession('1001',SECRET,Date.now()-61*86400e3)}`,SECRET),null);
 assert.equal(readSession('',SECRET),null);assert.ok(body);
});
test('only the learning record is stored, and progress from two devices combines',()=>{
 const clean=cleanData({lang:'zh',id:99,chapter:3,progress:{1:{wrote:true,quiz:'yes',evil:true},50:{wrote:true},__proto__:{x:1}},revived:['Island A','Island A',5],quizOrders:{1:[1,2,3],2:[1,2,3,4],3:['a']},email:'leak@example.com'});
 assert.deepEqual(clean,{lang:'zh',chapter:3,progress:{1:{wrote:true}},revived:['Island A'],quizOrders:{1:[1,2,3]}});
 const merged=mergeData({lang:'en',id:4,progress:{1:{wrote:true},2:{quiz:true}},revived:['A']},{lang:'zh',id:6,progress:{1:{quiz:true},3:{heard:true}},revived:['B']});
 assert.deepEqual(merged.progress,{1:{wrote:true,quiz:true},2:{quiz:true},3:{heard:true}});
 assert.deepEqual(merged.revived,['A','B']);assert.equal(merged.id,6);assert.equal(merged.lang,'zh');
});
test('account endpoint refuses cross-site writes, bad CSRF and unconfigured sign-in',async()=>{
 const prior=process.env.SESSION_SECRET;
 try{
  delete process.env.SESSION_SECRET;
  let r=await handler(new Request('https://thai-sprout-learning.netlify.app/api/me'));
  assert.deepEqual(await r.json(),{clientId:'',line:false,user:null});
  assert.equal((await handler(new Request('https://thai-sprout-learning.netlify.app/api/auth/google',{method:'POST'}))).status,503);
  process.env.SESSION_SECRET=SECRET;
  r=await handler(new Request('https://thai-sprout-learning.netlify.app/api/me'));
  const me=await r.json();assert.equal(me.user,null);assert.match(me.clientId,/\.apps\.googleusercontent\.com$/);
  assert.equal((await handler(new Request('https://thai-sprout-learning.netlify.app/api/me',{method:'PUT',headers:{origin:'https://evil.example'},body:'{}'}))).status,403);
  assert.equal((await handler(new Request('https://thai-sprout-learning.netlify.app/api/me',{method:'PUT',headers:{origin:'https://thai-sprout-learning.netlify.app'},body:'{}'}))).status,401);
  assert.equal((await handler(new Request('https://thai-sprout-learning.netlify.app/api/auth/google'))).status,405);
  assert.equal((await handler(new Request('https://thai-sprout-learning.netlify.app/api/auth/google',{method:'POST',headers:{origin:'https://evil.example','content-type':'application/json'},body:'{"credential":"x"}'}))).status,403);
  r=await handler(new Request('https://thai-sprout-learning.netlify.app/api/auth/google',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded',cookie:'g_csrf_token=aaa'},body:'credential=x&g_csrf_token=bbb'}));
  assert.equal(r.status,303);assert.equal(r.headers.get('location'),'/?login=failed');assert.equal(r.headers.get('set-cookie'),null);
  r=await handler(new Request('https://thai-sprout-learning.netlify.app/api/me',{method:'DELETE',headers:{origin:'https://thai-sprout-learning.netlify.app'}}));
  assert.match(r.headers.get('set-cookie'),/Max-Age=0/);
 }finally{if(prior===undefined)delete process.env.SESSION_SECRET;else process.env.SESSION_SECRET=prior}
});

test('LINE sign-in trades the code with the channel secret and insists on our nonce',async()=>{
 const calls=[];
 const lineFetch=claims=>async(url,init)=>{calls.push([url,Object.fromEntries(init.body)]);return url.endsWith('/token')?Response.json({id_token:'idt'}):Response.json(claims)};
 const base={iss:'https://access.line.me',aud:'2012186443',sub:'U123',nonce:'n1',name:'Somchai',picture:'https://profile.line-scdn.net/abc'};
 const args={code:'c1',redirectUri:'https://x/api/auth/line/callback',channelId:'2012186443',channelSecret:'s3cret',nonce:'n1'};
 assert.deepEqual(await lineSignIn(args,{fetchImpl:lineFetch(base)}),{sub:'U123',email:'',name:'Somchai',picture:'https://profile.line-scdn.net/abc'});
 assert.equal(calls[0][1].client_secret,'s3cret');assert.equal(calls[1][1].nonce,'n1');
 for(const bad of [{nonce:'other'},{aud:'999'},{iss:'https://evil.example'},{sub:''}])await assert.rejects(lineSignIn(args,{fetchImpl:lineFetch({...base,...bad})}));
 await assert.rejects(lineSignIn(args,{fetchImpl:async()=>new Response('no',{status:400})}));
});
test('LINE start sets a state cookie; a callback with a different state is refused',async()=>{
 const prior={s:process.env.SESSION_SECRET,l:process.env.LINE_CHANNEL_SECRET};
 try{
  process.env.SESSION_SECRET=SECRET;delete process.env.LINE_CHANNEL_SECRET;
  let r=await handler(new Request('https://thai-sprout-learning.netlify.app/api/auth/line'));
  assert.equal(r.headers.get('location'),'/?login=unavailable');
  process.env.LINE_CHANNEL_SECRET='s3cret';
  r=await handler(new Request('https://thai-sprout-learning.netlify.app/api/auth/line'));
  const to=new URL(r.headers.get('location')),cookie=r.headers.get('set-cookie');
  assert.equal(to.origin,'https://access.line.me');assert.equal(to.searchParams.get('redirect_uri'),'https://thai-sprout-learning.netlify.app/api/auth/line/callback');
  assert.equal(to.searchParams.get('scope'),'profile openid');assert.ok(!to.href.includes('s3cret'));
  assert.match(cookie,new RegExp(`sprout_line=${to.searchParams.get('state')}\.${to.searchParams.get('nonce')};.*HttpOnly`));
  r=await handler(new Request('https://thai-sprout-learning.netlify.app/api/auth/line/callback?code=c&state=forged',{headers:{cookie:cookie.split(';')[0]}}));
  assert.equal(r.headers.get('location'),'/?login=failed');assert.ok(!r.headers.getSetCookie().some(c=>c.startsWith('sprout_session=')&&!c.includes('Max-Age=0')));
 }finally{for(const [k,v] of [['SESSION_SECRET',prior.s],['LINE_CHANNEL_SECRET',prior.l]])if(v===undefined)delete process.env[k];else process.env[k]=v}
});
