/* Ayudas compartidas por todas las pantallas del simulador.
   - SIM.VERSION: número de versión que se muestra en el menú y en la app del celular (cambiarlo acá, junto con package.json y sw.js).
   - SIM.post / SIM.alRecibir: mensajes entre el menú y las prácticas, aceptados solo si vienen de la ventana madre o de un marco propio.
   - SIM.leerJSON: lectura segura de datos guardados (si están dañados o tienen otro formato se usa el valor inicial).
   - SIM.aviso y el aviso automático de errores inesperados: un cartel breve en vez de una pantalla muerta. */
window.SIM=(function(){
const VERSION='1.3.0';
const esObj=v=>!!v&&typeof v==='object'&&!Array.isArray(v);
/* en file:// (programa de Windows) el origen es "null" y no se puede apuntar a él: se usa '*', pero siempre solo hacia la ventana madre o un marco propio */
const destino=()=>location.protocol==='file:'?'*':location.origin;
function post(win,msg){try{if(win&&win!==window)win.postMessage(msg,destino())}catch(e){}}
function esPropio(src){if(!src)return false;if(src===window.parent&&window.parent!==window)return true;try{return[...document.querySelectorAll('iframe')].some(f=>f.contentWindow===src)}catch(e){return false}}
function alRecibir(fn){window.addEventListener('message',e=>{if(!esPropio(e.source))return;if(location.protocol!=='file:'&&e.origin!==location.origin)return;fn(e)})}
/* lectura segura: valida(v) decide si el valor guardado sirve */
function leerJSON(clave,valida,inicial){try{const t=localStorage.getItem(clave);if(t===null)return inicial;const v=JSON.parse(t);return(!valida||valida(v))?v:inicial}catch(e){return inicial}}
function guardar(clave,texto){try{localStorage.setItem(clave,texto);return true}catch(e){avisar('No se pudo guardar en este dispositivo (¿poco espacio o navegación privada?). Lo que hagas ahora no quedará guardado.',9000);return false}}
/* cartel breve, siempre el mismo y accesible */
let cartel=null,tmCartel=0;
function avisar(texto,ms){try{
 if(!cartel){cartel=document.createElement('div');cartel.setAttribute('role','status');cartel.setAttribute('aria-live','polite');
  cartel.style.cssText='position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:99999;max-width:min(560px,92vw);padding:10px 14px;border-radius:14px;background:#2a1d0a;color:#ffe9b0;border:2px solid #ffd43b;font:600 .84rem/1.4 system-ui,sans-serif;box-shadow:0 10px 30px #000a;text-align:center;cursor:pointer';
  cartel.addEventListener('click',()=>{cartel.hidden=true});(document.body||document.documentElement).appendChild(cartel)}
 cartel.textContent=texto;cartel.hidden=false;clearTimeout(tmCartel);tmCartel=setTimeout(()=>{cartel.hidden=true},ms||7000)}catch(e){}}
let ultimoError=0;
function errorInesperado(msg){try{console.error('[simulador]',msg)}catch(e){}
 if(/ResizeObserver|Script error\.?$/i.test(String(msg||'')))return;
 const t=Date.now();if(t-ultimoError<12000)return;ultimoError=t;
 avisar('Algo no salió como se esperaba. Probá reiniciar la práctica con ↻; si sigue igual, avisale a tu docente.',9000)}
window.addEventListener('error',e=>errorInesperado(e&&(e.message||e.error)));
window.addEventListener('unhandledrejection',e=>errorInesperado(e&&e.reason&&(e.reason.message||e.reason)));
return{VERSION,esObj,post,alRecibir,leerJSON,guardar,avisar,errorInesperado};
})();
