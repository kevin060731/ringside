(function(global){
const fallback="https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=500&q=85";
const lastName=name=>name.split(" ").filter(part=>!["Jr.","Jr","Sr.","Sr","II","III","IV"].includes(part)).at(-1);
const divisionWeights={Heavyweight:224,Cruiserweight:200,"Light Heavyweight":175,"Super Middleweight":168,Middleweight:160,"Junior Middleweight":154,Welterweight:147,"Junior Welterweight":140,Lightweight:135,"Junior Lightweight":130,Featherweight:126,"Junior Featherweight":122,Bantamweight:118,"Junior Bantamweight":115,Flyweight:112,"Junior Flyweight":108,Strawweight:105};
const heavyweightWeights={louis:200,marciano:184,frazier:205,foreman:217,lewis:242,klitschko:242,wilder:219,joshua:250,dubois:248,langford:185,fitzsimmons:167};
const mk=(id,name,nickname,country,stance,division,year,label,s,wiki=name)=>({id,name,last:lastName(name),nickname,country,stance,division,wiki,years:[{year,label,weight:heavyweightWeights[id]||divisionWeights[division],...s}],img:fallback});
const S=(power,speed,chin,defense,iq,footwork,cardio,accuracy,aggression)=>({power,speed,chin,defense,iq,footwork,cardio,accuracy,aggression});
global.EXTRA_FIGHTERS.push(
 mk("louis","Joe Louis","The Brown Bomber","USA","Orthodox","Heavyweight",1938,"1938 · PRIME",S(97,91,94,92,97,92,97,96,94)),
 mk("marciano","Rocky Marciano","The Brockton Blockbuster","USA","Orthodox","Heavyweight",1952,"1952 · CHAMPION",S(98,84,99,84,92,85,100,89,100)),
 mk("frazier","Joe Frazier","Smokin’ Joe","USA","Orthodox","Heavyweight",1971,"1971 · FIGHT OF THE CENTURY",S(96,88,98,87,94,90,100,91,100)),
 mk("foreman","George Foreman","Big George","USA","Orthodox","Heavyweight",1973,"1973 · PRIME",S(100,83,97,84,91,84,93,91,98)),
 mk("lewis","Lennox Lewis","The Lion","GBR","Orthodox","Heavyweight",1999,"1999 · UNDISPUTED",S(97,89,92,94,98,92,94,96,90)),
 mk("klitschko","Wladimir Klitschko","Dr. Steelhammer","UKR","Orthodox","Heavyweight",2011,"2011 · CHAMPION",S(97,86,91,94,96,89,94,95,82)),
 mk("wilder","Deontay Wilder","The Bronze Bomber","USA","Orthodox","Heavyweight",2019,"2019 · CHAMPION",S(100,91,89,82,87,85,92,89,94)),
 mk("joshua","Anthony Joshua","AJ","GBR","Orthodox","Heavyweight",2017,"2017 · UNIFIED CHAMPION",S(96,89,91,89,91,88,90,92,92)),
 mk("dubois","Daniel Dubois","Dynamite","GBR","Orthodox","Heavyweight",2024,"2024 · TOP CONTENDER",S(96,88,93,87,90,87,94,91,95)),
 mk("qawi","Dwight Muhammad Qawi","The Camden Buzzsaw","USA","Orthodox","Cruiserweight",1986,"1986 · CHAMPION",S(94,89,98,92,96,91,98,93,99)),
 mk("jones","Roy Jones Jr.","Captain Hook","USA","Orthodox","Light Heavyweight",1999,"1999 · PRIME",S(94,100,91,98,98,100,96,98,84),"Roy Jones Jr."),
 mk("moore","Archie Moore","The Old Mongoose","USA","Orthodox","Light Heavyweight",1955,"1955 · CHAMPION",S(97,88,96,95,100,93,96,97,89)),
 mk("langford","Sam Langford","The Boston Bonecrusher","CAN","Orthodox","Heavyweight",1910,"1910 · P4P GREAT",S(98,90,99,91,100,91,100,95,97)),
 mk("fitzsimmons","Bob Fitzsimmons","Ruby Robert","GBR","Orthodox","Heavyweight",1897,"1897 · TWO-DIVISION PIONEER",S(99,86,94,88,99,88,97,94,93)),
 mk("kovalev","Sergey Kovalev","Krusher","RUS","Orthodox","Light Heavyweight",2015,"2015 · #1 CONTENDER",S(97,89,91,89,93,89,93,94,94)),
 mk("calzaghe","Joe Calzaghe","The Pride of Wales","WAL","Southpaw","Super Middleweight",2007,"2007 · UNDISPUTED",S(86,98,94,96,98,97,100,95,94)),
 mk("froch","Carl Froch","The Cobra","GBR","Orthodox","Super Middleweight",2013,"2013 · CHAMPION",S(92,87,99,86,92,88,98,90,97)),
 mk("robinson","Sugar Ray Robinson","Sugar","USA","Orthodox","Middleweight",1951,"1951 · PRIME",S(95,100,96,97,100,100,98,99,94)),
 mk("greb","Harry Greb","The Pittsburgh Windmill","USA","Orthodox","Middleweight",1922,"1922 · WINDMILL PRIME",S(88,99,100,91,99,98,100,91,100)),
 mk("monzon","Carlos Monzón","Escopeta","ARG","Orthodox","Middleweight",1972,"1972 · CHAMPION",S(94,89,98,94,99,92,99,96,91),"Carlos Monzón"),
 mk("hopkins","Bernard Hopkins","The Executioner","USA","Orthodox","Middleweight",2001,"2001 · UNDISPUTED",S(88,91,97,99,100,96,98,97,86)),
 mk("mccallum","Mike McCallum","The Body Snatcher","JAM","Orthodox","Junior Middleweight",1987,"1987 · CHAMPION",S(93,92,97,95,99,94,98,97,93)),
 mk("jackson","Julian Jackson","The Hawk","VIR","Orthodox","Junior Middleweight",1989,"1989 · CHAMPION",S(100,91,88,83,90,87,91,94,96)),
 mk("delahoya","Oscar De La Hoya","The Golden Boy","USA","Orthodox","Welterweight",1997,"1997 · PRIME",S(93,97,94,94,96,96,96,97,90),"Oscar De La Hoya"),
 mk("duran","Roberto Durán","Manos de Piedra","PAN","Orthodox","Lightweight",1978,"1978 · LIGHTWEIGHT KING",S(96,92,100,91,99,93,100,95,100),"Roberto Durán"),
 mk("gans","Joe Gans","The Old Master","USA","Orthodox","Lightweight",1906,"1906 · OLD MASTER",S(91,94,96,98,100,96,99,98,82)),
 mk("trinidad","Félix Trinidad","Tito","PUR","Orthodox","Welterweight",1999,"1999 · CHAMPION",S(97,93,95,89,94,92,96,95,95),"Félix Trinidad"),
 mk("mosley","Shane Mosley","Sugar","USA","Orthodox","Welterweight",2000,"2000 · PRIME",S(93,99,95,92,94,97,97,96,94)),
 mk("pryor","Aaron Pryor","The Hawk","USA","Orthodox","Junior Welterweight",1982,"1982 · CHAMPION",S(94,97,97,88,94,94,100,94,100)),
 mk("taylor","Josh Taylor","The Tartan Tornado","SCO","Southpaw","Junior Welterweight",2021,"2021 · UNDISPUTED",S(90,92,94,91,94,93,96,93,92)),
 mk("lomachenko","Vasiliy Lomachenko","Hi-Tech","UKR","Southpaw","Lightweight",2018,"2018 · PRIME",S(88,99,92,99,100,100,97,98,86)),
 mk("stevenson","Shakur Stevenson","Fearless","USA","Southpaw","Lightweight",2024,"2024 · TOP CONTENDER",S(82,97,92,100,98,99,95,96,72)),
 mk("arguello","Alexis Argüello","The Explosive Thin Man","NIC","Orthodox","Junior Lightweight",1978,"1978 · CHAMPION",S(97,92,95,93,97,94,97,97,92),"Alexis Argüello"),
 mk("armstrong","Henry Armstrong","Homicide Hank","USA","Orthodox","Featherweight",1938,"1938 · THREE-DIVISION TERROR",S(92,96,100,91,99,96,100,94,100)),
 mk("pep","Willie Pep","Will o’ the Wisp","USA","Orthodox","Featherweight",1946,"1946 · PRIME",S(76,100,93,100,100,100,99,97,67)),
 mk("sanchez","Salvador Sánchez","Chava","MEX","Orthodox","Featherweight",1981,"1981 · CHAMPION",S(92,96,98,97,99,97,100,96,91),"Salvador Sánchez"),
 mk("hamed","Naseem Hamed","Prince","GBR","Southpaw","Featherweight",1997,"1997 · CHAMPION",S(98,98,91,88,92,97,93,95,91)),
 mk("barrera","Marco Antonio Barrera","The Baby-Faced Assassin","MEX","Orthodox","Junior Featherweight",2000,"2000 · PRIME",S(92,94,97,93,97,94,99,95,96)),
 mk("jofre","Éder Jofre","Golden Bantam","BRA","Orthodox","Bantamweight",1962,"1962 · CHAMPION",S(94,96,98,96,99,97,99,98,94),"Éder Jofre"),
 mk("donaire","Nonito Donaire","The Filipino Flash","PHI","Orthodox","Bantamweight",2012,"2012 · FIGHTER OF THE YEAR",S(98,96,95,91,94,94,95,96,92)),
 mk("gonzalez","Román González","Chocolatito","NIC","Orthodox","Junior Bantamweight",2015,"2015 · P4P KING",S(92,97,97,94,99,97,100,98,99),"Román González (boxer)"),
 mk("estrada","Juan Francisco Estrada","El Gallo","MEX","Orthodox","Junior Bantamweight",2022,"2022 · CHAMPION",S(91,95,96,95,98,96,98,97,94)),
 mk("wilde","Jimmy Wilde","The Mighty Atom","WAL","Orthodox","Flyweight",1919,"1919 · CHAMPION",S(98,96,91,91,97,96,99,96,98)),
 mk("chang","Jung-Koo Chang","The Korean Hawk","KOR","Orthodox","Junior Flyweight",1988,"1988 · #1 CONTENDER",S(90,97,98,95,98,98,100,96,99)),
 mk("lopezfinito","Ricardo López","El Finito","MEX","Orthodox","Strawweight",1997,"1997 · UNDEFEATED CHAMPION",S(94,96,97,98,100,98,98,99,90),"Ricardo López (boxer)")
);
})(window);
