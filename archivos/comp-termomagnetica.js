/* Componente "Llave termomagnética" (interruptor automático según IEC 60898-1). Usa comp-comun.js, comp-proteccion.js, comp-conexion.js y comp-calculo.js. */
(function(){
const{cl,fm,g,screw,glow,lbl,tag,title,heatCol,strip,DEFS,stroke4}=window.CPH,PRO=window.PRO,CON=window.CON;
/* modelo térmico: sin disparo hasta M0·In; tiempo = −τ·ln(1−(M0/m)²). M0 = 1,3 queda entre 1,13 (no dispara en 1 h) y 1,45 (dispara en menos de 1 h) */
const TAU=150,TAUC=300,M0=1.3;
const MAG={B:5,C:10,D:20},MAGLO={B:3,C:5,D:10};          /* múltiplos de In: disparo magnético seguro / límite inferior (IEC 60898-1) */
const SIT={n:.8,l:1.13,u:1.45,x:2.55,m5:5,m10:10,m20:20};
const SITN={n:'Normal (0,8 × In)',l:'1,13 × In',u:'1,45 × In',x:'2,55 × In',m5:'5 × In',m10:'10 × In',m20:'20 × In',cc:'Cortocircuito'};
const P0=[350,392],LB=280,TC=-27.5,TO=-50,LV=[672,330],H0=[585,430],FOC='#8b4a1e';
const CARGA_A=1800/220;                                  /* calefactor de la práctica de conexión */
const PARTES={
 palanca:{t:'Palanca',d:'Se sube para conectar (ON, I) y se baja para desconectar (OFF, O). Si la llave dispara sola, la palanca queda en una posición intermedia. Es de "disparo libre": aunque alguien la sostenga en ON a la fuerza, los contactos igual se abren.'},
 ventana:{t:'Indicador de posición',d:'Una ventanita muestra el estado real de los contactos: rojo = cerrados (circula corriente), verde = abiertos. Se confía en la ventana y no sólo en la palanca.'},
 borne_in:{t:'Borne superior (entrada, 1)',d:'Entra el cable de la fase (en una llave bipolar, también el neutro en el borne 3). El tornillo debe estar bien ajustado: un borne flojo calienta y puede provocar un incendio.'},
 borne_out:{t:'Borne inferior (salida, 2)',d:'Sale el cable hacia la carga. Se numera 2 (y 4) a la salida de cada polo.'},
 cont_fijo:{t:'Contacto fijo',d:'Pastilla de plata unida al borne de entrada. La plata conduce muy bien y resiste el desgaste del arco.'},
 brazo:{t:'Contacto móvil (brazo)',d:'Brazo de cobre que gira sobre su eje. Cerrado, apoya sobre el contacto fijo y deja pasar la corriente; abierto, la corta. Al abrirse con corriente se forma un arco eléctrico.'},
 resorte:{t:'Resorte de apertura',d:'Está estirado con los contactos cerrados. Cuando el cerrojo se suelta, el resorte tira del brazo y lo abre en pocos milisegundos, sin importar qué haga la mano.'},
 eslabon:{t:'Eslabón articulado (rodilla)',d:'Une la palanca con el brazo. En ON queda "trabado" por el cerrojo; al soltarse, la rodilla se pliega y los contactos se abren aunque la palanca esté sujeta (disparo libre).'},
 cerrojo:{t:'Cerrojo (disparador)',d:'Pieza que mantiene trabado el eslabón. Lo empuja el bimetal (sobrecarga) o el émbolo de la bobina (cortocircuito). Al girar, libera el mecanismo.'},
 barra:{t:'Barra de disparo',d:'Transmite el empuje del bimetal al cerrojo cuando se curva por el calor.'},
 bimetal:{t:'Lámina bimetálica (disparo térmico)',d:'Dos metales soldados que se dilatan distinto. La corriente la calienta; cuanto más corriente, más rápido se curva. Con 1,45 × In tarda minutos; con 2,5 × In, segundos. Es la protección contra sobrecargas, de tiempo inverso.'},
 trenza:{t:'Trenza flexible',d:'Conductor de cobre flexible que une el brazo móvil con el resto del circuito sin trabar su movimiento.'},
 bobina:{t:'Bobina y émbolo (disparo magnético)',d:'Pocas vueltas de cable grueso en serie con la carga. Con una corriente enorme (cortocircuito) su campo magnético lanza el émbolo contra el cerrojo en milésimas de segundo. No necesita calentarse.'},
 camara:{t:'Cámara de extinción del arco',d:'Placas de acero separadas. El arco se desplaza hacia ellas, se divide en arcos más cortos, se enfría y se apaga. De su tamaño depende el poder de corte.'},
 carcasa:{t:'Carcasa',d:'Plástico aislante autoextinguible. Se puede poner transparente para ver el mecanismo (control de transparencia del panel).'},
 riel:{t:'Riel DIN de 35 mm',d:'La llave se monta a presión sobre el riel en el tablero. Un solo módulo mide 18 mm de ancho.'}};
C({
 titulo:'La llave termomagnética',
 intro:'Interruptor automático que protege los cables y los aparatos. Tiene <b>dos protecciones</b> en una: una <b>térmica</b> (bimetal) que corta las sobrecargas lentas y una <b>magnética</b> (bobina) que corta los cortocircuitos al instante. Se puede volver a conectar después de disparar, sin cambiar nada. Poné la carcasa transparente para ver el mecanismo en acción.',
 vistaIni:'corte',T0:.85,
 vistas:[{id:'corte',t:'Corte lateral'},{id:'frontal',t:'Frontal'},{id:'interior',t:'Interior (sin carcasa)'},{id:'curvas',t:'Curvas de disparo'},{id:'conexion',t:'Conexión'}],
 capas:[{id:'carcasa',t:'Carcasa y riel'},{id:'tapa',t:'Palanca y ventana'},{id:'bornes',t:'Bornes y cables'},{id:'cont',t:'Contactos y conductores'},{id:'camara',t:'Cámara de extinción'},{id:'mec',t:'Resorte, eslabón y cerrojo'},{id:'bimetal',t:'Bimetal (térmico)'},{id:'magn',t:'Bobina (magnético)'},{id:'etiq',t:'Nombres de las piezas'}],
 btnOn:'🖐 Palanca en ON (conectar)',btnOff:'🖐 Palanca en OFF (desconectar)',
 fallas:[
  {id:'floja',t:'Tornillo flojo en un borne',d:'El borne calienta, calienta también al bimetal y la llave dispara con menos corriente (y puede incendiarse).'},
  {id:'ambiente',t:'Tablero muy caliente (50 °C)',d:'El bimetal parte más caliente: dispara antes. Por eso las llaves se "reducen" en tableros calurosos.'},
  {id:'soldado',t:'Contactos soldados',d:'Tras muchos cortocircuitos los contactos pueden quedar pegados: la llave "dispara" pero la corriente sigue pasando. ¡Peligroso!'}],
 fallaVista:{floja:'corte',ambiente:'corte',soldado:'corte'},
 partes:PARTES,
 controles:[
  {k:'sit',t:'choice',l:'Situación (corriente que circula)',v:'n',o:Object.keys(SITN).map(k=>[k,SITN[k]])},
  {k:'Icc',t:'slider',l:'Corriente de cortocircuito (si elegís «Cortocircuito»)',min:.5,max:12,st:.5,v:1.5,fmt:v=>fm(v,1)+' kA'},
  {k:'In',t:'choice',l:'Corriente asignada de la llave (In)',v:16,num:true,o:[[6,'6 A'],[10,'10 A'],[16,'16 A'],[20,'20 A'],[25,'25 A'],[32,'32 A'],[40,'40 A']]},
  {k:'cur',t:'choice',l:'Curva de disparo magnético',v:'C',o:[['B','B (3 a 5 × In)'],['C','C (5 a 10 × In)'],['D','D (10 a 20 × In)']]},
  {k:'pc',t:'choice',l:'Poder de corte de la llave',v:6,num:true,o:[[3,'3 kA'],[4.5,'4,5 kA'],[6,'6 kA'],[10,'10 kA']]},
  {k:'vel',t:'choice',l:'Velocidad del tiempo (térmico)',v:'10',num:true,o:[['1','Real ×1'],['10','×10'],['60','×60'],['300','×300']]}],
 acciones:[{id:'reset',t:'🔧 Reponer llave nueva'},{id:'enfriar',t:'❄ Esperar que se enfríe'}],
 accion(id,o){if(id==='reset'){this.reinicio(o);o.msg='Llave nueva colocada.';o.msgT=2.5}else if(id==='enfriar'){o.h=0;o.msg='Esperaste un rato: el bimetal se enfrió.';o.msgT=2.5}return['click']},
 init(){const o={on:false,trip:'',weld:false,dead:false,h:0,ca:1,hp:18,lt:0,pl:0,push:0,arc:0,arcI:0,spark:0,msg:'',msgT:0,tv:0,tTrip:null};CON.iniciar(o);return o},
 reinicio(o){o.on=false;o.trip='';o.weld=false;o.dead=false;o.h=0;o.ca=1;o.hp=18;o.lt=0;o.pl=0;o.push=0;o.arc=0;o.spark=0;o.tv=0;o.tTrip=null;o.msg='';o.msgT=0},
 /* corriente real que pasa y valores relacionados */
 corr(o,c){const p=c.p,In=+p.In,cur=p.cur,closed=o.on||o.weld;let I0;
  if(o.cx&&o.ev)I0=o.ev.I;else I0=p.sit==='cc'?(+p.Icc)*1000:(SIT[p.sit]||1)*In;
  const I=closed&&!o.dead?I0:0;return{I,I0,In,m:I/In,m0:I0/In,closed,mag:MAG[cur]||10,lo:MAGLO[cur]||5,pc:(+p.pc||6)*1000}},
 est(o){return{x:cl(o.h,0,1.2)}},
 paso(o,dt,c,t){const ev=[];if(dt<=0)return ev;const f=c.f;
  if(!c.coil){o.on=false;o.trip='';if(!f.soldado)o.weld=false}
  else if(!o.on&&!o.trip&&!o.dead&&!o.weld){if(o.h>.5){o.msg='El bimetal todavía está caliente: esperá a que se enfríe para volver a conectar.';o.msgT=3}else{o.on=true;o.tv=0;ev.push('clack')}}
  const k=this.corr(o,c),vel=+c.p.vel||10,mag=k.mag*k.In;
  /* calentamiento del bimetal (primer orden) */
  const m0=M0*(f.ambiente?.9:1),mm=k.m*(f.floja?1.18:1),tg=(mm/m0)*(mm/m0),de=dt*vel,n=Math.max(1,Math.ceil(de/.5)),h=de/n;
  for(let i=0;i<n;i++){const tau=tg>o.h?TAU:TAUC;o.h+=(tg-o.h)*(1-Math.exp(-h/tau))}
  o.h=Math.min(o.h,1.5);
  if(o.on||o.weld)o.tv+=de;
  if(o.on&&!o.dead){
   if(k.I>=mag)this.disparar(o,'mag',k,f,ev);
   else if(o.h>=1)this.disparar(o,'term',k,f,ev)}
  /* animaciones */
  const th=cl(o.h,0,1.05),mt=o.trip==='mag'?1:cl((k.m-2)/(k.mag-2),0,1)*(o.on?.12:0),pl=Math.max(o.pl,0);
  o.pl+=(mt-o.pl)*Math.min(1,dt*(mt>o.pl?45:5));
  o.push=Math.max(th,o.pl);
  const lt=o.trip?1:o.on?Math.min(.3,o.push*.3):0;o.lt+=(lt-o.lt)*Math.min(1,dt*28);
  const ca=(o.on||o.weld)?0:1;o.ca+=(ca-o.ca)*Math.min(1,dt*(ca>o.ca?(o.trip?36:16):16));
  const hp=o.on?-18:o.trip?0:18;o.hp+=(hp-o.hp)*Math.min(1,dt*20);
  if(o.arc>0)o.arc-=dt;if(o.spark>0)o.spark-=dt;if(o.msgT>0){o.msgT-=dt;if(o.msgT<=0)o.msg=''}
  return ev},
 disparar(o,tipo,k,f,ev){o.on=false;o.trip=tipo;o.tTrip=o.tv;ev.push('clack');
  if(k.I>=2.5*k.In){o.arc=.5;o.arcI=cl(Math.log10(k.I/k.In)/2,.3,1)}
  if(tipo==='mag')ev.push('spark');
  if(f.soldado){o.weld=true;o.msg='¡Los contactos están soldados! La llave disparó pero la corriente sigue pasando.';o.msgT=6}
  if(tipo==='mag'&&k.I>k.pc){o.dead=true;o.weld=true;o.spark=1.2;o.arc=1.2;o.arcI=1;o.msg='¡La corriente de cortocircuito superó el poder de corte de la llave: no pudo apagar el arco!';o.msgT=8;ev.push('spark','warn')}},
 /* tiempo previsto de disparo desde frío (segundos reales) */
 tPrev(k,f){if(k.I0<=0)return{t:null,txt:'—'};const mag=k.mag*k.In;if(k.I0>=mag)return{t:.01,txt:'instantáneo (≈ 10 ms)'};
  const m0=M0*(f.ambiente?.9:1),mm=k.m0*(f.floja?1.18:1);if(mm<=m0)return{t:Infinity,txt:'nunca (no dispara por el térmico)'};
  const q=m0/mm,t=-TAU*Math.log(1-q*q);return{t,txt:t<60?fm(t,1)+' s':t<3600?fm(t/60,1)+' min':fm(t/3600,1)+' h'}},
 lecturas(o,c){const k=this.corr(o,c),e=this.est(o),f=c.f,vel=+c.p.vel||10,pr=this.tPrev(k,f),run=k.closed&&k.I>0;
  const zona=k.m0>=k.lo&&k.m0<k.mag?' (zona de tolerancia: puede disparar al instante)':'';
  const est=o.dead?'DESTRUIDA (poder de corte superado)':o.trip==='mag'?'DISPARO MAGNÉTICO':o.trip==='term'?'DISPARO TÉRMICO':o.weld&&!o.on?'CONTACTOS SOLDADOS':o.on?'conectada':'desconectada (OFF)';
  const reads=[{l:'CORRIENTE',v:k.I0>=1000?fm(k.I0/1000,1)+' kA':fm(k.I0,1)+' A',on:run},{l:'MÚLTIPLO I / In',v:fm(k.m0,2)+' ×',on:null},{l:'UMBRAL MAGNÉTICO',v:fm(k.lo*k.In,0)+' a '+fm(k.mag*k.In,0)+' A',on:null},{l:'CALENTAMIENTO',v:Math.round(Math.min(e.x,1.2)*100)+' %',on:e.x<.5?null:false},{l:'DISPARO PREVISTO EN',v:pr.txt,on:null},{l:'ESTADO',v:est,on:o.on},{l:'PALANCA',v:o.on?'ON':o.trip?'intermedia (disparó)':'OFF',on:null},{l:'CONTACTOS',v:(o.on||o.weld)?'cerrados':'abiertos',on:o.on||o.weld?true:null}];
  let verdict;
  if(o.msg)verdict={cls:o.dead||o.weld?'bad':'warn',t:o.msg};
  else if(o.dead)verdict={cls:'bad',t:'Llave destruida: se debe reemplazar. El poder de corte (kA) tiene que ser mayor que la corriente de cortocircuito del lugar.'};
  else if(o.trip==='mag')verdict={cls:'bad',t:'Cortocircuito: la corriente superó el umbral magnético ('+fm(k.mag*k.In,0)+' A) y la bobina abrió los contactos en milisegundos. Hay que eliminar la falla antes de rearmar (OFF y luego ON).'};
  else if(o.trip==='term')verdict={cls:'bad',t:'Sobrecarga prolongada: el bimetal se curvó y disparó'+(o.tTrip?' tras '+fm(o.tTrip,1)+' s simulados':'')+'. Reducí la carga, esperá que se enfríe y rearmá (OFF y luego ON).'};
  else if(!k.closed)verdict={cls:'ok',t:'Llave desconectada: no pasa corriente.'};
  else if(k.m0<=1.0)verdict={cls:'ok',t:'Corriente normal ('+fm(k.m0,2)+' × In): ninguna protección actúa.'};
  else if(k.m0<=1.13)verdict={cls:'ok',t:'Hasta 1,13 × In la norma exige que NO dispare en 1 hora: una pequeña sobrecarga tolerable.'};
  else if(pr.t===Infinity)verdict={cls:'warn',t:'Sobrecarga leve ('+fm(k.m0,2)+' × In): el bimetal se calienta pero no llega a disparar. La corriente supera lo que el cable debería llevar: convendría revisar la carga.'};
  else verdict={cls:'warn',t:'Sobrecarga'+zona+': el bimetal se calienta. Dispararía en unos '+pr.txt+' (tiempo real). Cuanto mayor la corriente, antes dispara.'};
  return{reads,verdict}},
 pasos:[
  {t:'Palanca en OFF',coil:false,ini(o){C0(o)},p:{sit:'n'},hl:['palanca','ventana','brazo'],vista:'corte',x:'Con la palanca abajo (<b>OFF</b>) el brazo está levantado: el aire entre los contactos aísla el circuito y la ventana se ve <b>verde</b>. Poné la carcasa transparente con el control de transparencia para ver todo el mecanismo.'},
  {t:'Se conecta (ON)',coil:true,p:{sit:'n'},hl:['palanca','eslabon','brazo','cont_fijo'],x:'Al subir la palanca, el eslabón articulado empuja el brazo contra el contacto fijo y el cerrojo traba la rodilla. El resorte queda estirado. La corriente recorre: borne, contacto, brazo, trenza, bimetal, bobina y borne de salida.'},
  {t:'Sobrecarga: actúa el bimetal',coil:true,p:{sit:'x',vel:'10'},ini(o){C0(o)},hl:['bimetal','barra','cerrojo'],x:'Con <b>2,55 × In</b> la corriente calienta el bimetal. Se curva hacia la derecha, empuja la barra de disparo y ésta gira el cerrojo. La rodilla se libera y el resorte abre los contactos. Cuanto más corriente, antes ocurre: es la protección de <b>tiempo inverso</b>.'},
  {t:'Cortocircuito: actúa la bobina',coil:true,p:{sit:'cc',Icc:1.5},ini(o){C0(o)},hl:['bobina','cerrojo','camara'],x:'Con una corriente enorme, el campo de la <b>bobina</b> lanza el émbolo contra el cerrojo en milisegundos, sin esperar calentamiento. Los contactos se abren de golpe y aparece un <b>arco eléctrico</b>.'},
  {t:'El arco y la cámara de extinción',coil:true,p:{sit:'cc',Icc:1.5},ini(o){C0(o)},hl:['camara','brazo'],x:'El arco es una chispa potente entre los contactos que se separan. Las <b>placas de acero</b> lo atraen, lo cortan en arcos cortos y lo enfrían hasta apagarlo. Activá la <b>cámara lenta</b> para verlo mejor.'},
  {t:'Poder de corte',coil:true,p:{sit:'cc',Icc:8,pc:3},ini(o){C0(o)},hl:['camara','carcasa'],x:'Si la corriente de cortocircuito (8 kA) supera el <b>poder de corte</b> de la llave (3 kA), el arco no se apaga y la llave se destruye. Por eso se elige un poder de corte mayor que el cortocircuito del lugar.'},
  {t:'Rearme',coil:false,p:{sit:'n',pc:6},ini(o){C0(o)},hl:['palanca'],x:'Tras un disparo la palanca queda en posición intermedia. Para volver a conectar se baja a <b>OFF</b> y luego se sube a <b>ON</b> (probalo con el botón de palanca). Antes hay que eliminar la causa y esperar que el bimetal se enfríe.'},
  {t:'Las curvas de disparo',coil:true,p:{sit:'x'},ini(o){C0(o)},vista:'curvas',x:'El gráfico muestra cuánto tarda en disparar según cuántas veces supera la corriente a In. Abajo a la derecha, la zona magnética de la curva elegida (B, C o D). El punto sube con el tiempo hasta encontrarse con la curva.'}],
 usos:[
  {t:'Protección de cada circuito de una casa',x:'Cada circuito (luces, tomacorrientes, aire acondicionado) tiene su llave, de In acorde al cable. Si una falla, las demás siguen funcionando.',sim:true},
  {t:'Llave general del tablero',x:'Protege el conjunto de la instalación. Se elige con un poder de corte mayor que el cortocircuito en ese punto.'},
  {t:'Combinada con el disyuntor diferencial',x:'La termomagnética protege contra sobrecarga y cortocircuito; el diferencial, contra fugas a tierra (personas). Se usan juntos.',sim:true},
  {t:'Maniobra manual',x:'También sirve como interruptor para dejar un circuito sin tensión durante una reparación (siempre verificar con un instrumento).'}],
 ejercicios:[
  {q:'¿Qué hace el bimetal de una termomagnética?',o:['Corta los cortocircuitos al instante','Corta las sobrecargas lentas al calentarse y curvarse','Mide la tensión'],ok:1,why:'Es la protección térmica: cuanto mayor la sobrecarga, más rápido se curva y dispara.',ver:{vista:'corte',coil:true,p:{sit:'x'}}},
  {q:'¿Qué parte actúa en un cortocircuito?',o:['La bobina con su émbolo (magnético)','El bimetal','El resorte solamente'],ok:0,why:'La enorme corriente crea un campo magnético que lanza el émbolo y libera el cerrojo en milisegundos.',ver:{vista:'corte',coil:true,p:{sit:'cc',Icc:1.5}}},
  {q:'Una llave C16 conduce 16 A × 1,13 = 18 A. Según la norma, ¿puede disparar antes de 1 hora?',o:['No: debe aguantar al menos 1 hora','Sí, en segundos','Sólo si hay humedad'],ok:0,why:'A 1,13 × In no debe disparar en 1 h. A 1,45 × In debe disparar en menos de 1 h.',ver:{vista:'curvas',coil:true,p:{sit:'l',In:16,cur:'C'}}},
  {q:'¿Qué indica la letra de la curva (B, C o D)?',o:['El color de la palanca','A partir de cuántas veces In dispara el magnético','La cantidad de polos'],ok:1,why:'B: 3 a 5 × In · C: 5 a 10 × In · D: 10 a 20 × In.'},
  {q:'¿Para qué sirve la cámara de extinción del arco?',o:['Para guardar el cable','Para dividir, enfriar y apagar el arco al abrir','Para calentar el bimetal'],ok:1,why:'Las placas de acero cortan el arco en trozos y lo enfrían hasta apagarlo.'},
  {q:'La corriente de cortocircuito del tablero es 5 kA y la llave tiene 3 kA de poder de corte. ¿Qué pasa?',o:['Nada, dispara igual','La llave puede destruirse: no logra apagar el arco','Dispara más lento'],ok:1,why:'El poder de corte debe ser mayor o igual que la corriente de cortocircuito presunta.',ver:{vista:'corte',coil:true,p:{sit:'cc',Icc:5,pc:3}}},
  {q:'Una llave "dispara" pero la lámpara sigue encendida. ¿Qué puede haber pasado?',o:['Los contactos quedaron soldados','El bimetal está frío','La curva es B'],ok:0,why:'Tras cortocircuitos fuertes los contactos pueden pegarse: es una falla peligrosa y la llave debe cambiarse.',ver:{vista:'corte',coil:true,f:['soldado'],p:{sit:'cc',Icc:1.5}}},
  {q:'¿La termomagnética protege a una persona que toca la fase?',o:['Sí, siempre','No: para eso está el disyuntor diferencial','Sólo si es de curva D'],ok:1,why:'La corriente que pasa por una persona (decenas de mA) es muy chica para la termomagnética. Eso lo detecta el diferencial.'}],
 tabsExtra:[
  {id:'con',t:'Conectar',html:ctx=>CON.panel(E,ctx.o,ctx),bind:(root,ctx)=>CON.bind(E,root,ctx.o,ctx)},
  {id:'cal',t:'Calcular',html:()=>CALC.html('mcb','Elegí la llave que protege cada circuito: primero la corriente que consume la carga, después la In, la curva y el poder de corte. Resolvé los problemas (cada vez uno distinto) o usá la calculadora.'),bind:(root,ctx)=>CALC.bind('mcb',root,ctx)}],
 clic(act,o){if(act==='cx'){o.cx=!o.cx;return['click']}return CON.clic(E,o,act)},
 defs(){return DEFS},
 dibujar(view,o,c,ui){const e=this.est(o),k=this.corr(o,c),S={o,c,ui,e,k,inter:view==='interior',f:c.f};
  if(view==='frontal')return fro(S);if(view==='curvas')return cur(S);if(view==='conexion')return conx(S);return cor(S)},
 simbolo(o,c,ui){return iec({o,c,ui,e:this.est(o),k:this.corr(o,c)})}
});
function C0(o){o.h=0;o.on=false;o.trip='';o.weld=false;o.dead=false;o.tv=0}
function C(def){['est','corr','tPrev','disparar'].forEach(k=>def[k]=def[k].bind(def));window.COMPONENTES.termomagnetica=def}
const has=PRO.has;

/* ---------- corte lateral: el mecanismo en acción ---------- */
function cor(S){const{o,c,e,k,inter,ui,f}=S,t=ui.t,x=e.x,dx=22*Math.min(1,x),A=PRO.alfa(S);
 const th=TC+(TO-TC)*cl(o.ca,0,1),rad=th*Math.PI/180,ca=Math.cos(rad),sa=Math.sin(rad),pt=d=>[P0[0]+d*ca,P0[1]+d*sa];
 const run=k.closed&&k.I>0,hot=f.floja?cl(.55+x*.4,0,.9):0;
 let s=`<rect x="300" y="70" width="400" height="440" rx="14" fill="var(--cav)" opacity="${inter?.95:.55}"/>`;
 /* riel DIN y clip */
 s+=g(S,'carcasa','riel',`<g opacity="${Math.max(.45,A)}"><path d="M262 205H300V215H274V375H300V385H262Z" fill="url(#cMe)" stroke="#3a4450"/><rect x="300" y="456" width="34" height="36" rx="4" fill="url(#cPlL)" stroke="#0b0e11"/></g>`);
 /* flujo de corriente interior */
 const fl=run?`<path class="flowd" d="M646 70V290H598L590 268L350 392V408C350 430 412 420 420 446V500H462V474H560V500H646V510" pointer-events="none"/>`:'';
 /* contacto fijo y conductor superior */
 s+=g(S,'cont','cont_fijo',PRO.cu('M646 126V294H600',9)+`<rect x="570" y="286" width="62" height="12" rx="2" fill="url(#cCuV)" stroke="#4a2410"/>`+PRO.pastilla(582,280,38));
 /* bimetal, base, bobina */
 let bim=`<rect x="400" y="496" width="42" height="14" rx="3" fill="url(#cPlL)" stroke="#111"/>`+strip(420,500,446,dx);
 if(x>.35)bim=glow(420+dx*.4,470,34,'#ff5a1f',cl((x-.3)*.8,0,.7))+bim;
 s+=g(S,'bimetal','bimetal',bim);
 const tailY=444,tl=-30*o.lt*Math.PI/180;
 /* extremo de la cola del cerrojo (para apoyar la barra y el émbolo) */
 const rotp=(px,py,a)=>[H0[0]+(px-H0[0])*Math.cos(a)-(py-H0[1])*Math.sin(a),H0[1]+(px-H0[0])*Math.sin(a)+(py-H0[1])*Math.cos(a)];
 const q1=rotp(H0[0],444,tl),q2=rotp(H0[0],474,tl);
 s+=g(S,'mec','barra',PRO.barra(432+dx,446,q1[0]-4,446,7)+PRO.pasador(432+dx,446,5));
 const pt0=q2[0]-4,tip=Math.min(548+60*o.pl,pt0),bx=478+(tip-548);
 const coil=`<rect x="470" y="454" width="90" height="40" rx="5" fill="url(#cBob)" stroke="#6b5a2c"/><rect x="474" y="458" width="82" height="32" rx="3" fill="url(#pWind)" stroke="#4a2410"/>`+(run?glow(515,474,52,'#ff7a45',.12+.35*cl((k.m-1.5)/Math.max(1,k.mag-1.5),0,1)*(o.trip==='mag'?1:.6)):'')+`<rect x="${bx.toFixed(1)}" y="466" width="70" height="16" rx="3" fill="url(#pLam)" stroke="#27303b"/><rect x="${(bx+68).toFixed(1)}" y="464" width="8" height="20" fill="#c0392b"/>`;
 s+=g(S,'magn','bobina',coil);
 s+=g(S,'cont','trenza',`<path d="M350 402C348 430 408 418 ${(420+dx).toFixed(1)} 446" fill="none" stroke="#5a2a12" stroke-width="10" stroke-linecap="round"/><path d="M350 402C348 430 408 418 ${(420+dx).toFixed(1)} 446" fill="none" stroke="#d98d57" stroke-width="7" stroke-linecap="round"/><path d="M350 402C348 430 408 418 ${(420+dx).toFixed(1)} 446" fill="none" stroke="#5a2a12" stroke-width="7" stroke-linecap="round" stroke-dasharray="2 4" opacity=".6"/>`+PRO.cu('M420 502H462V474H470',8)+PRO.cu('M560 474V500H610',8));
 /* cámara de extinción */
 const arcP=o.arc>0?cl(1-o.arc/.5,0,1):0;
 s+=g(S,'camara','camara',PRO.placas(548,150,8,12,96,arcP,t,o.arc>0?cl(o.arc/.2,0,1)*o.arcI:0));
 /* cerrojo */
 const hook=`<g transform="${PRO.rot(-30*o.lt,H0[0],H0[1])}"><path d="M546 411L560 405L592 420L592 482L580 482L580 436L552 420Z" fill="url(#cPlL)" stroke="#111" stroke-width="1.4"/><path d="M552 413L580 424" stroke="#fff" stroke-opacity=".4" stroke-width="2"/></g>${PRO.pasador(H0[0],H0[1],7)}`;
 /* eslabón y palanca interior */
 const hp=o.hp,lr=hp*Math.PI/180,A0=[LV[0]-46*Math.cos(lr),LV[1]-46*Math.sin(lr)],B=pt(150);
 const K1=PRO.codo(A0,B,100,100,1),K2=PRO.codo(A0,B,100,100,-1),K=K1[1]>K2[1]?K1:K2;
 s+=g(S,'mec','cerrojo',hook);
 const att=pt(215);
 s+=g(S,'mec','resorte',PRO.springXY(att[0],att[1],452,122,12,9,'#aeb9c5')+PRO.pasador(452,122,6));
 s+=g(S,'mec','eslabon',PRO.barra(A0[0],A0[1],K[0],K[1],10)+PRO.barra(K[0],K[1],B[0],B[1],10)+PRO.pasador(K[0],K[1],7)+PRO.pasador(A0[0],A0[1],6)+PRO.pasador(B[0],B[1],6));
 /* brazo móvil */
 const brazo=`<g transform="${PRO.rot(th,P0[0],P0[1])}"><rect x="${P0[0]}" y="${P0[1]-9}" width="${LB}" height="18" rx="4" fill="${run?'url(#cCuH)':'url(#cCuH)'}" stroke="#6b2a10"/><path d="M${P0[0]+10} ${P0[1]-5}H${P0[0]+LB-12}" stroke="#ffe3c4" stroke-opacity=".6" stroke-width="2.4" stroke-linecap="round"/>${PRO.pastilla(P0[0]+LB-36,P0[1]+8,32)}</g>${PRO.pasador(P0[0],P0[1],11)}`;
 s+=g(S,'cont','brazo',brazo);
 /* palanca (parte interior) */
 s+=g(S,'tapa','palanca',`<g transform="${PRO.rot(hp,LV[0],LV[1])}"><rect x="${LV[0]-46}" y="${LV[1]-6}" width="74" height="12" rx="5" fill="url(#cPlL)" stroke="#111"/></g>${PRO.pasador(LV[0],LV[1],9)}`);
 /* arco */
 if(o.arc>0&&has(S,'cont')){const tU=[P0[0]+266*ca-14*sa,P0[1]+266*sa+14*ca];const q=cl(o.arc/.5,0,1),a=o.arcI*(.4+.6*q);const B2=[592+arcP*34,282-arcP*90];s+=PRO.arco(tU,B2,t,a)+(o.arcI>.6?H_sp(B2,t):'')}
 if(o.spark>0&&has(S,'cont'))s+=window.CPH.sparks(592,278,t,1);
 s+=fl;
 /* carcasa y frente */
 s+=g(S,'carcasa','carcasa',PRO.carcasa(S,300,70,400,440,14)+(inter?'':`<rect x="688" y="70" width="12" height="440" rx="3" fill="#0b0e11" opacity="${(.45*A).toFixed(2)}"/>`));
 if(o.dead){s+=`<g pointer-events="none"><rect x="300" y="70" width="400" height="440" rx="14" fill="#000" opacity=".35"/><path d="M420 70L440 130L410 190L450 240M610 510L590 450L630 400" stroke="#000" stroke-width="3" fill="none" opacity=".7"/>${PRO.humo(560,200,t,1)}</g>`}
 /* palanca exterior y ventana */
 const gr=`<g transform="${PRO.rot(hp,LV[0],LV[1])}"><rect x="${LV[0]+28}" y="${LV[1]-16}" width="82" height="32" rx="9" fill="url(#cKnob)" stroke="#000" stroke-width="2"/><rect x="${LV[0]+32}" y="${LV[1]-12}" width="14" height="24" rx="5" fill="#fff" opacity=".14"/><path d="M${LV[0]+60} ${LV[1]-9}V${LV[1]+9}M${LV[0]+72} ${LV[1]-9}V${LV[1]+9}M${LV[0]+84} ${LV[1]-9}V${LV[1]+9}" stroke="#000" stroke-opacity=".5" stroke-width="2.4"/></g>`;
 s+=g(S,'tapa','palanca',gr);
 const vc=PRO.colVentana(o.on||o.weld,o.trip&&!o.weld);
 s+=g(S,'tapa','ventana',`<rect x="684" y="388" width="34" height="52" rx="6" fill="#0b0e11" stroke="#000"/><rect x="689" y="393" width="24" height="42" rx="3" fill="${vc}"/><text x="701" y="419" text-anchor="middle" style="font:800 12px system-ui;fill:#fff">${(o.on||o.weld)?'I':'O'}</text>`);
 /* bornes y cables exteriores */
 let bi=PRO.bornera(610,62,'up',FOC,hot,20),bo=PRO.bornera(610,458,'down',FOC,hot,40);
 s+=g(S,'bornes','borne_in',bi)+g(S,'bornes','borne_out',bo);
 if(run)s+=`<path class="flowd" d="M646 18V70M646 510V556" pointer-events="none"/>`;
 if(has(S,'bornes'))s+=tag(596,100,'1','s')+tag(596,508,'2','s');
 if(has(S,'etiq'))s+=lbl(270,150,'Resorte','l',440,150)+lbl(270,230,'Brazo (contacto móvil)','l',430,300)+lbl(270,300,'Eslabón articulado','l',470,360)+lbl(270,430,'Bimetal','l',410,470)+lbl(270,490,'Bobina y émbolo','l',470,476)+lbl(730,160,'Cámara de extinción','r',640,170)+lbl(730,270,'Contacto fijo','r',620,288)+lbl(730,340,'Palanca','r',760,330)+lbl(730,470,'Cerrojo','r',600,462)+lbl(270,400,'Trenza','l',360,415);
 s+=`<text x="480" y="552" class="lab c s">Esquema simplificado: la forma exacta cambia según el fabricante.</text>`;
 s+=title(inter?'Interior: el mecanismo sin carcasa':'Corte lateral (subí la transparencia para ver el mecanismo)');
 return s}
const H_sp=(p,t)=>window.CPH.sparks(p[0],p[1],t,2);

/* ---------- vista frontal (módulos bipolares) ---------- */
function fro(S){const{o,c,k}=S,a=PRO.alfa(S),A=Math.max(.5,a),In=+c.p.In,cu=c.p.cur,pc=c.p.pc;
 const y=o.on?150:o.trip?190:230;
 let s=`<rect x="360" y="80" width="280" height="430" fill="var(--cav)" opacity=".4"/>`;
 s+=g(S,'carcasa','carcasa',`<rect x="370" y="90" width="260" height="410" rx="14" fill="url(#cPl)" stroke="#0b0e11" stroke-width="2"/><rect x="370" y="90" width="260" height="410" rx="14" fill="url(#cPlH)"/><path d="M500 100V490" stroke="#000" stroke-opacity=".5" stroke-width="2"/><rect x="470" y="496" width="60" height="22" rx="5" fill="url(#cPlL)" stroke="#0b0e11"/>`);
 s+=g(S,'tapa','palanca',`<rect x="392" y="130" width="216" height="170" rx="10" fill="#101317" stroke="#000"/><text x="500" y="152" text-anchor="middle" style="font:800 14px system-ui;fill:#f0f4f8">I · ON</text><text x="500" y="292" text-anchor="middle" style="font:800 14px system-ui;fill:#f0f4f8">O · OFF</text><rect x="402" y="${y}" width="196" height="60" rx="10" fill="url(#cKnob)" stroke="#000" stroke-width="2"/><path d="M430 ${y+16}H570M430 ${y+30}H570M430 ${y+44}H570" stroke="#000" stroke-opacity=".5" stroke-width="2.4"/><rect x="408" y="${y+4}" width="184" height="12" rx="5" fill="#fff" opacity=".12"/>`);
 s+=g(S,'tapa','ventana',`<rect x="440" y="314" width="120" height="30" rx="6" fill="#0b0e11" stroke="#000"/><rect x="446" y="319" width="108" height="20" rx="3" fill="${PRO.colVentana(o.on||o.weld,o.trip&&!o.weld)}"/><text x="500" y="334" text-anchor="middle" style="font:800 12px system-ui;fill:#fff">${(o.on||o.weld)?'CERRADA · ON':o.trip?'DISPARÓ':'ABIERTA · OFF'}</text>`);
 s+=`<g><rect x="388" y="360" width="224" height="124" rx="6" fill="#e9eef3"/><text x="500" y="404" text-anchor="middle" style="font:900 38px system-ui;fill:#10202e">${cu}${In}</text><text x="500" y="426" text-anchor="middle" style="font:700 12px system-ui;fill:#10202e">230/400 V~ · 50 Hz</text><text x="500" y="445" text-anchor="middle" style="font:600 12px system-ui;fill:#10202e">IEC 60898-1 · 2 polos</text><rect x="440" y="454" width="120" height="22" rx="3" fill="none" stroke="#10202e" stroke-width="2"/><text x="500" y="470" text-anchor="middle" style="font:800 14px system-ui;fill:#10202e">${fm(+pc*1000,0)}</text></g>`;
 let bn='';[430,570].forEach((x,i)=>{bn+=`<rect x="${x-32}" y="68" width="64" height="26" rx="4" fill="url(#cMe)" stroke="#3a4450"/>${screw(x,56,11,20+i*40)}<rect x="${x-32}" y="500" width="64" height="26" rx="4" fill="url(#cMe)" stroke="#3a4450"/>${screw(x,538,11,50+i*30)}`});
 s+=g(S,'bornes','borne_in',bn)+tag(430,36,'1','s')+tag(570,36,'3','s')+tag(430,556,'2','s')+tag(570,556,'4','s');
 s+=`<text x="690" y="120" class="lab s">Curva ${cu}: dispara entre ${MAGLO[cu]} y ${MAG[cu]} × In</text><text x="690" y="142" class="lab s">(${fm(MAGLO[cu]*In,0)} a ${fm(MAG[cu]*In,0)} A)</text><text x="690" y="440" class="lab s">Poder de corte: ${fm(+pc,1)} kA</text>`;
 s+=`<text x="310" y="232" class="lab r s">palanca</text><text x="310" y="330" class="lab r s">indicador de posición</text><text x="310" y="420" class="lab r s">datos de la llave</text>`;
 return s+title('Vista frontal: llave bipolar de dos módulos')}

/* ---------- curvas de disparo ---------- */
function cur(S){const{o,c,k,f}=S,cu=c.p.cur,In=k.In,X=m=>130+Math.log10(cl(m,1,100))*385,Y=t=>500-(Math.log10(cl(t,.005,1e4))+2.3)*68;
 let s=`<rect x="130" y="72" width="770" height="428" fill="var(--p)" opacity=".85" stroke="var(--line)"/>`;
 for(const t of [.01,.1,1,10,100,1000,1e4]){s+=`<path d="M130 ${Y(t)}H900" stroke="var(--line)" stroke-width="1" opacity=".6"/><text x="122" y="${Y(t)+4}" class="lab r s">${t>=1000?(t/1000)+' mil s':t>=1?t+' s':fm(t,2)+' s'}</text>`}
 for(const m of [1,2,3,5,10,20,30,50,100]){s+=`<path d="M${X(m)} 72V500" stroke="var(--line)" stroke-width="1" opacity=".6"/><text x="${X(m)}" y="520" class="lab c s">${m}</text>`}
 s+=`<text x="515" y="548" class="lab c">Corriente / In (veces)</text><text x="52" y="290" class="lab c" transform="rotate(-90 52 290)">Tiempo de disparo</text>`;
 /* banda térmica de la curva elegida */
 const tt=m=>-TAU*Math.log(1-(M0/m)*(M0/m)),hi=MAG[cu],lo=MAGLO[cu];
 const ms=[];for(let i=0;i<=60;i++){const m=1.34*Math.pow(lo/1.34,i/60);ms.push(m)}
 const up=ms.map(m=>[X(m),Y(Math.min(1e4,tt(m)*1.3))]),dn=ms.map(m=>[X(m),Y(Math.max(.02,tt(m)*.4))]);
 s+=`<path d="M${up.map(p=>p[0].toFixed(1)+' '+p[1].toFixed(1)).join('L')}L${dn.reverse().map(p=>p[0].toFixed(1)+' '+p[1].toFixed(1)).join('L')}Z" fill="#ff9a3d" opacity=".35" stroke="#ff9a3d" stroke-width="1.5"/>`;
 s+=`<rect x="${X(lo)}" y="${Y(.1)}" width="${X(hi)-X(lo)}" height="${Y(.005)-Y(.1)}" fill="#ff6b6b" opacity=".35" stroke="#ff6b6b" stroke-dasharray="5 4"/><rect x="${X(hi)}" y="${Y(.1)}" width="${X(100)-X(hi)}" height="${Y(.005)-Y(.1)}" fill="#ff6b6b" opacity=".6"/>`;
 s+=`<text x="${X(Math.sqrt(lo*hi))}" y="${Y(.02)}" class="lab c s" style="${stroke4}">magnético (${lo}–${hi} × In)</text><text x="${X(15)}" y="${Y(.02)-24}" class="lab c s" style="${stroke4}">instantáneo</text><text x="${X(2.6)}" y="${Y(300)}" class="lab c s" style="${stroke4}">térmico (bimetal)</text>`;
 /* puntos de la norma */
 s+=`<circle cx="${X(1.13)}" cy="${Y(3600)}" r="6" fill="#5ce0a0" stroke="#000"/><text x="${X(1.13)+10}" y="${Y(3600)+22}" class="lab s" style="${stroke4}">1,13 × In: no dispara en 1 h</text><circle cx="${X(1.45)}" cy="${Y(3600)}" r="6" fill="#ffd65a" stroke="#000"/><text x="${X(1.45)+10}" y="${Y(3600)-8}" class="lab s" style="${stroke4}">1,45 × In: dispara en menos de 1 h</text><rect x="${X(2.55)-6}" y="${Y(60)}" width="12" height="${Y(1)-Y(60)}" rx="3" fill="#79d9f1" opacity=".8"/><text x="${X(2.55)+12}" y="${Y(8)}" class="lab s" style="${stroke4}">2,55 × In: entre 1 y 60 s</text>`;
 /* punto de funcionamiento y recorrido */
 const m=Math.max(1,Math.min(100,k.m0)),pr=this_t(k,f);
 if(k.m0>1){const yy=pr===Infinity?Y(1e4):Y(pr);s+=`<path d="M${X(m)} 500V${yy}" stroke="#fff" stroke-width="1.5" stroke-dasharray="4 4" opacity=".6"/><circle cx="${X(m)}" cy="${yy}" r="8" fill="none" stroke="#fff" stroke-width="3"/><text x="${X(m)}" y="${yy-14}" class="lab c s" style="${stroke4}">${pr===Infinity?'no dispara':'previsto'}</text>`;
  if(k.closed&&o.on&&k.I>0){const tv=Math.max(.005,o.tv);s+=`<circle cx="${X(m)}" cy="${Y(tv)}" r="7" fill="#ff4d4d" stroke="#000" stroke-width="2"/><text x="${X(m)+14}" y="${Y(tv)+4}" class="lab s" style="${stroke4}">ahora: ${tv<60?fm(tv,1)+' s':fm(tv/60,1)+' min'}</text>`}}
 else s+=`<text x="515" y="300" class="lab c">Con I ≤ In la llave no se calienta de más: no hay punto de disparo.</text>`;
 s+=`<text x="520" y="64" class="lab c s">Curva ${cu} · In = ${In} A · el punto rojo sube con el tiempo (simulado) hasta la curva; los límites son típicos e ilustrativos</text>`;
 return s+title('Curvas de disparo (tiempo – corriente)')}
function this_t(k,f){if(k.I0<=0)return Infinity;if(k.I0>=k.mag*k.In)return .01;const m0=M0*(f.ambiente?.9:1),mm=k.m0*(f.floja?1.18:1);if(mm<=m0)return Infinity;const q=m0/mm;return-TAU*Math.log(1-q*q)}

/* ---------- práctica de conexión ---------- */
const E={key:'mcb',titulo:'Conectá la llave termomagnética',
 ayuda:'Un calefactor de 1 800 W (8,2 A) se alimenta desde el tablero. Unilo con una llave <b>bipolar</b> que corte fase y neutro, y conectá la <b>tierra</b> al cuerpo metálico del calefactor.',
 cajas:[{x:30,y:130,w:200,h:300,t:'Red 220 V · 50 Hz',sub:'tablero'},{x:380,y:100,w:240,h:370,t:'Q1 · Termomagnética 2P',sub:'un aparato, dos polos'},{x:770,y:130,w:200,h:300,t:'Calefactor 1 800 W',sub:'8,2 A a 220 V'}],
 term:[{id:'SL',x:222,y:200,rol:'L',lab:'Fase',side:'r'},{id:'SN',x:222,y:280,rol:'N',lab:'Neutro',side:'r'},{id:'SPE',x:222,y:360,rol:'PE',lab:'Tierra',side:'r'},
  {id:'T1',x:450,y:196,lab:'1',side:'t'},{id:'T3',x:550,y:196,lab:'3',side:'t'},{id:'T2',x:450,y:436,lab:'2',side:'b'},{id:'T4',x:550,y:436,lab:'4',side:'b'},
  {id:'LL',x:778,y:200,rol:'L',lab:'Fase',side:'l'},{id:'LN',x:778,y:280,rol:'N',lab:'Neutro',side:'l'},{id:'LPE',x:778,y:360,rol:'PE',lab:'Tierra',side:'l'}],
 pasa:o=>(o.on||o.weld)?[['T1','T2'],['T3','T4']]:[],
 solucion:[['SL','T1'],['SN','T3'],['T2','LL'],['T4','LN'],['SPE','LPE']],
 eval(o,W){const ns=CON.red(E,W,[]),ne=CON.red(E,W,[['T1','T2'],['T3','T4']]),items=[];
  const Lne=ne.con('SL','LL'),Lns=ns.con('SL','LL'),Nne=ne.con('SN','LN'),Nns=ns.con('SN','LN'),PEc=ns.con('SPE','LPE'),toca=['T1','T2','T3','T4'].some(q=>ns.con('SPE',q));
  const mix=N=>['SL','SN','SPE','LL','LN','LPE'].some(q=>N.roles(q).size>1);
  const corto=mix(ns)?'libre':mix(ne)?'dev':null;
  if(!W.length)return{items,ok:false,I:0,carga:false,corto:null};
  items.push(!Lne?{k:'pend',t:'La fase todavía no llega al calefactor.'}:Lns?{k:'bad',t:'La fase llega al calefactor sin pasar por la llave: queda sin protección contra sobrecargas.'}:{k:'ok',t:'La fase pasa por la llave termomagnética.'});
  items.push(!Nne?{k:'pend',t:'El neutro todavía no llega al calefactor.'}:Nns?{k:'warn',t:'El neutro va directo, sin pasar por la llave: funciona, pero con la llave abierta el neutro sigue conectado. Con una llave bipolar se corta fase y neutro.'}:{k:'ok',t:'Fase y neutro pasan por la llave: al abrir se corta todo.'});
  items.push(!PEc?{k:'pend',t:'Falta unir la tierra con el cuerpo metálico del calefactor.'}:toca?{k:'bad',t:'La tierra nunca debe pasar por la llave: un conductor de protección no se interrumpe.'}:{k:'ok',t:'La tierra va directa al cuerpo del calefactor.'});
  if(corto)items.push({k:'bad',t:corto==='libre'?'¡Cortocircuito antes de la llave! Dos conductores de distinto color quedaron unidos: la llave no lo ve, sólo lo corta la protección general. Sacá ese cable.':'¡Cortocircuito aguas abajo de la llave! Dos conductores distintos están unidos: la llave debe dispararse.'});
  if(ns.con('SL','T3')||ns.con('SN','T1')||ns.con('SL','T4')||ns.con('SN','T2'))items.push({k:'warn',t:'La fase entró por el borne del neutro (o al revés): eléctricamente puede funcionar, pero se pierde el orden de colores y bornes.'});
  if(ns.con('SL','T2')||ns.con('SN','T4'))items.push({k:'warn',t:'Alimentás la llave por abajo: la mayoría lo admite, pero lo normal es entrar por los bornes superiores (1 y 3).'});
  const ok=Lne&&!Lns&&Nne&&!Nns&&PEc&&!toca&&!corto,vivo=Lne&&Nne&&!corto;
  const I=corto==='dev'?3000:vivo?((Lns&&Nns)?0:CARGA_A):0;
  return{items,ok,I,carga:vivo,corto,corriente:i=>{if(!vivo||!(o.on||o.weld)||!o.cx)return false;const r=CON.rolDe(E,ne,W[i][0]);return r==='L'||r==='N'}}},
 pruebas(o,ctx){return`<p class="note" style="margin:6px 0 0">Con el circuito energizado, probá desde <b>Operar</b>: subí la palanca y observá el calefactor. Si conectaste una llave de 6 A (menos que los 8,2 A de la carga), dispara por sobrecarga: la <b>In</b> se elige mayor o igual que la corriente de la carga.</p>`}};
function conx(S){const{o,c,k}=S,ev=o.ev||CON.evaluar(E,o),vivo=o.cx&&(o.on||o.weld)&&ev.carga&&!o.dead;
 const antes=`<g data-act="cx" style="cursor:pointer"><rect x="400" y="30" width="200" height="44" rx="22" fill="${o.cx?'#7a5a00':'var(--p)'}" stroke="${o.cx?'#ffd65a':'var(--line)'}" stroke-width="3"/><text x="500" y="58" class="lab c">⚡ Energizado: ${o.cx?'SÍ':'NO'} (tocá)</text></g>`;
 const q=(o.on||o.weld);
 const med=`<g data-act="toggle" style="cursor:pointer"><rect x="440" y="240" width="120" height="150" rx="12" fill="#101317" stroke="#000" stroke-width="2"/><rect x="450" y="${q?248:o.trip?288:336}" width="100" height="44" rx="8" fill="url(#cKnob)" stroke="#000"/><text x="500" y="382" text-anchor="middle" style="font:800 12px system-ui;fill:${PRO.colVentana(q,o.trip&&!o.weld)}">${q?'ON':o.trip?'DISPARÓ':'OFF'}</text></g>`;
 const des=`<g pointer-events="none"><path d="M810 190h70v52h-70z" fill="none" stroke="${vivo?'#ff9a3d':'var(--ink)'}" stroke-width="4"/>${[0,1,2,3].map(i=>`<path d="M${818+i*16} 196v40" stroke="${vivo?'#ffb66b':'var(--mu)'}" stroke-width="5" stroke-linecap="round"/>`).join('')}${vivo?glow(845,216,70,'#ff7a1f',.55):''}${vivo?`<text x="845" y="276" class="lab c s" style="${stroke4}">${fm(Math.min(k.I0,99),1)} A</text>`:''}${o.dead?PRO.humo(500,260,S.ui.t,1):''}${(o.cx&&ev.corto==='libre')?window.CPH.sparks(300,240,S.ui.t,3)+PRO.humo(300,240,S.ui.t,1):''}${(o.cx&&ev.corto==='dev'&&(o.trip||o.arc>0))?window.CPH.sparks(500,330,S.ui.t,4):''}</g>`;
 const aviso=`<text x="500" y="520" class="lab c s">${o.cx?(o.dead?'La llave se destruyó: el cortocircuito superó su poder de corte.':o.trip?'La llave disparó. Bajá la palanca a OFF y subila de nuevo para rearmar.':(o.on?'Circuito en marcha.':'Subí la palanca a ON para dar paso a la corriente.')):'Energizá el circuito cuando termines de conectar.'}</text>`;
 return CON.vista(S,E,o,{antes,medio:med,despues:des+aviso})+title('Práctica de conexión')}

/* ---------- símbolo IEC ---------- */
function iec(S){const{o,k}=S,run=k.closed&&k.I>0,Lc='#b5733e',Nc='#4db5ee',off='#566678';
 let s=`<text x="500" y="26" class="lab c t">Símbolo IEC de la llave termomagnética bipolar (Q1)</text>`;
 [[360,'Fase',Lc],[560,'Neutro',Nc]].forEach(([x,n,col],i)=>{s+=`<text x="${x}" y="70" class="lab c s">${n}</text><path d="M${x} 80V150" stroke="${col}" stroke-width="5"/><text x="${x-14}" y="146" class="lab r s">${1+i*2}</text>`;
  s+=`<circle cx="${x}" cy="150" r="4.5" fill="var(--ink)"/><circle cx="${x}" cy="260" r="4.5" fill="var(--ink)"/><path d="M${x} 260L${x-(o.on?0:30)} ${o.on?156:170}" stroke="var(--ink)" stroke-width="5" stroke-linecap="round"/><path d="M${x-9} ${o.on?190:195}l18 18M${x+9} ${o.on?190:195}l-18 18" stroke="var(--ink)" stroke-width="3.5"/>`;
  s+=`<path d="M${x} 260V340" stroke="${run?col:off}" stroke-width="5"/><text x="${x-14}" y="344" class="lab r s">${2+i*2}</text>`;
  if(run)s+=`<path class="flowd" d="M${x} 80V340" opacity=".85"/>`});
 s+=`<rect x="388" y="226" width="40" height="22" fill="none" stroke="var(--ink)" stroke-width="3"/><text x="408" y="243" class="lab c s">I&gt;</text><rect x="388" y="196" width="40" height="22" fill="none" stroke="var(--ink)" stroke-width="3"/><text x="408" y="213" class="lab c s">I&gt;&gt;</text>`;
 s+=`<path d="M300 200H660" stroke="var(--ink)" stroke-width="3" stroke-dasharray="9 7" opacity=".8"/><path d="M660 200V160" stroke="var(--ink)" stroke-width="3" stroke-dasharray="9 7"/><g data-act="toggle"><rect x="672" y="130" width="90" height="60" rx="8" fill="transparent" stroke="var(--ink)" stroke-width="3"/><text x="717" y="156" class="lab c">Palanca</text><text x="717" y="176" class="lab c s">${o.on?'ON':o.trip?'DISPARÓ':'OFF'} (tocá)</text></g>`;
 s+=`<text x="680" y="250" class="lab s">I&gt;  protección térmica (sobrecarga)</text><text x="680" y="272" class="lab s">I&gt;&gt; protección magnética (cortocircuito)</text><text x="680" y="294" class="lab s">× en el contacto: interruptor automático</text>`;
 s+=`<rect x="410" y="400" width="100" height="60" rx="6" fill="none" stroke="var(--ink)" stroke-width="4"/><text x="460" y="436" class="lab c">Carga</text>`;
 ['M360 340V430H410','M560 340V430H510'].forEach((p,i)=>s+=`<path d="${p}" stroke="${run?[Lc,Nc][i]:off}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);
 s+=`<text x="500" y="525" class="lab c s">Un solo aparato: interruptor manual + protección térmica (I&gt;) + protección magnética (I&gt;&gt;).</text>`;
 return s}
})();
