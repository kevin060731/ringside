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
function decorateRoster(){
 fighters.forEach(f=>{f.gems=window.BOXING_GEMS_DATA?.profiles?.[f.name]||f.gems||null});
 fighters.forEach(f=>{f.eraStudy=window.RUMMY_CORNER_DATA?.profiles?.[f.name]||f.eraStudy||null});
 fighters.forEach(f=>{f.compubox=window.COMPUBOX_DATA?.profileFor(f)||f.compubox||null});
 fighters.forEach(f=>f.years.forEach(v=>{if(!v.weight)v.weight=divisionWeightsLb[v.division||f.division]||160}));
}
let selected={a:fighters[0],b:fighters[1]},versions={a:0,b:0},pickerSide="a",scheduled=12,fight=null,current=0,archiveDivision="All",researchDesk=null,lastSavedFight=null,replayingSavedFight=false,savedFightRows=[],rosterAdmin=false,verifiedFightRows=[],verifiedFightSyncPromise=null;
const $=s=>document.querySelector(s);
function setImage(img,src,alt=""){
 if(!img)return;
 img.classList.remove("image-missing");
 img.alt=alt;
 img.onerror=()=>img.classList.add("image-missing");
 img.src=src||"";
}
const fightLabSections=[".hero","#public-status","#setup","#research-desk",".settings-panel",".data-panel"];
const wikiAliases={"Saúl Álvarez":"Canelo Álvarez","Gennadiy Golovkin":"Gennady Golovkin","Jesse Rodriguez":"Jesse Rodríguez (boxer)","Oleksandr Usyk":"Oleksandr Usyk","Floyd Mayweather":"Floyd Mayweather Jr.","Julio César Chávez":"Julio César Chávez","Teófimo López":"Teófimo López"};
const portraitJobs=new Map();
async function loadPortrait(f,img){
 if(f.syncedImage&&f.img){img.src=f.img;return}
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
const divisionWeightsLb={Heavyweight:224,Cruiserweight:200,"Light Heavyweight":175,"Super Middleweight":168,"Middleweight":160,"Junior Middleweight":154,Welterweight:147,"Junior Welterweight":140,Lightweight:135,"Junior Lightweight":130,Featherweight:126,"Junior Featherweight":122,Bantamweight:118,"Junior Bantamweight":115,Flyweight:112,"Junior Flyweight":108,Strawweight:105};
decorateRoster();
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
async function syncRosterFromSupabase(){
 if(!window.RINGSIDE_SUPABASE?.loadRoster||!window.RINGSIDE_ROSTER_SYNC?.mergeRoster)return;
 const previous={a:{id:selected.a.id,label:active("a").label},b:{id:selected.b.id,label:active("b").label}};
 try{
  const result=await window.RINGSIDE_SUPABASE.loadRoster();
  const rows=result?.data?.fighters||[];
  if(!rows.length)return;
  const summary=window.RINGSIDE_ROSTER_SYNC.mergeRoster(fighters,result.data);
  decorateRoster();
  for(const side of ["a","b"]){
   selected[side]=fighters.find(f=>f.id===previous[side].id)||selected[side];
   const sameVersion=selected[side].years.findIndex(v=>(v.label||"")===previous[side].label);
   versions[side]=sameVersion>=0?sameVersion:Math.min(versions[side],selected[side].years.length-1);
  }
  renderFighter("a");renderFighter("b");renderArchive($("#fighter-search")?.value||"");
  if(!$("#roster-manager")?.classList.contains("hidden"))renderRosterManager();
  const chip=document.querySelector(".season-chip b");
  if(chip)chip.textContent=`Supabase synced · ${new Intl.DateTimeFormat(undefined,{month:"short",day:"numeric",year:"numeric"}).format(new Date())}`;
  console.info(`RINGSIDE roster sync: ${summary.updated} updated, ${summary.added} added`);
 }catch(error){
  console.warn("RINGSIDE roster sync skipped:",error.message||error);
 }
}
async function syncVerifiedFightsFromSupabase(force=false){
 if(!window.RINGSIDE_SUPABASE?.loadVerifiedFights||!window.BOXING_FIGHT_HISTORY?.mergeVerifiedFights)return;
 if(verifiedFightSyncPromise&&!force)return verifiedFightSyncPromise;
 verifiedFightSyncPromise=(async()=>{
  try{
   const result=await window.RINGSIDE_SUPABASE.loadVerifiedFights();
   verifiedFightRows=result?.data||[];
   if(verifiedFightRows.length){
    const summary=window.BOXING_FIGHT_HISTORY.mergeVerifiedFights(verifiedFightRows);
    console.info(`RINGSIDE verified fight sync: ${summary.updated} updated, ${summary.added} added`);
    renderPublicStatus();
   }
   return verifiedFightRows;
  }catch(error){
   console.warn("RINGSIDE verified fight sync skipped:",error.message||error);
   return verifiedFightRows;
  }finally{
   if(force)verifiedFightSyncPromise=null;
  }
 })();
 return verifiedFightSyncPromise;
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
	 renderPublicStatus();
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
 const keyTags=[...new Set([...(researchDesk.fighters.a.tags||[]),...(researchDesk.fighters.b.tags||[])])].slice(0,3);
 const compactSummary=researchDesk.verifiedFight
  ? researchDesk.styleClash.summary
  : `${researchDesk.fighters.a.last} vs ${researchDesk.fighters.b.last}: ${researchDesk.styleClash.summary}`;
 panel.innerHTML=`<details class="desk-details">
  <summary class="desk-compact">
   <div class="desk-compact-title">
    <small>RINGSIDE RESEARCH DESK</small>
    <h2>${researchDesk.verifiedFight?"VERIFIED REPLAY":"SCOUTING SNAPSHOT"}</h2>
   </div>
   <p>${compactSummary}</p>
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
 renderPublicStatus();
}
function openPicker(side){pickerSide=side;$("#fighter-search").value="";renderArchive();$("#picker").showModal()}
function renderArchive(q=""){
 const query=q.trim().toLowerCase();
 const searchable=f=>(f.name+(f.nickname||"")+(f.division||"")+(f.country||"")+f.years.map(y=>`${y.year} ${y.label} ${y.division||""} ${y.bestPerformance?.opponent||""}`).join(" ")).toLowerCase();
 const list=fighters
  .filter(f=>(archiveDivision==="All"||f.division===archiveDivision)&&searchable(f).includes(query))
  .sort((a,b)=>(Number(!!b.active)-Number(!!a.active))||a.last.localeCompare(b.last));
 $("#fighter-grid").innerHTML=list.length?list.map(f=>{
  const latest=f.years[0]||{};
  const verifiedCount=window.BOXING_FIGHT_HISTORY?.fights?.filter(record=>record.red===f.id||record.blue===f.id).length||0;
  return `<button class="archive-fighter" data-id="${f.id}">
    <img src="${f.img}" data-fighter="${f.id}" alt="${f.name}" onerror="this.classList.add('image-missing')">
    <span>
      <b>${f.name}</b>
      <small>${f.nickname?`“${f.nickname}” · `:""}${f.division}</small>
      <em>${f.years.length} version${f.years.length===1?"":"s"} · ${latest.label||"Current"}${verifiedCount?` · ${verifiedCount} verified fight${verifiedCount===1?"":"s"}`:""}</em>
    </span>
    ${f.active?`<i>ACTIVE</i>`:""}
   </button>`;
 }).join(""):`<div class="archive-empty"><b>No fighters found</b><span>Try a different name, nickname, year, or division.</span></div>`;
 $("#division-filters").innerHTML=["All",...(window.WEIGHT_CLASSES||[])].map(d=>`<button class="${d===archiveDivision?"active":""}" data-division="${d}">${d}</button>`).join("");
 document.querySelectorAll("img[data-fighter]").forEach(img=>portraitObserver.observe(img));
}
function renderPublicStatus(){
 const rosterCount=$("#roster-count"),historyCount=$("#history-count"),modeTitle=$("#match-mode-title"),modeCopy=$("#match-mode-copy"),modeLabel=$("#match-mode-label"),status=$("#public-status");
 if(rosterCount)rosterCount.textContent=`${fighters.length}`;
 if(historyCount)historyCount.textContent=`${window.BOXING_FIGHT_HISTORY?.fights?.length||0}`;
 if(!modeTitle||!modeCopy||!modeLabel)return;
 const a=active("a"),b=active("b");
 const known=window.BOXING_FIGHT_HISTORY?.find?.(a,b);
 status?.classList.toggle("verified-match",!!known);
 status?.classList.toggle("hypothetical-match",!known);
 if(known){
  const winner=known.winner?fighters.find(f=>f.id===known.winner)?.last||known.winner:"Draw";
  modeLabel.textContent="VERIFIED MATCHUP";
  modeTitle.textContent="Verified replay loaded";
  modeCopy.textContent=`${a.last} vs ${b.last} · ${winner} · ${known.method}${known.date?` · ${known.date}`:""}`;
 }else{
  const mismatch=researchDesk?.mismatch;
  const mismatchText=mismatch?.type&&!["competitive","lean"].includes(mismatch.type)?` Mismatch watch: ${mismatch.type.replace("-"," ")}.`:"";
  modeLabel.textContent="HYPOTHETICAL MATCHUP";
  modeTitle.textContent="Fantasy simulation";
  modeCopy.textContent=`${a.last} vs ${b.last} · versions, styles and settings active.${mismatchText}`;
 }
}
function setView(view="home"){
 const showHome=view==="home"||view==="archive";
 fightLabSections.forEach(selector=>document.querySelector(selector)?.classList.toggle("hidden",!showHome));
 $("#my-fights")?.classList.toggle("hidden",view!=="my-fights");
 $("#roster-manager")?.classList.toggle("hidden",view!=="roster-manager");
 $("#verified-manager")?.classList.toggle("hidden",view!=="verified-manager");
 $("#broadcast")?.classList.add("hidden");
 $("#results")?.classList.add("hidden");
 document.querySelectorAll("[data-view]").forEach(button=>button.classList.toggle("active",button.dataset.view===view||(view==="archive"&&button.dataset.view==="home"&&button.closest(".bottom-nav"))));
 if(view==="my-fights")loadMyFights();
 if(view==="roster-manager")renderRosterManager();
 if(view==="verified-manager")renderVerifiedManager();
 if(view==="archive")document.querySelector(".data-panel")?.scrollIntoView({behavior:"smooth",block:"start"});
}
function authUser(){return window.RINGSIDE_SUPABASE?.currentUser?.()||null}
function userLabel(user){
 const email=user?.email||"";
 return email?email.split("@")[0].slice(0,10).toUpperCase():"PROFILE";
}
function renderAuthState(){
 const user=authUser(),button=$("#auth-button"),copy=$("#my-fights-copy"),card=document.querySelector(".auth-card"),message=$("#auth-message");
 if(button)button.textContent=user?userLabel(user):"SIGN IN";
 if(copy)copy.textContent=user?`Signed in as ${user.email}. These saved fights belong to your profile.`:"Sign in to see your own private fight vault. Share links still work for replaying specific fights.";
 card?.classList.toggle("signed-in",!!user);
 if(message)message.textContent=user?`Signed in as ${user.email}. Your fight vault is now private to this profile.`:"Sign in so My Fights only shows your saved simulations.";
}
function openAuthDialog(message=""){
 const dialog=$("#auth-dialog");
 renderAuthState();
 if(message)$("#auth-message").textContent=message;
 dialog?.showModal();
}
const ratingFields=["power","speed","chin","defense","iq","footwork","cardio","accuracy","aggression"];
function rosterStatus(message,type=""){
 const el=$("#roster-save-status");
 if(!el)return;
 el.textContent=message;
 el.classList.toggle("ok",type==="ok");
 el.classList.toggle("error",type==="error");
}
function fillDivisionOptions(){
 const options=(window.WEIGHT_CLASSES||[]).map(d=>`<option>${d}</option>`).join("");
 ["#edit-primary-division","#edit-version-division"].forEach(selector=>{const el=$(selector);if(el&&!el.innerHTML)el.innerHTML=options});
}
function rosterFighter(){return fighters.find(f=>f.id===$("#roster-fighter")?.value)||fighters[0]}
function rosterVersionIndex(){return Math.max(0,Number($("#roster-version")?.value)||0)}
function renderRosterPickers(){
 const fighterSelect=$("#roster-fighter"),versionSelect=$("#roster-version");
 if(!fighterSelect||!versionSelect)return;
 const previous=fighterSelect.value;
 fighterSelect.innerHTML=[...fighters].sort((a,b)=>a.name.localeCompare(b.name)).map(f=>`<option value="${f.id}">${f.name} · ${f.division}</option>`).join("");
 if(previous&&fighters.some(f=>f.id===previous))fighterSelect.value=previous;
 const f=rosterFighter();
 versionSelect.innerHTML=(f.years||[]).map((v,i)=>`<option value="${i}">${v.label}</option>`).join("");
}
function fillRosterForm(){
 fillDivisionOptions();
 const f=rosterFighter(),v=f.years[rosterVersionIndex()]||f.years[0]||{};
 $("#edit-id").value=f.id||"";
 $("#edit-name").value=f.name||"";
 $("#edit-last").value=f.last||"";
 $("#edit-nickname").value=f.nickname||"";
 $("#edit-country").value=f.country||"";
 $("#edit-stance").value=f.stance||"Orthodox";
 $("#edit-primary-division").value=f.division||"Welterweight";
 $("#edit-image").value=(f.syncedImage||/^https?:\/\//.test(f.img||""))?f.img||"":"";
 $("#edit-version-label").value=v.label||"";
 $("#edit-year").value=v.year||new Date().getFullYear();
 $("#edit-version-division").value=v.division||f.division||"Welterweight";
 $("#edit-weight").value=v.weight||divisionWeightsLb[v.division||f.division]||"";
 $("#edit-best-opponent").value=v.bestPerformance?.opponent||"";
 $("#edit-best-result").value=v.bestPerformance?.result||"";
 $("#edit-best-note").value=v.bestPerformance?.note||"";
 $("#edit-source-notes").value=JSON.stringify(v.sourceNotes||{source:"manual roster manager",simulation:{}},null,2);
 $("#ratings-editor").innerHTML=ratingFields.map(key=>`<label>${key.toUpperCase()}<input id="edit-rating-${key}" type="number" min="1" max="100" value="${Number(v[key])||80}"></label>`).join("");
 $("#roster-preview-img").src=f.img||"";
 $("#roster-preview-name").textContent=f.name||"Choose fighter";
 $("#roster-preview-meta").textContent=`${f.id} · ${(v.label||"No version")} · ${v.weight?`${Math.round(v.weight)} lb`:""}`;
}
async function renderRosterManager(){
 renderRosterPickers();
 fillRosterForm();
 const user=authUser(),status=$("#roster-admin-status"),meta=$("#roster-admin-user");
 if(!user){if(status)status.textContent="SIGN IN REQUIRED";if(meta)meta.textContent="Sign in first. Then add your user ID to roster_admins.";rosterStatus("Sign in before editing the roster.","error");return}
 if(meta)meta.textContent=`${user.email} · User ID: ${user.id}`;
 try{
  const result=await window.RINGSIDE_SUPABASE?.isRosterAdmin?.();
  rosterAdmin=!!result?.data;
  if(status)status.textContent=rosterAdmin?"ADMIN ENABLED":"NOT ADMIN YET";
  rosterStatus(rosterAdmin?"Ready to edit roster data.":"Add this user ID to public.roster_admins in Supabase, then reload.","");
 }catch(error){
  rosterAdmin=false;
  const message=error.message||"Could not check roster admin status.";
  if(status)status.textContent=/jwt|token|expired/i.test(message)?"SESSION EXPIRED":"ADMIN CHECK FAILED";
  rosterStatus(`${message} ${/jwt|token|expired/i.test(message)?"Sign out and sign back in if this keeps happening.":""}`.trim(),"error");
 }
}
function rosterPayload(){
 const id=$("#edit-id").value.trim();
 const ratings=Object.fromEntries(ratingFields.map(key=>[key,Number($(`#edit-rating-${key}`).value)||80]));
 let sourceNotes={source:"manual roster manager",simulation:{}};
 try{sourceNotes=JSON.parse($("#edit-source-notes").value||"{}")}catch{throw new Error("Simulation Notes JSON is not valid.")}
 return {
  fighter:{
   id,
   name:$("#edit-name").value.trim(),
   last_name:$("#edit-last").value.trim(),
   country:$("#edit-country").value.trim(),
   stance:$("#edit-stance").value,
   primary_division:$("#edit-primary-division").value,
   image_url:$("#edit-image").value.trim()||null,
   active:true,
   model_data:{nickname:$("#edit-nickname").value.trim(),wiki:$("#edit-name").value.trim(),updated:new Date().toISOString().slice(0,10)}
  },
  version:{
   fighter_id:id,
   label:$("#edit-version-label").value.trim(),
   year:Number($("#edit-year").value)||null,
   division:$("#edit-version-division").value,
   weight_lbs:Number($("#edit-weight").value)||null,
   ratings,
   best_performance:{opponent:$("#edit-best-opponent").value.trim(),result:$("#edit-best-result").value.trim(),note:$("#edit-best-note").value.trim()},
   source_notes:sourceNotes,
   is_default:true
  }
 };
}
async function saveRosterEdit(){
 if(!window.RINGSIDE_SUPABASE?.isConfigured?.()){rosterStatus("Supabase is not connected yet.","error");return}
 if(!authUser()){openAuthDialog("Sign in before editing the roster.");return}
 try{
  rosterStatus("Saving roster update…");
  const payload=rosterPayload();
  await window.RINGSIDE_SUPABASE.upsertFighter(payload.fighter);
  await window.RINGSIDE_SUPABASE.replaceFighterVersion(payload.version);
  await syncRosterFromSupabase();
  renderRosterPickers();$("#roster-fighter").value=payload.fighter.id;fillRosterForm();
  rosterStatus("Saved. Refresh the public app to see this roster update everywhere.","ok");
 }catch(error){
  rosterStatus(error.message||"Could not save roster update.","error");
 }
}
async function deleteRosterVersion(){
 if(!window.RINGSIDE_SUPABASE?.isConfigured?.()){rosterStatus("Supabase is not connected yet.","error");return}
 if(!authUser()){openAuthDialog("Sign in before editing the roster.");return}
 const f=rosterFighter(),v=f.years[rosterVersionIndex()]||{};
 if(!v.label){rosterStatus("Pick a version before deleting.","error");return}
 const ok=confirm(`Delete ${f.name} — ${v.label} from Supabase? This only removes the synced version row.`);
 if(!ok)return;
 try{
  rosterStatus(`Deleting ${v.label}…`);
  await window.RINGSIDE_SUPABASE.deleteFighterVersion({fighter_id:f.id,label:v.label});
  f.years=(f.years||[]).filter(version=>!(version.synced&&(version.label||"")===v.label));
  versions.a=Math.min(versions.a,selected.a.years.length-1);
  versions.b=Math.min(versions.b,selected.b.years.length-1);
  await syncRosterFromSupabase();
  renderRosterPickers();$("#roster-fighter").value=f.id;fillRosterForm();
  rosterStatus("Deleted that Supabase version. If it was a built-in era, the local fallback may still appear.","ok");
 }catch(error){
  rosterStatus(error.message||"Could not delete that version.","error");
 }
}
async function seedRosterToSupabase(){
 if(!authUser()){openAuthDialog("Sign in before seeding the roster.");return}
 try{
  rosterStatus("Seeding current app roster to Supabase… this can take a moment.");
  const result=await window.RINGSIDE_SUPABASE.seedRoster(fighters);
  rosterStatus(`Seeded ${result.data.fighterCount} fighters and ${result.data.versionCount} versions to Supabase.`,"ok");
  await syncRosterFromSupabase();
  renderRosterPickers();fillRosterForm();
 }catch(error){
  rosterStatus(error.message||"Could not seed roster. Make sure your user ID is in public.roster_admins.","error");
 }
}
function verifiedStatus(message,type=""){
 const el=$("#history-save-status");
 if(!el)return;
 el.textContent=message;
 el.classList.toggle("ok",type==="ok");
 el.classList.toggle("error",type==="error");
}
function jsonText(value,fallback){
 return JSON.stringify(value??fallback,null,2);
}
function parseJsonField(selector,fallback){
 const raw=$(selector)?.value?.trim();
 if(!raw)return fallback;
 try{return JSON.parse(raw)}catch{throw new Error(`${selector.replace("#","")} has invalid JSON.`)}
}
function verifiedFightList(){
 return [...(window.BOXING_FIGHT_HISTORY?.fights||[])].sort((a,b)=>(b.date||"").localeCompare(a.date||""));
}
function fighterOptions(selectedId=""){
 return [...fighters].sort((a,b)=>a.name.localeCompare(b.name)).map(f=>`<option value="${f.id}" ${f.id===selectedId?"selected":""}>${f.name} · ${f.division}</option>`).join("");
}
function renderVerifiedPickers(selectedId=""){
 const select=$("#history-fight");
 if(!select)return;
 const rows=verifiedFightList();
 select.innerHTML=`<option value="__new">+ New verified fight from current matchup</option>`+rows.map(record=>{
  const red=fighters.find(f=>f.id===record.red),blue=fighters.find(f=>f.id===record.blue);
  return `<option value="${record.id}" ${record.id===selectedId?"selected":""}>${record.date||"No date"} · ${red?.last||record.red} vs ${blue?.last||record.blue} · ${record.method}</option>`;
 }).join("");
}
function fillVerifiedForm(record=null){
 const a=active("a"),b=active("b"),today=new Date().toISOString().slice(0,10);
 const isNew=!record;
 const redId=record?.red||a.id,blueId=record?.blue||b.id,winnerId=record?.winner||redId;
 $("#history-red").innerHTML=fighterOptions(redId);
 $("#history-blue").innerHTML=fighterOptions(blueId);
 $("#history-winner").innerHTML=`<option value="">DRAW / NO WINNER</option>${fighterOptions(winnerId)}`;
 $("#history-id").value=record?.id||`${redId}-${blueId}-${today.slice(0,4)}`;
 $("#history-date").value=record?.date||today;
 $("#history-division").value=record?.division||$("#weight")?.value||a.division||b.division||"Welterweight";
 $("#history-venue").value=record?.venue||$("#venue")?.value||"";
 $("#history-method").value=record?.method||"UNANIMOUS DECISION";
 $("#history-scheduled").value=record?.rounds||scheduled||12;
 $("#history-ended").value=record?.endedRound||record?.rounds||scheduled||12;
 $("#history-quality").value=record?(window.BOXING_FIGHT_HISTORY?.dataQuality?.(record)||"verified_outcome"):"verified_outcome";
 $("#history-confidence").value=Math.round((record?.confidence??0.75)*100);
 $("#history-scorecards").value=jsonText(record?.scorecards,null);
 $("#history-events").value=jsonText(record?.events,[]);
 $("#history-stats").value=jsonText(record?.stats,null);
 $("#history-fan-consensus").value=jsonText(record?.fanConsensus,null);
 $("#history-sources").value=jsonText(record?.sources,[]);
 $("#history-source-notes").value=jsonText(record?.sourceNotes||{source:"manual verified history manager"}, {});
 $("#history-preview-name").textContent=isNew?"New verified fight":`${fighters.find(f=>f.id===redId)?.last||redId} vs ${fighters.find(f=>f.id===blueId)?.last||blueId}`;
 $("#history-preview-meta").textContent=isNew?"Fill in the official result details, then save.":`${record.date||"No date"} · ${window.BOXING_FIGHT_HISTORY?.qualityLabel?.(record)||"VERIFIED OUTCOME"}`;
}
async function renderVerifiedManager(){
 renderVerifiedPickers($("#history-fight")?.value);
 const selectedId=$("#history-fight")?.value;
 fillVerifiedForm(selectedId&&selectedId!=="__new"?verifiedFightList().find(f=>f.id===selectedId):null);
 const user=authUser(),status=$("#history-admin-status"),meta=$("#history-admin-user");
 if(!user){if(status)status.textContent="SIGN IN REQUIRED";if(meta)meta.textContent="Sign in first. History editing uses the same admin access as roster editing.";verifiedStatus("Sign in before editing verified fight history.","error");return}
 if(meta)meta.textContent=`${user.email} · User ID: ${user.id}`;
 try{
  const result=await window.RINGSIDE_SUPABASE?.isRosterAdmin?.();
  rosterAdmin=!!result?.data;
  if(status)status.textContent=rosterAdmin?"ADMIN ENABLED":"NOT ADMIN YET";
  verifiedStatus(rosterAdmin?"Ready to edit verified fight history.":"Add this user ID to public.roster_admins in Supabase, then reload.","");
 }catch(error){
  rosterAdmin=false;
  if(status)status.textContent="ADMIN CHECK FAILED";
  verifiedStatus(error.message||"Could not check admin status.","error");
 }
}
function verifiedPayload(){
 const id=$("#history-id").value.trim();
 if(!id)throw new Error("Fight ID is required.");
 return {
  id,
  fight_date:$("#history-date").value||null,
  red_fighter_id:$("#history-red").value,
  blue_fighter_id:$("#history-blue").value,
  winner_fighter_id:$("#history-winner").value||null,
  division:$("#history-division").value.trim()||null,
  venue:$("#history-venue").value.trim()||null,
  method:$("#history-method").value.trim().toUpperCase()||"VERIFIED OUTCOME",
  scheduled_rounds:Number($("#history-scheduled").value)||null,
  ended_round:Number($("#history-ended").value)||null,
  scorecards:parseJsonField("#history-scorecards",null),
  events:parseJsonField("#history-events",[]),
  stats:parseJsonField("#history-stats",null),
  fan_consensus:parseJsonField("#history-fan-consensus",null),
  data_quality:$("#history-quality").value,
  confidence:(Number($("#history-confidence").value)||75)/100,
  source_notes:parseJsonField("#history-source-notes",{}),
  sources:parseJsonField("#history-sources",[])
 };
}
async function saveVerifiedFight(){
 if(!window.RINGSIDE_SUPABASE?.isConfigured?.()){verifiedStatus("Supabase is not connected yet.","error");return}
 if(!authUser()){openAuthDialog("Sign in before editing verified fight history.");return}
 try{
  verifiedStatus("Saving verified fight…");
  const payload=verifiedPayload();
  await window.RINGSIDE_SUPABASE.upsertVerifiedFight(payload);
  await syncVerifiedFightsFromSupabase(true);
  renderVerifiedPickers(payload.id);$("#history-fight").value=payload.id;fillVerifiedForm(verifiedFightList().find(f=>f.id===payload.id));
  verifiedStatus("Saved. This fight will now override the simulator when those two fighters are selected.","ok");
 }catch(error){
  verifiedStatus(error.message||"Could not save verified fight.","error");
 }
}
async function deleteVerifiedFight(){
 if(!window.RINGSIDE_SUPABASE?.isConfigured?.()){verifiedStatus("Supabase is not connected yet.","error");return}
 if(!authUser()){openAuthDialog("Sign in before editing verified fight history.");return}
 const id=$("#history-id").value.trim();
 if(!id){verifiedStatus("Pick a fight before deleting.","error");return}
 if(!confirm(`Delete verified fight ${id} from Supabase? Built-in local history may still appear if this is a hardcoded fight.`))return;
 try{
  verifiedStatus(`Deleting ${id}…`);
  await window.RINGSIDE_SUPABASE.deleteVerifiedFight(id);
  const list=window.BOXING_FIGHT_HISTORY?.fights||[];
  const index=list.findIndex(f=>f.id===id&&f.synced);
  if(index>=0)list.splice(index,1);
  await syncVerifiedFightsFromSupabase(true);
  renderVerifiedPickers("__new");fillVerifiedForm(null);
  verifiedStatus("Deleted that Supabase verified fight.","ok");
 }catch(error){
  verifiedStatus(error.message||"Could not delete verified fight.","error");
 }
}
function shareUrl(slug){
 const url=new URL(location.href);
 url.searchParams.set("fight",slug);
 return url.toString();
}
function formatDate(value){
 try{return new Intl.DateTimeFormat(undefined,{month:"short",day:"numeric",year:"numeric",hour:"numeric",minute:"2-digit"}).format(new Date(value))}
 catch{return value||"Saved fight"}
}
function compactDate(value){
 try{return new Intl.DateTimeFormat(undefined,{month:"short",day:"numeric"}).format(new Date(value))}
 catch{return value||"Saved"}
}
function fightNameFromSaved(row){
 const data=row.fight_data||{},a=data.a?.last||row.red_fighter_id||"Red",b=data.b?.last||row.blue_fighter_id||"Blue";
 return `${a} vs ${b}`;
}
function savedFightSearchText(row){
 const data=row.fight_data||{},a=data.a||{},b=data.b||{},winner=row.winner_fighter_id===(row.red_fighter_id||a.id)?a:row.winner_fighter_id===(row.blue_fighter_id||b.id)?b:null;
 return [a.name,a.last,b.name,b.last,winner?.name,winner?.last,row.decision,row.method,row.red_version_label,row.blue_version_label,row.share_slug].filter(Boolean).join(" ").toLowerCase();
}
function renderMyFights(rows=[]){
 const status=$("#my-fights-status"),list=$("#my-fights-list");
 if(!rows.length){status.classList.remove("hidden");status.textContent="No saved fights yet. Run a simulation to add the first one.";list.innerHTML="";return}
 status.classList.add("hidden");
 list.innerHTML=rows.map(row=>{
  const data=row.fight_data||{},a=data.a||{},b=data.b||{},winner=row.winner_fighter_id===(row.red_fighter_id||a.id)?a:row.winner_fighter_id===(row.blue_fighter_id||b.id)?b:null;
  const winnerText=winner?.name||(data.winner==="draw"?"Draw":row.winner_fighter_id||"Result saved");
  const totals=data.totals||{};
  const score=data.judges?.map(j=>`${j.a}-${j.b}`).join(" · ")||"Cards stored";
  const method=row.decision||row.method||data.decision||"Decision stored";
  return `<article class="saved-fight-card" data-slug="${row.share_slug}">
   <div class="saved-fight-poster">
    <img src="${a.img||""}" alt="${a.name||"Red corner"}">
    <div>
     <small>${row.is_historical?"VERIFIED REPLAY":"SAVED SIMULATION"}</small>
     <b>${compactDate(row.created_at)}</b>
    </div>
    <img src="${b.img||""}" alt="${b.name||"Blue corner"}">
   </div>
   <div class="saved-fight-main">
    <small>${formatDate(row.created_at)}</small>
    <h3>${a.last||row.red_fighter_id||"Red"} <span>vs</span> ${b.last||row.blue_fighter_id||"Blue"}</h3>
    <p><span class="winner">${winnerText}</span> · ${method}</p>
    <div class="saved-fight-meta">
     <span>${row.red_version_label||a.label||"Red version"}</span>
     <span>${row.blue_version_label||b.label||"Blue version"}</span>
     <span>${row.rounds_completed||data.rounds?.length||0} rounds</span>
     <span>${score}</span>
     ${totals.kdA||totals.kdB?`<span>${totals.kdA||0}-${totals.kdB||0} knockdowns</span>`:""}
    </div>
   </div>
   <div class="saved-fight-actions">
    <button data-open-saved="${row.share_slug}">OPEN REPLAY</button>
    <button data-run-saved="${row.share_slug}">RUN MATCHUP</button>
    <button data-copy-saved="${row.share_slug}">COPY LINK</button>
   </div>
  </article>`;
 }).join("");
}
function applyMyFightsFilter(){
 const query=($("#my-fights-search")?.value||"").trim().toLowerCase();
 const filtered=query?savedFightRows.filter(row=>savedFightSearchText(row).includes(query)):savedFightRows;
 renderMyFights(filtered);
 if(query&&filtered.length===0){
  $("#my-fights-status").classList.remove("hidden");
  $("#my-fights-status").textContent=`No saved fights match “${query}”.`;
 }
}
async function loadMyFights(){
 const status=$("#my-fights-status"),list=$("#my-fights-list");
 if(!status||!list)return;
 status.classList.remove("hidden");status.textContent="Loading saved fights…";list.innerHTML="";
 if(!window.RINGSIDE_SUPABASE?.isConfigured?.()){status.textContent="Supabase is not connected yet, so My Fights cannot load.";return}
 if(!authUser()){status.innerHTML=`Sign in to view your private fight vault. <button class="inline-auth" data-open-auth>Sign in</button>`;return}
 try{
  const result=await window.RINGSIDE_SUPABASE.listSavedFights(24);
  if(result.authRequired){status.innerHTML=`${result.reason} <button class="inline-auth" data-open-auth>Sign in</button>`;return}
  savedFightRows=result.data||[];
  applyMyFightsFilter();
 }catch(error){
  status.textContent=`Could not load saved fights: ${error.message||error}`;
 }
}
function setSaveStatus(state,row=null,message=""){
 const box=$("#save-status");
 if(!box)return;
 box.classList.remove("saved","error");
 const title=box.querySelector("b"),text=box.querySelector("span"),view=$("#view-saved-fight"),copy=$("#copy-share-link");
 if(state==="saving"){title.textContent="Saving fight…";text.textContent="Your fight is being added to My Fights.";view.textContent="VIEW IN MY FIGHTS";view.disabled=true;copy.disabled=true;lastSavedFight=null;return}
 if(state==="auth"){title.textContent="Sign in to save";text.textContent=message||"This fight is complete, but it needs a profile before it can go into My Fights.";view.textContent="SIGN IN TO SAVE";view.disabled=false;copy.disabled=true;lastSavedFight=null;return}
 if(state==="saved"&&row){box.classList.add("saved");title.textContent="Fight saved";text.textContent=`Added to My Fights as ${row.share_slug}. Copy the replay link or open the vault.`;view.textContent="VIEW IN MY FIGHTS";view.disabled=false;copy.disabled=false;lastSavedFight=row;return}
 if(state==="replay"){box.classList.add("saved");title.textContent="Saved replay";text.textContent=message||"You are viewing a fight from My Fights.";view.textContent="VIEW IN MY FIGHTS";view.disabled=false;copy.disabled=!row?.share_slug;lastSavedFight=row;return}
 box.classList.add("error");title.textContent="Save unavailable";text.textContent=message||"The fight finished, but it could not be saved.";view.textContent="VIEW IN MY FIGHTS";view.disabled=false;copy.disabled=true;lastSavedFight=null;
}
async function copyText(text){
 if(navigator.clipboard?.writeText)return navigator.clipboard.writeText(text);
 const input=document.createElement("input");input.value=text;document.body.appendChild(input);input.select();document.execCommand("copy");input.remove();
}
function showSavedReplay(row){
 if(!row?.fight_data)return;
 replayingSavedFight=true;
 fight=row.fight_data;
 researchDesk=row.research_desk||fight.researchDesk||null;
 scheduled=fight.settings?.rounds||fight.rounds?.length||scheduled;
 current=fight.rounds?.length||0;
 $("#setup").classList.add("hidden");$(".settings-panel").classList.add("hidden");$(".hero").classList.add("hidden");$(".data-panel").classList.add("hidden");$("#research-desk").classList.add("hidden");$("#my-fights").classList.add("hidden");$("#broadcast").classList.add("hidden");
 showResults();
 setSaveStatus("replay",row,`Loaded from My Fights: ${fightNameFromSaved(row)}.`);
 history.replaceState(null,"",shareUrl(row.share_slug));
}
function hydrateSavedMatchup(row){
 const data=row?.fight_data||{},redId=row?.red_fighter_id||data.a?.id,blueId=row?.blue_fighter_id||data.b?.id;
 const red=fighters.find(f=>f.id===redId),blue=fighters.find(f=>f.id===blueId);
 if(red){selected.a=red;versions.a=Math.max(0,red.years.findIndex(v=>(v.label||"")===(row.red_version_label||data.a?.label)))}
 if(blue){selected.b=blue;versions.b=Math.max(0,blue.years.findIndex(v=>(v.label||"")===(row.blue_version_label||data.b?.label)))}
 scheduled=data.settings?.rounds||row.rounds_completed||scheduled;
 replayingSavedFight=false;
 renderFighter("a");renderFighter("b");renderResearchDesk();
}
async function runSavedMatchup(slug){
 const result=await window.RINGSIDE_SUPABASE.getSavedFight(slug);
 if(!result.data)return;
 hydrateSavedMatchup(result.data);
 history.replaceState(null,"",location.pathname);
 setView("home");
 document.querySelector("#setup")?.scrollIntoView({behavior:"smooth",block:"start"});
}
async function openSavedFight(slug){
 if(!window.RINGSIDE_SUPABASE?.isConfigured?.())return;
 const result=await window.RINGSIDE_SUPABASE.getSavedFight(slug);
 if(result.data)showSavedReplay(result.data);
}
function renderFightPoster(last=null){
 const a=active("a"),b=active("b"),round=last?.number||1;
 setImage($("#poster-img-a"),a.img,a.name);setImage($("#poster-img-b"),b.img,b.name);
 $("#poster-name-a").textContent=a.last;$("#poster-name-b").textContent=b.last;
 $("#poster-bg-a").textContent=a.last;$("#poster-bg-b").textContent=b.last;
 $("#poster-version-a").textContent=a.label||`${a.year||""}`;$("#poster-version-b").textContent=b.label||`${b.year||""}`;
 $("#poster-weight").textContent=($("#weight").value||a.division||b.division).toUpperCase();
 $("#poster-round").textContent=last?.stoppage?`${last.stoppage.type} · ROUND ${round}`:current?`ROUND ${String(round).padStart(2,"0")} OF ${scheduled}`:"MAIN EVENT";
 $("#poster-venue").textContent=($("#venue").value||"Neutral Arena").toUpperCase();
}
async function setupFight(){
 replayingSavedFight=false;
 const button=$("#simulate"),a=active("a"),b=active("b");
 button.disabled=true;button.innerHTML="<span>OPENING RESEARCH DESK…</span><b>⌁</b>";
 await syncVerifiedFightsFromSupabase();
 await window.BOXING_FIGHT_HISTORY?.resolve(a,b);
 const deskSettings=fightSettings();
 researchDesk=window.BOXING_RESEARCH_DESK?.create(a,b,deskSettings);
 fight=BoxingEngine.buildFight(a,b,{...deskSettings,narrationSalt:`${Date.now()}-${Math.random()}`,researchDesk});
 button.disabled=false;button.innerHTML="<span>SIMULATE THE FIGHT</span><b>→</b>";
 if(fight.historical)scheduled=fight.rounds.length;
 current=0;$("#setup").classList.add("hidden");$(".settings-panel").classList.add("hidden");$(".hero").classList.add("hidden");$("#broadcast").classList.remove("hidden");$("#results").classList.add("hidden");
 for(const s of ["a","b"]){$(`#live-name-${s}`).textContent=active(s).name;setImage($(`#live-img-${s}`),active(s).img,active(s).name);$(`#score-head-${s}`).textContent=active(s).last.toUpperCase();$(`#prob-name-${s}`).textContent=active(s).last.toUpperCase()}
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
 if(replayingSavedFight)return;
 setSaveStatus("saving");
 if(!window.RINGSIDE_SUPABASE?.isConfigured?.()){setSaveStatus("error",null,"Supabase is not connected yet, so this fight could not be saved.");return}
 if(!authUser()){setSaveStatus("auth",null,"Sign in or create an account to save this fight to your private vault.");return}
 try{
  const red=active("a"),blue=active("b");
  const saved=await window.RINGSIDE_SUPABASE.saveFight({fight,red,blue,settings:fightSettings(),researchDesk});
  if(saved?.authRequired){setSaveStatus("auth",null,saved.reason);return}
  const row=saved?.data?.[0];
  if(row?.share_slug){setSaveStatus("saved",row);console.info(`RINGSIDE saved fight: ${row.share_slug}`)}
  else setSaveStatus("error",null,"Supabase answered, but no share code came back.");
 }catch(error){
  setSaveStatus("error",null,error.message||"The fight could not be saved.");
  console.warn("RINGSIDE Supabase save skipped:",error.message||error);
 }
}
function showResults(){
 $("#broadcast").classList.add("hidden");$("#results").classList.remove("hidden");$("#result-kicker").textContent=replayingSavedFight?"SAVED FIGHT REPLAY":"OFFICIAL RESULT";const w=fight.winner==="draw"?null:fight[fight.winner]||active(fight.winner);
 const verifiedLabel=window.BOXING_FIGHT_HISTORY?.qualityLabel?.(fight.event)||(fight.officialScorecards?"OFFICIAL REPLAY":"VERIFIED OUTCOME");
 const resultMode=$("#result-mode-pill");
 if(resultMode){
  resultMode.className="result-mode-pill";
  if(replayingSavedFight){resultMode.textContent="SAVED REPLAY";resultMode.classList.add("saved")}
  else if(fight.historical){resultMode.textContent=verifiedLabel;resultMode.classList.add("verified")}
  else {resultMode.textContent="HYPOTHETICAL SIMULATION";resultMode.classList.add("fantasy")}
 }
 $("#winner-name").textContent=w?.name||"DRAW";$("#decision").textContent=fight.historical?`${fight.decision} · ${verifiedLabel}`:fight.decision;
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
$("#new-fight").onclick=()=>location.reload();$("#run-again").onclick=()=>{if(replayingSavedFight&&lastSavedFight)hydrateSavedMatchup(lastSavedFight);setupFight()};
$("#refresh-my-fights").onclick=loadMyFights;
$("#my-fights-search").oninput=applyMyFightsFilter;
$("#view-saved-fight").onclick=()=>{if(!authUser())openAuthDialog("Sign in first, then this fight can be saved to your private vault.");else setView("my-fights")};
$("#copy-share-link").onclick=async()=>{
 if(!lastSavedFight?.share_slug)return;
 await copyText(shareUrl(lastSavedFight.share_slug));
 $("#copy-share-link").textContent="COPIED";
 setTimeout(()=>$("#copy-share-link").textContent="COPY SHARE LINK",1200);
};
$("#my-fights-list").onclick=async e=>{
 const open=e.target.closest("[data-open-saved]"),copy=e.target.closest("[data-copy-saved]"),run=e.target.closest("[data-run-saved]");
 if(open)await openSavedFight(open.dataset.openSaved);
 if(run)await runSavedMatchup(run.dataset.runSaved);
 if(copy){await copyText(shareUrl(copy.dataset.copySaved));copy.textContent="COPIED";setTimeout(()=>copy.textContent="COPY LINK",1200)}
};
$("#my-fights").onclick=e=>{if(e.target.closest("[data-open-auth]"))openAuthDialog()};
$("#auth-button").onclick=()=>openAuthDialog();
$("#signin-button").onclick=async()=>{
 try{await window.RINGSIDE_SUPABASE.signIn($("#auth-email").value,$("#auth-password").value);renderAuthState();$("#auth-dialog").close();if(fight&&!lastSavedFight&&!replayingSavedFight&&!$("#results").classList.contains("hidden"))saveResultToSupabase();loadMyFights();if(!$("#roster-manager")?.classList.contains("hidden"))renderRosterManager();if(!$("#verified-manager")?.classList.contains("hidden"))renderVerifiedManager()}
 catch(error){$("#auth-message").textContent=error.message||"Could not sign in."}
};
$("#signup-button").onclick=async()=>{
 try{
  const data=await window.RINGSIDE_SUPABASE.signUp($("#auth-email").value,$("#auth-password").value);
  renderAuthState();
  if(data?.access_token){$("#auth-dialog").close();if(fight&&!lastSavedFight&&!replayingSavedFight&&!$("#results").classList.contains("hidden"))saveResultToSupabase();loadMyFights();if(!$("#roster-manager")?.classList.contains("hidden"))renderRosterManager();if(!$("#verified-manager")?.classList.contains("hidden"))renderVerifiedManager()}
  else $("#auth-message").textContent="Account created. Check your email if Supabase asks you to confirm it, then sign in.";
 }catch(error){$("#auth-message").textContent=error.message||"Could not create account."}
};
$("#signout-button").onclick=async()=>{await window.RINGSIDE_SUPABASE.signOut();savedFightRows=[];renderAuthState();$("#auth-dialog").close();loadMyFights();if(!$("#roster-manager")?.classList.contains("hidden"))renderRosterManager();if(!$("#verified-manager")?.classList.contains("hidden"))renderVerifiedManager()};
$("#roster-fighter").onchange=()=>{renderRosterPickers();fillRosterForm()};
$("#roster-version").onchange=fillRosterForm;
$("#roster-form").onsubmit=e=>{e.preventDefault();saveRosterEdit()};
$("#delete-roster-version").onclick=deleteRosterVersion;
$("#seed-roster").onclick=seedRosterToSupabase;
$("#reload-roster").onclick=async()=>{rosterStatus("Reloading Supabase roster…");await syncRosterFromSupabase();renderRosterManager()};
$("#history-fight").onchange=()=>{const id=$("#history-fight").value;fillVerifiedForm(id==="__new"?null:verifiedFightList().find(f=>f.id===id))};
$("#history-form").onsubmit=e=>{e.preventDefault();saveVerifiedFight()};
$("#delete-verified-fight").onclick=deleteVerifiedFight;
$("#reload-verified-fights").onclick=async()=>{verifiedStatus("Reloading verified fight history…");await syncVerifiedFightsFromSupabase(true);renderVerifiedManager()};
document.querySelectorAll("[data-view]").forEach(button=>button.onclick=()=>setView(button.dataset.view));
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
renderAuthState();
syncRosterFromSupabase();
syncVerifiedFightsFromSupabase();
const initialSlug=new URLSearchParams(location.search).get("fight");
if(initialSlug)openSavedFight(initialSlug);
