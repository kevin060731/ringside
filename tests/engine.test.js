const fs=require("fs"),vm=require("vm"),assert=require("node:assert"),test=require("node:test");
vm.runInThisContext(fs.readFileSync("fight-history.js","utf8"));
vm.runInThisContext(fs.readFileSync("compubox-provider.js","utf8"));
vm.runInThisContext(fs.readFileSync("engine.js","utf8"));
const a={id:"a",year:1,last:"Alpha",stance:"Orthodox",power:95,speed:90,chin:90,defense:88,iq:91,footwork:90,cardio:92,accuracy:91,aggression:94};
const b={id:"b",year:2,last:"Beta",stance:"Southpaw",power:88,speed:94,chin:93,defense:92,iq:95,footwork:94,cardio:96,accuracy:93,aggression:84};
test("fight is deterministic and complete",()=>{const settings={rounds:12,ring:20};const x=BoxingEngine.buildFight(a,b,settings),y=BoxingEngine.buildFight(a,b,settings);assert.deepEqual(x,y);assert.ok(x.rounds.length<=12);assert.ok(x.winner==="a"||x.winner==="b");assert.equal(x.judges.length,3)});
test("all rounds use valid ten-point scoring",()=>{const f=BoxingEngine.buildFight(a,b,{rounds:10,ring:18});for(const r of f.rounds){assert.ok(r.scoreA<=10&&r.scoreA>=8);assert.ok(r.scoreB<=10&&r.scoreB>=8);assert.ok(r.landedA<=r.thrownA);assert.ok(r.landedB<=r.thrownB)}});
test("tactical matchup metadata is attached to rounds",()=>{const southpaw={...b,stance:"Southpaw"};const f=BoxingEngine.buildFight(a,southpaw,{rounds:10,ring:20});assert.equal(f.rounds[0].tactics.openStance,true);assert.ok(f.rounds[0].lines.some(line=>line.includes("lead-foot")))});
test("film profiles remain deterministic inputs",()=>{const studied={...a,gems:{tags:["Counterpunching","Range Control"]}};const settings={rounds:12,ring:20};assert.deepEqual(BoxingEngine.buildFight(studied,b,settings),BoxingEngine.buildFight(studied,b,settings))});
test("fighter-specific style identities replace generic archetype language",()=>{
 const wilder={...a,id:"wilder",last:"Wilder",stance:"Orthodox",division:"Heavyweight",weight:219,power:100,speed:91,chin:89,defense:82,iq:87,footwork:85,cardio:92,accuracy:89,aggression:94};
 const haney={...b,id:"haney",last:"Haney",stance:"Orthodox",division:"Welterweight",weight:147,power:75,speed:91,chin:92,defense:97,iq:98,footwork:95,cardio:95,accuracy:96,aggression:68};
 const fight=BoxingEngine.buildFight(wilder,haney,{rounds:12,ring:22,weight:"Open Weight"});
 assert.match(fight.rounds[0].tactics.identityA.weapon,/nuclear straight right/);
 assert.match(fight.rounds[0].tactics.identityB.weapon,/jab, check hook and clinch-reset scoring/);
 assert.match(fight.rounds[0].report.join(" "),/nuclear straight right|clinch-reset scoring/);
 assert.equal(fight.rounds[0].report.join(" ").includes("a varied jab and power combinations"),false);
});
test("completed fights replay the official result and statistics",()=>{
 const shakur={...a,id:"stevenson",last:"Stevenson"},teofimo={...b,id:"lopez",last:"López"};
 const fight=BoxingEngine.buildFight(shakur,teofimo,{rounds:10,ring:20});
 assert.equal(fight.historical,true);
 assert.equal(fight.rounds.length,12);
 assert.equal(fight.winner,"a");
 assert.equal(fight.decision,"UNANIMOUS DECISION");
 assert.deepEqual(fight.judges.map(j=>[j.a,j.b]),[[119,109],[119,109],[119,109]]);
 assert.deepEqual(fight.totals,{thrownA:372,thrownB:468,landedA:165,landedB:72,powerA:60,powerB:56,kdA:0,kdB:0});
 const reverse=BoxingEngine.buildFight(teofimo,shakur,{rounds:12,ring:20});
 assert.equal(reverse.winner,"b");
 assert.deepEqual(reverse.judges.map(j=>[j.a,j.b]),[[109,119],[109,119],[109,119]]);
});
test("any discovered historical stoppage overrides the fantasy outcome",()=>{
 BOXING_FIGHT_HISTORY.fights.push({
  id:"a-b-history",date:"2000-01-01",red:"a",blue:"b",winner:"b",rounds:10,endedRound:7,
  method:"TECHNICAL KNOCKOUT",verifiedOutcome:true,scorecards:null,stats:null,sources:[]
 });
 const fight=BoxingEngine.buildFight(a,b,{rounds:12,ring:24});
 assert.equal(fight.historical,true);
 assert.equal(fight.winner,"b");
 assert.equal(fight.rounds.length,7);
 assert.equal(fight.rounds[6].stoppage.winner,"b");
 assert.equal(fight.decision,"TECHNICAL KNOCKOUT");
});
test("licensed CompuBox profiles shape pace and accuracy",()=>{
 const measured={...a,id:"measured",compubox:{totalThrownPerRound:90,totalConnectPct:48,powerLandedPerRound:18,totalLandedPerRound:30,plusMinus:20}};
 const baseline={...a,id:"baseline"};
 const settings={rounds:12,ring:20};
 const dataFight=BoxingEngine.buildFight(measured,b,settings),baseFight=BoxingEngine.buildFight(baseline,b,settings);
 assert.ok(dataFight.totals.thrownA>baseFight.totals.thrownA);
 assert.ok(dataFight.totals.landedA/dataFight.totals.thrownA>baseFight.totals.landedA/baseFight.totals.thrownA);
});
test("extreme natural-weight gaps dominate damage and are explained",()=>{
 const heavyweight={...a,id:"fury",last:"Fury",division:"Heavyweight",weight:262};
 const juniorBantam={...b,id:"rodriguez",last:"Rodriguez",division:"Junior Bantamweight"};
 const fight=BoxingEngine.buildFight(heavyweight,juniorBantam,{rounds:12,ring:20});
 assert.equal(fight.matchup.sizeMismatch,true);
 assert.ok(fight.matchup.massRatio>2);
 assert.equal(fight.winner,"a");
 assert.match(fight.decision,/TKO|KO/);
 assert.ok(fight.rounds.some(r=>r.lines.some(line=>line.includes("natural fighting mass"))));
 assert.ok(fight.rounds.some(r=>r.lines.some(line=>line.includes("outside-foot contest"))));
 assert.ok(fight.rounds.some(r=>r.lines.some(line=>line.includes("effective punching and control"))));
});
test("knockdown commentary never praises the dropped fighter as the round winner",()=>{
 const stevenson={id:"test-vulnerable-boxer",year:2026,last:"Stevenson",division:"Lightweight",stance:"Southpaw",power:82,speed:97,chin:70,defense:84,iq:86,footwork:84,cardio:95,accuracy:96,aggression:74};
 const davis={id:"davis",year:2026,last:"Davis",division:"Lightweight",stance:"Southpaw",power:100,speed:94,chin:95,defense:91,iq:94,footwork:92,cardio:91,accuracy:93,aggression:98};
 const fight=BoxingEngine.buildFight(stevenson,davis,{rounds:12,ring:18});
 const round=fight.rounds.find(r=>r.knockA);
 assert.ok(round);
 assert.ok(round.lines.some(line=>line.includes("Davis wins the round 10–8")));
 assert.equal(round.lines.some(line=>line.includes("Stevenson earns the round")),false);
 assert.equal(round.lines.some(line=>line.includes("razor-close round")),false);
 assert.equal((round.report||[]).some(line=>line.includes("open the lane and sends the counter through while the feet are unavailable")),false);
 assert.equal((round.report||[]).some(line=>line.includes("does not sprint blindly toward the finish")),false);
});
test("Whitaker-De La Hoya uses every official card, deduction and knockdown",()=>{
 const whitaker={...a,id:"whitaker",last:"Whitaker"},delahoya={...b,id:"delahoya",last:"De La Hoya"};
 const fight=BoxingEngine.buildFight(whitaker,delahoya,{rounds:12,ring:20});
 assert.equal(fight.winner,"b");
 assert.equal(fight.officialScorecards,true);
 assert.deepEqual(fight.judges,[
  {name:"CHUCK GIAMPA",a:111,b:115},
  {name:"JERRY ROTH",a:110,b:116},
  {name:"DALBY SHIRLEY",a:110,b:116}
 ]);
 assert.equal(fight.rounds[2].deduction.fighter,"whitaker");
 assert.deepEqual([fight.rounds[2].scoreA,fight.rounds[2].scoreB],[8,10]);
 assert.equal(fight.rounds[8].knockB,true);
 assert.deepEqual([fight.rounds[8].scoreA,fight.rounds[8].scoreB],[10,8]);
 assert.deepEqual([fight.totals.kdA,fight.totals.kdB],[0,1]);
});
test("Stevenson-Zepeda uses the real cards and fight-specific tactical arc",()=>{
 const stevenson={...a,id:"stevenson",last:"Stevenson"},zepeda={...b,id:"zepeda",last:"Zepeda"};
 const fight=BoxingEngine.buildFight(stevenson,zepeda,{rounds:12,ring:20});
 assert.equal(fight.winner,"a");
 assert.deepEqual(fight.judges.map(j=>[j.a,j.b]),[[119,109],[118,110],[118,110]]);
 assert.deepEqual([fight.totals.kdA,fight.totals.kdB],[0,0]);
 assert.match(fight.rounds[1].lines.join(" "),/one hundred attempts|combinations/);
 assert.match(fight.rounds[2].lines.join(" "),/right hook/);
 assert.match(fight.rounds[8].lines.join(" "),/uppercut/);
 assert.equal(new Set(fight.rounds.map(r=>r.lines.join(" "))).size,12);
 assert.equal(new Set(fight.rounds.map(r=>r.headline)).size,12);
});
test("every simulated round includes paragraph-length film study",()=>{
 const fight=BoxingEngine.buildFight({...a,id:"film-a"},{...b,id:"film-b"},{rounds:10,ring:20});
 for(const round of fight.rounds){
  assert.equal(round.report.length,5);
  assert.ok(round.report.every(paragraph=>paragraph.length>400));
  assert.match(round.report[4],/corner read/i);
 }
});
test("historical film study uses a distinct lens and adjustment every round",()=>{
 const shakur={...a,id:"stevenson",last:"Stevenson"},teofimo={...b,id:"lopez",last:"López"};
 const fight=BoxingEngine.buildFight(shakur,teofimo,{rounds:12,ring:20});
 assert.equal(new Set(fight.rounds.map(r=>r.report[1])).size,12);
 assert.equal(new Set(fight.rounds.map(r=>r.report[2])).size,12);
 assert.match(fight.rounds[3].report[1],/Foot position|half-step/);
 assert.match(fight.rounds[8].report[1],/fatigue signal|stance recovery/);
 assert.match(fight.rounds[11].report[1],/risk ledger/);
});
test("Haney-Lomachenko separates the official cards from fan consensus",()=>{
 const haney={...a,id:"haney",last:"Haney"},loma={...b,id:"lomachenko",last:"Lomachenko"};
 const fight=BoxingEngine.buildFight(haney,loma,{rounds:12,ring:20});
 assert.equal(fight.winner,"a");
 assert.deepEqual(fight.judges,[
  {name:"TIM CHEATHAM",a:115,b:113},
  {name:"DAVE MORETTI",a:116,b:112},
  {name:"DAVID SUTHERLAND",a:115,b:113}
 ]);
 assert.deepEqual([fight.totals.kdA,fight.totals.kdB],[0,0]);
 assert.equal(fight.event.fanConsensus.label,"HIGHLY DISPUTED DECISION");
 assert.ok(fight.event.fanConsensus.sources.every(source=>source.url.includes("reddit.com/r/Boxing")));
});
test("every curated historical replay includes sourced fan consensus",()=>{
 const curated=BOXING_FIGHT_HISTORY.fights.filter(f=>["stevenson-lopez-2026","stevenson-zepeda-2025","haney-lomachenko-2023","whitaker-delahoya-1997","mayweather-pacquiao-2015"].includes(f.id));
 assert.equal(curated.length,5);
 for(const record of curated){
  assert.ok(record.fanConsensus?.summary.length>150);
  assert.ok(record.fanConsensus.themes.length>=4);
  assert.ok(record.fanConsensus.sources.length>=2);
  assert.ok(record.fanConsensus.sources.every(source=>source.url.includes("reddit.com/r/Boxing")));
 }
});
test("Mayweather-Pacquiao has official cards and historical fan context",()=>{
 const floyd={...a,id:"mayweather",last:"Mayweather"},manny={...b,id:"pacquiao",last:"Pacquiao"};
 const fight=BoxingEngine.buildFight(floyd,manny,{rounds:12,ring:20});
 assert.equal(fight.winner,"a");
 assert.deepEqual(fight.judges,[
  {name:"DAVE MORETTI",a:118,b:110},
  {name:"BURT CLEMENTS",a:116,b:112},
  {name:"GLENN FELDMAN",a:116,b:112}
 ]);
 assert.match(fight.event.fanConsensus.label,/UNDERWHELMING/);
});
test("same-hand matchups are closed stance and never called mirrored",()=>{
 const floyd={...a,id:"floyd-hyp",last:"Mayweather",stance:"Orthodox"};
 const hearns={...b,id:"hearns-hyp",last:"Hearns",stance:"Orthodox"};
 const fight=BoxingEngine.buildFight(floyd,hearns,{rounds:10,ring:20});
 for(const round of fight.rounds){
  assert.equal(round.tactics.openStance,false);
  assert.equal(round.tactics.stanceMatchup,"Closed stance");
  assert.equal(round.tactics.activeStanceA,"Orthodox");
  assert.equal(round.tactics.activeStanceB,"Orthodox");
  assert.match(round.report[0],/closed-stance geometry/);
  assert.doesNotMatch(round.report.join(" "),/mirrored stance/i);
 }
});
test("switch hitters receive explicit round-specific stance geometry",()=>{
 const switcher={...a,id:"switch-hyp",stance:"Switch"},orthodox={...b,id:"orth-hyp",stance:"Orthodox"};
 const fight=BoxingEngine.buildFight(switcher,orthodox,{rounds:6,ring:20});
 assert.equal(fight.rounds[0].tactics.activeStanceA,"Southpaw");
 assert.equal(fight.rounds[0].tactics.openStance,true);
 assert.equal(fight.rounds[2].tactics.activeStanceA,"Orthodox");
 assert.equal(fight.rounds[2].tactics.openStance,false);
});
test("styles make fights: signature systems produce matchup-specific analysis",()=>{
 const floyd={...a,id:"mayweather",last:"Mayweather",stance:"Orthodox"};
 const hearns={...b,id:"hearns",last:"Hearns",stance:"Orthodox"};
 const leonard={...b,id:"leonard",last:"Leonard",stance:"Orthodox"};
 const versusHearns=BoxingEngine.buildFight(floyd,hearns,{rounds:10,ring:20});
 const versusLeonard=BoxingEngine.buildFight(leonard,floyd,{rounds:10,ring:20});
 const hearnsText=versusHearns.rounds[0].report.join(" ");
 const leonardText=versusLeonard.rounds[0].report.join(" ");
 assert.match(hearnsText,/shoulder-roll|spear right hand|unusually long jab/);
 assert.match(leonardText,/high-speed finishing flurry|changes tempo|shoulder-roll/);
 assert.notEqual(hearnsText,leonardText);
 assert.notDeepEqual(versusHearns.rounds[0].tactics.identityB,versusLeonard.rounds[0].tactics.identityA);
});
test("round analysis evolves instead of restarting the same opening and middle",()=>{
 const whitaker={...a,id:"whitaker-hyp",last:"Whitaker",stance:"Southpaw"};
 const davis={...b,id:"davis",last:"Davis",stance:"Southpaw"};
 const fight=BoxingEngine.buildFight(whitaker,davis,{rounds:12,ring:20});
 assert.equal(new Set(fight.rounds.map(r=>r.report[0])).size,fight.rounds.length);
 assert.equal(new Set(fight.rounds.map(r=>r.report[1])).size,fight.rounds.length);
 assert.match(fight.rounds[1].report[0],/evidence from round one|previous round/);
 assert.match(fight.rounds[5].report[0],/halfway point/);
 assert.match(fight.rounds[8].report[0],/score pressure/);
 assert.match(fight.rounds[10].report[0],/unofficial score/);
});
test("hypothetical analysis carries fight memory and style-resume comparisons",()=>{
 const ennis={...a,id:"ennis",last:"Ennis",stance:"Switch",division:"Welterweight"};
 const norman={...b,id:"norman",last:"Norman",stance:"Orthodox",division:"Welterweight"};
 const fight=BoxingEngine.buildFight(ennis,norman,{rounds:12,ring:20});
 const first=fight.rounds[0].report.join(" ");
 const late=fight.rounds[8].report.join(" ");
 assert.match(first,/résumé|comparison point|reference points/);
 assert.match(first,/switch-hitting|right hand|counter/);
 assert.match(late,/working card|through 8 rounds|previous chapter|score pressure/);
 assert.notEqual(fight.rounds[7].report[0],fight.rounds[8].report[0]);
 assert.notEqual(fight.rounds[7].headline,fight.rounds[8].headline);
});
test("late-round film study avoids predictable repeated section templates",()=>{
 const crawford={...a,id:"crawford",last:"Crawford",stance:"Switch",division:"Welterweight",iq:99,defense:95,accuracy:97};
 const shakur={...b,id:"stevenson",last:"Stevenson",stance:"Southpaw",division:"Lightweight",iq:98,defense:100,accuracy:96,aggression:72};
 const fight=BoxingEngine.buildFight(crawford,shakur,{rounds:12,ring:20});
 const late=fight.rounds.slice(8,11);
 assert.ok(late.length>=3);
 for(const round of late){
  const lastThree=round.report.slice(2).join(" ");
  assert.doesNotMatch(lastThree,/Across the closing minute/);
  assert.doesNotMatch(lastThree,/The numbers are a footprint/);
  assert.doesNotMatch(lastThree,/signature tools are producing cleaner, repeatable work/);
 }
 assert.ok(new Set(late.map(r=>r.report[2].slice(0,80))).size>=2);
 assert.ok(new Set(late.map(r=>r.report[3].slice(0,80))).size>=2);
 assert.ok(new Set(late.map(r=>r.report[4].slice(0,80))).size>=2);
});
test("opening analysis varies across different simulations and final bell has no next-round language",()=>{
 const stevenson={...a,id:"stevenson",last:"Stevenson",stance:"Southpaw",division:"Lightweight",defense:100,iq:98,accuracy:96,aggression:72};
 const loma={...b,id:"lomachenko",last:"Lomachenko",stance:"Southpaw",division:"Lightweight",footwork:100,iq:100};
 const crawford={...a,id:"crawford",last:"Crawford",stance:"Switch",division:"Welterweight",iq:99,accuracy:97};
 const mayweather={...b,id:"mayweather",last:"Mayweather",stance:"Orthodox",division:"Welterweight",defense:100,iq:100,aggression:60};
 const fightOne=BoxingEngine.buildFight(stevenson,loma,{rounds:12,ring:20});
 const fightTwo=BoxingEngine.buildFight(crawford,mayweather,{rounds:12,ring:20});
 assert.notEqual(fightOne.rounds[0].report[0].slice(0,140),fightTwo.rounds[0].report[0].slice(0,140));
 const finalText=fightOne.rounds.at(-1).report.join(" ");
 assert.match(finalText,/Final corner read|closing argument|scorecards/);
 assert.doesNotMatch(finalText,/next round|next chapter|following round|corner stool/i);
});
test("fight settings materially change weight, stamina, scoring context and seed",()=>{
 const ward={...a,id:"ward-settings",last:"Ward",division:"Super Middleweight",weight:168,defense:98,iq:99,footwork:96,cardio:96,aggression:78};
 const joshua={...b,id:"joshua-settings",last:"Joshua",division:"Heavyweight",weight:245,power:96,speed:84,chin:88,defense:84,iq:88,footwork:82,cardio:86,aggression:88};
 const open=BoxingEngine.buildFight(ward,joshua,{rounds:12,ring:20,weight:"Open Weight",championship:true,neutral:true,venue:"Madison Square Garden"});
 const contracted=BoxingEngine.buildFight(ward,joshua,{rounds:12,ring:20,weight:"Super Middleweight",championship:true,neutral:true,venue:"Madison Square Garden"});
 assert.notEqual(open.seed,contracted.seed);
 assert.ok(open.matchup.massRatio<contracted.matchup.massRatio);
 assert.equal(contracted.matchup.targetWeight,168);
 assert.ok(contracted.rounds[0].lines.some(line=>line.includes("making 168 lb")));
 assert.match(contracted.rounds[0].report[0],/Fight-settings layer/);
 const titleA={...a,id:"title-a"},titleB={...b,id:"title-b"};
 const title=BoxingEngine.buildFight(titleA,titleB,{rounds:12,ring:20,weight:"Open Weight",championship:true,neutral:true});
 const nonTitle=BoxingEngine.buildFight(titleA,titleB,{rounds:12,ring:20,weight:"Open Weight",championship:false,neutral:true});
 assert.notEqual(title.seed,nonTitle.seed);
 assert.ok(title.settingEffects.join(" ").includes("Championship rules"));
 assert.ok(nonTitle.settingEffects.join(" ").includes("Non-title pacing"));
});
test("heavyweight setting preserves selected-version fight weights instead of forcing a fake limit",()=>{
 const ali={...a,id:"ali-weight",last:"Ali",division:"Heavyweight",weight:216,stance:"Orthodox"};
 const wilder={...b,id:"wilder-weight",last:"Wilder",division:"Heavyweight",weight:219,stance:"Orthodox",power:100};
 const fight=BoxingEngine.buildFight(ali,wilder,{rounds:12,ring:24,weight:"Heavyweight",championship:true,neutral:true});
 assert.equal(fight.matchup.targetWeight,null);
 assert.equal(fight.matchup.naturalWeightA,216);
 assert.equal(fight.matchup.naturalWeightB,219);
 assert.equal(fight.matchup.weightA,216);
 assert.equal(fight.matchup.weightB,219);
 assert.doesNotMatch(fight.rounds[0].report[0],/260 lb/);
 assert.match(fight.rounds[0].report[0],/open division|216 lb|219 lb/);
});
test("old-era conditions affect the engine instead of acting like cosmetic labels",()=>{
 const oldTimer={...a,id:"old-era-a",last:"OldTimer",division:"Heavyweight",weight:206,stance:"Orthodox",aggression:94,chin:98,cardio:99,footwork:89,power:88};
 const modern={...b,id:"old-era-b",last:"Modern",division:"Heavyweight",weight:224,stance:"Orthodox",defense:94,iq:95,accuracy:93,cardio:93};
 const baseline=BoxingEngine.buildFight(oldTimer,modern,{rounds:12,ring:20,weight:"Heavyweight",championship:true,neutral:true,ruleset:"modern",environment:"indoor",weighin:"next-day",equipment:"modern"});
 const oldSchool=BoxingEngine.buildFight(oldTimer,modern,{rounds:20,ring:20,weight:"Heavyweight",championship:true,neutral:true,ruleset:"old-school",environment:"outdoor-heat",weighin:"same-day",equipment:"vintage"});
 assert.notEqual(oldSchool.seed,baseline.seed);
 assert.ok(oldSchool.rounds.length<=20);
 assert.ok(oldSchool.settingEffects.join(" ").includes("old-school rules"));
 assert.ok(oldSchool.settingEffects.join(" ").includes("Outdoor heat"));
 assert.ok(oldSchool.rounds[0].lines.some(line=>/forearms|head position|heat|Vintage gloves/i.test(line)));
 assert.ok(oldSchool.rounds[0].tactics.era.roughness>baseline.rounds[0].tactics.era.roughness);
 assert.ok(oldSchool.rounds[0].tactics.era.gloveDamage>baseline.rounds[0].tactics.era.gloveDamage);
 assert.ok(oldSchool.conditions.era.longFightTax>baseline.conditions.era.longFightTax);
});
test("deep-water experience matters after a fighter passes his proven round ceiling",()=>{
 const floyd={...a,id:"mayweather",last:"Mayweather",division:"Welterweight",stance:"Orthodox",power:70,chin:100,defense:100,iq:100,footwork:99,cardio:97,accuracy:99,aggression:58};
 const robinson={...b,id:"robinson",last:"Robinson",division:"Welterweight",stance:"Orthodox",power:72,speed:100,chin:100,defense:97,iq:100,footwork:100,cardio:98,accuracy:99,aggression:70};
 const fight=BoxingEngine.buildFight(floyd,robinson,{rounds:15,ring:20,weight:"Welterweight",championship:true,neutral:true,ruleset:"modern",environment:"indoor",weighin:"next-day",equipment:"modern"});
 const round13=fight.rounds.find(r=>r.number===13);
 assert.ok(round13);
 assert.equal(round13.tactics.maxRoundsA,12);
 assert.equal(round13.tactics.maxRoundsB,15);
 assert.ok(round13.tactics.deepWaterA>0);
 assert.equal(round13.tactics.deepWaterB,0);
 assert.ok(round13.lines.some(line=>line.includes("proven 12-round distance")));
 assert.ok(round13.report.some(line=>line.includes("Deep-water note")));
});
test("scouting-round language no longer repeats the old first-experiment script",()=>{
 const fight=BoxingEngine.buildFight({...a,id:"script-a"},{...b,id:"script-b"},{rounds:12,ring:20,narrationSalt:"script-check"});
 const text=fight.rounds.map(r=>(r.report||[]).join(" ")).join(" ");
 assert.equal(text.includes("The initial read becomes a first experiment—repeat the look, change the ending and see whether the defense repeats itself."),false);
});
test("injury and cut profiles can lightly affect simulated fights",()=>{
 const fragile={...a,id:"fragile-test",last:"Fragile",division:"Welterweight",stance:"Orthodox",power:82,chin:92,defense:91,iq:93,footwork:92,cardio:94,accuracy:94,aggression:82,injuryRisk:{hand:.95,cut:.95,handLabel:"test brittle hands",cutLabel:"test cut risk"}};
 const opponent={...b,id:"injury-opponent",last:"Opponent",division:"Welterweight",stance:"Orthodox",power:70,chin:100,defense:88,iq:88,footwork:88,cardio:94,accuracy:88,aggression:70};
 const fight=BoxingEngine.buildFight(fragile,opponent,{rounds:12,ring:20,weight:"Welterweight",championship:true,neutral:true,ruleset:"old-school",environment:"indoor",weighin:"next-day",equipment:"minimal",narrationSalt:"injury-test"});
 const injuryRounds=fight.rounds.filter(r=>r.tactics.injuryEvents.length);
 assert.ok(injuryRounds.some(r=>r.tactics.injuryEvents.some(e=>e.fighter.last==="Fragile")));
 assert.ok(injuryRounds.some(r=>r.tactics.injuryEvents.some(e=>["hand","cut"].includes(e.kind))));
 assert.ok(fight.rounds.some(r=>r.lines.some(line=>/brittle hands|hand issue|cut\/swelling|test cut risk/.test(line))));
 assert.ok(fight.rounds.some(r=>r.report.some(line=>line.includes("Injury layer"))));
});
test("equipment selection changes injury-risk environment and Mayweather has hand-risk metadata",()=>{
 const floyd={...a,id:"mayweather",last:"Mayweather",division:"Welterweight",stance:"Orthodox",power:76,chin:94,defense:100,iq:100,footwork:97,cardio:96,accuracy:100,aggression:60};
 const opponent={...b,id:"equipment-opponent",last:"Opponent",division:"Welterweight",stance:"Orthodox"};
 const modern=BoxingEngine.buildFight(floyd,opponent,{rounds:8,ring:20,weight:"Welterweight",equipment:"modern",narrationSalt:"equipment-risk"});
 const minimal=BoxingEngine.buildFight(floyd,opponent,{rounds:8,ring:20,weight:"Welterweight",equipment:"minimal",narrationSalt:"equipment-risk"});
 assert.ok(minimal.rounds[0].tactics.era.handInjuryRisk>modern.rounds[0].tactics.era.handInjuryRisk);
 assert.ok(minimal.rounds[0].tactics.era.cutRisk>modern.rounds[0].tactics.era.cutRisk);
 assert.ok(modern.rounds[0].tactics.injuryProfileA.hand>.35);
 assert.equal(modern.rounds[0].tactics.injuryProfileA.handLabel,"known brittle hands");
});
test("low stopping-power fighters cannot become unrealistic finishers against elite durability",()=>{
 const floyd={...a,id:"mayweather",last:"Mayweather",division:"Welterweight",stance:"Orthodox",power:76,speed:94,chin:96,defense:100,iq:100,footwork:98,cardio:96,accuracy:99,aggression:58};
 const haney={...b,id:"haney",last:"Haney",division:"Junior Welterweight",stance:"Orthodox",power:76,speed:94,chin:91,defense:97,iq:97,footwork:96,cardio:95,accuracy:96,aggression:74};
 const fight=BoxingEngine.buildFight(floyd,haney,{rounds:12,ring:20,weight:"Welterweight",championship:true,neutral:true,narrationSalt:"pillow-fist-check"});
 assert.equal(fight.rounds.some(round=>round.knockA),false);
 assert.equal(fight.rounds.some(round=>round.stoppage?.winner==="b"),false);
 assert.equal(fight.totals.kdA,0);
 assert.equal(fight.rounds[0].tactics.stoppingPowerB.lowCeiling,true);
 assert.equal(fight.rounds[0].tactics.kdCapA,0);
 assert.equal(fight.rounds[0].tactics.canStopB,false);
 assert.ok(fight.rounds[0].lines.some(line=>line.includes("scoring control more than sudden damage")));
});
test("clean no-knockdown elites are protected from random canvas moments",()=>{
 const canelo={...a,id:"canelo",last:"Canelo",division:"Super Middleweight",stance:"Orthodox",weight:168,power:96,speed:88,chin:99,defense:95,iq:97,footwork:88,cardio:94,accuracy:96,aggression:88};
 const crawford={...b,id:"crawford",last:"Crawford",division:"Junior Middleweight",stance:"Switch",weight:154,power:93,speed:96,chin:94,defense:96,iq:99,footwork:96,cardio:96,accuracy:98,aggression:84};
 const fight=BoxingEngine.buildFight(crawford,canelo,{rounds:12,ring:20,weight:"Super Middleweight",championship:true,neutral:true,narrationSalt:"durability-history"});
 assert.equal(fight.totals.kdB,0);
 assert.equal(fight.rounds.some(round=>round.knockB),false);
 assert.equal(fight.rounds[0].tactics.knockdownHistoryB.tier,"never");
 assert.ok(fight.rounds[0].tactics.kdCapB<=.007);
 assert.ok(fight.rounds[0].lines.some(line=>line.includes("reduces random canvas volatility")));
});
test("rare-knockdown elites keep danger possible but capped",()=>{
 const davis={...a,id:"davis",last:"Davis",division:"Lightweight",stance:"Southpaw",weight:135,power:100,speed:94,chin:95,defense:91,iq:94,footwork:92,cardio:91,accuracy:93,aggression:98};
 const lomachenko={...b,id:"lomachenko",last:"Lomachenko",division:"Lightweight",stance:"Southpaw",weight:135,power:84,speed:97,chin:92,defense:96,iq:99,footwork:99,cardio:97,accuracy:96,aggression:82};
 const fight=BoxingEngine.buildFight(davis,lomachenko,{rounds:12,ring:20,weight:"Lightweight",championship:true,neutral:true,narrationSalt:"rare-kd-history"});
 assert.equal(fight.rounds[0].tactics.knockdownHistoryB.tier,"rare");
 assert.ok(fight.rounds[0].tactics.kdCapB<=.018);
 assert.ok(fight.rounds[0].tactics.kdChanceB<=fight.rounds[0].tactics.kdCapB);
});
test("Davis versus Teofimo Lopez remains hypothetical and cannot borrow another Lopez result",()=>{
 const davis={...a,id:"davis",last:"Davis",name:"Gervonta Davis",division:"Lightweight",stance:"Southpaw",power:100,speed:94,chin:95,defense:91,iq:94,footwork:92,cardio:91,accuracy:93,aggression:98};
 const teofimo={...b,id:"lopez",last:"López",name:"Teófimo López",division:"Lightweight",stance:"Orthodox",power:95,speed:93,chin:92,defense:87,iq:91,footwork:90,cardio:93,accuracy:91,aggression:90};
 assert.equal(BOXING_FIGHT_HISTORY.find(davis,teofimo),null);
 for(let i=0;i<8;i++){
  const fight=BoxingEngine.buildFight(davis,teofimo,{rounds:12,ring:20,weight:"Lightweight",championship:true,neutral:true,narrationSalt:`davis-teo-${i}`});
  assert.equal(fight.historical,undefined);
  assert.notEqual(fight.seed?.startsWith?.("historical:"),true);
  assert.equal(fight.rounds[0].stoppage,null);
 }
});
test("neutral officials setting can shade close scorecards",()=>{
 const evenA={...a,id:"even-a",last:"EvenA",power:90,speed:90,chin:90,defense:90,iq:90,footwork:90,cardio:90,accuracy:90,aggression:90};
 const evenB={...b,id:"even-b",last:"EvenB",power:90,speed:90,chin:90,defense:90,iq:90,footwork:90,cardio:90,accuracy:90,aggression:90};
 const neutral=BoxingEngine.buildFight(evenA,evenB,{rounds:4,ring:20,weight:"Open Weight",championship:false,neutral:true,venue:"Neutral"});
 const local=BoxingEngine.buildFight(evenA,evenB,{rounds:4,ring:20,weight:"Open Weight",championship:false,neutral:false,venue:"Local"});
 assert.notEqual(neutral.seed,local.seed);
 assert.ok(local.settingEffects.join(" ").includes("Non-neutral officials"));
 const localBaseA=local.rounds.reduce((n,r)=>n+r.scoreA,0),localBaseB=local.rounds.reduce((n,r)=>n+r.scoreB,0);
 if(Math.abs(localBaseA-localBaseB)<=4){
  assert.deepEqual(local.judges.map(j=>[j.a,j.b]),[[localBaseA,localBaseB],[localBaseA+1,localBaseB+1],[localBaseA+2,localBaseB-1]]);
 }
});
test("narration salt changes phrasing without changing fight math",()=>{
 const crawford={...a,id:"crawford",last:"Crawford",stance:"Switch",division:"Welterweight",iq:99,accuracy:97};
 const shakur={...b,id:"stevenson",last:"Stevenson",stance:"Southpaw",division:"Lightweight",iq:98,defense:100,accuracy:96,aggression:72};
 const base={rounds:12,ring:20};
 const first=BoxingEngine.buildFight(crawford,shakur,{...base,narrationSalt:"first-run"});
 const second=BoxingEngine.buildFight(crawford,shakur,{...base,narrationSalt:"second-run"});
 assert.equal(first.winner,second.winner);
 assert.equal(first.decision,second.decision);
 assert.deepEqual(first.judges,second.judges);
 assert.deepEqual(first.totals,second.totals);
 assert.notEqual(first.rounds[0].report[0],second.rounds[0].report[0]);
 assert.notEqual(first.rounds[5].report[2],second.rounds[5].report[2]);
});
