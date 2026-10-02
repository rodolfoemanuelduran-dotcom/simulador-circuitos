/* Tablero estrella-triángulo (el más avanzado). Se carga después de tablero-datos.js. */
(function(){
const B=window.TABLEROS.directo;const COLORS=B.COLORS,NAMES=B.NAMES,CONS=B.consejos;
const T={};const add=(id,x,y,lab,part,d)=>{T[id]={x,y,lab,part,d}};
[['R',70],['S',122],['T',174]].forEach(([n,x])=>add('X1.'+n,x,85,n,'X1','u'));add('X1.N',300,85,'N','X1','u');
[[70,1,2],[122,3,4],[174,5,6]].forEach(([x,a,b])=>{add('Q1.'+a,x,140,String(a),'Q1','u');add('Q1.'+b,x,215,String(b),'Q1','d')});
const km=(n,x0,aux)=>{[[x0+30,1,2],[x0+70,3,4],[x0+110,5,6]].forEach(([x,a,b])=>{add(n+'.'+a,x,258,String(a),n,'u');add(n+'.'+b,x,372,String(b),n,'d')});
 add(n+'.A1',x0+150,262,'A1',n,'u');add(n+'.A2',x0+150,368,'A2',n,'d');add(n+'.'+aux[0],x0+190,262,aux[0],n,'u');add(n+'.'+aux[1],x0+190,368,aux[1],n,'d')};
km('KM1',25,['13','14']);km('KM3',245,['21','22']);km('KM2',465,['21','22']);
add('KT1.A1',55,422,'A1','KT1','u');add('KT1.15',95,422,'15','KT1','u');add('KT1.16',135,422,'16','KT1','u');add('KT1.18',175,422,'18','KT1','u');add('KT1.A2',55,488,'A2','KT1','d');
[['U1',320],['V1',380],['W1',440],['W2',500],['U2',560],['V2',620]].forEach(([n,x])=>add('M.'+n,x,425,n,'M','u'));
add('S0.1',790,330,'1','S0','u');add('S0.2',790,400,'2','S0','d');add('S1.3',900,330,'3','S1','u');add('S1.4',900,400,'4','S1','d');
const P=Object.assign({},B.PARTES,{
 KM3:{t:'KM3 · Contactor triángulo',d:'Conecta cada principio de bobinado con el final del siguiente (U1-W2, V1-U2, W1-V2): triángulo, 380 V por bobinado. Es la conexión de régimen.'},
 KM2:{t:'KM2 · Contactor estrella',d:'Une entre sí los finales de los tres bobinados: estrella, 220 V por bobinado. Se usa sólo durante el arranque para reducir la corriente a un tercio.'},
 KT1:{t:'KT1 · Temporizador a la conexión',d:'Cuenta el tiempo de arranque. Su contacto conmutado (15-16 NC, 15-18 NA) cambia al cumplirse el tiempo y pasa el motor de estrella a triángulo.'},
 M:{t:'M · Motor de 6 bornes',d:'Tiene accesibles principio y final de cada bobinado: U1-U2, V1-V2 y W1-W2. En estrella cada bobinado recibe 220 V; en triángulo, 380 V.'}});
const W=[
 ['X1.R','Q1.1','R','La fase R entra al guardamotor Q1.'],['X1.S','Q1.3','S','Fase S a Q1.'],['X1.T','Q1.5','T','Fase T a Q1.'],
 ['Q1.2','KM1.1','R','De Q1 a la entrada del contactor de línea KM1.'],['Q1.4','KM1.3','S','Fase S a KM1.'],['Q1.6','KM1.5','T','Fase T a KM1.'],
 ['KM1.2','M.U1','R','KM1 alimenta los PRINCIPIOS de los bobinados: salida 2 a U1.'],['KM1.4','M.V1','S','Salida 4 a V1.'],['KM1.6','M.W1','T','Salida 6 a W1.'],
 ['KM1.2','KM3.1','R','TRIÁNGULO: KM3 toma las mismas fases de las salidas de KM1: 2 de KM1 a 1 de KM3.'],['KM1.4','KM3.3','S','4 de KM1 a 3 de KM3.'],['KM1.6','KM3.5','T','6 de KM1 a 5 de KM3.'],
 ['KM3.2','M.W2','R','Las salidas de KM3 van a los FINALES de los bobinados, desplazados: U1 con W2 (R) …'],['KM3.4','M.U2','S','… V1 con U2 (S) …'],['KM3.6','M.V2','T','… y W1 con V2 (T). Así queda el triángulo.'],
 ['M.W2','KM2.1','C','ESTRELLA: KM2 toma los finales de los bobinados: W2 a 1 de KM2 …'],['M.U2','KM2.3','C','… U2 a 3 de KM2 …'],['M.V2','KM2.5','C','… y V2 a 5 de KM2.'],
 ['KM2.2','KM2.4','C','Las salidas de KM2 se unen entre sí: ese es el punto neutro de la estrella (2 con 4).'],['KM2.4','KM2.6','C','Y 4 con 6.'],
 ['Q1.2','S0.1','C','Mando: fase R al pulsador de parada S0.'],['S0.2','S1.3','C','De S0 a la marcha S1.'],['S1.3','KM1.13','C','Retención de KM1: 13 junto a la entrada de S1.'],['S1.4','KM1.14','C','Salida del auxiliar 14 al borne 4 de S1.'],
 ['S1.4','KM1.A1','C','Bobina de KM1 (A1).'],['S1.4','KT1.A1','C','El temporizador se energiza junto con KM1 (A1).'],['S1.4','KT1.15','C','El común 15 del temporizador se alimenta de ese mismo punto.'],
 ['KT1.16','KM3.21','C','Camino estrella: 16 (NC retardado) pasa por el NC de KM3 (enclavamiento) …'],['KM3.22','KM2.A1','C','… y llega a la bobina de KM2 (estrella).'],
 ['KT1.18','KM2.21','C','Camino triángulo: 18 (NA retardado) pasa por el NC de KM2 (enclavamiento) …'],['KM2.22','KM3.A1','C','… y llega a la bobina de KM3 (triángulo).'],
 ['KM1.A2','X1.N','N','Retorno de KM1 al neutro.'],['KT1.A2','X1.N','N','Retorno de KT1 al neutro.'],['KM2.A2','X1.N','N','Retorno de KM2 al neutro.'],['KM3.A2','X1.N','N','Retorno de KM3 al neutro.']];
window.TABLEROS.sd={id:'sd',dibujo:'sd',titulo:'Tablero: arranque estrella-triángulo',esquema:'mando.html?c=tri-estrella-triangulo&anidado=1',
 intro:'El tablero más avanzado: guardamotor, tres contactores, temporizador y un motor de seis bornes. Cableá la potencia (estrella y triángulo) y el mando con enclavamientos y comprobá cómo el motor arranca en estrella y pasa a triángulo.',
 T,W,COLORS,NAMES,PARTES:P,partsList:['X1','Q1','KM1','KM3','KM2','KT1','M','S0','S1'],In:3.6,prot:{q:true},consejos:CONS.concat(['El motor debe quedar en estrella al arrancar y en triángulo en régimen.','Si KM2 y KM3 cierran juntos hay cortocircuito: revisá los enclavamientos 21-22.']),
 sim:{links:[['Q1.1','Q1.2','q'],['Q1.3','Q1.4','q'],['Q1.5','Q1.6','q'],['KM1.1','KM1.2','arm:KM1'],['KM1.3','KM1.4','arm:KM1'],['KM1.5','KM1.6','arm:KM1'],['KM3.1','KM3.2','arm:KM3'],['KM3.3','KM3.4','arm:KM3'],['KM3.5','KM3.6','arm:KM3'],['KM2.1','KM2.2','arm:KM2'],['KM2.3','KM2.4','arm:KM2'],['KM2.5','KM2.6','arm:KM2'],['KM1.13','KM1.14','arm:KM1'],['KM3.21','KM3.22','!arm:KM3'],['KM2.21','KM2.22','!arm:KM2'],['KT1.15','KT1.16','!kt'],['KT1.15','KT1.18','kt'],['S0.1','S0.2','nc:S0'],['S1.3','S1.4','no:S1']],
  coils:[{id:'KM1',a:'KM1.A1',b:'KM1.A2'},{id:'KM2',a:'KM2.A1',b:'KM2.A2'},{id:'KM3',a:'KM3.A1',b:'KM3.A2'},{id:'KT1',a:'KT1.A1',b:'KT1.A2'}],motor:{t:'m6',n:['M.U1','M.V1','M.W1','M.W2','M.U2','M.V2']},timer:{coil:'KT1',T:6}},
 diag(S,m){if(S.mode==='estrella')m.push(['ok','Conexión en ESTRELLA: cada bobinado a 220 V, corriente de arranque reducida a un tercio. Esperá a que cumpla el tiempo KT1.']);if(S.mode==='triangulo')m.push(['ok','Conexión en TRIÁNGULO: régimen, 380 V por bobinado.']);if(S.coils.KT1&&!S.kt.out)m.push(['ok','KT1 temporizando: '+S.kt.tm.toFixed(1).replace('.',',')+' de 6 s.']);if(S.btn.S1&&!S.coils.KM1&&S.power&&!S.burnt.KM1)m.push(['warn','Presionaste S1 pero KM1 no se energiza: revisá el camino del mando.']);if(S.coils.KM1&&S.mode==='parado')m.push(['warn','KM1 está cerrado pero el motor no arranca: faltan o están mal los cables de estrella o triángulo.'])},
 ejercicios:[
  {q:'En el arranque, ¿en qué conexión debe quedar el motor?',o:['Estrella','Triángulo','Monofásico'],ok:0,why:'La estrella reduce la corriente de arranque a un tercio.'},
  {q:'¿Qué une KM2 en la conexión estrella?',o:['Los tres finales de los bobinados','Los tres principios','Las tres fases de la red'],ok:0,why:'Une U2, V2 y W2: es el punto neutro de la estrella.'},
  {q:'¿Para qué sirve el NC 21-22 de KM2 y KM3 en serie con las bobinas?',o:['Para que no cierren a la vez','Para retener KM1','Para dar tiempo'],ok:0,why:'Si cerraran juntos habría un cortocircuito entre las tres fases.'},
  {q:'¿Qué componente decide cuándo pasar de estrella a triángulo?',o:['El temporizador KT1','El guardamotor','S0'],ok:0,why:'Su contacto conmutado cambia al cumplirse el tiempo.'}]};
})();
