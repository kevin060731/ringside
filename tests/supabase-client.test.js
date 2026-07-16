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
