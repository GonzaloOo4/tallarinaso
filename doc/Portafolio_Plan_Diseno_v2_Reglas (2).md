# Plan de Diseño v2 — Reglas de Negocio y de Diseño
### Portafolio de Gonzalo · Diseño Digital · Énfasis en Contenido

---

## Qué es este documento

El plan v1 definió el concepto, la identidad y el sistema visual: todo eso **sigue vigente**. Esta v2 no lo reemplaza — lo convierte en reglas operables para una arquitectura fullstack ya en funcionamiento.

Cada regla tiene dos capas:

- **Regla** — el enunciado en lenguaje natural: lo que tú (o cualquier persona) puede entender, defender y usar para decir "esto viola la regla" sin abrir el código.
- **Técnico** — los valores, tokens y mecanismos concretos con los que se implementa y se verifica.

El **SPEC** citará estas reglas por su ID (`RN-xx`, `RD-xx`) en sus criterios de aceptación. El plan de implementación ordenará el trabajo sobre ellas.

**Cómo leer las marcas:**

- Las reglas sin marca formalizan lo que v1 ya decía.
- Las reglas **[RATIFICADA]** fueron propuestas de esta v2, aprobadas en la ratificación del 26 de agosto de 2026 — con una corrección: **RD-19 se invirtió** (el modo oscuro sí entra) y su regla fue reescrita. Los bloques de decisión se conservan como registro de qué se consideró.
- No quedan marcas [PROPUESTA] vivas: mecanismo y paleta de RD-19 quedaron decididos por delegación el 2 de septiembre de 2026 (toggle + verde en ambos modos). Todo sigue siendo corregible con una línea y su re-verificación.
- Ningún número de este documento es inventado: viene de v1, es un estándar externo citado, está calculado (contrastes WCAG), o está marcado como propuesta con su justificación.

**Arquitectura anclada (ya implementada y funcionando).** Next.js 15 (App Router) + TypeScript strict + Tailwind CSS 4 + Framer Motion, con capa de datos JSON validada por esquemas — según el plan de infraestructura del proyecto. Las capas técnicas de diseño se anclan a ese stack.

**Frontera con la infraestructura.** Este documento gobierna el **contenido y el diseño** del portafolio. El pipeline (repositorio, ramas, CI, despliegue, motor de datos) pertenece al plan de infraestructura: cuando una regla necesita apoyarse en él, lo referencia sin repetirlo. El SPEC es donde los dos planos se enlazan.

**Referente de línea (2 de septiembre de 2026).** Gonzalo eligió como línea de diseño el sitio de Samuel Kraft (samuelkraft.com; repositorio `samuelkraft-next`, licencia MIT; publicado de uso libre en 21st.dev según indicación del docente). La decisión de adopción fue **delegada** y quedó registrada regla por regla. **Se adoptó** la estructura de la línea: columna de texto de 640px con imágenes que rompen hasta 880px (RD-05, RD-16), toggle de tema (RD-19) y home única sin blog (RD-08, RD-09). **Se descartó** lo que constituye la identidad del referente o falla contra el propio sistema: Inter como única familia (borraría la ficha de producción y la numeración CUADRO — RD-04 intacta), el acento terracota (falla AA por cálculo sobre las superficies claras — el verde de RD-02/RD-19 se mantiene), los springs con rebote (RD-11 intacta: nada rebota) y el avatar en el hero (la marca es tipográfica, v1 §2; una foto puede vivir como contenido en la escena Sobre mí). El referente calibra; no reemplaza.

---

# Parte A — Reglas de negocio

## A1 · Propósito y contenido

### RN-01 · El portafolio demuestra sistemas, no piezas
**Regla.** Tu propuesta de valor es "diseñador que piensa en sistemas narrativos". Por eso cada cuadro tiene que mostrar el sistema detrás de la pieza: las decisiones, las alternativas descartadas, el proceso. Un proyecto del que no puedas contar el proceso todavía no entra al portafolio.
**Técnico.** El modelo `Cuadro` (RD-13) exige un cuerpo con al menos las secciones de *resumen* y *proceso y decisiones* (RD-14). La validación de publicación (RN-04) lo hace obligatorio.

### RN-02 · La numeración es firma, no índice
**Regla.** Los cuadros se numeran CUADRO 01, 02, 03… Un número asignado no se recicla ni se reordena nunca: es parte de la identidad verbal del sistema.
**Técnico.** `numero: string` de dos dígitos, único e inmutable una vez publicado el cuadro.
**[RATIFICADA] Orden de exhibición ≠ número.** *Qué:* el índice puede ordenarse curatorialmente (campo `orden` separado) sin tocar el número. *Alternativas:* orden = número, cronología estricta. *Por qué:* te permite poner adelante el mejor trabajo sin romper la firma. *Qué lo cambiaría:* si decides que la cronología ES el relato del portafolio, orden y número se fusionan.

### RN-03 · Un enlace publicado no se rompe nunca
**Regla.** Tu portafolio va a estar citado en tu CV, en correos y en perfiles. Una URL que devolvió un cuadro ayer tiene que devolverlo siempre.
**Técnico.** `slug` en kebab-case, sin acentos (ñ→n), inmutable tras publicar. Si un título cambia, el slug se conserva; si de verdad hay que cambiarlo, se deja una redirección permanente (301) — el mecanismo concreto es asunto del plan de infraestructura. Verificación: la validación de la colección rechaza slugs duplicados.

### RN-04 · Un cuadro se publica completo o no se publica
**Regla.** Nada de "próximamente" ni fichas a medias: si un cuadro aparece en el índice, tiene metadata completa, portada y case study navegable.
**Técnico.** Campos obligatorios para `publicado: true`: `numero`, `slug`, `titulo`, `resumen`, `rol`, `anio` (el año real del proyecto — nunca un placeholder), `formato`, `herramientas`, `portada` con `alt`, y `cuerpo` con las secciones mínimas de RD-14. Validación contra el esquema de la colección: un cuadro publicado que no cumpla **bloquea la publicación**. Esa es la garantía, no la buena memoria — en qué punto del pipeline corre esa validación lo fija el plan de infraestructura, y el SPEC lo cita.

### RN-05 · Crédito explícito, siempre
**Regla.** Todo trabajo hecho con otras personas nombra a cada colaborador y su rol. Es política de autoría del portafolio, no cortesía opcional.
**Técnico.** `creditos: { nombre, rol, enlace? }[]` — obligatorio cuando hubo colaboración. Se renderiza en la metadata mono del cuadro (RD-14), con el mismo peso visual que tu propio rol.

### RN-06 · Idioma **[RATIFICADA]**
**Regla.** El portafolio se publica en español. El inglés, si llega, será una versión curada — no una traducción a medias conviviendo con la buena.
**Técnico.** `lang="es"` en el layout raíz. Los textos viven junto al contenido (en la fuente de datos, RN-09), no como strings sueltos dentro de componentes — así una futura versión bilingüe no exige reescribir la interfaz.
**Decisión.** *Qué:* español único en v2. *Alternativas:* bilingüe desde el inicio; solo inglés. *Por qué:* tu contexto inmediato es hispanohablante y el bilingüe duplica el mantenimiento de contenido sin audiencia definida aún. *Qué lo cambiaría:* postulación a estudios o mercado internacional → se agrega `en` como locale con contenido curado.

## A2 · Gobierno del contenido y de las decisiones

### RN-07 · [Retirada]
Definía el flujo de publicación (ramas, PRs, previews, despliegue). **No es regla de negocio del contenido:** pertenece al plan de infraestructura, donde ya está resuelto. El ID se retira y no se reutiliza — el mismo principio de RN-02 aplicado a las propias reglas.

### RN-08 · Los cambios se deciden por escrito
**Regla.** Un cambio que altere reglas de este documento (tokens, componentes, estados, contenido obligatorio) no entra "porque quedaba mejor": entra con su decisión registrada.
**Técnico.** Registro `DECISIONES.md` en la raíz del proyecto. Cada entrada: qué se decidió, qué alternativas se consideraron, por qué esta, qué lo cambiaría. El SPEC hereda este mecanismo tal cual.

### RN-09 · Una sola fuente de verdad para los cuadros
**Regla.** El contenido de un cuadro vive en un solo lugar. Los componentes lo leen; nunca lo duplican ni lo parchean localmente.
**Técnico.** Una sola colección de cuadros, versionada y validada por su esquema; el tipo `Cuadro` (RD-13) se deriva de ese esquema — un solo lugar define contenido, validación y tipado. La identidad del cuadro es `numero`/`slug` (RN-02/RN-03), nunca la llave técnica interna del registro. Todos los componentes se tipan contra `Cuadro`; cero textos hardcodeados. Dónde vive la colección y con qué motor se lee es asunto del plan de infraestructura; el SPEC hace el enlace.

### RN-14 · El contenido entra versionado; producción no se edita **[RATIFICADA]**
**Regla.** Un cuadro nuevo o corregido entra como cambio versionado, con su revisión y su decisión registrada (RN-08); lo que el público ve es exactamente lo que pasó la validación. No existe edición directa en producción.
**Técnico.** La colección (RN-09) es la única puerta de entrada del contenido, y la validación del esquema decide qué se publica: un cuadro `publicado: true` inválido **bloquea la publicación** — la garantía que RN-04 exige. Cómo se materializa (generación estática, momento y pipeline) pertenece al plan de infraestructura y se fija en el SPEC.
**Decisión.** *Qué:* el repositorio versionado como único camino de escritura del contenido; publicar es pasar la validación. *Alternativas:* CMS con edición en caliente; contenido editable directamente en producción. *Por qué:* cada cambio de contenido queda revisable y reversible antes de ser público, y la validación es una barrera ejecutable, no una convención. *Qué lo cambiaría:* contenido que deba cambiar sin pasar por publicación (métricas en vivo, comentarios) — se resolvería en la capa de infraestructura sin tocar esta regla.

### RN-15 · El contenido definitivo se pide justo a tiempo **[RATIFICADA — dirección tuya]**
**Regla.** Los textos y assets definitivos no se recolectan todos al inicio: cada ciclo de implementación le solicita al usuario únicamente lo que ese ciclo necesita, para que los ciclos sean cortos y con contexto acotado.
**Técnico.** La lista de lo que se pide no se improvisa: se deriva del esquema de la colección (RD-13) y de la ruta en construcción. El ciclo de un cuadro pide exactamente: título, resumen, rol, año real, formato, herramientas, créditos si aplica, portada 16:9 con su `alt`, piezas de galería y enlaces. El SPEC declara qué contenido consume cada ciclo y en qué orden — la home pide nombre y texto del hero antes que nada. Mientras el contenido no llega, el cuadro permanece `publicado: false`: RN-04 garantiza que ningún placeholder alcanza producción.
**Decisión.** *Qué:* solicitud de contenido por ciclo, no por adelantado. *Alternativas:* recolectar todo antes de implementar (bloquea el arranque y el contenido envejece esperando); placeholders publicados (violaría RN-04). *Por qué:* ciclos con contexto corto para el asistente que implementa, y el contenido llega fresco justo cuando su ruta existe. *Qué lo cambiaría:* si los ciclos se frenan esperando contenido, se recolecta un lote adelantado por tanda de trabajo.

## A3 · Calidad transversal (medible)

### RN-10 · Accesibilidad AA como piso
**Regla.** AA no es una aspiración: es condición de publicación. Un portafolio de diseño que excluye lectores contradice su propio oficio.
**Técnico.** Contrastes verificados por cálculo (tabla en RD-02). Foco visible en todo elemento interactivo (RD-10). `prefers-reduced-motion` respetado (RD-12). `alt` obligatorio en toda imagen — sin él, la validación de la colección lo rechaza (misma garantía de RN-04). Una sola `h1` por ruta. Landmarks semánticos: `header`, `nav`, `main`, `footer`.
**[RATIFICADA] Skip-link.** *Qué:* enlace "saltar al contenido" como primer elemento enfocable, visible solo con foco. *Alternativas:* no tenerlo. *Por qué:* navegación por teclado directa al contenido con costo de implementación trivial. *Qué lo cambiaría:* nada previsible.

### RN-11 · Presupuesto de rendimiento **[RATIFICADA — adopción de umbral]**
**Regla.** El sitio se siente inmediato. Un portafolio lento contradice el tono "directo, técnico, sin relleno".
**Técnico.** Umbrales = Core Web Vitals en rango "good" (estándar publicado por Google): **LCP ≤ 2.5 s · INP ≤ 200 ms · CLS ≤ 0.1**, medidos sobre producción. Las palancas son de las reglas de diseño: imágenes optimizadas con dimensiones declaradas (RD-16) y carga tipográfica disciplinada (RD-04); la herramienta de medición la fija el plan de infraestructura.
**Decisión.** *Qué:* adoptar CWV "good" como criterio de aceptación. *Alternativas:* sin presupuesto; presupuesto propio más estricto. *Por qué:* es un estándar externo medible — no hay que inventar el número, y la herramienta de medición la aporta la infraestructura. *Qué lo cambiaría:* si un case study transmedia con media pesada lo hace inviable, se documenta la excepción por ruta en `DECISIONES.md`.

### RN-12 · Cada ruta se puede compartir
**Regla.** Cualquier URL del sitio pegada en un chat, correo o red se ve con título, descripción e imagen correctos. El portafolio también se diseña para cuando no lo están mirando de frente.
**Técnico.** Metadata por ruta: `title` (convención SEO habitual: ~60 caracteres), `description`, imagen OG. Los cuadros generan su OG con la plantilla del sistema (RD-17). Verificación: pasar la tarjeta resultante por un validador de OG antes de publicar cada cuadro nuevo.

### RN-13 · Contacto **[RATIFICADA — pendiente de ratificar]**
**Regla.** El contacto son enlaces directos, no un formulario. Quien quiere escribirte llega a tu correo o a tus perfiles en un clic, sin intermediario que pueda fallar.
**Técnico.** Filas de contacto ya diseñadas en v1 (fila completa clickeable, línea inferior, flecha en acento): `mailto:` + perfiles que definas. Cero backend, cero validación, cero estados de envío.
**Decisión.** *Qué:* enlaces directos, sin formulario. *Alternativas:* formulario (implica ruta API, validación, anti-spam y estados de éxito/error); híbrido. *Por qué:* menor superficie de fallo; el diseño v1 ya resolvió la fila de contacto; un formulario exige su propio spec y mantenimiento continuo. *Qué lo cambiaría:* si empiezas a recibir encargos y necesitas un brief estructurado, se agrega el formulario con spec propio.

---

# Parte B — Reglas de diseño

## B1 · Tokens

### RD-01 · Tokens o nada
**Regla.** Ningún valor visual se escribe a mano dentro de un componente. Si el valor que necesitas no existe como token, primero se crea el token — y crear un token es una decisión registrada (RN-08).
**Técnico.** CSS custom properties como fuente única, declaradas en el `@theme` de Tailwind 4 (`globals.css`): la paleta de v1 (`--bg`, `--ink`, `--muted`, `--line`, `--accent`, `--accent-soft`, `--paper`) más las escalas de tipografía (RD-04), espaciado (RD-05) y motion (RD-11) de este documento — los tokens generan las utilidades, no al revés. Prohibidos los valores arbitrarios de Tailwind (`bg-[#4A6B52]`, `p-[13px]`): si el valor hace falta, se promueve a token con su decisión (RN-08). Verificación: búsqueda de `[#` y de valores sueltos en cada revisión de cambios.

### RD-02 · Paleta verificada: lo que pasa y lo que queda prohibido
**Regla.** La paleta de v1 queda exactamente como está. Lo que se agrega es la prueba de que cumple AA — y las combinaciones que quedan prohibidas por no cumplirlo.
**Técnico.** Ratios calculados con la fórmula de WCAG 2.1 a partir de los hex de v1:

| Combinación | Ratio | AA texto normal (≥ 4.5) | AA texto grande / UI (≥ 3.0) |
|---|---|---|---|
| `ink` / `bg` | 16.9 | ✔ | ✔ |
| `ink` / `paper` | 18.6 | ✔ | ✔ |
| `ink` / `accent-soft` | 14.9 | ✔ | ✔ |
| `muted` / `bg` | 4.7 | ✔ | ✔ |
| `muted` / `paper` | 5.1 | ✔ | ✔ |
| `muted` / `accent-soft` | **4.1** | **✘** | ✔ |
| `accent` / `bg` | 5.4 | ✔ | ✔ |
| `accent` / `paper` | 6.0 | ✔ | ✔ |
| `accent` / `accent-soft` | 4.8 | ✔ | ✔ |

Esto cierra la verificación que v1 dejaba pendiente: **el verde puede ser texto de link a cualquier tamaño de cuerpo**, sobre fondo y sobre blanco.

**Reglas derivadas del cálculo:**
- **Prohibido:** `muted` sobre `accent-soft` para texto de lectura (4.1 no llega a 4.5). Solo se permite en texto grande según WCAG (≥ 24px, o ≥ 18.66px en bold). Dentro de un highlight `accent-soft`, el texto secundario usa `ink` o `accent`.
- `line` y `accent-soft` sobre `bg` son **decorativos**: nunca pueden ser el único medio para transmitir información (sin requisito de contraste porque no lo llevan).

**Paleta oscura (RD-19), verificada con la misma fórmula.** Papel y tinta intercambian roles; `muted` y `accent` se aclararon por búsqueda manteniendo su tono hasta cumplir AA; `paper` y `line` replican las relaciones del modo claro (1.11 y 1.27 sobre el fondo):

| Token (oscuro) | Hex | / `bg` | / `paper` | / `accent-soft` |
|---|---|---|---|---|
| `bg` | `#131311` | — | — | — |
| `ink` | `#F4F4F1` | 16.9 ✔ | 15.2 ✔ | 15.2 ✔ |
| `muted` | `#86867C` | 5.1 ✔ | 4.6 ✔ | 4.6 ✔ |
| `accent` | `#638F6E` | 5.0 ✔ | 4.5 ✔ | 4.5 ✔ |
| `line` | `#292924` | decorativo | — | — |
| `accent-soft` | `#162018` | decorativo | — | — |
| `paper` | `#1E1E1B` | decorativo | — | — |

El hallazgo que obligó a derivar: **el verde de v1 sobre el fondo oscuro da 3.1 — falla AA para texto normal**. Por eso el acento oscuro es una variante más luminosa del mismo tono. Y aunque `muted` sobre `accent-soft` pasa en oscuro (4.6), **la prohibición de arriba rige en ambos modos**: los componentes no saben en qué modo están (RD-19), así que manda la intersección de restricciones.

### RD-03 · El acento se gana su lugar
**Regla.** El verde señala, no decora. La prueba: si un elemento verde desapareciera y la vista siguiera funcionando igual, ese verde sobraba.
**Técnico.** Lista cerrada de usos de `--accent`: links, estados hover, foco (RD-10), la viga de luz, la numeración de cuadros, flechas de interacción. Presupuesto de v1: el acento nunca supera ~10% de la superficie visible de una vista. `--accent-soft` solo como fondo de highlight puntual, nunca en superficies grandes. Prohibido `--accent` como fondo de bloques o botones (no hay botones rellenos en el sitio, v1 §6). Verificación: auditoría visual por ruta antes de publicar + la verificación de tokens de RD-01.

### RD-04 · Escala tipográfica **[RATIFICADA — valores]**
**Regla.** Los tres roles de v1 no cambian: Fraunces cuenta, Inter sostiene, el mono especifica. Lo que se agrega son los números, para que "el elemento más grande del sitio" signifique lo mismo en todos los navegadores y viewports.
**Técnico.** Un token por rol — no hay jerarquías intermedias:

| Token | Rol (v1) | Valor propuesto | Familia / peso (v1) | Detalles |
|---|---|---|---|---|
| `--type-display` | Nombre en el hero | `clamp(2.75rem, 1rem + 6vw, 5.5rem)` | Inter 800 | tracking `-0.02em`, line-height 1.05 |
| `--type-title` | Títulos de sección y de proyecto | `clamp(1.5rem, 1.1rem + 1.6vw, 2rem)` | Fraunces 600 | line-height 1.2 |
| `--type-subtitle` | Subtítulos editoriales | `1.25rem` | Fraunces 500 | line-height 1.35 |
| `--type-body` | Cuerpo, descripciones, UI | `1.125rem` (18px) | Inter 400 | line-height 1.6 |
| `--type-meta` | Metadata, nav, etiquetas, numeración | `0.8125rem` (13px) | IBM Plex Mono 400 (500 en nav) | MAYÚSCULAS, letter-spacing `0.08em`, line-height 1.4 |

Medida de lectura: los párrafos corridos se limitan a `--measure: 70ch` dentro del contenedor (la convención tipográfica ubica la línea cómoda entre ~50 y 75 caracteres; a 18px, los 880px del contenedor la exceden).
Carga tipográfica: `next/font` — auto-hospedadas, subset automático, `font-display: swap`; variables donde existan (Fraunces e Inter lo son; IBM Plex Mono no).
**Decisión.** *Qué:* escala de 5 pasos con `clamp()` fluido; el tope del hero es `5.5rem` = 88px, reutilizando el ritmo 88 que v1 ya definió para las secciones — el número más grande del sitio y el corte de escena comparten valor. *Alternativas:* escala modular fija (razón 1.25) con más pasos; tamaños estáticos por breakpoint. *Por qué:* v1 definió exactamente cinco roles; un token por rol impide inventar jerarquías intermedias, y el fluid type elimina saltos en el resize. *Qué lo cambiaría:* si tu nombre completo no cabe en una línea en mobile a `2.75rem`, se baja el mínimo del clamp (y se registra en `DECISIONES.md`).

### RD-05 · Escala de espaciado **[RATIFICADA — formalización]**
**Regla.** Las separaciones no se improvisan: todo espacio sale de la escala. El ritmo de 88px + línea de 1px entre secciones sigue siendo el "corte de escena" de v1.
**Técnico.** Base 8: `--space-1: 8px · --space-2: 16px · --space-3: 24px · --space-4: 32px · --space-6: 48px · --space-8: 64px · --space-11: 88px` (declarados en rem). Anclas que ya existían en v1: 24 (padding mínimo), 64 (padding máximo), 88 (ritmo de sección). Tokens de layout: `--container: 640px` (columna de texto), `--container-media: 880px` (límite de imágenes y media, RD-16), `--col-numero: 90px` (columna del número de cuadro, v1 §5).
**Decisión.** *Qué:* base 8. *Alternativas:* base 4 (más granular). *Por qué:* todos los valores de v1 ya son múltiplos de 8. *Qué lo cambiaría:* necesidad real y repetida de pasos intermedios.
**Enmienda (2 de septiembre de 2026, decisión delegada).** *Qué:* la columna de texto pasa de 880px a 640px, y el 880 de v1 se convierte en `--container-media` — el límite hasta el que las imágenes rompen la columna. *Alternativas:* mantener 880 para todo; 640 con sangre completa a viewport (el referente). *Por qué:* texto angosto = ficha íntima y legible (640px a 18px ≈ 60 caracteres por línea, dentro de la medida cómoda); imagen ancha = fotograma — la jerarquía texto/imagen de la línea elegida refuerza literalmente "cuadro a cuadro", y el 880 no se elimina: cambia de rol. La sangre a viewport se descartó por desmesura en pantallas grandes. *Qué lo cambiaría:* piezas reales que pidan otro ancho — se re-deriva con las piezas en la mano.

### RD-06 · Grid y breakpoint
**Regla.** Una sola ruptura principal: el sitio es editorial, no un dashboard. Menos breakpoints = menos estados que mantener coherentes.
**Técnico.** Breakpoint en 700px (v1 §10): el grid de proyectos pasa de 2 columnas (`--col-numero` + flexible) a 1; el about, igual. Contenedor centrado a `--container`. Padding lateral fluido: `clamp(24px, 5vw, 64px)` — los extremos son de v1; **[RATIFICADA]** el término medio `5vw` (alcanza los 64px a 1280px de viewport; *alternativa:* `4vw`, más lento; *qué lo cambiaría:* sensación de encierro en tablets). Bajo 700px la navegación comprime su gap y se mantiene horizontal (v1 §7).

## B2 · Componentes y estados

### RD-07 · Componentes de v1, ahora con todos sus estados
**Regla.** Los cuatro componentes de v1 quedan como están. Lo que se completa es lo que v1 solo definió para hover: reposo, foco e interacción de cada uno.
**Técnico.**

| Componente | Reposo | Hover (v1) | Focus-visible |
|---|---|---|---|
| **Project box (cuadro)** | Línea superior 1px `line`; sin borde propio, sin sombra; número en mono + `accent`, columna fija arriba | El link del título usa el subrayado animado | Outline estándar (RD-10) sobre el link |
| **Skill card** | Borde 1px `line`, fondo `paper`, sin sombra | Borde pasa a `accent`, `translateY(-2px)` — única elevación del sitio, solo en interacción | Mismo tratamiento que hover + outline (RD-10) |
| **Links** | Color `accent` en texto corrido; en nav, `muted` | Subrayado que crece de 0% a 100%, o flecha que se desplaza; en nav el color pasa a `ink` | Outline estándar (RD-10) |
| **Contact row** | Fila completa clickeable, línea inferior 1px `line` | La flecha en `accent` se desplaza | Outline sobre la fila completa |

Reglas transversales de v1 que se conservan literalmente: **cero botones rellenos, cero sombras dramáticas, cero bordes redondeados grandes, cero gradientes**. El color de los links no cambia entre estados: lo que cambia es el subrayado o la posición — la sobriedad es del sistema, no solo de la paleta.

### RD-08 · Navegación multi-ruta
**Regla.** El header de v1 se mantiene (sticky, fondo semitransparente con blur al scroll, marca en mono a la izquierda, secciones a la derecha). Con la home única (RD-09), los enlaces navegan a las anclas de las escenas; el estado activo existe para señalar cuándo saliste de la narrativa hacia un cuadro.
**Técnico.** Links de nav en `--type-meta`, apuntando a las anclas de RD-09. Hover: underline que crece + color de `muted` a `ink` (v1). El extremo derecho del header aloja el conmutador de tema (RD-19; S-C12 del SPEC).
**[RATIFICADA] Estado activo** *(alcance enmendado el 2 de septiembre de 2026)*. *Qué:* en `/proyectos/[slug]`, "Proyectos" se muestra en `ink` con subrayado persistente de 1px en `accent` y `aria-current="page"`; en la home no hay estado activo — el scroll-spy sobre anclas se descartó por costo y por meterle movimiento al menú. *Alternativas:* scroll-spy; solo cambio de color; sin estado activo. *Por qué:* reutiliza el gesto que el sistema ya tiene (el underline del hover) convirtiéndolo en estado — cero elementos nuevos. *Qué lo cambiaría:* si las escenas se independizan como rutas (RD-09), el estado activo vuelve a ser por ruta.

### RD-09 · Estructura del sitio: una narrativa, sus escenas y sus cuadros *(enmendada el 2 de septiembre de 2026, decisión delegada)*
**Regla.** El sitio es **una sola página** que se recorre como narrativa — hero, sobre mí, proyectos, habilidades y contacto como escenas separadas por el corte de 88px + línea — más una ruta de detalle por cuadro. Es la forma literal del concepto de v1: "una sola narrativa dividida en escenas". El blog del referente se descarta: sería una promesa de escritura sostenida que hoy no existe (espíritu de RN-04); el lugar del pensamiento escrito son las secciones de proceso de los cuadros.
**Técnico.**

| Superficie | Contenido | Encabezados |
|---|---|---|
| `/` | Hero (nombre en `--type-display`, la única `h1`) → `#sobre-mi` → `#proyectos` (índice de cuadros) → `#habilidades` → `#contacto` | Escenas con `h2` |
| `/proyectos/[slug]` | Case study (RD-14) | `h1` = título del cuadro |

Las escenas de la home son anclas (`id`) navegables desde el header (RD-08). El scroll hacia anclas es suave y se vuelve instantáneo con `prefers-reduced-motion` (RD-12).
**Footer** *(sin cambios)*: línea superior 1px `line`, todo en `--type-meta` mono `muted`: nombre, año, canales de contacto.
**Decisión.** *Qué:* home única + detalle por cuadro; sin blog. *Alternativas:* el mapa multi-ruta de v1 §9 (la versión anterior de esta regla); home única con blog (el referente completo). *Por qué:* con el volumen real de un portafolio en formación, la home única hace la narrativa recorrible en un solo scroll y le da a la viga de luz su lectura completa; las rutas `/sobre-mi`, `/habilidades` y `/contacto` nunca se publicaron, así que RN-03 no se viola. *Qué lo cambiaría:* crecimiento real del contenido (muchos cuadros, escritura sostenida) — las escenas se independizan como rutas, con redirecciones desde las anclas.

### RD-10 · Foco visible **[RATIFICADA — grosor]**
**Regla.** Quien navega con teclado ve exactamente dónde está, siempre. El foco usa el acento porque el foco *es* interacción — el lugar que el verde tiene ganado (RD-03).
**Técnico.** Global: `:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }`. Nunca `outline: none` sin reemplazo equivalente. El ratio `accent`/`bg` (5.4) supera con margen el 3.0 que WCAG exige a los indicadores no textuales.
**Decisión.** *Qué:* 2px de grosor y 2px de offset (v1 solo decía "outline en acento"). *Alternativas:* 1px (se pierde sobre `line`); 3px (grita en un sistema plano). *Por qué:* visible sin romper la sobriedad; el offset lo separa del borde 1px de las cards. *Qué lo cambiaría:* prueba real de visibilidad sobre imágenes de portada.

### RD-11 · Motion con presupuesto **[RATIFICADA — duraciones]**
**Regla.** Las reglas de v1 mandan: nada dura más de 0.6s, nada rebota. Lo que se agrega son las duraciones estándar, para que cada animación no negocie la suya.
**Técnico.**

| Token | Valor propuesto | Uso |
|---|---|---|
| `--motion-micro` | `200ms` | Underline, flecha, borde y elevación de card |
| `--motion-reveal` | `500ms` | Reveal on scroll: opacidad 0→1 + `translateY(12px→0)` |
| `--motion-ease` | `cubic-bezier(0.22, 1, 0.36, 1)` | Curva ease-out, sin rebote, para todo |

Reveal on scroll implementado con Framer Motion — `whileInView` con `viewport={{ once: true, amount: 0.15 }}` (IntersectionObserver por debajo, como pedía v1 §8): se dispara **una sola vez** por elemento, casi imperceptible, no una presentación. Los tokens de duración y curva se comparten entre CSS y Framer Motion: una sola fuente. La viga (RD-15) no usa duración: su relleno va atado a la posición de scroll (`useScroll`).
**Decisión.** *Qué:* dos duraciones y una curva únicas. *Alternativas:* duración por componente; springs. *Por qué:* dos tiempos bastan para micro-interacción y reveal; una sola curva hace que todo el sitio "respire" igual; ambos respetan el techo de 600ms de v1. *Qué lo cambiaría:* si el reveal a 500ms se siente lento con contenido denso, se baja — nunca se sube.

### RD-12 · Reduced motion
**Regla.** Si el sistema operativo pide menos movimiento, el sitio obedece del todo — no "anima más despacio".
**Técnico.** Bajo `@media (prefers-reduced-motion: reduce)`: transiciones y animaciones CSS a `none`. En los componentes con Framer Motion, `useReducedMotion()` desactiva el reveal y el relleno de la viga; los bloques del reveal se renderizan visibles de inmediato (sin estado inicial oculto — el contenido nunca depende de una animación para existir); la viga se muestra estática (RD-15).

## B3 · Contenido y datos

### RD-13 · El contrato `Cuadro` **[RATIFICADA — estructura]**
**Regla.** El `ProjectFrame` de v1 se alimenta de datos, no de HTML repetido. Este tipo es el contrato entre tu contenido y tus componentes: lo que no está aquí, no se renderiza.
**Técnico.**

```ts
type Cuadro = {
  numero: string;              // "01" — inmutable (RN-02)
  slug: string;                // kebab-case — inmutable (RN-03)
  titulo: string;
  resumen: string;             // 1–2 párrafos: qué es y por qué existe
  rol: string;
  anio: number;                // año real (RN-04)
  formato: string[];           // p. ej. ["Web", "PDF", "Video"]
  herramientas: string[];
  creditos?: Credito[];        // obligatorio si hubo colaboración (RN-05)
  portada: Imagen;             // 16:9 (RD-16), alt obligatorio (RN-10)
  galeria?: Imagen[];
  enlaces?: { demo?: string; repo?: string; video?: string };
  cuerpo: Bloque[];            // secciones del case study (RD-14)
  publicado: boolean;          // gate de validación (RN-04)
  orden?: number;              // exhibición curatorial (RN-02)
};

type Credito = { nombre: string; rol: string; enlace?: string };
type Imagen = { src: string; alt: string; caption?: string };
type Bloque =
  | { tipo: "texto"; contenido: string }
  | { tipo: "imagen"; imagen: Imagen }
  | { tipo: "video"; url: string; poster: Imagen }
  | { tipo: "decision"; que: string; alternativas: string; porque: string; loCambiaria: string };
```

**Decisión.** *Qué:* estos campos, con `Bloque` como unión discriminada extensible. *Alternativas:* markdown libre por proyecto (flexible pero invalidable); campos planos sin bloques. *Por qué:* tipado = el `ProjectFrame` es un componente, la validación de RN-04 es posible, y el bloque `decision` renderiza tus decisiones de diseño con estructura propia. *Qué lo cambiaría:* un case study transmedia que necesite un tipo de bloque nuevo — se extiende la unión, se registra la decisión.

### RD-14 · Anatomía del case study **[RATIFICADA]**
**Regla.** `/proyectos/[slug]` es la página más importante del portafolio — y la única que v1 no diseñó. Todos los cuadros cuentan su historia en el mismo orden: la estructura repetida es lo que hace legible al sistema.
**Técnico.** Orden fijo:

1. **Encabezado del cuadro** — número (mono + `accent`), título (`--type-title`), y la metadata en mono como ficha de producción: rol · año · formato · herramientas · créditos.
2. **Resumen** — qué es y por qué existe (el `resumen` del contrato).
3. **Proceso y decisiones** — la sección que sostiene RN-01: iteraciones, alternativas descartadas, bloques `decision`.
4. **Piezas** — galería y embeds (RD-16).
5. **Resultado y aprendizajes** — qué quedó y qué harías distinto.
6. **Navegación entre cuadros** — anterior / siguiente por número, en mono, al pie.

**Decisión.** *Qué:* seis secciones en orden fijo. *Alternativas:* estructura libre por proyecto; solo galería + texto. *Por qué:* la ficha de producción es tu tono de voz (v1 §1); el orden fijo convierte cada case study en un fotograma más del mismo relato. *Qué lo cambiaría:* un proyecto donde el proceso sea el resultado (p. ej. la investigación de horror 2D) puede invertir el peso de 3 y 4 — con decisión registrada.

### RD-15 · La viga de luz en multi-página **[RATIFICADA]**
**Regla.** La viga sigue siendo el elemento de firma: indicador de progreso y metáfora de la luz avanzando. En multi-página, el progreso que cuenta es el de la ruta que estás leyendo.
**Técnico.** Línea vertical fija en el borde izquierdo, presente en todas las rutas: riel de 2px en `line`, relleno en `accent` proporcional al scroll de la ruta actual. En rutas que caben en un viewport se muestra llena — se lee como marca, no como barra. Con reduced-motion: estática, sin relleno progresivo (RD-12). Es decorativa para tecnologías de asistencia (`aria-hidden="true"`): el progreso real lo da el propio scroll.
**Decisión.** *Qué:* progreso por ruta, viga en todas las páginas, 2px. *Alternativas:* solo en home; progreso "global" del sitio; elemento puramente decorativo sin progreso. *Por qué:* conserva la doble función de v1; un progreso global no significa nada en navegación no lineal. *Qué lo cambiaría:* si en mobile (< 700px) roba espacio o distrae, se oculta bajo el breakpoint — decisión registrada.

*Nota (2 de septiembre de 2026):* con la home única (RD-09), la viga en `/` recorre la narrativa completa de una vez — la lectura más literal de la metáfora de v1.

### RD-16 · Imagen y media **[RATIFICADA]**
**Regla.** El sistema es neutro para que el trabajo lleve su color: las imágenes no se filtran ni se desaturan. El sistema pone el marco; la pieza pone la luz.
**Técnico.** Portadas en el índice: proporción única **16:9** (el ritmo visual del grid depende de que todas midan igual). Dentro del case study: proporción libre. **Las imágenes rompen la columna de texto**: portadas y piezas se extienden hasta `--container-media` (880px) mientras la prosa permanece en `--container` (640px) — el texto es la ficha, la imagen es el fotograma. Toda imagen sobre `bg` lleva borde 1px `line` — es lo que define el límite en un sitio sin sombras. Caption opcional en `--type-meta` color `muted`. `alt` obligatorio (RN-10). Render siempre con `next/image` (RN-11); los archivos de imagen nunca van embebidos en la colección: se guarda solo la referencia `src` — dónde viven físicamente lo define el plan de infraestructura. Video: embed diferido con `poster` (nunca iframe eager — protege RN-11), mismo borde. Sin bordes redondeados, coherente con RD-07.
**Enmienda (2 de septiembre de 2026, decisión delegada).** *Qué:* breakout de media hasta `--container-media` (RD-05). *Alternativas:* media al ancho del texto; sangre completa a viewport; la sombra interior sutil del referente para definir bordes de capturas. *Por qué:* el contraste angosto/ancho es lo más fuerte de la línea elegida y sirve al concepto; la sombra interior se descarta porque resuelve el mismo problema que el borde 1px ya ratificado — dos soluciones para un problema es una de más ("cero sombras", v1 §6). *Qué lo cambiaría:* nada previsible.
**Decisión.** *Qué:* 16:9 en índice, libre en detalle, borde 1px universal, sin tratamiento de color. *Alternativas:* proporciones libres en el índice; 4:3; tratamiento duotono con el acento. *Por qué:* una sola proporción hace escaneable el índice; el duotono violaría RD-03 (el acento decorando). *Qué lo cambiaría:* si tu trabajo real resulta mayormente vertical (piezas para redes), se reevalúa la proporción del índice con las piezas en la mano.

### RD-17 · Plantilla OG
**Regla.** La imagen que aparece al compartir un cuadro sale del mismo sistema — no es un diseño aparte.
**Técnico.** Plantilla única de 1200×630 (dimensión estándar OG): fondo `bg`, viga vertical en `accent` al borde izquierdo, "CUADRO NN" en mono + `accent`, título en grande sobre `ink`, tu nombre abajo en mono `muted`. Generación programática con `ImageResponse` de `next/og`, en un `opengraph-image.tsx` por ruta, leyendo del contrato `Cuadro` — cero imágenes OG hechas a mano. La plantilla se genera **siempre en claro**: la imagen compartida no depende del esquema de color de quien mira (RD-19).

### RD-18 · Estados de sistema: cargando, vacío, error **[RATIFICADA]**
**Regla.** Una app con datos reales tiene más estados que el camino feliz. Todos hablan el mismo idioma del sistema: mono, sobrio, sin ilustraciones de disculpa.
**Técnico.**

| Estado | Tratamiento |
|---|---|
| **Cargando** | La viga como loader — v1 ya la designa "elemento de loading": pulso sutil del relleno. Nada de spinners. |
| **404 de cuadro** | "CUADRO NO ENCONTRADO" en `--type-meta`, una línea en Fraunces, link a `/proyectos`. Mismo layout del sitio. |
| **Error (500)** | Mismo patrón: texto honesto en mono, link a `/`. |
| **Índice vacío** | Estado transitorio de desarrollo: mensaje en mono, nada más. En producción no debería existir (RN-04). |

Anclaje en App Router: `not-found.tsx` para el 404 (disparado con `notFound()` cuando el slug no existe), `error.tsx` para el error genérico, `loading.tsx` con la viga como loader. La Fase 2 del plan de infraestructura ya contemplaba páginas de error: coincide.

**Decisión.** *Qué:* estados mínimos con el vocabulario existente. *Alternativas:* páginas de error ilustradas; redirect silencioso del 404 al índice. *Por qué:* el redirect silencioso miente sobre la URL (contra RN-03); la ilustración rompe la sobriedad. *Qué lo cambiaría:* nada previsible.

### RD-19 · Modo oscuro: la luz sobre la oscuridad **[RATIFICADA — invertida]**
**Regla.** El sitio tiene modo oscuro — ratificado, invirtiendo la propuesta anterior de esta misma regla. Y el concepto lo absorbe bien: en oscuro, la metáfora de v1 se vuelve literal — la viga y el acento son luz avanzando sobre la oscuridad, el territorio de tu investigación. Lo que no se negocia: **los componentes no saben en qué modo están**; cambian los valores detrás de los tokens, nunca las reglas.
**Técnico — mecanismo (enmendado el 2 de septiembre de 2026, decisión delegada).** Toggle manual con `next-themes`, el patrón del referente: estrategia de clase (`.dark` redefine los siete tokens semánticos en `globals.css`), `defaultTheme: "system"` — quien no elige recibe la preferencia de su sistema —, persistencia y script anti-parpadeo resueltos por la librería. El control vive en el header (RD-08; S-C12 del SPEC), con foco RD-10 y transición sin rebote (RD-11). Todo RD-01…RD-18 se lee igual en ambos modos. `color-scheme: light dark` en el raíz. La plantilla OG no participa (RD-17: siempre en claro) y las imágenes no se filtran ni atenúan en ningún modo (RD-16).
**Técnico — paleta (confirmada el 2 de septiembre de 2026, decisión delegada).** Papel y tinta intercambian roles (`--bg: #131311`, `--ink: #F4F4F1`) y el resto se derivó **por cálculo, no a ojo**: `--muted: #86867C` y `--accent: #638F6E` se aclararon manteniendo el tono hasta cumplir AA; `--paper: #1E1E1B` y `--line: #292924` replican las relaciones del modo claro; `--accent-soft: #162018`. Tabla completa verificada en RD-02. El presupuesto del acento (RD-03, ~10%) rige igual en oscuro: la luz también tiene que ganarse su lugar — con más razón. El terracota del referente (`#e38356`) se evaluó y **se descartó por cálculo**: 2.49–2.75 sobre las superficies claras, falla AA incluso como texto grande; el verde sobrevive la derivación en ambos modos, y esa robustez es parte de la decisión.
**Decisión.** *Qué:* modo oscuro con toggle (clase, `next-themes`, default = sistema) y la paleta verde derivada, vigente en ambos modos. *Alternativas:* automático sin toggle (la versión anterior de esta regla); solo claro; el terracota del referente; paleta oscura a ojo. *Por qué:* la línea elegida usa toggle, y el control es además una microinteracción que exhibe el sistema; `next-themes` paga el costo (persistencia, anti-parpadeo) que motivaba la versión automática. La derivación por cálculo sigue garantizando que ambas paletas cumplen exactamente las mismas reglas. *Qué lo cambiaría:* uso real que muestre el toggle como ruido — se vuelve al automático sin tocar un componente.

*Nota de reconciliación:* el ítem "tema claro/oscuro" de la Fase 2 del plan de infraestructura **queda alineado** con esta regla — ya no se descarta.

---

# Parte C — Rumbo al SPEC

## C1 · Lo que falta para cerrar

1. **Foto de la arquitectura** — ✔ recibida y anclada: Next.js 15 + Tailwind 4 + Framer Motion + capa JSON con Zod, ya en funcionamiento.
2. **Ratificación** — ✔ hecha (26 de agosto de 2026), con una corrección: **RD-19 invertida** — el modo oscuro entra, regla reescrita y paleta derivada.
3. **Textos y assets definitivos** — ya no se recolectan por adelantado: cada ciclo los pide justo a tiempo (RN-15).
4. **Paleta oscura** — ✔ confirmada por delegación (2 de septiembre de 2026); corregible con re-verificación.
5. **Línea de referencia (samuelkraft)** — ✔ reconciliada y decidida por delegación: tres adopciones estructurales, cuatro descartes registrados (ver "Referente de línea" en la cabecera).

**No hay pendientes: sigue el plan de implementación.**

## C2 · Propuestas — ratificadas (26 de agosto de 2026)

RD-19 se ratificó **invertida** (modo oscuro sí — regla reescrita) y RN-15 entró ratificada por venir de tu propia dirección. La lista se conserva como registro de lo que fue propuesto:

**De estructura** (leer con calma — cambian qué se construye):
`RN-13` contacto sin formulario · `RN-14` contenido versionado, sin edición en producción · `RD-13` contrato `Cuadro` · `RD-14` anatomía del case study · `RD-15` viga por ruta · `RD-16` sistema de imagen · `RD-19` modo oscuro — invertida al ratificar · `RN-06` español único.

**De valores** (ratificación rápida — ponen número a lo que v1 dejó en palabras):
`RN-02` orden curatorial · `RN-10` skip-link · `RN-11` umbrales CWV · `RD-04` escala tipográfica · `RD-05` base 8 · `RD-06` término medio del padding · `RD-08` estado activo del menú · `RD-09` footer · `RD-10` grosor del foco · `RD-11` duraciones de motion · `RD-18` estados de sistema.

Todo pasa al SPEC como criterio citable por ID. La única marca [PROPUESTA] viva es el mecanismo y la paleta oscura de RD-19.

## C3 · Qué hará cada documento siguiente

- **SPEC:** requisitos por ruta y por componente, con criterios de aceptación que citan estas reglas (`RD-07`, `RN-04`…). Es el contrato para implementar sin tomar decisiones de diseño sobre la marcha.
- **Plan de implementación:** el orden de construcción en ciclos sobre la arquitectura existente — cada ciclo con su revisión y sus decisiones registradas (RN-08); el pipeline con que se materializa es del plan de infraestructura. Primer movimiento previsible: reemplazar el "Hola Mundo" de la Fase 0 por la home de RD-09 — sus animaciones de validación (0.8s, spring, gradiente animado) cumplieron su función de probar el stack y quedan fuera de las reglas de motion (RD-11).
