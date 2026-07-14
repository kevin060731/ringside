(function(global){
const imgs=[
"https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=500&q=85",
"https://images.unsplash.com/photo-1615117972428-28de67cda58e?auto=format&fit=crop&w=500&q=85",
"https://images.unsplash.com/photo-1583473848882-f9a5bc7fd2ee?auto=format&fit=crop&w=500&q=85",
"https://images.unsplash.com/photo-1591117207239-788bf8de6c3b?auto=format&fit=crop&w=500&q=85"
];
const lastName=name=>name.split(" ").filter(part=>!["Jr.","Jr","Sr.","Sr","II","III","IV"].includes(part)).at(-1);
global.WEIGHT_CLASSES=["Heavyweight","Cruiserweight","Light Heavyweight","Super Middleweight","Middleweight","Junior Middleweight","Welterweight","Junior Welterweight","Lightweight","Junior Lightweight","Featherweight","Junior Featherweight","Bantamweight","Junior Bantamweight","Flyweight","Junior Flyweight","Strawweight"];
const divisionWeights={Heavyweight:224,Cruiserweight:200,"Light Heavyweight":175,"Super Middleweight":168,Middleweight:160,"Junior Middleweight":154,Welterweight:147,"Junior Welterweight":140,Lightweight:135,"Junior Lightweight":130,Featherweight:126,"Junior Featherweight":122,Bantamweight:118,"Junior Bantamweight":115,Flyweight:112,"Junior Flyweight":108,Strawweight:105};
const f=(id,name,nickname,country,stance,division,year,label,r,img=0)=>({id,name,last:lastName(name),nickname,country,stance,division,years:[{year,label,weight:divisionWeights[division],...r}],img:imgs[img%imgs.length]});
global.EXTRA_FIGHTERS=[
 f("holyfield","Evander Holyfield","The Real Deal","USA","Orthodox","Cruiserweight",1988,"1988 · UNDISPUTED",{power:92,speed:91,chin:95,defense:89,iq:95,footwork:91,cardio:98,accuracy:91,aggression:94},0),
 f("opetaia","Jai Opetaia","The Australian","AUS","Southpaw","Cruiserweight",2024,"2024 · RING CHAMPION",{power:91,speed:92,chin:91,defense:90,iq:93,footwork:92,cardio:95,accuracy:92,aggression:91},1),
 f("beterbiev","Artur Beterbiev","King Artur","CAN","Orthodox","Light Heavyweight",2024,"2024 · UNDISPUTED",{power:99,speed:84,chin:96,defense:88,iq:94,footwork:86,cardio:96,accuracy:93,aggression:98},2),
 f("bivol","Dmitry Bivol","The Technician","KGZ","Orthodox","Light Heavyweight",2024,"2024 · ELITE CONTENDER",{power:86,speed:95,chin:92,defense:97,iq:98,footwork:98,cardio:98,accuracy:96,aggression:82},3),
 f("ward","Andre Ward","S.O.G.","USA","Orthodox","Super Middleweight",2011,"2011 · SUPER SIX",{power:85,speed:93,chin:93,defense:98,iq:100,footwork:96,cardio:97,accuracy:95,aggression:84},0),
 f("hagler","Marvin Hagler","Marvelous","USA","Southpaw","Middleweight",1985,"1985 · PRIME",{power:94,speed:91,chin:100,defense:92,iq:97,footwork:93,cardio:99,accuracy:94,aggression:96},1),
 f("hearns","Thomas Hearns","The Hitman","USA","Orthodox","Junior Middleweight",1984,"1984 · PRIME",{power:98,speed:96,chin:84,defense:90,iq:94,footwork:94,cardio:91,accuracy:96,aggression:92},2),
 f("leonard","Sugar Ray Leonard","Sugar","USA","Orthodox","Welterweight",1981,"1981 · UNDISPUTED",{power:90,speed:100,chin:94,defense:96,iq:99,footwork:99,cardio:98,accuracy:97,aggression:88},3),
 f("lopez","Teófimo López","The Takeover","USA","Orthodox","Junior Welterweight",2024,"2024 · RING CHAMPION",{power:92,speed:95,chin:90,defense:91,iq:92,footwork:94,cardio:92,accuracy:93,aggression:88},0),
 f("chavez","Julio César Chávez","J.C. Superstar","MEX","Orthodox","Lightweight",1988,"1988 · RING CHAMPION",{power:94,speed:91,chin:100,defense:91,iq:96,footwork:92,cardio:100,accuracy:95,aggression:99},1),
 f("whitaker","Pernell Whitaker","Sweet Pea","USA","Southpaw","Lightweight",1988,"1988 · #1 CONTENDER",{power:77,speed:99,chin:92,defense:100,iq:99,footwork:100,cardio:97,accuracy:96,aggression:68},2),
 f("davis","Gervonta Davis","Tank","USA","Southpaw","Lightweight",2024,"2024 · #1 CONTENDER",{power:99,speed:95,chin:93,defense:94,iq:95,footwork:94,cardio:91,accuracy:97,aggression:87},3),
 f("nelson","Azumah Nelson","The Professor","GHA","Orthodox","Junior Lightweight",1988,"1988 · #1 CONTENDER",{power:92,speed:92,chin:98,defense:93,iq:98,footwork:93,cardio:98,accuracy:94,aggression:92},0),
 f("fenech","Jeff Fenech","The Marrickville Mauler","AUS","Orthodox","Featherweight",1988,"1988 · #1 CONTENDER",{power:89,speed:94,chin:96,defense:87,iq:92,footwork:91,cardio:99,accuracy:91,aggression:100},1),
 f("pacquiao","Manny Pacquiao","PacMan","PHI","Southpaw","Featherweight",2001,"2001 · BREAKOUT",{power:96,speed:100,chin:94,defense:90,iq:95,footwork:99,cardio:100,accuracy:94,aggression:98},2),
 f("inoue","Naoya Inoue","The Monster","JPN","Orthodox","Junior Featherweight",2024,"2024 · RING CHAMPION",{power:99,speed:98,chin:94,defense:96,iq:98,footwork:97,cardio:97,accuracy:99,aggression:95},3),
 f("nakatani","Junto Nakatani","Big Bang","JPN","Southpaw","Bantamweight",2024,"2024 · #1 CONTENDER",{power:96,speed:95,chin:93,defense:93,iq:96,footwork:95,cardio:96,accuracy:96,aggression:92},0),
 f("canizales","Orlando Canizales","The Pride of Laredo","USA","Orthodox","Bantamweight",1988,"1988 · TOP FIVE",{power:87,speed:95,chin:94,defense:95,iq:97,footwork:97,cardio:99,accuracy:95,aggression:88},1),
 f("rodriguez","Jesse Rodriguez","Bam","USA","Southpaw","Junior Bantamweight",2024,"2024 · RING CHAMPION",{power:91,speed:98,chin:93,defense:95,iq:98,footwork:99,cardio:97,accuracy:98,aggression:91},2),
 f("teraji","Kenshiro Teraji","The Amazing Boy","JPN","Orthodox","Flyweight",2024,"2024 · ELITE CONTENDER",{power:90,speed:96,chin:92,defense:94,iq:96,footwork:96,cardio:98,accuracy:96,aggression:94},3),
 f("yabuki","Masamichi Yabuki","The Destroyer","JPN","Orthodox","Junior Flyweight",2024,"2024 · #1 CONTENDER",{power:93,speed:93,chin:91,defense:89,iq:92,footwork:91,cardio:95,accuracy:92,aggression:96},0),
 f("collazo","Oscar Collazo","El Pupilo","PUR","Southpaw","Strawweight",2024,"2024 · RING CHAMPION",{power:91,speed:96,chin:92,defense:94,iq:96,footwork:96,cardio:97,accuracy:97,aggression:93},1)
];
})(window);
