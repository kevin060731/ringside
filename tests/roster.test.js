const fs=require("fs"),vm=require("vm"),assert=require("node:assert"),test=require("node:test");

test("version pack adds important career phases and weight-class versions",()=>{
 const context={window:{EXTRA_FIGHTERS:[],WEIGHT_CLASSES:null}};
 context.global=context.window;
 vm.createContext(context);
 for(const file of ["roster.js","roster-expanded.js","roster-active.js","roster-deep.js","roster-versions.js"]){
  vm.runInContext(fs.readFileSync(file,"utf8"),context,{filename:file});
 }
 const pack=context.window.ROSTER_VERSION_PACK;
 assert.ok(pack.mayweather.some(v=>v.label.includes("MONEY MAYWEATHER")));
 assert.ok(pack.mayweather.some(v=>v.division==="Junior Lightweight"));
 assert.ok(pack.mayweather.some(v=>v.division==="Welterweight"));
 const pretty=pack.mayweather.find(v=>v.year===2001),money=pack.mayweather.find(v=>v.year===2013);
 assert.ok(pretty.power>money.power);
 assert.ok(money.defense>=pretty.defense);
 assert.ok(money.aggression<pretty.aggression);
 assert.ok(pack.canelo.some(v=>v.division==="Junior Middleweight"));
 assert.ok(pack.canelo.some(v=>v.division==="Super Middleweight"));
 assert.ok(pack.pacquiao.some(v=>v.division==="Featherweight"));
 assert.ok(pack.pacquiao.some(v=>v.division==="Welterweight"));
 assert.ok(pack.ward.some(v=>v.label.includes("SUPER SIX")));
 assert.ok(pack.duran.some(v=>v.division==="Lightweight"));
 assert.ok(pack.duran.some(v=>v.division==="Welterweight"));
 assert.ok(pack.duran.some(v=>v.division==="Junior Middleweight"));
 assert.ok(pack.duran.some(v=>v.division==="Middleweight"));
 assert.equal(context.window.EXTRA_FIGHTERS.find(f=>f.id==="duran")?.name,"Roberto Durán");
 for(const id of ["armstrong","greb","langford","gans","fitzsimmons"]){
  assert.ok(context.window.EXTRA_FIGHTERS.find(f=>f.id===id),`${id} from the decade P4P playlist should be selectable`);
 }
 assert.ok(pack.ennis.some(v=>v.year===2026&&v.division==="Junior Middleweight"&&v.weight===154));
 assert.ok(pack.benavidez.some(v=>v.year===2026&&v.division==="Cruiserweight"&&v.weight===200));
 assert.ok(pack.haney.some(v=>v.year===2026&&v.division==="Welterweight"&&v.weight===147&&v.bestPerformance?.opponent==="Brian Norman Jr."));
 assert.ok(pack.ryangarcia.some(v=>v.year===2026&&v.division==="Welterweight"&&v.weight===147));
 assert.ok(pack.rodriguez.some(v=>v.year===2026&&v.division==="Junior Bantamweight"&&v.bestPerformance?.opponent==="Fernando Martínez"));
 assert.ok(pack.stevenson.some(v=>v.year===2023&&v.bestPerformance?.opponent==="Shuichiro Yoshino"));
 const shakur2026=pack.stevenson.find(v=>v.year===2026);
 assert.equal(shakur2026.division,"Junior Welterweight");
 assert.equal(shakur2026.weight,140);
 assert.equal(shakur2026.bestPerformance.opponent,"Teófimo López");
 assert.ok(Object.keys(pack).length>=30);
 for(const [id,versions] of Object.entries(pack)){
  for(const version of versions){
   assert.ok(Number.isFinite(version.weight),`${id} ${version.label} is missing selected-version fight weight`);
   assert.ok(version.bestPerformance?.opponent,`${id} ${version.label} is missing a signature performance`);
  }
 }
 const ali1967=pack.ali.find(v=>v.year===1967),ali1974=pack.ali.find(v=>v.year===1974);
 assert.equal(ali1967.weight,212);
 assert.equal(ali1974.weight,216);
 const wilder=context.window.EXTRA_FIGHTERS.find(f=>f.id==="wilder");
 assert.equal(wilder.years[0].weight,219);
 const activeCurrent=context.window.EXTRA_FIGHTERS.filter(f=>f.active&&f.updated==="2026-07-08");
 assert.ok(activeCurrent.length>=50);
 for(const fighter of activeCurrent){
  for(const version of fighter.years){
   assert.ok(version.bestPerformance?.opponent,`${fighter.id} ${version.label} is missing a current signature performance`);
  }
 }
});
