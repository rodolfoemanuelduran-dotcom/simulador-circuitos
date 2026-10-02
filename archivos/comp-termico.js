/* Componente "Relé térmico" para componente.html (mismo contrato que comp-contactor.js). */
(function(){
const cl=(v,a,b)=>Math.max(a,Math.min(b,v));
const TAU=180,TAUC=320,HT=1.25; /* constante térmica de calentamiento/enfriamiento (s) y nivel de disparo (I/Ir)^2 */
const IN=3.6; /* corriente nominal del motor de ejemplo: 1,5 kW, 380 V */
const SIT={n:1,s:1.5,b:7};
const fm=(n,k)=>Number(n).toFixed(k).replace('.',',');

const PARTES={
 bimetal:{t:'Lámina bimetálica',d:'Dos metales pegados con distinta dilatación (latón y acero). Al calentarse, el que más se dilata “empuja” y la lámina se curva. Cuanto más corriente y más tiempo, más se curva.'},
 calef:{t:'Calefactor (resistencia arrollada)',d:'Alambre de resistencia por el que pasa la corriente del motor. Calienta la lámina por el efecto Joule (P = I²·R). Hay uno por fase, en serie con el motor.'},
 deslizador:{t:'Barras deslizantes (mecanismo diferencial)',d:'Las puntas de las láminas empujan estas barras. Si las tres fases se calientan igual, se mueven juntas. Si una fase falta, esa lámina no se curva y la diferencia hace disparar antes.'},
 palanca:{t:'Palanca de disparo (con resorte de golpe)',d:'Recibe el empuje de las barras y, al pasar un punto límite, “salta” de golpe gracias a un resorte. Eso evita que los contactos se abran lentamente y se quemen.'},
 cont_nc:{t:'Contacto NC 95–96',d:'Normalmente cerrado. Va en serie con la bobina del contactor: al disparar el relé se abre, la bobina pierde tensión y el motor se detiene.'},
 cont_no:{t:'Contacto NA 97–98',d:'Normalmente abierto: se cierra al disparar. Se usa para encender una lámpara o una alarma de “falla por sobrecarga”.'},
 ajuste:{t:'Selector de corriente (ajuste)',d:'Se regula a la corriente nominal que figura en la chapa del motor. Mueve el punto de apoyo de la palanca: así la misma lámina dispara con otra corriente. Rango del ejemplo: 2,5 a 4 A.'},
 reset:{t:'Botón RESET (rearme)',d:'Vuelve la palanca a su posición después de un disparo. Sólo se puede rearmar cuando las láminas se enfriaron. Puede ser manual o automático.'},
 test:{t:'Botón TEST',d:'Fuerza el disparo para probar el circuito de mando sin tener que provocar una sobrecarga.'},
 stop:{t:'Botón STOP',d:'Abre el contacto NC 95–96 a mano: sirve para detener el motor desde el propio relé.'},
 term_in:{t:'Bornes de entrada 1/L1 · 3/L2 · 5/L3',d:'Se acoplan directamente a los bornes de salida del contactor (2/T1, 4/T2, 6/T3).'},
 term_out:{t:'Bornes de salida 2/T1 · 4/T2 · 6/T3',d:'De aquí salen los conductores al motor (U, V, W).'},
 carcasa:{t:'Carcasa',d:'Plástico aislante que protege el mecanismo y mantiene las láminas a una temperatura estable.'},
 tapa:{t:'Tapa frontal',d:'Lleva la escala de ajuste, los botones STOP / RESET / TEST, el indicador de disparo y los bornes de los contactos auxiliares.'},
 indicador:{t:'Indicador de disparo',d:'Se pone naranja cuando el relé disparó, así se ve desde afuera qué protección actuó.'}
};

C({
 titulo:'El relé térmico',
 intro:'Protege al motor contra sobrecargas. Cada fase pasa por un calefactor que calienta una lámina bimetálica; si la corriente es demasiado alta durante demasiado tiempo, la lámina se curva y abre el circuito de mando del contactor. No protege contra cortocircuitos (para eso están los fusibles o el guardamotor).',
 vistaIni:'frontal',
 vistas:[{id:'frontal',t:'Frontal'},{id:'lateral',t:'Lateral'},{id:'superior',t:'Superior'},{id:'trasera',t:'Trasera'},{id:'interior',t:'Interior'}],
 capas:[{id:'carcasa',t:'Carcasa'},{id:'tapa',t:'Tapa frontal'},{id:'bornes',t:'Bornes y tornillos'},{id:'calef',t:'Calefactores'},{id:'bimetal',t:'Láminas bimetálicas'},{id:'mec',t:'Barras y palanca de disparo'},{id:'cont',t:'Contactos 95-96 / 97-98'},{id:'ajuste',t:'Selector de ajuste'},{id:'etiq',t:'Nombres de las piezas'}],
 btnOn:'▶ Arrancar el motor (contactor cerrado)',btnOff:'■ Detener el motor',
 fallas:[
  {id:'falta',t:'Falta una fase',d:'Se corta una fase: el motor queda en monofásico y las otras dos toman más corriente.'},
  {id:'mal',t:'Ajuste demasiado alto',d:'El selector está muy por encima de la corriente del motor: el relé casi no protege.'}],
 fallaVista:{falta:'interior',mal:'frontal'},
 partes:PARTES,
 controles:[
  {k:'sit',t:'choice',l:'Situación del motor',v:'n',o:[['n','Normal (corriente nominal)'],['s','Sobrecarga 1,5×'],['b','Rotor bloqueado 7×']]},
  {k:'Ir',t:'slider',l:'Ajuste del relé (corriente nominal)',min:2.5,max:4,st:.1,v:3.6,fmt:v=>fm(v,1)+' A'},
  {k:'vel',t:'choice',l:'Velocidad del tiempo',v:'10',num:true,o:[['1','Real ×1'],['10','×10'],['30','×30']]}],
 acciones:[{id:'test',t:'🧪 TEST (forzar disparo)'},{id:'reset',t:'↺ RESET (rearmar)'}],
 init(){return{h:[0,0,0],trip:false,sw:0,lv:0,msg:'',stopP:0}},
 reinicio(o){o.h=[0,0,0];o.trip=false;o.sw=0;o.lv=0},
 hum(o,c){return false},
 accion(id,o,c){if(id==='test'){if(!o.trip){o.trip=true;return['clack']}return[]}
  if(id==='reset'){if(!o.trip)return['tac'];const x=Math.max(...o.h)/HT;if(x>.5){o.msg='Todavía está caliente: esperá a que se enfríen las láminas.';o.msgT=3;return['no']}o.trip=false;o.msg='';return['tac']}
  return[]},
 corr(o,c){const run=c.coil&&!o.trip,Ib=run?IN*(SIT[c.p.sit]||1):0,f=c.f;
  let I=[Ib,Ib,Ib];if(f.falta&&run)I=[0,Ib*1.73,Ib*1.73];
  const Ir=c.p.Ir*(f.mal?1.4:1);return{I,Ir,run}},
 paso(o,dt,c,t){const ev=[];if(dt<=0)return ev;
  const {I,Ir}=this.corr(o,c),vel=+c.p.vel||10,de=dt*vel,n=Math.max(1,Math.ceil(de/.5)),h=de/n;
  for(let k=0;k<n;k++)for(let i=0;i<3;i++){const q=I[i]/Ir,tg=q*q,ta=tg>o.h[i]?TAU:TAUC;o.h[i]+=(tg-o.h[i])*h/ta}
  const x=o.h.map(v=>cl(v/HT,0,1.2)),mx=Math.max(...x),mn=Math.min(...x),L=mx+.6*(mx-mn);
  if(!o.trip&&L>=1){o.trip=true;ev.push('clack')}
  o.lv+=((o.trip?1.35:Math.min(L,.98))-o.lv)*Math.min(1,dt*(o.trip?30:12));
  o.sw+=((o.trip?1:0)-o.sw)*Math.min(1,dt*28);
  if(o.msgT>0){o.msgT-=dt;if(o.msgT<=0)o.msg=''}
  return ev},
 est(o,c){const x=o.h.map(v=>cl(v/HT,0,1.2)),mx=Math.max(...x),mn=Math.min(...x);return{x,L:mx+.6*(mx-mn),nc:o.sw<.5,no:o.sw>=.5}},
 lecturas(o,c){const {I,Ir,run}=this.corr(o,c),e=this.est(o,c),vel=+c.p.vel||10,f=c.f;
  const qmax=Math.max(...I)/Ir,tg=qmax*qmax;let tt='—';
  if(run&&!o.trip){const hm=Math.max(...o.h),target=f.falta?HT*.625:HT;if(tg>target+.001){const tsec=-TAU*Math.log(1-(target-hm)/(tg-hm))/vel;tt=hm>=target?'ya':tsec<60?fm(tsec,1)+' s':fm(tsec/60,1)+' min'}else tt='nunca (no dispara)'}
  else if(o.trip)tt='disparó';
  const reads=[{l:'CORRIENTE DE FASE (MÁX.)',v:fm(Math.max(...I),1)+' A',on:run},{l:'AJUSTE DEL RELÉ',v:fm(Ir,1)+' A'+(f.mal?' (mal)':''),on:null},{l:'RELACIÓN I / Ir',v:fm(qmax,2)+' ×',on:qmax>1.05?false:null},{l:'CALENTAMIENTO DE LÁMINAS',v:Math.round(Math.max(...e.x)*100)+' %',on:e.x[0]<.5?null:false},{l:'DISPARO PREVISTO EN',v:tt,on:null},{l:'CONTACTO NC 95–96',v:e.nc?'cerrado':'abierto',on:e.nc},{l:'CONTACTO NA 97–98',v:e.no?'cerrado':'abierto',on:e.no},{l:'MOTOR',v:run?'girando':'detenido',on:run}];
  let verdict;
  if(o.msg)verdict={cls:'warn',t:o.msg};
  else if(o.trip)verdict={cls:'bad',t:'El relé disparó: el contacto NC 95–96 se abrió, la bobina del contactor perdió tensión y el motor se detuvo. Buscá la causa de la sobrecarga y, cuando las láminas se enfríen, rearmá con RESET.'};
  else if(!run)verdict={cls:'ok',t:'Motor detenido. Las láminas se enfrían y el relé está listo (NC cerrado).'};
  else if(f.falta)verdict={cls:'warn',t:'Falta una fase: las otras dos toman más corriente y el mecanismo diferencial dispara antes que con una sobrecarga común.'};
  else if(f.mal&&qmax<1.1&&c.p.sit!=='n')verdict={cls:'bad',t:'Con el ajuste muy alto, la sobrecarga no alcanza a disparar el relé: el motor se recalienta sin protección.'};
  else if(qmax<=1.05)verdict={cls:'ok',t:'Corriente normal: las láminas apenas se calientan y el relé no actúa.'};
  else verdict={cls:'warn',t:'Sobrecarga: las láminas se calientan y se curvan. Cuanto mayor la corriente, más rápido dispara (característica de tiempo inverso).'};
  return{reads,verdict}},
 pasos:[
  {t:'Motor funcionando normalmente',coil:true,p:{sit:'n'},ini(o){o.h=[0,0,0];o.trip=false},hl:['bimetal','calef'],vista:'interior',x:'El contactor está cerrado y el motor gira con su corriente nominal. La corriente de cada fase pasa por un <b>calefactor</b> que entibia apenas la <b>lámina bimetálica</b>. Si el relé está bien ajustado, esa temperatura es inofensiva y la lámina casi no se mueve.'},
  {t:'Aparece una sobrecarga',coil:true,p:{sit:'s',vel:'30'},hl:['calef'],x:'La máquina se traba un poco y el motor toma <b>1,5 veces</b> su corriente. El calor crece con el cuadrado de la corriente (P = I²·R): 1,5² = 2,25 veces más calor en cada calefactor.'},
  {t:'Las láminas se curvan',coil:true,p:{sit:'s',vel:'30'},hl:['bimetal'],x:'El latón se dilata más que el acero y cada <b>lámina se curva</b> hacia el lado del acero. Observá cómo la punta se desplaza poco a poco. Si la corriente baja a tiempo, la lámina se enfría y vuelve.'},
  {t:'Las barras empujan la palanca',coil:true,p:{sit:'s',vel:'30'},hl:['deslizador','palanca'],x:'Las puntas empujan las <b>barras deslizantes</b> y éstas empujan la <b>palanca de disparo</b>. Cuando la palanca pasa su punto límite, el resorte la hace saltar de golpe.'},
  {t:'Disparo',coil:true,p:{sit:'s',vel:'30'},hl:['cont_nc','cont_no'],x:'El <b>NC 95–96 se abre</b> y el <b>NA 97–98 se cierra</b>. Como 95–96 está en serie con la bobina del contactor, éste se desenergiza y el <b>motor se detiene</b> antes de quemarse. El indicador se pone naranja.'},
  {t:'Enfriamiento y rearme',coil:false,p:{sit:'n',vel:'30'},hl:['reset','bimetal'],x:'Con el motor detenido las láminas se enfrían (tardan algunos minutos reales). Cuando están frías se puede <b>rearmar con RESET</b> (probalo en la pestaña “Operar”). Si se rearma caliente, el relé vuelve a disparar.'},
  {t:'Falta de una fase',coil:true,p:{sit:'n',vel:'30'},f:{falta:true},ini(o){o.h=[0,0,0];o.trip=false},hl:['deslizador','palanca'],x:'Una fase se cortó: su lámina no se calienta, pero las otras dos toman más corriente. El <b>mecanismo diferencial</b> suma esa diferencia y el relé dispara más rápido, protegiendo al motor de la marcha en dos fases.'}],
 usos:[
  {t:'Proteger un motor trifásico de 1,5 kW',x:'Un motor de 1,5 kW / 380 V consume unos 3,6 A. Se elige un relé de rango 2,5–4 A y se ajusta en <b>3,6 A</b>, el valor de la chapa. El relé va pegado a los bornes del contactor y su contacto 95–96 se conecta en serie con la bobina del contactor.',sim:true},
  {t:'Bomba que se traba',x:'Si la bomba aspira arena o el rodete se frena, la corriente sube. El térmico dispara y evita que el bobinado se queme. Después de destrabar la bomba se rearma con RESET.',sim:true},
  {t:'Clase de disparo 10 y 20',x:'La “clase” indica cuánto tarda en disparar con 7,2 veces la corriente de ajuste: clase 10, hasta 10 s; clase 20, hasta 20 s. Los motores de arranque pesado (ventiladores grandes, trituradoras) necesitan clase 20 para no disparar al arrancar.'},
  {t:'Señalización de falla',x:'El contacto NA 97–98 enciende una lámpara roja o una sirena cuando el relé dispara, para que el operario sepa que la parada fue por sobrecarga y no por el pulsador de parada.',sim:true}],
 ejercicios:[
  {q:'¿Contra qué protege principalmente un relé térmico?',o:['Cortocircuitos','Sobrecargas','Sobretensiones'],ok:1,why:'Es lento: necesita calentar las láminas. Un cortocircuito exige una protección instantánea (fusibles o disparo magnético del guardamotor).'},
  {q:'La chapa del motor indica 3,6 A. ¿En cuánto ajustás el relé?',o:['En 3,6 A','En 7 A para que nunca dispare','En 1 A para más seguridad'],ok:0,why:'Debe coincidir con la corriente nominal del motor. Muy alto no protege; muy bajo dispara en servicio normal.',ver:{vista:'frontal',coil:true,p:{sit:'n'}}},
  {q:'¿Con qué contacto se detiene el contactor cuando el relé dispara?',o:['97-98 (NA)','95-96 (NC) en serie con la bobina','Con los bornes 2/T1, 4/T2, 6/T3'],ok:1,why:'El NC 95–96 se abre y corta la alimentación de la bobina del contactor; el NA 97–98 sirve para señalizar.',ver:{vista:'interior',coil:true,p:{sit:'s',vel:'30'}}},
  {q:'Con rotor bloqueado (7×) el relé…',o:['dispara en pocos segundos','tarda horas en disparar','no dispara nunca'],ok:0,why:'La relación es inversa: a mayor corriente, menor tiempo. Con 7× el calor crece 49 veces y dispara en segundos.',ver:{vista:'interior',coil:true,p:{sit:'b',vel:'1'}}},
  {q:'Se corta una fase del motor. ¿Qué hace el mecanismo diferencial?',o:['Nada: sólo mide la corriente media','Adelanta el disparo','Evita el disparo'],ok:1,why:'La lámina de la fase cortada queda fría y las otras se calientan más; la diferencia entre las barras acelera el disparo.',ver:{vista:'interior',coil:true,f:['falta'],p:{sit:'n',vel:'30'}}},
  {q:'El relé disparó. Querés rearmarlo enseguida y vuelve a disparar. ¿Por qué?',o:['Está roto','Las láminas siguen calientes o la causa de la sobrecarga persiste','Hay que cambiar el contactor'],ok:1,why:'Primero hay que eliminar la causa y esperar a que las láminas se enfríen.'}],

 defs(){return`<defs>
<linearGradient id="cPl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#454c55"/><stop offset=".08" stop-color="#2d3238"/><stop offset=".9" stop-color="#1b1f24"/><stop offset="1" stop-color="#101317"/></linearGradient>
<linearGradient id="cPlH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".25" stop-color="#fff" stop-opacity=".02"/><stop offset=".8" stop-color="#000" stop-opacity=".1"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient>
<linearGradient id="cPlL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a828c"/><stop offset=".1" stop-color="#5b636d"/><stop offset="1" stop-color="#383e46"/></linearGradient>
<linearGradient id="cMe" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8a95a2"/><stop offset=".3" stop-color="#f4f7fa"/><stop offset=".6" stop-color="#b5bec8"/><stop offset="1" stop-color="#6e7a87"/></linearGradient>
<linearGradient id="cMeV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f7fa"/><stop offset=".5" stop-color="#a8b3bf"/><stop offset="1" stop-color="#6b7683"/></linearGradient>
<linearGradient id="cCu" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#a8582c"/><stop offset=".35" stop-color="#f2a770"/><stop offset=".7" stop-color="#c8703d"/><stop offset="1" stop-color="#8d4421"/></linearGradient>
<linearGradient id="cCuV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2a770"/><stop offset=".5" stop-color="#c8703d"/><stop offset="1" stop-color="#8d4421"/></linearGradient>
<linearGradient id="cAg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#aab4bf"/></linearGradient>
<linearGradient id="cBrass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8c6a1c"/><stop offset=".5" stop-color="#f1cf6a"/><stop offset="1" stop-color="#a47d22"/></linearGradient>
<linearGradient id="cSteel" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6c7886"/><stop offset=".5" stop-color="#dfe6ee"/><stop offset="1" stop-color="#7b8795"/></linearGradient>
<radialGradient id="cKnob" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#6a737e"/><stop offset=".6" stop-color="#2d343c"/><stop offset="1" stop-color="#15191e"/></radialGradient>
<pattern id="pRib" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="none"/><path d="M0 13H14" stroke="#000" stroke-opacity=".25" stroke-width="2"/><path d="M0 12H14" stroke="#fff" stroke-opacity=".06" stroke-width="1"/></pattern>
<filter id="fsh" x="-20%" y="-20%" width="140%" height="150%"><feGaussianBlur stdDeviation="6"/></filter>
<filter id="fgl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter>
</defs>`},

 dibujar(view,o,c,ui){const e=this.est(o,c),k=this.corr(o,c),S={o,c,ui,e,k,inter:view==='interior'};
  if(view==='lateral')return lat(S);if(view==='superior')return sup(S);if(view==='trasera')return tra(S);return fro(S)},
 simbolo(o,c,ui){return iec({o,c,ui,e:this.est(o,c),k:this.corr(o,c)})}
});

function C(def){def.est=def.est.bind(def);def.corr=def.corr.bind(def);window.COMPONENTES.termico=def}

/* ====================== ayudas ====================== */
const has=(S,k)=>S.ui.capas.has(k);
const LA=S=>S.inter?.07:1-S.ui.T;
function g(S,layer,part,body){if(layer&&!has(S,layer))return'';const on=S.ui.hl.has(part)||S.ui.sel===part;return`<g data-p="${part}"${on?' class="hl"':''}>${body}</g>`}
function screw(x,y,r,rot){return`<g transform="translate(${x} ${y}) rotate(${rot||0})"><circle r="${r}" fill="url(#cMeV)" stroke="#3a4450" stroke-width="1.4"/><circle r="${r*.78}" fill="none" stroke="#fff" stroke-opacity=".5"/><path d="M${-r*.62} 0H${r*.62}M0 ${-r*.62}V${r*.62}" stroke="#2c3540" stroke-width="${Math.max(2,r*.22)}" stroke-linecap="round"/></g>`}
function glow(cx,cy,r,col,op){return`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${col}" opacity="${op}" filter="url(#fgl)"/>`}
const stroke4='paint-order:stroke;stroke:var(--stg2);stroke-width:4px';
function lbl(x,y,tx,side,ax,ay){const anc=side==='l'?'end':'start',xe=side==='l'?x+6:x-6;return`<g pointer-events="none"><path d="M${xe} ${y-4}L${ax} ${ay}" stroke="#ffd65a" stroke-width="1.6" fill="none"/><circle cx="${ax}" cy="${ay}" r="3.4" fill="#ffd65a" stroke="#000" stroke-opacity=".5"/><text x="${x}" y="${y}" class="lab s" text-anchor="${anc}" style="${stroke4}">${tx}</text></g>`}
function tag(x,y,tx,cls){return`<text x="${x}" y="${y}" class="lab c ${cls||''}" pointer-events="none" style="${stroke4}">${tx}</text>`}
function title(tx){return`<text x="24" y="26" class="lab t" pointer-events="none">${tx}</text>`}
const heatCol=x=>{const r=cl(x,0,1.2);return`rgb(${Math.round(200+55*cl(r,0,1))},${Math.round(112-70*cl(r,0,1))},${Math.round(61-40*cl(r,0,1))})`};
/* lámina bimetálica curvada: base en (px,yb), punta arriba, desplazamiento dx */
function strip(px,yb,yt,dx){const n=14,A=[],B=[];for(let i=0;i<=n;i++){const k=i/n,y=yb-(yb-yt)*k,x=px+dx*k*k;A.push([x-5,y]);B.push([x+5,y])}const pl=a=>'M'+a.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join('L');
 return`<path d="${pl(A)}" fill="none" stroke="url(#cBrass)" stroke-width="9" stroke-linecap="butt" transform="translate(-4.5 0)"/><path d="${pl(B)}" fill="none" stroke="url(#cSteel)" stroke-width="9" transform="translate(4.5 0)"/><path d="${pl(A)}" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="1" transform="translate(0 0)"/>`}
function coilW(px,y1,y2,dx,x){const n=9,L=y2-y1;let s='';const col=heatCol(x),hot=x>.35;
 for(let i=0;i<n;i++){const y=y1+L*i/(n-1),sh=dx*((330-y)/190)*((330-y)/190);s+=`<ellipse cx="${px+sh}" cy="${y}" rx="17" ry="5" fill="none" stroke="#2a1608" stroke-width="5" stroke-opacity=".5"/><ellipse cx="${px+sh}" cy="${y}" rx="17" ry="5" fill="none" stroke="${col}" stroke-width="3.4"/>`}
 if(hot)s=glow(px+dx*.3,(y1+y2)/2,34,'#ff5a1f',cl((x-.3)*.8,0,.7))+s;return s}

/* ====================== FRONTAL / INTERIOR ====================== */
function fro(S){const{o,c,e,k,inter}=S,PX=[380,490,600],run=k.run;
 let s=`<rect x="290" y="90" width="420" height="410" fill="var(--cav)" opacity="${inter?.9:.4}"/>`;
 let calef='',bim='',mec='',cont='';
 /* conductores y calefactores */
 PX.forEach((px,i)=>{const x=e.x[i],dx=x*34;
  calef+=`<rect x="${px-22}" y="80" width="10" height="${96}" fill="${run?'url(#cCu)':'url(#cCu)'}" stroke="#4a2410" stroke-opacity=".6"/><rect x="${px+12}" y="296" width="10" height="214" fill="url(#cCu)" stroke="#4a2410" stroke-opacity=".6"/>`;
  calef+=coilW(px,170,290,dx,x);
  if(run&&k.I[i]>0)calef+=`<path class="flowd" d="M${px-17} 82V170M${px+17} 296V508" pointer-events="none"/>`;
  bim+=`<rect x="${px-22}" y="322" width="44" height="26" rx="3" fill="url(#cPlL)" stroke="#111"/>`+strip(px,324,142,dx)});
 /* barras deslizantes */
 const dA=Math.max(e.x[0],e.x[1])*34,dB=Math.max(e.x[1],e.x[2])*34;
 mec+=`<rect x="${352+dA}" y="118" width="${150}" height="14" rx="3" fill="url(#cPlL)" stroke="#111"/><rect x="${462+dB}" y="102" width="${150}" height="14" rx="3" fill="url(#cPlL)" stroke="#111"/>`;
 /* palanca (bell-crank) */
 const ang=cl(S.o.lv,0,1.4)*18;
 mec+=`<g transform="rotate(${ang} 660 160)"><path d="M626 108L668 104L690 150L672 236L650 236L646 150Z" fill="url(#cPlL)" stroke="#111" stroke-width="1.6"/><circle cx="660" cy="160" r="8" fill="url(#cMeV)" stroke="#333"/></g><rect x="${628+Math.max(dA,dB)*.1}" y="${236}" width="10" height="${64+S.o.sw*20}" fill="url(#cPlL)" stroke="#111"/>`;
 /* contactos */
 const ncY=304+o.sw*20,noY=396+o.sw*20;
 cont+=`<rect x="590" y="288" width="104" height="156" rx="6" fill="var(--cav)" stroke="#000" stroke-opacity=".4"/>`;
 cont+=`<circle cx="610" cy="298" r="5" fill="url(#cAg)"/><circle cx="676" cy="298" r="5" fill="url(#cAg)"/><rect x="604" y="${ncY}" width="78" height="7" rx="2" fill="url(#cCuV)" stroke="#4a2410"/>`;
 cont+=`<circle cx="610" cy="428" r="5" fill="url(#cAg)"/><circle cx="676" cy="428" r="5" fill="url(#cAg)"/><rect x="604" y="${noY}" width="78" height="7" rx="2" fill="url(#cCuV)" stroke="#4a2410"/>`;
 s+=g(S,'calef','calef',calef)+g(S,'bimetal','bimetal',bim)+g(S,'mec','deslizador',mec.split('<g transform')[0])+g(S,'mec','palanca','<g transform'+mec.split('<g transform')[1]);
 s+=g(S,'cont','cont_nc',cont.split('<circle cx="610" cy="428"')[0])+g(S,'cont','cont_no','<circle cx="610" cy="428"'+cont.split('<circle cx="610" cy="428"')[1]);
 /* carcasa y tapa */
 let car=`<rect x="290" y="80" width="420" height="430" rx="14" fill="url(#cPl)" stroke="#0b0e11" stroke-width="2" opacity="${LA(S)}"/><rect x="290" y="80" width="420" height="430" rx="14" fill="url(#cPlH)" opacity="${LA(S)}"/><rect x="290" y="80" width="420" height="430" rx="14" fill="url(#pRib)" opacity="${.4*LA(S)}"/>`;
 if(inter)car=`<rect x="290" y="80" width="420" height="430" rx="14" fill="none" stroke="#8fa1b4" stroke-width="3" stroke-dasharray="10 6"/>`;
 s+=g(S,'carcasa','carcasa',car);
 const a=LA(S);
 let tp=`<rect x="304" y="170" width="260" height="160" rx="10" fill="url(#cPlL)" stroke="#0b0e11" stroke-width="2" opacity="${a}"/>`;
 const Ir=k.Ir/(S.c.f.mal?1.4:1),ik=cl((c.p.Ir-2.5)/1.5,0,1),rot=-120+ik*240;
 tp+=`<g opacity="${a}"><circle cx="400" cy="250" r="62" fill="#e9eef3" stroke="#222" stroke-width="2"/>`;for(let i=0;i<=6;i++){const th=(-120+i*40)*Math.PI/180,x1=400+Math.sin(th)*50,y1=250-Math.cos(th)*50,x2=400+Math.sin(th)*60,y2=250-Math.cos(th)*60;tp+=`<path d="M${x1} ${y1}L${x2} ${y2}" stroke="#111" stroke-width="2.4"/>`}
 tp+=`<circle cx="400" cy="250" r="38" fill="url(#cKnob)" stroke="#000"/><g transform="rotate(${rot} 400 250)"><path d="M400 250V218" stroke="#ffd65a" stroke-width="5" stroke-linecap="round"/></g></g>`;
 tp+=`<text x="400" y="334" text-anchor="middle" style="font:700 12px system-ui;fill:#f0f4f8" opacity="${a}">Ir ${fm(c.p.Ir,1)} A</text><text x="340" y="196" style="font:600 10px system-ui;fill:#10202e" opacity="${a}">2,5</text><text x="440" y="196" style="font:600 10px system-ui;fill:#10202e" opacity="${a}">4</text>`;
 s+=g(S,'tapa','tapa',tp);
 /* indicador y botones */
 let btn=`<rect x="440" y="104" width="120" height="30" rx="6" fill="#161b21" stroke="#000" opacity="${a}"/><rect x="448" y="109" width="104" height="20" rx="3" fill="${o.trip?'#f08a1f':'#2a8f61'}" opacity="${a}"/><text x="500" y="124" text-anchor="middle" style="font:800 12px system-ui;fill:#fff" opacity="${a}">${o.trip?'DISPARO':'LISTO'}</text>`;
 s+=g(S,'tapa','indicador',btn);
 s+=g(S,'tapa','stop',`<circle cx="360" cy="400" r="26" fill="#c0392b" stroke="#000" stroke-width="2" opacity="${a}"/><circle cx="360" cy="396" r="20" fill="#e24b3b" opacity="${a*.8}"/><text x="360" y="448" text-anchor="middle" style="font:700 12px system-ui;fill:#f0f4f8" opacity="${a}">STOP</text>`);
 s+=g(S,'tapa','reset',`<circle cx="450" cy="400" r="26" fill="#2c6fb5" stroke="#000" stroke-width="2" opacity="${a}"/><circle cx="450" cy="396" r="20" fill="#4c93d9" opacity="${a*.8}"/><text x="450" y="448" text-anchor="middle" style="font:700 12px system-ui;fill:#f0f4f8" opacity="${a}">RESET</text>`);
 s+=g(S,'tapa','test',`<circle cx="520" cy="402" r="14" fill="#6b7480" stroke="#000" stroke-width="2" opacity="${a}"/><text x="520" y="448" text-anchor="middle" style="font:700 12px system-ui;fill:#f0f4f8" opacity="${a}">TEST</text>`);
 s+=g(S,'bornes','cont_nc',[620,680].map(x=>`<rect x="${x-18}" y="296" width="36" height="22" rx="3" fill="url(#cMe)" stroke="#3a4450" opacity="${a}"/>${screw(x,307,8,x)}`).join('')+[620,680].map(x=>`<rect x="${x-18}" y="430" width="36" height="22" rx="3" fill="url(#cMe)" stroke="#3a4450" opacity="${a}"/>${screw(x,441,8,x)}`).join(''));
 /* bornes */
 let bi='',bo='';PX.forEach((x,i)=>{bi+=`<rect x="${x-32}" y="62" width="64" height="20" rx="3" fill="url(#cMe)" stroke="#3a4450"/>${screw(x,54,10,20+i*30)}`;bo+=`<rect x="${x-32}" y="508" width="64" height="20" rx="3" fill="url(#cMe)" stroke="#3a4450"/>${screw(x,534,10,50+i*20)}`});
 s+=g(S,'bornes','term_in',bi)+g(S,'bornes','term_out',bo);
 if(has(S,'bornes')){s+=['1/L1','3/L2','5/L3'].map((q,i)=>tag(PX[i],36,q,'s')).join('')+['2/T1','4/T2','6/T3'].map((q,i)=>tag(PX[i],556,q,'s')).join('')+tag(650,290,'95      96','s')+tag(650,470,'97      98','s')}
 if(has(S,'etiq')){s+=lbl(270,150,'Lámina bimetálica','l',px2(0,e),150)+lbl(270,235,'Calefactor','l',366,235)+lbl(270,320,'Base de la lámina','l',366,336)+lbl(730,92,'Barras deslizantes','r',612,109)+lbl(730,200,'Palanca de disparo','r',664,200)+lbl(730,300,'NC 95-96','r',690,305)+lbl(730,420,'NA 97-98','r',690,430)}
 return s+title(inter?'Interior (sin tapa): así dispara':'Vista frontal')}
const px2=(i,e)=>380+e.x[i]*34*.98;

/* ====================== LATERAL ====================== */
function lat(S){const{o,c,e,k}=S,x=e.x[1],dx=x*40,run=k.run;
 let s=`<rect x="330" y="110" width="340" height="380" fill="var(--cav)" opacity=".5"/>`;
 let calef=`<rect x="352" y="96" width="12" height="80" fill="url(#cCu)" stroke="#4a2410"/><rect x="636" y="300" width="12" height="190" fill="url(#cCu)" stroke="#4a2410"/>`;
 const sg=[];for(let i=0;i<9;i++){const y=170+i*15,sh=dx*((330-y)/200)**2;calef+=`<ellipse cx="${500+sh}" cy="${y}" rx="17" ry="5" fill="none" stroke="${heatCol(x)}" stroke-width="3.4"/>`}
 if(x>.35)calef=glow(500+dx*.3,230,40,'#ff5a1f',cl((x-.3)*.8,0,.7))+calef;
 s+=g(S,'calef','calef',calef);
 s+=g(S,'bimetal','bimetal',`<rect x="470" y="322" width="62" height="26" rx="3" fill="url(#cPlL)" stroke="#111"/>`+strip(500,324,142,dx));
 s+=g(S,'mec','palanca',`<rect x="${470+dx*.9}" y="112" width="150" height="14" rx="3" fill="url(#cPlL)" stroke="#111"/>`);
 let car=`<rect x="310" y="92" width="380" height="418" rx="16" fill="url(#cPl)" stroke="#0b0e11" stroke-width="2" opacity="${LA(S)}"/><rect x="310" y="92" width="380" height="418" rx="16" fill="url(#cPlH)" opacity="${LA(S)}"/><rect x="250" y="240" width="60" height="100" fill="url(#cMe)" stroke="#3a4450" opacity="${Math.max(.3,LA(S))}"/>`;
 s+=g(S,'carcasa','carcasa',car);
 s+=g(S,'tapa','tapa',`<path d="M650 92h24a16 16 0 0 1 16 16V494a16 16 0 0 1-16 16h-24Z" fill="url(#cPlL)" stroke="#0b0e11" stroke-width="2" opacity="${LA(S)}"/><rect x="662" y="150" width="14" height="${100}" rx="3" fill="${o.trip?'#f08a1f':'#2a8f61'}" opacity="${LA(S)}"/>`);
 s+=g(S,'bornes','term_in',`<rect x="330" y="64" width="64" height="30" rx="4" fill="url(#cMe)" stroke="#3a4450"/>${screw(362,54,10,30)}`)+g(S,'bornes','term_out',`<rect x="606" y="480" width="64" height="30" rx="4" fill="url(#cMe)" stroke="#3a4450"/>${screw(638,522,10,60)}`);
 s+=tag(362,36,'1/L1','s')+tag(638,552,'2/T1','s');
 s+=`<text x="280" y="360" text-anchor="middle" class="lab s">Riel DIN</text>`;
 if(has(S,'etiq')){s+=lbl(250,160,'Calefactor','l',512,200)+lbl(250,420,'Lámina bimetálica','l',500,300)}
 return s+title('Vista lateral (la lámina se curva hacia adelante)')}

/* ====================== SUPERIOR ====================== */
function sup(S){const PX=[380,490,600];let s=`<rect x="284" y="140" width="432" height="280" fill="var(--cav)" opacity=".4"/>`;
 const e=S.e;let bim='';PX.forEach((x,i)=>{bim+=`<rect x="${x-9}" y="${200}" width="18" height="${150}" fill="url(#cSteel)" stroke="#333" transform="translate(${e.x[i]*0},0)"/>`});
 s+=g(S,'bimetal','bimetal',bim);
 s+=g(S,'carcasa','carcasa',`<rect x="290" y="130" width="420" height="300" rx="14" fill="url(#cPl)" stroke="#0b0e11" stroke-width="2" opacity="${LA(S)}"/><rect x="290" y="130" width="420" height="300" rx="14" fill="url(#cPlH)" opacity="${LA(S)}"/><rect x="290" y="130" width="420" height="300" rx="14" fill="url(#pRib)" opacity="${.4*LA(S)}"/>`);
 s+=g(S,'tapa','tapa',`<rect x="290" y="360" width="420" height="70" rx="12" fill="url(#cPlL)" stroke="#0b0e11" stroke-width="2" opacity="${LA(S)}"/><text x="500" y="404" text-anchor="middle" style="font:800 15px system-ui;fill:#f0f4f8" opacity="${LA(S)}">FRENTE</text>`);
 let bn='';PX.forEach((x,i)=>{bn+=`<rect x="${x-34}" y="152" width="68" height="76" rx="5" fill="url(#cMe)" stroke="#3a4450"/><rect x="${x-24}" y="204" width="48" height="12" rx="3" fill="#10161d"/>${screw(x,178,18,i*25)}`});
 s+=g(S,'bornes','term_in',bn);
 s+=['1/L1','3/L2','5/L3'].map((q,i)=>tag(PX[i],140,q,'s')).join('')+tag(500,462,'↓ frente ↓','s');
 return s+title('Vista superior')+tag(500,100,'Los bornes de entrada se acoplan al contactor','s')}

/* ====================== TRASERA ====================== */
function tra(S){const PX=[620,510,400];let s=`<rect x="290" y="90" width="420" height="410" fill="var(--cav)" opacity=".4"/>`;
 s+=g(S,'carcasa','carcasa',`<rect x="290" y="80" width="420" height="430" rx="14" fill="url(#cPl)" stroke="#0b0e11" stroke-width="2" opacity="${LA(S)}"/><rect x="290" y="80" width="420" height="430" rx="14" fill="url(#cPlH)" opacity="${LA(S)}"/>`);
 s+=g(S,'tapa','tapa',`<rect x="290" y="262" width="420" height="52" fill="#0b0e11" opacity="${.65*LA(S)}"/><rect x="290" y="262" width="420" height="6" fill="#000" opacity="${.5*LA(S)}"/><rect x="440" y="470" width="120" height="38" rx="5" fill="url(#cMe)" stroke="#3a4450" opacity="${LA(S)}"/><rect x="490" y="482" width="20" height="8" rx="3" fill="#2c3540" opacity="${LA(S)}"/><rect x="320" y="120" width="130" height="80" rx="5" fill="#e9eef3" opacity="${.9*LA(S)}"/><text x="385" y="150" text-anchor="middle" style="font:700 11px system-ui;fill:#10202e" opacity="${LA(S)}">RELÉ TÉRMICO</text><text x="385" y="168" text-anchor="middle" style="font:600 10px system-ui;fill:#10202e" opacity="${LA(S)}">Clase 10 · 2,5–4 A</text><text x="385" y="184" text-anchor="middle" style="font:600 10px system-ui;fill:#10202e" opacity="${LA(S)}">IEC 60947-4-1</text>`);
 let bn='';PX.forEach((x,i)=>{bn+=`<rect x="${x-32}" y="62" width="64" height="20" rx="3" fill="url(#cMe)" stroke="#3a4450"/>${screw(x,54,10,20+i*30)}`});
 s+=g(S,'bornes','term_in',bn)+tag(500,254,'Canal para riel DIN de 35 mm','s');
 return s+title('Vista trasera')}

/* ====================== SÍMBOLO IEC ====================== */
function iec(S){const{o,c,e,k}=S,run=k.run,R='#b5733e',Sc='#9aa5b1',Tc='#ee5a4d',N='#58b8e8',off='#566678',cols=[R,Sc,Tc],X=[130,230,330];
 let s=`<text x="500" y="24" class="lab c t">Símbolos IEC · tocá S1 para arrancar el motor</text><text x="230" y="56" class="lab c t">Potencia</text><text x="760" y="56" class="lab c t">Mando</text>`;
 X.forEach((x,i)=>{
  s+=`<text x="${x}" y="78" class="lab c s">${['R','S','T'][i]}</text><path d="M${x} 90V150" stroke="${cols[i]}" stroke-width="5" fill="none"/>`;
  /* contactor K1 */
  const cc=!!c.coil&&!o.trip;s+=`<circle cx="${x}" cy="150" r="4.5" fill="var(--ink)"/><circle cx="${x}" cy="210" r="4.5" fill="var(--ink)"/><path d="M${x} 210L${x-(cc?0:18)} 154" stroke="var(--ink)" stroke-width="5" stroke-linecap="round"/><path d="M${x} 210V260" stroke="${cc?cols[i]:off}" stroke-width="5"/>`;
  /* térmico F2: calefactor (rectángulo con bimetal) */
  s+=`<rect x="${x-14}" y="260" width="28" height="56" fill="${cc&&e.x[i]>.4?'#7a3a14':'none'}" stroke="var(--ink)" stroke-width="4"/><path d="M${x-14} 268l-12 0M${x+14} 308l12 0" stroke="var(--ink)" stroke-width="0"/><path d="M${x} 316V400" stroke="${cc?cols[i]:off}" stroke-width="5"/>`;
  if(cc)s+=`<path class="flowd" d="M${x} 90V400" opacity=".85"/>`});
 s+=`<text x="${X[0]-40}" y="190" class="lab r s">K1</text><text x="${X[0]-40}" y="296" class="lab r s">F2</text>`;
 s+=`<path d="M90 182H${X[2]+30}" stroke="var(--ink)" stroke-width="3" stroke-dasharray="9 7" opacity=".8"/><path d="M90 290H${X[2]+30}" stroke="var(--ink)" stroke-width="3" stroke-dasharray="9 7" opacity=".8"/>`;
 s+=`<circle cx="230" cy="450" r="42" fill="none" stroke="var(--ink)" stroke-width="4"/><text x="230" y="446" class="lab c t">M</text><text x="230" y="468" class="lab c">3 ~</text>`;
 ['M130 400V450H188','M230 400V408','M330 400V450H272'].forEach((p,i)=>s+=`<path d="${p}" stroke="${run?cols[i]:off}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);
 if(run)s+=`<g transform="rotate(${(S.ui.t*400)%360} 230 450)" opacity=".7"><path d="M230 414A36 36 0 0 1 266 450" stroke="#ffd65a" stroke-width="5" fill="none"/></g>`;
 /* mando */
 const on=c.coil,live=on&&!o.trip;
 s+=`<path d="M560 80H940" stroke="${R}" stroke-width="5"/><text x="540" y="86" class="lab r">F</text><path d="M560 510H940" stroke="${N}" stroke-width="5"/><text x="540" y="516" class="lab r">N</text>`;
 s+=`<g data-act="toggle"><rect x="590" y="110" width="110" height="110" fill="transparent"/><path d="M645 80V120" stroke="${R}" stroke-width="5"/><circle cx="645" cy="120" r="4.5" fill="var(--ink)"/><circle cx="645" cy="180" r="4.5" fill="var(--ink)"/><path d="M645 180L${on?645:622} 124" stroke="var(--ink)" stroke-width="5" stroke-linecap="round"/><path d="M645 180V210" stroke="${on?R:off}" stroke-width="5"/><text x="668" y="154" class="lab">S1</text><text x="668" y="174" class="lab s">(tocá)</text></g>`;
 /* 95-96 NC */
 s+=`<circle cx="645" cy="210" r="4.5" fill="var(--ink)"/><circle cx="645" cy="270" r="4.5" fill="var(--ink)"/><path d="M645 270L${e.nc?645:622} 214" stroke="var(--ink)" stroke-width="5" stroke-linecap="round"/><path d="M630 214H660" stroke="var(--ink)" stroke-width="3"/><text x="668" y="226" class="lab s">95</text><text x="668" y="284" class="lab s">96</text><text x="590" y="250" class="lab s r" style="text-anchor:end">F2</text><path d="M645 270V320" stroke="${live?R:off}" stroke-width="5"/>`;
 s+=`<rect x="615" y="320" width="60" height="64" fill="${live?'#5a3a14':'none'}" stroke="var(--ink)" stroke-width="4"/><text x="645" y="358" class="lab c">K1</text><text x="628" y="316" class="lab s" style="text-anchor:end">A1</text><text x="628" y="400" class="lab s" style="text-anchor:end">A2</text><path d="M645 384V510" stroke="${live?N:off}" stroke-width="5"/>`;
 if(live)s+=`<path class="flowd" d="M645 90V320M645 384V510"/>`;
 /* lámpara de falla 97-98 */
 s+=`<path d="M800 80V190" stroke="${R}" stroke-width="5"/><circle cx="800" cy="190" r="4.5" fill="var(--ink)"/><circle cx="800" cy="250" r="4.5" fill="var(--ink)"/><path d="M800 250L${e.no?800:778} 194" stroke="var(--ink)" stroke-width="5" stroke-linecap="round"/><text x="814" y="204" class="lab s">97</text><text x="814" y="264" class="lab s">98</text><path d="M800 250V340" stroke="${e.no?R:off}" stroke-width="5"/>`;
 s+=`<circle cx="800" cy="372" r="28" fill="${e.no?'#c0392b':'none'}" stroke="var(--ink)" stroke-width="4"/><path d="M780 352L820 392M820 352L780 392" stroke="var(--ink)" stroke-width="4"/><text x="842" y="378" class="lab">H2</text><path d="M800 400V510" stroke="${e.no?N:off}" stroke-width="5"/><text x="800" y="120" class="lab c s">falla</text>`;
 s+=`<path d="M690 236H880" stroke="var(--ink)" stroke-width="3" stroke-dasharray="9 7" opacity=".6"/>`;
 s+=`<text x="500" y="540" class="lab c s">El NC 95-96 del térmico está en serie con la bobina K1: si dispara, el contactor se abre.</text>`;
 return s}
})();
