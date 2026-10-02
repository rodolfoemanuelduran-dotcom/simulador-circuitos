/* Catálogo de "origen de la energía" y "casas y croquis" (corriente alterna).
   Cada ambiente se resuelve en pasos: primero se proyecta sobre el plano
   (ubicar puntos, trazar circuitos y elegir protecciones) y después se cablea
   con el motor de circuito-redes.html (escenarios casa-*).
   Los muebles son solo ilustración; las "zonas" de cada punto definen dónde es
   correcto ubicarlo. Coordenadas locales de cada planta (floor): x,y en unidades. */
window.CASAS=(function(){
const groups=[
 {id:'origen',title:'¿De dónde viene la corriente eléctrica?',desc:'Seguí la energía desde el río hasta el tomacorriente de tu casa.'},
 {id:'casas',title:'Casas y croquis',desc:'Proyectá la instalación sobre el plano, ubicá bocas, llaves y tomas según los muebles, y después cableá cada circuito.'}
];
const list=[
 {id:'energia',group:'origen',title:'Del río al tomacorriente',desc:'Tocá cada tramo en orden: embalse, turbina, generador, transformadores, líneas, medidor y tablero. Mirá cómo cambia la tensión.',file:'energia.html'},
 {id:'casa-dormitorio',group:'casas',title:'Dormitorio',desc:'Cama, mesas de luz, placard, escritorio y TV: ubicá la llave, la boca de luz y los tomas donde realmente se necesitan.',file:'casa.html?c=dormitorio'},
 {id:'casa-cocina',group:'casas',title:'Cocina',desc:'Mesada, bacha, cocina, heladera y microondas: tomas seguros sobre la mesada, lejos de la bacha.',file:'casa.html?c=cocina'},
 {id:'casa-living',group:'casas',title:'Living-comedor',desc:'Sofá, TV, mesa y aparador: dos focos con llave doble y tomas estratégicos.',file:'casa.html?c=living'},
 {id:'casa-escalera',group:'casas',title:'Escalera y pasillo con combinación',desc:'Casa de dos plantas. Ubicá las bocas, llaves y tomas en el plano, trazá los circuitos y cableá la luz de escalera con llaves de combinación.',file:'casa.html?c=escalera'}
];
/* Protecciones y conductores (valores habituales de aula; editables) */
const PROT={
 nota:'Valores habituales de aula para circuitos de uso general. Confirmalos con el reglamento AEA 90364 vigente que usen en tu escuela.',
 secOpts:[1,1.5,2.5,4,6],terOpts:[6,10,16,20,25],
 reglas:{
  IUG:{sec:1.5,ter:10,por:'Las luces consumen poca corriente: alcanza un cable de 1,5 mm² con una térmica de 10 A.'},
  TUG:{sec:2.5,ter:16,por:'Los tomas alimentan artefactos de más consumo: se usa un cable de 2,5 mm² con una térmica de 16 A.'}
 },
 diferencial:'Además, el tablero lleva un disyuntor diferencial (30 mA): corta ante una fuga a tierra y protege a las personas.'
};
const CIRC_IUG={id:'IUG',name:'IUG · Iluminación',color:'#e59a00',types:['foco','llave','comb']};
const CIRC_TUG={id:'TUG',name:'TUG · Tomacorrientes',color:'#2f8fd1',types:['toma']};
const plans={
 /* ------------------------------------------------ ESCALERA ---- */
 escalera:{
  title:'Escalera y pasillo con combinación',
  intro:'Casa de dos plantas. La escalera tiene un foco que se enciende desde la planta baja y desde la planta alta; el pasillo tiene un foco con llave simple y dos tomacorrientes.',
  floors:[
   {id:'PB',name:'Planta baja',ox:30,oy:92,w:550,h:400,rooms:[
     {x:0,y:0,w:370,h:190,name:'Living-comedor'},{x:0,y:190,w:370,h:90,name:'Pasillo',hall:true},{x:0,y:280,w:370,h:120,name:'Cocina'},
     {x:370,y:0,w:180,h:60,name:'Baño'},{x:370,y:60,w:180,h:280,name:'Escalera',stair:true},{x:370,y:340,w:180,h:60,name:'Depósito'}],
    doors:[{x:0,y:235,side:'L'},{x:230,y:190,side:'T'},{x:230,y:280,side:'B'},{x:370,y:235,side:'R'}],windows:[],furniture:[]},
   {id:'PA',name:'Planta alta',ox:620,oy:92,w:550,h:400,rooms:[
     {x:0,y:0,w:370,h:190,name:'Dormitorio 1'},{x:0,y:190,w:370,h:90,name:'Pasillo',hall:true},{x:0,y:280,w:370,h:120,name:'Dormitorio 2'},
     {x:370,y:0,w:180,h:60,name:'Baño'},{x:370,y:60,w:180,h:280,name:'Escalera (palier)',stair:true},{x:370,y:340,w:180,h:60,name:'Placard'}],
    doors:[{x:230,y:190,side:'T'},{x:230,y:280,side:'B'},{x:370,y:235,side:'R'}],windows:[],furniture:[]}
  ],
  tab:{floor:'PB',x:10,y:215,name:'Tablero'},
  slots:[
   {key:'foco_esc',type:'foco',floor:'PB',zone:[395,90,130,210],n:1,label:'Boca de luz de la escalera',tip:'La boca de luz de la escalera va en el techo, en el centro de la caja de escalera.'},
   {key:'comb_pb',type:'comb',floor:'PB',zone:[290,195,110,85],n:1,label:'Llave de combinación al pie de la escalera (planta baja)',tip:'La primera llave de combinación va junto a la entrada de la escalera, en planta baja.'},
   {key:'comb_pa',type:'comb',floor:'PA',zone:[290,195,110,85],n:1,label:'Llave de combinación en el palier (planta alta)',tip:'La segunda llave de combinación va arriba, junto a la llegada de la escalera.'},
   {key:'foco_pas',type:'foco',floor:'PB',zone:[40,205,240,60],n:1,label:'Boca de luz del pasillo',tip:'La boca de luz del pasillo va en el centro del techo del pasillo.'},
   {key:'llave_pas',type:'llave',floor:'PB',zone:[0,192,75,86],n:1,label:'Llave simple junto a la puerta del pasillo',tip:'La llave simple va junto a la puerta, del lado de la cerradura.'},
   {key:'toma',type:'toma',floor:'PB',zone:[0,190,370,90],n:2,label:'Dos tomacorrientes en el pasillo',tip:'Los tomacorrientes del pasillo van sobre sus paredes, a unos 30 cm del piso.'}
  ],
  palette:['foco','llave','comb','toma'],
  circuits:[Object.assign({roles:['foco_esc','comb_pb','comb_pa','foco_pas','llave_pas']},CIRC_IUG),Object.assign({roles:['toma']},CIRC_TUG)],
  directo:[['comb_pb','comb_pa']],
  prot:PROT,
  steps:[
   {n:1,tab:'1 · Ubicar puntos',title:'Paso 1: ubicá los puntos en el plano',goal:'Elegí un símbolo y tocá el plano para colocarlo (o arrastralo). Colocá cada punto en el ambiente correcto.'},
   {n:2,tab:'2 · Trazar y proteger',title:'Paso 2: trazá los circuitos y elegí las protecciones',goal:'Elegí el circuito (IUG para luces, TUG para tomas) y unilos con líneas desde el tablero. Después elegí el cable y la térmica de cada circuito.'},
   {n:3,tab:'3 · Cablear escalera',title:'Paso 3: cableá la luz de escalera',goal:'Armá el circuito de la escalera con los dos conmutadores.',scenario:'casa-escalera'},
   {n:4,tab:'4 · Cablear pasillo',title:'Paso 4: cableá el pasillo',goal:'Armá el foco con llave y los dos tomas con puesta a tierra.',scenario:'casa-pasillo'}
  ],
  explain:'Un proyecto eléctrico empieza en el plano: se ubican las bocas, llaves y tomas, y se agrupan en circuitos (iluminación y tomas por separado). Después, cada circuito se cablea respetando fase, neutro y tierra.'
 },
 /* ----------------------------------------------- DORMITORIO ---- */
 dormitorio:{
  title:'Dormitorio',view:[150,52,900,490],
  intro:'Un dormitorio con cama doble, dos mesas de luz, placard, escritorio y televisor. Pensá dónde vas a necesitar enchufar cada cosa y dónde conviene la llave.',
  floors:[{id:'P',name:'Dormitorio',ox:200,oy:92,w:800,h:400,
   rooms:[{x:0,y:0,w:800,h:400,name:''}],
   doors:[{x:120,y:400,side:'B'}],
   windows:[{x:300,y:0,len:140,side:'T'},{x:800,y:130,len:120,side:'R'}],
   furniture:[
    {kind:'cama',x:300,y:18,w:210,h:250,name:'Cama'},
    {kind:'mesaluz',x:235,y:18,w:55,h:55,name:'Mesa de luz'},{kind:'mesaluz',x:520,y:18,w:55,h:55,name:'Mesa de luz'},
    {kind:'placard',x:12,y:70,w:70,h:230,name:'Placard'},
    {kind:'escritorio',x:690,y:210,w:100,h:160,name:'Escritorio'},{kind:'silla',x:640,y:270,w:40,h:40,name:''},
    {kind:'tv',x:300,y:345,w:210,h:44,name:'Mueble TV'}]}],
  tab:{floor:'P',x:14,y:340,name:'Tablero'},
  slots:[
   {key:'foco',type:'foco',floor:'P',zone:[320,140,160,130],n:1,label:'Boca de luz en el centro del techo',tip:'La boca de luz va en el centro del techo para repartir la luz por todo el cuarto.'},
   {key:'llave',type:'llave',floor:'P',zone:[135,352,75,48],n:1,label:'Llave junto a la puerta',tip:'La llave va junto a la puerta, del lado de la cerradura, para encender al entrar.'},
   {key:'toma_vi',type:'toma',floor:'P',zone:[205,0,95,95],n:1,label:'Toma junto a la mesa de luz izquierda',tip:'Un toma junto a cada mesa de luz sirve para el velador y el cargador del celular.'},
   {key:'toma_vd',type:'toma',floor:'P',zone:[505,0,95,95],n:1,label:'Toma junto a la mesa de luz derecha',tip:'Lo mismo del otro lado de la cama: un toma junto a la mesa de luz derecha.'},
   {key:'toma_esc',type:'toma',floor:'P',zone:[735,185,65,180],n:1,label:'Toma junto al escritorio',tip:'Un toma junto al escritorio para la computadora y la lámpara de escritorio.'},
   {key:'toma_tv',type:'toma',floor:'P',zone:[290,352,230,48],n:1,label:'Toma para el televisor',tip:'El toma del televisor va detrás o junto al mueble para que el cable no cruce el cuarto.'}
  ],
  palette:['foco','llave','toma'],
  circuits:[Object.assign({roles:['foco','llave']},CIRC_IUG),Object.assign({roles:['toma_vi','toma_vd','toma_esc','toma_tv']},CIRC_TUG)],
  directo:[],prot:PROT,
  steps:[
   {n:1,tab:'1 · Ubicar puntos',title:'Paso 1: ubicá los puntos en el dormitorio',goal:'Colocá la boca de luz, la llave y los tomas donde se necesitan, según los muebles.'},
   {n:2,tab:'2 · Trazar y proteger',title:'Paso 2: trazá los circuitos y elegí las protecciones',goal:'Uní con líneas el tablero con la llave y la luz (IUG) y con cada toma (TUG). Elegí cable y térmica de cada circuito.'},
   {n:3,tab:'3 · Cablear',title:'Paso 3: cableá el dormitorio',goal:'Armá el foco con su llave y los tomas con puesta a tierra.',scenario:'casa-dormitorio'}
  ],
  explain:'En un dormitorio las luces van en un circuito (con la llave junto a la puerta) y los tomas en otro, ubicados donde se usan: junto a las mesas de luz, el escritorio y el televisor, para no depender de alargues.'
 },
 /* --------------------------------------------------- COCINA ---- */
 cocina:{
  title:'Cocina',view:[150,52,900,490],
  intro:'Una cocina con heladera, mesada con bacha y cocina, microondas y una mesa. Los tomas de la mesada van por encima de la mesada y lejos del agua.',
  floors:[{id:'P',name:'Cocina',ox:200,oy:92,w:800,h:400,
   rooms:[{x:0,y:0,w:800,h:400,name:''}],
   doors:[{x:720,y:400,side:'B'}],
   windows:[{x:240,y:400,len:160,side:'B'}],
   furniture:[
    {kind:'heladera',x:14,y:10,w:84,h:84,name:'Heladera'},
    {kind:'mesada',x:104,y:10,w:600,h:76,name:''},
    {kind:'bacha',x:232,y:20,w:100,h:56,name:'Bacha'},
    {kind:'cocina',x:430,y:16,w:92,h:64,name:'Cocina'},
    {kind:'microondas',x:566,y:22,w:62,h:48,name:'Microondas'},
    {kind:'mesa',x:290,y:190,w:220,h:120,name:'Mesa'},
    {kind:'silla',x:330,y:150,w:36,h:36,name:''},{kind:'silla',x:434,y:150,w:36,h:36,name:''},{kind:'silla',x:330,y:316,w:36,h:36,name:''},{kind:'silla',x:434,y:316,w:36,h:36,name:''}]}],
  tab:{floor:'P',x:760,y:330,name:'Tablero'},
  slots:[
   {key:'foco',type:'foco',floor:'P',zone:[320,130,160,130],n:1,label:'Boca de luz en el centro del techo',tip:'La boca de luz va en el centro del techo, sobre la zona de trabajo y de la mesa.'},
   {key:'llave',type:'llave',floor:'P',zone:[640,352,64,48],n:1,label:'Llave junto a la puerta',tip:'La llave va junto a la puerta, del lado de la cerradura.'},
   {key:'toma_hel',type:'toma',floor:'P',zone:[14,0,90,34],n:1,label:'Toma de la heladera',tip:'La heladera necesita su toma propio, accesible, sin alargues ni adaptadores.'},
   {key:'toma_mes1',type:'toma',floor:'P',zone:[110,0,118,34],n:1,label:'Toma de la mesada (izquierda de la bacha)',tip:'Los tomas de la mesada van en la pared, por encima de la mesada y lejos de la bacha.'},
   {key:'toma_mes2',type:'toma',floor:'P',zone:[336,0,92,34],n:1,label:'Toma de la mesada (entre bacha y cocina)',tip:'Entre la bacha y la cocina, en la pared, para licuadora o pava eléctrica.'},
   {key:'toma_micro',type:'toma',floor:'P',zone:[528,0,112,34],n:1,label:'Toma del microondas',tip:'El microondas se enchufa en la pared sobre la mesada, a un costado de la cocina, nunca detrás de ella.'}
  ],
  palette:['foco','llave','toma'],
  circuits:[Object.assign({roles:['foco','llave']},CIRC_IUG),Object.assign({roles:['toma_hel','toma_mes1','toma_mes2','toma_micro']},CIRC_TUG)],
  directo:[],prot:PROT,
  steps:[
   {n:1,tab:'1 · Ubicar puntos',title:'Paso 1: ubicá los puntos en la cocina',goal:'Colocá la boca de luz, la llave y los tomas de la heladera, de la mesada y del microondas.'},
   {n:2,tab:'2 · Trazar y proteger',title:'Paso 2: trazá los circuitos y elegí las protecciones',goal:'Uní con líneas el tablero con la llave y la luz (IUG) y con cada toma (TUG). Elegí cable y térmica de cada circuito.'},
   {n:3,tab:'3 · Cablear',title:'Paso 3: cableá la cocina',goal:'Armá el foco con su llave y los tomas de la mesada y de la heladera.',scenario:'casa-cocina'}
  ],
  explain:'En la cocina hay mucha demanda de corriente y presencia de agua: los tomas van por encima de la mesada, lejos de la bacha, y la heladera tiene un toma propio y permanente.'
 },
 /* ------------------------------------------------------ LIVING ---- */
 living:{
  title:'Living-comedor',view:[150,52,900,490],
  intro:'Un living-comedor con sofá, televisor, mesa ratona, mesa de comedor y aparador. Tiene dos zonas de luz que se comandan por separado con una llave doble.',
  floors:[{id:'P',name:'Living-comedor',ox:200,oy:92,w:800,h:400,
   rooms:[{x:0,y:0,w:410,h:400,name:'Living',label:[205,26]},{x:410,y:0,w:390,h:400,name:'Comedor',label:[605,26]}],
   doors:[{x:0,y:310,side:'L'}],
   windows:[{x:200,y:0,len:150,side:'T'},{x:620,y:0,len:150,side:'T'},{x:800,y:150,len:120,side:'R'}],
   furniture:[
    {kind:'sofa',x:110,y:40,w:210,h:84,name:'Sofá'},
    {kind:'alfombra',x:110,y:150,w:210,h:130,name:''},
    {kind:'mesaratona',x:170,y:190,w:90,h:56,name:'Mesa ratona'},
    {kind:'tv',x:110,y:340,w:210,h:46,name:'TV'},
    {kind:'mesa',x:520,y:130,w:210,h:130,name:'Mesa de comedor'},
    {kind:'silla',x:560,y:90,w:36,h:36,name:''},{kind:'silla',x:654,y:90,w:36,h:36,name:''},{kind:'silla',x:560,y:266,w:36,h:36,name:''},{kind:'silla',x:654,y:266,w:36,h:36,name:''},
    {kind:'aparador',x:580,y:345,w:200,h:42,name:'Aparador'}]}],
  tab:{floor:'P',x:14,y:230,name:'Tablero'},
  slots:[
   {key:'foco_liv',type:'foco',floor:'P',zone:[150,150,120,110],n:1,label:'Boca de luz del living',tip:'La boca de luz del living va en el centro de la zona de estar.'},
   {key:'foco_com',type:'foco',floor:'P',zone:[550,150,150,100],n:1,label:'Boca de luz del comedor',tip:'La boca de luz del comedor va sobre la mesa, en el centro del techo.'},
   {key:'llave',type:'llave',floor:'P',zone:[0,240,64,120],n:2,label:'Dos llaves junto a la puerta (llave doble)',tip:'Las dos llaves van juntas en una caja, junto a la puerta: una para cada foco.'},
   {key:'toma_tv',type:'toma',floor:'P',zone:[110,345,210,55],n:1,label:'Toma del televisor',tip:'El toma del televisor va detrás o junto al mueble, para que el cable no cruce el living.'},
   {key:'toma_sofa',type:'toma',floor:'P',zone:[60,0,270,34],n:1,label:'Toma junto al sofá',tip:'Un toma junto al sofá sirve para una lámpara de pie o para cargar el celular.'},
   {key:'toma_apar',type:'toma',floor:'P',zone:[580,345,200,55],n:1,label:'Toma del aparador',tip:'Un toma junto al aparador sirve para la pava eléctrica o artefactos del comedor.'}
  ],
  palette:['foco','llave','toma'],
  circuits:[Object.assign({roles:['foco_liv','foco_com','llave']},CIRC_IUG),Object.assign({roles:['toma_tv','toma_sofa','toma_apar']},CIRC_TUG)],
  directo:[],prot:PROT,
  steps:[
   {n:1,tab:'1 · Ubicar puntos',title:'Paso 1: ubicá los puntos en el living-comedor',goal:'Colocá las dos bocas de luz, la llave doble y los tomas según los muebles.'},
   {n:2,tab:'2 · Trazar y proteger',title:'Paso 2: trazá los circuitos y elegí las protecciones',goal:'Uní con líneas el tablero con las llaves y las luces (IUG) y con cada toma (TUG). Elegí cable y térmica de cada circuito.'},
   {n:3,tab:'3 · Cablear',title:'Paso 3: cableá el living-comedor',goal:'Armá los dos focos con su llave y el toma del televisor.',scenario:'casa-living'}
  ],
  explain:'Con una llave doble se comandan dos zonas de luz desde un solo lugar. Los tomas se reparten donde están el televisor, el sofá y el aparador para evitar alargues.'
 }
};
const items={};list.forEach(s=>items[s.id]=s);
return{groups,order:list.map(s=>s.id),items,plans};
})();
