const fs=require("fs"),vm=require("vm"),assert=require("node:assert"),test=require("node:test");

test("Supabase client uses configured project safely",async()=>{
 let request;
 const context={
  fetch:async(url,options)=>{
   request={url,options};
   return {ok:true,text:async()=>JSON.stringify([{id:"saved-1",share_slug:"abc123",created_at:"now"}])};
  },
  console
 };
 vm.runInNewContext(fs.readFileSync("supabase-config.js","utf8"),context);
 vm.runInNewContext(fs.readFileSync("supabase-client.js","utf8"),context);
 assert.equal(context.RINGSIDE_SUPABASE.isConfigured(),true);
 const result=await context.RINGSIDE_SUPABASE.saveFight({
  fight:{winner:"a",decision:"UD",rounds:[{}],totals:{},judges:[]},
  red:{id:"red",label:"Red Version"},
  blue:{id:"blue",label:"Blue Version"},
  settings:{rounds:12},
  researchDesk:null
 });
 assert.equal(result.data[0].id,"saved-1");
 assert.match(request.url,/^https:\/\/scxalthmhvhfmmkhvbas\.supabase\.co\/rest\/v1\/saved_fights/);
 assert.equal(request.options.method,"POST");
 assert.equal(request.options.headers.apikey,context.RINGSIDE_SUPABASE_CONFIG.anonKey);
 const body=JSON.parse(request.options.body);
 assert.equal(body.red_fighter_id,"red");
 assert.equal(body.blue_fighter_id,"blue");
 assert.equal(body.winner_fighter_id,"red");
});

test("Supabase client can list and fetch saved fight replays",async()=>{
 const requests=[];
 const context={
  fetch:async(url,options)=>{
   requests.push({url,options});
   return {ok:true,text:async()=>JSON.stringify([{id:"saved-1",share_slug:"abc123",fight_data:{winner:"a"}}])};
  },
  console
 };
 vm.runInNewContext(fs.readFileSync("supabase-config.js","utf8"),context);
 vm.runInNewContext(fs.readFileSync("supabase-client.js","utf8"),context);
 const list=await context.RINGSIDE_SUPABASE.listSavedFights(10);
 const replay=await context.RINGSIDE_SUPABASE.getSavedFight("abc123");
 assert.equal(list.data[0].share_slug,"abc123");
 assert.equal(replay.data.fight_data.winner,"a");
 assert.match(requests[0].url,/saved_fights\?select=.*order=created_at\.desc&limit=10/);
 assert.match(requests[1].url,/saved_fights\?select=\*&share_slug=eq\.abc123&limit=1/);
});
