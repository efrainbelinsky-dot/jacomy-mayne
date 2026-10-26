/* analytics.js — plan de medición del kit (F7): los eventos se instrumentan durante el build, no después.
   Empuja a window.dataLayer siempre, y a gtag / fbq / Clarity solo si la marca los cargó (IDs en marca.js → medicion).
   Eventos (B2B, sin carrito): cta_click · los de landing.js y motion.js por 'lp:evento' · scroll_25/50/75/90. */
(() => {
  window.dataLayer = window.dataLayer || [];
  // C9 · consentimiento: GTM / GA4 / Pixel / Clarity se cargan solo después de "Accept" (localStorage jm_consent = granted).
  // Hasta entonces los eventos quedan en dataLayer (no salen del navegador). Sin IDs en marca.js no hay banner ni scripts.
  const M = window.MARCA || {}; const ids = M.medicion || {};
  const hayIds = Object.values(ids).some(Boolean);
  const leer = () => { try { return localStorage.getItem('jm_consent'); } catch { return null; } };
  const cargar = src => { const s = document.createElement('script'); s.async = true; s.src = src; document.head.append(s); };
  const activar = () => {
    if (window.__jmMedicion) return; window.__jmMedicion = true;
    if (ids.gtm) cargar(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(ids.gtm)}`);
    else if (ids.ga4) { cargar(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ids.ga4)}`); window.gtag = function () { window.dataLayer.push(arguments); }; window.gtag('js', new Date()); window.gtag('config', ids.ga4); }
    if (ids.meta_pixel) { !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js'); window.fbq('init', ids.meta_pixel); window.fbq('track', 'PageView'); }
    if (ids.clarity) { (function (c, l, a, r, i, t, y) { c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); }; t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i; y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y); })(window, document, 'clarity', 'script', ids.clarity); }
  };
  const banner = document.getElementById('consentimiento');
  const forzar = new URLSearchParams(location.search).get('consent') === '1';
  if (leer() === 'granted' && hayIds) activar();
  else if (banner && (forzar || (hayIds && !leer()))) {
    banner.hidden = false;
    banner.addEventListener('click', e => {
      const b = e.target.closest('[data-consent]'); if (!b) return;
      try { localStorage.setItem('jm_consent', b.dataset.consent); } catch {}
      banner.hidden = true;
      if (b.dataset.consent === 'granted' && hayIds) activar();
    });
  }
  const enviar = (evento, datos = {}) => {
    const d = { evento, pagina: location.pathname, ...datos };
    window.dataLayer.push({ event: evento, ...d });
    if (typeof window.gtag === 'function') window.gtag('event', evento, d);
    if (typeof window.fbq === 'function' && evento === 'generate_lead') window.fbq('track', 'Lead');   // sin nombre ni mail
    if (['localhost', '127.0.0.1', ''].includes(location.hostname)) console.debug('[medición]', evento, d);
  };
  window.addEventListener('lp:cta_click', e => enviar('cta_click', e.detail));
  // eventos propios de la landing (landing.js): form_start, form_step_2, generate_lead, email_copy, mailto_click, tel_click, whatsapp_click, work_open, brand_open, intro_skip, exit_survey
  window.addEventListener('lp:evento', e => { const { evento, ...d } = e.detail || {}; if (evento) enviar(evento, d); });
  const hitos = [25, 50, 75, 90]; const vistos = new Set();
  addEventListener('scroll', () => {
    const h = document.documentElement; const pct = (h.scrollTop + innerHeight) / h.scrollHeight * 100;
    for (const m of hitos) if (pct >= m && !vistos.has(m)) { vistos.add(m); enviar(`scroll_${m}`); }
  }, { passive: true });
})();
