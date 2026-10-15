/* Progreso del alumno: estrellas por práctica, medallas por tema y logros. Se guarda en este dispositivo (localStorage).
   Lo usan el menú, la versión de celular y las prácticas. */
window.PROG=(function(){
const KEY='sim-progreso-v1';
const store={get(){try{return localStorage.getItem(KEY)}catch{return null}},set(v){try{localStorage.setItem(KEY,v);return true}catch{if(window.SIM)SIM.avisar('No se pudo guardar tu progreso en este dispositivo (¿poco espacio o navegación privada?).',9000);return false}}};
let D;
const esObj=v=>!!v&&typeof v==='object'&&!Array.isArray(v);
/* lectura segura: si lo guardado está dañado o no tiene la forma esperada, se arranca de cero en vez de romper el menú */
function load(){try{D=JSON.parse(store.get())}catch{D=null}if(!esObj(D))D={};D.items=esObj(D.items)?D.items:{};D.flags=esObj(D.flags)?D.flags:{};D.exams=Array.isArray(D.exams)?D.exams:[];return D}
function save(){try{store.set(JSON.stringify(D))}catch{}}
load();

/* guarda el mejor resultado de una práctica; devuelve {nuevo, mejora, s, prev} */
function record(id,stars,info){load();info=info||{};const before=badgesEarned(),it=D.items[id]||{s:0,n:0,g:info.g||'',cat:info.cat||''},prev=it.s;
 it.n=(it.n||0)+1;if(stars>it.s)it.s=stars;if(info.g)it.g=info.g;if(info.cat)it.cat=info.cat;if(info.t&&(!it.t||info.t<it.t))it.t=info.t;it.at=Date.now();
 /* c = veces que la superó por su cuenta · v = veces que «se completó» apretando Ver solución · h = con pista · m = con cortocircuitos o piezas equivocadas.
    Sirve para el informe del docente: ver la solución queda registrado y no cuenta como superada por su cuenta. */
 if(info.sol)it.v=(it.v||0)+1;else{it.c=(it.c||0)+1;if(info.hint)it.h=(it.h||0)+1;if(info.mal)it.m=(it.m||0)+1}
 if(info.ti)it.ti=String(info.ti).slice(0,80);
 D.items[id]=it;
 save();const after=badgesEarned();
 return{s:it.s,prev,nuevo:!prev&&stars>0,mejora:stars>prev,logros:after.filter(b=>!before.includes(b))}}
function flag(k){load();if(!D.flags[k]){const before=badgesEarned();D.flags[k]=Date.now();save();return badgesEarned().filter(b=>!before.includes(b))}return[]}
function stars(id){return(D.items[id]||{}).s||0}
function addExam(r){load();D.exams.unshift(r);D.exams=D.exams.slice(0,30);save()}
function reset(){D={items:{},flags:{},exams:[]};save()}

/* ---------- logros ---------- */
const BADGES=[
 {id:'primero',ico:'🌟',name:'Primer circuito',desc:'Completá tu primera práctica.',ok:d=>cnt(d)>=1},
 {id:'diez',ico:'🔌',name:'Electricista',desc:'Completá 10 prácticas.',ok:d=>cnt(d)>=10},
 {id:'veinte',ico:'⚡',name:'Maestro de circuitos',desc:'Completá 20 prácticas.',ok:d=>cnt(d)>=20},
 {id:'tres',ico:'✨',name:'Sin ayuda',desc:'Conseguí 3 estrellas en 3 prácticas.',ok:d=>Object.values(d.items).filter(i=>i.s>=3).length>=3},
 {id:'serie',ico:'🔗',name:'En fila',desc:'Completá una práctica en serie.',ok:d=>grp(d,'serie')},
 {id:'paralelo',ico:'🪜',name:'En paralelo',desc:'Completá una práctica en paralelo.',ok:d=>grp(d,'paralelo')},
 {id:'mixto',ico:'🧩',name:'Mixto',desc:'Completá una práctica de circuito mixto.',ok:d=>grp(d,'mixto')},
 {id:'detective',ico:'🔍',name:'Detective',desc:'Encontrá una falla y reparala.',ok:d=>grp(d,'falla')},
 {id:'alterna',ico:'🏠',name:'Instalador',desc:'Completá una práctica de corriente alterna.',ok:d=>Object.values(d.items).some(i=>own(i)&&i.cat==='ca')},
 {id:'logico',ico:'🧠',name:'Lógico',desc:'Resolvé 3 desafíos del Taller libre sin ver la solución.',ok:d=>Object.values(d.items).filter(i=>own(i)&&i.g==='tdes').length>=3},
 {id:'taller',ico:'🛠',name:'Inventor',desc:'Hacé funcionar un circuito propio en el Taller libre.',ok:d=>!!d.flags.taller},
 {id:'examen',ico:'📝',name:'Examinado',desc:'Rendí un examen completo.',ok:d=>!!d.flags.examen}
];
/* «propia» = superada sin ver la solución (los datos anteriores a esta versión no distinguen y cuentan como propios) */
const own=i=>i.s>0&&(i.c>0||(i.c===undefined&&i.v===undefined));
const cnt=d=>Object.values(d.items).filter(own).length,grp=(d,g)=>Object.values(d.items).some(i=>own(i)&&i.g===g);
function badgesEarned(){return BADGES.filter(b=>{try{return b.ok(D)}catch{return false}}).map(b=>b.id)}

/* ---------- totales y medallas por tema ---------- */
/* items: [{id,cat,soon}] del catálogo; cats con medalla: solo las prácticas que otorgan estrellas */
const MEDAL=[{min:.9,ico:'🥇',name:'Oro'},{min:.66,ico:'🥈',name:'Plata'},{min:.33,ico:'🥉',name:'Bronce'}];
function resumen(list){load();const r={stars:0,max:0,done:0,total:list.length,ratio:0,medal:null};list.forEach(i=>{const s=(D.items[i.id]||{}).s||0;r.stars+=s;r.max+=3;if(s>0)r.done++});r.ratio=r.max?r.stars/r.max:0;r.medal=MEDAL.find(m=>r.ratio>=m.min)||null;return r}
const starsHTML=(n,max)=>{max=max||3;let h='';for(let i=0;i<max;i++)h+=i<n?'★':'☆';return h};

/* ---------- ventana de medallas (se usa desde el menú y el celular) ---------- */
function injectCSS(){if(document.getElementById('prog-css'))return;const s=document.createElement('style');s.id='prog-css';s.textContent=`
.pg-back{position:fixed;inset:0;z-index:2000;display:grid;place-items:center;padding:14px;background:#04101bd9;backdrop-filter:blur(8px)}
.pg-card{width:min(760px,100%);max-height:100%;overflow:auto;padding:20px;border-radius:22px;border:1px solid var(--cardline,var(--line,#345673));background:var(--panel,var(--p,#0d1d2e));color:var(--text,var(--tx,#f4f9ff));box-shadow:0 24px 70px #000b;font-family:system-ui,sans-serif}
.pg-card h2{margin:0 0 4px;font-size:1.5rem}.pg-card>p{margin:0 0 14px;color:var(--muted,var(--mu,#abc0d5))}
.pg-x{float:right;width:40px;height:40px;border:0;border-radius:50%;background:var(--panel2,var(--p2,#142a41));color:inherit;font-size:1.2rem;cursor:pointer}
.pg-cats{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin-bottom:16px}
.pg-cat{padding:12px;border-radius:14px;border:1px solid var(--cardline,var(--line,#345673));background:var(--panel2,var(--p2,#142a41));text-align:center}
.pg-cat .m{font-size:2.4rem;line-height:1.1}.pg-cat b{display:block;font-size:.95rem}.pg-cat small{color:var(--muted,var(--mu,#abc0d5))}.pg-cat .st{color:#ffd43b;letter-spacing:2px}
.pg-bar{height:8px;border-radius:5px;background:#0006;margin:7px 0 3px;overflow:hidden}.pg-bar i{display:block;height:100%;background:linear-gradient(90deg,#35c8ff,#5ce0a0,#ffd43b,#ff8a3d)}
.pg-card h3{margin:14px 0 8px;font-size:.78rem;letter-spacing:.08em;text-transform:uppercase;color:var(--muted,var(--mu,#abc0d5))}
.pg-badges{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:8px}
.pg-b{display:flex;gap:10px;align-items:center;padding:9px 11px;border-radius:12px;border:1px solid var(--cardline,var(--line,#345673));background:var(--panel2,var(--p2,#142a41))}
.pg-b .i{font-size:1.8rem;width:38px;text-align:center}.pg-b b{display:block;font-size:.88rem}.pg-b small{color:var(--muted,var(--mu,#abc0d5));font-size:.74rem;line-height:1.25}
.pg-b.off{opacity:.45;filter:grayscale(1)}.pg-b.off .i{opacity:.7}
.pg-foot{display:flex;flex-wrap:wrap;gap:8px;justify-content:space-between;align-items:center;margin-top:16px;color:var(--muted,var(--mu,#abc0d5));font-size:.78rem}
.pg-foot button{padding:8px 12px;border-radius:10px;border:1px solid var(--cardline,var(--line,#345673));background:var(--panel2,var(--p2,#142a41));color:inherit;cursor:pointer}
`;document.head.appendChild(s)}
/* ---------- informe para el docente ---------- */
const pad2=n=>String(n).padStart(2,'0'),fh=ts=>{const d=new Date(ts);return pad2(d.getDate())+'/'+pad2(d.getMonth()+1)+'/'+d.getFullYear()+' '+pad2(d.getHours())+':'+pad2(d.getMinutes())};
const veces=n=>n+(n>1?' veces':' vez');
/* catalogo: [{id,title,cat}] de las prácticas que dan estrellas. Cuenta como «superada» solo la que se resolvió sin apretar Ver solución. */
function informe(catalogo,nombre){load();catalogo=catalogo||[];const L=[],ids=new Set(catalogo.map(c=>c.id));
 const linea=(t,i)=>{const e=starsHTML(i.s||0),n=[];
  if(own(i)){if(i.h)n.push('usó pista'+(i.h>1?' ('+veces(i.h)+')':''));if(i.m)n.push('con cortocircuitos o piezas equivocadas');if(i.v)n.push('además vio la solución '+veces(i.v));return(i.v?'⚠ ':'✔ ')+t+' '+e+(n.length?' · '+n.join(' · '):' · sin ayuda')}
  if(i.v)return'⚠ '+t+' '+e+' · SOLO CON LA SOLUCIÓN A LA VISTA ('+veces(i.v)+'): no la superó por su cuenta';
  return'· '+t+' · empezada, sin terminar'};
 const todas=Object.entries(D.items),conReg=id=>D.items[id];
 const propias=todas.filter(([id,i])=>own(i)).length,soloSol=todas.filter(([id,i])=>!own(i)&&i.v>0).length,total=catalogo.length;
 const sinHacer=catalogo.filter(c=>!conReg(c.id)).length;
 L.push('INFORME DE PRÁCTICAS · Simulador de circuitos eléctricos'+(window.SIM?' (v'+SIM.VERSION+')':''));
 L.push((nombre||'Alumno/a')+' · '+fh(Date.now()));
 L.push('Superadas por su cuenta: '+propias+' · Solo con la solución a la vista: '+soloSol+(total?' · Prácticas sin hacer: '+sinHacer+' de '+total:''));
 const bloque=(tit,items)=>{const ls=items.filter(([t,i])=>i).map(([t,i])=>linea(t,i));if(ls.length){L.push('');L.push('— '+tit+' —');ls.forEach(x=>L.push(x))}};
 [['CORRIENTE CONTINUA','cc'],['CORRIENTE ALTERNA','ca']].forEach(([tit,cat])=>bloque(tit,catalogo.filter(c=>c.cat===cat).map(c=>[c.title,conReg(c.id)])));
 bloque('OTRAS PRÁCTICAS Y DESAFÍOS DEL TALLER LIBRE',todas.filter(([id])=>!ids.has(id)).map(([id,i])=>[i.ti||id,i]));
 if(D.exams.length){L.push('');L.push('— EXÁMENES —');D.exams.slice(0,10).forEach(r=>L.push((r.ok?'✔ ':'✖ ')+(r.name||'Problema')+' · nota '+String(r.nota).replace('.',',')+' · '+fh(r.ts)))}
 L.push('');L.push('Cómo leerlo: ✔ la resolvió por su cuenta · ⚠ apretó «Ver solución» (queda registrado) · el simulador no permite que ver la solución cuente como práctica superada por sí mismo.');
 return L.join('\n')}
function openInforme(catalogo){injectCSS();const old=document.getElementById('pg-modal');if(old)old.remove();
 const b=document.createElement('div');b.className='pg-back';b.id='pg-modal';
 b.innerHTML=`<div class="pg-card" role="dialog" aria-modal="true" aria-label="Informe para el docente"><button class="pg-x" aria-label="Cerrar">×</button><h2>📋 Informe para el docente</h2><p>Resume qué prácticas superaste por tu cuenta y cuáles viste con la solución. Es opcional escribir tu nombre: no se guarda en ningún lado, solo va dentro de este texto.</p>
 <label for="pg-nom" style="display:block;font-size:.8rem;margin:0 0 4px">Tu nombre (opcional)</label><input id="pg-nom" type="text" maxlength="40" autocomplete="off" style="width:100%;padding:10px;border-radius:10px;border:1px solid var(--cardline,#345673);background:var(--panel2,#142a41);color:inherit;font:inherit;margin-bottom:10px">
 <textarea id="pg-txt" readonly aria-label="Texto del informe" style="width:100%;height:260px;padding:10px;border-radius:10px;border:1px solid var(--cardline,#345673);background:var(--panel2,#142a41);color:inherit;font:12.5px/1.45 ui-monospace,Consolas,monospace;white-space:pre"></textarea>
 <div class="pg-foot"><span id="pg-msg" role="status"></span><span><button id="pg-copy">Copiar</button> <button id="pg-save">Guardar archivo</button> <button id="pg-back">Volver</button></span></div></div>`;
 document.body.appendChild(b);const ta=b.querySelector('#pg-txt'),nm=b.querySelector('#pg-nom'),msg=b.querySelector('#pg-msg');
 const pintar=()=>{ta.value=informe(catalogo,nm.value.trim())};pintar();nm.oninput=pintar;setTimeout(()=>{try{nm.focus()}catch{}},50);
 const close=()=>b.remove();b.querySelector('.pg-x').onclick=close;b.addEventListener('pointerdown',e=>{if(e.target===b)close()});
 b.querySelector('#pg-back').onclick=()=>{close();if(ult)openMedals(ult[0],ult[1])};
 b.querySelector('#pg-copy').onclick=async()=>{try{await navigator.clipboard.writeText(ta.value);msg.textContent='Copiado: pegalo en un mensaje o documento.'}catch{ta.removeAttribute('readonly');ta.select();try{document.execCommand('copy');msg.textContent='Copiado.'}catch{msg.textContent='Seleccioná el texto y copialo.'}ta.setAttribute('readonly','')}};
 b.querySelector('#pg-save').onclick=()=>{try{const u=URL.createObjectURL(new Blob(['﻿'+ta.value],{type:'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=u;a.download='informe-practicas.txt';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2000);msg.textContent='Archivo guardado en Descargas.'}catch{msg.textContent='No se pudo guardar: usá Copiar.'}}}
let ult=null;
function openMedals(cats,catalogo){load();injectCSS();ult=[cats,catalogo];const old=document.getElementById('pg-modal');if(old)old.remove();
 const b=document.createElement('div');b.className='pg-back';b.id='pg-modal';
 const tot=cats.reduce((a,c)=>{a.s+=c.r.stars;a.m+=c.r.max;return a},{s:0,m:0}),got=badgesEarned();
 b.innerHTML=`<div class="pg-card" role="dialog" aria-modal="true" aria-label="Mis medallas"><button class="pg-x" aria-label="Cerrar">×</button><h2>🏅 Mis medallas</h2><p>Llevás <b style="color:#ffd43b">★ ${tot.s}</b> de ${tot.m} estrellas. Cada práctica da hasta 3: una por completarla, otra sin ver la solución y la tercera sin pistas ni cortocircuitos.</p>
 <div class="pg-cats">${cats.map(c=>`<div class="pg-cat"><div class="m">${c.r.medal?c.r.medal.ico:'⚪'}</div><b>${c.title}</b><div class="st">${starsHTML(Math.round(c.r.ratio*3))}</div><div class="pg-bar"><i style="width:${Math.round(c.r.ratio*100)}%"></i></div><small>${c.r.done}/${c.r.total} prácticas · ★ ${c.r.stars}/${c.r.max}${c.r.medal?' · '+c.r.medal.name:''}</small></div>`).join('')}</div>
 <h3>Logros (${got.length}/${BADGES.length})</h3><div class="pg-badges">${BADGES.map(g=>`<div class="pg-b ${got.includes(g.id)?'':'off'}"><div class="i">${g.ico}</div><div><b>${g.name}</b><small>${g.desc}</small></div></div>`).join('')}</div>
 <div class="pg-foot"><span>Medallas: 🥉 Bronce 1/3 · 🥈 Plata 2/3 · 🥇 Oro casi todas las estrellas. Se guardan en este dispositivo. Los logros solo cuentan las prácticas resueltas sin ver la solución.</span><span><button id="pg-inf">📋 Informe para el docente</button> <button id="pg-reset">Borrar mi progreso</button></span></div></div>`;
 document.body.appendChild(b);const close=()=>b.remove();b.querySelector('.pg-x').onclick=close;b.addEventListener('pointerdown',e=>{if(e.target===b)close()});
 b.querySelector('#pg-inf').onclick=()=>openInforme(catalogo||[]);
 b.querySelector('#pg-reset').onclick=()=>{if(confirm('¿Borrar todas las estrellas y logros de este dispositivo?')){reset();close();document.dispatchEvent(new CustomEvent('progreso-cambio'))}}}

/* true si la práctica solo se completó apretando «Ver solución» (para marcarla en las listas) */
const soloSolucion=id=>{load();const i=D.items[id];return !!i&&i.s>0&&!own(i)};
return{record,flag,stars,addExam,reset,BADGES,badgesEarned,resumen,starsHTML,openMedals,openInforme,informe,soloSolucion,data:()=>{load();return D}};
})();
