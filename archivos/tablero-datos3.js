/* Tableros adicionales: monofásicos, marcha por impulsos y arranque temporizado. Se carga después de tablero-datos2.js. */
(function(){
const B=window.TABLEROS.directo,COLORS=B.COLORS,NAMES=B.NAMES,CONS=B.consejos;
const mk=()=>{const T={};return{T,add:(id,x,y,lab,part,d)=>{T[id]={x,y,lab,part,d}}}};
const P0=Object.assign({},B.PARTES,{
 Q1:{t:'Q1 · Interruptor termomagnético',d:'Protege la instalación y el motor contra sobrecarga (térmico) y cortocircuito (magnético). Se maniobra con la palanca: tocala. Entrada arriba (1), salida abajo (2).'},
 M:{t:'M · Motor',d:'Los bornes de la caja de conexiones reciben las tensiones del motor.'},
 KA1:{t:'KA1 · Relé auxiliar',d:'Pequeño relé de bobina A1-A2 y contacto NA 13-14. Aquí “memoriza” la orden de marcha (se retiene a sí mismo).'},
 KT1:{t:'KT1 · Temporizador a la conexión',d:'Relé de tiempo: al energizar A1-A2 cuenta el retardo y recién entonces cierra su contacto 15-18.'},
 S3:{t:'S3 · Selectora permanente / impulsos',d:'En ON habilita la retención (marcha permanente); en OFF la anula (marcha por impulsos).'}});
const mono=(extra)=>Object.assign({In:4.5},extra);

/* ===== 1. Monofásico directo ===== */
(function(){const {T,add}=mk();
add('X1.R',70,85,'F','X1','u');add('X1.N',300,85,'N','X1','u');
add('Q1.1',70,140,'1','Q1','u');add('Q1.2',70,215,'2','Q1','d');
add('KM1.1',70,258,'1/L1','KM1','u');add('KM1.2',70,372,'2/T1','KM1','d');add('KM1.A1',232,262,'A1','KM1','u');add('KM1.A2',232,368,'A2','KM1','d');
add('M.L',440,420,'L','M','u');add('M.N',500,420,'N','M','u');
add('S1.13',850,330,'13','S1','u');add('S1.14',850,400,'14','S1','d');
const W=[['X1.R','Q1.1','R','La fase (F) de la red entra al interruptor termomagnético Q1 (borne 1).'],['Q1.2','KM1.1','R','De la salida de Q1 la fase va a la entrada 1/L1 del contactor.'],['KM1.2','M.L','R','De la salida 2/T1 del contactor al borne L (fase) del motor.'],['X1.N','M.N','N','El neutro va directo al motor: sólo se interrumpe la fase.'],
 ['Q1.2','S1.13','C','Mando: se toma la fase de la salida de Q1 y se lleva a la selectora S1 (13).'],['S1.14','KM1.A1','C','De la selectora (14) a la bobina del contactor (A1).'],['KM1.A2','X1.N','N','El otro extremo de la bobina (A2) vuelve al neutro: 220 V entre fase y neutro.']];
window.TABLEROS.monodirecto={id:'monodirecto',dibujo:'monodirecto',titulo:'Tablero: arranque directo monofásico',esquema:'mando.html?c=mono-directo&anidado=1',
 intro:'Motor monofásico de 220 V: termomagnética Q1, contactor KM1 y una selectora en la puerta. Cableá la fase, el neutro y el mando.',
 T,W,COLORS,NAMES,PARTES:P0,partsList:['X1','Q1','KM1','M','S1'],In:4.5,prot:{q:true},consejos:CONS,
 sim:{src:{R:'X1.R',N:'X1.N'},links:[['Q1.1','Q1.2','q'],['KM1.1','KM1.2','arm:KM1'],['S1.13','S1.14','sel:S1']],coils:[{id:'KM1',a:'KM1.A1',b:'KM1.A2'}],motor:{t:'m1',n:['M.L','M.N']}},
 ejercicios:[{q:'¿Qué conductor interrumpe el contactor en este tablero?',o:['La fase','El neutro','Ambos'],ok:0,why:'La fase pasa por Q1 y KM1; el neutro va directo al motor.'},{q:'La tensión del motor es…',o:['220 V','380 V','24 V'],ok:0,why:'Fase y neutro: 220 V.'},{q:'La bobina A1-A2 se conecta entre…',o:['Fase y neutro','Dos fases','Neutro y tierra'],ok:0,why:'Es de 220 V.'}]};})();

/* ===== 2. Monofásico marcha-parada ===== */
(function(){const {T,add}=mk();
add('X1.R',70,85,'F','X1','u');add('X1.N',300,85,'N','X1','u');
add('F1.1',70,140,'1','F1','u');add('F1.2',70,215,'2','F1','d');
add('KM1.1',70,258,'1/L1','KM1','u');add('KM1.A1',232,262,'A1','KM1','u');add('KM1.13',284,262,'13','KM1','u');add('KM1.A2',232,368,'A2','KM1','d');add('KM1.14',284,368,'14','KM1','d');
add('F2.95',232,420,'95','F2','u');add('F2.96',284,420,'96','F2','u');add('F2.T1',70,478,'2/T1','F2','d');
add('M.L',440,420,'L','M','u');add('M.N',500,420,'N','M','u');
add('S0.1',790,330,'1','S0','u');add('S0.2',790,400,'2','S0','d');add('S1.3',900,330,'3','S1','u');add('S1.4',900,400,'4','S1','d');
const W=[['X1.R','F1.1','R','La fase entra al fusible F1.'],['F1.2','KM1.1','R','De la salida del fusible a la entrada 1/L1 del contactor.'],['F2.T1','M.L','R','Bajo el contactor está acoplado el relé térmico: su salida 2/T1 va al borne L del motor.'],['X1.N','M.N','N','El neutro va directo al motor.'],
 ['F1.2','F2.95','C','Mando: la fase sale del fusible hacia el contacto 95 del térmico.'],['F2.96','S0.1','C','De 96 al pulsador de parada S0.'],['S0.2','S1.3','C','De S0 a la marcha S1 (3).'],['S1.3','KM1.13','C','Retención: el 13 de KM1 junto a la entrada de S1.'],['S1.4','KM1.14','C','El 14 junto al borne 4 de S1.'],['S1.4','KM1.A1','C','De ese punto a la bobina (A1).'],['KM1.A2','X1.N','N','El otro extremo de la bobina al neutro.']];
window.TABLEROS.monomp={id:'monomp',dibujo:'enclav',motorLabel:'MOTOR 1~ · 0,75 kW · 220 V',titulo:'Tablero: marcha-parada monofásico',esquema:'mando.html?c=mono-marcha-parada&anidado=1',
 intro:'Marcha-parada con retención para un motor monofásico: fusible F1, contactor KM1, relé térmico F2 y pulsadores en la puerta.',
 T,W,COLORS,NAMES,PARTES:P0,partsList:['X1','F1','KM1','F2','M','S0','S1'],In:4.5,prot:{th:true,fus:true},consejos:CONS,
 sim:{src:{R:'X1.R',N:'X1.N'},links:[['F1.1','F1.2','fus'],['KM1.1','F2.T1','arm:KM1'],['KM1.13','KM1.14','arm:KM1'],['F2.95','F2.96','th'],['S0.1','S0.2','nc:S0'],['S1.3','S1.4','no:S1']],coils:[{id:'KM1',a:'KM1.A1',b:'KM1.A2'}],motor:{t:'m1',n:['M.L','M.N']}},
 ejercicios:[{q:'¿Para qué el 13-14 en paralelo con S1?',o:['Retención','Medición','Protección'],ok:0,why:'Mantiene la bobina al soltar S1.'},{q:'¿Qué protege contra cortocircuito?',o:['El fusible F1','El térmico','S0'],ok:0,why:'El térmico sólo protege de sobrecargas.'},{q:'S0 es NC porque…',o:['Falla de forma segura','Es más barato','Arranca antes'],ok:0,why:'Un cable cortado detiene la máquina.'}]};})();

/* ===== 3. Marcha por impulsos ===== */
(function(){const {T,add}=mk();
['R','S','T'].forEach((n,i)=>add('X1.'+n,[70,122,174][i],85,n,'X1','u'));add('X1.N',300,85,'N','X1','u');
[[70,1,2],[122,3,4],[174,5,6]].forEach(([x,a,b])=>{add('Q1.'+a,x,140,String(a),'Q1','u');add('Q1.'+b,x,215,String(b),'Q1','d');add('KM1.'+a,x,258,a+'/L'+((a+1)/2),'KM1','u');add('KM1.'+b,x,372,b+'/T'+(b/2),'KM1','d')});
add('KM1.A1',232,262,'A1','KM1','u');add('KM1.A2',232,368,'A2','KM1','d');add('KM1.13',284,262,'13','KM1','u');add('KM1.14',284,368,'14','KM1','d');
[['U',440],['V',500],['W',560]].forEach(([n,x])=>add('M.'+n,x,420,n,'M','u'));
add('S0.1',770,330,'1','S0','u');add('S0.2',770,400,'2','S0','d');add('S1.3',850,330,'3','S1','u');add('S1.4',850,400,'4','S1','d');add('S3.13',930,330,'13','S3','u');add('S3.14',930,400,'14','S3','d');
const W=[['X1.R','Q1.1','R','Entran las fases al guardamotor.'],['X1.S','Q1.3','S','Fase S a Q1.'],['X1.T','Q1.5','T','Fase T a Q1.'],['Q1.2','KM1.1','R','De Q1 al contactor.'],['Q1.4','KM1.3','S','Fase S a KM1.'],['Q1.6','KM1.5','T','Fase T a KM1.'],['KM1.2','M.U','R','Del contactor al motor.'],['KM1.4','M.V','S','Fase S a V.'],['KM1.6','M.W','T','Fase T a W.'],
 ['Q1.2','S0.1','C','Mando: fase R al pulsador de parada S0.'],['S0.2','S1.3','C','De S0 a la marcha S1 (3).'],['S0.2','KM1.13','C','Y al contacto auxiliar 13 de KM1 (camino de retención).'],['KM1.14','S3.13','C','El 14 pasa por la selectora S3: si está abierta no hay retención.'],['S3.14','S1.4','C','De la selectora al punto común con la salida de S1.'],['S1.4','KM1.A1','C','De ese punto a la bobina.'],['KM1.A2','X1.N','N','Retorno de la bobina al neutro.']];
window.TABLEROS.impulsos={id:'impulsos',dibujo:'impulsos',titulo:'Tablero: marcha por impulsos y permanente',esquema:'mando.html?c=tri-impulsos&anidado=1',
 intro:'Marcha-parada con una selectora S3 que habilita o anula la retención: en OFF el motor gira sólo mientras se aprieta S1 (impulsos).',
 T,W,COLORS,NAMES,PARTES:P0,partsList:['X1','Q1','KM1','M','S0','S1','S3'],In:3.6,prot:{q:true},consejos:CONS,
 sim:{links:[['Q1.1','Q1.2','q'],['Q1.3','Q1.4','q'],['Q1.5','Q1.6','q'],['KM1.1','KM1.2','arm:KM1'],['KM1.3','KM1.4','arm:KM1'],['KM1.5','KM1.6','arm:KM1'],['KM1.13','KM1.14','arm:KM1'],['S3.13','S3.14','sel:S3'],['S0.1','S0.2','nc:S0'],['S1.3','S1.4','no:S1']],coils:[{id:'KM1',a:'KM1.A1',b:'KM1.A2'}],motor:{t:'m3',n:['M.U','M.V','M.W']}},
 diag(S,m){if(S.sel.S3&&S.coils.KM1&&!S.btn.S1&&(S.arms.KM1||0)>.9)m.push(['ok','Modo permanente: la retención mantiene el motor al soltar S1.']);if(!S.sel.S3&&S.btn.S1&&S.coils.KM1)m.push(['ok','Modo impulsos: el motor gira sólo mientras apretás S1.'])},
 ejercicios:[{q:'¿Qué hace S3 abierta?',o:['Anula la retención','Corta la potencia','Nada'],ok:0,why:'Abre el camino del contacto 13-14.'},{q:'La marcha por impulsos sirve para…',o:['Posicionar con giros cortos','Ahorrar energía','Invertir el giro'],ok:0,why:'Ajustes finos de posición.'},{q:'¿Con qué contacto se retiene KM1?',o:['13-14','21-22','95-96'],ok:0,why:'El auxiliar NA en paralelo con S1.'}]};})();

/* ===== 4. Arranque temporizado ===== */
(function(){const {T,add}=mk();
['R','S','T'].forEach((n,i)=>add('X1.'+n,[70,122,174][i],85,n,'X1','u'));add('X1.N',300,85,'N','X1','u');
[[70,1,2],[122,3,4],[174,5,6]].forEach(([x,a,b])=>{add('Q1.'+a,x,140,String(a),'Q1','u');add('Q1.'+b,x,215,String(b),'Q1','d');add('KM1.'+a,x,258,a+'/L'+((a+1)/2),'KM1','u');add('KM1.'+b,x,372,b+'/T'+(b/2),'KM1','d')});
add('KM1.A1',232,262,'A1','KM1','u');add('KM1.A2',232,368,'A2','KM1','d');
add('KA1.A1',370,262,'A1','KA1','u');add('KA1.13',430,262,'13','KA1','u');add('KA1.A2',370,368,'A2','KA1','d');add('KA1.14',430,368,'14','KA1','d');
add('KT1.A1',530,262,'A1','KT1','u');add('KT1.15',590,262,'15','KT1','u');add('KT1.A2',530,368,'A2','KT1','d');add('KT1.18',590,368,'18','KT1','d');
[['U',440],['V',500],['W',560]].forEach(([n,x])=>add('M.'+n,x,430,n,'M','u'));
add('S0.1',790,330,'1','S0','u');add('S0.2',790,400,'2','S0','d');add('S1.3',900,330,'3','S1','u');add('S1.4',900,400,'4','S1','d');
const W=[['X1.R','Q1.1','R','Entran las fases al guardamotor.'],['X1.S','Q1.3','S','Fase S a Q1.'],['X1.T','Q1.5','T','Fase T a Q1.'],['Q1.2','KM1.1','R','De Q1 al contactor.'],['Q1.4','KM1.3','S','Fase S a KM1.'],['Q1.6','KM1.5','T','Fase T a KM1.'],['KM1.2','M.U','R','Del contactor al motor.'],['KM1.4','M.V','S','Fase S a V.'],['KM1.6','M.W','T','Fase T a W.'],
 ['Q1.2','S0.1','C','Mando: fase R a S0.'],['S0.2','S1.3','C','De S0 a la marcha S1.'],['S0.2','KA1.13','C','Retención: el 13 del relé auxiliar KA1 junto a la entrada de S1.'],['S1.4','KA1.14','C','Salida 14 del auxiliar a la salida de S1.'],['S1.4','KA1.A1','C','La bobina de KA1 se alimenta de ese punto.'],['S1.4','KT1.A1','C','El temporizador KT1 también.'],['S1.4','KT1.15','C','El común 15 del temporizador.'],['KT1.18','KM1.A1','C','El contacto retardado 18 alimenta la bobina del contactor.'],['KA1.A2','X1.N','N','Retorno de KA1 al neutro.'],['KT1.A2','X1.N','N','Retorno de KT1 al neutro.'],['KM1.A2','X1.N','N','Retorno de KM1 al neutro.']];
window.TABLEROS.temporizado={id:'temporizado',dibujo:'temporizado',titulo:'Tablero: arranque temporizado',esquema:'mando.html?c=tri-temporizado&anidado=1',
 intro:'S1 energiza el relé auxiliar KA1 (que se retiene) y el temporizador KT1; cuando KT1 cumple su tiempo, energiza el contactor KM1 y el motor arranca.',
 T,W,COLORS,NAMES,PARTES:P0,partsList:['X1','Q1','KM1','KA1','KT1','M','S0','S1'],In:3.6,prot:{q:true},consejos:CONS,
 sim:{links:[['Q1.1','Q1.2','q'],['Q1.3','Q1.4','q'],['Q1.5','Q1.6','q'],['KM1.1','KM1.2','arm:KM1'],['KM1.3','KM1.4','arm:KM1'],['KM1.5','KM1.6','arm:KM1'],['KA1.13','KA1.14','arm:KA1'],['KT1.15','KT1.18','kt'],['S0.1','S0.2','nc:S0'],['S1.3','S1.4','no:S1']],coils:[{id:'KM1',a:'KM1.A1',b:'KM1.A2'},{id:'KA1',a:'KA1.A1',b:'KA1.A2'},{id:'KT1',a:'KT1.A1',b:'KT1.A2'}],motor:{t:'m3',n:['M.U','M.V','M.W']},timer:{coil:'KT1',T:5}},
 diag(S,m){if(S.coils.KT1&&!S.kt.out)m.push(['ok','KT1 temporizando: '+S.kt.tm.toFixed(1).replace('.',',')+' de 5 s. El motor todavía no arranca.']);if(S.kt.out&&S.coils.KM1)m.push(['ok','Se cumplió el tiempo: KM1 se energizó y el motor arranca.'])},
 ejercicios:[{q:'¿Cuándo se energiza KM1?',o:['Al cumplirse el tiempo de KT1','Al presionar S1','Al soltar S1'],ok:0,why:'Lo energiza el contacto retardado 15-18.'},{q:'¿Qué hace KA1?',o:['Memoriza la orden de marcha','Mide el tiempo','Protege del cortocircuito'],ok:0,why:'Se retiene y mantiene alimentado a KT1.'},{q:'Una aplicación típica:',o:['Prelubricación antes de arrancar','Invertir el giro','Medir tensión'],ok:0,why:'Primero arranca la bomba de aceite.'}]};})();
})();
