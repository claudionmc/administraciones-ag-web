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
Los principios de filosofía tampoco tienen numeración. Los enlaces de las
tarjetas dicen «Ver servicios», mantienen texto y flecha unidos e identifican
el área mediante su nombre accesible. La portada usa notas de alcance breves;
el catálogo conserva las delimitaciones completas, centralizadas en services.ts.
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

`/acceso-clientes` está disponible en el menú y en el pie. Incluye usuario y
contraseña, pero todos los intentos con ambos campos completos muestran
«Error: usuario no registrado». Es una interfaz local sin autenticación real:
no envía ni guarda credenciales, limpia los campos al intentar ingresar y no
crea sesiones ni permite acceder a contenido privado. Sin JavaScript, los
campos y el botón permanecen deshabilitados. La página avisa que el acceso
aún no está habilitado y se excluye de la indexación de buscadores.

No hay envío de datos del formulario, backend ni datos de contacto inventados.
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
# Indicadores económicos

Los CTA «Solicitar asesoría» se conservan en el encabezado (escritorio y menú
móvil) y en el recuadro WhatsApp de Contacto. Inicio mantiene «Explorar nuestros
servicios» en el hero y un enlace discreto «Contacto» en su sección final;
las categorías de Servicios no repiten el CTA. Navegación y enlaces comprobados
en las tres páginas a 393, 440 y 1280 px, sin desbordamientos horizontales.

IPSA está oculto temporalmente en la franja, incluso durante la carga, hasta
disponer de la API autorizada de la Bolsa de Santiago. Su configuración sigue
preparada. Se muestran cinco indicadores: cinco columnas en escritorio amplio,
tres en tablet y dos en teléfonos.

Fechas públicas: «Valor del 10 oct 2026» para UF y «Último dato: 9 oct
2026» para las demás observaciones (ejemplos de formato, no cotizaciones
fijas). IPSA y Brent sin credencial muestran «Próximamente»; un proveedor
configurado que no entrega un dato válido muestra «Dato temporalmente no
disponible», sin detalles internos de integración.

## Brent: fuente elegida y activación

Se utiliza directamente la API v2 de EIA: `petroleum/pri/spt/data/`, serie
`RBRTE` (Europe Brent Spot Price FOB), frecuencia diaria, dólares por barril.
Se solicitan observaciones descendentes sin transformaciones, se descartan
valores no numéricos y se conserva el último día de observación válido, nunca
la fecha de consulta. No son futuros Brent. El parser valida serie y unidad.

FRED `DCOILBRENTEU` identifica el mismo tipo de precio spot de origen EIA y
requiere una API key, pero no se integra: los
[términos actuales de FRED](https://fred.stlouisfed.org/legal/), apartado
«Prohibitions for FRED API», inciso (l), prohíben almacenar o cachear contenido
obtenido por esa API. Esto entra en conflicto con la caché de 60 minutos
solicitada. No se usa un endpoint CSV no documentado para eludir esa condición.
No hace falta `FRED_API_KEY` con la fuente finalmente elegida.

Para activar Brent, obtener una clave en
[registro oficial EIA](https://www.eia.gov/opendata/register.php), añadir
`EIA_API_KEY=su_clave` a `.env.local` y reiniciar Next.js. La clave está configurada y la respuesta autenticada se verificó el 10 oct 2026:
RBRTE, unidad `$/BBL`, observación del 6 oct 2026. Brent admite un reintento
ante fallos de conexión, con seis segundos de límite por intento.
[Las condiciones de reutilización EIA](https://www.eia.gov/about/copyrights_reuse.php)
permiten usar y distribuir los datos con atribución; la sección enlaza EIA y
conserva la fecha del dato. No se utiliza su logotipo ni se implica respaldo
institucional.

La validación del 10 oct 2026 confirmó que el cobre `F019.PPB.PRE.100.D`
está definido por BDE como precio del cobre refinado BML en dólares/libra,
sin aplicar conversiones (solo redondeo visual a dos decimales). TPM se
contrastó con el [comunicado de la RPM de septiembre de 2026](https://www.bcentral.cl/contenido/-/detalle/prensa/comunicados-rpm/comunicado-rpm-septiembre-2026): 4,5 %, con la siguiente reunión prevista para el 26 y 27 de octubre.

La portada incluye seis indicadores inmediatamente después del hero. La fecha
actual se calcula por solicitud en `America/Santiago`; las respuestas de los
proveedores se revalidan cada 3.600 segundos. La UF exige una observación de ese
día. Los demás indicadores toman la última observación numérica publicada hasta
ese día, omitiendo `ND` y fechas futuras. Nunca se usa la fecha de consulta como
fecha del dato. Las consultas tienen un límite de seis segundos; un error afecta
solo al indicador correspondiente y muestra «No disponible».

Copiar `.env.example` a `.env.local` y configurar las claves únicamente en el
servidor. `.env.local` está excluido de Git. Next.js expande los signos `$`:
escapar cada signo del token BDE como `\$`. Reiniciar el servidor después de
cambiar variables. No usar variables `NEXT_PUBLIC_` para estas credenciales.

| Indicador | Fuente / serie | Configuración |
| --- | --- | --- |
| UF | BDE `F073.UFF.PRE.Z.D` | `BCCH_API_TOKEN` |
| TPM | BDE `F022.TPM.TIN.D001.NO.Z.D` | `BCCH_API_TOKEN` |
| Dólar observado | BDE `F073.TCO.PRE.Z.D` | `BCCH_API_TOKEN` |
| Cobre refinado BML | BDE `F019.PPB.PRE.100.D`, USD/libra, diaria | `BCCH_API_TOKEN` |
| IPSA | Pendiente de fuente autorizada de último cierre | Endpoint documentado, contrato de respuesta y permiso de publicación pública pendientes |
| Brent spot Europa FOB | EIA v2 `petroleum/pri/spt`, serie `RBRTE`, diaria, USD/barril | `EIA_API_KEY` |

Las cuatro series BDE se comprobaron con respuestas reales de `GetSeries`.
Pruebas en Edge a 320, 375, 393, 440, 768 y 1280 px: seis indicadores,
cinco observaciones reales con fecha, IPSA pendiente y sin desbordamiento
horizontal. Se comprobó que el HTML no contiene el token ni URLs de consulta
autenticadas. Pruebas de lógica: seis aprobadas. Lint, TypeScript y build
aprobados. Estas pruebas de viewport no equivalen a pruebas en iPhone físico.
El catálogo oficial `SearchSeries` (frecuencia `DAILY`) confirma para el cobre
la descripción «BML Refined Copper Price (dollars/pound) | Daily»; no se utiliza
una serie mensual ni una cotización por tonelada. El valor se presenta con dos
decimales y conserva su fecha original.

Documentación y condiciones:

- [API BDE](https://si3.bcentral.cl/estadisticas/Principal1/Web_Services/documentacion.html), [activar acceso](https://si3.bcentral.cl/estadisticas/Principal1/Web_Services/acceso_api.html), [términos](https://si3.bcentral.cl/estadisticas/Principal1/Web_Services/terminos_condiciones.html): permiten publicar con atribución al Banco; máximo cinco consultas simultáneas por segundo por cuenta. Esta sección solicita cuatro series BDE. El cobre BML es información de terceros publicada en BDE; los términos requieren verificar con la fuente original antes de emplearla en actos o contratos. La franja es informativa y atribuye al Banco Central.
- [API EIA](https://www.eia.gov/opendata/documentation.php), [obtener clave](https://www.eia.gov/opendata/register.php), [reutilización](https://www.eia.gov/about/copyrights_reuse.php): permite reutilizar datos con atribución. El adaptador se validó con una clave real configurada en `EIA_API_KEY`. No se usa una clave de demostración.
- [Bolsa de Santiago / datos](https://www.bolsadesantiago.com/productos): no se verificó un endpoint público documentado de cierre IPSA con autorización de redistribución. Antes de habilitarlo, obtener documentación y permiso público del proveedor, validar que es cierre y no precio intradía y conservar su fecha. No hay scraping ni endpoints privados ni un proveedor alternativo silencioso.

`src/lib/economic-indicators.server.ts` contiene las consultas y está protegido
con `server-only`. Los componentes reciben solo nombre, unidad, serie pública y
observación; nunca claves ni URLs de consulta con credenciales. No se registran
errores del proveedor porque podrían contener dichas URLs.
Las consultas autenticadas usan HTTPS nativo, evitando que el `fetch`
instrumentado de Next.js registre URLs en trazas o errores internos de caché.
`unstable_cache` conserva solo observaciones procesadas y argumentos públicos
(serie y fecha), con revalidación de una hora. El registro de Next.js está
desactivado en `next.config.ts`. Si posteriormente se incorpora monitorización
APM o un proxy de salida, deberá excluir o redactar los parámetros `token` y
`api_key` antes de almacenar URLs; esa infraestructura externa no está
configurada en este proyecto.

Pruebas de selección, validación y formato:

```powershell
node --experimental-strip-types --test tests/economic-indicators.test.mjs
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run build
```

