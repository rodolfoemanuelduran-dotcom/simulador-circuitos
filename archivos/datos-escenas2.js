/* Escenas 11 a 20 de "Datos curiosos": protecciones, fenómenos y red. */
(function(){
const E=window.ESCENAS;
const f=(n,d)=>Number(n).toFixed(d===undefined?1:d).replace('.',',');
const volt=v=>window.H.volt(v),amp=m=>window.H.amp(m),ohm=r=>window.H.ohm(r),col=m=>window.H.effect(Math.max(m||0,0)).c;
const dur=s=>!isFinite(s)?'no corta':s<1?f(s*1000,0)+' ms':s<60?f(s,0)+' s':f(s/60,1)+' min';

/* 11 --------------------------------------------------------- diferencial */
const SIT11={normal:{n:'Normal (sin fuga)',leak:0},leve:{n:'Fuga leve de un artefacto (10 mA)',leak:10},persona:{n:'Una persona toca una fase (60 mA)',leak:60},fuerte:{n:'Falla fuerte a tierra (5 A)',leak:5000}};
E.diferencial={
 controls:[{k:'sit',t:'choice',l:'Situación',o:Object.keys(SIT11).map(k=>[k,SIT11[k].n]),v:'persona'},{k:'dif',t:'toggle',l:'Disyuntor diferencial instalado (30 mA)',v:true}],
 calc(S){const leak=SIT11[S.sit].leak,If=6+leak/1000,trip=S.dif&&leak>=30;const persona=S.sit==='persona';
  const mA=persona?(trip?0:60):undefined;
  return{leak,If,trip,mA,reads:[{l:'CORRIENTE POR LA FASE',v:f(If,3)+' A'},{l:'CORRIENTE POR EL NEUTRO',v:'6,000 A'},{l:'DIFERENCIA (FUGA A TIERRA)',v:amp(leak)},{l:'ESTADO',v:trip?'cortó (< 40 ms)':'conectado'}],
   verdict:{cls:trip?'ok':leak===0?'ok':persona||leak>=5000?'bad':'warn',t:trip?'El diferencial detectó la diferencia y abrió el circuito en menos de 0,04 s.':leak===0?'Corriente de ida igual a la de vuelta: no hay fuga.':leak<30?'La fuga es menor que 30 mA: el diferencial no corta (está por debajo del umbral).':(S.dif?'':'Sin diferencial: la fuga continúa hasta que actúe otra protección.')}}},
 draw(S,R,H){let s=H.room(450);
  s+=`<rect x="60" y="150" width="80" height="170" rx="10" fill="var(--p2)" stroke="var(--line)"/>`+H.t(100,200,'RED',{})+H.t(100,230,'220 V',{});
  const wc=R.trip?'#8a8a8a':'#d83a3a',wn=R.trip?'#8a8a8a':'#4db5ee';
  s+=`<path d="M140 190H430M570 190H700" stroke="${wc}" stroke-width="7"/><path d="M140 280H430M570 280H700" stroke="${wn}" stroke-width="7"/>`;
  if(!R.trip)s+=`<path class="flowd" d="M140 190H430M570 190H700"/><path class="flowd" d="M700 280H570M430 280H140"/>`;
  s+=`<circle cx="500" cy="235" r="78" fill="none" stroke="#b5b9c0" stroke-width="24"/><circle cx="500" cy="235" r="78" fill="none" stroke="#7d8591" stroke-width="3"/><path d="M430 190H570M430 280H570" stroke="${wc}" stroke-width="7" opacity="0"/>`;
  s+=H.t(500,120,'Transformador de corriente (toroide)',{})+H.t(500,240,'Δ = '+amp(R.leak),{});
  s+=H.t(250,175,'Ida: '+f(R.If,3)+' A',{})+H.t(250,305,'Vuelta: 6,000 A',{});
  s+=`<rect x="720" y="150" width="130" height="150" rx="10" fill="${R.trip?'#2a8f61':'var(--p2)'}" stroke="var(--line)"/>`+H.t(785,190,S.dif?'Diferencial':'(sin dif.)',{})+H.t(785,225,S.dif?'30 mA':'',{})+(R.trip?H.t(785,270,'CORTÓ ✔',{}):'');
  const lk=R.leak;if(lk>0){const w=Math.max(2,Math.min(14,Math.log10(lk+1)*3));s+=`<path d="M650 190C650 330 560 380 430 440" fill="none" stroke="${R.trip?'#8a8a8a':'#ffd65a'}" stroke-width="${w}" stroke-dasharray="${R.trip?'4 8':'0'}" ${R.trip?'':'class="pulse"'}/>`+H.t(560,400,'fuga a tierra',{})}
  if(S.sit==='persona')s+=H.person({x:650,y:450,s:1.0,lh:[0,-165],rh:[-20,-95],glow:R.trip?null:[[0,-165],[0,-136],[0,-85],[-12,0]],gc:'#ff6b6b'});
  return s},
 que(S){return 'Dos conductores atraviesan el toroide: la fase en un sentido y el neutro en el otro. Si toda la corriente que va vuelve por el neutro, los campos se anulan. Si una parte se fuga a tierra (por una persona o una falla), aparece una diferencia y el diferencial abre el circuito.'},
 clave:'El diferencial no mide cuánta corriente consume la instalación, sino cuánta “falta” en la vuelta. Con 30 mA de diferencia corta en milésimas de segundo, mucho antes de que una fuga a través de una persona se vuelva mortal.',
 dato:'El botón de prueba “T” del diferencial genera una fuga artificial: conviene probarlo periódicamente.'};

/* 12 --------------------------------------------------------------- térmica */
function tTrip(I,In){const r=I/In;if(r<=1.13)return Infinity;if(r>=5)return .01;return Math.min(3600,400/(r*r-1))}
E.termica={
 controls:[{k:'I',t:'slider',l:'Corriente por el circuito',min:1,max:120,st:1,v:24,fmt:v=>v+' A'},{k:'In',t:'choice',l:'Térmica instalada',o:[[10,'10 A'],[16,'16 A'],[20,'20 A']],v:16}],
 calc(S){const In=+S.In,r=S.I/In,t=tTrip(S.I,In),mag=r>=5;
  return{r,t,mag,reads:[{l:'CORRIENTE / NOMINAL',v:f(r,2)+' ×'},{l:'TIEMPO HASTA CORTAR',v:dur(t)},{l:'DISPARO',v:t===Infinity?'no corta':mag?'magnético (instantáneo)':'térmico (bimetal)'},{l:'NOMINAL',v:In+' A'}],
   verdict:{cls:t===Infinity?'ok':mag?'bad':'warn',t:t===Infinity?'Corriente normal: la térmica no corta.':mag?'Cortocircuito: el disparo magnético abre el circuito casi al instante.':'Sobrecarga: el bimetal se calienta y corta pasado un tiempo, más corto cuanto mayor es la corriente.'}}},
 draw(S,R,H){let s=H.room(450);
  s+=`<rect x="60" y="80" width="150" height="270" rx="12" fill="#e6e9ee" stroke="#9aa5b3" stroke-width="4"/><rect x="95" y="${R.mag?230:120}" width="80" height="60" rx="8" fill="${R.mag?'#c03a3a':R.t===Infinity?'#2a8f61':'#e6a23a'}"/>`+H.t(135,70,'Térmica '+S.In+' A',{})+H.t(135,395,R.t===Infinity?'conectada':R.mag?'DISPARADA':'cortará en '+dur(R.t),{});
  const heat=Math.min(1,R.r/5);s+=`<path d="M105 300q${20+heat*30} -${30+heat*20} ${60} 0" stroke="${heat>.5?'#ff7a3a':'#c0c8d2'}" stroke-width="8" fill="none" stroke-linecap="round"/>`+H.t(135,330,'bimetal',{});
  const x0=300,y0=90,w=620,h=330,lx=r=>x0+w*Math.log10(r)/Math.log10(20),ly=t=>y0+h-h*(Math.log10(t)-Math.log10(.01))/(Math.log10(3600)-Math.log10(.01));
  s+=`<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="var(--p2)" stroke="var(--line)" opacity=".9"/>`;
  [1.13,2,5,10,20].forEach(r=>{s+=`<path d="M${lx(r)} ${y0}V${y0+h}" stroke="var(--line)"/><text class="lab2" x="${lx(r)}" y="${y0+h+18}" style="text-anchor:middle;font-size:12px;stroke:none">${r===1.13?'1,13':r}×</text>`});
  [.01,1,60,3600].forEach(t=>{s+=`<path d="M${x0} ${ly(t)}H${x0+w}" stroke="var(--line)"/><text class="lab2" x="${x0-6}" y="${ly(t)+4}" style="text-anchor:end;font-size:12px;stroke:none">${t<1?'0,01 s':t<60?t+' s':t===60?'1 min':'1 h'}</text>`});
  let pts='';for(let r=1.14;r<5;r+=.05)pts+=(pts?'L':'M')+lx(r)+' '+ly(tTrip(r*S.In,S.In));pts+=`L${lx(5)} ${ly(.01)}L${lx(20)} ${ly(.01)}`;
  s+=`<path d="${pts}" fill="none" stroke="#4db5ee" stroke-width="4"/>`;
  const px=lx(Math.max(1,Math.min(20,R.r))),py=R.t===Infinity?y0+h+30:ly(R.t);s+=`<circle cx="${px}" cy="${Math.min(py,y0+h)}" r="9" fill="${R.t===Infinity?'#3fbf84':'#ff6b6b'}" stroke="#fff" stroke-width="3"/>`+H.t(x0+w/2,y0-12,'Curva ilustrativa: tiempo de disparo según la corriente',{})+H.t(x0+w/2,y0+h+42,'corriente / corriente nominal',{});
  return s},
 que(S){return 'La térmica tiene dos protecciones: un bimetal que se calienta con la sobrecarga y corta con retardo (más rápido cuanto mayor es la corriente), y un electroimán que corta al instante ante un cortocircuito. La curva muestra cuánto tarda en cortar.'},
 clave:'La térmica protege al conductor, no al artefacto ni a las personas: corta cuando la corriente amenaza con recalentar el cable. Por eso su valor se elige según la sección del cable.',
 dato:'Una térmica de 16 A no corta al instante con 17 A: puede tardar mucho. Por eso la sección del cable debe soportar la térmica que lo protege.'};

/* 13 ----------------------------------------------------------------- calor */
const AMP13={1:10,1.5:15,2.5:21,4:28,6:36};
E.calor={
 controls:[{k:'I',t:'slider',l:'Corriente',min:1,max:40,st:1,v:16,fmt:v=>v+' A'},{k:'sec',t:'choice',l:'Sección del cable',o:[[1,'1 mm²'],[1.5,'1,5 mm²'],[2.5,'2,5 mm²'],[4,'4 mm²'],[6,'6 mm²']],v:1.5}],
 calc(S){const sec=+S.sec,Rm=0.021/sec,P=S.I*S.I*Rm,am=AMP13[sec],r=S.I/am,T=Math.min(180,25+45*r*r);
  return{r,T,P,reads:[{l:'RESISTENCIA POR METRO',v:f(Rm*1000,1)+' mΩ/m'},{l:'CALOR POR METRO',v:f(P,1)+' W/m'},{l:'CORRIENTE ADMISIBLE (ORIENT.)',v:am+' A'},{l:'TEMPERATURA ESTIMADA',v:f(T,0)+' °C'}],
   verdict:{cls:r<=.8?'ok':r<=1?'warn':'bad',t:r<=.8?'El cable trabaja con holgura.':r<=1?'Cerca del límite: el cable se calienta bastante.':'Sobrecarga: el cable supera su corriente admisible y se degrada la aislación.'}}},
 draw(S,R,H){const sec=+S.sec,r=Math.min(1.6,R.r),heat=Math.min(1,r);let s=H.room(450);
  const rad=22+Math.sqrt(sec)*14;
  const ic=`hsl(${Math.round(210-210*heat)} 80% 55%)`;
  s+=`<circle cx="300" cy="250" r="${rad+30}" fill="${ic}" opacity=".5" class="${heat>.5?'pulse':''}"/><circle cx="300" cy="250" r="${rad+14}" fill="#e8e8f0" stroke="#999" stroke-width="3"/><circle cx="300" cy="250" r="${rad}" fill="#c9783a" stroke="#8a4a1a" stroke-width="3"/>`+H.t(300,250+rad+60,sec+' mm²',{});
  for(let i=0;i<5;i++)if(heat>.35)s+=`<path d="M${240+i*30} ${170-i%2*10}q10 -20 0 -40q-10 -20 0 -40" stroke="#ff9a4a" stroke-width="4" fill="none" opacity=".7" class="pulse"/>`;
  s+=`<rect x="580" y="90" width="60" height="330" rx="30" fill="var(--p2)" stroke="var(--line)"/><rect x="590" y="${410-300*Math.min(1,R.T/180)}" width="40" height="${300*Math.min(1,R.T/180)}" rx="20" fill="${ic}"/>`+H.t(610,70,'Temperatura',{})+H.t(610,448,f(R.T,0)+' °C',{});
  s+=`<rect x="700" y="200" width="250" height="100" rx="12" fill="var(--p2)" stroke="var(--line)"/>`+H.t(825,238,'P = I² · R',{})+H.t(825,270,S.I+'² × '+f(0.021/sec*1000,1)+' mΩ = '+f(R.P,1)+' W/m',{}).replace('class="lab"','class="lab2" style="text-anchor:middle;stroke:none"');
  return s},
 que(S){return 'Todo conductor tiene resistencia: al circular corriente se disipa calor, P = I²·R por cada metro de cable. La corriente se eleva al cuadrado: duplicarla multiplica el calor por cuatro. Un cable más grueso tiene menos resistencia y se calienta menos.'},
 clave:'Un cable tiene una corriente máxima admisible según su sección. Superarla durante mucho tiempo recalienta la aislación y puede provocar un incendio, aunque no haya cortocircuito.',
 dato:'Por eso un alargue enrollado se calienta más que uno extendido: el calor no puede disiparse.'};

/* 14 ----------------------------------------------------------------- bañera */
E.banadera={
 controls:[{k:'plug',t:'toggle',l:'El secador está enchufado',v:true},{k:'cae',t:'toggle',l:'El secador cae al agua de la bañera',v:false},{k:'dif',t:'toggle',l:'Hay disyuntor diferencial',v:false}],
 calc(S){const live=S.plug&&S.cae,Ip=220/1500*1000,trip=live&&S.dif,mA=live?(trip?0:Ip):0;
  return{live,trip,mA,reads:[{l:'SECADOR',v:S.cae?'en el agua':'en el estante'},{l:'ALIMENTACIÓN',v:S.plug?(trip?'cortada':'conectado'):'desenchufado'},{l:'CORRIENTE POR LA PERSONA',v:amp(mA)},{l:'DIFERENCIAL',v:S.dif?(trip?'cortó':'presente'):'no hay'}],mA,
   verdict:{cls:!live?'ok':trip?'ok':'bad',t:!S.cae?'El secador está fuera del agua: no hay circuito por la persona.':!S.plug?'Está desenchufado: sin tensión, no pasa nada.':trip?'El diferencial detectó la fuga y cortó antes de que fuera peligrosa.':'El agua conecta el artefacto con la persona: circula una corriente mortal.'}}},
 draw(S,R,H){let s=H.room(450,{tile:1,wall:'#cfe3ee'});
  s+=`<rect x="110" y="296" width="580" height="150" rx="34" fill="#f4f6f8" stroke="#b9c3cd" stroke-width="5" filter="url(#shadow)"/>`+H.water(134,330,532,104,{r:22})+H.t(400,478,'Bañera',{});
  s+=`<g transform="translate(330 330)"><circle cx="0" cy="-120" r="26" fill="var(--skin)" stroke="var(--ink)" stroke-width="4"/><path d="M0 -94V-20M0 -80L-50 -40M0 -80L50 -50" stroke="var(--ink)" stroke-width="9" stroke-linecap="round" fill="none"/>${R.live&&!R.trip?`<path d="M0 -94V0M50 -50L30 0" fill="none" stroke="#ff6b6b" stroke-width="14" opacity=".55" class="pulse"/>`:''}</g>`;
  const dx=S.cae?500:560,dy=S.cae?380:240;
  s+=`<g transform="translate(${dx} ${dy}) rotate(${S.cae?20:0})"><rect x="-40" y="-14" width="70" height="28" rx="10" fill="#d6477f"/><rect x="26" y="-8" width="26" height="16" fill="#555"/><rect x="-8" y="10" width="16" height="36" rx="5" fill="#d6477f"/></g>`;
  s+=`<path d="M${dx-40} ${dy}C760 ${dy-80} 800 160 840 160" fill="none" stroke="#333" stroke-width="4"/>`;
  s+=`<rect x="810" y="120" width="70" height="90" rx="8" fill="#e6e9ee" stroke="#9aa5b3" stroke-width="3"/>`+H.t(845,232,S.plug?'toma':'toma (libre)',{})+(S.plug?'':`<path d="M840 160L760 220" stroke="#333" stroke-width="3" stroke-dasharray="4 4"/>`);
  if(R.live&&!R.trip){s+=H.spark(dx,dy+20,1.2);for(let i=0;i<4;i++)s+=`<path class="flowd" d="M${dx} ${dy+30}Q${(dx+330)/2} ${400+i*10} 330 ${360}"/>`}
  if(R.trip)s+=`<rect x="720" y="260" width="140" height="70" rx="10" fill="#2a8f61"/>`+H.t(790,303,'CORTÓ ✔',{});
  return s},
 que(S){return 'El agua de la bañera conduce y está conectada a la tierra por la cañería. Si un artefacto enchufado cae, el agua lleva la corriente hasta la persona. El diferencial detecta esa fuga y corta en milésimas de segundo.'},
 clave:'Agua y electricidad es una combinación de altísimo riesgo. Nunca uses artefactos enchufados cerca del agua y, si alguien cae, cortá primero la llave general antes de tocarlo.',
 dato:'En los baños se exigen interruptores diferenciales y las zonas cercanas al agua tienen restricciones de tomas y artefactos.'};

/* 15 ---------------------------------------------------------------- incendio */
E.incendio={
 controls:[{k:'acc',t:'choice',l:'¿Qué hacés?',o:[['agua','Echar agua sin cortar la energía'],['cortar','Cortar la energía y después usar agua'],['matafuego','Usar un matafuego apto eléctrico (CO₂ o polvo)']],v:'agua'}],
 calc(S){const energ=S.acc!=='cortar',cond=S.acc==='agua',mA=cond?220/5000*1000:0;
  return{energ,cond,mA,reads:[{l:'TENSIÓN EN EL TABLERO',v:energ?'220 V':'0 V'},{l:'AGENTE',v:S.acc==='matafuego'?'CO₂ / polvo':'agua'},{l:'CORRIENTE POR EL CHORRO',v:amp(mA)},{l:'RESULTADO',v:cond?'peligro de electrocución':'seguro'}],mA,
   verdict:{cls:cond?'bad':'ok',t:cond?'El chorro de agua conduce: la corriente puede viajar por el agua hasta quien sostiene la manguera.':S.acc==='cortar'?'Sin tensión, el agua ya no es peligrosa desde el punto de vista eléctrico.':'El CO₂ y el polvo químico no conducen la electricidad: son aptos para equipos energizados.'}}},
 draw(S,R,H){let s=H.room(450,{wall:'#d8d0c0'});
  s+=`<rect x="560" y="120" width="260" height="300" rx="10" fill="#cfd6de" stroke="#8d99a8" stroke-width="5"/><rect x="590" y="150" width="90" height="100" fill="#8d99a8"/><rect x="700" y="150" width="90" height="100" fill="#8d99a8"/>`+H.t(690,110,'Tablero eléctrico',{});
  s+=`<rect x="780" y="290" width="30" height="60" rx="5" fill="${R.energ?'#d83a3a':'#2a8f61'}"/>`+H.t(795,372,R.energ?'llave ON':'llave OFF',{});
  s+=H.fire(630,330,1.05)+H.fire(700,350,1.25)+H.fire(760,320,.9)+H.smoke(690,170,5);
  s+=H.person({x:200,y:450,s:1.25,lh:[40,-110],rh:[70,-130],glow:R.cond?[[70,-130],[0,-136],[0,-85],[-16,0]]:null,gc:'#ff6b6b'});
  if(S.acc==='matafuego'){s+=`<rect x="300" y="340" width="40" height="90" rx="10" fill="#d83a3a"/><text x="320" y="392" style="font:700 14px system-ui;text-anchor:middle;fill:#fff">CO₂</text><path d="M340 350Q430 330 550 300" stroke="#f4f6f8" stroke-width="16" stroke-linecap="round" opacity=".85"/>`}
  else{s+=`<path d="M270 320Q420 200 560 280" fill="none" stroke="var(--water)" stroke-width="12" stroke-linecap="round"/>`+(R.cond?`<path class="flowd" d="M270 320Q420 200 560 280"/>`+H.spark(560,280,1.1):'')}
  return s},
 que(S){return S.acc==='agua'?'Si el tablero está energizado, el chorro de agua puede conducir corriente desde el equipo hasta la persona que sostiene la manguera. Cuanto más cerca y más compacto el chorro, mayor el riesgo.':S.acc==='cortar'?'Primero se corta la energía: sin tensión, el fuego se trata como cualquier otro incendio. El agua después sí puede usarse con seguridad.':'Los matafuegos de CO₂ y de polvo químico no conducen la electricidad y se pueden usar con equipos energizados.'},
 clave:'Ante un incendio eléctrico: cortar la energía (si se puede hacerlo con seguridad), alejar a las personas y llamar a los bomberos. Nunca uses agua sobre equipos energizados.',
 dato:'Los matafuegos tienen una etiqueta con las clases de fuego para las que sirven: la “C” indica que son aptos para equipos eléctricos energizados.'};

/* 16 ------------------------------------------------------------------ paso */
E.paso={
 controls:[
  {k:'ten',t:'choice',l:'Tensión del cable caído',o:[['220','Baja tensión (220 V)'],['13200','Media tensión (13,2 kV)']],v:'13200'},
  {k:'d',t:'slider',l:'Distancia al punto de contacto',min:.5,max:10,st:.5,v:1.5,fmt:v=>f(v,1)+' m'},
  {k:'modo',t:'choice',l:'Cómo te movés',o:[['normal','Pasos normales'],['chicos','Pasos muy cortos (arrastrando)'],['salto','Saltando con los pies juntos']],v:'normal'},
  {k:'s',t:'slider',l:'Longitud del paso (pasos normales)',min:.2,max:1,st:.1,v:.8,fmt:v=>f(v,1)+' m'}],
 calc(S){const V0=S.ten==='220'?220:13200/Math.sqrt(3),s=S.modo==='normal'?S.s:S.modo==='chicos'?.2:.05,r0=.5,V=r=>V0*r0/Math.max(r,r0),dV=V(S.d)-V(S.d+s),mA=dV/2000*1000;
  return{V0,s,dV,mA,V,reads:[{l:'POTENCIAL EN EL SUELO (PIE CERCANO)',v:volt(V(S.d))},{l:'LARGO DEL PASO',v:f(s,2)+' m'},{l:'TENSIÓN ENTRE LOS PIES',v:volt(dV)},{l:'CORRIENTE POR LAS PIERNAS',v:amp(mA)}],mA,
   verdict:{cls:mA<2?'ok':mA<10?'warn':'bad',t:S.modo==='salto'?'Con los pies juntos casi no hay diferencia de potencial entre ellos.':mA<2?'Diferencia de tensión pequeña entre los pies.':mA<10?'Se siente: hay que alejarse con pasos cortos.':'Peligroso: gran diferencia de tensión entre los pies.'}}},
 draw(S,R,H){let s=`<rect x="0" y="0" width="1000" height="520" fill="var(--gnd)"/>`;
  const cx=170,cy=190,sc=48;
  for(let r=8;r>=.5;r-=r>2?1:.5){const t=R.V(r)/R.V0,hue=Math.round(120*(1-Math.min(1,t*1.4)));s+=`<circle cx="${cx}" cy="${cy}" r="${r*sc}" fill="hsl(${hue} 70% 45%)" opacity=".55"/>`}
  s+=`<circle cx="${cx}" cy="${cy}" r="9" fill="#ff3a3a" stroke="#fff" stroke-width="3"/>`+H.spark(cx,cy,.9)+H.t(cx,cy+48,'cable caído',{});
  const px=cx+S.d*sc,qx=cx+(S.d+R.s)*sc;
  s+=`<ellipse cx="${px}" cy="${cy}" rx="11" ry="18" fill="#222" stroke="#fff"/><ellipse cx="${qx}" cy="${cy}" rx="11" ry="18" fill="#222" stroke="#fff"/>`+`<path d="M${px} ${cy}H${qx}" stroke="${R.mA>=10?'#ff6b6b':'#ffd65a'}" stroke-width="6"/>`+H.t((px+qx)/2,cy-34,'Δ = '+volt(R.dV),{});
  const x0=60,y0=360,w=880,h=130;s+=`<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="var(--p2)" stroke="var(--line)" opacity=".9"/>`;
  let pts='';for(let r=.5;r<=10.001;r+=.25)pts+=(pts?'L':'M')+(x0+w*(r-.5)/9.5)+' '+(y0+h-8-(h-20)*R.V(r)/R.V0);
  s+=`<path d="${pts}" fill="none" stroke="#ff6b6b" stroke-width="4"/>`+H.t(x0+w/2,y0-8,'Potencial del suelo según la distancia al cable',{});
  [[S.d,'#ffd65a'],[S.d+R.s,'#ffd65a']].forEach(p=>{const x=x0+w*(p[0]-.5)/9.5;s+=`<path d="M${x} ${y0}V${y0+h}" stroke="${p[1]}" stroke-width="3" stroke-dasharray="4 4"/>`});
  s+=H.t(x0+w-20,y0+h+18,'distancia (m) →',{a:'end'}).replace('class="lab"','class="lab2"');return s},
 que(S){return 'Cuando un cable energizado toca el suelo, la corriente se dispersa en todas direcciones y el potencial del suelo es máximo en el punto de contacto y baja con la distancia. Si tus pies están a distinta distancia, entre ellos hay una diferencia de tensión (tensión de paso) y circula corriente por las piernas.'},
 clave:'Cerca de un cable caído, alejate con pasos muy cortos y pies juntos (o saltando con los pies juntos), de modo que ambos pies queden al mismo potencial. No corras ni des pasos largos.',
 dato:'Es la misma razón por la que el ganado se electrocuta cerca de una descarga a tierra: sus patas delanteras y traseras están muy separadas.'};

/* 17 -------------------------------------------------------------------- rayo */
const L17={
 arbol:{n:'Bajo un árbol',cls:'bad',t:'Muy peligroso: la descarga puede saltar del tronco a las personas y se propaga por el suelo.'},
 campo:{n:'En campo abierto',cls:'bad',t:'Peligroso: sos el punto más alto y hay tensión de paso en el suelo. Agachate con los pies juntos, sin acostarte.'},
 auto:{n:'Dentro de un auto',cls:'ok',t:'Seguro: la carrocería metálica conduce la corriente por el exterior hacia tierra (jaula de Faraday).'},
 casa:{n:'Dentro de una casa',cls:'ok',t:'Seguro si no tocás cañerías ni aparatos conectados a la red. Un pararrayos desvía la descarga a tierra.'},
 pileta:{n:'En una pileta o el agua',cls:'bad',t:'Muy peligroso: el agua conduce la corriente del rayo.'}};
E.rayo={
 controls:[{k:'lug',t:'choice',l:'¿Dónde estás?',o:Object.keys(L17).map(k=>[k,L17[k].n]),v:'arbol'},{k:'ray',t:'toggle',l:'Cae un rayo ⚡',v:true}],
 calc(S){return{reads:[{l:'TENSIÓN DEL RAYO',v:'≈ 100 millones de V'},{l:'CORRIENTE DE PICO',v:'≈ 30.000 A'},{l:'DURACIÓN',v:'≈ 0,0002 s'},{l:'LUGAR',v:L17[S.lug].n}],verdict:{cls:L17[S.lug].cls,t:L17[S.lug].t}}},
 draw(S,R,H){let s=H.sky()+H.ground(430)+`<rect x="0" y="430" width="1000" height="90" fill="var(--road)" opacity=".5"/>`;
  s+=`<g fill="#6b7686"><ellipse cx="500" cy="70" rx="260" ry="46"/><ellipse cx="380" cy="90" rx="160" ry="40"/><ellipse cx="640" cy="92" rx="170" ry="40"/></g>`;
  s+=`<g><rect x="165" y="270" width="26" height="160" fill="#7a5a36"/><circle cx="178" cy="250" r="70" fill="#2f7a3a"/></g>`;
  s+=`<g><rect x="780" y="300" width="170" height="130" fill="var(--house)" stroke="var(--metal)" stroke-width="3"/><path d="M770 300L865 230L960 300Z" fill="var(--roof)"/><rect x="800" y="340" width="40" height="40" fill="#bfe3ff" stroke="var(--metal)"/></g><path d="M865 230V190" stroke="var(--metal)" stroke-width="4"/>`;
  s+=`<g><rect x="440" y="392" width="140" height="42" rx="12" fill="#c0392b"/><rect x="465" y="364" width="90" height="34" rx="10" fill="#e07a6f"/><circle cx="470" cy="436" r="14" fill="#222"/><circle cx="550" cy="436" r="14" fill="#222"/></g>`;
  s+=`<ellipse cx="640" cy="465" rx="100" ry="26" fill="var(--water)" opacity=".8"/>`;
  const pos={arbol:[240,430],campo:[330,430],auto:[510,400],casa:[860,420],pileta:[640,462]}[S.lug];
  const inside=S.lug==='auto'||S.lug==='casa';
  if(!inside)s+=H.person({x:pos[0],y:pos[1],s:.55,glow:S.ray&&L17[S.lug].cls==='bad'?[[0,-136],[0,-85],[-8,0]]:null,gc:'#ff6b6b'});
  else s+=`<circle cx="${pos[0]}" cy="${pos[1]-8}" r="9" fill="var(--skin)" stroke="var(--ink)" stroke-width="2"/>`;
  if(S.ray){const tx={arbol:178,campo:330,auto:510,casa:865,pileta:640}[S.lug],ty={arbol:185,campo:380,auto:360,casa:190,pileta:450}[S.lug];
   s+=`<rect x="0" y="0" width="1000" height="520" fill="#fff" opacity=".12" class="sprk"/>`+H.bolt(500+(tx-500)*.3,110,tx,ty,{w:8,n:11});
   if(S.lug==='auto')s+=`<path d="M440 392h140M440 392V434M580 392V434" stroke="#ffd65a" stroke-width="5" fill="none" class="pulse"/>`;
   if(S.lug==='casa')s+=`<path d="M865 190V300" stroke="#ffd65a" stroke-width="5" class="pulse"/>`;
   if(S.lug==='campo'||S.lug==='arbol')s+=`<circle cx="${tx}" cy="432" r="60" fill="none" stroke="#ffd65a" stroke-width="3" stroke-dasharray="6 6" class="pulse"/>`;
   if(S.lug==='pileta')s+=`<ellipse cx="640" cy="465" rx="90" ry="22" fill="none" stroke="#ffd65a" stroke-width="4" class="pulse"/>`}
  return s},
 que(S){return L17[S.lug].t},
 clave:'El rayo busca el camino más fácil hacia tierra. Los lugares seguros son aquellos donde la corriente circula por el exterior de una estructura conductora o es desviada a tierra, y la persona queda en el interior.',
 dato:'Las ruedas de goma no aíslan a un auto de un rayo: lo que protege es la carrocería metálica que rodea a los ocupantes.'};

/* 18 --------------------------------------------------------------- alta tensión */
E.altatension={
 controls:[
  {k:'P',t:'slider',l:'Potencia a transportar',min:10,max:500,st:10,v:100,fmt:v=>v+' MW'},
  {k:'L',t:'slider',l:'Longitud de la línea',min:10,max:500,st:10,v:100,fmt:v=>v+' km'},
  {k:'V',t:'choice',l:'Tensión de transporte',o:[[13.2,'13,2 kV'],[33,'33 kV'],[132,'132 kV'],[500,'500 kV']],v:13.2}],
 calc(S){const V=+S.V,I=S.P*1e6/(Math.sqrt(3)*V*1e3),R=0.05*S.L,loss=3*I*I*R/1e6,pct=loss/S.P*100;
  return{I,R,loss,pct,reads:[{l:'CORRIENTE EN LA LÍNEA',v:f(I,0)+' A'},{l:'RESISTENCIA DE LA LÍNEA',v:f(R,1)+' Ω'},{l:'PÉRDIDAS',v:pct>=100?'> 100 %':f(loss,2)+' MW'},{l:'PÉRDIDAS (%)',v:pct>=100?'imposible':f(pct,1)+' %'}],
   verdict:{cls:pct<5?'ok':pct<20?'warn':'bad',t:pct>=100?'A esa tensión la línea no puede transportar esa potencia: se perdería todo en calor.':pct<5?'Pérdidas pequeñas: transporte eficiente.':pct<20?'Pérdidas importantes en forma de calor.':'Pérdidas enormes: la línea sería inviable.'}}},
 draw(S,R,H){let s=H.sky()+H.ground(430);
  s+=`<rect x="40" y="320" width="110" height="110" fill="var(--metal)" stroke="var(--line)"/><path d="M60 320v-50M100 320v-70M130 320v-40" stroke="var(--metal)" stroke-width="12"/>`+H.t(95,300,'Central',{});
  s+=`<g fill="var(--metal)">${[0,1,2,3,4,5].map(i=>`<rect x="${860+i*14}" y="${330-(i%3)*20}" width="12" height="${100+(i%3)*20}"/>`).join('')}</g>`+H.t(910,300,'Ciudad',{});
  const heat=Math.min(1,R.pct/30),w=Math.max(3,Math.min(22,Math.log10(R.I+1)*5));
  [200,330,460,590,720].forEach(x=>{s+=`<path d="M${x-22} 430L${x} 220L${x+22} 430M${x-16} 360H${x+16}M${x-10} 300H${x+10}M${x-34} 240H${x+34}" stroke="var(--metal)" stroke-width="4" fill="none"/>`});
  const d='M150 340L200 240Q265 270 330 240Q395 270 460 240Q525 270 590 240Q655 270 720 240L860 340';
  s+=`<path d="${d}" fill="none" stroke="rgb(${Math.round(180+75*heat)} ${Math.round(190-120*heat)} ${Math.round(200-150*heat)})" stroke-width="${w}" stroke-linecap="round"/><path class="flowd" d="${d}"/>`;
  s+=H.t(500,180,'I = '+f(R.I,0)+' A  ·  '+S.V+' kV',{});
  const bw=Math.max(0,Math.min(1,R.pct/100));s+=`<rect x="300" y="470" width="400" height="22" rx="11" fill="var(--p2)" stroke="var(--line)"/><rect x="300" y="470" width="${400*bw}" height="22" rx="11" fill="${R.pct<5?'#3fbf84':R.pct<20?'#e6c63a':'#d02030'}"/>`+H.t(500,462,'Pérdidas en la línea (calor)',{});
  return s},
 que(S){return 'Para una misma potencia, al subir la tensión baja la corriente: I = P / (√3·V). Las pérdidas en los cables son P = 3·I²·R, así que reducir la corriente reduce las pérdidas con el cuadrado. Por eso se transporta en alta tensión.'},
 clave:'Subir la tensión 10 veces baja la corriente 10 veces y las pérdidas por calor 100 veces. Es la razón de existir de los transformadores elevadores y de las líneas de alta tensión.',
 dato:'Con 100 MW a 13,2 kV circularían unos 4.370 A (la línea sería inviable); a 132 kV, unos 437 A, y a 500 kV, solo unos 115 A.'};

/* 19 ------------------------------------------------------------------ trifásica */
E.trifasica={
 controls:[{k:'pausa',t:'toggle',l:'Pausar la animación',v:false},{k:'lin',t:'toggle',l:'Mostrar la tensión entre dos fases (R–S)',v:true}],
 anim:true,
 calc(S){const ang=((S.t||0)*.3%1)*360,r=Math.PI/180,Vp=311,vR=Vp*Math.sin(ang*r),vS=Vp*Math.sin((ang-120)*r),vT=Vp*Math.sin((ang-240)*r),vRS=vR-vS;
  return{ang,vR,vS,vT,vRS,reads:[{l:'TENSIÓN R (INSTANTÁNEA)',v:f(vR,0)+' V'},{l:'TENSIÓN S',v:f(vS,0)+' V'},{l:'TENSIÓN T',v:f(vT,0)+' V'},{l:'ENTRE R Y S',v:f(vRS,0)+' V'}],verdict:{cls:'ok',t:'Valores eficaces: 220 V entre fase y neutro, 380 V entre dos fases (220 × √3).'}}},
 draw(S,R,H){let s='<rect x="0" y="0" width="1000" height="520" fill="var(--p)"/>';
  const x0=40,y0=70,w=560,h=300,cy=y0+h/2,A=h/2-30;
  s+=`<rect x="${x0}" y="${y0}" width="${w}" height="${h}" rx="12" fill="var(--p2)" stroke="var(--line)"/><path d="M${x0} ${cy}H${x0+w}" stroke="var(--line)"/>`;
  const wave=(ph,c,k=1,wd=4)=>{let d='';for(let x=0;x<=w;x+=4){const a=x/w*720-ph;let v=Math.sin(a*Math.PI/180);if(k===2)v=(Math.sin(a*Math.PI/180)-Math.sin((a-120)*Math.PI/180))/1.732;d+=(x?'L':'M')+(x0+x)+' '+(cy-v*A*(k===2?1:1))}return`<path d="${d}" fill="none" stroke="${c}" stroke-width="${wd}"/>`};
  s+=wave(0,'#e5484d')+wave(120,'#3ecf7a')+wave(240,'#4db5ee');
  if(S.lin){let d='';for(let x=0;x<=w;x+=4){const a=x/w*720,v=Math.sin(a*Math.PI/180)-Math.sin((a-120)*Math.PI/180);d+=(x?'L':'M')+(x0+x)+' '+(cy-v*A/1.732*1.0)}s+=`<path d="${d}" fill="none" stroke="#ffd65a" stroke-width="4" stroke-dasharray="9 6"/>`}
  const cx=x0+((R.ang)/720*w)%w;s+=`<path d="M${x0+R.ang/720*w} ${y0}V${y0+h}" stroke="var(--tx)" stroke-width="3"/>`;
  s+=H.t(x0+w/2,y0-12,'Tres ondas desfasadas 120°',{});
  const px=800,py=240,pr=130;s+=`<circle cx="${px}" cy="${py}" r="${pr}" fill="none" stroke="var(--line)"/><path d="M${px-pr} ${py}H${px+pr}M${px} ${py-pr}V${py+pr}" stroke="var(--line)"/>`;
  [[0,'#e5484d','R'],[120,'#3ecf7a','S'],[240,'#4db5ee','T']].forEach(p=>{const a=(R.ang-p[0])*Math.PI/180,vx=px+pr*.85*Math.cos(a),vy=py-pr*.85*Math.sin(a);
   s+=`<path d="M${px} ${py}L${vx} ${vy}" stroke="${p[1]}" stroke-width="5"/><path d="M${vx} ${vy}V${py}" stroke="${p[1]}" stroke-width="2" stroke-dasharray="4 4"/>`+H.t(vx+(vx>px?14:-14),vy+4,p[2],{})});
  if(S.lin){const a1=(R.ang)*Math.PI/180,a2=(R.ang-120)*Math.PI/180;s+=`<path d="M${px+pr*.85*Math.cos(a2)} ${py-pr*.85*Math.sin(a2)}L${px+pr*.85*Math.cos(a1)} ${py-pr*.85*Math.sin(a1)}" stroke="#ffd65a" stroke-width="4" stroke-dasharray="8 6"/>`}
  s+=H.t(px,py+pr+26,'Las tres fases están a 120° entre sí',{});
  s+=`<rect x="640" y="428" width="320" height="76" rx="12" fill="var(--p2)" stroke="var(--line)"/>`+H.t(800,455,'220 V × √3 = 380 V',{})+H.t(800,484,'tensión de fase × 1,732 = tensión de línea',{}).replace('class="lab"','class="lab2" style="text-anchor:middle;stroke:none"');
  return s},
 que(S){return 'Las tres fases son tres ondas iguales desfasadas 120°. Entre una fase y el neutro hay 220 V eficaces. Entre dos fases, como las ondas no coinciden en el tiempo, la diferencia es mayor: 220 × √3 ≈ 380 V.'},
 clave:'Por eso en una instalación trifásica hay dos tensiones: 220 V (fase–neutro) para tomas y luces, y 380 V (fase–fase) para motores trifásicos y cargas grandes.',
 dato:'La suma instantánea de las tres corrientes de una carga equilibrada es cero: por eso el neutro casi no lleva corriente en una instalación equilibrada.'};

/* 20 ------------------------------------------------------------- transformador */
E.trafo={
 controls:[{k:'src',t:'choice',l:'Fuente del primario',o:[['ca','Corriente alterna'],['cc','Corriente continua']],v:'ca'},{k:'rel',t:'choice',l:'Relación de transformación',o:[['0.1','Reductor 10 : 1'],['1','Igual 1 : 1'],['10','Elevador 1 : 10']],v:'0.1'}],
 anim:true,
 calc(S){const k=+S.rel,ca=S.src==='ca',Vs=ca?220*k:0;
  return{Vs,ca,reads:[{l:'TENSIÓN EN EL PRIMARIO',v:ca?'220 V~':'220 V CC'},{l:'TENSIÓN EN EL SECUNDARIO',v:ca?volt(Vs):'0 V'},{l:'FLUJO EN EL NÚCLEO',v:ca?'variable (induce)':'constante (no induce)'},{l:'RESULTADO',v:ca?'transforma':'¡el primario se quema!'}],
   verdict:{cls:ca?'ok':'bad',t:ca?'El flujo magnético cambia continuamente e induce tensión en el secundario: Vs = Vp × N2/N1.':'Con corriente continua el flujo es constante y no induce nada. Además la corriente del primario solo queda limitada por la resistencia del alambre: se sobrecalienta.'}}},
 draw(S,R,H){const t=S.t||0,ph=Math.sin(t*2*Math.PI*.6);let s='<rect x="0" y="0" width="1000" height="520" fill="var(--p)"/>';
  s+=`<rect x="360" y="110" width="280" height="300" rx="14" fill="#8d99a8" stroke="#5d6a79" stroke-width="4"/><rect x="410" y="160" width="180" height="200" rx="8" fill="var(--p)"/>`;
  const turns=(x,n,c)=>Array.from({length:n},(_,i)=>`<ellipse cx="${x}" cy="${180+i*(160/n)+8}" rx="40" ry="9" fill="none" stroke="${c}" stroke-width="6"/>`).join('');
  s+=turns(380,8,'#c9783a')+turns(620,R.ca&&+S.rel>=10?16:R.ca&&+S.rel<=.1?4:8,'#4db5ee');
  s+=H.t(380,100,'Primario',{})+H.t(620,100,'Secundario',{});
  s+=`<path d="M300 220H340M300 330H340" stroke="#c9783a" stroke-width="6"/><rect x="170" y="200" width="130" height="150" rx="10" fill="var(--p2)" stroke="var(--line)"/>`+H.t(235,255,S.src==='ca'?'~ 220 V':'⎓ 220 V',{})+H.t(235,300,S.src==='ca'?'CA':'CC',{});
  s+=`<path d="M660 220H700M660 330H700" stroke="#4db5ee" stroke-width="6"/><circle cx="780" cy="275" r="${34}" fill="${R.ca?'#ffe98a':'#3a4658'}" stroke="#fff0a1" stroke-width="4" opacity="${R.ca?Math.min(1,.35+.65*Math.min(1,R.Vs/150)):1}"/>`+H.t(780,340,R.ca?volt(R.Vs):'0 V',{});
  if(R.ca){const dirn=ph>=0?1:-1,a=Math.abs(ph);s+=`<path d="M440 175H560V345H440Z" fill="none" stroke="#7fd0ff" stroke-width="${2+a*8}" stroke-dasharray="10 8" opacity="${.3+a*.7}"/>`+`<path d="M${dirn>0?440:560} 175L${dirn>0?560:440} 175" stroke="#7fd0ff" stroke-width="3" opacity="0"/>`+H.t(500,265,ph>=0?'⟳ flujo →':'⟲ flujo ←',{})}
  else{s+=`<path d="M440 175H560V345H440Z" fill="none" stroke="#9aa5b3" stroke-width="6"/>`+H.t(500,265,'flujo constante',{})+H.spark(300,275,1.2)}
  const wx=60,wy=440,ww=880;let d='';for(let x=0;x<=ww;x+=5){const v=R.ca?Math.sin((x/ww*6-t*.6*2)*Math.PI*2/2)*(+S.rel>=10?34:+S.rel<=.1?10:22):0;d+=(x?'L':'M')+(wx+x)+' '+(wy-v)}
  s+=`<path d="${d}" fill="none" stroke="#4db5ee" stroke-width="3"/>`+H.t(500,484,'Tensión en el secundario',{});
  return s},
 que(S){return S.src==='ca'?'La corriente alterna crea en el núcleo un flujo magnético que cambia constantemente. Ese flujo variable induce tensión en el secundario, proporcional a la relación de espiras.':'La corriente continua crea un flujo constante, que no induce tensión en el secundario. El primario se comporta como un alambre casi sin resistencia: circula una corriente enorme y se quema.'},
 clave:'El transformador funciona por inducción: solo hay tensión inducida cuando el flujo magnético varía. Por eso solo trabaja con corriente alterna (o continua pulsante).',
 dato:'Esa es la razón por la que la red eléctrica es de corriente alterna: permite subir y bajar la tensión fácilmente con transformadores.'};
})();
