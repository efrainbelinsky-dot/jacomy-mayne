/* landing.js — comportamiento propio de la landing (sin dependencias). Nada de esto hace visible el contenido (R3):
   sin JS se ven la versión por defecto de cada texto y el formulario completo en un solo paso.
   Eventos: salen por 'lp:evento' y analytics.js los manda a dataLayer / gtag / fbq. */
(() => {
  const M = window.MARCA || {};
  const I = M.interruptores || {};
  const S = I.USAR_SEGURO || {};
  const local = ['localhost', '127.0.0.1', ''].includes(location.hostname);
  const q = new URLSearchParams(location.search);
  const evento = (nombre, datos = {}) => window.dispatchEvent(new CustomEvent('lp:evento', { detail: { evento: nombre, ...datos } }));
  document.documentElement.classList.add('js');

  // ---- Interruptores de textos.md: data-seguro="clave:true|false" se muestra cuando USAR_SEGURO[clave] coincide ----
  document.querySelectorAll('[data-seguro]').forEach(el => {
    const [clave, cuando] = el.dataset.seguro.split(':');
    el.hidden = String(!!S[clave]) !== cuando;
  });
  document.querySelectorAll('[data-whatsapp]').forEach(el => { el.hidden = !I.MOSTRAR_WHATSAPP; });

  // ---- r22 · CTA de la llamada: con cta_duracion = false dice "Book a 20-min call with Andy"; con marca.js → agenda.url, los 6 botones
  //      abren la agenda en otra pestaña (si no, van al formulario #form-proyecto: Efraín 2026-10-28, "que me lleve más abajo"). Corre antes que motion.js, que parte el texto en letras (M15) ----
  const agenda = (M.agenda && M.agenda.url) || null;
  document.querySelectorAll('a[data-cta]').forEach(a => {
    if (S.cta_duracion === false && a.textContent.trim() === 'Book a call with Andy') a.textContent = 'Book a 20-min call with Andy';
    if (agenda) { a.href = agenda; a.target = '_blank'; a.rel = 'noopener'; a.dataset.cta = 'agenda'; }
  });

  // ---- Titular por anuncio: solo utm_content=bottle-says cambia el titular de S1b (si no, queda la A). Ronda 9: el h1 es la firma del
  //      hero, así que la variante va a .titular-h y nunca a 'h1' (si no, reescribiría el nombre) ----
  const tpl = document.getElementById('titular-' + (q.get('utm_content') || '').replace(/[^a-z0-9-]/gi, ''));
  const tit = document.querySelector('.titular-h');
  if (tpl && tit) { tit.replaceChildren(tpl.content.cloneNode(true)); tit.classList.remove('titular-corto'); }   // r22: la variante larga vuelve al cuerpo de siempre
  // Bajada por anuncio (message match, estrategia.md): remembered → A1, generic → A2; sin UTM o con otro valor queda la de siempre
  const bajada = document.getElementById('bajada-' + (q.get('utm_content') || '').replace(/[^a-z0-9-]/gi, ''));
  const hb = document.querySelector('.hero-bajada');
  if (bajada && hb) { hb.replaceChildren(bajada.content.cloneNode(true)); hb.classList.add('dos'); }   // 2 renglones: la frase del anuncio + la de siempre

  // ---- r22 · video del hero (marca.js → hero.video): si hay archivo, un <video> a sangre reemplaza a las fotos que cambian, dentro
  //      de [data-slides] (así hereda el fundido de la intro y el velo de arriba). Con reduced-motion no arranca solo: queda el poster.
  //      El botón de pausa lo maneja motion.js. Sin archivo, el hero no cambia ----
  const hv = (M.hero && M.hero.video) || {};
  const slidesEl = document.querySelector('[data-slides]');
  if (slidesEl && (hv.mp4 || hv.webm)) {
    const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const img1 = slidesEl.querySelector('.hero-slide img');
    const v = document.createElement('video');
    v.className = 'hero-video';
    v.muted = true; v.defaultMuted = true; v.loop = true; v.playsInline = true; v.preload = 'metadata';
    ['muted', 'loop', 'playsinline'].forEach(a => v.setAttribute(a, ''));
    if (!quieto) { v.autoplay = true; v.setAttribute('autoplay', ''); }
    v.setAttribute('aria-hidden', 'true'); v.tabIndex = -1;
    const poster = hv.poster || (img1 && (img1.currentSrc || img1.src));
    if (poster) v.poster = poster;
    [['webm', 'video/webm'], ['mp4', 'video/mp4']].forEach(([k, t]) => { if (hv[k]) { const s = document.createElement('source'); s.src = hv[k]; s.type = t; v.append(s); } });
    slidesEl.prepend(v);
    slidesEl.closest('.hero').classList.add('con-video');
    slidesEl.setAttribute('aria-label', 'Packaging by Jacomy & Mayne (video)');
    slidesEl.removeAttribute('aria-roledescription');
  }

  // ---- r24 · video de Andy (#video-andy, marca.js → video_marca). Con mp4: poster + play (M15); al tocarlo, un <video> con sonido,
  //      controles, playsinline y preload="none" toma el lugar del poster y arranca. Eventos video_play (1.ª vez) y video_complete.
  //      Sin mp4: en localhost se ve el lugar (poster provisorio en B/N + "Video coming soon", .muestra); afuera la sección queda oculta ----
  const vm = M.video_marca || {}, vmSec = document.querySelector('[data-video-marca]');
  // r28 (Efraín 2026-10-29: "no lo subiste, todo igual que el localhost"): el lugar del video se ve también publicado, con "Video coming soon"
  if (vmSec) {
    vmSec.hidden = false;
    const marco = vmSec.querySelector('[data-vm-marco]'), play = vmSec.querySelector('[data-vm-play]'), posterEl = vmSec.querySelector('[data-vm-poster]');
    if (vm.poster && posterEl) { const im = posterEl.querySelector('img'); posterEl.querySelectorAll('source').forEach(s => s.remove()); im.removeAttribute('srcset'); im.src = vm.poster; marco.classList.add('con-poster'); }
    if (!vm.mp4) { const pr = vmSec.querySelector('[data-vm-pronto]'); if (pr) pr.hidden = false; marco.classList.add('sin-video'); }
    if (play) play.addEventListener('click', () => {
      if (!vm.mp4) return;                                   // sin video todavía: el botón solo muestra el lugar
      const v = document.createElement('video');
      v.className = 'vm-video'; v.controls = true; v.playsInline = true; v.preload = 'none';
      v.setAttribute('playsinline', ''); v.setAttribute('controls', '');
      if (vm.poster) v.poster = vm.poster;
      const src = document.createElement('source'); src.src = vm.mp4; src.type = 'video/mp4'; v.append(src);
      if (vm.subtitulos) { const t = document.createElement('track'); t.kind = 'captions'; t.srclang = 'en'; t.label = 'English'; t.src = vm.subtitulos; v.append(t); }
      let empezo = false;
      v.addEventListener('play', () => { if (!empezo) { empezo = true; evento('video_play', { video: 'andy' }); } });
      v.addEventListener('ended', () => evento('video_complete', { video: 'andy' }));
      marco.replaceChildren(v); marco.classList.add('reproduciendo');
      const pr = v.play(); if (pr) pr.catch(() => {});        // con sonido: lo arranca el toque del usuario
      v.focus({ preventScroll: true });
    });
  }

  // ---- Enlaces de la política de privacidad desde marca.js ----
  const pol = (M.legales || {}).politicas || {};
  document.querySelectorAll('[data-politica]').forEach(a => { const u = pol[a.dataset.politica]; if (u) a.href = u; });

  // ---- #marcas (r11, r13): logo del cliente si figura en marca.js → marcas; si no, el nombre como wordmark. El logo es una máscara
  //      (mask-image) pintada con un color: gris en reposo y, al pasar el mouse, el color real de la marca (marca.js → color) o blanco.
  //      Así los logos blancos, crema o negros se ven parejos y toman color. No depende del motion ----
  // r16: el color, el logo y el link también están en el HTML de cada <li> (style="--mc-color", data-logo, <a href>), así el hover y el clic
  // funcionan aunque marca.js no haya cargado; marca.js, si está, manda. Si landing.js corre antes que marca.js, se reintenta en el load
  const armarMarcas = () => {
    const marcasDatos = (window.MARCA && window.MARCA.marcas) || {};
    document.querySelectorAll('#marcas li[data-slug]').forEach(li => {
      const slug = li.dataset.slug, d = marcasDatos[slug] || {}, link = li.querySelector('.mc-link');
      const color = d.color || null, logo = d.logo !== undefined ? d.logo : (li.dataset.logo || null), url = d.url || (link && link.getAttribute('href'));
      if (color) li.style.setProperty('--mc-color', color);
      if (link && url) link.setAttribute('href', url);
      if (link && !link.dataset.evento) { link.dataset.evento = '1'; link.addEventListener('click', ev => { if (!ev.defaultPrevented) evento('brand_open', { slug }); }); }
      if (S.logos_licenciantes !== false && ['warner-bros', 'dc', 'peaky-blinders-co'].includes(slug)) return;   // r22: licenciantes solo como nombre
      if ((logo !== 'svg' && logo !== 'png') || li.querySelector('.mc-logo') || li.dataset.probando) return;
      li.dataset.probando = '1';
      const caja = link || li, nombre = caja.textContent.replace(/ /g, ' ').trim(), src = `img/logos/${slug}.${logo}`;
      const prueba = new Image();
      prueba.addEventListener('load', () => {
        const el = document.createElement('span'); el.className = 'mc-logo';
        if (li.closest('[aria-hidden="true"]')) el.setAttribute('aria-hidden', 'true'); else { el.setAttribute('role', 'img'); el.setAttribute('aria-label', nombre); }
        el.style.setProperty('--logo', `url("${src}")`);
        el.style.aspectRatio = `${prueba.naturalWidth} / ${prueba.naturalHeight}`;
        if (logo === 'png') el.style.maxHeight = prueba.naturalHeight + 'px';   // un PNG chico no se agranda de más (Catador: 61 px)
        caja.replaceChildren(el);
      }, { once: true });
      prueba.addEventListener('error', () => { delete li.dataset.probando; }, { once: true });   // si no carga, queda el nombre
      prueba.src = src;
    });
  };
  armarMarcas();
  if (!window.MARCA) addEventListener('load', armarMarcas, { once: true });

  // ---- Ronda 11 · cambio de tema de la barra al cruzar el borde de un tramo (MONOLOG data-theme-section): toma el tema de la sección que
  //      está debajo de su línea media (claro / gris / oscuro). Es color, no movimiento: corre también con reduced-motion ----
  const barraT = document.querySelector('.barra'), tramos = [...document.querySelectorAll('[data-tema]')];
  if (barraT && tramos.length) {
    let pendT = false, temaAct = '';
    const verTema = () => {
      pendT = false;
      const y = barraT.offsetHeight / 2; let t = 'oscuro';
      for (const sec of tramos) { const r = sec.getBoundingClientRect(); if (r.top <= y && r.bottom > y) { t = sec.dataset.tema; break; } }
      if (t === temaAct) return; temaAct = t;
      barraT.classList.remove('tema-claro', 'tema-gris'); if (t !== 'oscuro') barraT.classList.add('tema-' + t);
    };
    addEventListener('scroll', () => { if (!pendT) { pendT = true; requestAnimationFrame(verTema); } }, { passive: true });
    addEventListener('resize', verTema); verTema();
  }

  // ---- r21 · CTA flotante (r22: "Book a call with Andy"): visible desde que el hero terminó de pasar hasta que #start entra en pantalla (y oculto
  //      después: el pie nunca queda tapado). Toma el tema del tramo que tiene detrás, como la barra. El fundido lo hace el CSS ----
  const flot = document.querySelector('[data-flotante]'), heroF = document.getElementById('hero'), startF = document.getElementById('start');
  if (flot && heroF && startF) {
    const bF = flot.querySelector('.btn'); let pendF = false, visF = null, temaF = '';
    const verF = () => {
      pendF = false;
      const vh = innerHeight, ver = heroF.getBoundingClientRect().bottom <= 0 && startF.getBoundingClientRect().top > vh;
      if (ver !== visF) { visF = ver; flot.classList.toggle('visible', ver); }
      if (!ver) return;
      const y = bF.getBoundingClientRect().top + bF.offsetHeight / 2; let t = 'oscuro';
      for (const sec of tramos) { const r = sec.getBoundingClientRect(); if (r.top <= y && r.bottom > y) { t = sec.dataset.tema; break; } }
      if (t === temaF) return; temaF = t;
      bF.classList.remove('tema-claro', 'tema-gris'); if (t !== 'oscuro') bF.classList.add('tema-' + t);
    };
    addEventListener('scroll', () => { if (!pendF) { pendF = true; requestAnimationFrame(verF); } }, { passive: true });
    addEventListener('resize', verF); verF();
  }

  // ---- Ronda 12-13 · Roy y Andy (fondo de la fila del pie): una luz chica recorre el contorno de cada persona al pasar el mouse o con el foco; con LinkedIn
  //      en marca.js → fundadores, la silueta es el link ("Roy Mayne on LinkedIn"). Táctil: el primer toque muestra el halo, el segundo abre.
  //      La otra persona no cambia ----
  const fu = document.querySelector('[data-fundadores]');
  if (fu) {
    // r13 (Efraín: "que no le salga una luz, sino… una lucecita rápida que se desplace por el contorno y haga un recorrido, rápido. Medio
    // low-key, soft"): un trazo corto (7 % del contorno), beige claro, opacidad baja y desenfocado (feGaussianBlur 3), da una vuelta en 1 s al
    // entrar y después sigue muy despacio (una vuelta cada 12 s) mientras el mouse está encima. La otra persona no cambia. Reduced-motion:
    // el contorno entero, tenue y quieto
    const datosF = M.fundadores || [];
    const quietoF = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const trazos = [...fu.querySelectorAll('[data-fu-trazo]')];
    trazos.forEach(t => { const L = t.getTotalLength(); t.dataset.largo = L; if (!quietoF) { t.style.strokeDasharray = `${L * 0.07} ${L * 0.93}`; t.style.strokeDashoffset = '0'; } });
    let activoF = null;
    const prender = lado => {
      if (lado === activoF) return; activoF = lado;
      trazos.forEach(t => {
        const on = t.dataset.fuTrazo === lado, L = +t.dataset.largo;
        (t._anims || []).forEach(a => a.cancel()); t._anims = [];
        t.classList.toggle('activo', on);
        if (!on || quietoF || !t.getClientRects().length) return;
        const rapida = t.animate([{ strokeDashoffset: 0 }, { strokeDashoffset: -L }], { duration: 1000, easing: 'cubic-bezier(.45,.05,.4,1)' });
        t._anims.push(rapida);
        rapida.finished.then(() => { if (activoF !== lado) return; t._anims.push(t.animate([{ strokeDashoffset: -L }, { strokeDashoffset: -2 * L }], { duration: 12000, iterations: Infinity })); }, () => {});
      });
    };
    const halos = trazos;
    let tipo = 'mouse';
    fu.querySelectorAll('[data-fu-link]').forEach(a => {
      const lado = a.dataset.fuLink, d = { ...(datosF.find(x => x.lado === lado) || {}) };
      if (!d.linkedin) d.linkedin = a.getAttribute('href') || '';   // r16: el HTML ya trae la página del estudio (no depende de marca.js)
      if (d.linkedin) {
        a.setAttribute('href', d.linkedin); a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener');
        a.setAttribute('aria-label', d.nombre ? `${d.nombre} on LinkedIn` : 'LinkedIn');
      } else { a.removeAttribute('href'); a.setAttribute('aria-hidden', 'true'); a.classList.add('sin-link'); }
      a.addEventListener('pointerdown', e => { tipo = e.pointerType; });
      a.addEventListener('keydown', () => { tipo = 'teclado'; });
      a.addEventListener('pointerenter', e => { if (e.pointerType !== 'touch') prender(lado); });   // r17: por evento, no por media query
      a.addEventListener('pointerleave', e => { if (e.pointerType !== 'touch') prender(null); });
      a.addEventListener('focus', () => prender(lado)); a.addEventListener('blur', () => prender(null));
      a.addEventListener('click', e => {
        const activo = activoF === lado;
        if (tipo === 'touch' && !activo) { e.preventDefault(); prender(lado); return; }   // solo con dedo: 1.er toque = luz, 2.º abre; mouse, pad y teclado abren directo
        if (!d.linkedin) { e.preventDefault(); return; }
        evento('founder_linkedin', { lado });
      });
    });
    document.addEventListener('pointerdown', e => { if (e.pointerType === 'touch' && !e.target.closest('[data-fu-link]')) prender(null); });
  }

  // ---- Selected work: la foto entera abre la ficha si tiene URL en marca.js → casos (work_open) ----
  document.querySelectorAll('[data-caso]').forEach(fig => {
    const url = (M.casos || {})[fig.dataset.caso]; const marco = fig.querySelector('.tr-marco');
    const nombre = (fig.querySelector('.tr-nombre') || {}).textContent || '';
    if (!url || !marco) return;
    const a = document.createElement('a'); a.className = 'caso-abrir'; a.href = url; a.target = '_blank'; a.rel = 'noopener';
    a.setAttribute('aria-label', nombre + ', project page');
    a.append(...marco.childNodes); marco.append(a);   // el link envuelve la foto (no una capa transparente encima)
    a.addEventListener('click', () => evento('work_open', { caso: fig.dataset.caso }));
  });

  // ---- S6b · preguntas: acordeón (G12, MONOLOG faq_home). El CSS anima grid-template-rows 0fr → 1fr (0,6 s); abrir una cierra las
  //      otras (close-siblings). Funciona también con reduced-motion (sin animación). Sin JS, todas las respuestas quedan abiertas. ----
  const fqs = [...document.querySelectorAll('[data-fq]')];
  fqs.forEach(it => {
    const b = it.querySelector('[data-fq-boton]'); if (!b) return;
    b.addEventListener('click', () => {
      const abrir = !it.classList.contains('abierta');
      fqs.forEach(o => { o.classList.remove('abierta'); o.querySelector('[data-fq-boton]')?.setAttribute('aria-expanded', 'false'); });
      if (abrir) { it.classList.add('abierta'); b.setAttribute('aria-expanded', 'true'); evento('faq_open', { pregunta: +b.dataset.n }); }
    });
  });

  // ---- Formulario (#start), r21: un solo paso ----
  const form = document.getElementById('form-proyecto');
  if (form) {
    const cargado = Date.now(); let empezado = false;
    const conf = form.closest('section').querySelector('.confirmacion');
    // UTMs y origen en campos ocultos
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(k => { const v = q.get(k); if (v && form.elements[k]) form.elements[k].value = v.slice(0, 120); });
    if (form.elements.origen) form.elements.origen.value = location.pathname;

    const empezar = () => { if (!empezado) { empezado = true; evento('form_start'); } };
    form.addEventListener('focusin', empezar);
    form.addEventListener('change', empezar);

    // r21: un solo paso, abierto de entrada (salieron Next/Back, el cambio de paso y form_step_2). form_start = primer foco o primera
    // elección; la categoría (opcional) viaja en generate_lead.

    // (ronda 9: salieron S6 "Where are you starting from?" y su pregunta en el formulario; sin campo punto ni start_point_select)

    const err = (campo, id, mal) => { const p = document.getElementById(id); if (p) p.hidden = !mal; campo.setAttribute('aria-invalid', mal ? 'true' : 'false'); return mal; };
    const mailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

    const confirmar = nombre => {
      const t = document.getElementById(S.quien_lee === false ? 'confirmacion-directa' : 'confirmacion-segura');
      const frag = t.content.cloneNode(true); frag.querySelector('[data-nombre]').textContent = nombre;
      conf.replaceChildren(frag); conf.hidden = false; form.hidden = true; conf.setAttribute('tabindex', '-1'); conf.focus();
      try { sessionStorage.setItem('jm_enviado', '1'); } catch {}
    };

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const f = form.elements; const nombre = f.nombre.value.trim(); const email = f.email.value.trim();
      const m1 = err(f.nombre, 'e-nombre', !nombre); const m2 = err(f.email, 'e-email', !mailOk(email));
      if (m1 || m2) { (m1 ? f.nombre : f.email).focus(); return; }
      document.getElementById('e-envio').hidden = true;
      // anti-bot invisible: honeypot lleno o envío demasiado rápido → se "confirma" sin mandar nada
      if (f.website.value || Date.now() - cargado < ((M.formulario || {}).tiempo_minimo_ms || 0)) { confirmar(nombre); return; }

      const datos = Object.fromEntries(new FormData(form)); delete datos.website;
      datos.enviado = new Date().toISOString();
      const cfg = M.formulario || {};
      Object.assign(datos, cfg.extra || {});
      try {
        // r21: en localhost NUNCA se envía (antes, con endpoint cargado, el envío de prueba salía a FormSubmit)
        if (local) {
          console.debug('[formulario] localhost: no se envía nada', datos);
        } else if (cfg.endpoint) {
          const body = cfg.formato === 'form' ? new URLSearchParams(datos) : JSON.stringify(datos);
          const headers = cfg.formato === 'form' ? { Accept: 'application/json' } : { 'Content-Type': 'application/json', Accept: 'application/json' };
          const r = await fetch(cfg.endpoint, { method: cfg.metodo || 'POST', headers, body });
          if (!r.ok) throw new Error(r.status);
        } else throw new Error('sin endpoint');
        evento('generate_lead', { categoria: datos.categoria || '', utm_content: datos.utm_content || '' });
        confirmar(nombre);
      } catch {
        document.getElementById('e-envio').hidden = false;
      }
    });
  }

  // ---- Rutas directas: copiar mail, mailto, tel, WhatsApp ----
  document.addEventListener('click', e => {
    const c = e.target.closest('[data-copiar]');
    if (c) {
      const txt = c.dataset.copiar; const ok = () => { evento('email_copy'); const t = c.textContent; c.textContent = 'Copied'; setTimeout(() => { c.textContent = t; }, 2000); };
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(txt).then(ok).catch(() => {});
      return;
    }
    const r = e.target.closest('[data-ruta]');
    if (r) evento({ mailto: 'mailto_click', tel: 'tel_click', whatsapp: 'whatsapp_click' }[r.dataset.ruta] || 'ruta_click');
  });

  // ---- Encuesta de salida: solo desktop con mouse, una vez por sesión, si no envió el formulario ----
  const dlg = document.getElementById('encuesta-salida');
  if (dlg && dlg.showModal && matchMedia('(min-width: 1024px)').matches) {
    const visto = () => { try { return sessionStorage.getItem('jm_encuesta') || sessionStorage.getItem('jm_enviado'); } catch { return '1'; } };
    document.addEventListener('mouseout', e => {
      if (e.relatedTarget || e.clientY > 0 || visto()) return;
      try { sessionStorage.setItem('jm_encuesta', '1'); } catch {}
      dlg.showModal();
    });
    dlg.addEventListener('click', e => {
      const b = e.target.closest('[data-respuesta]'); if (!b) return;
      if (b.dataset.respuesta !== 'cerrar') evento('exit_survey', { respuesta: b.dataset.respuesta });
      dlg.close();
    });
  }
})();
