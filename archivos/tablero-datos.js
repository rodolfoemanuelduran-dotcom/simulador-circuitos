/* Tableros realistas para cablear (tablero.html). Cada tablero define bornes (T), cables de referencia (W)
   con su explicación, la lógica interna declarativa (sim) y las piezas. El dibujo está en tablero-dibujo.js. */
window.TABLEROS=window.TABLEROS||{};
(function(){
const COLORS={R:'#a8642a',S:'#34363c',T:'#d6342c',N:'#4aa8e8',C:'#f08a1f'};
const NAMES={R:'marrón (fase R)',S:'negro (fase S)',T:'rojo (fase T)',N:'celeste (neutro)',C:'naranja (mando)'};
const mk=()=>{const T={};return{T,add:(id,x,y,lab,part,d)=>{T[id]={x,y,lab,part,d}}}};
const X1=(add)=>{[['R',70],['S',122],['T',174]].forEach(([n,x])=>add('X1.'+n,x,85,n,'X1','u'));add('X1.N',300,85,'N','X1','u')};
const PARTES={
 X1:{t:'X1 · Bornera de entrada',d:'Bloques de conexión donde llegan R, S, T y el neutro de la red. Ordenan el ingreso de los cables y permiten desconectar el tablero sin tocar los aparatos.'},
 F1:{t:'F1 · Portafusibles tripolar',d:'Tres fusibles aM (para motores) en serie con cada fase. Protegen contra cortocircuitos: el hilo se funde y corta la corriente.'},
 Q1:{t:'Q1 · Guardamotor',d:'Interruptor automático para motores: protege contra sobrecarga (térmico) y cortocircuito (magnético). Tiene una palanca para conectar y desconectar a mano: tocala. Entradas arriba (1, 3, 5) y salidas abajo (2, 4, 6).'},
 KM1:{t:'KM1 · Contactor',d:'Interruptor accionado por un electroimán. Arriba entran las tres fases; A1 y A2 son la bobina de 220 V; 13-14 es un auxiliar NA y 21-22 un auxiliar NC. Los bornes de salida (2, 4, 6) alimentan la carga.'},
 KM2:{t:'KM2 · Contactor',d:'Segundo contactor, igual que KM1. En la inversión de giro se cablea con dos fases cruzadas.'},
 F2:{t:'F2 · Relé térmico',d:'Va acoplado debajo del contactor. Protege contra sobrecargas. 95-96 es su contacto NC, en serie con la bobina del contactor.'},
 M:{t:'M · Motor trifásico',d:'1,5 kW, 380 V, 3,6 A. Los bornes U, V y W de la caja de conexiones reciben las tres fases. Intercambiando dos se invierte el giro.'},
 S0:{t:'S0 · Pulsador de parada (rojo, NC)',d:'En la puerta. Del lado de atrás tiene un bloque de contactos NC con bornes 1 y 2.'},
 S1:{t:'S1 · Pulsador de marcha (verde, NA)',d:'Bloque NA con bornes 3 y 4 (o 13-14 en la selectora). Al accionarlo une sus dos bornes.'},
 S2:{t:'S2 · Pulsador de marcha atrás (NA)',d:'Igual que S1, para el sentido contrario.'}};
const CONS=['Primero la potencia (las tres fases), después el mando.','Verificá siempre con el tablero sin tensión antes de energizar.','Un mismo borne puede recibir dos cables.','Si una bobina queda entre dos fases recibe 380 V y se quema: debe ir entre fase y neutro.'];

/* ============ 1. Marcha-parada con retención ============ */
(function(){const {T,add}=mk();X1(add);
[[70,1,2],[122,3,4],[174,5,6]].forEach(([x,a,b])=>{add('F1.'+a,x,140,String(a),'F1','u');add('F1.'+b,x,215,String(b),'F1','d')});
[[70,1],[122,3],[174,5]].forEach(([x,a])=>add('KM1.'+a,x,258,a+'/L'+((a+1)/2),'KM1','u'));
add('KM1.A1',232,262,'A1','KM1','u');add('KM1.13',284,262,'13','KM1','u');add('KM1.A2',232,368,'A2','KM1','d');add('KM1.14',284,368,'14','KM1','d');
add('F2.95',232,420,'95','F2','u');add('F2.96',284,420,'96','F2','u');
[[70,'T1',2],[122,'T2',4],[174,'T3',6]].forEach(([x,n,k])=>add('F2.'+n,x,478,k+'/'+n,'F2','d'));
[['U',440],['V',500],['W',560]].forEach(([n,x])=>add('M.'+n,x,420,n,'M','u'));
add('S0.1',790,330,'1','S0','u');add('S0.2',790,400,'2','S0','d');add('S1.3',900,330,'3','S1','u');add('S1.4',900,400,'4','S1','d');
const W=[
 ['X1.R','F1.1','R','La fase R de la red entra al fusible F1 (primer polo). Los fusibles protegen contra cortocircuitos.'],
 ['X1.S','F1.3','S','La fase S va al segundo polo del fusible.'],['X1.T','F1.5','T','La fase T va al tercer polo del fusible.'],
 ['F1.2','KM1.1','R','De la salida del fusible la fase R sube a la entrada 1/L1 del contactor.'],
 ['F1.4','KM1.3','S','Lo mismo con la fase S: de 4 (fusible) a 3/L2 (contactor).'],['F1.6','KM1.5','T','Y con la fase T: de 6 (fusible) a 5/L3 (contactor).'],
 ['F2.T1','M.U','R','Bajo el contactor está acoplado el relé térmico (sus entradas ya están unidas a las salidas del contactor). De su salida 2/T1 sale la fase R al borne U del motor.'],
 ['F2.T2','M.V','S','De 4/T2 va la fase S al borne V del motor.'],['F2.T3','M.W','T','De 6/T3 va la fase T al borne W del motor. Con esto termina la potencia.'],
 ['F1.2','F2.95','C','Comienza el circuito de mando: se toma la fase R (220 V respecto de N) y se lleva al contacto 95 del térmico, que está en serie con la bobina.'],
 ['F2.96','S0.1','C','De 96 (térmico) pasa al pulsador de parada S0, borne 1.'],['S0.2','S1.3','C','De S0 (borne 2) pasa al pulsador de marcha S1 (borne 3).'],
 ['S1.3','KM1.13','C','Retención: el contacto auxiliar 13 de KM1 se une al mismo punto que el borne 3 de S1, en paralelo con S1.'],
 ['S1.4','KM1.14','C','El otro extremo del auxiliar (14) se une al borne 4 de S1.'],['S1.4','KM1.A1','C','De ese punto se alimenta la bobina: borne A1 de KM1.'],
 ['KM1.A2','X1.N','N','El otro extremo de la bobina (A2) vuelve al neutro de la bornera: 220 V entre fase y neutro.']];
window.TABLEROS.enclav={id:'enclav',dibujo:'enclav',titulo:'Tablero: marcha-parada con retención',esquema:'mando.html?c=tri-enclavamiento&anidado=1',
 intro:'Cableá el tablero de un arranque con pulsadores: fusibles F1, contactor KM1, relé térmico F2, pulsadores S0 y S1 en la puerta y motor M. Tocá un borne y después el otro (o arrastrá) para tender un cable.',
 T,W,COLORS,NAMES,PARTES,partsList:['X1','F1','KM1','F2','M','S0','S1'],In:3.6,prot:{th:true,fus:true},consejos:CONS,
 sim:{links:[['F1.1','F1.2','fus'],['F1.3','F1.4','fus'],['F1.5','F1.6','fus'],['KM1.1','F2.T1','arm:KM1'],['KM1.3','F2.T2','arm:KM1'],['KM1.5','F2.T3','arm:KM1'],['KM1.13','KM1.14','arm:KM1'],['F2.95','F2.96','th'],['S0.1','S0.2','nc:S0'],['S1.3','S1.4','no:S1']],coils:[{id:'KM1',a:'KM1.A1',b:'KM1.A2'}],motor:{t:'m3',n:['M.U','M.V','M.W']}},
 diag(S,m,u){if(S.coils.KM1&&!S.btn.S1&&(S.arms.KM1||0)>.9)m.push(['ok','S1 está suelto y la bobina sigue energizada: la retención (13-14) funciona.']);if(S.btn.S1&&!S.coils.KM1&&!S.burnt.KM1)m.push(['warn','Presionaste S1 pero la bobina no se energiza: falta o está mal algún cable del mando.']);if(S.coils.KM1&&S.mode==='parado')m.push(['warn','KM1 cierra pero el motor no recibe las tres fases: revisá la potencia.'])},
 ejercicios:[
  {q:'¿Por qué se cablea primero la potencia y después el mando?',o:['Por orden y seguridad: son los cables de mayor sección','Porque el mando no importa','La norma lo prohíbe al revés'],ok:0,why:'Es una práctica ordenada de montaje.'},
  {q:'¿Qué pasa si conectás la bobina A1-A2 entre dos fases (380 V)?',o:['Funciona mejor','Se quema, porque es de 220 V','Nada'],ok:1,why:'Está diseñada para 220 V (fase-neutro).'},
  {q:'¿Por qué el contacto 13-14 va en paralelo con S1?',o:['Para retener el contactor al soltar S1','Para proteger de cortocircuitos','Para medir corriente'],ok:0,why:'Es la retención.'}]};})();

/* ============ 2. Arranque directo con guardamotor ============ */
(function(){const {T,add}=mk();X1(add);
[[70,1,2],[122,3,4],[174,5,6]].forEach(([x,a,b])=>{add('Q1.'+a,x,140,String(a),'Q1','u');add('Q1.'+b,x,215,String(b),'Q1','d')});
[[70,1,2],[122,3,4],[174,5,6]].forEach(([x,a,b])=>{add('KM1.'+a,x,258,a+'/L'+((a+1)/2),'KM1','u');add('KM1.'+b,x,372,b+'/T'+(b/2),'KM1','d')});
add('KM1.A1',232,262,'A1','KM1','u');add('KM1.A2',232,368,'A2','KM1','d');
[['U',440],['V',500],['W',560]].forEach(([n,x])=>add('M.'+n,x,420,n,'M','u'));
add('S1.13',850,330,'13','S1','u');add('S1.14',850,400,'14','S1','d');
const W=[
 ['X1.R','Q1.1','R','La fase R entra al guardamotor Q1 (borne 1). Q1 protege al motor y a los cables contra sobrecargas y cortocircuitos.'],['X1.S','Q1.3','S','La fase S entra al borne 3 de Q1.'],['X1.T','Q1.5','T','La fase T entra al borne 5 de Q1.'],
 ['Q1.2','KM1.1','R','De la salida 2 de Q1 la fase R va a la entrada 1/L1 del contactor.'],['Q1.4','KM1.3','S','De 4 (Q1) a 3/L2 (KM1).'],['Q1.6','KM1.5','T','De 6 (Q1) a 5/L3 (KM1).'],
 ['KM1.2','M.U','R','De la salida 2/T1 del contactor al borne U del motor.'],['KM1.4','M.V','S','De 4/T2 al borne V del motor.'],['KM1.6','M.W','T','De 6/T3 al borne W. Con esto termina la potencia.'],
 ['Q1.2','S1.13','C','Mando: se toma la fase R (220 V respecto de N) y se lleva a la selectora S1, borne 13.'],
 ['S1.14','KM1.A1','C','De la selectora (borne 14) a la bobina del contactor, borne A1.'],
 ['KM1.A2','X1.N','N','El otro extremo de la bobina vuelve al neutro de la bornera.']];
window.TABLEROS.directo={id:'directo',dibujo:'directo',titulo:'Tablero: arranque directo con guardamotor',esquema:'mando.html?c=tri-directo&anidado=1',
 intro:'El tablero más simple: guardamotor Q1, contactor KM1 y una selectora ON/OFF en la puerta. Cableá la potencia y el mando y después probalo.',
 T,W,COLORS,NAMES,PARTES,partsList:['X1','Q1','KM1','M','S1'],In:3.6,prot:{q:true},consejos:CONS,
 sim:{links:[['Q1.1','Q1.2','q'],['Q1.3','Q1.4','q'],['Q1.5','Q1.6','q'],['KM1.1','KM1.2','arm:KM1'],['KM1.3','KM1.4','arm:KM1'],['KM1.5','KM1.6','arm:KM1'],['S1.13','S1.14','sel:S1']],coils:[{id:'KM1',a:'KM1.A1',b:'KM1.A2'}],motor:{t:'m3',n:['M.U','M.V','M.W']}},
 diag(S,m){if(S.sel.S1&&!S.coils.KM1&&!S.burnt.KM1&&S.power)m.push(['warn','La selectora está en ON pero la bobina no se energiza: revisá el mando (Q1.2 → S1 → A1 y A2 → N).']);if(S.coils.KM1&&S.mode==='parado'&&S.q.on&&!S.q.trip)m.push(['warn','KM1 cierra pero el motor no recibe las 3 fases: revisá la potencia.'])},
 ejercicios:[
  {q:'¿De dónde se toma la fase de mando en este tablero?',o:['De la salida del guardamotor (Q1.2)','Del motor','Del neutro'],ok:0,why:'Aguas abajo de Q1: si Q1 abre, también cae el mando.'},
  {q:'¿Qué protege Q1?',o:['Sobrecarga y cortocircuito','Sólo sobretensión','Sólo la bobina'],ok:0,why:'Térmico y magnético.'},
  {q:'La bobina A1-A2 se conecta entre…',o:['Fase y neutro (220 V)','Dos fases (380 V)','Neutro y tierra'],ok:0,why:'Es una bobina de 220 V.'}]};})();

/* ============ 3. Inversión de giro ============ */
(function(){const {T,add}=mk();X1(add);
[[70,1,2],[122,3,4],[174,5,6]].forEach(([x,a,b])=>{add('Q1.'+a,x,140,String(a),'Q1','u');add('Q1.'+b,x,215,String(b),'Q1','d')});
const km=(n,x0)=>{[[x0,1,2],[x0+46,3,4],[x0+92,5,6]].forEach(([x,a,b])=>{add(n+'.'+a,x,258,String(a),n,'u');add(n+'.'+b,x,372,String(b),n,'d')});
 add(n+'.A1',x0+150,262,'A1',n,'u');add(n+'.13',x0+194,262,'13',n,'u');add(n+'.21',x0+238,262,'21',n,'u');add(n+'.A2',x0+150,368,'A2',n,'d');add(n+'.14',x0+194,368,'14',n,'d');add(n+'.22',x0+238,368,'22',n,'d')};
km('KM1',60);km('KM2',390);
[['U',370],['V',430],['W',490]].forEach(([n,x])=>add('M.'+n,x,430,n,'M','u'));
add('S0.1',770,330,'1','S0','u');add('S0.2',770,400,'2','S0','d');add('S1.3',850,330,'3','S1','u');add('S1.4',850,400,'4','S1','d');add('S2.3',930,330,'3','S2','u');add('S2.4',930,400,'4','S2','d');
const W=[
 ['X1.R','Q1.1','R','La fase R entra a Q1.'],['X1.S','Q1.3','S','La fase S entra a Q1.'],['X1.T','Q1.5','T','La fase T entra a Q1.'],
 ['Q1.2','KM1.1','R','De Q1 a KM1 (adelante): fase R a 1/L1.'],['Q1.4','KM1.3','S','Fase S a 3/L2 de KM1.'],['Q1.6','KM1.5','T','Fase T a 5/L3 de KM1.'],
 ['Q1.2','KM2.1','R','KM2 (atrás) toma las mismas fases de Q1: R a 1/L1 de KM2.'],['Q1.4','KM2.3','S','S a 3/L2 de KM2.'],['Q1.6','KM2.5','T','T a 5/L3 de KM2.'],
 ['KM1.2','M.U','R','KM1 al motor en orden normal: 2/T1 a U.'],['KM1.4','M.V','S','4/T2 a V.'],['KM1.6','M.W','T','6/T3 a W: el motor gira en sentido horario.'],
 ['KM2.2','M.U','R','KM2 al motor con DOS FASES CRUZADAS: 2/T1 a U (R) …'],['KM2.4','M.W','S','… 4/T2 (fase S) va a W …'],['KM2.6','M.V','T','… y 6/T3 (fase T) va a V. Así el motor gira al revés.'],
 ['Q1.2','S0.1','C','Mando: fase R al pulsador de parada S0 (borne 1).'],['S0.2','S1.3','C','De S0 a la marcha adelante S1 (borne 3).'],['S0.2','S2.3','C','Y a la marcha atrás S2 (borne 3).'],
 ['S1.3','KM1.13','C','Retención de KM1: el 13 se une a la entrada de S1.'],['S2.3','KM2.13','C','Retención de KM2: el 13 se une a la entrada de S2.'],
 ['S1.4','KM1.14','C','Salida del 13-14 de KM1 al borne 4 de S1.'],['S2.4','KM2.14','C','Salida del 13-14 de KM2 al borne 4 de S2.'],
 ['S1.4','KM2.21','C','ENCLAVAMIENTO: el NC 21-22 de KM2 se pone en serie con la bobina de KM1. Entrada 21 ← salida de S1.'],['KM2.22','KM1.A1','C','El 22 del NC de KM2 alimenta la bobina KM1 (A1).'],
 ['S2.4','KM1.21','C','ENCLAVAMIENTO: el NC 21-22 de KM1 va en serie con la bobina de KM2. Entrada 21 ← salida de S2.'],['KM1.22','KM2.A1','C','El 22 del NC de KM1 alimenta la bobina KM2 (A1).'],
 ['KM1.A2','X1.N','N','Retorno de la bobina KM1 al neutro.'],['KM2.A2','X1.N','N','Retorno de la bobina KM2 al neutro.']];
window.TABLEROS.inversion={id:'inversion',dibujo:'inversion',titulo:'Tablero: inversión de giro con enclavamiento',esquema:'mando.html?c=tri-inversion&anidado=1',
 intro:'Dos contactores y tres pulsadores. KM2 cruza dos fases para invertir el giro y los contactos NC 21-22 se cablean en serie con las bobinas para impedir que cierren juntos. Es el tablero más completo de la serie.',
 T,W,COLORS,NAMES,PARTES,partsList:['X1','Q1','KM1','KM2','M','S0','S1','S2'],In:3.6,prot:{q:true},consejos:CONS.concat(['Fijate bien en el orden de las fases en KM2: dos están cruzadas.']),
 sim:{links:[['Q1.1','Q1.2','q'],['Q1.3','Q1.4','q'],['Q1.5','Q1.6','q'],['KM1.1','KM1.2','arm:KM1'],['KM1.3','KM1.4','arm:KM1'],['KM1.5','KM1.6','arm:KM1'],['KM2.1','KM2.2','arm:KM2'],['KM2.3','KM2.4','arm:KM2'],['KM2.5','KM2.6','arm:KM2'],['KM1.13','KM1.14','arm:KM1'],['KM2.13','KM2.14','arm:KM2'],['KM1.21','KM1.22','!arm:KM1'],['KM2.21','KM2.22','!arm:KM2'],['S0.1','S0.2','nc:S0'],['S1.3','S1.4','no:S1'],['S2.3','S2.4','no:S2']],coils:[{id:'KM1',a:'KM1.A1',b:'KM1.A2'},{id:'KM2',a:'KM2.A1',b:'KM2.A2'}],motor:{t:'m3',n:['M.U','M.V','M.W']}},
 diag(S,m){if(S.mode==='directo'&&S.w>.1)m.push(['ok','Sentido de giro: '+(S.dir>0?'horario (KM1 adelante)':'antihorario (KM2 atrás)')+'.']);if(S.coils.KM1&&S.btn.S2&&!S.coils.KM2)m.push(['ok','El enclavamiento funciona: con KM1 cerrado, S2 no puede energizar KM2.']);if(S.btn.S1&&!S.coils.KM1&&!S.coils.KM2&&S.power)m.push(['warn','Presionaste S1 y KM1 no se energiza: revisá el camino S0 → S1 → NC de KM2 → A1 de KM1.'])},
 ejercicios:[
  {q:'¿Para qué se cablea el NC 21-22 de cada contactor en serie con la bobina del otro?',o:['Para que no cierren juntos','Para encender lámparas','Para retener'],ok:0,why:'Evitan el cortocircuito entre fases.'},
  {q:'En KM2 se cruzan dos fases para…',o:['Invertir el sentido de giro','Bajar la corriente','Proteger el motor'],ok:0,why:'Intercambiando dos fases se invierte el campo giratorio.'},
  {q:'Si KM1 y KM2 cerraran a la vez, ¿qué pasaría?',o:['Cortocircuito entre fases','El motor frenaría','Nada'],ok:0,why:'Se unirían S y T entre sí.'}]};})();
})();
