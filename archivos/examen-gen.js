/* Generador de problemas de dificultad creciente (modo examen en vivo y, más adelante, niveles de la app de celulares).
   GEN.make(nivel) devuelve un problema nuevo (variante al azar) que circuito-redes.html resuelve con el mouse:
   - 'wire'  : armar un circuito con cables (el color sigue la polaridad: rojo al +, celeste al −)
   - 'led'   : armar el LED eligiendo el resistor correcto
   - 'fault' : medir y reemplazar el componente quemado
   - 'quiz'  : circuito ya armado + pregunta de opción múltiple (se mide con el multímetro)
   Niveles 1 a 12 con dificultad creciente; del 13 en adelante se repiten tipos con variantes más grandes. */
window.GEN=(function(){
const rnd=Math.random,pick=a=>a[Math.floor(rnd()*a.length)],shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const dc=s=>String(s).replace('.',',');
const bat=v=>({id:'B',t:'bat',v,name:'Batería '+dc(v)+' V'});
const sw=id=>({id,t:'sw',name:'Llave '+id});
const lampW=(id,vr,w)=>({id,t:'lamp',r:+(vr*vr/w).toFixed(2),vr,w,name:'Lámpara '+id});
const res=(id,r)=>({id,t:'res',r,name:'Resistor '+id});
const led=id=>({id,t:'led',name:'LED'});
const pairs=a=>a.map(s=>s.split('-'));
const fR=r=>r>=1000?dc(+(r/1000).toFixed(2))+' kΩ':dc(+r.toFixed(1))+' Ω';
const fI=i=>{if(i>=1)return dc(i.toFixed(2))+' A';const m=i*1000;return dc(m.toFixed(m<10?2:m<100?1:0))+' mA'};
const fV=v=>dc(+v.toFixed(2))+' V';
const E12=[10,12,15,18,22,27,33,39,47,56,68,82],E=[];[1,10,100,1000,10000].forEach(k=>E12.forEach(x=>E.push(x*k)));
const nearest=t=>E.reduce((b,x)=>Math.abs(Math.log(x/t))<Math.abs(Math.log(b/t))?x:b,E[0]);
const uid=()=>Math.random().toString(36).slice(2,6);

const NAMES=['','Circuito simple','Dos lámparas en serie','Dos lámparas en paralelo','Tensión en serie','Dos ramas con llave propia','¿Qué pasa si se quema una?','Circuito mixto de lámparas','Corriente en serie','LED con resistor','Buscá la falla','Resistencia equivalente','Mixto de resistores'];

function base(level,kind,o){return Object.assign({id:'gen'+level+'-'+uid(),gen:true,hidden:true,group:'examen',level,kind,tip:'',explain:''},o)}
/* opciones de una pregunta: la correcta y distractores distintos, mezclados */
function quiz(q,correct,wrong){const seen=new Set([correct]),opts=[correct];shuf(wrong).forEach(w=>{if(!seen.has(w)){seen.add(w);opts.push(w)}});const m=shuf(opts.slice(0,4).includes(correct)?opts.slice(0,4):[correct].concat(opts.slice(1,4)));return{q,opts:m,ans:m.indexOf(correct)}}

const G={
 1(){const vr=pick([6,9,12]),w=pick([3,5,6,10]);
  return base(1,'wire',{title:'Armá el circuito simple',desc:'Batería, llave y una lámpara.',goal:'Conectá la batería de '+vr+' V, la llave y la lámpara para que encienda. Recordá: cable rojo al polo + y celeste al polo −.',
   explain:'La corriente sale del +, pasa por la llave y la lámpara y vuelve al −.',comps:[bat(vr),sw('S1'),lampW('L1',vr,w)],sol:pairs(['B.p-S1.a','S1.b-L1.a','L1.b-B.n'])})},
 2(){const vl=pick([3,6]),w=pick([3,5,6]);
  return base(2,'wire',{title:'Dos lámparas en serie',desc:'Una a continuación de la otra.',goal:'Conectá las dos lámparas en SERIE (un solo camino) con la llave y la batería de '+2*vl+' V.',
   explain:'En serie hay un único camino y las lámparas se reparten la tensión.',comps:[bat(2*vl),sw('S1'),lampW('L1',vl,w),lampW('L2',vl,w)],sol:pairs(['B.p-S1.a','S1.b-L1.a','L1.b-L2.a','L2.b-B.n'])})},
 3(){const vr=pick([6,9,12]),w=pick([3,5,6]);
  return base(3,'wire',{title:'Dos lámparas en paralelo',desc:'Cada una con su propio camino.',goal:'Conectá las dos lámparas en PARALELO (cada una directo a la llave y a la batería de '+vr+' V).',
   explain:'En paralelo cada lámpara recibe la tensión completa de la batería.',comps:[bat(vr),sw('S1'),lampW('L1',vr,w),lampW('L2',vr,w)],sol:pairs(['B.p-S1.a','S1.b-L1.a','S1.b-L2.a','L1.b-B.n','L2.b-B.n'])})},
 4(){const n=pick([2,3]),vb=pick([6,9,12]),vr=vb/n,w=pick([3,5,6]),ids=['L1','L2','L3'].slice(0,n);
  const sol=['B.p-S1.a','S1.b-L1.a'];for(let i=0;i<n-1;i++)sol.push(ids[i]+'.b-'+ids[i+1]+'.a');sol.push(ids[n-1]+'.b-B.n');
  const c=fV(vb/n);
  return{...base(4,'quiz',{title:'Tensión en serie',desc:'Medí y respondé.',goal:'El circuito ya está armado. Medí con el multímetro (tocá una lámpara) y respondé.',
   explain:'En serie la tensión de la batería se reparte entre las lámparas iguales: '+fV(vb)+' ÷ '+n+' = '+c+' cada una.',comps:[bat(vb),sw('S1'),...ids.map(id=>lampW(id,vr,w))],sol:pairs(sol),prewired:true,preClosed:true}),
   quiz:quiz('¿Cuántos voltios recibe cada lámpara? (batería de '+fV(vb)+', '+n+' lámparas iguales en serie)',c,[fV(vb),fV(vb/(n+1)),fV(vb*2/n),fV(vb/n/2)])}},
 5(){const vr=pick([6,9,12]),w=pick([3,5,6]);
  return base(5,'wire',{title:'Dos ramas, cada una con su llave',desc:'Dos lámparas independientes.',goal:'Cada lámpara va en serie con SU llave, y las dos ramas en paralelo a la batería de '+vr+' V.',
   explain:'Cada rama funciona sola: podés encender una, la otra o las dos.',comps:[bat(vr),sw('S1'),lampW('L1',vr,w),sw('S2'),lampW('L2',vr,w)],sol:pairs(['B.p-S1.a','B.p-S2.a','S1.b-L1.a','S2.b-L2.a','L1.b-B.n','L2.b-B.n'])})},
 6(){const par=rnd()<.5,vl=par?12:4,w=pick([3,5,6]),ids=['L1','L2','L3'];
  const sol=par?['B.p-S1.a','S1.b-L1.a','S1.b-L2.a','S1.b-L3.a','L1.b-B.n','L2.b-B.n','L3.b-B.n']:['B.p-S1.a','S1.b-L1.a','L1.b-L2.a','L2.b-L3.a','L3.b-B.n'];
  const Q=par?quiz('Se quemó la lámpara L2 y las otras dos siguen encendidas. ¿Por qué?','Cada lámpara tiene su propio camino hasta la batería',['Porque las otras lámparas son más fuertes','Porque la batería manda más corriente a las que quedan','Porque la llave las mantiene prendidas'])
   :quiz('Se quemó la lámpara L2 y se apagaron las tres. ¿Por qué?','Hay un solo camino y se cortó',['Porque las otras lámparas también se quemaron','Porque la batería se descargó','Porque la llave se abrió sola']);
  return{...base(6,'quiz',{title:'¿Qué pasa si se quema una?',desc:'Observá el circuito y respondé.',goal:'Mirá el circuito (una lámpara está quemada) y respondé la pregunta.',
   explain:par?'En paralelo cada lámpara tiene su propio camino: si una se quema, las demás siguen encendidas.':'En serie hay un solo camino: si una lámpara se quema se corta todo y se apagan todas.',
   comps:[bat(12),sw('S1'),...ids.map(id=>lampW(id,vl,w))],sol:pairs(sol),prewired:true,preClosed:true,preBroken:['L2']}),quiz:Q}},
 7(o){const hard=o&&o.hard,vr=12,w=pick([5,6,10]);
  const comps=[bat(vr),sw('S1'),lampW('L1',vr,w),lampW('L2',vr,w),lampW('L3',vr,w)];let sol=['B.p-S1.a','S1.b-L1.a','L1.b-L2.a','L1.b-L3.a','L2.b-B.n','L3.b-B.n'],txt='L1 en serie con (L2 ‖ L3)';
  if(hard){comps.push(lampW('L4',vr,w));sol=['B.p-S1.a','S1.b-L1.a','L1.b-L2.a','L1.b-L3.a','L1.b-L4.a','L2.b-B.n','L3.b-B.n','L4.b-B.n'];txt='L1 en serie con (L2 ‖ L3 ‖ L4)'}
  return base(7,'wire',{title:'Circuito mixto de lámparas',desc:txt,goal:'Armá el circuito mixto: '+txt+', con la llave general y la batería de '+vr+' V.',
   explain:'Una parte en serie y otra en paralelo: L1 recibe toda la corriente y las demás se la reparten.',comps,sol:pairs(sol)})},
 8(){const n=pick([2,3]),vb=pick([6,9,12]),Rs=shuf([100,150,220,330,470,680,1000]).slice(0,n),ids=['R1','R2','R3'].slice(0,n),tot=Rs.reduce((a,b)=>a+b,0),I=vb/tot;
  const sol=['B.p-S1.a','S1.b-R1.a'];for(let i=0;i<n-1;i++)sol.push(ids[i]+'.b-'+ids[i+1]+'.a');sol.push(ids[n-1]+'.b-B.n');
  return{...base(8,'quiz',{title:'Corriente en serie',desc:'Medí o calculá y respondé.',goal:'El circuito ya está armado: batería de '+fV(vb)+' y resistores '+Rs.map(fR).join(', ')+' en serie. Respondé.',
   explain:'I = V ÷ Rt = '+fV(vb)+' ÷ '+fR(tot)+' = '+fI(I)+'. En serie la corriente es la misma en todos.',comps:[bat(vb),sw('S1'),...ids.map((id,i)=>res(id,Rs[i]))],sol:pairs(sol),prewired:true,preClosed:true}),
   quiz:quiz('¿Cuánta corriente circula por el circuito?',fI(I),[fI(I*2),fI(I/2),fI(vb/Rs[0]),fI(vb/tot*3)])}},
 9(){const vb=pick([5,9,12]),ideal=(vb-2)/.015,ok=nearest(ideal),low=nearest((vb-2)/.06),high=nearest((vb-2)/.0015);
  const set=shuf([['ok',ok],['low',low],['high',high]]).map(([k,v],i)=>({k,v,id:['Ra','Rb','Rc'][i]})),good=set.find(x=>x.k==='ok');
  return base(9,'led',{kind:'led',title:'LED con resistor limitador',desc:'Elegí el resistor correcto.',goal:'Conectá el LED (ánodo A al +) en serie con UNO de los resistores para que encienda sin quemarse: corriente entre 5 y 25 mA.',
   tip:'R = (V − 2 V) ÷ 15 mA.',explain:'R = ('+fV(vb)+' − 2 V) ÷ 15 mA ≈ '+fR(ideal)+'; el valor comercial más cercano es '+fR(ok)+'. Con un resistor muy chico se quema; con uno muy grande casi no enciende.',
   comps:[bat(vb),sw('S1'),...set.map(x=>res(x.id,x.v)),led('D')],sol:pairs(['B.p-S1.a','S1.b-'+good.id+'.a',good.id+'.b-D.a','D.k-B.n'])})},
 10(o){const par=rnd()<.5,hard=o&&o.hard,n=hard?4:3,ids=['L1','L2','L3','L4'].slice(0,n),vr=12,w=pick([5,6,10]);
  const sol=par?['B.p-S1.a',...ids.map(i=>'S1.b-'+i+'.a'),...ids.map(i=>i+'.b-B.n')]:['B.p-S1.a','S1.b-L1.a',...ids.slice(0,-1).map((id,i)=>id+'.b-'+ids[i+1]+'.a'),ids[n-1]+'.b-B.n'];
  return base(10,'fault',{title:'Buscá la falla ('+(par?'paralelo':'serie')+')',desc:'Una lámpara está quemada.',goal:'Cerrá la llave, medí tensión y corriente en cada lámpara y reemplazá la quemada.',
   tip:par?'En paralelo todas tienen la tensión de la batería: la quemada es la que no deja pasar corriente (0 A).':'En serie, la quemada tiene toda la tensión de la batería y 0 A.',
   explain:par?'En paralelo las demás siguen encendidas: la quemada se nota por sus 0 A.':'En serie se apagan todas: la lámpara quemada es la que tiene la tensión completa y 0 A.',
   fault:ids.slice(),comps:[bat(vr),sw('S1'),...ids.map(id=>lampW(id,vr,w))],sol:pairs(sol)})},
 11(){const vb=pick([6,9,12]),R1=pick([100,150,220]),R2=pick([220,330,470]),R3=pick([330,470,680]),par=R2*R3/(R2+R3),Rt=R1+par;
  return{...base(11,'quiz',{title:'Resistencia equivalente',desc:'Mixto: R1 + (R2 ‖ R3).',goal:'R1 = '+fR(R1)+' en serie con R2 = '+fR(R2)+' y R3 = '+fR(R3)+' en paralelo. Respondé.',
   explain:'R2 ‖ R3 = '+fR(par)+'; Rt = R1 + (R2 ‖ R3) = '+fR(Rt)+'. Medí la corriente total y comprobá: Rt = V ÷ I.',comps:[bat(vb),sw('S1'),res('R1',R1),res('R2',R2),res('R3',R3)],
   sol:pairs(['B.p-S1.a','S1.b-R1.a','R1.b-R2.a','R1.b-R3.a','R2.b-B.n','R3.b-B.n']),prewired:true,preClosed:true}),
   quiz:quiz('¿Cuál es la resistencia equivalente del circuito?',fR(Rt),[fR(R1+R2+R3),fR(R1+R2),fR(par),fR(R1*par/(R1+par))])}},
 12(o){const vb=pick([6,9,12]),R=shuf([100,150,220,330,470,680]).slice(0,4);
  return base(12,'wire',{title:'Mixto de resistores',desc:'(R1 + R2) ‖ (R3 + R4)',goal:'Armá dos ramas en paralelo: R1 con R2 en serie y R3 con R4 en serie, con la llave general y la batería de '+fV(vb)+'.',
   explain:'Cada rama suma sus resistencias; después las dos ramas se conectan en paralelo a la batería.',comps:[bat(vb),sw('S1'),res('R1',R[0]),res('R2',R[1]),res('R3',R[2]),res('R4',R[3])],
   sol:pairs(['B.p-S1.a','S1.b-R1.a','S1.b-R3.a','R1.b-R2.a','R3.b-R4.a','R2.b-B.n','R4.b-B.n'])})}
};
/* del nivel 13 en adelante: los tipos más difíciles se repiten con variantes (más elementos) */
const LOOP=[7,12,10,9,11,8,6,5,12,7];
function make(level){level=Math.max(1,Math.floor(level)||1);if(level<=12)return G[level]();const k=LOOP[(level-13)%LOOP.length],p=G[k]({hard:true});p.level=level;p.id='gen'+level+'-'+uid();p.title='Nivel '+level+' · '+p.title;return p}
return{make,NAMES,MAXBASE:12,tipoDe:l=>l<=12?NAMES[l]:NAMES[LOOP[(l-13)%LOOP.length]]};
})();
