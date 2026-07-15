const fs=require("fs"),vm=require("vm"),assert=require("node:assert"),test=require("node:test");

test("Supabase client is safe when not configured",async()=>{
 vm.runInNewContext(fs.readFileSync("supabase-config.js","utf8"),globalThis);
 vm.runInThisContext(fs.readFileSync("supabase-client.js","utf8"));
 assert.equal(RINGSIDE_SUPABASE.isConfigured(),false);
 const result=await RINGSIDE_SUPABASE.saveFight({fight:{},red:{},blue:{},settings:{},researchDesk:null});
 assert.equal(result.skipped,true);
});
