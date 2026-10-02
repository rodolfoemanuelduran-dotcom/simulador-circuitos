/* Catálogo de "Datos curiosos sobre la electricidad": 20 demostraciones
   interactivas. Cada una se dibuja en datos.html?c=<id> (escenas en
   datos-escenas.js y datos-escenas2.js). */
window.DATOS=(function(){
const groups=[
 {id:'cuerpo',title:'La electricidad y tu cuerpo',desc:'Qué circuito se forma, cuánta corriente circula y qué es realmente lo peligroso.'},
 {id:'instalacion',title:'Protecciones en la instalación',desc:'Por qué existen la tierra, el diferencial y la térmica, y qué pasa cuando fallan.'},
 {id:'fenomenos',title:'En la red y en la naturaleza',desc:'Cables caídos, rayos, alta tensión, trifásica y transformadores.'}
];
const list=[
 {id:'pajaro',group:'cuerpo',title:'¿Por qué el pájaro no se electrocuta en el cable?',desc:'Probá qué pasa si toca un solo cable, dos cables o el poste.'},
 {id:'poste',group:'cuerpo',title:'¿Por qué no me da corriente si toco un poste, aun bajo la lluvia?',desc:'Con lluvia, sin falla y con un cable caído sobre el poste.'},
 {id:'pies',group:'cuerpo',title:'¿Qué pasa si mis pies están aislados o no?',desc:'Goma, zapatillas, descalzo seco y descalzo mojado: mirá cuánta corriente circula.'},
 {id:'camino',group:'cuerpo',title:'¿Por qué la corriente elige el camino fácil?',desc:'El reparto de la corriente entre un cable y un cuerpo en paralelo.'},
 {id:'quemata',group:'cuerpo',title:'¿Qué es lo peligroso: la tensión o la corriente?',desc:'Chispa estática, batería de auto, enchufe y línea de media tensión.'},
 {id:'bateria',group:'cuerpo',title:'¿Por qué una batería de auto no da patada y el enchufe sí?',desc:'Cambiá la tensión y el estado de la piel y mirá la corriente.'},
 {id:'corazon',group:'cuerpo',title:'¿Por qué importa el camino de la corriente por el cuerpo?',desc:'Mano-mano, mano-pie y pie-pie: cuánta corriente llega al corazón.'},
 {id:'neutro',group:'cuerpo',title:'¿Es peligroso tocar el neutro?',desc:'Fase, neutro y neutro cortado, parado en el suelo o aislado.'},
 {id:'ccca',group:'cuerpo',title:'Corriente continua y alterna en el cuerpo',desc:'Por qué con corriente alterna la mano no suelta el conductor.'},
 {id:'tierra',group:'instalacion',title:'¿Para qué sirve el cable de tierra? La heladera con falla',desc:'Carcasa energizada con y sin puesta a tierra.'},
 {id:'diferencial',group:'instalacion',title:'El disyuntor diferencial: detecta 30 mA y corta',desc:'Mirá la diferencia entre la corriente de ida y de vuelta.'},
 {id:'termica',group:'instalacion',title:'La térmica: sobrecarga y cortocircuito',desc:'Cuánto tarda en cortar según la corriente.'},
 {id:'calor',group:'instalacion',title:'¿Por qué se calientan los cables?',desc:'Corriente, sección y calor: P = I²·R.'},
 {id:'banadera',group:'instalacion',title:'El secador de pelo y la bañera',desc:'Agua, electricidad y qué protecciones salvan una vida.'},
 {id:'incendio',group:'instalacion',title:'¿Se puede apagar un incendio eléctrico con agua?',desc:'Qué pasa con el chorro de agua y cómo actuar.'},
 {id:'paso',group:'fenomenos',title:'Tensión de paso: el cable caído en el suelo',desc:'Pasos largos, pasos cortos y saltar con los pies juntos.'},
 {id:'rayo',group:'fenomenos',title:'El rayo: ¿dónde conviene refugiarse?',desc:'Árbol, campo abierto, auto y casa.'},
 {id:'altatension',group:'fenomenos',title:'¿Por qué se transporta en alta tensión?',desc:'Potencia, tensión y pérdidas en la línea.'},
 {id:'trifasica',group:'fenomenos',title:'Tres fases: ¿por qué 220 V y 380 V?',desc:'Ondas desfasadas 120° y la raíz de tres.'},
 {id:'trafo',group:'fenomenos',title:'El transformador solo funciona con corriente alterna',desc:'Qué pasa si le conectás corriente continua.'}
];
const items={};list.forEach(s=>items[s.id]=s);
return{groups,order:list.map(s=>s.id),items};
})();
