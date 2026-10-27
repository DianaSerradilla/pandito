# Checklist de lanzamiento (REQ-WEB-QUALITY-008)

Borrador de trabajo. **La web no está lista para lanzar**: este documento no declara lanzamiento ni reemplaza la aprobación del equipo. Cada check dice estado, evidencia, responsable y pendiente. Responsable: "Equipo" = decisión o material del equipo; "Dev" = trabajo técnico.

Estados: ✅ hecho y verificado · 🟡 hecho en parte · ⛔ bloqueado por un insumo · ⬜ sin empezar.

| # | Check | Estado | Evidencia | Responsable | Pendiente |
|---|---|---|---|---|---|
| 1 | Rutas públicas y navegación (BASE-002, NAV-001) | ✅ | Todas las rutas abren en escritorio y móvil; 404 y error propios | Dev | — |
| 2 | Responsive en móvil | ✅ | Auditoría de overflow y targets de 44 px en todas las rutas | Dev | Prueba en dispositivo real |
| 3 | Catálogo, ficha, variantes y estados (CATALOG-004, PRODUCT-006) | 🟡 | Estados de carga, error y vacío probados con vista previa de desarrollo (`?estado=`) | Dev | Conectar a Supabase (CATALOG-001) |
| 4 | Promociones por pack | 🟡 | Pack de 3 grandes: $5.100 → $4.100, descuento correcto en ficha, carrito y mensaje | Dev / Equipo | Confirmar reglas de medianos y extras de material |
| 5 | Carrito, nombre y franja (CART-004) | 🟡 | Nombre obligatorio; franja opcional; sin franjas muestra alternativa por WhatsApp | Dev | Franjas reales desde el panel |
| 6 | Mensaje de WhatsApp (CART-005) | 🟡 | Mensaje con productos, variantes, promo, total, nombre, franja y aclaración de confirmación | Equipo | Número de WhatsApp Business y texto inicial aprobado |
| 7 | Flujo end-to-end (QUALITY-007) | 🟡 | Flujo completo probado en escritorio y móvil; no hay stock ni venta automática | Dev | Número de pruebas y dispositivo real |
| 8 | Registro de solicitud (CART-006) | ⛔ | Hoy el pedido solo vive en el navegador | Equipo | Decisión sobre registro previo a WhatsApp |
| 9 | HOY y QR (HOY-001, HOY-003) | 🟡 | `/hoy` se activa por estado del evento; enlace estable documentado en el README | Dev / Equipo | Modelo de evento del panel, dominio y herramienta de QR |
| 10 | Metadatos y social preview (QUALITY-002) | 🟡 | Título y descripción únicos por ruta; `noindex` en pedido y 404 | Equipo | Copy SEO, imagen Open Graph y favicon final |
| 11 | Sitemap y robots (QUALITY-003) | 🟡 | `npm run build` genera `robots.txt`; el sitemap con `VITE_SITE_URL` | Dev | Dominio final; fichas de producto; prueba contra el dominio real |
| 12 | Accesibilidad (QUALITY-004) | 🟡 | Revisión de DOM por ruta: sin ids duplicados, un h1, labels, avisos de pestaña nueva; `prefers-reduced-motion` global | Dev / Equipo | Revisión humana de contraste y prueba con lector de pantalla |
| 13 | Rendimiento (QUALITY-005) | 🟡 | JS inicial de 452 a 281 kB; rutas con carga diferida; imágenes fuera de pantalla en lazy | Dev / Equipo | Assets finales optimizados (hoy hay PNG de ~500 KB provisorios) |
| 14 | Legal, analítica y cookies (QUALITY-006) | ⛔ | No hay trackers ni textos legales genéricos | Equipo | Textos legales, IDs de analítica y decisión de cookies |
| 15 | Contenido y assets finales (FINAL-001) | ⛔ | Todo el copy, las fotos, los productos y las franjas son provisorios | Equipo | Copy aprobado, inventario de imágenes y datos reales |
| 16 | Fuente de datos única (BASE-005) | 🟡 | Las páginas leen solo de `src/data/publicCatalog.ts` | Dev | Cambiar ese módulo a las vistas públicas de Supabase |
| 17 | Descargas gratuitas (DOWNLOAD-001/002) | 🟡 | `/descargas` con filtros, vista previa, formato, resolución y descarga directa sin cuenta; 3 recursos de ejemplo. DOWNLOAD-002: enlace `?recurso=` por recurso, sin medición | Dev / Equipo | Aprobar la ruta (no está en BASE-002), archivos finales, condición de uso y enlace de campaña |
| 18 | Dominio, HTTPS y despliegue | ⛔ | — | Equipo / Dev | Dominio, hosting y variables de entorno |
| 19 | Aprobación humana de lanzamiento | ⛔ | — | Equipo | Aprobación explícita del equipo |

## Reglas de este documento

- No se marca "lanzado" ni se genera un PDF final sin aprobación explícita del equipo.
- La evidencia de cada check sale de pruebas hechas en desarrollo local; ninguna se hizo contra un dominio real.
- Actualizar la tabla cuando cambie un estado; no borrar filas.
