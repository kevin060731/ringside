(function(global){
const config=global.RINGSIDE_SUPABASE_CONFIG||{};
const sessionKey="ringside:supabase-session";
const clean=value=>String(value||"").trim();
const storage=typeof localStorage!=="undefined"?localStorage:null;
let session=null;
try{session=storage?JSON.parse(storage.getItem(sessionKey)||"null"):null}catch{session=null}
function isConfigured(){
 const url=clean(config.url),key=clean(config.anonKey);
 return !!config.enabled&&/^https:\/\/.+\.supabase\.co$/.test(url)&&key.length>20;
}
function getSession(){return session}
function currentUser(){return session?.user||null}
function setSession(next){
 session=next?.access_token?next:null;
 if(storage){
  if(session)storage.setItem(sessionKey,JSON.stringify(session));
  else storage.removeItem(sessionKey);
 }
 return session;
}
function authHeader(){
 return session?.access_token?`Bearer ${session.access_token}`:`Bearer ${clean(config.anonKey)}`;
}
async function request(path,{method="GET",body=null,headers={}}={}){
 if(!isConfigured())return {skipped:true,reason:"Supabase is not configured yet."};
 const url=`${clean(config.url).replace(/\/$/,"")}/rest/v1/${path}`;
 const res=await fetch(url,{
  method,
  headers:{
   apikey:clean(config.anonKey),
   Authorization:authHeader(),
   "Content-Type":"application/json",
   Prefer:"return=representation",
   ...headers
  },
  body:body?JSON.stringify(body):null
 });
 const text=await res.text();
 const data=text?JSON.parse(text):null;
 if(!res.ok)throw new Error(data?.message||`Supabase request failed: ${res.status}`);
 return {data};
}
async function authRequest(path,body){
 if(!isConfigured())return {skipped:true,reason:"Supabase is not configured yet."};
 const url=`${clean(config.url).replace(/\/$/,"")}/auth/v1/${path}`;
 const res=await fetch(url,{
  method:"POST",
  headers:{apikey:clean(config.anonKey),"Content-Type":"application/json"},
  body:JSON.stringify(body)
 });
 const text=await res.text();
 const data=text?JSON.parse(text):null;
 if(!res.ok)throw new Error(data?.msg||data?.message||`Supabase auth failed: ${res.status}`);
 return data;
}
async function signUp(email,password){
 const data=await authRequest("signup",{email:clean(email),password});
 if(data?.access_token)setSession(data);
 return data;
}
async function signIn(email,password){
 const data=await authRequest("token?grant_type=password",{email:clean(email),password});
 setSession(data);
 return data;
}
async function signOut(){
 if(isConfigured()&&session?.access_token){
  await fetch(`${clean(config.url).replace(/\/$/,"")}/auth/v1/logout`,{
   method:"POST",
   headers:{apikey:clean(config.anonKey),Authorization:`Bearer ${session.access_token}`}
  }).catch(()=>null);
 }
 setSession(null);
}
function summarizeFightPayload({fight,red,blue,settings,researchDesk}){
 const winner=fight.winner==="a"?red:fight.winner==="b"?blue:null;
 return {
  red_fighter_id:red.id,
  blue_fighter_id:blue.id,
  red_version_label:red.label||`${red.year||"current"}`,
  blue_version_label:blue.label||`${blue.year||"current"}`,
  settings,
  winner_fighter_id:winner?.id||null,
  decision:fight.decision,
  method:fight.rounds?.at?.(-1)?.stoppage?.type||fight.decision,
  rounds_completed:fight.rounds?.length||0,
  totals:fight.totals,
  scorecards:fight.judges,
  is_historical:!!fight.historical,
  fight_data:fight,
  research_desk:researchDesk||null,
  created_by:currentUser()?.id||null,
  is_public:true
 };
}
async function saveFight(payload){
 if(!isConfigured())return {skipped:true,reason:"Supabase is not configured yet."};
 if(!currentUser())return {authRequired:true,reason:"Sign in to save fights to your private vault."};
 const body=summarizeFightPayload(payload);
 return request("saved_fights?select=id,share_slug,created_at",{method:"POST",body});
}
async function listSavedFights(limit=24){
 if(!isConfigured())return {skipped:true,reason:"Supabase is not configured yet.",data:[]};
 if(!currentUser())return {authRequired:true,reason:"Sign in to view your saved fights.",data:[]};
 const safeLimit=Math.max(1,Math.min(50,Number(limit)||24));
 const userId=encodeURIComponent(currentUser().id);
 return request(`saved_fights?select=id,share_slug,red_fighter_id,blue_fighter_id,red_version_label,blue_version_label,winner_fighter_id,decision,method,rounds_completed,is_historical,created_at,fight_data&created_by=eq.${userId}&order=created_at.desc&limit=${safeLimit}`);
}
async function getSavedFight(slug){
 if(!isConfigured())return {skipped:true,reason:"Supabase is not configured yet.",data:null};
 const result=await request("rpc/get_public_saved_fight",{method:"POST",body:{p_share_slug:clean(slug)}});
 return {data:result.data?.[0]||null};
}
global.RINGSIDE_SUPABASE={isConfigured,getSession,currentUser,signUp,signIn,signOut,saveFight,listSavedFights,getSavedFight};
})(typeof window!=="undefined"?window:globalThis);
