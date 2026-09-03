# SPEC — Portafolio de Gonzalo
### Contrato de implementación · v1

**Deriva de:** Plan de Diseño v2 (reglas `RN-xx` / `RD-xx`, ratificado el 26 de agosto de 2026) · Plan de Infraestructura (implementado y en funcionamiento, citado como `infra §n`).

---

## 0. Cómo usar este documento

Este SPEC existe para que quien implementa **no tome decisiones de diseño sobre la marcha**. No repite las reglas: las cita. El texto normativo completo vive en el Plan de Diseño v2; la mecánica del sistema vive en el plan de infraestructura. Este es el documento donde los dos planos se enlazan.

- **IDs propios:** `E-xx` enlaces entre planos · `S-Rx` rutas · `S-Cx` componentes · `S-Tx` transversales. El plan de implementación referencia estos IDs.
- **Marca (derivado):** decisión menor que las reglas no cubrían y que este SPEC fija sin contradecirlas. Todas están recolectadas en §8 para revisión rápida; al ratificarse pasan a `DECISIONES.md` (RN-08).
- **Marcas [AJUSTE] y [PROPUESTA]:** cambios o adiciones al contrato de datos; quedaron **decididas por delegación** el 2 de septiembre de 2026 (§8) y son reversibles con una línea.
- **Regla de vacíos:** si al implementar aparece algo no especificado ni derivable de una regla, no se decide: se registra la duda en `DECISIONES.md` y se consulta. La ausencia de especificación nunca autoriza una decisión de diseño.
- **Ciclos (RN-15):** cada ciclo de implementación carga solo su unidad (`S-Rx`/`S-Cx`) más §1 y §2. La solicitud de contenido de cada ciclo está en §7.
- **Criterios de aceptación:** todos verificables por inspección, cálculo o ejecución. "Se ve bien" no es un criterio.

---

## 1. Enlaces entre planos (E-xx)

| ID | Enlace | Fuentes |
|---|---|---|
| E-01 | Los cuadros viven en `data/cuadro.json` bajo el sobre de la capa de datos (`_meta` + `records[]`, con `records[].data = Cuadro`). El esquema vive en `data/_schema/cuadro.schema.ts`; el tipo `Cuadro` se deriva con `z.infer`. | RN-09, RD-13 · infra §3, §4.2 |
| E-02 | La identidad del cuadro es `numero`/`slug` dentro de `data`; el `id` del sobre es solo la llave técnica del motor. | RN-02, RN-03, RN-09 |
| E-03 | La validación corre en la lectura estática del build: parsear la colección con el esquema; un cuadro `publicado: true` inválido lanza excepción → **la publicación falla**. | RN-04, RN-14 · infra §7 |
| E-04 | Lectura pública por generación estática: `generateStaticParams` sobre los slugs publicados en `/proyectos/[slug]`. Las API Routes (infra §5) **no** se consumen desde el sitio público. | RN-14 |
| E-05 | Tokens en el `@theme` de `src/app/globals.css`; modo oscuro por clase: `next-themes` (attribute `class`, `defaultTheme: "system"`) y `.dark` redefine las mismas variables. | RD-01, RD-19 · infra §3 |
| E-06 | Fuentes con `next/font` en el layout raíz. | RD-04 |
| E-07 | OG con `ImageResponse` (`next/og`) en `opengraph-image.tsx` por ruta. | RD-17 |
| E-08 | Estados de sistema con las convenciones del App Router: `not-found.tsx`, `error.tsx`, `loading.tsx`. | RD-18 |
| E-09 | Si un slug publicado cambiara, la redirección 301 se resuelve con el mecanismo de la plataforma (infra). | RN-03 |
| E-10 | Métricas CWV medidas en producción con la herramienta de la infraestructura; Lighthouse como control en revisión (ya usado como criterio en infra §9.2). | RN-11 |
| E-11 | La home S-R1 **reemplaza** el "Hola Mundo" de la Fase 0 (infra §9): sus animaciones de validación (0.8s, spring, gradiente) no migran. | RD-11 |

---

## 2. Tokens — especificación ejecutable

Única fuente de valores visuales (RD-01). Los hex reproducen exactamente las tablas de RD-02; escalas de RD-04, RD-05 y RD-11; paleta oscura de RD-19.

```css
@theme {
  /* Color — modo claro (RD-02) */
  --color-bg: #F4F4F1;
  --color-ink: #131311;
  --color-muted: #6E6E66;
  --color-line: #DEDAD0;
  --color-accent: #4A6B52;
  --color-accent-soft: #E1E8DE;
  --color-paper: #FFFFFF;

  /* Tipografía (RD-04) */
  --font-editorial: "Fraunces", serif;
  --font-ui: "Inter", sans-serif;
  --font-mono: "IBM Plex Mono", monospace;
  --text-display: clamp(2.75rem, 1rem + 6vw, 5.5rem);   /* lh 1.05, tracking -0.02em, Inter 800 */
  --text-title: clamp(1.5rem, 1.1rem + 1.6vw, 2rem);    /* lh 1.2, Fraunces 600 */
  --text-subtitle: 1.25rem;                              /* lh 1.35, Fraunces 500 */
  --text-body: 1.125rem;                                 /* lh 1.6, Inter 400 */
  --text-meta: 0.8125rem;                                /* lh 1.4, Mono 400/500, MAYÚSCULAS, ls 0.08em */

  /* Espaciado y layout (RD-05, RD-06) */
  --spacing-1: 0.5rem;   /* 8  */
  --spacing-2: 1rem;     /* 16 */
  --spacing-3: 1.5rem;   /* 24 */
  --spacing-4: 2rem;     /* 32 */
  --spacing-6: 3rem;     /* 48 */
  --spacing-8: 4rem;     /* 64 */
  --spacing-11: 5.5rem;  /* 88 — corte de escena */
  --breakpoint-corte: 700px;

  /* Motion (RD-11) */
  --motion-micro: 200ms;
  --motion-reveal: 500ms;
  --motion-ease: cubic-bezier(0.22, 1, 0.36, 1);
}

/* Modo oscuro (RD-19) — mismos tokens, otros valores; los componentes no lo saben.
   Clase gestionada por next-themes (attribute "class", defaultTheme "system") */
.dark {
  --color-bg: #131311;
  --color-ink: #F4F4F1;
  --color-muted: #86867C;
  --color-line: #292924;
  --color-accent: #638F6E;
  --color-accent-soft: #162018;
  --color-paper: #1E1E1B;
}
```

Complementos globales en el mismo archivo:

- `color-scheme: light dark` en el raíz (RD-19).
- Foco global: `:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }`; nunca `outline: none` sin reemplazo (RD-10).
- Reduced motion global: bajo `prefers-reduced-motion: reduce`, transiciones y animaciones CSS a `none` (RD-12).
- Valores de layout sin namespace de utilidades (`640px` columna de texto, `880px` límite de media — RD-05 enmendada —, `90px` columna del número, `70ch` medida) se consumen mediante clases propias definidas en `globals.css` — nunca como valor arbitrario en el marcado (RD-01).

**Criterios de aceptación §2:** los hex coinciden carácter a carácter con RD-02; búsqueda de `[#` y de valores sueltos en el código da cero resultados fuera de `globals.css` (RD-01); alternar el tema — con el conmutador o, sin elección previa, con la preferencia del sistema — cambia toda la interfaz sin recargar, sin parpadeo en el primer paint y sin que ningún componente contenga lógica de modo (RD-19).

---

## 3. Contrato de datos (S-D)

### S-D1 · Esquema de la colección de cuadros

Implementa RD-13 con el gate de publicación de RN-04 y la unicidad de RN-02/RN-03, dentro del sobre de infra §4.2.

```ts
// data/_schema/cuadro.schema.ts
import { z } from "zod";

export const Credito = z.object({
  nombre: z.string().min(1),
  rol: z.string().min(1),
  enlace: z.string().url().optional(),
});

export const Imagen = z.object({
  src: z.string().min(1),
  alt: z.string().min(1),            // RN-10: sin alt, la validación rechaza
  caption: z.string().optional(),
});

export const Bloque = z.discriminatedUnion("tipo", [
  z.object({ tipo: z.literal("texto"), contenido: z.string().min(1) }),
  z.object({ tipo: z.literal("imagen"), imagen: Imagen }),
  z.object({ tipo: z.literal("video"), url: z.string().url(), poster: Imagen }),
  z.object({
    tipo: z.literal("decision"),
    que: z.string().min(1),
    alternativas: z.string().min(1),
    porque: z.string().min(1),
    loCambiaria: z.string().min(1),
  }),
]);

export const Cuadro = z.object({
  numero: z.string().regex(/^\d{2}$/),                        // RN-02
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),         // RN-03
  titulo: z.string().min(1),
  resumen: z.string().min(1),
  rol: z.string().min(1),
  anio: z.number().int(),                                     // año real (RN-04)
  formato: z.array(z.string().min(1)),
  herramientas: z.array(z.string().min(1)),
  creditos: z.array(Credito).optional(),                      // obligatorio si hubo colaboración (RN-05, editorial)
  portada: Imagen.optional(),                                 // 16:9 (RD-16)
  galeria: z.array(Imagen).optional(),
  enlaces: z.object({
    demo: z.string().url().optional(),
    repo: z.string().url().optional(),
    video: z.string().url().optional(),
  }).optional(),
  proceso: z.array(Bloque).optional(),                        // sección 3 de RD-14 — ver [AJUSTE-01]
  resultado: z.array(Bloque).optional(),                      // sección 5 de RD-14 — ver [AJUSTE-01]
  publicado: z.boolean(),
  orden: z.number().int().optional(),                         // exhibición curatorial (RN-02)
}).superRefine((c, ctx) => {
  if (c.publicado) {
    // RN-04: completo o no se publica
    if (!c.portada) ctx.addIssue({ code: "custom", message: `Cuadro ${c.numero}: portada obligatoria al publicar` });
    if (!c.proceso?.length) ctx.addIssue({ code: "custom", message: `Cuadro ${c.numero}: proceso vacío` });
    if (!c.resultado?.length) ctx.addIssue({ code: "custom", message: `Cuadro ${c.numero}: resultado vacío` });
    if (!c.formato.length || !c.herramientas.length)
      ctx.addIssue({ code: "custom", message: `Cuadro ${c.numero}: formato/herramientas vacíos` });
  }
});

// Sobre de la capa de datos (infra §4.2)
export const ColeccionCuadros = z.object({
  _meta: z.object({ version: z.number(), lastModified: z.string(), description: z.string() }),
  records: z.array(z.object({
    id: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    data: Cuadro,
  })),
}).superRefine((col, ctx) => {
  const nums = col.records.map(r => r.data.numero);
  const slugs = col.records.map(r => r.data.slug);
  if (new Set(nums).size !== nums.length) ctx.addIssue({ code: "custom", message: "numero duplicado" });
  if (new Set(slugs).size !== slugs.length) ctx.addIssue({ code: "custom", message: "slug duplicado" });
});

export type Cuadro = z.infer<typeof Cuadro>;
```

**[AJUSTE-01 al contrato RD-13 — requiere registro en `DECISIONES.md`].** *Qué:* el campo `cuerpo: Bloque[]` se divide en `proceso: Bloque[]` y `resultado: Bloque[]`. *Alternativas:* mantener `cuerpo` plano (el renderizador no sabría dónde termina "Proceso" y empieza "Resultado"); añadir un discriminador `seccion` a cada bloque. *Por qué:* RD-14 fija una anatomía con dos secciones de contenido libre (3 y 5); dos campos con nombre son el mapeo 1:1 mínimo y hacen exigible RN-01 (el proceso no puede quedar vacío al publicar). *Qué lo cambiaría:* una anatomía distinta ratificada en RD-14.

### S-D2 · Contenido del sitio **[PROPUESTA P-02]**

RN-09 exige cero textos hardcodeados en componentes — eso incluye el hero, la bio y los canales de contacto. Fuente única: `data/sitio.json` con esquema `sitio.schema.ts`:

```ts
export const Sitio = z.object({
  nombre: z.string().min(1),                 // hero y marca
  claim: z.string().max(60),                 // título de pestaña de la home (RN-12)
  hero: z.string().min(1),                   // texto de presentación de la home
  bio: z.string().min(1),                    // /sobre-mi
  canales: z.array(z.object({                // /contacto y footer (RN-13)
    etiqueta: z.string().min(1),
    valor: z.string().min(1),
    url: z.string().min(1),                  // mailto: o https:
  })).min(1),
});
```

*Qué:* una fuente tipada para el contenido de nivel sitio. *Alternativas:* textos en componentes (viola RN-09); una colección por página (sobredimensionado). *Por qué:* un solo archivo, un solo esquema, mismas garantías de validación. *Qué lo cambiaría:* que alguna página crezca hasta necesitar estructura propia.

### S-D3 · Habilidades **[PROPUESTA P-01]**

`data/habilidad.json`: `{ nombre: string; grupo: string }` por registro, mismo sobre de infra §4.2. Sin niveles, porcentajes ni barras: una métrica de dominio sería un número inventado y decoración que el sistema prohíbe por espíritu (RD-03). *Alternativas:* niveles por herramienta; iconos. *Qué lo cambiaría:* una decisión editorial tuya con criterio para medir.

---

## 4. Rutas (S-R)

*(Enmendado el 2 de septiembre de 2026 por RD-09: home única. Los IDs S-R2, S-R3, S-R5 y S-R6 quedan **retirados** — sus contenidos viven como escenas de S-R1 — y no se reutilizan, el mismo principio de RN-02 aplicado a los requisitos.)*

Formato de cada unidad: **Manda** → **Requisitos** → **Estados** → **Metadata** → **Criterios**. El contenido que consume cada unidad está en §7.

### S-R0 · Layout global
**Manda:** RN-06, RN-10, RD-08, RD-09, RD-15 · E-05, E-06.
**Requisitos:** `<html lang="es">` y `color-scheme: light dark`. Orden del cuerpo: skip-link ("Saltar al contenido", visible solo con foco, apunta a `#contenido`) → header (S-C5, con las anclas y el conmutador S-C12) → viga (S-C7) → `<main id="contenido">` → footer (S-C6). Fuentes cargadas con `next/font`: Fraunces variable (usos 500/600), Inter variable (400/800), IBM Plex Mono estática (400/500). Favicon: la marca de la viga — SVG de línea vertical `accent` sobre `bg` (identidad v1 §2).
**Criterios:** tab desde la barra de URL enfoca primero el skip-link; cada superficie tiene exactamente una `h1`; landmarks `header/nav/main/footer` presentes; cero fuentes cargadas fuera de `next/font`.

### S-R1 · `/` — La narrativa completa
**Manda:** RD-04, RD-05, RD-09, RD-15, RN-02, RN-04, RN-13 · S-D1, S-D2, S-D3.
**Requisitos:** cinco escenas en orden fijo, separadas por el corte de escena (`--spacing-11` + línea 1px, RD-05):

1. **Hero** — `nombre` (S-D2) en `--text-display`, la única `h1` del sitio, seguido del texto `hero` en `--text-body`. **Sin reveal**: visible en el primer render (derivado — protege LCP, RN-11).
2. **`#sobre-mi`** — `h2` "Sobre mí" en `--text-title`; `bio` en prosa `--text-body` a `--container` (640px ≈ 60 caracteres por línea).
3. **`#proyectos`** — `h2` "Proyectos"; lista de S-C1, **solo** cuadros `publicado: true`, ordenados por `orden` si existe y si no por `numero` ascendente (RN-02); grid `--col-numero` + flexible → 1 columna bajo 700px (RD-06). Índice vacío (solo en desarrollo): mensaje en `--text-meta` (RD-18).
4. **`#habilidades`** — `h2` "Habilidades"; S-C2 agrupadas por `grupo` (etiqueta de grupo en `--text-meta`); grid 2 → 1 columnas en 700px.
5. **`#contacto`** — `h2` "Contacto"; una fila S-C4 por canal de `sitio.canales`, en el orden del archivo (RN-13).

El scroll hacia anclas es suave; con `prefers-reduced-motion`, instantáneo (RD-12). La viga (S-C7) recorre la narrativa completa (RD-15).
**Estados:** ninguno especial; superficie estática.
**Metadata:** title = `claim` (S-D2); description = primera oración de `hero`; OG de sitio (S-C11 sin número).
**Criterios:** una sola `h1` (el nombre); cada escena alcanzable desde su ancla del menú; hero visible sin ejecutar JavaScript; un cuadro `publicado: false` no aparece en el HTML servido; bajo 700px el número del cuadro queda arriba del contenido; title ≤ 60 caracteres.

### S-R4 · `/proyectos/[slug]` — Case study
**Manda:** RD-13, RD-14, RD-16, RD-17, RD-18, RN-02, RN-03, RN-05, RN-12 · E-03, E-04.
**Requisitos:** `generateStaticParams` sobre los slugs publicados (E-04). Render con S-C8 en el orden exacto de RD-14. Navegación anterior/siguiente por `numero` ascendente, sin circularidad: el primero no tiene "anterior", el último no tiene "siguiente" (derivado).
**Estados:** slug inexistente → `notFound()` (E-08); nunca redirección silenciosa (RN-03).
**Metadata:** title = "{titulo} — {nombre}"; description = `resumen`; OG por cuadro (S-C11 con número).
**Criterios:** visitar un slug no publicado devuelve 404 con la página de RD-18; el build falla si un cuadro publicado viola el esquema (probar con un registro inválido y revertir); la ficha del encabezado muestra créditos cuando existen, con el mismo peso visual que el rol (RN-05).

---

## 5. Componentes (S-C)

### S-C1 · ProjectBox (cuadro en el índice)
**Manda:** RD-07, RD-16, RN-05 · contenido de v1 §9.
Contrato: `{ cuadro: Cuadro }`. Separación entre boxes: línea superior 1px `line` a partir del segundo (derivado). Columna fija: `numero` en mono + `accent`, alineado arriba. Columna de contenido, en orden (derivado): portada (`next/image` 16:9, borde 1px `line`, `alt` del dato, **rompe hasta `--container-media`** — RD-16) → título en `--text-title` como enlace al slug (variante subrayado de S-C3) → ficha mono en una línea (`ROL · AÑO · FORMATO` y `CRÉDITOS` si existen, `--text-meta`, `muted`) → `resumen` en `--text-body` `muted` → enlace "Ver proyecto completo" (texto de v1 §9; variante flecha de S-C3). Sin sombra, sin borde propio, sin radios.
**Criterios:** todas las portadas del índice comparten proporción; la primera box no duplica línea con el encabezado de sección; hover del título y de la flecha ≤ `--motion-micro`.

### S-C2 · SkillCard
**Manda:** RD-07, RD-10.
Borde 1px `line`, fondo `paper`, radio 0, padding `--spacing-3` (derivado). Contenido: `nombre` en `--text-body`. Hover: borde → `accent` + `translateY(-2px)`, transición `--motion-micro` `--motion-ease` — única elevación del sitio. Focus-visible: mismo tratamiento + outline global.
**Criterios:** en reposo no hay sombra ni color de acento; con `prefers-reduced-motion` no hay desplazamiento.

### S-C3 · Enlace (dos variantes)
**Manda:** RD-07.
Color `accent` constante en todos los estados; lo que cambia es el gesto, nunca el color base. **Subrayado:** pseudo-elemento de 1px que crece `scaleX(0→1)` de izquierda a derecha en `--motion-micro` (derivado: transform, no width). **Flecha:** "→" que se desplaza `--spacing-1` a la derecha en hover, misma duración. En navegación: color `muted` → `ink` en hover (RD-08).
**Criterios:** cero botones rellenos en todo el sitio; el subrayado no altera el layout al animarse.

### S-C4 · ContactRow
**Manda:** RD-07, RN-13.
La fila completa es el `<a>`: etiqueta en `--text-meta` `muted` a la izquierda, `valor` en `--text-body` `ink`, flecha `accent` a la derecha; línea inferior 1px `line`. Hover: la flecha se desplaza (S-C3). Focus: outline sobre la fila completa.

### S-C5 · Header
**Manda:** RD-08, RD-04 · v1 §7.
Sticky arriba. En el tope: fondo `bg` pleno; con scroll: `bg` al 85% + backdrop-blur de la escala por defecto (derivado). Izquierda: la marca — `nombre` en mono **minúsculas** (excepción explícita de v1 §7) enlazando a `/`. Centro-derecha: Sobre mí · Proyectos · Habilidades · Contacto en `--text-meta`, como **anclas** a las escenas de S-R1 (RD-08/RD-09). Extremo derecho: conmutador de tema S-C12. Activo: solo en `/proyectos/[slug]`, "Proyectos" en `ink` con subrayado persistente 1px `accent` y `aria-current="page"`; en la home no hay estado activo (RD-08). Bajo 700px: gap de `--spacing-4` a `--spacing-2` (derivado), se mantiene horizontal.
**Criterios:** `aria-current` presente únicamente en `/proyectos/[slug]`; el blur no aparece en el tope de la página; cada ancla lleva a su escena.

### S-C6 · Footer
**Manda:** RD-09.
Línea superior 1px `line`; todo en `--text-meta` `muted`: `nombre` · año del build (derivado) · repetición de `canales` como enlaces S-C3.

### S-C7 · VigaDeLuz
**Manda:** RD-15, RD-12.
Fija en el borde izquierdo, alto completo del viewport, ancho 2px, bajo el header en z-index. Riel en `line`; relleno en `accent` con `scaleY` (origen arriba) atado al progreso de scroll de la ruta (`useScroll`). Rutas que caben en un viewport: se muestra llena. `aria-hidden="true"`. Con `useReducedMotion`: llena y estática (derivado — se lee como marca, coherente con las rutas cortas).
**Criterios:** al llegar al final de cualquier ruta el relleno está al 100%; con reduced-motion no hay animación de relleno; ningún lector de pantalla la anuncia.

### S-C8 · CaseStudy (ProjectFrame)
**Manda:** RD-14, RD-13, RD-16, RN-05.
Renderiza la anatomía en orden fijo. Etiquetas de sección en `--text-meta` mono mayúsculas — RESUMEN · PROCESO Y DECISIONES · PIEZAS · RESULTADO — coherentes con el tono "ficha de producción" de v1 §1 (derivado). (1) Encabezado: `numero` mono `accent` grande, `h1` = `titulo` en `--text-title`, ficha mono (`ROL · AÑO · FORMATO · HERRAMIENTAS · CRÉDITOS`), y los `enlaces` (demo/repo/video) como fila de S-C3 al cierre del encabezado (derivado). (2) `resumen`. (3) `proceso[]`. (4) `galeria` — imágenes que rompen la columna de texto hasta `--container-media` (880px), borde 1px, caption mono al ancho del texto (RD-16). (5) `resultado[]`. (6) Navegación anterior/siguiente en mono: `numero` + `titulo` con flechas.
**Render de bloques:** `texto` → párrafos `--text-body`; `imagen` → como galería; `video` → embed diferido con `poster`, nunca iframe eager (RD-16); `decision` → línea superior 1px + etiquetas mono QUÉ / ALTERNATIVAS / POR QUÉ / QUÉ LO CAMBIARÍA con su texto en `--text-body`, sin caja ni fondo (derivado).
**Criterios:** el orden de secciones no varía entre cuadros; un cuadro sin `galeria` omite PIEZAS sin dejar hueco; los créditos, cuando existen, son visibles sin interacción.

### S-C9 · Reveal
**Manda:** RD-11, RD-12.
Envoltorio Framer Motion: `initial {opacity 0, y 12}` → `whileInView {opacity 1, y 0}`, `viewport {{ once: true, amount: 0.15 }}`, duración `--motion-reveal`, curva `--motion-ease`. Con `useReducedMotion`: render directo sin estado inicial. Se aplica a secciones y project boxes; **nunca** al hero de la home (S-R1).
**Criterios:** cada elemento se anima una sola vez; ninguna animación del sitio supera 600ms; nada rebota.

### S-C10 · Estados de sistema
**Manda:** RD-18 · E-08.
`not-found.tsx`: layout completo (header, viga, footer), "CUADRO NO ENCONTRADO" en `--text-meta`, una línea en `--text-subtitle` Fraunces, enlace a `/proyectos`. `error.tsx`: mismo patrón, texto honesto, enlace a `/`. `loading.tsx`: la viga con pulso de opacidad en el relleno, ciclo de `--motion-reveal` (derivado), sin spinners. Con generación estática aparecerá poco: se implementa igual.

### S-C11 · Plantilla OG
**Manda:** RD-17, RN-12.
1200×630, **siempre en claro**: fondo `#F4F4F1`, barra vertical `#4A6B52` de 12px al borde izquierdo (derivado — la viga a escala de tarjeta), "CUADRO NN" en mono `accent` mayúsculas (solo cuadros), título en Inter 800 sobre `ink` (derivado — eco del hero), `nombre` abajo en mono `muted`. Rutas de sección: misma plantilla sin número, título = nombre de la sección (derivado). Generada con `ImageResponse` leyendo del dato — cero imágenes a mano.
**Criterios:** pasar cada ruta por un validador OG antes de publicar (RN-12); los hex de la plantilla son literales del modo claro, no tokens del runtime.

### S-C12 · Conmutador de tema
**Manda:** RD-19, RD-10, RD-11.
`next-themes` con `attribute="class"` y `defaultTheme: "system"`. Botón de icono en el header (sol/luna — derivado), `aria-label` "Cambiar tema", foco RD-10; transición del icono en `--motion-micro` con `--motion-ease`, **sin rebote** (el spring del referente quedó descartado, RD-11 intacta). El cambio no recarga ni parpadea: el script de la librería corre antes del primer paint.
**Criterios:** recargar conserva la elección; sin elección previa, el tema sigue al sistema; con reduced-motion el icono cambia sin animación.

---

## 6. Transversales (S-T)

| ID | Requisito | Criterios de aceptación |
|---|---|---|
| S-T1 · Accesibilidad (RN-10) | Una `h1` por ruta; landmarks; skip-link; foco visible global (RD-10); `alt` en toda imagen; contrastes garantizados por construcción (solo pares aprobados de RD-02, en ambos modos — rige la intersección: `muted` nunca sobre `accent-soft`). | Navegación completa por teclado en cada ruta; auditoría de contraste sin fallos AA en claro y en oscuro. |
| S-T2 · Rendimiento (RN-11) | LCP ≤ 2.5 s · INP ≤ 200 ms · CLS ≤ 0.1 en producción. Palancas: `next/image` con dimensiones, `next/font`, video diferido (RD-16), hero sin reveal (S-R1). | Medición E-10 en verde; ninguna imagen sin dimensiones declaradas. |
| S-T3 · Motion (RD-11/12) | Presupuesto: `--motion-micro` y `--motion-reveal`, curva única, techo 600ms, cero bounce; reduced-motion apaga todo (CSS y Framer). | Recorrido con reduced-motion activo: contenido completo visible, cero animaciones. |
| S-T4 · Metadata (RN-12) | Cada superficie (`/`, `/proyectos/[slug]`, 404): title (patrón "{Título} — {nombre}"; home = claim; ≤ ~60), description, OG (S-C11). | Validador OG en verde por superficie. |
| S-T5 · Idioma (RN-06) | `lang="es"`; todos los textos desde S-D1/S-D2/S-D3. | Búsqueda de strings de contenido en componentes da cero resultados. |
| S-T6 · Tokens (RD-01) | Ningún valor visual fuera de §2. | Búsqueda de `[#` y valores arbitrarios: cero fuera de `globals.css`. |

---

## 7. Mapa de contenido por ciclo (RN-15)

Cada ciclo solicita **exactamente** esto al usuario antes de implementar su unidad; nada se inventa y nada incompleto se publica (RN-04).

| Unidad | Solicitud exacta |
|---|---|
| S-R1 · Hero | Nombre a mostrar · texto del hero (1–2 párrafos cortos) · claim para el título de pestaña (≤ 60 caracteres) |
| S-R1 · Sobre mí | Bio extendida, en los párrafos que el usuario decida · foto opcional con `alt` (vive como contenido de la escena, nunca como marca del hero) |
| S-R1 · Contacto + S-C6 Footer | Canales: etiqueta + valor + URL (`mailto:` o perfil) |
| S-R1 · Habilidades | Lista de herramientas: nombre + grupo |
| S-R4 Por **cada** cuadro | Título · resumen · rol · año real · formato(s) · herramientas · créditos si hubo colaboración (nombre, rol, enlace) · portada 16:9 con su `alt` · piezas de galería con `alt` y captions · enlaces (demo/repo/video) · bloques de PROCESO (incluidas decisiones reales: qué/alternativas/por qué/qué lo cambiaría) · bloques de RESULTADO |

Los cuadros llegan de a uno, cada uno en su ciclo. Un cuadro cuyo contenido no está completo se carga con `publicado: false` y no existe para el público.

---

## 8. Derivados y propuestas — para tu revisión

**Decididos por delegación (2 de septiembre de 2026)** — reversibles con una línea y su re-verificación:
- **[AJUSTE-01]** `cuerpo` → `proceso` + `resultado` (S-D1) — confirmado.
- **[P-01]** habilidades sin niveles (S-D3) — confirmado.
- **[P-02]** `data/sitio.json` (S-D2) — confirmado.
- **RD-19:** paleta verde en ambos modos confirmada; mecanismo enmendado a **toggle** (`next-themes`, clase, default sistema). El terracota del referente se descartó por cálculo (2.49–2.75 sobre claro).
- **Línea samuelkraft:** adoptados 640/880 (RD-05, RD-16), toggle (RD-19) y home única sin blog (RD-08/RD-09); descartados Inter única, terracota, springs y avatar en hero — registro completo en la cabecera del plan de reglas.

**Derivados (fijados por el SPEC donde las reglas no alcanzaban; se ratifican en bloque salvo objeción):** patrón de titles "{Página} — {nombre}" · hero sin reveal · prev/next no circular · línea separadora solo entre boxes · orden interno del ProjectBox (portada primero) · etiquetas de sección del case study en mono · render del bloque `decision` sin caja · enlaces del cuadro al cierre del encabezado · blur del header solo con scroll (85% + blur por defecto) · gap móvil del nav (`--spacing-4`→`--spacing-2`) · lógica de activo por primer segmento · grid de habilidades 2→1 · padding de SkillCard `--spacing-3` · subrayado por `scaleX` · viga llena y estática con reduced-motion · pulso del loader a `--motion-reveal` · año del footer = año del build · OG: barra 12px, título Inter 800, versión de sitio sin número · escenas de la home con `h2` · anclas sin scroll-spy · scroll suave (instantáneo con reduced-motion) · icono sol/luna del conmutador.

---

## 9. Definition of Done — por ciclo

Un ciclo se cierra cuando: (1) cumple los criterios de aceptación de su unidad; (2) S-T6 da cero valores fuera de tokens; (3) la parte aplicable de S-T1 pasa en claro y en oscuro; (4) toda desviación o vacío quedó en `DECISIONES.md` (RN-08); (5) hubo revisión visual antes de publicar (RD-03); (6) el contenido es real o el registro quedó `publicado: false` — jamás un placeholder público (RN-04, RN-15).
