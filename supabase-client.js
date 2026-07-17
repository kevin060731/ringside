(function(global){
const config=global.RINGSIDE_SUPABASE_CONFIG||{};
const clean=value=>String(value||"").trim();
function isConfigured(){
 const url=clean(config.url),key=clean(config.anonKey);
 return !!config.enabled&&/^https:\/\/.+\.supabase\.co$/.test(url)&&key.length>20;
}
async function request(path,{method="GET",body=null,headers={}}={}){
 if(!isConfigured())return {skipped:true,reason:"Supabase is not configured yet."};
 const url=`${clean(config.url).replace(/\/$/,"")}/rest/v1/${path}`;
 const res=await fetch(url,{
  method,
  headers:{
   apikey:clean(config.anonKey),
   Authorization:`Bearer ${clean(config.anonKey)}`,
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
  research_desk:researchDesk||null
 };
}
async function saveFight(payload){
 if(!isConfigured())return {skipped:true,reason:"Supabase is not configured yet."};
 const body=summarizeFightPayload(payload);
 return request("saved_fights?select=id,share_slug,created_at",{method:"POST",body});
}
async function listSavedFights(limit=24){
 if(!isConfigured())return {skipped:true,reason:"Supabase is not configured yet.",data:[]};
 const safeLimit=Math.max(1,Math.min(50,Number(limit)||24));
 return request(`saved_fights?select=id,share_slug,red_fighter_id,blue_fighter_id,red_version_label,blue_version_label,winner_fighter_id,decision,method,rounds_completed,is_historical,created_at,fight_data&order=created_at.desc&limit=${safeLimit}`);
}
async function getSavedFight(slug){
 if(!isConfigured())return {skipped:true,reason:"Supabase is not configured yet.",data:null};
 const safeSlug=encodeURIComponent(clean(slug));
 const result=await request(`saved_fights?select=*&share_slug=eq.${safeSlug}&limit=1`);
 return {data:result.data?.[0]||null};
}
global.RINGSIDE_SUPABASE={isConfigured,saveFight,listSavedFights,getSavedFight};
})(typeof window!=="undefined"?window:globalThis);
