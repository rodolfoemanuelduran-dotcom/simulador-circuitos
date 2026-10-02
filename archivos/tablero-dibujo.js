/* Dibujo realista de los tableros. window.DIBUJOS[nombre](ctx) devuelve el SVG completo. */
window.DIBUJOS=window.DIBUJOS||{};
(function(){
const GR=`<defs>
<linearGradient id="gPlaca" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d9dde2"/><stop offset=".5" stop-color="#c3c9d0"/><stop offset="1" stop-color="#aab1ba"/></linearGradient>
<linearGradient id="gDoor" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b7bec7"/><stop offset="1" stop-color="#8f98a3"/></linearGradient>
<linearGradient id="gRail" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1f4f7"/><stop offset=".5" stop-color="#9aa5b1"/><stop offset="1" stop-color="#6a7582"/></linearGradient>
<linearGradient id="gFuse" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e9e4d4"/><stop offset=".5" stop-color="#fffdf2"/><stop offset="1" stop-color="#cfc8b2"/></linearGradient>
<linearGradient id="gBorn" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9aa1aa"/><stop offset=".5" stop-color="#d9dde2"/><stop offset="1" stop-color="#8a919b"/></linearGradient>
<linearGradient id="gMot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5f7fa6"/><stop offset=".5" stop-color="#34527a"/><stop offset="1" stop-color="#1d3252"/></linearGradient>
</defs>`;
const rail=(x,y,w)=>`<rect x="${x}" y="${y}" width="${w}" height="16" fill="url(#gRail)" stroke="#5c6570"/><rect x="${x+8}" y="${y+5}" width="${w-16}" height="6" rx="3" fill="#4e5864" opacity=".6"/>`;
const txt=(x,y,t,st)=>`<text x="${x}" y="${y}" text-anchor="middle" style="${st}" pointer-events="none">${t}</text>`;

function base(c,comps,o){const {S,wires,pend,drag,selW,hint,focusW,selP,t,T,K,W,CH}=c;o=o||{};
 let s=CH.DEFS+GR;
 const pw=o.pw||672,dx=pw+40;
 s+=`<rect x="20" y="46" width="${pw}" height="502" rx="10" fill="url(#gPlaca)" stroke="#6b7480" stroke-width="3"/>`;
 [[34,60],[pw+6,60],[34,534],[pw+6,534]].forEach(p=>s+=`<circle cx="${p[0]}" cy="${p[1]}" r="6" fill="#7e8893" stroke="#4b525b"/>`);
 s+=`<text x="${20+pw/2}" y="38" class="lab c t" pointer-events="none">PLACA DE MONTAJE (fondo del tablero)</text>`;
 s+=`<rect x="${dx}" y="46" width="${988-dx}" height="502" rx="10" fill="url(#gDoor)" stroke="#5c6570" stroke-width="3"/><text x="${(dx+988)/2}" y="38" class="lab c t" pointer-events="none">PUERTA</text>`;
 [90,260,430].forEach(y=>s+=`<rect x="${dx-8}" y="${y}" width="10" height="46" rx="3" fill="#6a7582"/>`);
 (o.rails||[[30,92,300],[30,170,300],[30,300,300],[30,438,300]]).forEach(r=>s+=rail(r[0],r[1],r[2]));
 s+=comps;
 /* cables */
 const path=(a,b)=>{const A=T[a],B=T[b],ddx=B.x-A.x,ddy=B.y-A.y,m=Math.max(30,Math.min(110,Math.abs(ddy)*.5+Math.abs(ddx)*.15));const sg=ddy>=0?1:-1;return`M${A.x} ${A.y}C${A.x} ${A.y+sg*m} ${B.x} ${B.y-sg*m} ${B.x} ${B.y}`};
 const liveRoots=S.live?Object.values(S.rt||{}):[];
 wires.forEach(w=>{const d=path(w.a,w.b),col=w.col?K.COLORS[w.col]:(w.ref>=0?K.COLORS[W[w.ref][2]]:'#c04fd8'),sel=w.id===selW,lv=S.live&&S.uf&&liveRoots.includes(S.uf.f(w.a)),dark=col==='#34363c';
  s+=`<g data-w="${w.id}"><path d="${d}" fill="none" stroke="transparent" stroke-width="22"/>`+(sel?`<path d="${d}" fill="none" stroke="#ffd65a" stroke-width="13" stroke-linecap="round" opacity=".9"/>`:'')+(lv?`<path d="${d}" class="liv" fill="none" stroke="#fff" stroke-width="11" stroke-linecap="round"/>`:'')+`<path d="${d}" fill="none" stroke="${dark?'#8b95a1':'#101418'}" stroke-width="9" stroke-linecap="round" opacity=".95"/><path d="${d}" fill="none" stroke="${col}" stroke-width="6.4" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.6" stroke-linecap="round" transform="translate(-1.2 -1.4)"/></g>`});
 /* bornes */
 const used={};wires.forEach(w=>{used[w.a]=1;used[w.b]=1});
 const hh=hint||(focusW!==null?W[focusW]:null);
 Object.keys(T).forEach(id=>{const p=T[id],pe=pend===id,hn=hh&&(hh[0]===id||hh[1]===id),u=used[id];
  s+=`<g pointer-events="none">${hn?`<circle cx="${p.x}" cy="${p.y}" r="20" fill="none" stroke="#ffd65a" stroke-width="4" class="pulse"/>`:''}${pe?`<circle cx="${p.x}" cy="${p.y}" r="17" fill="#ffd65a" opacity=".5"/>`:''}${CH.screw(p.x,p.y,10.5,(p.x*7+p.y*3)%90)}${u?`<circle cx="${p.x}" cy="${p.y}" r="3.6" fill="#101418"/>`:''}</g>`;
  const ly=p.d==='d'?p.y+23:p.y-15;
  s+=`<text x="${p.x}" y="${ly}" class="lab c s" pointer-events="none" style="fill:#f1f5f9;paint-order:stroke;stroke:#10151a;stroke-width:3.2px">${p.lab}</text>`});
 if(drag){const A=T[drag.from];s+=`<path d="M${A.x} ${A.y}L${drag.x} ${drag.y}" stroke="#ffd65a" stroke-width="5" stroke-linecap="round" stroke-dasharray="2 9" pointer-events="none"/><circle cx="${drag.x}" cy="${drag.y}" r="7" fill="#ffd65a" pointer-events="none"/>`}
 if(S.power&&S.short)s+=`<g pointer-events="none" class="pulse"><rect x="190" y="2" width="320" height="30" rx="8" fill="#c0392b"/><text x="350" y="23" class="lab c" style="fill:#fff">⚡ CORTOCIRCUITO ${S.short}</text></g>`;
 s+=S.power?`<text x="${20+pw/2}" y="548" class="lab c s" pointer-events="none" style="fill:#ff6b6b">⚠ TABLERO ENERGIZADO · 380 V</text>`:`<text x="${20+pw/2}" y="548" class="lab c s" pointer-events="none" style="opacity:.75">Tablero SIN TENSIÓN · es seguro cablear</text>`;
 return s}

/* ---- piezas comunes ---- */
function X1(c){const hl=id=>c.selP===id?' class="hl"':'';let x1='';
 [[70,'R','#a8642a'],[122,'S','#34363c'],[174,'T','#d6342c'],[300,'N','#4aa8e8']].forEach(([x,n,col])=>{x1+=`<rect x="${x-24}" y="62" width="48" height="52" rx="4" fill="url(#gBorn)" stroke="#4e5864" stroke-width="1.5"/><rect x="${x-24}" y="104" width="48" height="10" fill="${col}" opacity=".9"/><text x="${x}" y="58" class="lab c s" pointer-events="none">${n}</text>`});
 return`<g data-p="X1"${hl('X1')}>${x1}</g>`}
function motor(c,x0){const S=c.S,hl=c.selP==='M'?' class="hl"':'';
 let mt=`<rect x="${x0}" y="448" width="274" height="86" rx="14" fill="url(#gMot)" stroke="#16253d" stroke-width="2"/>`;
 for(let i=0;i<9;i++)mt+=`<rect x="${x0+14+i*27}" y="452" width="8" height="78" rx="3" fill="#000" opacity=".22"/>`;
 mt+=`<rect x="${x0+262}" y="478" width="30" height="26" fill="#aab4bf" stroke="#4e5864"/><g transform="rotate(${S.rot} ${x0+312} 491)"><circle cx="${x0+312}" cy="491" r="22" fill="none" stroke="#cfd6de" stroke-width="3"/><path d="M${x0+312} 469V513M${x0+290} 491H${x0+334}" stroke="#cfd6de" stroke-width="3"/></g>`;
 mt+=`<rect x="${x0+26}" y="388" width="190" height="70" rx="8" fill="url(#cPlL)" stroke="#0b0e11" stroke-width="2"/><rect x="${x0+36}" y="398" width="170" height="52" rx="5" fill="#e0e4e9" stroke="#444"/>`;
 mt+=txt(x0+122,505,'MOTOR 3~ · 1,5 kW · 380 V','font:800 15px system-ui;fill:#fff');
 return`<g data-p="M"${hl}>${mt}</g>`}
function fusibles(c){const hl=c.selP==='F1'?' class="hl"':'';let f1='';[70,122,174].forEach((x,i)=>{f1+=`<rect x="${x-22}" y="124" width="44" height="100" rx="5" fill="url(#gFuse)" stroke="#8d8672" stroke-width="1.6"/><rect x="${x-12}" y="154" width="24" height="46" rx="6" fill="${c.S.blown?'#5a4a2a':'#f2c15a'}" stroke="#8a6a1c"/><rect x="${x-12}" y="154" width="24" height="12" rx="6" fill="#fff" opacity=".35"/>${c.S.blown?`<path d="M${x-9} 178l18 6" stroke="#111" stroke-width="3"/>`:''}`});
 return`<g data-p="F1"${hl}>${f1}<text x="48" y="238" class="lab" pointer-events="none">F1</text></g>`}
function guardamotor(c){const S=c.S,hl=c.selP==='Q1'?' class="hl"':'';const on=S.q.on&&!S.q.trip,tr=!!S.q.trip,hot=c.CH.cl(S.q.h/1.25,0,1);
 let q=`<rect x="40" y="118" width="170" height="110" rx="8" fill="url(#cPl)" stroke="#0b0e11" stroke-width="2"/><rect x="40" y="118" width="170" height="110" rx="8" fill="url(#cPlH)"/>`;
 q+=`<rect x="56" y="150" width="138" height="46" rx="4" fill="#e9eef3" stroke="#222"/>`+txt(125,168,'GUARDAMOTOR','font:800 12px system-ui;fill:#10202e')+txt(125,184,'2,5–4 A · 13×Ir','font:600 10px system-ui;fill:#10202e');
 q+=`<g data-q1="1" style="cursor:pointer"><rect x="214" y="140" width="38" height="70" rx="8" fill="${tr?'#c0392b':on?'#2a8f61':'#4b5866'}" stroke="#111" stroke-width="2"/><rect x="223" y="${tr?160:on?146:178}" width="20" height="26" rx="5" fill="#f4f7fa" stroke="#222"/></g>`;
 q+=txt(233,232,tr?'TRIP':on?'ON':'OFF','font:800 11px system-ui;fill:#f1f5f9;paint-order:stroke;stroke:#10151a;stroke-width:3px');
 q+=`<rect x="56" y="204" width="138" height="8" rx="3" fill="#3a4450"/><rect x="56" y="204" width="${138*hot}" height="8" rx="3" fill="#e8542f"/>`;
 return`<g data-p="Q1"${hl}>${q}</g>`}
function contactor(c,n,x0,w,opts){const S=c.S,hl=c.selP===n?' class="hl"':'',arm=S.arms[n]||0;opts=opts||{};
 let km=`<rect x="${x0}" y="240" width="${w}" height="${opts.h||148}" rx="8" fill="url(#cPl)" stroke="#0b0e11" stroke-width="2"/><rect x="${x0}" y="240" width="${w}" height="${opts.h||148}" rx="8" fill="url(#cPlH)"/>`;
 if(opts.aux)km+=`<rect x="${x0+w-62}" y="248" width="56" height="132" rx="4" fill="url(#cPlL)" stroke="#0b0e11" opacity=".9"/>`;
 km+=`<rect x="${x0+16}" y="290" width="${opts.lw||150}" height="62" rx="5" fill="#e9eef3" stroke="#222"/>`+txt(x0+16+(opts.lw||150)/2,312,'CONTACTOR '+n,'font:800 13px system-ui;fill:#10202e')+txt(x0+16+(opts.lw||150)/2,328,'9 A · 220 V','font:600 11px system-ui;fill:#10202e')+(opts.aux?txt(x0+16+(opts.lw||150)/2,343,'13-14 NA · 21-22 NC','font:600 10px system-ui;fill:#10202e'):'');
 km+=`<rect x="${x0+w-110}" y="342" width="36" height="9" rx="3" fill="#161b21"/><rect x="${x0+w-108+arm*16}" y="343" width="16" height="7" rx="2" fill="${arm>.5?'#e8542f':'#8b96a3'}"/>`;
 let s=`<g data-p="${opts.part||n}"${hl}>${km}</g>`;
 if(S.coils[n])s+=`<circle cx="${x0+w-80}" cy="315" r="22" fill="#ff7a45" opacity="${.22+.1*Math.sin(c.t*20)}" filter="url(#fgl)" pointer-events="none"/>`;return s}
function pulsador(c,n,x,col,lab,txtp,bn,terms){const S=c.S,dn=S.btn[n]?6:0,hl=c.selP===n?' class="hl"':'';
 return`<g data-p="${n}"${hl}><circle cx="${x}" cy="170" r="52" fill="#4a525c" stroke="#222" stroke-width="2"/><circle cx="${x}" cy="170" r="42" fill="#2a2f36"/><g data-btn="${n}"><circle cx="${x}" cy="${170+dn}" r="36" fill="url(#${col})" stroke="#000" stroke-width="2"/><ellipse cx="${x-10}" cy="${156+dn}" rx="14" ry="8" fill="#fff" opacity="${S.btn[n]?.15:.42}" transform="rotate(-25 ${x-10} ${156+dn})"/>${txt(x,182+dn,lab,'font:800 28px system-ui;fill:#fff;opacity:.9')}</g><rect x="${x-44}" y="232" width="88" height="22" rx="3" fill="#e9eef3" stroke="#555"/>${txt(x,248,txtp,'font:800 12px system-ui;fill:#10202e')}</g>`}
function bloque(c,n,x,nc){const hl=c.selP===n?' class="hl"':'';return`<g data-p="${n}"${hl}><rect x="${x-34}" y="298" width="68" height="132" rx="6" fill="url(#cPlL)" stroke="#0b0e11" stroke-width="2"/><rect x="${x-26}" y="352" width="52" height="24" rx="3" fill="#e9eef3" opacity=".9"/>${txt(x,369,nc?'NC':'NA','font:800 12px system-ui;fill:#10202e')}</g>`}
function selectora(c,n,x){const S=c.S,on=S.sel[n],hl=c.selP===n?' class="hl"':'';
 return`<g data-p="${n}"${hl}><circle cx="${x}" cy="170" r="52" fill="#4a525c" stroke="#222" stroke-width="2"/><circle cx="${x}" cy="170" r="42" fill="#2a2f36"/><g data-sel2="${n}"><circle cx="${x}" cy="170" r="32" fill="url(#cKnob)" stroke="#000" stroke-width="2"/><g transform="rotate(${on?40:-40} ${x} ${170})"><rect x="${x-9}" y="${170-44}" width="18" height="60" rx="8" fill="#1a1e23" stroke="#000"/><path d="M${x} ${170-40}V${170-14}" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/></g></g>${txt(x-52,128,'OFF','font:800 13px system-ui;fill:#10202e')}${txt(x+52,128,'ON','font:800 13px system-ui;fill:#10202e')}<rect x="${x-44}" y="232" width="88" height="22" rx="3" fill="#e9eef3" stroke="#555"/>${txt(x,248,'ON / OFF','font:800 12px system-ui;fill:#10202e')}</g>`}
const doorNote=`<text x="850" y="282" class="lab c s" style="font-size:11px" pointer-events="none">▼ vista de atrás de la puerta ▼</text><text x="850" y="470" class="lab c s" style="font-size:11px" pointer-events="none">Mantené apretado el pulsador para accionarlo</text>`;

/* ===== enclavamiento ===== */
window.DIBUJOS.enclav=function(c){const S=c.S,CH=c.CH,hl=id=>c.selP===id?' class="hl"':'';let s='';
 s+=X1(c)+fusibles(c)+contactor(c,'KM1',40,266,{aux:true,lw:168,part:'KM1'});
 const hot=CH.cl(S.th.h/1.25,0,1);
 let f2=`<rect x="40" y="388" width="266" height="104" rx="8" fill="url(#cPl)" stroke="#0b0e11" stroke-width="2"/><rect x="40" y="388" width="266" height="104" rx="8" fill="url(#cPlH)"/><rect x="40" y="388" width="266" height="12" fill="#e07b1a" opacity=".85"/>`;
 f2+=`<circle cx="112" cy="438" r="24" fill="#e9eef3" stroke="#222" stroke-width="2"/><circle cx="112" cy="438" r="14" fill="url(#cKnob)"/><path d="M112 438V427" stroke="#ffd65a" stroke-width="3" stroke-linecap="round"/>`+txt(112,478,'3,6 A','font:700 10px system-ui;fill:#f0f4f8');
 f2+=`<rect x="150" y="424" width="60" height="22" rx="4" fill="#161b21"/><rect x="153" y="427" width="54" height="16" rx="3" fill="${S.th.trip?'#f08a1f':'#2a8f61'}"/>`+txt(180,439,S.th.trip?'DISPARO':'LISTO','font:800 10px system-ui;fill:#fff');
 f2+=`<rect x="220" y="426" width="74" height="10" rx="3" fill="#3a4450"/><rect x="220" y="426" width="${74*hot}" height="10" rx="3" fill="#e8542f"/>`+txt(257,454,'calor','font:700 10px system-ui;fill:#f0f4f8');
 s+=`<g data-p="F2"${hl('F2')}>${f2}</g><text x="48" y="503" class="lab" pointer-events="none" style="font-size:11px">F2 relé térmico · acoplado bajo el contactor</text>`;
 s+=`<g pointer-events="none">${[70,122,174].map(x=>`<rect x="${x-8}" y="380" width="16" height="16" rx="2" fill="url(#cCu)" stroke="#4a2410"/>`).join('')}<text x="236" y="396" class="lab s" style="font-size:9px">acople directo</text></g>`;
 s+=motor(c,378);
 s+=pulsador(c,'S0',790,'cRed','O','PARADA')+pulsador(c,'S1',900,'cGreen','I','MARCHA')+doorNote+bloque(c,'S0',790,true)+bloque(c,'S1',900,false);
 return base(c,s)};

/* ===== arranque directo ===== */
window.DIBUJOS.directo=function(c){let s='';
 s+=X1(c)+guardamotor(c)+contactor(c,'KM1',40,266,{lw:170,part:'KM1'})+motor(c,378);
 s+=selectora(c,'S1',850)+doorNote+bloque(c,'S1',850,false);
 return base(c,s,{rails:[[30,92,300],[30,300,300]]})};

/* ===== inversión de giro ===== */
window.DIBUJOS.inversion=function(c){let s='';
 s+=X1(c)+guardamotor(c)+contactor(c,'KM1',30,300,{aux:true,lw:140})+contactor(c,'KM2',360,300,{aux:true,lw:140});
 s+=motor(c,310);
 s+=pulsador(c,'S0',770,'cRed','O','PARADA')+pulsador(c,'S1',850,'cGreen','I','ADELANTE')+pulsador(c,'S2',930,'cYel','II','ATRÁS');
 s+=doorNote+bloque(c,'S0',770,true)+bloque(c,'S1',850,false)+bloque(c,'S2',930,false);
 return base(c,s,{rails:[[30,92,330],[30,170,330],[30,300,640]]})};

/* ===== estrella-triángulo ===== */
window.DIBUJOS.sd=function(c){const S=c.S,CH=c.CH;let s='';
 s+=X1(c)+guardamotor(c)+contactor(c,'KM1',25,215,{aux:true,lw:112})+contactor(c,'KM3',245,215,{aux:true,lw:112})+contactor(c,'KM2',465,215,{aux:true,lw:112});
 s+=`<text x="132" y="406" class="lab c s" style="fill:#2b3744" pointer-events="none"></text>`;
 /* temporizador */
 const kt=S.kt,pr=CH.cl(kt.tm/6,0,1),hl=c.selP==='KT1'?' class="hl"':'';
 let t1=`<rect x="25" y="402" width="215" height="104" rx="8" fill="url(#cPl)" stroke="#0b0e11" stroke-width="2"/><rect x="25" y="402" width="215" height="104" rx="8" fill="url(#cPlH)"/><rect x="25" y="402" width="215" height="12" fill="#2c6fb5" opacity=".85"/>`;
 t1+=`<circle cx="205" cy="458" r="22" fill="#e9eef3" stroke="#222" stroke-width="2"/><circle cx="205" cy="458" r="12" fill="url(#cKnob)"/><g transform="rotate(${-120+pr*240} 205 458)"><path d="M205 458V446" stroke="#ffd65a" stroke-width="3" stroke-linecap="round"/></g>`;
 t1+=txt(110,462,'TEMPORIZADOR KT1','font:800 11px system-ui;fill:#f0f4f8')+txt(110,478,'retardo a la conexión · 6 s','font:600 9px system-ui;fill:#cfd8e3');
 t1+=`<circle cx="75" cy="445" r="6" fill="${S.coils.KT1?'#5ce0a0':'#2b3744'}"/><circle cx="105" cy="445" r="6" fill="${kt.out?'#ffd65a':'#2b3744'}"/>`;
 s+=`<g data-p="KT1"${hl}>${t1}</g>`;
 /* motor de 6 bornes */
 const mhl=c.selP==='M'?' class="hl"':'';
 let mt=`<rect x="290" y="470" width="330" height="64" rx="14" fill="url(#gMot)" stroke="#16253d" stroke-width="2"/>`;
 for(let i=0;i<10;i++)mt+=`<rect x="${302+i*31}" y="474" width="8" height="56" rx="3" fill="#000" opacity=".22"/>`;
 mt+=`<rect x="620" y="490" width="26" height="24" fill="#aab4bf" stroke="#4e5864"/><g transform="rotate(${S.rot} 668 502)"><circle cx="668" cy="502" r="20" fill="none" stroke="#cfd6de" stroke-width="3"/><path d="M668 482V522M648 502H688" stroke="#cfd6de" stroke-width="3"/></g>`;
 mt+=`<rect x="290" y="400" width="355" height="62" rx="8" fill="url(#cPlL)" stroke="#0b0e11" stroke-width="2"/><rect x="298" y="408" width="339" height="46" rx="5" fill="#e0e4e9" stroke="#444"/>`;
 mt+=[0,1,2].map(i=>`<rect x="${320+i*60-30+0}" y="455" width="0" height="0"/>`).join('');
 mt+=txt(455,512,'MOTOR 3~ · 6 bornes · 380 V / 660 V','font:800 13px system-ui;fill:#fff');
 s+=`<g data-p="M"${mhl}>${mt}</g>`;
 s+=pulsador(c,'S0',790,'cRed','O','PARADA')+pulsador(c,'S1',900,'cGreen','I','MARCHA')+doorNote+bloque(c,'S0',790,true)+bloque(c,'S1',900,false);
 return base(c,s,{rails:[[30,92,330],[30,300,650],[30,438,230]]})};
})();
