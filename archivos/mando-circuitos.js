/* Circuitos de mando para mando.html. Cada circuito define el esquema (items), su guía paso a paso,
   las piezas y los ejercicios. El motor (mando.html) calcula el circuito con un solucionador de redes. */
(function(){
const R=(n,x,y)=>({t:'src',id:'src'+n,n,x,y,lab:n==='R'?'R · L1':n==='S'?'S · L2':'T · L3'});
const pol=(id,x,y,n1,n2,ctl,o)=>Object.assign({t:'cont',id,x,y,h:64,n1,n2,ctl,form:'NO'},o||{});
const FASES=[100,190,280];
const GRN='#5ce0a0',RED='#ff6b6b';

/* ============================================================ 1. ARRANQUE DIRECTO */
const directo={
 titulo:'Arranque directo trifásico',
 intro:'El motor trifásico recibe de golpe los 380 V de la red. Un guardamotor (Q1) lo protege y un contactor (KM1) lo conecta y desconecta con un comando de 220 V. Es el circuito más simple y la base de todos los demás.',
 queEs:'Se usa en motores chicos y medianos (hasta unos 5,5 kW) cuando la red soporta la corriente de arranque: bombas, ventiladores, cintas transportadoras, tornos.',
 coils:['KM1'],prot:{q:true},In:3.6,Ir:3.6,
 items:[
  {t:'bus',id:'busF',n:'F',y:70,x1:600,x2:960,lab:'F (fase R)'},{t:'bus',id:'busN',n:'N',y:525,x1:600,x2:960,lab:'N'},
  R('R',100,70),R('S',190,70),R('T',280,70),
  pol('Q1a',100,95,'R','r1','q:Q1',{deco:'q',term:['1','2']}),pol('Q1b',190,95,'S','s1','q:Q1',{deco:'q',fase:true,term:['3','4']}),pol('Q1c',280,95,'T','t1','q:Q1',{deco:'q',term:['5','6']}),
  {t:'qh',id:'Q1',x:40,y:95,h:64},
  pol('KM1a',100,185,'r1','m1','coil:KM1',{peg:true,term:['1','2'],lab:'KM1'}),pol('KM1b',190,185,'s1','m2','coil:KM1',{peg:true,term:['3','4']}),pol('KM1c',280,185,'t1','m3','coil:KM1',{peg:true,term:['5','6']}),
  {t:'m3',id:'M',x:190,y:320,n:['m1','m2','m3']},
  {t:'cont',id:'S1',op:'sel',x:640,y:110,h:60,n1:'F',n2:'c1',ctl:'sel:S1',form:'NO',lab:'S1',term:['13','14']},
  {t:'coil',id:'KM1',x:640,y:200,n1:'c1',n2:'N',lab:'KM1'},
  {t:'cont',id:'KM1x',x:740,y:110,h:60,n1:'F',n2:'c2',ctl:'coil:KM1',form:'NO',lab:'KM1',term:['13','14']},
  {t:'lamp',id:'H1',x:740,y:200,n1:'c2',n2:'N',lab:'H1 marcha',col:GRN},
  {t:'cont',id:'Q1x',x:860,y:110,h:60,n1:'F',n2:'c3',ctl:'qt:Q1',form:'NO',lab:'Q1',term:['97','98']},
  {t:'lamp',id:'H2',x:860,y:200,n1:'c3',n2:'N',lab:'H2 falla',col:RED}],
 links:[{pts:[[100,127],[280,127]],ctl:'q:Q1'},{pts:[[100,217],[280,217]],ctl:'coil:KM1'},{pts:[[610,225],[560,225],[560,217],[280,217]],ctl:'coil:KM1'},{pts:[[670,225],[705,225],[705,140],[740,140]],ctl:'coil:KM1'}],
 labels:[{x:190,y:30,t:'POTENCIA · 380 V',c:'c t'},{x:790,y:30,t:'MANDO · 220 V',c:'c t'},{x:190,y:468,t:'Motor trifásico',c:'c s'}],
 parts:{
  Q1:{n:'Q1',t:'Q1 · Guardamotor',d:'Interruptor automático para motores: protege contra sobrecarga (térmico regulable) y cortocircuito (magnético). La perilla se puede accionar a mano: tocala. Cuando dispara queda en TRIP.'},
  Q1a:{n:'Q1 (1-2)',t:'Contactos de Q1',d:'Los tres contactos del guardamotor, unidos mecánicamente: se abren y cierran juntos.'},
  KM1a:{n:'KM1 (1-2)',t:'KM1 · Contactos principales',d:'Tres contactos de potencia que se cierran cuando la bobina KM1 recibe tensión. Son los que dejan pasar los 380 V al motor.'},
  KM1:{n:'KM1',t:'KM1 · Bobina del contactor',d:'Electroimán de 220 V. Al energizarse atrae la armadura y cierra los contactos principales y auxiliares. Una corriente chica comanda una corriente grande.'},
  M:{n:'M',t:'M · Motor trifásico de inducción',d:'1,5 kW, 380 V, 3,6 A nominales, 1450 rpm. Tres bobinados que, alimentados por tres fases desfasadas, crean un campo giratorio que arrastra al rotor.'},
  S1:{n:'S1',t:'S1 · Selectora ON/OFF',d:'Comando manual que mantiene su posición. En ON cierra el circuito de mando y energiza KM1.'},
  KM1x:{n:'KM1 (13-14)',t:'KM1 · Contacto auxiliar NA',d:'Se cierra junto con los contactos principales. Aquí enciende la lámpara de marcha.'},
  H1:{n:'H1',t:'H1 · Lámpara verde de marcha',d:'Indica que el contactor KM1 está cerrado.'},
  Q1x:{n:'Q1 (97-98)',t:'Q1 · Contacto de señalización',d:'Se cierra cuando el guardamotor dispara.'},
  H2:{n:'H2',t:'H2 · Lámpara roja de falla',d:'Se enciende si Q1 disparó por sobrecarga o cortocircuito.'}},
 partsList:['Q1','KM1a','KM1','M','S1','KM1x','H1','Q1x','H2'],
 fallas:[{id:'fase',t:'Falta la fase S de la red',d:'El motor queda alimentado por sólo 2 fases.'}],
 pasos:[
  {t:'Reconocé el circuito',hl:['Q1','KM1a','M','S1','KM1'],x:'A la izquierda está el <b>circuito de potencia</b> (380 V, mucha corriente): red → guardamotor Q1 → contactor KM1 → motor. A la derecha el <b>circuito de mando</b> (220 V, poca corriente): la selectora S1 energiza la bobina KM1. Fijate que ambos circuitos sólo se tocan <b>mecánicamente</b>: la bobina mueve los contactos (línea punteada).',hint:'Tocá las piezas del esquema para ver qué es cada una. Cuando quieras, pasá al siguiente paso.'},
  {t:'Sin comando no hay tensión',hl:['KM1a','M'],pred:{q:'Q1 está en ON y S1 en OFF. ¿Llegan los 380 V al motor?',o:['Sí, llegan hasta el motor','No: los contactos de KM1 están abiertos y cortan las tres fases','Llega sólo una fase'],ok:1,why:'Los contactos principales de KM1 están abiertos porque su bobina no tiene tensión. La tensión llega hasta KM1, pero no pasa de ahí.'},x:'Observá los colores: las líneas de colores tienen tensión; las grises no. La tensión de la red llega hasta los contactos de KM1 y se queda ahí.'},
  {t:'Energizá la bobina',hl:['S1','KM1','KM1a'],pred:{q:'Si llevás S1 a ON, ¿qué ocurre?',o:['Se enciende sólo la lámpara','La bobina KM1 se energiza, cierra sus contactos y el motor arranca','Q1 dispara'],ok:1,why:'La corriente del mando recorre F → S1 → KM1 → N. La bobina atrae su armadura y cierra los tres contactos de potencia.'},hint:'Tocá la selectora S1 (el interruptor a la izquierda de la bobina KM1).',wait:S=>S.sel.S1&&S.arm.KM1>.9,expl:'Se cumplió la secuencia: <b>S1 cierra → pasa corriente por la bobina → KM1 cierra → el motor recibe las 3 fases</b>. Con unos 0,05 A comandaste 3,6 A a 380 V.'},
  {t:'La corriente de arranque',hl:['M'],pred:{q:'Mientras el motor acelera, ¿cuánta corriente toma?',o:['Menos que la nominal','Unas 6 veces la nominal','Exactamente la nominal'],ok:1,why:'Con el rotor detenido el motor se comporta casi como un cortocircuito: toma 5 a 7 veces la corriente nominal hasta tomar velocidad.'},hint:'Esperá a que el motor alcance su velocidad y mirá la corriente en la pestaña “En vivo”.',wait:S=>S.w>.95,expl:'La corriente de línea pasó de unos <b>21 A</b> a los <b>3,6 A</b> nominales. Ese pico del arranque directo es el que se reduce con otros métodos (estrella-triángulo).'},
  {t:'Detené el motor',hl:['S1','KM1','KM1a'],hint:'Llevá S1 a OFF y mirá cómo se abren los contactos.',wait:S=>!S.sel.S1&&S.mode==='parado',expl:'Al abrir S1 la bobina pierde tensión, el resorte de retorno abre los contactos y el motor se detiene (gira un rato por inercia).'},
  {t:'Sobrecarga: protección térmica',hl:['Q1','H2'],prep:S=>{S.carga='s'},pred:{q:'El motor trabaja con 1,5 veces su corriente. ¿Qué hace Q1?',o:['Dispara al instante','Dispara después de un tiempo, por calentamiento','No dispara nunca'],ok:1,why:'La protección térmica es de tiempo inverso: a mayor sobrecarga, menos tiempo. Con 1,5× tarda un rato.'},hint:'Llevá S1 a ON y esperá unos segundos: el calentamiento de Q1 sube.',wait:S=>S.q.trip==='term',expl:'Q1 disparó por <b>temperatura</b>: las láminas bimetálicas se curvaron. Se encendió H2. Para volver a trabajar hay que eliminar la causa y rearmar.'},
  {t:'Cortocircuito: protección magnética',hl:['Q1'],prep:S=>{S.carga='cc'},pred:{q:'Hay un cortocircuito en el motor. ¿Cuánto tarda en actuar Q1?',o:['Minutos','Milisegundos: disparo magnético','Depende de la temperatura'],ok:1,why:'Una corriente de más de 13 veces la regulada activa el solenoide, que abre los contactos al instante.'},hint:'Llevá S1 a ON.',wait:S=>S.q.trip==='mag',expl:'Disparo <b>magnético</b>: instantáneo. Es la protección que salva al cable y al contactor de una falla grave.'}],
 comentario(S){const c=[];
  if(S.sel.S1&&S.arm.KM1>.9&&S.mode==='directo')c.push(['Un comando chico, una potencia grande','S1 sólo maneja la bobina (unos 50 mA a 220 V). Los contactos de KM1 llevan los '+(S.I>0?(S.I).toFixed(1).replace('.',','):'0')+' A del motor a 380 V.']);
  if(S.sel.S1&&S.q.trip)c.push(['Q1 disparó pero KM1 sigue energizado','El guardamotor abrió la potencia, pero el mando no depende de él: la bobina aún tiene tensión. H1 sigue encendida, H2 indica la falla.']);
  if(!S.sel.S1&&S.w>.1)c.push(['Inercia','Sin tensión el motor aún gira un rato: la energía almacenada en el rotor se disipa de a poco.']);
  if(S.mode==='mono')c.push(['Falta una fase','El motor queda en monofásico: toma más corriente, vibra y se calienta. El guardamotor lo detecta por la sobrecarga.']);
  return c},
 ejercicios:[
  {q:'¿Qué circuito maneja la corriente grande del motor?',o:['El de mando','El de potencia, a través de los contactos de KM1','La lámpara H1'],ok:1,why:'Potencia: red → Q1 → contactos de KM1 → motor. El mando sólo energiza la bobina.'},
  {q:'¿Qué hace la bobina KM1 cuando recibe tensión?',o:['Genera calor','Atrae una armadura y cierra los contactos','Mide la corriente del motor'],ok:1,why:'Es un electroimán: el campo magnético atrae la armadura y mueve todos los contactos.'},
  {q:'Con rotor detenido, ¿cuánta corriente toma el motor al arrancar en forma directa?',o:['Aproximadamente la nominal','Unas 6 veces la nominal','La mitad de la nominal'],ok:1,why:'Es el pico de arranque directo: 5 a 7 In.'},
  {q:'Q1 disparó por una sobrecarga. ¿Qué hay que hacer antes de rearmarlo?',o:['Nada, rearmar enseguida','Buscar y eliminar la causa y dejar que se enfríe','Cambiar la bobina KM1'],ok:1,why:'Rearmar sin corregir la causa sólo hace que vuelva a disparar y puede quemar el motor.'},
  {q:'Un cortocircuito en el motor: ¿qué protección actúa?',o:['La térmica, en minutos','La magnética, al instante','Ninguna'],ok:1,why:'Con más de 13 veces la corriente regulada, el solenoide dispara en milisegundos.'}]
};

/* ============================================================ 2. MARCHA-PARADA CON RETENCIÓN */
const enclav={
 titulo:'Marcha-parada con enclavamiento (retención)',
 intro:'El motor arranca con un pulsador de marcha (S1) y se detiene con uno de parada (S0). Para que siga funcionando al soltar S1, el contactor se “retiene” a sí mismo con su propio contacto auxiliar. Se protege con fusibles (cortocircuito) y relé térmico (sobrecarga).',
 queEs:'Es el circuito de mando más usado en la industria. Con pulsadores sin enclavamiento el motor sólo funcionaría mientras se mantiene apretado el botón.',
 coils:['KM1'],prot:{th:true,fus:true},In:3.6,Ir:3.6,
 items:[
  {t:'bus',id:'busF',n:'F',y:70,x1:560,x2:960,lab:'F (fase R)'},{t:'bus',id:'busN',n:'N',y:525,x1:560,x2:960,lab:'N'},
  R('R',100,70),R('S',190,70),R('T',280,70),
  {t:'fuse',id:'F1a',x:100,y:92,h:52,n1:'R',n2:'f1',lab:'F1'},{t:'fuse',id:'F1b',x:190,y:92,h:52,n1:'S',n2:'f2'},{t:'fuse',id:'F1c',x:280,y:92,h:52,n1:'T',n2:'f3'},
  pol('KM1a',100,165,'f1','k1','coil:KM1',{lab:'KM1',term:['1','2']}),pol('KM1b',190,165,'f2','k2','coil:KM1',{term:['3','4'],fase:true}),pol('KM1c',280,165,'f3','k3','coil:KM1',{term:['5','6']}),
  {t:'heater',id:'F2a',x:100,y:250,h:48,n1:'k1',n2:'h1',lab:'F2'},{t:'heater',id:'F2b',x:190,y:250,h:48,n1:'k2',n2:'h2'},{t:'heater',id:'F2c',x:280,y:250,h:48,n1:'k3',n2:'h3'},
  {t:'m3',id:'M',x:190,y:335,n:['h1','h2','h3']},
  {t:'cont',id:'F2n',x:620,y:90,h:52,n1:'F',n2:'d1',ctl:'th:F2',form:'NC',lab:'F2',term:['95','96']},
  {t:'cont',id:'S0',op:'btn',x:620,y:150,h:52,n1:'d1',n2:'d2',ctl:'btn:S0',form:'NC',lab:'S0',term:['1','2']},
  {t:'cont',id:'S1',op:'btn',x:585,y:215,h:52,n1:'d2',n2:'d3',ctl:'btn:S1',form:'NO',lab:'S1',term:['3','4']},
  {t:'cont',id:'KM1r',x:695,y:215,h:52,n1:'d2',n2:'d3',ctl:'coil:KM1',form:'NO',lab:'KM1',term:['13','14']},
  {t:'coil',id:'KM1',x:640,y:290,n1:'d3',n2:'N',lab:'KM1'},
  {t:'cont',id:'KM1y',x:790,y:90,h:52,n1:'F',n2:'e1',ctl:'coil:KM1',form:'NO',lab:'KM1',term:['23','24']},
  {t:'lamp',id:'H1',x:790,y:165,n1:'e1',n2:'N',lab:'H1 marcha',col:GRN},
  {t:'cont',id:'F2z',x:900,y:90,h:52,n1:'F',n2:'e2',ctl:'th:F2',form:'NO',lab:'F2',term:['97','98']},
  {t:'lamp',id:'H2',x:900,y:165,n1:'e2',n2:'N',lab:'H2 falla',col:RED}],
 links:[{pts:[[100,197],[280,197]],ctl:'coil:KM1'},{pts:[[610,315],[560,315],[560,197],[280,197]],ctl:'coil:KM1'},{pts:[[670,315],[740,315],[740,241],[695,241]],ctl:'coil:KM1'},{pts:[[670,320],[750,320],[750,116],[790,116]],ctl:'coil:KM1'}],
 labels:[{x:190,y:30,t:'POTENCIA · 380 V',c:'c t'},{x:790,y:30,t:'MANDO · 220 V',c:'c t'}],
 parts:{
  F1a:{n:'F1',t:'F1 · Fusibles de potencia',d:'Protegen contra cortocircuitos: el hilo se funde si la corriente supera varias veces la nominal. Se usan fusibles tipo aM (para motores), que toleran el pico de arranque.'},
  KM1a:{n:'KM1 (1-2)',t:'KM1 · Contactos principales',d:'Cierran y abren las tres fases hacia el motor.'},
  F2a:{n:'F2',t:'F2 · Relé térmico (calefactores)',d:'Una resistencia por fase calienta una lámina bimetálica. Si la corriente es excesiva durante mucho tiempo, la lámina se curva y dispara.'},
  M:{n:'M',t:'M · Motor trifásico',d:'1,5 kW, 380 V, 3,6 A, 1450 rpm.'},
  F2n:{n:'F2 (95-96)',t:'F2 · Contacto NC del térmico',d:'Está en serie con la bobina KM1. Si el térmico dispara, se abre y KM1 se desenergiza: el motor se detiene.'},
  S0:{n:'S0',t:'S0 · Pulsador de parada (NC)',d:'Es normalmente cerrado: en reposo deja pasar la corriente. Al presionarlo corta el mando y desenclava el circuito. Se usa NC por seguridad: si un cable se corta, el motor también se detiene.'},
  S1:{n:'S1',t:'S1 · Pulsador de marcha (NA)',d:'Normalmente abierto: al presionarlo cierra el circuito hacia la bobina.'},
  KM1r:{n:'KM1 (13-14)',t:'KM1 · Contacto de retención (enclavamiento)',d:'Contacto auxiliar NA en paralelo con S1. Cuando KM1 se cierra, este contacto también se cierra y mantiene la corriente hacia la bobina aunque se suelte S1: el contactor se “enclava” a sí mismo.'},
  KM1:{n:'KM1',t:'KM1 · Bobina del contactor',d:'Electroimán de 220 V.'},
  KM1y:{n:'KM1 (23-24)',t:'KM1 · Auxiliar de señalización',d:'Enciende la lámpara de marcha.'},
  H1:{n:'H1',t:'H1 · Lámpara de marcha',d:'Verde: el contactor está cerrado.'},
  F2z:{n:'F2 (97-98)',t:'F2 · Contacto NA de señalización',d:'Se cierra cuando el térmico dispara.'},
  H2:{n:'H2',t:'H2 · Lámpara de falla',d:'Roja: el térmico disparó.'}},
 partsList:['F1a','KM1a','F2a','M','F2n','S0','S1','KM1r','KM1','KM1y','H1','F2z','H2'],
 fallas:[{id:'fase',t:'Falta una fase',d:'Se corta un fusible o una fase de la red.'}],
 pasos:[
  {t:'Reconocé el circuito',hl:['S0','S1','KM1r','KM1','F2n'],x:'La corriente del mando sale de <b>F</b>, atraviesa el contacto del térmico <b>F2 (95-96)</b>, el pulsador de parada <b>S0 (NC)</b>, y llega a la bobina <b>KM1</b> por dos caminos en paralelo: el pulsador de marcha <b>S1</b> o el contacto de retención <b>KM1 (13-14)</b>.',hint:'Tocá S0, S1 y el contacto KM1 (13-14) para leer qué hace cada uno.'},
  {t:'¿S0 está abierto o cerrado?',hl:['S0'],pred:{q:'S0 es un pulsador NC. En reposo, ¿el contacto está abierto o cerrado?',o:['Abierto','Cerrado','Depende de KM1'],ok:1,why:'NC significa “normalmente cerrado”: en reposo deja pasar la corriente y al presionarlo la corta. Por eso sirve para parar.'},x:'Mirá el dibujo de S0: la cuchilla está vertical (cerrada).'},
  {t:'Marcha: presioná y soltá S1',hl:['S1','KM1r','KM1'],pred:{q:'Presionás S1 y lo soltás. ¿Qué pasa con el motor?',o:['Se detiene al soltarlo','Sigue funcionando gracias a la retención','Dispara el térmico'],ok:1,why:'Al cerrarse KM1 también se cierra su contacto 13-14, que está en paralelo con S1. Ahora la bobina se alimenta por ese contacto y S1 ya no hace falta.'},hint:'Mantené apretado S1 con el mouse (o el dedo) y después soltalo.',wait:S=>S.mode==='directo'&&!S.btn.S1&&S.arm.KM1>.9,expl:'¡Eso es la <b>retención</b>! La bobina sigue energizada por el camino F → F2 → S0 → <b>KM1 (13-14)</b> → KM1. Abrí la pestaña “En vivo” para ver el camino.'},
  {t:'Mirá el nuevo camino de la corriente',hl:['KM1r'],hint:'Abrí la pestaña “En vivo” y comprobá que la corriente ahora pasa por KM1 (13-14) y no por S1. Esperá a que el motor llegue a su velocidad.',wait:S=>S.w>.93&&!S.btn.S1,x:'Es el contacto auxiliar del propio contactor el que “se retiene”. Por eso a este circuito se lo llama de <b>autorretención</b> o enclavamiento.'},
  {t:'Parada: presioná S0',hl:['S0','KM1r'],prep:S=>{S.arm.KM1=1;S.w=1},pred:{q:'El motor está en marcha. Presionás S0 un instante y lo soltás. ¿Qué pasa?',o:['El motor se detiene y queda parado','El motor se detiene pero vuelve a arrancar solo','No pasa nada'],ok:0,why:'S0 corta la corriente a la bobina. Al caer KM1 se abre también su contacto de retención, así que al soltar S0 la bobina ya no tiene camino y el motor queda parado.'},hint:'Presioná S0 un instante.',wait:S=>S.mode==='parado'&&!S.btn.S0,expl:'La parada <b>desenclava</b> el circuito. Para volver a arrancar hay que apretar S1 de nuevo.'},
  {t:'Sobrecarga: actúa el relé térmico',hl:['F2a','F2n','H2'],prep:S=>{S.carga='s';S.arm.KM1=1;S.w=.97},pred:{q:'El motor trabaja sobrecargado. ¿Qué contacto corta la bobina cuando el térmico dispara?',o:['El 95-96 (NC)','El 97-98 (NA)','S1'],ok:0,why:'El 95-96 está en serie con la bobina y se abre. El 97-98 se cierra y enciende la lámpara de falla.'},hint:'Esperá unos segundos: F2 se va calentando hasta disparar.',wait:S=>S.th.trip,expl:'El térmico abrió <b>F2 (95-96)</b>: la bobina quedó sin tensión y el motor se detuvo. H2 indica la falla. Hay que corregir la causa y rearmar F2.'},
  {t:'Cortocircuito: se funden los fusibles',hl:['F1a'],prep:S=>{S.carga='cc'},pred:{q:'Si hay un cortocircuito, ¿quién protege?',o:['El relé térmico','Los fusibles F1','S0'],ok:1,why:'El térmico es lento: no alcanza a reaccionar ante un cortocircuito. Los fusibles se funden en milisegundos.'},hint:'Presioná S1 para arrancar con el cortocircuito.',wait:S=>S.fus.blown,expl:'Los <b>fusibles</b> cortaron la falla. Hay que cambiarlos (con la pestaña “Probar”) después de reparar.'}],
 comentario(S){const c=[];
  if(S.coil.KM1&&!S.btn.S1&&S.arm.KM1>.9)c.push(['Retención activa','S1 está suelto pero la bobina sigue energizada: el contacto <b>KM1 (13-14)</b>, en paralelo con S1, cierra el camino. Si presionás S0 se cortará la corriente.']);
  if(S.btn.S0&&S.coil.KM1===false&&S.arm.KM1>.2)c.push(['S0 cortó el mando','Con S0 apretado se abre su contacto NC: la bobina queda sin corriente y KM1 comienza a abrir.']);
  if(S.th.trip)c.push(['Disparó el térmico','El contacto 95-96 se abrió: aunque se presione S1, la bobina no puede energizarse hasta rearmar F2.']);
  if(S.fus.blown)c.push(['Fusibles fundidos','Se cortó la potencia pero el mando sigue funcionando. Hay que reponer los fusibles.']);
  return c},
 ejercicios:[
  {q:'¿Por qué el pulsador de parada S0 es normalmente cerrado?',o:['Porque es más barato','Para que un cable cortado también detenga el motor','Para que arranque más rápido'],ok:1,why:'Seguridad positiva: ante cualquier interrupción del circuito de mando, el motor se detiene.'},
  {q:'¿Qué hace el contacto KM1 (13-14) en paralelo con S1?',o:['Protege contra sobrecarga','Mantiene energizada la bobina al soltar S1 (retención)','Enciende la lámpara'],ok:1,why:'Es el contacto de autorretención: cierra un camino alternativo a S1.'},
  {q:'Si se acciona S1 y se lo suelta, pero el contacto 13-14 está sucio y no cierra, ¿qué ocurre?',o:['El motor sigue en marcha','El motor se detiene al soltar S1','El térmico dispara'],ok:1,why:'Sin el camino de retención, la bobina sólo se mantiene mientras S1 esté presionado.'},
  {q:'¿Qué protege a este circuito de un cortocircuito?',o:['El relé térmico','Los fusibles F1','La lámpara H2'],ok:1,why:'Los fusibles se funden al instante; el térmico es lento y sólo protege de sobrecargas.'},
  {q:'El térmico disparó y el motor se detuvo. ¿Qué contacto del térmico enciende la lámpara de falla?',o:['95-96','97-98','13-14'],ok:1,why:'El 97-98 es normalmente abierto y se cierra al disparar; el 95-96 se abre y corta la bobina.'}]
};

/* ============================================================ 3. INVERSIÓN DE GIRO */
const KM2P=[400,490,580];
const inversion={
 titulo:'Inversión de giro con enclavamiento',
 intro:'Para invertir el sentido de giro de un motor trifásico alcanza con intercambiar dos de las tres fases. Dos contactores hacen el trabajo: KM1 (adelante) y KM2 (atrás, con S y T cruzadas). Un enclavamiento eléctrico impide que los dos cierren a la vez, lo que provocaría un cortocircuito.',
 queEs:'Portones, puentes grúa, cintas reversibles, ascensores de obra, tornos y fresadoras. En todos hay que cambiar el sentido de giro del motor.',
 coils:['KM1','KM2'],prot:{q:true},In:3.6,Ir:3.6,
 items:[
  {t:'bus',id:'busF',n:'F',y:70,x1:660,x2:970,lab:'F (fase R)'},{t:'bus',id:'busN',n:'N',y:525,x1:660,x2:970,lab:'N'},
  R('R',100,60),R('S',190,60),R('T',280,60),
  pol('Q1a',100,90,'R','r1','q:Q1',{deco:'q',h:60}),pol('Q1b',190,90,'S','s1','q:Q1',{deco:'q',h:60,fase:true}),pol('Q1c',280,90,'T','t1','q:Q1',{deco:'q',h:60}),
  {t:'qh',id:'Q1',x:40,y:90,h:60},
  pol('KM1a',100,195,'r1','m1','coil:KM1',{lab:'KM1'}),pol('KM1b',190,195,'s1','m2','coil:KM1'),pol('KM1c',280,195,'t1','m3','coil:KM1'),
  pol('KM2a',KM2P[0],195,'r1','m1','coil:KM2',{lab:'KM2'}),pol('KM2b',KM2P[1],195,'s1','m3','coil:KM2'),pol('KM2c',KM2P[2],195,'t1','m2','coil:KM2'),
  {t:'m3',id:'M',x:250,y:330,n:['m1','m2','m3']},
  {t:'cont',id:'S0',op:'btn',x:815,y:90,h:52,n1:'F',n2:'n0',ctl:'btn:S0',form:'NC',lab:'S0',term:['1','2']},
  {t:'cont',id:'S1',op:'btn',x:690,y:158,h:52,n1:'n0',n2:'p1',ctl:'btn:S1',form:'NO',lab:'S1',term:['3','4']},
  {t:'cont',id:'KM1r',x:760,y:158,h:52,n1:'n0',n2:'p1',ctl:'coil:KM1',form:'NO',lab:'KM1',term:['13','14']},
  {t:'cont',id:'S2',op:'btn',x:855,y:158,h:52,n1:'n0',n2:'p2',ctl:'btn:S2',form:'NO',lab:'S2',term:['3','4']},
  {t:'cont',id:'KM2r',x:925,y:158,h:52,n1:'n0',n2:'p2',ctl:'coil:KM2',form:'NO',lab:'KM2',term:['13','14']},
  {t:'cont',id:'KM2i',inter:true,x:725,y:240,h:52,n1:'p1',n2:'q1',ctl:'coil:KM2',form:'NC',lab:'KM2',term:['21','22']},
  {t:'cont',id:'KM1i',inter:true,x:890,y:240,h:52,n1:'p2',n2:'q2',ctl:'coil:KM1',form:'NC',lab:'KM1',term:['21','22']},
  {t:'coil',id:'KM1',x:725,y:320,n1:'q1',n2:'N',lab:'KM1'},{t:'coil',id:'KM2',x:890,y:320,n1:'q2',n2:'N',lab:'KM2'}],
 nodes:{r1:{jy:162},s1:{jy:170},t1:{jy:178},m1:{jy:285},m2:{jy:293},m3:{jy:301},p1:{jy:222},p2:{jy:222}},
 links:[{pts:[[100,227],[280,227]],ctl:'coil:KM1'},{pts:[[400,227],[580,227]],ctl:'coil:KM2'},{pts:[[100,120],[280,120]],ctl:'q:Q1'}],
 labels:[{x:250,y:28,t:'POTENCIA · 380 V',c:'c t'},{x:815,y:28,t:'MANDO · 220 V',c:'c t'},{x:190,y:182,t:'adelante',c:'c s'},{x:490,y:182,t:'atrás (S y T cruzadas)',c:'c s'},{x:725,y:140,t:'⟳ adelante',c:'c s'},{x:890,y:140,t:'⟲ atrás',c:'c s'}],
 parts:{
  Q1:{n:'Q1',t:'Q1 · Guardamotor',d:'Protege al motor y a los cables contra sobrecarga y cortocircuito. Si los dos contactores se cierran juntos, el disparo magnético de Q1 es lo que corta el cortocircuito.'},
  KM1a:{n:'KM1',t:'KM1 · Contactor “adelante”',d:'Conecta R-S-T a los bornes U-V-W del motor en el orden normal: el motor gira en sentido horario.'},
  KM2a:{n:'KM2',t:'KM2 · Contactor “atrás”',d:'Conecta R-S-T al motor pero con las fases S y T cruzadas: el campo magnético gira al revés y el motor invierte el sentido de giro.'},
  M:{n:'M',t:'M · Motor trifásico',d:'El sentido de giro depende del orden de las fases. Intercambiando dos cualquiera se invierte.'},
  S0:{n:'S0',t:'S0 · Parada (NC)',d:'Corta todo el mando y detiene el motor, sea cual sea el sentido de giro.'},
  S1:{n:'S1',t:'S1 · Marcha adelante (NA)',d:'Energiza KM1.'},
  S2:{n:'S2',t:'S2 · Marcha atrás (NA)',d:'Energiza KM2.'},
  KM1r:{n:'KM1 (13-14)',t:'KM1 · Retención',d:'Mantiene KM1 energizado al soltar S1.'},
  KM2r:{n:'KM2 (13-14)',t:'KM2 · Retención',d:'Mantiene KM2 energizado al soltar S2.'},
  KM2i:{n:'KM2 (21-22)',t:'KM2 · NC de enclavamiento',d:'Está en serie con la bobina KM1: si KM2 está cerrado, este contacto está abierto y KM1 no puede energizarse.'},
  KM1i:{n:'KM1 (21-22)',t:'KM1 · NC de enclavamiento',d:'Está en serie con la bobina KM2: si KM1 está cerrado, KM2 no puede energizarse. Es el enclavamiento cruzado.'},
  KM1:{n:'KM1',t:'KM1 · Bobina',d:'Cierra los contactos “adelante”.'},KM2:{n:'KM2',t:'KM2 · Bobina',d:'Cierra los contactos “atrás”.'}},
 partsList:['Q1','KM1a','KM2a','M','S0','S1','S2','KM1r','KM2r','KM2i','KM1i','KM1','KM2'],
 fallas:[{id:'sinEnclav',t:'Enclavamiento eléctrico anulado',d:'Se puentean los contactos NC KM1 (21-22) y KM2 (21-22): ¡se pueden cerrar los dos contactores!'},{id:'fase',t:'Falta la fase S de la red',d:'El motor queda con 2 fases.'}],
 pasos:[
  {t:'Reconocé el circuito',hl:['KM1a','KM2a','M'],x:'KM1 y KM2 conectan el motor a la misma red, pero KM2 <b>cruza dos fases</b> (S con T). Dos contactores, un solo motor. Los contactos NC <b>KM2 (21-22)</b> y <b>KM1 (21-22)</b> están cruzados en los circuitos de las bobinas: son el <b>enclavamiento</b>.',hint:'Compará los contactos de KM1 y KM2 en la potencia: ¿en qué se diferencian?'},
  {t:'¿Cómo se invierte el giro?',hl:['KM2a'],pred:{q:'¿Cómo se invierte el sentido de giro de un motor trifásico?',o:['Intercambiando dos fases','Intercambiando las tres fases','Bajando la tensión'],ok:0,why:'Intercambiar dos fases invierte el sentido del campo giratorio. Si se intercambian las tres, el orden relativo queda igual (sólo cambia el nombre de las fases).'},x:'KM2 lleva S al borne W y T al borne V del motor: el orden queda R-T-S y el campo gira al revés.'},
  {t:'Marcha adelante',hl:['S1','KM1','KM1a'],hint:'Presioná S1 y soltalo.',wait:S=>S.mode==='directo'&&S.dir===1&&S.arm.KM1>.9&&!S.btn.S1,expl:'KM1 se energizó y se retuvo con 13-14. Mirá en “En vivo” el sentido de giro: <b>horario ⟳</b>. Además, su NC (21-22) se abrió y <b>bloquea a KM2</b>.'},
  {t:'El enclavamiento en acción',hl:['KM1i','S2','KM2'],prep:S=>{S.arm.KM1=1;S.w=1},pred:{q:'El motor gira adelante. Presionás S2 (atrás). ¿Qué pasa?',o:['El motor invierte el giro inmediatamente','No pasa nada: KM1 (21-22) está abierto y bloquea la bobina de KM2','Se produce un cortocircuito'],ok:1,why:'El contacto NC de KM1 en serie con la bobina KM2 está abierto mientras KM1 está cerrado. Así es imposible cerrar ambos a la vez.'},hint:'Presioná S2 con el motor girando adelante y observá la bobina KM2.',wait:S=>S.btn.S2&&S.arm.KM1>.9&&!S.coil.KM2,expl:'La bobina KM2 <b>no se energizó</b>: el enclavamiento funcionó. Para invertir hay que parar primero con S0.'},
  {t:'Invertí el giro',hl:['S0','S2','KM2a'],prep:S=>{S.arm.KM1=1;S.w=1},hint:'Presioná S0 para parar, esperá que se abra KM1 y presioná S2.',wait:S=>S.mode==='directo'&&S.dir===-1&&S.arm.KM2>.9,expl:'El motor ahora gira <b>antihorario ⟲</b>: KM2 intercambió las fases S y T. Fijate en “En vivo” que el sentido de giro cambió.'},
  {t:'¿Y si falla el enclavamiento?',hl:['KM1i','KM2i','Q1'],prep:S=>{S.fault.sinEnclav=true},pred:{q:'Se anuló el enclavamiento. Con KM1 cerrado, presionás S2. ¿Qué pasa?',o:['Nada','Se cierran KM1 y KM2 a la vez: cortocircuito entre fases','El motor gira más rápido'],ok:1,why:'KM1 y KM2 cerrados unen R, S y T entre sí a través de sus contactos: un cortocircuito franco. Q1 debe dispararse por el magnético.'},hint:'Presioná S1, esperá a que arranque y después presioná S2.',wait:S=>S.q.trip==='mag',expl:'¡Cortocircuito! Q1 disparó al instante. Por eso se hace el enclavamiento eléctrico y, en potencia alta, <b>además mecánico</b> (una palanca que impide cerrar los dos contactores).'}],
 comentario(S){const c=[];
  if(S.coil.KM1&&S.btn.S2&&!S.coil.KM2&&!S.fault.sinEnclav)c.push(['Enclavamiento','S2 está presionado pero la bobina KM2 no se energiza: el contacto NC KM1 (21-22) está abierto y bloquea el camino.']);
  if(S.coil.KM2&&S.btn.S1&&!S.coil.KM1&&!S.fault.sinEnclav)c.push(['Enclavamiento','S1 está presionado pero KM1 no se energiza: KM2 (21-22) está abierto.']);
  if(S.mode==='directo')c.push(['Sentido de giro',S.dir>0?'Orden de fases R-S-T en U-V-W: el campo gira en sentido horario.':'Fases S y T cruzadas (R-T-S): el campo gira en sentido antihorario.']);
  if(S.short)c.push(['⚠ Cortocircuito','KM1 y KM2 cerrados a la vez unen entre sí las fases. Sólo el disparo magnético de Q1 evita un desastre.']);
  return c},
 ejercicios:[
  {q:'¿Qué hace el contacto NC KM1 (21-22) en serie con la bobina KM2?',o:['Enciende una lámpara','Impide energizar KM2 mientras KM1 esté cerrado','Retiene a KM1'],ok:1,why:'Es el enclavamiento cruzado: cada contactor bloquea la bobina del otro.'},
  {q:'Para invertir el giro de un motor trifásico se…',o:['Intercambian dos fases','Cambia la tensión de 380 a 220 V','Invierte el neutro'],ok:0,why:'Basta con intercambiar dos fases cualesquiera.'},
  {q:'Si KM1 y KM2 cerraran a la vez, ¿qué pasaría?',o:['El motor se frena','Cortocircuito entre fases','Nada'],ok:1,why:'Se unirían R, S y T entre sí a través de los contactos de ambos.'},
  {q:'El motor gira adelante y querés invertirlo. ¿Qué hacés?',o:['Presionás S2 directamente','Parás con S0 y después presionás S2','Soltás S1'],ok:1,why:'Con el enclavamiento, S2 no funciona hasta que KM1 haya caído. Además conviene esperar a que el motor se detenga.'},
  {q:'En potencias altas, además del enclavamiento eléctrico se agrega…',o:['Un enclavamiento mecánico entre contactores','Otro motor','Un fusible más'],ok:0,why:'Un balancín mecánico impide cerrar físicamente los dos contactores a la vez.'}]
};

/* ============================================================ 4. ESTRELLA-TRIÁNGULO */
const sd={
 titulo:'Arranque estrella-triángulo',
 intro:'Para reducir la corriente de arranque, el motor arranca con sus bobinados conectados en estrella (cada uno recibe 220 V) y, pasados unos segundos, un temporizador los pasa a triángulo (380 V). Se necesitan tres contactores: KM1 (línea), KM2 (estrella) y KM3 (triángulo).',
 queEs:'Se usa en motores de más de 5,5 kW que arrancan casi en vacío (bombas, ventiladores, compresores) para no “tumbar” la red. El motor debe tener sus 6 bornes accesibles y estar preparado para 380 V en triángulo.',
 coils:['KM1','KM2','KM3'],prot:{q:true},In:3.6,Ir:3.6,T:6,
 items:[
  {t:'bus',id:'busF',n:'F',y:60,x1:720,x2:990,lab:'F'},{t:'bus',id:'busN',n:'N',y:535,x1:720,x2:990,lab:'N'},
  R('R',100,55),R('S',190,55),R('T',280,55),
  pol('Q1a',100,80,'R','r1','q:Q1',{deco:'q',h:60}),pol('Q1b',190,80,'S','s1','q:Q1',{deco:'q',h:60,fase:true}),pol('Q1c',280,80,'T','t1','q:Q1',{deco:'q',h:60}),
  {t:'qh',id:'Q1',x:40,y:80,h:60},
  pol('KM1a',100,165,'r1','a1','coil:KM1',{lab:'KM1'}),pol('KM1b',190,165,'s1','a2','coil:KM1'),pol('KM1c',280,165,'t1','a3','coil:KM1'),
  {t:'m6',id:'M',x:190,y:330,n:['a1','a2','a3','w2','u2','v2']},
  pol('KM3a',380,330,'a1','w2','coil:KM3',{lab:'KM3'}),pol('KM3b',440,330,'a2','u2','coil:KM3'),pol('KM3c',500,330,'a3','v2','coil:KM3'),
  pol('KM2a',560,330,'st','w2','coil:KM2',{lab:'KM2'}),pol('KM2b',620,330,'st','u2','coil:KM2'),pol('KM2c',680,330,'st','v2','coil:KM2'),
  {t:'cont',id:'S0',op:'btn',x:850,y:78,h:52,n1:'F',n2:'n0',ctl:'btn:S0',form:'NC',lab:'S0',term:['1','2']},
  {t:'cont',id:'S1',op:'btn',x:790,y:142,h:52,n1:'n0',n2:'n1',ctl:'btn:S1',form:'NO',lab:'S1',term:['3','4']},
  {t:'cont',id:'KM1r',x:915,y:142,h:52,n1:'n0',n2:'n1',ctl:'coil:KM1',form:'NO',lab:'KM1',term:['13','14']},
  {t:'coil',id:'KM1',x:750,y:250,n1:'n1',n2:'N',lab:'KM1'},
  {t:'coil',id:'KT1',x:810,y:250,n1:'n1',n2:'N',lab:'KT1'},
  {t:'cont',id:'KM3i',inter:true,x:880,y:225,h:50,n1:'n1',n2:'g1',ctl:'coil:KM3',form:'NC',lab:'KM3',term:['21','22']},
  {t:'cont',id:'KTn',x:880,y:285,h:50,n1:'g1',n2:'g2',ctl:'kt:KT1',form:'NC',lab:'KT1',term:['15','16']},
  {t:'coil',id:'KM2',x:880,y:350,n1:'g2',n2:'N',lab:'KM2'},
  {t:'cont',id:'KM2i',inter:true,x:960,y:225,h:50,n1:'n1',n2:'h1',ctl:'coil:KM2',form:'NC',lab:'KM2',term:['21','22']},
  {t:'cont',id:'KTa',x:960,y:285,h:50,n1:'h1',n2:'h2',ctl:'kt:KT1',form:'NO',lab:'KT1',term:['15','18']},
  {t:'coil',id:'KM3',x:960,y:350,n1:'h2',n2:'N',lab:'KM3'}],
 nodes:{a1:{jy:290},a2:{jy:298},a3:{jy:306},st:{jy:318},w2:{jy:462},u2:{jy:474},v2:{jy:486},n1:{jy:212},n0:{jy:135}},
 links:[{pts:[[100,197],[280,197]],ctl:'coil:KM1'},{pts:[[380,362],[500,362]],ctl:'coil:KM3'},{pts:[[560,362],[680,362]],ctl:'coil:KM2'},{pts:[[100,110],[280,110]],ctl:'q:Q1'}],
 labels:[{x:370,y:30,t:'POTENCIA · 380 V',c:'c t'},{x:855,y:28,t:'MANDO · 220 V',c:'c t'},{x:440,y:420,t:'TRIÁNGULO',c:'c s'},{x:620,y:420,t:'ESTRELLA',c:'c s'},{x:190,y:152,t:'línea',c:'c s'}],
 parts:{
  Q1:{n:'Q1',t:'Q1 · Guardamotor',d:'Protección térmica y magnética del motor y la línea.'},
  KM1a:{n:'KM1',t:'KM1 · Contactor de línea',d:'Conecta la red a los bornes U1, V1 y W1 del motor. Está cerrado durante todo el arranque y la marcha.'},
  KM3a:{n:'KM3',t:'KM3 · Contactor triángulo',d:'Une U1 con W2, V1 con U2 y W1 con V2: cada bobinado queda entre dos fases (380 V). Es la conexión de marcha normal.'},
  KM2a:{n:'KM2',t:'KM2 · Contactor estrella',d:'Une entre sí los finales U2, V2 y W2 (punto neutro de la estrella). Cada bobinado queda a 220 V: la corriente de arranque baja a 1/3.'},
  M:{n:'M',t:'M · Motor de 6 bornes',d:'Tiene accesibles el principio y el final de cada bobinado (U1-U2, V1-V2, W1-W2). Según se conecten queda en estrella (220 V por bobinado) o triángulo (380 V).'},
  S0:{n:'S0',t:'S0 · Parada',d:'Corta todo el mando.'},S1:{n:'S1',t:'S1 · Marcha',d:'Arranca la secuencia: energiza KM1 y KT1 y, a través del camino estrella, KM2.'},
  KM1r:{n:'KM1 (13-14)',t:'KM1 · Retención',d:'Mantiene el mando al soltar S1.'},
  KM1:{n:'KM1',t:'KM1 · Bobina de línea',d:'Se energiza al presionar S1 y se retiene.'},
  KT1:{n:'KT1',t:'KT1 · Temporizador a la conexión',d:'Se energiza junto con KM1 y, pasado el tiempo regulado (aquí 6 s), conmuta sus contactos: abre el 15-16 (apaga estrella) y cierra el 15-18 (habilita triángulo).'},
  KTn:{n:'KT1 (15-16)',t:'KT1 · Contacto NC retardado',d:'Está cerrado al principio: permite que KM2 (estrella) se energice. Se abre cuando se cumple el tiempo.'},
  KTa:{n:'KT1 (15-18)',t:'KT1 · Contacto NA retardado',d:'Está abierto al principio. Se cierra cuando se cumple el tiempo y permite energizar KM3 (triángulo).'},
  KM3i:{n:'KM3 (21-22)',t:'KM3 · NC de enclavamiento',d:'Impide energizar KM2 si KM3 está cerrado.'},KM2i:{n:'KM2 (21-22)',t:'KM2 · NC de enclavamiento',d:'Impide energizar KM3 mientras KM2 esté cerrado. Cierra recién cuando KM2 cayó: así nunca están juntos.'},
  KM2:{n:'KM2',t:'KM2 · Bobina estrella',d:'Energiza durante la primera etapa.'},KM3:{n:'KM3',t:'KM3 · Bobina triángulo',d:'Energiza en régimen, después del cambio.'}},
 partsList:['Q1','KM1a','KM3a','KM2a','M','S0','S1','KM1r','KM1','KT1','KTn','KTa','KM3i','KM2i','KM2','KM3'],
 fallas:[{id:'sinEnclav',t:'Enclavamiento KM2/KM3 anulado',d:'Se puentean los NC 21-22: KM2 y KM3 pueden cerrar juntos y producir un cortocircuito.'},{id:'fase',t:'Falta la fase S',d:'El motor queda con 2 fases.'}],
 pasos:[
  {t:'Reconocé el circuito',hl:['KM1a','KM2a','KM3a','M','KT1'],x:'Hay <b>tres contactores</b> y un <b>temporizador</b>. KM1 lleva la red al motor. KM2 forma la <b>estrella</b>. KM3 forma el <b>triángulo</b>. El motor tiene sus seis bornes a la vista: U1-V1-W1 arriba (principios) y W2-U2-V2 abajo (finales de los bobinados).',hint:'Tocá el motor, KM2 y KM3 para leer cómo se conectan.'},
  {t:'¿Por qué empezar en estrella?',hl:['KM2a'],pred:{q:'¿Para qué se arranca en estrella?',o:['Para reducir la corriente de arranque a un tercio','Para que gire más rápido','Para ahorrar un contactor'],ok:0,why:'En estrella cada bobinado recibe 220 V en vez de 380: la corriente de línea baja a la tercera parte, igual que el par de arranque.'},x:'La tensión por bobinado es 380 ÷ √3 = 220 V. La corriente de línea en estrella es 1/3 de la corriente en triángulo.'},
  {t:'Arrancá: presioná S1',hl:['S1','KM1','KT1','KM2'],hint:'Presioná S1 y soltalo. Observá en “En vivo” que el motor arranca en ESTRELLA con 220 V por bobinado.',wait:S=>S.mode==='estrella'&&S.w>.5,expl:'Se energizaron <b>KM1</b>, <b>KT1</b> y <b>KM2</b> (a través de KM3 NC y KT1 15-16). El motor está en <b>estrella</b>: corriente baja, par bajo, velocidad hasta ~85 %.'},
  {t:'Esperá el cambio',hl:['KT1','KTn','KTa'],pred:{q:'Cuando KT1 cumple su tiempo, ¿qué debe pasar primero?',o:['KM3 se cierra antes de que KM2 abra','KM2 se abre y recién después se cierra KM3','Se abren todos'],ok:1,why:'Primero cae la estrella (KT1 15-16 abre) y su NC KM2 (21-22) se vuelve a cerrar; recién entonces KM3 puede energizarse. Si se cerraran a la vez habría cortocircuito.'},hint:'Esperá unos segundos hasta que el temporizador cumpla su tiempo.',wait:S=>S.mode==='triangulo',expl:'¡Cambió a <b>triángulo</b>! Ahora cada bobinado recibe 380 V, el motor termina de acelerar y trabaja en régimen. Hubo un instante en que todo estuvo abierto (transición abierta).'},
  {t:'Comparación de corrientes',hl:['M'],hint:'Esperá a que el motor llegue a su velocidad final (≈1450 rpm).',wait:S=>S.mode==='triangulo'&&S.w>.95,x:'En arranque directo el pico era de unos <b>21 A</b>. En estrella fue de unos <b>7 A</b>. Esa reducción protege la red y las instalaciones.'},
  {t:'¿Y si falla el enclavamiento?',hl:['KM3i','KM2i','Q1'],prep:S=>{S.fault.sinEnclav=true},pred:{q:'Con el enclavamiento anulado, si KM2 y KM3 cierran juntos, ¿qué pasa?',o:['Nada','Cortocircuito entre fases','El motor gira al revés'],ok:1,why:'KM3 une cada línea con un final de bobinado y KM2 los une entre sí: las tres fases quedan cortocircuitadas.'},hint:'Presioná S1 y esperá al cambio.',wait:S=>S.q.trip==='mag',expl:'¡Cortocircuito! Por eso KM2 y KM3 llevan <b>enclavamiento</b> eléctrico (y mecánico en potencias altas).'}],
 comentario(S){const c=[];
  if(S.mode==='estrella')c.push(['Conexión en estrella (Y)','KM1 y KM2 cerrados: los finales U2-V2-W2 están unidos entre sí. Cada bobinado queda a <b>220 V</b>. Corriente de línea: <b>'+S.I.toFixed(1).replace('.',',')+' A</b> (1/3 de la de arranque directo).']);
  if(S.mode==='triangulo')c.push(['Conexión en triángulo (Δ)','KM1 y KM3 cerrados: cada bobinado queda entre dos fases, a <b>380 V</b>. Es la conexión de régimen.']);
  if(S.coil.KT1&&!S.kt.out)c.push(['Temporizando','KT1 cuenta '+S.kt.tm.toFixed(1).replace('.',',')+' s de '+S.T+' s. Cuando termine, abrirá el camino de KM2 y habilitará el de KM3.']);
  if(S.short)c.push(['⚠ Cortocircuito','KM2 y KM3 cerrados a la vez unen las tres fases entre sí.']);
  return c},
 ejercicios:[
  {q:'En estrella, ¿qué tensión recibe cada bobinado de un motor de 380 V?',o:['380 V','220 V','110 V'],ok:1,why:'380 ÷ √3 ≈ 220 V.'},
  {q:'¿Cuánto baja aproximadamente la corriente de arranque en estrella?',o:['A la mitad','A un tercio','No baja'],ok:1,why:'La corriente de línea en estrella es 1/3 de la de triángulo.'},
  {q:'¿Qué contactor se energiza primero junto con KM1?',o:['KM2 (estrella)','KM3 (triángulo)','Ninguno'],ok:0,why:'KM2 forma la estrella para el arranque. KM3 entra recién después del temporizador.'},
  {q:'¿Para qué sirven los NC cruzados entre KM2 y KM3?',o:['Para encender lámparas','Para que nunca cierren al mismo tiempo','Para retener KM1'],ok:1,why:'Si cerraran juntos habría un cortocircuito entre fases.'},
  {q:'¿Qué componente define cuánto tiempo dura el arranque en estrella?',o:['El temporizador KT1','El guardamotor Q1','El pulsador S0'],ok:0,why:'KT1 mide el tiempo y cambia los contactos de estrella a triángulo.'}]
};
/* ============================================================ 5. MONOFÁSICO DIRECTO */
const monoDir={
 titulo:'Arranque directo monofásico (220 V)',
 intro:'Un motor monofásico (por ejemplo de 0,75 kW) se alimenta con fase y neutro, 220 V. Un interruptor termomagnético (Q1) lo protege y un contactor (KM1) lo conecta con una selectora. Es el mismo principio que el trifásico pero con un solo conductor de fase conmutado.',
 queEs:'Bombas domiciliarias, compresores chicos, portones, máquinas de taller con motor monofásico.',
 coils:['KM1'],prot:{q:true},In:4.5,Ir:4.5,mono:true,
 items:[
  {t:'bus',id:'busF',n:'F',y:70,x1:100,x2:960,lab:'F'},{t:'bus',id:'busN',n:'N',y:525,x1:100,x2:960,lab:'N'},
  pol('Q1a',140,95,'F','q1','q:Q1',{deco:'q',fase:true,term:['1','2'],lab:'Q1'}),{t:'qh',id:'Q1',x:60,y:95,h:64},
  pol('KM1a',140,190,'q1','m1','coil:KM1',{peg:true,term:['1','2'],lab:'KM1'}),
  {t:'m1',id:'M',x:180,y:300,n:['m1','N']},
  {t:'cont',id:'S1',op:'sel',x:640,y:110,h:60,n1:'F',n2:'c1',ctl:'sel:S1',form:'NO',lab:'S1',term:['13','14']},
  {t:'coil',id:'KM1',x:640,y:200,n1:'c1',n2:'N',lab:'KM1'},
  {t:'cont',id:'KM1x',x:740,y:110,h:60,n1:'F',n2:'c2',ctl:'coil:KM1',form:'NO',lab:'KM1',term:['13','14']},
  {t:'lamp',id:'H1',x:740,y:200,n1:'c2',n2:'N',lab:'H1 marcha',col:GRN},
  {t:'cont',id:'Q1x',x:860,y:110,h:60,n1:'F',n2:'c3',ctl:'qt:Q1',form:'NO',lab:'Q1',term:['97','98']},
  {t:'lamp',id:'H2',x:860,y:200,n1:'c3',n2:'N',lab:'H2 falla',col:RED}],
 links:[{pts:[[140,222],[110,222],[110,227],[560,227],[560,225],[610,225]],ctl:'coil:KM1'},{pts:[[670,225],[705,225],[705,140],[740,140]],ctl:'coil:KM1'}],
 labels:[{x:260,y:30,t:'POTENCIA · 220 V',c:'c t'},{x:790,y:30,t:'MANDO · 220 V',c:'c t'},{x:180,y:430,t:'Motor monofásico',c:'c s'}],
 parts:{
  Q1:{n:'Q1',t:'Q1 · Termomagnética',d:'Protege contra sobrecarga (térmica) y cortocircuito (magnética). Se maniobra a mano: tocala.'},
  Q1a:{n:'Q1',t:'Contacto de Q1',d:'Interrumpe la fase. El neutro va directo al motor.'},
  KM1a:{n:'KM1',t:'KM1 · Contacto principal',d:'Conmuta el conductor de fase hacia el motor. Aquí alcanza con un solo polo porque el neutro no se interrumpe.'},
  KM1:{n:'KM1',t:'KM1 · Bobina',d:'Electroimán de 220 V entre fase (F) y neutro (N).'},
  M:{n:'M',t:'M · Motor monofásico',d:'0,75 kW, 220 V, 4,5 A. Necesita un capacitor de arranque o marcha para generar el campo giratorio (no se muestra).'},
  S1:{n:'S1',t:'S1 · Selectora ON/OFF',d:'Mantiene su posición y comanda la bobina.'},
  KM1x:{n:'KM1 (13-14)',t:'KM1 · Auxiliar NA',d:'Enciende la lámpara de marcha.'},H1:{n:'H1',t:'H1 · Lámpara verde',d:'Marcha.'},Q1x:{n:'Q1 (97-98)',t:'Q1 · Señalización',d:'Se cierra si Q1 dispara.'},H2:{n:'H2',t:'H2 · Lámpara roja',d:'Falla de Q1.'}},
 partsList:['Q1','KM1a','KM1','M','S1','KM1x','H1','Q1x','H2'],
 fallas:[{id:'fase',t:'Se corta el conductor de fase',d:'Un cable de fase se corta antes del contactor.'}],
 pasos:[
  {t:'Reconocé el circuito',hl:['Q1','KM1a','M','S1','KM1'],x:'En monofásico sólo hay <b>fase (F)</b> y <b>neutro (N)</b>: 220 V entre ambos. Las protecciones y el contactor interrumpen la fase; el neutro va directo. El mando usa también F y N.',hint:'Tocá las piezas para leer qué son.'},
  {t:'¿Qué tensión tiene el motor?',hl:['M'],pred:{q:'El motor monofásico está entre F y N. ¿Qué tensión recibe cuando KM1 cierra?',o:['380 V','220 V','110 V'],ok:1,why:'La tensión fase-neutro en Argentina es 220 V; 380 V es entre dos fases (trifásico).'},x:'Mirá el motor: sólo tiene dos bornes (L y N).'},
  {t:'Arrancá el motor',hl:['S1','KM1','KM1a'],hint:'Tocá la selectora S1 para ponerla en ON.',wait:S=>S.sel.S1&&S.mode==='directo',expl:'La corriente del mando pasó por S1 y la bobina; KM1 cerró y el motor se alimentó con F y N.'},
  {t:'Protección: sobrecarga',hl:['Q1'],prep:S=>{S.carga='s'},pred:{q:'Con sobrecarga sostenida, ¿qué hace la termomagnética?',o:['Dispara por temperatura después de un tiempo','Dispara al instante','No dispara'],ok:0,why:'La parte térmica reacciona con el calentamiento: tarda más cuanto menor es la sobrecarga.'},hint:'Poné S1 en ON y esperá.',wait:S=>S.q.trip==='term'},
  {t:'Protección: cortocircuito',hl:['Q1'],prep:S=>{S.carga='cc'},hint:'Poné S1 en ON.',wait:S=>S.q.trip==='mag',expl:'El disparo magnético actuó en milisegundos.'}],
 comentario(S){const c=[];if(S.sel.S1&&S.mode==='directo')c.push(['Fase y neutro','El motor se alimenta con 220 V entre F y N. Sólo la fase se interrumpe con KM1.']);if(S.q.trip)c.push(['Q1 disparó','La fase quedó abierta en Q1: el motor se detiene aunque KM1 siga cerrado.']);return c},
 ejercicios:[
  {q:'La tensión de un motor monofásico en Argentina es…',o:['380 V','220 V','24 V'],ok:1,why:'220 V entre fase y neutro.'},
  {q:'¿Qué conductor interrumpe KM1 en este circuito?',o:['La fase','El neutro','El de tierra'],ok:0,why:'Se interrumpe la fase; el neutro va directo al motor.'},
  {q:'¿Qué protege contra cortocircuito a Q1?',o:['La parte térmica','La parte magnética','La lámpara'],ok:1,why:'La magnética es instantánea.'}]
};
/* ============================================================ 6. MONOFÁSICO MARCHA-PARADA */
const monoMP={
 titulo:'Marcha-parada monofásica con retención',
 intro:'Igual que el trifásico con pulsadores, pero con un motor monofásico de 220 V: fusible en la fase, contactor de un polo, relé térmico y retención con el contacto auxiliar.',
 queEs:'Es el circuito típico de una bomba, una compresora o una máquina chica de taller.',
 coils:['KM1'],prot:{th:true,fus:true},In:4.5,Ir:4.5,mono:true,
 items:[
  {t:'bus',id:'busF',n:'F',y:70,x1:100,x2:960,lab:'F'},{t:'bus',id:'busN',n:'N',y:525,x1:100,x2:960,lab:'N'},
  {t:'fuse',id:'F1a',x:140,y:92,h:52,n1:'F',n2:'f1',lab:'F1'},
  pol('KM1a',140,165,'f1','k1','coil:KM1',{lab:'KM1',term:['1','2'],fase:true}),
  {t:'heater',id:'F2a',x:140,y:250,h:48,n1:'k1',n2:'h1',lab:'F2'},
  {t:'m1',id:'M',x:180,y:335,n:['h1','N']},
  {t:'cont',id:'F2n',x:620,y:90,h:52,n1:'F',n2:'d1',ctl:'th:F2',form:'NC',lab:'F2',term:['95','96']},
  {t:'cont',id:'S0',op:'btn',x:620,y:150,h:52,n1:'d1',n2:'d2',ctl:'btn:S0',form:'NC',lab:'S0',term:['1','2']},
  {t:'cont',id:'S1',op:'btn',x:585,y:215,h:52,n1:'d2',n2:'d3',ctl:'btn:S1',form:'NO',lab:'S1',term:['3','4']},
  {t:'cont',id:'KM1r',x:695,y:215,h:52,n1:'d2',n2:'d3',ctl:'coil:KM1',form:'NO',lab:'KM1',term:['13','14']},
  {t:'coil',id:'KM1',x:640,y:290,n1:'d3',n2:'N',lab:'KM1'},
  {t:'cont',id:'KM1y',x:790,y:90,h:52,n1:'F',n2:'e1',ctl:'coil:KM1',form:'NO',lab:'KM1',term:['23','24']},
  {t:'lamp',id:'H1',x:790,y:165,n1:'e1',n2:'N',lab:'H1 marcha',col:GRN},
  {t:'cont',id:'F2z',x:900,y:90,h:52,n1:'F',n2:'e2',ctl:'th:F2',form:'NO',lab:'F2',term:['97','98']},
  {t:'lamp',id:'H2',x:900,y:165,n1:'e2',n2:'N',lab:'H2 falla',col:RED}],
 links:[{pts:[[140,197],[110,197]],ctl:'coil:KM1'},{pts:[[670,315],[740,315],[740,241],[695,241]],ctl:'coil:KM1'},{pts:[[670,320],[750,320],[750,116],[790,116]],ctl:'coil:KM1'}],
 labels:[{x:260,y:30,t:'POTENCIA · 220 V',c:'c t'},{x:790,y:30,t:'MANDO · 220 V',c:'c t'}],
 parts:{
  F1a:{n:'F1',t:'F1 · Fusible',d:'Protege contra cortocircuitos en la fase.'},KM1a:{n:'KM1',t:'KM1 · Contacto principal',d:'Conmuta la fase hacia el motor.'},
  F2a:{n:'F2',t:'F2 · Relé térmico',d:'Protege contra sobrecargas.'},M:{n:'M',t:'M · Motor monofásico',d:'0,75 kW, 220 V, 4,5 A.'},
  F2n:{n:'F2 (95-96)',t:'F2 · NC del térmico',d:'En serie con la bobina: si dispara, abre.'},
  S0:{n:'S0',t:'S0 · Parada (NC)',d:'Corta el mando.'},S1:{n:'S1',t:'S1 · Marcha (NA)',d:'Energiza la bobina.'},
  KM1r:{n:'KM1 (13-14)',t:'KM1 · Retención',d:'En paralelo con S1: mantiene la bobina al soltarlo.'},KM1:{n:'KM1',t:'KM1 · Bobina',d:'220 V entre F y N.'},
  KM1y:{n:'KM1 (23-24)',t:'KM1 · Auxiliar',d:'Lámpara de marcha.'},H1:{n:'H1',t:'H1',d:'Marcha.'},F2z:{n:'F2 (97-98)',t:'F2 · NA',d:'Se cierra al disparar.'},H2:{n:'H2',t:'H2',d:'Falla.'}},
 partsList:['F1a','KM1a','F2a','M','F2n','S0','S1','KM1r','KM1','H1','H2'],
 fallas:[{id:'fase',t:'Se corta la fase',d:'Cable de fase interrumpido.'}],
 pasos:[
  {t:'Reconocé el circuito',hl:['S0','S1','KM1r','KM1'],x:'El camino de mando es el mismo que en el trifásico: F → F2 (95-96) → S0 → [S1 ∥ KM1 (13-14)] → KM1 → N. Sólo cambia la potencia: fase y neutro.',hint:'Tocá S0, S1 y KM1 (13-14).'},
  {t:'Presioná y soltá S1',hl:['S1','KM1r'],pred:{q:'Soltás S1. ¿Qué mantiene energizada la bobina?',o:['El propio contacto 13-14 de KM1','El fusible','S0'],ok:0,why:'La retención: el contacto auxiliar queda en paralelo con S1.'},hint:'Mantené apretado S1 y soltalo.',wait:S=>S.mode==='directo'&&!S.btn.S1&&S.arm.KM1>.9},
  {t:'Detené con S0',hl:['S0'],prep:S=>{S.arm.KM1=1;S.w=1},hint:'Presioná S0.',wait:S=>S.mode==='parado'&&!S.btn.S0},
  {t:'Sobrecarga',hl:['F2a','F2n'],prep:S=>{S.carga='s';S.arm.KM1=1;S.w=.97},hint:'Esperá a que dispare el térmico.',wait:S=>S.th.trip,expl:'El NC 95-96 se abrió y cortó la bobina.'}],
 comentario(S){const c=[];if(S.coil.KM1&&!S.btn.S1&&S.arm.KM1>.9)c.push(['Retención activa','S1 está suelto; la corriente llega a la bobina por KM1 (13-14).']);if(S.th.trip)c.push(['Térmico disparado','El contacto 95-96 está abierto.']);return c},
 ejercicios:[
  {q:'¿Qué conductor se fusiona con F1?',o:['La fase','El neutro','Ambos siempre'],ok:0,why:'Se protege la fase; el neutro no se interrumpe.'},
  {q:'S0 es NC porque…',o:['Es más barato','Falla de forma segura','Arranca más rápido'],ok:1,why:'Un cable cortado detiene la máquina.'},
  {q:'El 13-14 de KM1 está sucio. ¿Qué pasa al soltar S1?',o:['El motor sigue','Se detiene','Dispara el térmico'],ok:1,why:'Sin retención la bobina se cae.'}]
};
/* ============================================================ 7. MARCHA POR IMPULSOS */
const impulsos={
 titulo:'Marcha por impulsos y marcha permanente',
 intro:'Con una selectora S3 se elige el modo: en PERMANENTE el circuito se retiene como siempre; en IMPULSOS se anula la retención y el motor gira sólo mientras se mantiene apretado S1. Sirve para ajustar y posicionar máquinas con movimientos cortos.',
 queEs:'Tornos, prensas, cintas y puentes grúa: el operario necesita “acercar” la pieza con pequeños giros.',
 coils:['KM1'],prot:{q:true},In:3.6,Ir:3.6,
 items:[
  {t:'bus',id:'busF',n:'F',y:70,x1:600,x2:970,lab:'F'},{t:'bus',id:'busN',n:'N',y:525,x1:600,x2:970,lab:'N'},
  R('R',100,70),R('S',190,70),R('T',280,70),
  pol('Q1a',100,95,'R','r1','q:Q1',{deco:'q',term:['1','2']}),pol('Q1b',190,95,'S','s1','q:Q1',{deco:'q',fase:true,term:['3','4']}),pol('Q1c',280,95,'T','t1','q:Q1',{deco:'q',term:['5','6']}),{t:'qh',id:'Q1',x:40,y:95,h:64},
  pol('KM1a',100,185,'r1','m1','coil:KM1',{lab:'KM1',term:['1','2']}),pol('KM1b',190,185,'s1','m2','coil:KM1',{term:['3','4']}),pol('KM1c',280,185,'t1','m3','coil:KM1',{term:['5','6']}),
  {t:'m3',id:'M',x:190,y:320,n:['m1','m2','m3']},
  {t:'cont',id:'S0',op:'btn',x:760,y:90,h:52,n1:'F',n2:'n0',ctl:'btn:S0',form:'NC',lab:'S0',term:['1','2']},
  {t:'cont',id:'S1',op:'btn',x:650,y:152,h:52,n1:'n0',n2:'p1',ctl:'btn:S1',form:'NO',lab:'S1',term:['3','4']},
  {t:'cont',id:'KM1r',x:810,y:152,h:52,n1:'n0',n2:'r1x',ctl:'coil:KM1',form:'NO',lab:'KM1',term:['13','14']},
  {t:'cont',id:'S3',op:'sel',x:810,y:214,h:52,n1:'r1x',n2:'p1',ctl:'sel:S3',form:'NO',lab:'S3',term:['23','24']},
  {t:'coil',id:'KM1',x:730,y:292,n1:'p1',n2:'N',lab:'KM1'},
  {t:'cont',id:'KM1y',x:910,y:100,h:52,n1:'F',n2:'e1',ctl:'coil:KM1',form:'NO',lab:'KM1',term:['43','44']},
  {t:'lamp',id:'H1',x:910,y:170,n1:'e1',n2:'N',lab:'H1',col:GRN}],
 nodes:{p1:{jy:280}},
 links:[{pts:[[100,217],[280,217]],ctl:'coil:KM1'},{pts:[[100,127],[280,127]],ctl:'q:Q1'}],
 labels:[{x:190,y:30,t:'POTENCIA · 380 V',c:'c t'},{x:785,y:30,t:'MANDO · 220 V',c:'c t'},{x:880,y:262,t:'S3: ON = permanente',c:'s'},{x:880,y:278,t:'S3: OFF = impulsos',c:'s'}],
 parts:{
  Q1:{n:'Q1',t:'Q1 · Guardamotor',d:'Protección del motor.'},KM1a:{n:'KM1',t:'KM1 · Contactor',d:'Conecta el motor a la red.'},M:{n:'M',t:'M · Motor',d:'Trifásico 1,5 kW.'},
  S0:{n:'S0',t:'S0 · Parada',d:'NC: corta el mando.'},S1:{n:'S1',t:'S1 · Marcha / impulso',d:'Cierra el circuito hacia la bobina. En impulsos, el motor gira sólo mientras se mantiene apretado.'},
  KM1r:{n:'KM1 (13-14)',t:'KM1 · Contacto de retención',d:'Retiene a KM1, pero sólo si S3 deja pasar la corriente.'},
  S3:{n:'S3',t:'S3 · Selectora permanente / impulsos',d:'Está en serie con el contacto de retención. En OFF abre ese camino y anula la retención: el modo es “impulsos”. En ON habilita la retención.'},
  KM1:{n:'KM1',t:'KM1 · Bobina',d:'220 V.'},KM1y:{n:'KM1',t:'KM1 · Auxiliar',d:'Lámpara.'},H1:{n:'H1',t:'H1',d:'Marcha.'}},
 partsList:['Q1','KM1a','M','S0','S1','KM1r','S3','KM1'],
 fallas:[{id:'fase',t:'Falta la fase S',d:'Motor con 2 fases.'}],
 pasos:[
  {t:'Reconocé el circuito',hl:['S3','KM1r','S1'],x:'Es un circuito de marcha-parada, pero el contacto de retención <b>KM1 (13-14)</b> pasa por una selectora <b>S3</b>. Si S3 está abierta, no hay retención.',hint:'Tocá S3 y KM1 (13-14) para leer qué hacen.'},
  {t:'Modo impulsos (S3 en OFF)',hl:['S1','S3'],pred:{q:'S3 está en OFF. Presionás S1 y lo soltás. ¿Qué pasa?',o:['El motor gira mientras S1 está apretado y se detiene al soltarlo','El motor sigue girando','No gira nunca'],ok:0,why:'Sin retención, la bobina sólo se energiza por S1.'},hint:'Mantené apretado S1 un momento y soltalo.',wait:S=>!S.btn.S1&&S.w>.05&&S.arm.KM1<.5&&!S.sel.S3,expl:'El motor giró sólo durante el impulso: así se posiciona una máquina con precisión.'},
  {t:'Modo permanente (S3 en ON)',hl:['S3','KM1r'],pred:{q:'Ahora poné S3 en ON y presioná S1. ¿Qué cambia?',o:['Nada','Ahora hay retención y el motor sigue al soltar S1','Se funde un fusible'],ok:1,why:'S3 en ON habilita el camino de retención KM1 (13-14).'},hint:'Poné S3 en ON, presioná S1 y soltalo.',wait:S=>S.sel.S3&&!S.btn.S1&&S.arm.KM1>.9&&S.mode==='directo'},
  {t:'Parada',hl:['S0'],hint:'Presioná S0 para detener.',wait:S=>S.sel.S3&&S.mode==='parado'&&S.w<.9}],
 comentario(S){const c=[];if(S.sel.S3)c.push(['Modo permanente','S3 cerrada: la retención KM1 (13-14) está habilitada.']);else c.push(['Modo impulsos','S3 abierta: el contacto de retención no sirve; el motor gira sólo mientras se aprieta S1.']);return c},
 ejercicios:[
  {q:'¿Para qué sirve la marcha por impulsos?',o:['Para ajustar posiciones con giros cortos','Para ahorrar energía','Para invertir el giro'],ok:0,why:'El operario acerca o posiciona con movimientos pequeños.'},
  {q:'¿Qué hace S3 abierta?',o:['Anula la retención','Corta la potencia','Enciende la lámpara'],ok:0,why:'Abre el camino del contacto 13-14.'},
  {q:'En modo permanente se detiene con…',o:['S0','S3 nada más','Soltando S1'],ok:0,why:'S0 corta el mando y quita la retención.'}]
};
/* ============================================================ 8. ARRANQUE TEMPORIZADO */
const temporizado={
 titulo:'Arranque temporizado (retardo a la conexión)',
 intro:'Al presionar S1 no arranca el motor enseguida: se energizan un relé auxiliar KA1 (que se retiene) y el temporizador KT1. Cuando KT1 cumple su tiempo, su contacto retardado energiza el contactor KM1 y el motor arranca.',
 queEs:'Se usa cuando hay que esperar antes de arrancar: prelubricación, ventilación previa de un quemador, secuencia de cintas transportadoras.',
 coils:['KM1','KA1'],prot:{q:true},In:3.6,Ir:3.6,T:5,
 items:[
  {t:'bus',id:'busF',n:'F',y:60,x1:600,x2:970,lab:'F'},{t:'bus',id:'busN',n:'N',y:535,x1:600,x2:970,lab:'N'},
  R('R',100,70),R('S',190,70),R('T',280,70),
  pol('Q1a',100,95,'R','r1','q:Q1',{deco:'q',term:['1','2']}),pol('Q1b',190,95,'S','s1','q:Q1',{deco:'q',fase:true,term:['3','4']}),pol('Q1c',280,95,'T','t1','q:Q1',{deco:'q',term:['5','6']}),{t:'qh',id:'Q1',x:40,y:95,h:64},
  pol('KM1a',100,185,'r1','m1','coil:KM1',{lab:'KM1',term:['1','2']}),pol('KM1b',190,185,'s1','m2','coil:KM1',{term:['3','4']}),pol('KM1c',280,185,'t1','m3','coil:KM1',{term:['5','6']}),
  {t:'m3',id:'M',x:190,y:320,n:['m1','m2','m3']},
  {t:'cont',id:'S0',op:'btn',x:760,y:80,h:52,n1:'F',n2:'n0',ctl:'btn:S0',form:'NC',lab:'S0',term:['1','2']},
  {t:'cont',id:'S1',op:'btn',x:670,y:142,h:52,n1:'n0',n2:'n1',ctl:'btn:S1',form:'NO',lab:'S1',term:['3','4']},
  {t:'cont',id:'KAr',x:840,y:142,h:52,n1:'n0',n2:'n1',ctl:'coil:KA1',form:'NO',lab:'KA1',term:['13','14']},
  {t:'coil',id:'KA1',x:650,y:262,n1:'n1',n2:'N',lab:'KA1'},{t:'coil',id:'KT1',x:735,y:262,n1:'n1',n2:'N',lab:'KT1'},
  {t:'cont',id:'KTa',x:860,y:240,h:52,n1:'n1',n2:'g1',ctl:'kt:KT1',form:'NO',lab:'KT1',term:['15','18']},
  {t:'coil',id:'KM1',x:860,y:320,n1:'g1',n2:'N',lab:'KM1'},
  {t:'cont',id:'KM1y',x:940,y:240,h:52,n1:'n1',n2:'e1',ctl:'coil:KM1',form:'NO',lab:'KM1',term:['13','14']},{t:'lamp',id:'H1',x:940,y:320,n1:'e1',n2:'N',lab:'H1',col:GRN}],
 nodes:{n1:{jy:218}},
 links:[{pts:[[100,217],[280,217]],ctl:'coil:KM1'},{pts:[[100,127],[280,127]],ctl:'q:Q1'}],
 labels:[{x:190,y:30,t:'POTENCIA · 380 V',c:'c t'},{x:790,y:28,t:'MANDO · 220 V',c:'c t'}],
 parts:{
  Q1:{n:'Q1',t:'Q1 · Guardamotor',d:'Protección del motor.'},KM1a:{n:'KM1',t:'KM1 · Contactor',d:'Conecta el motor. Su bobina recibe tensión recién cuando KT1 cumple el tiempo.'},M:{n:'M',t:'M · Motor',d:'Trifásico.'},
  S0:{n:'S0',t:'S0 · Parada',d:'Corta el mando (NC).'},S1:{n:'S1',t:'S1 · Marcha',d:'Inicia la secuencia.'},
  KAr:{n:'KA1 (13-14)',t:'KA1 · Retención',d:'KA1 se retiene a sí mismo para mantener alimentado al temporizador aunque se suelte S1.'},
  KA1:{n:'KA1',t:'KA1 · Relé auxiliar',d:'Memoriza la orden de marcha.'},
  KT1:{n:'KT1',t:'KT1 · Temporizador',d:'Cuenta el tiempo regulado desde que se energiza.'},
  KTa:{n:'KT1 (15-18)',t:'KT1 · Contacto retardado',d:'Se cierra al cumplirse el tiempo y energiza KM1.'},
  KM1:{n:'KM1',t:'KM1 · Bobina',d:'Cierra la potencia.'},KM1y:{n:'KM1',t:'KM1 · Auxiliar',d:'Lámpara.'},H1:{n:'H1',t:'H1',d:'Marcha.'}},
 partsList:['Q1','KM1a','S1','KAr','KA1','KT1','KTa','KM1'],
 fallas:[{id:'fase',t:'Falta la fase S',d:'Motor con 2 fases.'}],
 pasos:[
  {t:'Reconocé el circuito',hl:['KA1','KT1','KTa','KM1'],x:'S1 no alimenta a KM1 directamente. Alimenta a <b>KA1</b> (que se retiene) y a <b>KT1</b> (el temporizador). El contacto <b>KT1 (15-18)</b>, que se cierra tras el retardo, es el que energiza KM1.',hint:'Tocá KA1, KT1 y su contacto retardado.'},
  {t:'Presioná S1',hl:['S1','KAr','KT1'],pred:{q:'Presionás S1. ¿Arranca el motor al instante?',o:['Sí','No: espera el tiempo del temporizador','Nunca arranca'],ok:1,why:'KM1 sólo se energiza cuando KT1 cierra su contacto retardado.'},hint:'Presioná S1 y soltalo. Mirá cómo cuenta KT1 en “En vivo”.',wait:S=>S.coil.KT1&&!S.btn.S1&&S.arm.KM1<.5,expl:'KA1 se retuvo y KT1 empezó a contar; el motor todavía no arrancó.'},
  {t:'Termina el tiempo',hl:['KTa','KM1','M'],hint:'Esperá a que KT1 cumpla su tiempo.',wait:S=>S.mode==='directo',expl:'El contacto retardado se cerró, KM1 se energizó y el motor arrancó. Todo el tiempo estuvo la orden “memorizada” por KA1.'},
  {t:'Parada',hl:['S0'],hint:'Presioná S0.',wait:S=>S.mode==='parado',expl:'S0 cortó el mando: KA1, KT1 y KM1 cayeron y el temporizador se reinició.'}],
 comentario(S){const c=[];if(S.coil.KT1&&!S.kt.out)c.push(['Temporizando','KT1 cuenta '+S.kt.tm.toFixed(1).replace('.',',')+' s de '+S.T+' s. KM1 todavía no tiene tensión.']);if(S.kt.out&&S.coil.KM1)c.push(['Tiempo cumplido','El contacto KT1 (15-18) cerró y energizó a KM1.']);return c},
 ejercicios:[
  {q:'¿Qué hace KA1 en este circuito?',o:['Memoriza la orden de marcha (retención)','Mide la corriente','Protege contra cortocircuito'],ok:0,why:'Se retiene y mantiene energizado a KT1.'},
  {q:'¿Cuándo se energiza KM1?',o:['Apenas se presiona S1','Cuando KT1 cierra su contacto retardado','Al soltar S1'],ok:1,why:'Después del tiempo regulado.'},
  {q:'Aplicación típica de un arranque temporizado:',o:['Prelubricación antes de arrancar','Invertir el giro','Medir tensión'],ok:0,why:'Primero arranca la bomba de aceite y luego el motor principal.'}]
};
window.CIRCUITOS['mono-directo']=monoDir;
window.CIRCUITOS['mono-marcha-parada']=monoMP;
window.CIRCUITOS['tri-impulsos']=impulsos;
window.CIRCUITOS['tri-temporizado']=temporizado;
window.CIRCUITOS['tri-directo']=directo;
window.CIRCUITOS['tri-enclavamiento']=enclav;
window.CIRCUITOS['tri-inversion']=inversion;
window.CIRCUITOS['tri-estrella-triangulo']=sd;
})();
