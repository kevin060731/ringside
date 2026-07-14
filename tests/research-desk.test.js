const fs=require("fs"),vm=require("vm"),assert=require("node:assert"),test=require("node:test");
vm.runInThisContext(fs.readFileSync("fight-history.js","utf8"));
vm.runInThisContext(fs.readFileSync("rummy-corner-data.js","utf8"));
vm.runInThisContext(fs.readFileSync("research-desk.js","utf8"));

const shakur={id:"stevenson",year:2026,label:"CURRENT · JUL 2026",name:"Shakur Stevenson",last:"Stevenson",stance:"Southpaw",division:"Lightweight",power:82,speed:97,chin:89,defense:100,iq:98,footwork:98,cardio:95,accuracy:96,aggression:74,gems:{videoCount:17,tags:["Defensive Layers"],sources:[]}};
const teofimo={id:"lopez",year:2026,label:"CURRENT · JUL 2026",name:"Teófimo López",last:"López",stance:"Orthodox",division:"Junior Welterweight",power:92,speed:91,chin:90,defense:86,iq:89,footwork:88,cardio:91,accuracy:88,aggression:88,gems:{videoCount:6,tags:["Counterpunching"],sources:[]}};
const crawford={id:"crawford",year:2023,label:"2023 · UNDISPUTED",name:"Terence Crawford",last:"Crawford",stance:"Switch",division:"Welterweight",power:91,speed:94,chin:91,defense:95,iq:99,footwork:95,cardio:96,accuracy:97,aggression:89};
const ward={id:"ward",year:2011,label:"2011 · SUPER SIX",name:"Andre Ward",last:"Ward",stance:"Orthodox",division:"Super Middleweight",power:84,speed:91,chin:92,defense:98,iq:99,footwork:96,cardio:96,accuracy:95,aggression:78};
const joshua={id:"joshua",year:2024,label:"2024 · HEAVYWEIGHT",name:"Anthony Joshua",last:"Joshua",stance:"Orthodox",division:"Heavyweight",weight:252,power:96,speed:84,chin:88,defense:84,iq:88,footwork:82,cardio:86,accuracy:88,aggression:88};
const ali={id:"ali",year:1974,label:"1974 · RUMBLE",name:"Muhammad Ali",last:"Ali",stance:"Orthodox",division:"Heavyweight",weight:216,power:88,speed:90,chin:98,defense:91,iq:100,footwork:89,cardio:96,accuracy:92,aggression:86,eraStudy:RUMMY_CORNER_DATA.profiles["Muhammad Ali"]};
const robinson={id:"robinson",year:1951,label:"1951 · PRIME",name:"Sugar Ray Robinson",last:"Robinson",stance:"Orthodox",division:"Middleweight",weight:160,power:95,speed:100,chin:96,defense:97,iq:100,footwork:100,cardio:98,accuracy:99,aggression:94,eraStudy:RUMMY_CORNER_DATA.profiles["Sugar Ray Robinson"]};

test("research desk creates a structured scouting brief without picking a fantasy winner",()=>{
 const desk=BOXING_RESEARCH_DESK.create(crawford,shakur,{rounds:12,weight:"Welterweight"});
 assert.equal(desk.schemaVersion,1);
 assert.equal(desk.mode,"local-research-cache");
 assert.equal(desk.futureMode,"openai-research-desk-ready");
 assert.equal(desk.verifiedFight,null);
 assert.ok(desk.confidence>=40&&desk.confidence<=100);
 assert.match(desk.styleClash.summary,/Crawford|Stevenson/);
 assert.ok(desk.scoutingQuestions.length>=3);
 assert.ok(desk.mismatch);
 assert.ok(Number.isFinite(desk.engineHints.preFightProbabilityA));
 assert.equal("winner" in desk,false);
 assert.equal(desk.engineHints.mustReplayHistorical,false);
});

test("research desk detects verified prior fights and requests archive replay",()=>{
 const desk=BOXING_RESEARCH_DESK.create(shakur,teofimo,{rounds:12,weight:"Lightweight"});
 assert.equal(desk.verifiedFight.id,"stevenson-lopez-2026");
 assert.equal(desk.engineHints.mustReplayHistorical,true);
 assert.ok(desk.sources.find(source=>source.id==="history").status==="verified");
 assert.match(desk.scoutingQuestions.join(" "),/already happened|official cards|verified result/i);
});

test("research desk varies hypothetical scouting and flags mismatches",()=>{
 const close=BOXING_RESEARCH_DESK.create(crawford,shakur,{rounds:12,weight:"Welterweight"});
 const mismatch=BOXING_RESEARCH_DESK.create(ward,joshua,{rounds:12,weight:"Open Weight"});
 assert.notEqual(close.styleClash.summary,mismatch.styleClash.summary);
 assert.notEqual(close.scoutingQuestions.join(" "),mismatch.scoutingQuestions.join(" "));
 assert.ok(["natural-size mismatch","major skill/era mismatch","clear favorite"].includes(mismatch.mismatch.type));
 assert.ok(Math.abs(mismatch.engineHints.preFightProbabilityA-50)>=15);
 assert.match(mismatch.styleClash.summary,/mismatch|favored|gap|weight|rating/i);
});

test("research desk includes Rummy's Corner decade study when available",()=>{
 const desk=BOXING_RESEARCH_DESK.create(ali,robinson,{rounds:15,weight:"Open Weight",ruleset:"old-school"});
 const source=desk.sources.find(source=>source.id==="rummy");
 assert.equal(source.status,"active");
 assert.ok(desk.fighters.a.eraStudy.decades.includes("1970s"));
 assert.ok(desk.fighters.b.eraStudy.decades.includes("1940s"));
 assert.match(desk.styleClash.summary,/decade-study|P4P|Ali|Robinson/i);
});
