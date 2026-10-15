/* Calculadora y problemas de dimensionamiento para la llave termomagnética y el disyuntor diferencial (componente.html).
   Cada problema se genera con una semilla (variantes distintas cada vez). Ver la resolución queda registrado: el problema ya no cuenta como resuelto por el alumno.
   Los valores de cables y de poder de corte son ejemplos didácticos; para un proyecto real se usan las tablas vigentes (AEA 90364 / IEC 60364). */
var CALC=(function(){
const STD=[6,10,16,20,25,32,40,50,63];                 /* corrientes asignadas habituales de termomagnéticas (A) */
const STDR=[16,25,40,63,80,100];                       /* corrientes asignadas habituales de diferenciales (A) */
const CABLES=[[1.5,15],[2.5,21],[4,28],[6,36],[10,50]];/* sección (mm²) → corriente admisible de ejemplo (A) */
const PC=[3,4.5,6,10];                                 /* poder de corte normalizado (kA) */
const fm=(n,k)=>Number(n).toFixed(k).replace('.',',');
const miles=n=>String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,' ');
const esc=s=>String(s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
function rng(seed){let a=(seed>>>0)||1;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const pick=(r,a)=>a[Math.floor(r()*a.length)];
const shuf=(r,a)=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const nextStd=(x,L)=>L.find(v=>v>=x-1e-9);
const lejos=(x,L,d)=>L.every(v=>Math.abs(x-v)>d);   /* evita valores pegados a un escalón normalizado (el redondeo del alumno podría cambiar la respuesta) */
const SQ3=Math.sqrt(3);
/* corriente de proyecto: monofásica P/(U·cosφ) · trifásica P/(√3·U·cosφ) */
const corriente=(P,U,cos,fases)=>fases===3?P/(SQ3*U*cos):P/(U*cos);

/* ================= termomagnética ================= */
const CARGAS=[
 {n:'Termotanque eléctrico',f:1,cos:1,P:r=>100*(15+Math.floor(r()*11))},
 {n:'Calefactor eléctrico',f:1,cos:1,P:r=>200*(5+Math.floor(r()*8))},
 {n:'Horno eléctrico',f:1,cos:1,P:r=>100*(20+Math.floor(r()*16))},
 {n:'Aire acondicionado split',f:1,cos:.85,P:r=>200*(6+Math.floor(r()*8))},
 {n:'Bomba de agua monofásica',f:1,cos:.8,P:r=>50*(15+Math.floor(r()*30))},
 {n:'Motor monofásico',f:1,cos:.8,P:r=>100*(10+Math.floor(r()*13))},
 {n:'Motor trifásico',f:3,cos:[.8,.85,.88],P:r=>500*(6+Math.floor(r()*17))},
 {n:'Horno trifásico de resistencias',f:3,cos:1,P:r=>1000*(6+Math.floor(r()*10))}];
function gIB(r){
 for(let k=0;k<200;k++){
  let c=pick(r,CARGAS),P=c.P(r),cos=Array.isArray(c.cos)?pick(r,c.cos):c.cos,U=c.f===3?380:220,txt;
  if(k===0&&r()<.2){const n=10+Math.floor(r()*21),w=8+Math.floor(r()*8);c={n:'Iluminación LED',f:1,cos:.9};P=n*w;cos=.9;U=220;txt=`<b>${n} lámparas LED de ${w} W</b> (potencia total ${miles(P)} W, cos φ = ${fm(cos,2)}), conectadas a 220 V monofásicos.`}
  const IB=corriente(P,U,cos,c.f);if(IB<.8||IB>40||!lejos(IB,STD,.25))continue;
  const In=nextStd(IB,STD),ix=STD.indexOf(In),op=STD.slice(Math.max(0,Math.min(ix-1,STD.length-4)),Math.max(0,Math.min(ix-1,STD.length-4))+4),ok=op.indexOf(In);
  txt=txt||`<b>${c.n}</b> de <b>${miles(P)} W</b> (cos φ = ${fm(cos,2)}), conectado a ${c.f===3?'<b>380 V trifásicos</b> (tensión de línea)':'<b>220 V monofásicos</b>'}.`;
  return{kind:'ib',datos:{P,U,cos,f:c.f},tit:'Corriente de proyecto y corriente asignada',
   enun:`${txt}<br>Calculá la <b>corriente de proyecto I<sub>B</sub></b> y elegí la <b>corriente asignada In</b> de la llave termomagnética que la protege (la menor normalizada que no sea inferior a I<sub>B</sub>).`,
   campos:[{k:'ib',t:'num',l:'Corriente de proyecto I_B',u:'A',ok:IB,tol:.03},{k:'in',t:'opt',l:'Corriente asignada In',o:op.map(v=>v+' A'),ok}],
   pista:c.f===3?'Trifásico: I = P / (√3 · U · cos φ).  Monofásico: I = P / (U · cos φ).':'Monofásico: I = P / (U · cos φ). La llave debe tener In ≥ I_B.',
   pasos:[c.f===3?`I<sub>B</sub> = P / (√3 · U · cos φ) = ${miles(P)} / (1,732 · 380 · ${fm(cos,2)})`:`I<sub>B</sub> = P / (U · cos φ) = ${miles(P)} / (220 · ${fm(cos,2)})`,`I<sub>B</sub> = <b>${fm(IB,2)} A</b>`,`Valores normalizados: ${STD.join(' · ')} A. La menor que cumple In ≥ I<sub>B</sub> es <b>${In} A</b>.`]}}
 return null}
function gCable(r){
 for(let k=0;k<200;k++){
  const IB=Math.round((3+r()*27)*10)/10;if(!lejos(IB,STD,.25))continue;
  const In=nextStd(IB,STD),sec=CABLES.find(c=>c[1]>=In);if(!sec)continue;
  const ix=STD.indexOf(In),op=STD.slice(Math.max(0,Math.min(ix-1,STD.length-4)),Math.max(0,Math.min(ix-1,STD.length-4))+4);
  return{kind:'cable',datos:{IB},tit:'Coordinación llave–cable',
   enun:`Un circuito tiene una corriente de proyecto <b>I<sub>B</sub> = ${fm(IB,1)} A</b>. El cable irá en cañería embutida (valores de ejemplo de corriente admisible I<sub>Z</sub>):<br><span class="note" style="margin:4px 0 0;display:block">${CABLES.map(c=>fm(c[0],1).replace(',0','')+' mm² → '+c[1]+' A').join(' · ')}</span>Elegí la <b>In</b> de la termomagnética y la <b>sección mínima</b> del cable. Regla: <b>I<sub>B</sub> ≤ In ≤ I<sub>Z</sub></b>.`,
   campos:[{k:'in',t:'opt',l:'Corriente asignada In',o:op.map(v=>v+' A'),ok:op.indexOf(In)},{k:'sec',t:'opt',l:'Sección mínima del cable',o:CABLES.map(c=>fm(c[0],1).replace(',0','')+' mm²'),ok:CABLES.indexOf(sec)}],
   pista:'Primero la In (la menor normalizada ≥ I_B). Después el cable más fino cuya I_Z sea ≥ In: así el cable nunca pasa más corriente que la que aguanta antes de que dispare la llave.',
   pasos:[`In: la menor normalizada ≥ ${fm(IB,1)} A → <b>${In} A</b>.`,`Cable: el más fino con I<sub>Z</sub> ≥ ${In} A → <b>${fm(sec[0],1).replace(',0','')} mm²</b> (admite ${sec[1]} A).`,`Comprobación: ${fm(IB,1)} ≤ ${In} ≤ ${sec[1]} ✔. Con In ≤ I<sub>Z</sub> la llave dispara antes de que el cable se sobrecaliente.`]}}
 return null}
const ESC_CURVA=[
 ['B','Un circuito de iluminación con lámparas incandescentes y halógenas (cargas resistivas, casi sin pico de arranque).'],
 ['B','Una estufa de cuarzo (resistencia pura) alimentada por un cable largo.'],
 ['B','Un circuito de calefacción por resistencias, sin motores.'],
 ['C','Un circuito de tomacorrientes de uso general donde se conectan heladera, aire acondicionado y herramientas.'],
 ['C','Una bomba de agua monofásica pequeña, con arranque moderado.'],
 ['C','Un circuito con varias fuentes de LED y balastos, que toman un pico breve al encender.'],
 ['D','El primario de un transformador de potencia que se energiza con un pico de corriente muy elevado.'],
 ['D','Una máquina de soldar por arco, con picos de corriente fuertes.'],
 ['D','Un motor grande con arranque pesado (compresor, trituradora) arrancado en forma directa.']];
function gCurva(r){const [c,t]=pick(r,ESC_CURVA);
 return{kind:'curva',datos:{c,t},tit:'Curva de disparo (B, C o D)',
  enun:`¿Qué curva de disparo magnético conviene para: <b>${t}</b>`,
  campos:[{k:'cv',t:'opt',l:'Curva',o:['B (3 a 5 × In)','C (5 a 10 × In)','D (10 a 20 × In)'],ok:'BCD'.indexOf(c)}],
  pista:'Cuanto mayor es el pico de corriente al conectar, más alto debe ser el umbral magnético para que la llave no dispare sin motivo.',
  pasos:[`Curvas (IEC 60898-1): <b>B</b> dispara entre 3 y 5 × In · <b>C</b> entre 5 y 10 × In · <b>D</b> entre 10 y 20 × In.`,`Cargas resistivas o sin pico → <b>B</b>. Cargas generales con arranque moderado → <b>C</b>. Picos muy grandes (transformadores, soldadoras, motores pesados) → <b>D</b>.`,`Respuesta: curva <b>${c}</b>. (Criterio práctico general: el fabricante o el proyecto pueden indicar otra.)`]}}
function gPC(r){
 for(let k=0;k<100;k++){const Icc=pick(r,[1.2,1.8,2.4,3.5,3.9,4.1,5.2,5.6,6.5,8,9.3]);if(!lejos(Icc,PC,.25))continue;const ok=PC.find(v=>v>=Icc);
  return{kind:'pc',datos:{Icc},tit:'Poder de corte',
   enun:`En el lugar del tablero donde se instalará la llave, la <b>corriente de cortocircuito presunta</b> vale <b>${fm(Icc,1)} kA</b>. ¿Qué <b>poder de corte</b> normalizado mínimo debe tener?`,
   campos:[{k:'pc',t:'opt',l:'Poder de corte mínimo',o:PC.map(v=>fm(v,1).replace(',0','')+' kA'),ok:PC.indexOf(ok)}],
   pista:'El poder de corte es la mayor corriente de cortocircuito que la llave puede interrumpir sin dañarse. Tiene que ser mayor o igual que la corriente de cortocircuito presunta del lugar.',
   pasos:[`Condición: poder de corte ≥ I<sub>cc</sub> presunta = ${fm(Icc,1)} kA.`,`Valores normalizados: ${PC.map(v=>fm(v,1).replace(',0','')).join(' · ')} kA.`,`El menor que cumple es <b>${fm(ok,1).replace(',0','')} kA</b>. Si fuera menor, el arco no se apagaría y la llave podría explotar.`]}}
 return null}
const ESC_POLOS=[
 ['2P','Una carga monofásica de 220 V en una vivienda (fase y neutro). Se quiere cortar fase y neutro.'],
 ['2P','Un tomacorriente de uso especial de 220 V con fase y neutro.'],
 ['3P','Un motor trifásico de 380 V, sin neutro.'],
 ['3P','Una bomba trifásica de 380 V conectada solo con las tres fases.'],
 ['4P','Un tablero trifásico con cargas monofásicas y trifásicas, donde se quiere cortar las tres fases y el neutro.']];
function gPolos(r){const [c,t]=pick(r,ESC_POLOS);
 return{kind:'polos',datos:{c,t},tit:'Cantidad de polos',
  enun:`¿Cuántos polos debe tener la llave para: <b>${t}</b>`,
  campos:[{k:'po',t:'opt',l:'Polos',o:['1P (unipolar)','2P (bipolar)','3P (tripolar)','4P (tetrapolar)'],ok:['1P','2P','3P','4P'].indexOf(c)}],
  pista:'Contá los conductores activos que querés cortar: fases y, si corresponde, el neutro. La tierra (PE) nunca se corta.',
  pasos:[`Conductores a cortar en este caso: ${c==='2P'?'1 fase + neutro = 2':c==='3P'?'3 fases = 3':'3 fases + neutro = 4'}.`,`La tierra de protección (PE) no pasa por la llave.`,`Respuesta: <b>${c}</b>.`]}}

/* ================= disyuntor diferencial ================= */
const ESC_SENS=[
 [30,'Los tomacorrientes de un baño y de la cocina, para proteger a las personas.'],
 [30,'El circuito de la bomba de una pileta de natación.'],
 [30,'Los tomacorrientes de un taller donde se usan herramientas manuales.'],
 [300,'La protección general de un edificio contra incendios por fugas a tierra, instalada aguas arriba de los diferenciales de 30 mA (debe ser selectiva).'],
 [300,'Un tablero seccional donde se quiere evitar incendios por pérdidas, sin protección de personas (esa la dan los de 30 mA de los circuitos).']];
function gSens(r){const [s,t]=pick(r,ESC_SENS);
 return{kind:'sens',datos:{s,t},tit:'Sensibilidad (IΔn)',
  enun:`¿Qué <b>sensibilidad IΔn</b> corresponde al diferencial que protege: <b>${t}</b>`,
  campos:[{k:'s',t:'opt',l:'Sensibilidad IΔn',o:['10 mA','30 mA','100 mA','300 mA'],ok:[10,30,100,300].indexOf(s)}],
  pista:'Para proteger a las personas contra el contacto indirecto se usa 30 mA. Los de 300 mA protegen la instalación contra incendio y suelen ser selectivos (tipo S).',
  pasos:[`<b>30 mA</b>: protección de personas (corriente que el cuerpo tolera si el corte es rápido).`,`<b>300 mA</b>: protección contra incendio y, con retardo (tipo S), selectividad aguas arriba.`,`Respuesta: <b>${s} mA</b>.`]}}
function gIn(r){const X=pick(r,[20,25,32,40,50]),ok=STDR.find(v=>v>=X);
 return{kind:'in',datos:{X},tit:'Corriente asignada del diferencial',
  enun:`Un tablero se protege con una <b>termomagnética general de ${X} A</b>. Aguas abajo se instalará un <b>disyuntor diferencial</b>. ¿Qué <b>corriente asignada In</b> mínima debe tener? (valores normalizados: ${STDR.join(' · ')} A)`,
  campos:[{k:'in',t:'opt',l:'In del diferencial',o:STDR.slice(0,5).map(v=>v+' A'),ok:STDR.slice(0,5).indexOf(ok)}],
  pista:'El diferencial no protege contra sobrecargas: lo cuida la termomagnética de aguas arriba. Por eso su In no puede ser menor que la de esa llave.',
  pasos:[`El diferencial no tiene protección de sobrecarga propia; la da la termomagnética (${X} A).`,`Condición: In del diferencial ≥ ${X} A.`,`La menor normalizada es <b>${ok} A</b>.`]}}
const ESC_TIPO=[
 ['AC','Un circuito de lámparas incandescentes y estufas de resistencia (cargas puramente resistivas).'],
 ['A','Tomacorrientes donde se conectan lavarropas con electrónica, cargadores y fuentes de LED.'],
 ['A','Un circuito con computadoras y televisores (fuentes conmutadas).'],
 ['B','Un variador de frecuencia trifásico que alimenta un motor.'],
 ['B','Un cargador trifásico de vehículo eléctrico con rectificador.']];
function gTipo(r){const [c,t]=pick(r,ESC_TIPO);
 return{kind:'tipo',datos:{c,t},tit:'Tipo de diferencial (AC, A o B)',
  enun:`¿Qué <b>tipo</b> de diferencial corresponde como mínimo para: <b>${t}</b>`,
  campos:[{k:'tp',t:'opt',l:'Tipo',o:['AC (detecta fugas alternas)','A (alternas y continuas pulsantes)','B (también continuas lisas)'],ok:['AC','A','B'].indexOf(c)}],
  pista:'Los aparatos con electrónica pueden producir fugas con componente continua, que el tipo AC no siempre detecta.',
  pasos:[`<b>AC</b>: sólo fugas senoidales alternas. <b>A</b>: además continuas pulsantes (aparatos con rectificador). <b>B</b>: además continuas lisas (variadores, cargadores trifásicos).`,`Respuesta: tipo <b>${c}</b>.`]}}
function gFuga(r){
 for(let k=0;k<200;k++){
  const Rb=pick(r,[1000,1500,2000]),Rp=pick(r,[500,1000,1500]),In=pick(r,[30,100,300]),U=220,I=U/(Rb+Rp)*1000,q=I/In;
  if(q>=.5&&q<1)continue;if(q<.15)continue;
  const ok=q>=1?0:1;
  return{kind:'fuga',datos:{Rb,Rp,In,U},tit:'Corriente de fuga por una persona',
   enun:`Una persona descalza toca la fase con la mano (tensión a tierra <b>${U} V</b>). La resistencia del cuerpo es <b>${miles(Rb)} Ω</b> y la del piso hasta tierra <b>${miles(Rp)} Ω</b>. Calculá la <b>corriente que pasa por la persona</b> y decidí si dispara un diferencial de <b>${In} mA</b>.`,
   campos:[{k:'i',t:'num',l:'Corriente por la persona',u:'mA',ok:I,tol:.03},{k:'d',t:'opt',l:`¿Dispara el de ${In} mA?`,o:['Sí, dispara','No dispara'],ok}],
   pista:'La corriente atraviesa el cuerpo y el piso en serie: I = U / (R cuerpo + R piso). Dispara si es mayor que IΔn (por debajo de la mitad de IΔn seguro no dispara).',
   pasos:[`I = U / (R<sub>cuerpo</sub> + R<sub>piso</sub>) = ${U} / (${miles(Rb)} + ${miles(Rp)}) = ${fm(U/(Rb+Rp),4)} A = <b>${fm(I,0)} mA</b>`,`Comparación: ${fm(I,0)} mA ${q>=1?'≥':'<'} ${In} mA ${q>=1?'→ el diferencial <b>dispara</b>.':'→ por debajo de la mitad de IΔn el diferencial <b>no dispara</b> (y esa corriente es peligrosa: por eso se usa el de 30 mA).'}`]}}
 return null}
function gTierra(r){const UL=pick(r,[50,24]),In=pick(r,[30,100,300]),R=UL/(In/1000);
 return{kind:'tierra',datos:{UL,In},tit:'Resistencia de puesta a tierra máxima',
  enun:`Para que el diferencial proteja contra contactos indirectos, la tensión de contacto no debe superar <b>U<sub>L</sub> = ${UL} V</b> (dato). Si el diferencial es de <b>${In} mA</b>, calculá la <b>máxima resistencia de puesta a tierra</b> R<sub>A</sub> admisible.`,
  campos:[{k:'r',t:'num',l:'R_A máxima',u:'Ω',ok:R,tol:.03}],
  pista:'La tensión de contacto es R_A · IΔn. Debe ser menor o igual que U_L, entonces R_A ≤ U_L / IΔn.',
  pasos:[`Condición: R<sub>A</sub> · IΔn ≤ U<sub>L</sub>  →  R<sub>A</sub> ≤ U<sub>L</sub> / IΔn`,`R<sub>A</sub> ≤ ${UL} / ${fm(In/1000,3)} = <b>${fm(R,1)} Ω</b>`,`Cuanto más sensible el diferencial, más alta puede ser la resistencia de tierra.`]}}

const GEN={mcb:{ib:gIB,cable:gCable,curva:gCurva,pc:gPC,polos:gPolos},rcd:{sens:gSens,in:gIn,tipo:gTipo,fuga:gFuga,tierra:gTierra}};
const NOMBRES={mcb:{ib:'Corriente y In',cable:'Llave y cable',curva:'Curva',pc:'Poder de corte',polos:'Polos'},rcd:{sens:'Sensibilidad',in:'In del diferencial',tipo:'Tipo',fuga:'Fuga por una persona',tierra:'Tierra'}};
function gen(comp,kind,seed){const r=rng(seed*7919+kind.length*131+comp.length);const p=GEN[comp][kind](r);p.comp=comp;p.seed=seed;p.id=comp+':'+kind;return p}

/* ---- corrección ---- */
const num=s=>{const x=parseFloat(String(s).replace(/\s/g,'').replace(',','.'));return isFinite(x)?x:NaN};
function evaluar(p,resp){const out={};let todo=true;p.campos.forEach(c=>{const v=resp[c.k];let ok;if(c.t==='num'){const x=num(v);ok=isFinite(x)&&Math.abs(x-c.ok)<=Math.max(Math.abs(c.ok)*(c.tol||.02),1e-6)}else ok=v!==undefined&&v!==''&&+v===c.ok;out[c.k]=ok;if(!ok)todo=false});return{campos:out,todo}}

/* ---- calculadora libre ---- */
function calcular(P,U,cos,fases){const IB=corriente(P,U,cos,fases),In=nextStd(IB,STD);return{IB,In,ok:isFinite(IB)&&IB>0&&!!In}}

/* ================= interfaz ================= */
const ST={mcb:null,rcd:null};
function estado(comp){if(!ST[comp])ST[comp]={kind:Object.keys(GEN[comp])[0],n:0,seed:0,p:null,resp:{},res:null,tries:0,hint:false,sol:false,ver:false,dado:false,hechos:0,propios:0,conSol:0,calc:{P:comp==='mcb'?2200:0,U:220,cos:1,f:1},rc:{UL:50,I:30,Rb:1500,Rp:1000}};const s=ST[comp];if(!s.p)nuevo(comp);return s}
function nuevo(comp,kind){const s=ST[comp];if(kind)s.kind=kind;s.n++;s.seed=(Date.now()%100000)+s.n*37;s.p=gen(comp,s.kind,s.seed);s.resp={};s.res=null;s.tries=0;s.hint=false;s.sol=false;s.dado=false}
function registrar(comp,s){/* una vez por problema: estrellas según cuánta ayuda se usó; ver la resolución se anota para el docente */
 if(s.dado)return;s.dado=true;if(s.sol)s.conSol++;else s.propios++;s.hechos++;
 const e=s.sol?1:s.tries===1&&!s.hint?3:2;try{if(window.PROG)PROG.record('calc:'+comp+':'+s.kind,e,{g:'calc',cat:'ca',sol:s.sol,hint:s.hint,mal:Math.max(0,s.tries-1),ti:'Dimensionar '+(comp==='mcb'?'termomagnética':'diferencial')+' · '+NOMBRES[comp][s.kind]})}catch{}}
const campoHTML=(c,s)=>{const v=s.resp[c.k],fin=s.res&&s.res.campos[c.k],bloq=s.sol||(s.res&&s.res.todo);const cls=fin===true?' ok':fin===false?' no':'';
 if(c.t==='num')return`<label class="cl" for="cf_${c.k}">${esc(c.l)}</label><div class="cf"><input id="cf_${c.k}" class="cn${cls}" data-cf="${c.k}" inputmode="decimal" autocomplete="off" value="${v===undefined?'':esc(v)}" ${bloq?'disabled':''} aria-label="${esc(c.l)} en ${c.u}"><span>${c.u}</span></div>`;
 return`<div class="cl">${esc(c.l)}</div><div class="co">${c.o.map((t,i)=>`<button class="o${String(v)===String(i)?' sel':''}${fin===true&&+v===i?' ok':''}${fin===false&&+v===i?' no':''}" data-co="${c.k}:${i}" ${bloq?'disabled':''}>${esc(t)}</button>`).join('')}</div>`};
function html(comp,intro){const s=estado(comp),p=s.p;
 const f=s.calc,r=calcular(f.P||0,f.U,f.cos,f.f===3?3:1),q=s.rc;
 let h=`<h2>Dimensioná la protección</h2><p>${intro}</p>`;
 if(comp==='mcb')h+=`<h3>Calculadora rápida de corriente</h3><div class="calc"><label>Potencia<input id="ca_P" inputmode="decimal" value="${f.P||''}" placeholder="W" aria-label="Potencia en vatios"><i>W</i></label><label>Tensión<select id="ca_U" aria-label="Tensión y sistema"><option value="220"${f.f===1&&f.U===220?' selected':''}>220 V monofásico</option><option value="380"${f.f===3?' selected':''}>380 V trifásico</option></select></label><label>cos φ<input id="ca_cos" inputmode="decimal" value="${fm(f.cos,2)}" aria-label="Factor de potencia"></label><div id="ca_out" class="vd ok" role="status">${calcOut(r,f)}</div></div>`;
 else h+=`<h3>Calculadora rápida</h3><div class="calc"><label>Tensión de contacto límite<select id="cr_UL" aria-label="Tensión de contacto límite"><option value="50"${q.UL===50?' selected':''}>50 V (normal)</option><option value="24"${q.UL===24?' selected':''}>24 V (local húmedo)</option></select></label><label>Sensibilidad IΔn<select id="cr_I" aria-label="Sensibilidad del diferencial">${[10,30,100,300].map(v=>`<option value="${v}"${q.I===v?' selected':''}>${v} mA</option>`).join('')}</select></label><label>R cuerpo<input id="cr_Rb" inputmode="decimal" value="${q.Rb}" aria-label="Resistencia del cuerpo en ohmios"><i>Ω</i></label><label>R piso<input id="cr_Rp" inputmode="decimal" value="${q.Rp}" aria-label="Resistencia del piso en ohmios"><i>Ω</i></label><div id="cr_out" class="vd ok" role="status">${rcOut(q)}</div></div>`;
 h+=`<h3>Problemas (cada vez uno distinto)</h3><div style="display:flex;flex-wrap:wrap;gap:5px">${Object.keys(GEN[comp]).map(k=>`<button class="chip" data-ck="${k}" aria-pressed="${s.kind===k}">${NOMBRES[comp][k]}</button>`).join('')}</div>`;
 h+=`<div class="card" style="margin-top:8px"><b>${p.tit}</b><p style="margin:4px 0 6px">${p.enun}</p>${p.campos.map(c=>campoHTML(c,s)).join('')}</div>`;
 const fin=s.res&&s.res.todo;
 if(s.res&&!fin&&!s.sol)h+=`<div class="vd bad" role="alert">${Object.values(s.res.campos).every(x=>!x)?'Todavía no.':'Alguna respuesta no es correcta.'} Revisá los datos y probá de nuevo${s.hint?'':' (podés pedir una pista)'}.</div>`;
 if(fin&&!s.sol)h+=`<div class="vd ok" role="status">✔ ¡Correcto!${s.tries===1&&!s.hint?' A la primera y sin ayudas: ★★★.':s.hint?' Con pista: ★★.':' Después de corregir: ★★.'}<br>${p.pasos.join('<br>')}</div>`;
 if(s.sol)h+=`<div class="vd warn" role="status"><b>Resolución</b> (este problema ya no cuenta como resuelto por vos; quedó anotado):<br>${p.pasos.join('<br>')}</div>`;
 if(s.hint&&!fin&&!s.sol)h+=`<div class="card" style="margin-top:8px"><b>💡 Pista</b>${p.pista}</div>`;
 h+=`<div class="row">${fin||s.sol?'':'<button class="btn pri" data-cc="chk">Comprobar</button><button class="btn" data-cc="hint">💡 Pista</button><button class="btn" data-cc="sol">👁 Ver resolución</button>'}<button class="btn${fin||s.sol?' pri':''}" data-cc="new">Otro problema ▶</button></div>`;
 h+=`<p class="note">Resueltos por tu cuenta: <b>${s.propios}</b> · con la resolución a la vista: <b>${s.conSol}</b>. Apretar «Ver resolución» no suma como resuelto y queda registrado en el informe para el docente. Los valores de cables y de poder de corte son ejemplos; en una obra real se usan las tablas vigentes (AEA 90364).</p>`;
 return h}
function rcOut(q){const Ra=q.UL/(q.I/1000),Ip=220/(q.Rb+q.Rp)*1000;if(!(q.Rb+q.Rp>0))return'Ingresá las resistencias.';return`Tierra máxima: R<sub>A</sub> ≤ ${q.UL} / ${fm(q.I/1000,3)} = <b>${fm(Ra,1)} Ω</b><br>Una persona (220 V) recibe <b>${fm(Ip,0)} mA</b> → ${Ip>=q.I?'<b>dispara</b> el de '+q.I+' mA':Ip>=q.I/2?'puede o no disparar (entre IΔn/2 e IΔn)':'<b>no dispara</b> el de '+q.I+' mA'}`}
function calcOut(r,f){if(!(f.P>0)||!(f.cos>0&&f.cos<=1))return'Ingresá la potencia y un cos φ entre 0,1 y 1.';
 if(!r.ok)return`I<sub>B</sub> = <b>${fm(r.IB,1)} A</b>: supera las llaves normalizadas de esta práctica (63 A).`;
 return`I<sub>B</sub> = <b>${fm(r.IB,2)} A</b> → In mínima normalizada: <b>${r.In} A</b>`}
function bind(comp,root,ctx){const s=estado(comp);
 const upd=()=>{const o=root.querySelector('#ca_out');if(!o)return;const P=num(root.querySelector('#ca_P').value),sel=root.querySelector('#ca_U').value,cos=num(root.querySelector('#ca_cos').value);s.calc={P:isFinite(P)?P:0,U:sel==='380'?380:220,cos:isFinite(cos)?cos:1,f:sel==='380'?3:1};o.innerHTML=calcOut(calcular(s.calc.P,s.calc.U,s.calc.cos,s.calc.f),s.calc)};
 ['#ca_P','#ca_cos'].forEach(q=>{const e=root.querySelector(q);if(e)e.oninput=upd});const u=root.querySelector('#ca_U');if(u)u.onchange=upd;
 const updR=()=>{const o=root.querySelector('#cr_out');if(!o)return;const Rb=num(root.querySelector('#cr_Rb').value),Rp=num(root.querySelector('#cr_Rp').value);s.rc={UL:+root.querySelector('#cr_UL').value,I:+root.querySelector('#cr_I').value,Rb:isFinite(Rb)?Rb:0,Rp:isFinite(Rp)?Rp:0};o.innerHTML=rcOut(s.rc)};
 ['#cr_Rb','#cr_Rp'].forEach(q=>{const e=root.querySelector(q);if(e)e.oninput=updR});['#cr_UL','#cr_I'].forEach(q=>{const e=root.querySelector(q);if(e)e.onchange=updR});
 root.querySelectorAll('[data-cf]').forEach(e=>e.oninput=()=>{s.resp[e.dataset.cf]=e.value});
 root.querySelectorAll('[data-co]').forEach(b=>b.onclick=()=>{const [k,i]=b.dataset.co.split(':');s.resp[k]=+i;ctx.play('click');ctx.refresh()});
 root.querySelectorAll('[data-ck]').forEach(b=>b.onclick=()=>{nuevo(comp,b.dataset.ck);ctx.play('click');ctx.refresh()});
 root.querySelectorAll('[data-cc]').forEach(b=>b.onclick=()=>{const k=b.dataset.cc;
  if(k==='new'){nuevo(comp);ctx.play('click')}
  else if(k==='hint'){s.hint=true;ctx.play('click')}
  else if(k==='sol'){s.sol=true;ctx.play('warn');registrar(comp,s)}
  else if(k==='chk'){const falta=s.p.campos.some(c=>s.resp[c.k]===undefined||s.resp[c.k]==='');if(falta){s.res=null;ctx.aviso('Completá todas las respuestas antes de comprobar.');ctx.refresh();return}
   s.tries++;s.res=evaluar(s.p,s.resp);if(s.res.todo){ctx.play('ok');registrar(comp,s)}else ctx.play('no')}
  ctx.refresh()})}
function css(){return`.calc{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:4px}.calc label{display:flex;flex-direction:column;gap:2px;font-size:.7rem;color:var(--mu);font-weight:700;position:relative}.calc input,.calc select{padding:7px 8px;border-radius:8px;border:1px solid var(--line);background:var(--p2);color:var(--tx);font:700 .9rem ui-monospace,Consolas,monospace;min-width:0}.calc i{position:absolute;right:9px;bottom:8px;font-style:normal;color:var(--mu)}.calc .vd{grid-column:1/-1;margin-top:2px}
.cl{margin:8px 0 3px;font-size:.74rem;font-weight:700;color:var(--mu)}.cf{display:flex;align-items:center;gap:6px}.cn{flex:1;min-width:0;padding:8px 10px;border-radius:9px;border:2px solid var(--line);background:var(--p2);color:var(--tx);font:700 1rem ui-monospace,Consolas,monospace}.cn.ok{border-color:var(--gr)}.cn.no{border-color:var(--rd)}.cf span{color:var(--mu);font-weight:700}
.co{display:grid;gap:5px}.co .o{padding:8px 10px;text-align:left;border:2px solid var(--line);border-radius:10px;background:var(--p2);cursor:pointer;font-weight:600}.co .o.sel{border-color:var(--bl);background:var(--sel)}.co .o.ok{border-color:var(--gr);background:var(--okbg)}.co .o.no{border-color:var(--rd);background:var(--badbg)}.co .o[disabled]{cursor:default}.cn[disabled]{opacity:.85}`}
const api={STD,STDR,CABLES,PC,corriente,nextStd,gen,evaluar,calcular,html,bind,css,GEN,NOMBRES,rng,lejos,estado};
return api})();
if(typeof window!=='undefined')window.CALC=CALC;
if(typeof module!=='undefined')module.exports=CALC;
