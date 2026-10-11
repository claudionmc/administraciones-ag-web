# Administraciones AG SpA

Base del sitio corporativo en Next.js con App Router, TypeScript estricto,
Tailwind CSS y ESLint. Desarrollo local; sin publicación ni integración de datos.

## Requisitos y ejecución

Use Node.js 24 LTS y npm. Python y `.venv` no son necesarios para esta web.
Tras instalar Node.js, reinicie la terminal de VS Code si no reconoce `npm`.
En PowerShell puede usar `npm.cmd` si la política de scripts bloquea `npm.ps1`.

```powershell
npm.cmd ci
npm.cmd run dev
```

Abra http://localhost:3000. Para comprobar el proyecto:

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run build
npm.cmd start
```

Inter se configura mediante `next/font/google`, con pesos 400, 500 y 600.
La compilación inicial necesita acceso a Google Fonts; Next.js sirve la fuente
localmente en el sitio compilado.

## Estructura y alcance

- `src/app`: layout global y rutas `/`, `/servicios` y `/contacto`.
- `src/components/ui`: botón, enlace con apariencia de botón y contenedor.
- `src/components`: encabezado y pie compartidos, con navegación adaptable.
- `SiteNavigation`: identifica la página activa con subrayado fino, Inter 500
  y `aria-current="page"`; usa azul corporativo en el encabezado y blanco en el pie.
- `src/lib/constants.ts`: información corporativa y navegación.
- `src/lib/services.ts`: catálogo tipado de doce servicios en tres áreas.
- `src/app/globals.css`: paletas completas, colores semánticos y estilos base.
- `public/images/logo`: ubicación reservada para los logotipos originales.

La portada institucional incluye hero, tres áreas de servicios, filosofía,
proceso de cuatro etapas y llamada a contacto. Las secciones se encuentran en
`src/components/home/` y reutilizan el catálogo centralizado.
Las tarjetas de la portada muestran un resumen y las aclaraciones de alcance;
el catálogo `/servicios` desarrolla tres áreas con cuatro servicios descritos
por área, navegación interna y llamadas a contacto. Sus datos y textos están
tipados en `src/lib/services.ts`; `ServiceAreaSection` compone cada área.
Las áreas y servicios se presentan sin numeraciones decorativas; el proceso
mantiene sus cuatro pasos con numeración discreta.
`/contacto` presenta las modalidades de atención y el CTA de WhatsApp en dos
columnas desde el breakpoint de escritorio y una columna en pantallas menores.
El encabezado muestra el logotipo navy y el pie su variante blanca suministrada.
`BrandLogo` delimita mediante CSS la zona del logo en la lámina original
`public/images/logo/brand-style-guide.png`, sin alterar sus píxeles ni proporciones.
Los rótulos y las otras variantes quedan fuera del área visible. Cuando se
disponga del PNG individual, podrá sustituirse la lámina en este componente.
El diseño usa Inter, fondos navy, blancos y grises, con acentos corporativos.
El hero incorpora «Geometría y reflejos», una imagen original generada con
ChatGPT y suministrada por Claudio, quien confirmó su origen el 10 de octubre
de 2026. El archivo seleccionado es `fondo_geometrico_3_2x.png`, ampliado 2×
por el usuario a partir de `fondo_geometrico_3.png`, almacenado en
`public/images/architecture/geometria-y-reflejos.png`. No representa oficinas
de la empresa. `HeroPhoto` usa `next/image`, importación estática, tamaños
adaptables, precarga y placeholder de desenfoque. El texto permanece sobre navy
y separado de la imagen; en móvil la imagen aparece debajo del texto.
El PNG actual mide 3344 × 1882 px (4,94 MB) y coincide con el archivo 2× recibido.
La foto usa calidad 90 y conserva su proporción natural, sin recortes ni
deformaciones. `sizes` refleja el ancho real de la columna derecha: hasta unos
545 px en escritorio, con resoluciones adaptadas para pantallas Retina.
El lema y su texto secundario se integran debajo de la descripción de la
columna izquierda; la columna derecha queda dedicada a la fotografía.
La versión suministrada cubre las dimensiones necesarias para densidad 2×;
su detalle procede del upscaling realizado por el usuario. Next.js genera
versiones WebP adaptadas al dispositivo; no se descarga el PNG completo para
mostrar el hero. El tamaño servido depende de la resolución seleccionada.
Las animaciones discretas respetan `prefers-reduced-motion`; la navegación y
los enlaces disponen de foco visible y enlace para saltar al contenido.
El encabezado utiliza una fila con logo y menú desplegable en teléfonos y
tablets hasta 1023 px. Desde 1024 px mantiene la navegación completa; esta
transición evita comprimir el logo, enlaces y CTA en tablets de 768 px.
El menú dispone de controles accesibles, se cierra al seleccionar una opción,
al pulsar el botón o con Escape, y ocupa espacio normal sin cubrir el contenido.
Hasta 767 px, el hero reduce espaciados y oculta la franja inferior de servicios.
La imagen conserva sus proporciones y los textos y destinos de los CTA se mantienen.
El indicador de desarrollo de Next.js se desactiva con `devIndicators: false`
en `next.config.ts`, sin reglas CSS; no forma parte de la versión de producción.

Validación responsive: las rutas `/`, `/servicios` y `/contacto` se comprobaron
en Edge mediante Playwright temporal (sin dependencias nuevas en el proyecto),
en 320 × 720, 375 × 667, 393 × 852, 430 × 932, **440 × 956**, 768 × 1024,
1024 × 900 y 1440 × 900 px. Pasaron 24 combinaciones de página y viewport,
incluyendo comprobaciones de desbordamiento, orden y proporción de imagen,
menú desplegable, cierre con Escape y foco, navegación y enlace de WhatsApp.
Se inspeccionaron capturas de 440 px y 1440 px. Esta emulación no sustituye
la prueba de Safari en un iPhone físico.

No hay formulario, envío de datos, backend ni datos de contacto inventados.
El botón de WhatsApp en `/contacto` abre el número y mensaje configurados en
`src/lib/constants.ts`: «Solicitar asesoría» es el texto visible y «Solicitar una
asesoría» es el mensaje prellenado. El usuario decide enviarlo en WhatsApp.
Las rutas `/nuestra-firma` y `/perspectivas` quedan fuera de esta fase.

Consulte `AGENTS.md` para las especificaciones corporativas y de contenido.

## Dependencias: observación de seguridad

En la instalación inicial, `npm audit` reportó cinco avisos de severidad alta
en la cadena de herramientas de desarrollo de `eslint-config-next`, derivados
de `braces` (GHSA-vfj7-8cjw-p6xm). El aviso no ofrece una versión corregida.
La sugerencia automática de npm implica retroceder `eslint-config-next` a otra
versión mayor; se conserva la configuración alineada con Next.js 16.
Revise actualizaciones compatibles antes de publicar.
