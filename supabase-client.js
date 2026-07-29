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
 if(!isConfigured())return {skipped:true,reason:"RINGSIDE services are not connected yet."};
 const url=`${clean(config.url).replace(/\/$/,"")}/rest/v1/${path}`;
 const options=()=>({
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
 let res=await fetch(url,options());
 if(res.status===401&&session?.refresh_token){
  const refreshed=await refreshSession().catch(()=>null);
  if(refreshed)res=await fetch(url,options());
 }
 const text=await res.text();
 const data=text?JSON.parse(text):null;
 if(!res.ok)throw new Error(data?.message||`RINGSIDE request failed: ${res.status}`);
 return {data};
}
async function authRequest(path,body){
 if(!isConfigured())return {skipped:true,reason:"RINGSIDE services are not connected yet."};
 const url=`${clean(config.url).replace(/\/$/,"")}/auth/v1/${path}`;
 const res=await fetch(url,{
  method:"POST",
  headers:{apikey:clean(config.anonKey),"Content-Type":"application/json"},
  body:JSON.stringify(body)
 });
 const text=await res.text();
 const data=text?JSON.parse(text):null;
 if(!res.ok)throw new Error(data?.msg||data?.message||`RINGSIDE sign-in failed: ${res.status}`);
 return data;
}
function authBaseUrl(){
 return `${clean(config.url).replace(/\/$/,"")}/auth/v1`;
}
function getRedirectUrl(){
 const location=global.location;
 if(!location)return "";
 return `${location.origin}${location.pathname}${location.search||""}`;
}
async function userForAccessToken(accessToken){
 const res=await fetch(`${authBaseUrl()}/user`,{
  headers:{apikey:clean(config.anonKey),Authorization:`Bearer ${accessToken}`}
 });
 const text=await res.text();
 const data=text?JSON.parse(text):null;
 if(!res.ok)throw new Error(data?.msg||data?.message||`Could not finish GitHub sign-in: ${res.status}`);
 return data;
}
async function completeOAuthFromUrl(){
 if(!isConfigured()||!global.location)return null;
 const hash=global.location.hash?.startsWith("#")?global.location.hash.slice(1):"";
 if(!hash)return null;
 const params=new URLSearchParams(hash);
 const error=params.get("error_description")||params.get("error");
 if(error)throw new Error(error);
 const accessToken=params.get("access_token");
 const refreshToken=params.get("refresh_token");
 if(!accessToken)return null;
 const expiresIn=Number(params.get("expires_in"))||3600;
 const user=await userForAccessToken(accessToken);
 setSession({
  access_token:accessToken,
  refresh_token:refreshToken,
  token_type:params.get("token_type")||"bearer",
  expires_in:expiresIn,
  expires_at:Math.floor(Date.now()/1000)+expiresIn,
  provider_token:params.get("provider_token")||null,
  user
 });
 if(global.history?.replaceState){
  global.history.replaceState(null,global.document?.title||"RINGSIDE",`${global.location.pathname}${global.location.search||""}`);
 }
 return session;
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
function signInWithGitHub(){
 if(!isConfigured())throw new Error("RINGSIDE database is not connected yet.");
 const params=new URLSearchParams({
  provider:"github",
  redirect_to:getRedirectUrl()
 });
 global.location.assign(`${authBaseUrl()}/authorize?${params.toString()}`);
}
async function refreshSession(){
 if(!isConfigured()||!session?.refresh_token)return null;
 const data=await authRequest("token?grant_type=refresh_token",{refresh_token:session.refresh_token});
 setSession(data);
 return session;
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
 if(!isConfigured())return {skipped:true,reason:"RINGSIDE services are not connected yet."};
 if(!currentUser())return {authRequired:true,reason:"Sign in to save fights to your private vault."};
 const body=summarizeFightPayload(payload);
 return request("saved_fights?select=id,share_slug,created_at",{method:"POST",body});
}
async function listSavedFights(limit=24){
 if(!isConfigured())return {skipped:true,reason:"RINGSIDE services are not connected yet.",data:[]};
 if(!currentUser())return {authRequired:true,reason:"Sign in to view your saved fights.",data:[]};
 const safeLimit=Math.max(1,Math.min(50,Number(limit)||24));
 const userId=encodeURIComponent(currentUser().id);
 return request(`saved_fights?select=id,share_slug,red_fighter_id,blue_fighter_id,red_version_label,blue_version_label,winner_fighter_id,decision,method,rounds_completed,is_historical,created_at,fight_data&created_by=eq.${userId}&order=created_at.desc&limit=${safeLimit}`);
}
async function getSavedFight(slug){
 if(!isConfigured())return {skipped:true,reason:"RINGSIDE services are not connected yet.",data:null};
 const result=await request("rpc/get_public_saved_fight",{method:"POST",body:{p_share_slug:clean(slug)}});
 return {data:result.data?.[0]||null};
}
async function loadRoster(){
 if(!isConfigured())return {skipped:true,reason:"RINGSIDE services are not connected yet.",data:{fighters:[],versions:[]}};
 const roster=await request("fighters?select=id,name,last_name,country,stance,primary_division,image_url,active,model_data,updated_at&order=updated_at.desc&limit=1000");
 const versions=await request("fighter_versions?select=fighter_id,label,year,division,weight_lbs,ratings,best_performance,source_notes,is_default,updated_at&order=fighter_id.asc,is_default.desc,year.desc&limit=3000");
 return {data:{fighters:roster.data||[],versions:versions.data||[]}};
}
async function loadVerifiedFights(){
 if(!isConfigured())return {skipped:true,reason:"RINGSIDE services are not connected yet.",data:[]};
 return request("verified_fights?select=id,fight_date,red_fighter_id,blue_fighter_id,winner_fighter_id,division,venue,method,scheduled_rounds,ended_round,scorecards,events,stats,fan_consensus,data_quality,confidence,source_notes,sources,updated_at&order=fight_date.desc&limit=1000");
}
async function loadUpcomingFights({includeCancelled=false}={}){
 if(!isConfigured())return {skipped:true,reason:"RINGSIDE services are not connected yet.",data:[]};
 const filter=includeCancelled?"":"&status=neq.cancelled";
 return request(`upcoming_fights?select=id,event_name,fight_date,venue,promoter,broadcast,bout_order,red_fighter_id,blue_fighter_id,red_name,blue_name,division,scheduled_rounds,status,card_note,market,sources,updated_at${filter}&order=fight_date.asc,bout_order.asc&limit=250`);
}
async function isRosterAdmin(){
 const user=currentUser();
 if(!user)return {authRequired:true,data:false,reason:"Sign in to edit the roster."};
 const result=await request(`roster_admins?select=user_id&user_id=eq.${encodeURIComponent(user.id)}&limit=1`);
 return {data:!!result.data?.length};
}
async function upsertFighter(row){
 if(!currentUser())return {authRequired:true,reason:"Sign in to edit the roster."};
 return request("fighters?on_conflict=id",{method:"POST",body:[row],headers:{Prefer:"resolution=merge-duplicates,return=representation"}});
}
async function replaceFighterVersion(row){
 if(!currentUser())return {authRequired:true,reason:"Sign in to edit the roster."};
 await request(`fighter_versions?fighter_id=eq.${encodeURIComponent(row.fighter_id)}&label=eq.${encodeURIComponent(row.label)}`,{method:"DELETE",headers:{Prefer:"return=minimal"}});
 return request("fighter_versions?select=fighter_id,label,year,division,weight_lbs,ratings,best_performance,source_notes,is_default",{method:"POST",body:row});
}
async function deleteFighterVersion({fighter_id,label}){
 if(!currentUser())return {authRequired:true,reason:"Sign in to edit the roster."};
 return request(`fighter_versions?fighter_id=eq.${encodeURIComponent(fighter_id)}&label=eq.${encodeURIComponent(label)}`,{method:"DELETE",headers:{Prefer:"return=minimal"}});
}
async function upsertVerifiedFight(row){
 if(!currentUser())return {authRequired:true,reason:"Sign in to edit verified fight history."};
 return request("verified_fights?on_conflict=id",{method:"POST",body:[row],headers:{Prefer:"resolution=merge-duplicates,return=representation"}});
}
async function deleteVerifiedFight(id){
 if(!currentUser())return {authRequired:true,reason:"Sign in to edit verified fight history."};
 return request(`verified_fights?id=eq.${encodeURIComponent(id)}`,{method:"DELETE",headers:{Prefer:"return=minimal"}});
}
async function upsertUpcomingFight(row){
 if(!currentUser())return {authRequired:true,reason:"Sign in to edit upcoming fight cards."};
 return request("upcoming_fights?on_conflict=id",{method:"POST",body:[row],headers:{Prefer:"resolution=merge-duplicates,return=representation"}});
}
async function deleteUpcomingFight(id){
 if(!currentUser())return {authRequired:true,reason:"Sign in to edit upcoming fight cards."};
 return request(`upcoming_fights?id=eq.${encodeURIComponent(id)}`,{method:"DELETE",headers:{Prefer:"return=minimal"}});
}
async function seedRoster(localFighters=[]){
 if(!currentUser())return {authRequired:true,reason:"Sign in to seed the roster."};
 const fighterRows=localFighters.map(f=>({
  id:f.id,
  name:f.name,
  last_name:f.last||null,
  country:f.country||null,
  stance:f.stance||null,
  primary_division:f.division||null,
  image_url:f.img||null,
  active:!!f.active,
  model_data:{nickname:f.nickname||"",wiki:f.wiki||f.name,updated:new Date().toISOString().slice(0,10)}
 }));
 const versionRows=localFighters.flatMap(f=>(f.years||[]).map((v,index)=>({
  fighter_id:f.id,
  label:v.label||`${v.year||"Current"} · VERSION`,
  year:Number(v.year)||null,
  division:v.division||f.division||null,
  weight_lbs:Number(v.weight)||null,
  ratings:{power:v.power,speed:v.speed,chin:v.chin,defense:v.defense,iq:v.iq,footwork:v.footwork,cardio:v.cardio,accuracy:v.accuracy,aggression:v.aggression},
  best_performance:v.bestPerformance||null,
  source_notes:{source:"seeded from RINGSIDE local roster"},
  is_default:index===0
 })));
 const fighterIds=localFighters.map(f=>`"${String(f.id).replaceAll('"','\\"')}"`).join(",");
 const savedFighters=await request("fighters?on_conflict=id",{method:"POST",body:fighterRows,headers:{Prefer:"resolution=merge-duplicates,return=representation"}});
 if(fighterIds)await request(`fighter_versions?fighter_id=in.(${fighterIds})`,{method:"DELETE",headers:{Prefer:"return=minimal"}});
 const savedVersions=versionRows.length?await request("fighter_versions",{method:"POST",body:versionRows,headers:{Prefer:"return=minimal"}}):{data:[]};
 return {data:{fighters:savedFighters.data||[],versions:savedVersions.data||[],fighterCount:fighterRows.length,versionCount:versionRows.length}};
}
global.RINGSIDE_SUPABASE={isConfigured,getSession,currentUser,completeOAuthFromUrl,signUp,signIn,signInWithGitHub,signOut,saveFight,listSavedFights,getSavedFight,loadRoster,loadVerifiedFights,loadUpcomingFights,isRosterAdmin,upsertFighter,replaceFighterVersion,deleteFighterVersion,upsertVerifiedFight,deleteVerifiedFight,upsertUpcomingFight,deleteUpcomingFight,seedRoster,refreshSession};
})(typeof window!=="undefined"?window:globalThis);
