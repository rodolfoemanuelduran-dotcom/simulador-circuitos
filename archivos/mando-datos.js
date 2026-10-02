/* Catálogo del módulo "Mando de motores".
   Las prácticas marcadas con soon:true todavía no están construidas: aparecen
   en el menú como "Próximamente". Los componentes se abren en componente.html,
   los circuitos en mando.html (mando-circuitos.js) y los tableros en tablero.html. */
window.MANDO=(function(){
const groups=[
 {id:'componentes',title:'Conocé los componentes',desc:'Cómo está hecho cada componente y cómo funciona, accionándolo en pantalla.'},
 {id:'monofasico',title:'Motor monofásico',desc:'Maniobras con motores de 220 V.'},
 {id:'trifasico',title:'Motor trifásico',desc:'Circuito de potencia y circuito de mando, con corrientes y protecciones.'},
 {id:'tableros',title:'Cableá el tablero',desc:'Tableros realistas con riel DIN, fusibles, contactores y pulsadores: tendé los cables y probalos.'}
];
const list=[
 {id:'m-contactor',group:'componentes',title:'El contactor',desc:'Bobina, contactos principales (1-2, 3-4, 5-6) y auxiliares NA / NC. Qué pasa al energizar A1-A2.',file:'componente.html?c=contactor'},
 {id:'m-termico',group:'componentes',title:'Relé térmico',desc:'Bimetales, clase de disparo y ajuste. Contactos 95-96 y 97-98 frente a una sobrecarga.',file:'componente.html?c=termico'},
 {id:'m-guardamotor',group:'componentes',title:'Guardamotor',desc:'Protección magnetotérmica del motor: térmico regulable y disparo magnético por cortocircuito.',file:'componente.html?c=guardamotor'},
 {id:'m-pulsadores',group:'componentes',title:'Pulsadores y selectoras',desc:'Contactos NA y NC, retorno por resorte, parada de emergencia y selectora de dos posiciones.',file:'componente.html?c=pulsadores'},
 {id:'m-temporizador',group:'componentes',title:'Temporizador y relé auxiliar',desc:'Relé de tiempo a la conexión y relé auxiliar de 4 contactos.',file:'componente.html?c=temporizador'},
 {id:'m-glosario',group:'componentes',title:'Símbolos y designaciones',desc:'Referencia rápida: símbolos IEC, letras de los aparatos, numeración de bornes, colores de cables y fórmulas útiles.',file:'glosario.html'},
 {id:'mono-directo',group:'monofasico',title:'Arranque directo monofásico',desc:'Motor de 220 V con termomagnética y contactor. Potencia y mando.'},
 {id:'mono-marcha-parada',group:'monofasico',title:'Marcha y parada con retención',desc:'Pulsadores de marcha y parada y contacto auxiliar de enclavamiento.'},
 {id:'tri-directo',group:'trifasico',title:'Arranque directo trifásico',desc:'Red R-S-T, guardamotor, contactor y motor. Circuito de potencia y de mando.'},
 {id:'tri-enclavamiento',group:'trifasico',title:'Marcha-parada con enclavamiento',desc:'El contacto auxiliar mantiene la bobina energizada (retención). Señalización de marcha y falla.'},
 {id:'tri-impulsos',group:'trifasico',title:'Marcha por impulsos',desc:'Marcha con pulsador sin retención y con selectora de modo.'},
 {id:'tri-inversion',group:'trifasico',title:'Inversión de giro',desc:'Dos contactores con enclavamiento mutuo: intercambio de fases y bloqueo eléctrico.'},
 {id:'tri-estrella-triangulo',group:'trifasico',title:'Arranque estrella-triángulo',desc:'Tres contactores y un temporizador para reducir la corriente de arranque.'},
 {id:'tri-temporizado',group:'trifasico',title:'Arranque temporizado',desc:'Retardo a la conexión con relé de tiempo y señalización.'},
 {id:'tab-directo',group:'tableros',title:'Tablero: arranque directo',desc:'Guardamotor, contactor y selectora. El tablero más simple para empezar a cablear.',file:'tablero.html?c=directo'},
 {id:'tab-enclav',group:'tableros',title:'Tablero: marcha-parada con retención',desc:'Fusibles, contactor, térmico, pulsadores y retención. El más típico de clase.',file:'tablero.html?c=enclav'},
 {id:'tab-inversion',group:'tableros',title:'Tablero: inversión de giro',desc:'Dos contactores con enclavamiento y fases cruzadas.',file:'tablero.html?c=inversion'},
 {id:'tab-sd',group:'tableros',title:'Tablero: estrella-triángulo',desc:'Tres contactores, temporizador y motor de seis bornes. El más avanzado.',file:'tablero.html?c=sd'}
];
const items={};list.forEach(s=>items[s.id]=s);
return{groups,order:list.map(s=>s.id),items};
})();
