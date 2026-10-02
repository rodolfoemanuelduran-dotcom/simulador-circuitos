/* Componente "Contactor" para componente.html.
   Contrato: titulo, intro, vistas, capas, fallas, partes, pasos, usos, ejercicios,
   init(), paso(o,dt,ctrl,t) -> eventos de sonido, lecturas(o,ctrl), defs(),
   dibujar(vista,o,ctrl,ui), simbolo(o,ctrl,ui). Dimensiones en unidades SVG (1000x560). */
(function(){
const D=38,G=30; /* D: recorrido total de la armadura; G: recorrido hasta que el puente toca los contactos fijos */
const cl=(v,a,b)=>Math.max(a,Math.min(b,v));
const rnd=(i)=>{const x=Math.sin(i*12.9898)*43758.5453;return x-Math.floor(x)};

const PARTES={
 bobina:{t:'Bobina',d:'Muchas vueltas de alambre de cobre esmaltado sobre un carretel. Al aplicar tensión en A1–A2 circula corriente y se crea un campo magnético en el núcleo. Es el “músculo” del contactor.'},
 nucleo:{t:'Núcleo fijo (chapas de hierro)',d:'Hierro en forma de E formado por chapas aisladas entre sí (para reducir las corrientes parásitas). Conduce el flujo magnético que genera la bobina.'},
 armadura:{t:'Armadura (parte móvil del electroimán)',d:'Pieza de hierro laminado que el campo magnético atrae contra el núcleo fijo. Arrastra al portacontactos y a todos los contactos.'},
 espira:{t:'Espira de sombra',d:'Anillo de cobre en la cara del núcleo. En corriente alterna el campo pasa por cero 100 veces por segundo; la espira mantiene un flujo desfasado que evita que la armadura vibre y “zumbe”.'},
 vastago:{t:'Portacontactos (vástago)',d:'Pieza de plástico que une la armadura con los puentes de contacto. Mueve todos los polos a la vez.'},
 puente:{t:'Puente de contacto móvil',d:'Barra de cobre con dos contactos de plata. Al bajar, une el contacto fijo de entrada con el de salida y deja pasar la corriente de la carga (motor).'},
 fijo:{t:'Contactos fijos',d:'Placas de cobre con pastilla de plata, conectadas a los bornes. La plata resiste el arco eléctrico mejor que el cobre.'},
 resorte_ret:{t:'Resorte de retorno',d:'Empuja la armadura hacia arriba y mantiene el contactor abierto cuando no hay tensión en la bobina. Si falla, el contactor puede quedar “pegado”.'},
 resorte_pres:{t:'Resorte de presión de contacto',d:'Aprieta el puente contra los contactos fijos. La “sobrecarrera” que se comprime después de tocar asegura buen contacto aunque la plata se desgaste.'},
 entrehierro:{t:'Entrehierro',d:'Espacio de aire entre la armadura y el núcleo. Con la bobina sin tensión es de unos 7 mm. Al cerrar desaparece: por eso la corriente de la bobina baja mucho una vez cerrado.'},
 aux_na:{t:'Contacto auxiliar NA (13–14)',d:'Normalmente abierto: se cierra cuando el contactor se energiza. Se usa para señalizar (lámpara de marcha) o para la retención (enclavamiento).'},
 aux_nc:{t:'Contacto auxiliar NC (21–22)',d:'Normalmente cerrado: se abre cuando el contactor se energiza. Se usa para señalizar parada o para enclavar contra otro contactor.'},
 term1:{t:'Bornes de potencia 1/L1 · 3/L2 · 5/L3',d:'Entradas de la red al contactor. Reciben los conductores de las tres fases (o de fase y neutro en monofásico).'},
 term2:{t:'Bornes de potencia 2/T1 · 4/T2 · 6/T3',d:'Salidas hacia la carga (motor). Tienen tensión sólo cuando los contactos principales están cerrados.'},
 A1A2:{t:'Bornes de bobina A1 – A2',d:'Aquí se conecta la tensión de mando (por ejemplo 220 V CA). Es el circuito de mando: poca corriente, comanda al circuito de potencia.'},
 carcasa:{t:'Carcasa',d:'Cuerpo de plástico aislante y resistente al calor. Aísla las partes con tensión y las protege del polvo. Tiene ranuras de ventilación.'},
 tapa:{t:'Tapa frontal',d:'Cubre los mecanismos y lleva la chapa con los datos: corriente (AC-3), tensión de bobina, normas. Tiene una ventana de accionamiento manual.'},
 din:{t:'Riel DIN de 35 mm',d:'Perfil metálico estándar donde se monta el contactor a presión con una traba de resorte, sin tornillos.'},
 ventana:{t:'Indicador / accionamiento manual',d:'Permite ver si el contactor está cerrado y, empujando con un destornillador, cerrarlo a mano para probar el circuito (con cuidado: las cargas arrancan).'}
};

C({
 titulo:'El contactor',
 intro:'Interruptor accionado a distancia por un electroimán. Con una corriente pequeña en la bobina (A1–A2) se conectan y desconectan cargas grandes, como un motor, a través de los contactos principales.',
 vistaIni:'frontal',
 vistas:[{id:'frontal',t:'Frontal'},{id:'lateral',t:'Lateral'},{id:'superior',t:'Superior'},{id:'trasera',t:'Trasera'},{id:'interior',t:'Interior'}],
 capas:[{id:'carcasa',t:'Carcasa'},{id:'tapa',t:'Tapa frontal'},{id:'bornes',t:'Bornes y tornillos'},{id:'bobina',t:'Bobina'},{id:'nucleo',t:'Núcleo y armadura'},{id:'contactos',t:'Contactos y portacontactos'},{id:'resortes',t:'Resortes'},{id:'aux',t:'Bloque auxiliar NA/NC'},{id:'etiq',t:'Nombres de las piezas'}],
 btnOn:'⚡ Energizar la bobina (A1–A2)',btnOff:'⏻ Cortar la tensión de la bobina',
 fallas:[
  {id:'abierta',t:'Bobina abierta (cortada)',d:'Se cortó el hilo: hay tensión pero no circula corriente.'},
  {id:'baja',t:'Tensión de bobina muy baja',d:'Por ejemplo, una bobina de 220 V alimentada con 100 V.'},
  {id:'quem',t:'Contactos quemados',d:'La plata se picó por los arcos: ya no conducen bien.'},
  {id:'peg',t:'Contactos pegados (soldados)',d:'Un arco los soldó: no se abren al cortar la bobina.'}],
 fallaVista:{abierta:'interior',baja:'interior',quem:'interior',peg:'interior'},
 partes:PARTES,
 init(){return{d:0,v:0,pegado:false,spark:0,prevTouch:false,prevD:0,vib:0}},
 paso(o,dt,c,t){const ev=[],f=c.f;if(dt<=0)return ev;
  const mag=c.coil&&!f.abierta;let target;
  if(c.hold!==null&&c.hold!==undefined)target=c.hold;else if(!mag)target=0;else if(f.baja)target=D*.26+Math.sin(t*95)*D*.1;else target=D;
  const K=f.baja&&c.hold==null?3600:950,Cd=2*Math.sqrt(K)*(f.baja?.3:.62);
  const n=Math.max(1,Math.ceil(dt/.003)),h=dt/n;
  for(let i=0;i<n;i++){o.v+=(K*(target-o.d)-Cd*o.v)*h;o.d+=o.v*h;
   if(o.d>D){if(o.v>45&&!o.hitD)ev.push('clack');o.hitD=true;o.d=D;o.v=-o.v*.28}else if(o.d<D-1)o.hitD=false;
   if(o.d<0){if(-o.v>40&&!o.hit0)ev.push('tac');o.hit0=true;o.d=0;o.v=-o.v*.25}else if(o.d>1)o.hit0=false}
  if(f.peg&&o.d>=G-.01)o.pegado=true;if(!f.peg)o.pegado=false;
  const by=o.pegado?G:Math.min(o.d,G),touch=by>=G-.01;
  if(touch!==o.prevTouch){const live=!f.quem;if(!touch&&live){o.spark=.28;ev.push('spark')}if(touch&&(f.quem||f.baja)){o.spark=.14;ev.push('spark')}o.prevTouch=touch}
  if(o.spark>0)o.spark-=dt;
  return ev},
 est(o,c){const f=c.f,by=o.pegado?G:Math.min(o.d,G),touch=by>=G-.01;return{by,touch,conduce:touch&&!f.quem,na:o.d>=28,nc:o.d<4}},
 lecturas(o,c){const e=this.est(o,c),f=c.f,fm=(n,k)=>Number(n).toFixed(k).replace('.',','),mag=c.coil&&!f.abierta,cerrado=o.d>=D-.5;
  let I=!c.coil?'0 A':f.abierta?'0 A (abierta)':cerrado?'0,04 A':'0,32 A (arranque)';
  const reads=[{l:'TENSIÓN EN A1–A2',v:c.coil?(f.baja?'100 V (baja)':'220 V'):'0 V',on:c.coil},{l:'CORRIENTE DE BOBINA',v:I,on:c.coil&&!f.abierta},
   {l:'RECORRIDO DE ARMADURA',v:fm(o.d/D*7,1)+' mm',on:o.d>.5},{l:'CONTACTOS PRINCIPALES',v:e.touch?'cerrados':'abiertos',on:e.touch},
   {l:'AUXILIAR NA 13–14',v:e.na?'cerrado':'abierto',on:e.na},{l:'AUXILIAR NC 21–22',v:e.nc?'cerrado':'abierto',on:e.nc},
   {l:'MOTOR (2/T1…6/T3)',v:e.conduce?'con tensión 380 V':'sin tensión',on:e.conduce},{l:'RETENIDO POR',v:cerrado&&mag?'electroimán':o.pegado&&!mag?'contactos soldados':o.d<.5?'resortes':'—',on:null}];
  let verdict;
  if(f.peg&&o.pegado&&!mag&&e.touch)verdict={cls:'bad',t:'Contactos soldados: el motor sigue alimentado aunque la bobina no tenga tensión. ¡Peligroso! Hay que reemplazar los contactos.'};
  else if(f.abierta&&c.coil)verdict={cls:'bad',t:'Hay tensión en A1–A2 pero la bobina está cortada: no circula corriente, no hay campo y el contactor no cierra.'};
  else if(f.baja&&c.coil)verdict={cls:'warn',t:'Con tensión baja el campo no alcanza para vencer a los resortes: la armadura vibra, zumba y los contactos chisporrotean sin cerrar bien. La bobina se calienta.'};
  else if(f.quem&&e.touch)verdict={cls:'bad',t:'Contactos cerrados pero quemados: la resistencia de contacto es alta, no pasa la corriente y se calientan. Hay que cambiarlos.'};
  else if(e.conduce)verdict={cls:'ok',t:'Contactor cerrado: la corriente pasa por 1→2, 3→4, 5→6 y alimenta la carga.'};
  else verdict={cls:'ok',t:'Contactor en reposo: los resortes mantienen los contactos principales abiertos. La carga no tiene tensión.'};
  return{reads,verdict}},
 pasos:[
  {t:'Reposo',coil:false,hold:0,vista:'interior',hl:['resorte_ret','entrehierro'],x:'Sin tensión en la bobina no hay campo magnético. Los <b>resortes de retorno</b> empujan la armadura hacia arriba y se forma el <b>entrehierro</b>. Los contactos principales están <b>abiertos</b>: el motor no recibe tensión. El contacto auxiliar NC está cerrado y el NA abierto.'},
  {t:'Se aplica tensión a A1–A2',coil:true,hold:0,hl:['A1A2','bobina'],x:'Se cierra el circuito de mando y circula corriente por la <b>bobina</b> (en el dibujo ⊗ entra y ⊙ sale). Todavía la armadura no se movió: el campo recién aparece.'},
  {t:'Nace el campo magnético',coil:true,hold:0,hl:['nucleo','bobina'],x:'La corriente en la bobina magnetiza el <b>núcleo de hierro</b>. Las líneas de campo (en violeta) se cierran por el núcleo, atraviesan el entrehierro y vuelven por la armadura.'},
  {t:'La armadura es atraída',coil:true,hold:24,hl:['armadura','resorte_ret','vastago'],x:'La fuerza magnética vence a los resortes de retorno: la <b>armadura baja</b> arrastrando el portacontactos. Los resortes de retorno se comprimen y los puentes se acercan a los contactos fijos.'},
  {t:'Cierran los contactos principales',coil:true,hold:D,hl:['puente','fijo','resorte_pres'],x:'Los <b>puentes</b> tocan los contactos fijos y la armadura sigue unos milímetros más (<b>sobrecarrera</b>), comprimiendo el <b>resorte de presión</b>. Ahora la corriente pasa de 1 a 2, de 3 a 4 y de 5 a 6: el motor arranca.'},
  {t:'Cambian los auxiliares',coil:true,hold:D,hl:['aux_na','aux_nc'],x:'El <b>NA (13–14) se cierra</b> y el <b>NC (21–22) se abre</b>. Se usan para señalizar y para la retención o el enclavamiento. Con el contactor cerrado el entrehierro desapareció y la corriente de la bobina baja a un valor pequeño.'},
  {t:'Se corta la tensión',coil:false,hold:0,hl:['resorte_ret','puente'],x:'Al quitar la tensión desaparece el campo. Los <b>resortes</b> devuelven la armadura a su lugar y los contactos se abren. Al separarse con corriente aparece un <b>arco eléctrico</b> (chispa) que se apaga rápido gracias al diseño de los contactos.'}],
 usos:[
  {t:'Arranque de un motor trifásico',x:'Un motor de 1,5 kW a 380 V consume unos 3,6 A (I = P ÷ (√3 · U · cosφ · η)). Un pulsador de 220 V y 0,3 A comanda la bobina y el contactor conecta los 3,6 A (y los picos de arranque) a las tres fases. Se elige un contactor de 9 A en AC-3.',sim:true},
  {t:'Iluminación de un playón o un cartel',x:'Con una fotocélula o un reloj, un solo contactor enciende decenas de reflectores. El comando es chico y la carga, grande. En AC-1 (cargas resistivas) soporta más corriente que en AC-3.',sim:true},
  {t:'Bomba de agua con tanque',x:'El flotante o el presostato maneja la bobina del contactor y éste arranca la bomba. Si falta agua se abre el flotante, se cae la bobina y la bomba se detiene: comando automático.',sim:true},
  {t:'Calefacción o termotanque eléctrico',x:'Resistencias de varios kilowatts se conectan con un contactor comandado por un termostato de bajo costo. Los contactos están pensados para miles de maniobras.',sim:true}],
 ejercicios:[
  {q:'Se aplican 220 V a los bornes A1–A2. ¿Qué pasa con el contacto auxiliar NC 21–22?',o:['Se cierra','Se abre','No cambia'],ok:1,why:'El NC está cerrado en reposo; al energizar la bobina se abre. El NA hace lo contrario.',ver:{vista:'interior',coil:true}},
  {q:'¿Cuáles son los bornes de los contactos principales?',o:['A1 y A2','1-2, 3-4 y 5-6','13-14 y 21-22'],ok:1,why:'Los principales son 1-2, 3-4 y 5-6 (potencia). A1–A2 es la bobina y 13-14 / 21-22 son los auxiliares.'},
  {q:'Una bobina de 220 V se conecta por error a 100 V. ¿Qué ocurre?',o:['Cierra normalmente','Zumba y vibra sin cerrar bien','Se quema por exceso de tensión'],ok:1,why:'El campo es muy débil y no vence a los resortes: la armadura vibra, los contactos chisporrotean y se pueden soldar o quemar.',ver:{vista:'interior',coil:true,f:['baja']}},
  {q:'¿Para qué sirve la espira de sombra?',o:['Para aumentar la corriente','Para evitar la vibración en corriente alterna','Para apagar el arco'],ok:1,why:'Como el campo de la corriente alterna pasa por cero 100 veces por segundo, la espira mantiene un flujo desfasado y la armadura no zumba.'},
  {q:'Cortaste la bobina pero el motor sigue girando. ¿Qué falla es probable?',o:['Bobina abierta','Contactos principales soldados','Tensión baja'],ok:1,why:'Si los contactos se sueldan, los resortes no logran abrirlos y la carga queda alimentada aunque no haya tensión en la bobina.',ver:{vista:'interior',coil:true,f:['peg']}},
  {q:'Se energiza la bobina pero no se oye ningún “clac” y no pasa nada. ¿Qué mirarías primero?',o:['Si la bobina está abierta o no le llega tensión','Los contactos auxiliares','El riel DIN'],ok:0,why:'Sin corriente en la bobina no hay campo. Medí tensión en A1–A2; si hay tensión y no cierra, la bobina está cortada.',ver:{vista:'interior',coil:true,f:['abierta']}}],

 defs(){return`<defs>
<linearGradient id="cPl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#454c55"/><stop offset=".08" stop-color="#2d3238"/><stop offset=".9" stop-color="#1b1f24"/><stop offset="1" stop-color="#101317"/></linearGradient>
<linearGradient id="cPlH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".25" stop-color="#fff" stop-opacity=".02"/><stop offset=".8" stop-color="#000" stop-opacity=".1"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient>
<linearGradient id="cPlL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a828c"/><stop offset=".1" stop-color="#5b636d"/><stop offset="1" stop-color="#383e46"/></linearGradient>
<linearGradient id="cMe" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8a95a2"/><stop offset=".3" stop-color="#f4f7fa"/><stop offset=".6" stop-color="#b5bec8"/><stop offset="1" stop-color="#6e7a87"/></linearGradient>
<linearGradient id="cMeV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f7fa"/><stop offset=".5" stop-color="#a8b3bf"/><stop offset="1" stop-color="#6b7683"/></linearGradient>
<linearGradient id="cCu" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#a8582c"/><stop offset=".35" stop-color="#f2a770"/><stop offset=".7" stop-color="#c8703d"/><stop offset="1" stop-color="#8d4421"/></linearGradient>
<linearGradient id="cCuV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2a770"/><stop offset=".5" stop-color="#c8703d"/><stop offset="1" stop-color="#8d4421"/></linearGradient>
<linearGradient id="cCuH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d1451f"/><stop offset=".4" stop-color="#ffb066"/><stop offset=".7" stop-color="#ee6a2a"/><stop offset="1" stop-color="#b52e12"/></linearGradient>
<linearGradient id="cAg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#aab4bf"/></linearGradient>
<linearGradient id="cFe" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9aa6b5"/><stop offset=".5" stop-color="#6d7988"/><stop offset="1" stop-color="#4c5766"/></linearGradient>
<linearGradient id="cBob" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f1e5c4"/><stop offset="1" stop-color="#b8a574"/></linearGradient>
<linearGradient id="cGlass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset=".4" stop-color="#fff" stop-opacity=".08"/><stop offset="1" stop-color="#fff" stop-opacity=".02"/></linearGradient>
<pattern id="pWind" width="5" height="5" patternUnits="userSpaceOnUse"><rect width="5" height="5" fill="#c8703d"/><path d="M0 2.5H5" stroke="#6b3317" stroke-width="1.3"/><path d="M0 1H5" stroke="#f6b684" stroke-opacity=".55" stroke-width=".8"/></pattern>
<pattern id="pLam" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="4" fill="#8794a3"/><path d="M0 .5H4" stroke="#2f3946" stroke-opacity=".65" stroke-width=".9"/></pattern>
<pattern id="pLamV" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="4" fill="#8794a3"/><path d="M.5 0V4" stroke="#2f3946" stroke-opacity=".65" stroke-width=".9"/></pattern>
<pattern id="pCut" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="#39424d"/><path d="M0 0V8" stroke="#8fa1b4" stroke-width="2.2"/></pattern>
<pattern id="pRib" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="none"/><path d="M0 13H14" stroke="#000" stroke-opacity=".25" stroke-width="2"/><path d="M0 12H14" stroke="#fff" stroke-opacity=".06" stroke-width="1"/></pattern>
<filter id="fsh" x="-20%" y="-20%" width="140%" height="150%"><feGaussianBlur stdDeviation="6"/></filter>
<filter id="fgl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter>
</defs>`},

 dibujar(view,o,c,ui){const e=this.est(o,c);const S={o,c,ui,e,d:o.d,by:e.by};
  if(view==='lateral'||view==='interior')return lat(S,view==='interior');
  if(view==='frontal')return fro(S,false);if(view==='trasera')return fro(S,true);return sup(S)},
 simbolo(o,c,ui){return iec({o,c,ui,e:this.est(o,c),d:o.d})}
});

function C(def){def.est=def.est.bind(def);window.COMPONENTES.contactor=def}

/* ====================== ayudas de dibujo ====================== */
const has=(S,k)=>S.ui.capas.has(k);
function g(S,layer,part,body,extra){if(layer&&!has(S,layer))return'';const on=S.ui.hl.has(part)||S.ui.sel===part;return`<g data-p="${part}"${on?' class="hl"':''}${extra||''}>${body}</g>`}
function spring(x,y1,y2,w,n,col){const L=y2-y1;if(L<2)return'';const pts=[],m=n*10;for(let i=0;i<=m;i++){const k=i/m,ph=k*n*2*Math.PI,xx=x+Math.sin(ph)*w/2;pts.push(`${xx.toFixed(1)},${(y1+L*k).toFixed(1)}`)}
 const p='M'+pts.join('L');return`<path d="${p}" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="5.5" stroke-linecap="round" transform="translate(2 2)"/><path d="${p}" fill="none" stroke="${col||'#aeb9c5'}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="${p}" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1.2" stroke-linecap="round" transform="translate(-.8 -.8)"/>`}
function screw(x,y,r,rot){return`<g transform="translate(${x} ${y}) rotate(${rot||0})"><circle r="${r}" fill="url(#cMeV)" stroke="#3a4450" stroke-width="1.4"/><circle r="${r*.78}" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1"/><path d="M${-r*.62} 0H${r*.62}M0 ${-r*.62}V${r*.62}" stroke="#2c3540" stroke-width="${Math.max(2,r*.22)}" stroke-linecap="round"/></g>`}
function glow(cx,cy,r,col,op){return`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${col}" opacity="${op}" filter="url(#fgl)"/>`}
function sparks(cx,cy,t,k){let s='';const n=9;for(let i=0;i<n;i++){const a=rnd(i+k*7+Math.floor(t*40))*6.283,l=8+rnd(i*3+Math.floor(t*40))*20;s+=`<path d="M${cx} ${cy}l${(Math.cos(a)*l).toFixed(1)} ${(Math.sin(a)*l).toFixed(1)}" stroke="${i%2?'#fff3b0':'#ffb347'}" stroke-width="2.4" stroke-linecap="round"/>`}return glow(cx,cy,16,'#ffd65a',.9)+s}
function lbl(x,y,tx,side,ax,ay){const anc=side==='l'?'end':'start',xe=side==='l'?x+6:x-6;return`<g pointer-events="none"><path d="M${xe} ${y-4}L${ax} ${ay}" stroke="#ffd65a" stroke-width="1.6" fill="none"/><circle cx="${ax}" cy="${ay}" r="3.4" fill="#ffd65a" stroke="#000" stroke-opacity=".5"/><text x="${x}" y="${y}" class="lab s" text-anchor="${anc}" style="paint-order:stroke;stroke:var(--stg2);stroke-width:4px">${tx}</text></g>`}
function tag(x,y,tx,cls){return`<text x="${x}" y="${y}" class="lab c ${cls||''}" pointer-events="none" style="paint-order:stroke;stroke:var(--stg2);stroke-width:4px">${tx}</text>`}
const LA=(S)=>1-S.ui.T;

/* ====================== VISTA LATERAL / INTERIOR ====================== */
function lat(S,inter){const{o,c,e,d,by}=S,f=c.f,t=S.ui.t,mag=c.coil&&!f.abierta,flux=mag?(f.baja?.4:1):0;
 const armY=330+d,plateY=110+d,bridgeY=150+by,live=e.conduce;
 const naY=54+cl(d-8,0,20),ncY=50+cl(d-4,0,20);
 let s='';
 /* cavidad */
 s+=`<rect x="284" y="100" width="432" height="408" fill="var(--cav)" opacity="${inter?.9:.55}"/>`;
 /* --- contactos: barras, pads, portacontactos, puente --- */
 let con='';
 const cu=live?'url(#cCuH)':'url(#cCu)';
 con+=`<rect x="335" y="92" width="20" height="130" fill="${cu}" stroke="#4a2410" stroke-opacity=".6"/><rect x="335" y="204" width="115" height="18" fill="${cu}" stroke="#4a2410" stroke-opacity=".6"/>`;
 con+=`<rect x="680" y="204" width="20" height="288" fill="${cu}" stroke="#4a2410" stroke-opacity=".6"/><rect x="550" y="204" width="150" height="18" fill="${cu}" stroke="#4a2410" stroke-opacity=".6"/>`;
 const ag=f.quem?'#2a211d':'url(#cAg)';
 const face=(x,y,w,h,flip)=>{let r=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${ag}" stroke="#222" stroke-opacity=".5"/>`;if(f.quem){for(let i=0;i<5;i++)r+=`<circle cx="${x+4+rnd(i+(flip?9:1))*(w-8)}" cy="${y+h/2+(rnd(i+3)-.5)*2}" r="${1.6+rnd(i+5)*2}" fill="#0d0907"/>`;r+=`<path d="M${x} ${y+h}l${w*.3} -2 ${w*.2} 2" stroke="#6b4a1f" stroke-width="1.4" fill="none"/>`}return r};
 con+=face(392,200,36,4,0)+face(572,200,36,4,1);
 /* vástago y placa */
 con+=`<rect x="488" y="${plateY+15}" width="24" height="${armY-plateY-15}" fill="url(#cPlL)" stroke="#111" stroke-opacity=".5"/><rect x="440" y="${plateY}" width="235" height="15" rx="3" fill="url(#cPlL)" stroke="#111" stroke-opacity=".6"/><rect x="598" y="${naY+6}" width="10" height="${Math.max(0,plateY-naY-6)}" fill="#8a929c" stroke="#111" stroke-opacity=".5"/><rect x="658" y="${ncY+6}" width="10" height="${Math.max(0,plateY-ncY-6)}" fill="#8a929c" stroke="#111" stroke-opacity=".5"/>`;
 s+=g(S,'contactos','fijo',con.split('<rect x="488"')[0]);
 s+=g(S,'contactos','vastago','<rect x="488"'+con.split('<rect x="488"')[1]);
 /* corriente de potencia */
 if(live&&has(S,'contactos'))s+=`<path d="M345 96V213H410V${bridgeY+8}H590V213H690V490" fill="none" stroke="#ffb066" stroke-opacity=".45" stroke-width="9" stroke-linejoin="round" filter="url(#fgl)" pointer-events="none"/><path class="flowd" d="M345 96V213H410V${bridgeY+8}H590V213H690V490" stroke-linejoin="round" pointer-events="none"/>`;
 /* núcleo fijo, armadura */
 let nuc=`<rect x="400" y="450" width="200" height="20" fill="url(#pLam)" stroke="#27303b"/><rect x="400" y="393" width="30" height="57" fill="url(#pLamV)" stroke="#27303b"/><rect x="570" y="393" width="30" height="57" fill="url(#pLamV)" stroke="#27303b"/><rect x="485" y="399" width="30" height="51" fill="url(#pLamV)" stroke="#27303b"/>`;
 s+=g(S,'nucleo','nucleo',nuc);
 s+=g(S,'nucleo','espira',`<rect x="404" y="393" width="22" height="5" fill="url(#cCuV)" stroke="#4a2410"/><rect x="574" y="393" width="22" height="5" fill="url(#cCuV)" stroke="#4a2410"/>`);
 s+=g(S,'nucleo','armadura',`<rect x="330" y="${armY}" width="340" height="25" rx="3" fill="url(#pLam)" stroke="#27303b" stroke-width="1.5"/><rect x="330" y="${armY}" width="340" height="25" rx="3" fill="url(#cFe)" opacity=".25"/>`);
 /* bobina */
 let bob=`<rect x="432" y="392" width="52" height="58" rx="3" fill="url(#cBob)" stroke="#6b5a2c"/><rect x="516" y="392" width="52" height="58" rx="3" fill="url(#cBob)" stroke="#6b5a2c"/><rect x="436" y="396" width="44" height="50" rx="2" fill="url(#pWind)" stroke="#4a2410"/><rect x="520" y="396" width="44" height="50" rx="2" fill="url(#pWind)" stroke="#4a2410"/>`;
 if(mag){const I=.5+.5*(f.baja?.5:1);bob+=glow(458,421,26,'#ff7a45',.35*I)+glow(542,421,26,'#ff7a45',.35*I)+`<g stroke="#fff" stroke-width="2.4" fill="#d83a2a"><circle cx="458" cy="421" r="9"/><path d="M452 415l12 12M464 415l-12 12" fill="none"/></g><g fill="#fff" stroke="#8a1f12" stroke-width="1.5"><circle cx="542" cy="421" r="9" fill="#d83a2a"/><circle cx="542" cy="421" r="3"/></g>`}
 if(f.abierta)bob+=`<path d="M436 421l9-9 9 18 9-18 9 9" fill="none" stroke="#ff3b3b" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><g class="pulse"><path d="M446 408l-8-6M460 408l6-8M452 434l-2 8" stroke="#ffe27a" stroke-width="2.5" stroke-linecap="round"/></g>`;
 s+=g(S,'bobina','bobina',bob);
 /* flujo */
 if(flux>.05&&(has(S,'nucleo')||has(S,'bobina'))){const col='#e056ff',op=.35+.55*flux;const lp=(x1,x2,off)=>`<path class="flux" d="M${500+off} 446V${armY+12+off*.6}H${x2}V446H${500+off}" stroke="${col}" stroke-width="${3.2}" stroke-opacity="${op}" pointer-events="none"/>`;s+=lp(500,415,0)+lp(500,585,0)+lp(500,425,-9)+lp(500,575,9)}
 /* resortes */
 let rs=g(S,'resortes','resorte_ret',spring(355,armY+25,440,34,8)+spring(645,armY+25,440,34,8)+`<rect x="330" y="440" width="50" height="16" fill="url(#cPl)" stroke="#000" stroke-opacity=".5"/><rect x="620" y="440" width="50" height="16" fill="url(#cPl)" stroke="#000" stroke-opacity=".5"/>`);
 rs+=g(S,'resortes','resorte_pres',spring(500,plateY+15,bridgeY,50,6,'#d8dee5'));
 s+=rs;
 /* puente móvil */
 if(has(S,'contactos')){const hot=live;let br=`<rect x="380" y="${bridgeY}" width="240" height="16" rx="3" fill="${hot?'url(#cCuH)':'url(#cCuV)'}" stroke="#4a2410" stroke-opacity=".7"/><rect x="380" y="${bridgeY}" width="240" height="5" rx="2" fill="#fff" opacity=".25"/>`;br+=face(392,bridgeY+16,36,4,2)+face(572,bridgeY+16,36,4,3);
  s+=g(S,'contactos','puente',br);
  if(o.pegado&&by>=G-.01)s+=`<g pointer-events="none" class="pulse">${glow(410,200,12,'#ffb347',.9)}${glow(590,200,12,'#ffb347',.9)}</g>`;
  if(o.spark>0)s+=`<g pointer-events="none">${sparks(410,198,t,1)}${sparks(590,198,t,2)}</g>`}
 /* entrehierro */
 if(has(S,'nucleo')&&D-d>3){s+=`<g data-p="entrehierro"${S.ui.hl.has('entrehierro')||S.ui.sel==='entrehierro'?' class="hl"':''}><rect x="500" y="${armY+25}" width="0.1" height="1" /><path d="M545 ${armY+25}V393M539 ${armY+31}l6 -6 6 6M539 387l6 6 6 -6" stroke="#7de3ff" stroke-width="2" fill="none"/><text x="556" y="${(armY+25+393)/2+5}" class="lab s" style="paint-order:stroke;stroke:var(--stg2);stroke-width:4px;fill:#7de3ff">${f2(d)}</text></g>`}
 /* auxiliares */
 let ax=`<rect x="560" y="38" width="68" height="54" rx="6" fill="url(#cPl)" stroke="#000" opacity="${LA(S)}"/><rect x="640" y="38" width="68" height="54" rx="6" fill="url(#cPl)" stroke="#000" opacity="${LA(S)}"/>`;
 const naC=e.na,ncC=e.nc;
 let ai=`<rect x="568" y="${naY}" width="52" height="6" fill="url(#cCuV)" stroke="#4a2410"/><circle cx="578" cy="83" r="4" fill="url(#cAg)"/><circle cx="610" cy="83" r="4" fill="url(#cAg)"/><rect x="648" y="${ncY}" width="52" height="6" fill="url(#cCuV)" stroke="#4a2410"/><circle cx="658" cy="48" r="4" fill="url(#cAg)"/><circle cx="690" cy="48" r="4" fill="url(#cAg)"/>`;
 s+=g(S,'aux','aux_na',`<rect x="560" y="38" width="68" height="54" rx="6" fill="var(--cav)" stroke="#000" stroke-opacity=".4"/>`+ai.split('<rect x="648"')[0]+`<circle cx="${naC?594:594}" cy="62" r="0"/>`+`<rect x="560" y="38" width="68" height="54" rx="6" fill="url(#cPl)" stroke="#000" opacity="${LA(S)}"/>`);
 s+=g(S,'aux','aux_nc',`<rect x="640" y="38" width="68" height="54" rx="6" fill="var(--cav)" stroke="#000" stroke-opacity=".4"/><rect x="648"`+ai.split('<rect x="648"')[1]+`<rect x="640" y="38" width="68" height="54" rx="6" fill="url(#cPl)" stroke="#000" opacity="${LA(S)}"/>`);
 if(has(S,'aux')){s+=tag(594,31,'NA 13-14','s')+tag(674,31,'NC 21-22','s');s+=`<circle cx="${594}" cy="64" r="5" fill="${naC?'#5ce0a0':'#33414f'}" stroke="#000" stroke-opacity=".5" opacity="${LA(S)}"/><circle cx="674" cy="64" r="5" fill="${ncC?'#5ce0a0':'#33414f'}" stroke="#000" stroke-opacity=".5" opacity="${LA(S)}"/>`}
 /* carcasa */
 let car='';
 if(inter){car=`<path fill-rule="evenodd" d="M270 92h460v416H270Z M284 100h432v400H284Z" fill="url(#pCut)" stroke="#0d1218" stroke-width="2"/>`}
 else{car=`<rect x="270" y="92" width="460" height="416" rx="16" fill="url(#cPl)" stroke="#0b0e11" stroke-width="2" opacity="${LA(S)}"/><rect x="270" y="92" width="460" height="416" rx="16" fill="url(#cPlH)" opacity="${LA(S)}"/>`+[0,1,2,3,4,5].map(i=>`<rect x="${300+i*40}" y="96" width="24" height="5" rx="2" fill="#000" opacity="${.5*LA(S)}"/>`).join('')+`<rect x="270" y="92" width="460" height="416" rx="16" fill="url(#pRib)" opacity="${.5*LA(S)}"/>`}
 /* riel DIN */
 car+=`<g opacity="${inter?1:Math.max(.25,LA(S))}"><rect x="226" y="200" width="16" height="140" fill="url(#cMe)" stroke="#3a4450"/><rect x="226" y="200" width="44" height="9" fill="url(#cMe)" stroke="#3a4450"/><rect x="226" y="331" width="44" height="9" fill="url(#cMe)" stroke="#3a4450"/><path d="M266 212V328" stroke="#000" stroke-opacity=".3" stroke-width="3"/><rect x="256" y="209" width="14" height="122" fill="url(#cPlL)" stroke="#111" opacity="${LA(S)}"/></g>`;
 s+=g(S,'carcasa','carcasa',car);
 /* tapa */
 let tp=inter?`<path d="M716 100h14v400h-14Z" fill="url(#pCut)" stroke="#0d1218" stroke-width="2"/>`:`<path d="M690 92h24a16 16 0 0 1 16 16V492a16 16 0 0 1-16 16h-24Z" fill="url(#cPlL)" stroke="#0b0e11" stroke-width="2" opacity="${LA(S)}"/><rect x="700" y="130" width="20" height="150" rx="3" fill="#e9eef3" opacity="${.85*LA(S)}"/><text transform="translate(715 270) rotate(-90)" font="700 11px system-ui" class="lab s" style="fill:#1a222b;font-size:10px">CONTACTOR 3P · AC-3 9 A · A1-A2 220 V CA</text>`;
 s+=g(S,'tapa','tapa',tp);
 /* bornes */
 let bn=`<rect x="316" y="62" width="82" height="32" rx="4" fill="url(#cMe)" stroke="#3a4450"/>${screw(357,52,12,40)}<rect x="318" y="76" width="78" height="10" fill="#000" opacity=".25"/>`;
 s+=g(S,'bornes','term1',bn);
 s+=g(S,'bornes','term2',`<rect x="640" y="478" width="82" height="32" rx="4" fill="url(#cMe)" stroke="#3a4450"/>${screw(681,520,12,10)}`);
 s+=g(S,'bornes','A1A2',`<rect x="238" y="372" width="34" height="26" rx="3" fill="url(#cMe)" stroke="#3a4450"/>${screw(248,385,8)}<rect x="238" y="462" width="34" height="26" rx="3" fill="url(#cMe)" stroke="#3a4450"/>${screw(248,475,8)}<path d="M272 385H436M272 475H560V446" fill="none" stroke="${c.coil?'#ff9a6a':'#c8703d'}" stroke-width="3" stroke-opacity=".7"/>`+tag(250,364,'A1','s')+tag(250,506,'A2','s'));
 if(has(S,'bornes')){s+=tag(357,35,'1/L1','t')+tag(681,555,'2/T1','t')}
 /* etiquetas */
 if(has(S,'etiq')){s+=lbl(255,140,'Puente móvil','l',380,bridgeY+8)+lbl(255,215,'Contacto fijo','l',410,203)+lbl(255,300,'Portacontactos','l',488,260)+lbl(255,342,'Armadura','l',335,armY+12)+lbl(255,420,'Resorte de retorno','l',353,400)
   +lbl(745,128,'Placa del portacontactos','r',640,plateY+7)+lbl(745,160,'Resorte de presión','r',523,bridgeY-18)+lbl(745,300,'Espira de sombra','r',585,395)+lbl(745,424,'Bobina','r',565,421)+lbl(745,462,'Núcleo fijo (chapas)','r',590,455)+lbl(745,498,'Barra de cobre','r',692,440)}
 return s+`<text x="24" y="26" class="lab t" pointer-events="none">${inter?'Corte lateral: así es por dentro':'Vista lateral'}</text>`}
const f2=d=>'entrehierro '+(((D-d)/D)*7).toFixed(1).replace('.',',')+' mm';

/* ====================== VISTA FRONTAL / TRASERA ====================== */
function fro(S,back){const{o,c,e,d,by}=S,f=c.f,t=S.ui.t,mag=c.coil&&!f.abierta,flux=mag?(f.baja?.4:1):0,live=e.conduce;
 const PX=[380,490,600],plateY=112+d,bridgeY=150+by,armY=300+d;
 let s='';
 s+=`<rect x="284" y="92" width="412" height="408" fill="var(--cav)" opacity=".4"/>`;
 let inner='';
 /* contactos */
 let con='';
 PX.forEach(x=>{con+=`<rect x="${x-7}" y="80" width="14" height="415" fill="${live?'url(#cCuH)':'url(#cCu)'}" stroke="#4a2410" stroke-opacity=".6"/>`});
 con+=`<rect x="326" y="${plateY}" width="328" height="15" rx="3" fill="url(#cPlL)" stroke="#111" stroke-opacity=".6"/><rect x="480" y="${plateY+15}" width="20" height="${armY-plateY-15}" fill="url(#cPlL)" stroke="#111" stroke-opacity=".5"/>`;
 let pads='',brs='';
 PX.forEach((x,i)=>{pads+=`<rect x="${x-45}" y="204" width="90" height="18" rx="2" fill="url(#cMe)" stroke="#3a4450"/><rect x="${x-34}" y="199" width="68" height="5" rx="2" fill="${f.quem?'#2a211d':'url(#cAg)'}" stroke="#222" stroke-opacity=".5"/>`;
  brs+=`<rect x="${x-44}" y="${bridgeY}" width="88" height="16" rx="3" fill="${live?'url(#cCuH)':'url(#cCuV)'}" stroke="#4a2410" stroke-opacity=".7"/><rect x="${x-34}" y="${bridgeY+16}" width="68" height="4" rx="2" fill="${f.quem?'#2a211d':'url(#cAg)'}" stroke="#222" stroke-opacity=".5"/>`});
 inner+=g(S,'contactos','fijo',con+pads);
 if(live&&has(S,'contactos'))inner+=PX.map(x=>`<path class="flowd" d="M${x} 82V495" pointer-events="none"/>`).join('');
 /* resortes */
 let rs='';PX.forEach(x=>{rs+=spring(x,plateY+15,bridgeY,26,5,'#d8dee5')});
 inner+=g(S,'resortes','resorte_pres',rs);
 inner+=g(S,'contactos','puente',brs);
 if(o.pegado&&by>=G-.01)inner+=PX.map(x=>glow(x,200,12,'#ffb347',.8)).join('');
 if(o.spark>0)inner+=PX.map((x,i)=>sparks(x,198,t,i+1)).join('');
 /* núcleo y armadura */
 inner+=g(S,'nucleo','nucleo',`<rect x="390" y="470" width="200" height="22" fill="url(#pLam)" stroke="#27303b"/><rect x="394" y="365" width="32" height="105" fill="url(#pLamV)" stroke="#27303b"/><rect x="554" y="365" width="32" height="105" fill="url(#pLamV)" stroke="#27303b"/>`);
 inner+=g(S,'nucleo','armadura',`<rect x="336" y="${armY}" width="308" height="25" rx="3" fill="url(#pLam)" stroke="#27303b" stroke-width="1.5"/>`);
 inner+=g(S,'resortes','resorte_ret',spring(352,armY+25,445,32,7)+spring(628,armY+25,445,32,7)+`<rect x="330" y="445" width="46" height="14" fill="url(#cPl)" stroke="#000" stroke-opacity=".5"/><rect x="604" y="445" width="46" height="14" fill="url(#cPl)" stroke="#000" stroke-opacity=".5"/>`);
 let bob=`<rect x="432" y="340" width="116" height="122" rx="8" fill="url(#cBob)" stroke="#6b5a2c"/><rect x="440" y="348" width="100" height="106" rx="6" fill="url(#pWind)" stroke="#4a2410"/><rect x="440" y="348" width="100" height="40" rx="6" fill="#fff" opacity=".12"/>`;
 if(mag)bob+=glow(490,400,50,'#ff7a45',.28*(f.baja?.6:1));
 if(f.abierta)bob+=`<path d="M440 400l16-14 16 28 16-28 16 28 16-28 16 14" fill="none" stroke="#ff3b3b" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
 inner+=g(S,'bobina','bobina',bob);
 if(flux>.05&&has(S,'nucleo'))inner+=`<path class="flux" d="M410 440V${armY+12}H570V440" stroke="#e056ff" stroke-width="3.2" stroke-opacity="${.3+.5*flux}" pointer-events="none"/>`;
 /* auxiliar (frontal) */
 if(has(S,'aux')){const led=(x,on)=>`<circle cx="${x}" cy="279" r="5" fill="${on?'#5ce0a0':'#33414f'}" stroke="#000" stroke-opacity=".5"/>`;
  inner+=g(S,'aux','aux_na',`<rect x="292" y="262" width="106" height="34" rx="5" fill="url(#cPlL)" stroke="#000" opacity="${LA(S)}"/>${led(384,e.na)}`);
  inner+=g(S,'aux','aux_nc',`<rect x="582" y="262" width="106" height="34" rx="5" fill="url(#cPlL)" stroke="#000" opacity="${LA(S)}"/>${led(674,e.nc)}`)}
 /* carcasa y tapa */
 let car=`<rect x="270" y="80" width="440" height="430" rx="14" fill="url(#cPl)" stroke="#0b0e11" stroke-width="2" opacity="${LA(S)}"/><rect x="270" y="80" width="440" height="430" rx="14" fill="url(#cPlH)" opacity="${LA(S)}"/><rect x="270" y="80" width="440" height="190" rx="14" fill="url(#pRib)" opacity="${.5*LA(S)}"/>`;
 [0,1,2].forEach(i=>{car+=`<rect x="${PX[i]-30}" y="86" width="60" height="6" rx="3" fill="#000" opacity="${.45*LA(S)}"/>`});
 let tp=`<rect x="284" y="262" width="412" height="238" rx="8" fill="url(#cPlL)" stroke="#0b0e11" stroke-width="2" opacity="${LA(S)}"/><rect x="284" y="262" width="412" height="238" rx="8" fill="url(#cPlH)" opacity="${LA(S)}"/>`;
 const tx=(y,sz,txt,w)=>`<text x="490" y="${y}" text-anchor="middle" style="font:${w||700} ${sz}px system-ui;fill:#f0f4f8" opacity="${LA(S)}">${txt}</text>`;
 tp+=`<rect x="330" y="316" width="320" height="108" rx="6" fill="#e9eef3" opacity="${LA(S)}"/>`+`<text x="490" y="344" text-anchor="middle" style="font:800 18px system-ui;fill:#10202e" opacity="${LA(S)}">CONTACTOR TRIPOLAR</text><text x="490" y="366" text-anchor="middle" style="font:600 13px system-ui;fill:#10202e" opacity="${LA(S)}">AC-3 · 9 A · 4 kW / 380 V</text><text x="490" y="386" text-anchor="middle" style="font:600 13px system-ui;fill:#10202e" opacity="${LA(S)}">Bobina A1–A2: 220 V CA 50 Hz</text><text x="490" y="406" text-anchor="middle" style="font:600 12px system-ui;fill:#10202e" opacity="${LA(S)}">Aux. 1NA + 1NC · IEC 60947-4-1</text>`;
 tp+=`<rect x="446" y="276" width="88" height="26" rx="5" fill="#161b21" stroke="#000" opacity="${LA(S)}"/><rect x="${e.touch?490:452}" y="279" width="38" height="20" rx="3" fill="${e.touch?'#e8542f':'#8b96a3'}" opacity="${LA(S)}"/><text x="${e.touch?509:471}" y="294" text-anchor="middle" style="font:800 13px system-ui;fill:#fff" opacity="${LA(S)}">${e.touch?'I':'O'}</text>`;
 if(back){car=`<rect x="270" y="80" width="440" height="430" rx="14" fill="url(#cPl)" stroke="#0b0e11" stroke-width="2" opacity="${LA(S)}"/><rect x="270" y="80" width="440" height="430" rx="14" fill="url(#cPlH)" opacity="${LA(S)}"/>`;
  tp=`<rect x="270" y="262" width="440" height="52" fill="#0b0e11" opacity="${.65*LA(S)}"/><rect x="270" y="262" width="440" height="52" fill="url(#pCut)" opacity="${.15*LA(S)}"/><rect x="270" y="262" width="440" height="6" fill="#000" opacity="${.5*LA(S)}"/><path d="M270 262V314M710 262V314" stroke="#000" stroke-width="2" opacity="${LA(S)}"/><rect x="420" y="470" width="140" height="38" rx="5" fill="url(#cMe)" stroke="#3a4450" opacity="${LA(S)}"/><rect x="474" y="482" width="32" height="8" rx="3" fill="#2c3540" opacity="${LA(S)}"/><text x="490" y="458" text-anchor="middle" class="lab s" style="paint-order:stroke;stroke:var(--stg2);stroke-width:4px">Traba del riel (se destraba con destornillador)</text><rect x="300" y="120" width="130" height="86" rx="5" fill="#e9eef3" opacity="${.9*LA(S)}"/><path d="M312 190V140M318 190V140M326 190V140M332 190V140M338 190V140M348 190V140M356 190V140M362 190V140M372 190V140M380 190V140M388 190V140M394 190V140M404 190V140M412 190V140" stroke="#10202e" stroke-width="2.4" opacity="${LA(S)}"/><text x="365" y="206" text-anchor="middle" style="font:700 10px system-ui;fill:#10202e" opacity="${LA(S)}">N.º DE SERIE 0000123456</text>`;
  inner=`<g transform="translate(980 0) scale(-1 1)">${inner}</g>`}
 s+=inner+g(S,'carcasa','carcasa',car);
 if(back){s+=g(S,'tapa','din',tp);s+=tag(490,250,'Canal para riel DIN de 35 mm','s')}
 else s+=g(S,'tapa','tapa',tp);
 /* bornes */
 let bn='';
 PX.forEach((x,i)=>{bn+=`<rect x="${x-32}" y="62" width="64" height="20" rx="3" fill="url(#cMe)" stroke="#3a4450"/>${screw(x,54,10,20+i*30)}`});
 let bn2='';PX.forEach((x,i)=>{bn2+=`<rect x="${x-32}" y="508" width="64" height="20" rx="3" fill="url(#cMe)" stroke="#3a4450"/>${screw(x,534,10,50+i*20)}`});
 const a1=`<rect x="660" y="62" width="36" height="20" rx="3" fill="url(#cMe)" stroke="#3a4450"/>${screw(678,54,9,15)}`,a2=`<rect x="660" y="508" width="36" height="20" rx="3" fill="url(#cMe)" stroke="#3a4450"/>${screw(678,534,9,70)}`;
 let top=g(S,'bornes','term1',bn),bot=g(S,'bornes','term2',bn2),ab=g(S,'bornes','A1A2',a1+a2);
 let lbs='';
 if(!back){if(has(S,'bornes'))lbs=['1/L1','3/L2','5/L3'].map((q,i)=>tag(PX[i],36,q,'s')).join('')+['2/T1','4/T2','6/T3'].map((q,i)=>tag(PX[i],556,q,'s')).join('')+tag(678,36,'A1','s')+tag(678,556,'A2','s');
  if(has(S,'aux'))lbs+=tag(345,256,'NA 13-14','s')+tag(635,256,'NC 21-22','s')}
 if(back){s+=`<g transform="translate(980 0) scale(-1 1)">${top}${bot}${ab}</g>`+tag(490,26,'Vista trasera (riel DIN)','t')}
 else s+=top+bot+ab+lbs+`<text x="24" y="26" class="lab t" pointer-events="none">Vista frontal</text>`;
 if(!back&&has(S,'etiq')){s+=lbl(255,140,'Puente móvil','l',446,bridgeY+8)+lbl(255,250,'Contacto fijo','l',360,213)+lbl(255,330,'Armadura','l',340,armY+12)+lbl(255,420,'Resorte de retorno','l',352,400)+lbl(745,140,'Placa portacontactos','r',640,plateY+7)+lbl(745,420,'Bobina','r',540,400)+lbl(745,466,'Núcleo','r',580,468)}
 return s}

/* ====================== VISTA SUPERIOR ====================== */
function sup(S){const{o,c,e,d,by}=S,f=c.f,mag=c.coil&&!f.abierta;
 const PX=[380,490,600];let s='';
 s+=`<rect x="284" y="140" width="412" height="280" fill="var(--cav)" opacity=".4"/>`;
 let inner='';
 let con='';PX.forEach(x=>{con+=`<rect x="${x-7}" y="205" width="14" height="150" fill="${e.conduce?'url(#cCuH)':'url(#cCu)'}" stroke="#4a2410" stroke-opacity=".6"/><rect x="${x-40}" y="${290+(by/G)*20}" width="80" height="22" rx="3" fill="url(#cCuV)" stroke="#4a2410"/>`});
 inner+=g(S,'contactos','puente',con);
 inner+=g(S,'resortes','resorte_ret',[330,650].map(x=>`<circle cx="${x}" cy="365" r="14" fill="none" stroke="#aeb9c5" stroke-width="4"/><circle cx="${x}" cy="365" r="7" fill="none" stroke="#aeb9c5" stroke-width="3"/>`).join(''));
 inner+=g(S,'nucleo','nucleo',`<rect x="380" y="320" width="220" height="90" rx="4" fill="url(#pLam)" stroke="#27303b"/>`);
 inner+=g(S,'bobina','bobina',`<rect x="428" y="332" width="124" height="66" rx="8" fill="url(#pWind)" stroke="#4a2410"/>`+(mag?glow(490,365,40,'#ff7a45',.3):''));
 let car=`<rect x="270" y="130" width="440" height="300" rx="14" fill="url(#cPl)" stroke="#0b0e11" stroke-width="2" opacity="${LA(S)}"/><rect x="270" y="130" width="440" height="300" rx="14" fill="url(#cPlH)" opacity="${LA(S)}"/><rect x="270" y="130" width="440" height="300" rx="14" fill="url(#pRib)" opacity="${.5*LA(S)}"/>`;
 let tp=`<rect x="270" y="360" width="440" height="70" rx="12" fill="url(#cPlL)" stroke="#0b0e11" stroke-width="2" opacity="${LA(S)}"/><text x="490" y="404" text-anchor="middle" style="font:800 15px system-ui;fill:#f0f4f8" opacity="${LA(S)}">FRENTE</text>`;
 s+=inner+g(S,'carcasa','carcasa',car)+g(S,'tapa','tapa',tp);
 let bn='';PX.forEach((x,i)=>{bn+=`<rect x="${x-34}" y="152" width="68" height="76" rx="5" fill="url(#cMe)" stroke="#3a4450"/><rect x="${x-24}" y="204" width="48" height="12" rx="3" fill="#10161d"/>${screw(x,178,18,i*25)}`});
 bn+=`<rect x="658" y="152" width="40" height="76" rx="5" fill="url(#cMe)" stroke="#3a4450"/><rect x="664" y="204" width="28" height="12" rx="3" fill="#10161d"/>${screw(678,178,12,10)}`;
 s+=g(S,'bornes','term1',bn);
 if(has(S,'bornes')){s+=['1/L1','3/L2','5/L3'].map((q,i)=>tag(PX[i],140,q,'s')).join('')+tag(678,140,'A1','s')+tag(290,152,'Entrada de cables ▼','s')}
 s+=`<g transform="translate(0 0)"><rect x="440" y="104" width="100" height="26" rx="4" fill="url(#cMe)" stroke="#3a4450" opacity="${LA(S)}"/></g>`+tag(490,98,'Traba del riel (parte trasera)','s')+tag(500,26,'Vista superior','t')+tag(490,462,'↓ frente del contactor ↓','s');
 if(has(S,'etiq')){s+=lbl(255,300,'Puente móvil','l',340,300)+lbl(255,365,'Resorte de retorno','l',320,365)+lbl(745,350,'Bobina','r',552,365)+lbl(745,400,'Núcleo','r',600,400)}
 return s}

/* ====================== SÍMBOLO IEC ====================== */
function iec(S){const{o,c,e,d}=S,f=c.f,live=e.conduce;
 const R='#b5733e',Sc='#9aa5b1',Tc='#ee5a4d',N='#58b8e8',off='#566678';
 let s='';
 s+=`<text x="290" y="56" class="lab c t">Circuito de potencia</text><text x="790" y="56" class="lab c t">Circuito de mando</text>`;
 const X=[170,290,410],cols=[R,Sc,Tc],nm=['R / L1','S / L2','T / L3'];
 X.forEach((x,i)=>{
  s+=`<text x="${x}" y="78" class="lab c">${nm[i]}</text><path d="M${x} 90V200" stroke="${cols[i]}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  s+=`<text x="${x-14}" y="212" class="lab r s">${1+i*2}</text><text x="${x-14}" y="292" class="lab r s">${2+i*2}</text><circle cx="${x}" cy="200" r="4.5" fill="var(--ink)"/><circle cx="${x}" cy="280" r="4.5" fill="var(--ink)"/>`;
  const ang=(1-S.e.touch*1)*0+ (e.touch?0:cl(1-S.d/G,0,1)*26);const bx=x-ang*.9,by=205+ (e.touch?0:0);
  s+=`<path d="M${x} 280L${x-(e.touch?0:ang)} 206" stroke="var(--ink)" stroke-width="5" stroke-linecap="round" fill="none"/>`;
  s+=`<path d="M${x} 280V400" stroke="${live?cols[i]:off}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  if(live)s+=`<path class="flowd" d="M${x} 90V400" stroke="#fff" opacity=".85"/>`});
 /* motor */
 s+=`<circle cx="290" cy="450" r="44" fill="none" stroke="var(--ink)" stroke-width="4"/><text x="290" y="445" class="lab c t">M</text><text x="290" y="468" class="lab c">3 ~</text>`;
 ['M170 400V450H246','M290 400V406','M410 400V450H334'].forEach((p,i)=>{s+=`<path d="${p}" stroke="${live?cols[i]:off}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`});
 if(live)s+=`<g transform="rotate(${(S.ui.t*400)%360} 290 450)" opacity=".7"><path d="M290 412A38 38 0 0 1 328 450" stroke="#ffd65a" stroke-width="5" fill="none"/></g>`;
 s+=`<text x="${170-12}" y="418" class="lab r s">T1</text><text x="${290+12}" y="398" class="lab s">T2</text><text x="${410+12}" y="418" class="lab s">T3</text>`;
 /* eslabón mecánico */
 const ym=cl(230-(e.touch?0:0),0,999);
 s+=`<path d="M470 242H700" stroke="var(--ink)" stroke-width="3" stroke-dasharray="9 7" fill="none" opacity=".8"/><path d="M110 242H470" stroke="var(--ink)" stroke-width="3" stroke-dasharray="9 7" fill="none" opacity=".8"/>`;
 /* mando */
 s+=`<path d="M700 80H900" stroke="${R}" stroke-width="5"/><text x="680" y="86" class="lab r">F</text><path d="M700 510H900" stroke="${N}" stroke-width="5"/><text x="680" y="516" class="lab r">N</text>`;
 /* S1 */
 const on=c.coil;
 s+=`<g data-act="toggle"><rect x="672" y="110" width="110" height="130" fill="transparent"/><path d="M735 80V130" stroke="${R}" stroke-width="5"/><circle cx="735" cy="130" r="4.5" fill="var(--ink)"/><circle cx="735" cy="190" r="4.5" fill="var(--ink)"/><path d="M735 190L${on?735:712} 134" stroke="var(--ink)" stroke-width="5" stroke-linecap="round"/><path d="M735 190V300" stroke="${on?R:off}" stroke-width="5"/><text x="760" y="165" class="lab">S1</text><text x="760" y="184" class="lab s">(tocá)</text>${on?'':''}</g>`;
 /* bobina */
 s+=`<rect x="705" y="300" width="60" height="64" fill="${on&&!f.abierta?'#5a3a14':'none'}" stroke="var(--ink)" stroke-width="4" rx="2"/><text x="735" y="338" class="lab c">K1</text><text x="718" y="296" class="lab r s" style="text-anchor:end">A1</text><text x="718" y="384" class="lab r s" style="text-anchor:end">A2</text><path d="M735 364V510" stroke="${on&&!f.abierta?N:off}" stroke-width="5"/>`;
 s+=`<path d="M705 332H690V242" stroke="var(--ink)" stroke-width="3" stroke-dasharray="9 7" fill="none" opacity=".8"/>`;
 if(on&&!f.abierta)s+=`<path class="flowd" d="M735 90V300M735 364V510"/>`;
 /* auxiliares */
 const na=e.na,nc=e.nc;
 s+=`<path d="M810 80V150" stroke="${R}" stroke-width="5"/><circle cx="810" cy="150" r="4.5" fill="var(--ink)"/><circle cx="810" cy="214" r="4.5" fill="var(--ink)"/><path d="M810 214L${na?810:788} 154" stroke="var(--ink)" stroke-width="5" stroke-linecap="round"/><text x="824" y="158" class="lab s">13</text><text x="824" y="224" class="lab s">14</text><path d="M810 214V330" stroke="${na?R:off}" stroke-width="5"/>`;
 s+=`<circle cx="810" cy="372" r="28" fill="${na?'#2f8f5a':'none'}" stroke="var(--ink)" stroke-width="4"/><path d="M790 352L830 392M830 352L790 392" stroke="var(--ink)" stroke-width="4"/><text x="850" y="378" class="lab">H1</text><path d="M810 400V510" stroke="${na?N:off}" stroke-width="5"/>`;
 s+=`<path d="M810 330V344" stroke="${na?R:off}" stroke-width="5"/>`;
 s+=`<path d="M880 80V150" stroke="${R}" stroke-width="5"/><circle cx="880" cy="150" r="4.5" fill="var(--ink)"/><circle cx="880" cy="214" r="4.5" fill="var(--ink)"/><path d="M880 214L${nc?880:858} 154" stroke="var(--ink)" stroke-width="5" stroke-linecap="round"/><path d="M866 154H894" stroke="var(--ink)" stroke-width="3"/><text x="894" y="168" class="lab s">21</text><text x="894" y="226" class="lab s">22</text><path d="M880 214V330" stroke="${nc?R:off}" stroke-width="5"/>`;
 s+=`<circle cx="880" cy="372" r="28" fill="${nc?'#c0392b':'none'}" stroke="var(--ink)" stroke-width="4"/><path d="M860 352L900 392M900 352L860 392" stroke="var(--ink)" stroke-width="4"/><text x="930" y="378" class="lab">H2</text><path d="M880 400V510" stroke="${nc?N:off}" stroke-width="5"/>`;
 s+=`<path d="M765 332H770V196H858M770 196V332" fill="none" stroke="var(--ink)" stroke-width="3" stroke-dasharray="9 7" opacity=".8"/>`;
 s+=`<text x="810" y="112" class="lab c s">NA</text><text x="880" y="112" class="lab c s">NC</text>`;
 s+=`<text x="330" y="535" class="lab c s">La línea punteada indica que todos los contactos se mueven con la bobina K1.</text>`;
 s+=`<text x="500" y="24" class="lab c t">Símbolos IEC · tocá S1 para energizar la bobina K1</text>`;
 return s}
})();
