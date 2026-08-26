# Plan de Diseño — Portafolio de Gonzalo
### Diseño Digital · Énfasis en Contenido

---

## 1. Concepto y propuesta de identidad

**Concepto rector:** *"Cuadro a cuadro"* — la idea de que cada proyecto es un fotograma dentro de un mismo relato visual, y que el diseño mismo actúa como una fuente de luz sobre un fondo neutro.

Este concepto no es decorativo: nace directamente de tu línea de trabajo (investigación sobre ausencia de luz en horror 2D, narrativa transmedia, proyectos numerados como "cuadros"). El sitio debe sentirse como **una sola narrativa dividida en escenas**, no como una lista de proyectos sueltos.

**Propuesta de valor personal:** diseñador digital que piensa en sistemas narrativos — no solo resuelve una pieza visual, construye el universo alrededor de ella.

**Tono de voz:** directo, técnico cuando hace falta, sin relleno. Se lee como una ficha de producción, no como un ensayo.

---

## 2. Identidad de marca personal

| Elemento | Definición |
|---|---|
| **Nombre/marca** | Gonzalo — sin logotipo ilustrado, la marca es tipográfica |
| **Símbolo de marca** | La *viga de luz* — una línea vertical que se ilumina progresivamente. Funciona como favicon simplificado, elemento de loading, y motivo recurrente |
| **Numeración de marca** | Todo contenido secuencial se marca como "CUADRO 01, 02, 03..." — es la firma verbal del sistema |
| **Arquetipo de marca** | El investigador-narrador: mitad método, mitad historia |
| **Lo que la marca NO es** | No es lúdica/infantil, no es corporativa fría, no es maximalista |

---

## 3. Paleta de colores

Sistema de **un solo acento sobre base neutra** — la restricción es intencional: en un sitio sobre ausencia de luz, el color no puede estar en todos lados, tiene que ganarse su lugar.

| Token | Hex | Uso |
|---|---|---|
| `bg` (papel) | `#F4F4F1` | Fondo base, neutro cálido, no cream puro |
| `ink` (tinta) | `#131311` | Texto principal, casi negro |
| `muted` | `#6E6E66` | Texto secundario, metadatos, descripciones |
| `line` | `#DEDAD0` | Bordes, separadores, grid |
| `accent` (verde bosque) | `#4A6B52` | Único color vivo: links, hover states, la viga de luz, numeración de proyectos |
| `accent-soft` | `#E1E8DE` | Fondos sutiles de highlight, nunca como color principal |
| `paper` | `#FFFFFF` | Superficie elevada (cards) sobre el fondo base |

**Regla de oro:** el acento verde nunca ocupa más del ~10% de la superficie visible de cualquier vista. Se usa para *señalar*, no para decorar.

---

## 4. Sistema tipográfico

Tres familias, cada una con un rol fijo — no se intercambian entre sí:

| Familia | Rol | Peso/uso |
|---|---|---|
| **Fraunces** (serif) | Títulos de sección, subtítulos editoriales | 500–600, con personalidad pero legible |
| **Inter** (sans) | Nombre/hero, cuerpo de texto, UI general | 400 cuerpo / 800 para el nombre en el hero (moderno, grande, tracking negativo) |
| **IBM Plex Mono** (mono) | Metadatos, navegación, etiquetas, numeración de "cuadros" | 400–500, siempre en mayúsculas con letter-spacing amplio |

**Jerarquía:**
1. Nombre (hero) — el elemento más grande y con más peso de todo el sitio
2. Títulos de proyecto (Fraunces)
3. Cuerpo/descripciones (Inter, color muted)
4. Metadata técnica (mono, la más pequeña, funciona como "specs")

Esta combinación traduce el sitio en dos capas de lectura: una **editorial** (serif/sans para contar la historia) y una **técnica** (mono para los datos duros: rol, año, herramientas). Es literalmente el mismo balance que manejas entre narrativa e investigación.

---

## 5. Sistema de espaciado y grid

- **Contenedor máximo:** ~880px de ancho, centrado — favorece lectura tipo editorial, no dashboard
- **Padding lateral:** fluido con `clamp()`, entre 24px (mobile) y 64px (desktop)
- **Ritmo vertical:** secciones separadas por ~88px + línea divisoria de 1px — cada sección se siente como un "corte de escena"
- **Grid de proyectos:** dos columnas fijas — número de cuadro (ancho fijo ~90px) + contenido (flexible). En mobile colapsa a una columna

---

## 6. Sistema de "boxes" / componentes

| Componente | Reglas visuales |
|---|---|
| **Project box (cuadro)** | Sin borde propio, se separa del anterior con línea superior de 1px. El número va en mono + acento, alineado arriba. Nada de sombras — el sitio es plano por diseño |
| **Skill card** | Borde de 1px (`line`), fondo blanco (`paper`), sin sombra en reposo. Al hover: el borde cambia a verde y la card sube 2px — es el único componente con elevación, y solo en interacción |
| **Botones/links** | No hay botones rellenos en todo el sitio. Los links usan subrayado animado (underline que crece de 0% a 100% en hover) o flecha que se desplaza. La interacción es sutil, nunca un CTA agresivo |
| **Contact links** | Fila completa clickeable, con línea inferior, la flecha en acento se mueve al hover |

**Principio general:** cero sombras dramáticas, cero bordes redondeados grandes, cero gradientes. Todo el peso visual lo llevan la tipografía, el espacio en blanco y el único acento de color.

---

## 7. Navegación / menú

- **Tipo:** header sticky, fondo semitransparente con blur al hacer scroll (no un menú hamburguesa oculto — todo el sitio es corto, así que el menú se mantiene siempre visible y plano)
- **Estructura:** nombre/marca a la izquierda (mono, minúsculas técnicas) — links de sección a la derecha (Sobre mí / Proyectos / Habilidades / Contacto)
- **Estado hover:** underline que crece de izquierda a derecha, color pasa de muted a ink
- **En mobile:** el menú se comprime (gap reducido), se mantiene horizontal mientras el contenido lo permita; si migras a más secciones, ahí sí se justifica un menú colapsable

---

## 8. Elemento de firma (motion/interacción)

- **La viga de luz:** línea vertical fija en el borde izquierdo de la pantalla, que se "llena" de color acento en proporción al scroll — funciona como indicador de progreso Y como metáfora del proyecto de investigación (la luz avanzando sobre la oscuridad)
- **Reveal on scroll:** los bloques de contenido entran con fade + leve desplazamiento vertical, disparado por `IntersectionObserver`. Debe sentirse casi imperceptible, no como una animación de presentación
- **Regla de movimiento:** ninguna animación dura más de 0.6s, nada rebota ni hace "bounce" — el movimiento es tan contenido como la paleta de color

---

## 9. Mapa del sitio (para la arquitectura fullstack)

Pensado para mapear directo a rutas/componentes en tu stack de TypeScript, sin acoplar el diseño a una sola página larga:

```
/                    → Home (hero + resumen)
/sobre-mi            → Bio extendida
/proyectos           → Índice de "cuadros" (grid/lista)
/proyectos/[slug]    → Detalle de cada proyecto (case study completo)
/habilidades         → Grid de herramientas/software
/contacto            → Formulario o links directos
```

Cada `[slug]` de proyecto hereda el mismo sistema: número de cuadro, metadata en mono (rol, año, formato, créditos), descripción corta y CTA de "ver proyecto completo". Esto te permite construir un **componente `ProjectFrame` reutilizable** que se alimenta de datos (JSON/CMS/base de datos) en vez de HTML repetido — el diseño ya está pensado como sistema, no como página estática.

---

## 10. Accesibilidad y responsive

- Contraste mínimo AA entre `ink`/`bg` y `accent`/`bg` (verificar el verde sobre blanco, especialmente en texto pequeño)
- `prefers-reduced-motion` respetado — todas las animaciones se desactivan si el usuario lo pide
- Foco de teclado visible en todos los links (outline en acento)
- Breakpoint principal en ~700px: grid de proyectos y about pasan de 2 columnas a 1

---

## 11. Checklist antes de construir la arquitectura

- [ ] Confirmar textos definitivos (bio, descripciones de proyecto, año real de cada uno)
- [ ] Definir si los "cuadros" viven en un CMS/JSON o hardcodeados en el MVP
- [ ] Exportar tokens de color/tipografía como variables reutilizables (CSS vars → design tokens del sistema)
- [ ] Definir componente `ProjectFrame` como pieza central reutilizable
- [ ] Decidir si el menú necesita estado "activo" por ruta (relevante ya con arquitectura multi-página)
