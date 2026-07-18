const fs=require("fs"),vm=require("vm"),assert=require("node:assert"),test=require("node:test");

function loadSync(){
 const context={window:{}};
 context.global=context.window;
 vm.createContext(context);
 vm.runInContext(fs.readFileSync("roster-sync.js","utf8"),context,{filename:"roster-sync.js"});
 return context.window.RINGSIDE_ROSTER_SYNC;
}

test("roster sync updates existing fighters and adds new Supabase fighters",()=>{
 const sync=loadSync();
 const local=[
  {id:"ennis",name:"Jaron Ennis",last:"Ennis",nickname:"Boots",country:"USA",stance:"Orthodox",division:"Welterweight",img:"old.jpg",years:[{year:2024,label:"2024 · WELTER",weight:147,power:90,speed:94,chin:91,defense:91,iq:92,footwork:92,cardio:93,accuracy:93,aggression:88}]}
 ];
 const summary=sync.mergeRoster(local,{
  fighters:[
   {id:"ennis",name:"Jaron Ennis",last_name:"Ennis",country:"USA",stance:"Orthodox",primary_division:"Junior Middleweight",image_url:"boots.jpg",active:true,model_data:{nickname:"Boots",wiki:"Jaron Ennis"}},
   {id:"newprospect",name:"New Prospect",last_name:"Prospect",country:"USA",stance:"Southpaw",primary_division:"Lightweight",image_url:"new.jpg",active:true,model_data:{nickname:"The Sync"}}
  ],
  versions:[
   {fighter_id:"ennis",label:"2026 · 154-LB CAMPAIGN",year:2026,division:"Junior Middleweight",weight_lbs:154,ratings:{power:93,speed:95,chin:92,defense:93,iq:94,footwork:94,cardio:95,accuracy:94,aggression:90},best_performance:{opponent:"Latest Opponent",result:"UD 12",note:"synced update"},source_notes:{simulation:{handRisk:2}}},
   {fighter_id:"newprospect",label:"CURRENT · SYNCED",year:2026,division:"Lightweight",weight_lbs:135,ratings:{power:80,speed:88,chin:82,defense:84,iq:83,footwork:85,cardio:86,accuracy:84,aggression:78},best_performance:{opponent:"Debut Rival",result:"TKO 4",note:"first synced profile"}}
  ]
 });
 assert.equal(summary.updated,1);
 assert.equal(summary.added,1);
 assert.equal(local.length,2);
 const ennis=local.find(f=>f.id==="ennis");
 assert.equal(ennis.division,"Junior Middleweight");
 assert.equal(ennis.img,"boots.jpg");
 assert.equal(ennis.years[0].weight,154);
 assert.equal(ennis.years[0].power,93);
 assert.equal(ennis.years[0].sourceNotes.simulation.handRisk,2);
 assert.equal(local.find(f=>f.id==="newprospect").years[0].label,"CURRENT · SYNCED");
});

test("roster sync can build versions from fighter model_data when version rows are absent",()=>{
 const sync=loadSync();
 const local=[];
 sync.mergeRoster(local,{fighters:[{
  id:"modelonly",
  name:"Model Only",
  primary_division:"Welterweight",
  model_data:{
   nickname:"Data",
   years:[{year:2026,label:"CURRENT · MODEL DATA",division:"Welterweight",power:81,speed:82,chin:83,defense:84,iq:85,footwork:86,cardio:87,accuracy:88,aggression:89,bestPerformance:{opponent:"Template",result:"UD 10",note:"manual update"}}]
  }
 }],versions:[]});
 assert.equal(local[0].nickname,"Data");
 assert.equal(local[0].years[0].weight,147);
 assert.equal(local[0].years[0].accuracy,88);
});
