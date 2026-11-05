// Bundled after the public ASSETS object. Private content and code mappings live
// only in BLOG_CONTENT; the signing key lives only in BLOG_SESSION_SECRET.
const COOKIE='__Host-blog-grants';
const TTL=15*60;
const encoder=new TextEncoder();
const attempts=new Map();
const baseHeaders={'X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin','X-Robots-Tag':'noindex, noarchive','Permissions-Policy':'camera=(), microphone=(), geolocation=()'};
const denied=()=>json({error:'locked'},403);
function json(value,status=200,extra={}){return new Response(JSON.stringify(value),{status,headers:{...baseHeaders,'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...extra}});}
function encode(bytes){let s='';for(const b of bytes)s+=String.fromCharCode(b);return btoa(s).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');}
function decode(s){if(!/^[A-Za-z0-9_-]+$/.test(s))throw Error('encoding');return Uint8Array.from(atob(s.replaceAll('-','+').replaceAll('_','/').padEnd(Math.ceil(s.length/4)*4,'=')),c=>c.charCodeAt(0));}
function key(env){return crypto.subtle.importKey('raw',encoder.encode(env.BLOG_SESSION_SECRET),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);}
async function session(request,env){
  try{
    const raw=(request.headers.get('Cookie')||'').split(';').map(v=>v.trim()).find(v=>v.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);
    if(!raw||raw.length>4096)return {grants:[]};
    const [body,signature,extra]=raw.split('.');if(extra||!body||!signature)return {grants:[]};
    if(!await crypto.subtle.verify('HMAC',await key(env),decode(signature),encoder.encode(body)))return {grants:[]};
    const parsed=JSON.parse(new TextDecoder().decode(decode(body)));
    if(!Number.isInteger(parsed.exp)||parsed.exp<=Date.now()/1000||!Array.isArray(parsed.grants)||parsed.grants.some(v=>typeof v!=='string'))return {grants:[]};
    return parsed;
  }catch{return {grants:[]};}
}
async function cookie(grants,env){const body=encode(encoder.encode(JSON.stringify({grants,exp:Math.floor(Date.now()/1000)+TTL})));const sig=encode(new Uint8Array(await crypto.subtle.sign('HMAC',await key(env),encoder.encode(body))));return `${COOKIE}=${body}.${sig}; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=${TTL}`;}
function limiter(request){
  const now=Date.now(),ip=request.headers.get('CF-Connecting-IP')||'unknown';
  let slot=attempts.get(ip);if(!slot||slot.until<=now){slot={count:0,until:now+300000};attempts.set(ip,slot);}
  if(attempts.size>5000){for(const [k,v] of attempts)if(v.until<=now)attempts.delete(k);if(attempts.size>5000)attempts.delete(attempts.keys().next().value);}
  slot.count++;return slot.count<=30;
}
function validConfig(env){try{const data=JSON.parse(env.BLOG_CONTENT);return Array.isArray(data)?data:null;}catch{return null;}}
function sameOrigin(request){return request.headers.get('Origin')===new URL(request.url).origin;}
function publicMenu(item){const {label,title,description,accent}=item.menu;return {id:item.id,label,title,description,accent};}
export default {async fetch(request,env){
  const url=new URL(request.url),path=url.pathname;
  if(path.startsWith('/api/')){
    if(!env.BLOG_SESSION_SECRET||env.BLOG_SESSION_SECRET.length<32)return json({error:'unavailable'},503);
    const content=validConfig(env);if(!content)return json({error:'unavailable'},503);
    if(path==='/api/unlock'){
      if(request.method!=='POST')return json({error:'method'},405,{'Allow':'POST'});
      if(!sameOrigin(request))return denied();
      if(!limiter(request))return json({error:'slow_down'},429,{'Retry-After':'300'});
      if(Number(request.headers.get('Content-Length')||0)>256)return json({error:'invalid'},413);
      let payload;try{const body=await request.text();if(body.length>256)return json({error:'invalid'},413);payload=JSON.parse(body);}catch{return denied();}
      if(typeof payload?.code!=='string'||!/^[a-z-]{6}$/.test(payload.code))return denied();
      const item=content.find(c=>typeof c.code==='string'&&c.code.padEnd(6,'-')===payload.code);
      if(!item)return denied();
      const prior=await session(request,env);const grants=[...new Set([...prior.grants,item.id])].filter(id=>content.some(c=>c.id===id));
      return json({collectionId:item.id},200,{'Set-Cookie':await cookie(grants,env)});
    }
    if(path==='/api/lock'){
      if(request.method!=='POST')return json({error:'method'},405,{'Allow':'POST'});
      if(!sameOrigin(request))return denied();
      return json({locked:true},200,{'Set-Cookie':`${COOKIE}=; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=0`});
    }
    if(request.method!=='GET')return json({error:'method'},405,{'Allow':'GET'});
    const access=await session(request,env);
    const collectionMatch=path.match(/^\/api\/collection\/([A-Za-z0-9-]{1,80})$/);
    if(collectionMatch){
      const item=content.find(c=>c.id===collectionMatch[1]);
      if(!item||!access.grants.includes(item.id))return denied();
      return json({collection:publicMenu(item),posts:item.posts.map(({body,...summary})=>summary)});
    }
    const postMatch=path.match(/^\/api\/post\/([A-Za-z0-9-]{1,80})$/);
    if(postMatch){
      const item=content.find(c=>c.posts.some(p=>p.id===postMatch[1]));
      if(!item||!access.grants.includes(item.id))return denied();
      return json({collection:publicMenu(item),post:item.posts.find(p=>p.id===postMatch[1])});
    }
    return json({error:'not_found'},404);
  }
  if(request.method!=='GET'&&request.method!=='HEAD')return new Response('Method not allowed',{status:405,headers:{...baseHeaders,'Allow':'GET, HEAD'}});
  const asset=ASSETS[path];if(!asset)return new Response('Not found',{status:404,headers:{...baseHeaders,'Cache-Control':'no-store'}});
  const data=Uint8Array.from(atob(asset.data),c=>c.charCodeAt(0));
  return new Response(request.method==='HEAD'?null:data,{headers:{...baseHeaders,'Content-Type':asset.type,'Cache-Control':path.startsWith('/assets/')?'public, max-age=86400':'no-store','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; object-src 'none'; form-action 'self'"}});
}};
