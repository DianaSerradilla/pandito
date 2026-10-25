# Pandito (web pública)

Base técnica del proyecto: React + TypeScript (Vite), Tailwind CSS v4, servidor Node.js y Supabase como servicio previsto.

Estado: **REQ-WEB-BASE-001, pendiente de aprobación del equipo.** Todavía no hay pantallas, rutas ni sistema de diseño.

## Requisitos

- Node.js 22.9 o superior (probado con 24)
- npm

## Primer arranque

```bash
npm install
```

Creá un archivo `.env` en la raíz con estas variables (nunca lo subas a git):

```
# Públicas (llegan al navegador). Solo la clave anon; el acceso lo limitan las políticas RLS.
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Solo servidor (nunca con prefijo VITE_)
SUPABASE_SERVICE_ROLE_KEY=
PORT=3001
```

La web arranca aunque falten las variables de Supabase; el cliente simplemente queda deshabilitado.

## Comandos

En dos terminales:

```bash
npm run dev      # web en http://localhost:5173
npm run server   # API en http://localhost:3001 (la web la consume por /api)
```

Otros:

```bash
npm run build    # tipos + build de producción
npm run lint
```

Comprobación rápida del servidor: `http://localhost:3001/api/health` devuelve `{"ok":true}`.

## Estructura

```
src/components/ui/       componentes base (Button, Heading, Script, Tag, Container, StatusMessage)
src/components/layout/   header, footer y layout compartido
src/pages/               una página por ruta (placeholders hasta cada REQ)
src/data/                datos públicos del sitio (publicCatalog.ts es la única puerta; hoy lee de ejemplos, luego Supabase)
src/pages/today/         HOY: tarjetas, filtros y datos de ejemplo (todayItems.ts)
src/pages/shop/          Listado de tienda compartido por HOY y Catálogo (buscar, ordenar, filtrar, pedido)
src/pages/catalog/       Catálogo: datos de ejemplo y filtro de temas (búsqueda + familias)
src/pages/about/         Estudio: héroe con stickers girando, texto y los tres bloques de servicios
src/lib/                 clientes y utilidades (supabase.ts)
server/                  lógica de servidor Node (validaciones, exportaciones, operaciones privilegiadas)
src/components/pando/    Pando como SVG inline (formas generadas, ver abajo)
public/brand/            logotipo, isotipo y Pando (SVG del Figma)
scripts/                 utilidades (generate-pando-shapes.mjs)
```

## Movimiento

El movimiento del hero responde solo al cursor y solo en dispositivos con mouse. Con `prefers-reduced-motion: reduce`, o en pantallas táctiles, todo queda estático y legible. La preferencia se sigue en vivo (`src/hooks/useCursorMotion.ts`).

- Los ojos de Pando siguen al cursor; el resto de Pando no se mueve.
- Cada letra del titular se levanta apenas cuando el cursor pasa cerca.
- Única excepción a "nada se mueve solo": el texto de la cinta entre el hero y el Manifiesto corre despacio por la curva. Se detiene con movimiento reducido (queda estática), y se pausa cuando está fuera de pantalla.
- Destacados: la sección queda fija en pantalla y, al scrollear, los stickers se van pegando de a uno en la "pared": llegan más grandes y con sombra larga, pegan, se aplastan apenas y quedan planos (movimiento guiado por el scroll, no se repite solo). Con movimiento reducido se muestran todos pegados, sin fijar la sección. Los stickers de hoy son de ejemplo: se reemplazan en `featuredItems.ts` (PNG o SVG con fondo transparente; si no traen borde blanco propio, `cut: true`).
- El sello de Destacados ("Así scrolleo yo") gira con el scroll de la página. Con movimiento reducido queda quieto.
- Cierre: al mover el mouse por la sección salen stickers (uno cada ~110 px de recorrido, se inclinan, aparecen, se quedan un momento y se desvanecen). Solo con mouse. Con movimiento reducido o en táctil se muestran tres stickers fijos. Los stickers de hoy son piezas de la marca de ejemplo: se reemplazan en `StickerTrail.tsx`.
- Preloader (`src/components/preloader/Preloader.tsx`): al cargar la web la pantalla arranca toda naranja y un trazo grueso de marcador, con bordes irregulares, va y viene por toda la pantalla y la va borrando hasta mostrar la página (unos 3 s). Imita la apertura de extrafazant.nl con tiempos propios. Mientras corre, la página no recibe foco ni scroll; tiene un tope de seguridad para que nunca quede tapando. Con movimiento reducido no se muestra. Corre en cada carga completa (si el equipo la quiere una vez por sesión, es un cambio chico). La capa naranja también está en `index.html` (`#preloader-seed`) para evitar un destello antes de que arranque React.
- Grano fino (`grain` en `src/index.css`): cubre la barra de navegación y el hero como una sola superficie, de borde a borde, y termina bajo la cinta. Es estático. La intensidad se ajusta con la opacidad en `HeroSection.tsx`.
- Fuera de esa cinta, no hay animaciones que se repitan solas ni que vuelvan a correr al navegar o hacer scroll.

## Pando

`public/brand/pando.svg` es el archivo maestro bajado del Figma. El componente `Pando` usa sus 20 formas inline para poder animar la pupila y los trazos del gorro. Si el equipo entrega un SVG por capas, reemplazá el archivo, ajustá `ROLES` en el script y regenerá:

```bash
node scripts/generate-pando-shapes.mjs
```

Hoy el contorno negro es una sola forma (gorro, brazo, dedos y piernas), así que esas partes no se pueden mover solas.

## Tokens y componentes base (BASE-004)

Los tokens viven en `src/index.css` (`@theme`) y Tailwind los expone como clases (`bg-naranja`, `font-display`, `text-title`, `rounded-ui`, `shadow-sticker`...). No se usan valores visuales sueltos.

- Del manual de marca: paleta Pista, familias tipográficas (Anton, Rock Salt, DM Sans) y sus roles.
- Decisiones del equipo (no están en el manual): radio `rounded-ui`, sombras sticker, curva `ease-spring`.
- Propuesta pendiente de aprobación: escala tipográfica web (`text-display`, `text-title`, `text-subtitle`, `text-script`, `text-label`). El manual solo define tamaños para piezas de 1080 px.

`Heading` y `Script` avisan por consola, solo en desarrollo, cuando el texto supera las 6 palabras que permite el manual.

Para ver todo junto: con `npm run dev`, abrí `/_tokens`. Esa ruta existe solo en desarrollo, no en el build de producción.

## Reglas del proyecto

- Tailwind implementa los tokens del sistema de diseño (BASE-004); no hay valores visuales sueltos.
- Supabase es la fuente de datos y la autenticación. Excel es solo exportación y respaldo.
- Ninguna clave real va al repositorio ni al cliente. La service role key solo existe en el servidor.
- `public/favicon.svg` es el de Vite y es temporal.

## Enlace del QR de HOY (HOY-003)

- El enlace estable es `<dominio>/hoy`. No lleva parámetros, así que el QR no cambia entre eventos: lo que cambia es el estado del evento (activo, inactivo, vencido o vacío).
- Si no hay evento activo, `/hoy` muestra un mensaje claro sin datos del evento.
- Pendiente del equipo: dominio final y herramienta para generar el QR. Generarlo con el dominio definitivo y probarlo desde un celular.

## Sitemap y robots (QUALITY-003)

- `npm run build` genera `dist/robots.txt` y, si está definida `VITE_SITE_URL` (dominio final, sin barra al final), `dist/sitemap.xml`. Sin dominio no se inventa ninguna dirección: no hay sitemap ni línea `Sitemap`.
- No se listan el pedido (`/mi-pedido`, noindex), `/api` ni `/_tokens` (solo existe en desarrollo).
- Pendiente: las fichas de producto entran al sitemap cuando el catálogo se lea de Supabase, y hay que probarlo contra el dominio real.
