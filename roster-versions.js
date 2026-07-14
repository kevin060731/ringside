(function(global){
const divisionWeights={Heavyweight:224,Cruiserweight:200,"Light Heavyweight":175,"Super Middleweight":168,Middleweight:160,"Junior Middleweight":154,Welterweight:147,"Junior Welterweight":140,Lightweight:135,"Junior Lightweight":130,Featherweight:126,"Junior Featherweight":122,Bantamweight:118,"Junior Bantamweight":115,Flyweight:112,"Junior Flyweight":108,Strawweight:105};
const S=(division,power,speed,chin,defense,iq,footwork,cardio,accuracy,aggression,weight=divisionWeights[division])=>({division,weight,power,speed,chin,defense,iq,footwork,cardio,accuracy,aggression});
const P=(opponent,result,note)=>({opponent,result,note});
global.ROSTER_VERSION_PACK={
 tyson:[
  {year:1986,label:"1986 · YOUNG DESTROYER",...S("Heavyweight",99,98,90,89,88,98,92,91,100),bestPerformance:P("Trevor Berbick","TKO 2","youngest heavyweight champion; peak speed-to-power intimidation")},
  {year:1988,label:"1988 · PEAK CHAMPION",...S("Heavyweight",98,95,91,88,90,96,90,91,99),bestPerformance:P("Michael Spinks","KO 1","cleanest prime statement: pressure, fear, and finishing speed all at once")},
  {year:1996,label:"1996 · COMEBACK PUNCHER",...S("Heavyweight",96,88,88,80,85,86,80,86,97),bestPerformance:P("Frank Bruno","TKO 3","comeback power still terrifying even as the layered prime style had thinned")}
 ],
 ali:[
  {year:1964,label:"1964 · CLAY SPEED ERA",...S("Heavyweight",84,100,93,97,96,100,98,93,82),bestPerformance:P("Sonny Liston","RTD 6","speed, nerve and range control solved the most feared heavyweight alive")},
  {year:1967,label:"1967 · PRIME EXILE",...S("Heavyweight",87,99,95,96,98,99,98,94,84),bestPerformance:P("Cleveland Williams","TKO 3","the cleanest snapshot of Ali’s foot speed, rhythm and long-range command")},
  {year:1974,label:"1974 · RUMBLE VETERAN",...S("Heavyweight",88,90,98,91,100,89,96,92,86),bestPerformance:P("George Foreman","KO 8","veteran IQ, durability and trap-setting under extreme pressure")}
 ],
 mayweather:[
  {year:1998,label:"1998 · 130-LB PRETTY BOY",...S("Junior Lightweight",88,100,91,97,96,100,98,97,86),bestPerformance:P("Genaro Hernández","RTD 8","title-winning version with sharp offense before the later hand-management era")},
  {year:2001,label:"2001 · LIGHTWEIGHT SHARPSHOOTER",...S("Lightweight",90,99,92,97,97,99,98,98,84),bestPerformance:P("Diego Corrales","TKO 10","arguably the definitive Pretty Boy performance: speed, power and control together")},
  {year:2005,label:"2005 · 140-LB ACTION FIGHTER",...S("Junior Welterweight",87,99,92,98,98,99,98,98,80),bestPerformance:P("Arturo Gatti","RTD 6","sustained offensive sharpness and combination punching at 140")},
  {year:2007,label:"2007 · PRETTY BOY WELTER",...S("Welterweight",84,98,93,99,99,98,97,99,74),bestPerformance:P("Ricky Hatton","TKO 10","welter/junior-middle period timing, check hooks and late-round control")},
  {year:2013,label:"2013 · MONEY MAYWEATHER",...S("Welterweight",76,94,94,100,100,97,96,100,60),bestPerformance:P("Canelo Álvarez","MD 12","the cleanest Money-era classroom: distance, pace denial and defensive economy")}
 ],
 pacquiao:[
  {year:2001,label:"2001 · FEATHERWEIGHT BREAKOUT",...S("Featherweight",96,100,94,90,94,99,100,94,99)},
  {year:2003,label:"2003 · 126/130-LB DYNAMO",...S("Junior Lightweight",97,100,94,91,95,100,100,95,99)},
  {year:2008,label:"2008 · LIGHTWEIGHT BLITZ",...S("Lightweight",96,100,95,92,96,99,100,96,98)},
  {year:2009,label:"2009 · WELTERWEIGHT STORM",...S("Welterweight",94,100,96,93,97,99,100,96,97)},
  {year:2015,label:"2015 · VETERAN SOUTHPAW",...S("Welterweight",89,96,95,94,98,96,97,94,86)}
 ],
 canelo:[
  {year:2013,label:"2013 · 154-LB COUNTERPUNCHER",...S("Junior Middleweight",92,90,96,92,92,88,91,93,88)},
  {year:2018,label:"2018 · MIDDLEWEIGHT PRIME",...S("Middleweight",94,89,98,95,96,89,94,95,89)},
  {year:2021,label:"2021 · 168-LB UNDISPUTED",...S("Super Middleweight",96,88,99,95,97,88,93,96,90)},
  {year:2022,label:"2022 · LIGHT HEAVY TEST",...S("Light Heavyweight",93,85,98,93,96,85,90,94,84)}
 ],
 crawford:[
  {year:2014,label:"2014 · LIGHTWEIGHT CHAMPION",...S("Lightweight",88,95,90,94,97,96,96,95,88)},
  {year:2017,label:"2017 · 140-LB UNDISPUTED",...S("Junior Welterweight",90,96,91,95,98,96,97,96,89)},
  {year:2023,label:"2023 · WELTERWEIGHT UNDISPUTED",...S("Welterweight",93,95,92,96,100,96,97,98,90),bestPerformance:P("Errol Spence Jr.","TKO 9","career-defining elite dismantling built on stance switches and counter timing")},
  {year:2024,label:"2024 · 154-LB CAMPAIGN",...S("Junior Middleweight",91,93,92,95,99,94,96,96,86)}
 ],
 usyk:[
  {year:2018,label:"2018 · CRUISERWEIGHT KING",...S("Cruiserweight",84,96,90,95,98,98,99,94,88)},
  {year:2021,label:"2021 · HEAVYWEIGHT BOXER",...S("Heavyweight",84,93,91,95,98,97,99,94,86)},
  {year:2024,label:"2024 · HEAVYWEIGHT UNDISPUTED",...S("Heavyweight",86,92,93,95,99,96,99,94,87)}
 ],
 fury:[
  {year:2015,label:"2015 · KLITSCHKO BOXER",...S("Heavyweight",86,89,92,95,96,95,95,89,78)},
  {year:2020,label:"2020 · WILDER II KRONK",...S("Heavyweight",91,87,94,92,96,93,95,89,91)},
  {year:2024,label:"2024 · VETERAN GIANT",...S("Heavyweight",88,83,94,89,96,88,91,87,84)}
 ],
 golovkin:[
  {year:2013,label:"2013 · COME-FORWARD DESTROYER",...S("Middleweight",98,88,100,87,94,91,97,94,98)},
  {year:2015,label:"2015 · PRIME GGG",...S("Middleweight",97,87,100,86,95,91,96,95,96)},
  {year:2017,label:"2017 · CANELO I VERSION",...S("Middleweight",95,85,100,88,96,90,95,94,92)},
  {year:2022,label:"2022 · VETERAN CHAMPION",...S("Middleweight",91,80,98,86,96,84,89,91,82)}
 ],
 ward:[
  {year:2009,label:"2009 · SUPER SIX ASCENT",...S("Super Middleweight",84,94,93,97,98,96,97,94,86)},
  {year:2011,label:"2011 · SUPER SIX MASTER",...S("Super Middleweight",85,93,94,98,100,96,98,95,84)},
  {year:2016,label:"2016 · LIGHT HEAVY CRAFT",...S("Light Heavyweight",86,89,95,99,100,93,95,94,80)}
 ],
 benavidez:[
  {year:2026,label:"2026 · CRUISERWEIGHT CHAMPION",...S("Cruiserweight",98,85,96,87,95,86,94,92,96,200),bestPerformance:P("Gilberto Ramírez","KO 6","latest cruiserweight statement: carried pressure, volume and finishing power all the way to 200 pounds")},
  {year:2025,label:"2025 · LIGHT HEAVY FORCE",...S("Light Heavyweight",97,86,96,88,95,87,95,92,97,175),bestPerformance:P("David Morrell","UD 12","light-heavy proof: imposed pace and physicality against a skilled southpaw technician")},
  {year:2023,label:"2023 · 168-LB MONSTER",...S("Super Middleweight",96,88,95,88,94,88,96,92,98,168),bestPerformance:P("Demetrius Andrade","RTD 6","super-middleweight pressure peak: broke a slick, unbeaten southpaw with body work and volume")}
 ],
 holyfield:[
  {year:1988,label:"1988 · CRUISERWEIGHT UNDISPUTED",...S("Cruiserweight",93,92,96,90,96,92,99,92,95)},
  {year:1990,label:"1990 · HEAVYWEIGHT ARRIVAL",...S("Heavyweight",91,90,96,90,96,91,98,91,93)},
  {year:1996,label:"1996 · TYSON I VETERAN",...S("Heavyweight",90,86,98,91,98,88,96,90,91)}
 ],
 hearns:[
  {year:1981,label:"1981 · WELTERWEIGHT HITMAN",...S("Welterweight",100,97,83,89,93,95,91,97,94)},
  {year:1984,label:"1984 · 154-LB PRIME",...S("Junior Middleweight",98,96,84,90,94,94,92,96,92)},
  {year:1985,label:"1985 · MIDDLEWEIGHT GAMBLE",...S("Middleweight",97,93,82,88,94,91,90,95,90)}
 ],
 leonard:[
  {year:1979,label:"1979 · WELTERWEIGHT STAR",...S("Welterweight",89,100,93,95,98,100,99,96,90)},
  {year:1981,label:"1981 · UNDISPUTED WELTER",...S("Welterweight",90,100,94,96,99,99,98,97,88)},
  {year:1987,label:"1987 · MIDDLEWEIGHT COMEBACK",...S("Middleweight",87,93,94,95,100,94,94,94,80)}
 ],
 hagler:[
  {year:1980,label:"1980 · MIDDLEWEIGHT CHAMPION",...S("Middleweight",93,91,100,93,96,94,100,94,95)},
  {year:1985,label:"1985 · WAR VERSION",...S("Middleweight",95,90,100,91,97,92,99,94,98)},
  {year:1987,label:"1987 · LEONARD FIGHT",...S("Middleweight",92,85,100,90,97,87,96,92,90)}
 ],
 jones:[
  {year:1993,label:"1993 · MIDDLEWEIGHT ROY",...S("Middleweight",93,100,91,98,97,100,97,98,86)},
  {year:1994,label:"1994 · 168-LB SUPERNOVA",...S("Super Middleweight",94,100,92,99,99,100,97,99,86)},
  {year:1999,label:"1999 · LIGHT HEAVY PRIME",...S("Light Heavyweight",94,100,91,98,98,100,96,98,84)},
  {year:2003,label:"2003 · HEAVYWEIGHT RUN",...S("Heavyweight",88,94,92,96,99,96,92,95,72)}
 ],
 delahoya:[
  {year:1995,label:"1995 · LIGHTWEIGHT GOLDEN BOY",...S("Lightweight",92,98,93,93,94,97,97,96,92)},
  {year:1997,label:"1997 · WELTERWEIGHT PRIME",...S("Welterweight",93,97,94,94,96,96,96,97,90)},
  {year:2002,label:"2002 · 154-LB CHAMPION",...S("Junior Middleweight",91,93,94,93,97,93,94,95,84)}
 ],
 duran:[
  {year:1972,label:"1972 · LIGHTWEIGHT DESTROYER",...S("Lightweight",97,92,100,91,99,93,100,96,100),bestPerformance:P("Ken Buchanan","TKO 13","lightweight king version: savage pressure, body punching and inside craft over championship distance")},
  {year:1980,label:"1980 · WELTERWEIGHT LEONARD I",...S("Welterweight",94,90,100,92,100,91,99,94,96),bestPerformance:P("Sugar Ray Leonard","UD 15","No Más I version: controlled a faster great with feints, infighting and ring generalship")},
  {year:1983,label:"1983 · 154-LB MOORE FIGHT",...S("Junior Middleweight",92,86,98,91,100,88,96,93,92),bestPerformance:P("Davey Moore","TKO 8","veteran masterpiece at 154: rough craft, counters and psychological pressure")},
  {year:1989,label:"1989 · MIDDLEWEIGHT BARKLEY",...S("Middleweight",88,82,99,90,100,84,94,91,86),bestPerformance:P("Iran Barkley","SD 12","old-master upset: timing, toughness and late-round brilliance above his natural weight")}
 ],
 mosley:[
  {year:1999,label:"1999 · LIGHTWEIGHT TERROR",...S("Lightweight",94,100,95,91,93,98,98,96,96)},
  {year:2000,label:"2000 · WELTERWEIGHT PRIME",...S("Welterweight",93,99,95,92,94,97,97,96,94)},
  {year:2009,label:"2009 · VETERAN POWER",...S("Welterweight",91,91,94,89,95,90,91,92,86)}
 ],
 chavez:[
  {year:1984,label:"1984 · 130-LB PRESSURE",...S("Junior Lightweight",91,92,99,90,95,93,100,94,100)},
  {year:1988,label:"1988 · LIGHTWEIGHT CHAMPION",...S("Lightweight",94,91,100,91,96,92,100,95,99)},
  {year:1990,label:"1990 · 140-LB TAYLOR FIGHT",...S("Junior Welterweight",93,89,100,90,97,90,100,94,99)}
 ],
 whitaker:[
  {year:1988,label:"1988 · LIGHTWEIGHT SWEET PEA",...S("Lightweight",77,99,92,100,99,100,97,96,68)},
  {year:1993,label:"1993 · WELTERWEIGHT MASTER",...S("Welterweight",75,96,93,100,100,98,96,96,64)},
  {year:1997,label:"1997 · DE LA HOYA VERSION",...S("Welterweight",72,92,92,98,99,94,93,94,60)}
 ],
 lomachenko:[
  {year:2014,label:"2014 · FEATHERWEIGHT TECHNICIAN",...S("Featherweight",84,100,91,99,99,100,98,97,88)},
  {year:2016,label:"2016 · 130-LB MATRIX",...S("Junior Lightweight",87,100,92,100,100,100,98,98,87),bestPerformance:P("Nicholas Walters","RTD 7","the ‘No Mas’ matrix performance: angles, layers and psychological control")},
  {year:2018,label:"2018 · LIGHTWEIGHT PRIME",...S("Lightweight",88,99,92,99,100,100,97,98,86)},
  {year:2023,label:"2023 · VETERAN LIGHTWEIGHT",...S("Lightweight",84,94,92,97,100,96,94,96,80),bestPerformance:P("Devin Haney","L 12","best veteran showing despite the disputed official loss; late-round layers still elite")}
 ],
 stevenson:[
  {year:2021,label:"2021 · 126/130-LB PURE BOXER",...S("Junior Lightweight",78,98,91,100,97,99,96,96,70),bestPerformance:P("Jamel Herring","TKO 10","breakout title performance: sharper offense layered onto the defensive base")},
  {year:2023,label:"2023 · 135-LB SHARPSHOOTER",...S("Lightweight",83,98,92,100,98,99,96,97,74),bestPerformance:P("Shuichiro Yoshino","TKO 6","best lightweight offensive statement; cleaner punching without abandoning safety")},
  {year:2024,label:"2024 · LIGHTWEIGHT MINIMALIST",...S("Lightweight",81,97,92,100,98,99,95,96,68),bestPerformance:P("Edwin De Los Santos","UD 12","extreme low-risk control, useful for modeling output questions and crowd frustration")},
  {year:2026,label:"2026 · 140-LB TECHNICIAN",...S("Junior Welterweight",82,97,92,100,99,99,96,97,72),bestPerformance:P("Teófimo López","UD 12","best 140-lb version in the archive: elite defensive control against an elite champion")}
 ],
 davis:[
  {year:2017,label:"2017 · 130-LB EXPLOSION",...S("Junior Lightweight",98,97,92,91,91,95,92,95,94),bestPerformance:P("José Pedraza","TKO 7","arrival performance: explosive finishing at junior lightweight")},
  {year:2020,label:"2020 · 135-LB POWER",...S("Lightweight",99,95,93,92,94,94,91,96,90),bestPerformance:P("Leo Santa Cruz","KO 6","signature one-punch lightweight highlight and uppercut timing")},
  {year:2024,label:"2024 · PATIENT COUNTERPUNCHER",...S("Lightweight",99,95,94,94,96,94,91,97,84),bestPerformance:P("Frank Martin","KO 8","patient read-and-finish version: slower start, brutal solved-route ending")}
 ],
 inoue:[
  {year:2014,label:"2014 · LIGHT FLYWEIGHT FORCE",...S("Junior Flyweight",96,98,92,94,96,97,97,97,96)},
  {year:2018,label:"2018 · BANTAMWEIGHT MONSTER",...S("Bantamweight",99,99,94,95,98,98,98,99,96)},
  {year:2024,label:"2024 · 122-LB KING",...S("Junior Featherweight",99,98,94,96,98,97,97,99,95)}
 ],
 lopez:[
  {year:2020,label:"2020 · LIGHTWEIGHT TAKEOVER",...S("Lightweight",95,96,91,90,92,94,92,94,91),bestPerformance:P("Vasiliy Lomachenko","UD 12","career-best lightweight win: athletic explosiveness plus disciplined early-round restraint")},
  {year:2023,label:"2023 · 140-LB TAYLOR FIGHT",...S("Junior Welterweight",92,96,91,92,94,95,93,94,86),bestPerformance:P("Josh Taylor","UD 12","best junior-welter performance: rhythm, confidence and counterpunching returned")},
  {year:2024,label:"2024 · RING CHAMPION",...S("Junior Welterweight",92,95,90,91,92,94,92,93,88)}
 ],
 ennis:[
  {year:2026,label:"2026 · 154-LB CHAMPION",...S("Junior Middleweight",94,95,93,94,98,95,96,96,89,154),bestPerformance:P("Xander Zayas","TKO 7","latest 154-lb statement: switch-hitting power and finishing confidence translated up to junior middleweight")},
  {year:2024,label:"2024 · 147-LB IBF CHAMPION",...S("Welterweight",92,97,92,94,96,96,96,96,90),bestPerformance:P("David Avanesyan","RTD 5","welterweight title-defense version: layered hand speed, stance changes and accumulating damage")},
  {year:2023,label:"2023 · VILLA FINISHER",...S("Welterweight",93,98,91,93,95,96,95,96,91),bestPerformance:P("Roiman Villa","KO 10","violent welterweight finisher: pressure read, power combinations and late stoppage")}
 ],
 haney:[
  {year:2026,label:"2026 · 147-LB WBO CHAMPION",...S("Welterweight",75,91,92,97,98,95,95,96,68,147),bestPerformance:P("Brian Norman Jr.","UD 12","latest welterweight title win: moved to 147, dropped Norman early and managed the championship distance without becoming a puncher")},
  {year:2023,label:"2023 · 140-LB PROGRAIS MASTERCLASS",...S("Junior Welterweight",76,94,92,98,98,96,96,97,72),bestPerformance:P("Regis Prograis","UD 12","best 140-lb control performance: jab, defense and clean scoring with no power illusion")},
  {year:2022,label:"2022 · 135-LB UNDISPUTED",...S("Lightweight",75,94,91,97,97,96,95,96,73),bestPerformance:P("George Kambosos Jr.","UD 12","undisputed lightweight control: jab, distance and composure on the road")}
 ],
 ryangarcia:[
  {year:2026,label:"2026 · 147-LB WELTERWEIGHT",...S("Welterweight",94,93,88,83,87,87,89,89,86,147),bestPerformance:P("Welterweight campaign","CURRENT","current 147-lb version: left-hook danger remains, but stamina, structure and defensive discipline are still the scouting questions")},
  {year:2024,label:"2024 · 140-LB HANEY FIGHT",...S("Junior Welterweight",97,96,90,84,89,89,91,91,90),bestPerformance:P("Devin Haney","MD 12","highest-profile win: hand speed, left-hook danger and multiple knockdowns")},
  {year:2021,label:"2021 · LIGHTWEIGHT CAMPBELL TEST",...S("Lightweight",95,97,88,84,88,90,91,91,88),bestPerformance:P("Luke Campbell","KO 7","lightweight proof: rose from a knockdown and finished with a body shot")}
 ],
 beterbiev:[
  {year:2019,label:"2019 · GVOZDYK FIGHT",...S("Light Heavyweight",99,85,96,88,94,87,97,93,99)},
  {year:2024,label:"2024 · UNDISPUTED PRESSURE",...S("Light Heavyweight",99,84,96,88,95,86,96,93,98)}
 ],
 bivol:[
  {year:2022,label:"2022 · CANELO MASTERCLASS",...S("Light Heavyweight",86,96,92,98,98,98,98,97,82)},
  {year:2024,label:"2024 · ELITE CONTENDER",...S("Light Heavyweight",86,95,92,97,98,98,98,96,82)}
 ],
 foreman:[
  {year:1973,label:"1973 · PRIME DESTROYER",...S("Heavyweight",100,83,97,84,91,84,93,91,98)},
  {year:1994,label:"1994 · OLD MAN POWER",...S("Heavyweight",99,70,99,82,96,72,88,88,76)}
 ],
 lewis:[
  {year:1999,label:"1999 · UNDISPUTED HEAVY",...S("Heavyweight",97,89,92,94,98,92,94,96,90)},
  {year:2002,label:"2002 · TYSON FIGHT",...S("Heavyweight",96,86,93,95,99,89,92,95,84)}
 ],
 klitschko:[
  {year:2006,label:"2006 · REBUILT CHAMPION",...S("Heavyweight",97,88,90,93,94,90,95,94,84)},
  {year:2011,label:"2011 · CONTROL KING",...S("Heavyweight",97,86,91,94,97,89,94,95,80)},
  {year:2015,label:"2015 · VETERAN CHAMPION",...S("Heavyweight",94,82,91,92,97,84,90,92,72)}
 ],
 joshua:[
  {year:2017,label:"2017 · KLITSCHKO WIN",...S("Heavyweight",97,90,91,89,91,88,90,92,93)},
  {year:2021,label:"2021 · BOXING RESET",...S("Heavyweight",94,86,91,90,93,87,89,90,82)},
  {year:2024,label:"2024 · COMEBACK FORM",...S("Heavyweight",96,87,92,90,94,88,91,91,88)}
 ],
 rodriguez:[
  {year:2026,label:"2026 · UNIFIED 115-LB KING",...S("Junior Bantamweight",92,99,94,96,99,100,98,98,92,115),bestPerformance:P("Fernando Martínez","KO 10","latest unified version: added the WBA belt with a dominant knockout of an unbeaten champion")},
  {year:2025,label:"2025 · CAFU UNIFICATION",...S("Junior Bantamweight",92,99,93,96,99,100,98,98,92,115),bestPerformance:P("Phumelele Cafu","TKO 10","WBO unification step: solved a long, awkward champion and kept stacking belts at 115")},
  {year:2022,label:"2022 · 115-LB BREAKOUT",...S("Junior Bantamweight",90,99,92,94,97,99,97,97,93)},
  {year:2024,label:"2024 · RING CHAMPION",...S("Junior Bantamweight",91,98,93,95,98,99,97,98,91)}
 ],
 gonzalez:[
  {year:2012,label:"2012 · 108-LB PRIME",...S("Junior Flyweight",91,98,96,94,98,98,100,98,100)},
  {year:2015,label:"2015 · P4P KING",...S("Junior Bantamweight",92,97,97,94,99,97,100,98,99)},
  {year:2021,label:"2021 · VETERAN MASTER",...S("Junior Bantamweight",88,92,96,93,99,92,96,96,92)}
 ],
 donaire:[
  {year:2011,label:"2011 · BANTAMWEIGHT FLASH",...S("Bantamweight",98,97,94,91,94,95,95,96,92)},
  {year:2012,label:"2012 · 122-LB FOTY",...S("Junior Featherweight",98,96,95,91,94,94,95,96,92)},
  {year:2019,label:"2019 · VETERAN BANTAM",...S("Bantamweight",95,88,97,89,97,88,92,93,82)}
 ]
};
const heavyweightVersionWeights={
 tyson:{1986:221,1988:218,1996:222},
 ali:{1964:210,1967:212,1974:216},
 usyk:{2021:221,2024:223,2018:199},
 fury:{2015:247,2020:273,2024:262},
 holyfield:{1988:190,1990:208,1996:215},
 foreman:{1973:217,1994:250},
 lewis:{1999:242,2002:249},
 klitschko:{2006:241,2011:242,2015:245},
 joshua:{2017:250,2021:240,2024:252},
 jones:{2003:193}
};
for(const [id,weights] of Object.entries(heavyweightVersionWeights)){
 const versions=global.ROSTER_VERSION_PACK[id]||[];
 versions.forEach(version=>{if(weights[version.year])version.weight=weights[version.year]});
}
const signaturePerformances={
 pacquiao:{
  2001:P("Lehlo Ledwaba","TKO 6","breakout U.S. arrival: speed, angles and southpaw explosiveness announced the lower-weight storm"),
  2003:P("Marco Antonio Barrera","TKO 11","career-changing demolition of an elite great, showing pace and power at featherweight"),
  2008:P("David Díaz","TKO 9","lightweight belt win with hand speed and angle volume fully translated up the scale"),
  2009:P("Miguel Cotto","TKO 12","signature welterweight storm: speed, durability and sustained damage at the highest level"),
  2015:P("Timothy Bradley","UD 12","veteran southpaw control: cleaner timing and footwork against an elite repeat opponent")
 },
 canelo:{
  2013:P("Austin Trout","UD 12","154-lb proof of counterpunching patience against a tall southpaw champion"),
  2018:P("Gennady Golovkin","MD 12","middleweight prime statement: stood ground, countered under fire and banked elite exchanges"),
  2021:P("Caleb Plant","TKO 11","undisputed 168-lb finish built on pressure, body work and late-round problem solving"),
  2022:P("Sergey Kovalev","KO 11","best light-heavyweight success: patient pressure and a sudden elite finishing sequence")
 },
 crawford:{
  2014:P("Yuriorkis Gamboa","TKO 9","lightweight danger check: hurt early, adjusted, then punished an elite speed threat"),
  2017:P("Julius Indongo","KO 3","140-lb undisputed snapshot: switch-hitting control ending in a body-shot finish"),
  2024:P("Israil Madrimov","UD 12","154-lb campaign evidence: controlled risk while solving a bigger, awkward mover")
 },
 usyk:{
  2018:P("Murat Gassiev","UD 12","cruiserweight masterpiece: movement, volume and ring IQ made a dangerous puncher reset all night"),
  2021:P("Anthony Joshua","UD 12","heavyweight arrival: southpaw angles and pace beat a much larger champion"),
  2024:P("Tyson Fury","SD 12","undisputed heavyweight proof: late surge, pressure pockets and elite adjustment under size disadvantage")
 },
 fury:{
  2015:P("Wladimir Klitschko","UD 12","awkward long-range disruption that froze a dominant champion’s jab-and-clinch system"),
  2020:P("Deontay Wilder","TKO 7","Kronk transformation: front-foot size, mauling pressure and physical command"),
  2024:P("Dillian Whyte","TKO 6","veteran giant control: range, feints and an uppercut finish without needing reckless pace")
 },
 golovkin:{
  2013:P("Matthew Macklin","KO 3","body-shot destruction that captured prime GGG’s pressure and finishing menace"),
  2015:P("David Lemieux","TKO 8","jab-first demolition proving he could box a puncher before breaking him down"),
  2017:P("Canelo Álvarez","D 12","elite pressure performance where the jab, chin and pace shaped the public argument"),
  2022:P("Ryōta Murata","TKO 9","veteran champion showing: slower start, then jab pressure and heavy hands took over")
 },
 ward:{
  2009:P("Mikkel Kessler","TD 11","Super Six arrival: inside craft, clinch IQ and defensive timing against an established champion"),
  2011:P("Carl Froch","UD 12","Super Six masterclass: range denial, inside control and calm problem-solving"),
  2016:P("Sergey Kovalev","UD 12","light-heavy craft test: recovered from danger and solved elite jab-power structure late")
 },
 holyfield:{
  1988:P("Dwight Muhammad Qawi","UD 15","cruiserweight furnace: pace, toughness and combination depth over championship distance"),
  1990:P("Buster Douglas","KO 3","heavyweight arrival with sharp timing and sudden finishing precision"),
  1996:P("Mike Tyson","TKO 11","veteran heavyweight masterpiece: clinch strength, courage and tactical discipline")
 },
 hearns:{
  1981:P("Pipino Cuevas","TKO 2","welterweight Hitman thesis: long jab, right hand and terrifying range power"),
  1984:P("Roberto Durán","KO 2","154-lb peak violence: one of boxing’s cleanest elite-fighter knockouts"),
  1985:P("James Shuler","KO 1","middleweight puncher proof: immediate right-hand danger against a highly regarded contender")
 },
 leonard:{
  1979:P("Wilfred Benítez","TKO 15","young welter star’s title breakthrough with speed, poise and late championship finish"),
  1981:P("Thomas Hearns","TKO 14","undisputed welter classic: adaptation, survival and finishing under long-range danger"),
  1987:P("Marvin Hagler","SD 12","middleweight comeback craft: bursts, movement and judging optics against a legend")
 },
 hagler:{
  1980:P("Alan Minter","TKO 3","championship seizure: southpaw pressure and finishing intent from the opening bell"),
  1985:P("Thomas Hearns","TKO 3","war version defined: chin, pressure and ruthless finishing in boxing’s great shootout"),
  1987:P("John Mugabi","KO 11","late-prime pressure test: absorbed danger and broke down a younger puncher")
 },
 jones:{
  1993:P("Bernard Hopkins","UD 12","middleweight Roy: speed, reflexes and control before the athletic peak fully exploded"),
  1994:P("James Toney","UD 12","168-lb supernova: reflex dominance and timing against an elite technician"),
  1999:P("Reggie Johnson","UD 12","light-heavy prime: speed gap, knockdowns and command over a proven champion"),
  2003:P("John Ruiz","UD 12","heavyweight run: historic jump built on speed, restraint and clean positional control")
 },
 delahoya:{
  1995:P("Rafael Ruelas","TKO 2","lightweight Golden Boy peak: fast, sharp and violent finishing against a champion"),
  1997:P("Julio César Chávez","RTD 8","welterweight prime control: jab, cuts and speed against a legendary pressure fighter"),
  2002:P("Fernando Vargas","TKO 11","154-lb signature: tactical composure, left hook damage and late finish")
 },
 mosley:{
  1999:P("Jesse James Leija","TKO 9","lightweight terror: speed, combinations and finishing pressure at 135"),
  2000:P("Oscar De La Hoya","SD 12","welterweight prime win built on speed, body work and championship-round urgency"),
  2009:P("Antonio Margarito","TKO 9","veteran power night: clinch strength, right hands and sustained punishment")
 },
 chavez:{
  1984:P("Mario Martínez","TKO 8","130-lb title arrival: body pressure and finishing craft"),
  1988:P("Edwin Rosario","TKO 11","lightweight pressure masterpiece: body work, chin and intelligent mauling"),
  1990:P("Meldrick Taylor","TKO 12","140-lb pressure classic: relentless damage and last-second finishing will")
 },
 whitaker:{
  1988:P("José Luis Ramírez","UD 12","lightweight correction: defensive genius and clean boxing restored the argument"),
  1993:P("Julio César Chávez","D 12","welterweight masterclass despite the draw: angles, counters and ring control"),
  1997:P("Oscar De La Hoya","L 12","late-version evidence: still made an elite young champion miss and debate the cards")
 },
 lomachenko:{
  2014:P("Gary Russell Jr.","MD 12","featherweight technician’s title proof: angles and pace against elite hand speed"),
  2018:P("Jorge Linares","TKO 10","lightweight prime: survived a knockdown, adjusted and finished with body work")
 },
 inoue:{
  2014:P("Omar Narváez","KO 2","light-flyweight force jumping divisions and detonating an elite veteran"),
  2018:P("Emmanuel Rodríguez","KO 2","bantamweight Monster peak: elite opponent erased by speed and power"),
  2024:P("Stephen Fulton","TKO 8","122-lb king performance: patient read, jab control and violent finishing")
 },
 lopez:{
  2024:P("Steve Claggett","UD 12","ring-champion activity fight: long-form offense and confidence against constant pressure")
 },
 beterbiev:{
  2019:P("Oleksandr Gvozdyk","TKO 10","elite pressure breakthrough: broke an Olympic-level champion with compounding force"),
  2024:P("Dmitry Bivol","MD 12","undisputed pressure case: late physicality and persistence against elite footwork")
 },
 bivol:{
  2022:P("Canelo Álvarez","UD 12","masterclass in distance, jab discipline and high-guard exits against a superstar"),
  2024:P("Artur Beterbiev","L 12","elite contender proof even in defeat: footwork and clean boxing kept the fight razor-close")
 },
 foreman:{
  1973:P("Joe Frazier","TKO 2","prime destroyer statement: physical force overwhelmed an undefeated champion"),
  1994:P("Michael Moorer","KO 10","old-man power forever: patience, durability and one historic right hand")
 },
 lewis:{
  1999:P("Evander Holyfield","UD 12","undisputed heavyweight proof: jab, size and tactical discipline over twelve"),
  2002:P("Mike Tyson","KO 8","veteran champion control: long jab, clinch strength and composed finishing")
 },
 klitschko:{
  2006:P("Chris Byrd","TKO 7","rebuilt champion version: jab-right control and Steward-era structure"),
  2011:P("David Haye","UD 12","control king template: distance management, clinch geography and risk denial"),
  2015:P("Kubrat Pulev","KO 5","veteran champion power still attached to a disciplined jab system")
 },
 joshua:{
  2017:P("Wladimir Klitschko","TKO 11","defining heavyweight arrival: survived crisis and found the championship finish"),
  2021:P("Kubrat Pulev","KO 9","boxing reset evidence: patient jab, right-hand timing and measured finishing"),
  2024:P("Francis Ngannou","KO 2","comeback-form statement: calm reads and explosive straight-right finishing")
 },
 rodriguez:{
  2022:P("Carlos Cuadras","UD 12","115-lb breakout: teenage poise, angles and volume against a proven champion"),
  2024:P("Juan Francisco Estrada","KO 7","ring-champion statement: body-shot finish after layered southpaw pressure")
 },
 gonzalez:{
  2012:P("Juan Francisco Estrada","UD 12","108-lb prime evidence: pressure, combinations and inside craft over twelve"),
  2015:P("Brian Viloria","TKO 9","P4P king snapshot: volume, body work and relentless elite offense"),
  2021:P("Juan Francisco Estrada","L 12","veteran masterclass despite the decision: pace and combination craft remained elite")
 },
 donaire:{
  2011:P("Fernando Montiel","KO 2","bantamweight flash: iconic left-hook power against an elite champion"),
  2012:P("Toshiaki Nishioka","TKO 9","122-lb FOTY version: patience, timing and late finishing quality"),
  2019:P("Naoya Inoue","L 12","veteran bantam proof: hurt the Monster and pushed an all-time great through hell")
 }
};
for(const [id,performances] of Object.entries(signaturePerformances)){
 const versions=global.ROSTER_VERSION_PACK[id]||[];
 versions.forEach(version=>{if(!version.bestPerformance&&performances[version.year])version.bestPerformance=performances[version.year]});
}
})(window);
