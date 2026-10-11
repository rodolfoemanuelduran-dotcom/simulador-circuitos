/* Desafíos del taller libre. Cada desafío trae sus piezas sueltas, una regla de comportamiento (qué debe
   hacer cada salida según la posición de las llaves) y una solución de referencia. El simulador NO compara
   cables: prueba todas las combinaciones de llaves, así que cualquier cableado que funcione se acepta.
   Para agregar uno, sumá un objeto a `list` (ids de piezas únicos dentro del desafío). */
window.TDES=(function(){
const lamp=(id,n)=>({id,t:'lamp',r:12,vr:12,w:12,name:n||'Lámpara '+id});
const sw=(id,n)=>({id,t:'sw',name:n||'Llave '+id});
const sw3=(id,n,flip)=>({id,t:'sw3',flip:!!flip,name:n||'Conmutador '+id});
const sw4=(id,n,flip)=>({id,t:'sw4',flip:!!flip,name:n||'Llave de cruce '+id});
const buz=(id,vr,n)=>({id,t:'buz',r:Math.round(vr/.03),vr,name:n||'Zumbador '+id});
const pairs=a=>a.map(s=>s.split('-'));

const groups=[
 {id:'logica',title:'Lógica con llaves',desc:'Y, O y NO: cuándo van en serie, cuándo en paralelo y cuándo conviene un contacto de reposo.'},
 {id:'conm',title:'Conmutadores',desc:'Un conmutador elige entre dos caminos. Dos de ellos comandan una lámpara desde dos lugares.'},
 {id:'puntos',title:'Una lámpara, varios lugares',desc:'Combinación y cruce: apagar o encender desde 3 y 4 puntos, como en pasillos y escaleras reales.'}
];

const list=[
/* ---------------- LÓGICA CON LLAVES ---------------- */
{id:'y2',grupo:'logica',nivel:1,title:'Las dos manos',
 goal:'La lámpara L1 debe encender solamente cuando S1 y S2 estén cerradas al mismo tiempo (función Y).',
 tip:'Si hay que cerrar las dos a la vez, la corriente tiene un único camino y pasa por una llave y después por la otra: están en serie con la lámpara.',
 explain:'Dos llaves en serie forman una función Y (AND): la corriente pasa solo si las dos están cerradas. Así trabajan las prensas de seguridad que exigen usar las dos manos.',
 volts:12,parts:[sw('S1'),sw('S2'),lamp('L1')],pos:{S1:[.3,.18],S2:[.55,.18],L1:[.8,.48]},
 sol:pairs(['B.p-S1.a','S1.b-S2.a','S2.b-L1.a','L1.b-B.n']),
 want:s=>({L1:s.S1&&s.S2})},

{id:'o2',grupo:'logica',nivel:1,title:'Cualquiera de las dos',
 goal:'La lámpara L1 debe encender si está cerrada S1, o S2, o las dos (función O).',
 tip:'Cada llave necesita su propio camino hacia la lámpara: un camino por llave, los dos terminan en la misma lámpara (paralelo).',
 explain:'Dos llaves en paralelo forman una función O (OR): alcanza con cerrar una. Es lo que pasa con un timbre que tiene un pulsador en cada puerta.',
 volts:12,parts:[sw('S1'),sw('S2'),lamp('L1')],pos:{S1:[.4,.18],S2:[.4,.78],L1:[.78,.48]},
 sol:pairs(['B.p-S1.a','B.p-S2.a','S1.b-L1.a','S2.b-L1.a','L1.b-B.n']),
 want:s=>({L1:s.S1||s.S2})},

{id:'no1',grupo:'logica',nivel:1,title:'Luz de la heladera',
 goal:'El conmutador C1 es la puerta: posición 1 = abierta, posición 2 = cerrada. La lámpara L1 debe estar encendida con la puerta abierta y apagarse al cerrarla.',
 tip:'El conmutador tiene dos salidas. Usá solamente la que está conectada cuando la puerta está abierta (posición 1) y dejá libre la otra.',
 explain:'Es una función NO (NOT), un contacto «normalmente cerrado»: la luz está encendida cuando NADIE acciona el interruptor. La heladera apaga la luz porque al cerrar la puerta empuja el botón.',
 volts:12,parts:[sw3('C1','Puerta C1'),lamp('L1')],pos:{C1:[.4,.48],L1:[.78,.48]},
 sol:pairs(['B.p-C1.c','C1.a-L1.a','L1.b-B.n']),
 want:s=>({L1:!s.C1})},

{id:'yo3',grupo:'logica',nivel:2,title:'Dos juntas o una sola',
 goal:'La lámpara L1 debe encender si están cerradas S1 y S2 a la vez, o si está cerrada S3 (sola).',
 tip:'Hay dos caminos hacia la lámpara en paralelo: uno con S1 y S2 en serie y otro solamente con S3.',
 explain:'(S1 Y S2) O S3. Una rama con llaves en serie (Y) puesta en paralelo con otra rama (O). Combinar series y paralelos permite armar cualquier regla de comando.',
 volts:12,parts:[sw('S1'),sw('S2'),sw('S3'),lamp('L1')],pos:{S1:[.35,.18],S2:[.6,.18],S3:[.45,.78],L1:[.85,.48]},
 sol:pairs(['B.p-S1.a','S1.b-S2.a','B.p-S3.a','S2.b-L1.a','S3.b-L1.a','L1.b-B.n']),
 want:s=>({L1:(s.S1&&s.S2)||s.S3})},

{id:'yo3b',grupo:'logica',nivel:2,title:'Llave general y dos opciones',
 goal:'La lámpara L1 debe encender solamente con S1 cerrada, y además con S2 o S3 cerrada (o las dos).',
 tip:'S1 es la llave por la que tiene que pasar toda la corriente. Después de S1 el camino se abre en dos: S2 por un lado y S3 por el otro, y se juntan en la lámpara.',
 explain:'S1 Y (S2 O S3). La llave general en serie manda sobre todo lo que viene después: con ella abierta, nada enciende aunque las otras estén cerradas.',
 volts:12,parts:[sw('S1'),sw('S2'),sw('S3'),lamp('L1')],pos:{S1:[.3,.48],S2:[.55,.18],S3:[.55,.78],L1:[.82,.48]},
 sol:pairs(['B.p-S1.a','S1.b-S2.a','S1.b-S3.a','S2.b-L1.a','S3.b-L1.a','L1.b-B.n']),
 want:s=>({L1:s.S1&&(s.S2||s.S3)})},

{id:'maestra',grupo:'logica',nivel:2,title:'Llave maestra',
 goal:'Cada lámpara tiene su propia llave (S2 comanda L1 y S3 comanda L2), pero ninguna debe encender si la llave maestra S1 está abierta.',
 tip:'Primero la llave maestra S1 desde el polo +. Desde su salida salen dos ramas: una con S2 y L1 y otra con S3 y L2. Las dos lámparas vuelven al polo −.',
 explain:'La llave maestra queda en serie con todo el conjunto, y las dos ramas quedan en paralelo entre sí. Así funciona la llave general de un tablero: corta todos los circuitos de una vez.',
 volts:12,parts:[sw('S1','Llave maestra S1'),sw('S2'),sw('S3'),lamp('L1'),lamp('L2')],pos:{S1:[.28,.48],S2:[.52,.18],S3:[.52,.78],L1:[.78,.18],L2:[.78,.78]},
 sol:pairs(['B.p-S1.a','S1.b-S2.a','S1.b-S3.a','S2.b-L1.a','S3.b-L2.a','L1.b-B.n','L2.b-B.n']),
 want:s=>({L1:s.S1&&s.S2,L2:s.S1&&s.S3})},

{id:'puente',grupo:'logica',nivel:3,noColor:true,title:'Apagar con un puente',
 goal:'Con S1 cerrada tienen que encender L1 y L2 (una a continuación de la otra). Al cerrar además S2, L2 debe apagarse y L1 seguir encendida.',
 tip:'L1 y L2 van en serie con S1. S2 se pone en paralelo con L2: cuando se cierra, la corriente pasa por la llave y no por la lámpara L2.',
 explain:'Una llave en paralelo con una carga la «puentea»: la corriente elige el camino sin resistencia y la lámpara se apaga. Cuidado: ese puente solo es seguro porque L1 sigue limitando la corriente; puenteando las dos habría un cortocircuito.',
 volts:12,parts:[sw('S1'),sw('S2','Puente S2'),lamp('L1'),lamp('L2')],pos:{S1:[.3,.18],L1:[.6,.18],L2:[.6,.78],S2:[.85,.48]},
 sol:pairs(['B.p-S1.a','S1.b-L1.a','L1.b-L2.a','L2.b-B.n','L1.b-S2.a','S2.b-B.n']),
 want:s=>({L1:s.S1,L2:s.S1&&!s.S2})},

/* ---------------- CONMUTADORES ---------------- */
{id:'elegir',grupo:'conm',nivel:1,title:'Una luz u otra',
 goal:'Con el conmutador C1 en la posición 1 debe encender L1 y con C1 en la posición 2 debe encender L2. Nunca las dos juntas.',
 tip:'El común de C1 va al polo +. Una salida del conmutador alimenta a cada lámpara y las dos lámparas vuelven al polo −.',
 explain:'Un conmutador reparte la corriente por uno de dos caminos: la lámpara de un lado o la del otro, jamás las dos. Es la base de los selectores y de las luces de emergencia con alternancia.',
 volts:12,parts:[sw3('C1'),lamp('L1'),lamp('L2')],pos:{C1:[.4,.48],L1:[.78,.18],L2:[.78,.78]},
 sol:pairs(['B.p-C1.c','C1.a-L1.a','C1.b-L2.a','L1.b-B.n','L2.b-B.n']),
 want:s=>({L1:!s.C1,L2:!!s.C1})},

{id:'escalera',grupo:'conm',nivel:2,inv:true,title:'La escalera',
 goal:'La lámpara L1 debe cambiar de estado (encender o apagarse) al accionar cualquiera de los dos conmutadores, C1 abajo o C2 arriba.',
 tip:'Unilos con dos cables «viajeros»: una salida de C1 con una salida de C2, y la otra con la otra. El común de C1 va al +; el común de C2, a la lámpara; y la lámpara, al −.',
 explain:'La lámpara enciende cuando los dos conmutadores eligen el mismo camino viajero. Así se comanda una luz desde planta baja y desde planta alta: es el circuito de combinación.',
 volts:12,parts:[sw3('C1'),sw3('C2',null,true),lamp('L1')],pos:{C1:[.3,.18],C2:[.7,.18],L1:[.7,.78]},
 sol:pairs(['B.p-C1.c','C1.a-C2.a','C1.b-C2.b','C2.c-L1.a','L1.b-B.n']),
 want:s=>({L1:s.C1===s.C2})},

{id:'alarma3',grupo:'conm',nivel:2,title:'Alarma de tres puertas',
 goal:'Cada conmutador es una puerta: posición 1 = cerrada, posición 2 = abierta. El zumbador Z1 debe sonar si CUALQUIERA de las puertas está abierta y quedar en silencio con las tres cerradas.',
 tip:'Los tres comunes se conectan al polo +. De la posición 2 de cada puerta sale un cable hacia el zumbador, y el zumbador vuelve al −. Fijate que el + va a la pata + del zumbador.',
 explain:'Es una función O con tres contactos: alcanza con que una puerta se abra para que suene. Las alarmas reales hacen lo contrario (contactos de reposo en serie) porque así avisan también si alguien corta un cable.',
 volts:12,parts:[sw3('P1','Puerta 1'),sw3('P2','Puerta 2'),sw3('P3','Puerta 3'),buz('Z1',12,'Zumbador Z1')],pos:{P1:[.3,.18],P2:[.3,.48],P3:[.3,.78],Z1:[.75,.48]},
 sol:pairs(['B.p-P1.c','B.p-P2.c','B.p-P3.c','P1.b-Z1.a','P2.b-Z1.a','P3.b-Z1.a','Z1.b-B.n']),
 want:s=>({Z1:s.P1||s.P2||s.P3})},

/* ---------------- VARIOS PUNTOS (combinación + cruce) ---------------- */
{id:'pasillo3',grupo:'puntos',nivel:3,inv:true,title:'Pasillo: tres puntos de comando',
 goal:'La lámpara L1 debe cambiar de estado (encender o apagarse) al accionar cualquiera de las tres llaves: los conmutadores C1 y C2 en los extremos y la llave de cruce X1 en el medio.',
 tip:'Es la escalera con una llave más en el medio. Los dos cables viajeros que salen de C1 no van directo a C2: pasan por los bornes de la izquierda de X1 y siguen desde los bornes de la derecha hasta C2.',
 explain:'La llave de cruce tiene cuatro bornes y dos posiciones: pasa los dos viajeros derechos o los intercambia. Al intercambiarlos invierte el estado de la lámpara. Se pueden intercalar todas las llaves de cruce que se quiera entre los dos conmutadores.',
 volts:12,parts:[sw3('C1'),sw4('X1','Llave de cruce X1'),sw3('C2',null,true),lamp('L1')],pos:{C1:[.3,.48],X1:[.5,.48],C2:[.7,.48],L1:[.9,.48]},
 sol:pairs(['B.p-C1.c','C1.a-X1.a1','C1.b-X1.a2','X1.b1-C2.a','X1.b2-C2.b','C2.c-L1.a','L1.b-B.n']),
 want:s=>({L1:(s.C1===s.C2)!==s.X1})},

{id:'escalera4',grupo:'puntos',nivel:4,inv:true,title:'Escalera larga: cuatro puntos',
 goal:'Con una sola lámpara L1, comandala desde cuatro lugares: dos conmutadores (C1 y C2) en los extremos y dos llaves de cruce (X1 y X2) entre ellos. Cualquiera de las cuatro debe encender o apagar la lámpara.',
 tip:'Cadena de viajeros: C1 → X1 → X2 → C2. Cada tramo lleva dos cables. El común de C1 va al +, el común de C2 va a la lámpara y la lámpara al −.',
 explain:'Cada llave de cruce que se agrega suma un punto más de comando sin cambiar el resto. Con dos conmutadores y N llaves de cruce se comanda una lámpara desde N + 2 lugares: así se resuelven los pasillos largos de hoteles y escuelas.',
 volts:12,parts:[sw3('C1'),sw4('X1','Llave de cruce X1'),sw4('X2','Llave de cruce X2'),sw3('C2',null,true),lamp('L1')],pos:{C1:[.3,.18],X1:[.5,.18],X2:[.7,.18],C2:[.9,.18],L1:[.8,.78]},
 sol:pairs(['B.p-C1.c','C1.a-X1.a1','C1.b-X1.a2','X1.b1-X2.a1','X1.b2-X2.a2','X2.b1-C2.a','X2.b2-C2.b','C2.c-L1.a','L1.b-B.n']),
 want:s=>({L1:((s.C1===s.C2)!==s.X1)!==s.X2})}
];

const SWT=['sw','sw3','sw4'],OUTT=['lamp','led','dcm','buz','cal'];
/* completa llaves, salidas y tabla de combinaciones; la tabla se calcula con `want` (propios: ya viene guardada) */
function prepare(sp){
 if(sp._ok)return sp;
 sp.sws=sp.parts.filter(p=>SWT.includes(p.t)).map(p=>p.id);
 if(!sp.outs)sp.outs=sp.parts.filter(p=>OUTT.includes(p.t)).map(p=>p.id);
 if(!sp.rows){const n=sp.sws.length;sp.rows=[];
  for(let k=0;k<(1<<n);k++){const s={};sp.sws.forEach((id,i)=>s[id]=!!(k&(1<<(n-1-i))));const w=sp.want(s),lit={};sp.outs.forEach(id=>lit[id]=!!w[id]);sp.rows.push({sw:s,lit})}}
 sp.pid=sp.pid||'td-'+sp.id;sp._ok=true;return sp}
list.forEach(prepare);
const byId={};list.forEach(s=>byId[s.id]=s);
const nextOf=sp=>{const i=list.indexOf(sp);return i>=0&&i<list.length-1?list[i+1]:null};
return{groups,list,byId,prepare,nextOf,SWT,OUTT};
})();
