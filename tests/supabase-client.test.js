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
