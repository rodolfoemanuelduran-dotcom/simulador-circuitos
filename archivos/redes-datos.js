/* Catálogo de prácticas de serie, paralelo, mixtos, protección y diagnóstico.
   Cada práctica describe sus componentes, su ubicación en la mesa y la solución
   de referencia. El motor (circuito-redes.html) calcula todo con las leyes de
   Ohm y Kirchhoff, sin tablas precargadas de resultados. */
window.REDES=(function(){
const bat=v=>({id:'B',t:'bat',v,name:'Batería '+v+' V'});
const sw=id=>({id,t:'sw',name:'Llave '+id});
const lamp=(id,r)=>({id,t:'lamp',r:r||12,vr:12,name:'Lámpara '+id});
const res=(id,r)=>({id,t:'res',r,name:'Resistor '+id});
const fuse=(id,amp)=>({id,t:'fuse',amp,name:'Fusible '+amp+' A'});
const led=id=>({id,t:'led',name:'LED'});
const pairs=a=>a.map(s=>s.split('-'));

const groups=[
 {id:'serie',title:'En serie',desc:'Un único camino para la corriente.'},
 {id:'paralelo',title:'En paralelo',desc:'Varios caminos entre los mismos dos puntos.'},
 {id:'mixto',title:'Circuitos mixtos',desc:'Serie y paralelo combinados.'},
 {id:'proteccion',title:'Componentes y protección',desc:'LED, fusible y sobrecargas.'},
 {id:'falla',title:'Buscá la falla',desc:'Medí con el multímetro y reemplazá lo que está dañado.'}
];

const list=[
{id:'serie-2',group:'serie',title:'Serie · Dos lámparas',
 desc:'Batería, llave y dos lámparas en un solo recorrido.',
 goal:'Conectá las dos lámparas una a continuación de la otra y comandá todo con la llave.',
 tip:'Salí del + de la batería, pasá por la llave, la lámpara L1, la lámpara L2 y volvé al − de la batería.',
 explain:'Rt = 12 Ω + 12 Ω = 24 Ω. La corriente es la misma en todo el circuito (0,5 A) y la tensión se reparte: 6 V en cada lámpara. Por eso brillan menos que una sola con 12 V. Si una se quema, se apaga todo.',
 comps:[bat(12),sw('S1'),lamp('L1'),lamp('L2')],
 sol:pairs(['B.p-S1.a','S1.b-L1.a','L1.b-L2.a','L2.b-B.n'])},

{id:'serie-4',group:'serie',title:'Serie · Cuatro lámparas',
 desc:'Una guirnalda: cuatro lámparas en cadena.',
 goal:'Conectá las cuatro lámparas en serie con la llave general.',
 tip:'Cada lámpara une su borne derecho con el borne izquierdo de la siguiente.',
 explain:'Rt = 4 × 12 Ω = 48 Ω, I = 12 V / 48 Ω = 0,25 A. Cada lámpara recibe 3 V (la cuarta parte), por eso casi no brillan. Compará con el paralelo: ahí cada una recibe 12 V.',
 comps:[bat(12),sw('S1'),lamp('L1'),lamp('L2'),lamp('L3'),lamp('L4')],
 sol:pairs(['B.p-S1.a','S1.b-L1.a','L1.b-L2.a','L2.b-L3.a','L3.b-L4.a','L4.b-B.n'])},

{id:'serie-res',group:'serie',title:'Serie · Tres resistores',
 desc:'Resistores de 100, 220 y 330 Ω. Leé el código de colores.',
 goal:'Conectá los tres resistores en serie y medí la caída de tensión en cada uno.',
 tip:'Tocá un resistor para ver su valor por colores y su tensión. Las caídas deben sumar 12 V.',
 explain:'Rt = 100 + 220 + 330 = 650 Ω, I = 12 V / 650 Ω ≈ 18,5 mA. Caídas: 1,85 V + 4,06 V + 6,09 V = 12 V (ley de tensiones de Kirchhoff). A mayor resistencia, mayor caída.',
 comps:[bat(12),sw('S1'),res('R1',100),res('R2',220),res('R3',330)],
 sol:pairs(['B.p-S1.a','S1.b-R1.a','R1.b-R2.a','R2.b-R3.a','R3.b-B.n'])},

{id:'divisor',group:'serie',title:'Serie · Divisor de tensión',
 desc:'Dos resistores que reparten la tensión de la batería.',
 goal:'Armá el divisor con R1 = 1 kΩ y R2 = 2,2 kΩ y medí la tensión en R2.',
 tip:'Es un circuito en serie de dos resistores. Medí la tensión sobre R2.',
 explain:'I = 12 V / 3,2 kΩ = 3,75 mA. V(R1) = 3,75 V y V(R2) = 8,25 V. Fórmula del divisor: V(R2) = 12 V · R2 / (R1 + R2).',
 comps:[bat(12),sw('S1'),res('R1',1000),res('R2',2200)],
 sol:pairs(['B.p-S1.a','S1.b-R1.a','R1.b-R2.a','R2.b-B.n'])},

{id:'par-2',group:'paralelo',title:'Paralelo · Dos lámparas',
 desc:'Cada lámpara conectada directamente a la batería.',
 goal:'Conectá las dos lámparas en paralelo, con la llave en el cable principal.',
 tip:'Los dos bornes izquierdos van juntos a la llave; los dos bornes derechos van juntos al − de la batería.',
 explain:'Cada lámpara recibe los 12 V completos y brilla al máximo. I por rama = 1 A, I total = 2 A, Req = 6 Ω. Si una se quema, la otra sigue encendida.',
 comps:[bat(12),sw('S1'),lamp('L1'),lamp('L2')],
 pos:{S1:[.28,.5],L1:[.65,.2],L2:[.65,.8]},
 sol:pairs(['B.p-S1.a','S1.b-L1.a','S1.b-L2.a','L1.b-B.n','L2.b-B.n'])},

{id:'par-4',group:'paralelo',title:'Paralelo · Cuatro lámparas',
 desc:'Cuatro ramas iguales alimentadas por la misma batería.',
 goal:'Conectá las cuatro lámparas en paralelo con una llave general.',
 tip:'Pensá en dos “rieles”: uno con todos los bornes izquierdos y otro con todos los derechos.',
 explain:'Cada rama toma 1 A: la corriente total es 4 A y Req = 3 Ω. Agregar ramas en paralelo baja la resistencia total y aumenta la corriente que entrega la batería.',
 comps:[bat(12),sw('S1'),lamp('L1'),lamp('L2'),lamp('L3'),lamp('L4')],
 pos:{S1:[.27,.5],L1:[.55,.2],L2:[.55,.8],L3:[.83,.2],L4:[.83,.8]},
 sol:pairs(['B.p-S1.a','S1.b-L1.a','S1.b-L2.a','S1.b-L3.a','S1.b-L4.a','L1.b-B.n','L2.b-B.n','L3.b-B.n','L4.b-B.n'])},

{id:'par-res',group:'paralelo',title:'Paralelo · Tres resistores',
 desc:'Resistores de 100, 220 y 330 Ω en paralelo.',
 goal:'Conectá los tres resistores en paralelo y comprobá que la resistencia total es menor que la menor de las tres.',
 tip:'Todos los resistores quedan con los 12 V completos; lo que cambia es la corriente de cada rama.',
 explain:'1/Req = 1/100 + 1/220 + 1/330 → Req ≈ 56,9 Ω. Corrientes: 120 mA + 54,5 mA + 36,4 mA = 211 mA (ley de corrientes de Kirchhoff). Por el resistor más chico pasa más corriente.',
 comps:[bat(12),sw('S1'),res('R1',100),res('R2',220),res('R3',330)],
 pos:{S1:[.28,.5],R1:[.65,.15],R2:[.65,.5],R3:[.65,.85]},
 sol:pairs(['B.p-S1.a','S1.b-R1.a','S1.b-R2.a','S1.b-R3.a','R1.b-B.n','R2.b-B.n','R3.b-B.n'])},

{id:'par-llaves',group:'paralelo',title:'Paralelo · Una llave por rama',
 desc:'Dos lámparas independientes, cada una con su propia llave.',
 goal:'Cada lámpara va en serie con su llave, y los dos ramales se conectan en paralelo a la batería.',
 tip:'Armá dos ramales iguales: llave + lámpara. Los dos empiezan en el + y terminan en el −.',
 explain:'Cada ramal funciona de forma independiente: podés encender una, la otra o ambas. Es el principio de la instalación de una casa, donde cada artefacto se comanda sin afectar a los demás.',
 comps:[bat(12),sw('S1'),lamp('L1'),sw('S2'),lamp('L2')],
 pos:{S1:[.4,.2],L1:[.75,.2],S2:[.4,.8],L2:[.75,.8]},
 sol:pairs(['B.p-S1.a','B.p-S2.a','S1.b-L1.a','S2.b-L2.a','L1.b-B.n','L2.b-B.n'])},

{id:'mix-1',group:'mixto',title:'Mixto · L1 en serie con (L2 ‖ L3)',
 desc:'Una lámpara en serie con un par en paralelo.',
 goal:'L1 va en serie con la llave; después el camino se divide en L2 y L3 en paralelo, y vuelve al −.',
 tip:'La salida de L1 se bifurca: un cable a L2 y otro a L3. Los otros bornes de L2 y L3 van al −.',
 explain:'El par en paralelo equivale a 6 Ω. Rt = 12 + 6 = 18 Ω, I = 0,667 A. L1 recibe 8 V y el par recibe 4 V (cada una 0,333 A). L1 brilla más porque soporta toda la corriente.',
 comps:[bat(12),sw('S1'),lamp('L1'),lamp('L2'),lamp('L3')],
 pos:{S1:[.28,.2],L1:[.52,.2],L2:[.82,.2],L3:[.82,.8]},
 sol:pairs(['B.p-S1.a','S1.b-L1.a','L1.b-L2.a','L1.b-L3.a','L2.b-B.n','L3.b-B.n'])},

{id:'mix-2',group:'mixto',title:'Mixto · (L1 + L2) ‖ L3',
 desc:'Una rama con dos lámparas en serie, en paralelo con una tercera.',
 goal:'Armá dos ramas desde la llave: una con L1 y L2 en serie, otra con L3 sola.',
 tip:'Después de la llave el cable se divide en dos ramas que se reúnen en el − de la batería.',
 explain:'Rama 1: 24 Ω (0,5 A, 6 V en cada lámpara). Rama 2: 12 Ω (1 A, 12 V). Req = 24 ‖ 12 = 8 Ω, I total = 1,5 A. L3 brilla al máximo; L1 y L2, a media luz.',
 comps:[bat(12),sw('S1'),lamp('L1'),lamp('L2'),lamp('L3')],
 pos:{S1:[.28,.2],L1:[.55,.2],L2:[.85,.2],L3:[.55,.8]},
 sol:pairs(['B.p-S1.a','S1.b-L1.a','S1.b-L3.a','L1.b-L2.a','L2.b-B.n','L3.b-B.n'])},

{id:'mix-res-1',group:'mixto',title:'Mixto · R1 + (R2 ‖ R3)',
 desc:'Resistores de 100, 220 y 330 Ω combinados.',
 goal:'R1 en serie con el paralelo de R2 y R3. Calculá la resistencia equivalente y verificala midiendo.',
 tip:'Primero resolvé el paralelo (R2 ‖ R3) y sumalo en serie con R1.',
 explain:'R2 ‖ R3 = 220·330 / 550 = 132 Ω. Rt = 100 + 132 = 232 Ω, I = 51,7 mA. R1 cae 5,17 V y el paralelo 6,83 V.',
 comps:[bat(12),sw('S1'),res('R1',100),res('R2',220),res('R3',330)],
 pos:{S1:[.28,.2],R1:[.52,.2],R2:[.82,.2],R3:[.82,.8]},
 sol:pairs(['B.p-S1.a','S1.b-R1.a','R1.b-R2.a','R1.b-R3.a','R2.b-B.n','R3.b-B.n'])},

{id:'mix-res-2',group:'mixto',title:'Mixto · (R1 + R2) ‖ (R3 + R4)',
 desc:'Dos ramas en paralelo, cada una con dos resistores en serie.',
 goal:'Rama superior: R1 y R2 en serie. Rama inferior: R3 y R4 en serie. Las dos ramas en paralelo.',
 tip:'Dos cadenas que nacen en la salida de la llave y terminan en el − de la batería.',
 explain:'Rama 1 = 100 + 220 = 320 Ω (37,5 mA). Rama 2 = 330 + 470 = 800 Ω (15 mA). Req = 320 ‖ 800 ≈ 228,6 Ω, I total = 52,5 mA.',
 comps:[bat(12),sw('S1'),res('R1',100),res('R2',220),res('R3',330),res('R4',470)],
 pos:{S1:[.26,.5],R1:[.5,.2],R2:[.8,.2],R3:[.5,.8],R4:[.8,.8]},
 sol:pairs(['B.p-S1.a','S1.b-R1.a','R1.b-R2.a','R2.b-B.n','S1.b-R3.a','R3.b-R4.a','R4.b-B.n'])},

{id:'mix-lamp-2',group:'mixto',title:'Mixto · (L1 ‖ L2) + (L3 ‖ L4)',
 desc:'Dos pares de lámparas en paralelo, unidos en serie.',
 goal:'Cada par va en paralelo; los dos pares se conectan uno a continuación del otro.',
 tip:'Unir L1.b con L2.b crea el punto medio. Desde ahí alimentás L3 y L4.',
 explain:'Cada par equivale a 6 Ω. Rt = 6 + 6 = 12 Ω, I = 1 A. Cada par recibe 6 V y cada lámpara 0,5 A.',
 comps:[bat(12),sw('S1'),lamp('L1'),lamp('L2'),lamp('L3'),lamp('L4')],
 pos:{S1:[.26,.5],L1:[.5,.2],L2:[.5,.8],L3:[.84,.2],L4:[.84,.8]},
 sol:pairs(['B.p-S1.a','S1.b-L1.a','S1.b-L2.a','L1.b-L2.b','L1.b-L3.a','L1.b-L4.a','L3.b-B.n','L4.b-B.n'])},

{id:'mix-llaves',group:'mixto',title:'Mixto · Llave general y llaves de rama',
 desc:'Una lámpara general y dos ramas con llave propia.',
 goal:'S1 y L1 en serie; luego dos ramas en paralelo, cada una con su llave y su lámpara.',
 tip:'La salida de L1 se divide: S2→L2 por un lado y S3→L3 por el otro. Ambas vuelven al −.',
 explain:'Con S2 y S3 cerradas el circuito equivale al mixto 1 (Rt = 18 Ω). Con una sola rama cerrada, Rt = 24 Ω y todo brilla distinto. Probá abrir y cerrar las llaves y observá las mediciones.',
 comps:[bat(12),sw('S1'),lamp('L1'),sw('S2'),lamp('L2'),sw('S3'),lamp('L3')],
 pos:{S1:[.25,.2],L1:[.43,.2],S2:[.63,.2],L2:[.88,.2],S3:[.63,.8],L3:[.88,.8]},
 sol:pairs(['B.p-S1.a','S1.b-L1.a','L1.b-S2.a','L1.b-S3.a','S2.b-L2.a','S3.b-L3.a','L2.b-B.n','L3.b-B.n'])},

{id:'led',group:'proteccion',title:'LED con resistor limitador',
 desc:'Un LED necesita un resistor en serie. ¿Cuál elegís?',
 goal:'Conectá el LED (ánodo al +) en serie con UNO de los resistores para que encienda sin quemarse. Corriente ideal: 5 a 25 mA.',
 tip:'Resistor = (9 V − 2 V) / 20 mA ≈ 350 Ω. El valor comercial más cercano es 330 Ω. Con 100 Ω se quema.',
 explain:'El LED cae unos 2 V y no limita la corriente por sí solo. Con 330 Ω: I = (9 − 2) / 330 ≈ 21 mA. Con 1 kΩ: 7 mA (brilla menos). Con 100 Ω: más de 60 mA y se destruye.',
 comps:[bat(9),sw('S1'),res('Ra',100),res('Rb',330),res('Rc',1000),led('D')],
 pos:{Ra:[.3,.2],Rb:[.55,.2],Rc:[.8,.2],S1:[.3,.8],D:[.7,.8]},
 sol:pairs(['B.p-S1.a','S1.b-Rb.a','Rb.b-D.a','D.k-B.n']),
 check(c){
  const d=c.sim.c.D;
  if(c.broken.D)return{cls:'error',head:'LED quemado',text:'La corriente superó los 30 mA y el LED se destruyó. Reiniciá la práctica y elegí un resistor mayor.'};
  if(!c.allClosed)return null;
  const i=d.i;
  if(d.level>0&&i>=.005&&i<=.025)return{cls:'ok',head:'Desafío completado',text:'El LED conduce '+c.fmtI(i)+': dentro del rango seguro.',done:true};
  if(d.level>0&&i<.005)return{cls:'',head:'LED muy tenue',text:'Circula solo '+c.fmtI(i)+'. Probá con un resistor menor.'};
  return null;
 }},

{id:'fusible',group:'proteccion',title:'Fusible de protección',
 desc:'Tres lámparas de 1 A cada una y un fusible de 2,5 A.',
 goal:'Colocá el fusible en la línea principal y alimentá lámparas en paralelo. Encendé al menos dos sin que se funda.',
 tip:'Fusible y llave en serie en el cable principal; las lámparas, en paralelo. Con tres lámparas la corriente es 3 A: ¡superás los 2,5 A!',
 explain:'Con 2 lámparas circulan 2 A y el fusible resiste. Con 3 lámparas circulan 3 A, superan los 2,5 A y el fusible se funde, cortando el circuito: así protege los cables. Hay que corregir la causa (sobrecarga) antes de reemplazarlo.',
 comps:[bat(12),fuse('F',2.5),sw('S1'),lamp('L1'),lamp('L2'),lamp('L3')],
 pos:{F:[.26,.2],S1:[.5,.2],L1:[.82,.15],L2:[.82,.5],L3:[.82,.85]},
 sol:pairs(['B.p-F.a','F.b-S1.a','S1.b-L1.a','S1.b-L2.a','L1.b-B.n','L2.b-B.n']),
 check(c){
  if(c.broken.F)return{cls:'error',head:'Fusible fundido',text:'Circularon más de 2,5 A. Quitá una lámpara (o abrí una rama), reemplazá el fusible y volvé a cerrar la llave.'};
  if(!c.allClosed)return null;
  const f=c.sim.c.F,lit=['L1','L2','L3'].filter(k=>c.sim.c[k].level>.01).length;
  if(f.i>.05&&Math.abs(f.i-c.sim.ibat)<.01&&lit>=2)return{cls:'ok',head:'Desafío completado',text:'El fusible protege la línea: circulan '+c.fmtI(f.i)+' (límite 2,5 A) con '+lit+' lámparas encendidas.',done:true};
  if(f.i>.05&&Math.abs(f.i-c.sim.ibat)>=.01)return{cls:'',head:'Fusible fuera de la línea principal',text:'Por el fusible pasa solo parte de la corriente. Ponelo en el cable común, antes de dividirse.'};
  return null;
 }},

{id:'falla-serie',group:'falla',title:'Falla · Tres lámparas en serie',
 desc:'No enciende ninguna lámpara. Una está quemada.',
 goal:'Cerrá la llave, medí tensión en cada lámpara, encontrá la quemada y reemplazala.',
 tip:'En serie, si una se quema, todas se apagan. La quemada es la que muestra los 12 V completos con 0 A.',
 explain:'Un filamento cortado abre el único camino: no circula corriente y toda la tensión de la batería queda aplicada sobre el elemento abierto. Esa es la clave para encontrarlo con un voltímetro.',
 fault:['L1','L2','L3'],
 comps:[bat(12),sw('S1'),lamp('L1'),lamp('L2'),lamp('L3')],
 sol:pairs(['B.p-S1.a','S1.b-L1.a','L1.b-L2.a','L2.b-L3.a','L3.b-B.n'])},

{id:'falla-par',group:'falla',title:'Falla · Cuatro lámparas en paralelo',
 desc:'Una de las cuatro lámparas no enciende.',
 goal:'Cerrá la llave, medí cada lámpara e identificá cuál está quemada. Reemplazala.',
 tip:'En paralelo todas tienen 12 V. La quemada es la que no deja pasar corriente (0 A).',
 explain:'En paralelo, cada rama es independiente: las demás siguen funcionando. La lámpara dañada mantiene 12 V entre sus bornes pero su corriente es 0 A.',
 fault:['L1','L2','L3','L4'],
 comps:[bat(12),sw('S1'),lamp('L1'),lamp('L2'),lamp('L3'),lamp('L4')],
 pos:{S1:[.27,.5],L1:[.55,.2],L2:[.55,.8],L3:[.83,.2],L4:[.83,.8]},
 sol:pairs(['B.p-S1.a','S1.b-L1.a','S1.b-L2.a','S1.b-L3.a','S1.b-L4.a','L1.b-B.n','L2.b-B.n','L3.b-B.n','L4.b-B.n'])},

{id:'falla-mixto',group:'falla',title:'Falla · Circuito mixto de resistores',
 desc:'La corriente total es menor a la esperada: hay un resistor abierto.',
 goal:'Con la llave cerrada, medí tensión y corriente en R1, R2 y R3 e identificá el resistor abierto.',
 tip:'Resistor abierto: tiene tensión en sus bornes pero no pasa corriente por él. Comparalo con los demás.',
 explain:'Si R2 o R3 se abre, el circuito sigue funcionando pero con otra resistencia total (la corriente baja). Si lo hace R1, se corta todo. Medir tensión y corriente en cada elemento permite ubicar la falla.',
 fault:['R1','R2','R3'],
 comps:[bat(12),sw('S1'),res('R1',100),res('R2',220),res('R3',330)],
 pos:{S1:[.28,.2],R1:[.52,.2],R2:[.82,.2],R3:[.82,.8]},
 sol:pairs(['B.p-S1.a','S1.b-R1.a','R1.b-R2.a','R1.b-R3.a','R2.b-B.n','R3.b-B.n'])}
];

const items={};list.forEach(s=>items[s.id]=s);
return{groups,order:list.map(s=>s.id),items};
})();
