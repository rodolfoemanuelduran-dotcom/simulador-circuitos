/* Catálogo de prácticas: básicos, serie, paralelo, mixtos, corriente alterna,
   protección y diagnóstico. Cada práctica describe sus componentes, su ubicación
   en la mesa y la solución de referencia. El motor (circuito-redes.html) calcula
   todo con las leyes de Ohm y Kirchhoff. Para agregar un circuito nuevo, sumá un
   objeto a la lista `list`. */
window.REDES=(function(){
const bat=v=>({id:'B',t:'bat',v,name:'Batería '+v+' V'});
const red=()=>({id:'RED',t:'src',v:220,name:'Alimentación 220 V~'});
const sw=(id,n)=>({id,t:'sw',name:n||'Llave '+id});
const sw3=(id,flip)=>({id,t:'sw3',flip:!!flip,name:'Conmutador '+id});
const lamp=(id,r,vr)=>({id,t:'lamp',r:r||12,vr:vr||12,name:'Lámpara '+id});
const foco=id=>({id,t:'lamp',r:484,vr:220,name:'Foco '+id});
const res=(id,r)=>({id,t:'res',r,name:'Resistor '+id});
const fuse=(id,amp)=>({id,t:'fuse',amp,name:'Fusible '+amp+' A'});
const led=id=>({id,t:'led',name:'LED'});
const toma=(id,n)=>({id,t:'toma',name:n||'Tomacorriente'});
const motor=()=>({id:'M',t:'motor',r:160,vr:220,name:'Motor'});
const rod=()=>({id:'J',t:'rod',name:'Jabalina'});
const pairs=a=>a.map(s=>s.split('-'));

/* ---- Cableado de ambientes de casa: comprobación común ----
   cfg.pairs = [{lamp:'L1',sw:'S1'},...]  (cada llave comanda su foco)
   cfg.tomas = ['T1','T2']                (permanentes, con tierra)         */
function casaCheck(cfg){
 return function(c){
  const swIds=cfg.pairs.map(p=>p.sw),lampIds=cfg.pairs.map(p=>p.lamp);
  const mk=on=>{const o={};swIds.forEach(id=>o[id]=on.indexOf(id)>=0);return c.nets({sw:o})};
  const st=n=>({short:n.root('L')===n.root('N')||n.root('L')===n.root('PE'),nePE:n.root('N')===n.root('PE'),
   on:lampIds.map(l=>n.has(l+'.a','L')&&n.has(l+'.b','N')),rev:lampIds.some(l=>n.has(l+'.a','N')&&n.has(l+'.b','L')),
   out:cfg.tomas.map(t=>n.has(t+'.L','L')&&n.has(t+'.N','N')),outRev:cfg.tomas.some(t=>n.has(t+'.L','N')&&n.has(t+'.N','L')),
   earth:cfg.tomas.map(t=>n.has(t+'.PE','PE'))});
  const now=st(c.nets()),open=st(mk([])),all=st(mk(swIds));
  if(now.short)return{cls:'error',head:'FALLA GRAVE',text:'La fase quedó unida directamente con el neutro o con la tierra. En una instalación real actuaría la protección.'};
  if(now.nePE)return{cls:'error',head:'Unión N–PE indebida',text:'Neutro y protección deben permanecer separados.'};
  if(now.rev||now.outRev)return{cls:'',head:'Polaridad incorrecta',text:'Fase y neutro invertidos en un foco o en un toma. Corregí L y N.'};
  if(open.on.some(Boolean))return{cls:'',head:'Llave puenteada',text:'Un foco permanece encendido con todas las llaves abiertas: la fase debe pasar por su llave.'};
  for(let i=0;i<cfg.pairs.length;i++){
   const only=st(mk([cfg.pairs[i].sw]));
   if(!only.on[i])return{cls:'',head:'Iluminación incompleta',text:'Al cerrar la '+(cfg.names&&cfg.names[cfg.pairs[i].sw]||'llave '+cfg.pairs[i].sw)+' el foco '+cfg.pairs[i].lamp+' debe encender: fase por la llave hasta L y neutro en N.'};
   if(only.on.some((v,j)=>j!==i&&v))return{cls:'',head:'Control incorrecto',text:'Cada llave debe comandar solamente su propio foco.'};
  }
  if(!all.out.every(Boolean))return{cls:'',head:'Tomacorriente sin tensión',text:'Cada toma necesita fase y neutro permanentes, sin pasar por ninguna llave.'};
  if(!all.earth.every(Boolean))return{cls:'',head:'Funciona, pero no es seguro',text:'Falta el conductor verde/amarillo (tierra) en uno de los tomas.'};
  if(c.wrongColor())return{cls:'',head:'Código de colores incorrecto',text:'Marrón para fase, celeste para neutro y verde/amarillo exclusivamente para tierra.'};
  return{cls:'ok',head:cfg.okHead||'Ambiente resuelto',text:cfg.okText||'Las luces responden a sus llaves y los tomas quedan energizados y con puesta a tierra.',done:true};
 };
}
function casaAmbiente(o){
 const pairs=o.lamps.map((l,i)=>({lamp:l,sw:o.switches[i]})),comps=[red()];
 pairs.forEach((p,i)=>{comps.push(Object.assign(sw(p.sw),{name:o.swNames[i]}));comps.push(Object.assign(foco(p.lamp),{name:o.lampNames[i]}))});
 o.tomas.forEach((t,i)=>comps.push(toma(t,o.tomaNames[i])));
 const sol=[];pairs.forEach(p=>{sol.push(['RED.L',p.sw+'.a'],[p.sw+'.b',p.lamp+'.a'],['RED.N',p.lamp+'.b'])});
 o.tomas.forEach(t=>sol.push(['RED.L',t+'.L'],['RED.N',t+'.N'],['RED.PE',t+'.PE']));
 return{id:o.id,group:'casa',hidden:true,ac:true,title:o.title,desc:o.desc,goal:o.goal,tip:o.tip,explain:o.explain,comps,pos:o.pos,sol,
  check:casaCheck({pairs,tomas:o.tomas,names:Object.fromEntries(pairs.map((p,i)=>[p.sw,o.swNames[i]])),okHead:o.okHead,okText:o.okText})};
}

const groups=[
 {id:'basico',title:'Circuitos básicos',desc:'Corriente continua: el primer recorrido de la corriente.'},
 {id:'serie',title:'En serie',desc:'Un único camino para la corriente.'},
 {id:'paralelo',title:'En paralelo',desc:'Varios caminos entre los mismos dos puntos.'},
 {id:'mixto',title:'Circuitos mixtos',desc:'Serie y paralelo combinados.'},
 {id:'ca',title:'Instalaciones en corriente alterna',desc:'Fase, neutro y tierra: llaves, tomas, motor y jabalina.'},
 {id:'proteccion',title:'Componentes y protección',desc:'LED, fusible y sobrecargas.'},
 {id:'falla',title:'Buscá la falla',desc:'Medí con el multímetro y reemplazá lo que está dañado.'}
];

const list=[
/* ---------------- BÁSICOS ---------------- */
{id:'simple',group:'basico',title:'Circuito simple',
 desc:'Batería, llave y un foco. Aprendé el recorrido básico de la corriente continua.',
 goal:'Conectá la batería, la llave y la lámpara en un circuito cerrado y encendé el foco.',
 tip:'Salí del + de la batería, pasá por la llave y la lámpara, y volvé al − de la batería.',
 explain:'La corriente necesita un camino cerrado: + de la batería → llave → lámpara → − de la batería. Con la llave cerrada circulan 1 A y la lámpara recibe los 12 V (12 W). Con la llave abierta el camino se corta y se apaga.',
 comps:[bat(12),sw('S1'),lamp('L1')],
 pos:{S1:[.38,.25],L1:[.7,.5]},
 sol:pairs(['B.p-S1.a','S1.b-L1.a','L1.b-B.n'])},

{id:'serie-3',group:'basico',title:'Serie · Tres lámparas',
 desc:'Batería, interruptor y tres lámparas en serie.',
 goal:'Conectá las tres lámparas una a continuación de la otra y controlalas con un único interruptor.',
 tip:'Un solo recorrido: + → llave → L1 → L2 → L3 → −.',
 explain:'Rt = 3 × 12 Ω = 36 Ω, I = 12 V / 36 Ω = 0,33 A. Cada lámpara recibe 4 V, por eso brillan tenue. Si una se quema, se apagan todas.',
 comps:[bat(12),sw('S1'),lamp('L1'),lamp('L2'),lamp('L3')],
 sol:pairs(['B.p-S1.a','S1.b-L1.a','L1.b-L2.a','L2.b-L3.a','L3.b-B.n'])},

{id:'par-3',group:'basico',title:'Paralelo · Tres lámparas',
 desc:'Batería, interruptor y tres lámparas en paralelo.',
 goal:'Conectá las tres lámparas en paralelo y controlalas con un único interruptor.',
 tip:'Los tres bornes izquierdos van juntos a la llave; los tres derechos, juntos al −.',
 explain:'Cada lámpara recibe los 12 V y brilla al máximo. I por rama = 1 A, I total = 3 A, Req = 4 Ω. Si una se quema, las otras siguen encendidas.',
 comps:[bat(12),sw('S1'),lamp('L1'),lamp('L2'),lamp('L3')],
 pos:{S1:[.3,.5],L1:[.68,.15],L2:[.68,.5],L3:[.68,.79]},
 sol:pairs(['B.p-S1.a','S1.b-L1.a','S1.b-L2.a','S1.b-L3.a','L1.b-B.n','L2.b-B.n','L3.b-B.n'])},

{id:'llave-doble',group:'basico',title:'Llave doble',
 desc:'Dos interruptores independientes para comandar dos focos.',
 goal:'Cada lámpara va en serie con su propia llave, y los dos ramales se conectan a la batería.',
 tip:'Armá dos ramales iguales: llave + lámpara. Los dos empiezan en el + y terminan en el −.',
 explain:'Cada ramal funciona de forma independiente: podés encender una, la otra o ambas. Es el principio de una instalación domiciliaria: cada artefacto se comanda sin afectar a los demás.',
 comps:[bat(12),sw('S1'),lamp('L1'),sw('S2'),lamp('L2')],
 pos:{S1:[.4,.22],L1:[.75,.22],S2:[.4,.78],L2:[.75,.78]},
 sol:pairs(['B.p-S1.a','B.p-S2.a','S1.b-L1.a','S2.b-L2.a','L1.b-B.n','L2.b-B.n'])},

{id:'llave-triple',group:'basico',title:'Llave triple',
 desc:'Tres interruptores, tres retornos y tres focos.',
 goal:'Conectá tres ramales independientes, cada uno con su llave y su lámpara, a la misma batería.',
 tip:'Repetí tres veces el ramal llave + lámpara. Los tres comparten el + y el −.',
 explain:'Tres circuitos independientes alimentados por la misma fuente: la corriente total es la suma de las corrientes de los ramales encendidos (hasta 3 A).',
 comps:[bat(12),sw('S1'),lamp('L1'),sw('S2'),lamp('L2'),sw('S3'),lamp('L3')],
 pos:{S1:[.38,.15],L1:[.75,.15],S2:[.38,.5],L2:[.75,.5],S3:[.38,.79],L3:[.75,.79]},
 sol:pairs(['B.p-S1.a','B.p-S2.a','B.p-S3.a','S1.b-L1.a','S2.b-L2.a','S3.b-L3.a','L1.b-B.n','L2.b-B.n','L3.b-B.n'])},

{id:'combinacion',group:'basico',title:'Llaves de combinación',
 desc:'Dos conmutadores para comandar una lámpara desde dos lugares.',
 goal:'Conectá la batería al común de C1; unilos con dos cables viajeros (1–1 y 2–2); el común de C2 va a la lámpara. La lámpara debe cambiar de estado al accionar cualquiera de los dos conmutadores.',
 tip:'Cables viajeros: C1.1 con C2.1 y C1.2 con C2.2. El común de C1 va al +; el común de C2, a la lámpara; la lámpara, al −.',
 explain:'Cada conmutador elige uno de dos caminos. La lámpara se enciende solo cuando los dos conmutadores eligen el mismo camino viajero. Así se comanda una escalera desde la planta baja y desde la alta.',
 comps:[bat(12),sw3('C1'),sw3('C2',true),lamp('L1')],
 pos:{C1:[.3,.25],C2:[.7,.25],L1:[.7,.72]},
 sol:pairs(['B.p-C1.c','C1.a-C2.a','C1.b-C2.b','C2.c-L1.a','L1.b-B.n']),
 check(c){
  const lit=(p1,p2)=>{const s=c.simWith({sw:{C1:p1,C2:p2}});return{short:s.short,on:s.c.L1.level>.01}};
  const t=[lit(false,false),lit(false,true),lit(true,false),lit(true,true)];
  if(t.some(x=>x.short))return{cls:'error',head:'CORTOCIRCUITO',text:'Un cable une directamente + con − sin la lámpara. Quitá el último cable.'};
  const on=t.filter(x=>x.on).length;
  if(on===0)return{cls:'',head:'La lámpara no enciende',text:'Con ninguna combinación de los conmutadores se enciende. Revisá que haya un camino completo: + → C1 → viajeros → C2 → lámpara → −.'};
  if(on===2&&t[0].on===t[3].on&&t[1].on===t[2].on&&t[0].on!==t[1].on)return{cls:'ok',head:'Desafío completado',text:'La lámpara cambia de estado con cualquiera de los dos conmutadores.',done:true};
  return{cls:'',head:'Todavía no es de combinación',text:'La lámpara enciende, pero no cambia de estado con cada conmutador. Usá los dos cables viajeros (1–1 y 2–2) entre C1 y C2.'};
 }},

/* ---------------- SERIE ---------------- */
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

/* ---------------- PARALELO ---------------- */
{id:'par-2',group:'paralelo',title:'Paralelo · Dos lámparas',
 desc:'Cada lámpara conectada directamente a la batería.',
 goal:'Conectá las dos lámparas en paralelo, con la llave en el cable principal.',
 tip:'Los dos bornes izquierdos van juntos a la llave; los dos bornes derechos van juntos al − de la batería.',
 explain:'Cada lámpara recibe los 12 V completos y brilla al máximo. I por rama = 1 A, I total = 2 A, Req = 6 Ω. Si una se quema, la otra sigue encendida.',
 comps:[bat(12),sw('S1'),lamp('L1'),lamp('L2')],
 pos:{S1:[.3,.5],L1:[.66,.22],L2:[.66,.76]},
 sol:pairs(['B.p-S1.a','S1.b-L1.a','S1.b-L2.a','L1.b-B.n','L2.b-B.n'])},

{id:'par-4',group:'paralelo',title:'Paralelo · Cuatro lámparas',
 desc:'Cuatro ramas iguales alimentadas por la misma batería.',
 goal:'Conectá las cuatro lámparas en paralelo con una llave general.',
 tip:'Pensá en dos “rieles”: uno con todos los bornes izquierdos y otro con todos los derechos.',
 explain:'Cada rama toma 1 A: la corriente total es 4 A y Req = 3 Ω. Agregar ramas en paralelo baja la resistencia total y aumenta la corriente que entrega la batería.',
 comps:[bat(12),sw('S1'),lamp('L1'),lamp('L2'),lamp('L3'),lamp('L4')],
 pos:{S1:[.3,.5],L1:[.58,.22],L2:[.58,.76],L3:[.86,.22],L4:[.86,.76]},
 sol:pairs(['B.p-S1.a','S1.b-L1.a','S1.b-L2.a','S1.b-L3.a','S1.b-L4.a','L1.b-B.n','L2.b-B.n','L3.b-B.n','L4.b-B.n'])},

{id:'par-res',group:'paralelo',title:'Paralelo · Tres resistores',
 desc:'Resistores de 100, 220 y 330 Ω en paralelo.',
 goal:'Conectá los tres resistores en paralelo y comprobá que la resistencia total es menor que la menor de las tres.',
 tip:'Todos los resistores quedan con los 12 V completos; lo que cambia es la corriente de cada rama.',
 explain:'1/Req = 1/100 + 1/220 + 1/330 → Req ≈ 56,9 Ω. Corrientes: 120 mA + 54,5 mA + 36,4 mA = 211 mA (ley de corrientes de Kirchhoff). Por el resistor más chico pasa más corriente.',
 comps:[bat(12),sw('S1'),res('R1',100),res('R2',220),res('R3',330)],
 pos:{S1:[.3,.5],R1:[.68,.15],R2:[.68,.5],R3:[.68,.79]},
 sol:pairs(['B.p-S1.a','S1.b-R1.a','S1.b-R2.a','S1.b-R3.a','R1.b-B.n','R2.b-B.n','R3.b-B.n'])},

/* ---------------- MIXTOS ---------------- */
{id:'mix-1',group:'mixto',title:'Mixto · L1 en serie con (L2 ‖ L3)',
 desc:'Una lámpara en serie con un par en paralelo.',
 goal:'L1 va en serie con la llave; después el camino se divide en L2 y L3 en paralelo, y vuelve al −.',
 tip:'La salida de L1 se bifurca: un cable a L2 y otro a L3. Los otros bornes de L2 y L3 van al −.',
 explain:'El par en paralelo equivale a 6 Ω. Rt = 12 + 6 = 18 Ω, I = 0,667 A. L1 recibe 8 V y el par recibe 4 V (cada una 0,333 A). L1 brilla más porque soporta toda la corriente.',
 comps:[bat(12),sw('S1'),lamp('L1'),lamp('L2'),lamp('L3')],
 pos:{S1:[.28,.22],L1:[.52,.22],L2:[.82,.22],L3:[.82,.76]},
 sol:pairs(['B.p-S1.a','S1.b-L1.a','L1.b-L2.a','L1.b-L3.a','L2.b-B.n','L3.b-B.n'])},

{id:'mix-2',group:'mixto',title:'Mixto · (L1 + L2) ‖ L3',
 desc:'Una rama con dos lámparas en serie, en paralelo con una tercera.',
 goal:'Armá dos ramas desde la llave: una con L1 y L2 en serie, otra con L3 sola.',
 tip:'Después de la llave el cable se divide en dos ramas que se reúnen en el − de la batería.',
 explain:'Rama 1: 24 Ω (0,5 A, 6 V en cada lámpara). Rama 2: 12 Ω (1 A, 12 V). Req = 24 ‖ 12 = 8 Ω, I total = 1,5 A. L3 brilla al máximo; L1 y L2, a media luz.',
 comps:[bat(12),sw('S1'),lamp('L1'),lamp('L2'),lamp('L3')],
 pos:{S1:[.28,.22],L1:[.55,.22],L2:[.85,.22],L3:[.55,.76]},
 sol:pairs(['B.p-S1.a','S1.b-L1.a','S1.b-L3.a','L1.b-L2.a','L2.b-B.n','L3.b-B.n'])},

{id:'mix-res-1',group:'mixto',title:'Mixto · R1 + (R2 ‖ R3)',
 desc:'Resistores de 100, 220 y 330 Ω combinados.',
 goal:'R1 en serie con el paralelo de R2 y R3. Calculá la resistencia equivalente y verificala midiendo.',
 tip:'Primero resolvé el paralelo (R2 ‖ R3) y sumalo en serie con R1.',
 explain:'R2 ‖ R3 = 220·330 / 550 = 132 Ω. Rt = 100 + 132 = 232 Ω, I = 51,7 mA. R1 cae 5,17 V y el paralelo 6,83 V.',
 comps:[bat(12),sw('S1'),res('R1',100),res('R2',220),res('R3',330)],
 pos:{S1:[.28,.22],L1:[.52,.22],R1:[.52,.22],R2:[.82,.22],R3:[.82,.76]},
 sol:pairs(['B.p-S1.a','S1.b-R1.a','R1.b-R2.a','R1.b-R3.a','R2.b-B.n','R3.b-B.n'])},

{id:'mix-res-2',group:'mixto',title:'Mixto · (R1 + R2) ‖ (R3 + R4)',
 desc:'Dos ramas en paralelo, cada una con dos resistores en serie.',
 goal:'Rama superior: R1 y R2 en serie. Rama inferior: R3 y R4 en serie. Las dos ramas en paralelo.',
 tip:'Dos cadenas que nacen en la salida de la llave y terminan en el − de la batería.',
 explain:'Rama 1 = 100 + 220 = 320 Ω (37,5 mA). Rama 2 = 330 + 470 = 800 Ω (15 mA). Req = 320 ‖ 800 ≈ 228,6 Ω, I total = 52,5 mA.',
 comps:[bat(12),sw('S1'),res('R1',100),res('R2',220),res('R3',330),res('R4',470)],
 pos:{S1:[.3,.5],R1:[.54,.22],R2:[.84,.22],R3:[.54,.76],R4:[.84,.76]},
 sol:pairs(['B.p-S1.a','S1.b-R1.a','R1.b-R2.a','R2.b-B.n','S1.b-R3.a','R3.b-R4.a','R4.b-B.n'])},

{id:'mix-lamp-2',group:'mixto',title:'Mixto · (L1 ‖ L2) + (L3 ‖ L4)',
 desc:'Dos pares de lámparas en paralelo, unidos en serie.',
 goal:'Cada par va en paralelo; los dos pares se conectan uno a continuación del otro.',
 tip:'Unir L1.b con L2.b crea el punto medio. Desde ahí alimentás L3 y L4.',
 explain:'Cada par equivale a 6 Ω. Rt = 6 + 6 = 12 Ω, I = 1 A. Cada par recibe 6 V y cada lámpara 0,5 A.',
 comps:[bat(12),sw('S1'),lamp('L1'),lamp('L2'),lamp('L3'),lamp('L4')],
 pos:{S1:[.3,.5],L1:[.54,.22],L2:[.54,.76],L3:[.86,.22],L4:[.86,.76]},
 sol:pairs(['B.p-S1.a','S1.b-L1.a','S1.b-L2.a','L1.b-L2.b','L1.b-L3.a','L1.b-L4.a','L3.b-B.n','L4.b-B.n'])},

{id:'mix-llaves',group:'mixto',title:'Mixto · Llave general y llaves de rama',
 desc:'Una lámpara general y dos ramas con llave propia.',
 goal:'S1 y L1 en serie; luego dos ramas en paralelo, cada una con su llave y su lámpara.',
 tip:'La salida de L1 se divide: S2→L2 por un lado y S3→L3 por el otro. Ambas vuelven al −.',
 explain:'Con S2 y S3 cerradas el circuito equivale al mixto 1 (Rt = 18 Ω). Con una sola rama cerrada, Rt = 24 Ω y todo brilla distinto. Probá abrir y cerrar las llaves y observá las mediciones.',
 comps:[bat(12),sw('S1'),lamp('L1'),sw('S2'),lamp('L2'),sw('S3'),lamp('L3')],
 pos:{S1:[.24,.22],L1:[.44,.22],S2:[.65,.22],L2:[.9,.22],S3:[.65,.76],L3:[.9,.76]},
 sol:pairs(['B.p-S1.a','S1.b-L1.a','L1.b-S2.a','L1.b-S3.a','S2.b-L2.a','S3.b-L3.a','L2.b-B.n','L3.b-B.n'])},

/* ---------------- CORRIENTE ALTERNA ---------------- */
{id:'ca-1p',group:'ca',ac:true,title:'CA · Circuito 1P y T',
 desc:'Llave, foco, tomacorriente, motor y puesta a tierra.',
 goal:'Fase (marrón) por la llave hasta el foco; neutro (celeste) al foco. El toma lleva fase y neutro permanentes (sin pasar por la llave). Tierra (verde/amarillo) del toma a la jabalina y al PE de la red. Luego enchufá el motor.',
 tip:'Marrón: RED.L → llave → foco, y RED.L → toma L. Celeste: RED.N → foco y RED.N → toma N. Verde/amarillo: RED.PE → toma PE → jabalina.',
 explain:'El foco responde a la llave porque la fase pasa por ella. El toma está siempre energizado (220 V~) y su PE está unido a la jabalina: si el motor tiene una falla a masa, la corriente de fuga se descarga a tierra y actúa la protección.',
 comps:[red(),sw('S1','Llave 1 punto'),foco('L1'),toma('T1'),motor(),rod()],
 pos:{RED:[.1,.46],S1:[.34,.17],L1:[.62,.17],T1:[.66,.62],M:[.91,.56],J:[.34,.74]},
 plug:[.88,.84],
 sol:pairs(['RED.L-S1.a','S1.b-L1.a','RED.N-L1.b','RED.L-T1.L','RED.N-T1.N','RED.PE-T1.PE','T1.PE-J.p']),
 check(c){
  const st=n=>({short:n.root('L')===n.root('N')||n.root('L')===n.root('PE'),nePE:n.root('N')===n.root('PE'),lampOn:n.has('L1.a','L')&&n.has('L1.b','N'),lampRev:n.has('L1.a','N')&&n.has('L1.b','L'),out:n.has('T1.L','L')&&n.has('T1.N','N'),outRev:n.has('T1.L','N')&&n.has('T1.N','L'),earth:n.has('T1.PE','PE')&&n.has('J.p','PE')});
  const now=st(c.nets()),open=st(c.nets({sw:{S1:false}})),shut=st(c.nets({sw:{S1:true}})),plugged=c.plugTo==='T1';
  if(now.short)return{cls:'error',head:'FALLA GRAVE',text:'La fase está unida directamente con neutro o tierra. En una instalación real debe actuar la protección.'};
  if(now.nePE)return{cls:'error',head:'Unión N–PE indebida',text:'No unas neutro y protección dentro del circuito final. PE debe permanecer separado y conectado a la puesta a tierra.'};
  if(now.outRev||now.lampRev)return{cls:'',head:'Polaridad incorrecta',text:'La fase y el neutro están invertidos en el foco o el tomacorriente. Corregí L y N.'};
  if(shut.lampOn&&open.lampOn)return{cls:'',head:'Llave puenteada',text:'El foco permanece encendido con la llave abierta. La fase debe atravesar la llave antes de llegar al foco.'};
  if(!shut.lampOn)return{cls:'',head:'Iluminación incompleta',text:'Con la llave cerrada, el foco debe recibir fase por su borne L y neutro por su borne N.'};
  if(!now.out)return{cls:'',head:'Tomacorriente sin tensión',text:'Llevá fase permanente a L y neutro a N; el toma no debe depender de la posición de la llave.'};
  if(!now.earth)return{cls:'',head:'Funciona, pero no es seguro',text:'Falta continuidad del conductor verde/amarillo entre tomacorriente, jabalina y PE de la línea.'};
  if(c.wrongColor())return{cls:'',head:'Código de colores incorrecto',text:'Marrón para fase, celeste para neutro y verde/amarillo exclusivamente para protección.'};
  if(!plugged)return{cls:'',head:'Cableado preparado',text:'La instalación está correcta. Arrastrá la ficha del motor hasta el tomacorriente para probarlo.'};
  if(now.out)return{cls:'ok',head:'Prueba superada',text:'El foco responde a la llave, el toma entrega 220 V~ y el motor gira con protección a tierra continua.',done:true};
  return{cls:'',head:'Motor detenido',text:'La ficha está colocada, pero el tomacorriente no presenta fase y neutro correctos.'};
 }},

{id:'ca-2p',group:'ca',ac:true,title:'CA · Circuito 2P y T',
 desc:'Dos llaves, dos focos, tomacorriente, motor y jabalina.',
 goal:'Cada llave comanda su foco (fase por la llave, neutro directo). El toma lleva fase y neutro permanentes y su tierra va a la jabalina. Luego enchufá el motor.',
 tip:'Dos ramales iguales: RED.L → llave → foco, RED.N → foco. Aparte, el toma con L, N y PE. La jabalina se une al PE.',
 explain:'Dos controles independientes sobre una misma fase, un toma permanente y protección a tierra continua. Es la base de una instalación de habitación con dos luces y un toma.',
 comps:[red(),sw('S1','Llave 1'),foco('L1'),sw('S2','Llave 2'),foco('L2'),toma('T1'),motor(),rod()],
 pos:{RED:[.1,.5],S1:[.34,.15],L1:[.62,.15],S2:[.34,.45],L2:[.62,.45],T1:[.8,.7],M:[.93,.4],J:[.34,.74]},
 plug:[.9,.88],
 sol:pairs(['RED.L-S1.a','RED.L-S2.a','S1.b-L1.a','S2.b-L2.a','RED.N-L1.b','RED.N-L2.b','RED.L-T1.L','RED.N-T1.N','RED.PE-T1.PE','T1.PE-J.p']),
 check(c){
  const st=n=>({short:n.root('L')===n.root('N')||n.root('L')===n.root('PE'),nePE:n.root('N')===n.root('PE'),on:[n.has('L1.a','L')&&n.has('L1.b','N'),n.has('L2.a','L')&&n.has('L2.b','N')],rev:[n.has('L1.a','N')&&n.has('L1.b','L'),n.has('L2.a','N')&&n.has('L2.b','L')],out:n.has('T1.L','L')&&n.has('T1.N','N'),outRev:n.has('T1.L','N')&&n.has('T1.N','L'),earth:n.has('T1.PE','PE')&&n.has('J.p','PE')});
  const now=st(c.nets()),off=st(c.nets({sw:{S1:false,S2:false}})),s1=st(c.nets({sw:{S1:true,S2:false}})),s2=st(c.nets({sw:{S1:false,S2:true}})),both=st(c.nets({sw:{S1:true,S2:true}})),plugged=c.plugTo==='T1';
  if(now.short)return{cls:'error',head:'FALLA GRAVE',text:'La fase está unida directamente con neutro o tierra.'};
  if(now.nePE)return{cls:'error',head:'Unión N–PE indebida',text:'Neutro y protección deben permanecer separados en el circuito final.'};
  if(now.outRev||now.rev.some(Boolean))return{cls:'',head:'Polaridad incorrecta',text:'Corregí L y N en el toma o en uno de los focos.'};
  if(off.on.some(Boolean))return{cls:'',head:'Llave puenteada',text:'Uno o ambos focos reciben fase sin atravesar su interruptor.'};
  if(!(s1.on[0]&&!s1.on[1]&&!s2.on[0]&&s2.on[1]&&both.on.every(Boolean)))return{cls:'',head:'Control incorrecto',text:'La primera llave debe controlar solo el foco 1 y la segunda solamente el foco 2.'};
  if(!now.out)return{cls:'',head:'Tomacorriente sin tensión',text:'El toma necesita fase y neutro permanentes, independientes de ambas llaves.'};
  if(!now.earth)return{cls:'',head:'Funciona, pero no es seguro',text:'Falta continuidad verde/amarilla entre toma, jabalina y PE.'};
  if(c.wrongColor())return{cls:'',head:'Código de colores incorrecto',text:'Marrón para fase y retornos, celeste para neutro y verde/amarillo para PE.'};
  if(!plugged)return{cls:'',head:'Cableado preparado',text:'Las dos luces responden correctamente. Conectá la ficha para probar el toma.'};
  if(now.out)return{cls:'ok',head:'Prueba superada',text:'Dos controles independientes, toma permanente y protección a tierra continua.',done:true};
  return{cls:'',head:'Motor detenido',text:'La ficha está colocada, pero el toma no presenta L y N correctos.'};
 }},

{id:'toma-doble',group:'ca',ac:true,title:'CA · Tomacorriente doble',
 desc:'Derivaciones desde una caja octogonal, dos tomas, jabalina y motor.',
 goal:'Hacé las derivaciones en la caja octogonal: cada fila (L, N, PE) une sus conectores. Llevá L, N y PE de la red a la caja, y desde la caja un ramal independiente a cada toma. La jabalina va al PE de la caja. Luego probá el motor en ambos tomas.',
 tip:'Red → caja: L, N y PE (primer conector de cada fila). Caja → Toma 1: segundos conectores; caja → Toma 2: terceros conectores. Jabalina: cuarto PE.',
 explain:'Los conectores de cada fila están unidos entre sí dentro de la caja: es el empalme. Cada toma sale con su propio ramal (sin puentes entre tomas), con fase, neutro y tierra, y la jabalina asegura la puesta a tierra de ambos.',
 comps:[red(),{id:'B',t:'box',w:300,name:'Caja octogonal',rows:[{t:['L1','L2','L3'],role:'L',label:'L'},{t:['N1','N2','N3'],role:'N',label:'N'},{t:['PE1','PE2','PE3','PE4'],role:'PE',label:'PE'}]},toma('T1','Toma 1'),toma('T2','Toma 2'),motor(),rod()],
 pos:{RED:[.1,.38],B:[.42,.45],T1:[.82,.17],T2:[.82,.54],M:[.62,.84],J:[.1,.74]},
 plug:[.77,.88],
 sol:pairs(['RED.L-B.L1','RED.N-B.N1','RED.PE-B.PE1','B.L2-T1.L','B.N2-T1.N','B.PE2-T1.PE','B.L3-T2.L','B.N3-T2.N','B.PE3-T2.PE','B.PE4-J.p']),
 check(c){
  const n=c.nets(),short=n.root('L')===n.root('N')||n.root('L')===n.root('PE'),nePE=n.root('N')===n.root('PE');
  const out=['T1','T2'].map(t=>n.has(t+'.L','L')&&n.has(t+'.N','N')),rev=['T1','T2'].map(t=>n.has(t+'.L','N')&&n.has(t+'.N','L')),earth=['T1','T2'].map(t=>n.has(t+'.PE','PE')),rodOk=n.has('J.p','PE');
  const bridge=c.links.some(l=>(/^T1\./.test(l.a)&&/^T2\./.test(l.b))||(/^T2\./.test(l.a)&&/^T1\./.test(l.b)));
  const pi=c.plugTo==='T1'?0:c.plugTo==='T2'?1:-1;
  if(short)return{cls:'error',head:'Falla grave',text:'Hay una unión directa entre fase, neutro o protección.'};
  if(nePE)return{cls:'error',head:'Unión N–PE indebida',text:'Neutro y tierra de protección deben permanecer separados.'};
  if(bridge)return{cls:'error',head:'Puente no permitido',text:'Retirá el puente entre tomas y llevá ramales independientes desde la caja octogonal.'};
  if(rev.some(Boolean))return{cls:'error',head:'Polaridad incorrecta',text:'Corregí L y N en el tomacorriente señalado.'};
  if(!out.every(Boolean))return{cls:'',head:'Alimentación incompleta',text:'Cada toma necesita fase y neutro desde los conectores de derivación de la caja.'};
  if(!earth.every(Boolean)||!rodOk)return{cls:'',head:'Protección incompleta',text:'Conectá ambos PE y la jabalina al conector verde/amarillo.'};
  if(c.wrongColor())return{cls:'',head:'Código de colores incorrecto',text:'Usá marrón para L, celeste para N y verde/amarillo exclusivamente para PE.'};
  if(pi<0)return{cls:'',head:'Cableado correcto',text:'Los dos tomas están listos. Arrastrá la ficha del motor para probarlos.'};
  if(out[pi])return{cls:'ok',head:'Prueba superada',text:'El toma '+(pi+1)+' alimenta el motor y conserva la protección a tierra.',done:true};
  return{cls:'',head:'Motor detenido',text:'La ficha está colocada, pero ese toma no tiene L y N correctos.'};
 }},

/* ---------------- CASA (paso de cableado de los croquis) ---------------- */
{id:'casa-escalera',group:'casa',hidden:true,ac:true,title:'Casa · Luz de escalera con combinación',
 desc:'Un foco comandado desde la planta baja y desde la planta alta.',
 goal:'Fase (marrón) al común del conmutador de planta baja; dos cables viajeros hasta el conmutador de planta alta; el común de este va al foco. Neutro (celeste) directo al foco. El foco debe cambiar de estado con cualquiera de los dos conmutadores.',
 tip:'Marrón: RED.L → común (C) del conmutador de planta baja; viajeros 1–1 y 2–2 entre los dos conmutadores; común del de planta alta → foco. Celeste: RED.N → foco.',
 explain:'La fase llega al común del primer conmutador, que elige uno de los dos viajeros. El segundo conmutador elige de cuál viajero toma la fase. El foco enciende cuando ambos eligen el mismo viajero, y el neutro va siempre directo al foco.',
 comps:[red(),Object.assign(sw3('C1'),{name:'Conmutador · planta baja'}),Object.assign(sw3('C2',true),{name:'Conmutador · planta alta'}),Object.assign(foco('L1'),{name:'Foco de escalera'})],
 pos:{RED:[.1,.5],C1:[.36,.25],C2:[.72,.25],L1:[.72,.72]},
 sol:pairs(['RED.L-C1.c','C1.a-C2.a','C1.b-C2.b','C2.c-L1.a','RED.N-L1.b']),
 check(c){
  const combos=[[false,false],[false,true],[true,false],[true,true]];
  const st=combos.map(p=>{const n=c.nets({sw:{C1:p[0],C2:p[1]}});return{short:n.root('L')===n.root('N')||n.root('L')===n.root('PE'),nePE:n.root('N')===n.root('PE'),on:n.has('L1.a','L')&&n.has('L1.b','N'),rev:n.has('L1.a','N')&&n.has('L1.b','L')}});
  if(st.some(x=>x.short))return{cls:'error',head:'FALLA GRAVE',text:'La fase quedó unida directamente con el neutro o con la tierra. En una instalación real actuaría la protección.'};
  if(st.some(x=>x.nePE))return{cls:'error',head:'Unión N–PE indebida',text:'Neutro y protección deben permanecer separados.'};
  if(st.some(x=>x.rev))return{cls:'',head:'Polaridad incorrecta',text:'La fase llegó al borne N del foco y el neutro al L. Corregí.'};
  const on=st.filter(x=>x.on).length;
  if(on===0)return{cls:'',head:'El foco no enciende',text:'Con ninguna posición de los conmutadores enciende. Revisá el camino: fase → C del conmutador de planta baja → viajeros → C del de planta alta → foco, y el neutro al foco.'};
  if(!(on===2&&st[0].on===st[3].on&&st[1].on===st[2].on&&st[0].on!==st[1].on))return{cls:'',head:'Todavía no es de combinación',text:'El foco enciende, pero no cambia de estado con cada conmutador. Usá los dos cables viajeros (1–1 y 2–2) entre los conmutadores.'};
  if(c.wrongColor())return{cls:'',head:'Código de colores incorrecto',text:'Marrón para fase y viajeros, celeste para el neutro.'};
  return{cls:'ok',head:'Escalera resuelta',text:'El foco se enciende o se apaga desde la planta baja y desde la planta alta, con el neutro directo al foco.',done:true};
 }},

casaAmbiente({id:'casa-pasillo',title:'Casa · Pasillo con llave y dos tomas',
 desc:'Un foco con llave simple y dos tomacorrientes con puesta a tierra.',
 goal:'Foco: fase (marrón) por la llave hasta el foco y neutro (celeste) directo. Tomas: fase, neutro y tierra (verde/amarillo) permanentes en cada toma, sin pasar por la llave.',
 tip:'Dos ramales: RED.L → llave → foco con RED.N → foco; y RED.L, RED.N y RED.PE a cada toma (Toma 1 y Toma 2 en paralelo).',
 explain:'La llave corta solo la fase del foco. Los tomas están siempre energizados con fase, neutro y tierra, y se alimentan en paralelo: si se saca un aparato de un toma, el otro sigue funcionando.',
 lamps:['L1'],switches:['S1'],swNames:['Llave del pasillo'],lampNames:['Foco del pasillo'],tomas:['T1','T2'],tomaNames:['Toma 1','Toma 2'],
 pos:{RED:[.1,.5],S1:[.32,.17],L1:[.6,.17],T1:[.6,.62],T2:[.9,.5]},okHead:'Pasillo resuelto',okText:'El foco responde a la llave y los dos tomas quedan energizados y con puesta a tierra.'}),

casaAmbiente({id:'casa-dormitorio',title:'Casa · Dormitorio',
 desc:'Foco con llave junto a la puerta y tomacorrientes con tierra.',
 goal:'Foco central comandado por la llave de la puerta (fase por la llave, neutro directo). Dos tomas permanentes con fase, neutro y tierra: uno de la cabecera y uno del escritorio.',
 tip:'Llave: RED.L → llave → foco, RED.N → foco. Tomas: RED.L, RED.N y RED.PE a cada toma.',
 explain:'El dormitorio combina un circuito de iluminación (la llave corta la fase del foco) y tomacorrientes siempre energizados. Los tomas de la cabecera y del escritorio se alimentan en paralelo desde el mismo circuito.',
 lamps:['L1'],switches:['S1'],swNames:['Llave de la puerta'],lampNames:['Foco del dormitorio'],tomas:['T1','T2'],tomaNames:['Toma de la cabecera','Toma del escritorio'],
 pos:{RED:[.1,.5],S1:[.32,.17],L1:[.6,.17],T1:[.6,.62],T2:[.9,.5]},okHead:'Dormitorio resuelto',okText:'La llave enciende el foco y los tomas de la cabecera y del escritorio tienen fase, neutro y tierra.'}),

casaAmbiente({id:'casa-cocina',title:'Casa · Cocina',
 desc:'Foco con llave y tomacorrientes de la mesada y de la heladera.',
 goal:'Foco central con su llave junto a la puerta. Tomas de la mesada y de la heladera, permanentes y con tierra.',
 tip:'Llave: RED.L → llave → foco, RED.N → foco. Tomas: RED.L, RED.N y RED.PE a cada toma.',
 explain:'La heladera debe estar siempre alimentada: su toma no depende de ninguna llave. Los tomas de la mesada alimentan artefactos de consumo alto y por eso deben tener tierra y conductor adecuado.',
 lamps:['L1'],switches:['S1'],swNames:['Llave de la cocina'],lampNames:['Foco de la cocina'],tomas:['T1','T2'],tomaNames:['Toma de la mesada','Toma de la heladera'],
 pos:{RED:[.1,.5],S1:[.32,.17],L1:[.6,.17],T1:[.6,.62],T2:[.9,.5]},okHead:'Cocina resuelta',okText:'El foco responde a su llave y los tomas de la mesada y de la heladera quedan permanentes y con tierra.'}),

casaAmbiente({id:'casa-living',title:'Casa · Living-comedor',
 desc:'Llave doble para dos focos y un tomacorriente para el televisor.',
 goal:'Una llave para el foco del living y otra para el foco del comedor (llave doble). Un toma permanente con tierra para el televisor.',
 tip:'Dos ramales: RED.L → cada llave → su foco, con RED.N → ambos focos. Aparte, RED.L, RED.N y RED.PE al toma.',
 explain:'La llave doble reúne dos llaves en una misma caja: cada una comanda un foco distinto. El toma del televisor queda permanente y con tierra.',
 lamps:['L1','L2'],switches:['S1','S2'],swNames:['Llave del living','Llave del comedor'],lampNames:['Foco del living','Foco del comedor'],tomas:['T1'],tomaNames:['Toma del televisor'],
 pos:{RED:[.1,.5],S1:[.32,.14],L1:[.62,.14],S2:[.32,.44],L2:[.62,.44],T1:[.84,.72]},okHead:'Living-comedor resuelto',okText:'Cada llave enciende su foco y el toma del televisor está permanente y con tierra.'}),

/* ---------------- PROTECCIÓN ---------------- */
{id:'led',group:'proteccion',title:'LED con resistor limitador',
 desc:'Un LED necesita un resistor en serie. ¿Cuál elegís?',
 goal:'Conectá el LED (ánodo A al +) en serie con UNO de los resistores para que encienda sin quemarse. Corriente ideal: 5 a 25 mA.',
 tip:'Resistor = (9 V − 2 V) / 20 mA ≈ 350 Ω. El valor comercial más cercano es 330 Ω. Con 100 Ω se quema.',
 explain:'El LED cae unos 2 V y no limita la corriente por sí solo. Con 330 Ω: I = (9 − 2) / 330 ≈ 21 mA. Con 1 kΩ: 7 mA (brilla menos). Con 100 Ω: más de 60 mA y se destruye.',
 comps:[bat(9),sw('S1'),res('Ra',100),res('Rb',330),res('Rc',1000),led('D')],
 pos:{Ra:[.3,.22],Rb:[.55,.22],Rc:[.8,.22],S1:[.3,.76],D:[.7,.76]},
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
 pos:{F:[.28,.22],S1:[.52,.22],L1:[.84,.15],L2:[.84,.5],L3:[.84,.79]},
 sol:pairs(['B.p-F.a','F.b-S1.a','S1.b-L1.a','S1.b-L2.a','L1.b-B.n','L2.b-B.n']),
 check(c){
  if(c.broken.F)return{cls:'error',head:'Fusible fundido',text:'Circularon más de 2,5 A. Quitá una lámpara (o abrí una rama), reemplazá el fusible y volvé a cerrar la llave.'};
  if(!c.allClosed)return null;
  const f=c.sim.c.F,lit=['L1','L2','L3'].filter(k=>c.sim.c[k].level>.01).length;
  if(f.i>.05&&Math.abs(f.i-c.sim.ibat)<.01&&lit>=2)return{cls:'ok',head:'Desafío completado',text:'El fusible protege la línea: circulan '+c.fmtI(f.i)+' (límite 2,5 A) con '+lit+' lámparas encendidas.',done:true};
  if(f.i>.05&&Math.abs(f.i-c.sim.ibat)>=.01)return{cls:'',head:'Fusible fuera de la línea principal',text:'Por el fusible pasa solo parte de la corriente. Ponelo en el cable común, antes de dividirse.'};
  return null;
 }},

/* ---------------- FALLAS ---------------- */
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
 pos:{S1:[.3,.5],L1:[.58,.22],L2:[.58,.76],L3:[.86,.22],L4:[.86,.76]},
 sol:pairs(['B.p-S1.a','S1.b-L1.a','S1.b-L2.a','S1.b-L3.a','S1.b-L4.a','L1.b-B.n','L2.b-B.n','L3.b-B.n','L4.b-B.n'])},

{id:'falla-mixto',group:'falla',title:'Falla · Circuito mixto de resistores',
 desc:'La corriente total es menor a la esperada: hay un resistor abierto.',
 goal:'Con la llave cerrada, medí tensión y corriente en R1, R2 y R3 e identificá el resistor abierto.',
 tip:'Resistor abierto: tiene tensión en sus bornes pero no pasa corriente por él. Comparalo con los demás.',
 explain:'Si R2 o R3 se abre, el circuito sigue funcionando pero con otra resistencia total (la corriente baja). Si lo hace R1, se corta todo. Medir tensión y corriente en cada elemento permite ubicar la falla.',
 fault:['R1','R2','R3'],
 comps:[bat(12),sw('S1'),res('R1',100),res('R2',220),res('R3',330)],
 pos:{S1:[.28,.22],R1:[.52,.22],R2:[.82,.22],R3:[.82,.76]},
 sol:pairs(['B.p-S1.a','S1.b-R1.a','R1.b-R2.a','R1.b-R3.a','R2.b-B.n','R3.b-B.n'])}
];

const items={};list.forEach(s=>items[s.id]=s);
return{groups,order:list.map(s=>s.id),items};
})();
