/* Escenas 1 a 10 de "Datos curiosos": la electricidad y el cuerpo.
   Cada escena: controls, calc(S)->{reads,mA?,verdict}, draw(S,R,H)->svg, que, clave, dato. */
(function(){
const E=window.ESCENAS;
const RB=1000; /* resistencia interna del cuerpo, orientativa */

/* 1 ------------------------------------------------------------ pájaro */
E.pajaro={
 controls:[
  {k:'contacto',t:'choice',l:'¿Con qué toca el pájaro?',o:[['cable','Solo el cable (apoyado con las dos patas)'],['fases','El cable y otro cable de otra fase'],['poste','El cable y el poste (a tierra)']],v:'cable'},
  {k:'sep',t:'slider',l:'Separación entre las patas',min:5,max:40,st:1,u:' cm',v:12}],
 calc(S){const dV=100*0.0002*(S.sep/100);let V=dV,txt='Sin diferencia de tensión entre las patas: no circula corriente apreciable.',cls='ok';
  if(S.contacto==='fases'){V=13200;txt='Dos cables a distinta tensión unidos por el cuerpo: circula una corriente mortal.';cls='bad'}
  if(S.contacto==='poste'){V=13200/Math.sqrt(3);txt='Entre el cable (13,2 kV) y el poste (tierra) hay mucha diferencia de tensión: mortal.';cls='bad'}
  const mA=V/RB*1000;return{V,mA,reads:[{l:'DIFERENCIA DE TENSIÓN EN EL CUERPO',v:H_volt(V)},{l:'RESISTENCIA DEL PÁJARO',v:'1 kΩ'},{l:'CORRIENTE POR EL PÁJARO',v:H_amp(mA)},{l:'TENSIÓN DEL CABLE RESPECTO DE TIERRA',v:'7,6 kV'}],mA,verdict:{cls,t:txt}}},
 draw(S,R,H){const bad=S.contacto!=='cable',x=560,feet=S.sep*1.4;
  let s=H.sky()+H.ground(430)+H.pole(130,150,280)+H.pole(870,150,280);
  s+=H.cable(130,175,870,175,{sag:30,w:6})+H.cable(130,255,870,255,{sag:30,w:6,color:'#d8c27a'});
  s+=H.t(500,140,'Fase A · 13,2 kV',{})+H.t(500,300,'Fase B · 13,2 kV (otra fase)',{});
  s+=`<g transform="translate(${x} 205)">`;
  if(S.contacto==='fases')s+=H.bird(0,0,{wing:[0,80],s:2});else if(S.contacto==='poste')s+='';else s+=H.bird(0,0,{s:2});
  s+='</g>';
  if(S.contacto==='poste'){s+=H.bird(190,196,{s:2,wing:[-45,120],flip:false});s+=`<path d="M190 215L150 170" stroke="var(--metal)" stroke-width="3" stroke-dasharray="4 4"/>`;}
  if(bad){s+=H.spark(S.contacto==='fases'?x:190,S.contacto==='fases'?262:215,1.4)}
  const bx=S.contacto==='poste'?190:x;s+=`<g><text class="lab2" x="${bx-60}" y="${S.contacto==='poste'?170:150}" style="font-size:14px">${S.contacto==='cable'?'Δ entre patas = '+H.volt(R.V):'Δ = '+H.volt(R.V)}</text></g>`;
  if(S.contacto==='cable'){s+=`<path d="M${x-feet/2} 214V224M${x+feet/2} 214V224" stroke="#ffd65a" stroke-width="3"/>`+H.t(x,238,'↔ '+S.sep+' cm',{})}
  s+=H.t(500,480,'El pájaro está a 13,2 kV… igual que el cable que lo sostiene.',{});return s},
 que(S){return S.contacto==='cable'?'El pájaro está apoyado en un único cable: todo su cuerpo está a la misma tensión que el cable. Entre una pata y la otra hay apenas unos milivoltios (la caída en esos centímetros de conductor), así que por el pájaro pasan microamperios.':S.contacto==='fases'?'Con las alas abiertas toca dos cables de fases distintas. Entre ellos hay 13,2 kV: el cuerpo cierra el circuito y circula una corriente enorme.':'Si el pájaro toca el cable y el poste (que está a tierra), entre ambos hay miles de voltios: el cuerpo es el camino hacia tierra.'},
 clave:'La corriente circula cuando hay diferencia de tensión entre dos puntos unidos por un camino. Tocar un solo conductor, sin camino hacia otro punto a distinta tensión, no cierra el circuito.',
 dato:'Por eso se ven aves posadas en las líneas, pero las aves grandes de alas extendidas sí corren riesgo: en muchas líneas se colocan protectores y posaderos para evitarlo.'};

/* 2 --------------------------------------------------------------- poste */
E.poste={
 controls:[
  {k:'lluvia',t:'toggle',l:'Está lloviendo',v:true},
  {k:'falla',t:'toggle',l:'Un cable roto cayó y toca el poste',v:false},
  {k:'calz',t:'choice',l:'Calzado',o:[['zap','Zapatillas'],['desc','Descalzo']],v:'zap'}],
 calc(S){const V=S.falla?220:0,rh=S.lluvia?1000:10000,rf=S.calz==='zap'?(S.lluvia?20000:100000):(S.lluvia?1000:20000),Rt=rh+RB+rf,mA=V/Rt*1000;
  const cls=!S.falla?'ok':mA<10?'warn':'bad';
  return{V,mA,Rt,reads:[{l:'TENSIÓN DEL POSTE (A TIERRA)',v:H_volt(V)},{l:'RESISTENCIA DEL CAMINO',v:H_ohm(Rt)},{l:'CORRIENTE POR LA PERSONA',v:H_amp(mA)},{l:'LLUVIA',v:S.lluvia?'sí':'no'}],mA,
   verdict:{cls,t:!S.falla?'El poste no está conectado a la línea: no circula corriente, llueva o no.':(S.lluvia?'Con falla y lluvia: la piel y el suelo mojados bajan la resistencia y la corriente aumenta.':'Con falla: hay corriente; la lluvia la empeoraría.')}}},
 draw(S,R,H){let s=H.sky()+H.ground(430,'var(--gnd)');
  s+=`<rect x="0" y="430" width="1000" height="90" fill="var(--road)" opacity=".55"/>`;
  s+=H.pole(560,110,320);
  [[505,98],[560,98],[615,98]].forEach(p=>{s+=`<rect x="${p[0]-5}" y="${p[1]+4}" width="10" height="14" rx="3" fill="#c9a875" stroke="var(--metal)"/>`});
  s+=H.cable(500,98,60,110,{sag:25,w:4})+H.cable(560,86,60,100,{sag:20,w:4})+H.cable(620,98,980,110,{sag:25,w:4});
  s+=H.t(300,86,'Cables de la línea (no tocan el poste)',{});
  if(S.falla){s+=`<path d="M615 98C640 170 600 250 568 255" fill="none" stroke="var(--cable)" stroke-width="5" stroke-linecap="round"/>`+H.spark(570,255,1.2)+H.t(690,250,'cable roto sobre el poste',{});s+=`<rect x="551" y="110" width="18" height="320" fill="#ff6b6b" opacity=".25"/>`}
  const hand=[160,-90];s+=H.person({x:410,y:430,s:1.35,lh:[-28,-96],rh:[135,-100],shoes:S.calz==='zap'?'zap':null,puddle:S.lluvia,glow:S.falla&&R.mA>=.5?[[135,-100],[0,-136],[0,-85],[-16,0]]:null,gc:'#ff6b6b'});
  if(S.lluvia)s+=H.rain(46);
  s+=H.t(500,490,S.falla?'¿Y si hay un cable caído sobre el poste?':'Poste de hormigón: aislado de la línea por los aisladores',{});return s},
 que(S){return !S.falla?'La lluvia no genera tensión en el poste. Los conductores están sujetos con aisladores y no tocan el poste, que es de hormigón o madera. Sin tensión en el poste, no hay corriente aunque estés mojado.':'Ahora un cable energizado toca el poste: el poste queda a tensión respecto de la tierra y el cuerpo cierra el circuito. La lluvia moja la piel y el suelo, baja la resistencia y sube la corriente.'},
 clave:'Un poste o una estructura no son peligrosos por sí mismos: lo son si quedan energizados por una falla. Ante un cable caído o roto, no te acerques ni lo toques: avisá a la distribuidora y a emergencias.',
 dato:'Los aisladores de porcelana o vidrio sostienen el conductor y evitan que la corriente pase al poste.'};

/* 3 ---------------------------------------------------------------- pies */
E.pies={
 controls:[
  {k:'calz',t:'choice',l:'Calzado y piso',o:[['goma','Suela de goma gruesa'],['zap','Zapatillas secas'],['seco','Descalzo, piso seco'],['mojado','Descalzo, piso mojado']],v:'zap'},
  {k:'mano',t:'toggle',l:'Mano mojada',v:false}],
 calc(S){const rf={goma:1e6,zap:1e5,seco:2e4,mojado:1e3}[S.calz],rh=S.mano?1000:10000,Rt=rh+RB+rf,mA=220/Rt*1000;
  return{mA,Rt,reads:[{l:'TENSIÓN',v:'220 V'},{l:'RESISTENCIA TOTAL',v:H_ohm(Rt)},{l:'CORRIENTE',v:H_amp(mA)},{l:'RESISTENCIA DEL PIE/PISO',v:H_ohm(rf)}],mA,
   verdict:{cls:mA<2?'ok':mA<10?'warn':'bad',t:mA<2?'La alta resistencia del calzado limita la corriente.':mA<10?'La corriente se siente: contracciones y dolor.':'Corriente peligrosa: un camino de baja resistencia hacia tierra.'}}},
 draw(S,R,H){let s=H.sky()+H.ground(430,S.calz==='mojado'||S.mano&&0?'var(--gnd)':'var(--gnd)');
  s+=`<rect x="0" y="430" width="1000" height="90" fill="var(--road)" opacity=".5"/>`;
  s+=`<line x1="470" y1="40" x2="470" y2="170" stroke="var(--cable)" stroke-width="5"/><circle cx="470" cy="180" r="11" fill="#d83a3a"/>`+H.t(470,28,'Cable de fase (220 V)',{});
  const sh=S.calz==='goma'?'goma':S.calz==='zap'?'zap':null;
  s+=H.person({x:400,y:430,s:1.45,lh:[-26,-96],rh:[40,-210],shoes:sh,puddle:S.calz==='mojado',glow:R.mA>=.1?[[40,-210],[0,-142],[0,-85],[-16,0],[-16,18]]:null,gc:effectColor(R.mA)});
  s+=`<path d="M400 452h0M395 462h10M388 470h24M382 478h36" stroke="var(--ink)" stroke-width="3"/>`+H.t(400,500,'a tierra',{});
  s+=`<path d="M410 452H760V300" fill="none" stroke="#6aa9ff" stroke-width="3" stroke-dasharray="7 6"/><rect x="725" y="240" width="70" height="60" rx="8" fill="var(--p2)" stroke="var(--line)"/>`+H.t(760,276,'Red',{})+`<path d="M760 240V180H500" fill="none" stroke="#d83a3a" stroke-width="3" stroke-dasharray="7 6"/>`+H.t(630,170,'el circuito se cierra por la tierra',{});
  if(R.mA>=10)s+=H.spark(470,185,1);return s},
 que(S){return 'El circuito es: fase → mano → cuerpo → pies → suelo → tierra de la red. La resistencia total es la suma de todo el camino. El calzado aislante y el piso seco suben mucho esa resistencia; los pies mojados la bajan a casi nada.'},
 clave:'La corriente que circula es I = V / R. Con la misma tensión (220 V), cambiar la resistencia del camino cambia la corriente de décimas de miliamper a más de 70 mA.',
 dato:'Aislarse del suelo reduce el riesgo, pero no lo elimina: si tocás fase y neutro con las dos manos, el circuito se cierra igual por tu pecho.'};

/* 4 -------------------------------------------------------------- camino */
E.camino={
 controls:[
  {k:'rc',t:'slider',l:'Resistencia del tramo de cable',min:.5,max:50,st:.5,v:5,fmt:v=>H_f(v,1)+' mΩ'},
  {k:'rb',t:'slider',l:'Resistencia del cuerpo del pájaro',min:200,max:5000,st:100,v:1000,fmt:v=>H_f(v,0)+' Ω'},
  {k:'it',t:'slider',l:'Corriente de la línea',min:10,max:200,st:5,v:100,fmt:v=>v+' A'}],
 calc(S){const Rc=S.rc/1000,Rb=S.rb,V=S.it*Rc*Rb/(Rc+Rb),Ib=V/Rb,Ic=V/Rc;
  return{V,Ib,Ic,reads:[{l:'CORRIENTE POR EL CABLE',v:H_amp(Ic*1000)},{l:'CORRIENTE POR EL PÁJARO',v:H_amp(Ib*1000)},{l:'TENSIÓN EN EL TRAMO',v:H_volt(V)},{l:'PARTE QUE PASA POR EL PÁJARO',v:H_f(Ib/S.it*100,5)+' %'}],
   verdict:{cls:'ok',t:'El cable lleva prácticamente toda la corriente: ofrece muchísima menos resistencia.'}}},
 draw(S,R,H){const wC=Math.max(3,Math.min(26,R.Ic/S.it*26)),wB=Math.max(1.5,Math.min(26,R.Ib/S.it*26));
  let s=H.sky()+H.ground(450);
  s+=`<path d="M60 250H300M700 250H940" stroke="var(--cable)" stroke-width="14" stroke-linecap="round"/><path d="M300 250C300 170 700 170 700 250" fill="none" stroke="var(--cable)" stroke-width="${wC}" stroke-linecap="round"/><path class="flowd" d="M300 250C300 170 700 170 700 250"/>`;
  s+=`<path d="M300 250C300 360 700 360 700 250" fill="none" stroke="#e8b894" stroke-width="${wB}" stroke-linecap="round"/>`+(R.Ib*1000>1?`<path class="flowd" d="M300 250C300 360 700 360 700 250"/>`:'');
  s+=H.t(500,185,'Camino 1: cable ('+H_f(S.rc,1)+' mΩ)',{})+H.t(500,350,'Camino 2: cuerpo ('+H_f(S.rb,0)+' Ω)',{})+H.bird(480,318,{s:1.1});
  s+=H.t(180,235,'Entra '+S.it+' A',{})+H.t(820,235,'Sale '+S.it+' A',{});return s},
 que:'Entre los puntos A y B hay dos caminos en paralelo: el cable y el cuerpo. Misma tensión en ambos, pero la corriente se reparte en proporción inversa a la resistencia: casi todo va por el que menos resiste.',
 clave:'La corriente se reparte entre los caminos disponibles, no “elige uno”: por el de menor resistencia pasa mucha más. Pero un camino de alta resistencia no es seguro si la tensión aplicada es alta.',
 dato:'Este es el principio del puente (bypass): un conductor grueso en paralelo con un aparato lo deja prácticamente sin corriente.'};

/* 5 ------------------------------------------------------------ qué mata */
const SRC5={
 estatica:{n:'Chispa estática (picaporte)',V:20000,imp:true,dur:'≈ 1 millonésima de segundo',en:'≈ 1 mJ',res:'Pinchazo breve: la carga es minúscula.',cls:'ok'},
 bateria:{n:'Batería de auto',V:12},
 enchufe:{n:'Enchufe de la casa',V:220},
 mt:{n:'Línea de media tensión',V:13200},
 cerca:{n:'Cerca eléctrica rural',V:6000,imp:true,dur:'pulsos de 0,3 milisegundos',en:'unos pocos joules por pulso (limitados)',res:'Dolorosa pero diseñada para no ser letal: la energía de cada pulso está limitada.',cls:'warn'},
 pila:{n:'Pila AA',V:1.5}};
E.quemata={
 controls:[
  {k:'src',t:'choice',l:'Elegí la fuente',o:Object.keys(SRC5).map(k=>[k,SRC5[k].n]),v:'enchufe'},
  {k:'mojada',t:'toggle',l:'Piel mojada',v:false}],
 calc(S){const f=SRC5[S.src];if(f.imp)return{reads:[{l:'TENSIÓN',v:H_volt(f.V)},{l:'DURACIÓN',v:f.dur},{l:'ENERGÍA',v:f.en},{l:'RESULTADO',v:f.cls==='ok'?'inofensiva':'dolorosa'}],verdict:{cls:f.cls,t:f.res}};
  const Rt=S.mojada?3000:31000,mA=f.V/Rt*1000;return{mA,reads:[{l:'TENSIÓN',v:H_volt(f.V)},{l:'RESISTENCIA DEL CAMINO',v:H_ohm(Rt)},{l:'CORRIENTE POR EL CUERPO',v:H_amp(mA)},{l:'TIEMPO DE EXPOSICIÓN',v:'continuo'}],verdict:{cls:mA<2?'ok':mA<10?'warn':'bad',t:mA<2?'Corriente demasiado pequeña para sentirse o dañar.':mA<10?'Se siente fuerte.':'Peligrosa: la corriente supera los límites seguros.'}}},
 draw(S,R,H){let s=H.sky()+H.ground(440);const keys=Object.keys(SRC5);
  keys.forEach((k,i)=>{const x=95+i*162,sel=S.src===k,f=SRC5[k];s+=`<g transform="translate(${x} 90)"><rect x="-70" y="-50" width="140" height="130" rx="14" fill="var(--p2)" stroke="${sel?'var(--bl)':'var(--line)'}" stroke-width="${sel?5:2}" opacity="${sel?1:.85}"/>`+H.t(0,-22,f.n.split(' (')[0],{}).replace('class="lab"','class="lab2" style="text-anchor:middle;stroke:none;font-size:12px"')+H.t(0,22,H.volt(f.V),{}).replace('class="lab"','class="lab" style="stroke:none"')+`<text x="0" y="62" style="font:600 11px system-ui;text-anchor:middle;fill:var(--mu)">${f.imp?'pulso':'continua'}</text></g>`});
  const c=R.mA!==undefined?effectColor(R.mA):(R.verdict.cls==='ok'?'#3fbf84':'#e6c63a');
  s+=H.person({x:500,y:440,s:1.4,lh:[-70,-120],rh:[70,-120],glow:[[-70,-120],[0,-136],[70,-120]],gc:c,face:R.verdict.cls==='bad'?'✖':''});
  s+=`<path d="M${95+keys.indexOf(S.src)*162} 150V230L440 320" fill="none" stroke="var(--cable)" stroke-width="3" stroke-dasharray="6 5"/>`;
  s+=H.t(500,500,'La tensión empuja; la corriente (y el tiempo) es lo que daña.',{});return s},
 que(S){const f=SRC5[S.src];return f.imp?'Una chispa estática tiene miles de voltios, pero la carga acumulada es diminuta y dura una fracción de microsegundo: la energía transferida es mínima.':'La tensión es lo que “empuja” la corriente; la corriente que circula depende de la resistencia del camino: I = V / R. La batería de 12 V no logra empujar corriente apreciable por una piel seca.'},
 clave:'Lo que daña el cuerpo es la corriente que lo atraviesa (y durante cuánto tiempo), no la tensión por sí sola. Pero la tensión determina cuánta corriente puede empujarse por un camino de resistencia dada.',
 dato:'Una chispa de 20.000 V al tocar un picaporte es inofensiva; 220 V sostenidos, en cambio, pueden ser mortales.'};

/* 6 ------------------------------------------------------------- batería */
E.bateria={
 controls:[
  {k:'V',t:'slider',l:'Tensión aplicada',min:1,max:400,st:1,v:12,fmt:v=>v+' V'},
  {k:'piel',t:'choice',l:'Estado de la piel',o:[['seca','Seca'],['mojada','Mojada']],v:'seca'}],
 calc(S){const Rt=S.piel==='seca'?21000:3000,mA=S.V/Rt*1000;const seg=S.V<=(S.piel==='seca'?50:25);
  return{mA,Rt,reads:[{l:'TENSIÓN',v:S.V+' V'},{l:'RESISTENCIA DEL CAMINO',v:H_ohm(Rt)},{l:'CORRIENTE',v:H_amp(mA)},{l:'¿TENSIÓN DE SEGURIDAD?',v:seg?'sí (≤ '+(S.piel==='seca'?50:25)+' V)':'no'}],
   verdict:{cls:mA<2?'ok':mA<10?'warn':'bad',t:mA<.5?'No se percibe: no puede empujar corriente apreciable.':mA<2?'Apenas se percibe.':mA<10?'Molesto.':'Peligroso.'}}},
 draw(S,R,H){let s=H.room(450);
  const frac=Math.min(1,S.V/400);s+=`<rect x="120" y="60" width="70" height="360" rx="10" fill="var(--p2)" stroke="var(--line)"/><rect x="124" y="${420-356*frac}" width="62" height="${356*frac}" rx="8" fill="${effectColor(R.mA)}"/>`;
  [[12,'12 V auto'],[24,'24 V'],[50,'50 V límite'],[110,'110 V'],[220,'220 V enchufe'],[380,'380 V']].forEach(p=>{const y=420-356*Math.min(1,p[0]/400);s+=`<path d="M190 ${y}H215" stroke="var(--ink)" stroke-width="2"/><text class="lab2" x="222" y="${y+4}" style="font-size:12px">${p[1]}</text>`});
  s+=`<path d="M190 ${420-356*frac}H120" stroke="var(--tx)" stroke-width="4"/>`+H.t(155,48,'Tensión',{});
  s+=H.person({x:620,y:440,s:1.4,lh:[-80,-120],rh:[80,-120],glow:R.mA>=.1?[[-80,-120],[0,-136],[80,-120]]:null,gc:effectColor(R.mA),face:R.mA>=30?'✖':''});
  s+=`<rect x="520" y="238" width="38" height="40" rx="5" fill="#d83a3a"/><rect x="684" y="238" width="38" height="40" rx="5" fill="#222"/>`+H.t(540,232,'+',{})+H.t(703,232,'−',{});
  s+=H.t(500,500,S.V+' V sobre una persona con piel '+S.piel+' → '+H.amp(R.mA),{});return s},
 que:'La corriente depende de la tensión y de la resistencia del camino: I = V / R. Con 12 V sobre piel seca (unos 21 kΩ entre manos) pasa menos de 1 mA: ni se siente. Con 220 V pasan unos 10 mA, y con piel mojada la corriente se multiplica.',
 clave:'La tensión de un circuito determina si puede empujar una corriente peligrosa a través del cuerpo. Por eso se usan tensiones de seguridad (≤ 24–50 V) en lugares húmedos o con riesgo.',
 dato:'La batería de un auto entrega mucha corriente si se la pone en cortocircuito (por eso calienta una herramienta), pero con 12 V no puede “empujarla” por el cuerpo.'};

/* 7 -------------------------------------------------------------- corazón */
const CAM7={
 lpies:{n:'Mano izquierda → pies',F:1.0,pts:[[34,-100],[0,-136],[0,-85],[-16,0]]},
 rpies:{n:'Mano derecha → pies',F:0.8,pts:[[-34,-100],[0,-136],[0,-85],[16,0]]},
 manos:{n:'Mano → mano',F:0.4,pts:[[34,-100],[0,-136],[-34,-100]]},
 pies:{n:'Pie → pie',F:0.04,pts:[[-16,0],[0,-85],[16,0]]},
 dosmanos:{n:'Las dos manos → pies',F:1.0,pts:[[34,-100],[0,-136],[-34,-100],[0,-136],[0,-85],[-16,0]]}};
E.corazon={
 controls:[
  {k:'cam',t:'choice',l:'Camino de la corriente',o:Object.keys(CAM7).map(k=>[k,CAM7[k].n]),v:'lpies'},
  {k:'I',t:'slider',l:'Corriente total por el cuerpo',min:10,max:200,st:5,v:60,fmt:v=>v+' mA'}],
 calc(S){const c=CAM7[S.cam],Ih=S.I*c.F;return{mA:Ih,reads:[{l:'CORRIENTE TOTAL',v:S.I+' mA'},{l:'FACTOR DE CORAZÓN',v:H_f(c.F,2)},{l:'CORRIENTE EQUIVALENTE EN EL CORAZÓN',v:H_amp(Ih)},{l:'CAMINO',v:c.n}],
  verdict:{cls:c.F>=.8?'bad':c.F>=.4?'warn':'ok',t:c.F>=.8?'Camino muy desfavorable: la corriente atraviesa la zona del corazón.':c.F>=.4?'Atraviesa el pecho en parte: riesgo importante.':'La corriente casi no pasa por el corazón.'}}},
 draw(S,R,H){const c=CAM7[S.cam];let s=H.room(450);
  const px=500,py=450,sc=1.8;
  s+=`<g transform="translate(${px} ${py}) scale(${sc})"><g stroke="var(--ink)" stroke-width="6" stroke-linecap="round" fill="none"><path d="M0 -85L-16 0M0 -85L16 0M0 -85V-142M0 -136L34 -100M0 -136L-34 -100"/></g><circle cx="0" cy="-160" r="17" fill="var(--skin)" stroke="var(--ink)" stroke-width="4"/>`;
  const d='M'+c.pts.map(p=>p.join(' ')).join('L');
  s+=`<path d="${d}" fill="none" stroke="${R.mA>=30?'#ff6b6b':'#ffd65a'}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" opacity=".6" class="pulse"/><path class="flowd" d="${d}"/>`;
  s+=`<path d="M-6 -118c-8 -8 -16 4 -6 14l6 6l6 -6c10 -10 2 -22 -6 -14z" fill="#e0314a" stroke="#900" stroke-width="2"/></g>`;
  s+=H.t(px+120,py-250,'❤ corazón',{})+H.t(500,500,'La mano izquierda de la persona queda del lado derecho de la imagen',{});return s},
 que:'El efecto sobre el corazón depende por dónde pasa la corriente. De mano izquierda a pies atraviesa el pecho; de pie a pie casi no pasa por el corazón. El “factor de corazón” compara el riesgo de cada camino con el más desfavorable.',
 clave:'No es lo mismo recibir la corriente por un camino que por otro: la que cruza el pecho y pasa por el corazón es la más peligrosa, porque puede provocar fibrilación ventricular.',
 dato:'Por eso, al trabajar con tensión, se recomienda usar una sola mano y evitar apoyar la otra en estructuras metálicas conectadas a tierra.'};

/* 8 --------------------------------------------------------------- neutro */
E.neutro={
 controls:[
  {k:'toca',t:'choice',l:'¿Qué conductor tocás?',o:[['fase','Fase'],['neutro','Neutro (todo bien)'],['cortado','Neutro con el conductor cortado antes']],v:'fase'},
  {k:'suelo',t:'choice',l:'Dónde estás parado',o:[['aislado','En un banco aislante'],['tierra','En el suelo (descalzo)']],v:'tierra'}],
 calc(S){const V=S.toca==='neutro'?1:220,Rt=S.suelo==='aislado'?1011000:21000,mA=V/Rt*1000;
  return{mA,V,reads:[{l:'TENSIÓN RESPECTO DE TIERRA',v:H_volt(V)},{l:'RESISTENCIA',v:H_ohm(Rt)},{l:'CORRIENTE',v:H_amp(mA)},{l:'CONDUCTOR',v:S.toca==='fase'?'fase':S.toca==='neutro'?'neutro':'neutro cortado'}],
   verdict:{cls:mA<2?'ok':mA<10?'warn':'bad',t:S.toca==='neutro'?'En funcionamiento normal el neutro está casi a la tensión de tierra.':S.toca==='cortado'?'Con el neutro cortado, el tramo posterior queda a tensión de fase a través de las cargas.':'La fase está a 220 V respecto de tierra.'}}},
 draw(S,R,H){let s=H.room(450);
  s+=`<rect x="70" y="150" width="90" height="190" rx="10" fill="var(--p2)" stroke="var(--line)"/>`+H.t(115,200,'RED',{})+H.t(115,230,'220 V',{});
  s+=`<path d="M160 190H820" stroke="#d83a3a" stroke-width="6"/><path d="M160 300H${S.toca==='cortado'?400:820}" stroke="#4db5ee" stroke-width="6"/>`;
  if(S.toca==='cortado'){s+=`<path d="M410 300H820" stroke="#4db5ee" stroke-width="6" stroke-dasharray="2 12"/><path d="M395 285l30 30M425 285l-30 30" stroke="#ff6b6b" stroke-width="6"/>`+H.t(410,340,'conductor cortado',{})}
  s+=`<circle cx="740" cy="245" r="30" fill="#ffe98a" stroke="#fff0a1" stroke-width="4"/><path d="M740 190V215M740 275V300" stroke="var(--cable)" stroke-width="5"/>`+H.t(740,205,'',{});
  s+=H.t(300,175,'Fase (L)',{})+H.t(300,325,'Neutro (N)',{});
  const ty=S.toca==='fase'?190:300;
  s+=H.person({x:480,y:450,s:1.2,lh:[-26,-96],rh:[60,-(450-ty)/1.2+0],shoes:S.suelo==='aislado'?'goma':null,glow:R.mA>=.1?[[60,-(450-ty)/1.2],[0,-136],[0,-85],[-16,0]]:null,gc:effectColor(R.mA)});
  if(S.suelo==='aislado')s+=`<rect x="410" y="436" width="140" height="14" rx="3" fill="#c8a24a"/>`+H.t(480,478,'banco aislante',{});
  return s},
 que(S){return S.toca==='fase'?'La fase está a 220 V respecto de tierra: tocarla y cerrar el circuito por el suelo es peligroso.':S.toca==='neutro'?'El neutro vuelve a la red y está unido a tierra en el transformador: normalmente tiene una tensión muy baja respecto de tierra, pero eso no lo hace seguro de tocar.':'Si el neutro se corta aguas arriba, el tramo posterior queda conectado a la fase a través de las cargas: pasa a tener tensión respecto de tierra y es tan peligroso como la fase.'},
 clave:'Nunca des por seguro un conductor solo por su color o su nombre: un neutro cortado o con una falla puede estar energizado. Verificá siempre con instrumento y cortá la energía antes de trabajar.',
 dato:'Por eso en la instalación el neutro nunca se interrumpe con una llave: se corta solo la fase, y el neutro se identifica siempre con color celeste.'};

/* 9 ------------------------------------------------------------- CC y CA */
E.ccca={
 controls:[
  {k:'tipo',t:'choice',l:'Tipo de corriente',o:[['ca','Alterna (50 Hz)'],['cc','Continua']],v:'ca'},
  {k:'I',t:'slider',l:'Corriente por la mano',min:1,max:80,st:1,v:20,fmt:v=>v+' mA'}],
 calc(S){const th=S.tipo==='ca'?10:50,nosuelta=S.I>=th;
  return{mA:S.I,reads:[{l:'TIPO',v:S.tipo==='ca'?'alterna':'continua'},{l:'CORRIENTE',v:S.I+' mA'},{l:'UMBRAL DE “NO SOLTAR”',v:'≈ '+th+' mA'},{l:'¿PUEDE SOLTAR?',v:nosuelta?'no':'sí'}],
   verdict:{cls:nosuelta?'bad':S.I>=2?'warn':'ok',t:nosuelta?(S.tipo==='ca'?'Los músculos del antebrazo se contraen y la mano se cierra sobre el conductor: no puede soltar.':'Por encima de este valor la contracción impide soltar.'):'La persona todavía puede soltar el conductor.'}}},
 anim:true,
 draw(S,R,H){const t=S.t||0;let s=H.room(450);
  const A=Math.min(60,S.I*.8);let pts='';for(let x=0;x<=360;x+=4){const ph=S.tipo==='ca'?Math.sin((x/60-t*1.2)*Math.PI*2*.5)*A:A*.8;pts+=(x?'L':'M')+(60+x)+' '+(140-ph)}
  s+=`<rect x="40" y="60" width="400" height="160" rx="12" fill="var(--p2)" stroke="var(--line)"/><path d="M60 140H420" stroke="var(--line)" stroke-dasharray="4 4"/><path d="${pts}" fill="none" stroke="${S.tipo==='ca'?'#4db5ee':'#ffd65a'}" stroke-width="4"/>`+H.t(240,86,S.tipo==='ca'?'Alterna: cambia de sentido 100 veces por segundo':'Continua: siempre el mismo sentido',{});
  const closed=R.mA>=(S.tipo==='ca'?10:50);
  s+=`<rect x="560" y="230" width="360" height="30" rx="8" fill="#d83a3a"/><rect x="560" y="236" width="360" height="6" fill="#ff9a9a"/>`+H.t(740,222,'Conductor energizado',{});
  s+=`<g transform="translate(700 245)"><path d="M-70 120L-40 10" stroke="var(--skin)" stroke-width="30" stroke-linecap="round"/><ellipse cx="-30" cy="0" rx="42" ry="${closed?22:30}" fill="var(--skin)" stroke="#a97a56" stroke-width="3"/>`+(closed?[0,1,2,3].map(i=>`<path d="M${-48+i*16} -20q6 24 -4 38" stroke="#a97a56" stroke-width="5" fill="none"/>`).join(''):[0,1,2,3].map(i=>`<path d="M${-56+i*20} -16l${-8+i*3} -28" stroke="#c99066" stroke-width="9" stroke-linecap="round"/>`).join(''))+`</g>`;
  if(closed)s+=H.spark(740,236,.9);
  s+=H.t(740,420,closed?'✊ la mano se cierra: no suelta':'🖐 puede abrir la mano',{});return s},
 que(S){return S.tipo==='ca'?'La corriente alterna invierte su sentido 100 veces por segundo y provoca contracciones musculares sostenidas. Alrededor de los 10 mA los músculos que cierran la mano vencen a los que la abren y no se puede soltar el conductor.':'La corriente continua provoca una contracción fuerte al conectar y al desconectar. El umbral para no poder soltar es más alto que en alterna, pero también puede ser mortal.'},
 clave:'El problema de “no poder soltar” hace que la exposición se prolongue, y cuanto más tiempo circula la corriente, mayor es el riesgo de fibrilación y quemaduras.',
 dato:'Esa es la razón de la recomendación clásica: ante la duda, tocá un conductor con el dorso de la mano, así si te contraés te alejás en vez de agarrarlo.'};

/* 10 --------------------------------------------------------------- tierra */
E.tierra={
 controls:[
  {k:'falla',t:'toggle',l:'Falla: la fase toca la carcasa',v:true},
  {k:'pe',t:'toggle',l:'Cable de tierra conectado',v:false},
  {k:'dif',t:'toggle',l:'Disyuntor diferencial instalado',v:false},
  {k:'piso',t:'choice',l:'Piso',o:[['seco','Seco'],['mojado','Mojado']],v:'mojado'}],
 calc(S){const Rp=S.piso==='mojado'?3000:21000,Rt=10;let Vc=0,Ip=0,If=0,trip=false,txt='Sin falla: la carcasa está a 0 V.';
  if(S.falla){if(!S.pe){Vc=220;Ip=Vc/Rp*1000;If=Ip/1000*1000;if(S.dif&&Ip>=30){trip=true}}
   else{If=220/(Rt+2);Vc=If*Rt;Ip=Vc/Rp*1000;if(S.dif)trip=true}}
  const mA=S.falla?(trip?0:Ip):0;
  if(S.falla){txt=trip?'El diferencial cortó la alimentación en menos de 0,04 s.':(S.pe&&!S.dif)?'La tierra limita la tensión, pero sin diferencial la falla persiste: la carcasa sigue energizada.':(!S.pe&&S.dif&&Ip<30)?'Corriente por la persona menor que 30 mA: el diferencial no corta y sigue circulando.':'La carcasa está energizada: quien la toque cierra el circuito.'}
  return{mA,Vc,Ip,If,trip,reads:[{l:'TENSIÓN DE LA CARCASA',v:H_volt(Vc)},{l:'CORRIENTE POR LA PERSONA',v:H_amp(trip?0:Ip)},{l:'CORRIENTE DE FALLA',v:H_amp(If*(S.pe?1:1))},{l:'PROTECCIÓN',v:trip?'cortó':'no cortó'}],mA,
   verdict:{cls:!S.falla||trip?'ok':mA<10?'warn':'bad',t:txt}}},
 draw(S,R,H){let s=H.sky()+H.ground(450,'var(--gnd2)');
  s+=`<rect x="520" y="140" width="190" height="310" rx="12" fill="${S.falla&&!R.trip?'#ffb3b3':'#e6e9ee'}" stroke="#9aa5b3" stroke-width="4"/><rect x="530" y="150" width="170" height="130" rx="6" fill="#dfe3e8" stroke="#9aa5b3"/>`+H.t(615,300,'Heladera',{});
  s+=`<path d="M520 360H120" stroke="#d83a3a" stroke-width="6"/>`+H.t(150,345,'Fase',{})+`<path d="M520 400H120" stroke="#4db5ee" stroke-width="6"/>`+H.t(150,425,'Neutro',{});
  if(S.falla){s+=`<path d="M440 360C470 330 500 300 530 290" stroke="#d83a3a" stroke-width="5" fill="none"/>`+H.spark(530,290,1)}
  if(S.pe){s+=`<path d="M520 440H340V470" stroke="var(--metal)" stroke-width="6" fill="none" stroke-dasharray="${R.trip?'3 8':'0'}"/><rect x="332" y="470" width="16" height="46" fill="#b5651d"/>`+H.t(340,462,'tierra (jabalina)',{a:'start'}).replace('class="lab"','class="lab2"')+(S.falla&&!R.trip?`<path class="flowd" d="M520 440H340V470"/>`:'')}
  s+=H.person({x:850,y:450,s:1.3,lh:[-26,-96],rh:[-120,-108],puddle:S.piso==='mojado',glow:S.falla&&!R.trip&&R.Ip>=.1?[[-120,-108],[0,-136],[0,-85],[-16,0]]:null,gc:effectColor(R.Ip)});
  if(S.dif)s+=`<rect x="170" y="310" width="70" height="120" rx="8" fill="${R.trip?'#2a8f61':'var(--p2)'}" stroke="var(--line)"/>`+H.t(205,350,'Dif.',{})+H.t(205,376,'30 mA',{})+(R.trip?H.t(205,404,'CORTÓ',{}):'');
  return s},
 que(S){return S.falla?(S.pe?'El conductor de tierra conecta la carcasa a la jabalina: la falla genera una corriente a tierra y el diferencial detecta la fuga y corta. Sin diferencial, la falla puede persistir.':'Sin tierra, la carcasa queda a 220 V: cualquiera que la toque cierra el circuito. El diferencial solo corta si la corriente por la persona supera unos 30 mA.'):'Con la heladera sin falla, la carcasa está a 0 V.'},
 clave:'La puesta a tierra y el disyuntor diferencial se complementan: la tierra da un camino a la corriente de falla y el diferencial la detecta y corta rápido. Tener solo uno no alcanza.',
 dato:'Los tomas de 3 patas (la del medio es la tierra) existen para que la carcasa de los artefactos esté unida al conductor de protección.'};

/* ------------ pequeños adaptadores (los define el motor al cargar) ------------ */
function H_f(n,d){return(Number(n)).toFixed(d===undefined?1:d).replace('.',',')}
function H_volt(v){return window.H?window.H.volt(v):v+' V'}
function H_amp(m){return window.H?window.H.amp(m):m+' mA'}
function H_ohm(r){return window.H?window.H.ohm(r):r+' Ω'}
function effectColor(mA){return window.H?window.H.effect(Math.max(mA||0,0)).c:'#ffd65a'}
})();
