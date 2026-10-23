# Invitación de boda interactiva

Web estática y reutilizable para invitaciones de boda. Tiene sobre animado, cuenta atrás, historia, eventos con calendario y mapa, itinerario animado, regalos, galería, juego y confirmación por WhatsApp.

Cada pareja tiene **una carpeta con un archivo de configuración y sus imágenes**. El código es el mismo para todas.

- Sin dependencias: solo hace falta Node 18 o superior.
- Las fuentes están dentro del proyecto (no se carga nada de Google Fonts).
- Genera las etiquetas para buscadores y para compartir en redes (Open Graph y Twitter), además de favicon, `robots.txt`, `sitemap.xml` y las cabeceras de Netlify.

## Estructura

```
invitations/
  chantal-juan/
    config.mjs          ← todos los textos, fechas, lugares, teléfonos y colores
    img/                ← acuarelas/fotos (WebP) + og.jpg para compartir
    apple-touch-icon.png  (opcional)
src/
  template.mjs          ← genera el HTML a partir de la configuración
  styles.css            ← estilos (los colores son variables CSS)
  app.js                ← interacción (sobre, itinerario, carruseles, RSVP…)
  icons.mjs             ← iconos disponibles para eventos e itinerario
assets/fonts/           ← tipografías WOFF2
build.mjs               ← genera dist/
```

## Uso

```bash
npm run build                 # genera dist/ con la invitación por defecto
npm run preview               # genera y sirve en http://localhost:8080
node build.mjs otra-boda      # genera invitations/otra-boda
```

El build avisa de lo que falta. Por ejemplo, de los textos que siguen entre corchetes, de las imágenes que no existen o de los teléfonos con formato incorrecto.

## Nueva invitación

1. Copia `invitations/chantal-juan` a `invitations/nombre-nombre`.
2. Sustituye las imágenes de `img/`. Lo recomendable es WebP de unos 1000 px de ancho, y `og.jpg` de 1200×630 para la vista previa en WhatsApp.
3. Edita `config.mjs`. Cada sección está comentada y **cualquier sección se puede quitar** borrándola o poniéndola a `null` (galería, juego, regalos, itinerario…).
4. Prueba en local con `node build.mjs nombre-nombre && node scripts/serve.mjs`.
5. Publícala en Netlify: **Add new site → Import from Git →** este mismo repositorio. En *Site configuration → Environment variables*, pon `INVITATION = nombre-nombre`. Cada sitio de Netlify publica una invitación distinta desde el mismo repositorio.

### Cosas útiles de la configuración

| Clave | Para qué sirve |
| --- | --- |
| `date`, `timeZone` | Fecha de la ceremonia con su diferencia horaria. Hace funcionar la cuenta atrás y salen de ella todas las fechas que se muestran. |
| `clock` | `12` → «6:30 PM», `24` → «18:30». |
| `events.list[].start/end` | Generan el enlace «Agregar al calendario». |
| `rsvp.whatsapp` | Número que recibe las confirmaciones (formato internacional, sin `+`). |
| `pendingEditor.whatsapp` | Los textos `[entre corchetes]` muestran un lápiz para que los novios manden el texto definitivo por WhatsApp. Déjalo vacío para desactivarlo. |
| `theme` | Cambia colores: `{ sage: '#7A4E5A', paper: '#FAF6F0' }` (cualquier variable de `:root` en `styles.css`). |
| `ui` | Cambia cualquier texto fijo de la interfaz (botones, avisos…). Ver `UI_DEFAULTS` en `src/template.mjs`. |
| `seo.indexable` | `false` por defecto: Google no indexa la invitación porque contiene direcciones y teléfonos. Con `true` se añaden un sitemap y datos estructurados del evento. |
| `seo.url` | URL pública. En Netlify se rellena sola. |

## Publicación

`netlify.toml` ejecuta `node build.mjs` y publica `dist/`. Cada `push` a `main` vuelve a publicar la web.
