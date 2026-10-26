/* efectos.js · Jacomy & Mayne · ronda 11 (Efraín: "negros, y lo mismo en gris, con los puntitos", como el pie de bymonolog.com).
   M17 · medio tono de puntos: un canvas detrás de la firma del final con formas que ondulan lento, dibujadas en una trama de puntos grises
   sobre el casi negro. Un solo canvas; corre a 30 cuadros solo mientras se ve (IntersectionObserver) y con la pestaña visible.
   Con prefers-reduced-motion se dibuja un cuadro quieto. No depende de GSAP. */
(() => {
  const cv = document.querySelector('[data-trama]');
  if (!cv || !cv.getContext) return;
  const ctx = cv.getContext('2d');
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const color = '#3A3934';                       // gris cálido: la firma (#E8E8E3) y el renglón legal siguen legibles encima
  let W = 0, H = 0, dpr = 1, paso = 7, visible = false, raf = 0, ult = 0, t0 = performance.now();

  const medir = () => {
    const r = cv.getBoundingClientRect();
    dpr = Math.min(2, devicePixelRatio || 1);
    W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    paso = W < 600 ? 6 : 7;
  };
  const suave = (a, b, v) => { const k = Math.min(1, Math.max(0, (v - a) / (b - a))); return k * k * (3 - 2 * k); };

  const dibujar = t => {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = color;
    ctx.beginPath();
    const s = t / 1000, rMax = paso * 0.48;
    for (let y = paso / 2; y < H; y += paso) {
      const sube = suave(0, 0.4, y / H);            // los puntos nacen de a poco desde arriba: sin borde duro
      for (let x = paso / 2; x < W; x += paso) {
        // campo de ondas lentas (dos senos cruzados que se deforman entre sí)
        const v = Math.sin(x * 0.0042 + s * 0.22 + Math.sin(y * 0.0065 - s * 0.16) * 1.7) * 0.6
                + Math.sin(y * 0.011 + x * 0.0018 - s * 0.28) * 0.4;
        const r = rMax * suave(-0.15, 0.75, v) * sube;
        if (r < 0.35) continue;
        ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, Math.PI * 2);
      }
    }
    ctx.fill();
  };

  const cuadro = t => {
    raf = 0;
    if (!visible || document.hidden) return;
    if (t - ult >= 33) { ult = t; dibujar(t - t0); }   // 30 cuadros por segundo alcanzan para un movimiento lento
    raf = requestAnimationFrame(cuadro);
  };
  const seguir = () => { if (!quieto && visible && !document.hidden && !raf) raf = requestAnimationFrame(cuadro); };

  medir(); dibujar(0);
  let tm = 0;
  addEventListener('resize', () => { clearTimeout(tm); tm = setTimeout(() => { medir(); dibujar(performance.now() - t0); }, 150); });
  if (quieto) return;
  if ('IntersectionObserver' in window) new IntersectionObserver(es => { visible = es[0].isIntersecting; seguir(); }).observe(cv);
  else { visible = true; seguir(); }
  document.addEventListener('visibilitychange', seguir);
})();
