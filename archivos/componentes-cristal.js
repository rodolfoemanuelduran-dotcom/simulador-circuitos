/* Componentes de la mesa de cableado con carcasa de cristal (se ve el interior), cables luminosos con
   flujo de electrones y efectos dramáticos (chispas, humo, llamas). Usado por circuito-redes.html. */
window.CRISTAL=(function(){
const cl=(v,a,b)=>Math.max(a,Math.min(b,v));
const rnd=Math.random;

/* ------------------------------------------------------------ definiciones */
const DEFS=`
<linearGradient id="gGlass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".55"/><stop offset=".3" stop-color="#cfe9ff" stop-opacity=".2"/><stop offset=".7" stop-color="#8fc0ec" stop-opacity=".12"/><stop offset="1" stop-color="#ffffff" stop-opacity=".4"/></linearGradient>
<linearGradient id="gGlassIn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a1624" stop-opacity=".55"/><stop offset="1" stop-color="#1d3550" stop-opacity=".35"/></linearGradient>
<radialGradient id="gBulb" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#ffffff" stop-opacity=".42"/><stop offset=".55" stop-color="#cfe6ff" stop-opacity=".16"/><stop offset="1" stop-color="#7fb2e0" stop-opacity=".3"/></radialGradient>
<linearGradient id="gBrass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6d4f17"/><stop offset=".3" stop-color="#f6dc92"/><stop offset=".62" stop-color="#b48a2c"/><stop offset="1" stop-color="#5e4313"/></linearGradient>
<linearGradient id="gCopper" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7a3b1b"/><stop offset=".4" stop-color="#f3a874"/><stop offset=".75" stop-color="#c06a35"/><stop offset="1" stop-color="#7a3b1b"/></linearGradient>
<linearGradient id="gSteel" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#59626f"/><stop offset=".3" stop-color="#f4f7fa"/><stop offset=".6" stop-color="#9aa5b2"/><stop offset="1" stop-color="#4c5560"/></linearGradient>
<linearGradient id="gCell" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#101114"/><stop offset=".3" stop-color="#4d5058"/><stop offset=".55" stop-color="#1b1c20"/><stop offset="1" stop-color="#0b0c0e"/></linearGradient>
<linearGradient id="gCer" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4e7c0"/><stop offset=".5" stop-color="#d9c48e"/><stop offset="1" stop-color="#a98f55"/></linearGradient>
<linearGradient id="gGold" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8a6a0e"/><stop offset=".4" stop-color="#ffe27a"/><stop offset="1" stop-color="#a88112"/></linearGradient>
<radialGradient id="gKnob" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="#ff9a8a"/><stop offset=".5" stop-color="#d8301f"/><stop offset="1" stop-color="#5a0d07"/></radialGradient>
<radialGradient id="gLedOn" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#fff4f4"/><stop offset=".35" stop-color="#ff6666"/><stop offset="1" stop-color="#c01616"/></radialGradient>
<radialGradient id="gLedOff" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#ffb4b4" stop-opacity=".55"/><stop offset="1" stop-color="#8e1c1c" stop-opacity=".55"/></radialGradient>
<radialGradient id="gSmoke"><stop offset="0" stop-color="#3a3f48" stop-opacity=".85"/><stop offset=".6" stop-color="#2c3037" stop-opacity=".5"/><stop offset="1" stop-color="#2c3037" stop-opacity="0"/></radialGradient>
<radialGradient id="gFlash"><stop offset="0" stop-color="#ffffff"/><stop offset=".3" stop-color="#ffe9a0" stop-opacity=".9"/><stop offset="1" stop-color="#ff9a30" stop-opacity="0"/></radialGradient>
<linearGradient id="gFlame" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff3b12"/><stop offset=".45" stop-color="#ff9a1c"/><stop offset=".85" stop-color="#ffe15a"/><stop offset="1" stop-color="#fff7c4" stop-opacity=".2"/></linearGradient>
<linearGradient id="gMag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6b7480"/><stop offset=".5" stop-color="#2c333d"/><stop offset="1" stop-color="#171b21"/></linearGradient>
<linearGradient id="gFan" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d4eeff" stop-opacity=".92"/><stop offset=".6" stop-color="#7fb7e0" stop-opacity=".78"/><stop offset="1" stop-color="#4f86b4" stop-opacity=".7"/></linearGradient>
<radialGradient id="gBlur"><stop offset="0" stop-color="#cfe9ff" stop-opacity=".0"/><stop offset=".55" stop-color="#cfe9ff" stop-opacity=".55"/><stop offset="1" stop-color="#cfe9ff" stop-opacity=".05"/></radialGradient>
<radialGradient id="gPlast" cx=".4" cy=".3" r=".9"><stop offset="0" stop-color="#4a4f58"/><stop offset=".6" stop-color="#1c1f25"/><stop offset="1" stop-color="#0b0c0f"/></radialGradient>
<filter id="fB3" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3"/></filter>
<filter id="fB6" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="6"/></filter>`;
const CSS=`.elec{fill:none;stroke:#f2fdff;stroke-width:4.2;stroke-linecap:round;stroke-dasharray:.1 12;animation:elec .6s linear infinite}
.elec2{fill:none;stroke:#52c8ff;stroke-width:8;stroke-linecap:round;stroke-dasharray:.1 12;opacity:.45;animation:elec .6s linear infinite}
@keyframes elec{to{stroke-dashoffset:-12.1}}
.wglow,.wcore,.elec,.elec2,.wspec{pointer-events:none}.wglow{fill:none;stroke-linecap:round}.wspec{fill:none;stroke:#fff;stroke-opacity:.28;stroke-width:2.2;stroke-linecap:round}.wcore{fill:none;stroke-linecap:round}
.spinm{transform-box:fill-box;transform-origin:50% 50%}@keyframes spinm{to{transform:rotate(360deg)}}@keyframes dashm{to{stroke-dashoffset:-24}}@keyframes wavez{0%{opacity:0;transform:translateY(4px)}40%{opacity:.8}100%{opacity:0;transform:translateY(-10px)}}@keyframes shim{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}.wavez{animation:wavez 1.1s ease-out infinite}.wavez:nth-child(2){animation-delay:.35s}.wavez:nth-child(3){animation-delay:.7s}.shim{animation:shim .9s ease-in-out infinite}
.widle{animation:widle 2.2s ease-in-out infinite}.widle2{animation:widle2 2.2s ease-in-out infinite}@keyframes widle{0%,100%{opacity:.55}50%{opacity:1}}@keyframes widle2{0%,100%{opacity:.26}50%{opacity:.55}}
@media (prefers-reduced-motion:reduce){.elec,.elec2,.widle,.wavez,.shim{animation:none}}`;
function install(){const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st)}

/* ------------------------------------------------------------ piezas comunes */
const screw=(x,y,r=5.5,rot=0)=>`<g transform="translate(${x} ${y}) rotate(${rot})"><circle r="${r}" fill="url(#gSteel)" stroke="#36404c" stroke-width="1"/><path d="M${-r*.62} 0H${r*.62}M0 ${-r*.62}V${r*.62}" stroke="#222a33" stroke-width="${r*.3}" stroke-linecap="round"/></g>`;
/* color de una tensión: 0 (polo −) celeste → verde → amarillo → naranja (polo +) */
const potColor=f=>{f=cl(+f||0,0,1);return`hsl(${Math.round(190-165*f)} 100% ${Math.round(60-5*f)}%)`};
const pc=e=>e?(e.short?'#ff5a3c':potColor(e.f)):null;
const post=(x,y,hot,rot,en)=>`${hot||en?`<circle cx="${x}" cy="${y}" r="15" fill="${pc(en)||'#ffb347'}" opacity="${hot?.6:.42}" filter="url(#fB3)"${hot?'':' class="widle2"'}/>`:''}<rect x="${x-9}" y="${y-8}" width="18" height="16" rx="3" fill="url(#gCopper)" stroke="#5a2c14"/>${screw(x,y,5,rot||30)}`;
const housing=(x1,y1,x2,y2,rx)=>`<rect x="${x1}" y="${y1}" width="${x2-x1}" height="${y2-y1}" rx="${rx}" fill="url(#gGlassIn)"/><rect x="${x1}" y="${y1}" width="${x2-x1}" height="${y2-y1}" rx="${rx}" fill="url(#gGlass)" stroke="#a9cdee" stroke-opacity=".9" stroke-width="2.2"/><path d="M${x1+9} ${y1+6}H${x2-34}" stroke="#fff" stroke-opacity=".6" stroke-width="2.6" stroke-linecap="round"/><path d="M${x1+5} ${y1+12}V${y2-12}" stroke="#fff" stroke-opacity=".28" stroke-width="2" stroke-linecap="round"/><rect x="${x1+3}" y="${y1+3}" width="${x2-x1-6}" height="${y2-y1-6}" rx="${Math.max(2,rx-3)}" fill="none" stroke="#fff" stroke-opacity=".16"/>`;
const wireCu=(d,hot,en)=>`${hot||en?`<path d="${d}" fill="none" stroke="${pc(en)||'#ffc15a'}" stroke-width="10" opacity="${hot?.5:.4}" stroke-linecap="round" filter="url(#fB3)"${hot?'':' class="widle2"'}/>`:''}<path d="${d}" fill="none" stroke="#8d4a24" stroke-width="6" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${hot||en?'#ffd9a0':'#e39a63'}" stroke-width="4" stroke-linecap="round"/>`;
const polGlyph=(x,y,pos)=>`<text x="${x}" y="${y}" text-anchor="middle" style="font:900 20px system-ui;fill:${pos?'#ff7a3d':'#35c8ff'};filter:url(#fB3)" opacity=".9">${pos?'+':'−'}</text><text x="${x}" y="${y}" text-anchor="middle" style="font:900 20px system-ui;fill:${pos?'#ffb08a':'#a8ecff'}">${pos?'+':'−'}</text>`;

/* ------------------------------------------------------------ lámpara */
function lamp(c,r,bk){const lv=r?Math.sqrt(Math.max(0,r.level)):0,lit=!!(r&&r.level>.01&&!bk),cur=!!(r&&Math.abs(r.i)>1e-4&&!bk);
 let s='';
 if(lit)s+=`<circle cx="0" cy="-34" r="${54+48*lv}" fill="url(#glow)" opacity="${.38+.62*lv}"/>`;
 /* patillas de cobre hasta los tornillos de la base */
 const en=(r&&r.en)||{};
 s+=wireCu('M-62 0H-50Q-42 0 -38 20',cur,en.a)+wireCu('M62 0H50Q42 0 38 20',cur,en.b);
 /* ampolla */
 const B=bk?'M-10 -2L-13 -14C-30 -24 -34 -40 -27 -50L-21 -43L-16 -55L-9 -45L-3 -57L4 -46L11 -56L17 -44L24 -52C34 -40 30 -24 13 -14L10 -2Z':'M-10 -2L-13 -14C-35 -26 -31 -62 0 -62C31 -62 35 -26 13 -14L10 -2Z';
 s+=`<path d="${B}" fill="url(#gBulb)" stroke="#a9cdee" stroke-opacity=".85" stroke-width="2"/>`;
 if(lit)s+=`<path d="${B}" fill="rgb(255,${Math.round(205+40*lv)},${Math.round(110+80*lv)})" opacity="${.22+.45*lv}"/>`;
 if(bk)s+=`<path d="${B}" fill="#1a1410" opacity=".55"/>`;
 /* filamento */
 const fil='M-7 -32l2.3 -6 2.3 6 2.3 -6 2.3 6 2.3 -6 2.3 6';
 s+=`<path d="M-3 -4L-7 -32M3 -4L7 -32" stroke="${lit?'#ffe9b0':'#8c99aa'}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
 if(lit)s+=`<path d="${fil}" fill="none" stroke="#ffb03a" stroke-width="7" opacity="${.5*lv+.2}" filter="url(#fB3)" stroke-linecap="round"/>`;
 s+=`<path d="${fil}" fill="none" stroke="${bk?'#4a4038':lit?'#fff6cc':'#7f8da0'}" stroke-width="${lit?2.6:1.8}" stroke-linecap="round" stroke-linejoin="round"/>`;
 if(bk)s+=`<path d="M-4 -34l4 -3 3 5" stroke="#000" stroke-width="2" fill="none"/>`;
 s+=`<path d="M-21 -50Q-27 -40 -25 -29" stroke="#fff" stroke-opacity=".75" stroke-width="3.2" fill="none" stroke-linecap="round"/><path d="M-15 -55Q-8 -58 -2 -57" stroke="#fff" stroke-opacity=".55" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
 /* casquillo E27 */
 s+=`<rect x="-15" y="-6" width="30" height="24" rx="3" fill="url(#gSteel)" stroke="#47505c"/>`+[-2,2.5,7,11.5,16].map(y=>`<path d="M-15 ${y+1}L15 ${y-1}" stroke="#3a424d" stroke-width="2" opacity=".75"/>`).join('');
 /* contactos internos */
 s+=`<path d="M-36 26H-3V19" fill="none" stroke="${cur?'#ffe0a0':'#c9a247'}" stroke-width="4" stroke-linecap="round"/><path d="M36 26H17V10" fill="none" stroke="${cur?'#ffe0a0':'#c9a247'}" stroke-width="4" stroke-linecap="round"/><rect x="-6" y="17" width="12" height="5" rx="2" fill="url(#gBrass)"/>`;
 s+=post(-36,26,cur,20,en.a)+post(36,26,cur,70,en.b);
 s+=housing(-50,-2,50,38,12);
 return s}

/* ------------------------------------------------------------ batería */
function bat(c,r){const cur=!!(r&&Math.abs(r.i)>1e-4),n=cl(Math.round(c.v/3),2,4),H=92/n;
 let s='';
 const en=(r&&r.en)||{};
 s+=`<rect x="-4" y="-62" width="8" height="12" rx="2" fill="url(#gBrass)"/><rect x="-4" y="50" width="8" height="12" rx="2" fill="url(#gSteel)"/>`;
 s+=`<circle cx="0" cy="-54" r="${cur?16:15}" fill="${pc(en.p)||'#ff9a3d'}" opacity="${cur?.6:.4}" filter="url(#fB3)"${cur?'':' class="widle2"'}/><circle cx="0" cy="54" r="${cur?16:15}" fill="${pc(en.n)||'#35c8ff'}" opacity="${cur?.5:.36}" filter="url(#fB3)"${cur?'':' class="widle2"'}/>`;
 s+=`<rect x="-19" y="-55" width="38" height="8" rx="3" fill="url(#gBrass)" stroke="#5e4313"/><rect x="-19" y="47" width="38" height="8" rx="3" fill="url(#gSteel)" stroke="#3a424d"/>`;
 for(let i=0;i<n;i++){const y0=-46+i*H;
  s+=`<rect x="-7" y="${y0-2}" width="14" height="4" rx="1.5" fill="url(#gBrass)"/>`;
  s+=`<rect x="-21" y="${y0+1}" width="42" height="${H-4}" rx="6" fill="url(#gCell)" stroke="#000" stroke-opacity=".6"/>`;
  s+=`<rect x="-21" y="${y0+1+(H-4)*.34}" width="42" height="${Math.max(4,(H-4)*.14)}" fill="url(#gGold)"/>`;
  s+=`<path d="M-15 ${y0+4}V${y0+H-6}" stroke="#fff" stroke-opacity=".25" stroke-width="2.4" stroke-linecap="round"/>`;
  s+=`<text x="13" y="${y0+9}" text-anchor="middle" style="font:900 9px system-ui;fill:#ffcf6a">+</text>`;
  if(i<n-1)s+=`<path d="M-5 ${y0+H-3}l3 1.4 -6 1.4 6 1.4 -3 1.4" stroke="#cfd6df" stroke-width="1.4" fill="none"/>`}
 s+=`<rect x="-30" y="-52" width="60" height="104" rx="13" fill="url(#gGlassIn)"/><rect x="-30" y="-52" width="60" height="104" rx="13" fill="url(#gGlass)" stroke="#a9cdee" stroke-opacity=".9" stroke-width="2.2"/><path d="M-24 -42V40" stroke="#fff" stroke-opacity=".5" stroke-width="3" stroke-linecap="round"/><path d="M24 -36V30" stroke="#fff" stroke-opacity=".2" stroke-width="2" stroke-linecap="round"/>`;
 s+=`<rect x="-22" y="-10" width="44" height="20" rx="4" fill="#0b121b" fill-opacity=".82" stroke="#ffffff44"/><text x="0" y="5" text-anchor="middle" style="font:800 15px system-ui;fill:#fff">${String(c.v).replace(".",",")} V</text>`;
 return s}

/* ------------------------------------------------------------ llave */
function sw(c,on,r){const cur=!!(r&&Math.abs(r.i)>1e-4),hot=cur&&on,en=(r&&r.en)||{};let s='';
 s+=wireCu('M-62 0H-40',hot,en.a)+wireCu('M40 0H62',hot,en.b);
 s+=post(-32,0,hot,10,en.a);
 /* mordaza de contacto */
 s+=`<rect x="34" y="-9" width="12" height="18" rx="3" fill="url(#gCopper)" stroke="#5a2c14"/><path d="M24 -9H34M24 9H34" stroke="url(#gBrass)" stroke-width="5" stroke-linecap="round"/>${hot||en.b?`<circle cx="34" cy="0" r="13" fill="${pc(en.b)||'#ffb347'}" opacity="${hot?.55:.42}" filter="url(#fB3)"${hot?'':' class="widle2"'}/>`:''}`;
 const ang=on?0:-29;
 s+=`<g transform="translate(-32 0) rotate(${ang})">${hot||en.a?`<rect x="0" y="-5" width="62" height="10" rx="4" fill="${pc(en.a)||'#ffc15a'}" opacity="${hot?.6:.45}" filter="url(#fB3)"${hot?'':' class="widle2"'}/>`:''}<rect x="0" y="-3.6" width="60" height="7.2" rx="2.5" fill="url(#gBrass)" stroke="#6d4f17"/><path d="M3 -1.6H57" stroke="#fff" stroke-opacity=".55" stroke-width="1.4"/><rect x="29" y="-36" width="6" height="34" rx="2" fill="url(#gSteel)" stroke="#39424e"/><circle cx="32" cy="-41" r="9.5" fill="url(#gKnob)" stroke="#3a0905"/><ellipse cx="29" cy="-45" rx="4" ry="2.4" fill="#fff" opacity=".6"/></g>`;
 s+=housing(-52,-26,52,22,10);
 return s}
function sw3(c,on,r){const cur=!!(r&&Math.abs(r.i)>1e-4),en=(r&&r.en)||{};let s='';
 s+=wireCu('M-62 0H-40',cur,en.c);
 s+=wireCu('M40 -28H62',false,en.a)+wireCu('M40 28H62',false,en.b);
 s+=post(-32,0,cur,10,en.c);
 [-28,28].forEach(y=>{s+=`<rect x="34" y="${y-8}" width="12" height="16" rx="3" fill="url(#gCopper)" stroke="#5a2c14"/><path d="M24 ${y-8}H34M24 ${y+8}H34" stroke="url(#gBrass)" stroke-width="4.6" stroke-linecap="round"/>`});
 const ang=on?23.5:-23.5;
 s+=`<g transform="translate(-32 0) rotate(${ang})">${cur||en.c?`<rect x="0" y="-5" width="66" height="10" rx="4" fill="${pc(en.c)||'#ffc15a'}" opacity="${cur?.55:.42}" filter="url(#fB3)"${cur?'':' class="widle2"'}/>`:''}<rect x="0" y="-3.6" width="64" height="7.2" rx="2.5" fill="url(#gBrass)" stroke="#6d4f17"/><path d="M3 -1.6H61" stroke="#fff" stroke-opacity=".55" stroke-width="1.4"/><rect x="29" y="-30" width="6" height="28" rx="2" fill="url(#gSteel)" stroke="#39424e"/><circle cx="32" cy="-35" r="9" fill="url(#gKnob)" stroke="#3a0905"/><ellipse cx="29" cy="-39" rx="3.8" ry="2.3" fill="#fff" opacity=".6"/></g>`;
 s+=housing(-52,-40,52,40,10);
 return s}

/* ------------------------------------------------------------ LED */
function led(c,r,bk){const lv=r?r.level:0,on=lv>.02&&!bk,cur=!!(r&&Math.abs(r.i)>1e-4&&!bk),en=(r&&r.en)||{};let s='';
 if(on)s+=`<circle cx="0" cy="-34" r="${46+40*lv}" fill="url(#glowR)" opacity="${.5+.5*lv}"/>`;
 s+=wireCu('M-62 0H-50Q-42 0 -38 22',cur,en.a)+wireCu('M62 0H50Q42 0 38 22',cur,en.k);
 /* patas (el ánodo + es la más larga) */
 s+=`<path d="M-6 -3V22Q-6 27 -13 27H-36" fill="none" stroke="${cur?'#ffe0a0':'#cfd6df'}" stroke-width="3.4" stroke-linecap="round"/><path d="M6 -3V15Q6 27 14 27H36" fill="none" stroke="${cur?'#ffe0a0':'#cfd6df'}" stroke-width="3.4" stroke-linecap="round"/>`;
 /* cúpula de epoxi */
 const D='M-15 -2V-34Q-15 -64 0 -64Q15 -64 15 -34V-2Z';
 s+=`<path d="${D}" fill="${bk?'#1c1818':on?'url(#gLedOn)':'url(#gLedOff)'}" stroke="${on?'#ffb0b0':'#c98a8a'}" stroke-opacity=".9" stroke-width="2"/>`;
 if(on)s+=`<path d="${D}" fill="#ffffff" opacity="${.15+.35*lv}"/>`;
 /* yunque, copa y chip */
 s+=`<path d="M6 -3V-38M-6 -3V-30Q-6 -36 -2 -41" stroke="${bk?'#4a4040':'#b9c2cd'}" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M0 -42L12 -42L10 -35L2 -35Z" fill="${bk?'#3a3535':'#dfe5ec'}" stroke="#6f7b88" stroke-width="1"/><rect x="4" y="-39" width="4" height="3" fill="${on?'#fff':'#9a5a5a'}"/><path d="M-2 -41L5 -39" stroke="#e8d28a" stroke-width="1" fill="none"/>`;
 s+=`<path d="M-11 -50Q-12 -40 -11 -30" stroke="#fff" stroke-opacity="${on?.8:.6}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
 if(bk)s+=`<path d="M-8 -56L-2 -46L-8 -40M8 -58L3 -48L9 -42" stroke="#000" stroke-width="1.6" fill="none"/>`;
 /* brida con el lado plano del cátodo */
 s+=`<rect x="-19" y="-6" width="38" height="5" rx="2" fill="${on?'#ff9090':'#d6a0a0'}" fill-opacity=".8" stroke="#8a5a5a" stroke-width="1"/><rect x="14" y="-6" width="5" height="5" fill="#000" opacity=".35"/>`;
 s+=post(-36,27,cur,15,en.a)+post(36,27,cur,55,en.k);
 s+=housing(-48,-1,48,38,12);
 s+=polGlyph(-62,-22,true)+polGlyph(62,-22,false);
 return s}

/* ------------------------------------------------------------ resistor y fusible */
function res(c,r,cols){const cur=!!(r&&Math.abs(r.i)>1e-4),P=r?Math.abs(r.p):0,hot=cl(P/2,0,1),en=(r&&r.en)||{};let s='';
 s+=wireCu('M-62 0H-34',cur,en.a)+wireCu('M34 0H62',cur,en.b);
 s+=`<rect x="-36" y="-12" width="72" height="24" rx="11" fill="url(#gCer)" stroke="#6d5a2e" stroke-opacity=".7"/>`;
 [[-22,cols[0]],[-9,cols[1]],[4,cols[2]],[22,'#d4af37']].forEach(([x,col])=>{s+=`<rect x="${x}" y="-12" width="7" height="24" fill="${col}"/><rect x="${x}" y="-12" width="3" height="24" fill="#fff" opacity=".18"/>`});
 s+=`<rect x="-36" y="-12" width="72" height="24" rx="11" fill="none" stroke="#fff" stroke-opacity=".12"/><path d="M-30 -7H30" stroke="#fff" stroke-opacity=".5" stroke-width="3" stroke-linecap="round"/>`;
 if(hot>.05)s+=`<rect x="-36" y="-12" width="72" height="24" rx="11" fill="#ff6a2a" opacity="${.5*hot}"/>`;
 return s}
function fuse(c,r,bk){const I=r?Math.abs(r.i):0,near=!bk&&I>c.amp*.8,cur=I>1e-4&&!bk,en=(r&&r.en)||{};let s='';
 s+=wireCu('M-62 0H-44',cur,en.a)+wireCu('M44 0H62',cur,en.b);
 s+=`<rect x="-34" y="-14" width="68" height="28" rx="8" fill="url(#gGlassIn)"/>`;
 if(bk){s+=`<path d="M-31 0L-12 -4M12 4L31 0" stroke="#7d8896" stroke-width="2.2" stroke-linecap="round"/><ellipse cx="0" cy="0" rx="20" ry="9" fill="#14100c" opacity=".7"/>`}
 else{s+=`${near?`<path d="M-31 0H31" stroke="#ff7a30" stroke-width="9" opacity=".6" filter="url(#fB3)"/>`:''}<path d="M-31 0L-20 -5 -8 5 4 -5 16 5 31 0" fill="none" stroke="${near?'#ffb070':cur?'#e8eef5':'#9aa8b8'}" stroke-width="${near?2.6:2}" stroke-linecap="round" stroke-linejoin="round"/>`}
 s+=`<rect x="-34" y="-14" width="68" height="28" rx="8" fill="url(#gGlass)" stroke="#a9cdee" stroke-opacity=".9" stroke-width="2.2"/><path d="M-26 -9H22" stroke="#fff" stroke-opacity=".6" stroke-width="2.4" stroke-linecap="round"/>`;
 s+=`<rect x="-44" y="-14" width="14" height="28" rx="3" fill="url(#gBrass)" stroke="#5e4313"/><rect x="30" y="-14" width="14" height="28" rx="3" fill="url(#gBrass)" stroke="#5e4313"/><path d="M-41 -10V10M-36 -10V10M37 -10V10M42 -10V10" stroke="#000" stroke-opacity=".18"/>`;
 return s}

/* ------------------------------------------------------------ motor de corriente continua */
/* Motor pequeño con carcasa de cristal: se ven los imanes, el rotor con sus bobinas de cobre, el colector y las escobillas.
   Gira según la tensión (r.level = velocidad relativa) y el sentido depende de la polaridad (r.dir). La pata superior (+) es la "a". */
function dcm(c,r,bk){const lv=r?cl(r.level,0,1.25):0,dir=r&&r.dir<0?-1:1,cur=!!(r&&Math.abs(r.i)>1e-4&&!bk),en=(r&&r.en)||{};
 const run=lv>.07&&!bk,per=run?cl(.75/lv,.09,2):0,rev=dir<0?' reverse':'';
 const sp=run?` class="spinm" style="animation:spinm ${per.toFixed(2)}s linear infinite${rev}"`:' class="spinm"';
 const dash=run?` style="animation:dashm ${(per/3).toFixed(2)}s linear infinite${rev}"`:'';
 let s=`<ellipse cx="8" cy="42" rx="66" ry="6" fill="#000" opacity=".3" filter="url(#fB3)"/>`;
 /* lengüetas de soldadura del tapón trasero (arriba +, abajo −) */
 s+=wireCu('M-44 -14L-52 -30H-62',cur,en.a)+wireCu('M-44 14L-52 30H-62',cur,en.b);
 s+=`<circle cx="-58" cy="-30" r="3.2" fill="#c62828" stroke="#5a0d07"/><circle cx="-58" cy="30" r="3.2" fill="#222" stroke="#000"/>`;
 /* tapón trasero de latón con los agujeros de las escobillas */
 s+=`<rect x="-48" y="-23" width="13" height="46" rx="4" fill="url(#gBrass)" stroke="#5e4313"/><circle cx="-41.5" cy="-14" r="2.4" fill="#2a1d08"/><circle cx="-41.5" cy="14" r="2.4" fill="#2a1d08"/><path d="M-45 -3H-38M-45 3H-38" stroke="#000" stroke-opacity=".25"/>`;
 /* imanes permanentes (arriba y abajo, dentro de la carcasa) */
 s+=`<path d="M-31 -22H18Q22 -22 22 -17V-12Q-4 -7 -31 -12Z" fill="url(#gMag)" stroke="#0d1014"/><path d="M-31 22H18Q22 22 22 17V12Q-4 7 -31 12Z" fill="url(#gMag)" stroke="#0d1014"/>
  <text x="-6" y="-14.5" text-anchor="middle" style="font:800 6px system-ui;fill:#ff8a7a">N</text><text x="-6" y="19.5" text-anchor="middle" style="font:800 6px system-ui;fill:#7ad3ff">S</text>`;
 /* eje de acero que atraviesa todo el motor */
 s+=`<rect x="-36" y="-2.2" width="84" height="4.4" rx="2.2" fill="url(#gSteel)" stroke="#39424e" stroke-width=".6"/>`;
 /* rotor: núcleo laminado y bobinas de cobre (las rayas se mueven cuando gira) */
 s+=`<rect x="-22" y="-11" width="34" height="22" rx="3" fill="url(#gSteel)" stroke="#39424e" stroke-width=".8"/>`+[-18,-12,-6,0,6].map(x=>`<path d="M${x} -11V11" stroke="#39424e" stroke-opacity=".5"/>`).join('');
 [-17,-5,7].forEach((x,i)=>{s+=`<ellipse cx="${x+3}" cy="0" rx="5" ry="12.5" fill="none" stroke="${cur?'#ffb070':'#d98250'}" stroke-width="4.2" stroke-dasharray="${run?'9 4':'0'}"${dash} opacity="${run?.92:1}"/><ellipse cx="${x+3}" cy="0" rx="5" ry="12.5" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="1.1"/>`});
 /* colector con tres delgas y escobillas de carbón con resorte */
 s+=`<rect x="-34" y="-9" width="10" height="18" rx="2.5" fill="url(#gCopper)" stroke="#5a2c14"/><path d="M-31 -9V9M-27 -9V9" stroke="#2a1208" stroke-width="1"/>
  <rect x="-35" y="-16" width="9" height="6.5" rx="1.2" fill="#23262b" stroke="#000"/><rect x="-35" y="9.5" width="9" height="6.5" rx="1.2" fill="#23262b" stroke="#000"/>
  <path d="M-31 -16l2 -3 -4 -2 4 -2 -2 -3M-31 16l2 3 -4 2 4 2 -2 3" stroke="#cfd6df" stroke-width="1.1" fill="none"/>`;
 /* carcasa de cristal con anillos de acero y chapa de datos */
 s+=housing(-36,-24,24,24,7);
 s+=`<rect x="-31" y="-24.8" width="3" height="49.6" rx="1" fill="url(#gSteel)" opacity=".8"/><rect x="17" y="-24.8" width="3" height="49.6" rx="1" fill="url(#gSteel)" opacity=".8"/><text x="8" y="-14.5" text-anchor="middle" style="font:800 6px system-ui;fill:#cfe9ff">${String(c.vr||'').toString().replace('.',',')} V CC</text>`;
 /* placa frontal y cojinete de latón; el eje sale por acá */
 s+=`<rect x="24" y="-21" width="9" height="42" rx="3" fill="url(#gBrass)" stroke="#5e4313"/><rect x="32" y="-6.5" width="7" height="13" rx="2" fill="url(#gBrass)" stroke="#5e4313"/><circle cx="28.5" cy="-14" r="2" fill="#2a1d08"/><circle cx="28.5" cy="14" r="2" fill="#2a1d08"/>`;
 /* hélice de plástico transparente calada en el eje (vista de frente) */
 s+=`<g transform="translate(58 0)"><g${sp}>${[0,90,180,270].map(a=>`<path transform="rotate(${a})" d="M0 -3.5C9.5 -5.5 16 -16 9.5 -24.5C1 -26.5 -4.5 -13.5 0 -3.5Z" fill="url(#gFan)" stroke="#9fd0f0" stroke-opacity=".8" stroke-width=".8"/><path transform="rotate(${a})" d="M2 -8C6 -12 8 -17 6.5 -21" stroke="#fff" stroke-opacity=".6" stroke-width="1.3" fill="none" stroke-linecap="round"/>`).join('')}<circle r="5.5" fill="url(#gSteel)" stroke="#39424e"/><circle r="1.8" fill="#222"/></g>${run?`<circle r="25" fill="url(#gBlur)" opacity="${(.25+.35*Math.min(1,lv)).toFixed(2)}"/>`:''}</g>`;
 /* calor y quemado */
 if(cur&&lv>.9)s+=`<rect x="-36" y="-24" width="60" height="48" rx="7" fill="#ff8a3d" opacity="${((lv-.9)*1.2).toFixed(2)}" filter="url(#fB3)"/>`;
 if(bk)s+=`<rect x="-34" y="-22" width="56" height="44" rx="6" fill="#0c0a08" opacity=".62"/><path d="M-24 -20L-6 2L-18 21M12 -22L2 -4L16 20" stroke="#000" stroke-width="2" fill="none"/><path d="M30 -2L44 4" stroke="#7d8896" stroke-width="3"/>`;
 s+=polGlyph(-62,-47,true)+polGlyph(-62,57,false);
 return s}

/* ------------------------------------------------------------ zumbador (buzzer) */
function buz(c,r,bk){const on=!!(r&&r.level>.5&&!bk),cur=!!(r&&Math.abs(r.i)>1e-4&&!bk),en=(r&&r.en)||{};
 let s=wireCu('M-62 0H-38',cur,en.a)+wireCu('M38 0H62',cur,en.b);
 s+=`<ellipse cx="0" cy="40" rx="40" ry="5" fill="#000" opacity=".28" filter="url(#fB3)"/>`;
 s+=`<rect x="-34" y="-5" width="10" height="10" rx="2" fill="url(#gCopper)" stroke="#5a2c14"/><rect x="24" y="-5" width="10" height="10" rx="2" fill="url(#gCopper)" stroke="#5a2c14"/>`;
 s+=`<circle cx="0" cy="0" r="30" fill="url(#gPlast)" stroke="#000"/><circle cx="0" cy="0" r="24" fill="none" stroke="#fff" stroke-opacity=".1" stroke-width="2"/><circle cx="0" cy="0" r="5.5" fill="#050608" stroke="#555"/>
  <text x="-20" y="-12" text-anchor="middle" style="font:900 14px system-ui;fill:#ff7a3d">+</text>
  <path d="M-18 -22Q-8 -29 4 -28" stroke="#fff" stroke-opacity=".35" stroke-width="3" fill="none" stroke-linecap="round"/>`;
 if(on)s+=`<g fill="none" stroke="#ffd43b" stroke-width="3" stroke-linecap="round">${[0,1,2].map(i=>`<path class="wavez" d="M${38+i*9} -${10+i*5}Q${46+i*9} 0 ${38+i*9} ${10+i*5}"/>`).join('')}</g>`;
 if(bk)s+=`<circle cx="0" cy="0" r="30" fill="#0c0a08" opacity=".55"/><path d="M-14 -18L2 4L-8 20" stroke="#000" stroke-width="2" fill="none"/>`;
 s+=housing(-44,-36,44,34,14);
 return s+polGlyph(-62,-22,true)+polGlyph(62,-22,false)}

/* ------------------------------------------------------------ calefactor (resistencia calefactora de cuarzo) */
function cal(c,r,bk){const lv=r?cl(r.level,0,1.25):0,hot=lv>.03&&!bk,cur=!!(r&&Math.abs(r.i)>1e-4&&!bk),en=(r&&r.en)||{},g=cl(Math.sqrt(lv),0,1);
 let s='';
 if(hot)s+=`<ellipse cx="0" cy="-6" rx="${70+30*g}" ry="${30+16*g}" fill="#ff7a2a" opacity="${(.14+.3*g).toFixed(2)}" filter="url(#fB6)"/>`;
 s+=wireCu('M-62 0H-46',cur,en.a)+wireCu('M46 0H62',cur,en.b);
 s+=`<rect x="-52" y="-12" width="14" height="24" rx="4" fill="#efe9dd" stroke="#8d8576"/><rect x="38" y="-12" width="14" height="24" rx="4" fill="#efe9dd" stroke="#8d8576"/><path d="M-48 -7V7M43 -7V7" stroke="#8d8576" stroke-opacity=".6"/>`;
 s+=`<rect x="-38" y="-9" width="76" height="18" rx="8" fill="url(#gGlassIn)"/>`;
 const col=hot?`rgb(255,${Math.round(90+120*g)},${Math.round(30+60*g)})`:bk?'#3a332c':'#8d97a4';
 let zig='M-36 0';for(let i=0;i<19;i++)zig+=`L${-33+i*3.7} ${i%2?-5:5}`;zig+='L36 0';
 if(hot)s+=`<path d="${zig}" stroke="#ff9a3a" stroke-width="7" fill="none" opacity="${(.5*g).toFixed(2)}" filter="url(#fB3)"/>`;
 s+=`<path d="${zig}" stroke="${col}" stroke-width="${hot?2.8:2.2}" fill="none" stroke-linejoin="round"/>`;
 if(bk)s+=`<path d="M-4 -6L2 6" stroke="#000" stroke-width="2.4"/><rect x="-38" y="-9" width="76" height="18" rx="8" fill="#0c0a08" opacity=".35"/>`;
 s+=`<rect x="-38" y="-9" width="76" height="18" rx="8" fill="url(#gGlass)" stroke="#a9cdee" stroke-opacity=".9" stroke-width="2"/><path d="M-30 -5H24" stroke="#fff" stroke-opacity=".55" stroke-width="2.2" stroke-linecap="round"/>`;
 if(hot&&lv>.15)s+=`<g fill="none" stroke="#ffb070" stroke-width="2.6" stroke-linecap="round" opacity=".8">${[-24,0,24].map(x=>`<path class="wavez" d="M${x} -16q5 -5 0 -10t0 -10"/>`).join('')}</g>`;
 return s}

/* ------------------------------------------------------------ cables luminosos */
function mix(hex,t){hex=String(hex);if(hex[0]!=='#'||hex.length!==7)return hex;const n=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)).map(v=>Math.round(v+(255-v)*t));return'#'+n.map(v=>v.toString(16).padStart(2,'0')).join('')}
/* pot = {live,f,short}: el cable está unido a un polo de la fuente (se ilumina con el color de su tensión aunque no circule
   corriente); I = corriente: solo si circula se ven los electrones moviéndose. */
function wire(d,dElec,col,I,sel,extra,pot){const flow=I>1e-4,en=!!(pot&&pot.live),g=flow?cl(.4+Math.sqrt(I)*1.2,.4,1):0,hc=en?pc(pot):null;let w=`<path class="wshadow" d="${d}"/>`;
 if(flow){const lc=hc||mix(col,.35);w+=`<path class="wglow" d="${d}" stroke="${lc}" stroke-width="30" style="opacity:${.12*g}"/><path class="wglow" d="${d}" stroke="${lc}" stroke-width="20" style="opacity:${.22*g}"/><path class="wglow" d="${d}" stroke="${lc}" stroke-width="12" style="opacity:${.4*g}"/>`}
 else if(en){w+=`<g class="widle"><path class="wglow" d="${d}" stroke="${hc}" stroke-width="30" style="opacity:.2"/><path class="wglow" d="${d}" stroke="${hc}" stroke-width="19" style="opacity:.38"/><path class="wglow" d="${d}" stroke="${hc}" stroke-width="11" style="opacity:.7"/></g>`}
 w+=`<path class="wire${sel?' sel':''}" d="${d}" stroke="${col}"/>`+(extra||'');
 w+=`<path class="wspec" d="${d}"/>`;
 if(flow){const dur=cl(1.15/(.6+I*9),.16,1.1).toFixed(2);w+=`<path class="wcore" d="${d}" stroke="${hc||mix(col,.75)}" stroke-width="3" style="opacity:${.5+.4*g}"/><path class="elec2" d="${dElec}" style="animation-duration:${dur}s"/><path class="elec" d="${dElec}" style="animation-duration:${dur}s"/>`}
 else if(en)w+=`<path class="wcore widle" d="${d}" stroke="${hc}" stroke-width="2.6" style="opacity:.8"/>`;
 return w}

/* ------------------------------------------------------------ efectos: chispas, humo y llamas */
const FX={ps:[],em:{},g:null,run:false,last:0,onSpark:null,
 init(g){this.g=g},
 add(p){p.age=0;this.ps.push(p);if(this.ps.length>260)this.ps.shift();this.start()},
 start(){if(this.run||!this.g)return;this.run=true;this.last=performance.now();requestAnimationFrame(t=>this.tick(t))},
 spark(x,y,n=12,o){o=o||{};for(let i=0;i<n;i++){const a=(o.up?-Math.PI/2+(rnd()-.5)*1.7:rnd()*6.283),v=(o.v||160)*(.35+rnd()*1.0);this.add({k:'spark',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:.3+rnd()*.55})}if(this.onSpark)this.onSpark()},
 smoke(x,y,n=1,o){o=o||{};for(let i=0;i<n;i++)this.add({k:'smoke',x:x+(rnd()-.5)*(o.sp||14),y,vx:(rnd()-.5)*16+(o.drift||0),vy:-(24+rnd()*28),r:(o.r||7)+rnd()*5,life:2.4+rnd()*1.8})},
 flame(x,y,n=1,o){o=o||{};for(let i=0;i<n;i++)this.add({k:'flame',x:x+(rnd()-.5)*(o.sp||16),y,vy:-(34+rnd()*36),life:.5+rnd()*.45,s:(o.s||1)*(.7+rnd()*.8),ph:rnd()*6})},
 flash(x,y,r,o){this.add({k:'flash',x,y,r:r||70,life:.32})},
 /* estallido de un foco: trozos de vidrio con gravedad, onda expansiva y destello */
 shatter(x,y,n=26){this.add({k:'ring',x,y,life:.5});this.flash(x,y,150);for(let i=0;i<n;i++){const a=rnd()*6.283,v=120+rnd()*300;this.add({k:'shard',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-120,rot:rnd()*360,vr:(rnd()-.5)*900,s:3+rnd()*6,life:.9+rnd()*.9})}this.spark(x,y,22,{v:300})},
 /* emisores sostenidos: se reemplazan por clave y desaparecen al quitarles la condición */
 emit(key,fn,secs){this.em[key]={fn,left:secs===undefined?1e9:secs,acc:0};this.start()},
 stop(key){delete this.em[key]},
 clearAll(){this.ps=[];this.em={};if(this.g)this.g.innerHTML=''},
 tick(t){const dt=Math.min(.05,(t-this.last)/1000);this.last=t;
  for(const k in this.em){const e=this.em[k];e.left-=dt;if(e.left<=0){delete this.em[k];continue}e.acc+=dt;try{e.fn(dt,e)}catch{}}
  let s='';const keep=[];
  for(const p of this.ps){p.age+=dt;if(p.age>=p.life)continue;const u=p.age/p.life;
   if(p.k==='spark'){p.vy+=520*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;const l=Math.max(.02,.045),x2=p.x-p.vx*l,y2=p.y-p.vy*l;s+=`<line x1="${p.x.toFixed(1)}" y1="${p.y.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${u<.4?'#fffbe0':'#ffb020'}" stroke-width="${(2.6*(1-u)+.8).toFixed(1)}" stroke-linecap="round" opacity="${(1-u*u).toFixed(2)}"/><circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${(2.6*(1-u)+1).toFixed(1)}" fill="#fff6c0" opacity="${(1-u).toFixed(2)}"/>`}
   else if(p.k==='smoke'){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.995;const r=p.r+u*34;s+=`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${r.toFixed(1)}" fill="url(#gSmoke)" opacity="${(.9*(1-u)*Math.min(1,u*6)).toFixed(2)}"/>`}
   else if(p.k==='flame'){p.y+=p.vy*dt;const sw=Math.sin(p.age*14+p.ph)*4*(1-u),sc=p.s*(1-u*.55);s+=`<g transform="translate(${(p.x+sw).toFixed(1)} ${p.y.toFixed(1)}) scale(${(sc*.9).toFixed(2)} ${(sc*1.2).toFixed(2)})" opacity="${(1-u*u).toFixed(2)}"><path d="M0 0C-12 -6 -10 -20 0 -40C10 -20 12 -6 0 0Z" fill="url(#gFlame)"/><path d="M0 -2C-5 -6 -4 -14 0 -22C4 -14 5 -6 0 -2Z" fill="#fff4b0" opacity=".85"/></g>`}
   else if(p.k==='shard'){p.vy+=620*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt;s+=`<polygon transform="translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${p.rot.toFixed(0)})" points="0,${-p.s} ${p.s*.7},${p.s*.6} ${-p.s*.8},${p.s*.4}" fill="#dff2ff" fill-opacity="${(.75*(1-u)).toFixed(2)}" stroke="#ffffff" stroke-opacity="${(1-u).toFixed(2)}" stroke-width=".8"/>`}
   else if(p.k==='ring'){const r=8+u*95;s+=`<circle cx="${p.x}" cy="${p.y}" r="${r.toFixed(1)}" fill="none" stroke="#ffe9a0" stroke-width="${(7*(1-u)+1).toFixed(1)}" opacity="${(.85*(1-u)).toFixed(2)}"/>`}
   else if(p.k==='flash'){const r=p.r*(.4+u*1.1);s+=`<circle cx="${p.x}" cy="${p.y}" r="${r.toFixed(1)}" fill="url(#gFlash)" opacity="${(1-u).toFixed(2)}"/>`}
   keep.push(p)}
  this.ps=keep;
  /* las llamas y chispas van encima del humo */
  this.g.innerHTML=s;
  if(this.ps.length||Object.keys(this.em).length)requestAnimationFrame(t2=>this.tick(t2));else{this.run=false;this.g.innerHTML=''}}};
return{DEFS,install,lamp,bat,sw,sw3,led,res,fuse,dcm,buz,cal,wire,FX,mix,potColor};
})();
