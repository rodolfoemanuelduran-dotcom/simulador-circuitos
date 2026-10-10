/* Dibujo realista de los tableros. window.DIBUJOS[nombre](ctx) devuelve el SVG completo. */
window.DIBUJOS=window.DIBUJOS||{};
(function(){
const GRAD=`<defs>
<linearGradient id="gPlaca" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d9dde2"/><stop offset=".5" stop-color="#c3c9d0"/><stop offset="1" stop-color="#aab1ba"/></linearGradient>
<linearGradient id="gDoor" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b7bec7"/><stop offset="1" stop-color="#8f98a3"/></linearGradient>
<linearGradient id="gRail" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1f4f7"/><stop offset=".5" stop-color="#9aa5b1"/><stop offset="1" stop-color="#6a7582"/></linearGradient>
<linearGradient id="gFuse" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e9e4d4"/><stop offset=".5" stop-color="#fffdf2"/><stop offset="1" stop-color="#cfc8b2"/></linearGradient>
<linearGradient id="gBorn" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9aa1aa"/><stop offset=".5" stop-color="#d9dde2"/><stop offset="1" stop-color="#8a919b"/></linearGradient>
<linearGradient id="gMot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5f7fa6"/><stop offset=".5" stop-color="#34527a"/><stop offset="1" stop-color="#1d3252"/></linearGradient>
</defs>`;
const rail=(x,y,w)=>`<rect x="${x}" y="${y}" width="${w}" height="16" fill="url(#gRail)" stroke="#5c6570"/><rect x="${x+8}" y="${y+5}" width="${w-16}" height="6" rx="3" fill="#4e5864" opacity=".6"/>`;
const txt=(x,y,t,st)=>`<text x="${x}" y="${y}" text-anchor="middle" style="${st}" pointer-events="none">${t}</text>`;

/* ---- enrutado ortogonal de cables (A* en una grilla de 10 px) ---- */
const GX0=14,GY0=34,GS=10,GC=100,GR=53;
let ROUTE_KEY='',ROUTE_CACHE={};
function routeAll(wires,T,obst,zones){const key=wires.map(w=>w.id+':'+w.a+'>'+w.b).join('|')+'#'+obst.length;if(key===ROUTE_KEY)return ROUTE_CACHE;
 const base=new Uint8Array(GC*GR);
 for(let cy=0;cy<GR;cy++)for(let cx=0;cx<GC;cx++){const x=GX0+cx*GS+GS/2,y=GY0+cy*GS+GS/2;let v=9;if(zones.some(z=>x>=z[0]&&x<=z[0]+z[2]&&y>=z[1]&&y<=z[1]+z[3]))v=1;if(obst.some(r=>x>=r[0]&&x<=r[0]+r[2]&&y>=r[1]&&y<=r[1]+r[3]))v=26;base[cy*GC+cx]=v}
 const occ=new Uint8Array(GC*GR),out={};
 const cellOf=p=>[Math.max(0,Math.min(GC-1,Math.floor((p.x-GX0)/GS))),Math.max(0,Math.min(GR-1,Math.floor((p.y-GY0)/GS)))];
 const DX=[0,1,0,-1],DY=[-1,0,1,0];
 wires.forEach(w=>{const A=T[w.a],B=T[w.b];if(!A||!B)return;const [sx,sy]=cellOf(A),[ex,ey]=cellOf(B);
  const near=(cx,cy)=>{const x=GX0+cx*GS+GS/2,y=GY0+cy*GS+GS/2;return Math.hypot(x-A.x,y-A.y)<26||Math.hypot(x-B.x,y-B.y)<26};
  const cost=(cx,cy)=>{let c=base[cy*GC+cx];if(c>=26&&near(cx,cy))c=2;return c+(occ[cy*GC+cx]?7:0)};
  const N=GC*GR*4,g=new Float32Array(N).fill(1e9),par=new Int32Array(N).fill(-1),closed=new Uint8Array(N);
  const heap=[];const push=(f,s)=>{heap.push([f,s]);let i=heap.length-1;while(i>0){const p=(i-1)>>1;if(heap[p][0]<=heap[i][0])break;[heap[p],heap[i]]=[heap[i],heap[p]];i=p}};
  const pop=()=>{const t=heap[0],l=heap.pop();if(heap.length){heap[0]=l;let i=0;for(;;){let a=2*i+1,b=a+1,m=i;if(a<heap.length&&heap[a][0]<heap[m][0])m=a;if(b<heap.length&&heap[b][0]<heap[m][0])m=b;if(m===i)break;[heap[m],heap[i]]=[heap[i],heap[m]];i=m}}return t};
  const h=(cx,cy)=>(Math.abs(cx-ex)+Math.abs(cy-ey));
  for(let d=0;d<4;d++){const s=((sy*GC+sx)*4)+d;g[s]=0;push(h(sx,sy),s)}
  let goal=-1;
  while(heap.length){const [,s]=pop();if(closed[s])continue;closed[s]=1;const d=s&3,cell=s>>2,cx=cell%GC,cy=(cell/GC)|0;
   if(cx===ex&&cy===ey){goal=s;break}
   for(let nd=0;nd<4;nd++){if(((nd+2)&3)===d)continue;const nx=cx+DX[nd],ny=cy+DY[nd];if(nx<0||ny<0||nx>=GC||ny>=GR)continue;
    const ns=((ny*GC+nx)*4)+nd;const nc=g[s]+cost(nx,ny)+(nd!==d&&!(cx===sx&&cy===sy)?4:0);if(nc<g[ns]){g[ns]=nc;par[ns]=s;push(nc+h(nx,ny),ns)}}}
  if(goal<0){out[w.id]=`M${A.x} ${A.y}L${B.x} ${B.y}`;return}
  const cells=[];for(let s=goal;s>=0;s=par[s])cells.push(s>>2);cells.reverse();
  cells.forEach(cl=>{occ[cl]=1});
  let pts=cells.map(cl=>[GX0+(cl%GC)*GS+GS/2,GY0+((cl/GC)|0)*GS+GS/2]);
  /* quitar puntos intermedios colineales */
  const sp=[pts[0]];for(let i=1;i<pts.length-1;i++){const a=pts[i-1],b=pts[i],c=pts[i+1];if((a[0]===b[0]&&b[0]===c[0])||(a[1]===b[1]&&b[1]===c[1]))continue;sp.push(b)}sp.push(pts[pts.length-1]);
  /* tramos de unión exactos con los bornes (ortogonales) */
  const f=sp[0],l=sp[sp.length-1];const full=[[A.x,A.y],[A.x,f[1]],f].concat(sp.slice(1,-1)).concat([l,[B.x,l[1]],[B.x,B.y]]);
  const clean=[full[0]];for(let i=1;i<full.length;i++){const p=full[i],q=clean[clean.length-1];if(Math.abs(p[0]-q[0])<.5&&Math.abs(p[1]-q[1])<.5)continue;clean.push(p)}
  /* esquinas redondeadas */
  let d=`M${clean[0][0]} ${clean[0][1]}`;const R=7;
  for(let i=1;i<clean.length-1;i++){const p0=clean[i-1],p1=clean[i],p2=clean[i+1];const l1=Math.hypot(p1[0]-p0[0],p1[1]-p0[1]),l2=Math.hypot(p2[0]-p1[0],p2[1]-p1[1]),r=Math.min(R,l1/2,l2/2);
   const a=[p1[0]-(p1[0]-p0[0])/l1*r,p1[1]-(p1[1]-p0[1])/l1*r],b=[p1[0]+(p2[0]-p1[0])/l2*r,p1[1]+(p2[1]-p1[1])/l2*r];d+=`L${a[0].toFixed(1)} ${a[1].toFixed(1)}Q${p1[0]} ${p1[1]} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`}
  const last=clean[clean.length-1];d+=`L${last[0]} ${last[1]}`;out[w.id]=d});
 ROUTE_KEY=key;ROUTE_CACHE=out;return out}

function base(c,comps,o){const {S,wires,pend,drag,selW,hint,focusW,selP,t,T,K,W,CH,wview}=c;o=o||{};
 let s=CH.DEFS+GRAD;
 const pw=o.pw||672,dx=pw+40;
 s+=`<rect x="20" y="46" width="${pw}" height="502" rx="10" fill="url(#gPlaca)" stroke="#6b7480" stroke-width="3"/>`;
 [[34,60],[pw+6,60],[34,534],[pw+6,534]].forEach(p=>s+=`<circle cx="${p[0]}" cy="${p[1]}" r="6" fill="#7e8893" stroke="#4b525b"/>`);
 s+=`<text x="${20+pw/2}" y="38" class="lab c t" pointer-events="none">PLACA DE MONTAJE (fondo del tablero)</text>`;
 s+=`<rect x="${dx}" y="46" width="${988-dx}" height="502" rx="10" fill="url(#gDoor)" stroke="#5c6570" stroke-width="3"/><text x="${(dx+988)/2}" y="38" class="lab c t" pointer-events="none">PUERTA</text>`;
 [90,260,430].forEach(y=>s+=`<rect x="${dx-8}" y="${y}" width="10" height="46" rx="3" fill="#6a7582"/>`);
 (o.rails||[[30,92,300],[30,170,300],[30,300,300],[30,438,300]]).forEach(r=>s+=rail(r[0],r[1],r[2]));
 s+=comps;
 /* cables */
 const routes=routeAll(wires,T,(window.DIBUJOS[K.dibujo]||{}).obst||[],o.zones||[[20,46,672,502],[712,46,276,502]]);
 const path=(a,b,w)=>routes[w.id]||`M${T[a].x} ${T[a].y}L${T[b].x} ${T[b].y}`;
 const liveRoots=S.live?Object.values(S.rt||{}):[];
 wires.forEach(w=>{const d=path(w.a,w.b,w),col=w.col?K.COLORS[w.col]:(w.ref>=0?K.COLORS[W[w.ref][2]]:'#c04fd8'),sel=w.id===selW,lv=S.live&&S.uf&&liveRoots.includes(S.uf.f(w.a)),dark=col==='#34363c';const kk=w.col||(w.ref>=0?W[w.ref][2]:'X'),isP=(kk==='R'||kk==='S'||kk==='T'),vis=!wview||wview==='todos'||(wview==='pot'&&isP)||(wview==='mando'&&!isP)||sel;
  s+=`<g data-w="${w.id}" opacity="${vis?1:.1}"><path d="${d}" fill="none" stroke="transparent" stroke-width="22"/>`+(sel?`<path d="${d}" fill="none" stroke="#ffd65a" stroke-width="13" stroke-linecap="round" opacity=".9"/>`:'')+(lv?`<path d="${d}" class="liv" fill="none" stroke="#fff" stroke-width="11" stroke-linecap="round"/>`:'')+`<path d="${d}" fill="none" stroke="${dark?'#8b95a1':'#101418'}" stroke-width="9" stroke-linecap="round" opacity=".95"/><path d="${d}" fill="none" stroke="${col}" stroke-width="6.4" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.6" stroke-linecap="round" transform="translate(-1.2 -1.4)"/></g>`});
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
function X1(c,only){const hl=id=>c.selP===id?' class="hl"':'';let x1='';
 [[70,'R','#a8642a'],[122,'S','#34363c'],[174,'T','#d6342c'],[300,'N','#4aa8e8']].filter(a=>!only||only.includes(a[1])).forEach(([x,n,col])=>{x1+=`<rect x="${x-24}" y="62" width="48" height="52" rx="4" fill="url(#gBorn)" stroke="#4e5864" stroke-width="1.5"/><rect x="${x-24}" y="104" width="48" height="10" fill="${col}" opacity=".9"/><text x="${x}" y="58" class="lab c s" pointer-events="none">${only&&n===`R`?`F`:n}</text>`});
 return`<g data-p="X1"${hl('X1')}>${x1}</g>`}
function motor(c,x0,label){const S=c.S,hl=c.selP==='M'?' class="hl"':'';
 let mt=`<rect x="${x0}" y="448" width="274" height="86" rx="14" fill="url(#gMot)" stroke="#16253d" stroke-width="2"/>`;
 for(let i=0;i<9;i++)mt+=`<rect x="${x0+14+i*27}" y="452" width="8" height="78" rx="3" fill="#000" opacity=".22"/>`;
 mt+=`<rect x="${x0+262}" y="478" width="30" height="26" fill="#aab4bf" stroke="#4e5864"/><g transform="rotate(${S.rot} ${x0+312} 491)"><circle cx="${x0+312}" cy="491" r="22" fill="none" stroke="#cfd6de" stroke-width="3"/><path d="M${x0+312} 469V513M${x0+290} 491H${x0+334}" stroke="#cfd6de" stroke-width="3"/></g>`;
 mt+=`<rect x="${x0+26}" y="388" width="190" height="70" rx="8" fill="url(#cPlL)" stroke="#0b0e11" stroke-width="2"/><rect x="${x0+36}" y="398" width="170" height="52" rx="5" fill="#e0e4e9" stroke="#444"/>`;
 mt+=txt(x0+122,505,label||'MOTOR 3~ · 1,5 kW · 380 V','font:800 14px system-ui;fill:#fff');
 return`<g data-p="M"${hl}>${mt}</g>`}
function fusibles(c){const hl=c.selP==='F1'?' class="hl"':'';let f1='';[70,122,174].forEach((x,i)=>{f1+=`<rect x="${x-22}" y="124" width="44" height="100" rx="5" fill="url(#gFuse)" stroke="#8d8672" stroke-width="1.6"/><rect x="${x-12}" y="154" width="24" height="46" rx="6" fill="${c.S.blown?'#5a4a2a':'#f2c15a'}" stroke="#8a6a1c"/><rect x="${x-12}" y="154" width="24" height="12" rx="6" fill="#fff" opacity=".35"/>${c.S.blown?`<path d="M${x-9} 178l18 6" stroke="#111" stroke-width="3"/>`:''}`});
 return`<g data-p="F1"${hl}>${f1}<text x="48" y="238" class="lab" pointer-events="none">F1</text></g>`}
function guardamotor(c,ttl,sub){const S=c.S,hl=c.selP==='Q1'?' class="hl"':'';const on=S.q.on&&!S.q.trip,tr=!!S.q.trip,hot=c.CH.cl(S.q.h/1.25,0,1);
 let q=`<rect x="40" y="118" width="170" height="110" rx="8" fill="url(#cPl)" stroke="#0b0e11" stroke-width="2"/><rect x="40" y="118" width="170" height="110" rx="8" fill="url(#cPlH)"/>`;
 q+=`<rect x="56" y="150" width="138" height="46" rx="4" fill="#e9eef3" stroke="#222"/>`+txt(125,168,ttl||'GUARDAMOTOR','font:800 12px system-ui;fill:#10202e')+txt(125,184,sub||'2,5–4 A · 13×Ir','font:600 10px system-ui;fill:#10202e');
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
 s+=motor(c,378,c.K.motorLabel);
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

/* ===== monofásico directo ===== */
window.DIBUJOS.monodirecto=function(c){let s='';
 s+=X1(c,['R','N'])+guardamotor(c,'TERMOMAGNÉTICA','10 A · curva C')+contactor(c,'KM1',40,266,{lw:170,part:'KM1'})+motor(c,378,'MOTOR 1~ · 0,75 kW · 220 V');
 s+=selectora(c,'S1',850)+doorNote+bloque(c,'S1',850,false);
 return base(c,s,{rails:[[30,92,300],[30,300,300]]})};

/* ===== impulsos ===== */
window.DIBUJOS.impulsos=function(c){let s='';
 s+=X1(c)+guardamotor(c)+contactor(c,'KM1',40,266,{aux:true,lw:168,part:'KM1'})+motor(c,378);
 s+=pulsador(c,'S0',770,'cRed','O','PARADA')+pulsador(c,'S1',850,'cGreen','I','MARCHA')+selectora(c,'S3',930);
 s+=doorNote+bloque(c,'S0',770,true)+bloque(c,'S1',850,false)+bloque(c,'S3',930,false);
 return base(c,s,{rails:[[30,92,300],[30,170,300],[30,300,300]]})};

/* ===== temporizado ===== */
function rele(c,n,x0,tit,sub){const S=c.S,arm=S.arms[n]||0,hl=c.selP===n?' class="hl"':'';
 let r=`<rect x="${x0}" y="240" width="130" height="148" rx="8" fill="url(#cPl)" stroke="#0b0e11" stroke-width="2"/><rect x="${x0}" y="240" width="130" height="148" rx="8" fill="url(#cPlH)"/><rect x="${x0+10}" y="292" width="110" height="56" rx="5" fill="#e9eef3" stroke="#222"/>`+txt(x0+65,314,tit,'font:800 13px system-ui;fill:#10202e')+txt(x0+65,330,sub,'font:600 10px system-ui;fill:#10202e');
 r+=`<circle cx="${x0+65}" cy="372" r="6" fill="${S.coils[n]?'#5ce0a0':'#2b3744'}" stroke="#000"/>`;
 return`<g data-p="${n}"${hl}>${r}</g>`+(S.coils[n]?`<circle cx="${x0+65}" cy="372" r="14" fill="#5ce0a0" opacity=".35" filter="url(#fgl)" pointer-events="none"/>`:'')}
function temporiz(c,x0){const S=c.S,kt=S.kt,pr=c.CH.cl(kt.tm/5,0,1),hl=c.selP==='KT1'?' class="hl"':'';
 let t1=`<rect x="${x0}" y="240" width="160" height="148" rx="8" fill="url(#cPl)" stroke="#0b0e11" stroke-width="2"/><rect x="${x0}" y="240" width="160" height="148" rx="8" fill="url(#cPlH)"/><rect x="${x0}" y="240" width="160" height="12" fill="#2c6fb5" opacity=".85"/>`;
 t1+=`<circle cx="${x0+80}" cy="316" r="26" fill="#e9eef3" stroke="#222" stroke-width="2"/><circle cx="${x0+80}" cy="316" r="14" fill="url(#cKnob)"/><g transform="rotate(${-120+pr*240} ${x0+80} 316)"><path d="M${x0+80} 316V302" stroke="#ffd65a" stroke-width="3" stroke-linecap="round"/></g>`;
 t1+=txt(x0+80,358,'TEMPORIZADOR KT1','font:800 10px system-ui;fill:#f0f4f8')+txt(x0+80,372,'retardo a la conexión · 5 s','font:600 9px system-ui;fill:#cfd8e3');
 t1+=`<circle cx="${x0+30}" cy="282" r="5" fill="${S.coils.KT1?'#5ce0a0':'#2b3744'}"/><circle cx="${x0+130}" cy="282" r="5" fill="${kt.out?'#ffd65a':'#2b3744'}"/>`;
 return`<g data-p="KT1"${hl}>${t1}</g>`}
window.DIBUJOS.temporizado=function(c){let s='';
 s+=X1(c)+guardamotor(c)+contactor(c,'KM1',40,266,{lw:170,part:'KM1'})+rele(c,'KA1',340,'RELÉ AUXILIAR KA1','1 NA · 220 V')+temporiz(c,490)+motor(c,378);
 s+=pulsador(c,'S0',790,'cRed','O','PARADA')+pulsador(c,'S1',900,'cGreen','I','MARCHA')+doorNote+bloque(c,'S0',790,true)+bloque(c,'S1',900,false);
 return base(c,s,{rails:[[30,92,300],[30,170,300],[30,300,640]]})};

/* ---- obstáculos para el enrutado de cables (rectángulos [x,y,w,h] de los aparatos) ---- */
const X1R=[[46,62,152,52],[276,62,48,52]],X1F=[[46,62,48,52],[276,62,48,52]],FUS=[[48,124,148,100]],GM=[[40,118,212,110]],KM=[[40,240,266,148]],F2B=[[40,388,266,104]],MOT=[[378,388,316,146]];
const dsel=x=>[[x-52,118,104,104],[x-34,298,68,132]],dpul=x=>[[x-52,118,104,104],[x-34,298,68,132]];
window.DIBUJOS.enclav.obst=X1R.concat(FUS,KM,F2B,MOT,dpul(790),dpul(900));
window.DIBUJOS.directo.obst=X1R.concat(GM,KM,MOT,dsel(850));
window.DIBUJOS.monodirecto.obst=X1F.concat(GM,KM,MOT,dsel(850));
window.DIBUJOS.impulsos.obst=X1R.concat(GM,KM,MOT,dpul(770),dpul(850),dsel(930));
window.DIBUJOS.temporizado.obst=X1R.concat(GM,KM,[[340,240,130,148],[490,240,160,148]],MOT,dpul(790),dpul(900));
window.DIBUJOS.inversion.obst=X1R.concat(GM,[[30,240,300,148],[360,240,300,148]],[[310,388,316,146]],dpul(770),dpul(850),dpul(930));
window.DIBUJOS.sd.obst=X1R.concat(GM,[[25,240,215,148],[245,240,215,148],[465,240,215,148],[25,402,215,104],[290,400,355,134]],dpul(790),dpul(900));
})();
