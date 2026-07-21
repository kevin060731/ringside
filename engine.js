(function(global){
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
function seeded(seed){let s=seed>>>0;return()=>((s=Math.imul(1664525,s)+1013904223>>>0)/4294967296)}
function hash(str){let h=2166136261;for(const c of str){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
const divisionWeight={
  Heavyweight:224,Cruiserweight:200,"Light Heavyweight":175,"Super Middleweight":168,Middleweight:160,
  "Junior Middleweight":154,Welterweight:147,"Junior Welterweight":140,Lightweight:135,
  "Junior Lightweight":130,Featherweight:126,"Junior Featherweight":122,Bantamweight:118,
  "Junior Bantamweight":115,Flyweight:112,"Junior Flyweight":108,Strawweight:105
};
function contractLimit(weightClass){return !weightClass||weightClass==="Open Weight"||weightClass==="Heavyweight"?null:divisionWeight[weightClass]||null}
function normalizedSettings(settings={}){
 return {
  rounds:Number(settings.rounds)||12,
  ring:Number(settings.ring)||20,
  weight:settings.weight||"Open Weight",
  venue:settings.venue||"Neutral Arena",
  championship:settings.championship!==false,
  neutral:settings.neutral!==false,
  ruleset:settings.ruleset||"modern",
  environment:settings.environment||"indoor",
  weighin:settings.weighin||"next-day",
  equipment:settings.equipment||"modern",
  narrationSalt:settings.narrationSalt,
  researchDesk:settings.researchDesk||null
 };
}
function eraProfile(settings){
 const old=settings.ruleset==="old-school",bare=settings.ruleset==="bareknuckle",classic=settings.ruleset==="classic";
 const heat=settings.environment==="outdoor-heat",outdoor=settings.environment==="outdoor"||heat;
 const vintage=settings.equipment==="vintage",minimal=settings.equipment==="minimal";
 const roundsLoad=clamp(settings.rounds/12,1,3);
 return {
  label:bare?"bareknuckle-era rules":old?"old-school rules":classic?"classic championship rules":"modern rules",
  roughness: bare ? .38 : old ? .28 : classic ? .12 : .03,
  refereeBreaks: bare ? .18 : old ? .35 : classic ? .62 : .9,
  gloveDamage:minimal?1.2:vintage?1.1:1,
  handOutput: minimal ? .9 : vintage ? .95 : 1,
  handInjuryRisk: minimal ? 1.75 : vintage ? 1.35 : 1,
  cutRisk: minimal ? 1.45 : vintage ? 1.2 : 1,
  traction: minimal ? .88 : vintage ? .93 : 1,
  heatTax:heat?1.18:outdoor?1.06:1,
  sameDayTax:settings.weighin==="same-day"?1.22:1,
  longFightTax:clamp(1+(roundsLoad-1)*.18,1,1.36),
  oldSchoolScoring: bare ? .2 : old ? .15 : classic ? .08 : 0,
  stoppageTolerance: bare ? .78 : old ? .86 : classic ? .94 : 1
 };
}
function naturalWeight(f){return Number(f.weight)||divisionWeight[f.division]||160}
function maxRoundExperience(f){
 const known={
  mayweather:12,pacquiao:12,canelo:12,crawford:12,usyk:12,fury:12,joshua:12,wilder:12,ward:12,stevenson:12,davis:12,haney:12,lopez:12,lomachenko:12,spence:12,ennis:12,norman:12,
  ali:15,tyson:12,holyfield:12,foreman:12,frazier:15,louis:15,marciano:15,lewis:12,klitschko:12,hearns:15,leonard:15,hagler:15,duran:15,robinson:15,monzon:15,hopkins:12,
  pep:15,moore:15,arguello:15,pryor:15,sanchez:15,wilde:20
 };
 if(Number(f.maxRounds))return Number(f.maxRounds);
 if(known[f.id])return known[f.id];
 const year=Number(f.year)||Number((f.label||"").match(/\d{4}/)?.[0])||2026;
 if(year<=1925)return 20;
 if(year<=1982)return 15;
 return 12;
}
function injuryProfile(f){
 const known={
  mayweather:{hand:.46,cut:.05,handLabel:"known brittle hands",cutLabel:"rarely cut"},
  calzaghe:{hand:.26,cut:.07,handLabel:"hand trouble history",cutLabel:"rarely cut"},
  haye:{hand:.24,cut:.08,handLabel:"fragile hand/shoulder history",cutLabel:"low cut risk"},
  tyson:{hand:.12,cut:.18,handLabel:"compact power stress",cutLabel:"scar tissue risk"},
  fury:{hand:.08,cut:.34,handLabel:"normal hand risk",cutLabel:"cuts and swelling can matter"},
  klitschko:{hand:.08,cut:.24,handLabel:"normal hand risk",cutLabel:"cut-prone history"},
  vitali:{hand:.08,cut:.3,handLabel:"normal hand risk",cutLabel:"cut-prone history"},
  gatti:{hand:.14,cut:.42,handLabel:"action-fight wear",cutLabel:"cuts and swelling history"},
  ward:{hand:.16,cut:.1,handLabel:"hand/shoulder management",cutLabel:"low cut risk"},
  froch:{hand:.1,cut:.2,handLabel:"normal hand risk",cutLabel:"skin damage can build"},
  marciano:{hand:.18,cut:.2,handLabel:"small-glove power stress",cutLabel:"rough-era facial damage risk"},
  robinson:{hand:.12,cut:.16,handLabel:"old-school wear",cutLabel:"old-school facial damage risk"}
 };
 const base=known[f.id]||{};
 const powerHand=f.power>=96 ? .06 : 0,pressureCut=f.aggression>=95 ? .08 : 0;
 return {
  hand:clamp(Number(f.injuryRisk?.hand??base.hand??.08)+powerHand,0,.65),
  cut:clamp(Number(f.injuryRisk?.cut??base.cut??.1)+pressureCut,0,.65),
  handLabel:f.injuryRisk?.handLabel||base.handLabel||"normal hand risk",
  cutLabel:f.injuryRisk?.cutLabel||base.cutLabel||"normal cut risk"
 };
}
function stoppingPowerProfile(f){
 const known={
  haney:{koPower:.11,label:"low stopping-power boxer",lowCeiling:true,noEliteKnockdowns:true},
  whitaker:{koPower:.14,label:"pillow-fisted defensive genius",lowCeiling:true,noEliteKnockdowns:true},
  stevenson:{koPower:.2,label:"low-risk precision boxer",lowCeiling:true,noEliteKnockdowns:true},
  hitchins:{koPower:.16,label:"low stopping-power boxer",lowCeiling:true,noEliteKnockdowns:true},
  andycruz:{koPower:.18,label:"amateur-style scoring boxer",lowCeiling:true,noEliteKnockdowns:true},
  plant:{koPower:.24,label:"boxer-first puncher",lowCeiling:true},
  catterall:{koPower:.24,label:"boxer-first counterpuncher",lowCeiling:true},
  bivol:{koPower:.28,label:"volume-control puncher",lowCeiling:true},
  frankmartin:{koPower:.28,label:"boxer-first puncher",lowCeiling:true}
 };
 const rating=clamp(((Number(f.power)||82)-70)/30,.08,1);
 const profile=known[f.id]||{};
 return {
  koPower:clamp(Number(profile.koPower??rating),.05,1),
  label:profile.label||(rating<.3?"low stopping-power profile":"normal stopping-power profile"),
  lowCeiling:!!profile.lowCeiling||rating<.3,
  noEliteKnockdowns:!!profile.noEliteKnockdowns
 };
}
function roundStoppingPower(f,calc,base,handDrag=0){
 const rating=clamp(((Number(calc.power)||Number(f.power)||82)-70)/30,.05,1);
 return {
  ...base,
  koPower:clamp((base.koPower*.78+rating*.22)*(1-handDrag*.9),.03,1)
 };
}
function knockdownHistoryProfile(f){
 const known={
  mayweather:{tier:"never",label:"clean no-knockdown championship profile",resistance:.22,cap:.003},
  canelo:{tier:"never",label:"clean no-knockdown pro profile",resistance:.24,cap:.004},
  golovkin:{tier:"never",label:"clean no-knockdown iron-chin profile",resistance:.22,cap:.004},
  bivol:{tier:"never",label:"clean no-knockdown balance-and-distance profile",resistance:.25,cap:.004},
  stevenson:{tier:"never",label:"defensive no-knockdown profile",resistance:.24,cap:.004},
  rodriguez:{tier:"never",label:"elite lower-weight no-knockdown profile",resistance:.26,cap:.005},
  hagler:{tier:"never",label:"old-school iron-chin no-knockdown profile",resistance:.2,cap:.004},
  marciano:{tier:"rare",label:"rare-knockdown heavyweight durability profile",resistance:.48,cap:.014},
  ali:{tier:"rare",label:"rare-knockdown elite recovery profile",resistance:.5,cap:.016},
  usyk:{tier:"rare",label:"rare-knockdown balance-and-recovery profile",resistance:.5,cap:.014},
  crawford:{tier:"rare",label:"rare-knockdown elite recovery profile",resistance:.52,cap:.014},
  inoue:{tier:"rare",label:"rare-knockdown elite champion profile",resistance:.55,cap:.018},
  tyson:{tier:"rare",label:"rare-knockdown prime explosiveness profile",resistance:.55,cap:.018},
  whitaker:{tier:"rare",label:"rare-knockdown defensive-genius profile",resistance:.48,cap:.014},
  lomachenko:{tier:"rare",label:"rare-knockdown balance-and-angle profile",resistance:.55,cap:.018},
  ward:{tier:"rare",label:"rare-knockdown clinch-and-position profile",resistance:.52,cap:.016},
  hopkins:{tier:"rare",label:"rare-knockdown craft-and-survival profile",resistance:.5,cap:.016}
 };
 const profile=known[f.id]||{};
 return {
  tier:profile.tier||"normal",
  label:profile.label||"standard knockdown-history profile",
  resistance:Number(profile.resistance??1),
  cap:Number(profile.cap??.32)
 };
}
function eliteDurability(f,calc){
 const history=knockdownHistoryProfile(f);
 const historyBonus=history.tier==="never"?.18:history.tier==="rare"?.09:0;
 return clamp(((Number(calc.chin)||Number(f.chin)||85)*.4+(Number(calc.defense)||Number(f.defense)||85)*.34+(Number(calc.iq)||Number(f.iq)||85)*.18+(Number(calc.footwork)||Number(f.footwork)||85)*.08-82)/20+historyBonus,0,1.25);
}
function knockdownCeiling(attackerProfile,defender,defenderCalc,attackerWeight,defenderWeight,sizeMismatch,damage=0,fatigue=0){
 const elite=eliteDurability(defender,defenderCalc);
 const history=knockdownHistoryProfile(defender);
 const meaningfulMassGap=sizeMismatch&&attackerWeight>defenderWeight*1.12;
 const extremePressure=damage>7.5||fatigue>.84;
 const elitePower=attackerProfile.koPower>.86;
 let cap=.015+attackerProfile.koPower*.25;
 if(attackerProfile.noEliteKnockdowns&&elite>.72&&!sizeMismatch)cap=0;
 else if(attackerProfile.lowCeiling&&attackerProfile.koPower<.22&&elite>.78&&!sizeMismatch)cap=.004;
 else if(attackerProfile.lowCeiling&&attackerProfile.koPower<.32&&elite>.86&&!sizeMismatch)cap=.01;
 if(sizeMismatch&&attackerWeight>defenderWeight)cap+=.1;
 if(!meaningfulMassGap&&history.tier==="never")cap=Math.min(cap,elitePower&&extremePressure?.012:elitePower?.007:history.cap);
 if(!meaningfulMassGap&&history.tier==="rare")cap=Math.min(cap,elitePower&&extremePressure?.028:elitePower?.018:history.cap);
 return clamp(cap,0,sizeMismatch&&attackerWeight>defenderWeight?.45:.32);
}
function canForceStoppage(attackerProfile,defender,defenderCalc,damage,knockdown,attackerWeight,defenderWeight,sizeMismatch){
 const elite=eliteDurability(defender,defenderCalc);
 const history=knockdownHistoryProfile(defender);
 const meaningfulMassGap=sizeMismatch&&attackerWeight>defenderWeight*1.12;
 if(!meaningfulMassGap&&history.tier==="never")return attackerProfile.koPower>.9&&damage>10.8&&knockdown;
 if(!meaningfulMassGap&&history.tier==="rare")return attackerProfile.koPower>.82&&damage>9.4&&knockdown;
 if(attackerProfile.noEliteKnockdowns&&elite>.72&&!sizeMismatch)return false;
 if(attackerProfile.lowCeiling&&attackerProfile.koPower<.22&&elite>.78&&!sizeMismatch)return damage>12&&knockdown;
 if(attackerProfile.lowCeiling&&attackerProfile.koPower<.32&&elite>.86&&!sizeMismatch)return damage>10.5&&knockdown;
 return true;
}
function earlyStoppageAllowed(round,attackerProfile,defender,defenderCalc,sizeMismatch){
 if(round>=3||sizeMismatch)return true;
 const elite=eliteDurability(defender,defenderCalc);
 if(round===1)return attackerProfile.koPower>.9&&elite<.34;
 return attackerProfile.koPower>.82&&elite<.5;
}
function weightPlan(f,targetWeight){
 const natural=naturalWeight(f);
 if(!targetWeight)return {natural,effective:natural,type:"natural",cut:0,bulk:0,speedPenalty:0,cardioPenalty:0,chinPenalty:0,footworkPenalty:0,powerPenalty:0,note:null};
 if(natural>targetWeight){
  const cut=clamp((natural-targetWeight)/natural,0,.42);
  return {
   natural,effective:targetWeight,type:cut>.14?"hard cut":"cut",cut,bulk:0,
   speedPenalty:cut*8,cardioPenalty:cut*30,chinPenalty:cut*17,footworkPenalty:cut*7,powerPenalty:cut*6,
   note:cut>.06?`${f.last} is making ${targetWeight} lb from a ${Math.round(natural)} lb frame, so stamina, punch resistance and late-round sharpness are taxed.`:null
  };
 }
 const bulk=clamp((targetWeight-natural)/natural,0,.7);
 return {
  natural,effective:natural+(targetWeight-natural)*.38,type:bulk>.12?"moving up":"small move up",cut:0,bulk,
  speedPenalty:bulk*12,cardioPenalty:bulk*12,chinPenalty:bulk*3,footworkPenalty:bulk*14,powerPenalty:bulk*7,
  note:bulk>.05?`${f.last} is fighting above the natural ${Math.round(natural)} lb frame, so the extra weight helps mass but can dull speed, feet and repeat attacks.`:null
 };
}
function adjustedFighter(f,plan,era={traction:1,sameDayTax:1}){
 const cutMultiplier=plan.cut?era.sameDayTax:1;
 return {
  ...f,
  power:clamp(f.power-plan.powerPenalty*cutMultiplier,45,100),
  speed:clamp((f.speed-plan.speedPenalty*cutMultiplier)*era.traction,45,100),
  chin:clamp(f.chin-plan.chinPenalty*cutMultiplier,45,100),
  footwork:clamp((f.footwork-plan.footworkPenalty*cutMultiplier)*era.traction,45,100),
  cardio:clamp(f.cardio-plan.cardioPenalty*cutMultiplier,45,100)
 };
}
const signatureStyles={
 mayweather:{range:"long-to-mid range",weapon:"stab jab to the body and pull-counter right",defense:"shoulder-roll shell, lead-hand control and rear-foot pull",entry:"invites the lead before countering the recovery",exit:"rolls the right hand and pivots toward the opponent’s lead side",risk:"being crowded before the shoulder-roll frame is established"},
 hearns:{range:"the end of an unusually long jab",weapon:"range-finding left jab followed by the spear right hand",defense:"long guard and backward step",entry:"pins the opponent outside with the jab before dropping the right through the center",exit:"posts with the lead arm and withdraws on a long line",risk:"being forced upright and worked underneath his long levers"},
 leonard:{range:"mobile mid-range",weapon:"blinding jab, sudden lead right and high-speed finishing flurry",defense:"rhythmic footwork, slips and rapid angle changes",entry:"changes tempo before bursting across the gap",exit:"finishes combinations while circling off",risk:"admiring combinations long enough to be timed by a patient counterpuncher"},
 ali:{range:"long range in open space",weapon:"up-jab, fast one-two and check hook while moving",defense:"lean-back reactions, hand fighting and exceptional feet",entry:"draws pursuit and punches as the opponent crosses distance",exit:"slides or pivots away before the second wave",risk:"being pinned when the legs can no longer erase the ropes"},
 armstrong:{range:"smothering close range",weapon:"unceasing hooks, short uppercuts and body-to-head pressure",defense:"pressure defense, tucked chin and constant head movement through contact",entry:"forces the opponent to punch while retreating, then steps into the space the punch leaves",exit:"does not exit so much as reset his head position and continue working",risk:"being tied up by a bigger clincher before volume can build"},
 greb:{range:"chaotic mid-to-close range",weapon:"swarming volume, odd angles, cuffs and rough positional pressure",defense:"movement, disruption and making the opponent fight at his pace",entry:"breaks rhythm with half-steps and swarm entries from uncomfortable lines",exit:"spins or crowds before the opponent can set a clean counter",risk:"a clean puncher timing one of the wild entries"},
 langford:{range:"compact mid-range across weight classes",weapon:"heavy right hand, left hook and body shots from a crouched base",defense:"low center of gravity, roll-under counters and old-school clinch craft",entry:"lets taller fighters reach, then steps underneath with power loaded",exit:"stays close enough to counter the pull-out",risk:"giving away height and reach before the counter lane is earned"},
 tyson:{range:"inside the opponent’s jab",weapon:"double jab to enter, shifting hooks and uppercuts from the peekaboo weave",defense:"high guard with explosive slips to either side",entry:"changes level under the lead hand and attacks from a new angle",exit:"shifts through the target to stay on a punching angle",risk:"being tied up or forced to reset repeatedly at long range"},
 crawford:{range:"adaptive mid-range",weapon:"stance-switching jab, lead hook and precision counter right or left",defense:"distance traps, catch counters and stance changes",entry:"changes stance to alter the lane after the opponent commits",exit:"turns the opponent and leaves in the new stance",risk:"giving away early reads while gathering information"},
 canelo:{range:"compact mid-to-close range",weapon:"counter right, left hook to the body and heavy guard-splitting combinations",defense:"waist movement, high guard and subtle parries",entry:"walks the target toward the ropes before countering the escape",exit:"stays in the pocket behind the high guard",risk:"losing minutes to a disciplined mover who refuses the pocket"},
 duran:{range:"violent inside-to-mid range",weapon:"jab to the chest, right hand over the guard, hooks underneath and punishing body work",defense:"rolling upper body, forearm frames, shoulder bumps and subtle head placement",entry:"steps in behind feints and hand traps until the opponent has to fight off his chest",exit:"turns out after body work or stays close enough to counter the reset",risk:"having to chase a disciplined mover through empty space before the rough craft can attach"},
 gans:{range:"measured long-to-mid range",weapon:"educated jab, straight right, counters and patient body placement",defense:"old-master parries, balance, distance judgment and clinch awareness",entry:"draws the lead with small feints before answering down the center",exit:"steps out calmly rather than wasting motion",risk:"losing physical exchanges if the fight becomes pure wrestling pressure"},
 fitzsimmons:{range:"long mid-range for sudden power",weapon:"solar-plexus body shot, right hand and deceptive one-punch counters",defense:"awkward lean-backs, traps and early-era clinch instincts",entry:"makes the opponent reach before dropping power into the exposed line",exit:"backs out just enough to make the next rush fall short",risk:"being outworked before the trap lands"},
 pacquiao:{range:"explosive in-and-out range",weapon:"double jab, straight left and rapid angle-changing flurry",defense:"rhythmic bounce and exit outside the lead shoulder",entry:"feints the step before springing down the outside lane",exit:"continues past the target on a new angle",risk:"being timed during the predictable bounce-in rhythm"},
 lomachenko:{range:"close enough to touch the lead shoulder",weapon:"probe jab, shifting straight left and combinations after the angle change",defense:"lead-hand framing, pivots and head placement",entry:"occupies the guard before stepping around the lead foot",exit:"turns the opponent instead of retreating",risk:"conceding early rounds while downloading reactions"},
 stevenson:{range:"the edge of countering distance",weapon:"southpaw jab to head and body, check hook and straight left",defense:"small pulls, catch-and-shoot counters and disciplined feet",entry:"touches the guard and scores during the opponent’s reset",exit:"takes half a step and remains close enough to counter again",risk:"allowing low output to make competitive rounds look closer"},
 davis:{range:"patient mid-range",weapon:"counter left hand, check hook and explosive uppercut",defense:"compact guard, slips and patient distance reads",entry:"cedes activity until the opponent repeats an entry",exit:"angles after the power counter rather than building long combinations",risk:"banking too few early rounds while waiting for the knockout read"},
 usyk:{range:"high-volume long-to-mid range",weapon:"southpaw jab, double straight left and punches off lateral steps",defense:"constant angle changes and disciplined high guard",entry:"creates overload with feet, feints and repeated lead-hand touches",exit:"circles before the opponent can set the rear hand",risk:"body pressure that slows the feet and narrows the ring"},
 inoue:{range:"precise mid-range",weapon:"jab to the body, straight right and left hook around the guard",defense:"tight guard, distance judgment and immediate counters",entry:"uses body threats to freeze the elbows before attacking upstairs",exit:"resets in stance ready to counter the return",risk:"accepting exchanges against naturally larger punchers"},
 spence:{range:"pressure-oriented mid-range",weapon:"southpaw jab, straight left and sustained body combinations",defense:"high guard, physical positioning and responsible returns",entry:"walks behind the jab until the opponent’s exit narrows",exit:"stays close enough to continue working the body",risk:"meeting a faster counter before his pressure structure is established"},
 ennis:{range:"long-to-mid range that can collapse into ambidextrous combination range",weapon:"switch-hitting jab, straight rear hand, uppercut and quick stance-change combinations",defense:"fast feet, high guard catches and stance-switch resets",entry:"shows one stance picture, makes the opponent answer it, then attacks from the other side of the lane",exit:"slides out behind the jab or changes stance as the opponent turns",risk:"chasing the spectacular finish before the feet have re-set underneath the combination"},
 norman:{range:"explosive mid-range",weapon:"sharp jab, sudden right hand and compact counter hooks",defense:"tight orthodox guard, shoulder turns and reactive counters",entry:"waits for the opponent to overcommit before punching through the opening",exit:"takes a short angle after the right hand instead of exchanging for free",risk:"being made to lead repeatedly when the counter trigger never arrives cleanly"},
 beterbiev:{range:"heavy mid-to-close range",weapon:"short right hand, clubbing hooks and punches through the guard",defense:"tight guard and physical parries",entry:"breaks posture with contact before opening combinations",exit:"keeps the opponent under pressure rather than fully resetting",risk:"giving a mobile technician too much open space"},
 bivol:{range:"disciplined long mid-range",weapon:"fast jab, straight right and compact three-punch exits",defense:"high guard, short retreats and immediate stance recovery",entry:"steps in behind straight punches without crossing the feet",exit:"finishes with the feet already moving out of range",risk:"being physically held at the ropes before the reset"},
 benavidez:{range:"suffocating mid-to-close range",weapon:"fast-volume hooks, body shots and clubbing uppercuts once the guard is occupied",defense:"high guard, forearm pressure and a big-frame shoulder roll in close",entry:"uses volume to freeze the guard before stepping into heavier body work",exit:"rarely exits fully; he resets half a step away and starts another wave",risk:"giving a mover early space before the pressure rhythm has trapped the feet"},
 rodriguez:{range:"angular close-to-mid range",weapon:"southpaw jab, body stab, short uppercut and combination turns after the angle",defense:"small pivots, head movement on entry and immediate position changes",entry:"touches the lead hand, steps across the line and makes the opponent turn before punching back",exit:"finishes beside the opponent instead of directly in front",risk:"being held or crowded by a larger fighter before the angle sequence begins"},
 louis:{range:"balanced long-to-mid range",weapon:"educated jab, short right hand and compact finishing combinations",defense:"high left shoulder, short steps and responsible punch recovery",entry:"sets the feet quietly behind the jab before releasing the right hand",exit:"resets in punching position instead of admiring the damage",risk:"being crowded before the jab has organized the exchange"},
 marciano:{range:"grinding mid-to-close range",weapon:"overhand right, clubbing hooks and exhausting body mauls",defense:"crouch, rolling pressure and sheer durability through contact",entry:"keeps bending under the return until the opponent has to punch downward",exit:"leans on the opponent or resets with pressure still attached",risk:"eating clean counters while crossing the long-range gap"},
 frazier:{range:"left-hook pressure range",weapon:"rhythmic bob-and-weave entry, left hook and body-head pressure",defense:"low crouch, head movement and forward momentum",entry:"rolls under the jab and attacks before the tall fighter can reset the rear hand",exit:"stays on the chest and makes the next exchange begin immediately",risk:"being forced to reset outside where the hook cannot start the argument"},
 foreman:{range:"mauling mid-range",weapon:"shoving jab, framing arms, uppercuts and wrecking-ball hooks",defense:"long-arm frames, physical parries and intimidation of space",entry:"pushes the guard out of shape before punching through it",exit:"walks the opponent backward rather than giving a clean reset",risk:"spending too much energy if the target survives the first physical wave"},
 lewis:{range:"tall heavyweight long range",weapon:"ramrod jab, right cross and clinch-to-reset control",defense:"big-man guard, framing and distance denial",entry:"touches with the jab until the right hand is no longer a guess",exit:"ties up or steps off before the shorter fighter can work inside",risk:"letting a smaller explosive puncher get beneath the jab line"},
 klitschko:{range:"jab-and-clinch command range",weapon:"pawing jab, heavy straight right and left-hook check",defense:"height, clinch pressure and disciplined retreat lines",entry:"extends the lead hand to freeze the opponent before committing the right",exit:"folds the exchange into a clinch or resets at full reach",risk:"panic resetting when the opponent beats the clinch to the inside"},
 wilder:{range:"long danger range",weapon:"range-finding jab and nuclear straight right",defense:"athletic pullback, long guard and explosive recovery steps",entry:"waits for the opponent to step onto the right hand rather than building layered offense",exit:"backs out on a long line to reload the same threat",risk:"losing minutes when the right hand is seen but not earned"},
 joshua:{range:"structured mid-to-long range",weapon:"stiff jab, straight right, left hook and uppercut in set combinations",defense:"high guard, measured retreats and clinch strength",entry:"builds behind the jab until the combination can be thrown from balance",exit:"resets square enough to punch again but can admire the finish",risk:"hesitating when the first exchange does not confirm control"},
 dubois:{range:"heavy jab-pressure range",weapon:"hard jab, right hand and compact body-head follow-ups",defense:"tight guard and physical toughness through the center",entry:"steps behind a punishing jab until the opponent has to cover rather than move",exit:"keeps the stance underneath him for the next heavy shot",risk:"being turned before the second punch can leave the shoulder"},
 jones:{range:"reflex mid-range",weapon:"lead left hook, sudden right hand and impossible-angle flurries",defense:"reflex pulls, shoulder rolls and foot-speed exits",entry:"breaks the normal rhythm with a leap, feint or hand drop before punching first",exit:"slides out on athletic instinct before the textbook counter exists",risk:"depending on reactions that shrink when fatigue or age removes the cushion"},
 moore:{range:"old-master mid-range",weapon:"cross-arm traps, right hand counters and patient finishing shots",defense:"cross-arm guard, shoulder turns and trap-setting patience",entry:"lets the opponent touch the guard, then answers through the opening the touch created",exit:"rolls behind the cross-arm shape and stays available to counter",risk:"falling behind on activity while waiting for the perfect trap"},
 qawi:{range:"low, compact pocket range",weapon:"short hooks, overhand rights and grinding pressure beneath taller guards",defense:"crouched shell, head movement and inside leverage",entry:"ducks under long punches and arrives with the head already off the center line",exit:"stays under the opponent's chest until the reset becomes uncomfortable",risk:"being held at the end of reach before he can get low enough"},
 hopkins:{range:"cerebral mid-range and clinch range",weapon:"lead right, body jab, feints and mauling veteran counters",defense:"spoiling clinches, shoulder turns and pace denial",entry:"makes the opponent commit first, then turns the exchange into a rules-and-position argument",exit:"ties up, pivots or complains the opponent out of rhythm",risk:"giving away rounds if the opponent refuses to get dragged into his pace"},
 whitaker:{range:"slippery long-to-mid southpaw range",weapon:"southpaw jab, check hook, body touch and counter left",defense:"waist bends, slips, pivots and angle exits",entry:"shows the target, makes the opponent miss, then scores while they are reaching",exit:"slides out below the counter line or pivots off with a grin",risk:"letting judges undervalue defense when the punch count is close"},
 delahoya:{range:"sharp long-to-mid range",weapon:"fast jab, left hook and textbook combination bursts",defense:"upright guard, quick feet and reset discipline",entry:"establishes the jab first, then hides the left hook behind the same rhythm",exit:"finishes combinations with enough distance to avoid the return",risk:"fading late when the opponent keeps forcing second and third exchanges"},
 chavez:{range:"educated pressure range",weapon:"body jab, right hand downstairs and suffocating left-hook pressure",defense:"subtle slips, elbows tight and pressure footwork",entry:"touches the body to freeze the feet before stepping into the pocket",exit:"keeps nudging the opponent toward the ropes instead of fully leaving",risk:"needing time to break the opponent before the cards get away"},
 mosley:{range:"speed-power mid-range",weapon:"fast jab, whipping right hand and explosive body-head combinations",defense:"athletic slips, quick feet and clinch strength",entry:"jumps into range behind hand speed before the opponent can match the tempo",exit:"bursts out or ties up after the power sequence",risk:"loading up and allowing a cleaner technician to time the second attack"},
 pryor:{range:"high-chaos attacking range",weapon:"machine-gun combinations, looping right hands and relentless second efforts",defense:"activity, toughness and awkward rhythm changes",entry:"throws before the opponent has finished reading the last punch",exit:"does not concede the end of the exchange; he restarts it",risk:"wide attacks giving an elite counterpuncher clean lanes"},
 arguello:{range:"tall precision-puncher range",weapon:"straight right, left hook and surgical body shots",defense:"calm guard, long stance and patient distance judgment",entry:"walks the opponent onto straight punches rather than rushing the pocket",exit:"stays tall and balanced enough to punish the next step",risk:"being overwhelmed by pace before the precision can slow the fight"},
 pep:{range:"pure outside boxing range",weapon:"touch jab, angle changes and scoring flurries without lingering",defense:"constant footwork, shoulder turns and vanishing exits",entry:"steps in on a new angle just long enough to score",exit:"is already leaving before the opponent can square the target",risk:"low power letting stronger fighters keep chasing without fear"},
 sanchez:{range:"calm countering mid-range",weapon:"right hand counters, body shots and perfectly timed combinations",defense:"quiet head movement, balance and championship patience",entry:"lets aggression arrive, then answers after the opponent's weight commits",exit:"slides off just enough to keep the counter threat alive",risk:"starting too patiently against a mover who will not overcommit"},
 hamed:{range:"unorthodox long-to-mid ambush range",weapon:"spring-loaded left hand, corkscrew uppercut and awkward power counters",defense:"lean-backs, reflexes and unpredictable rhythm",entry:"breaks stance rules to make the punch arrive from the wrong picture",exit:"falls out of range on weird angles rather than textbook balance",risk:"losing structure when a disciplined opponent refuses the bait"},
 barrera:{range:"disciplined boxer-puncher range",weapon:"educated jab, left hook and layered body-head combinations",defense:"tight guard, measured counters and veteran composure",entry:"uses the jab to make the opponent declare before changing levels",exit:"finishes in position to answer the return",risk:"being dragged into pride exchanges when clean boxing is winning"},
 gonzalez:{range:"flowing close-to-mid combination range",weapon:"short combinations, body-head shifts and constant angle pressure",defense:"high guard, subtle pivots and punch-in-between timing",entry:"steps with the opponent so the exchange becomes continuous rather than separate",exit:"turns the corner and keeps punching from the new lane",risk:"larger opponents forcing him to reset before the combination engine starts"},
 donaire:{range:"patient counterpunching mid-range",weapon:"left hook, counter right and sudden veteran power shots",defense:"distance reads, guard catches and experience-based traps",entry:"waits for the opponent to cross the danger line before punching with them",exit:"resets behind the threat of the hook",risk:"giving away volume while hunting the single perfect counter"},
 ryangarcia:{range:"fast-trigger long-to-mid range",weapon:"left hook, quick straight right and sudden speed bursts",defense:"height, pullbacks and explosive resets more than layered guard craft",entry:"steps in behind speed before the opponent can settle the exchange",exit:"leans out or bounces back to reload the hook",risk:"defensive structure opening when the opponent survives the first speed layer"},
 haney:{range:"disciplined long range",weapon:"jab, check hook and clinch-reset scoring",defense:"high guard, distance discipline and low-risk exits",entry:"touches with the jab until the opponent reaches, then scores without trading",exit:"clinches, pivots or resets before a power exchange can form",risk:"low damage letting opponents keep rounds visually competitive"},
 lopez:{range:"explosive mid-range",weapon:"lead hook, counter right and athletic burst combinations",defense:"rhythm changes, shoulder turns and confidence-based counters",entry:"waits for the opponent to step into his timing window, then answers big",exit:"slides out with swagger when the rhythm is his",risk:"losing patience and following instead of setting traps"},
 plant:{range:"slick long-to-mid range",weapon:"jab, shoulder feints and quick counter combinations",defense:"Philly-shell looks, pivots and rhythm breaks",entry:"scores off feints before the opponent can pin his lead shoulder",exit:"rolls and turns out before pressure can become body contact",risk:"slowing late when body pressure forces repeated hard exits"},
 zhang:{range:"heavy southpaw long range",weapon:"pawing jab, straight left and clubbing counter hooks",defense:"size, hand fighting and measured guard catches",entry:"makes the opponent step into the left hand rather than chasing",exit:"resets slowly but with danger still loaded",risk:"pace and foot speed dropping if forced into long exchanges"},
 vergilortiz:{range:"punishing mid-range",weapon:"hard jab, right hand, body shots and heavy combination pressure",defense:"tight guard and responsible pressure posture",entry:"steps behind the jab until the opponent has to defend before moving",exit:"keeps the next punch loaded instead of admiring the last one",risk:"walking into counters when pressure outruns defensive responsibility"},
 fundora:{range:"unusual tall-inside range",weapon:"long uppercuts, volume hooks and body work from a skyscraper frame",defense:"height, activity and awkward punch angles more than clean exits",entry:"uses reach to touch first, then collapses into close-range volume",exit:"keeps punching from too close for his height",risk:"being caught clean because the tall target stays in the pocket"},
 matias:{range:"attrition pocket range",weapon:"thudding hooks, body punishment and pressure that compounds round by round",defense:"high guard, chin and willingness to trade for position",entry:"lets the opponent spend energy escaping before increasing the pace",exit:"walks the target down immediately after contact",risk:"taking clean early counters before the attrition bill comes due"},
 frankmartin:{range:"southpaw countering mid-range",weapon:"straight left, check hook and sharp counters off small slips",defense:"compact guard, southpaw angles and disciplined retreats",entry:"invites the lead hand before stepping into the counter lane",exit:"takes a short angle rather than backing straight out",risk:"being made to lead when the counter trigger never arrives"},
 pitbullcruz:{range:"compact pressure range",weapon:"overhand rights, hooks to the body and explosive rushes under the jab",defense:"low guard shell, head movement and physical strength",entry:"bursts under the long punch and makes the fight happen at chest level",exit:"stays close enough to make the reset uncomfortable",risk:"being outpointed at long range if the pressure cannot cut the ring"},
 navarrete:{range:"awkward long-volume range",weapon:"looping rights, uppercuts and off-beat volume from strange angles",defense:"awkward rhythm, length and punch variety rather than textbook structure",entry:"throws from positions that look wrong until the punch is already arriving",exit:"keeps the exchange messy instead of neatly resetting",risk:"wide openings against a precise counterpuncher"},
 foster:{range:"reactive long-to-mid range",weapon:"counter jab, check hook and late-round scoring bursts",defense:"shell defense, shoulder turns and patient reads",entry:"waits for the opponent to overcommit before taking the clean lane",exit:"rolls out just enough to make aggression look ineffective",risk:"banking too little activity before the late adjustment arrives"},
 estrada:{range:"educated mid-range",weapon:"jab, right hand, body counters and veteran combination craft",defense:"subtle guard work, pivots and tempo manipulation",entry:"draws the first move and answers to the body or over the top",exit:"finishes at an angle that keeps the next counter available",risk:"younger pace forcing him to trade longer than planned"},
 chocolatico:{range:"flowing close-to-mid combination range",weapon:"inside combinations, body-head layering and pressure angles",defense:"high guard, small steps and punching between opponent rhythms",entry:"walks opponents into exchanges where every block creates the next punch",exit:"turns the corner while still punching",risk:"size and age making the reset more expensive"}
};
function fighterIdentity(f){
 if(signatureStyles[f.id])return signatureStyles[f.id];
 const pressure=f.aggression>=94,boxer=f.footwork+f.defense>f.power+f.aggression,counter=f.iq+f.accuracy>188;
 return pressure
  ?{range:"sustained mid-to-close range",weapon:"jab-assisted combinations to head and body",defense:"high guard and forward-positioned forearms",entry:"cuts the exit before increasing volume",exit:"stays chest-to-chest to prevent a clean reset",risk:"walking onto counters when the feet outrun the guard"}
  :boxer
  ?{range:"long-to-mid range",weapon:"jab, straight rear hand and scoring combinations",defense:"footwork, distance and a disciplined guard",entry:"draws the first move before stepping into the open lane",exit:"leaves on an angle with the stance intact",risk:"being pinned before lateral space is established"}
  :counter
  ?{range:"countering mid-range",weapon:"intercepting straight shots and check hooks",defense:"parries, small pulls and catch counters",entry:"makes the first attack create the countering opportunity",exit:"resets just outside the return",risk:"losing initiative while waiting for a readable mistake"}
  :{range:"balanced mid-range",weapon:"a varied jab and power combinations",defense:"guard, head movement and measured feet",entry:"uses the jab to cross range behind cover",exit:"finishes in stance rather than overreaching",risk:"being forced into a specialist’s preferred rhythm"};
}
function styleArchetype(f){
 const id=f.id||"";
 if(["tyson","beterbiev","pitbullcruz","spence","zepeda","matias","porter","fundora","jesusramos","kabayel"].includes(id))return "pressure";
 if(["mayweather","whitaker","bivol","haney","stevenson","hitchins","andycruz","plant","catterall","frankmartin"].includes(id))return "defensive boxer";
 if(["davis","crawford","marquez","dannygarcia","foster","norman","thurman"].includes(id))return "counterpuncher";
 if(["hearns","ryangarcia","beterbiev","inoue","zhang","murtazaliev","vergilortiz","berlanga","norman"].includes(id))return "puncher";
 if(f.stance==="Switch")return "switch-hitter";
 if(f.aggression>94)return "pressure";
 if(f.defense+f.footwork>f.power+f.aggression+8)return "defensive boxer";
 if(f.iq+f.accuracy>188)return "counterpuncher";
 if(f.power>94)return "puncher";
 return "balanced boxer";
}
const styleResume={
 mayweather:{seen:[
  {style:"pressure",name:"Maidana and Castillo-type pressure",lesson:"he has film of being forced to solve rough entries, forearms and second efforts without giving up the pocket for free"},
  {style:"southpaw speed",name:"Judah and Pacquiao-type southpaw speed",lesson:"the résumé shows he can reduce quick left-hand entries by controlling distance and resetting the exchange"},
  {style:"puncher",name:"Canelo and Mosley-type punchers",lesson:"he has survived and then organized against heavier single-shot danger"}
 ]},
 pacquiao:{seen:[
  {style:"defensive boxer",name:"Mayweather and Marquez-type counter structure",lesson:"his history includes nights where elite timing punished straight-line re-entries"},
  {style:"puncher",name:"Cotto and Hatton-type physical threats",lesson:"he has also overwhelmed strong fighters when his feet created angles before they could set"}
 ]},
 spence:{seen:[
  {style:"switch-hitter",name:"Crawford",lesson:"the Crawford fight is the warning label: elite stance changes can make the pressure arrive one beat late"},
  {style:"pressure",name:"Porter and Ugas-type physical fights",lesson:"he has banked rounds through body pressure when the opponent accepts sustained mid-range"}
 ]},
 ennis:{seen:[
  {style:"pressure",name:"pressure-first welterweights",lesson:"the app credits him with experience against forward motion, but not many opponents combine that with elite timing"},
  {style:"puncher",name:"big welterweight punchers",lesson:"his athletic margin has usually let him see the shot early and answer before the second punch"}
 ],unseen:["elite switch-hitter","all-time defensive boxer"]},
 norman:{seen:[
  {style:"pressure",name:"front-foot exchanges",lesson:"he has shown comfort punishing entries when opponents give him a committed first step"},
  {style:"boxer",name:"jab-and-move looks",lesson:"the open question is whether he can force a technician to lead rather than simply wait for mistakes"}
 ],unseen:["elite switch-hitter","high-volume southpaw pressure"]},
 crawford:{seen:[
  {style:"pressure",name:"Spence and Porter",lesson:"he has already solved pressure by turning the opponent’s forward momentum into countering lanes"},
  {style:"puncher",name:"Kavaliauskas and Brook-type threats",lesson:"he has shown he can gather data early, then punish the same entry later"}
 ]},
 canelo:{seen:[
  {style:"defensive boxer",name:"Mayweather, Lara and Bivol-type movement",lesson:"his résumé contains the exact lesson that clean boxing at range can tax his feet and clock"},
  {style:"pressure",name:"Golovkin-type pressure",lesson:"he has proven he can hold position under heavy return fire"}
 ]},
 lomachenko:{seen:[
  {style:"defensive boxer",name:"Haney and Rigondeaux-type technical layers",lesson:"he has deep experience reading educated guards, even when size and early-round pace complicate the download"},
  {style:"pressure",name:"Salido-type rough pressure",lesson:"his history also shows how physical disruption can delay the angle game"}
 ]},
 haney:{seen:[
  {style:"pressure",name:"Kambosos and Prograis-type pressure",lesson:"he has won minutes by keeping pressure from becoming clean contact"},
  {style:"southpaw angle boxer",name:"Lomachenko",lesson:"the Loma fight remains the reference point for how he handles elite southpaw layers under late-round stress"}
 ]},
 davis:{seen:[
  {style:"defensive boxer",name:"Cruz, Barrios and Garcia-type looks at different ranges",lesson:"his résumé shows patience when early rounds are quiet, trusting the read to turn into a power event"},
  {style:"pressure",name:"Pitbull Cruz-type pressure",lesson:"he has handled physical entries but can concede minutes while waiting on the counter trigger"}
 ]},
 hearns:{seen:[
  {style:"pressure",name:"Hagler and Barkley-type danger",lesson:"his history shows both the terror of his range and the risk when pressure gets beneath it"},
  {style:"boxer",name:"Leonard-type elite speed",lesson:"he has been in fights where another great athlete could survive the jab long enough to ask later-round questions"}
 ]},
 leonard:{seen:[
  {style:"puncher",name:"Hearns",lesson:"he has solved extreme length and power by changing pace and turning the fight into a late-round stamina argument"},
  {style:"pressure",name:"Duran",lesson:"his résumé contains both the cost of accepting infighting and the adjustment when he refuses it"}
 ]}
};
function styleCase(fighter,opponent){
 const archetype=styleArchetype(opponent),resume=styleResume[fighter.id],opposite=styleArchetype(fighter);
 const seen=resume?.seen?.find(item=>archetype.includes(item.style)||item.style.includes(archetype)||item.style===opponent.stance?.toLowerCase()||item.style.includes(opponent.stance?.toLowerCase()));
 if(seen)return `${fighter.last}'s résumé gives the corner a real comparison point: ${seen.name}. That does not make ${opponent.last} the same fighter, but it means the first hypothesis is evidence-based—${seen.lesson}.`;
 const unseen=resume?.unseen?.find(item=>archetype.includes(item)||item.includes(archetype));
 if(unseen)return `${fighter.last}'s résumé has fewer clean reference points for this exact problem: ${opponent.last} presents an ${unseen} look, so the corner has to learn live rather than simply reuse an old answer.`;
 return `${fighter.last}'s past opposition gives only partial clues against this ${archetype} look. The app treats the comparison as a scouting question, not a guarantee: ${opponent.last}'s version of the style has to be solved on its own terms, while ${fighter.last}'s own ${opposite} habits shape which answers are most natural.`;
}
const narrationOpeners=[
 "Film-room note:",
 "On the tape:",
 "Broadcast read:",
 "Slow-motion tell:",
 "Coach's eye:",
 "Ringside read:",
 "Technical note:",
 "Between the exchanges:"
];
const narrationSwaps=[
 ["The first minute",["The first sixty seconds","The opening stretch","The first passage","The early minute","The opening phase"]],
 ["The opening minute",["The opening stretch","The first passage","That first minute","The early read","The initial phase"]],
 ["The middle minute",["The second minute","The middle stretch","The central passage","The minute between reads","The heart of the round"]],
 ["The final minute",["The last minute","The closing stretch","The final passage","The last sustained exchange window","The end-of-round phase"]],
 ["The last minute",["The closing minute","The final passage","The last sustained exchange window","The end-of-round phase","The bell-side stretch"]],
 ["The round opens",["The round starts","The round begins","The bell opens the round","The next three minutes begin","The frame opens"]],
 ["The round begins",["The bell opens the round","The next three minutes begin","The frame starts","The round starts","The first exchange window opens"]],
 ["The fight has a ledger now",["The accumulated card is part of the fight now","The score has started shaping the behavior","The earlier rounds are now part of the tactical math","The working card is now influencing choices","The fight history inside the fight is starting to matter"]],
 ["The card is not forcing a reckless swing yet",["The score is not demanding panic yet","The math has not forced a gamble yet","The card still allows disciplined choices","The scoreline has not made desperation mandatory yet","The corner can still choose method over panic"]],
 ["The physical cost is still close enough",["The wear-and-tear is still close enough","The body language is still close enough","The fatigue bill is still balanced enough","The physical ledger is still narrow enough","The visible damage is still close enough"]],
 ["This round’s first positional argument",["The first tactical argument of the round","The round's first spatial dispute","The first meaningful positional question","The first piece of ring geography","The opening chess move"]],
 ["wants",["is hunting for","is trying to live in","is trying to build toward","is steering the fight toward","is looking to establish"]],
 ["is trying to establish",["is trying to claim","is trying to drag the fight toward","is looking for","is trying to organize around","is trying to make room for"]],
 ["built around",["organized around","built on","structured around","anchored by","powered by"]],
 ["bring the",["bring","unlock the","make the","get the","turn the"]],
 ["The judges are seeing",["The judges are being shown","The ringside optics favor","The scoring picture shows","The visual evidence favors","The card is being fed"]],
 ["does not need",["doesn't need","has no use for","cannot spend time on","is past the point of needing","doesn't get"]],
 ["the scorecards",["the official cards","the judges' totals","the three cards","the final arithmetic","the official verdict"]],
 ["cleaner",["sharper","more judgeable","cleaner-looking","better organized","more authoritative"]],
 ["reset",["rebuild","reorganize","start over","repair the stance","re-form the base"]],
 ["exit",["escape route","way out","angle out","departure lane","route off the exchange"]]
];
function freshenReport(report,salt,roundNumber){
 if(!salt)return report;
 return report.map((paragraph,section)=>{
  let out=paragraph;
  for(const [needle,choices] of narrationSwaps){
   const choice=choices[(hash(`${salt}:${roundNumber}:${section}:${needle}`))%choices.length];
   out=out.split(needle).join(choice);
  }
  const opener=narrationOpeners[(hash(`${salt}:opener:${roundNumber}:${section}`))%narrationOpeners.length];
  return section===4&&/corner read/i.test(out)?out:out.startsWith("Final corner read:")?out:`${opener} ${out}`;
 });
}
function spread(total,weights){
  const sum=weights.reduce((n,x)=>n+x,0),raw=weights.map(x=>total*x/sum),out=raw.map(Math.floor);
  let left=total-out.reduce((n,x)=>n+x,0);
  raw.map((x,i)=>({i,f:x-Math.floor(x)})).sort((a,b)=>b.f-a.f).slice(0,left).forEach(x=>out[x.i]++);
  return out;
}
function buildHistoricalFight(a,b,settings,record){
  const aWon=record.winner===a.id,bWon=record.winner===b.id,isDraw=!record.winner;
  const roundsCount=record.endedRound||record.rounds||settings.rounds;
  const estimatedA={landed:Math.round(roundsCount*(a.accuracy*.11+4)),thrown:Math.round(roundsCount*(a.aggression*.22+23)),powerLanded:Math.round(roundsCount*(a.power*.055+2.5)),knockdowns:0};
  const estimatedB={landed:Math.round(roundsCount*(b.accuracy*.11+4)),thrown:Math.round(roundsCount*(b.aggression*.22+23)),powerLanded:Math.round(roundsCount*(b.power*.055+2.5)),knockdowns:0};
  const aStats=record.stats?.[a.id]||estimatedA,bStats=record.stats?.[b.id]||estimatedB;
  const isStoppage=/\b(KO|TKO|RTD|DQ|TECHNICAL KNOCKOUT|KNOCKOUT|RETIRE)/.test(record.method);
  if(isStoppage){if(aWon)bStats.knockdowns=Math.max(1,bStats.knockdowns||0);if(bWon)aStats.knockdowns=Math.max(1,aStats.knockdowns||0)}
  const scorecardRows=Array.isArray(record.scorecards)?record.scorecards:[];
  const officialCards=scorecardRows.length?scorecardRows.map((card,i)=>{
    const total=card.total||card;
    return {name:card.name||`JUDGE ${i+1}`,total:record.red===a.id?total:[total[1],total[0]],
      rounds:card.rounds?.map(scores=>record.red===a.id?scores:[scores[1],scores[0]])||null};
  }):null;
  const patternsA=[12,13,14,12,15,11,16,13,15,14,14,16];
  const patternsB=[7,6,7,5,6,8,5,6,4,6,5,7];
  const weightsA=Array.from({length:roundsCount},(_,i)=>patternsA[i%patternsA.length]);
  const weightsB=Array.from({length:roundsCount},(_,i)=>patternsB[i%patternsB.length]);
  const landedA=spread(aStats.landed,weightsA),landedB=spread(bStats.landed,weightsB);
  const thrownA=spread(aStats.thrown,weightsA.map(x=>x+17)),thrownB=spread(bStats.thrown,weightsB.map(x=>x+31));
  const powerA=spread(aStats.powerLanded,weightsA),powerB=spread(bStats.powerLanded,weightsB);
  const winner=aWon?a:bWon?b:null,loser=aWon?b:a;
  const loserRound=6;
  const tacticalHeadlines=["THE LEAD-HAND ARGUMENT","PRESSURE MEETS THE COUNTER","THE ENTRY GETS PUNISHED","CENTER RING CHANGES HANDS","WINNING PUNCH POSITION","BREAKING THE COMBINATION","ANGLES AFTER CONTACT","THE FEINT LAYER DEEPENS","BODY WORK CHANGES THE BASE","CONTROL BETWEEN EXCHANGES","THE PACE COLLECTS ITS DEBT","THE FINAL ADJUSTMENT"];
  const technicalReconstruction=(number,roundLeader,roundTrailer)=>{
    if(record.roundNarrative?.[number-1])return record.roundNarrative[number-1];
    const lenses=[
      [`${roundLeader.last} treats the opening round as reconnaissance, using noncommittal jabs and foot feints to catalogue which guard movement ${roundTrailer.last} gives away first.`,`${roundTrailer.last} is still responding to the visible punch rather than the threat underneath it, so the defensive pattern is already becoming readable.`],
      [`The lead-hand fight becomes physical: ${roundLeader.last} pins, brushes and posts on ${roundTrailer.last}'s glove before punching around the occupied arm.`,`${roundTrailer.last} needs to withdraw the hand on an angle or counter the touch itself; simply pulling it straight back preserves the lane for the rear hand.`],
      [`${roundLeader.last} changes cadence—single shot, empty beat, then a two-punch return—so ${roundTrailer.last} cannot synchronize the guard to one tempo.`,`${roundTrailer.last}'s counter is arriving after the first beat, exactly when ${roundLeader.last} has delayed the real attack.`],
      [`A half-step changes the geography. ${roundLeader.last} makes the lead fall short without abandoning countering range, then takes center as ${roundTrailer.last} recovers the front foot.`,`${roundTrailer.last} is losing position after missing because the rear foot follows too late, leaving the stance stretched and the exit predictable.`],
      [`${roundTrailer.last} is advancing, but ${roundLeader.last} is deciding where the exchange actually occurs by meeting the entry and turning before the second wave.`, `That is the difference between pressure and effective pressure: territory has scoring value only when it produces clean contact or forces a damaging defensive reaction.`],
      [`The body attack is now part of the head-shot setup. ${roundLeader.last} shows the same shoulder and eye line, touches below the elbows, then returns upstairs once ${roundTrailer.last}'s frame contracts.`,`${roundTrailer.last} is defending targets separately instead of reading the shared setup, allowing one look to create two different scoring lanes.`],
      [`${roundLeader.last} finishes the combination with an exit built into the final punch, pivoting as the hook or rear hand brings the feet back underneath the hips.`,`${roundTrailer.last} turns after the target rather than cutting off the destination, so the attempted return follows ${roundLeader.last} instead of intercepting the escape.`],
      [`Inside, ${roundLeader.last} uses shoulder position and a forearm frame to deny ${roundTrailer.last} punching room without wasting motion in a prolonged clinch.`,`${roundTrailer.last} enters chest-first but fails to win head position, which means the arms are working while the upper body remains mechanically smothered.`],
      [`Fatigue is changing technique before it changes output. ${roundLeader.last} notices ${roundTrailer.last}'s feet taking an extra beat to recover and attacks that recovery rather than the initial guard.`,`${roundTrailer.last} may still throw, but the stance is no longer ready to defend the moment the combination ends.`],
      [`The earlier feints have become a trap sequence. ${roundLeader.last} repeats the familiar first action specifically to summon ${roundTrailer.last}'s familiar answer, then counters the answer.`,`${roundTrailer.last} is not being beaten by a new punch; the earlier rounds taught a response that is now being exploited.`],
      [`The corner adjustment is visible in ${roundLeader.last}'s first step: less retreat, more lateral occupation of the space ${roundTrailer.last} needs for the follow-up.`,`${roundTrailer.last} can start exchanges but cannot sustain them because the second punching position has already been taken away.`],
      [`${roundLeader.last} closes with disciplined risk management—scoring first, refusing unnecessary third exchanges, and making ${roundTrailer.last} restart from outside.`,`${roundTrailer.last} needs urgency without recklessness, but chasing the head in straight lines only gives ${roundLeader.last} cleaner counters and safer exits.`]
    ];
    const lens=lenses[(number-1)%lenses.length];
    return [lens[0],lens[1],`${roundLeader.last} takes the round because the work is not only cleaner but structurally repeatable: balance is preserved after contact, and ${roundTrailer.last}'s return is anticipated rather than survived.`];
  };
  const historicalReport=(number,roundLeader,roundTrailer,lines)=>{
    const deepDives=[
      `Freeze the action before either fighter lands. The useful information is in the first defensive twitch: which glove moves, whether the weight shifts to the rear hip, and which exit the lead foot prepares. ${roundLeader.last} is collecting those reactions without paying the price of a fully committed attack, turning the opening round into a map for later counters.`,
      `Watch the hand fight at half speed. ${roundLeader.last} is not jabbing into empty space; the lead hand touches or displaces ${roundTrailer.last}'s glove, briefly taking one defender out of the structure. The scoring punch follows while the arm is occupied, which is why the opening appears larger than it would against a settled guard.`,
      `The controlling variable is rhythm. ${roundLeader.last} gives ${roundTrailer.last} one timing picture, pauses just beyond the expected return, then resumes on a different beat. A defender can be technically sound and still be late if the trigger is synchronized to the wrong cadence.`,
      `Foot position explains the apparent speed difference. ${roundLeader.last}'s half-step is small enough to preserve the stance and large enough to make the first punch miss; ${roundTrailer.last} must then pull the front foot back under the body before punching again. The counter lands during that repair, not because the hands are dramatically faster.`,
      `This round separates ring occupation from ring generalship. ${roundTrailer.last} may cross more canvas, but ${roundLeader.last} chooses the collision point, lands while balanced and leaves before the second attack develops. Effective pressure must narrow choices; pressure that repeatedly resets at the edge is activity without control.`,
      `The body work is tactical investment rather than simple attrition. By showing the same upper-body cue to two levels, ${roundLeader.last} makes ${roundTrailer.last}'s elbows and eyes choose. The head shot becomes available because the body threat changed the guard, while the body shot becomes safer because the head threat froze the feet.`,
      `Study the final punch of each exchange rather than the first. ${roundLeader.last}'s last shot carries the body toward the exit angle, so offense and defense happen in one motion. ${roundTrailer.last}'s combination ends square, forcing a separate defensive movement and creating a beat in which the return can land.`,
      `At close range, leverage replaces speed. ${roundLeader.last} wins forehead and shoulder position, frames across the upper arm and keeps enough hip room for the short shot. ${roundTrailer.last}'s arms are free in theory but mechanically crowded; without recovering inside position, added volume only produces smothered punches.`,
      `The fatigue signal is in stance recovery, not facial expression. ${roundTrailer.last}'s rear foot lingers after the attack and the hands return before the hips are organized. ${roundLeader.last} attacks precisely then, converting accumulated effort into a growing timing advantage without needing a dramatic drop in punch count.`,
      `This is now a conditioned-response trap. The first action has appeared often enough that ${roundTrailer.last} responds automatically, and ${roundLeader.last} is no longer trying to land that first action at all. Its purpose is to manufacture the parry, slip or weight shift that opens the real target.`,
      `The adjustment from the corner is spatial. ${roundLeader.last} is taking away the place where ${roundTrailer.last} expects to throw punch two, forcing the combination to end after punch one. That reduces incoming volume without relying solely on reflexes and lets ${roundLeader.last} counter a shorter, more predictable sequence.`,
      `Championship-round craft is visible in the risk ledger. ${roundLeader.last} knows which exchanges are necessary to bank the round and which merely offer ${roundTrailer.last} a chance to reverse momentum. Scoring, exiting and forcing a fresh entry is not passivity here; it is control of the remaining opportunities.`
    ];
    const solutions=[
      `${roundTrailer.last}'s next task is to hide information: feint without completing the attack, vary the exit and stop giving the same defensive answer to the same lead-hand picture.`,
      `${roundTrailer.last} must contest the touch itself—circle the glove, jab the chest or punch over the post—before trying to solve the rear hand that follows it.`,
      `${roundTrailer.last} needs to break cadence deliberately, either countering the pause or refusing the first trigger so ${roundLeader.last} cannot schedule the second attack.`,
      `${roundTrailer.last} should shorten the first step and bring the rear foot sooner; compact feet preserve the ability to counter the counter instead of reaching after it.`,
      `${roundTrailer.last} has to cut the exit before increasing volume. The correct step is toward the destination, not toward ${roundLeader.last}'s current position.`,
      `${roundTrailer.last} should answer the level change with the feet and forearms together, keeping the elbows available without folding the whole posture over the body threat.`,
      `${roundTrailer.last} needs an exit built into the combination—a pivot after the rear hand or a hook that turns the hips—so the exchange does not end square in front of the return.`,
      `${roundTrailer.last} must win head position on entry and clear the frame before punching; otherwise inside activity will continue to look busy while landing with little leverage.`,
      `${roundTrailer.last} should reduce the combination length and prioritize stance recovery. Two balanced punches now carry more tactical value than four that leave the feet disconnected.`,
      `${roundTrailer.last} must deliberately give a different response to the familiar feint, even if that means conceding the first target, to stop the automated trap from reaching its second layer.`,
      `${roundTrailer.last} needs to preserve the second punching position by stepping laterally with the first shot rather than following behind it on a single track.`,
      `${roundTrailer.last} needs controlled urgency: attack the body to slow the exit, step across the escape lane and avoid gambling the entire round on one naked rush.`
    ];
    return [
      `${lines.join(" ")} The important distinction is between occupying space and controlling it: ${roundLeader.last} is arranging the feet and lead hand so the meaningful exchange begins on favorable terms, while ${roundTrailer.last} is too often reacting after the lane has already opened.`,
      deepDives[(number-1)%deepDives.length],
      `The round belongs to ${roundLeader.last} on effective punching and ring generalship. ${solutions[(number-1)%solutions.length]}`
    ];
  };
  const rounds=Array.from({length:roundsCount},(_,i)=>{
    const number=i+1,officialRound=officialCards?.[0]?.rounds?.[i],awins=officialRound?officialRound[0]>officialRound[1]:isDraw?number%2===1:aWon?number!==loserRound:number===loserRound;
    const finalStoppage=isStoppage&&number===roundsCount;
    const events=(record.events||[]).filter(event=>event.round===number);
    const knockdown=events.find(event=>event.type==="knockdown");
    const deduction=events.find(event=>event.type==="deduction");
    const knockA=knockdown?.fighter===a.id,knockB=knockdown?.fighter===b.id;
    const roundLeader=awins?a:b,roundTrailer=roundLeader===a?b:a;
    const lines=technicalReconstruction(number,roundLeader,roundTrailer);
    if(knockdown){
      const down=knockdown.fighter===a.id?a:b,puncher=knockdown.by===a.id?a:b;
      lines.unshift(`${puncher.last} scores the official knockdown, dropping ${down.last} in round ${number}.`);
    }
    if(deduction){
      const penalized=deduction.fighter===a.id?a:b;
      lines.unshift(`Referee deducts one point from ${penalized.last} for ${deduction.reason}. The deduction is reflected on every official card.`);
    }
    if(finalStoppage)lines.unshift(`${winner.last} forces the official ending in round ${number}.`);
    const report=historicalReport(number,roundLeader,roundTrailer,lines);
    return {number,thrownA:thrownA[i],thrownB:thrownB[i],landedA:landedA[i],landedB:landedB[i],
      powerA:powerA[i],powerB:powerB[i],scoreA:officialRound?.[0]??(awins?10:9),scoreB:officialRound?.[1]??(awins?9:10),
      knockA:knockA||(finalStoppage&&bWon),knockB:knockB||(finalStoppage&&aWon),deduction,
      damageA:aWon?number*.08:number*.26,damageB:aWon?number*.26:number*.08,
      staminaA:100-number*2.1,staminaB:100-number*2.6,lines,report,
      headline:finalStoppage?`${winner.last.toUpperCase()} ENDS IT`:knockdown?`DOWN GOES ${(knockdown.fighter===a.id?a:b).last.toUpperCase()}`:deduction?`POINT DEDUCTED FROM ${(deduction.fighter===a.id?a:b).last.toUpperCase()}`:tacticalHeadlines[i%tacticalHeadlines.length],
      stoppage:finalStoppage?{winner:aWon?"a":"b",type:record.method}:null};
  });
  const scoreTotal=(wins,losses)=>wins*10+losses*9;
  const aRoundWins=rounds.filter(r=>r.scoreA>r.scoreB).length,bRoundWins=rounds.length-aRoundWins;
  const generatedCards=Array.from({length:3},(_,i)=>({name:`JUDGE ${i+1}`,a:scoreTotal(aRoundWins,bRoundWins),b:scoreTotal(bRoundWins,aRoundWins)}));
  return {
    a,b,settings:{...settings,rounds:roundsCount},rounds,seed:`historical:${record.id}`,
    historical:true,officialStats:!!record.stats,officialScorecards:!!officialCards,historyQuality:global.BOXING_FIGHT_HISTORY?.dataQuality?.(record)||"verified_outcome",event:record,sources:record.sources,
    judges:officialCards?officialCards.map(card=>({name:card.name,a:card.total[0],b:card.total[1]})):generatedCards,
    winner:aWon?"a":bWon?"b":"draw",decision:record.method,
    totals:{thrownA:aStats.thrown,thrownB:bStats.thrown,landedA:aStats.landed,landedB:bStats.landed,
      powerA:aStats.powerLanded,powerB:bStats.powerLanded,
      kdA:record.events?.filter(e=>e.type==="knockdown"&&e.fighter===a.id).length||aStats.knockdowns||0,
      kdB:record.events?.filter(e=>e.type==="knockdown"&&e.fighter===b.id).length||bStats.knockdowns||0}
  };
}
function buildFight(a,b,settings){
  settings=normalizedSettings(settings);
  const historical=global.BOXING_FIGHT_HISTORY?.find(a,b);
  if(historical)return buildHistoricalFight(a,b,settings,historical);
  const seed=hash(`${a.id}${a.year}${b.id}${b.year}${settings.rounds}${settings.ring}${settings.weight}${settings.venue}${settings.championship}${settings.neutral}${settings.ruleset}${settings.environment}${settings.weighin}${settings.equipment}`);
  const narrationSalt=settings.narrationSalt?hash(`${settings.narrationSalt}:${a.id}:${b.id}:${settings.rounds}`):0;
  const rnd=seeded(seed), rounds=[]; let staminaA=100,staminaB=100,damageA=0,damageB=0,kdA=0,kdB=0,ended=false;
  const era=eraProfile(settings);
  const targetWeight=contractLimit(settings.weight);
  const weightPlanA=weightPlan(a,targetWeight),weightPlanB=weightPlan(b,targetWeight),calcA=adjustedFighter(a,weightPlanA,era),calcB=adjustedFighter(b,weightPlanB,era);
  const weightSetting=settings.weight==="Heavyweight"
    ?`Heavyweight is an open division: ${a.last} keeps the selected-version ${Math.round(weightPlanA.natural)} lb fighting weight and ${b.last} keeps ${Math.round(weightPlanB.natural)} lb.`
    :targetWeight?`${settings.weight} contract: ${a.last} fights as a ${Math.round(weightPlanA.effective)} lb effective frame and ${b.last} as ${Math.round(weightPlanB.effective)} lb.`
    :`Open weight preserves each fighter's natural fighting mass: ${a.last} ${Math.round(weightPlanA.natural)} lb, ${b.last} ${Math.round(weightPlanB.natural)} lb.`;
  const eraSetting=settings.ruleset==="modern"&&settings.environment==="indoor"&&settings.weighin==="next-day"&&settings.equipment==="modern"
    ?"Modern conditions: strict referee breaks, modern padding, reliable footwear and controlled climate keep the fight closer to clean boxing."
    :`${era.label}: ${settings.rounds>12?`${settings.rounds} scheduled rounds change the stamina math; long-form fighters can separate late while explosive styles pay a bigger debt. `:""}${settings.environment==="outdoor-heat"?"Outdoor heat makes recovery, breathing and late footwork more expensive. ":settings.environment==="outdoor"?"Outdoor conditions make footing and rhythm less sterile than a modern arena. ":""}${settings.weighin==="same-day"?"Same-day weigh-ins make hard cuts more dangerous because there is less time to refill the body. ":""}${settings.equipment==="vintage"?"Vintage gloves and lower-traction shoes increase damage while making clean exits harder. ":settings.equipment==="minimal"?"Minimal padding and poor traction raise damage, hand-risk and balance problems. ":""}${settings.ruleset!=="modern"?"Rougher officiating means clinch craft, forearms, head position, shoulder bumps and body control are less likely to be broken immediately. ":""}`.trim();
  const settingEffects=[
    weightSetting,
    Number(settings.ring)>=23?"Large ring rewards footwork, resets and long-range boxing.":Number(settings.ring)<=18?"Small ring rewards pressure, body work and clinch strength.":"Standard ring gives neither style a strong geography bonus.",
    settings.championship?"Championship rules increase late-round stamina tax and punish fragile exits after round eight.":"Non-title pacing slightly reduces late-round risk and lets fighters conserve more energy.",
    settings.neutral?"Neutral officials keep close-round scoring centered.":"Non-neutral officials can shade close cards toward the red corner.",
    eraSetting
  ];
  const weightA=weightPlanA.effective,weightB=weightPlanB.effective;
  const maxRoundsA=maxRoundExperience(a),maxRoundsB=maxRoundExperience(b);
  const massRatio=weightA/weightB,sizeGap=Math.abs(Math.log(massRatio));
  const powerMassA=clamp(Math.pow(massRatio,.62),.48,2),powerMassB=clamp(Math.pow(1/massRatio,.62),.48,2);
  const resistanceA=clamp(Math.pow(massRatio,.38),.65,1.45),resistanceB=clamp(Math.pow(1/massRatio,.38),.65,1.45);
  const sizeMismatch=sizeGap>.18,big=weightA>=weightB?a:b,small=big===a?b:a;
  const identityA=fighterIdentity(a),identityB=fighterIdentity(b);
  const extremeMismatch=Math.max(massRatio,1/massRatio)>1.8;
  const mismatchStopRound=extremeMismatch?Math.min(settings.rounds,5+(seed%4)):null;
  const pace=20-settings.ring;
  const roundStance=(fighter,opponent,round)=>{
    if(fighter.stance!=="Switch")return fighter.stance;
    const preferred=opponent.stance==="Southpaw"?"Orthodox":"Southpaw";
    return round%3===0?(preferred==="Southpaw"?"Orthodox":"Southpaw"):preferred;
  };
  const pressureA=calcA.aggression>92&&calcA.aggression>calcB.aggression,pressureB=calcB.aggression>92&&calcB.aggression>calcA.aggression;
  const moverA=calcA.footwork>93&&calcA.footwork>calcA.aggression,moverB=calcB.footwork>93&&calcB.footwork>calcB.aggression;
  const counterA=(calcA.iq+calcA.defense+calcA.accuracy)/3, counterB=(calcB.iq+calcB.defense+calcB.accuracy)/3;
  const styleCaseA=styleCase(a,b),styleCaseB=styleCase(b,a);
  const researchDesk=settings.researchDesk||null;
  const researchFrame=researchDesk?.styleClash?.summary?`Research Desk frame: ${researchDesk.styleClash.summary}`:"";
  const researchQuestion=researchDesk?.scoutingQuestions?.[0]?`The desk question is blunt: ${researchDesk.scoutingQuestions[0]}`:"";
  const gem=(f,tag)=>f.gems?.tags?.includes(tag)?1:0;
  const cbA=a.compubox||{},cbB=b.compubox||{};
  const pct=n=>Number.isFinite(Number(n))?Number(n)/100:null;
  const filmA=gem(a,"Counterpunching")*1.1+gem(a,"Footwork & Angles")*.8+gem(a,"Range Control")*.7+gem(a,"Pressure Craft")*.6;
  const filmB=gem(b,"Counterpunching")*1.1+gem(b,"Footwork & Angles")*.8+gem(b,"Range Control")*.7+gem(b,"Pressure Craft")*.6;
  const ringA=(pressureA?pace*.7:0)+(moverA?-pace*.65:0),ringB=(pressureB?pace*.7:0)+(moverB?-pace*.65:0);
  const injuryProfileA=injuryProfile(a),injuryProfileB=injuryProfile(b);
  const baseStoppingPowerA=stoppingPowerProfile(a),baseStoppingPowerB=stoppingPowerProfile(b);
  const injuryStateA={hand:0,cut:0,events:[]},injuryStateB={hand:0,cut:0,events:[]};
  const roundEvolutions=[
   {title:"THE SCOUTING ROUND",opening:"The first sixty seconds are genuine reconnaissance: neither corner yet knows which feint will produce a reliable reaction.",middle:"The first usable clue is tested with a different finish: same invitation, new target, and a check on whether the defender's second reaction matches the first."},
   {title:"THE FIRST ANSWER",opening:"The round begins with both corners testing the evidence from round one rather than starting over.",middle:"The key question is whether last round’s successful action survives once the opponent is waiting for it; the first counter-adjustment now appears."},
   {title:"FALSE INFORMATION",opening:"By round three, the lead hands are carrying false information: familiar touches are being used to hide a different second punch.",middle:"The fighter losing the entry battle begins shortening the approach, while the leader starts countering the shorter route instead of the original long one."},
   {title:"THE EXIT BATTLE",opening:"The fourth opens with a territorial correction—less free retreat, more deliberate occupation of center ring.",middle:"What began as a range contest becomes an exit contest: the exchange is decided by who owns the position after punch two."},
   {title:"THE BODY INVESTMENT",opening:"Both fighters now know the preferred first attack, so the opening minute is about disguising when it will arrive.",middle:"The adjustment moves downstairs; body threats are used to slow the feet and make the established head-shot defense betray a new target."},
   {title:"THE ENERGY AUDIT",opening:"At the halfway point, the corners are comparing cost as much as success: which winning action consumes too much energy to repeat?",middle:"Combination length changes. The fresher fighter adds a third beat, while the more taxed fighter tries to make two balanced punches do the work of four."},
   {title:"THE RECOVERY WINDOW",opening:"Round seven begins with accumulated damage affecting posture: guards return a little narrower and exits require an extra recovery step.",middle:"The leader attacks the recovery rather than the initial defense, while the trailer tries to counter earlier before fatigue can expose the reset."},
   {title:"THE RHYTHM BREAK",opening:"The eighth starts with a deliberate rhythm break; the familiar opening cadence is withheld to make the opponent lead without a trusted trigger.",middle:"Inside exchanges become more important because the legs are no longer erasing distance as cheaply as they did in the first quarter."},
   {title:"SCORE PRESSURE ARRIVES",opening:"In round nine, score pressure begins changing risk tolerance. Safe reads are no longer equally valuable to both corners.",middle:"The trailing fighter extends exchanges and accepts countering risk; the leader narrows the attack to the highest-percentage lanes and protects the exit."},
   {title:"TECHNICAL DEBT",opening:"The tenth opens with the fighters working from compressed versions of their original styles—fewer decorative feints, faster commitment to the proven route.",middle:"Small technical debts are now visible: a rear foot that recovers late, an elbow that stays open after the body shot, a pivot that has become a straight retreat."},
   {title:"THE CARD ARGUMENT",opening:"Round eleven is fought against the unofficial score as much as the opponent. The likely leader values denial; the likely trailer needs unmistakable moments.",middle:"The tactical battle shifts from finding openings to forcing exchanges the other fighter would prefer not to have."},
   {title:"THE LAST QUESTION",opening:"The final round begins without the luxury of future adjustments. Every feint must either create a scoring action or protect against the opponent’s last surge.",middle:"The middle minute becomes a negotiation between urgency and discipline: chase too hard and the counter ends the rally; protect too much and the cards are surrendered."}
  ];
  for(let r=1;r<=settings.rounds&&!ended;r++){
	    const fatigue=r/settings.rounds;
	    const deepWaterA=r>maxRoundsA?clamp((r-maxRoundsA)/Math.max(1,settings.rounds-maxRoundsA),.15,1):0;
	    const deepWaterB=r>maxRoundsB?clamp((r-maxRoundsB)/Math.max(1,settings.rounds-maxRoundsB),.15,1):0;
	    const handDragA=injuryStateA.hand*.075,handDragB=injuryStateB.hand*.075;
	    const cutDragA=injuryStateA.cut*.045,cutDragB=injuryStateB.cut*.045;
	    const activeStanceA=roundStance(a,b,r),activeStanceB=roundStance(b,a,r);
    const openStance=(activeStanceA==="Southpaw")!==(activeStanceB==="Southpaw");
    const stanceMatchup=openStance?"Open stance":"Closed stance";
    const stanceA=openStance?(calcA.footwork+calcA.iq-calcB.footwork-calcB.iq)*.07:0,stanceB=-stanceA;
    const counterEdgeA=(counterA-counterB)*.08+(calcB.aggression-calcA.aggression)*.025,counterEdgeB=-counterEdgeA;
    const roughA=(calcA.aggression*.35+calcA.chin*.2+weightA*.08+calcA.power*.15-calcB.defense*.2)*era.roughness;
    const roughB=(calcB.aggression*.35+calcB.chin*.2+weightB*.08+calcB.power*.15-calcA.defense*.2)*era.roughness;
	    const deepWaterPenaltyA=deepWaterA*(settings.rounds>maxRoundsA?7.5:0),deepWaterPenaltyB=deepWaterB*(settings.rounds>maxRoundsB?7.5:0);
	    const initiativeA=calcA.aggression*.25+calcA.speed*.18+calcA.iq*.17+calcA.accuracy*.2+ringA+stanceA+counterEdgeA+filmA+(roughA-roughB)*.32-deepWaterPenaltyA-handDragA*18-cutDragA*12+(Number(cbA.plusMinus)||0)*.18+(rnd()-.5)*16;
	    const initiativeB=calcB.aggression*.25+calcB.speed*.18+calcB.iq*.17+calcB.accuracy*.2+ringB+stanceB+counterEdgeB+filmB+(roughB-roughA)*.32-deepWaterPenaltyB-handDragB*18-cutDragB*12+(Number(cbB.plusMinus)||0)*.18+(rnd()-.5)*16;
	    const defenseA=calcA.defense*.48+calcA.footwork*.28+calcA.iq*.24-(damageA*.22)-deepWaterA*4.5-cutDragA*26+(pct(cbA.opponentConnectPct)!=null?(.28-pct(cbA.opponentConnectPct))*28:0);
	    const defenseB=calcB.defense*.48+calcB.footwork*.28+calcB.iq*.24-(damageB*.22)-deepWaterB*4.5-cutDragB*26+(pct(cbB.opponentConnectPct)!=null?(.28-pct(cbB.opponentConnectPct))*28:0);
    const championshipStress=(settings.championship&&fatigue>.66?1.12:settings.championship?1:.92)*era.heatTax*era.longFightTax;
    const ringPaceBonus=settings.ring<=18?2.5:settings.ring>=23?-1.8:0;
    const modelThrownA=(35+calcA.aggression*.28+pace+ringPaceBonus+rnd()*17-fatigue*8)*era.handOutput*(1-handDragA),modelThrownB=(35+calcB.aggression*.28+pace+ringPaceBonus+rnd()*17-fatigue*8)*era.handOutput*(1-handDragB);
    const thrownA=Math.round(cbA.totalThrownPerRound!=null?modelThrownA*.35+Number(cbA.totalThrownPerRound)*.65:modelThrownA);
    const thrownB=Math.round(cbB.totalThrownPerRound!=null?modelThrownB*.35+Number(cbB.totalThrownPerRound)*.65:modelThrownB);
    const modelAccA=.14+(calcA.accuracy-defenseB*.48)/285+(staminaA-70)/800,modelAccB=.14+(calcB.accuracy-defenseA*.48)/285+(staminaB-70)/800;
	    const conditionAccuracyPenalty=(era.heatTax-1)*fatigue*.08+(1-era.traction)*fatigue*.06;
	    const accA=clamp((pct(cbA.totalConnectPct)!=null?modelAccA*.4+pct(cbA.totalConnectPct)*.6:modelAccA)-conditionAccuracyPenalty-deepWaterA*.03-handDragA*.12-cutDragA*.08,.15,.55);
	    const accB=clamp((pct(cbB.totalConnectPct)!=null?modelAccB*.4+pct(cbB.totalConnectPct)*.6:modelAccB)-conditionAccuracyPenalty-deepWaterB*.03-handDragB*.12-cutDragB*.08,.15,.55);
    const landedA=Math.round(thrownA*accA),landedB=Math.round(thrownB*accB);
    const modelPowerA=.48+calcA.power/300,modelPowerB=.48+calcB.power/300;
    const powerShareA=cbA.powerLandedPerRound&&cbA.totalLandedPerRound?Number(cbA.powerLandedPerRound)/Number(cbA.totalLandedPerRound):modelPowerA;
    const powerShareB=cbB.powerLandedPerRound&&cbB.totalLandedPerRound?Number(cbB.powerLandedPerRound)/Number(cbB.totalLandedPerRound):modelPowerB;
    const powerA=Math.round(landedA*clamp(modelPowerA*.45+powerShareA*.55,.3,.92)),powerB=Math.round(landedB*clamp(modelPowerB*.45+powerShareB*.55,.3,.92));
    const impactA=(powerA*(calcA.power/90)*(1-handDragA)+(initiativeA-initiativeB)*.09+rnd()*6+roughA*.08)*powerMassA*era.gloveDamage;
    const impactB=(powerB*(calcB.power/90)*(1-handDragB)+(initiativeB-initiativeA)*.09+rnd()*6+roughB*.08)*powerMassB*era.gloveDamage;
    damageB+=impactA/((calcB.chin*.7+25)*resistanceB); damageA+=impactB/((calcA.chin*.7+25)*resistanceA);
	    staminaA=clamp(staminaA-(((thrownA/32)*(105-calcA.cardio)/18+rnd()*1.4)*championshipStress+deepWaterA*2.2),20,100);
	    staminaB=clamp(staminaB-(((thrownB/32)*(105-calcB.cardio)/18+rnd()*1.4)*championshipStress+deepWaterB*2.2),20,100);
	    const injuryEvents=[];
	    const handRiskA=injuryStateA.hand<2&&r>=4?injuryProfileA.hand*era.handInjuryRisk*(.018+powerA/950+fatigue*.02+(settings.rounds>12&&r>10 ? .012 : 0)):0;
	    const handRiskB=injuryStateB.hand<2&&r>=4?injuryProfileB.hand*era.handInjuryRisk*(.018+powerB/950+fatigue*.02+(settings.rounds>12&&r>10 ? .012 : 0)):0;
	    const cutRiskA=injuryStateA.cut<2?injuryProfileA.cut*era.cutRisk*(.006+impactB/850+roughB/1800+(settings.ruleset!=="modern" ? .006 : 0)):0;
	    const cutRiskB=injuryStateB.cut<2?injuryProfileB.cut*era.cutRisk*(.006+impactA/850+roughA/1800+(settings.ruleset!=="modern" ? .006 : 0)):0;
	    if(rnd()<handRiskA){injuryStateA.hand=clamp(injuryStateA.hand+.7,0,2);injuryStateA.events.push({round:r,type:"hand"});injuryEvents.push({fighter:a,kind:"hand",profile:injuryProfileA,state:injuryStateA})}
	    if(rnd()<handRiskB){injuryStateB.hand=clamp(injuryStateB.hand+.7,0,2);injuryStateB.events.push({round:r,type:"hand"});injuryEvents.push({fighter:b,kind:"hand",profile:injuryProfileB,state:injuryStateB})}
	    if(rnd()<cutRiskA){injuryStateA.cut=clamp(injuryStateA.cut+.65,0,2);injuryStateA.events.push({round:r,type:"cut"});injuryEvents.push({fighter:a,kind:"cut",profile:injuryProfileA,state:injuryStateA})}
	    if(rnd()<cutRiskB){injuryStateB.cut=clamp(injuryStateB.cut+.65,0,2);injuryStateB.events.push({round:r,type:"cut"});injuryEvents.push({fighter:b,kind:"cut",profile:injuryProfileB,state:injuryStateB})}
    let knockA=false,knockB=false,stoppage=null;
    const stoppingPowerA=roundStoppingPower(a,calcA,baseStoppingPowerA,handDragA);
    const stoppingPowerB=roundStoppingPower(b,calcB,baseStoppingPowerB,handDragB);
    const knockdownHistoryA=knockdownHistoryProfile(a),knockdownHistoryB=knockdownHistoryProfile(b);
    const kdCapA=knockdownCeiling(stoppingPowerB,a,calcA,weightB,weightA,sizeMismatch,damageA,fatigue);
    const kdCapB=knockdownCeiling(stoppingPowerA,b,calcB,weightA,weightB,sizeMismatch,damageB,fatigue);
    const historyResistanceA=sizeMismatch&&weightB>weightA*1.12?1:knockdownHistoryA.resistance;
    const historyResistanceB=sizeMismatch&&weightA>weightB*1.12?1:knockdownHistoryB.resistance;
    const kdChanceA=clamp(((impactB-calcA.chin*.18*resistanceA+damageA*7)/210)*historyResistanceA,0,kdCapA);
    const kdChanceB=clamp(((impactA-calcB.chin*.18*resistanceB+damageB*7)/210)*historyResistanceB,0,kdCapB);
    if(rnd()<kdChanceA){knockA=true;kdA++;damageA+=1.7}
    if(rnd()<kdChanceB){knockB=true;kdB++;damageB+=1.7}
    if(knockA&&knockB){ if(rnd()>.5)knockA=false;else knockB=false }
    const stoppagePressure=(settings.championship?1.08:.9)*era.stoppageTolerance;
    const canStopA=canForceStoppage(stoppingPowerA,b,calcB,damageB,knockB,weightA,weightB,sizeMismatch)&&earlyStoppageAllowed(r,stoppingPowerA,b,calcB,sizeMismatch);
    const canStopB=canForceStoppage(stoppingPowerB,a,calcA,damageA,knockA,weightB,weightA,sizeMismatch)&&earlyStoppageAllowed(r,stoppingPowerB,a,calcA,sizeMismatch);
    if(canStopB&&((knockA&&damageA>5.2&&rnd()<.38*stoppagePressure)||(damageA>7&&rnd()<.24*stoppagePressure)))stoppage={winner:"b",type:"TKO"};
    if(canStopA&&((knockB&&damageB>5.2&&rnd()<.38*stoppagePressure)||(damageB>7&&rnd()<.24*stoppagePressure)))stoppage={winner:"a",type:"TKO"};
    if(!stoppage&&r===mismatchStopRound){
      stoppage={winner:big===a?"a":"b",type:"TKO"};
      if(big===a){knockB=true;kdB++;damageB+=2}else{knockA=true;kdA++;damageA+=2}
    }
    let scoreA=10,scoreB=10;
    const edge=landedA-landedB+(powerA*powerMassA-powerB*powerMassB)*.85+(initiativeA-initiativeB)*.06+(roughA-roughB)*era.oldSchoolScoring;
    if(knockA){scoreA=8;scoreB=10}else if(knockB){scoreA=10;scoreB=8}else if(edge>=0){scoreA=10;scoreB=Math.abs(edge)>14?8:9}else{scoreA=Math.abs(edge)>14?8:9;scoreB=10}
    const statisticalLeader=edge>=0?a:b;
    const leader=knockA?b:knockB?a:statisticalLeader, trailer=leader===a?b:a;
    const leaderIdentity=leader===a?identityA:identityB,trailerIdentity=trailer===a?identityA:identityB;
    const evolution=roundEvolutions[(r-1)%roundEvolutions.length];
    const previous=rounds.at(-1),previousLeader=previous?(previous.scoreA>previous.scoreB?a:b):null;
    const scoreBeforeA=rounds.reduce((n,round)=>n+round.scoreA,0),scoreBeforeB=rounds.reduce((n,round)=>n+round.scoreB,0);
    const roundsWonA=rounds.filter(round=>round.scoreA>round.scoreB).length,roundsWonB=rounds.filter(round=>round.scoreB>round.scoreA).length;
    const lastThree=rounds.slice(-3),leaderRun=lastThree.filter(round=>leader===a?round.scoreA>round.scoreB:round.scoreB>round.scoreA).length;
    const trailerRun=lastThree.filter(round=>trailer===a?round.scoreA>round.scoreB:round.scoreB>round.scoreA).length;
	    const scoreGap=Math.abs(scoreBeforeA-scoreBeforeB),trailerBehind=trailer===a?scoreBeforeA<scoreBeforeB:scoreBeforeB<scoreBeforeA;
	    const leaderCase=leader===a?styleCaseA:styleCaseB,trailerCase=trailer===a?styleCaseA:styleCaseB;
	    const carry=previousLeader?` ${previousLeader.last} won the previous round on the working card, so this round starts with a memory: ${trailer.last} has to change the entry, the target or the exit rather than asking the same exchange to produce a different answer.`:"";
	    const deepWaterNote=deepWaterA||deepWaterB?` Deep-water note: ${[deepWaterA?`${a.last} is beyond the proven ${maxRoundsA}-round ceiling, so the unknown is not courage but whether the timing, breathing and defensive exits still obey him after minute ${maxRoundsA*3}`:"",deepWaterB?`${b.last} is beyond the proven ${maxRoundsB}-round ceiling, so every exchange asks for evidence that the old reflexes still arrive on time`:""].filter(Boolean).join("; ")}.`:"";
	    const chapterMemory=[
	      r===1?`${leaderCase} ${trailerCase}`:`The fight has a ledger now: through ${r-1} rounds the working card reads ${scoreBeforeA}–${scoreBeforeB}, with ${a.last} taking ${roundsWonA} rounds and ${b.last} taking ${roundsWonB}. ${leaderRun>=2?`${leader.last} has stacked several recent answers, so the danger for ${trailer.last} is tactical obedience—following the same path because it once looked available.`:trailerRun>=2?`${trailer.last} had momentum before this round, which makes ${leader.last}'s adjustment more meaningful: it interrupts a pattern rather than winning an isolated exchange.`:`Neither corner owns the entire fight, so the next minute is about identifying which small advantage can survive repetition.`}`,
	      damageA>damageB+1?`${a.last} is carrying more visible damage into the round, so every defensive reset has to be shorter and cleaner; long recoveries invite ${b.last} to turn information into contact.`:damageB>damageA+1?`${b.last} is carrying more visible damage into the round, so ${a.last}'s feints have extra value: even a non-scoring threat can make tired feet declare where the exit will be.`:`The physical cost is still close enough that tactics, not desperation, should decide the minute.`,
	      scoreGap>=10&&trailerBehind?`${trailer.last} is likely behind on the unofficial card, which changes the risk math: waiting for perfect entries is no longer free, but reckless volume gives ${leader.last} the countering pictures the whole fight has been building toward.`:`The card is not forcing a reckless swing yet, so both corners can still choose quality of position over empty activity.`,
	      deepWaterNote
	    ].join(" ");
    const openingLanes=[
      `${leader.last} does not spend the opening minute merely “feeling out.” The first useful information comes from what ${trailer.last} protects before a real punch is thrown: glove position, lead-foot placement and whether the eyes follow the feint or the shoulder. ${evolution.opening} ${carry} ${chapterMemory}`,
      `The round opens with a specific scouting question, not generic caution: can ${leader.last} make ${trailer.last} show the defensive answer before the scoring punch is committed? ${evolution.opening} ${carry} The early exchanges are therefore judged by reaction quality more than volume. ${chapterMemory}`,
      `The first minute is quiet only if you watch for punches instead of permissions. ${leader.last} is asking whether ${trailer.last} will give up the center line, the outside step or the reset beat after the first probe. ${evolution.opening} ${carry} ${chapterMemory}`,
      `Before either fighter builds real pace, the round is already sorting priorities. ${leader.last} wants to learn which threat ${trailer.last} believes first; ${trailer.last} wants to answer without handing over a repeatable trigger. ${evolution.opening} ${carry} ${chapterMemory}`,
      `${leader.last} begins by testing the boundary of ${trailer.last}'s comfort zone: not just distance, but how long ${trailer.last} can hold shape after the first feint. ${evolution.opening} ${carry} ${chapterMemory}`
    ];
	    const settingsRead=r===1?`Fight-settings layer for ${a.last} vs ${b.last}: ${settingEffects.join(" ")} `:settings.rounds>15&&r>settings.rounds*.66?`The old long-distance schedule is changing the fight now: clean technique matters, but survival craft, pacing and clinch economy are becoming scoring tools too. `:settings.championship&&r>settings.rounds*.66?`Championship pacing matters now: the same exchange costs more because tired legs have to recover under title-fight pressure. `:!settings.championship&&r>settings.rounds*.66?`Because this is not set as a championship fight, both corners can manage the late risk with slightly less urgency than a title-round sprint. `:"";
    const lines=[];
		    if(r===1){
		      lines.push(settingEffects[0]);
	      lines.push(eraSetting);
	      if(baseStoppingPowerA.lowCeiling)lines.push(`${a.last}'s path is scoring control more than sudden damage; the engine treats ${baseStoppingPowerA.label} as a real limit on knockdowns and stoppages against elite durability.`);
	      if(baseStoppingPowerB.lowCeiling)lines.push(`${b.last}'s path is scoring control more than sudden damage; the engine treats ${baseStoppingPowerB.label} as a real limit on knockdowns and stoppages against elite durability.`);
	      if(knockdownHistoryA.tier!=="normal")lines.push(`${a.last}'s ${knockdownHistoryA.label} reduces random canvas volatility; the simulation now requires true damage buildup, elite power, or a real size stress before treating a knockdown as realistic.`);
	      if(knockdownHistoryB.tier!=="normal")lines.push(`${b.last}'s ${knockdownHistoryB.label} reduces random canvas volatility; the simulation now requires true damage buildup, elite power, or a real size stress before treating a knockdown as realistic.`);
	      if(weightPlanA.note)lines.push(weightPlanA.note);
	      if(weightPlanB.note)lines.push(weightPlanB.note);
	      if(settings.ruleset!=="modern")lines.push(`Under ${era.label}, the referee gives less instant rescue in the clinch; forearms, head position, shoulder pressure and body control become part of the tactical language.`);
	      if(settings.environment==="outdoor-heat")lines.push(`The heat changes the fight before anyone is hurt: every long exchange taxes breathing, recovery and the legs needed to exit safely.`);
		      if(settings.equipment!=="modern")lines.push(`${settings.equipment==="minimal"?"Minimal padding":"Vintage gloves"} and weaker traction make clean punching more punishing, but they also make hands, balance and pivots less reliable.`);
		    }
	    if(deepWaterA)lines.push(`${a.last} has crossed past a proven ${maxRoundsA}-round distance; the simulation now taxes timing, breathing and defensive recovery rather than assuming the 13th-and-beyond minutes feel normal.`);
	    if(deepWaterB)lines.push(`${b.last} has crossed past a proven ${maxRoundsB}-round distance; the question is whether the feet and reactions still answer after a championship-length fight has already been spent.`);
	    injuryEvents.forEach(event=>{
	      if(event.kind==="hand")lines.push(`${event.fighter.last} shows the first sign of ${event.profile.handLabel}: the punch selection gets more selective because every hard connection now carries a cost.`);
	      if(event.kind==="cut")lines.push(`${event.fighter.last} is dealing with ${event.profile.cutLabel}: the corner has to manage vision, swelling and defensive urgency before it becomes a scoring liability.`);
	    });
	    if(!injuryEvents.length&&r>5&&injuryStateA.hand)lines.push(`${a.last}'s hand issue is subtly changing the offense: fewer fully committed power shots, more touch-jabs, traps and scoring exits.`);
	    if(!injuryEvents.length&&r>5&&injuryStateB.hand)lines.push(`${b.last}'s hand issue is subtly changing the offense: fewer fully committed power shots, more touch-jabs, traps and scoring exits.`);
	    if(!injuryEvents.length&&r>5&&injuryStateA.cut)lines.push(`${a.last}'s cut/swelling is changing the defensive read; the guard is a little higher and the exits have to protect the damaged side.`);
	    if(!injuryEvents.length&&r>5&&injuryStateB.cut)lines.push(`${b.last}'s cut/swelling is changing the defensive read; the guard is a little higher and the exits have to protect the damaged side.`);
	    if(knockA||knockB){
      const down=knockA?a:b,puncher=knockA?b:a;
      lines.push(`${puncher.last} times ${down.last}'s entry and lands the decisive counter, sending ${down.last} to the canvas.`);
      lines.push(`${down.last} beats the count but has to rebuild the stance before moving; ${puncher.last} takes away the escape route instead of rushing straight into a clinch.`);
    }else{
      lines.push(edge>=0?`${a.last} controls the geography of the round and finds a home for the ${activeStanceA==="Southpaw"?"straight left":"right hand"}.`:`${b.last} dictates the pace, beating ${a.last} to the punch in the exchanges.`);
    }
    if(r===1&&openStance)lines.push(`The open-stance geometry is already important: both fighters are contesting lead-foot position to open the rear hand.`);
    else if((pressureA&&moverB)||(pressureB&&moverA)){const p=pressureA?a:b,m=pressureA?b:a;lines.push(`${p.last} works to close the exits, while ${m.last} tries to turn the pressure and reset at range.`)}
    else if(Math.abs(counterA-counterB)>5){const c=counterA>counterB?a:b;lines.push(`${c.last} is reading the entry and looking to make the first attack create the countering opportunity.`)}
    if(!(knockA||knockB))lines.push(Math.abs(edge)<5?`Neither man gives much away. This is a razor-close round.`:`${leader.last}'s ${leader.accuracy>leader.power?"precision":"power"} is beginning to separate the two fighters.`);
    if(sizeMismatch){
      const ratio=Math.max(weightA,weightB)/Math.min(weightA,weightB);
      lines.push(`${big.last} carries roughly ${ratio.toFixed(1)}× the natural fighting mass. That changes the exchange: ${small.last}'s shots must be exceptionally clean to move the larger frame, while ${big.last}'s contact transfers far more force.`);
      lines.push(`${big.last} can use the forearm, shoulder and chest in the clinch to make ${small.last} support weight. Those resets drain the legs ${small.last} needs for safe entries and exits.`);
    }
    if(openStance)lines.push(`${a.last}'s ${a.stance.toLowerCase()} stance against ${b.last}'s ${b.stance.toLowerCase()} stance creates an outside-foot contest: the winner of that angle clears the lane for the rear hand and moves off before the return.`);
    if(!(knockA||knockB)){
      const jabLeader=(a.accuracy+a.iq+a.footwork)>(b.accuracy+b.iq+b.footwork)?a:b,jabTrailer=jabLeader===a?b:a;
      lines.push(`${jabLeader.last} is using the lead hand as a measuring tool—not merely a scoring jab—touching the guard to occupy ${jabTrailer.last}'s vision, fix the feet, and disguise the next attack.`);
      const defender=defenseA>defenseB?a:b,attacker=defender===a?b:a;
      lines.push(`${defender.last}'s defensive responsibility is strongest after punching: the head leaves the center line as the feet reset, denying ${attacker.last} the easy counter at the end of the combination.`);
    }
    if(r>settings.rounds*.6)lines.push(`${trailer.last} is breathing heavier now; the accumulated work is becoming visible.`);
    lines.push(knockA||knockB
      ?`${leader.last} wins the round 10–8: the knockdown is the decisive event, outweighing any earlier success ${trailer.last} had in the round.`
      :`${leader.last} earns the round because the cleaner work also has the greater effect; judges reward effective punching and control, not punch count in isolation.`);
    const leaderLanded=leader===a?landedA:landedB,trailerLanded=trailer===a?landedA:landedB;
    const leaderThrown=leader===a?thrownA:thrownB,trailerThrown=trailer===a?thrownA:thrownB;
    const leaderPower=leader===a?powerA:powerB,trailerPower=trailer===a?powerA:powerB;
    const leaderStamina=leader===a?staminaA:staminaB,trailerStamina=trailer===a?staminaA:staminaB;
    const margin=Math.abs(edge),late=r>settings.rounds*.72,close=margin<5,dominant=margin>13;
    const finalRound=r===settings.rounds||!!stoppage;
    const closingLanes=[
      `The last minute is about exit ownership, not just who throws last. ${leader.last} scores and immediately changes the place where the next exchange would have to begin, so ${trailer.last}'s answer is forced to travel across a new line rather than fire from the stance that started the attack. That matters because the judges are seeing completed sequences: punch, reaction, exit, reset. ${trailer.last} may still initiate, but the initiation is arriving after the useful geography has moved. By the bell, the round feels less like one fighter sprinted away with it and more like ${leader.last} kept making ${trailer.last} pay a small tax before every meaningful second effort.`,
      `The closing stretch becomes a tempo argument. ${leader.last} does not simply protect a lead; the rhythm is deliberately broken—touch, pause, half-step, then the scoring beat when ${trailer.last} expects the reset to be over. ${trailer.last} tries to answer with urgency, but urgency without a new trigger gives ${leader.last} the same read twice. The final exchanges therefore have a film-room tell: ${trailer.last}'s hands are often ready before the feet are, while ${leader.last}'s feet are ready before the hands have finished returning. That sequencing is why the late work looks cleaner even when the raw activity is close.`,
      `The final minute is where the round's earlier body language becomes usable information. ${leader.last} has seen which way ${trailer.last} wants to escape, so the scoring action is aimed less at the obvious target than at the recovery route after the target is defended. When ${trailer.last} increases volume, the added punches do not automatically become added control; they also create longer returns to stance. ${leader.last} uses that delay to make the last exchange look authored rather than accidental, finishing in the posture of the fighter choosing the next collision point.`,
      `Down the stretch, this becomes a risk-management problem. ${leader.last} has enough of the round that a wild third exchange would be a gift, so the smart choice is to score, deny the immediate reply and force ${trailer.last} to spend time rebuilding the attack. ${trailer.last}'s best moments come when the first punch is hidden behind a foot feint, but when the entry is announced too early, ${leader.last} already has the counter lane and the safer exit mapped. The last thirty seconds are not dramatic in a highlight-reel sense; they are dramatic because one corner is running out of clean ways to change the argument.`,
      `The bell approaches with both fighters negotiating fatigue. ${leader.last} is not moving as freely as in the early rounds, but the decision-making is cleaner: fewer decorative looks, more commitment to the route that has actually produced scoring. ${trailer.last} senses the need to steal the visual ending and pushes for a louder exchange, yet the louder exchange also lengthens the recovery. ${leader.last} meets that pressure by shortening the answer, taking the first safe angle, and leaving ${trailer.last} with motion that reads more like pursuit than control. The final optics favor the fighter who looks organized after contact.`
    ];
    const positionalLanes=[
      `${leader.last} finishes at ${leaderLanded} of ${leaderThrown}, including ${leaderPower} power punches; ${trailer.last} lands ${trailerLanded} of ${trailerThrown}, including ${trailerPower}. Read those numbers as a map, not a scoreboard. The important split is where the punches came from: ${leader.last} is usually aligned inside the chosen range, eyes over the stance and the exit already available, while ${trailer.last} is often punching from the repair phase after the first route has been interrupted. That is why similar volume can produce different authority. The cleaner fighter is not merely landing more; he is landing from positions that allow the next defensive responsibility to happen on time.`,
      `${leader.last}'s ${leaderLanded}/${leaderThrown} round does not tell the whole story until it is paired with ${trailer.last}'s ${trailerLanded}/${trailerThrown}. If the count is close, the separator is quality of possession: who touches the guard first, who makes the other fighter reset, and who ends the exchange with feet under the hips. ${leader.last}'s power-punch total (${leaderPower}) carries extra weight because those shots are attached to positional consequences—turning ${trailer.last}, freezing the lead foot, or making the next entry start from farther away. ${trailer.last}'s ${trailerPower} power shots have value, but too many arrive as isolated moments rather than pieces of a repeating structure.`,
      `From a positional-map view, the round is less about a single weapon than the pathway into that weapon. ${leader.last} is scoring from ${leaderIdentity.range}, then recovering behind ${leaderIdentity.defense}; ${trailer.last} is being pulled toward ${trailerIdentity.range} without getting the stable base that style requires. The punch totals—${leaderLanded}/${leaderThrown} for ${leader.last}, ${trailerLanded}/${trailerThrown} for ${trailer.last}—show enough contact to matter, but the more revealing detail is what happens immediately after contact. ${leader.last}'s exits make the next exchange smaller for ${trailer.last}; ${trailer.last}'s exits too often ask the same problem to solve itself.`,
      `The round's geometry is visible in the power split: ${leaderPower} power punches for ${leader.last}, ${trailerPower} for ${trailer.last}. Power here is not just force; it is whether the shot changes the opponent's assignment. ${leader.last} is making ${trailer.last} defend, reset and then re-enter, three separate jobs before the next clean chance. ${trailer.last} has moments of clean touch, but the touches do not consistently leave ${leader.last} in a worse position. That distinction is why the scoring can favor ${leader.last} even without a cartoonish statistical gap: the work has consequences beyond the moment it lands.`,
      `The statistical line gives the round a skeleton—${leader.last} ${leaderLanded}/${leaderThrown}, ${trailer.last} ${trailerLanded}/${trailerThrown}—but the muscle is in the spacing between exchanges. ${leader.last} is increasingly making the first exchange a setup for the second, while ${trailer.last} is still trying to make the first exchange solve the whole round. That is a subtle but important difference. It means ${leader.last}'s misses can still gather information, while ${trailer.last}'s misses often create recovery problems. The positional edge is therefore not mysterious; it is the accumulation of small moments where one fighter is ready for what comes next and the other is still finishing what just happened.`
    ];
    const cornerLanes=[
      `Corner read: ${leader.last} earns the ${scoreA}–${scoreB} round because the scoring moments are attached to repeatable control. The corner read for ${trailer.last} should be specific: attack ${leader.last}'s dependency—${leaderIdentity.risk}—before simply demanding more volume. More punches only help if they change the first defensive reaction or cut off the exit that keeps rescuing ${leader.last}'s structure. The résumé comparison still matters: ${trailerCase} Stamina is ${Math.round(staminaA)}% for ${a.last} and ${Math.round(staminaB)}% for ${b.last}, so the next adjustment has to be efficient enough to survive tired legs, not just clever enough to sound good between rounds.`,
      `Corner read: ${leader.last} takes the ${scoreA}–${scoreB} because the judges are seeing cleaner effect, but the corner conversation should not be “try harder.” For ${trailer.last}, the actionable fix is to change the timing of the first commitment: show the entry, draw ${leader.last}'s preferred defensive answer, then attack the answer rather than the original target. For ${leader.last}, the warning is complacency; the same dependency that won the round—${leaderIdentity.risk} if exposed—can become the opponent's next opening. With stamina at ${Math.round(leaderStamina)}% for ${leader.last} and ${Math.round(trailerStamina)}% for ${trailer.last}, the next round will punish whichever corner asks for an adjustment that costs too much energy.`,
      `Corner read: the ${scoreA}–${scoreB} score is a product of judging criteria more than raw arithmetic: clean punching, effective aggression, defense and ring generalship are not equal if only one fighter is turning them into completed sequences. ${leader.last} is winning the sequence battle right now, but ${trailer.last}'s corner has a usable clue. The current approach fails when ${trailerIdentity.risk}; the correction is to remove that failure condition before hunting for bigger punches. If ${trailer.last} can make ${leader.last} defend before setting the feet, the next round can look completely different. If not, the same trap will keep appearing under a new headline.`,
      `Corner read: the round goes ${scoreA}–${scoreB}, but the next-minute question is psychological as much as technical. ${leader.last} has evidence that the read is real; ${trailer.last} has to decide whether to trust the corner's adjustment or chase an emotional equalizer. The better instruction is narrow: interrupt the trigger, not the whole style. ${leader.last}'s system still has a pressure point—${leaderIdentity.risk}—and ${trailer.last}'s best path is to make that pressure point show up earlier in the exchange. The stamina split, ${Math.round(staminaA)}% to ${Math.round(staminaB)}%, means the wrong adjustment will not just fail; it will make the following round easier to predict.`,
      `Corner read: ${leader.last} banks the ${scoreA}–${scoreB} round, but the most useful corner note is what not to repeat. If ${trailer.last} simply adds volume from the same approach, ${leader.last}'s reads become sharper. If ${leader.last} assumes the same answer will always be there, the fight can swing when ${trailer.last} finally attacks the setup instead of the punch. The résumé layer gives context without deciding the next round for them: ${trailerCase} The next chapter should be about whether ${trailer.last} can force a different first reaction, because without that, every later adjustment is being built on the same losing premise.`
    ];
	    const finalCornerLanes=[
	      `Final corner read: ${leader.last} takes the ${scoreA}–${scoreB} round because the last three minutes leave the clearer judging impression: cleaner contact, better balance after contact and fewer desperate resets. There is no next-round correction now; the only question is how the judges weigh this final chapter against the previous eleven. ${trailer.last}'s corner can point to effort and late urgency, but the decisive optics are whether that urgency produced clean scoring or merely chased the geometry ${leader.last} had already moved.`,
	      `Final corner read: the ${scoreA}–${scoreB} round is no longer a setup for an adjustment; it is evidence for the cards. ${leader.last} finishes the fight with the more coherent tactical sentence: enter on chosen terms, make ${trailer.last} answer, then leave without gifting a clean return. ${trailer.last}'s late push matters only if the judges see it as effective aggression rather than pursuit. At the bell, stamina sits at ${Math.round(staminaA)}% for ${a.last} and ${Math.round(staminaB)}% for ${b.last}, but the scoring question is not who is freshest — it is who spent the final round doing cleaner, more judgeable work.`,
	      `Final corner read: ${leader.last} banks the ${scoreA}–${scoreB} by closing the argument instead of opening a new one. The corner instructions have already been spent; now the fight belongs to the scorecards. ${trailer.last}'s best case is that activity, pressure or late body language stole enough visual territory, but ${leader.last}'s case is built on the cleaner completed sequences. The round should be read as a conclusion: what each fighter could still execute after twelve rounds, not what either corner might fix later.`,
	      `Final corner read: this ${scoreA}–${scoreB} round is the last piece of the judge's memory. ${leader.last} does not need a future adjustment; the job is to make the final images simple — balanced scoring, controlled exits, and no free counters for ${trailer.last}. If ${trailer.last} is trying to rescue the fight, the rescue attempt has to be clean enough to overcome the accumulated pattern. The bell freezes that pattern in place, so the post-round debate belongs to the scorecards rather than future corner advice.`
	    ];
	    const knockdownLanes=[
	      `In the final minute, the knockdown comes from timing rather than chaos. ${leader.last} has already seen ${trailer.last}'s first motion, so the scoring punch is thrown into the recovery beat, when the guard is returning but the stance has not finished rebuilding. ${trailer.last} rises, yet the count changes the rest of the round: the jab becomes a range finder for survival, the clinch becomes a place to buy seconds, and ${leader.last} can choose between banking the 10–8 or testing whether the legs are truly back underneath the body.`,
	      `The decisive moment is created before the punch lands. ${leader.last} draws ${trailer.last} one step past safe punching range, then punishes the transfer of weight as the exit disappears. It is not a cartoon haymaker; it is a structural knockdown, the kind that happens when a fighter is hit while trying to move, punch and recover at the same time. After the count, ${trailer.last} is no longer just defending shots — he is defending the space needed to make the next defensive decision.`,
	      `The knockdown is the payoff to a pressure trap. ${leader.last} crowds the reset, makes ${trailer.last} answer from a narrower stance, and lands when the shoulders turn before the feet are ready to follow. The important detail after the count is restraint: ${leader.last} keeps the ring small and makes ${trailer.last} prove the legs can carry a full escape, while ${trailer.last} survives by tying up, changing height and refusing to give the same clean target twice.`,
	      `The round flips on a body-to-head sequence. ${leader.last} has been making ${trailer.last} protect the ribs and elbows first, so the knockdown punch arrives upstairs after the posture has already been lowered. That is why the fall looks sudden even though the setup has been collecting interest all round. ${trailer.last} beats the count, but the defensive priorities are scrambled now: protect the body and the head opens; stand tall and the legs have to absorb another collision.`,
	      `Fatigue turns a manageable exchange into a knockdown. Earlier in the fight, ${trailer.last} might have slipped, rolled or stepped off after the first contact; here the same movement arrives half a beat late. ${leader.last} reads that delay and lands while the balance is split between attack and retreat. The last seconds are about composure: ${leader.last} presses without smothering the finishing lane, and ${trailer.last} has to make the referee see clear eyes, stable feet and enough return fire to stay in the fight.`,
	      `This is the clean power-transfer version of the knockdown. ${leader.last} is planted when the shot lands, while ${trailer.last} is caught between assignments — not fully braced, not fully gone, not ready to punch back. The canvas visit changes the judging math immediately, but it also changes the tactical math: ${trailer.last} must now spend the remaining seconds proving the knockdown was a moment, not a solved route. ${leader.last} owns the round because the damage came with position, not just force.`
	    ];
    const closingIndex=(r+(dominant?1:0)+(close?2:0)+(late?3:0)+(leader===a?0:1))%closingLanes.length;
    const positionalIndex=(r*2+(openStance?1:0)+(dominant?2:0)+(leader===a?0:3))%positionalLanes.length;
	    const cornerIndex=(r*3+(trailerBehind?1:0)+(leaderRun>=2?2:0)+(close?3:0))%cornerLanes.length;
	    const openingIndex=(r+hash(`${a.id}-${b.id}-${leader.id}-${trailer.id}`)+(openStance?1:0)+(dominant?2:0)+(close?3:0))%openingLanes.length;
	    const finalCornerIndex=(r+hash(`${leader.id}-${trailer.id}-final`)+(close?1:0)+(dominant?2:0))%finalCornerLanes.length;
	    const knockdownIndex=(r+hash(`${leader.id}-${trailer.id}-${leaderPower}-${trailerPower}-knockdown`)+(late?2:0)+(settings.ruleset!=="modern"?1:0))%knockdownLanes.length;
	    const injuryReportParts=[];
	    if(injuryEvents.some(e=>e.kind==="hand"))injuryReportParts.push(`${injuryEvents.filter(e=>e.kind==="hand").map(e=>e.fighter.last).join(" and ")} now has a hand-management problem: the cleanest punch may still be available, but the cost of throwing it at full authority has risen.`);
	    if(injuryEvents.some(e=>e.kind==="cut"))injuryReportParts.push(`${injuryEvents.filter(e=>e.kind==="cut").map(e=>e.fighter.last).join(" and ")} now has a cut/swelling variable, which changes the defensive priority from simply reading punches to protecting vision and preventing the referee from seeing sustained damage.`);
	    if(!injuryReportParts.length&&(injuryStateA.hand||injuryStateB.hand||injuryStateA.cut||injuryStateB.cut)){
	      if(injuryStateA.hand||injuryStateB.hand)injuryReportParts.push(`${[injuryStateA.hand?a.last:"",injuryStateB.hand?b.last:""].filter(Boolean).join(" and ")} is carrying a hand-tax into the round, so power is being rationed instead of spent freely.`);
	      if(injuryStateA.cut||injuryStateB.cut)injuryReportParts.push(`${[injuryStateA.cut?a.last:"",injuryStateB.cut?b.last:""].filter(Boolean).join(" and ")} is carrying visible facial damage, so defense is now partly about keeping the damaged side away from follow-up traffic.`);
	    }
	    const injuryReport=injuryReportParts.length?` Injury layer: ${injuryReportParts.join(" ")}`:"";
	    const report=freshenReport([
	      `${settingsRead}${openingLanes[openingIndex]} ${r===1&&researchFrame?`${researchFrame} ${researchQuestion} `:""}${leader.last} wants ${leaderIdentity.range}, built around the ${leaderIdentity.weapon}; ${trailer.last} is trying to establish ${trailerIdentity.range} and bring the ${trailerIdentity.weapon} into play. This round’s first positional argument begins when ${leader.last} ${leaderIdentity.entry}. ${openStance?`In the open-stance geometry (${activeStanceA.toLowerCase()} against ${activeStanceB.toLowerCase()}), outside lead-foot position opens the rear-hand lane and changes the safe exit side.`:`In the closed-stance geometry (${activeStanceA.toLowerCase()} against ${activeStanceB.toLowerCase()}), the jabs share the center channel and the decisive angle is normally outside the lead shoulder.`} ${settings.ruleset!=="modern"?`Because this is ${era.label}, tie-ups, shoulder bumps, head placement and forearm frames are part of the fight's legal gray area rather than automatic resets. `:""}${settings.environment==="outdoor-heat"?`The heat makes every extra clinch and long exchange withdraw from the same stamina account the feet need later. `:""}${finalRound?"The opening minute is part of the closing argument now; there is no time to bank information for later.":"The opening minute is therefore a new chapter built from the previous chapter’s evidence, not a fresh reconnaissance sequence."}`,
      `${evolution.middle} ${leader.last} uses ${leaderIdentity.defense} to remove the first idea, then answers with the ${leaderIdentity.weapon}. ${trailer.last}'s route—${trailerIdentity.entry}—depends on reaching a settled base; when the follow-up is delayed, ${leader.last} attacks the reset and leaves via ${leaderIdentity.exit}. The middle minute is not a replay of the opening: the first minute asked which route would appear, while this minute tests whether the route still works after the other corner has seen it. At this stage of round ${r}, the exchange is being shaped by the answer to the previous answer: each fighter is trying to preserve the signature system while deleting the read the other corner carried into the minute.${injuryReport}`,
	      knockA||knockB?knockdownLanes[knockdownIndex]:closingLanes[closingIndex],
      positionalLanes[positionalIndex],
      finalRound?finalCornerLanes[finalCornerIndex]:cornerLanes[cornerIndex]
    ],narrationSalt,r);
			    rounds.push({number:r,thrownA,thrownB,landedA,landedB,powerA,powerB,scoreA,scoreB,knockA,knockB,damageA,damageB,staminaA,staminaB,lines,report,tactics:{openStance,stanceMatchup,activeStanceA,activeStanceB,identityA,identityB,pressureA,pressureB,moverA,moverB,styleCaseA,styleCaseB,settingEffects,weightPlanA,weightPlanB,era,roughA,roughB,maxRoundsA,maxRoundsB,deepWaterA,deepWaterB,stoppingPowerA,stoppingPowerB,knockdownHistoryA,knockdownHistoryB,kdCapA,kdCapB,kdChanceA,kdChanceB,canStopA,canStopB,injuryProfileA,injuryProfileB,injuryStateA:{...injuryStateA,events:[...injuryStateA.events]},injuryStateB:{...injuryStateB,events:[...injuryStateB.events]},injuryEvents},headline:knockA||knockB?"DOWN GOES "+(knockA?a.last:b.last).toUpperCase():Math.abs(edge)<5?evolution.title:leader.last.toUpperCase()+" TAKES CONTROL",stoppage});
    if(stoppage)ended=true;
  }
		  return finalize({a,b,settings,rounds,seed,settingEffects,conditions:{era,ruleset:settings.ruleset,environment:settings.environment,weighin:settings.weighin,equipment:settings.equipment},matchup:{weightA,weightB,naturalWeightA:weightPlanA.natural,naturalWeightB:weightPlanB.natural,targetWeight,weightPlanA,weightPlanB,maxRoundsA,maxRoundsB,massRatio,sizeMismatch}});
}
function finalize(f){
 const sum=k=>f.rounds.reduce((n,r)=>n+r[k],0), last=f.rounds.at(-1),stoppage=last.stoppage;
 const baseA=sum("scoreA"),baseB=sum("scoreB"), closeFight=Math.abs(baseA-baseB)<=4;
 const venueBias=f.settings?.neutral===false&&closeFight?1:0;
 const judges=[[-1+venueBias,0],[0+venueBias,1],[1+venueBias,-1]].map((bias,i)=>({name:`JUDGE ${i+1}`,a:baseA+bias[0],b:baseB+bias[1]}));
 let winner,decision;
 if(stoppage){winner=stoppage.winner;decision=`${stoppage.type} · ROUND ${last.number}`}
 else{const votesA=judges.filter(j=>j.a>j.b).length,votesB=judges.filter(j=>j.b>j.a).length;winner=votesA>votesB?"a":votesB>votesA?"b":baseA>=baseB?"a":"b";decision=(votesA===3||votesB===3)?"UNANIMOUS DECISION":"SPLIT DECISION"}
 f.totals={thrownA:sum("thrownA"),thrownB:sum("thrownB"),landedA:sum("landedA"),landedB:sum("landedB"),powerA:sum("powerA"),powerB:sum("powerB"),kdA:f.rounds.filter(r=>r.knockA).length,kdB:f.rounds.filter(r=>r.knockB).length};
 return Object.assign(f,{judges,winner,decision,settingEffects:f.settingEffects||[]});
}
global.BoxingEngine={buildFight};
})(typeof window!=="undefined"?window:globalThis);
