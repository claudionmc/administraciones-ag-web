# Administraciones AG SpA

Base del sitio corporativo en Next.js con App Router, TypeScript estricto,
Tailwind CSS y ESLint. Incluye integración local de Supabase, deshabilitada por defecto.

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

`/acceso-clientes` está disponible en el menú y en el pie. Por defecto permanece
en modo demostración: email y contraseña no se envían y el intento muestra
«Error: usuario no registrado». Sin JavaScript, los campos permanecen deshabilitados.
La integración real y sus pasos de habilitación se documentan más abajo.

En modo demostración no hay envío de datos del formulario ni datos de contacto inventados.
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


## Acceso de clientes: Supabase y PostgreSQL

La integración usa los paquetes oficiales `@supabase/supabase-js` y
`@supabase/ssr`. Supabase Auth administra email y hash de contraseña; no hay
contraseñas en tablas públicas ni SQL construido con texto de los visitantes.
`public.clientes` contiene únicamente `id` (UUID de Auth), `activo` y `created_at`.
El email permanece en Auth para no duplicarlo. No hay registro público en la web.

1. En Supabase, Authentication / configuración de Sign In, desactivar
   **Allow new users to sign up** y mantener el acceso anónimo desactivado.
   Ocultar un formulario de registro no deshabilita el endpoint de registro.
2. En SQL Editor, ejecutar una sola vez
   `supabase/migrations/202610210001_clientes.sql`.
3. Ejecutar `supabase/tests/clientes-rls.sql` en SQL Editor como `postgres`.
   Comprueba aislamiento entre dos cuentas ficticias, cuenta inactiva, denegación
   de escritura y acceso anónimo. Todo termina con ROLLBACK; si falla, ejecutar
   ROLLBACK antes de continuar. No usar usuarios reales para estas pruebas.
4. Crear una cuenta ficticia en Authentication / Users / Add user / Create user.
   Para este ensayo usar email confirmado y contraseña temporal fuerte, guardada
   fuera de Git. No se implementa todavía el canje de invitaciones por email
   ni recuperación de contraseña; no enviar invitaciones hasta desarrollar ese flujo.
5. Copiar el UUID de esa cuenta y habilitarla en SQL Editor:

   ```sql
   insert into public.clientes (id, activo)
   values ('UUID_DE_LA_CUENTA_FICTICIA', true);
   ```

6. Configurar `.env.local` con `NEXT_PUBLIC_SUPABASE_URL` y
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. No se requiere `service_role` ni
   contraseña de PostgreSQL. Reiniciar Next.js al cambiar variables.
7. Solo para pruebas ficticias, añadir `CLIENT_ACCESS_ENABLED=true` y reiniciar.
   Por defecto, si falta esa bandera o la configuración, no se autentica a nadie.
8. Comprobar entrada válida, contraseña errónea, cuenta no habilitada, salida,
   acceso directo a `/clientes` sin sesión y dos navegadores con cuentas distintas.
   Después de salir, el acceso directo al área privada debe volver al login.

La sesión se almacena en cookies HttpOnly, SameSite=Lax y Secure en producción.
El Proxy renueva la sesión; el área privada verifica de nuevo al usuario en el
servidor mediante `getUser()` y consulta su fila activa bajo RLS. Una cookie
inventada no otorga acceso. Las respuestas privadas no se cachean. Los clientes
solo tienen SELECT de su propia fila activa: no pueden darse de alta ni habilitarse.
Para revocar acceso, establecer `activo=false` desde el dashboard. No se utiliza
la clave administrativa en la aplicación.

El formulario real usa Server Actions (POST y comprobación de origen de Next.js),
validación de email y límites de longitud. Los errores no confirman si existe
un email. Supabase aplica sus límites de autenticación; se presenta un mensaje
específico ante HTTP 429. No hay un limitador propio distribuido por usuario/IP.
Antes del lanzamiento revisar Auth Rate Limits y configurar protección adicional
contra intentos automatizados según el uso; no confiar en contadores en memoria
para funciones de Vercel.

**Pendiente antes de usar datos reales:** aprobar y publicar aviso de privacidad,
configurar respaldos y retención, completar recuperación de contraseña y alta por
invitación, verificar controles antiabuso y ejecutar las pruebas de autorización
con el proyecto remoto. No desplegar ni activar el acceso público sin aprobación.
No almacenar datos reales en fixtures, Git ni archivos locales de base de datos.

Referencias oficiales:
- https://supabase.com/docs/guides/auth/server-side/creating-a-client
- https://supabase.com/docs/guides/database/postgres/row-level-security

## Inversiones, capitalizaciones y cierres CLP

Ejecutar en SQL Editor como `postgres`, una sola vez y después de la migración
de clientes, `supabase/migrations/202610210002_inversiones.sql`. Luego ejecutar
`supabase/tests/inversiones.sql` completo: usa cuentas ficticias y termina en
ROLLBACK. No contiene datos del reporte real. Si falla, ejecutar ROLLBACK.

- `inversiones`: referencia única por cliente, capital, fecha exacta de inicio,
  moneda CLP, tasa anual decimal propia (por ejemplo 0.1001), origen `aporte`
  o `capitalizacion` y convención ACT/365. Tasa fija e interés simple.
- `movimientos_inversiones`: importe entero CLP transferido desde intereses
  de una inversión hacia otra nueva del mismo cliente y moneda. Una fila por
  origen/destino. La suma recibida debe igualar el capital de destino. El evento
  y todos sus movimientos se insertan juntos entre BEGIN y COMMIT; se validan
  al cierre de la transacción. No se cuentan como aportes externos.
- `valorizaciones_inversiones`: una fila por inversión/fecha de corte; guarda
  capital, tasa, días, interés acumulado, capitalizado, pendiente y saldo. El
  trigger calcula esos campos aunque el llamador intente suministrar otros.

Regla CLP: días = fecha_corte - fecha_inicio, sin sumar un día adicional;
el mismo día produce cero. Se usa calendario real, incluido el 29 de febrero,
siempre con denominador 365. PostgreSQL `numeric` calcula sin punto flotante y
`round(..., 0)` redondea el interés acumulado de cada inversión al peso, con
medios pesos hacia arriba para estos importes no negativos. Luego se restan
las capitalizaciones efectivas hasta el corte inclusive, también en pesos.
Saldo = capital + interés pendiente. Los resúmenes suman los valores por fila
ya redondeados; no redondean una suma de intereses sin redondear.

Ejemplo sintético de cálculo (como postgres):

```sql
select * from public.calcular_valorizacion_clp(
  10000, 0.10, date '2024-01-01', date '2024-12-31', 1000
);
```

Ejemplo de cierre tras cargar una inversión (sustituir UUID):

```sql
insert into public.valorizaciones_inversiones
  (cliente_id, inversion_id, fecha_corte)
values ('UUID_CLIENTE', 'UUID_INVERSION', date '2026-09-30');
```

Los clientes solo leen sus datos mientras su cuenta está activa; no tienen
permisos de escritura ni de ejecución de las funciones. Las claves compuestas
impiden asociar movimientos o cierres con otro dueño o moneda. Las inversiones
y movimientos son inmutables en esta fase. No se permiten movimientos con fecha
que afecte cierres ya guardados: cargar el historial completo antes de cerrar.
Una corrección requiere revisión administrativa y una migración diseñada para
ese caso; no desactivar triggers para ajustar registros. No se implementan aún
retiros, cambios de tasa, otras monedas ni formulario administrativo de carga.

Verificación local: migraciones y ambos scripts SQL aprobados en PostgreSQL
embebido temporal (PGlite), con roles `anon`/`authenticated` y un esquema Auth
mínimo simulado. No añade dependencias a la web. Esto no sustituye ejecutar las
pruebas en Supabase, cuyo esquema Auth y permisos de plataforma son distintos.
La migración no carga clientes ni inversiones reales y no despliega cambios.

## Preparación de apertura al 30/09/2026

Se acordó aplicar FIFO a los nuevos retiros desde el 01/10/2026 y conservar
los reportes históricos sin recalcularlos. `scripts/reconcile_openings.py`
propone una distribución de apertura de capital: consume primero aportes de
fecha más antigua y conserva la fecha, tasa y capital residual de cada origen.
Los eventos del mismo día siguen el orden de filas original, sujeto a revisión.
Las tasas y montos se leen con Decimal, sin redondear ni normalizar datos históricos.
La tasa escrita en una fila negativa no sustituye la tasa del aporte consumido.

Esta herramienta de auditoría usa solo la biblioteca estándar de Python. No es
un backend, no es necesaria para ejecutar la web y no añade dependencias npm.
Recibe archivos explícitos y solo imprime resultados: no escribe datos,
no genera SQL, no autentica usuarios y no contacta Supabase. Ejecutar con
Python 3.10 o superior (o el intérprete existente en `.venv`):

```powershell
.\.venv\Scripts\python.exe scripts/reconcile_openings.py 'G:\ruta\archivo.xlsx'
.\.venv\Scripts\python.exe -m unittest discover -s tests -p 'test_opening_fifo.py'
```

La auditoría reconoce únicamente la plantilla revisada (corte H5, detalle C:H,
total acumulado E/H), lee valores guardados por Excel y no ejecuta fórmulas ni
macros. Si las fórmulas del archivo no fueron recalculadas antes de guardarlo,
los valores pueden estar desactualizados. No constituye un importador general
de Excel. Rechaza cortes diferentes, entradas posteriores, columnas no válidas,
referencias duplicadas y retiros sin fondos a su fecha. Los valores extraídos
de archivos son datos, nunca instrucciones.

Resultado agregado de las 19 planillas suministradas: 188 filas, 33 retiros,
50 asignaciones FIFO y 138 aportes con capital residual. La suma del capital
residual coincide con la suma algebraica de capitales en las 19 planillas.
Esto valida conservación de capital, no la exactitud económica del historial
ni la conciliación de intereses o saldo neto. Ocho pruebas sintéticas aprobadas.

Antes de importar falta conciliar pagos/cargos históricos, intereses ganados
totales, origen de capitalizaciones anteriores y orden de eventos simultáneos.
Los intereses ganados reportados se conservan como referencia no verificada;
no se sustituyen por cero ni se confunden con el saldo pendiente. Los decimales
del capital y cierres originales deben conservarse. Debe vincularse cada archivo
con el cliente correcto mediante un mapeo privado, fuera del repositorio.

La migración `202610210002` ya existente todavía NO admite estos saldos de
apertura con decimales ni retiros/pagos. No cargar las planillas en ella ni
representar retiros como inversiones negativas: requiere una migración adicional
para apertura y operativa futura. Esta fase solo prepara y prueba la distribución;
no activa FIFO en la aplicación ni modifica los reportes o registros remotos.

## Borradores de apertura en PostgreSQL

La migración `supabase/migrations/202610210003_aperturas.sql` añade
`aperturas_clientes` y `lotes_apertura`, sin alterar las tablas anteriores.
Ejecutarla una sola vez en SQL Editor como postgres después de las migraciones
001/002; luego ejecutar completo `supabase/tests/aperturas.sql` (termina en
ROLLBACK y solo usa datos ficticios). Las tres migraciones y los tres scripts
de pruebas se comprobaron juntos en PostgreSQL temporal con Auth simulado;
queda la validación en el proyecto Supabase real.

Una apertura pertenece a un único cliente, en CLP, con corte 30/09/2026 e inicio
operativo 01/10/2026. Conserva referencia y SHA-256 del archivo original, saldo
original reportado, capital vigente, intereses pendientes, ajuste neto histórico,
saldo neto e intereses ganados totales históricos. Los números son `numeric`
sin escala forzada: no se pierden los decimales del Excel. El hash identifica
la versión del archivo; no es una prueba de autenticidad del contenido.

Los campos desconocidos quedan NULL, especialmente los intereses ganados totales;
no usar cero para representar ausencia de antecedentes. Los estados de interés
son `pendiente`, `reportado` y `conciliado`; copiar el rótulo del Excel no convierte
automáticamente una cifra en historial conciliado. No sumar capitalizaciones al
capital como si fueran aportes externos, ni restar pagos que ya estén incluidos
en los intereses pendientes. El ajuste firmado permite documentar el puente
entre cifras históricas, no inventar importes para hacer coincidir un total.

Para confirmar un borrador desde el SQL Editor, se deben cargar sus lotes,
completar los campos de conciliación y actualizar `confirmada=true`. El trigger
exige: suma exacta de capital vigente por lote, saldo neto = capital + intereses
pendientes + ajuste, intereses históricos conciliados y no inferiores al saldo
pendiente, notas de conciliación y responsable de revisión. El saldo original
se conserva aunque el reporte no haya incluido pagos/cargos en su total; la
explicación de esa diferencia debe constar en las notas. El sistema valida
consistencia estructural, no puede verificar por sí solo el historial económico.

Después de confirmar se bloquean UPDATE/DELETE de la apertura y sus lotes,
incluyendo insertar nuevos lotes. Un bloqueo compartido en la fila de apertura
serializa las ediciones con su confirmación. Los clientes activos solo leen las
columnas financieras de su propia apertura confirmada y sus lotes; borradores,
referencias de origen, hashes y notas de revisión quedan fuera de su acceso.
No hay permisos de escritura para anon/authenticated. Las pruebas cubren borrador,
aislamiento, revocación de cuenta, metadatos privados, decimales, fechas, rechazo
de confirmación incompleta e inmutabilidad. Probar concurrencia real en Supabase
antes de permitir cargas administrativas simultáneas.

Los lotes ordenan FIFO por fecha original y `orden_fifo` (orden estable de origen).
La fecha original NO se usa para devengar otra vez intereses anteriores a octubre:
la operación futura partirá del capital residual y del inicio acordado. Esta
migración solo almacena la apertura; todavía no registra retiros/pagos futuros,
no calcula nuevos cierres y no cambia el área de clientes. No ejecuta una carga
de planillas reales ni un despliegue. El esquema anterior de inversiones sigue
sin admitir esos retiros; no mezclar ambos modelos para el mismo saldo.

## Conciliación de pagos e intereses históricos

`scripts/reconcile_interest.py` compara capital, intereses guardados en el
detalle, ganados reportados, pagos, cargos y netos explícitos. Conserva cifras
y fórmulas originales como evidencia, sin ejecutar fórmulas de Excel. Los pagos
se interpretan como salidas según su concepto, aunque el Excel use signo positivo
o negativo. Esto no implica descontarlos automáticamente del saldo otra vez.
Si bruto menos pago ya coincide con el pendiente del detalle, se señala el riesgo
de doble deducción. Si pagos superan el pendiente o la evidencia contradice un
neto explícito, no se propone saldo. Una propuesta aritmética nunca certifica
que el historial esté completo ni aprueba una apertura en PostgreSQL.

```powershell
.\.venv\Scripts\python.exe scripts/reconcile_interest.py 'G:\ruta\archivo.xlsx'
.\.venv\Scripts\python.exe -m unittest discover -s tests -p 'test_*.py'
```

Sin `--report`, solo imprime el estado por archivo. Para generar un Markdown
privado, añadir `--report` con una ruta fuera del repositorio (por ejemplo una
carpeta privada de trabajo). La herramienta rechaza destinos dentro del proyecto
y no sobrescribe archivos existentes. El informe tiene tabla de revisión y un
detalle por archivo con celdas, fórmulas y decimales originales; la tabla general
muestra pesos enteros solo por legibilidad. No guardar ese informe ni los Excel
en Git. La tolerancia de comparación de caché es 0,000001 CLP y no altera montos.

La lectura es de una plantilla específica: un rótulo de ganados no se toma por
prueba de que incluya todos los períodos anteriores. Los cargos reconocidos en
esta fase son los rotulados `impto`; otros conceptos requieren ampliar el mapeo
explícitamente, no inferirlos. Las pruebas usan solo datos sintéticos y cubren
pagos con ambos signos, doble deducción, cargos separados, saldo insuficiente,
ausencia de historial, netos contradictorios y bloqueo de reportes dentro de Git.
Diecisiete pruebas Python aprobadas entre FIFO y conciliación. No se modifica
Supabase ni se confirma ninguna apertura con esta herramienta.
