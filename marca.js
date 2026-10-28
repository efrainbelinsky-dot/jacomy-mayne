/* marca.js — ÚNICA fuente de datos de la marca en el sitio (LL4).
   Jacomy & Mayne es B2B: no hay productos, precios, carrito ni envíos. El único CTA es "Book a call with Andy" (r22) → agenda.url o #start
   (formulario de 2 pasos dentro de la página). Todo lo de acá sale de brief.md → "Datos verificados" (2026-10-23)
   o de textos.md (interruptores). Lo que falta va en null y se anota en estado.json → pendientes. */
window.MARCA = {
  nombre: "Jacomy & Mayne",
  dominio: "jacomymayne.com",
  locale: "en-US",                        // B2B: sin productos, precios, carrito ni envíos (se sacaron los campos del kit, ronda 3)

  // Interruptores de textos.md ("Interruptor para el constructor"). true = versión segura.
  interruptores: {
    USAR_SEGURO: {
      frase_horizontal: false,            // G4 decide. true → "WHO IS JACOMY & MAYNE?"
      quien_lee: true,                    // true → "We'll reply by email to set up the call." · false → "Andy reads it and replies by email…" (S7; solo si el cliente confirma)
      logos_licenciantes: true,           // r22 · true → Warner Bros., DC y Peaky Blinders Co. solo como nombre en texto, nunca su logo oficial
      faq_ttb: true,                      // r22 · true → respuesta TTB sin "Yes," · false → literal del cliente ("Yes, we design to…")
      cta_duracion: true                  // r22 · true → "Book a call with Andy" · false → "Book a 20-min call with Andy" (el cliente no escribió los 20 min)
    },
    MOSTRAR_WHATSAPP: false               // true solo si el cliente confirma que atienden por WhatsApp el número publicado
  },

  // Formulario #start. En localhost no envía nada (simula el envío y dispara generate_lead).
  // Para conectarlo: endpoint = URL de la herramienta que diga el cliente (sin dato: WPForms, Formspree, HubSpot, webhook…).
  formulario: {
    // 2026-10-26 (Efraín): provisorio a studio@jacomymayne.com por FormSubmit (sin cuenta; el primer envío le pide al estudio
    // confirmar por mail). Cuando el cliente elija mail o CRM, se cambia solo esta URL.
    endpoint: "https://formsubmit.co/ajax/studio@jacomymayne.com",
    extra: { _subject: "New project enquiry · jacomymayne landing", _template: "table", _captcha: "false" },
    metodo: "POST",
    formato: "json",                      // "json" | "form" (application/x-www-form-urlencoded)
    tiempo_minimo_ms: 3000                // anti-bot invisible junto con el honeypot (sin reCAPTCHA visible)
  },

  contacto: {
    email: "studio@jacomymayne.com",
    telefono: "+54 9 261 664 1653",
    telefono_href: "+5492616641653",
    whatsapp: "5492616641653",            // solo se usa con MOSTRAR_WHATSAPP = true
    oficina: "LATAM office · Mendoza, Argentina"
  },

  // r22 · objetivo = una llamada con Andy. url: link de agenda (Calendly o similar), sin dato. null → los 6 "Book a call with Andy"
  // llevan a #start (el formulario pide la llamada). Con URL → abren la agenda en otra pestaña y el formulario queda de alternativa.
  agenda: { url: null },

  // r24 (Efraín 2026-10-28: "un video de él hablando sobre la marca"): el video de Andy a cámara, con sonido, en su propia sección
  // (#video-andy, después de "Break the shelf."). mp4: ruta relativa a sitio/ (p. ej. "video/andy.mp4") · poster: la imagen de arranque
  // (null → la foto de los fundadores en B/N) · subtitulos: un .vtt en inglés (opcional). Con mp4 en null, la sección solo se ve en
  // localhost (con "Video coming soon"); publicada, no aparece.
  video_marca: { mp4: null, poster: null, subtitulos: null },

  // r22, opción APAGADA (r24: el pedido era el video de Andy, de arriba): video de fondo del hero en lugar de las fotos que cambian.
  // Con mp4 y webm en null el hero queda con las fotos que cambian. Con un archivo (ruta relativa a sitio/, p. ej. "video/hero.mp4")
  // reemplaza a las fotos detrás de la firma y la línea: muted, loop, playsinline, preload="metadata". poster: null → la 1.ª foto del hero.
  hero: {
    video: { mp4: null, webm: null, poster: null }
  },

  // Fichas de los casos de Selected Work: la tarjeta entera abre la ficha (work_open). null = todavía sin URL confirmada.
  casos: {
    "marques-de-casa-concha": "https://jacomymayne.com/marques-de-casa-concha/",
    "trivento-wine-gin": "https://jacomymayne.com/trivento-wine-gin/",
    "frankly-by-kaiken": "https://jacomymayne.com/frankly-by-kaiken/"
  },

  // Ronda 11 · cinta de marcas (#marcas). logo: null = todavía no hay archivo → se muestra el nombre como wordmark.
  // Logos: sitio/img/logos/<slug>.svg|png; después de sumar o sacar archivos, correr `node originales/logos-a-marca.mjs` (desde
  // landings/jacomy-mayne/), que pone logo: "svg" | "png" | null según lo que exista. Solo se pide lo que figura (sin 404 en la consola).
  // color (r14: k-means sobre el recorte del elemento, el cluster más saturado con peso real; ver img/logos/FUENTES.md) (r13, Efraín: "al pasar el mouse se pone el color de la marca"): el color REAL de la marca, muestreado de la etiqueta en las fotos del
  // proyecto (originales/); cada uno con su fuente acá y en img/logos/FUENTES.md. null = sin fuente → en hover, blanco. Nunca inventado.
  // url (r16, Efraín: "clic en cada marca → su página"): el sitio oficial si está verificado en img/logos/FUENTES.md (Marques, Trivento, Catador,
  // Entrometido, Paipo: paipogin.com, que redirige a paipogin.online); si no, la ficha del proyecto en jacomymayne.com (Concha y Toro → la de Marques).
  // Ojo: index.html repite url, color y logo en cada <li> (data-logo, style="--mc-color", <a href>) para no depender de este archivo: cambiar los dos.
  marcas: {   // logo: lo pone originales/logos-a-marca.mjs según lo que haya en img/logos/ (no tocar a mano)
    "ab-inbev-chile": { logo: null, color: null, url: null },   // r22: del cliente; sin ficha ni sitio verificado: sin link; color sin fuente → blanco
    "warner-bros": { logo: null, color: null, url: null },   // r22: del cliente; sin ficha ni sitio verificado: sin link; color sin fuente → blanco
    "pepsico-nyc": { logo: null, color: null, url: null },   // r22: del cliente; sin ficha ni sitio verificado: sin link; color sin fuente → blanco
    "ccu-argentina": { logo: null, color: null, url: null },   // r22: del cliente; sin ficha ni sitio verificado: sin link; color sin fuente → blanco
    "peaky-blinders-co": { logo: null, color: null, url: "https://jacomymayne.com/peaky-blinders-official-playing-cards/" },   // r22: del cliente; ficha en jacomymayne.com (post-sitemap, 2026-10-28); color sin fuente → blanco
    "montes-wines": { logo: null, color: null, url: null },   // r22: del cliente; sin ficha ni sitio verificado: sin link; color sin fuente → blanco
    "theory11": { logo: null, color: null, url: "https://jacomymayne.com/peaky-blinders-official-playing-cards/" },   // r22: del cliente; ficha en jacomymayne.com (post-sitemap, 2026-10-28); color sin fuente → blanco
    "dc": { logo: null, color: null, url: null },   // r22: del cliente; sin ficha ni sitio verificado: sin link; color sin fuente → blanco
    "world-whiskey-society": { logo: null, color: null, url: null },   // r22: del cliente; sin ficha ni sitio verificado: sin link; color sin fuente → blanco
    "ccu-chile": { logo: null, color: null, url: null },   // r22: del cliente; sin ficha ni sitio verificado: sin link; color sin fuente → blanco
    "saranskiy-distillery": { logo: null, color: null, url: null },   // r22: del cliente; sin ficha ni sitio verificado: sin link; color sin fuente → blanco
    "kaluga-distillery": { logo: null, color: null, url: null },   // r22: del cliente; sin ficha ni sitio verificado: sin link; color sin fuente → blanco
    "vina-alta": { logo: null, color: null, url: null },   // r22: del cliente; sin ficha ni sitio verificado: sin link; color sin fuente → blanco
    "nando-parrado-wines": { logo: null, color: null, url: "https://jacomymayne.com/nando-parrado-wines/" },   // r22: del cliente; ficha en jacomymayne.com (post-sitemap, 2026-10-28); color sin fuente → blanco
    "esencial": { logo: null, color: null, url: "https://jacomymayne.com/esencial-wines/" },   // r22: del cliente; ficha en jacomymayne.com (post-sitemap, 2026-10-28); color sin fuente → blanco
    "concha-y-toro": { logo: "svg", color: "#C8A284", url: "https://jacomymayne.com/marques-de-casa-concha/" },   // r14: "CONCHA Y TORO" de la etiqueta Cabernet de Marques (sitio/img/caso-marques-900.jpg)
    "marques-de-casa-concha": { logo: "png", color: "#765E2D", url: "https://marquesdecasaconcha.com/" },   // r14: el escudo MCC dorado de la etiqueta Gold (sitio/img/caso-marques-900.jpg)
    "trivento": { logo: "svg", color: "#B4984B", url: "https://trivento.com/" },   // r14: el "TRIVENTO" dorado del cuello (originales/origen/trivento-03-1930.jpg)
    "kaiken": { logo: "png", color: "#A66548", url: "https://jacomymayne.com/frankly-by-kaiken/" },   // r14: el pájaro y "KAIKEN" cobre (originales/origen/frankly-02-1930.jpg)
    "frankly": { logo: null, color: "#2D637B", url: "https://jacomymayne.com/frankly-by-kaiken/" },   // r14: la letra "Frankly" azul (originales/origen/frankly-02-1930.jpg)
    "anansi-rum": { logo: null, color: "#AA3622", url: "https://jacomymayne.com/anansi-rum/" },   // r14: "ANANSI RUM · AGED 8 YEARS" rojo (originales/11-anansi.jpg)
    "censurado": { logo: null, color: "#93453A", url: "https://jacomymayne.com/censurado-sparkling-wine/" },   // r14: el rojo del vestido del collage (el nombre es plata) (originales/origen/censurado-1-1930.jpg)
    "bonaventure-rum": { logo: "png", color: "#89495A", url: "https://jacomymayne.com/bonaventure-rum/" },   // r14: la banda bordó "BONAVENTURE RUM" de la 1.ª botella (jm-works/01-Bonvaneture.jpg)
    "paipo-gin": { logo: "png", color: "#4FBEA6", url: "https://paipogin.com/" },   // r14: el turquesa de la etiqueta (jm-works/02-paipo2.jpg)
    "catador-itinerante": { logo: "png", color: "#C95E01", url: "https://catadoritinerante.com/" },   // r14: las letras doradas "CATADOR ITINERANTE" (jm-works/04-cat.jpg)
    "william-scott": { logo: "png", color: "#B77957", url: "https://jacomymayne.com/william-scott-whisky/" },   // r14: la placa cobre "DESIGNED BY WILLIAM SCOTT" (jm-works/04willaim.jpg)
    "becker": { logo: "png", color: "#2F54BF", url: "https://jacomymayne.com/becker/" },   // r14: el azul de la lata Classic Lager (jm-works/04-beck2.jpg)
    "brass-monkey-gin": { logo: "png", color: "#C4883D", url: "https://jacomymayne.com/brass-monkey-gin/" },   // r14: la medalla de bronce dorado (jm-works/11brass2.jpg)
    "perico-verde": { logo: null, color: "#4CC738", url: "https://jacomymayne.com/perico-verde/" },   // r14: el verde de la lata (jm-works/14peric.jpg)
    "entrometido": { logo: "png", color: "#735278", url: "https://entrometidowines.com/" },   // r14: el sello violeta de la etiqueta (jm-works/08-entrom.jpg)
    "grizzly-whisky": { logo: null, color: "#CF751B", url: "https://jacomymayne.com/grizzly-whisky/" },   // r14: el naranja de la etiqueta "Grizzly" (jm-works/13GRIZZ-bien.jpg)
    "malbec-plural": { logo: null, color: "#CF9C2F", url: "https://jacomymayne.com/malbec-plural/" },   // r14: las letras doradas "MALBEC PLURAL" (jm-works/31malb.jpg)
    "casual-wines": { logo: "png", color: "#A7544D", url: "https://jacomymayne.com/casual-wines/" },   // r14: el coral de la ilustración (jm-works/25-casual.jpg)
    "richard-chancellor": { logo: null, color: "#D59B63", url: "https://jacomymayne.com/richard-chancellor-whisky/" },   // r14: las letras doradas "RICHARD CHANCELLOR" (jm-works/11-chanc.jpg)
    "mark-mayne": { logo: null, color: "#FAFAF9", url: "https://jacomymayne.com/mark-mayne-whisky/" },   // r14: el peltre del relieve "MARK S. MAYNE" (jm-works/29mark.jpg)
    "dilema-wines": { logo: null, color: "#B357CE", url: "https://jacomymayne.com/dilema-wines/" }   // r14: el violeta de "DILEMA" (lata Bonarda) (jm-works/28-dilema2.jpg)
  },

  // Ronda 12 · Roy y Andy en la foto de fondo de #start: un halo y un link por persona (lado = dónde está en la foto).
  // Sin dato: quién es quién (imagenes.md) y sus LinkedIn. Con linkedin vacío el halo funciona igual pero no es link; nombre vacío = sin
  // texto en el hover. Cuando se sepa: { lado: "izquierda", nombre: "Roy Mayne", linkedin: "https://www.linkedin.com/in/…" }
  fundadores: [
    { lado: "izquierda", nombre: "Andy Jacomy", linkedin: "https://www.linkedin.com/in/andy-jacomy-b86265147/" },   // sin gorra · Efraín 2026-10-25: "el de la izquierda es Andy"
    { lado: "derecha", nombre: "Roy Mayne", linkedin: "https://www.linkedin.com/in/roy-mayne/" }        // con gorra · Efraín 2026-10-25: "el de la derecha es Roy"
  ],

  redes: {
    instagram: "https://www.instagram.com/jacomymayne/",
    linkedin: "https://linkedin.com/company/jacomymayne/",
    behance: "https://www.behance.net/jacomymayne"
  },

  legales: {
    razon_social: null, cuit: null, domicilio: null,          // sin dato del cliente: no se muestran
    contacto: "studio@jacomymayne.com",
    politicas: { privacidad: "privacy.html" }                  // 2026-10-26: borrador de compliance, publicado con permiso del cliente
  },
  medicion: { gtm: null, ga4: null, meta_pixel: null, clarity: null }   // un solo GTM en la landing (estrategia §8); IDs en F7
};
