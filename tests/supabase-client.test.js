const fs=require("fs"),vm=require("vm"),assert=require("node:assert"),test=require("node:test");

function localStorageMock(){
 const store=new Map();
 return {
  getItem:key=>store.has(key)?store.get(key):null,
  setItem:(key,value)=>store.set(key,String(value)),
  removeItem:key=>store.delete(key)
 };
}

function loadClient(fetch){
 const context={fetch,console,localStorage:localStorageMock()};
 vm.runInNewContext(fs.readFileSync("supabase-config.js","utf8"),context);
 vm.runInNewContext(fs.readFileSync("supabase-client.js","utf8"),context);
 return context;
}

test("Supabase client requires a profile before saving or listing private fights",async()=>{
 const context=loadClient(async()=>{throw new Error("No network call should be made while signed out")});
 assert.equal(context.RINGSIDE_SUPABASE.isConfigured(),true);
 const save=await context.RINGSIDE_SUPABASE.saveFight({fight:{},red:{},blue:{},settings:{}});
 const list=await context.RINGSIDE_SUPABASE.listSavedFights();
 assert.equal(save.authRequired,true);
 assert.equal(list.authRequired,true);
 assert.deepEqual(list.data,[]);
});

test("Supabase client saves fights under the signed-in user",async()=>{
 const requests=[];
 const context=loadClient(async(url,options)=>{
  requests.push({url,options});
  if(String(url).includes("/auth/v1/token")){
   return {ok:true,text:async()=>JSON.stringify({access_token:"user-token",user:{id:"user-1",email:"kev@example.com"}})};
  }
  return {ok:true,text:async()=>JSON.stringify([{id:"saved-1",share_slug:"abc123",created_at:"now"}])};
 });
 await context.RINGSIDE_SUPABASE.signIn("kev@example.com","secret123");
 const result=await context.RINGSIDE_SUPABASE.saveFight({
  fight:{winner:"a",decision:"UD",rounds:[{}],totals:{},judges:[]},
  red:{id:"red",label:"Red Version"},
  blue:{id:"blue",label:"Blue Version"},
  settings:{rounds:12},
  researchDesk:null
 });
 assert.equal(result.data[0].id,"saved-1");
 const saveRequest=requests.at(-1);
 assert.match(saveRequest.url,/^https:\/\/scxalthmhvhfmmkhvbas\.supabase\.co\/rest\/v1\/saved_fights/);
 assert.equal(saveRequest.options.method,"POST");
 assert.equal(saveRequest.options.headers.apikey,context.RINGSIDE_SUPABASE_CONFIG.anonKey);
 assert.equal(saveRequest.options.headers.Authorization,"Bearer user-token");
 const body=JSON.parse(saveRequest.options.body);
 assert.equal(body.red_fighter_id,"red");
 assert.equal(body.blue_fighter_id,"blue");
 assert.equal(body.winner_fighter_id,"red");
 assert.equal(body.created_by,"user-1");
 assert.equal(body.is_public,true);
});

test("Supabase client lists private fights and fetches public share replays",async()=>{
 const requests=[];
 const context=loadClient(async(url,options)=>{
  requests.push({url,options});
  if(String(url).includes("/auth/v1/token")){
   return {ok:true,text:async()=>JSON.stringify({access_token:"user-token",user:{id:"user-1",email:"kev@example.com"}})};
  }
  return {ok:true,text:async()=>JSON.stringify([{id:"saved-1",share_slug:"abc123",fight_data:{winner:"a"}}])};
 });
 await context.RINGSIDE_SUPABASE.signIn("kev@example.com","secret123");
 const list=await context.RINGSIDE_SUPABASE.listSavedFights(10);
 const replay=await context.RINGSIDE_SUPABASE.getSavedFight("abc123");
 assert.equal(list.data[0].share_slug,"abc123");
 assert.equal(replay.data.fight_data.winner,"a");
 const listRequest=requests.find(request=>String(request.url).includes("saved_fights?select="));
 const replayRequest=requests.find(request=>String(request.url).includes("rpc/get_public_saved_fight"));
 assert.match(listRequest.url,/created_by=eq\.user-1&order=created_at\.desc&limit=10/);
 assert.equal(replayRequest.options.method,"POST");
 assert.deepEqual(JSON.parse(replayRequest.options.body),{p_share_slug:"abc123"});
});

test("Supabase client can load roster sync rows",async()=>{
 const requests=[];
 const context=loadClient(async(url,options)=>{
  requests.push({url,options});
  if(String(url).includes("fighter_versions")){
   return {ok:true,text:async()=>JSON.stringify([{fighter_id:"ennis",label:"2026 · 154-LB CAMPAIGN",year:2026}])};
  }
  return {ok:true,text:async()=>JSON.stringify([{id:"ennis",name:"Jaron Ennis",primary_division:"Junior Middleweight"}])};
 });
 const result=await context.RINGSIDE_SUPABASE.loadRoster();
 assert.equal(result.data.fighters[0].id,"ennis");
 assert.equal(result.data.versions[0].fighter_id,"ennis");
 assert.match(requests[0].url,/fighters\?select=/);
 assert.match(requests[1].url,/fighter_versions\?select=/);
 assert.equal(requests[0].options.headers.Authorization,`Bearer ${context.RINGSIDE_SUPABASE_CONFIG.anonKey}`);
});

test("Supabase client can load verified fight history rows",async()=>{
 const requests=[];
 const context=loadClient(async(url,options)=>{
  requests.push({url,options});
  return {ok:true,text:async()=>JSON.stringify([{id:"haney-lomachenko-2023",red_fighter_id:"haney",blue_fighter_id:"lomachenko",data_quality:"official_replay"}])};
 });
 const result=await context.RINGSIDE_SUPABASE.loadVerifiedFights();
 assert.equal(result.data[0].id,"haney-lomachenko-2023");
 assert.match(requests[0].url,/verified_fights\?select=/);
 assert.match(requests[0].url,/order=fight_date\.desc&limit=1000/);
 assert.equal(requests[0].options.headers.Authorization,`Bearer ${context.RINGSIDE_SUPABASE_CONFIG.anonKey}`);
});

test("Supabase client supports roster admin edits",async()=>{
 const requests=[];
 const context=loadClient(async(url,options)=>{
  requests.push({url,options});
  if(String(url).includes("/auth/v1/token")){
   return {ok:true,text:async()=>JSON.stringify({access_token:"user-token",user:{id:"user-1",email:"kev@example.com"}})};
  }
  if(String(url).includes("roster_admins")){
   return {ok:true,text:async()=>JSON.stringify([{user_id:"user-1"}])};
  }
  return {ok:true,text:async()=>JSON.stringify([{ok:true}])};
 });
 await context.RINGSIDE_SUPABASE.signIn("kev@example.com","secret123");
 const admin=await context.RINGSIDE_SUPABASE.isRosterAdmin();
 await context.RINGSIDE_SUPABASE.upsertFighter({id:"haney",name:"Devin Haney"});
 await context.RINGSIDE_SUPABASE.replaceFighterVersion({fighter_id:"haney",label:"2026 · 147-LB CAMPAIGN",year:2026,division:"Welterweight",weight_lbs:147,ratings:{power:78},best_performance:null,source_notes:{source:"test"},is_default:true});
 await context.RINGSIDE_SUPABASE.deleteFighterVersion({fighter_id:"haney",label:"2026 · 147-LB CAMPAIGN"});
 assert.equal(admin.data,true);
 assert.match(requests.find(request=>String(request.url).includes("roster_admins")).url,/roster_admins\?select=user_id&user_id=eq\.user-1&limit=1/);
 const fighterSave=requests.find(request=>String(request.url).includes("fighters?on_conflict=id"));
 const versionDeletes=requests.filter(request=>String(request.url).includes("fighter_versions?fighter_id=eq.haney"));
 const versionSave=requests.find(request=>String(request.url).endsWith("fighter_versions?select=fighter_id,label,year,division,weight_lbs,ratings,best_performance,source_notes,is_default"));
 assert.equal(fighterSave.options.method,"POST");
 assert.equal(fighterSave.options.headers.Prefer,"resolution=merge-duplicates,return=representation");
 assert.equal(versionDeletes.length,2);
 assert.equal(versionDeletes[0].options.method,"DELETE");
 assert.equal(versionDeletes[1].options.method,"DELETE");
 assert.equal(versionSave.options.method,"POST");
 assert.equal(JSON.parse(versionSave.options.body).fighter_id,"haney");
});

test("Supabase client supports verified fight admin edits",async()=>{
 const requests=[];
 const context=loadClient(async(url,options)=>{
  requests.push({url,options});
  if(String(url).includes("/auth/v1/token")){
   return {ok:true,text:async()=>JSON.stringify({access_token:"user-token",user:{id:"user-1",email:"kev@example.com"}})};
  }
  return {ok:true,text:async()=>JSON.stringify([{id:"davis-lopez-2026"}])};
 });
 await context.RINGSIDE_SUPABASE.signIn("kev@example.com","secret123");
 await context.RINGSIDE_SUPABASE.upsertVerifiedFight({id:"davis-lopez-2026",red_fighter_id:"davis",blue_fighter_id:"lopez",method:"KO",data_quality:"verified_outcome"});
 await context.RINGSIDE_SUPABASE.deleteVerifiedFight("davis-lopez-2026");
 const save=requests.find(request=>String(request.url).includes("verified_fights?on_conflict=id"));
 const del=requests.find(request=>String(request.url).includes("verified_fights?id=eq.davis-lopez-2026"));
 assert.equal(save.options.method,"POST");
 assert.equal(save.options.headers.Prefer,"resolution=merge-duplicates,return=representation");
 assert.equal(JSON.parse(save.options.body)[0].red_fighter_id,"davis");
 assert.equal(del.options.method,"DELETE");
 assert.equal(del.options.headers.Prefer,"return=minimal");
});

test("Supabase client can seed the current roster without deleting unrelated fighters",async()=>{
 const requests=[];
 const context=loadClient(async(url,options)=>{
  requests.push({url,options});
  if(String(url).includes("/auth/v1/token")){
   return {ok:true,text:async()=>JSON.stringify({access_token:"user-token",user:{id:"user-1",email:"kev@example.com"}})};
  }
  return {ok:true,text:async()=>String(url).includes("return=minimal")?"":JSON.stringify([{ok:true}])};
 });
 await context.RINGSIDE_SUPABASE.signIn("kev@example.com","secret123");
 const result=await context.RINGSIDE_SUPABASE.seedRoster([
  {id:"ennis",name:"Jaron Ennis",last:"Ennis",country:"USA",stance:"Orthodox",division:"Junior Middleweight",img:"https://example.com/ennis.jpg",active:true,nickname:"Boots",years:[{label:"2026 · 154-LB CAMPAIGN",year:2026,division:"Junior Middleweight",weight:154,power:93,speed:95,chin:92,defense:93,iq:94,footwork:94,cardio:95,accuracy:94,aggression:90}]},
  {id:"stevenson",name:"Shakur Stevenson",last:"Stevenson",country:"USA",stance:"Southpaw",division:"Junior Welterweight",img:"https://example.com/shakur.jpg",active:true,nickname:"Fearless",years:[{label:"2026 · 140-LB TECHNICIAN",year:2026,division:"Junior Welterweight",weight:138,power:82,speed:97,chin:92,defense:100,iq:99,footwork:99,cardio:96,accuracy:97,aggression:72}]}
 ]);
 assert.equal(result.data.fighterCount,2);
 assert.equal(result.data.versionCount,2);
 const deleteVersions=requests.find(request=>String(request.url).includes("fighter_versions?fighter_id=in."));
 assert.match(deleteVersions.url,/fighter_versions\?fighter_id=in\.\("ennis","stevenson"\)/);
 assert.equal(deleteVersions.options.method,"DELETE");
 assert.equal(deleteVersions.options.headers.Prefer,"return=minimal");
 const versionInsert=requests.at(-1);
 assert.equal(versionInsert.options.method,"POST");
 assert.equal(JSON.parse(versionInsert.options.body).length,2);
});

test("Supabase client refreshes an expired session before retrying roster admin checks",async()=>{
 const requests=[];
 const context=loadClient(async(url,options)=>{
  requests.push({url,options});
  if(String(url).includes("/auth/v1/token?grant_type=password")){
   return {ok:true,text:async()=>JSON.stringify({access_token:"old-token",refresh_token:"refresh-1",user:{id:"user-1",email:"kev@example.com"}})};
  }
  if(String(url).includes("/auth/v1/token?grant_type=refresh_token")){
   return {ok:true,text:async()=>JSON.stringify({access_token:"fresh-token",refresh_token:"refresh-2",user:{id:"user-1",email:"kev@example.com"}})};
  }
  const auth=options.headers.Authorization;
  if(auth==="Bearer old-token")return {ok:false,status:401,text:async()=>JSON.stringify({message:"JWT expired"})};
  return {ok:true,text:async()=>JSON.stringify([{user_id:"user-1"}])};
 });
 await context.RINGSIDE_SUPABASE.signIn("kev@example.com","secret123");
 const admin=await context.RINGSIDE_SUPABASE.isRosterAdmin();
 assert.equal(admin.data,true);
 const adminRequests=requests.filter(request=>String(request.url).includes("roster_admins"));
 assert.equal(adminRequests.length,2);
 assert.equal(adminRequests[0].options.headers.Authorization,"Bearer old-token");
 assert.equal(adminRequests[1].options.headers.Authorization,"Bearer fresh-token");
 assert.equal(context.RINGSIDE_SUPABASE.getSession().access_token,"fresh-token");
});
