/* Catálogo del módulo "Mando de motores".
   Las prácticas marcadas con soon:true todavía no están construidas: aparecen
   en el menú como "Próximamente". Al construir una, quitá soon y definí su
   pantalla (file) o dejá el motor genérico mando.html?c=<id>. */
window.MANDO=(function(){
const groups=[
 {id:'componentes',title:'Conocé los componentes',desc:'Cómo está hecho cada componente y cómo funciona, accionándolo en pantalla.'},
 {id:'monofasico',title:'Motor monofásico',desc:'Maniobras con motores de 220 V.'},
 {id:'trifasico',title:'Motor trifásico',desc:'Circuito de potencia y circuito de mando, con corrientes y protecciones.'}
];
const list=[
 {id:'m-contactor',group:'componentes',title:'El contactor',desc:'Bobina, contactos principales (1-2, 3-4, 5-6) y auxiliares NA / NC. Qué pasa al energizar A1-A2.',file:'componente.html?c=contactor'},
 {id:'m-termico',group:'componentes',title:'Relé térmico',desc:'Bimetales, clase de disparo y ajuste. Contactos 95-96 y 97-98 frente a una sobrecarga.',soon:true},
 {id:'m-guardamotor',group:'componentes',title:'Guardamotor',desc:'Protección magnetotérmica del motor: térmico regulable y disparo magnético por cortocircuito.',soon:true},
 {id:'m-pulsadores',group:'componentes',title:'Pulsadores y selectoras',desc:'Contactos NA y NC, retorno por resorte, parada de emergencia y selectora de dos posiciones.',soon:true},
 {id:'m-temporizador',group:'componentes',title:'Temporizador y relé auxiliar',desc:'Relé de tiempo a la conexión y relé auxiliar de 4 contactos.',soon:true},
 {id:'mono-directo',group:'monofasico',title:'Arranque directo monofásico',desc:'Motor de 220 V con guardamotor y contactor. Potencia y mando.',soon:true},
 {id:'mono-marcha-parada',group:'monofasico',title:'Marcha y parada con retención',desc:'Pulsadores de marcha y parada y contacto auxiliar de enclavamiento.',soon:true},
 {id:'tri-directo',group:'trifasico',title:'Arranque directo trifásico',desc:'Red R-S-T, guardamotor, contactor y motor. Circuito de potencia y de mando.',soon:true},
 {id:'tri-enclavamiento',group:'trifasico',title:'Marcha-parada con enclavamiento',desc:'El contacto auxiliar mantiene la bobina energizada (retención). Señalización de marcha y falla.',soon:true},
 {id:'tri-impulsos',group:'trifasico',title:'Marcha por impulsos',desc:'Marcha con pulsador sin retención y con selectora de modo.',soon:true},
 {id:'tri-inversion',group:'trifasico',title:'Inversión de giro',desc:'Dos contactores con enclavamiento mutuo: intercambio de fases y bloqueo eléctrico.',soon:true},
 {id:'tri-estrella-triangulo',group:'trifasico',title:'Arranque estrella-triángulo',desc:'Tres contactores y un temporizador para reducir la corriente de arranque.',soon:true},
 {id:'tri-temporizado',group:'trifasico',title:'Arranque temporizado',desc:'Retardo a la conexión con relé de tiempo y señalización.',soon:true}
];
const items={};list.forEach(s=>items[s.id]=s);
return{groups,order:list.map(s=>s.id),items};
})();
