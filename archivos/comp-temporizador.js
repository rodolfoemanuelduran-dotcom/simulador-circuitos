/* Componente "Temporizador y relé auxiliar" (relé de tiempo a la conexión). Usa comp-comun.js. */
(function(){
const{cl,fm,g,screw,glow,lbl,tag,title,spring,DEFS}=window.CPH;
const TH=.8,LN5=Math.log(5);
const PARTES={
 pot:{t:'Potenciómetro (ajuste de tiempo)',d:'Resistencia variable que se regula con la perilla frontal. Cuanto mayor es su resistencia, más lenta es la carga del capacitor y más largo el retardo.'},
 cap:{t:'Capacitor',d:'Almacena carga. Al aplicar tensión se carga a través del potenciómetro siguiendo una curva exponencial. Cuando su tensión llega al umbral, el circuito dispara el relé. Con el tiempo los capacitores electrolíticos se secan y el retardo cambia.'},
 comp:{t:'Comparador / circuito integrado',d:'Compara la tensión del capacitor con una referencia fija (el 80 % en este ejemplo). Cuando la supera, activa el transistor que alimenta la bobina del relé de salida.'},
 rele:{t:'Relé de salida',d:'Un pequeño electroimán con su armadura y sus contactos conmutados. Cuando el comparador lo activa, sus contactos cambian: ése es el momento en que “termina” el tiempo.'},
 contactos:{t:'Contactos de salida (15-16 NC / 15-18 NA)',d:'Un contacto conmutado: el común 15 está unido al 16 en reposo y pasa al 18 cuando el relé se energiza, una vez cumplido el retardo.'},
 led:{t:'Indicadores luminosos',d:'U (verde) indica que el relé está alimentado. R (amarillo) indica que el relé de salida ya actuó.'},
 perilla:{t:'Perilla de tiempo',d:'Gira el potenciómetro. Tiene un selector de rango que multiplica la escala (por ejemplo 0,1–1 s, 1–10 s, 10–100 s).'},
 bornes:{t:'Bornes',d:'A1–A2: alimentación (por ejemplo 220 V CA). 15-16-18: contacto de salida. En un relé auxiliar, 13-14, 23-24 (NA) y 31-32, 41-42 (NC).'},
 pcb:{t:'Placa electrónica',d:'Soporta y conecta los componentes. En los relés de tiempo modernos todo el retardo lo hace esta electrónica, sin partes mecánicas lentas.'},
 carcasa:{t:'Carcasa',d:'Plástico aislante. Se monta en riel DIN.'},
 tapa:{t:'Frente',d:'Lleva la perilla, los indicadores y la identificación de bornes.'}
};
C({
 titulo:'Temporizador y relé auxiliar',
 intro:'El relé de tiempo (retardo a la conexión) espera un tiempo regulable después de recibir tensión y recién entonces cambia sus contactos. El relé auxiliar hace lo mismo sin demora y sirve para multiplicar contactos. Elegí el modo en “Operar”.',
 vistaIni:'frontal',
 vistas:[{id:'frontal',t:'Frontal'},{id:'lateral',t:'Lateral'},{id:'superior',t:'Superior'},{id:'trasera',t:'Trasera'},{id:'interior',t:'Interior'}],
 capas:[{id:'carcasa',t:'Carcasa'},{id:'tapa',t:'Frente y perilla'},{id:'bornes',t:'Bornes y tornillos'},{id:'pcb',t:'Placa electrónica'},{id:'cap',t:'Potenciómetro y capacitor'},{id:'rele',t:'Relé de salida'},{id:'contactos',t:'Contactos de salida'},{id:'etiq',t:'Nombres de las piezas'}],
 btnOn:'⚡ Aplicar tensión (A1–A2)',btnOff:'⏻ Quitar la tensión',
 fallas:[
  {id:'cap',t:'Capacitor degradado',d:'Perdió capacidad: el retardo real es más corto que el ajustado.'},
  {id:'pot',t:'Potenciómetro sucio',d:'El contacto del cursor falla: el tiempo varía de una vez a otra.'},
  {id:'quem',t:'Contacto de salida quemado',d:'El relé actúa pero el contacto no conduce.'}],
 fallaVista:{cap:'interior',pot:'interior',quem:'interior'},
 partes:PARTES,
 controles:[
  {k:'modo',t:'choice',l:'Modo',v:'tempo',o:[['tempo','Relé de tiempo (a la conexión)'],['aux','Relé auxiliar (sin demora)']]},
  {k:'T',t:'slider',l:'Tiempo ajustado',min:1,max:30,st:1,v:6,fmt:v=>fm(v,0)+' s'},
  {k:'vel',t:'choice',l:'Velocidad del tiempo',v:'5',num:true,o:[['1','Real ×1'],['5','×5'],['10','×10']]}],
 init(){return{vc:0,te:0,ar:0,hist:[],hacc:0,jit:1}},
 reinicio(o){o.vc=0;o.te=0;o.ar=0;o.hist=[]},
 accion(){return[]},
 est(o,c){const f=c.f,no=o.ar>.7,nc=o.ar<.3;return{no,nc,noCond:no&&!f.quem,aux:c.p.modo==='aux'}},
 paso(o,dt,c,t){const ev=[];if(dt<=0)return ev;const f=c.f,aux=c.p.modo==='aux',vel=+c.p.vel||5,ds=dt*vel;
  let T=aux?.02:c.p.T;if(f.cap)T*=.55;
  if(c.coil){if(f.pot&&o.te<=0)o.jit=.6+Math.random()*.9;const RC=T*o.jit/LN5;o.vc+=(1-o.vc)*Math.min(1,ds/RC);o.te+=ds}
  else{o.vc*=Math.exp(-dt/.25);o.te=0;if(!f.pot)o.jit=1;if(o.vc<.002)o.hist=[]}
  const act=c.coil&&o.vc>=TH||(aux&&c.coil);
  const old=o.ar;o.ar+=((act?1:0)-o.ar)*Math.min(1,dt*(aux?30:24));
  if(old<.7&&o.ar>=.7)ev.push('clack');if(old>=.3&&o.ar<.3)ev.push('tac');
  o.hacc+=ds;if(c.coil&&o.hacc>=.15&&o.hist.length<400){o.hist.push([o.te,o.vc]);o.hacc=0}
  return ev},
 hum(o,c){return false},
 lecturas(o,c){const e=this.est(o,c),f=c.f,aux=e.aux,T=aux?.02:c.p.T;
  const reads=[{l:'TENSIÓN EN A1–A2',v:c.coil?'220 V':'0 V',on:c.coil},{l:'TIEMPO TRANSCURRIDO',v:fm(o.te,1)+' s',on:c.coil},{l:'TIEMPO AJUSTADO',v:aux?'0 s (sin demora)':fm(c.p.T,0)+' s'+(f.cap?' (real: '+fm(c.p.T*.55,1)+' s)':''),on:null},{l:'CARGA DEL CAPACITOR',v:Math.round(o.vc*100)+' % (umbral 80 %)',on:o.vc>=TH},{l:'RELÉ DE SALIDA',v:o.ar>.7?'energizado':'en reposo',on:o.ar>.7},{l:'CONTACTO 15–16 (NC)',v:e.nc?'cerrado':'abierto',on:e.nc},{l:'CONTACTO 15–18 (NA)',v:e.noCond?'cerrado':e.no?'cerrado (no conduce)':'abierto',on:e.noCond}];
  if(aux)reads.push({l:'CONTACTOS 13-14 · 23-24 (NA)',v:e.no?'cerrados':'abiertos',on:e.no},{l:'CONTACTOS 31-32 · 41-42 (NC)',v:e.nc?'cerrados':'abiertos',on:e.nc});
  let verdict;
  if(!c.coil)verdict={cls:'ok',t:'Sin tensión: el capacitor está descargado y los contactos en reposo (15–16 cerrado).'};
  else if(o.ar>.7&&f.quem)verdict={cls:'bad',t:'El relé actuó pero el contacto 15–18 está quemado y no conduce: la carga no se conecta.'};
  else if(o.ar>.7)verdict={cls:'ok',t:aux?'Relé auxiliar energizado: todos sus contactos cambiaron al instante.':'Se cumplió el tiempo: el capacitor llegó al umbral y el relé cambió sus contactos.'};
  else verdict={cls:'warn',t:'Temporizando: el capacitor se carga a través del potenciómetro. Todavía no pasó el tiempo ajustado'+(f.pot?' (con el potenciómetro sucio el tiempo real varía).':'.')};
  return{reads,verdict}},
 pasos:[
  {t:'Sin tensión',coil:false,ini(o){o.vc=0;o.te=0;o.ar=0;o.hist=[]},p:{modo:'tempo',T:6,vel:'5'},hl:['cap','contactos'],vista:'interior',x:'Sin alimentación el <b>capacitor está descargado</b> y el <b>relé de salida en reposo</b>: el contacto 15–16 está cerrado y el 15–18 abierto.'},
  {t:'Se aplica tensión',coil:true,p:{modo:'tempo',T:6,vel:'5'},hl:['led','bornes'],x:'Al llegar 220 V a <b>A1–A2</b> se enciende el LED U. Empieza a contarse el tiempo, pero los <b>contactos todavía no cambian</b>: esa es la diferencia con un contactor común.'},
  {t:'El capacitor se carga',coil:true,p:{modo:'tempo',T:6,vel:'5'},hl:['pot','cap'],x:'La corriente llega al <b>capacitor</b> a través del <b>potenciómetro</b>. Al principio se carga rápido y después cada vez más lento (curva exponencial). Con mayor resistencia, la carga es más lenta y el retardo más largo.'},
  {t:'Se alcanza el umbral',coil:true,p:{modo:'tempo',T:6,vel:'5'},hl:['comp'],x:'Cuando la tensión del capacitor llega al <b>80 %</b>, el <b>comparador</b> detecta que superó su referencia y activa el transistor que alimenta la bobina del relé de salida.'},
  {t:'Cambian los contactos',coil:true,p:{modo:'tempo',T:6,vel:'5'},hl:['rele','contactos'],x:'El <b>relé de salida</b> se energiza y su contacto conmuta: el 15–16 se abre y el <b>15–18 se cierra</b>. Es el momento de conectar la siguiente etapa (por ejemplo el contactor de triángulo).'},
  {t:'Se quita la tensión',coil:false,p:{modo:'tempo',T:6,vel:'5'},hl:['cap','rele'],x:'Al cortar la alimentación el capacitor se descarga enseguida y el relé vuelve a reposo. El temporizador <b>queda listo</b> para empezar de nuevo.'}],
 usos:[
  {t:'Arranque estrella-triángulo',x:'El temporizador mantiene el motor en estrella unos segundos (corriente de arranque reducida) y luego conmuta a triángulo: su contacto 15–18 desenergiza el contactor de estrella y energiza el de triángulo.',sim:true},
  {t:'Secuencia de cintas transportadoras',x:'Para no sobrecargar la red ni acumular material, se arrancan en cascada: cada cinta se energiza unos segundos después de la anterior con un relé de tiempo.',sim:true},
  {t:'Prelubricación de una máquina',x:'Una bomba de aceite arranca primero; el temporizador autoriza el arranque del motor principal tras unos segundos para que haya presión de lubricación.'},
  {t:'Relé auxiliar para multiplicar contactos',x:'Una sola señal (por ejemplo del PLC a 24 V) comanda un relé auxiliar de 4 contactos libres de potencial para maniobrar varios circuitos, incluso con distinta tensión.',sim:true}],
 ejercicios:[
  {q:'Un relé de tiempo a la conexión, ¿cuándo cambia sus contactos?',o:['Apenas se le aplica tensión','Después del tiempo ajustado desde que se le aplica tensión','Cuando se le quita la tensión'],ok:1,why:'Retardo a la conexión: la demora empieza al aplicar tensión y termina con el cambio de contactos.',ver:{vista:'interior',coil:true}},
  {q:'¿Qué componente determina cuánto dura el retardo en este temporizador?',o:['El potenciómetro junto con el capacitor (constante RC)','La bobina del relé','El riel DIN'],ok:0,why:'La constante de tiempo es R·C: más resistencia (o más capacidad), más lento se carga y más largo el retardo.'},
  {q:'Se quita la tensión en medio de la temporización. ¿Qué pasa?',o:['Sigue contando','Se reinicia: el capacitor se descarga','Se cambian los contactos'],ok:1,why:'Al quitar la alimentación el capacitor se descarga y la cuenta vuelve a cero.'},
  {q:'El retardo real es más corto que el ajustado. ¿Qué falla es probable?',o:['Capacitor degradado','Contacto quemado','Tornillo flojo'],ok:0,why:'Un capacitor que perdió capacidad se carga más rápido y el tiempo se acorta.',ver:{vista:'interior',coil:true,f:['cap']}},
  {q:'¿Para qué sirve un relé auxiliar?',o:['Para dar retardo','Para multiplicar contactos y separar circuitos','Para proteger contra sobrecarga'],ok:1,why:'Con una sola bobina entrega varios contactos NA y NC libres de potencial.',ver:{vista:'interior',coil:true,p:{modo:'aux'}}},
  {q:'En estrella-triángulo, ¿qué hace el temporizador?',o:['Protege el motor del cortocircuito','Cambia de estrella a triángulo después de un tiempo','Invierte el giro'],ok:1,why:'Su contacto retardado desconecta la estrella y conecta el triángulo cuando el motor ya tomó velocidad.'}],
 defs(){return DEFS},
 dibujar(view,o,c,ui){const e=this.est(o,c),S={o,c,ui,e,inter:view==='interior'};
  if(view==='lateral')return lat(S);if(view==='superior')return sup(S);if(view==='trasera')return tra(S);return fro(S)},
 simbolo(o,c,ui){return iec({o,c,ui,e:this.est(o,c)})}
});
function C(def){def.est=def.est.bind(def);window.COMPONENTES.temporizador=def}
const LA=S=>S.inter?.07:1-S.ui.T,has=(S,k)=>S.ui.capas.has(k);
const led=(x,y,on,col)=>`<circle cx="${x}" cy="${y}" r="9" fill="${on?col:'#2b3744'}" stroke="#000" stroke-width="1.5"/>${on?glow(x,y,16,col,.7):''}`;

function fro(S){const{o,c,e,inter}=S,a=LA(S),aux=e.aux,PX=[390,490,590];
 let s=`<rect x="290" y="90" width="420" height="410" fill="var(--cav)" opacity="${inter?.9:.4}"/>`;
 /* placa y componentes (versión simplificada frontal) */
 s+=g(S,'pcb','pcb',`<rect x="310" y="110" width="380" height="370" rx="6" fill="url(#cPcb)" stroke="#073a22" stroke-width="2"/>`);
 s+=g(S,'cap','cap',`<rect x="440" y="170" width="46" height="90" rx="8" fill="#1c3f7a" stroke="#0a1b3a"/><rect x="444" y="${170+90*(1-o.vc)}" width="38" height="${90*o.vc}" rx="6" fill="#58b8e8" opacity=".85"/>`);
 s+=g(S,'rele','rele',`<rect x="520" y="300" width="130" height="120" rx="6" fill="#e9eef3" stroke="#555"/><rect x="540" y="330" width="40" height="60" fill="url(#pWind)"/><rect x="590" y="${340-o.ar*0}" width="40" height="10" fill="url(#cCuV)" transform="rotate(${-14+o.ar*14} 590 345)"/>`);
 /* carcasa y frente */
 let car=`<rect x="290" y="80" width="420" height="430" rx="14" fill="url(#cPl)" stroke="#0b0e11" stroke-width="2" opacity="${a}"/><rect x="290" y="80" width="420" height="430" rx="14" fill="url(#cPlH)" opacity="${a}"/><rect x="290" y="80" width="420" height="430" rx="14" fill="url(#pRib)" opacity="${.4*a}"/>`;
 if(inter)car=`<rect x="290" y="80" width="420" height="430" rx="14" fill="none" stroke="#8fa1b4" stroke-width="3" stroke-dasharray="10 6"/>`;
 s+=g(S,'carcasa','carcasa',car);
 const ik=cl((c.p.T-1)/29,0,1),rot=-120+ik*240;
 let tp=`<rect x="306" y="104" width="388" height="244" rx="12" fill="url(#cPlL)" stroke="#0b0e11" stroke-width="2" opacity="${a}"/>`;
 if(!aux){tp+=`<g opacity="${a}"><circle cx="440" cy="228" r="78" fill="#e9eef3" stroke="#222" stroke-width="2"/>`;for(let i=0;i<=10;i++){const th=(-120+i*24)*Math.PI/180;tp+=`<path d="M${440+Math.sin(th)*62} ${228-Math.cos(th)*62}L${440+Math.sin(th)*74} ${228-Math.cos(th)*74}" stroke="#111" stroke-width="2.4"/>`}
  tp+=`<circle cx="440" cy="228" r="46" fill="url(#cKnob)" stroke="#000"/><g transform="rotate(${rot} 440 228)"><path d="M440 228V190" stroke="#ffd65a" stroke-width="5" stroke-linecap="round"/></g><text x="440" y="334" text-anchor="middle" style="font:700 13px system-ui;fill:#f0f4f8">t = ${fm(c.p.T,0)} s</text></g>`;
  tp+=`<text x="570" y="150" style="font:700 12px system-ui;fill:#f0f4f8" opacity="${a}">Rango</text><rect x="560" y="158" width="100" height="26" rx="6" fill="#161b21" stroke="#000" opacity="${a}"/><text x="610" y="177" text-anchor="middle" style="font:800 13px system-ui;fill:#ffd65a" opacity="${a}">1 – 30 s</text>`}
 else tp+=`<text x="500" y="226" text-anchor="middle" style="font:800 22px system-ui;fill:#f0f4f8" opacity="${a}">RELÉ AUXILIAR</text><text x="500" y="254" text-anchor="middle" style="font:600 14px system-ui;fill:#cfd8e3" opacity="${a}">4 contactos · 2NA + 2NC</text>`;
 tp+=`<g opacity="${a}">${led(590,300,c.coil,'#5ce0a0')}${led(640,300,o.ar>.7,'#ffd65a')}<text x="590" y="332" text-anchor="middle" style="font:800 12px system-ui;fill:#f0f4f8">U</text><text x="640" y="332" text-anchor="middle" style="font:800 12px system-ui;fill:#f0f4f8">R</text></g>`;
 tp+=`<rect x="330" y="368" width="340" height="100" rx="6" fill="#e9eef3" opacity="${a}"/><text x="500" y="400" text-anchor="middle" style="font:800 17px system-ui;fill:#10202e" opacity="${a}">${aux?'RELÉ AUXILIAR 220 V CA':'RELÉ DE TIEMPO A LA CONEXIÓN'}</text><text x="500" y="424" text-anchor="middle" style="font:600 13px system-ui;fill:#10202e" opacity="${a}">${aux?'Contactos 13-14 · 23-24 · 31-32 · 41-42':'Contacto conmutado 15-16-18 · 5 A'}</text><text x="500" y="446" text-anchor="middle" style="font:600 12px system-ui;fill:#10202e" opacity="${a}">Alimentación A1–A2: 220 V CA · IEC 60947-5-1</text>`;
 s+=g(S,'tapa','tapa',tp);
 let bi='',bo='';PX.forEach((x,i)=>{bi+=`<rect x="${x-32}" y="62" width="64" height="20" rx="3" fill="url(#cMe)" stroke="#3a4450"/>${screw(x,54,10,20+i*30)}`;bo+=`<rect x="${x-32}" y="508" width="64" height="20" rx="3" fill="url(#cMe)" stroke="#3a4450"/>${screw(x,534,10,50+i*20)}`});
 s+=g(S,'bornes','bornes',bi.split('<rect x="'+(PX[2]-32))[0]+bo);
 if(has(S,'bornes'))s+=tag(PX[0],36,'A1','s')+tag(PX[1],36,'A2','s')+(aux?['13','23','31'].map((q,i)=>tag(PX[i],556,q,'s')).join(''):['15','16','18'].map((q,i)=>tag(PX[i],556,q,'s')).join(''));
 if(has(S,'etiq'))s+=lbl(270,200,'Capacitor','l',460,220)+lbl(730,360,'Relé de salida','r',640,360);
 return s+title(inter?'Interior (sin tapa)':'Vista frontal')}

function lat(S){const{o,c,e}=S,a=LA(S);
 let s=`<rect x="330" y="110" width="340" height="380" fill="var(--cav)" opacity=".5"/>`;
 s+=g(S,'pcb','pcb',`<rect x="560" y="120" width="14" height="360" fill="url(#cPcb)" stroke="#073a22"/>`);
 s+=g(S,'cap','cap',`<rect x="470" y="160" width="80" height="46" rx="8" fill="#1c3f7a" stroke="#0a1b3a"/><rect x="470" y="${160}" width="${80*o.vc}" height="46" rx="8" fill="#58b8e8" opacity=".85"/>`);
 s+=g(S,'rele','rele',`<rect x="440" y="300" width="110" height="120" rx="6" fill="#e9eef3" stroke="#555"/>`);
 s+=g(S,'carcasa','carcasa',`<rect x="310" y="92" width="380" height="418" rx="16" fill="url(#cPl)" stroke="#0b0e11" stroke-width="2" opacity="${a}"/><rect x="310" y="92" width="380" height="418" rx="16" fill="url(#cPlH)" opacity="${a}"/><rect x="250" y="240" width="60" height="100" fill="url(#cMe)" stroke="#3a4450" opacity="${Math.max(.3,a)}"/>`);
 s+=g(S,'tapa','tapa',`<path d="M650 92h24a16 16 0 0 1 16 16V494a16 16 0 0 1-16 16h-24Z" fill="url(#cPlL)" stroke="#0b0e11" stroke-width="2" opacity="${a}"/>`);
 return s+`<text x="280" y="360" text-anchor="middle" class="lab s">Riel DIN</text>`+title('Vista lateral')}
function sup(S){const a=LA(S),PX=[390,490,590];let s=`<rect x="284" y="140" width="432" height="280" fill="var(--cav)" opacity=".4"/>`;
 s+=g(S,'carcasa','carcasa',`<rect x="290" y="130" width="420" height="300" rx="14" fill="url(#cPl)" stroke="#0b0e11" stroke-width="2" opacity="${a}"/><rect x="290" y="130" width="420" height="300" rx="14" fill="url(#cPlH)" opacity="${a}"/><rect x="290" y="130" width="420" height="300" rx="14" fill="url(#pRib)" opacity="${.4*a}"/>`);
 s+=g(S,'tapa','tapa',`<rect x="290" y="360" width="420" height="70" rx="12" fill="url(#cPlL)" stroke="#0b0e11" stroke-width="2" opacity="${a}"/>`);
 let bn='';PX.slice(0,2).forEach((x,i)=>{bn+=`<rect x="${x-34}" y="152" width="68" height="76" rx="5" fill="url(#cMe)" stroke="#3a4450"/><rect x="${x-24}" y="204" width="48" height="12" rx="3" fill="#10161d"/>${screw(x,178,18,i*25)}`});
 s+=g(S,'bornes','bornes',bn)+tag(PX[0],140,'A1','s')+tag(PX[1],140,'A2','s')+tag(500,462,'↓ frente ↓','s');
 return s+title('Vista superior')}
function tra(S){const a=LA(S);let s=g(S,'carcasa','carcasa',`<rect x="290" y="80" width="420" height="430" rx="14" fill="url(#cPl)" stroke="#0b0e11" stroke-width="2" opacity="${a}"/><rect x="290" y="80" width="420" height="430" rx="14" fill="url(#cPlH)" opacity="${a}"/>`);
 s+=g(S,'tapa','tapa',`<rect x="290" y="262" width="420" height="52" fill="#0b0e11" opacity="${.65*a}"/><rect x="440" y="470" width="120" height="38" rx="5" fill="url(#cMe)" stroke="#3a4450" opacity="${a}"/><rect x="490" y="482" width="20" height="8" rx="3" fill="#2c3540" opacity="${a}"/>`);
 return s+tag(500,254,'Canal para riel DIN de 35 mm','s')+title('Vista trasera')}

/* ====== interior: placa electrónica con gráfico ====== */
const origFro=fro;
function interior(S){const{o,c,e}=S,aux=e.aux;let s='';
 s+=`<rect x="290" y="76" width="420" height="300" rx="6" fill="url(#cPcb)" stroke="#073a22" stroke-width="2"/>`;
 /* trazas */
 s+=`<g fill="none" stroke="#d6b04a" stroke-width="3.2" opacity=".8"><path d="M330 100V150H370M430 190H452M498 190H540M590 190V250M376 250H590M376 250V300M590 250V300"/></g>`;
 s=g(S,'pcb','pcb',s);
 /* bornes A1 A2 */
 s+=g(S,'bornes','bornes',`<rect x="312" y="90" width="44" height="22" rx="3" fill="url(#cMe)" stroke="#3a4450"/>${screw(334,101,8,10)}<rect x="372" y="90" width="44" height="22" rx="3" fill="url(#cMe)" stroke="#3a4450"/>${screw(394,101,8,50)}`);
 s+=tag(334,86,'A1','s')+tag(394,86,'A2','s');
 /* potenciómetro */
 const ik=cl((c.p.T-1)/29,0,1);
 s+=g(S,'cap','pot',`<circle cx="372" cy="190" r="34" fill="#12161b" stroke="#000" stroke-width="2"/><circle cx="372" cy="190" r="26" fill="url(#cKnob)" stroke="#000"/><g transform="rotate(${-120+ik*240} 372 190)"><path d="M372 190V168" stroke="#ffd65a" stroke-width="4" stroke-linecap="round"/></g>`);
 /* capacitor */
 s+=g(S,'cap','cap',`<rect x="452" y="130" width="46" height="100" rx="10" fill="#1c3f7a" stroke="#0a1b3a" stroke-width="2"/><rect x="456" y="${130+(100-4)*(1-o.vc)+2}" width="38" height="${(100-4)*o.vc}" rx="7" fill="#58b8e8" opacity=".9"/><rect x="452" y="130" width="46" height="100" rx="10" fill="url(#cMeV)" opacity=".12"/><text x="475" y="${246}" text-anchor="middle" style="font:700 11px system-ui;fill:#fff">${Math.round(o.vc*100)} %</text>`);
 if(c.coil&&o.vc<TH)s+=`<path class="flowd" d="M394 112V160H372V190M410 190H452M476 130V112H500" pointer-events="none"/>`;
 /* comparador */
 let ic=`<rect x="540" y="150" width="86" height="64" rx="4" fill="#15191f" stroke="#000"/>`;for(let i=0;i<4;i++)ic+=`<rect x="${548+i*20}" y="140" width="8" height="12" fill="#c9d1d9"/><rect x="${548+i*20}" y="212" width="8" height="12" fill="#c9d1d9"/>`;
 ic+=`<text x="583" y="188" text-anchor="middle" style="font:800 12px system-ui;fill:#cfd8e3">COMP</text><text x="583" y="204" text-anchor="middle" style="font:600 10px system-ui;fill:#9fb0c3">Vc &gt; 80 %</text>`+led(655,182,o.ar>.2&&c.coil,'#ffd65a');
 s+=g(S,'cap','comp',ic);
 /* relé de salida */
 const ar=o.ar;
 let rl=`<rect x="436" y="268" width="240" height="100" rx="6" fill="#e9eef3" stroke="#555" opacity=".95"/><rect x="450" y="288" width="78" height="62" rx="3" fill="url(#cBob)" stroke="#6b5a2c"/><rect x="456" y="294" width="66" height="50" rx="2" fill="url(#pWind)" stroke="#4a2410"/><rect x="490" y="278" width="8" height="12" fill="url(#pLam)"/>`;
 if(c.coil&&ar>.1)rl+=glow(489,320,26,'#ff7a45',.3*ar);
 rl+=`<g transform="rotate(${-14*(1-ar)} 540 296)"><rect x="534" y="290" width="${aux?132:112}" height="8" rx="3" fill="url(#pLam)" stroke="#27303b"/></g>`;
 s+=g(S,'rele','rele',rl);
 /* contactos conmutados */
 const cx=600;let ct=`<circle cx="${cx}" cy="338" r="5" fill="url(#cAg)"/><circle cx="${cx+34}" cy="318" r="5" fill="url(#cAg)"/><circle cx="${cx+34}" cy="358" r="5" fill="url(#cAg)"/>`;
 const ty=338+(ar<.5?-20:20)*Math.min(1,Math.abs(ar-.5)*2+0.0)*0;
 const tipY=318+ar*40;
 ct+=`<path d="M${cx} 338L${cx+28} ${tipY}" stroke="${e.noCond?'#ff8a3a':'#c8703d'}" stroke-width="5" stroke-linecap="round"/>`;
 if(e.noCond)ct+=`<path class="flowd" d="M${cx} 338L${cx+34} 358" pointer-events="none"/>`;if(e.nc)ct+=`<path class="flowd" d="M${cx} 338L${cx+34} 318" pointer-events="none"/>`;
 ct+=`<text x="${cx-10}" y="332" class="lab s" style="text-anchor:end">15</text><text x="${cx+46}" y="316" class="lab s">16</text><text x="${cx+46}" y="364" class="lab s">18</text>`;
 s+=g(S,'contactos','contactos',ct);
 /* LED indicadores */
 s+=g(S,'tapa','led',led(330,350,c.coil,'#5ce0a0')+led(330,320,o.ar>.7,'#ffd65a')+`<text x="352" y="354" class="lab s">U</text><text x="352" y="324" class="lab s">R</text>`);
 /* gráfico */
 const gx=300,gy=396,gw=400,gh=110;
 s+=`<rect x="${gx-8}" y="${gy-10}" width="${gw+16}" height="${gh+34}" rx="8" fill="var(--cav)" stroke="#8fa1b4" stroke-opacity=".5"/>`;
 s+=`<path d="M${gx} ${gy}V${gy+gh}H${gx+gw}" stroke="var(--ink)" stroke-width="2" fill="none"/>`;
 const Tt=e.aux?.02:c.p.T*(c.f.cap?.55:1),xmax=Math.max(10,c.p.T*1.5);
 const yTh=gy+gh*(1-TH);
 s+=`<path d="M${gx} ${yTh}H${gx+gw}" stroke="#ffd65a" stroke-width="2" stroke-dasharray="7 5"/><text x="${gx+gw-4}" y="${yTh-6}" class="lab s" style="text-anchor:end;fill:#ffd65a">umbral 80 %</text>`;
 let pts=o.hist.filter(p=>p[0]<=xmax).map(p=>`${(gx+p[0]/xmax*gw).toFixed(1)},${(gy+gh*(1-p[1])).toFixed(1)}`);
 if(pts.length>1)s+=`<path d="M${pts.join('L')}" fill="none" stroke="#58b8e8" stroke-width="3.4" stroke-linejoin="round"/>`;
 if(c.coil)s+=`<circle cx="${(gx+Math.min(1,o.te/xmax)*gw).toFixed(1)}" cy="${(gy+gh*(1-o.vc)).toFixed(1)}" r="5" fill="#fff" stroke="#58b8e8" stroke-width="2"/>`;
 s+=`<text x="${gx+4}" y="${gy+gh+18}" class="lab s">0 s</text><text x="${gx+gw}" y="${gy+gh+18}" class="lab s" style="text-anchor:end">${fm(xmax,0)} s · tensión del capacitor</text>`;
 if(has(S,'etiq'))s+=lbl(268,190,'Potenciómetro','l',350,190)+lbl(268,130,'Capacitor','l',452,150)+lbl(732,180,'Comparador','r',626,182)+lbl(732,330,'Relé de salida','r',676,320)+lbl(732,240,'Placa electrónica','r',700,230);
 return s+title('Interior: placa del relé de tiempo')}
const _d=window.COMPONENTES.temporizador.dibujar;
window.COMPONENTES.temporizador.dibujar=function(view,o,c,ui){if(view==='interior'){const e=this.est(o,c),S={o,c,ui,e,inter:true};
  return interior(S)+g(S,'carcasa','carcasa',`<rect x="290" y="70" width="420" height="440" rx="14" fill="none" stroke="#8fa1b4" stroke-width="3" stroke-dasharray="10 6"/>`)}return _d.call(this,view,o,c,ui)};

function iec(S){const{o,c,e}=S,aux=e.aux,R='#b5733e',N='#58b8e8',off='#566678',on=c.coil;
 let s=`<text x="500" y="26" class="lab c t">Símbolos IEC · ${aux?'relé auxiliar':'relé de tiempo a la conexión'} (KT1)</text><path d="M120 80H880" stroke="${R}" stroke-width="5"/><text x="100" y="86" class="lab r">F</text><path d="M120 510H880" stroke="${N}" stroke-width="5"/><text x="100" y="516" class="lab r">N</text>`;
 s+=`<g data-act="toggle"><rect x="190" y="100" width="110" height="120" fill="transparent"/><path d="M245 80V130" stroke="${R}" stroke-width="5"/><circle cx="245" cy="130" r="4.5" fill="var(--ink)"/><circle cx="245" cy="190" r="4.5" fill="var(--ink)"/><path d="M245 190L${on?245:222} 134" stroke="var(--ink)" stroke-width="5" stroke-linecap="round"/><text x="268" y="160" class="lab">S1</text><text x="268" y="180" class="lab s">(tocá)</text></g><path d="M245 190V280" stroke="${on?R:off}" stroke-width="5"/>`;
 s+=`<rect x="215" y="280" width="60" height="70" fill="${on?'#5a3a14':'none'}" stroke="var(--ink)" stroke-width="4"/><text x="245" y="320" class="lab c">KT1</text>${aux?'':`<path d="M222 296l16 0l-8 14l8 14h-16l8-14Z" fill="none" stroke="var(--ink)" stroke-width="2.4"/>`}<text x="230" y="276" class="lab s" style="text-anchor:end">A1</text><text x="230" y="368" class="lab s" style="text-anchor:end">A2</text><path d="M245 350V510" stroke="${on?N:off}" stroke-width="5"/>`;
 if(on)s+=`<path class="flowd" d="M245 80V280M245 350V510"/>`;
 s+=`<path d="M290 316H395V200" stroke="var(--ink)" stroke-width="3" stroke-dasharray="9 7" fill="none" opacity=".8"/><path d="M395 235H640" stroke="var(--ink)" stroke-width="3" stroke-dasharray="9 7" fill="none" opacity=".8"/>`;
 /* NA 15-18 */
 s+=`<path d="M480 80V150" stroke="${R}" stroke-width="5"/><circle cx="480" cy="150" r="4.5" fill="var(--ink)"/><circle cx="480" cy="230" r="4.5" fill="var(--ink)"/><path d="M480 230L${e.no?480:458} 154" stroke="var(--ink)" stroke-width="5" stroke-linecap="round"/>${aux?'':`<path d="M458 194a22 22 0 0 1 44 0" fill="none" stroke="var(--ink)" stroke-width="3.4"/><path d="M493 188l9 6l-3 -10Z" fill="var(--ink)"/>`}<text x="496" y="146" class="lab s">${aux?'13':'15'}</text><text x="496" y="248" class="lab s">${aux?'14':'18'}</text><path d="M480 230V340" stroke="${e.noCond?R:off}" stroke-width="5"/>`;
 s+=`<circle cx="480" cy="372" r="28" fill="${e.noCond?'#2f8f5a':'none'}" stroke="var(--ink)" stroke-width="4"/><path d="M460 352L500 392M500 352L460 392" stroke="var(--ink)" stroke-width="4"/><text x="522" y="378" class="lab">H1</text><path d="M480 400V510" stroke="${e.noCond?N:off}" stroke-width="5"/><text x="480" y="118" class="lab c s">NA ${aux?'':'retardado'}</text>`;
 if(e.noCond)s+=`<path class="flowd" d="M480 80V344M480 400V510"/>`;
 /* NC 15-16 */
 s+=`<path d="M640 80V150" stroke="${R}" stroke-width="5"/><circle cx="640" cy="150" r="4.5" fill="var(--ink)"/><circle cx="640" cy="230" r="4.5" fill="var(--ink)"/><path d="M640 230L${e.nc?640:618} 154" stroke="var(--ink)" stroke-width="5" stroke-linecap="round"/><path d="M626 154H654" stroke="var(--ink)" stroke-width="3"/>${aux?'':`<path d="M618 194a22 22 0 0 1 44 0" fill="none" stroke="var(--ink)" stroke-width="3.4"/><path d="M653 188l9 6l-3 -10Z" fill="var(--ink)"/>`}<text x="656" y="146" class="lab s">${aux?'31':'15'}</text><text x="656" y="248" class="lab s">${aux?'32':'16'}</text><path d="M640 230V340" stroke="${e.nc?R:off}" stroke-width="5"/>`;
 s+=`<circle cx="640" cy="372" r="28" fill="${e.nc?'#c0392b':'none'}" stroke="var(--ink)" stroke-width="4"/><path d="M620 352L660 392M660 352L620 392" stroke="var(--ink)" stroke-width="4"/><text x="682" y="378" class="lab">H2</text><path d="M640 400V510" stroke="${e.nc?N:off}" stroke-width="5"/><text x="640" y="118" class="lab c s">NC ${aux?'':'retardado'}</text>`;
 if(e.nc)s+=`<path class="flowd" d="M640 80V344M640 400V510"/>`;
 s+=`<text x="${aux?500:520}" y="545" class="lab c s">${aux?'Relé auxiliar: todos los contactos cambian al instante.':'El arco sobre el contacto indica retardo en la conexión: cambia unos segundos después de energizar la bobina.'}</text>`;
 return s}
})();
