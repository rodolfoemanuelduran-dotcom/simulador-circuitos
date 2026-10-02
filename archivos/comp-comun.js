/* Ayudas compartidas por los componentes nuevos (guardamotor, pulsadores, temporizador). */
window.CPH=(function(){
const cl=(v,a,b)=>Math.max(a,Math.min(b,v));
const fm=(n,k)=>Number(n).toFixed(k).replace('.',',');
const rnd=i=>{const x=Math.sin(i*12.9898)*43758.5453;return x-Math.floor(x)};
const stroke4='paint-order:stroke;stroke:var(--stg2);stroke-width:4px';
function g(S,layer,part,body){if(layer&&!S.ui.capas.has(layer))return'';const on=S.ui.hl.has(part)||S.ui.sel===part;return`<g data-p="${part}"${on?' class="hl"':''}>${body}</g>`}
function screw(x,y,r,rot){return`<g transform="translate(${x} ${y}) rotate(${rot||0})"><circle r="${r}" fill="url(#cMeV)" stroke="#3a4450" stroke-width="1.4"/><circle r="${r*.78}" fill="none" stroke="#fff" stroke-opacity=".5"/><path d="M${-r*.62} 0H${r*.62}M0 ${-r*.62}V${r*.62}" stroke="#2c3540" stroke-width="${Math.max(2,r*.22)}" stroke-linecap="round"/></g>`}
function glow(cx,cy,r,col,op){return`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${col}" opacity="${op}" filter="url(#fgl)"/>`}
function lbl(x,y,tx,side,ax,ay){const anc=side==='l'?'end':'start',xe=side==='l'?x+6:x-6;return`<g pointer-events="none"><path d="M${xe} ${y-4}L${ax} ${ay}" stroke="#ffd65a" stroke-width="1.6" fill="none"/><circle cx="${ax}" cy="${ay}" r="3.4" fill="#ffd65a" stroke="#000" stroke-opacity=".5"/><text x="${x}" y="${y}" class="lab s" text-anchor="${anc}" style="${stroke4}">${tx}</text></g>`}
function tag(x,y,tx,cls){return`<text x="${x}" y="${y}" class="lab c ${cls||''}" pointer-events="none" style="${stroke4}">${tx}</text>`}
function title(tx){return`<text x="24" y="26" class="lab t" pointer-events="none">${tx}</text>`}
function spring(x,y1,y2,w,n,col){const L=y2-y1;if(L<2)return'';const pts=[],m=n*10;for(let i=0;i<=m;i++){const k=i/m,ph=k*n*2*Math.PI;pts.push(`${(x+Math.sin(ph)*w/2).toFixed(1)},${(y1+L*k).toFixed(1)}`)}const p='M'+pts.join('L');return`<path d="${p}" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="5.5" stroke-linecap="round" transform="translate(2 2)"/><path d="${p}" fill="none" stroke="${col||'#aeb9c5'}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="${p}" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1.2" stroke-linecap="round" transform="translate(-.8 -.8)"/>`}
function sparks(cx,cy,t,k){let s='';for(let i=0;i<9;i++){const a=rnd(i+k*7+Math.floor(t*40))*6.283,l=8+rnd(i*3+Math.floor(t*40))*20;s+=`<path d="M${cx} ${cy}l${(Math.cos(a)*l).toFixed(1)} ${(Math.sin(a)*l).toFixed(1)}" stroke="${i%2?'#fff3b0':'#ffb347'}" stroke-width="2.4" stroke-linecap="round"/>`}return glow(cx,cy,16,'#ffd65a',.9)+s}
const heatCol=x=>{const r=cl(x,0,1);return`rgb(${Math.round(200+55*r)},${Math.round(112-70*r)},${Math.round(61-40*r)})`};
function strip(px,yb,yt,dx){const n=14,A=[],B=[];for(let i=0;i<=n;i++){const k=i/n,y=yb-(yb-yt)*k,x=px+dx*k*k;A.push([x-5,y]);B.push([x+5,y])}const pl=a=>'M'+a.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join('L');return`<path d="${pl(A)}" fill="none" stroke="url(#cBrass)" stroke-width="9" transform="translate(-4.5 0)"/><path d="${pl(B)}" fill="none" stroke="url(#cSteel)" stroke-width="9" transform="translate(4.5 0)"/>`}
const DEFS=`<defs>
<linearGradient id="cPl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#454c55"/><stop offset=".08" stop-color="#2d3238"/><stop offset=".9" stop-color="#1b1f24"/><stop offset="1" stop-color="#101317"/></linearGradient>
<linearGradient id="cPlH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".25" stop-color="#fff" stop-opacity=".02"/><stop offset=".8" stop-color="#000" stop-opacity=".1"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient>
<linearGradient id="cPlL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a828c"/><stop offset=".1" stop-color="#5b636d"/><stop offset="1" stop-color="#383e46"/></linearGradient>
<linearGradient id="cMe" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8a95a2"/><stop offset=".3" stop-color="#f4f7fa"/><stop offset=".6" stop-color="#b5bec8"/><stop offset="1" stop-color="#6e7a87"/></linearGradient>
<linearGradient id="cMeV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f7fa"/><stop offset=".5" stop-color="#a8b3bf"/><stop offset="1" stop-color="#6b7683"/></linearGradient>
<linearGradient id="cCu" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#a8582c"/><stop offset=".35" stop-color="#f2a770"/><stop offset=".7" stop-color="#c8703d"/><stop offset="1" stop-color="#8d4421"/></linearGradient>
<linearGradient id="cCuV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2a770"/><stop offset=".5" stop-color="#c8703d"/><stop offset="1" stop-color="#8d4421"/></linearGradient>
<linearGradient id="cCuH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d1451f"/><stop offset=".4" stop-color="#ffb066"/><stop offset=".7" stop-color="#ee6a2a"/><stop offset="1" stop-color="#b52e12"/></linearGradient>
<linearGradient id="cAg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#aab4bf"/></linearGradient>
<linearGradient id="cBrass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8c6a1c"/><stop offset=".5" stop-color="#f1cf6a"/><stop offset="1" stop-color="#a47d22"/></linearGradient>
<linearGradient id="cSteel" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6c7886"/><stop offset=".5" stop-color="#dfe6ee"/><stop offset="1" stop-color="#7b8795"/></linearGradient>
<linearGradient id="cFe" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9aa6b5"/><stop offset=".5" stop-color="#6d7988"/><stop offset="1" stop-color="#4c5766"/></linearGradient>
<linearGradient id="cBob" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f1e5c4"/><stop offset="1" stop-color="#b8a574"/></linearGradient>
<linearGradient id="cPcb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1f7a4a"/><stop offset="1" stop-color="#0f4d2e"/></linearGradient>
<radialGradient id="cKnob" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#6a737e"/><stop offset=".6" stop-color="#2d343c"/><stop offset="1" stop-color="#15191e"/></radialGradient>
<radialGradient id="cRed" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="#ff8d7e"/><stop offset=".5" stop-color="#d8301f"/><stop offset="1" stop-color="#7a120a"/></radialGradient>
<radialGradient id="cGreen" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="#9cf5b8"/><stop offset=".5" stop-color="#1f9d52"/><stop offset="1" stop-color="#0d5a2c"/></radialGradient>
<radialGradient id="cBlue" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="#9cc8ff"/><stop offset=".5" stop-color="#2c6fb5"/><stop offset="1" stop-color="#143a66"/></radialGradient>
<radialGradient id="cYel" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="#fff2a0"/><stop offset=".5" stop-color="#e5b81a"/><stop offset="1" stop-color="#8a6a08"/></radialGradient>
<pattern id="pWind" width="5" height="5" patternUnits="userSpaceOnUse"><rect width="5" height="5" fill="#c8703d"/><path d="M0 2.5H5" stroke="#6b3317" stroke-width="1.3"/><path d="M0 1H5" stroke="#f6b684" stroke-opacity=".55" stroke-width=".8"/></pattern>
<pattern id="pLam" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="4" fill="#8794a3"/><path d="M0 .5H4" stroke="#2f3946" stroke-opacity=".65" stroke-width=".9"/></pattern>
<pattern id="pRib" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="none"/><path d="M0 13H14" stroke="#000" stroke-opacity=".25" stroke-width="2"/><path d="M0 12H14" stroke="#fff" stroke-opacity=".06" stroke-width="1"/></pattern>
<filter id="fsh" x="-20%" y="-20%" width="140%" height="150%"><feGaussianBlur stdDeviation="6"/></filter>
<filter id="fgl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter>
</defs>`;
return{cl,fm,rnd,g,screw,glow,lbl,tag,title,spring,sparks,heatCol,strip,DEFS,stroke4};
})();
