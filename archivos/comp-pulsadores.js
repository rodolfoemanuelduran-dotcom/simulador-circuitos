/* Componente "Pulsadores y selectoras" (módulo de mando). Usa comp-comun.js. */
(function(){
const{cl,fm,g,screw,glow,lbl,tag,title,sparks,DEFS}=window.CPH;
const TIPOS={
 verde:{n:'Pulsador de marcha (verde, NA)',head:'cGreen',letter:'I',mant:false},
 rojo:{n:'Pulsador de parada (rojo, NC)',head:'cRed',letter:'O',mant:false},
 hongo:{n:'Parada de emergencia (hongo con enclavamiento)',head:'cRed',letter:'',mant:true},
 sel:{n:'Selectora de 2 posiciones (MAN / AUT)',head:'cKnob',letter:'',mant:true}};
const PARTES={
 cabeza:{t:'Cabeza (pulsador)',d:'La parte que se toca. Su color indica la función: verde para marcha, rojo para parada, amarillo para ciclos o retorno. Hay cabezas al ras, salientes, con hongo o con perilla.'},
 aro:{t:'Aro de fijación (bisel)',d:'Se rosca contra el panel y deja el pulsador fijo en un agujero de 22 mm, que es la medida estándar.'},
 vastago:{t:'Vástago y empujador',d:'Transmite el movimiento de la cabeza a los contactos. Al presionar, empuja la placa de los dos bloques de contactos.'},
 resorte:{t:'Resorte de retorno',d:'Devuelve la cabeza a su posición cuando se suelta. En los pulsadores con enclavamiento (hongo o selectora) hay además una traba mecánica.'},
 traba:{t:'Traba de enclavamiento',d:'En la parada de emergencia mantiene el hongo hundido hasta que se lo gira (o se tira de él): así no se puede reanudar la marcha sin un acto voluntario.'},
 nc:{t:'Contacto NC (21–22)',d:'Normalmente cerrado: conduce en reposo y se abre al presionar. Se usa para PARADA, porque si un cable se corta el circuito se abre y la máquina también se detiene (seguridad positiva).'},
 na:{t:'Contacto NA (13–14)',d:'Normalmente abierto: se cierra al presionar. Se usa para MARCHA.'},
 bloque:{t:'Bloque de contactos',d:'Cartucho enchufable de plástico con un contacto NA y/o NC. Se puede apilar uno tras otro detrás del mismo pulsador para tener varios contactos.'},
 panel:{t:'Panel / tapa del tablero',d:'La chapa donde se montan los comandos. Del lado de atrás queda el cableado.'},
 bornes:{t:'Bornes',d:'13–14 corresponden al contacto NA y 21–22 al NC. Se aprietan con tornillo.'}
};
C({
 titulo:'Pulsadores y selectoras',
 intro:'Son los comandos manuales del circuito de mando: tiene un botón que se acciona con la mano, un resorte y uno o más bloques de contactos NA (normalmente abierto) y NC (normalmente cerrado). Elegí el tipo en “Operar”.',
 vistaIni:'frontal',
 vistas:[{id:'frontal',t:'Frontal'},{id:'lateral',t:'Lateral'},{id:'superior',t:'Superior'},{id:'trasera',t:'Trasera'},{id:'interior',t:'Interior'}],
 capas:[{id:'tapa',t:'Cabeza y aro'},{id:'carcasa',t:'Bloques de contactos (carcasa)'},{id:'resortes',t:'Resorte y traba'},{id:'contactos',t:'Contactos'},{id:'bornes',t:'Bornes'},{id:'etiq',t:'Nombres de las piezas'}],
 btnOn:'👆 Accionar (presionar / girar)',btnOff:'✋ Soltar',
 fallas:[
  {id:'peg',t:'Contacto NA pegado',d:'La plata se soldó: el NA queda cerrado aunque se suelte el pulsador.'},
  {id:'res',t:'Resorte roto',d:'La cabeza no vuelve a su posición al soltarla.'},
  {id:'sucio',t:'Contactos sucios / carbonizados',d:'El NA no conduce aunque esté presionado.'}],
 fallaVista:{peg:'interior',res:'interior',sucio:'interior'},
 partes:PARTES,
 controles:[{k:'tipo',t:'choice',l:'Tipo de comando',v:'verde',o:[['verde','Marcha (verde)'],['rojo','Parada (rojo)'],['hongo','Emergencia (hongo)'],['sel','Selectora 2 pos.']]}],
 acciones:[{id:'liberar',t:'↻ Girar para liberar el hongo'}],
 init(){return{p:0,latch:false,weld:false,stuck:false}},
 reinicio(o){o.p=0;o.latch=false;o.weld=false;o.stuck=false},
 accion(id,o,c){if(id==='liberar'&&o.latch){o.latch=false;return['tac']}return[]},
 paso(o,dt,c,t){const ev=[];if(dt<=0)return ev;const f=c.f,tp=c.p.tipo;let target=c.coil?1:0;
  if(tp==='hongo'){if(c.coil&&!o.latch){o.latch=true;ev.push('clack')}if(o.latch)target=1}
  if(tp==='verde'||tp==='rojo'){if(f.res){if(c.coil)o.stuck=true}else o.stuck=false;if(o.stuck)target=1}
  const K=700,Cd=2*Math.sqrt(K)*.6,old=o.p;let v=o.v||0;const n=Math.ceil(dt/.004),h=dt/n;
  for(let i=0;i<n;i++){v+=(K*(target-o.p)-Cd*v)*h;o.p+=v*h;if(o.p>1){o.p=1;v=-v*.2}if(o.p<0){o.p=0;v=-v*.2}}o.v=v;
  const was=o.na;if(f.peg&&o.p>.8)o.weld=true;if(!f.peg)o.weld=false;
  if(old<.8&&o.p>=.8)ev.push('tac');if(old>=.8&&o.p<.8&&tp!=='hongo')ev.push('tac');
  return ev},
 est(o,c){const tp=c.p.tipo,f=c.f,nc=o.p<.13,na=(o.p>=.8||o.weld);return{nc,na,naCond:na&&!f.sucio&&(o.weld||o.p>=.8),ncCond:nc}},
 lecturas(o,c){const e=this.est(o,c),tp=c.p.tipo,T=TIPOS[tp],f=c.f;
  const reads=[{l:'COMANDO',v:T.n.split(' (')[0],on:null},{l:'POSICIÓN',v:Math.round(o.p*100)+' %',on:o.p>.5},{l:'CONTACTO NC 21–22',v:e.nc?'cerrado':'abierto',on:e.nc},{l:'CONTACTO NA 13–14',v:e.naCond?'cerrado':e.na?'cerrado (sucio, no conduce)':'abierto',on:e.naCond},{l:'ENCLAVAMIENTO',v:T.mant?(tp==='hongo'?(o.latch?'trabado':'libre'):(o.p>.5?'en AUT':'en MAN')):'no tiene',on:null},{l:'LÁMPARA H1 (NA)',v:e.naCond?'encendida':'apagada',on:e.naCond},{l:'LÁMPARA H2 (NC)',v:e.nc?'encendida':'apagada',on:e.nc}];
  let verdict;
  if(f.peg&&o.weld&&o.p<.6)verdict={cls:'bad',t:'Contacto NA pegado: el circuito sigue cerrado aunque nadie presione. En una marcha esto es peligroso.'};
  else if(f.res&&o.stuck&&o.p>.6)verdict={cls:'warn',t:'El resorte roto no devuelve la cabeza: queda hundida y los contactos no vuelven a su estado de reposo.'};
  else if(f.sucio&&o.p>.8)verdict={cls:'warn',t:'Contacto presionado, pero la suciedad impide que conduzca: la lámpara H1 no enciende.'};
  else if(tp==='hongo'&&o.latch)verdict={cls:'bad',t:'EMERGENCIA: el hongo queda enclavado y abre el NC. Para reanudar hay que girarlo para liberarlo (botón “Girar para liberar”).'};
  else if(o.p>.8)verdict={cls:'ok',t:'Presionado: el NC se abrió primero y después el NA se cerró (interrupción antes de cierre).'};
  else verdict={cls:'ok',t:'En reposo: el NC está cerrado y el NA abierto, mantenidos por el resorte.'};
  return{reads,verdict}},
 pasos:[
  {t:'En reposo',coil:false,p:{tipo:'verde'},ini(o){o.p=0;o.latch=false},hl:['resorte','nc','na'],vista:'interior',x:'El <b>resorte de retorno</b> mantiene el botón afuera. El contacto <b>NC (21–22) está cerrado</b> y el <b>NA (13–14) abierto</b>. La lámpara H2 (por el NC) está encendida.'},
  {t:'Se presiona',coil:true,p:{tipo:'verde'},hl:['cabeza','vastago','resorte'],x:'Al presionar la <b>cabeza</b> se empuja el <b>vástago</b> y se comprime el resorte. El movimiento llega a la placa que mueve los dos contactos a la vez.'},
  {t:'Primero se abre el NC',coil:true,p:{tipo:'verde'},hl:['nc'],x:'El <b>NC se abre primero</b>, después de un recorrido muy corto. Es la regla de “abrir antes de cerrar”: evita que en un instante estén los dos contactos cerrados.'},
  {t:'Después se cierra el NA',coil:true,p:{tipo:'verde'},hl:['na'],x:'Con más recorrido se <b>cierra el NA</b> y se enciende H1. En un circuito real esto cerraría la bobina de un contactor (marcha).'},
  {t:'Se suelta',coil:false,p:{tipo:'verde'},hl:['resorte','na','nc'],x:'Al soltar, el <b>resorte devuelve</b> el botón: el NA se abre y el NC se cierra. En un pulsador sin enclavamiento los contactos <b>no se quedan</b> en la posición accionada.'},
  {t:'Parada de emergencia',coil:true,p:{tipo:'hongo'},ini(o){o.p=0;o.latch=false},hl:['traba','nc'],x:'El <b>hongo</b> se hunde y una <b>traba</b> lo mantiene abajo: el NC queda abierto aunque se suelte. Para liberarlo hay que <b>girarlo</b> (probalo en “Operar”). Es un comando de seguridad: no se puede rearmar por casualidad.'}],
 usos:[
  {t:'Marcha y parada con retención',x:'El pulsador verde (NA) energiza la bobina del contactor y el contacto auxiliar 13–14 del contactor lo “retiene”. El pulsador rojo (NC) en serie con la bobina la corta. Como la parada es un NC, un cable cortado también detiene la máquina.',sim:true},
  {t:'Parada de emergencia',x:'Hongo rojo sobre fondo amarillo, con enclavamiento. Debe ser accesible y cortar la maniobra de la máquina. No se debe usar como parada común y no se rearma solo.',sim:true},
  {t:'Selectora Manual / Automático',x:'La selectora de 2 posiciones mantiene su posición. En MAN el operario comanda con pulsadores; en AUT lo hace un sensor o un temporizador.'},
  {t:'Colores normalizados',x:'Verde: marcha o arranque. Rojo: parada o emergencia. Amarillo: intervención ante una condición anormal. Azul: acción obligatoria como rearme. Blanco o negro: funciones generales.'}],
 ejercicios:[
  {q:'¿Qué contacto se usa normalmente para PARAR una máquina?',o:['NA (13-14)','NC (21-22)','Cualquiera'],ok:1,why:'Con un NC, si el cable se corta o el contacto falla, el circuito se abre y la máquina se detiene: es el modo seguro.',ver:{vista:'interior',coil:true,p:{tipo:'rojo'}}},
  {q:'Al presionar un pulsador con un NA y un NC, ¿qué ocurre primero?',o:['Se cierra el NA','Se abre el NC','Ocurren juntos'],ok:1,why:'Los bloques están hechos para abrir antes de cerrar, así nunca hay dos caminos abiertos a la vez.',ver:{vista:'interior',coil:true,p:{tipo:'verde'}}},
  {q:'¿Para qué sirve la traba de la parada de emergencia?',o:['Para que se pueda soltar con el dedo','Para mantenerlo hundido hasta liberarlo a propósito','Para dar más recorrido'],ok:1,why:'Sin traba, alguien podría soltar el hongo y reanudar la marcha sin saber que la emergencia sigue activa.',ver:{vista:'interior',coil:true,p:{tipo:'hongo'}}},
  {q:'Un pulsador de marcha queda con el NA soldado. ¿Qué pasa?',o:['La máquina arranca sola o no se detiene','Nada','Se quema el resorte'],ok:0,why:'El contacto cierra el circuito aunque se suelte: la máquina no se puede detener con ese pulsador.',ver:{vista:'interior',coil:true,f:['peg'],p:{tipo:'verde'}}},
  {q:'¿Cuál es el color normalizado para marcha?',o:['Rojo','Verde','Azul'],ok:1,why:'Verde = marcha; rojo = parada o emergencia.'},
  {q:'La medida estándar del agujero del panel es…',o:['22 mm','10 mm','50 mm'],ok:0,why:'22 mm (a veces 22,5 mm) es el estándar para pulsadores, selectoras y lámparas de señalización.'}],
 defs(){return DEFS},
 dibujar(view,o,c,ui){const e=this.est(o,c),S={o,c,ui,e,inter:view==='interior',tp:c.p.tipo};
  if(view==='lateral'||view==='interior')return lat(S);if(view==='superior')return sup(S);if(view==='trasera')return tra(S);return fro(S)},
 simbolo(o,c,ui){return iec({o,c,ui,e:this.est(o,c),tp:c.p.tipo})}
});
function C(def){['est'].forEach(k=>def[k]=def[k].bind(def));window.COMPONENTES.pulsadores=def}
const LA=S=>S.inter?.07:1-S.ui.T,has=(S,k)=>S.ui.capas.has(k);
function headFront(S,cx,cy,sc,a){const{o,tp}=S,T=TIPOS[tp],d=o.p,r=(tp==='hongo'?96:68)*sc*(1-.04*d);let s='';
 if(tp==='hongo'){s+=`<circle cx="${cx}" cy="${cy}" r="${118*sc}" fill="url(#cYel)" stroke="#000" stroke-width="2" opacity="${a}"/><text x="${cx}" y="${cy+132*sc}" text-anchor="middle" style="font:800 ${14*sc}px system-ui;fill:#f0f4f8" opacity="${a}">PARADA DE EMERGENCIA</text>`}
 s+=`<circle cx="${cx}" cy="${cy}" r="${(tp==='hongo'?96:80)*sc}" fill="#2a2f36" stroke="#000" stroke-width="2" opacity="${a}"/>`;
 if(tp==='sel'){s+=`<circle cx="${cx}" cy="${cy}" r="${58*sc}" fill="url(#cKnob)" stroke="#000" stroke-width="2" opacity="${a}"/><g transform="rotate(${-40+o.p*80} ${cx} ${cy})" opacity="${a}"><rect x="${cx-12*sc}" y="${cy-70*sc}" width="${24*sc}" height="${88*sc}" rx="${10*sc}" fill="#1a1e23" stroke="#000"/><path d="M${cx} ${cy-64*sc}V${cy-30*sc}" stroke="#fff" stroke-width="${4*sc}" stroke-linecap="round"/></g><text x="${cx-78*sc}" y="${cy-70*sc}" style="font:800 ${14*sc}px system-ui;fill:#f0f4f8" opacity="${a}">MAN</text><text x="${cx+40*sc}" y="${cy-70*sc}" style="font:800 ${14*sc}px system-ui;fill:#f0f4f8" opacity="${a}">AUT</text>`}
 else{s+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${T.head})" stroke="#000" stroke-width="2" opacity="${a}"/><ellipse cx="${cx-r*.28}" cy="${cy-r*.38}" rx="${r*.38}" ry="${r*.2}" fill="#fff" opacity="${.42*a*(1-d*.5)}" transform="rotate(-25 ${cx-r*.28} ${cy-r*.38})"/>`;if(T.letter)s+=`<text x="${cx}" y="${cy+r*.28}" text-anchor="middle" style="font:800 ${r*.7}px system-ui;fill:#fff" opacity="${a*.9}">${T.letter}</text>`}
 return s}
function fro(S){const{o,e,tp}=S,a=LA(S);let s=`<rect x="300" y="60" width="400" height="440" rx="12" fill="url(#cPl)" stroke="#0b0e11" stroke-width="2" opacity="${a>.2?.55:.2}"/>`;
 /* bloque detrás: indicadores */
 s+=g(S,'carcasa','bloque',`<rect x="420" y="210" width="160" height="140" rx="10" fill="var(--cav)" stroke="#000" stroke-opacity=".5"/><rect x="430" y="220" width="64" height="40" rx="4" fill="${e.nc?'#2a8f61':'#2b3744'}"/><text x="462" y="246" text-anchor="middle" style="font:800 14px system-ui;fill:#fff">NC</text><rect x="506" y="220" width="64" height="40" rx="4" fill="${e.naCond?'#2a8f61':'#2b3744'}"/><text x="538" y="246" text-anchor="middle" style="font:800 14px system-ui;fill:#fff">NA</text>`);
 s+=g(S,'tapa','cabeza',headFront(S,500,tp==='hongo'?260:260,1,a));
 s+=g(S,'tapa','aro',`<circle cx="500" cy="260" r="${tp==='hongo'?134:96}" fill="none" stroke="url(#cMe)" stroke-width="8" opacity="${a}"/>`);
 return s+title('Vista frontal: '+TIPOS[tp].n)}
function hspring(x1,x2,y,w,n){const L=x2-x1;if(L<2)return'';const pts=[],m=n*10;for(let i=0;i<=m;i++){const k=i/m,ph=k*n*2*Math.PI;pts.push(`${(x1+L*k).toFixed(1)},${(y+Math.sin(ph)*w/2).toFixed(1)}`)}const p='M'+pts.join('L');return`<path d="${p}" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="5.5" stroke-linecap="round" transform="translate(2 2)"/><path d="${p}" fill="none" stroke="#aeb9c5" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`}
function lat(S){const{o,c,e,tp,inter}=S,a=LA(S),f=c.f,D=o.p*30,Dn=tp==='hongo'||tp==='sel'?D:D;
 let s=`<rect x="420" y="150" width="300" height="270" fill="var(--cav)" opacity="${inter?.9:.5}"/>`;
 /* panel */
 s+=`<rect x="380" y="50" width="32" height="460" fill="url(#cPlL)" stroke="#0b0e11"/><text x="396" y="530" text-anchor="middle" class="lab s">panel</text>`;
 /* contactos (dentro del bloque) */
 const pad='url(#cMe)';let ct='';
 /* NC arriba */
 ct+=`<rect x="476" y="206" width="24" height="30" fill="${pad}" stroke="#3a4450"/><rect x="498" y="212" width="3" height="18" fill="${f.peg?'url(#cAg)':'url(#cAg)'}"/>`;
 ct+=`<g transform="translate(${D} 0)"><rect x="440" y="186" width="70" height="8" fill="url(#cPlL)" stroke="#111"/><rect x="501" y="196" width="10" height="42" fill="url(#cPlL)"/><rect x="500" y="212" width="60" height="18" rx="2" fill="${e.nc?'url(#cCuH)':'url(#cCuV)'}" stroke="#4a2410"/><rect x="498" y="214" width="3" height="14" fill="url(#cAg)"/></g>`;
 /* NA abajo */
 ct+=`<rect x="620" y="336" width="30" height="30" fill="${pad}" stroke="#3a4450"/><rect x="617" y="342" width="3" height="18" fill="${f.sucio?'#2a211d':'url(#cAg)'}"/>`;
 ct+=`<g transform="translate(${D} 0)"><rect x="440" y="344" width="130" height="8" fill="url(#cPlL)" stroke="#111"/><rect x="566" y="340" width="52" height="16" rx="2" fill="${e.naCond?'url(#cCuH)':'url(#cCuV)'}" stroke="#4a2410"/><rect x="615" y="342" width="3" height="14" fill="${f.sucio?'#2a211d':'url(#cAg)'}"/></g>`;
 if(f.peg&&o.weld&&o.p>.7)ct+=glow(618,349,12,'#ffb347',.9);
 ct+=`<path d="M650 351H700V380" fill="none" stroke="#c8703d" stroke-width="4"/><path d="M476 221H452V190H430" fill="none" stroke="#c8703d" stroke-width="3.5" opacity="0"/><path d="M560 221H690V200" fill="none" stroke="#c8703d" stroke-width="4"/>`;
 if(e.naCond)ct+=`<path class="flowd" d="M700 380V351H650M618 349H570" pointer-events="none"/>`;
 if(e.nc)ct+=`<path class="flowd" d="M690 200V221H560M500 221H476" pointer-events="none"/>`;
 s+=g(S,'contactos','nc',ct.split('<rect x="620"')[0])+g(S,'contactos','na','<rect x="620"'+ct.split('<rect x="620"')[1]);
 /* vástago */
 s+=g(S,'resortes','vastago',`<g transform="translate(${D} 0)"><rect x="340" y="266" width="120" height="28" rx="3" fill="url(#cPlL)" stroke="#111"/><rect x="440" y="186" width="10" height="170" fill="url(#cPlL)" stroke="#111"/></g>`);
 s+=g(S,'resortes','resorte',hspring(412+D*.3,440+D,280,26,6)+(tp==='hongo'?`<g transform="translate(0 0)"><path d="M412 238l20 10v-20Z" fill="${o.latch?'#ffb347':'#7a828c'}" stroke="#111"/></g>`:''));
 if(tp==='hongo'&&has(S,'resortes'))s+=g(S,'resortes','traba',`<rect x="414" y="226" width="24" height="12" fill="${o.latch?'#ffb347':'#7a828c'}" stroke="#111"/>`);
 /* bloque */
 let car=inter?`<rect x="420" y="150" width="300" height="270" rx="10" fill="none" stroke="#8fa1b4" stroke-width="3" stroke-dasharray="10 6"/>`:`<rect x="420" y="150" width="300" height="270" rx="10" fill="url(#cPl)" stroke="#0b0e11" stroke-width="2" opacity="${a}"/><rect x="420" y="150" width="300" height="270" rx="10" fill="url(#cPlH)" opacity="${a}"/>`;
 s+=g(S,'carcasa','bloque',car);
 /* cabeza */
 const hx=250+D;
 let head=`<rect x="342" y="236" width="40" height="88" rx="6" fill="url(#cMe)" stroke="#3a4450" opacity="${a}"/>`;
 if(tp==='hongo')head+=`<g transform="translate(${D} 0)" opacity="${a}"><path d="M${hx-40} 280a70 100 0 0 1 90 -90h2v180h-2a70 100 0 0 1 -90 -90Z" fill="url(#cRed)" stroke="#000" stroke-width="2" transform="translate(40 0)"/></g>`;
 else if(tp==='sel')head+=`<g transform="translate(${D} 0)" opacity="${a}"><rect x="${hx}" y="226" width="130" height="108" rx="12" fill="url(#cKnob)" stroke="#000" stroke-width="2"/></g>`;
 else head+=`<g transform="translate(${D} 0)" opacity="${a}"><path d="M${hx+30} 226h70v108h-70a30 54 0 0 1 0 -108Z" fill="url(#${TIPOS[tp].head})" stroke="#000" stroke-width="2"/><ellipse cx="${hx+52}" cy="250" rx="14" ry="8" fill="#fff" opacity=".4"/></g>`;
 s+=g(S,'tapa','cabeza',head);
 /* bornes */
 s+=g(S,'bornes','bornes',`${screw(700,200,10,10)}${screw(700,380,10,40)}${screw(470,170,9,70)}${screw(470,400,9,20)}`)+(has(S,'bornes')?tag(722,196,'22','s')+tag(722,376,'14','s')+tag(446,170,'21','s')+tag(446,404,'13','s'):'');
 if(has(S,'etiq'))s+=lbl(300,150,'Cabeza','l',hx+60,250)+lbl(300,220,'Aro de fijación','l',362,236)+lbl(300,400,'Vástago','l',350+D,280)+lbl(750,260,'Resorte de retorno','r',425+D*.5,280)+lbl(750,150,'Contacto NC 21–22','r',540+D,221)+lbl(750,330,'Contacto NA 13–14','r',590+D,348);
 return s+title(inter?'Corte lateral: así es por dentro':'Vista lateral')}
function sup(S){const{o,tp}=S,a=LA(S);let s=`<rect x="300" y="260" width="30" height="40" fill="url(#cPlL)" stroke="#0b0e11"/>`;
 s+=g(S,'carcasa','bloque',`<rect x="330" y="200" width="300" height="160" rx="10" fill="url(#cPl)" stroke="#0b0e11" stroke-width="2" opacity="${a}"/><rect x="330" y="200" width="300" height="160" rx="10" fill="url(#cPlH)" opacity="${a}"/>`);
 s+=g(S,'tapa','cabeza',`<rect x="${250+o.p*30}" y="${tp==='hongo'?215:235}" width="90" height="${tp==='hongo'?130:90}" rx="12" fill="url(#${tp==='sel'?'cKnob':TIPOS[tp].head})" stroke="#000" stroke-width="2" opacity="${a}"/>`);
 s+=g(S,'bornes','bornes',[0,1,2,3].map(i=>`<rect x="${470+i*38}" y="215" width="30" height="40" rx="3" fill="url(#cMe)" stroke="#3a4450"/>${screw(485+i*38,235,10,i*20)}`).join(''));
 if(has(S,'bornes'))s+=['21','22','13','14'].map((q,i)=>tag(485+i*38,206,q,'s')).join('');
 return s+title('Vista superior')+tag(480,420,'← frente        atrás →','s')}
function tra(S){const a=LA(S);let s=`<rect x="360" y="110" width="280" height="340" rx="12" fill="url(#cPl)" stroke="#0b0e11" stroke-width="2" opacity="${a}"/><rect x="360" y="110" width="280" height="340" rx="12" fill="url(#cPlH)" opacity="${a}"/>`;
 s=g(S,'carcasa','bloque',s);
 let bn='';[['21',420,170],['22',580,170],['13',420,390],['14',580,390]].forEach((q,i)=>{bn+=`<rect x="${q[1]-34}" y="${q[2]-28}" width="68" height="56" rx="5" fill="url(#cMe)" stroke="#3a4450"/>${screw(q[1],q[2],18,i*25)}`+tag(q[1],q[2]-36,q[0],'s')});
 s+=g(S,'bornes','bornes',bn);
 s+=g(S,'tapa','aro',`<rect x="440" y="265" width="120" height="30" rx="8" fill="url(#cMe)" stroke="#3a4450" opacity="${a}"/>`);
 return s+title('Vista trasera: bornes de los bloques de contactos')}
function iec(S){const{o,c,e,tp}=S,off='#566678',R='#b5733e',N='#58b8e8',T=TIPOS[tp];
 let s=`<text x="500" y="26" class="lab c t">Símbolos IEC · ${T.n}</text><path d="M120 80H880" stroke="${R}" stroke-width="5"/><text x="100" y="86" class="lab r">F</text><path d="M120 500H880" stroke="${N}" stroke-width="5"/><text x="100" y="506" class="lab r">N</text>`;
 const D=o.p;
 /* rama NA */
 s+=`<g data-act="toggle"><path d="M330 80V150" stroke="${R}" stroke-width="5"/><circle cx="330" cy="150" r="4.5" fill="var(--ink)"/><circle cx="330" cy="230" r="4.5" fill="var(--ink)"/><path d="M330 230L${330-(1-Math.min(1,D*1.1))*26} 156" stroke="var(--ink)" stroke-width="5" stroke-linecap="round"/><rect x="290" y="168" width="40" height="22" fill="transparent"/>${tp==='hongo'?`<path d="M370 190h-30" stroke="var(--ink)" stroke-width="3" stroke-dasharray="7 5"/><path d="M370 170a24 24 0 0 1 24 20h-48a24 24 0 0 1 24 -20Z" fill="${o.p>.5?'#c0392b':'none'}" stroke="var(--ink)" stroke-width="3"/>`:`<path d="M340 190h40" stroke="var(--ink)" stroke-width="3" stroke-dasharray="7 5"/><path d="M380 178v24M370 178h20" stroke="var(--ink)" stroke-width="4"/>`}<text x="346" y="146" class="lab s">13</text><text x="346" y="248" class="lab s">14</text></g><path d="M330 230V340" stroke="${e.naCond?R:off}" stroke-width="5"/>`;
 s+=`<circle cx="330" cy="372" r="28" fill="${e.naCond?'#2f8f5a':'none'}" stroke="var(--ink)" stroke-width="4"/><path d="M310 352L350 392M350 352L310 392" stroke="var(--ink)" stroke-width="4"/><text x="372" y="378" class="lab">H1</text><path d="M330 400V500" stroke="${e.naCond?N:off}" stroke-width="5"/><text x="330" y="118" class="lab c s">NA (marcha)</text>`;
 if(e.naCond)s+=`<path class="flowd" d="M330 80V344M330 400V500"/>`;
 /* rama NC */
 s+=`<g data-act="toggle"><path d="M640 80V150" stroke="${R}" stroke-width="5"/><circle cx="640" cy="150" r="4.5" fill="var(--ink)"/><circle cx="640" cy="230" r="4.5" fill="var(--ink)"/><path d="M640 230L${640-(e.nc?0:26)} 156" stroke="var(--ink)" stroke-width="5" stroke-linecap="round"/><path d="M626 154H654" stroke="var(--ink)" stroke-width="3"/><path d="M650 190h40" stroke="var(--ink)" stroke-width="3" stroke-dasharray="7 5"/><path d="M690 178v24M680 178h20" stroke="var(--ink)" stroke-width="4"/><text x="656" y="146" class="lab s">21</text><text x="656" y="248" class="lab s">22</text></g><path d="M640 230V340" stroke="${e.nc?R:off}" stroke-width="5"/>`;
 s+=`<circle cx="640" cy="372" r="28" fill="${e.nc?'#c0392b':'none'}" stroke="var(--ink)" stroke-width="4"/><path d="M620 352L660 392M660 352L620 392" stroke="var(--ink)" stroke-width="4"/><text x="682" y="378" class="lab">H2</text><path d="M640 400V500" stroke="${e.nc?N:off}" stroke-width="5"/><text x="640" y="118" class="lab c s">NC (parada)</text>`;
 if(e.nc)s+=`<path class="flowd" d="M640 80V344M640 400V500"/>`;
 s+=`<text x="500" y="540" class="lab c s">Tocá el pulsador para accionarlo. El símbolo con “T” indica accionamiento manual por pulsador.</text>`;
 return s}
})();
