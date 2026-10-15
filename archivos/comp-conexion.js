/* Práctica de conexión para los componentes de protección (componente.html): se tocan dos bornes para tender un cable; el programa
   dice si la instalación quedó bien o qué peligro tiene. Cada componente define su escena (bornes, cajas y reglas de evaluación).
   Colores: fase marrón, neutro celeste, tierra verde y amarillo (código habitual en Argentina). */
window.CON=(function(){
const H=window.CPH,cl=H.cl;
const COL={L:'#8b4a1e',N:'#4db5ee',PE:'#2fa84f','':'#9aa5b1'};
const NOM={L:'fase',N:'neutro',PE:'tierra'};
const esc=s=>String(s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));

/* estado de la práctica dentro del objeto del componente */
function iniciar(o){o.wires=[];o.pend=null;o.cx=false;o.con={sol:false,hint:false,mal:0,hecho:false,flash:null,msg:''};o.ev=null}
const term=(E,id)=>E.term.find(t=>t.id===id);

/* conexiones eléctricas: cables + pares que une internamente el aparato cuando está cerrado */
function red(E,wires,pasa){const par={};E.term.forEach(t=>par[t.id]=t.id);const f=x=>par[x]===x?x:(par[x]=f(par[x]));const u=(a,b)=>{if(par[a]===undefined||par[b]===undefined)return;a=f(a);b=f(b);if(a!==b)par[b]=a};
 wires.forEach(w=>u(w[0],w[1]));(pasa||[]).forEach(p=>u(p[0],p[1]));
 return{f,con:(a,b)=>f(a)===f(b),roles:id=>{const r=new Set();E.term.forEach(t=>{if(t.rol&&f(t.id)===f(id))r.add(t.rol)});return r}}}
/* rol (color) de la red de un cable: si mezcla dos roles es un cortocircuito */
function rolDe(E,N,id){const r=N.roles(id);return r.size>1?'corto':r.size===1?[...r][0]:''}

function evaluar(E,o){const ev=E.eval(o,o.wires);ev.ok=!!ev.ok;return ev}

/* ---- dibujo ---- */
function camino(E,a,b){const A=term(E,a),B=term(E,b),d={l:[-1,0],r:[1,0],t:[0,-1],b:[0,1]},da=d[A.side||'r'],db=d[B.side||'l'],k=Math.min(110,Math.max(50,Math.hypot(B.x-A.x,B.y-A.y)*.4));
 return`M${A.x} ${A.y}C${A.x+da[0]*k} ${A.y+da[1]*k} ${B.x+db[0]*k} ${B.y+db[1]*k} ${B.x} ${B.y}`}
function vista(S,E,o,extra){const{ui}=S;let s='';
 E.cajas.forEach(c=>{s+=`<rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" rx="16" fill="${c.fill||'var(--p)'}" stroke="var(--line)" stroke-width="2" opacity=".92"/><text x="${c.x+c.w/2}" y="${c.y+26}" class="lab c">${c.t}</text>${c.sub?`<text x="${c.x+c.w/2}" y="${c.y+46}" class="lab c s">${c.sub}</text>`:''}`});
 if(extra&&extra.antes)s+=extra.antes;
 const ev=o.ev||evaluar(E,o),N=red(E,o.wires,E.pasa(o));
 o.wires.forEach((w,i)=>{const d=camino(E,w[0],w[1]),r=rolDe(E,N,w[0]),col=r==='corto'?'#ff3b30':COL[r],pe=r==='PE';
  s+=`<g data-act="w:${i}" style="cursor:pointer"><path d="${d}" fill="none" stroke="transparent" stroke-width="26"/><path d="${d}" fill="none" stroke="#000" stroke-opacity=".45" stroke-width="12" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${col}" stroke-width="8.5" stroke-linecap="round"${r==='corto'?' stroke-dasharray="14 8"':''}/>${pe?`<path d="${d}" fill="none" stroke="#f5d90a" stroke-width="8.5" stroke-linecap="round" stroke-dasharray="14 14"/>`:''}<path d="${d}" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2.4" stroke-linecap="round" transform="translate(0 -2.6)"/>`;
  if(ev.corriente&&ev.corriente(i))s+=`<path class="flowd" d="${d}" pointer-events="none"/>`;
  s+=`</g>`});
 if(extra&&extra.medio)s+=extra.medio;
 E.term.forEach(t=>{const sel=o.pend===t.id,pul=o.con.flash&&o.con.flash.includes(t.id),col=COL[t.rol||''];
  s+=`<g data-act="t:${t.id}" style="cursor:pointer" tabindex="0" role="button" aria-label="Borne ${esc(t.lab)}">
  <circle cx="${t.x}" cy="${t.y}" r="26" fill="transparent"/>
  ${sel||pul?`<circle cx="${t.x}" cy="${t.y}" r="19" fill="none" stroke="#ffd65a" stroke-width="4" class="${pul?'pulse':''}"/>`:''}
  <circle cx="${t.x}" cy="${t.y}" r="12" fill="url(#cMeV)" stroke="${t.rol?col:'#3a4450'}" stroke-width="${t.rol?4:2}"/>${H.screw(t.x,t.y,7,t.x%90)}
  <text x="${t.x+(t.side==='l'?-20:t.side==='r'?20:0)}" y="${t.y+(t.side==='t'?-20:t.side==='b'?30:4)}" class="lab ${t.side==='l'?'r':t.side==='r'?'':'c'} s" style="${H.stroke4}" pointer-events="none">${t.lab}</text></g>`});
 if(extra&&extra.despues)s+=extra.despues;
 return s}

/* ---- interacción ---- */
function clic(E,o,act,c){const ev=[];if(!act)return ev;
 if(act.startsWith('w:')){const i=+act.slice(2);if(o.wires[i]){o.wires.splice(i,1);o.con.msg='';o.pend=null;o.con.flash=null;ev.push('click')}}
 else if(act.startsWith('t:')){const id=act.slice(2);
  if(!o.pend){o.pend=id;ev.push('click')}
  else if(o.pend===id){o.pend=null;ev.push('click')}
  else{const a=o.pend,b=id;o.pend=null;
   if(o.wires.some(w=>(w[0]===a&&w[1]===b)||(w[0]===b&&w[1]===a))){o.con.msg='Esos dos bornes ya están unidos.';ev.push('no')}
   else{const m0=evaluar(E,o).items.filter(i=>i.k==='bad').length;o.wires.push([a,b]);o.con.flash=null;const e1=evaluar(E,o);if(e1.items.filter(i=>i.k==='bad').length>m0)o.con.mal++;ev.push('click');if(e1.corto==='libre'||e1.corto==='dev')ev.push('spark')}}}
 chequear(E,o);return ev}
function chequear(E,o){const e=evaluar(E,o);o.ev=e;
 if(e.ok&&!o.con.hecho){o.con.hecho=true;const est=o.con.sol?1:(o.con.hint||o.con.mal>0)?2:3;
  try{if(window.PROG)PROG.record('con:'+E.key,est,{g:'conexion',cat:'ca',sol:o.con.sol,hint:o.con.hint,mal:o.con.mal,ti:E.titulo})}catch{}}
 if(!e.ok)o.con.hecho=false;return e}
function pista(E,o){const falta=E.solucion.find(w=>!o.wires.some(x=>(x[0]===w[0]&&x[1]===w[1])||(x[0]===w[1]&&x[1]===w[0])));o.con.hint=true;o.con.flash=falta?[falta[0],falta[1]]:null;o.con.msg=falta?'💡 Unilos así: '+term(E,falta[0]).lab+' con '+term(E,falta[1]).lab+' (los bornes parpadean).':'💡 Los cables están completos: revisá el estado de abajo.';return o.con.msg}
function mostrarSolucion(E,o){o.wires=E.solucion.map(w=>w.slice());o.con.sol=true;o.pend=null;o.con.flash=null;o.con.msg='Esta es una conexión correcta. Como viste la solución, esta práctica queda anotada como "con solución a la vista".';chequear(E,o)}

/* ---- panel ---- */
function panel(E,o,ctx){const ev=o.ev||evaluar(E,o);
 let h=`<h2>${E.titulo}</h2><p>${E.ayuda}</p><div class="note" style="margin:6px 0">Tocá un borne y después otro para unirlos con un cable. Tocá un cable para borrarlo. Colores: <b style="color:#c8793a">fase</b> marrón · <b style="color:#4db5ee">neutro</b> celeste · <b style="color:#2fa84f">tierra</b> verde y amarillo.</div>`;
 h+=`<div class="row" style="margin-top:6px"><button class="btn" data-cn="borrar">🧹 Borrar todo</button><button class="btn" data-cn="pista">💡 Pista</button><button class="btn" data-cn="sol">👁 Ver conexión</button></div>`;
 if(o.con.msg)h+=`<div class="vd warn" role="status" style="margin-top:8px">${o.con.msg}</div>`;
 h+=`<h3>Estado de la instalación</h3>`+(ev.items.length?ev.items.map(i=>`<div class="vd ${i.k==='ok'?'ok':i.k==='warn'?'warn':i.k==='pend'?'':'bad'}" style="margin-top:6px;font-weight:600">${i.k==='ok'?'✔':i.k==='warn'?'⚠':i.k==='pend'?'○':'✖'} ${i.t}</div>`).join(''):`<p>Todavía no conectaste nada.</p>`);
 if(ev.ok)h+=`<div class="vd ok" style="margin-top:10px">🎉 <b>Instalación correcta.</b> ${o.con.sol?'Como viste la conexión antes, queda anotado en el informe para el docente (1 estrella).':o.con.hint||o.con.mal>0?'Lo resolviste con alguna ayuda o corrección (2 estrellas).':'Sin ayudas y sin errores: ★★★.'}</div>`;
 h+=`<h3>Probar la instalación</h3><button class="sw" data-cn="energizar" aria-pressed="${o.cx}"><i></i><span>⚡ Energizar el circuito<small>Pone tensión: la llave debe estar en ON para que pase corriente</small></span></button>`;
 if(E.pruebas)h+=E.pruebas(o,ctx);
 return h}
function bind(E,root,o,ctx){root.querySelectorAll('[data-cn]').forEach(b=>b.onclick=()=>{const k=b.dataset.cn;
 if(k==='borrar'){iniciar(o);o.con.msg='';chequear(E,o);ctx.play('click')}
 else if(k==='pista'){pista(E,o);ctx.play('click')}
 else if(k==='sol'){if(window.confirm&&!window.confirm('Si ves la conexión, esta práctica queda anotada como «con solución a la vista» en el informe del docente. ¿Querés verla?'))return;mostrarSolucion(E,o);ctx.play('warn')}
 else if(k==='energizar'){o.cx=!o.cx;ctx.play('click')}
 else if(E.accion)E.accion(k,o,ctx);
 ctx.refresh()})}
return{iniciar,red,rolDe,vista,clic,chequear,evaluar,panel,bind,pista,mostrarSolucion,COL,NOM,term};
})();
