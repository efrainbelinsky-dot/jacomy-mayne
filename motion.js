/* motion.js · Jacomy & Mayne · los 8 gestos de la referencia madre con los valores medidos (referencia-madre.md → Fichas, DESIGN.md → Motion).
   G1 intro (Holy Studio) · G2 letras con resorte (Butterfly Cannon) · G3 Lenis 0,5 + renglones + texto que se ilumina (MONOLOG) ·
   G4 frase horizontal fijada (Sweet Tape) · G5 v2 luz en escalera + polígono que rueda (Neutomni) · G6 Selected Work con revelado
   diagonal, scrub 0,8 e imán (Neutomni) · G8 h2 con blur + firma que se escribe (Neutomni + Butterfly Cannon). (G7 salió con S6 en la ronda 9.)
   Recreaciones guardadas en landings/_motion/M01…M08 (R40).
   R3: nada depende de este archivo para verse. Con prefers-reduced-motion no corre nada (página terminada); si GSAP no cargó, la
   página queda quieta y completa (solo G1 y G2/G3 de entrada usan WAAPI). Los estados iniciales ocultos los pone este script. */
(() => {
  // El armado de GSAP / ScrollTrigger / Lenis es pesado: corre cuando termina la intro, así el hilo principal queda libre mientras la firma
  // baja (si no, la intro se traba ~0,7 s en la última parte). Sin intro, corre enseguida.
  const cuerpo = () => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const evento = (nombre, datos = {}) => window.dispatchEvent(new CustomEvent('lp:evento', { detail: { evento: nombre, ...datos } }));
  const css = n => getComputedStyle(root).getPropertyValue(n).trim();
  // curvas de tokens.css, como función para GSAP (cubic-bezier resuelto por Newton)
  const bez = (x1, y1, x2, y2) => {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const X = t => ((ax * t + bx) * t + cx) * t, Y = t => ((ay * t + by) * t + cy) * t, dX = t => (3 * ax * t + 2 * bx) * t + cx;
    return x => { let t = x; for (let i = 0; i < 6; i++) { const d = dX(t); if (Math.abs(d) < 1e-6) break; t -= (X(t) - x) / d; } return Y(Math.min(1, Math.max(0, t))); };
  };
  const SALIDA = bez(.22, 1, .36, 1);          // "transition" de MONOLOG
  const SALIDA_CSS = 'cubic-bezier(.22,1,.36,1)', RESORTE_CSS = 'cubic-bezier(.2,.9,.3,1.06)';

  /* ---------- partir texto en letras (dentro de palabras que no se cortan); el texto completo queda para lectores ---------- */
  const partir = el => {
    if (el.dataset.partido) return [...el.querySelectorAll('.letra')];
    const texto = el.textContent.replace(/\s+/g, ' ').trim();
    const letras = [];
    const recorrer = nodo => [...nodo.childNodes].forEach(h => {
      if (h.nodeType === 3) {
        const frag = document.createDocumentFragment();
        h.textContent.split(/(\s+)/).forEach(p => {
          if (!p) return;
          if (/^\s+$/.test(p)) { frag.append(' '); return; }
          const w = document.createElement('span'); w.className = 'palabra';
          [...p].forEach(c => { const l = document.createElement('span'); l.className = 'letra'; l.textContent = c; w.append(l); letras.push(l); });
          frag.append(w);
        });
        h.replaceWith(frag);
      } else if (h.nodeType === 1 && !h.classList.contains('cinta')) recorrer(h);
    });
    recorrer(el);
    if (!el.closest('[aria-hidden="true"]')) {
      const vis = document.createElement('span'); vis.setAttribute('aria-hidden', 'true'); vis.append(...el.childNodes);
      if (/^H[1-6]$/.test(el.tagName)) { el.setAttribute('aria-label', texto); el.append(vis); }   // encabezados: el nombre accesible va en aria-label (sin texto oculto que desborde)
      else { const sr = document.createElement('span'); sr.className = 'sr'; sr.textContent = texto; el.append(sr, vis); }
    }
    el.dataset.partido = '1';
    return letras;
  };

  /* ================= G1 · intro: corre en el script en línea del hero (index.html), así no espera a los CDN ================= */
  const enIntro = root.classList.contains('intro') && !window.__introFin;

  /* ---------- barra y hero (ronda 9): la barra flota sobre el hero; la firma chica de la barra está apagada mientras se ve la grande
                 (el h1) y se cruzan al bajar: la grande 1 → 0 y la chica 0 → 1 entre 0,2 y 0,65 × H (H = alto de S1b). El hero hace parallax
                 translateY(0,4 × scroll) como Holy Studio. Con reduced-motion: sin parallax y la chica aparece cuando el hero sale ---------- */
  const heroEl = document.querySelector('.hero'), barraEl = document.querySelector('.barra');
  if (heroEl && barraEl) {
    const chica = barraEl.querySelector('.barra-firma'), grande = heroEl.querySelector('.hero-firma'), mueve = heroEl.querySelector('[data-hero-mueve]');
    const tit = document.getElementById('titular');
    let pend = false;
    const marcar = () => {
      pend = false;
      const abajo = heroEl.getBoundingClientRect().bottom;
      barraEl.classList.toggle('sobre-hero', abajo > barraEl.offsetHeight + 8);
      if (!chica) return;
      if (reduce) { chica.style.opacity = abajo <= barraEl.offsetHeight ? '1' : '0'; return; }
      const y = Math.max(0, scrollY), H = (tit || heroEl).offsetHeight || innerHeight;
      const k = Math.min(1, Math.max(0, (y - 0.2 * H) / (0.45 * H)));
      chica.style.opacity = k.toFixed(3);
      if (grande) grande.style.opacity = (1 - k).toFixed(3);
      if (mueve) mueve.style.transform = y < heroEl.offsetHeight ? `translate3d(0,${(0.4 * y).toFixed(1)}px,0)` : '';
    };
    addEventListener('scroll', () => { if (!pend) { pend = true; requestAnimationFrame(marcar); } }, { passive: true });
    addEventListener('resize', marcar); marcar();
  }
  if (reduce) return;

  /* ---------- hero: los trabajos cambian solos (Holy Studio: cada ~2 s, fundido de 1 s), con pausa (WCAG 2.2.2) ---------- */
  const slidesHero = [...document.querySelectorAll('[data-slides] .hero-slide')];
  const pausa = document.querySelector('[data-pausa]');
  if (slidesHero.length > 1) {
    let k = 0, timer = null, pausado = false, visible = true;
    const pasar = () => { slidesHero[k].classList.remove('activa'); k = (k + 1) % slidesHero.length; const n = slidesHero[k]; setTimeout(() => n.classList.add('activa'), 520); };   // sale una (0,5 s), después entra la otra
    const sync = () => { clearInterval(timer); timer = null; if (!pausado && visible && !document.hidden) timer = setInterval(pasar, 2200); };
    const arrancar = () => { if (pausa) pausa.hidden = false; sync(); };
    if (pausa) pausa.addEventListener('click', () => { pausado = !pausado; pausa.setAttribute('aria-pressed', String(pausado)); pausa.setAttribute('aria-label', pausado ? 'Play slideshow' : 'Pause slideshow'); sync(); });
    new IntersectionObserver(es => { visible = es[0].isIntersecting; sync(); }).observe(heroEl);
    document.addEventListener('visibilitychange', sync);
    // QA: ?slide=N fija esa foto (0, 1, 2) y apaga el autoplay; ?qa=1 lo apaga y deja la primera
    const qp = new URLSearchParams(location.search), fija = qp.get('slide');
    if (fija !== null || qp.get('qa') === '1') {
      const n = Math.min(slidesHero.length - 1, Math.max(0, parseInt(fija, 10) || 0));
      pausado = true; slidesHero.forEach((x, i) => { x.style.transition = 'none'; x.classList.toggle('activa', i === n); });
    } else if (enIntro) addEventListener('jm:intro-fin', arrancar, { once: true }); else arrancar();
  }

  /* ================= G3 · titular de S1b por renglones (MONOLOG: yPercent 150 → 0 dentro de la máscara del renglón, 0,95 s, salida,
                       stagger 0,075, al 80 %, una vez) y "Worked with…" 0,65 s (opacidad 0 → 1, y 12 → 0) 0,3 s después del último ================= */
  const titH = document.querySelector('[data-lineas]');
  if (titH && 'IntersectionObserver' in window) {
    const rs = [...titH.querySelectorAll('.renglon-in')], cli = document.querySelector('[data-clientes]');
    rs.forEach(r => { r.style.transform = 'translateY(150%)'; r.parentElement.classList.add('mascara'); });
    if (cli) cli.style.opacity = '0';
    const ioT = new IntersectionObserver(es => { if (!es[0].isIntersecting) return; ioT.disconnect();
      rs.forEach((r, i) => { r.style.transform = ''; r.animate([{ transform: 'translateY(150%)' }, { transform: 'none' }], { duration: 950, delay: i * 75, easing: SALIDA_CSS, fill: 'backwards' })
        .finished.then(() => r.parentElement.classList.remove('mascara'), () => r.parentElement.classList.remove('mascara')); });
      if (cli) { cli.style.opacity = ''; cli.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: 650, delay: (rs.length - 1) * 75 + 300, easing: SALIDA_CSS, fill: 'backwards' }); }
    }, { rootMargin: '0px 0px -20% 0px' });
    ioT.observe(titH);
  }

  /* ================= G2 · letra por letra con resorte (Butterfly Cannon: y 60 → 0, resorte 120/18 ≈ 720 ms, opacidad 0,3 s, stagger 22 ms) ================= */
  const titulos = [...document.querySelectorAll('[data-partir]')].map(el => ({ el, letras: partir(el) }));
  titulos.forEach(t => t.letras.forEach(l => { l.style.opacity = '0'; }));
  const subir = t => {
    if (t.hecho) return; t.hecho = true;
    t.letras.forEach((l, i) => {
      const delay = i * 22;
      l.style.opacity = '';
      l.animate([{ transform: 'translateY(60px)' }, { transform: 'none' }], { duration: 720, delay, easing: RESORTE_CSS, fill: 'backwards' });
      l.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'backwards' });
    });
  };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { const t = titulos.find(x => x.el === e.target); if (t) subir(t); io.unobserve(e.target); } }), { threshold: 0 });
    titulos.forEach(t => io.observe(t.el));
  } else titulos.forEach(subir);

  /* ================= desde acá, GSAP + ScrollTrigger (cdnjs 3.15.0) + Lenis (jsDelivr 1.3.27) ================= */
  const G = window.gsap, ST = window.ScrollTrigger;
  if (!G || !ST) return;
  G.registerPlugin(ST);
  root.classList.add('motion');

  /* ---------- scroll suavizado (Lenis movido por el ticker de GSAP). Ronda 9 (LL23, "no está tan smooth"): lerp 0,07 como Neutomni
                 (0,3 en ≤ 768 px), medido en r9-smooth.mjs: una muesca llega al 90 % en ~535 ms con arranque suave y cola larga. Antes
                 duration 1,2 (salida exponencial: arranca fuerte y frena seco). Uno solo para toda la página (S3 incluida) ---------- */
  let lenis = null;
  if (window.Lenis) {
    lenis = new window.Lenis({ lerp: innerWidth <= 768 ? 0.3 : 0.07 });
    window.__jmLenis = lenis;
    lenis.on('scroll', ST.update);
    G.ticker.add(t => lenis.raf(t * 1000));
    G.ticker.lagSmoothing(0);
  }
  const barra = () => (document.querySelector('.barra') || {}).offsetHeight || 0;
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]'); if (!a || !lenis || a.classList.contains('saltar')) return;
    const id = a.getAttribute('href'); if (id.length < 2) return;
    const t = document.querySelector(id); if (!t) return;
    e.preventDefault();
    lenis.scrollTo(t, { offset: -(barra() + 12), duration: 1, onComplete: () => { if (!t.hasAttribute('tabindex')) t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); } });
  });

  /* ---------- G3 · la respuesta de S3 se ilumina letra por letra con el scroll (0,2 → 1, ~800 px) ---------- */
  // (se arma dentro de G4: la respuesta vive en la escena fijada y se ilumina en el último tramo, mientras llega la firma)
  const respuesta = document.querySelector('[data-ilumina]');
  const letrasResp = respuesta ? partir(respuesta) : [];

  /* ---------- G4 · frase horizontal fijada (Sweet Tape giant-pinning): ~1,04 px de texto por px, ease none, scrub 0,6; hacia la IZQUIERDA ---------- */
  const pistaF = document.querySelector('[data-frase]');
  const lienzo = [...document.querySelectorAll('[data-lienzo]')].find(el => !el.hidden);
  if (pistaF && lienzo) {
    const palabras = [...lienzo.querySelectorAll('.fr-palabra')];
    const grupos = palabras.map(w => ({ w, letras: partir(w), hecho: false }));
    const fotos = [...lienzo.querySelectorAll('.fr-foto')];
    const firmaS3 = lienzo.querySelector('.fr-firma svg');
    const cinta = lienzo.querySelector('[data-cinta]');
    grupos.forEach(g => G.set(g.letras, { yPercent: 130, opacity: 0 }));
    if (cinta) G.set(cinta, { scaleX: 0, rotation: -1.4, transformOrigin: '0% 50%' });
    // r18 (Efraín: "que se escriba como la del final: si scrolleás va apareciendo poco a poco"): la firma se escribe ATADA al scroll
    // con el mismo recorte que la del pie (--firma-p) y termina en ¾ de pantalla extra de pin sumada al recorrido (el horizontal sigue en 8).
    // r19 (Efraín: "quiero que se empiece a escribir al mismo tiempo y termine al mismo tiempo"): la firma y la respuesta de abajo comparten
    // UN tramo y UNA curva: lineal en el tiempo de la timeline fijada, desde que la firma asoma por el 60 % del ancho (T0) hasta el final
    // del pin. La respuesta se ilumina letra por letra (0,2 → 1) con el mismo progreso; si se sube, retroceden juntas.
    if (firmaS3) G.set(firmaS3, { '--firma-p': '0%' });
    let cintaK = 0, firmaT0 = 0.5, tlF = null, ultimoP = -1;
    const PUNTA = 0.6;
    const EXTRA = 0.75 / 8;   // ¾ de pantalla con el lienzo quieto al final; la escritura entera dura ≈ 3 pantallas (empieza en movimiento)
    const escena = pistaF.querySelector('.fr-escena');
    const xTotal = () => Math.max(0, lienzo.scrollWidth - document.documentElement.clientWidth);
    const recorrido = () => 8 * innerHeight;    // Sweet Tape fija ≈ 7.908 px a 1440×900 (corrección de Efraín: largo y lento)
    const fijo = { trigger: escena, start: 'top top', end: () => '+=' + Math.round(recorrido()), scrub: 0.6, invalidateOnRefresh: true };
    const revisar = () => {
      const borde = innerWidth * 0.96;
      grupos.forEach(g => {
        if (g.hecho || g.w.getBoundingClientRect().left > borde) return;
        g.hecho = true;
        const orden = g.letras.map((l, i) => i).sort(() => Math.random() - 0.5);   // orden aleatorio, como Sweet Tape
        orden.forEach((i, k) => G.to(g.letras[i], { yPercent: 0, opacity: 1, duration: 0.6, ease: 'power3.out', delay: k * 0.025 }));
      });
      if (cinta) { const k = Math.min(1, Math.max(0, (innerWidth * 0.92 - cinta.getBoundingClientRect().left) / (innerWidth * 0.12))); cintaK = Math.max(cintaK, SALIDA(k)); G.set(cinta, { scaleX: cintaK }); }   // se pega atada al scroll al cruzar el 60 % del ancho (no depende de un tiempo) y no se despega
    };
    const medirFirma = () => {   // T0: punto del recorrido (0–1) en que el borde izquierdo de la firma cruza el 60 % del ancho
      if (!firmaS3) return;
      const xt = xTotal(), l0 = firmaS3.getBoundingClientRect().left - (Number(G.getProperty(lienzo, 'x')) || 0);
      firmaT0 = xt ? Math.min(1, Math.max(0, (l0 - innerWidth * PUNTA) / xt)) : 0;
    };
    const escribirFirma = () => {   // un solo progreso p para las dos
      if (!tlF) return;
      const p = Math.min(1, Math.max(0, (tlF.time() - firmaT0) / (1 + EXTRA - firmaT0)));
      if (Math.abs(p - ultimoP) < 1e-4) return; ultimoP = p;
      if (firmaS3) firmaS3.style.setProperty('--firma-p', (p * 100).toFixed(2) + '%');
      const n = letrasResp.length;
      for (let i = 0; i < n; i++) letrasResp[i].style.opacity = (0.2 + 0.8 * Math.min(1, Math.max(0, p * n - i))).toFixed(3);   // letra i: de i/n a (i+1)/n
    };
    // el lienzo corre sin detenerse todo el recorrido (crítica r5: nada de tiempo quieto); la cinta se pega mientras pasa
    tlF = G.timeline({ onUpdate: escribirFirma, scrollTrigger: { ...fijo, end: () => '+=' + Math.round(recorrido() * (1 + EXTRA)), pin: true, onRefresh: () => { medirFirma(); ultimoP = -1; escribirFirma(); } } });
    tlF.fromTo(lienzo, { x: 0 }, { x: () => -xTotal(), ease: 'none', duration: 1 }, 0);
    tlF.to({}, { duration: EXTRA }, 1);   // la pantalla extra: el lienzo ya llegó y solo se escribe la firma
    // (r19: la respuesta ya no va en 0,52 de la timeline: la ilumina escribirFirma con el mismo progreso que la firma)
    fotos.forEach(f => G.fromTo(f, { x: () => 0.03 * innerWidth }, { x: () => -0.03 * innerWidth, ease: 'power2.inOut', scrollTrigger: { ...fijo } }));
    ST.create({ trigger: pistaF, start: 'top 85%', end: 'bottom top', onUpdate: revisar, onEnter: revisar, onRefresh: revisar });
  }

  const mm = G.matchMedia();

  /* ---------- G5 v2 · servicios (Neutomni "process", ronda 9: "que sea igual" al video; investigacion/motion-r9.md fichas 1 y 2).
       Relleno lineal, cuatro fromTo en el segundo 0 con duraciones 0,30 / 0,45 / 0,60 / 0,75 de una timeline de 1, scrub de 'top 25%'
       (≈ 224 px antes de que se clave la escena) a 'bottom top' (≈ 281 px de quietud tras la 4.ª). El texto no se toca: lo descubre la luz.
       Lienzo propio (recreación con la fórmula, no su código): un polígono regular que rueda sin deslizar sobre arcos de cadena
       (y = a·cosh(x/a), el camino sobre el que un polígono rueda con el eje a nivel), gana lados de 4 a 12 mientras el camino se aplana
       y termina en círculo sobre una recta; trazo del color del fondo, así solo se ve sobre la luz ---------- */
  const suave01 = x => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
  const lienzoG5 = (pista, { radio = 1, arranque = 0.25 } = {}) => {
    const cv = pista.querySelector('[data-sv-lienzo]'); if (!cv || !cv.getContext) return () => {};
    const ctx = cv.getContext('2d'); const tinta = css('--fondo') || '#000';
    let W = 0, Hc = 0, dpr = 1, obj = 0, act = 0, raf = 0, vivo = false;
    const medir = () => { const r = cv.getBoundingClientRect(); dpr = Math.min(2, devicePixelRatio || 1); W = r.width; Hc = r.height; cv.width = Math.round(W * dpr); cv.height = Math.round(Hc * dpr); };
    const dibujar = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, Hc);
      const t = Math.max(0, (act - arranque) / (1 - arranque));
      if (arranque > 0 && t <= 0) return;
      const R = 0.13 * Math.min(innerWidth, innerHeight) * radio;
      const t0 = Math.min(0.5, 2 * R / W);                                   // entra rodando ya cuadrado
      const tm = t < t0 ? 0 : suave01((t - t0) / (1 - t0));
      const n = 4 + 8 * Math.min(tm / 0.3, 1);                               // lados (fraccionario)
      const c = suave01((tm - 0.3) / 0.7);                                   // 0 = polígono · 1 = círculo
      const ap = R * Math.cos(Math.PI / n);                                  // apotema
      const Lc = ap * Math.asinh(Math.tan(Math.PI / n));                     // medio tramo de cadena (su largo de arco = medio lado)
      const tramo = 2 * Lc * (1 - c) + (2 * Math.PI * R / n) * c;            // avance horizontal por lado
      const y0 = Hc * 0.4 + R * 0.85;                                        // la recta final (donde apoya el círculo)
      const cy = y0 - (ap + (R - ap) * c);                                   // eje del polígono
      const x = -R + t * W;
      ctx.strokeStyle = tinta; ctx.fillStyle = tinta; ctx.lineWidth = 1.5;
      // eje punteado de lado a lado
      ctx.save(); ctx.setLineDash([5, 10]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke(); ctx.restore();
      // camino: un arco de cadena por lado, centrado en cada punto donde apoya un lado entero
      ctx.beginPath();
      for (let px = 0; px <= W; px += 3) {
        const k = Math.round((px + R) / tramo), u = (px - (-R + k * tramo)) * (Lc / (tramo / 2));
        const py = y0 + (1 - c) * ap * (Math.cosh(u / ap) - 1);
        px ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      }
      ctx.stroke();
      // polígono rotado: rueda sin deslizar (un lado por tramo)
      const rot = Math.PI / 2 + Math.PI / n + ((x + R) / tramo) * (2 * Math.PI / n);
      ctx.beginPath();
      if (c >= 0.999) ctx.arc(x, cy, R, 0, Math.PI * 2);
      else {
        const m = Math.ceil(n - 1e-6), ang = k => rot + Math.min(k, n) * (2 * Math.PI / n);
        for (let k = 0; k < m; k++) {
          const a1 = ang(k), a2 = k + 1 >= m ? rot + 2 * Math.PI : ang(k + 1);
          const x1 = Math.cos(a1) * R, y1 = Math.sin(a1) * R, x2 = Math.cos(a2) * R, y2 = Math.sin(a2) * R;
          for (let j = 0; j <= 10; j++) {
            const q = j / 10, qx = x1 + (x2 - x1) * q, qy = y1 + (y2 - y1) * q, r = Math.hypot(qx, qy) || 1, f = (r + (R - r) * c) / r;
            const X = x + qx * f, Y = cy + qy * f; (k || j) ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y);
          }
        }
        ctx.closePath();
      }
      ctx.stroke();
      ctx.beginPath(); ctx.arc(x, cy, 3, 0, Math.PI * 2); ctx.fill();
    };
    const tick = () => { act += (obj - act) * 0.2; if (Math.abs(obj - act) < 1e-4) act = obj; dibujar(); raf = (vivo || act !== obj) ? requestAnimationFrame(tick) : 0; };   // lerp 0,2 por cuadro
    const arrancar = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const st = ST.create({ trigger: pista, start: 'top top', end: 'bottom bottom',
      onUpdate: s => { obj = s.progress; arrancar(); }, onToggle: s => { vivo = s.isActive; arrancar(); },
      onRefresh: s => { medir(); obj = act = s.progress; dibujar(); } });
    medir(); dibujar();
    return () => { st.kill(); cancelAnimationFrame(raf); raf = 0; ctx.clearRect(0, 0, cv.width, cv.height); };
  };
  mm.add('(min-width: 992px)', () => {
    const pista = document.querySelector('[data-servicios]'); if (!pista) return;
    const cards = [...pista.querySelectorAll('.servicio')];   // la luz es el fondo de cada tarjeta: --k = alto de la luz (0 → 1, desde el piso)
    const tl = G.timeline({ scrollTrigger: { trigger: pista, start: 'top 25%', end: 'bottom top', scrub: true } });
    tl.to({}, { duration: 1 }, 0);
    [0.30, 0.45, 0.60, 0.75].forEach((fin, i) => { if (cards[i]) tl.fromTo(cards[i], { '--k': 0 }, { '--k': 1, ease: 'none', duration: fin }, 0); });
    return lienzoG5(pista, { radio: 1, arranque: 0.25 });
  });
  mm.add('(max-width: 991px)', () => {   // Neutomni a 390 y 820: escena fijada, tarjetas ya llenas que se deslizan entre el 35 % y el 75 %
    const pista = document.querySelector('[data-servicios]'); if (!pista) return;
    const ol = pista.querySelector('.servicios');
    // r10: el deslizamiento es una animación WAAPI pausada cuyo tiempo lo pone el scroll (como un ScrollTimeline): mismo recorrido
    // (x 0 → −sobrante entre el 35 % y el 75 % del pin, lineal) y el carrusel queda declarado como "en movimiento" para el navegador
    let anim = null, prog = 0;
    const poner = p => { prog = p; if (anim) anim.currentTime = Math.min(1, Math.max(0, (p - 0.35) / 0.40)) * 1000; };
    const armar = () => {
      if (anim) anim.cancel();
      const d = -Math.max(0, ol.scrollWidth - document.documentElement.clientWidth);
      anim = ol.animate([{ transform: 'translateX(0px)' }, { transform: `translateX(${d}px)` }], { duration: 1000, easing: 'linear', fill: 'both' });
      anim.pause(); poner(prog);
    };
    armar();
    ST.create({ trigger: pista, start: 'top top', end: 'bottom bottom', invalidateOnRefresh: true, onUpdate: self => poner(self.progress), onRefresh: self => { armar(); poner(self.progress); } });
    const limpiar = lienzoG5(pista, { radio: 1.2, arranque: 0 });
    return () => { if (anim) anim.cancel(); anim = null; if (typeof limpiar === 'function') limpiar(); };
  });

  /* ---------- G6 · Selected Work (Neutomni, ronda 9: "no está tan smooth"; investigacion/motion-r9.md ficha 3). Una pantalla por trabajo
       (pista 400svh = 2.700 px de pin). Timeline de n unidades con etiquetas 0…n: cada trabajo se revela de i a i + 0,9 con clip-path diagonal
       desde la esquina de abajo a la derecha (power2.inOut), también el 1.º (nada de pin quieto); la foto que entra 1,1 → 1 y la que tapa
       1 → 1,2 lineales; la fila 0,45 ↔ 1 en 0,28 u. ScrollTrigger con scrub 0,8 e imán por etiquetas: adelante si ya se abrió el 10 %,
       atrás si bajó del 90 %; 0,45–0,65 s power1.inOut, 0,09 s después de que la página queda quieta. Solo ≥ 992 ---------- */
  mm.add('(min-width: 992px)', () => {
    const tr = document.querySelector('[data-trabajos]'); if (!tr) return;
    const pista = tr.querySelector('.tr-pista');
    const slides = [...tr.querySelectorAll('[data-slide]')], imgs = slides.map(x => x.querySelector('img')), filas = [...tr.querySelectorAll('[data-fila]')];
    const n = slides.length;
    const pedir = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { imgs.forEach(i => { i.loading = 'eager'; }); pedir.disconnect(); } }, { rootMargin: '150% 0px' });
    pedir.observe(pista);
    const CERRADO = 'polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)', ABIERTO = 'polygon(0% 0%, 100% 0%, 100% 101%, 0% 101%)';
    G.set(slides, { clipPath: CERRADO }); G.set(imgs, { scale: 1.1, transformOrigin: '50% 50%' }); G.set(filas, { opacity: 0.45 });
    const tl = G.timeline({ paused: true });
    slides.forEach((sl, i) => {
      tl.to(sl, { clipPath: ABIERTO, duration: 0.9, ease: 'power2.inOut' }, i);
      tl.fromTo(imgs[i], { scale: 1.1 }, { scale: 1, duration: 0.9, ease: 'none', immediateRender: false }, i);
      if (i > 0) tl.to(imgs[i - 1], { scale: 1.2, duration: 0.9, ease: 'none' }, i);
      if (filas[i]) tl.to(filas[i], { opacity: 1, duration: 0.28, ease: 'none' }, i);
      if (i > 0 && filas[i - 1]) tl.to(filas[i - 1], { opacity: 0.45, duration: 0.28, ease: 'none' }, i);
    });
    tl.set({}, {}, n);                                                       // n unidades: etiqueta k = progreso k / n
    let activa = -1, st = null;
    const marcar = () => {
      const act = Math.max(0, Math.min(n - 1, Math.floor(tl.time() + 0.55) - 1));
      if (act === activa) return; activa = act;
      filas.forEach((fl, i) => { fl.classList.toggle('activa', i === act); fl.setAttribute('aria-current', i === act ? 'true' : 'false'); });
    };
    const iman = v => {
      const u = v * n, k = Math.floor(u + 1e-6), f = u - k, dir = st ? st.direction : 1;
      const o = dir >= 0 ? (f > 0.1 ? k + 1 : k) : (f < 0.9 ? k : k + 1);
      return Math.min(n, Math.max(0, o)) / n;
    };
    st = ST.create({ animation: tl, trigger: pista, start: 'top top', end: 'bottom bottom', scrub: 0.8, id: 'selected-work',
      snap: { snapTo: iman, duration: { min: 0.45, max: 0.65 }, delay: 0.09, ease: 'power1.inOut', inertia: false },
      onUpdate: marcar, onRefresh: marcar });
    marcar();
    const clicks = filas.map((fl, i) => { const h = () => { const y = st.start + (st.end - st.start) * ((i + 1) / n) + 2; lenis ? lenis.scrollTo(y, { duration: 1.1 }) : scrollTo({ top: y, behavior: 'smooth' }); }; fl.addEventListener('click', h); return h; });
    return () => {
      st.kill(); tl.kill();
      G.set(slides, { clearProps: 'clipPath' }); G.set(imgs, { clearProps: 'transform' }); G.set(filas, { clearProps: 'opacity' });
      filas.forEach((fl, i) => { fl.removeEventListener('click', clicks[i]); fl.classList.toggle('activa', i === 0); });
    };
  });

  /* ---------- G8 · cierre (ronda 9): h2 de S7b con blur por renglón (Neutomni: opacidad 0, blur 10 px, y 15 → 0, 0,4 s power1.out,
                 stagger 0,12, al 85 %) y la bajada 0,12 s después · opciones y fila del pie en cascada (M08: y 24 → 0, 0,65 s, stagger 0,06,
                 al 90 %) · la firma gigante se escribe (clip de izquierda a derecha, 1,2 s, al 92 %). Todo una vez ---------- */
  // el estado de partida se pone recién cuando el bloque asoma por abajo (antes queda visible: si nadie scrollea hasta acá, se lee igual, R3)
  const entrada = (targets, trigger, desde, hasta, start) => {
    if (!targets.length || !trigger) return;
    ST.create({ trigger, start: 'top bottom', once: true, onEnter: () => G.set(targets, desde) });
    G.fromTo(targets, desde, { ...hasta, immediateRender: false, scrollTrigger: { trigger, start, once: true } });
  };
  // r11 (Efraín: "From the name to the finished bottle design no me gusta mucho… cambialo por alguna otra animación de todas las webs"): el h2
  // de S4 deja las letras con resorte (G2) y entra con el blur por renglón de Neutomni (G8), con los mismos valores que el h2 de S7b.
  // Renglones reales: a ≥ 992 los dos .renglon; en < 992 cada .parte es su propio renglón
  document.querySelectorAll('[data-blur-lineas]').forEach(h => {
    const rs = [...h.querySelectorAll(':scope > .renglon')];
    const lineas = innerWidth >= 992 ? rs : rs.flatMap(r => (r.querySelector('.parte') ? [...r.querySelectorAll('.parte')] : [r]));
    entrada(lineas, h, { opacity: 0, filter: 'blur(10px)', y: 15 }, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.4, ease: 'power1.out', stagger: 0.12 }, 'top 85%');
  });
  const preg = document.querySelector('[data-blur]');
  if (preg) entrada([...preg.querySelectorAll('.renglon'), document.querySelector('[data-blur-sub]')].filter(Boolean), preg, { opacity: 0, filter: 'blur(10px)', y: 15 },
    { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.4, ease: 'power1.out', stagger: 0.12 }, 'top 85%');
  ['[data-opciones]', '[data-pie-fila]'].forEach(sel => {
    const el = document.querySelector(sel);
    if (el) entrada([...el.children].filter(h => !h.hasAttribute('data-ilumina-p')), el, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65, ease: SALIDA, stagger: 0.06 }, 'top 90%');   // r15: la frase del pie se ilumina (G10)
  });
  // ronda 10 (Efraín: "cuando al final se escribe, quiero que esté conectado con el scroll"): la firma gigante se escribe ATADA al scroll.
  // Un recorte (clip-path inset, la tinta que avanza de izquierda a derecha) va de 0 a 100 % desde que la firma asoma por abajo hasta el
  // final exacto de la página (maxScroll); si se sube, se borra hacia atrás. scrub: true porque Lenis ya suaviza. Con reduced-motion: entera.
  const escribe = document.querySelector('[data-escribe] svg');
  if (escribe) G.fromTo(escribe, { '--firma-p': '0%' }, { '--firma-p': '100%', ease: 'none',
    scrollTrigger: { trigger: escribe, start: 'top bottom', end: () => ST.maxScroll(window), scrub: true, invalidateOnRefresh: true } });

  /* ======================= RONDA 7 · corrección de Efraín (video 3): cinco gestos de MONOLOG, valores de G9–G13 =======================
     Ninguno fija (en MONOLOG tampoco): corren con el scroll normal. Recreaciones en landings/_motion/M09…M13. */
  // r17: mouse o dedo se decide por EVENTO (pointerType), nunca por media query: el panel de Efraín y las laptops táctiles dan hover:none
  const esRaton = t => t === 'mouse' || t === 'pen';

  /* ---------- G3 #2 · rótulos de sección: palabras xPercent −40, skewX 15, opacidad 0 → 0,65 s, stagger 0,05, al 85 %, una vez ---------- */
  document.querySelectorAll('[data-rotulo-entra]').forEach(r => {
    const t = r.textContent.trim(); const caja = document.createElement('span');
    t.split(/\s+/).forEach((w, i) => { if (i) caja.append(' '); const s = document.createElement('span'); s.style.display = 'inline-block'; s.textContent = w; caja.append(s); });
    r.replaceChildren(caja);
    G.fromTo(caja.children, { xPercent: -40, skewX: 15, opacity: 0 }, { xPercent: 0, skewX: 0, opacity: 1, duration: 0.65, stagger: 0.05, ease: SALIDA, scrollTrigger: { trigger: r, start: 'top 85%', once: true } });
  });

  /* ---------- G10 · S3b: cada letra 0,2 → 1, lineal, scrub de 'top 100%' a 'center 40%'; por renglón tl.from(letras, {stagger .1}, i * .3)
                 → cada renglón va 3 letras detrás del anterior (la ola en diagonal). Con reduced-motion este bloque no corre: todo en 1 ---------- */
  const ilus = [...document.querySelectorAll('[data-ilumina-p]')].map(el => ({ el, letras: partir(el) }));
  let ctxIl = null;
  const armarIl = () => {
    if (ctxIl) ctxIl.revert();
    ctxIl = G.context(() => ilus.forEach(({ el, letras }) => {
      const filas = []; let ult = null;   // renglones reales (como SplitText 'lines'): por la altura de cada palabra
      letras.forEach(l => { const y = l.parentElement.offsetTop; if (ult === null || Math.abs(y - ult) > 4) { filas.push([]); ult = y; } filas[filas.length - 1].push(l); });
      const tl = G.timeline({ scrollTrigger: { trigger: el, start: 'top 100%', end: 'center 40%', scrub: true } });
      filas.forEach((f, i) => tl.fromTo(f, { opacity: 0.2 }, { opacity: 1, duration: 0.5, stagger: 0.1, ease: 'none' }, i * 0.3));
    }));
  };
  if (ilus.length) {
    armarIl();
    let anchoIl = innerWidth, tIl = 0;
    addEventListener('resize', () => { if (Math.abs(innerWidth - anchoIl) < 40) return; anchoIl = innerWidth; clearTimeout(tIl); tIl = setTimeout(() => { armarIl(); ST.refresh(); }, 200); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { armarIl(); ST.refresh(); });
  }

  /* ---------- G11 · S4b (ronda 9): activo = el renglón bajo el cursor mientras se scrollea (MONOLOG lo logra con mouseenter bajo un cursor
                 quieto); sin cursor sobre la lista, o en táctil, el que pasa por el centro de la pantalla. Activo 1 / inactivo 0,45 en 0,2 s.
                 Una sola ventana 4:5 que viaja a su renglón (0,95 s, salida) y, adentro, las fotos pasan como una tira (0,65 s, salida),
                 una cada 4 renglones. El título del costado no cambia (LL22); sin fundidos ni blur de entrada (LL24) ---------- */
  const ay = document.querySelector('.ayuda-sec');
  if (ay) {
    const lista = ay.querySelector('[data-ay-lista]'), items = [...ay.querySelectorAll('[data-ay-item]')], fotos = [...ay.querySelectorAll('[data-ay-foto]')];
    const viaje = ay.querySelector('[data-ay-viaje]'), marco = ay.querySelector('[data-ay-marco]') || viaje;
    const leyenda = ay.querySelector('[data-ay-leyenda]'), creditos = [...ay.querySelectorAll('[data-ay-credito]')];
    let act = -1, gAct = -1, px = -1, py = -1, primera = true;
    // r13: la ventana se centra en el renglón por la FOTO (la leyenda cuelga debajo)
    const yDe = i => { const b = items[i].getBoundingClientRect(), c = viaje.parentElement.getBoundingClientRect(); return b.top - c.top + b.height / 2 - marco.offsetHeight / 2; };
    const activar = (i, forzar) => {
      if (i === act && !forzar) return;
      act = i;
      items.forEach((it, k) => it.classList.toggle('activa', k === i));
      const g = Math.min(fotos.length - 1, Math.floor(i * fotos.length / items.length));
      if (g !== gAct) { gAct = g; fotos.forEach((f, k) => f.classList.toggle('activa', k === g)); creditos.forEach(c => { c.textContent = 'From the portfolio · ' + (fotos[g].dataset.credito || ''); }); }   // r13: fundido de 0,2 s (CSS), sin tira
      if (leyenda) { const l = items[i].querySelector('.ay-linea'); leyenda.textContent = l ? l.textContent : ''; }
      if (primera) { G.set(viaje, { y: yDe(i) }); primera = false; }   // la primera vez se ubica sin animar (MONOLOG)
      else G.to(viaje, { y: yDe(i), duration: 0.95, ease: SALIDA, overwrite: 'auto' });
    };
    const elegir = () => {
      const r = lista.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
      let y = innerHeight / 2;
      if (px >= r.left && px <= r.right && py >= 0) y = py;   // px solo existe si se movió un mouse
      let k = items.findIndex(it => { const b = it.getBoundingClientRect(); return y >= b.top && y < b.bottom; });
      if (k < 0) k = y < r.top ? 0 : (y >= r.bottom ? items.length - 1 : act);
      if (k >= 0) activar(k);
    };
    addEventListener('pointermove', e => { if (!esRaton(e.pointerType)) return; px = e.clientX; py = e.clientY; elegir(); }, { passive: true });
    document.documentElement.addEventListener('mouseleave', () => { px = py = -1; });
    activar(0, true);
    ST.create({ trigger: ay, start: 'top bottom', end: 'bottom top', onUpdate: elegir, onRefresh: () => { if (act >= 0) G.set(viaje, { y: yDe(act) }); } });
  }

  /* ---------- G9 · S5b (ronda 9, LL24): la foto pasa con el scroll y nada más: parallax dentro de su ventana (y −125 → +125, escala 1,15,
                 ≥ 992). Salieron la segunda capa que subía girando y las fotos en fundido ---------- */
  const historias = [...document.querySelectorAll('[data-historia]')];
  mm.add('(min-width: 992px)', () => {
    historias.forEach(h => {
      const img = h.querySelector('[data-hi-foto] img'); if (!img) return;
      G.set(img, { scale: 1.15 });
      G.fromTo(img, { y: -125 }, { y: 125, ease: 'none', scrollTrigger: { trigger: h.querySelector('.hi-tapa'), start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  });

  /* r13 (Efraín: "Behind the bottles… le sacaste la animación… no se ve con la animación de la página"): cada tarjeta ENTRA con el panel de
     MONOLOG (G3 #4: la ventana de la foto se abre desde abajo, clip-path inset(100% 0 0 0) → 0, 1,25 s salida, al 85 %) y su texto con el
     blur por renglón; la foto sigue pasando con el scroll adentro (parallax de arriba). Lo que no se veía: la ronda 9 sacó la entrada y el
     parallax solo existe ≥ 992 */
  historias.forEach(h => {
    const tapa = h.querySelector('.hi-tapa'), txt = [...h.querySelectorAll('.hi-texto > *')];
    if (tapa) entrada([tapa], h, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.25, ease: SALIDA }, 'top 85%');
    if (txt.length) entrada(txt, h, { opacity: 0, filter: 'blur(10px)', y: 15 }, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.4, ease: 'power1.out', stagger: 0.12, delay: 0.25 }, 'top 85%');
  });

  /* r14 · el "reel" de MONOLOG (G9 #2, M11 v3): en el video de Efraín el cursor queda quieto y cada tarjeta, al pasar por debajo con el
     scroll, vela su foto y hace subir la ventana girada. Acá se prende por scroll en todos los anchos (la foto cruza la franja del medio:
     top 58 % → bottom 42 %, como el modo táctil de MONOLOG) y además con el mouse encima (CSS :hover). Mientras está activa, los 2 detalles
     de adentro se reemplazan cada 1,2 s (el primer cambio del video cae a los ~1,2 s de la entrada). Fuera de la franja vuelve al primero */
  historias.forEach(h => {
    const tapa = h.querySelector('.hi-tapa'), fotos = [...h.querySelectorAll('.hi-capa-foto')];
    if (!tapa || !fotos.length) return;
    let k = 0, reloj = 0;
    const mostrar = n => { k = n; fotos.forEach((f, i) => f.classList.toggle('activa', i === n)); };
    const prender = on => {
      h.classList.toggle('activa', on); clearInterval(reloj); reloj = 0;
      if (on && fotos.length > 1) reloj = setInterval(() => mostrar((k + 1) % fotos.length), 1200);
      else if (!on) setTimeout(() => { if (!h.classList.contains('activa') && !h.matches(':hover')) mostrar(0); }, 850);
    };
    ST.create({ trigger: tapa, start: 'top 58%', end: 'bottom 42%', onToggle: st => prender(st.isActive) });
    h.addEventListener('pointerenter', e => { if (esRaton(e.pointerType) && !h.classList.contains('activa') && fotos.length > 1 && !reloj) reloj = setInterval(() => mostrar((k + 1) % fotos.length), 1200); });
    h.addEventListener('pointerleave', e => { if (esRaton(e.pointerType) && !h.classList.contains('activa')) { clearInterval(reloj); reloj = 0; } });
  });

  /* ---------- G13 · S7a: fondo B/N con parallax −150 → +150 (≥ 992), la fila "→ PEOPLE" deriva +50 % de su ancho en todo el paso de
                 la sección, y al final el bloque se cierra con un clip-path (bottom center → 90% top) ---------- */
  const pe = document.querySelector('[data-people]');
  if (pe) {
    const foto = pe.querySelector('.pe-foto'), deriva = pe.querySelector('[data-pe-deriva]');
    const paso = { trigger: pe, start: 'top bottom', end: 'bottom top', scrub: true };
    mm.add('(min-width: 992px)', () => { if (foto) G.fromTo(foto, { y: -150 }, { y: 150, ease: 'none', scrollTrigger: { ...paso } }); });
    if (deriva) G.fromTo(deriva, { xPercent: 0 }, { xPercent: 50, ease: 'none', scrollTrigger: { ...paso } });
    G.fromTo(pe, { clipPath: 'inset(0% 0% 0% 0%)' }, { clipPath: 'inset(0% 1.25% 1.25% 1.25%)', ease: 'none', scrollTrigger: { trigger: pe, start: 'bottom center', end: '90% top', scrub: true } });
  }

  /* ======================= RONDA 10 · corrección de Efraín (G4) ======================= */

  /* ---------- M14 v3 · S4c (r11: "que las puedas mover y que corran solas si no"; r13: pantalla propia y dos cintas en sentidos opuestos):
                 cada cinta corre sola (70 px/s; 45 en < 992) en su sentido (data-dir: 1 = izquierda, −1 = derecha); el scroll la empuja
                 (|v| × 0,35, tope 900 px/s) y al subir se invierten las dos. Se arrastra con mouse o dedo (Pointer Events; touch-action pan-y),
                 con inercia (fricción 0,95), y con el scroll horizontal del pad (wheel deltaX); 2,5 s después vuelve a correr sola, entrando en
                 0,8 s. Con el mouse encima va al 25 %; una sola pausa para las dos (WCAG 2.2.2). Fuera de pantalla no corre. La posición es el
                 tiempo de una animación WAAPI pausada (para el navegador y el medidor es un carrusel en movimiento) */
  const cintas = [...document.querySelectorAll('[data-marcas]')];
  if (cintas.length) {
    const sec = document.getElementById('marcas') || cintas[0];
    const pausaM = document.querySelector('[data-marcas-pausa]');
    let scrollDir = 1, extra = 0, visible = false, pausado = false;
    const base = () => (innerWidth >= 992 ? 70 : 45);
    ST.create({ trigger: sec, start: 'top bottom', end: 'bottom top', onUpdate: self => {
      const v = self.getVelocity(); if (Math.abs(v) > 30) scrollDir = v > 0 ? 1 : -1;
      extra = Math.max(extra, Math.min(900, Math.abs(v) * 0.35));
    } });
    new IntersectionObserver(es => es.forEach(e => { visible = e.isIntersecting; })).observe(sec);
    if (pausaM) {
      pausaM.hidden = false;
      pausaM.addEventListener('click', () => { pausado = !pausado; pausaM.setAttribute('aria-pressed', String(pausado)); pausaM.setAttribute('aria-label', pausado ? 'Play brand names' : 'Pause brand names'); });
    }
    const estados = cintas.map(mc => {
      const pista = mc.querySelector('[data-marcas-pista]'), lista = pista.firstElementChild;
      const e = { mc, pista, lista, ancho: lista.offsetWidth || 1, x: 0, sentido: Number(mc.dataset.dir) || 1, propio: 0, arrastre: null, inercia: 0, quieto: 0, auto: 1, encima: false, anim: null };
      e.armar = () => { if (e.anim) e.anim.cancel(); e.anim = pista.animate([{ transform: 'translateX(0px)' }, { transform: `translateX(${-e.ancho}px)` }], { duration: 1000, easing: 'linear', fill: 'both' }); e.anim.pause(); };
      e.armar();
      mc.addEventListener('pointerenter', ev => { if (esRaton(ev.pointerType)) e.encima = true; }); mc.addEventListener('pointerleave', () => { e.encima = false; });
      mc.addEventListener('pointerdown', ev => {
        if (ev.button !== 0) return;
        // r16: cada marca es un link; el arrastre se decide recién a los 6 px (también con mouse), así un clic quieto abre la marca
        e.arrastre = { id: ev.pointerId, x0: ev.clientX, y0: ev.clientY, xp: ev.clientX, t: performance.now(), v: 0, decidido: false, raton: esRaton(ev.pointerType) };
        e.inercia = 0; e.movido = false;
      });
      mc.addEventListener('pointermove', ev => {
        const a = e.arrastre; if (!a || ev.pointerId !== a.id) return;
        if (!a.decidido) {
          const dx = Math.abs(ev.clientX - a.x0), dy = Math.abs(ev.clientY - a.y0);
          if (dx < 6 && dy < 6) return;
          if (dy > dx && !a.raton) { e.arrastre = null; return; }
          a.decidido = true; e.movido = true; try { mc.setPointerCapture(ev.pointerId); } catch (_) {} mc.classList.add('arrastrando');
        }
        const t = performance.now(), d = ev.clientX - a.xp;
        e.x += d; a.v = d / Math.max(1, t - a.t) * 16.7; a.xp = ev.clientX; a.t = t;
      });
      const soltar = ev => {
        const a = e.arrastre; if (!a || (ev && ev.pointerId !== a.id)) return;
        if (a.decidido) { e.inercia = Math.max(-80, Math.min(80, a.v)); e.quieto = performance.now(); e.auto = 0; }
        e.arrastre = null; mc.classList.remove('arrastrando');
      };
      mc.addEventListener('pointerup', soltar); mc.addEventListener('pointercancel', soltar); mc.addEventListener('lostpointercapture', soltar);
      mc.addEventListener('click', ev => { if (e.movido || Math.abs(e.inercia) > 1) { ev.preventDefault(); ev.stopPropagation(); e.movido = false; } }, true);   // un arrastre (≥ 6 px) no abre la marca
      // pad: el gesto horizontal corre la cinta 1:1 y frena el autoplay; el vertical sigue scrolleando la página
      mc.addEventListener('wheel', ev => {
        const dx = ev.deltaX || (ev.shiftKey ? ev.deltaY : 0);
        if (!dx || Math.abs(dx) <= Math.abs(ev.shiftKey ? 0 : ev.deltaY)) return;
        ev.preventDefault();
        e.x -= dx * (ev.deltaMode === 1 ? 16 : 1); e.inercia = 0; e.quieto = performance.now(); e.auto = 0;
      }, { passive: false });
      return e;
    });
    const medirM = () => estados.forEach(e => { const a = e.lista.offsetWidth || 1; if (a !== e.ancho) { e.ancho = a; e.armar(); } });
    addEventListener('resize', medirM);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(medirM);
    if ('ResizeObserver' in window) new ResizeObserver(medirM).observe(sec);          // los logos llegan después y cambian el ancho
    G.ticker.add((t, dt) => {
      if (!visible || document.hidden) return;
      const s = Math.min(dt, 64) / 1000, f = s * 60;
      extra *= Math.pow(0.92, f);
      estados.forEach(e => {
        if (!e.arrastre) {
          if (Math.abs(e.inercia) > 0.05) { e.x += e.inercia * f; e.inercia *= Math.pow(0.95, f); } else e.inercia = 0;
          if (e.auto < 1 && performance.now() - e.quieto > 2500) e.auto = Math.min(1, e.auto + s / 0.8);
          if (!pausado) e.x -= e.sentido * scrollDir * ((e.encima ? 0.25 : 1) * base() + extra) * s * e.auto;
        }
        e.x = ((e.x % e.ancho) - e.ancho) % e.ancho;              // siempre en (−ancho, 0]: la copia empalma sin salto
        if (e.anim) e.anim.currentTime = (-e.x / e.ancho) * 1000;
      });
    });
  }

  /* ---------- Ronda 11 · tramos claros (MONOLOG G3 #5, "gap"): el panel de la sección que cambia de tono se abre con clip-path atado al
                 scroll (inset 6 % a los costados y esquinas de 28 px → 0), de que asoma por abajo a que su borde llega al 20 % de la pantalla.
                 Alrededor se ve la sala oscura. Con reduced-motion no corre: el tramo ya está abierto ---------- */
  document.querySelectorAll('[data-panel]').forEach(sec => {
    G.fromTo(sec, { clipPath: 'inset(0% 6% 0% 6% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none',
      scrollTrigger: { trigger: sec, start: 'top bottom', end: 'top 20%', scrub: true } });
  });

  /* ---------- M15 · "Start a project" (barra, FAQ, PEOPLE y formulario) y, desde la ronda 13, Next, Back y Accept: imán que sigue al cursor (Neutomni G8: el botón va hacia el
                 mouse, la etiqueta un poco más), las letras ruedan de a una al pasar (CSS, 16 ms entre letras), un relleno negro que entra
                 desde el punto por donde llega el cursor y sale por donde se va, y un rebote al apretar (0,9 → 1 con elastic). Táctil: solo
                 el rebote. Teclado: con el foco ruedan las letras. Con reduced-motion este bloque no corre (el botón de siempre) ---------- */
  const imanes = [...document.querySelectorAll('[data-iman]')];
  imanes.forEach(b => {
    const texto = b.textContent.trim();
    b.setAttribute('aria-label', texto);
    const rueda = document.createElement('span'); rueda.className = 'btn-rueda';
    [...texto].forEach((c, i) => { const l = document.createElement('span'); l.className = 'btn-l'; l.style.setProperty('--i', i); const v = c === ' ' ? '\u00a0' : c; l.dataset.l = v; l.textContent = v; rueda.append(l); });
    const tinta = document.createElement('span'); tinta.className = 'btn-tinta'; tinta.setAttribute('aria-hidden', 'true');
    b.replaceChildren(tinta, rueda);
    b.classList.add('iman');
    const ir = (el, x, y) => G.to(el, { x, y, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
    let cerca = false;
    const punto = e => { const r = b.getBoundingClientRect(); b.style.setProperty('--mx', (e.clientX - r.left) + 'px'); b.style.setProperty('--my', (e.clientY - r.top) + 'px'); b.style.setProperty('--d', (2.2 * Math.hypot(r.width, r.height)) + 'px'); };
    b.iman = e => {   // radio de atracción: la caja del botón + 56 px alrededor
      const r = b.getBoundingClientRect(), gx = G.getProperty(b, 'x'), gy = G.getProperty(b, 'y');
      const cx = r.left - gx + r.width / 2, cy = r.top - gy + r.height / 2, dx = e.clientX - cx, dy = e.clientY - cy;
      const dentro = Math.abs(dx) < r.width / 2 + 56 && Math.abs(dy) < r.height / 2 + 56;
      if (dentro) { cerca = true; ir(b, dx * 0.32, dy * 0.42); ir(rueda, dx * 0.12, dy * 0.16); }
      else if (cerca) { cerca = false; G.to([b, rueda], { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, 0.35)', overwrite: 'auto' }); }
    };
    b.addEventListener('pointerenter', e => { if (!esRaton(e.pointerType)) return; punto(e); b.classList.add('tinta-on'); });
    b.addEventListener('pointerleave', e => { if (!esRaton(e.pointerType)) return; punto(e); b.classList.remove('tinta-on'); });
    b.addEventListener('pointerdown', () => G.to(b, { scale: 0.9, duration: 0.12, ease: 'power2.out', overwrite: 'auto' }));
    const soltar = () => G.to(b, { scale: 1, duration: 0.75, ease: 'elastic.out(1.1, 0.32)', overwrite: 'auto' });
    b.addEventListener('pointerup', soltar); b.addEventListener('pointercancel', soltar);
    b.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') G.fromTo(b, { scale: 0.92 }, { scale: 1, duration: 0.75, ease: 'elastic.out(1.1, 0.32)', overwrite: 'auto' }); });
  });
  if (imanes.length) {
    let ult = null, pend = false;
    addEventListener('pointermove', e => {
      if (!esRaton(e.pointerType)) return; ult = e; if (pend) return; pend = true;
      requestAnimationFrame(() => { pend = false; imanes.forEach(b => { if (b.getClientRects().length) b.iman(ult); }); });
    }, { passive: true });
  }

  /* ---------- r13 · G8 por defecto (Efraín: "cuando scrolleás para abajo, que se vea borroso al principio y cuando llegás se vea bien, con
                 el mismo scroll y tiempo" de Neutomni): titulares, párrafos y listas de toda la página entran por renglón con opacity 0 ·
                 blur 10 px · y 15 → 1 · 0 · 0, 0,4 s power1.out, stagger 0,12, al 85 %. El estado de partida se pone recién cuando el bloque
                 asoma por abajo (R3). Los párrafos de texto solo se parten en renglones reales en ese momento y vuelven a su HTML al terminar.
                 Quedan con su gesto propio: intro y hero, frase horizontal, textos que se iluminan, letras de Butterfly, rótulos, escenas
                 fijadas (S4, Selected Work), cintas, PEOPLE, formulario y lo que ya entra con blur o en cascada ---------- */
  const EXCLUIR = '.hero, .barra, #frase-horizontal, .servicios-sec, .trabajos, .marcas-sec, .people, [data-lineas], [data-ilumina], [data-ilumina-p], ' +
    '[data-partir], [data-mascara], [data-blur], [data-blur-sub], [data-rotulo-entra], [data-opciones], [data-pie-fila], .hi-texto, .paso, .confirmacion, .fu, ' +
    '.consentimiento, .encuesta, template, .sr, [hidden], [aria-hidden="true"], .ay-viaje, .ay-linea, .firma-gigante, .legal';
  const BLOQUES = 'main h2, main h3, main p, main li, main dt, main dd, footer h2, footer p';
  const g8 = [...document.querySelectorAll(BLOQUES)].filter(el => !el.closest(EXCLUIR) && !(el.parentElement && el.parentElement.closest('h2, h3, p, li, dt, dd')) && el.textContent.trim());
  const DESDE = { opacity: 0, filter: 'blur(10px)', y: 15 };
  const partirRenglones = el => {                        // solo texto plano: palabras → renglones reales (como SplitText 'lines')
    const original = el.textContent; const palabras = original.trim().split(/\s+/);
    el.textContent = ''; const spans = palabras.map((w, k) => { const sp = document.createElement('span'); sp.textContent = w; el.append(sp); if (k < palabras.length - 1) el.append(' '); return sp; });
    const filas = []; let ult = null;
    spans.forEach(sp => { const y = sp.offsetTop; if (ult === null || Math.abs(y - ult) > 4) { filas.push([]); ult = y; } filas[filas.length - 1].push(sp.textContent); });
    el.textContent = ''; const lineas = filas.map((f, k) => { const l = document.createElement('span'); l.className = 'g8-renglon'; l.textContent = f.join(' '); el.append(l); if (k < filas.length - 1) el.append(' '); return l; });
    return { lineas, volver: () => { el.textContent = original; } };
  };
  const lineasDe = el => {
    const rs = [...el.querySelectorAll(':scope > .renglon')];
    if (rs.length) {
      const ps = rs.flatMap(r => (r.querySelector(':scope > .parte') ? [...r.querySelectorAll(':scope > .parte')] : [r]));
      return { lineas: ps.every(p => getComputedStyle(p).display === 'block') ? ps : rs, volver: null };
    }
    if (!el.children.length && el.textContent.trim().split(/\s+/).length > 3 && getComputedStyle(el).display === 'block') return partirRenglones(el);
    return { lineas: [el], volver: null };
  };
  g8.forEach(el => {
    let estado = null;
    const preparar = () => { if (estado) return; estado = lineasDe(el); G.set(estado.lineas, DESDE); };
    ST.create({ trigger: el, start: 'top bottom', once: true, onEnter: preparar });
    ST.create({ trigger: el, start: 'top 85%', once: true, onEnter: () => {
      preparar();
      G.to(estado.lineas, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.4, ease: 'power1.out', stagger: 0.12, overwrite: true,
        onComplete: () => { G.set(estado.lineas, { clearProps: 'opacity,filter,transform' }); if (estado.volver) estado.volver(); } });
    } });
  });

  /* ======================= RONDA 15 · toques finales (Efraín: "démosle los toques finales de animaciones… de lo que tenemos") =======================
     Solo gestos medidos (referencia-madre.md G3, G9, G10; _motion M03/M09, M13, M19, M21–M23). transform, opacity y clip-path; en celular, más cortos */
  const corto = innerWidth < 992;

  /* M21 · rótulos de MONOLOG (G3 #2): además de las palabras (xPercent −40, skewX 15), el marcador "●" entra de scale 0,4 → 1 en 0,65 s */
  document.querySelectorAll('.rotulo[data-rotulo-entra]:not(.rotulo-nota)').forEach(r => {
    G.fromTo(r, { '--marca': 0.4 }, { '--marca': 1, duration: 0.65, ease: SALIDA, scrollTrigger: { trigger: r, start: 'top 85%', once: true } });
  });

  /* M22 · titular por renglones con máscara (MONOLOG G3 #1, data-split="heading"): yPercent 150 / opacidad 0 → 0 / 1, 0,95 s (0,65 en
     celular), stagger 0,03, salida, al 80 %, una vez. Renglones reales, partidos por la altura de cada palabra; cada uno en su máscara */
  document.querySelectorAll('[data-mascara]').forEach(h => {
    const texto = h.textContent.replace(/\s+/g, ' ').trim(), palabras = texto.split(' ');
    h.textContent = ''; const sp = palabras.map((w, k) => { const s = document.createElement('span'); s.textContent = w; h.append(s); if (k < palabras.length - 1) h.append(' '); return s; });
    const filas = []; let ult = null;
    sp.forEach(s => { const y = s.offsetTop; if (ult === null || Math.abs(y - ult) > 4) { filas.push([]); ult = y; } filas[filas.length - 1].push(s.textContent); });
    h.textContent = ''; h.setAttribute('aria-label', texto);
    const ins = filas.map(f => { const m = document.createElement('span'); m.className = 'm-linea'; m.setAttribute('aria-hidden', 'true');
      const i = document.createElement('span'); i.className = 'm-in'; i.textContent = f.join(' '); m.append(i); h.append(m); return i; });
    entrada(ins, h, { yPercent: 150, opacity: 0 }, { yPercent: 0, opacity: 1, duration: corto ? 0.65 : 0.95, stagger: 0.03, ease: SALIDA }, 'top 80%');
  });

  /* M23 · foto que se abre desde una esquina (MONOLOG G3 #4, el panel del hero): clip-path inset(100% 0 0 100%) → inset(0), 1,25 s salida
     (0,95 s en celular), al 85 %, una vez: Roy y Andy en el pie, la única foto que entraba sin gesto */
  const fuMarco = document.querySelector('.fu-marco');
  if (fuMarco) entrada([fuMarco], fuMarco, { clipPath: 'inset(100% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: corto ? 0.95 : 1.25, ease: SALIDA }, 'top 85%');

  /* M24 · tarjetas apiladas (MONOLOG G3 #6, solo ≥ 992): cuando sube el cierre, las preguntas bajan yPercent 0 → 50 (van a mitad de
     velocidad) y un velo negro las tapa 0 → 1; scrub de 'top bottom' a 'top top' del cierre. El tramo gris ya no corta seco */
  const fqSec = document.getElementById('preguntas'), cierreSec = document.getElementById('cierre');
  if (fqSec && cierreSec) mm.add('(min-width: 992px)', () => {
    G.fromTo(fqSec, { yPercent: 0, '--apila-velo': 0 }, { yPercent: 50, '--apila-velo': 1, ease: 'none', scrollTrigger: { trigger: cierreSec, start: 'top bottom', end: 'top top', scrub: true } });
  });

  /* las medidas cambian cuando llegan las fuentes y las fotos */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ST.refresh());
  addEventListener('load', () => ST.refresh());
  // r11: si el alto de la página cambia después (logos del carrusel, fuentes tardías), se recalcula: la firma del pie termina justo al final
  if ('ResizeObserver' in window) { let altoP = document.body.scrollHeight, tR = 0; new ResizeObserver(() => { const a = document.body.scrollHeight; if (Math.abs(a - altoP) < 2) return; altoP = a; clearTimeout(tR); tR = setTimeout(() => ST.refresh(), 200); }).observe(document.body); }
  };
  if (document.documentElement.classList.contains('intro') && !window.__introFin) addEventListener('jm:intro-fin', () => setTimeout(cuerpo, 0), { once: true });
  else cuerpo();
})();
