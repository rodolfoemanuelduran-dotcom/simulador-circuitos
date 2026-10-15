/* Piezas de dibujo compartidas por la llave termomagnética y el disyuntor diferencial (componente.html).
   Usan los degradados y ayudas de comp-comun.js (CPH). Todo el dibujo es un esquema simplificado: la forma exacta cambia de un fabricante a otro. */
window.PRO=(function(){
const H=window.CPH,cl=H.cl,g=H.g,glow=H.glow,screw=H.screw;
const has=(S,k)=>S.ui.capas.has(k);
const alfa=S=>S.inter?.07:1-S.ui.T;            /* opacidad de la carcasa: 1 − transparencia (en la vista interior casi invisible) */
const rot=(a,cx,cy)=>`rotate(${(+a).toFixed(2)} ${cx} ${cy})`;
const f1=n=>(+n).toFixed(1);

/* conductor de cobre con brillo */
const cu=(d,w)=>`<path d="${d}" fill="none" stroke="#5a2a12" stroke-width="${w+3}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#d98d57" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#ffd7b0" stroke-opacity=".5" stroke-width="${Math.max(1,w/4)}" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 ${-w/4})"/>`;

/* resorte entre dos puntos cualesquiera */
function springXY(x1,y1,x2,y2,w,n,col){const L=Math.hypot(x2-x1,y2-y1);if(L<3)return'';const ang=Math.atan2(y2-y1,x2-x1)*180/Math.PI-90;return`<g transform="translate(${f1(x1)} ${f1(y1)}) rotate(${ang.toFixed(2)})">${H.spring(0,0,L,w,n,col)}</g>`}

/* barra metálica entre dos puntos (grosor th) */
function barra(x1,y1,x2,y2,th,fill,stroke){const L=Math.hypot(x2-x1,y2-y1),a=Math.atan2(y2-y1,x2-x1)*180/Math.PI;return`<g transform="translate(${f1(x1)} ${f1(y1)}) rotate(${a.toFixed(2)})"><rect x="${-th/2}" y="${-th/2}" width="${(L+th).toFixed(1)}" height="${th}" rx="${th/2}" fill="${fill||'url(#cPlL)'}" stroke="${stroke||'#111'}" stroke-width="1.2"/><rect x="${-th/2+2}" y="${-th/2+1.5}" width="${(L+th-4).toFixed(1)}" height="${Math.max(1.5,th/4).toFixed(1)}" rx="1" fill="#fff" opacity=".28"/></g>`}

/* codo de un eslabón articulado de dos barras (largos l1 y l2); lado = +1 o −1 */
function codo(A,B,l1,l2,lado){const dx=B[0]-A[0],dy=B[1]-A[1],d=Math.max(1e-6,Math.hypot(dx,dy)),dd=Math.min(d,l1+l2-.01),a=(l1*l1-l2*l2+dd*dd)/(2*dd),h=Math.sqrt(Math.max(0,l1*l1-a*a)),ux=dx/d,uy=dy/d;return[A[0]+a*ux+(lado||1)*(-uy)*h,A[1]+a*uy+(lado||1)*ux*h]}
function pasador(x,y,r){return`<circle cx="${f1(x)}" cy="${f1(y)}" r="${r}" fill="url(#cMeV)" stroke="#333" stroke-width="1.2"/><circle cx="${f1(x)}" cy="${f1(y)}" r="${(r*.35).toFixed(1)}" fill="#222"/>`}

/* carcasa de plástico (rectángulo redondeado); opaca según la transparencia elegida */
function carcasa(S,x,y,w,h,r){const a=alfa(S);
 if(S.inter)return`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="none" stroke="#8fa1b4" stroke-width="3" stroke-dasharray="10 6"/>`;
 return`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#cPl)" stroke="#0b0e11" stroke-width="2" opacity="${a.toFixed(3)}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#cPlH)" opacity="${a.toFixed(3)}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#pRib)" opacity="${(.35*a).toFixed(3)}"/>`}

/* bornera con tornillo y el cable (con su aislante) que entra por arriba o por abajo.
   (x,y) = esquina del bloque; dir = 'up' | 'down'; col = color del aislante; hot = 0..1 calentamiento del borne */
function bornera(x,y,dir,col,hot,rotTornillo){const w=72,h=64,cx=x+w/2,largo=52;
 const cab=dir==='up'?`<rect x="${cx-12}" y="${y-largo+8}" width="24" height="${largo}" rx="5" fill="${col}" stroke="#000" stroke-width="1.5"/><rect x="${cx-8}" y="${y-largo+10}" width="6" height="${largo-6}" rx="3" fill="#fff" opacity=".28"/><rect x="${cx-7}" y="${y-largo+4}" width="14" height="10" rx="3" fill="#d98d57"/>`
  :`<rect x="${cx-12}" y="${y+h-8}" width="24" height="${largo}" rx="5" fill="${col}" stroke="#000" stroke-width="1.5"/><rect x="${cx-8}" y="${y+h-6}" width="6" height="${largo-6}" rx="3" fill="#fff" opacity=".28"/><rect x="${cx-7}" y="${y+h+largo-14}" width="14" height="10" rx="3" fill="#d98d57"/>`;
 return cab+`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" fill="url(#cMe)" stroke="#3a4450" stroke-width="1.6"/><rect x="${x+8}" y="${y+14}" width="${w-16}" height="${h-28}" rx="4" fill="#10161d"/>`+screw(cx,dir==='up'?y+h-16:y+16,13,rotTornillo||0)+(hot>0?glow(cx,y+h/2,48,'#ff6a1f',cl(hot,0,.85)):'')}

/* contacto de plata sobre un portacontacto de cobre */
const pastilla=(x,y,w)=>`<rect x="${x}" y="${y}" width="${w}" height="6" rx="2" fill="url(#cAg)" stroke="#6b7683" stroke-width="1"/>`;

/* cámara de extinción del arco: placas de acero separadas. p = 0..1 avance del arco hacia el fondo */
function placas(x0,y0,n,sep,alto,p,t,lit){let s=`<rect x="${x0-10}" y="${y0-8}" width="${(n-1)*sep+24}" height="${alto+16}" rx="6" fill="var(--cav)" stroke="#8fa1b4" stroke-width="1.6" stroke-dasharray="6 4" opacity=".92"/>`;
 for(let i=0;i<n;i++)s+=`<rect x="${x0+i*sep}" y="${y0}" width="5" height="${alto}" rx="1" fill="url(#cSteel)" stroke="#333" stroke-width=".8"/>`;
 if(lit>0){const k=Math.max(1,Math.round(cl(p,0,1)*(n-1)));for(let i=0;i<k;i++){const y=y0+alto*(.25+.5*((i*37)%10)/10);const fl=.55+.45*Math.sin(t*30+i*2.1);s+=`<path d="M${x0+i*sep+5} ${y}H${x0+(i+1)*sep}" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="${(lit*fl).toFixed(2)}"/><path d="M${x0+i*sep+5} ${y}H${x0+(i+1)*sep}" stroke="#7fb7ff" stroke-width="8" stroke-linecap="round" opacity="${(.35*lit*fl).toFixed(2)}"/>`}}
 return s}

/* arco entre dos puntos: línea quebrada brillante (a = 0..1 intensidad) */
function arco(A,B,t,a){if(a<=0)return'';const n=7;let pts=[];for(let i=0;i<=n;i++){const k=i/n,j=(i===0||i===n)?0:Math.sin(t*61+i*4.7)*7*a;pts.push([A[0]+(B[0]-A[0])*k+j*.7,A[1]+(B[1]-A[1])*k+j])}
 const d='M'+pts.map(p=>p[0].toFixed(1)+' '+p[1].toFixed(1)).join('L');
 return`<path d="${d}" fill="none" stroke="#7fb7ff" stroke-width="10" stroke-opacity="${(.5*a).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#fff" stroke-width="3.6" stroke-opacity="${Math.min(1,a+.2).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/>`+glow((A[0]+B[0])/2,(A[1]+B[1])/2,26,'#ffd65a',.8*a)}

/* humo oscuro (llave destruida) */
function humo(x,y,t,k){let s='';for(let i=0;i<6;i++){const ph=(t*.5+i/6)%1;s+=`<circle cx="${(x+Math.sin(i*2.3+t)*14*ph).toFixed(1)}" cy="${(y-ph*110).toFixed(1)}" r="${(8+ph*22).toFixed(1)}" fill="#222" opacity="${(.5*(1-ph)*k).toFixed(2)}"/>`}return s}

/* indicador de color en la ventana: rojo = contactos cerrados, verde = abiertos, naranja = disparó */
const colVentana=(on,trip)=>trip?'#f08a1f':on?'#d8301f':'#1f9d52';

return{cl,cu,rot,springXY,barra,codo,pasador,carcasa,bornera,pastilla,placas,arco,humo,colVentana,alfa,has,f1};
})();
