const fs=require("fs"),vm=require("vm"),assert=require("node:assert"),test=require("node:test");

function rosterIds(){
 const ids=new Set();
 for(const file of ["app.js","roster.js","roster-expanded.js","roster-active.js","roster-deep.js"]){
  const text=fs.readFileSync(file,"utf8");
  for(const match of text.matchAll(/\bid\s*:\s*"([^"]+)"/g))ids.add(match[1]);
  for(const match of text.matchAll(/\b(?:f|mk)\("([^"]+)"/g))ids.add(match[1]);
 }
 return ids;
}

function loadVerifiedHistory(){
 const context={window:{}};
 context.global=context.window;
 context.globalThis=context.window;
 vm.createContext(context);
 for(const file of ["fight-history.js","verified-fights-pack.js"]){
  vm.runInContext(fs.readFileSync(file,"utf8"),context,{filename:file});
 }
 return context.window.BOXING_FIGHT_HISTORY;
}

test("verified history pack has broader coverage with no dangling fighter references",()=>{
 const history=loadVerifiedHistory();
 const fighterIds=rosterIds();
 assert.ok(history.fights.length>=136);
 for(const fight of history.fights){
  assert.ok(fighterIds.has(fight.red),`${fight.id} has unknown red fighter ${fight.red}`);
  assert.ok(fighterIds.has(fight.blue),`${fight.id} has unknown blue fighter ${fight.blue}`);
  if(fight.winner)assert.ok(fighterIds.has(fight.winner),`${fight.id} has unknown winner ${fight.winner}`);
 }
});

test("new verified results include key classic, modern, and lower-weight matchups",()=>{
 const history=loadVerifiedHistory();
 const byId=id=>history.fights.find(f=>f.id===id);
 assert.equal(byId("tyson-holyfield-1996")?.winner,"holyfield");
 assert.equal(byId("chavez-whitaker-1993")?.method,"MAJORITY DRAW");
 assert.equal(byId("calzaghe-hopkins-2008")?.winner,"calzaghe");
 assert.equal(byId("davis-barrios-2021")?.endedRound,11);
 assert.equal(byId("lopez-barboza-2025")?.winner,"lopez");
 assert.equal(byId("nakatani-nishida-2025")?.method,"RTD");
 assert.equal(byId("collazo-jerusalem-2023")?.method,"RTD");
});
