(function(global){
const cachePrefix="ringside.researchDesk.v3.";
const browserStorage=()=>{
 try{return typeof window!=="undefined"&&window.localStorage?window.localStorage:null}catch{return null}
};
const safeStorage={
 get(key){try{return JSON.parse(browserStorage()?.getItem(cachePrefix+key)||"null")}catch{return null}},
 set(key,value){try{browserStorage()?.setItem(cachePrefix+key,JSON.stringify(value))}catch{}}
};
const styleFamilies={
 pressure:["pressure","body work","volume","rough entries","front-foot"],
 defensive:["defense","distance","shell","pull counter","low-output control"],
 counter:["counter","trap","catch-and-shoot","timing","intercepting"],
 puncher:["power","right hand","left hand","knockout","single-shot danger"],
 angle:["angles","footwork","pivot","outside step","lateral"],
 rhythm:["rhythm","tempo","feint","cadence","download"],
 switch:["switch","stance","ambidextrous","lane changes"]
};
const divisionWeight={
  Heavyweight:224,Cruiserweight:200,"Light Heavyweight":175,"Super Middleweight":168,Middleweight:160,
  "Junior Middleweight":154,Welterweight:147,"Junior Welterweight":140,Lightweight:135,
  "Junior Lightweight":130,Featherweight:126,"Junior Featherweight":122,Bantamweight:118,
  "Junior Bantamweight":115,Flyweight:112,"Junior Flyweight":108,Strawweight:105
};
function contractLimit(weightClass){return !weightClass||weightClass==="Open Weight"||weightClass==="Heavyweight"?null:divisionWeight[weightClass]||null}
function hash(str){let h=2166136261;for(const c of String(str)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function keyFor(a,b,settings={}){
 return [a.id,a.year||"current",b.id,b.year||"current",settings.weight||"",settings.rounds||"",settings.ring||"",settings.championship===false?"non-title":"title",settings.neutral===false?"local":"neutral",settings.ruleset||"modern",settings.environment||"indoor",settings.weighin||"next-day",settings.equipment||"modern"].join("::");
}
function archetype(f){
 const tags=[...(f.gems?.tags||[])].join(" ").toLowerCase();
 if(f.stance==="Switch")return "switch-hitter";
 if(/footwork|angles/.test(tags)||f.footwork>=96)return "angle technician";
 if(/defensive|range/.test(tags)||f.defense>=97)return "defensive technician";
 if(/counter/.test(tags)||f.iq+f.accuracy>=190)return "counterpuncher";
 if(f.power>=96)return "puncher";
 if(f.aggression>=94)return "pressure fighter";
 if(/timing|rhythm/.test(tags))return "rhythm boxer";
 return "balanced boxer";
}
function styleTags(f){
 const tags=new Set();
 const text=[archetype(f),...(f.gems?.tags||[])].join(" ").toLowerCase();
 Object.entries(styleFamilies).forEach(([tag,words])=>{if(words.some(word=>text.includes(word)))tags.add(tag)});
 if(f.stance==="Switch")tags.add("switch");
 if(f.aggression>=94)tags.add("pressure");
 if(f.defense>=96)tags.add("defensive");
 if(f.power>=95)tags.add("puncher");
 if(f.iq>=97)tags.add("rhythm");
 return [...tags].slice(0,5);
}
function ratingScore(f){
 return f.power*.16+f.speed*.14+f.chin*.1+f.defense*.16+f.iq*.18+f.footwork*.12+f.cardio*.08+f.accuracy*.14+f.aggression*.04;
}
function naturalWeight(f){return Number(f.weight)||divisionWeight[f.division]||160}
function effectiveWeight(f,settings={}){
 const natural=naturalWeight(f),target=contractLimit(settings.weight);
 if(!target)return natural;
 if(natural>target)return target;
 return natural+(target-natural)*.38;
}
function matchupEdge(a,b,settings={}){
 const scoreA=ratingScore(a),scoreB=ratingScore(b);
 const weightA=effectiveWeight(a,settings),weightB=effectiveWeight(b,settings),massRatio=weightA/weightB;
 const sizeEdge=Math.log(massRatio)*22;
 const powerChinEdge=(a.power-b.chin)*.13-(b.power-a.chin)*.13;
 const defenseAccuracyEdge=(a.defense+a.accuracy-b.defense-b.accuracy)*.09;
 const paceEdge=(a.cardio+a.aggression-b.cardio-b.aggression)*.05;
 const iqEdge=(a.iq-b.iq)*.16;
 const total=(scoreA-scoreB)*.8+sizeEdge+powerChinEdge+defenseAccuracyEdge+paceEdge+iqEdge;
 let probA=Math.max(7,Math.min(93,50+total*1.65));
 const naturalMassGap=Math.max(massRatio,1/massRatio);
 if(naturalMassGap>1.8)probA=massRatio>1?Math.max(probA,84):Math.min(probA,16);
 else if(naturalMassGap>1.45)probA=massRatio>1?Math.max(probA,72):Math.min(probA,28);
 else if(naturalMassGap>1.25)probA=massRatio>1?Math.max(probA,63):Math.min(probA,37);
 const gap=Math.abs(probA-50);
 const favorite=probA>=50?a:b,underdog=favorite===a?b:a;
 const type=Math.max(massRatio,1/massRatio)>1.45?"natural-size mismatch":gap>=24?"major skill/era mismatch":gap>=15?"clear favorite":gap>=8?"lean":"competitive";
 const reasons=[];
 if(contractLimit(settings.weight))reasons.push(`${settings.weight} changes the effective size equation`);
 if(Math.max(massRatio,1/massRatio)>1.22)reasons.push(`${favorite.last} carries the more relevant natural size/weight frame`);
 if(Math.abs(scoreA-scoreB)>5)reasons.push(`${favorite.last} has the stronger all-around version rating`);
 if(Math.abs(a.power-b.power)>8)reasons.push(`${a.power>b.power?a.last:b.last} owns the bigger one-shot threat`);
 if(Math.abs(a.defense-b.defense)>8)reasons.push(`${a.defense>b.defense?a.last:b.last} has the cleaner defensive floor`);
 if(Math.abs(a.iq-b.iq)>7)reasons.push(`${a.iq>b.iq?a.last:b.last} has the better adjustment profile`);
 if(!reasons.length)reasons.push("the matchup grades close enough that tactics should swing the simulation");
 return {probA:Math.round(probA),probB:Math.round(100-probA),favorite:favorite.id,underdog:underdog.id,type,reasons:reasons.slice(0,3),weightA,weightB,ratingA:Number(scoreA.toFixed(1)),ratingB:Number(scoreB.toFixed(1))};
}
function compuboxSummary(f){
 const c=f.compubox;
 if(!c)return null;
 const bits=[];
 if(c.totalThrownPerRound)bits.push(`${Math.round(c.totalThrownPerRound)} thrown/round`);
 if(c.totalConnectPct)bits.push(`${Math.round(c.totalConnectPct)}% connect`);
 if(c.opponentConnectPct)bits.push(`${Math.round(c.opponentConnectPct)}% opponent connect`);
 if(c.plusMinus!=null)bits.push(`${Number(c.plusMinus)>0?"+":""}${Number(c.plusMinus).toFixed(1)} plus/minus`);
 return bits.join(" · ")||null;
}
function sourceCards(a,b,record){
 const sources=[
  {id:"versions",label:"Fighter versions",status:"active",confidence:.86,detail:"Era-specific ratings and weight classes are loaded locally."},
  {id:"gems",label:"Boxing Gems index",status:a.gems||b.gems?"active":"gap",confidence:a.gems&&b.gems?.videoCount?.valueOf?.()?0.78:0.55,detail:`${a.last}: ${a.gems?.videoCount||0} indexed videos · ${b.last}: ${b.gems?.videoCount||0} indexed videos`},
  {id:"rummy",label:"Rummy's Corner P4P playlist",status:a.eraStudy||b.eraStudy?"active":"gap",confidence:a.eraStudy||b.eraStudy?0.72:0.45,detail:`${a.last}: ${a.eraStudy?.decades?.join("/")||"no decade profile"} · ${b.last}: ${b.eraStudy?.decades?.join("/")||"no decade profile"}`},
  {id:"compubox",label:"CompuBox-style profile",status:a.compubox||b.compubox?"active":"gap",confidence:a.compubox&&b.compubox?0.74:0.48,detail:[compuboxSummary(a),compuboxSummary(b)].filter(Boolean).join(" | ")||"No licensed punch-profile sample attached yet."},
  {id:"history",label:"Fight history",status:record?"verified":"scouting",confidence:record?0.96:0.64,detail:record?`Verified prior fight: ${record.method}, ${record.date||"date listed"}`:"No verified head-to-head result in the local archive."}
 ];
 return sources;
}
function comparableOpposition(f,opponent){
 const type=archetype(opponent);
 const known={
  mayweather:{southpaw:["Zab Judah","Manny Pacquiao"],pressure:["José Luis Castillo","Marcos Maidana"],puncher:["Shane Mosley","Canelo Álvarez"]},
  pacquiao:{defensive:["Floyd Mayweather","Juan Manuel Márquez"],puncher:["Miguel Cotto","Ricky Hatton"]},
  crawford:{pressure:["Errol Spence Jr.","Shawn Porter"],puncher:["Egidijus Kavaliauskas","Kell Brook"]},
  spence:{switch:["Terence Crawford"],pressure:["Shawn Porter","Yordenis Ugas"]},
  lomachenko:{defensive:["Devin Haney","Guillermo Rigondeaux"],pressure:["Orlando Salido"]},
  davis:{pressure:["Isaac Cruz"],defensive:["Héctor García","Mario Barrios"]},
  canelo:{defensive:["Floyd Mayweather","Erislandy Lara","Dmitry Bivol"],pressure:["Gennadiy Golovkin"]},
  hearns:{pressure:["Marvin Hagler","Iran Barkley"],boxer:["Sugar Ray Leonard"]},
  leonard:{puncher:["Thomas Hearns"],pressure:["Roberto Durán"]},
  haney:{southpaw:["Vasiliy Lomachenko"],pressure:["George Kambosos Jr.","Regis Prograis"]}
 };
 const buckets=known[f.id]||{};
 const found=Object.entries(buckets).find(([k])=>type.includes(k)||k.includes(type.split(" ")[0])||opponent.stance?.toLowerCase().includes(k));
 return found?{label:found[0],names:found[1],confidence:.7}:{label:type,names:[],confidence:.38};
}
function fighterCard(f,opponent){
 const tags=styleTags(f),compu=compuboxSummary(f),comp=comparableOpposition(f,opponent);
 const gems=f.gems;
 const strengths=[];
 if(f.iq>=96)strengths.push("elite read-and-adjust ability");
 if(f.defense>=96)strengths.push("defensive responsibility after punching");
 if(f.power>=95)strengths.push("fight-changing power");
 if(f.footwork>=96)strengths.push("ring geography and angle control");
 if(f.cardio>=96)strengths.push("late-round pace retention");
 if(!strengths.length)strengths.push("balanced scoring profile");
 const vulnerabilities=[];
 if(f.aggression<78)vulnerabilities.push("low output can make clean rounds look closer");
 if(f.defense<86)vulnerabilities.push("defensive exits can stay available too long");
 if(f.cardio<88)vulnerabilities.push("pace may tax the legs late");
 if(f.footwork<86)vulnerabilities.push("can be made to reset in straight lines");
 if(!vulnerabilities.length)vulnerabilities.push("needs the preferred range to stay organized");
 return {
  id:f.id,name:f.name,last:f.last,version:f.label||`${f.year||"current"}`,archetype:archetype(f),stance:f.stance,division:f.division,
  bestPerformance:f.bestPerformance||null,
  tags,strengths:strengths.slice(0,3),vulnerabilities:vulnerabilities.slice(0,2),
 compubox:compu,
  film:gems?{videoCount:gems.videoCount,tags:gems.tags,sources:(gems.sources||[]).slice(0,3)}:null,
  eraStudy:f.eraStudy?{videoCount:f.eraStudy.videoCount,decades:f.eraStudy.decades,tags:f.eraStudy.tags,summary:f.eraStudy.summary,sources:(f.eraStudy.sources||[]).slice(0,2)}:null,
  comparableOpposition:comp
 };
}
function styleClash(a,b,settings={}){
 const aType=archetype(a),bType=archetype(b),open=(a.stance==="Southpaw")!==(b.stance==="Southpaw");
 const aTags=styleTags(a),bTags=styleTags(b);
 const shared=aTags.filter(tag=>bTags.includes(tag));
 const contrast=aTags.filter(tag=>!bTags.includes(tag)).concat(bTags.filter(tag=>!aTags.includes(tag))).slice(0,4);
 const lane=open?"open-stance rear-hand lane and outside-foot battle":"closed-stance jab channel and outside-shoulder angle battle";
 const edge=matchupEdge(a,b,settings),favorite=edge.favorite===a.id?a:b,underdog=favorite===a?b:a;
 const firstContrast=contrast[0]||shared[0]||"ring geography";
 const eraNotes=[];
 if(settings.rounds>12)eraNotes.push(`${settings.rounds} rounds make pacing and attrition part of the scouting question, not just a scheduling detail`);
 if(settings.ruleset&&settings.ruleset!=="modern")eraNotes.push(`${settings.ruleset} rules increase the value of clinch craft, rough positioning and survival IQ`);
 if(settings.environment==="outdoor-heat")eraNotes.push("outdoor heat punishes wasted motion and makes late-round footwork more expensive");
 if(settings.weighin==="same-day")eraNotes.push("same-day weigh-ins make any hard cut more dangerous");
 if(settings.equipment==="vintage"||settings.equipment==="minimal")eraNotes.push("older equipment changes both damage transfer and traction");
 const eraFrame=eraNotes.length?` The selected conditions matter: ${eraNotes.join("; ")}.`:"";
 const fightShape=[
 `${a.last} is not just “a ${aType}” here — the useful question is whether that version can make its best skill show up before ${b.last}'s best skill becomes repeatable.`,
 `${b.last}'s ${bType} profile changes the read because this is a ${lane}; the lead-hand battle decides whether the power lane is earned or merely wished for.`,
  a.eraStudy||b.eraStudy?`The decade-study layer adds context without replacing the engine: ${[a.eraStudy?.summary,b.eraStudy?.summary].filter(Boolean).join(" ")}`:"",
 edge.type.includes("mismatch")||edge.type==="clear favorite"?`The desk grades this as ${edge.type}, with ${favorite.last} favored because ${edge.reasons.join("; ")}.`:`The desk grades this as ${edge.type}, so the first two rounds should be about who makes the opponent abandon plan A first.`,
 `${underdog.last}'s path is specific: win the ${firstContrast} layer early, avoid giving the favorite clean resets, and force exchanges where the rating gap matters least.${eraFrame}`
 ].filter(Boolean);
 const summary=fightShape.join(" ");
 return {summary,stanceGeometry:open?"open stance":"closed stance",shared,contrast};
}
function questions(a,b,record,settings={}){
 if(record)return [
  `This fight has already happened, so the archive should replay ${record.method} rather than simulate a new winner.`,
  "Use the official cards, knockdowns, deductions and public-reaction notes when available.",
  "Round analysis should explain why the verified result happened, not invent an alternate tactical arc."
 ];
 const aComp=comparableOpposition(a,b),bComp=comparableOpposition(b,a),edge=matchupEdge(a,b,settings);
 const favorite=edge.favorite===a.id?a:b,underdog=favorite===a?b:a;
 const styleProblem=edge.type.includes("mismatch")||edge.type==="clear favorite"
  ?`${underdog.last}: what can realistically shrink the gap — pace, clinch control, body work, or forcing ${favorite.last} to lead first?`
  :`${a.last} vs ${b.last}: which fighter can make the other spend the first minute defending instead of collecting reads?`;
 return [
  `${favorite.last}: can the favorite prove the edge without rushing, or does overconfidence give ${underdog.last} the first clean counter window?`,
  styleProblem,
  `${a.last}'s comparable file: ${aComp.names.join(", ")||`limited clean ${aComp.label} references`}; ${b.last}'s comparable file: ${bComp.names.join(", ")||`limited clean ${bComp.label} references`}.`,
  edge.type==="competitive"?`This is close enough that one tactical layer can flip the card: stance geometry, exit ownership, and late-round stamina matter more than the headline ratings.`:`Mismatch watch: if ${underdog.last} cannot change the first reaction by round three, the simulation should start showing a widening probability and visible tactical debt.`
 ];
}
function dataGaps(a,b,record){
 const gaps=[];
 if(!record)gaps.push("No verified head-to-head result in local cache.");
 if(!a.compubox)gaps.push(`${a.last}: no licensed CompuBox profile attached.`);
 if(!b.compubox)gaps.push(`${b.last}: no licensed CompuBox profile attached.`);
 if(!a.gems)gaps.push(`${a.last}: no indexed Boxing Gems profile.`);
 if(!b.gems)gaps.push(`${b.last}: no indexed Boxing Gems profile.`);
 return gaps;
}
function confidence(sources){
 const weighted=sources.reduce((n,s)=>n+s.confidence,0)/sources.length;
 return Math.round(weighted*100);
}
function create(a,b,settings={}){
 const key=keyFor(a,b,settings),cached=safeStorage.get(key);
 if(cached?.schemaVersion===1)return cached;
 const record=global.BOXING_FIGHT_HISTORY?.find?.(a,b)||null;
 const sources=sourceCards(a,b,record);
 const edge=matchupEdge(a,b,settings);
 const desk={
  schemaVersion:1,
  mode:"local-research-cache",
  futureMode:"openai-research-desk-ready",
  generatedAt:new Date().toISOString(),
  cacheKey:key,
  confidence:confidence(sources),
  sources,
  mismatch:edge,
  verifiedFight:record?{id:record.id,date:record.date,method:record.method,winner:record.winner,hasScorecards:!!record.scorecards,hasStats:!!record.stats}:null,
  fighters:{a:fighterCard(a,b),b:fighterCard(b,a)},
  styleClash:styleClash(a,b,settings),
  scoutingQuestions:questions(a,b,record,settings),
  dataGaps:dataGaps(a,b,record),
  engineHints:{
   narrationSeed:hash(`${key}:${a.last}:${b.last}`),
   mustReplayHistorical:!!record,
   preFightProbabilityA:record?.winner?record.winner===a.id?92:record.winner===b.id?8:50:edge.probA,
   mismatchType:edge.type,
   mismatchReasons:edge.reasons,
   confidenceFloor:record?.scorecards?95:confidence(sources)
  },
  openAiPayloadShape:{
   purpose:"When a backend is added, send this structured matchup object plus retrieved source excerpts to OpenAI. Ask for JSON only: verified facts, scouting deltas, source confidence, and commentary themes. Do not ask the model to pick the winner."
  }
 };
 safeStorage.set(key,desk);
 return desk;
}
global.BOXING_RESEARCH_DESK={create,keyFor};
})(typeof window!=="undefined"?window:globalThis);
