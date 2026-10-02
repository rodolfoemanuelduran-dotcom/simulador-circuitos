/* Componente "Guardamotor" (interruptor magnetotérmico para motor). Usa comp-comun.js. */
(function(){
const{cl,fm,g,screw,glow,lbl,tag,title,sparks,heatCol,strip,DEFS,stroke4}=window.CPH;
const TAU=180,TAUC=320,HT=1.25,IN=3.6,MAG=13;
const SIT={n:1,s:1.5,b:7,c:15};
const PX=[380,490,600];
const PARTES={
 palanca:{t:'Perilla (palanca) ON / OFF / TRIP',d:'Conecta y desconecta a mano. Cuando el guardamotor dispara por sobrecarga o cortocircuito la perilla queda en una posición intermedia (TRIP). Para rearmar hay que llevarla a OFF y luego a ON.'},
 ajuste:{t:'Regulación del térmico',d:'Se ajusta a la corriente nominal del motor (chapa). El rango del ejemplo es 2,5–4 A. El disparo magnético está fijo en unas 13 veces ese valor.'},
 contactos:{t:'Contactos principales',d:'Tres contactos de plata, uno por fase, que se cierran todos juntos con la perilla. Están diseñados para cortar corrientes de cortocircuito de miles de amperes.'},
 magnetico:{t:'Disparador magnético (solenoide)',d:'Una bobina de pocas espiras y alambre grueso, en serie con cada fase. Con una corriente enorme (cortocircuito) atrae un émbolo y desengancha el mecanismo al instante, en pocos milisegundos.'},
 bimetal:{t:'Lámina bimetálica',d:'Protección térmica contra sobrecargas: se calienta con el calefactor, se curva y empuja la barra de disparo, igual que en el relé térmico.'},
 calef:{t:'Calefactor',d:'Resistencia arrollada a la lámina por la que pasa la corriente del motor (efecto Joule).'},
 barra:{t:'Barra de disparo y portacontactos',d:'Une los tres polos. Al ser empujada por cualquiera de los disparadores, libera el enganche y el resorte abre los tres contactos a la vez.'},
 term_in:{t:'Bornes de entrada 1/L1 · 3/L2 · 5/L3',d:'Entrada desde la red. Pueden alimentar al guardamotor directamente o a través de un barral de conexión.'},
 term_out:{t:'Bornes de salida 2/T1 · 4/T2 · 6/T3',d:'Salida hacia el contactor y el motor (o directo al motor).'},
 carcasa:{t:'Carcasa',d:'Plástico aislante. Contiene las cámaras de extinción del arco y el mecanismo.'},
 tapa:{t:'Frente',d:'Lleva la perilla, la escala de regulación y la identificación de bornes.'},
 din:{t:'Riel DIN',d:'Se monta a presión sobre un riel de 35 mm.'}
};
C({
 titulo:'El guardamotor',
 intro:'Interruptor automático para motores. Reúne en un solo aparato un interruptor manual, una protección térmica regulable contra sobrecargas y una protección magnética contra cortocircuitos. Reemplaza a los fusibles y al relé térmico en muchos arranques.',
 vistaIni:'frontal',
 vistas:[{id:'frontal',t:'Frontal'},{id:'lateral',t:'Lateral'},{id:'superior',t:'Superior'},{id:'trasera',t:'Trasera'},{id:'interior',t:'Interior'}],
 capas:[{id:'carcasa',t:'Carcasa'},{id:'tapa',t:'Frente y perilla'},{id:'bornes',t:'Bornes y tornillos'},{id:'contactos',t:'Contactos y portacontactos'},{id:'magnetico',t:'Disparador magnético'},{id:'bimetal',t:'Láminas y calefactores'},{id:'mec',t:'Barra de disparo'},{id:'etiq',t:'Nombres de las piezas'}],
 btnOn:'🖐 Perilla en ON (conectar)',btnOff:'🖐 Perilla en OFF (desconectar)',
 fallas:[
  {id:'falta',t:'Falta una fase',d:'El motor queda en monofásico: las otras fases toman más corriente.'},
  {id:'mal',t:'Regulación demasiado alta',d:'El térmico se ajustó muy por encima de la corriente del motor: protege mal.'}],
 fallaVista:{falta:'interior',mal:'frontal'},
 partes:PARTES,
 controles:[
  {k:'sit',t:'choice',l:'Situación',v:'n',o:[['n','Normal'],['a','Arranque (6× por 2 s)'],['s','Sobrecarga 1,5×'],['b','Rotor bloqueado 7×'],['c','Cortocircuito 15×']]},
  {k:'Ir',t:'slider',l:'Regulación del térmico',min:2.5,max:4,st:.1,v:3.6,fmt:v=>fm(v,1)+' A'},
  {k:'vel',t:'choice',l:'Velocidad del tiempo (térmico)',v:'10',num:true,o:[['1','Real ×1'],['10','×10'],['30','×30']]}],
 init(){return{h:[0,0,0],on:false,trip:'',ct:0,pl:0,hd:-45,ton:0,spark:0,msg:'',msgT:0}},
 reinicio(o){o.h=[0,0,0];o.on=false;o.trip='';o.ct=0;o.pl=0},
 accion(){return[]},
 corr(o,c){const f=c.f,sit=c.p.sit,run=o.on,Ir=c.p.Ir*(f.mal?1.4:1);let m=SIT[sit]||1;if(sit==='a')m=o.ton<2?6:1;const Ib=run?IN*m:0;let I=[Ib,Ib,Ib];if(f.falta&&run)I=[0,Ib*1.73,Ib*1.73];return{I,Ir,run,m}},
 paso(o,dt,c,t){const ev=[];if(dt<=0)return ev;
  const x0=Math.max(...o.h)/HT;
  if(!c.coil){o.on=false;o.trip=''}
  else if(!o.on&&!o.trip){if(x0>.5){o.msg='El térmico todavía está caliente: esperá a que se enfríen las láminas.';o.msgT=2}else{o.on=true;o.ton=0;ev.push('clack')}}
  if(o.on)o.ton+=dt;else o.ton=0;
  const {I,Ir}=this.corr(o,c),vel=+c.p.vel||10,de=dt*vel,n=Math.max(1,Math.ceil(de/.5)),h=de/n;
  if(o.on&&Math.max(...I)>=MAG*Ir){o.trip='mag';o.on=false;o.spark=.3;ev.push('clack','spark')}
  for(let k=0;k<n;k++)for(let i=0;i<3;i++){const q=I[i]/Ir,tg=q*q,ta=tg>o.h[i]?TAU:TAUC;o.h[i]+=(tg-o.h[i])*h/ta}
  const x=o.h.map(v=>cl(v/HT,0,1.2)),mx=Math.max(...x),mn=Math.min(...x);
  if(o.on&&mx+.6*(mx-mn)>=1){o.trip='term';o.on=false;ev.push('clack')}
  o.ct+=((o.on?1:0)-o.ct)*Math.min(1,dt*(o.on?14:35));
  o.pl+=((o.trip==='mag'?1:0)-o.pl)*Math.min(1,dt*(o.trip==='mag'?40:6));
  const hd=o.on?45:o.trip?0:-45;o.hd+=(hd-o.hd)*Math.min(1,dt*18);
  if(o.spark>0)o.spark-=dt;if(o.msgT>0){o.msgT-=dt;if(o.msgT<=0)o.msg=''}
  return ev},
 est(o){const x=o.h.map(v=>cl(v/HT,0,1.2));return{x}},
 lecturas(o,c){const {I,Ir,run}=this.corr(o,c),e=this.est(o),f=c.f,vel=+c.p.vel||10,qmax=Math.max(...I)/Ir;
  let tt='—';if(run){const hm=Math.max(...o.h),tg=qmax*qmax,target=f.falta?HT*.625:HT;if(qmax*Ir>=MAG*Ir)tt='instantáneo (<10 ms)';else if(tg>target+.001){const ts=-TAU*Math.log(1-(target-hm)/(tg-hm))/vel;tt=hm>=target?'ya':ts<60?fm(ts,1)+' s':fm(ts/60,1)+' min'}else tt='nunca (no dispara)'}else if(o.trip)tt='disparó';
  const est=o.trip==='mag'?'DISPARO MAGNÉTICO':o.trip==='term'?'DISPARO TÉRMICO':o.on?'conectado':'desconectado (OFF)';
  const reads=[{l:'CORRIENTE DE FASE (MÁX.)',v:fm(Math.max(...I),1)+' A',on:run},{l:'REGULACIÓN TÉRMICA',v:fm(Ir,1)+' A',on:null},{l:'UMBRAL MAGNÉTICO (13×)',v:fm(MAG*Ir,0)+' A',on:null},{l:'CALENTAMIENTO',v:Math.round(Math.max(...e.x)*100)+' %',on:e.x[0]<.5?null:false},{l:'DISPARO PREVISTO EN',v:tt,on:null},{l:'ESTADO',v:est,on:o.on},{l:'MOTOR',v:run?'girando':'detenido',on:run},{l:'PERILLA',v:o.on?'ON':o.trip?'TRIP':'OFF',on:null}];
  let verdict;
  if(o.msg)verdict={cls:'warn',t:o.msg};
  else if(o.trip==='mag')verdict={cls:'bad',t:'Cortocircuito: la corriente superó 13 veces el ajuste y el disparador magnético abrió los contactos en milisegundos. Hay que eliminar la falla antes de rearmar (OFF y luego ON).'};
  else if(o.trip==='term')verdict={cls:'bad',t:'Sobrecarga prolongada: las láminas se curvaron y dispararon. Esperá que se enfríen, corregí la causa y rearmá (OFF y luego ON).'};
  else if(!run)verdict={cls:'ok',t:'Guardamotor desconectado: el motor no recibe tensión.'};
  else if(f.mal&&qmax<1.1&&c.p.sit!=='n')verdict={cls:'bad',t:'Con la regulación tan alta, la sobrecarga no dispara: el motor se recalienta sin protección.'};
  else if(c.p.sit==='a'&&o.ton<2)verdict={cls:'ok',t:'Arranque: la corriente es alta (6×) pero está lejos del umbral magnético y dura poco, así que ni el térmico ni el magnético actúan.'};
  else if(qmax<=1.05)verdict={cls:'ok',t:'Corriente normal: ninguna protección actúa.'};
  else verdict={cls:'warn',t:'Sobrecarga: las láminas se calientan. Cuanto mayor la corriente, más rápido dispara (tiempo inverso).'};
  return{reads,verdict}},
 pasos:[
  {t:'Desconectado (OFF)',coil:false,ini(o){o.h=[0,0,0];o.on=false;o.trip=''},p:{sit:'n'},hl:['palanca','contactos'],vista:'interior',x:'Con la <b>perilla en OFF</b> los tres contactos están abiertos: el motor no recibe tensión. El guardamotor también sirve como <b>interruptor manual</b> para dejar la máquina fuera de servicio.'},
  {t:'Se conecta (ON)',coil:true,p:{sit:'n'},hl:['palanca','contactos'],x:'Al llevar la perilla a ON el mecanismo cierra los <b>tres contactos principales</b> a la vez y queda enganchado. La corriente recorre cada polo: contacto, solenoide, calefactor y salida hacia el motor.'},
  {t:'Arranque: pico que se tolera',coil:true,p:{sit:'a'},ini(o){o.h=[0,0,0];o.on=false;o.trip='';o.ton=0},hl:['magnetico','bimetal'],x:'Al arrancar, el motor toma unas <b>6 veces</b> su corriente nominal durante un instante. El umbral magnético (13×) está por encima y el térmico necesita tiempo para calentarse: <b>no dispara</b>. Esa tolerancia es clave en un guardamotor.'},
  {t:'Sobrecarga: actúa el térmico',coil:true,p:{sit:'s',vel:'30'},ini(o){o.h=[0,0,0];o.on=false;o.trip=''},hl:['bimetal','calef','barra'],x:'Con <b>1,5×</b> la corriente no alcanza el umbral magnético, pero los calefactores calientan las láminas. Tras un tiempo se curvan, empujan la <b>barra de disparo</b> y los contactos se abren. Es la protección lenta, de tiempo inverso.'},
  {t:'Cortocircuito: actúa el magnético',coil:true,p:{sit:'c'},ini(o){o.h=[0,0,0];o.on=false;o.trip=''},hl:['magnetico','barra'],x:'Con <b>15×</b> la corriente, el campo del <b>solenoide</b> es tan intenso que el émbolo salta al instante y desengancha el mecanismo. Los contactos abren en pocos milisegundos y el arco se apaga en las cámaras. Es la protección instantánea.'},
  {t:'Rearme',coil:false,p:{sit:'n'},hl:['palanca'],x:'Tras un disparo la perilla queda en <b>TRIP</b>. Para rearmar se lleva a <b>OFF</b> y luego a <b>ON</b> (probalo con el botón “Perilla”). Antes hay que eliminar la causa y, si fue sobrecarga, esperar que las láminas se enfríen.'}],
 usos:[
  {t:'Arranque directo de un motor trifásico',x:'El guardamotor protege el motor y el cable contra sobrecargas y cortocircuitos y permite conectarlo y desconectarlo a mano. Si se quiere comando a distancia, se agrega un contactor aguas abajo.',sim:true},
  {t:'Reemplazo de fusibles + relé térmico',x:'Antes había que combinar fusibles (cortocircuito), contactor y relé térmico (sobrecarga). El guardamotor integra la protección térmica y magnética en un solo aparato más pequeño y rearmable.'},
  {t:'Taller con varias máquinas',x:'Cada máquina tiene su guardamotor regulado a la corriente de su motor, visible y accesible. Si una se traba, dispara sin afectar a las demás.'},
  {t:'Coordinación con el contactor',x:'En las maniobras frecuentes el contactor es quien conecta y desconecta; el guardamotor sólo protege. Así se cuida su mecanismo manual y se alarga su vida útil.',sim:true}],
 ejercicios:[
  {q:'¿Qué protecciones reúne un guardamotor?',o:['Sólo térmica','Térmica (sobrecarga) y magnética (cortocircuito)','Sólo diferencial'],ok:1,why:'Tiene un disparo térmico regulable y un disparo magnético instantáneo fijo, además de ser un interruptor manual.'},
  {q:'Con una corriente 15 veces la de ajuste, ¿cuál actúa?',o:['El térmico, en minutos','El magnético, al instante','Ninguno'],ok:1,why:'15× supera el umbral de unas 13 veces: el solenoide desengancha el mecanismo en milisegundos.',ver:{vista:'interior',coil:true,p:{sit:'c'}}},
  {q:'Durante el arranque el motor toma 6× su corriente por un instante. ¿Por qué no dispara?',o:['Porque está por debajo de 13× y dura poco','Porque está roto','Porque el térmico no existe'],ok:0,why:'El magnético tiene un umbral más alto y el térmico necesita tiempo para calentarse.',ver:{vista:'interior',coil:true,p:{sit:'a'}}},
  {q:'Con 1,5× de sobrecarga, ¿quién dispara?',o:['El magnético','El térmico después de un tiempo','Nunca dispara'],ok:1,why:'La lámina se calienta de a poco; a mayor corriente, menor tiempo.',ver:{vista:'interior',coil:true,p:{sit:'s',vel:'30'}}},
  {q:'El guardamotor disparó y la perilla quedó en TRIP. Para rearmar…',o:['Se la lleva a OFF y después a ON','Se la fuerza hacia ON','Hay que cambiarlo'],ok:0,why:'Hay que pasar por OFF para rearmar el mecanismo, después de eliminar la causa.'},
  {q:'La regulación del térmico debe coincidir con…',o:['La tensión de red','La corriente nominal del motor (chapa)','La potencia del contactor'],ok:1,why:'Si es mayor no protege; si es menor, dispara en servicio normal.'}],
 defs(){return DEFS},
 dibujar(view,o,c,ui){const e=this.est(o),k=this.corr(o,c),S={o,c,ui,e,k,inter:view==='interior'};
  if(view==='lateral')return lat(S);if(view==='superior')return sup(S);if(view==='trasera')return tra(S);return fro(S)},
 simbolo(o,c,ui){return iec({o,c,ui,e:this.est(o),k:this.corr(o,c)})}
});
function C(def){['est','corr'].forEach(k=>def[k]=def[k].bind(def));window.COMPONENTES.guardamotor=def}
const LA=S=>S.inter?.07:1-S.ui.T,has=(S,k)=>S.ui.capas.has(k);

function fro(S){const{o,c,e,k,inter}=S,run=k.run,a=LA(S);
 let s=`<rect x="290" y="90" width="420" height="410" fill="var(--cav)" opacity="${inter?.9:.4}"/>`;
 let con='',mag='',bim='',mec='',calef='';
 PX.forEach((px,i)=>{const x=e.x[i],dx=x*30,open=(1-o.ct)*24;
  con+=`<rect x="${px-9}" y="80" width="18" height="76" fill="${run?'url(#cCuH)':'url(#cCu)'}" stroke="#4a2410" stroke-opacity=".6"/><rect x="${px-26}" y="148" width="52" height="14" rx="2" fill="url(#cMe)" stroke="#3a4450"/><rect x="${px-20}" y="162" width="40" height="4" fill="url(#cAg)"/>`;
  con+=`<rect x="${px-26}" y="${170+open}" width="52" height="12" rx="2" fill="${run?'url(#cCuH)':'url(#cCuV)'}" stroke="#4a2410"/><rect x="${px-20}" y="${166+open}" width="40" height="4" fill="url(#cAg)"/>`;
  con+=`<path d="M${px+22} ${178+open}C${px+44} ${200} ${px+30} 215 ${px+16} 222" fill="none" stroke="#c8703d" stroke-width="3.5"/><rect x="${px-4}" y="${182+open}" width="8" height="${200-open-6}" fill="url(#cPlL)" stroke="#111" opacity=".9"/>`;
  /* solenoide */
  const pl=o.pl*34;
  mag+=`<rect x="${px-27}" y="222" width="54" height="62" rx="4" fill="url(#cBob)" stroke="#6b5a2c"/><rect x="${px-22}" y="226" width="44" height="54" rx="3" fill="url(#pWind)" stroke="#4a2410"/>`;
  mag+=`<rect x="${px-8}" y="${236-pl}" width="16" height="48" fill="url(#pLam)" stroke="#27303b"/><rect x="${px-5}" y="${232-pl}" width="10" height="8" fill="#c0392b"/>`;
  if(run&&k.I[i]>0)mag+=glow(px,252,28,'#ff7a45',.18+.1*cl(k.I[i]/IN/6,0,1));
  /* bimetal + calefactor */
  calef+=`<rect x="${px+14}" y="306" width="8" height="206" fill="url(#cCu)" stroke="#4a2410" stroke-opacity=".6"/>`;
  for(let j=0;j<8;j++){const y=324+j*10,sh=dx*((410-y)/110)**2;calef+=`<ellipse cx="${px+sh}" cy="${y}" rx="15" ry="4.5" fill="none" stroke="#2a1608" stroke-width="5" stroke-opacity=".5"/><ellipse cx="${px+sh}" cy="${y}" rx="15" ry="4.5" fill="none" stroke="${heatCol(x)}" stroke-width="3.2"/>`}
  if(x>.35)calef=glow(px+dx*.3,360,32,'#ff5a1f',cl((x-.3)*.8,0,.7))+calef;
  bim+=`<rect x="${px-20}" y="404" width="40" height="22" rx="3" fill="url(#cPlL)" stroke="#111"/>`+strip(px,406,296,dx);
  if(run&&k.I[i]>0)calef+=`<path class="flowd" d="M${px} 82V150M${px+16} 306V508" pointer-events="none"/>`});
 /* barra de disparo */
 const bx=Math.max(...e.x)*30;
 mec+=`<rect x="${352+bx}" y="288" width="290" height="12" rx="3" fill="url(#cPlL)" stroke="#111"/><rect x="340" y="${196+(1-o.ct)*24}" width="300" height="12" rx="3" fill="url(#cPlL)" stroke="#111"/>`;
 mec+=`<g transform="rotate(${o.hd*.3} 672 200)"><path d="M652 150L690 150L694 250L656 250Z" fill="url(#cPlL)" stroke="#111"/><circle cx="672" cy="200" r="8" fill="url(#cMeV)" stroke="#333"/></g>`;
 s+=g(S,'contactos','contactos',con)+g(S,'magnetico','magnetico',mag)+g(S,'bimetal','calef',calef)+g(S,'bimetal','bimetal',bim)+g(S,'mec','barra',mec);
 if(o.spark>0&&has(S,'contactos'))s+=PX.map((px,i)=>sparks(px,168,S.ui.t,i+1)).join('');
 /* carcasa */
 let car=`<rect x="290" y="80" width="420" height="430" rx="14" fill="url(#cPl)" stroke="#0b0e11" stroke-width="2" opacity="${a}"/><rect x="290" y="80" width="420" height="430" rx="14" fill="url(#cPlH)" opacity="${a}"/><rect x="290" y="80" width="420" height="430" rx="14" fill="url(#pRib)" opacity="${.4*a}"/>`;
 if(inter)car=`<rect x="290" y="80" width="420" height="430" rx="14" fill="none" stroke="#8fa1b4" stroke-width="3" stroke-dasharray="10 6"/>`;
 s+=g(S,'carcasa','carcasa',car);
 /* frente y perilla */
 const ik=cl((c.p.Ir-2.5)/1.5,0,1);
 let tp=`<g opacity="${a}"><rect x="310" y="104" width="380" height="230" rx="12" fill="url(#cPlL)" stroke="#0b0e11" stroke-width="2"/><circle cx="470" cy="214" r="84" fill="#1a1e23" stroke="#000" stroke-width="3"/><circle cx="470" cy="214" r="66" fill="url(#cKnob)" stroke="#000"/><g transform="rotate(${o.hd} 470 214)"><rect x="458" y="152" width="24" height="64" rx="8" fill="${o.trip?'#f08a1f':o.on?'#2a8f61':'#6b7480'}" stroke="#000"/><path d="M470 156V190" stroke="#fff" stroke-width="4" stroke-linecap="round"/></g>`;
 tp+=`<text x="390" y="166" style="font:800 16px system-ui;fill:#f0f4f8">OFF</text><text x="528" y="166" style="font:800 16px system-ui;fill:#f0f4f8">ON</text><text x="470" y="128" text-anchor="middle" style="font:800 13px system-ui;fill:#ffb347">TRIP</text></g>`;
 tp+=`<g opacity="${a}"><circle cx="610" cy="214" r="46" fill="#e9eef3" stroke="#222" stroke-width="2"/>`;for(let i=0;i<=6;i++){const th=(-120+i*40)*Math.PI/180;tp+=`<path d="M${610+Math.sin(th)*34} ${214-Math.cos(th)*34}L${610+Math.sin(th)*44} ${214-Math.cos(th)*44}" stroke="#111" stroke-width="2.2"/>`}
 tp+=`<circle cx="610" cy="214" r="26" fill="url(#cKnob)" stroke="#000"/><g transform="rotate(${-120+ik*240} 610 214)"><path d="M610 214V192" stroke="#ffd65a" stroke-width="4" stroke-linecap="round"/></g><text x="610" y="282" text-anchor="middle" style="font:700 12px system-ui;fill:#f0f4f8">Ir ${fm(c.p.Ir,1)} A</text></g>`;
 tp+=`<rect x="330" y="350" width="340" height="110" rx="6" fill="#e9eef3" opacity="${a}"/><text x="500" y="382" text-anchor="middle" style="font:800 18px system-ui;fill:#10202e" opacity="${a}">GUARDAMOTOR</text><text x="500" y="404" text-anchor="middle" style="font:600 13px system-ui;fill:#10202e" opacity="${a}">2,5–4 A · Magnético 13×Ir (fijo)</text><text x="500" y="424" text-anchor="middle" style="font:600 12px system-ui;fill:#10202e" opacity="${a}">Clase 10 · 3 polos · 400 V</text><text x="500" y="444" text-anchor="middle" style="font:600 12px system-ui;fill:#10202e" opacity="${a}">IEC 60947-4-1</text>`;
 s+=g(S,'tapa','tapa',tp);
 let bi='',bo='';PX.forEach((x,i)=>{bi+=`<rect x="${x-32}" y="62" width="64" height="20" rx="3" fill="url(#cMe)" stroke="#3a4450"/>${screw(x,54,10,20+i*30)}`;bo+=`<rect x="${x-32}" y="508" width="64" height="20" rx="3" fill="url(#cMe)" stroke="#3a4450"/>${screw(x,534,10,50+i*20)}`});
 s+=g(S,'bornes','term_in',bi)+g(S,'bornes','term_out',bo);
 if(has(S,'bornes'))s+=['1/L1','3/L2','5/L3'].map((q,i)=>tag(PX[i],36,q,'s')).join('')+['2/T1','4/T2','6/T3'].map((q,i)=>tag(PX[i],556,q,'s')).join('');
 if(has(S,'etiq')){s+=lbl(270,100,'Contacto fijo','l',380,155)+lbl(270,180,'Contacto móvil','l',380,176)+lbl(270,250,'Solenoide (magnético)','l',360,252)+lbl(270,330,'Calefactor','l',366,340)+lbl(270,400,'Lámina bimetálica','l',380,380)+lbl(730,200,'Palanca de enganche','r',672,200)+lbl(730,292,'Barra de disparo','r',620,294)+lbl(730,236,'Émbolo','r',612,230)}
 return s+title(inter?'Interior: tres polos, dos protecciones':'Vista frontal')}

function lat(S){const{o,c,e,k}=S,x=e.x[1],dx=x*36;
 let s=`<rect x="330" y="110" width="340" height="380" fill="var(--cav)" opacity=".5"/>`;
 let calef='';for(let i=0;i<9;i++){const y=300+i*11,sh=dx*((420-y)/130)**2;calef+=`<ellipse cx="${480+sh}" cy="${y}" rx="17" ry="5" fill="none" stroke="${heatCol(x)}" stroke-width="3.4"/>`}
 s+=g(S,'bimetal','calef',calef)+g(S,'bimetal','bimetal',`<rect x="450" y="416" width="62" height="22" rx="3" fill="url(#cPlL)" stroke="#111"/>`+strip(480,418,290,dx));
 s+=g(S,'magnetico','magnetico',`<rect x="440" y="190" width="80" height="62" rx="4" fill="url(#pWind)" stroke="#4a2410"/><rect x="472" y="${196-S.o.pl*30}" width="16" height="50" fill="url(#pLam)" stroke="#27303b"/>`);
 s+=g(S,'contactos','contactos',`<rect x="450" y="120" width="60" height="12" fill="url(#cMe)" stroke="#3a4450"/><rect x="450" y="${142+(1-S.o.ct)*22}" width="60" height="12" fill="${k.run?'url(#cCuH)':'url(#cCuV)'}" stroke="#4a2410"/>`);
 s+=g(S,'carcasa','carcasa',`<rect x="310" y="92" width="380" height="418" rx="16" fill="url(#cPl)" stroke="#0b0e11" stroke-width="2" opacity="${LA(S)}"/><rect x="310" y="92" width="380" height="418" rx="16" fill="url(#cPlH)" opacity="${LA(S)}"/><rect x="250" y="240" width="60" height="100" fill="url(#cMe)" stroke="#3a4450" opacity="${Math.max(.3,LA(S))}"/>`);
 s+=g(S,'tapa','palanca',`<g opacity="${LA(S)}"><rect x="640" y="150" width="70" height="120" rx="14" fill="url(#cKnob)" stroke="#000" stroke-width="2"/><g transform="rotate(${S.o.hd} 700 210)"><rect x="680" y="196" width="46" height="28" rx="10" fill="${S.o.trip?'#f08a1f':S.o.on?'#2a8f61':'#6b7480'}" stroke="#000"/></g></g>`);
 s+=g(S,'bornes','term_in',`<rect x="330" y="64" width="64" height="30" rx="4" fill="url(#cMe)" stroke="#3a4450"/>${screw(362,54,10,30)}`)+g(S,'bornes','term_out',`<rect x="606" y="480" width="64" height="30" rx="4" fill="url(#cMe)" stroke="#3a4450"/>${screw(638,522,10,60)}`);
 return s+tag(362,36,'1/L1','s')+tag(638,552,'2/T1','s')+`<text x="280" y="360" text-anchor="middle" class="lab s">Riel DIN</text>`+title('Vista lateral: la perilla sobresale del frente')}
function sup(S){let s=`<rect x="284" y="140" width="432" height="280" fill="var(--cav)" opacity=".4"/>`;
 s+=g(S,'carcasa','carcasa',`<rect x="290" y="130" width="420" height="300" rx="14" fill="url(#cPl)" stroke="#0b0e11" stroke-width="2" opacity="${LA(S)}"/><rect x="290" y="130" width="420" height="300" rx="14" fill="url(#cPlH)" opacity="${LA(S)}"/><rect x="290" y="130" width="420" height="300" rx="14" fill="url(#pRib)" opacity="${.4*LA(S)}"/>`);
 s+=g(S,'tapa','palanca',`<g opacity="${LA(S)}"><rect x="290" y="360" width="420" height="70" rx="12" fill="url(#cPlL)" stroke="#0b0e11" stroke-width="2"/><rect x="450" y="372" width="100" height="46" rx="10" fill="url(#cKnob)" stroke="#000"/></g>`);
 let bn='';PX.forEach((x,i)=>{bn+=`<rect x="${x-34}" y="152" width="68" height="76" rx="5" fill="url(#cMe)" stroke="#3a4450"/><rect x="${x-24}" y="204" width="48" height="12" rx="3" fill="#10161d"/>${screw(x,178,18,i*25)}`});
 s+=g(S,'bornes','term_in',bn)+['1/L1','3/L2','5/L3'].map((q,i)=>tag(PX[i],140,q,'s')).join('')+tag(500,462,'↓ frente ↓','s');
 return s+title('Vista superior')}
function tra(S){let s=`<rect x="290" y="90" width="420" height="410" fill="var(--cav)" opacity=".4"/>`;
 s+=g(S,'carcasa','carcasa',`<rect x="290" y="80" width="420" height="430" rx="14" fill="url(#cPl)" stroke="#0b0e11" stroke-width="2" opacity="${LA(S)}"/><rect x="290" y="80" width="420" height="430" rx="14" fill="url(#cPlH)" opacity="${LA(S)}"/>`);
 s+=g(S,'tapa','din',`<rect x="290" y="262" width="420" height="52" fill="#0b0e11" opacity="${.65*LA(S)}"/><rect x="440" y="470" width="120" height="38" rx="5" fill="url(#cMe)" stroke="#3a4450" opacity="${LA(S)}"/><rect x="490" y="482" width="20" height="8" rx="3" fill="#2c3540" opacity="${LA(S)}"/>`);
 return s+tag(500,254,'Canal para riel DIN de 35 mm','s')+title('Vista trasera')}
function iec(S){const{o,c,k}=S,run=k.run,R='#b5733e',Sc='#9aa5b1',Tc='#ee5a4d',off='#566678',cols=[R,Sc,Tc],X=[330,500,670];
 let s=`<text x="500" y="26" class="lab c t">Símbolo IEC del guardamotor (Q1)</text>`;
 X.forEach((x,i)=>{s+=`<text x="${x}" y="70" class="lab c s">${['R / L1','S / L2','T / L3'][i]}</text><path d="M${x} 80V140" stroke="${cols[i]}" stroke-width="5"/><text x="${x-14}" y="136" class="lab r s">${1+i*2}</text>`;
  s+=`<circle cx="${x}" cy="140" r="4.5" fill="var(--ink)"/><circle cx="${x}" cy="230" r="4.5" fill="var(--ink)"/><path d="M${x} 230L${x-(run?0:26)} 146" stroke="var(--ink)" stroke-width="5" stroke-linecap="round"/><path d="M${x-9} 186l18 18M${x+9} 186l-18 18" stroke="var(--ink)" stroke-width="3.5"/>`;
  s+=`<rect x="${x+20}" y="252" width="30" height="40" fill="${o.h[i]>.5?'#7a3a14':'none'}" stroke="var(--ink)" stroke-width="3"/><path d="M${x+28} 262c0 8 14 8 14 16" stroke="var(--ink)" stroke-width="2.6" fill="none"/><path d="M${x} 230V330" stroke="${run?cols[i]:off}" stroke-width="5"/>`;
  s+=`<path d="M${x} 300V330" stroke="${run?cols[i]:off}" stroke-width="5"/><text x="${x-14}" y="330" class="lab r s">${2+i*2}</text>`;
  if(run)s+=`<path class="flowd" d="M${x} 80V330" opacity=".85"/>`});
 s+=`<path d="M290 200H710" stroke="var(--ink)" stroke-width="3" stroke-dasharray="9 7" opacity=".8"/><path d="M${710} 200V160" stroke="var(--ink)" stroke-width="3" stroke-dasharray="9 7"/>`;
 s+=`<g data-act="toggle"><rect x="722" y="130" width="80" height="60" rx="8" fill="transparent" stroke="var(--ink)" stroke-width="3"/><text x="762" y="156" class="lab c">Perilla</text><text x="762" y="176" class="lab c s">${o.on?'ON':o.trip?'TRIP':'OFF'} (tocá)</text></g>`;
 s+=`<text x="740" y="260" class="lab s">▭ con curva: protección térmica</text><text x="740" y="282" class="lab s">× en el contacto: interruptor automático</text>`;
 s+=`<circle cx="500" cy="440" r="44" fill="none" stroke="var(--ink)" stroke-width="4"/><text x="500" y="436" class="lab c t">M</text><text x="500" y="458" class="lab c">3 ~</text>`;
 ['M330 330V440H456','M500 330V396','M670 330V440H544'].forEach((p,i)=>s+=`<path d="${p}" stroke="${run?cols[i]:off}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);
 s+=`<text x="500" y="525" class="lab c s">Un solo aparato: interruptor manual + protección térmica + protección magnética.</text>`;
 return s}
})();
