# Revisión integral final (REQ-WEB-FINAL-001)

Inventario de lo que sigue provisorio, para revisión humana. **No es una aprobación**: la revisión final solo puede cerrarse cuando el equipo entregue el copy, las imágenes y los datos reales. Todo lo de abajo se verificó en desarrollo local, no contra una base de datos ni un dominio reales.

## 1. Datos operativos de muestra

Todos viven en un solo punto de lectura, `src/data/publicCatalog.ts`. Cuando exista el modelo de datos (REQs-PI), se cambia ese módulo a las vistas públicas de Supabase y las páginas no se tocan.

| Dato | Archivo | Estado |
|---|---|---|
| Productos, temas, familias, precios, materiales y tamaños | `src/pages/catalog/catalogItems.ts` | Muestra. Extras de material (+$200 brillante, +$600 holográfico) son supuestos |
| Piezas del evento HOY y evento activo | `src/pages/today/todayItems.ts` | Muestra: "Evento de ejemplo" |
| Destacados del Home | `src/pages/home/featuredItems.ts` | Muestra |
| Promociones por pack | `src/data/samplePromos.ts` | Precios reales confirmados para grandes y chicos; los medianos usan las reglas de los grandes (supuesto) |
| Disponibilidad en palabras | `src/data/sampleAvailability.ts` | Muestra |
| Usos del sticker | `src/data/sampleUses.ts` | Muestra |
| Franjas de entrega | `src/data/publicCatalog.ts` (`deliverySlots`) | 3 franjas "de ejemplo (a definir)" |
| Descargas | `src/data/sampleDownloads.ts` | 3 recursos de ejemplo |
| Número de WhatsApp | `src/config/site.ts` | Cargado; falta confirmar que sea el del flujo de pedidos (CART-005) |

## 2. Textos provisorios

Marcados como PROVISIONAL en el código. Revisar voz de Pando (primera persona, voseo, sin plural institucional) y reemplazar por el copy aprobado:

- Home: manifiesto, destacados, cómo comprar, cierre.
- Estudio: introducción y servicios (`src/pages/about/`).
- Catálogo, ficha de producto, HOY, Cómo comprar, Descargas.
- Carrito: textos de estados, franja y mensaje de WhatsApp (`src/pages/CartPage.tsx`).
- 404 y error (`src/pages/NotFoundPage.tsx`).
- Metadatos por ruta (`src/config/pageMeta.ts`).

## 3. Imágenes provisorias

Todas son arte de marca reutilizado como placeholder. Ninguna es un asset final aprobado.

| Archivo | Peso | Dónde se usa | Acción |
|---|---|---|---|
| `images/pando-sticker-hand.png` | 555 KB | Manifiesto, órbita de Estudio | Reemplazar y optimizar |
| `images/pando-sticker-wall.png` | 528 KB | Manifiesto, órbita de Estudio, descarga de ejemplo | Reemplazar y optimizar |
| `images/featured-placeholder.png` | 466 KB | **No se usa** | Candidato a borrar (requiere tu OK) |
| `images/pando-camina.png` | 168 KB | Catálogo, HOY, Estudio, Cómo comprar, descargas | Reemplazar |
| `images/pando-camara.png` | 80 KB | Catálogo, HOY, Estudio, Cómo comprar | Reemplazar |
| `images/pando-zapatilla.png` | 78 KB | Catálogo, HOY, Estudio, Cómo comprar, descargas | Reemplazar |
| `images/featured-laptop.jpg` | 67 KB | Destacados, ficha ("En una notebook"), órbita | Reemplazar por foto real |
| `stickers/*.svg`, `brand/*.svg` | < 25 KB | Catálogo de muestra y decoración | Revisar cuáles son del manual |

- Todas las imágenes tienen alternativa vacía (decorativas) o el nombre del producto en el control cercano.
- Todas las imágenes que pueden faltar usan `SafeImage` o un fallback: no queda un ícono roto.
- Favicon: `public/favicon.svg` es el de Vite y es temporal.
- No hay imagen Open Graph.

## 4. Estados con datos, sin datos, carga y error

Probados en desarrollo con la vista previa `?estado=carga|error|vacio` (solo en desarrollo) en Home, Catálogo, Ficha y Descargas. Pendiente repetirlos contra la fuente real y probar el error forzado de la página 404/error.

## 5. Hallazgos de esta revisión

- Las rutas y los estados se comportan como se espera en escritorio y móvil.
- Hay una ruta nueva, `/descargas`, que no figura en la lista aprobada de BASE-002: necesita aprobación.
- El sitemap no incluye fichas de producto hasta que el catálogo venga de Supabase.
- Los buscadores que no ejecutan JavaScript solo ven el título base del `index.html`.
- No se midieron descargas ni clics: depende de aprobar la analítica.

## 6. Para cerrar

1. El equipo entrega copy final, imágenes definitivas y datos reales.
2. Se conecta `publicCatalog.ts` a Supabase.
3. Se repite esta revisión contra el entorno real y se actualiza este documento y `checklist-lanzamiento.md`.
4. Aprobación humana explícita.
