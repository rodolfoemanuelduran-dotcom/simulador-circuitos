/* Firma del autor, visible en la parte superior derecha de cada práctica.
   Para cambiar el nombre, editá solamente la línea siguiente. */
(function(){
  var AUTOR='Rodolfo Emanuel Durán';
  var css='.autor-badge{flex:0 0 auto;margin-left:auto;align-self:center;padding:4px 11px;border:1px solid #6abbd266;border-radius:999px;background:linear-gradient(135deg,#193b55d9,#102438d9);color:#dff6ff;font:700 .72rem/1.2 system-ui,-apple-system,"Segoe UI",sans-serif;letter-spacing:.01em;white-space:nowrap;box-shadow:0 2px 8px #0005;pointer-events:none}'+
    '.autor-badge.autor-float{position:fixed;top:6px;right:108px;z-index:50;margin:0}'+
    '@media (max-height:520px){.autor-badge{padding:3px 8px;font-size:.62rem}}';
  function add(){
    if(document.querySelector('.autor-badge'))return;
    var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
    var s=document.createElement('span');s.className='autor-badge';s.textContent=AUTOR;s.title='Autor: '+AUTOR;
    var h=document.querySelector('header');
    if(h)h.appendChild(s);else{s.classList.add('autor-float');document.body.appendChild(s)}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',add);else add();
})();
