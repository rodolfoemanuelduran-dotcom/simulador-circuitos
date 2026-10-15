/* Componente "Disyuntor diferencial" (interruptor diferencial, IEC 61008). Usa comp-comun.js, comp-proteccion.js, comp-conexion.js y comp-calculo.js. */
(function(){
const{cl,fm,g,screw,glow,lbl,tag,title,DEFS,stroke4,spring}=window.CPH,PRO=window.PRO,CON=window.CON;
const ESC={n:0,h:8,p:88,z:20,g:200,dc:60};                     /* fugas de cada situación (mA) */
const ESCN={n:'Ninguna (la elijo yo)',h:'Humedad en un aparato (8 mA)',z:'Persona con calzado seco (20 mA)',p:'Persona descalza toca la fase (88 mA)',g:'Aparato con fuga grande (200 mA)',dc:'Fuga con corriente continua (60 mA)'};
const CARGA_A=1800/220;
const HL=[640,430],BR=[475,525],PIV_Y=410,BL=100,OPEN=24;      /* cerrojo; x de los dos polos; eje y longitud de las cuchillas; apertura en grados */
const tmax=q=>q<=1?.3:q>=5?.04:.3*Math.pow(.04/.3,Math.log(q)/Math.log(5));   /* tiempo máximo del disparo según la norma (s): 300 ms a IΔn, 150 a 2×, 40 a 5× */
const PARTES={
 toroide:{t:'Toroide (transformador diferencial)',d:'Anillo de material magnético por cuyo centro pasan la fase y el neutro. Si la corriente que va es igual a la que vuelve, sus campos se cancelan y no pasa nada. Si una parte se fuga a tierra (por una persona, por ejemplo), los campos no se cancelan y aparece flujo en el anillo.'},
 devanado:{t:'Bobina sensora',d:'Alambre fino arrollado al toroide. El flujo desbalanceado induce en ella una pequeña tensión, que se convierte en corriente hacia el relé.'},
 rele:{t:'Relé polarizado',d:'Un imán permanente mantiene la armadura "pegada". La corriente de la bobina sensora crea un campo que se opone al del imán y la armadura se suelta.'},
 armadura:{t:'Armadura',d:'Placa articulada que el imán mantiene sujeta. Al soltarse golpea al cerrojo.'},
 cerrojo:{t:'Cerrojo',d:'Mantiene trabada la barra de contactos. Cuando la armadura lo empuja, gira y libera el mecanismo.'},
 contactos:{t:'Contactos de fase y neutro',d:'Dos cuchillas, una por conductor. Abren las dos a la vez: el diferencial corta fase y neutro.'},
 barra:{t:'Barra de unión',d:'Une las dos cuchillas para que se abran juntas.'},
 resorte:{t:'Resorte de apertura',d:'Tira de la barra cuando el cerrojo la suelta y abre los contactos en pocos milisegundos.'},
 boton:{t:'Botón de prueba T',d:'Hace pasar a propósito una pequeña corriente que se saltea el toroide: crea una diferencia artificial, algo mayor que IΔn. Si el diferencial funciona, dispara. Se debe probar una vez por mes.'},
 prueba:{t:'Cable y resistencia de prueba',d:'Toman corriente de la fase (después del toroide) y la devuelven al neutro (antes del toroide), sin pasar por el anillo. Eso es lo que genera la diferencia de prueba.'},
 palanca:{t:'Palanca',d:'Conecta y desconecta a mano. Tras un disparo queda en posición intermedia: hay que llevarla a OFF y a ON para rearmar.'},
 ventana:{t:'Indicador de posición',d:'Rojo = contactos cerrados. Verde = abiertos.'},
 borne_in:{t:'Bornes de entrada (L y N)',d:'Entran la fase y el neutro desde el tablero. La tierra (PE) no pasa por el diferencial.'},
 borne_out:{t:'Bornes de salida',d:'Salen la fase y el neutro hacia los circuitos protegidos.'},
 carcasa:{t:'Carcasa',d:'Plástico aislante. Se puede poner transparente con el control de transparencia.'}};
C({
 titulo:'El disyuntor diferencial',
 intro:'Interruptor que <b>protege a las personas</b>: compara la corriente que va por la fase con la que vuelve por el neutro. Si no coinciden (una parte se fuga a tierra, por ejemplo a través de una persona) <b>dispara en milésimas de segundo</b>. No protege contra sobrecargas ni cortocircuitos: para eso necesita la termomagnética. Poné la tapa transparente y probá el botón T.',
 vistaIni:'frontal',T0:.85,
 vistas:[{id:'frontal',t:'Frontal (tapa transparente)'},{id:'interior',t:'Interior (sin tapa)'},{id:'toroide',t:'El toroide'},{id:'cuerpo',t:'Efectos en el cuerpo'},{id:'conexion',t:'Conexión'}],
 capas:[{id:'carcasa',t:'Carcasa'},{id:'tapa',t:'Palanca, ventana y botón T'},{id:'bornes',t:'Bornes y cables'},{id:'cont',t:'Contactos y conductores'},{id:'toro',t:'Toroide y bobina sensora'},{id:'rele',t:'Relé y armadura'},{id:'mec',t:'Cerrojo, barra y resorte'},{id:'test',t:'Circuito de prueba'},{id:'etiq',t:'Nombres de las piezas'}],
 btnOn:'🖐 Palanca en ON (conectar)',btnOff:'🖐 Palanca en OFF (desconectar)',
 fallas:[
  {id:'rele',t:'Mecanismo trabado',d:'Con el tiempo el relé o el cerrojo pueden trabarse: el diferencial no dispara. Por eso el botón T se prueba todos los meses.'},
  {id:'neutro',t:'Neutro aguas abajo unido a tierra',d:'Un error de instalación: parte de la corriente de vuelta se va por tierra, el toroide ve una diferencia y dispara sin motivo.'},
  {id:'humedad',t:'Humedad en la instalación (12 mA de fuga)',d:'Una pequeña fuga permanente: sola no dispara, pero sumada a otras puede hacerlo.'}],
 fallaVista:{rele:'frontal',neutro:'frontal',humedad:'frontal'},
 partes:PARTES,
 controles:[
  {k:'esc',t:'choice',l:'Situación (fuga a tierra)',v:'n',o:Object.keys(ESCN).map(k=>[k,ESCN[k]])},
  {k:'fuga',t:'slider',l:'Fuga manual (si elegís «Ninguna»)',min:0,max:300,st:1,v:0,fmt:v=>fm(v,0)+' mA'},
  {k:'carga',t:'choice',l:'Corriente de la carga',v:10,num:true,o:[[0,'Sin carga'],[5,'5 A'],[10,'10 A'],[16,'16 A']]},
  {k:'Idn',t:'choice',l:'Sensibilidad IΔn',v:30,num:true,o:[[10,'10 mA'],[30,'30 mA'],[100,'100 mA'],[300,'300 mA']]},
  {k:'In',t:'choice',l:'Corriente asignada In',v:25,num:true,o:[[25,'25 A'],[40,'40 A'],[63,'63 A']]},
  {k:'tipo',t:'choice',l:'Tipo',v:'A',o:[['AC','AC (sólo alterna)'],['A','A (alterna y continua pulsante)']]}],
 acciones:[{id:'test',t:'🔘 Apretar el botón T'},{id:'reset',t:'🔧 Reponer'}],
 accion(id,o){if(id==='test'){o.tb=1.4;o.msg='';o.msgT=0;return['tac']}if(id==='reset'){this.reinicio(o);o.msg='Diferencial repuesto.';o.msgT=2.5;return['click']}return[]},
 init(){const o={on:false,trip:'',ca:1,hp:18,lt:0,ar:0,dI:0,td:0,tb:0,tv:0,tTrip:null,spark:0,msg:'',msgT:0,prueba:null};CON.iniciar(o);return o},
 reinicio(o){o.on=false;o.trip='';o.ca=1;o.hp=18;o.lt=0;o.ar=0;o.dI=0;o.td=0;o.tb=0;o.tv=0;o.tTrip=null;o.msg='';o.msgT=0;o.prueba=null},
 corr(o,c){const p=c.p,f=c.f,Idn=+p.Idn,closed=o.on;const carga=o.cx&&o.ev?o.ev.I:+p.carga;
  const esc=p.esc==='n'?+p.fuga:ESC[p.esc]||0;let fuga=esc+(f.humedad?12:0);
  if(p.esc==='dc'&&p.tipo==='AC')fuga=f.humedad?12:0;                 /* el tipo AC no ve la fuga con continua */
  const cab=o.cx&&o.ev?o.ev.dI:0,vecina=f.neutro?.35*carga*1000:0;
  const dI=closed?fuga+cab+vecina+(o.tb>0?1.2*Idn:0):0;
  return{carga:closed?carga:0,carga0:carga,fuga,dI,Idn,q:dI/Idn,closed}},
 est(o){return{ar:o.ar}},
 paso(o,dt,c,t){const ev=[];if(dt<=0)return ev;const f=c.f;
  if(!c.coil){o.on=false;o.trip=''}
  else if(!o.on&&!o.trip){o.on=true;o.tv=0;o.td=0;ev.push('clack')}
  if(o.tb>0){o.tb-=dt}
  const k=this.corr(o,c);o.dI+=(k.dI-o.dI)*Math.min(1,dt*12);
  if(o.on){o.tv+=dt;
   if(k.q>=.7&&!f.rele){o.td+=dt;if(o.td>=tmax(k.q)*.5){o.on=false;o.trip='dif';o.tTrip=o.td;o.spark=.25;ev.push('clack','spark');o.msg=o.tb>0?'Prueba correcta: el diferencial disparó con el botón T.':'';o.msgT=o.tb>0?5:0}}
   else{o.td=Math.max(0,o.td-dt*2);
    if(o.tb>0&&f.rele&&!o.msg){o.msg='¡Apretaste T y NO disparó! El mecanismo está trabado: hay que cambiar el diferencial.';o.msgT=6}}}
  /* animación del mecanismo */
  const ar=o.trip?1:o.on?cl(k.q*.1,0,.25):0;o.ar+=(ar-o.ar)*Math.min(1,dt*(ar>o.ar?45:8));
  const lt=o.trip?1:0;o.lt+=(lt-o.lt)*Math.min(1,dt*26);
  const ca=o.on?0:1;o.ca+=(ca-o.ca)*Math.min(1,dt*(ca>o.ca?(o.trip?40:16):16));
  const hp=o.on?-18:o.trip?0:18;o.hp+=(hp-o.hp)*Math.min(1,dt*20);
  if(o.spark>0)o.spark-=dt;if(o.msgT>0){o.msgT-=dt;if(o.msgT<=0)o.msg=''}
  return ev},
 lecturas(o,c){const k=this.corr(o,c),f=c.f,Idn=k.Idn,L=k.carga,N=Math.max(0,L-k.dI/1000);
  const reads=[{l:'CORRIENTE DE FASE',v:fm(L,2)+' A',on:L>0},{l:'CORRIENTE DE NEUTRO',v:fm(N,2)+' A',on:L>0},{l:'DIFERENCIA (FUGA) ΔI',v:fm(k.dI,0)+' mA',on:k.dI>0?false:null},{l:'UMBRAL',v:'dispara ≥ '+fm(Idn,0)+' mA · nunca < '+fm(Idn/2,0)+' mA',on:null},{l:'TIEMPO MÁX. SEGÚN NORMA',v:k.dI>0?fm(tmax(k.q)*1000,0)+' ms':'—',on:null},{l:'ESTADO',v:o.trip==='dif'?'DISPARÓ POR FUGA':o.on?'conectado':'desconectado (OFF)',on:o.on},{l:'PALANCA',v:o.on?'ON':o.trip?'intermedia (disparó)':'OFF',on:null},{l:'CONTACTOS',v:o.on?'cerrados':'abiertos',on:o.on?true:null}];
  let verdict;
  if(o.msg)verdict={cls:/NO disparó/.test(o.msg)?'bad':'ok',t:o.msg};
  else if(o.trip==='dif')verdict={cls:'bad',t:'El toroide detectó '+fm(k.dI,0)+' mA de diferencia (≥ '+fm(Idn*.7,0)+' mA) y el relé abrió fase y neutro'+(o.tTrip?' en '+fm(o.tTrip*1000,0)+' ms':'')+'. Antes de rearmar hay que buscar y eliminar la fuga (bajá la palanca a OFF y subila).'};
  else if(!o.on)verdict={cls:'ok',t:'Diferencial desconectado: no pasa corriente hacia los circuitos.'};
  else if(c.p.esc==='dc'&&c.p.tipo==='AC')verdict={cls:'bad',t:'Hay una fuga con componente continua (60 mA) y el diferencial tipo AC no la detecta: no dispara. Con aparatos electrónicos se usa el tipo A.'};
  else if(f.rele&&k.q>=.7)verdict={cls:'bad',t:'La fuga supera el umbral pero el mecanismo está trabado: NO dispara. Es el peor caso: por eso se prueba el botón T todos los meses.'};
  else if(k.dI<=0)verdict={cls:'ok',t:'Sin fuga: lo que va por la fase vuelve por el neutro, los campos se cancelan y el diferencial no actúa.'};
  else if(k.q<.5)verdict={cls:'ok',t:'Fuga de '+fm(k.dI,0)+' mA: menor que la mitad de IΔn, el diferencial seguro NO dispara (esa fuga es normal en una instalación con aparatos).'};
  else if(k.q<.7)verdict={cls:'warn',t:'Fuga de '+fm(k.dI,0)+' mA: está entre IΔn/2 e IΔn. La norma no obliga ni a disparar ni a no disparar: puede dispararse con cualquier aumento.'};
  else verdict={cls:'warn',t:'Fuga de '+fm(k.dI,0)+' mA: supera el umbral. Va a disparar; la norma exige hacerlo en menos de '+fm(tmax(k.q)*1000,0)+' ms.'};
  return{reads,verdict}},
 pasos:[
  {t:'Una balanza de corrientes',coil:false,ini(o){C0(o)},p:{esc:'n',fuga:0},hl:['toroide','contactos'],vista:'frontal',x:'La <b>fase</b> y el <b>neutro</b> pasan por el centro de un anillo magnético (<b>toroide</b>). Sirve como una balanza: compara lo que va con lo que vuelve. Subí la transparencia de la tapa para ver todo el interior.'},
  {t:'Sin fuga: todo se compensa',coil:true,p:{esc:'n',fuga:0,carga:10},ini(o){C0(o)},hl:['toroide','devanado'],x:'Si la corriente de ida (fase) es igual a la de vuelta (neutro), sus campos magnéticos en el anillo son <b>iguales y opuestos</b>: se anulan. La bobina sensora no recibe nada, el relé no se mueve y la corriente circula normalmente.'},
  {t:'Una fuga chica: no dispara',coil:true,p:{esc:'h',carga:10},ini(o){C0(o)},hl:['toroide','devanado'],x:'Una aislación húmeda deja escapar unos <b>8 mA</b> a tierra. El neutro devuelve <b>menos</b> que lo que entregó la fase: esos 8 mA no se compensan, pero son menores que IΔn (30 mA): el diferencial <b>no dispara</b>. Por debajo de la mitad de IΔn nunca dispara.'},
  {t:'Una persona toca la fase',coil:true,p:{esc:'p',carga:10},ini(o){C0(o)},hl:['devanado','rele','armadura','cerrojo'],x:'Descalza, la persona deja pasar unos <b>88 mA</b> a tierra a través de su cuerpo. El toroide ve la diferencia, induce corriente en la bobina sensora, el relé suelta la armadura, ésta golpea el cerrojo y el resorte abre fase y neutro: todo en menos de <b>300 ms</b> (en la práctica, unos 30 ms).'},
  {t:'El botón de prueba T',coil:true,p:{esc:'n',fuga:0,carga:10},ini(o){C0(o);o.on=true;o.tb=1.6},hl:['boton','prueba','toroide'],x:'Al apretar <b>T</b>, una resistencia deja pasar una corriente un poco mayor que IΔn por un cable que <b>se saltea el toroide</b>: crea una diferencia artificial. Si el diferencial dispara, el mecanismo funciona. <b>Probalo una vez por mes.</b>'},
  {t:'Tipo AC y tipo A',coil:true,p:{esc:'dc',tipo:'AC',carga:10},ini(o){C0(o)},hl:['toroide'],x:'Un aparato con electrónica puede fugar con <b>componente continua</b>. El diferencial <b>tipo AC</b> no la detecta y no dispara. El <b>tipo A</b> sí. Cambiá el tipo en «Operar» y compará.'},
  {t:'No protege contra sobrecargas',coil:true,p:{esc:'n',fuga:0,carga:16},ini(o){C0(o)},hl:['contactos'],x:'Por el diferencial pasa toda la corriente de la carga y no tiene bimetal ni bobina de sobrecorriente. Si hay una sobrecarga o un cortocircuito, <b>no actúa</b>: por eso siempre va acompañado de una <b>termomagnética</b>.'}],
 usos:[
  {t:'Protección de personas en tomacorrientes',x:'Con 30 mA de sensibilidad, corta antes de que una descarga sea peligrosa. Es obligatorio en instalaciones domiciliarias y en locales húmedos.',sim:true},
  {t:'Protección contra incendios',x:'Los de 300 mA (a veces selectivos, tipo S) detectan fugas que pueden calentar y encender materiales aunque no haya nadie tocando.'},
  {t:'En el tablero, junto a las termomagnéticas',x:'El diferencial protege a las personas; las termomagnéticas protegen a los cables. La corriente asignada del diferencial no puede ser menor que la de la llave que lo cuida.',sim:true},
  {t:'Pileta, baño y taller',x:'Lugares con agua o con herramientas: siempre un diferencial de 30 mA.'}],
 ejercicios:[
  {q:'¿Qué compara un disyuntor diferencial?',o:['La tensión con la frecuencia','La corriente que va por la fase con la que vuelve por el neutro','La temperatura de los cables'],ok:1,why:'Si no coinciden, una parte se está yendo a tierra (por ejemplo, por una persona) y dispara.',ver:{vista:'frontal',coil:true,p:{esc:'p'}}},
  {q:'En funcionamiento normal y sin fugas, ¿cuánto vale la diferencia que mide el toroide?',o:['Cero (los campos se cancelan)','Igual a la corriente de la carga','220 V'],ok:0,why:'Ida y vuelta son iguales y de sentido opuesto: sus campos se anulan.',ver:{vista:'toroide',coil:true,p:{esc:'n',fuga:0}}},
  {q:'Un diferencial de 30 mA ¿dispara con una fuga de 10 mA?',o:['Sí, siempre','No: por debajo de la mitad de IΔn no debe disparar','Sólo si está húmedo'],ok:1,why:'La norma exige que no dispare por debajo de 0,5 × IΔn (15 mA).',ver:{vista:'frontal',coil:true,p:{esc:'n',fuga:10}}},
  {q:'¿Para qué sirve el botón T?',o:['Para cambiar la sensibilidad','Para comprobar que el mecanismo todavía dispara','Para medir la corriente'],ok:1,why:'Crea una diferencia artificial algo mayor que IΔn: si no dispara, hay que cambiarlo. Se prueba una vez por mes.',ver:{vista:'frontal',coil:true,p:{esc:'n',fuga:0}}},
  {q:'Una sobrecarga de 40 A por un circuito con diferencial de 25 A y sin termomagnética. ¿Qué pasa?',o:['El diferencial corta enseguida','El diferencial no la detecta: se recalientan los cables','Se activa el botón T'],ok:1,why:'El diferencial sólo detecta diferencias entre fase y neutro, no sobrecorrientes.',ver:{vista:'frontal',coil:true,p:{esc:'n',fuga:0,carga:16}}},
  {q:'La fuga de un lavarropas tiene componente continua. ¿Qué tipo conviene?',o:['AC','A','Cualquiera'],ok:1,why:'El tipo AC no detecta fugas con continua; el tipo A sí detecta las continuas pulsantes.',ver:{vista:'frontal',coil:true,p:{esc:'dc',tipo:'AC'}}},
  {q:'¿Qué sensibilidad se usa para proteger a las personas?',o:['300 mA','100 mA','30 mA'],ok:2,why:'Con 30 mA y corte rápido, la corriente no llega a ser peligrosa para el corazón.'},
  {q:'El neutro de la carga está unido a tierra después del diferencial. ¿Qué ocurre al conectar la carga?',o:['Nada','Dispara sin que haya ninguna persona tocando','Se funde el toroide'],ok:1,why:'Parte de la corriente de vuelta se va por tierra y el toroide ve una diferencia.',ver:{vista:'frontal',coil:true,f:['neutro'],p:{esc:'n',fuga:0,carga:10}}}],
 tabsExtra:[
  {id:'con',t:'Conectar',html:ctx=>CON.panel(E,ctx.o,ctx),bind:(root,ctx)=>CON.bind(E,root,ctx.o,ctx)},
  {id:'cal',t:'Calcular',html:()=>CALC.html('rcd','Elegí el diferencial que protege la instalación: sensibilidad, corriente asignada y tipo, y calculá la fuga que atraviesa a una persona y la resistencia de tierra máxima.'),bind:(root,ctx)=>CALC.bind('rcd',root,ctx)}],
 clic(act,o){if(act==='cx'){o.cx=!o.cx;return['click']}if(act==='test'){o.tb=1.4;o.msg='';o.msgT=0;return['tac']}return CON.clic(E,o,act)},
 defs(){return DEFS},
 dibujar(view,o,c,ui){const k=this.corr(o,c),S={o,c,ui,k,inter:view==='interior',f:c.f,Idn:k.Idn};
  if(view==='toroide')return toro(S);if(view==='cuerpo')return cuerpo(S);if(view==='conexion')return conx(S);return fro(S)},
 simbolo(o,c,ui){return iec({o,c,ui,k:this.corr(o,c)})}
});
function C0(o){o.on=false;o.trip='';o.tb=0;o.td=0;o.tv=0;o.dI=0}
function C(def){['corr','est'].forEach(k=>def[k]=def[k].bind(def));window.COMPONENTES.diferencial=def}
const has=PRO.has,rad=a=>a*Math.PI/180;
const LC='#8b4a1e',NC='#4db5ee';

/* ---------- frontal / interior: el mecanismo con la tapa transparente ---------- */
function fro(S){const{o,c,k,inter,ui,f,Idn}=S,t=ui.t,A=PRO.alfa(S),run=o.on&&k.carga>0,dI=o.dI,qv=cl(dI/Idn,0,1.5);
 const phi=OPEN*cl(o.ca,0,1),sp=Math.sin(rad(phi)),cp=Math.cos(rad(phi));
 const blade=x=>({tip:[x+BL*sp,PIV_Y-BL*cp],mid:[x+50*sp,PIV_Y-50*cp]});
 const bL=blade(BR[0]),bN=blade(BR[1]);
 let s=`<rect x="300" y="70" width="400" height="440" rx="14" fill="var(--cav)" opacity="${inter?.95:.55}"/>`;
 /* mitad de atrás del toroide */
 const CX=500,CY=205,RX=95,RY=36;
 let tor=`<ellipse cx="${CX}" cy="${CY}" rx="${RX}" ry="${RY}" fill="url(#cFe)" stroke="#2c3540" stroke-width="2"/><ellipse cx="${CX}" cy="${CY}" rx="${RX*.64}" ry="${RY*.5}" fill="#0e1722" stroke="#2c3540"/>`;
 /* arrollamiento sensor en el lado derecho */
 let dev='';for(let i=0;i<9;i++){const a=rad(-70+i*17),x=CX+Math.cos(a)*RX*.82,y=CY+Math.sin(a)*RY*.82;dev+=`<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="5" ry="${(RY*.55).toFixed(1)}" transform="rotate(${(-8+i*2).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="none" stroke="#2a1608" stroke-width="4.6" opacity=".6"/><ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="5" ry="${(RY*.55).toFixed(1)}" transform="rotate(${(-8+i*2).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="none" stroke="#e08a52" stroke-width="3"/>`}
 /* flujo desbalanceado: arcos que giran alrededor del anillo */
 let flu='';if(qv>.02){const n=Math.ceil(2+qv*4);for(let i=0;i<n;i++){const a=((t*(.8+qv)+i/n)%1)*Math.PI*2,x=CX+Math.cos(a)*RX*.8,y=CY+Math.sin(a)*RY*.8;flu+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(3+qv*3).toFixed(1)}" fill="#ffd65a" opacity="${(.4+.5*qv).toFixed(2)}"/>`}flu=glow(CX,CY,70,'#ffd65a',.18*qv)+flu}
 /* conductores */
 const pL='M380 126V140C380 165 475 140 475 175V300',pN='M620 126V140C620 165 525 140 525 175V300';
 const cond=PRO.cu(pL,9)+PRO.cu(pN,9)+PRO.cu(`M${BR[0]} ${PIV_Y}V430C${BR[0]} 452 380 440 380 462`,9)+PRO.cu(`M${BR[1]} ${PIV_Y}V430C${BR[1]} 452 620 440 620 462`,9);
 /* contactos */
 const fijo=[BR[0],BR[1]].map(x=>`<rect x="${x-14}" y="294" width="28" height="12" rx="2" fill="url(#cCuV)" stroke="#4a2410"/>`+PRO.pastilla(x-10,306,20)).join('');
 const cuch=(x,b,col)=>`<g transform="${PRO.rot(phi,x,PIV_Y)}"><rect x="${x-6}" y="${PIV_Y-BL}" width="12" height="${BL}" rx="3" fill="${col}" stroke="#6b2a10"/><rect x="${x-3}" y="${PIV_Y-BL+8}" width="3" height="${BL-16}" fill="#ffe3c4" opacity=".55"/>${PRO.pastilla(x-8,PIV_Y-BL-4,16)}</g>${PRO.pasador(x,PIV_Y,8)}`;
 const conts=fijo+cuch(BR[0],bL,'url(#cCuH)')+cuch(BR[1],bN,'url(#cCuH)');
 /* barra de unión, resorte y cerrojo */
 const barra=PRO.barra(440,360-2,bN.mid[0]+60,bN.mid[1]-2,10,'url(#cPlL)')+`<rect x="430" y="352" width="14" height="18" rx="3" fill="#aeb9c5" stroke="#111"/>`+PRO.pasador(bL.mid[0],bL.mid[1],5)+PRO.pasador(bN.mid[0],bN.mid[1],5);
 const bend=[bN.mid[0]+60,bN.mid[1]-2];
 const resorte=PRO.springXY(bend[0],bend[1],672,bend[1],10,7,'#aeb9c5')+PRO.pasador(672,bend[1],6);
 const lt=o.lt,hook=`<g transform="${PRO.rot(30*lt,HL[0],HL[1])}"><path d="M602 372L616 366L650 392L660 470L630 470L626 410Z" fill="url(#cPlL)" stroke="#111" stroke-width="1.4"/><circle cx="652" cy="400" r="5" fill="#aeb9c5" stroke="#333"/></g>${PRO.pasador(HL[0],HL[1],7)}`;
 /* relé polarizado: imán + bobina + armadura */
 const ar=o.ar,AH=[682,330],ang=26*ar;
 const rele=`<rect x="612" y="256" width="52" height="42" rx="4" fill="url(#pWind)" stroke="#4a2410"/><rect x="664" y="236" width="14" height="70" rx="3" fill="url(#cFe)" stroke="#2c3540"/><rect x="664" y="232" width="14" height="22" fill="#c0392b" stroke="#000"/><text x="671" y="248" text-anchor="middle" style="font:800 11px system-ui;fill:#fff">N</text><rect x="664" y="254" width="14" height="14" fill="#2c6fb5" stroke="#000"/><text x="671" y="265" text-anchor="middle" style="font:800 11px system-ui;fill:#fff">S</text>${qv>.05?glow(638,277,40,'#79d9f1',.15+.3*qv):''}`;
 const arm=`<g transform="${PRO.rot(ang,AH[0],AH[1])}"><rect x="680" y="244" width="10" height="${AH[1]-244+20}" rx="3" fill="url(#cPlL)" stroke="#111"/></g>${PRO.pasador(AH[0]+4,AH[1],6)}`;
 const ta=[AH[0]+4-24*Math.sin(rad(ang)),AH[1]+24*Math.cos(rad(ang))],Q=(()=>{const a=rad(30*lt),x=20,y=-32;return[HL[0]+x*Math.cos(a)-y*Math.sin(a),HL[1]+x*Math.sin(a)+y*Math.cos(a)]})();
 const varilla=PRO.barra(ta[0],ta[1],Q[0],Q[1],5,'url(#cSteel)');
 /* cables del devanado al relé */
 const lead=PRO.cu(`M${CX+RX*.8} ${CY+6}C${CX+RX} ${CY+40} 640 230 632 258`,3)+PRO.cu(`M${CX+RX*.7} ${CY+22}C${CX+RX*.8} ${CY+60} 620 240 618 258`,3);
 /* circuito de prueba */
 const tp='M475 330H334M330 330V150H525';
 const prueba=PRO.cu(tp.replace('M330 330','M330 334'),3)+`<rect x="320" y="226" width="20" height="50" rx="3" fill="#d8b66a" stroke="#6b5a2c"/><path d="M322 236H338M322 246H338M322 256H338M322 266H338" stroke="#5b3a14" stroke-width="3"/>`+(o.tb>0?`<path class="flowd" d="${tp}" pointer-events="none"/>`:'');
 const pres=o.tb>0;
 const boton=`<g data-act="test" style="cursor:pointer"><circle cx="346" cy="330" r="17" fill="${pres?'#a37a00':'#e5b81a'}" stroke="#000" stroke-width="2.4"/><circle cx="346" cy="${pres?331:329}" r="12" fill="${pres?'#c8a007':'#ffd65a'}" stroke="#7a5a00"/><text x="346" y="335" text-anchor="middle" style="font:900 14px system-ui;fill:#241a00" pointer-events="none">T</text></g>`;
 /* flujo de corriente */
 const fl=run?`<path class="flowd" d="${pL}M${BR[0]} 300V410V430C${BR[0]} 452 380 440 380 462" pointer-events="none"/><path class="flowd" d="${pN}M${BR[1]} 300V410V430C${BR[1]} 452 620 440 620 462" pointer-events="none"/>`:'';
 /* medidor de diferencia */
 const med=`<rect x="410" y="258" width="180" height="10" rx="5" fill="#0b0e11" stroke="#000"/><rect x="410" y="258" width="${(180*cl(dI/(Idn*1.5),0,1)).toFixed(1)}" height="10" rx="5" fill="${dI>=Idn*.7?'#ff6b6b':dI>=Idn*.5?'#ffd65a':'#5ce0a0'}"/><path d="M${410+180*(Idn*.7)/(Idn*1.5)} 254V272" stroke="#fff" stroke-width="3"/><text x="500" y="283" class="lab c s" style="${stroke4}">ΔI = ${fm(dI,0)} mA (dispara desde ${fm(Idn*.7,0)} mA)</text>`;
 s+=g(S,'cont','conductores',cond);
 s+=g(S,'toro','toroide',tor)+g(S,'test','prueba',prueba);
  s+=g(S,'cont','contactos',conts);
 s+=g(S,'mec','barra',barra)+g(S,'mec','resorte',resorte)+g(S,'mec','cerrojo',hook)+g(S,'rele','rele',rele+lead)+g(S,'rele','armadura',arm+varilla);
 s+=g(S,'toro','devanado',dev)+(has(S,'toro')?flu:'');
 /* mitad de adelante del toroide: se redibuja el frente del anillo sobre los conductores */
 s+=g(S,'toro','toroide',`<path d="M${CX-RX} ${CY}A${RX} ${RY} 0 0 0 ${CX+RX} ${CY}" fill="none" stroke="#9aa6b5" stroke-width="12" stroke-linecap="butt"/><path d="M${CX-RX} ${CY}A${RX} ${RY} 0 0 0 ${CX+RX} ${CY}" fill="none" stroke="#c7d1de" stroke-width="3" opacity=".7"/>`);
 s+=fl;
 if(o.spark>0)s+=window.CPH.sparks(BR[0]+20,PIV_Y-BL,t,1)+window.CPH.sparks(BR[1]+20,PIV_Y-BL,t,2);
 s+=has(S,'toro')?med:'';
 /* carcasa y frente */
 s+=g(S,'carcasa','carcasa',PRO.carcasa(S,300,70,400,440,14));
 /* palanca, ventana y botón */
 const ly=o.on?96:o.trip?124:150;
 s+=g(S,'tapa','palanca',`<g opacity="${Math.max(.6,A)}"><rect x="662" y="88" width="36" height="104" rx="8" fill="#101317" stroke="#000"/><text x="680" y="82" text-anchor="middle" style="font:800 11px system-ui;fill:#f0f4f8">I · ON</text><rect x="666" y="${ly}" width="28" height="36" rx="7" fill="url(#cKnob)" stroke="#000" stroke-width="1.6"/><path d="M670 ${ly+12}H690M670 ${ly+20}H690M670 ${ly+28}H690" stroke="#000" stroke-opacity=".5" stroke-width="2"/></g>`);
 s+=g(S,'tapa','ventana',`<rect x="662" y="198" width="36" height="22" rx="5" fill="#0b0e11" stroke="#000"/><rect x="666" y="202" width="28" height="14" rx="3" fill="${PRO.colVentana(o.on,o.trip)}"/><text x="680" y="213" text-anchor="middle" style="font:800 10px system-ui;fill:#fff">${o.on?'I':'O'}</text>`);
 s+=g(S,'tapa','boton',boton);
 s+=`<rect x="410" y="286" width="180" height="10" fill="none"/><text x="500" y="494" class="lab c s" style="${stroke4}" pointer-events="none">${fm(+c.p.In,0)} A · ${fm(Idn,0)} mA · tipo ${c.p.tipo}</text>`;
 /* bornes */
 const bi=PRO.bornera(344,62,'up',LC,0,20)+PRO.bornera(584,62,'up',NC,0,60),bo=PRO.bornera(344,458,'down',LC,0,40)+PRO.bornera(584,458,'down',NC,0,80);
 s+=g(S,'bornes','borne_in',bi)+g(S,'bornes','borne_out',bo);
 if(run)s+=`<path class="flowd" d="M380 18V70M620 18V70M380 510V556M620 510V556" pointer-events="none"/>`;
 if(has(S,'bornes'))s+=tag(380,100,'L','s')+tag(620,100,'N','s')+tag(380,508,'L','s')+tag(620,508,'N','s');
 /* corrientes de ida y vuelta */
 const Lc=k.carga,Nc=Math.max(0,Lc-dI/1000);
 s+=`<g pointer-events="none"><text x="500" y="92" class="lab c s" style="${stroke4}">fase ↓ ${fm(Lc,2)} A</text><text x="500" y="110" class="lab c s" style="${stroke4}">neutro ↑ ${fm(Nc,2)} A</text></g>`;
 if(o.dead)s+='';
 if(has(S,'etiq'))s+=lbl(270,160,'Toroide','l',420,190)+lbl(270,250,'Bobina sensora','l',590,214)+lbl(270,330,'Botón de prueba T','l',330,330)+lbl(270,400,'Barra de unión','l',445,360)+lbl(730,330,'Relé polarizado','r',664,300)+lbl(730,420,'Cerrojo','r',650,430)+lbl(730,150,'Palanca','r',698,150)+lbl(270,240,'Resistencia de prueba','l',320,250)+lbl(730,490,'Cuchillas (fase y neutro)','r',540,400);
 s+=`<text x="500" y="554" class="lab c s">Esquema simplificado: la forma exacta cambia según el fabricante.</text>`;
 return s+title(inter?'Interior: el mecanismo sin tapa':'Frontal (subí la transparencia para ver el interior)')}

/* ---------- el toroide (principio de funcionamiento) ---------- */
function toro(S){const{o,c,k,ui,Idn}=S,t=ui.t,L=k.carga,N=Math.max(0,L-k.dI/1000),dI=o.dI;
 const CX=500,CY=300,RX=180,RY=80;
 let s=`<rect x="40" y="50" width="920" height="470" rx="16" fill="var(--p)" opacity=".5"/>`;
 s+=`<ellipse cx="${CX}" cy="${CY}" rx="${RX}" ry="${RY}" fill="url(#cFe)" stroke="#2c3540" stroke-width="3"/><ellipse cx="${CX}" cy="${CY}" rx="${RX*.62}" ry="${RY*.46}" fill="#0e1722" stroke="#2c3540" stroke-width="2"/>`;
 /* cable de fase hacia abajo y neutro hacia arriba */
 s+=PRO.cu(`M430 90V510`,16).replace(/#d98d57/,LC)+PRO.cu(`M570 90V510`,16).replace(/#d98d57/,NC);
 s+=`<path d="M${CX-RX} ${CY}A${RX} ${RY} 0 0 0 ${CX+RX} ${CY}" fill="none" stroke="#9aa6b5" stroke-width="22"/><path d="M${CX-RX} ${CY}A${RX} ${RY} 0 0 0 ${CX+RX} ${CY}" fill="none" stroke="#c7d1de" stroke-width="4" opacity=".7"/>`;
 /* flechas de corriente */
 s+=`<g pointer-events="none"><path d="M430 130V210" stroke="#fff" stroke-width="5" /><path d="M430 420V480" stroke="#fff" stroke-width="5"/><text x="400" y="170" class="lab r" style="${stroke4}">Fase: ${fm(L,2)} A ↓</text><text x="600" y="170" class="lab" style="${stroke4}">Neutro: ${fm(N,2)} A ↑</text></g>`;
 if(L>0)s+=`<path class="flowd" d="M430 90V510" pointer-events="none"/><path class="flowd" d="M570 510V90" pointer-events="none"/>`;
 /* campos magnéticos */
 const bF=cl(L/16,0,1)*40,bN=cl(N/16,0,1)*40;
 s+=`<g pointer-events="none"><ellipse cx="430" cy="${CY}" rx="${40+bF}" ry="${18+bF*.4}" fill="none" stroke="#ff9a3d" stroke-width="4" stroke-dasharray="10 8" opacity=".9" transform="rotate(0 430 ${CY})"/><ellipse cx="570" cy="${CY}" rx="${40+bN}" ry="${18+bN*.4}" fill="none" stroke="#4db5ee" stroke-width="4" stroke-dasharray="10 8" opacity=".9"/><text x="430" y="${CY-70}" class="lab c s" style="${stroke4}">flujo de la fase</text><text x="570" y="${CY-70}" class="lab c s" style="${stroke4}">flujo del neutro</text></g>`;
 /* flujo neto */
 const neto=cl(dI/Idn,0,2);
 s+=`<g pointer-events="none"><rect x="50" y="380" width="230" height="140" rx="12" fill="var(--p2)" stroke="var(--line)" stroke-width="2"/><text x="165" y="406" class="lab c">Flujo neto en el anillo</text><rect x="70" y="424" width="190" height="16" rx="8" fill="#0b0e11"/><rect x="70" y="424" width="${(190*cl(dI/(Idn*1.5),0,1)).toFixed(1)}" height="16" rx="8" fill="${dI>=Idn*.7?'#ff6b6b':dI>=Idn*.5?'#ffd65a':'#5ce0a0'}"/><path d="M${70+190*(Idn*.7)/(Idn*1.5)} 418V446" stroke="#fff" stroke-width="3"/><text x="165" y="472" class="lab c" style="font-size:20px">ΔI = ${fm(dI,0)} mA</text><text x="165" y="494" class="lab c s">${dI<=.01?'se cancelan: no hay flujo':dI<Idn*.5?'poco flujo: no dispara':dI<Idn*.7?'zona de duda':'¡dispara!'}</text><text x="165" y="512" class="lab c s">umbral: ${fm(Idn*.7,0)} mA (IΔn ${fm(Idn,0)})</text></g>`;
 /* bobina sensora y relé */
 s+=`<g pointer-events="none"><path d="M${CX+RX-10} ${CY+10}C760 ${CY+60} 760 ${CY+90} 790 ${CY+110}" fill="none" stroke="#d98d57" stroke-width="4"/><rect x="790" y="${CY+90}" width="120" height="70" rx="10" fill="var(--p2)" stroke="var(--line)" stroke-width="2"/><text x="850" y="${CY+118}" class="lab c">Relé</text><text x="850" y="${CY+140}" class="lab c s">${o.trip?'¡soltó!':'sujeto por el imán'}</text></g>`;
 if(dI>0)s+=glow(CX+RX-10,CY+10,26,'#ffd65a',.3+.4*cl(dI/Idn,0,1));
 return s+title('El toroide: una balanza entre lo que va y lo que vuelve')}

/* ---------- efectos de la corriente en el cuerpo (orientativo) ---------- */
function cuerpo(S){const{o,c,k,Idn}=S,X=m=>110+Math.log10(cl(m,.5,1000)/.5)*(780/Math.log10(2000));
 const Z=[[.5,10,'#5ce0a0','0,5 a 10 mA · se percibe: cosquilleo'],[10,30,'#c9e04a','10 a 30 mA · contracción muscular, cuesta soltar'],[30,75,'#ffd65a','30 a 75 mA · riesgo de paro respiratorio'],[75,200,'#ff9a3d','75 a 200 mA · riesgo de fibrilación ventricular'],[200,1000,'#ff5a4d','más de 200 mA · quemaduras graves, paro cardíaco']];
 let s=`<rect x="110" y="120" width="780" height="80" rx="10" fill="var(--p)" opacity=".7" stroke="var(--line)"/>`;
 Z.forEach(([a,b,col])=>{s+=`<rect x="${X(a)}" y="120" width="${X(b)-X(a)}" height="80" fill="${col}" opacity=".6"/>`});
 for(const m of [1,10,30,100,300,1000])s+=`<path d="M${X(m)} 120V208" stroke="var(--ink)" stroke-width="1.5" opacity=".6"/><text x="${X(m)}" y="226" class="lab c s">${m} mA</text>`;
 s+=`<path d="M${X(Idn)} 100V204" stroke="#79d9f1" stroke-width="5"/><text x="${X(Idn)}" y="92" class="lab c" style="${stroke4}">IΔn = ${fm(Idn,0)} mA</text>`;
 s+=`<path d="M${X(Idn/2)} 100V204" stroke="#5ce0a0" stroke-width="3" stroke-dasharray="6 5"/><text x="${X(Idn/2)-6}" y="112" class="lab r s" style="${stroke4}">IΔn / 2 (nunca dispara por debajo)</text>`;
 const d=Math.max(.5,o.dI);if(o.dI>.4)s+=`<circle cx="${X(d)}" cy="160" r="10" fill="#fff" stroke="#000" stroke-width="3"/><text x="${X(d)}" y="146" class="lab c s" style="${stroke4}">fuga actual: ${fm(o.dI,0)} mA</text>`;
 Z.forEach(([a,b,col,tx],i)=>{s+=`<rect x="112" y="${248+i*22}" width="14" height="14" rx="3" fill="${col}"/><text x="136" y="${260+i*22}" class="lab s" style="font-weight:600">${tx}</text>`});
 s+=`<g class="lab s" style="font-weight:600"><text x="110" y="388">Valores aproximados de la corriente alterna de 50 Hz que atraviesa el cuerpo (orientativos; IEC 60479-1).</text><text x="110" y="408">Importa la corriente y también el tiempo: por eso el diferencial de 30 mA corta en pocos milisegundos.</text><text x="110" y="428">Persona descalza en piso húmedo (≈ 2 500 Ω) con 220 V: unos 88 mA. Sin diferencial, zona de riesgo grave.</text></g>`;
 s+=`<text x="500" y="462" class="lab c">Tiempos máximos de disparo según la norma (diferencial general)</text>`;
 [[1,'IΔn',300],[2,'2 × IΔn',150],[5,'5 × IΔn',40]].forEach(([q,tx,ms],i)=>{const w=ms*1.6;s+=`<rect x="250" y="${474+i*24}" width="${w}" height="16" rx="4" fill="#79d9f1" opacity=".8"/><text x="240" y="${487+i*24}" class="lab r s">${tx}</text><text x="${256+w}" y="${487+i*24}" class="lab s">${ms} ms como máximo</text>`});
 return s+title('Por qué 30 mA: lo que le pasa al cuerpo')}

/* ---------- práctica de conexión ---------- */
const E={key:'rcd',titulo:'Conectá el disyuntor diferencial',
 ayuda:'El mismo calefactor de 1 800 W se alimenta ahora a través de un <b>diferencial bipolar</b>. Fase y neutro tienen que atravesar el aparato (el toroide los compara) y la tierra se conecta directo al calefactor.',
 cajas:[{x:30,y:130,w:200,h:300,t:'Red 220 V · 50 Hz',sub:'tablero'},{x:380,y:100,w:240,h:370,t:'D1 · Diferencial 2P',sub:'30 mA · compara fase y neutro'},{x:770,y:130,w:200,h:300,t:'Calefactor 1 800 W',sub:'8,2 A a 220 V'}],
 term:[{id:'SL',x:222,y:200,rol:'L',lab:'Fase',side:'r'},{id:'SN',x:222,y:280,rol:'N',lab:'Neutro',side:'r'},{id:'SPE',x:222,y:360,rol:'PE',lab:'Tierra',side:'r'},
  {id:'T1',x:450,y:196,lab:'L',side:'t'},{id:'T3',x:550,y:196,lab:'N',side:'t'},{id:'T2',x:450,y:436,lab:'L',side:'b'},{id:'T4',x:550,y:436,lab:'N',side:'b'},
  {id:'LL',x:778,y:200,rol:'L',lab:'Fase',side:'l'},{id:'LN',x:778,y:280,rol:'N',lab:'Neutro',side:'l'},{id:'LPE',x:778,y:360,rol:'PE',lab:'Tierra',side:'l'}],
 pasa:o=>o.on?[['T1','T2'],['T3','T4']]:[],
 solucion:[['SL','T1'],['SN','T3'],['T2','LL'],['T4','LN'],['SPE','LPE']],
 eval(o,W){const ns=CON.red(E,W,[]),ne=CON.red(E,W,[['T1','T2'],['T3','T4']]),items=[];
  const Lne=ne.con('SL','LL'),Lns=ns.con('SL','LL'),Nne=ne.con('SN','LN'),Nns=ns.con('SN','LN'),PEc=ns.con('SPE','LPE'),toca=['T1','T2','T3','T4'].some(q=>ns.con('SPE',q));
  const mix=N=>['SL','SN','SPE','LL','LN','LPE'].some(q=>N.roles(q).size>1);
  const corto=mix(ns)?'libre':mix(ne)?'dev':null;
  if(!W.length)return{items,ok:false,I:0,dI:0,carga:false,corto:null};
  const Lpuente=Lne&&Lns,Npuente=Nne&&Nns;
  items.push(!Lne?{k:'pend',t:'La fase todavía no llega al calefactor.'}:Lns?{k:'bad',t:'La fase llega al calefactor sin pasar por el diferencial: no queda protegida.'}:{k:'ok',t:'La fase atraviesa el toroide del diferencial.'});
  items.push(!Nne?{k:'pend',t:'El neutro todavía no llega al calefactor.'}:Nns?{k:'bad',t:'El neutro no pasa por el diferencial: la corriente de vuelta se saltea el toroide, no se compensa con la de ida y el diferencial dispara apenas conectes la carga.'}:{k:'ok',t:'El neutro atraviesa el toroide: ida y vuelta se comparan.'});
  const NPE=(ns.con('LN','LPE')||ns.con('LN','SPE'))&&!corto;
  items.push(!PEc?{k:'pend',t:'Falta unir la tierra con el cuerpo metálico del calefactor.'}:toca?{k:'bad',t:'La tierra no pasa por el diferencial: se conecta directa.'}:{k:'ok',t:'La tierra va directa al cuerpo del calefactor.'});
  if(corto)items.push({k:'bad',t:corto==='libre'?'¡Cortocircuito antes del diferencial! El diferencial no lo detecta (no protege contra cortocircuitos): lo debe cortar la termomagnética.':'¡Cortocircuito aguas abajo! El diferencial no actúa por esto: lo corta la termomagnética.'});
  if(NPE)items.push({k:'bad',t:'El neutro está unido a tierra después del diferencial: parte de la corriente vuelve por tierra y el toroide dispara sin que haya una falla real.'});
  const ok=Lne&&!Lns&&Nne&&!Nns&&PEc&&!toca&&!corto&&!NPE,vivo=Lne&&Nne&&!corto;
  const I=corto==='dev'?3000:vivo?CARGA_A:0;
  const dI=vivo&&!corto?(Npuente&&Lne&&!Lns?CARGA_A*1000:NPE?.35*CARGA_A*1000:0):0;
  return{items,ok,I,dI,carga:vivo,corto,corriente:i=>{if(!vivo||!o.on||!o.cx)return false;const r=CON.rolDe(E,ne,W[i][0]);return r==='L'||r==='N'}}},
 pruebas(o){return`<p class="note" style="margin:6px 0 0">Con el circuito energizado y la palanca en ON, apretá el botón <b>T</b> (en la escena o en «Operar»): debe disparar. Probá también conectar mal el neutro y mirá qué ocurre.</p>`}};
function conx(S){const{o,c,k}=S,ev=o.ev||CON.evaluar(E,o),vivo=o.cx&&o.on&&ev.carga;
 const antes=`<g data-act="cx" style="cursor:pointer"><rect x="400" y="30" width="200" height="44" rx="22" fill="${o.cx?'#7a5a00':'var(--p)'}" stroke="${o.cx?'#ffd65a':'var(--line)'}" stroke-width="3"/><text x="500" y="58" class="lab c">⚡ Energizado: ${o.cx?'SÍ':'NO'} (tocá)</text></g>`;
 const med=`<g data-act="toggle" style="cursor:pointer"><rect x="440" y="240" width="120" height="100" rx="12" fill="#101317" stroke="#000" stroke-width="2"/><rect x="450" y="${o.on?248:o.trip?270:292}" width="100" height="36" rx="8" fill="url(#cKnob)" stroke="#000"/><text x="500" y="332" text-anchor="middle" style="font:800 12px system-ui;fill:${PRO.colVentana(o.on,o.trip)}">${o.on?'ON':o.trip?'DISPARÓ':'OFF'}</text></g><g data-act="test" style="cursor:pointer"><circle cx="500" cy="382" r="17" fill="#e5b81a" stroke="#000" stroke-width="2.4"/><text x="500" y="388" text-anchor="middle" style="font:900 15px system-ui;fill:#241a00" pointer-events="none">T</text></g>`;
 const des=`<g pointer-events="none"><path d="M810 190h70v52h-70z" fill="none" stroke="${vivo?'#ff9a3d':'var(--ink)'}" stroke-width="4"/>${[0,1,2,3].map(i=>`<path d="M${818+i*16} 196v40" stroke="${vivo?'#ffb66b':'var(--mu)'}" stroke-width="5" stroke-linecap="round"/>`).join('')}${vivo?glow(845,216,70,'#ff7a1f',.55):''}${o.cx?`<text x="845" y="276" class="lab c s" style="${stroke4}">ΔI = ${fm(o.dI,0)} mA</text>`:''}${(o.cx&&ev.corto)?window.CPH.sparks(300,240,S.ui.t,3):''}</g>`;
 const aviso=`<text x="500" y="520" class="lab c s">${o.cx?(o.trip?'El diferencial disparó por la diferencia entre fase y neutro. Bajá la palanca a OFF y subila para rearmar (después de corregir la conexión).':(o.on?'Circuito en marcha. Apretá T para probar el diferencial.':'Subí la palanca a ON para dar paso a la corriente.')):'Energizá el circuito cuando termines de conectar.'}</text>`;
 return CON.vista(S,E,o,{antes,medio:med,despues:des+aviso})+title('Práctica de conexión')}

/* ---------- símbolo IEC ---------- */
function iec(S){const{o,k}=S,run=o.on&&k.carga>0,Lc='#b5733e',Nc='#4db5ee',off='#566678';
 let s=`<text x="500" y="26" class="lab c t">Símbolo IEC del disyuntor diferencial bipolar (Q2)</text>`;
 [[360,'Fase',Lc],[560,'Neutro',Nc]].forEach(([x,n,col],i)=>{s+=`<text x="${x}" y="70" class="lab c s">${n}</text><path d="M${x} 80V150" stroke="${col}" stroke-width="5"/>`;
  s+=`<circle cx="${x}" cy="150" r="4.5" fill="var(--ink)"/><circle cx="${x}" cy="270" r="4.5" fill="var(--ink)"/><path d="M${x} 270L${x-(o.on?0:32)} ${o.on?156:172}" stroke="var(--ink)" stroke-width="5" stroke-linecap="round"/><path d="M${x-9} ${o.on?200:206}l18 18M${x+9} ${o.on?200:206}l-18 18" stroke="var(--ink)" stroke-width="3.5"/>`;
  s+=`<path d="M${x} 270V350" stroke="${run?col:off}" stroke-width="5"/>`;
  if(run)s+=`<path class="flowd" d="M${x} 80V350" opacity=".85"/>`});
 s+=`<ellipse cx="460" cy="200" rx="130" ry="26" fill="none" stroke="var(--ink)" stroke-width="3.5"/><text x="460" y="250" class="lab c s">toroide (transformador diferencial)</text>`;
 s+=`<rect x="450" y="290" width="22" height="46" fill="none" stroke="var(--ink)" stroke-width="3" opacity="0"/>`;
 s+=`<path d="M590 200H690V290" stroke="var(--ink)" stroke-width="3"/><rect x="665" y="290" width="50" height="40" fill="none" stroke="var(--ink)" stroke-width="3"/><text x="690" y="316" class="lab c s">ΔI</text>`;
 s+=`<path d="M300 232H660V170" stroke="var(--ink)" stroke-width="3" stroke-dasharray="9 7" opacity=".8" fill="none"/><g data-act="toggle"><rect x="676" y="130" width="90" height="56" rx="8" fill="transparent" stroke="var(--ink)" stroke-width="3"/><text x="721" y="154" class="lab c">Palanca</text><text x="721" y="174" class="lab c s">${o.on?'ON':o.trip?'DISPARÓ':'OFF'} (tocá)</text></g>`;
 s+=`<g data-act="test" style="cursor:pointer"><circle cx="560" cy="300" r="14" fill="#e5b81a" stroke="#000" stroke-width="2"/><text x="560" y="305" text-anchor="middle" style="font:900 13px system-ui;fill:#241a00">T</text></g><path d="M360 300H546M574 300H560" stroke="var(--ink)" stroke-width="2" stroke-dasharray="4 4" opacity=".5"/>`;
 s+=`<text x="740" y="240" class="lab s">○ anillo: fase y neutro lo atraviesan</text><text x="740" y="262" class="lab s">ΔI: relé que dispara con la diferencia</text><text x="740" y="284" class="lab s">T: pulsador de prueba</text>`;
 s+=`<text x="500" y="525" class="lab c s">Detecta la diferencia entre fase y neutro. No protege contra sobrecargas ni cortocircuitos.</text>`;
 return s}
})();
