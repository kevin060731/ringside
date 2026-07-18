(function(global){
const ratingKeys=["power","speed","chin","defense","iq","footwork","cardio","accuracy","aggression"];
const divisionWeights={Heavyweight:224,Cruiserweight:200,"Light Heavyweight":175,"Super Middleweight":168,Middleweight:160,"Junior Middleweight":154,Welterweight:147,"Junior Welterweight":140,Lightweight:135,"Junior Lightweight":130,Featherweight:126,"Junior Featherweight":122,Bantamweight:118,"Junior Bantamweight":115,Flyweight:112,"Junior Flyweight":108,Strawweight:105};
const clean=value=>String(value||"").trim();
const asObject=value=>value&&typeof value==="object"&&!Array.isArray(value)?value:{};
const lastName=name=>clean(name).split(" ").filter(part=>!["Jr.","Jr","Sr.","Sr","II","III","IV"].includes(part)).at(-1)||clean(name);
function ratingsFrom(source={}){
 const output={};
 for(const key of ratingKeys){
  const value=Number(source[key]);
  if(Number.isFinite(value))output[key]=value;
 }
 return output;
}
function normalizeVersion(row={},fallbackDivision="Welterweight"){
 const notes=asObject(row.source_notes);
 const simulation=asObject(notes.simulation);
 const ratings=ratingsFrom({...asObject(row.ratings),...simulation});
 const division=clean(row.division)||clean(notes.division)||fallbackDivision;
 const year=Number(row.year)||Number(notes.year)||new Date().getFullYear();
 const weight=Number(row.weight_lbs)||Number(notes.weight)||divisionWeights[division]||160;
 return {
  year,
  label:clean(row.label)||clean(notes.label)||`${year} · SYNCED VERSION`,
  division,
  weight,
  ...ratings,
  bestPerformance:row.best_performance||notes.bestPerformance||notes.best_performance||null,
  sourceNotes:notes,
  synced:true,
  updated:row.updated_at||null
 };
}
function normalizeFighter(row={},versionRows=[]){
 const model=asObject(row.model_data);
 const id=clean(row.id);
 const name=clean(row.name)||model.name||id;
 const division=clean(row.primary_division)||model.division||model.primaryDivision||"Welterweight";
 const modelYears=Array.isArray(model.years)?model.years.map(version=>({
  ...version,
  weight:Number(version.weight)||divisionWeights[version.division||division]||160,
  synced:true
 })):[];
 const years=versionRows.length?versionRows.map(version=>normalizeVersion(version,division)):modelYears;
 if(!years.length&&model.ratings){
  years.push({
   year:Number(model.year)||new Date().getFullYear(),
   label:model.label||"CURRENT · SYNCED",
   division,
   weight:Number(model.weight)||divisionWeights[division]||160,
   ...ratingsFrom(model.ratings),
   bestPerformance:model.bestPerformance||null,
   synced:true
  });
 }
 return {
  ...model,
  id,
  name,
  last:clean(row.last_name)||model.last||lastName(name),
  nickname:model.nickname||model.nick||"",
  country:clean(row.country)||model.country||"",
  stance:clean(row.stance)||model.stance||"Orthodox",
  division,
  wiki:model.wiki||name,
  active:Boolean(row.active||model.active),
  updated:row.updated_at||model.updated||null,
  img:clean(row.image_url)||model.img||model.image||model.imageUrl||model.image_url||"https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=500&q=85",
  years
 };
}
function mergeRoster(localFighters=[],remote={fighters:[],versions:[]}){
 const versionRows=new Map();
 for(const version of remote.versions||[]){
  const id=clean(version.fighter_id);
  if(!id)continue;
  if(!versionRows.has(id))versionRows.set(id,[]);
  versionRows.get(id).push(version);
 }
 let added=0,updated=0,versionCount=0;
 for(const row of remote.fighters||[]){
  const id=clean(row.id);
  if(!id)continue;
  const synced=normalizeFighter(row,versionRows.get(id)||[]);
  if(!synced.years.length)continue;
  versionCount+=synced.years.length;
  const existing=localFighters.find(f=>f.id===id);
  if(existing){
   const localYears=existing.years||[];
   Object.assign(existing,synced,{years:synced.years.length?synced.years:localYears});
   updated++;
  }else{
   localFighters.push(synced);
   added++;
  }
 }
 return {fighters:localFighters,added,updated,versions:versionCount};
}
global.RINGSIDE_ROSTER_SYNC={mergeRoster,normalizeFighter,normalizeVersion};
})(typeof window!=="undefined"?window:globalThis);
