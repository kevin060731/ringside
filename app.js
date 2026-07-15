const fighters=[
 {id:"tyson",name:"Mike Tyson",last:"Tyson",nickname:"Iron",country:"USA",stance:"Orthodox",division:"Heavyweight",years:[{year:1988,label:"1988 · PRIME",power:98,speed:95,chin:91,defense:88,iq:90,footwork:96,cardio:90,accuracy:91,aggression:99},{year:1996,label:"1996 · COMEBACK",power:95,speed:88,chin:88,defense:80,iq:85,footwork:86,cardio:80,accuracy:86,aggression:96}],img:"https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=500&q=85"},
 {id:"usyk",name:"Oleksandr Usyk",last:"Usyk",nickname:"The Cat",country:"UKR",stance:"Southpaw",division:"Heavyweight",years:[{year:2024,label:"2024 · UNDISPUTED",power:85,speed:92,chin:91,defense:94,iq:98,footwork:97,cardio:99,accuracy:93,aggression:87},{year:2018,label:"2018 · CRUISER KING",power:84,speed:96,chin:90,defense:95,iq:97,footwork:98,cardio:99,accuracy:94,aggression:88}],img:"https://images.unsplash.com/photo-1615117972428-28de67cda58e?auto=format&fit=crop&w=500&q=85"},
 {id:"ali",name:"Muhammad Ali",last:"Ali",nickname:"The Greatest",country:"USA",stance:"Orthodox",division:"Heavyweight",years:[{year:1967,label:"1967 · PRIME",power:87,speed:99,chin:95,defense:96,iq:98,footwork:99,cardio:98,accuracy:94,aggression:84},{year:1974,label:"1974 · RUMBLE",power:88,speed:90,chin:98,defense:91,iq:99,footwork:89,cardio:96,accuracy:92,aggression:86}],img:"https://images.unsplash.com/photo-1517438322307-e67111335449?auto=format&fit=crop&w=500&q=85"},
 {id:"crawford",name:"Terence Crawford",last:"Crawford",nickname:"Bud",country:"USA",stance:"Switch",division:"Welterweight",years:[{year:2023,label:"2023 · UNDISPUTED",power:91,speed:94,chin:91,defense:95,iq:99,footwork:95,cardio:96,accuracy:97,aggression:89}],img:"https://images.unsplash.com/photo-1583473848882-f9a5bc7fd2ee?auto=format&fit=crop&w=500&q=85"},
 {id:"canelo",name:"Saúl Álvarez",last:"Canelo",nickname:"Canelo",country:"MEX",stance:"Orthodox",division:"Super Middleweight",years:[{year:2021,label:"2021 · UNDISPUTED",power:95,speed:88,chin:98,defense:94,iq:95,footwork:87,cardio:90,accuracy:95,aggression:90}],img:"https://images.unsplash.com/photo-1591117207239-788bf8de6c3b?auto=format&fit=crop&w=500&q=85"},
 {id:"mayweather",name:"Floyd Mayweather",last:"Mayweather",nickname:"Money",country:"USA",stance:"Orthodox",division:"Welterweight",years:[{year:2007,label:"2007 · PRETTY BOY",power:82,speed:98,chin:92,defense:100,iq:100,footwork:99,cardio:97,accuracy:99,aggression:72}],img:"https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=500&q=85"},
 {id:"golovkin",name:"Gennadiy Golovkin",last:"Golovkin",nickname:"GGG",country:"KAZ",stance:"Orthodox",division:"Middleweight",years:[{year:2015,label:"2015 · PRIME",power:97,speed:87,chin:100,defense:86,iq:94,footwork:91,cardio:96,accuracy:94,aggression:96}],img:"https://images.unsplash.com/photo-1567598508481-65985588e295?auto=format&fit=crop&w=500&q=85"},
 {id:"fury",name:"Tyson Fury",last:"Fury",nickname:"Gypsy King",country:"GBR",stance:"Orthodox",division:"Heavyweight",years:[{year:2020,label:"2020 · WILDER II",power:90,speed:87,chin:93,defense:92,iq:95,footwork:93,cardio:94,accuracy:88,aggression:89}],img:"https://images.unsplash.com/photo-1552072092-7f9b8d63efcb?auto=format&fit=crop&w=500&q=85"}
];
fighters.push(...(window.EXTRA_FIGHTERS||[]));
const currentFighterIds=new Set(["usyk","canelo","fury","opetaia","beterbiev","bivol","davis","lopez","inoue","nakatani","rodriguez","teraji","yabuki","collazo","stevenson","benavidez","ennis","haney","ryangarcia"]);
if(window.ROSTER_VERSION_PACK){
 fighters.forEach(f=>{
  const versions=window.ROSTER_VERSION_PACK[f.id];
  if(versions?.length){
   const mapped=versions.map(version=>({...version}));
   const newestIndex=mapped.findIndex(version=>version.year>=2026||/CURRENT|LATEST/i.test(version.label||""));
   const preferNewest=f.active||currentFighterIds.has(f.id);
   if(preferNewest)f.active=true;
   if(preferNewest&&newestIndex>0)mapped.unshift(...mapped.splice(newestIndex,1));
   f.years=mapped;
  }
 });
}
fighters.forEach(f=>{if(currentFighterIds.has(f.id)&&!window.ROSTER_VERSION_PACK?.[f.id]&&!f.years.some(v=>v.year===2026)){f.active=true;f.updated="2026-07-08";f.years.unshift({...f.years[0],year:2026,label:"CURRENT · JUL 2026"})}});
fighters.forEach(f=>{f.gems=window.BOXING_GEMS_DATA?.profiles?.[f.name]||null});
fighters.forEach(f=>{f.eraStudy=window.RUMMY_CORNER_DATA?.profiles?.[f.name]||null});
fighters.forEach(f=>{f.compubox=window.COMPUBOX_DATA?.profileFor(f)||null});
let selected={a:fighters[0],b:fighters[1]},versions={a:0,b:0},pickerSide="a",scheduled=12,fight=null,current=0,archiveDivision="All",researchDesk=null;
const $=s=>document.querySelector(s);
const wikiAliases={"Saúl Álvarez":"Canelo Álvarez","Gennadiy Golovkin":"Gennady Golovkin","Jesse Rodriguez":"Jesse Rodríguez (boxer)","Oleksandr Usyk":"Oleksandr Usyk","Floyd Mayweather":"Floyd Mayweather Jr.","Julio César Chávez":"Julio César Chávez","Teófimo López":"Teófimo López"};
const portraitJobs=new Map();
async function loadPortrait(f,img){
 if(f.portrait){img.src=f.portrait;return}
 if(!portraitJobs.has(f.id))portraitJobs.set(f.id,(async()=>{
  const title=f.wiki||wikiAliases[f.name]||f.name;
  const summary=await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`).then(r=>r.ok?r.json():null).catch(()=>null);
  if(summary?.thumbnail?.source)return summary.thumbnail.source;
  const commons=await fetch(`https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrlimit=6&gsrsearch=${encodeURIComponent(`"${f.name}" boxer`)}&prop=imageinfo&iiprop=url&iiurlwidth=500&format=json&origin=*`).then(r=>r.ok?r.json():null).catch(()=>null);
  const pages=Object.values(commons?.query?.pages||{});
  return pages.find(page=>/\.(jpg|jpeg|png)$/i.test(page.title))?.imageinfo?.[0]?.thumburl||null;
 })());
 const src=await portraitJobs.get(f.id);if(src){f.portrait=src;f.img=src;img.src=src}
}
const portraitObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;const f=fighters.find(x=>x.id===entry.target.dataset.fighter);if(f)loadPortrait(f,entry.target);portraitObserver.unobserve(entry.target)}),{rootMargin:"180px"});
const divisionLimits={"Heavyweight":"200+ lb","Cruiserweight":"200 lb","Light Heavyweight":"175 lb","Super Middleweight":"168 lb","Middleweight":"160 lb","Junior Middleweight":"154 lb","Welterweight":"147 lb","Junior Welterweight":"140 lb","Lightweight":"135 lb","Junior Lightweight":"130 lb","Featherweight":"126 lb","Junior Featherweight":"122 lb","Bantamweight":"118 lb","Junior Bantamweight":"115 lb","Flyweight":"112 lb","Junior Flyweight":"108 lb","Strawweight":"105 lb"};
const divisionWeightsLb={Heavyweight:224,Cruiserweight:200,"Light Heavyweight":175,"Super Middleweight":168,Middleweight:160,"Junior Middleweight":154,Welterweight:147,"Junior Welterweight":140,Lightweight:135,"Junior Lightweight":130,Featherweight:126,"Junior Featherweight":122,Bantamweight:118,"Junior Bantamweight":115,Flyweight:112,"Junior Flyweight":108,Strawweight:105};
fighters.forEach(f=>f.years.forEach(v=>{if(!v.weight)v.weight=divisionWeightsLb[v.division||f.division]||160}));
const bioJobs=new Map();
const boxrecPhysicals={tyson:{height_cm:178,reach_cm:180},usyk:{height_cm:191,reach_cm:198}};
const shortMeasure=s=>{const clean=(s||"").replace(/\[[^\]]+\]/g,"").trim();return clean.match(/\d+\s*ft\s*\d+(?:[+.]\d+)?\s*in/i)?.[0]||clean.match(/\d+(?:\.\d+)?\s*in/i)?.[0]||clean.split("(")[0].trim()||"—"};
function drawBio(side,f,bio={}){
 const actualWeight=f.weight?`${Math.round(f.weight)} lb`:divisionLimits[f.division]||f.division;
 const items=[["HEIGHT",bio.height||"—"],["REACH",bio.reach||"—"],["FIGHT WEIGHT",actualWeight],["STANCE",f.stance],["CAREER RECORD",bio.record||"—"]];
 $(`#physical-${side}`).innerHTML=items.map(([k,v])=>`<div><small>${k}</small><b>${v}</b></div>`).join("");
 $(`#physical-${side}`).classList.toggle("source-boxrec",bio.source==="BoxRec");
}
async function loadBio(f,side){
 drawBio(side,active(side));
 if(!bioJobs.has(f.id))bioJobs.set(f.id,Promise.all([
  Promise.resolve(boxrecPhysicals[f.id]?{...boxrecPhysicals[f.id],source:"BoxRec"}:null),
  fetch(`https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(f.wiki||wikiAliases[f.name]||f.name)}&prop=text&format=json&origin=*`).then(r=>r.ok?r.json():null).catch(()=>null)
 ]).then(([boxrec,wikipedia])=>{
  let height="—",reach="—",source="";
  if(boxrec?.source==="BoxRec"){
   const hcm=Number(boxrec.height_cm),rcm=Number(boxrec.reach_cm);
   if(hcm){const inches=Math.round(hcm/2.54);height=`${Math.floor(inches/12)} ft ${inches%12} in`;source="BoxRec"}
   if(rcm){reach=`${Math.round(rcm/2.54)} in`;source="BoxRec"}
  }
  const wikiHtml=wikipedia?.parse?.text?.["*"],doc=wikiHtml?new DOMParser().parseFromString(wikiHtml,"text/html"):null,rows=doc?[...doc.querySelectorAll("table.infobox tr")]:[];
  const val=label=>rows.find(r=>r.querySelector("th")?.textContent.trim().toLowerCase()===label)?.querySelector("td")?.textContent.trim();
  if(height==="—")height=shortMeasure(val("height"));if(reach==="—")reach=shortMeasure(val("reach"));
  const wins=(val("wins")||"").match(/\d+/)?.[0],losses=(val("losses")||"").match(/\d+/)?.[0],draws=(val("draws")||"").match(/\d+/)?.[0];
  return {height,reach,record:wins&&losses?`${wins}-${losses}${draws&&draws!=="0"?`-${draws}`:""}`:"—",source};
 }).catch(()=>({})));
 const bio=await bioJobs.get(f.id);if(selected[side].id===f.id)drawBio(side,active(side),bio);
}
function active(side){return {...selected[side],...selected[side].years[versions[side]]}}
function versionProfile(f,v){
 const base=f.years[0]||v,parts=[];
 const compare=(key,up,down)=>{const diff=(v[key]||0)-(base[key]||0);if(diff>=4)parts.push(up);else if(diff<=-4)parts.push(down)};
 compare("power","more punching threat","less one-shot pop");
 compare("speed","faster feet/hands","slower veteran tempo");
 compare("defense","more defensive control","more hittable/action-oriented");
 compare("aggression","more willing to force exchanges","more selective and calculated");
 compare("cardio","higher pace engine","more energy management");
 const style=v.aggression>=94?"pressure/action":v.defense>=98?"defensive-control":v.power>=96?"puncher":v.speed>=98?"speed/angles":v.iq>=98?"ring-IQ/control":"balanced";
 return {style,notes:parts.slice(0,3).join(" · ")||"balanced version ratings"};
}
function renderFighter(side){
 const f=selected[side],v=active(side);
 $(`#portrait-${side}`).src=f.img;$(`#portrait-${side}`).alt=f.name;$(`#name-${side}`).textContent=f.name;
 $(`#meta-${side}`).textContent=`${f.country} · ${v.stance||f.stance} · ${v.division||f.division}`;
 $(`#year-${side}`).innerHTML=f.years.map((y,i)=>`<option value="${i}" ${i===versions[side]?"selected":""}>${y.label}</option>`).join("");
 const profile=versionProfile(f,v);
 const signature=v.bestPerformance;
 $(`#version-${side}`).innerHTML=`<div><small>SELECTED ERA</small><b>${v.label}</b></div><div><small>VERSION WEIGHT</small><b>${v.weight?`${Math.round(v.weight)} lb · `:""}${v.division||f.division}</b></div><div><small>STYLE SHIFT</small><b>${profile.style}</b><span>${profile.notes}</span></div><div><small>SIGNATURE PERFORMANCE</small><b>${signature?signature.opponent:"Not tagged yet"}</b><span>${signature?`${signature.result} · ${signature.note}`:"Best-version note can be added to this era"}</span></div>`;
 const keys=[["power","PWR"],["speed","SPD"],["defense","DEF"],["iq","IQ"],["cardio","STA"]];
 $(`#ratings-${side}`).innerHTML=keys.map(([k,l])=>`<div class="mini-rating"><b>${v[k]}</b><small>${l}</small></div>`).join("");
 const gems=f.gems;$(`#gems-${side}`).innerHTML=gems?`<div><small>BOXING GEMS FILM PROFILE · ${gems.videoCount} VIDEOS</small><span>${gems.tags.map(t=>`<b>${t}</b>`).join("")}</span></div><a href="${gems.sources[0]?.url||"https://www.youtube.com/@BoxingGems"}" target="_blank" rel="noreferrer">FILM ↗</a>`:`<small>NO BOXING GEMS FIGHTER STUDY INDEXED</small>`;
 loadPortrait(f,$(`#portrait-${side}`));
 loadBio(f,side);
	 renderResearchDesk();
	}
function fightSettings(){
 return {
  rounds:scheduled,
  weight:$("#weight")?.value,
  ring:$("#ring")?.value,
  venue:$("#venue")?.value,
  championship:$("#championship")?.checked,
  neutral:$("#neutral")?.checked,
  ruleset:$("#ruleset")?.value,
  environment:$("#environment")?.value,
  weighin:$("#weighin")?.value,
  equipment:$("#equipment")?.value
 };
}
function renderResearchDesk(){
 const panel=$("#research-desk");
 if(!panel||!window.BOXING_RESEARCH_DESK)return;
 const a=active("a"),b=active("b");
 const deskSettings=fightSettings();
 researchDesk=window.BOXING_RESEARCH_DESK.create(a,b,deskSettings);
 const sources=researchDesk.sources.map(source=>`<div class="desk-source ${source.status}">
   <small>${source.label}</small>
   <b>${source.status.toUpperCase()}</b>
   <span>${source.detail}</span>
  </div>`).join("");
 const fighterCards=["a","b"].map(side=>{
 const card=researchDesk.fighters[side];
 const film=card.film?`${card.film.videoCount} Boxing Gems videos · ${card.film.tags.slice(0,3).join(", ")}`:"No Boxing Gems profile indexed yet";
 const era=card.eraStudy?`${card.eraStudy.decades.join("/")} Rummy's Corner P4P study · ${card.eraStudy.tags.slice(0,2).join(", ")}`:"No decade P4P playlist profile yet";
 const comp=card.comparableOpposition.names.length?`Comparable looks: ${card.comparableOpposition.names.join(", ")}`:`Comparable looks: partial ${card.comparableOpposition.label} references`;
  const signature=card.bestPerformance?`${card.bestPerformance.opponent} · ${card.bestPerformance.result}: ${card.bestPerformance.note}`:"Signature performance not tagged for this version yet";
  return `<div class="desk-fighter ${side==="a"?"red":"blue"}">
    <small>${side==="a"?"RED":"BLUE"} RESEARCH CARD</small>
    <h3>${card.last}</h3>
    <p>${card.version} · ${card.archetype} · ${card.stance}</p>
    <div class="desk-tags">${card.tags.map(t=>`<span>${t}</span>`).join("")}</div>
    <ul>
      <li>${card.strengths[0]}</li>
      <li>${card.vulnerabilities[0]}</li>
      <li>Signature performance: ${signature}</li>
      <li>${film}</li>
      <li>${era}</li>
      <li>${comp}</li>
    </ul>
  </div>`;
 }).join("");
 const keyTags=[...new Set([...(researchDesk.fighters.a.tags||[]),...(researchDesk.fighters.b.tags||[])])].slice(0,4);
 const quickKeys=researchDesk.quickKeys?.length?researchDesk.quickKeys:researchDesk.scoutingQuestions.slice(0,3);
 panel.innerHTML=`<details class="desk-details">
  <summary class="desk-compact">
   <div class="desk-compact-title">
    <small>RINGSIDE RESEARCH DESK</small>
    <h2>${researchDesk.verifiedFight?"VERIFIED KEYS":"KEYS TO THE FIGHT"}</h2>
   </div>
   <div class="desk-key-list">
    ${quickKeys.map((key,i)=>`<div><b>${String(i+1).padStart(2,"0")}</b><span>${key}</span></div>`).join("")}
   </div>
   <div class="desk-compact-meta">
    ${keyTags.map(tag=>`<b>${tag}</b>`).join("")}
    <span>${researchDesk.confidence}% CONFIDENCE</span>
    <em>FULL REPORT ↓</em>
   </div>
   ${researchDesk.mismatch?.type&&!["competitive","lean"].includes(researchDesk.mismatch.type)?`<div class="desk-mismatch"><strong>MISMATCH WATCH</strong><span>${researchDesk.mismatch.type.toUpperCase()} · ${researchDesk.mismatch.reasons.join(" · ")}</span></div>`:""}
  </summary>
  <div class="desk-body">
   <div class="desk-summary">
    <b>${researchDesk.verifiedFight?"VERIFIED HISTORY MODE":"HYPOTHETICAL SCOUTING MODE"}</b>
    <p>${researchDesk.styleClash.summary}</p>
    ${researchDesk.mismatch?.type&&!["competitive","lean"].includes(researchDesk.mismatch.type)?`<div class="desk-mismatch full"><strong>MISMATCH WATCH</strong><span>${researchDesk.mismatch.reasons.join(" · ")}</span></div>`:""}
    <ol>${researchDesk.scoutingQuestions.map(q=>`<li>${q}</li>`).join("")}</ol>
   </div>
   <div class="desk-fighters">${fighterCards}</div>
   <div class="desk-sources">${sources}</div>
   ${researchDesk.dataGaps.length?`<div class="desk-gaps"><small>DATA GAPS FOR FUTURE OPENAI RESEARCH</small>${researchDesk.dataGaps.map(g=>`<span>${g}</span>`).join("")}</div>`:""}
  </div>
 </details>`;
}
function openPicker(side){pickerSide=side;$("#fighter-search").value="";renderArchive();$("#picker").showModal()}
function renderArchive(q=""){const list=fighters.filter(f=>(archiveDivision==="All"||f.division===archiveDivision)&&(f.name+f.nickname+f.division+f.years.map(y=>y.year).join(" ")).toLowerCase().includes(q.toLowerCase()));$("#fighter-grid").innerHTML=list.map(f=>`<button class="archive-fighter" data-id="${f.id}"><img src="${f.img}" data-fighter="${f.id}" alt="${f.name}"><span><b>${f.name}</b><small>“${f.nickname}” · ${f.division}</small></span></button>`).join("");$("#division-filters").innerHTML=["All",...(window.WEIGHT_CLASSES||[])].map(d=>`<button class="${d===archiveDivision?"active":""}" data-division="${d}">${d}</button>`).join("");document.querySelectorAll("img[data-fighter]").forEach(img=>portraitObserver.observe(img))}
function renderFightPoster(last=null){
 const a=active("a"),b=active("b"),round=last?.number||1;
 $("#poster-img-a").src=a.img;$("#poster-img-a").alt=a.name;$("#poster-img-b").src=b.img;$("#poster-img-b").alt=b.name;
 $("#poster-name-a").textContent=a.last;$("#poster-name-b").textContent=b.last;
 $("#poster-bg-a").textContent=a.last;$("#poster-bg-b").textContent=b.last;
 $("#poster-version-a").textContent=a.label||`${a.year||""}`;$("#poster-version-b").textContent=b.label||`${b.year||""}`;
 $("#poster-weight").textContent=($("#weight").value||a.division||b.division).toUpperCase();
 $("#poster-round").textContent=last?.stoppage?`${last.stoppage.type} · ROUND ${round}`:current?`ROUND ${String(round).padStart(2,"0")} OF ${scheduled}`:"MAIN EVENT";
 $("#poster-venue").textContent=($("#venue").value||"Neutral Arena").toUpperCase();
}
async function setupFight(){
 const button=$("#simulate"),a=active("a"),b=active("b");
 button.disabled=true;button.textContent="OPENING RESEARCH DESK…";
 await window.BOXING_FIGHT_HISTORY?.resolve(a,b);
 const deskSettings=fightSettings();
 researchDesk=window.BOXING_RESEARCH_DESK?.create(a,b,deskSettings);
 fight=BoxingEngine.buildFight(a,b,{...deskSettings,narrationSalt:`${Date.now()}-${Math.random()}`,researchDesk});
 button.disabled=false;button.textContent="SIMULATE THE FIGHT →";
 if(fight.historical)scheduled=fight.rounds.length;
 current=0;$("#setup").classList.add("hidden");$(".settings-panel").classList.add("hidden");$(".hero").classList.add("hidden");$("#broadcast").classList.remove("hidden");$("#results").classList.add("hidden");
 for(const s of ["a","b"]){$(`#live-name-${s}`).textContent=active(s).name;$(`#live-img-${s}`).src=active(s).img;$(`#score-head-${s}`).textContent=active(s).last.toUpperCase();$(`#prob-name-${s}`).textContent=active(s).last.toUpperCase()}
 $("#venue-display").textContent=$("#venue").value.toUpperCase();renderFightPoster();renderLive();window.scrollTo({top:0,behavior:"smooth"});
}
function renderLive(){
 const played=fight.rounds.slice(0,current),last=played.at(-1),totalA=played.reduce((n,r)=>n+r.scoreA,0),totalB=played.reduce((n,r)=>n+r.scoreB,0);
 $("#scorecard").innerHTML=played.map(r=>`<div class="score-row"><span>${String(r.number).padStart(2,"0")}</span><b>${r.scoreA}</b><b>${r.scoreB}</b></div>`).join("");
 $("#total-a").textContent=totalA;$("#total-b").textContent=totalB;
 const base=researchDesk?.engineHints?.preFightProbabilityA??((active("a").iq+active("a").speed)/(active("a").iq+active("a").speed+active("b").iq+active("b").speed)*100);
 const scoreSwing=(totalA-totalB)*(current?3.4:0);
 const damageSwing=last?((last.damageB||0)-(last.damageA||0))*5:0;
 const knockSwing=(last?.knockB?14:0)-(last?.knockA?14:0);
 const prob=Math.max(5,Math.min(95,base+scoreSwing+damageSwing+knockSwing));
 $("#prob-a").textContent=Math.round(prob)+"%";$("#prob-b").textContent=Math.round(100-prob)+"%";$("#prob-fill").style.width=prob+"%";
 const staminaA=last?.staminaA??100,staminaB=last?.staminaB??100,healthA=Math.max(10,100-(last?.damageA??0)*10),healthB=Math.max(10,100-(last?.damageB??0)*10);
 $("#condition-bars").innerHTML=[["a",active("a").last,staminaA,healthA],["b",active("b").last,staminaB,healthB]].map(x=>`<div class="condition-row"><div><span>${x[1].toUpperCase()}</span><span>${Math.round(x[2])}% STAMINA</span></div><div class="meter"><span style="width:${Math.min(x[2],x[3])}%;background:${x[0]==="a"?"var(--red)":"var(--blue)"}"></span></div></div>`).join("");
 renderFightPoster(last);
 const prevButton=$("#prev-round");
 if(prevButton){prevButton.disabled=current===0;prevButton.querySelector("span").textContent=current>1?`BACK TO ROUND ${current-1}`:"PREVIOUS ROUND"}
 if(!last){$("#round-label").textContent=`ROUND 1 OF ${scheduled}`;$("#round-watermark").textContent="01";$("#round-kicker").textContent="TALE OF THE TAPE";$("#round-headline").textContent="THE FIGHT AWAITS";$("#commentary-lines").innerHTML=`<div class="comment-line"><b>READY</b><span>The officials are in position. Both fighters are awaiting the opening bell.</span></div>`;$("#next-round span").textContent="BEGIN ROUND 1";return}
 const report=last.report||last.lines,labels=report.length>=5?["OPENING 0:00–1:00","MIDDLE 1:00–2:00","CLOSING 2:00–3:00","POSITIONAL MAP","CORNER READ"]:["POSITION","MECHANICS","ADJUSTMENT"];
 $("#round-label").textContent=`ROUND ${last.number} OF ${scheduled}`;$("#round-watermark").textContent=String(last.number).padStart(2,"0");$("#round-kicker").textContent=`ROUND ${last.number} · ${last.knockA||last.knockB?"KNOCKDOWN":"FILM ROOM ANALYSIS"}`;$("#round-headline").textContent=last.headline;$("#commentary-lines").innerHTML=report.map((l,i)=>`<div class="comment-line report-line"><b>${labels[i]||String(i+1).padStart(2,"0")}</b><span>${l}</span></div>`).join("");
 const finished=current>=fight.rounds.length||last.stoppage;$("#next-round span").textContent=finished?"VIEW OFFICIAL RESULT":`ADVANCE TO ROUND ${current+1}`;
}
function renderPostfightRounds(){
 const official=fight.event?.scorecards?.some(card=>card.rounds);
 $("#postfight-rounds").innerHTML=fight.rounds.map(r=>{
  const events=[];
  if(r.knockA)events.push(`${fight.a.last.toUpperCase()} KNOCKED DOWN`);
  if(r.knockB)events.push(`${fight.b.last.toUpperCase()} KNOCKED DOWN`);
  if(r.deduction)events.push(`POINT DEDUCTED: ${(r.deduction.fighter===fight.a.id?fight.a.last:fight.b.last).toUpperCase()}`);
  if(r.stoppage)events.push(`${r.stoppage.type} STOPPAGE`);
  const punchMeta=fight.historical&&!fight.officialStats?"":`<b>${fight.a.last.toUpperCase()} ${r.landedA}/${r.thrownA} LANDED</b>
     <b>${fight.b.last.toUpperCase()} ${r.landedB}/${r.thrownB} LANDED</b>
     <b>${r.powerA}–${r.powerB} POWER</b>`;
  const officialLines=official?fight.event.scorecards.map(card=>{
   const raw=card.rounds[r.number-1],scores=fight.event.red===fight.a.id?raw:[raw[1],raw[0]];
   return `${card.name}: ${scores[0]}–${scores[1]}`;
  }).join(" · "):null;
  return `<details class="round-review">
   <summary><small>ROUND ${String(r.number).padStart(2,"0")}</small><strong>${r.headline}</strong><span><b>${r.scoreA}</b> — <b>${r.scoreB}</b></span></summary>
   <div class="round-review-body">
    <div class="round-review-meta">
     ${punchMeta}
     ${events.map(e=>`<b class="event">${e}</b>`).join("")}
    </div>
    ${officialLines?`<p><strong>OFFICIAL JUDGES:</strong> ${officialLines}</p>`:""}
    ${(r.report||r.lines).map(line=>`<p>${line}</p>`).join("")}
   </div>
  </details>`;
 }).join("");
}
async function saveResultToSupabase(){
 if(!window.RINGSIDE_SUPABASE?.isConfigured?.())return;
 try{
  const red=active("a"),blue=active("b");
  const saved=await window.RINGSIDE_SUPABASE.saveFight({fight,red,blue,settings:fightSettings(),researchDesk});
  const slug=saved?.data?.[0]?.share_slug;
  if(slug)console.info(`RINGSIDE saved fight: ${slug}`);
 }catch(error){
  console.warn("RINGSIDE Supabase save skipped:",error.message||error);
 }
}
function showResults(){
 $("#broadcast").classList.add("hidden");$("#results").classList.remove("hidden");const w=fight.winner==="draw"?null:active(fight.winner);
 $("#winner-name").textContent=w?.name||"DRAW";$("#decision").textContent=fight.historical?`${fight.decision} · ${fight.officialScorecards?"OFFICIAL REPLAY":"VERIFIED OUTCOME"}`:fight.decision;
 $("#official-cards").innerHTML=fight.historical&&!fight.officialScorecards
  ?`<div class="judge-card"><small>OFFICIAL CARDS</small><b>NOT AVAILABLE</b></div>`
  :fight.judges.map(j=>`<div class="judge-card"><small>${j.name}</small><b>${j.a} — ${j.b}</b></div>`).join("");
 const t=fight.totals,stats=fight.historical&&!fight.officialStats?[["OFFICIAL PUNCH STATS","—","—"],["KNOCKDOWNS",t.kdA,t.kdB],["POINT DEDUCTIONS",fight.event.events?.filter(e=>e.type==="deduction"&&e.fighter===fight.a.id).length||0,fight.event.events?.filter(e=>e.type==="deduction"&&e.fighter===fight.b.id).length||0]]:[["TOTAL PUNCHES LANDED",t.landedA,t.landedB],["JABS & POWER LANDED",t.landedA-t.powerA+" / "+t.powerA,t.landedB-t.powerB+" / "+t.powerB],["ACCURACY",Math.round(t.landedA/t.thrownA*100)+"%",Math.round(t.landedB/t.thrownB*100)+"%"],["KNOCKDOWNS",t.kdA,t.kdB]];
 $("#stats-table").innerHTML=stats.map(r=>`<div class="stat-row"><span>${r[1]}</span><span>${r[0]}</span><span>${r[2]}</span></div>`).join("");
 const consensus=fight.event?.fanConsensus;
 $("#fan-consensus").classList.toggle("hidden",!consensus);
 $("#fan-consensus").innerHTML=consensus?`<div class="fan-consensus-head"><small>r/BOXING · FAN CONSENSUS</small><b>${consensus.label}</b></div><h3>${consensus.tone}</h3><p>${consensus.summary}</p><div class="fan-themes">${consensus.themes.map(t=>`<span>${t}</span>`).join("")}</div><div class="fan-sources">${consensus.sources.map(s=>`<a href="${s.url}" target="_blank" rel="noreferrer">${s.label} ↗</a>`).join("")}</div>`:"";
 const moments=fight.rounds.filter(r=>r.knockA||r.knockB||Math.abs(r.landedA-r.landedB)>8).slice(0,5);$("#highlights").innerHTML=(moments.length?moments:[fight.rounds[0],fight.rounds.at(-1)]).map(r=>`<div class="highlight"><b>ROUND ${r.number}</b>${r.headline}. ${r.lines[0]}</div>`).join("");window.scrollTo({top:0,behavior:"smooth"})
 renderPostfightRounds();$("#postfight-rounds").classList.add("hidden");$("#view-play-by-play").innerHTML="VIEW ROUND-BY-ROUND PLAY BY PLAY <b>↓</b>";
 saveResultToSupabase();
}
document.querySelectorAll("[data-picker]").forEach(b=>b.onclick=()=>openPicker(b.dataset.picker));
document.querySelectorAll("[data-rounds]").forEach(b=>b.onclick=()=>{scheduled=+b.dataset.rounds;document.querySelectorAll("[data-rounds]").forEach(x=>x.classList.toggle("active",x===b));renderResearchDesk()});
for(const s of ["a","b"])$(`#year-${s}`).onchange=e=>{versions[s]=+e.target.value;renderFighter(s);renderResearchDesk()};
$("#fighter-grid").onclick=e=>{const btn=e.target.closest("[data-id]");if(!btn)return;selected[pickerSide]=fighters.find(f=>f.id===btn.dataset.id);versions[pickerSide]=0;renderFighter(pickerSide);renderResearchDesk();$("#picker").close()};
$("#division-filters").onclick=e=>{const btn=e.target.closest("[data-division]");if(!btn)return;archiveDivision=btn.dataset.division;renderArchive($("#fighter-search").value)};
$("#fighter-search").oninput=e=>renderArchive(e.target.value);$("#close-picker").onclick=()=>$("#picker").close();$("#simulate").onclick=setupFight;
$("#next-round").onclick=()=>{if(current>=fight.rounds.length||fight.rounds[current-1]?.stoppage)showResults();else{current++;renderLive()}};
$("#prev-round").onclick=()=>{if(!fight||current<=0)return;current--;renderLive()};
$("#new-fight").onclick=()=>location.reload();$("#run-again").onclick=setupFight;
$("#view-play-by-play").onclick=()=>{
 const archive=$("#postfight-rounds"),opening=archive.classList.contains("hidden");
 archive.classList.toggle("hidden",!opening);
 $("#view-play-by-play").innerHTML=opening?"HIDE ROUND-BY-ROUND PLAY BY PLAY <b>↑</b>":"VIEW ROUND-BY-ROUND PLAY BY PLAY <b>↓</b>";
 if(opening)archive.scrollIntoView({behavior:"smooth",block:"start"});
};
$("#weight").innerHTML=(window.WEIGHT_CLASSES||[]).map(d=>`<option>${d}</option>`).join("");
$("#weight").onchange=renderResearchDesk;
["ring","venue","championship","neutral","ruleset","environment","weighin","equipment"].forEach(id=>{const el=$(`#${id}`);if(el)el.onchange=renderResearchDesk});
renderFighter("a");renderFighter("b");renderArchive();
