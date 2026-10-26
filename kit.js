/* kit.js — comportamiento mínimo del kit (sin dependencias), recortado para una landing B2B sin carrito (ronda 3, compliance C22).
   Nada de esto hace visible el contenido (R3): sin JS la página se lee completa. */
(() => {
  const local = ['localhost', '127.0.0.1', ''].includes(location.hostname);
  const q = new URLSearchParams(location.search);

  // Modo wireframe: ?wire=1 (misma página en grises con el rol de cada sección)
  if (q.get('wire') === '1') document.documentElement.classList.add('wire');

  // Datos de muestra y pendientes del cliente (.muestra): solo existen en localhost (R10).
  if (!local) document.querySelectorAll('.muestra').forEach(el => el.remove());

  // CTAs: data-cta="<destino>" [data-ubicacion="hero|barra|s6-tarjeta-n|…"] → evento cta_click (el link hace el resto)
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-cta]'); if (!b) return;
    window.dispatchEvent(new CustomEvent('lp:cta_click', { detail: { destino: b.dataset.cta, ubicacion: b.dataset.ubicacion || '', texto: b.textContent.trim().slice(0, 60) } }));
  });

  document.querySelectorAll('[data-anio]').forEach(el => { el.textContent = new Date().getFullYear(); });
})();
