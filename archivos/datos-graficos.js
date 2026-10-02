/* Biblioteca gráfica realista para "Datos curiosos": degradados, texturas, luces,
   personas articuladas, cables metálicos, arcos eléctricos, agua, fuego y lluvia.
   Se carga antes de datos.html y entrega window.DEFS (definiciones SVG) y
   window.HELPERS(f,amp,volt,ohm,effect) con las funciones de dibujo. */
window.DEFS=`<defs>
<linearGradient id="roomShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".22"/><stop offset=".5" stop-color="#fff" stop-opacity=".06"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient>
<linearGradient id="gsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--sk1)"/><stop offset=".55" style="stop-color:var(--sk2)"/><stop offset="1" style="stop-color:var(--sk3)"/></linearGradient>
<radialGradient id="sunG"><stop offset="0" stop-color="#fff7c2"/><stop offset=".25" stop-color="#ffe27a" stop-opacity=".9"/><stop offset="1" stop-color="#ffd24a" stop-opacity="0"/></radialGradient>
<radialGradient id="moonG"><stop offset="0" stop-color="#f4f8ff"/><stop offset=".3" stop-color="#bcd2ee" stop-opacity=".85"/><stop offset="1" stop-color="#6d8fc0" stop-opacity="0"/></radialGradient>
<filter id="glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="glow2" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="shadow" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="7" stdDeviation="6" flood-color="#000" flood-opacity=".38"/></filter>
<filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3"/></filter>
<pattern id="grass" width="30" height="30" patternUnits="userSpaceOnUse"><rect width="30" height="30" fill="var(--gnd)"/><path d="M4 28l2-10l2 10M14 26l1-12l3 12M23 28l1-9l3 9M9 12l1-6l2 6M20 14l1-6l2 6" stroke="var(--gnd2)" stroke-width="2" fill="none" stroke-linecap="round"/></pattern>
<pattern id="asph" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="var(--road)"/><circle cx="6" cy="8" r="1.4" fill="#fff" opacity=".13"/><circle cx="24" cy="14" r="1.2" fill="#fff" opacity=".1"/><circle cx="14" cy="30" r="1.6" fill="#000" opacity=".15"/><circle cx="33" cy="33" r="1.2" fill="#fff" opacity=".1"/></pattern>
<pattern id="conc" width="24" height="24" patternUnits="userSpaceOnUse"><rect width="24" height="24" fill="var(--conc)"/><circle cx="5" cy="6" r="1.3" fill="#000" opacity=".12"/><circle cx="17" cy="15" r="1.5" fill="#fff" opacity=".14"/><circle cx="9" cy="20" r="1" fill="#000" opacity=".1"/></pattern>
<pattern id="woodP" width="14" height="40" patternUnits="userSpaceOnUse"><rect width="14" height="40" fill="var(--wood)"/><path d="M3 0V40M8 0V40M12 0V40" stroke="#000" stroke-opacity=".18" stroke-width="1.2"/></pattern>
<pattern id="tile" width="60" height="60" patternUnits="userSpaceOnUse"><rect width="60" height="60" fill="#c9d1d8"/><path d="M0 0H60V60H0Z" fill="none" stroke="#8f99a3" stroke-width="2"/><path d="M0 0L60 60" stroke="#fff" stroke-opacity=".12"/></pattern>
<linearGradient id="metalV" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5d6a79"/><stop offset=".35" stop-color="#d6dde6"/><stop offset=".6" stop-color="#9aa6b4"/><stop offset="1" stop-color="#4d5966"/></linearGradient>
<linearGradient id="metalH" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6ebf1"/><stop offset=".45" stop-color="#9aa6b4"/><stop offset="1" stop-color="#58646f"/></linearGradient>
<linearGradient id="copperG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0b27a"/><stop offset=".5" stop-color="#c9783a"/><stop offset="1" stop-color="#7a4318"/></linearGradient>
<linearGradient id="shirtG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2f6fd1"/><stop offset=".5" stop-color="#5b9bf0"/><stop offset="1" stop-color="#2557a8"/></linearGradient>
<linearGradient id="pantsG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#27303f"/><stop offset=".5" stop-color="#3d4a5f"/><stop offset="1" stop-color="#202835"/></linearGradient>
<radialGradient id="skinG" cx=".4" cy=".35"><stop offset="0" stop-color="#f6cfae"/><stop offset="1" stop-color="#d49a73"/></radialGradient>
<linearGradient id="waterG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6cc4f5" stop-opacity=".9"/><stop offset="1" stop-color="#1d6fb0" stop-opacity=".95"/></linearGradient>
<linearGradient id="birdG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6e82ad"/><stop offset="1" stop-color="#3f5078"/></linearGradient>
<linearGradient id="houseG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d9c79f"/><stop offset=".5" stop-color="#f1e3c3"/><stop offset="1" stop-color="#cdb98c"/></linearGradient>
<linearGradient id="flameG" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#e63a1a"/><stop offset=".5" stop-color="#ff9a2a"/><stop offset="1" stop-color="#ffe36b"/></linearGradient>
</defs>`;

window.HELPERS=function(f,amp,volt,ohm,effect){
 const R2=n=>Math.round(n*10)/10;
 /* cinemática inversa de dos segmentos: devuelve el codo/rodilla */
 function ik(ax,ay,bx,by,l1,l2,side){let dx=bx-ax,dy=by-ay,d=Math.hypot(dx,dy);const maxd=l1+l2-.5;if(d>maxd){dx*=maxd/d;dy*=maxd/d;d=maxd}if(d<8)d=8;
  const a=Math.acos(Math.max(-1,Math.min(1,(l1*l1+d*d-l2*l2)/(2*l1*d)))),base=Math.atan2(dy,dx),ang=base+side*a;return[ax+l1*Math.cos(ang),ay+l1*Math.sin(ang),ax+dx,ay+dy]}
 const seg=(x1,y1,x2,y2,w,c)=>`<path d="M${R2(x1)} ${R2(y1)}L${R2(x2)} ${R2(y2)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" fill="none"/>`;
 const H={f,amp,volt,ohm,effect,
 t(x,y,s,o={}){return`<text class="${o.c||'lab'}" x="${x}" y="${y}" ${o.a?`style="text-anchor:${o.a}"`:''}>${s}</text>`},
 /* cielo con sol/luna y nubes */
 sky(h=420){let s=`<rect x="0" y="0" width="1000" height="${h}" fill="url(#gsky)"/>`;
  s+=`<g class="sun"><circle cx="860" cy="90" r="120" fill="url(#sunG)"/><circle cx="860" cy="90" r="30" fill="#fff6b0"/></g>`;
  s+=`<g class="moon"><circle cx="860" cy="90" r="110" fill="url(#moonG)"/><circle cx="860" cy="90" r="26" fill="#eef4ff"/><circle cx="851" cy="84" r="5" fill="#c5d4ea"/><circle cx="870" cy="98" r="4" fill="#c5d4ea"/>${[[90,60],[210,40],[330,90],[470,30],[560,70],[690,45],[780,20],[960,140],[40,150],[640,130]].map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="1.6" fill="#fff" opacity=".8"/>`).join('')}</g>`;
  const cloud=(x,y,sc,op)=>`<g class="cloud" style="animation-delay:${-x/20}s"><g opacity="${op}" transform="translate(${x} ${y}) scale(${sc})"><ellipse cx="0" cy="0" rx="62" ry="20" fill="#fff"/><ellipse cx="-34" cy="-10" rx="32" ry="22" fill="#fff"/><ellipse cx="20" cy="-18" rx="38" ry="26" fill="#fff"/><ellipse cx="52" cy="-4" rx="26" ry="16" fill="#fff"/></g></g>`;
  s+=cloud(180,70,1,.8)+cloud(520,110,.8,.65)+cloud(780,50,.6,.6);return s},
 /* interior: pared con zócalo, piso y luz de ventana (sin cielo) */
 room(y=450,o={}){return`<rect x="0" y="0" width="1000" height="${y}" fill="${o.wall||'#d9d2c4'}"/>${o.tile?`<rect x="0" y="0" width="1000" height="${y}" fill="url(#tile)" opacity=".5"/>`:''}<rect x="0" y="0" width="1000" height="${y}" fill="url(#roomShade)"/><rect x="0" y="${y-22}" width="1000" height="22" fill="#000" opacity=".12"/><rect x="0" y="${y}" width="1000" height="${520-y}" fill="url(#woodP)"/><rect x="0" y="${y}" width="1000" height="16" fill="#000" opacity=".2" filter="url(#soft)"/>`},
 ground(y=420,type='grass'){const pat=type==='asph'?'asph':type==='tile'?'tile':'grass';return`<rect x="0" y="${y}" width="1000" height="${520-y}" fill="url(#${pat})"/><rect x="0" y="${y}" width="1000" height="14" fill="#000" opacity=".16" filter="url(#soft)"/><path d="M0 ${y}H1000" stroke="#000" stroke-opacity=".25" stroke-width="2"/>`},
 /* cable metálico con luz y sombra; flow = corriente circulando */
 cable(x1,y1,x2,y2,o={}){const sag=o.sag===undefined?14:o.sag,mx=(x1+x2)/2,my=(y1+y2)/2+sag,d=`M${x1} ${y1}Q${mx} ${my} ${x2} ${y2}`,w=o.w||5,c=o.color||'var(--cable)';
  let s=`<path d="${d}" fill="none" stroke="#000" stroke-opacity=".28" stroke-width="${w+3}" stroke-linecap="round" transform="translate(0 7)" filter="url(#soft)"/><path d="${d}" fill="none" stroke="#10151c" stroke-width="${w+2}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="1.6" stroke-linecap="round" transform="translate(0 -1.4)"/>`;
  if(o.flow)s+=`<path d="${d}" fill="none" stroke="#ffe27a" stroke-width="${w+5}" opacity=".3" filter="url(#glow)"/><path class="flowd" d="${d}"/>`;return s},
 insulator(x,y){return`<g transform="translate(${x} ${y})"><rect x="-3" y="0" width="6" height="8" fill="#555"/>${[0,1,2].map(i=>`<ellipse cx="0" cy="${12+i*7}" rx="${9-i}" ry="3.2" fill="#e8dcc0" stroke="#9c8b66" stroke-width="1"/>`).join('')}</g>`},
 pole(x,y,h,o={}){const w=18;let s=`<ellipse cx="${x+14}" cy="${y+h+2}" rx="40" ry="7" fill="#000" opacity=".28" filter="url(#soft)"/>`;
  s+=`<rect x="${x-w/2}" y="${y}" width="${w}" height="${h}" fill="${o.wood?'url(#woodP)':'url(#conc)'}" stroke="#000" stroke-opacity=".3"/><rect x="${x-w/2}" y="${y}" width="${w*.35}" height="${h}" fill="#fff" opacity=".12"/><rect x="${x+w*.2}" y="${y}" width="${w*.3}" height="${h}" fill="#000" opacity=".16"/>`;
  s+=`<rect x="${x-62}" y="${y+8}" width="124" height="10" rx="2" fill="${o.wood?'url(#woodP)':'url(#conc)'}" stroke="#000" stroke-opacity=".3"/><path d="M${x-62} ${y+18}L${x} ${y+44}L${x+62} ${y+18}" fill="none" stroke="var(--metal)" stroke-width="4"/>`;return s},
 bird(x,y,o={}){const s=o.s||1,fl=o.flip?-1:1,wing=o.wing;return`<g transform="translate(${x} ${y}) scale(${fl*s} ${s})"><ellipse cx="0" cy="18" rx="16" ry="3" fill="#000" opacity=".25" filter="url(#soft)"/><path d="M-6 2V16M6 2V16M-9 16h6M3 16h6" stroke="#8a5a2a" stroke-width="2.4" stroke-linecap="round"/><path d="M-22 -14l-24 -6l-2 8l24 8z" fill="#2c3a55"/><path d="M-20 -12l-18 -4M-20 -9l-20 0" stroke="#1d2840" stroke-width="1.4"/><ellipse cx="0" cy="-12" rx="23" ry="15" fill="url(#birdG)" stroke="#1d2840" stroke-width="1.5"/><ellipse cx="2" cy="-4" rx="14" ry="9" fill="#9fb0cf" opacity=".6"/><circle cx="19" cy="-24" r="10" fill="url(#birdG)" stroke="#1d2840" stroke-width="1.5"/><path d="M28 -25l11 3.5l-11 4z" fill="#f4a62a" stroke="#b3721a" stroke-width="1"/><circle cx="22" cy="-26" r="2.6" fill="#fff"/><circle cx="22.8" cy="-26" r="1.3" fill="#111"/>${wing?`<path d="M-4 -22Q${wing[0]/s*fl/2} ${wing[1]/s/2-10} ${wing[0]/s*fl} ${wing[1]/s}" stroke="#3a4a6c" stroke-width="12" stroke-linecap="round" fill="none"/>`:`<path d="M-10 -20q-14 8 6 22q10 -4 12 -16z" fill="#3a4a6c" stroke="#1d2840" stroke-width="1.2"/><path d="M-6 -12l-4 8M-1 -12l-4 10" stroke="#7d8fb4" stroke-width="1.2"/>`}</g>`},
 /* persona articulada con ropa */
 person(o={}){const s=o.s||1,sp=o.spread===undefined?16:o.spread,lh=o.lh||[-26,-92],rh=o.rh||[26,-92],bc=o.color;
  let g=`<g transform="translate(${o.x} ${o.y}) scale(${s})">`;
  if(o.puddle)g+=`<ellipse cx="0" cy="3" rx="${sp+54}" ry="9" fill="var(--water)" opacity=".8"/><ellipse cx="${-sp-10}" cy="1" rx="22" ry="3" fill="#fff" opacity=".35"/>`;
  else g+=`<ellipse cx="0" cy="4" rx="${sp+34}" ry="7" fill="#000" opacity=".28" filter="url(#soft)"/>`;
  const hips=[[-9,-88],[9,-88]],feet=[[-sp,0],[sp,0]];
  feet.forEach((fp,i)=>{const hp=hips[i],k=ik(hp[0],hp[1],fp[0],fp[1],46,46,i===0?1:-1);g+=seg(hp[0],hp[1],k[0],k[1],16,'url(#pantsG)')+seg(k[0],k[1],fp[0],fp[1]-4,13,'url(#pantsG)')});
  if(o.shoes!==null&&o.shoes!==undefined){const col=o.shoes==='goma'?'#1a1a1a':o.shoes==='zap'?'#f1f1f8':'#6b4a2a';feet.forEach(fp=>g+=`<path d="M${fp[0]-9} ${fp[1]-6}h18q6 0 8 7h-34q0-5 8-7z" fill="${col}" stroke="#000" stroke-opacity=".5" stroke-width="1.5"/><rect x="${fp[0]-17}" y="${fp[1]+(o.shoes==='goma'?3:1)}" width="34" height="${o.shoes==='goma'?5:3}" rx="2" fill="${o.shoes==='goma'?'#000':'#cfd3da'}"/>`)}
  else feet.forEach(fp=>g+=`<ellipse cx="${fp[0]}" cy="${fp[1]-2}" rx="11" ry="6" fill="url(#skinG)" stroke="#a5724f" stroke-width="1"/>`);
  g+=`<path d="M-24 -142Q0 -150 24 -142L19 -84Q0 -78 -19 -84Z" fill="url(#shirtG)" stroke="#183c80" stroke-width="1.6"/><path d="M-6 -142Q0 -134 6 -142" fill="url(#skinG)" stroke="#a5724f" stroke-width="1"/><path d="M-19 -84Q0 -78 19 -84L18 -78Q0 -72 -18 -78Z" fill="#1a2230"/>`;
  [[-1,lh],[1,rh]].forEach(([sd,hand])=>{const sh=[sd*23,-138],k=ik(sh[0],sh[1],hand[0],hand[1],42,42,sd>0?-1:1);g+=seg(sh[0],sh[1],k[0],k[1],14,'url(#shirtG)')+seg(k[0],k[1],k[2],k[3],10,'url(#skinG)')+`<circle cx="${k[2]}" cy="${k[3]}" r="7" fill="url(#skinG)" stroke="#a5724f" stroke-width="1"/>`});
  g+=`<rect x="-5" y="-150" width="10" height="9" fill="url(#skinG)"/><circle cx="0" cy="-162" r="17" fill="url(#skinG)" stroke="#a5724f" stroke-width="1.4"/><path d="M-17 -164Q-14 -184 0 -183Q16 -184 17 -164Q10 -172 0 -172Q-10 -172 -17 -164Z" fill="#3a2a1e"/><circle cx="-6" cy="-163" r="1.8" fill="#222"/><circle cx="6" cy="-163" r="1.8" fill="#222"/>`;
  g+=o.face==='✖'?`<path d="M-9 -157l6 3M9 -157l-6 3" stroke="#222" stroke-width="2"/><path d="M-6 -152q6 -5 12 0" stroke="#222" stroke-width="2" fill="none"/>`:`<path d="M-5 -154q5 4 10 0" stroke="#7a3a2a" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  if(o.glow&&o.glow.length>1){const d='M'+o.glow.map(p=>p[0]+' '+p[1]).join('L'),c=o.gc||'#ff6b6b';g+=`<path d="${d}" fill="none" stroke="${c}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" opacity=".5" class="pulse" filter="url(#glow2)"/><path d="${d}" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity=".9" class="flick"/><path class="flowd" d="${d}"/>`}
  return g+'</g>'},
 /* chispa y arco eléctrico con brillo */
 spark(x,y,s=1){return`<g class="sprk" transform="translate(${x} ${y}) scale(${s})" filter="url(#glow2)"><circle r="20" fill="#fff6a0" opacity=".35"/><path d="M0 -26L5 -8L20 -14L8 2L22 18L2 10L-6 28L-8 8L-24 6L-6 -4Z" fill="#fff3a0" stroke="#ffb02a" stroke-width="2"/></g>`},
 bolt(x1,y1,x2,y2,o={}){const n=o.n||9,seg2=[];let px=x1,py=y1;seg2.push([px,py]);for(let i=1;i<n;i++){const t=i/n,jx=((i*37)%23-11)*(o.j||1.6),cx=x1+(x2-x1)*t+jx,cy=y1+(y2-y1)*t;seg2.push([cx,cy])}seg2.push([x2,y2]);
  const d='M'+seg2.map(p=>R2(p[0])+' '+R2(p[1])).join('L');let s=`<g class="${o.noflick?'':'sprk'}"><path d="${d}" fill="none" stroke="#9fd0ff" stroke-width="${(o.w||8)+8}" opacity=".35" filter="url(#glow2)"/><path d="${d}" fill="none" stroke="#fff" stroke-width="${o.w||8}" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#e8f4ff" stroke-width="${(o.w||8)/2.6}" stroke-linejoin="round"/>`;
  if(o.branches!==false)[3,5,7].forEach((k,i)=>{const p=seg2[k];if(!p)return;const bx=p[0]+(i%2?1:-1)*(40+i*14),by=p[1]+50+i*12;s+=`<path d="M${p[0]} ${p[1]}L${(p[0]+bx)/2+8} ${(p[1]+by)/2-6}L${bx} ${by}" fill="none" stroke="#fff" stroke-width="3" opacity=".85" filter="url(#glow)"/>`});
  return s+'</g>'},
 rain(n=60){let s='<g opacity=".8">';for(let i=0;i<n;i++){const x=(i*127)%1040,y=(i*73)%420,dl=-(i%10)*.05;s+=`<line class="rain" style="animation-delay:${dl}s" x1="${x}" y1="${y}" x2="${x-8}" y2="${y+24}"/>`}return s+'</g>'},
 water(x,y,w,h,o={}){let s=`<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r||0}" fill="url(#waterG)"/>`;
  const rows=Math.max(1,Math.floor(h/26));for(let i=0;i<rows;i++)s+=`<path class="wv2" style="animation-delay:${-i*.6}s" d="M${x} ${y+8+i*26}q${w/16} -8 ${w/8} 0t${w/8} 0t${w/8} 0t${w/8} 0t${w/8} 0t${w/8} 0t${w/8} 0t${w/8} 0" fill="none" stroke="#fff" stroke-opacity="${.5-i*.07}" stroke-width="2"/>`;
  s+=`<rect x="${x}" y="${y}" width="${w}" height="${Math.min(14,h)}" fill="#fff" opacity=".2"/></g>`;return s},
 fire(x,y,s=1){let g=`<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="2" rx="38" ry="8" fill="#ff7a1a" opacity=".35" filter="url(#glow)"/>`;
  [[-18,0,.8],[0,0,1.2],[18,0,.9],[-8,-8,.7],[10,-6,.75]].forEach((p,i)=>{const k=p[2],x0=p[0];g+=`<path class="flame" style="animation-delay:${-i*.17}s;transform-origin:${x0}px 0" d="M${x0} 0C${x0-22*k} -26 ${x0-6*k} -44 ${x0} ${-70*k}C${x0+6*k} -44 ${x0+22*k} -26 ${x0} 0Z" fill="url(#flameG)"/>`});
  return g+`</g>`},
 smoke(x,y,n=4){let s='';for(let i=0;i<n;i++)s+=`<circle class="smoke" style="animation-delay:${-i*.9}s" cx="${x+(i%2?10:-10)}" cy="${y}" r="${14+i*3}" fill="#8a8f98" opacity=".5"/>`;return s},
 bubble(x,y,w,h,txt,c='var(--p2)'){return`<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${c}" stroke="var(--line)" opacity=".95"/><text class="lab2" x="${x+w/2}" y="${y+h/2+5}" style="text-anchor:middle;stroke:none">${txt}</text></g>`},
 arrow(x1,y1,x2,y2,c='var(--ink)'){const a=Math.atan2(y2-y1,x2-x1),hx=x2-12*Math.cos(a-.4),hy=y2-12*Math.sin(a-.4),kx=x2-12*Math.cos(a+.4),ky=y2-12*Math.sin(a+.4);return`<path d="M${x1} ${y1}L${x2} ${y2}M${hx} ${hy}L${x2} ${y2}L${kx} ${ky}" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round"/>`}
 };
 return H;
};
