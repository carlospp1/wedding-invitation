// Configuración de la invitación de Chantal y Juan.
// Para una boda nueva: copia esta carpeta entera, cambia las imágenes de img/ y edita este archivo.
//
// Los textos entre corchetes, como "[fecha límite]", se tratan como PENDIENTES:
// si `pendingEditor.whatsapp` tiene un número, salen con un lápiz y los novios
// pueden mandar el texto definitivo por WhatsApp. Cuando ya no queda ninguno, no se ve ningún lápiz.
// Los textos admiten *cursiva* y saltos de línea con \n.

export default {
  lang: 'es',
  locale: 'es-ES',
  timeZone: 'America/Caracas', // zona horaria del lugar de la boda
  clock: 12, // 12 → "6:30 PM" · 24 → "18:30"

  couple: {
    first: 'Chantal',
    second: 'Juan',
    initials: 'C&J', // sello del sobre y favicon
    // Nombres completos (opcional): se muestran en la introducción, en el mismo orden que first/second.
    fullNames: ['Chanthal Oriana Coello Muñoz', 'Juan Manuel Pestana Pérez'],
  },

  // Fecha y hora de la ceremonia (la cuenta atrás va hasta aquí). Incluye la diferencia horaria.
  date: '2026-12-19T18:30:00-04:00',
  city: 'San Juan de los Morros',
  region: 'Guárico, Venezuela',

  // SEO y vista previa al compartir el enlace (WhatsApp, Instagram, Telegram…)
  seo: {
    title: 'Boda de Chantal y Juan · 19 de diciembre de 2026',
    description: 'Chantal y Juan se casan el sábado 19 de diciembre de 2026 en San Juan de los Morros. Consulta los detalles y confirma tu asistencia.',
    image: 'img/og.jpg', // 1200×630, JPG o PNG (WhatsApp no siempre muestra WebP)
    imageAlt: 'Acuarela de Chantal y Juan abrazados en una playa de hielo',
    // URL pública final. En Netlify se rellena sola si la dejas vacía.
    url: '',
    // false: Google no la indexa (lo normal en una invitación privada: hay direcciones y teléfonos).
    // true: se indexa y se añaden sitemap y datos estructurados del evento.
    indexable: false,
  },

  theme: {
    // Cualquier variable CSS de src/styles.css (:root) se puede sobrescribir aquí.
    // paper: '#F5F0E6', sage: '#4E6147', 'sage-deep': '#33422F',
  },

  // Números en formato internacional, sin "+" ni espacios.
  rsvp: {
    whatsapp: '3547849293',
    deadline: '[fecha límite]',
    title: 'Confirma tu asistencia',
    text: 'Rellena tus datos y envíanos la confirmación por WhatsApp. Así podremos preparar todo para recibirte.',
    image: 'img/pedida.webp',
    menus: ['Carne', 'Pescado', 'Vegetariano'], // [] para no preguntar el menú
    askSong: true,
  },
  pendingEditor: {
    whatsapp: '34692905072', // '' para desactivar los lápices
  },

  nav: true, // secciones del menú: se generan solas a partir de las secciones con `nav`

  hero: {
    label: 'Nuestra boda',
    image: 'img/portada.webp',
    imageAlt: 'Acuarela de Chantal y Juan abrazados en una playa de hielo',
    lead: 'Sábado 19 de diciembre en San Juan de los Morros. Nos encantaría que estuvieras con nosotros.',
    ribbon: null, // null → nombres, fecha, ciudad y región. O una lista de textos.
  },

  intro: {
    blessing: 'Con la bendición de Dios y el amor de nuestros padres',
    text: 'Tenemos el honor de invitarte a *celebrar nuestra unión* en matrimonio.',
    parents: [
      { label: 'Padres de la novia', names: ['Germán Coello', 'Tauca Muñoz'] },
      { label: 'Padres del novio', names: ['Juan Pestana', 'Yelitza Pérez'] },
    ],
  },

  story: {
    nav: 'Historia',
    label: 'Cómo llegamos hasta aquí',
    title: 'Nuestra historia',
    text: '[Cuenta en dos frases cómo os conocisteis y cómo llegasteis hasta aquí.]',
    photos: [
      { image: null, caption: 'Cómo nos conocimos' }, // null → hueco «Acuarela pendiente»
      { image: 'img/viaje.webp', alt: 'Acuarela de Chantal y Juan frente a la pirámide de Chichén Itzá', caption: 'Nuestro primer gran viaje' },
      { image: 'img/pedida.webp', alt: 'Acuarela de la pedida de mano entre bloques de hielo', caption: '¡Dijo que sí!', position: 'center 45%' },
    ],
  },

  events: {
    nav: 'Eventos',
    label: null, // null → la fecha larga
    title: 'Eventos',
    list: [
      {
        label: 'Ceremonia religiosa',
        short: 'Misa',
        icon: 'church',
        name: 'Catedral San Juan Bautista',
        address: 'San Juan de los Morros, Guárico',
        maps: 'Catedral San Juan Bautista San Juan de los Morros',
        start: '2026-12-19T18:30:00-04:00',
        end: '2026-12-19T19:30:00-04:00',
        image: 'img/catedral.webp',
      },
      {
        label: 'Recepción',
        short: 'Recepción',
        icon: 'glasses',
        name: 'Centro Ítalo Venezolano',
        address: 'Calle San Miguel, Urbanización Los Laureles, San Juan de los Morros, Guárico',
        maps: 'Centro Italo Venezolano San Juan de los Morros',
        start: '2026-12-19T20:00:00-04:00',
        end: '2026-12-20T04:00:00-04:00',
        image: 'img/centro.webp',
      },
    ],
    dressCode: {
      label: 'Código de vestimenta',
      title: 'Formal',
      text: 'Ellas: vestido largo o de cóctel.\nEllos: traje formal.\nSe reservan el blanco, el marfil y tonos afines para la novia.',
    },
  },

  itinerary: {
    nav: 'Itinerario',
    label: 'Sábado 19 · Domingo 20',
    title: 'Itinerario',
    end: '¡Y a celebrar hasta el amanecer!',
    items: [
      { time: '6:30 PM', title: 'Misa', icon: 'church' },
      { time: '8:15 PM', title: 'Cóctel de bienvenida', icon: 'glasses' },
      { time: '8:30 PM', title: 'Música', icon: 'music' },
      { time: '8:30 PM', title: 'Vals de esposos', icon: 'heart' },
      { time: '12:10 AM', title: 'Lanzamiento de ramo', icon: 'bouquet' },
      { time: '2:00 AM', title: 'Hora loca', icon: 'disco' },
      { time: '3:00 AM', title: 'Estación de comida', icon: 'food' },
    ],
  },

  gifts: {
    nav: 'Regalos',
    title: 'Mesa de regalos',
    text: 'Tu presencia es nuestro mejor regalo, pero si deseas obsequiarnos algo, puedes hacerlo de la siguiente forma:',
    options: [
      { name: 'Binance', label: 'Binance Pay ID', copy: '[tu ID de Binance]' },
      { name: 'Efectivo', text: 'Podrás entregarlo el día de la boda, en la recepción.' },
    ],
    album: {
      title: 'Álbum de fotos',
      text: '¡Comparte tus fotos del evento con nosotros! Súbelas al álbum compartido durante y después de la boda.',
      button: 'Ver álbum de fotos',
      url: 'https://photos.google.com',
    },
  },

  gallery: {
    nav: 'Galería',
    label: 'Pintados en acuarela',
    title: 'Galería',
    photos: [
      { image: 'img/portada.webp', alt: 'Acuarela de Chantal y Juan en la playa de hielo', caption: 'Playa de hielo', position: 'center 45%' },
      { image: 'img/viaje.webp', alt: 'Acuarela de Chantal y Juan en Chichén Itzá', caption: 'Chichén Itzá' },
      { image: 'img/pedida.webp', alt: 'Acuarela de la pedida de mano', caption: 'La pedida', position: 'center 40%' },
    ],
  },

  quiz: {
    label: 'Un pequeño juego',
    title: '¿Cuánto nos conoces?',
    questions: [
      { q: '¿Dónde nos conocimos?', options: ['[En la universidad]', '[En una fiesta]', '[Por amigos]'], answer: 0 },
      { q: '¿Quién dio el primer paso?', options: ['Chantal', 'Juan', 'Los dos'], answer: 1 },
      { q: '¿Dónde fue la pedida?', options: ['En Islandia', 'En Chichén Itzá', 'En casa'], answer: 0 },
    ],
    verdicts: { all: '¡Nos conoces de maravilla!', some: '¡Casi! Te lo contamos en la boda', none: '¡Tenemos mucho que contarte!' },
  },

  footer: {
    label: 'Te esperamos',
    image: 'img/portada.webp',
  },
};
