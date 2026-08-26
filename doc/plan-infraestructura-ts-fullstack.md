# Plan de Infraestructura — Sistema Fullstack TypeScript

> **Arquitecto:** Claude (Asistente IA)  
> **Solicitante:** Jhonatan Castro — CTSO  
> **Fecha:** 25 de marzo de 2026  
> **Estado:** Fase de planificación  
> **Milestone de validación:** Home "Hola Mundo" con efecto elegante

---

## 1. Visión General

Sistema web fullstack construido enteramente en **TypeScript**, desplegado en **Vercel** desde un repositorio **GitHub**, que reemplaza la base de datos convencional por una capa de persistencia basada en **archivos JSON** dentro del propio proyecto.

```
┌─────────────────────────────────────────────────────┐
│                    VERCEL (Cloud)                    │
│                                                     │
│  ┌──────────────┐    ┌───────────────────────────┐  │
│  │  Next.js App │    │   Serverless Functions     │  │
│  │  (Frontend)  │◄──►│   (API Routes - Backend)  │  │
│  └──────────────┘    └─────────┬─────────────────┘  │
│                                │                    │
│                       ┌────────▼────────┐           │
│                       │   /data/*.json  │           │
│                       │  (JSON DB Layer)│           │
│                       └─────────────────┘           │
└──────────────────────────┬──────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │   GitHub    │
                    │ (Repo + CI) │
                    └─────────────┘
```

---

## 2. Stack Tecnológico

| Capa | Tecnología | Versión mínima | Justificación |
|---|---|---|---|
| **Runtime** | Node.js | 20 LTS | Soporte nativo TS via tsx, estabilidad |
| **Framework** | Next.js | 15.x | App Router, RSC, API Routes, deploy nativo en Vercel |
| **Lenguaje** | TypeScript | 5.x | Strict mode, tipado end-to-end |
| **Estilos** | Tailwind CSS | 4.x | Utility-first, purge automático, theming |
| **Animaciones** | Framer Motion | 12.x | Animaciones declarativas en React |
| **Persistencia** | JSON files + fs/promises | nativo | Sin dependencia externa de DB |
| **Validación** | Zod | 3.x | Validación de esquemas en runtime |
| **Despliegue** | Vercel | — | Zero-config para Next.js |
| **Repositorio** | GitHub | — | Versionamiento + CI/CD automático |
| **Linter** | ESLint + Prettier | 9.x / 3.x | Consistencia de código |
| **Testing** | Vitest | 3.x | Tests unitarios rápidos, soporte TS nativo |

---

## 3. Estructura del Proyecto

```
proyecto-root/
│
├── .github/
│   └── workflows/
│       └── ci.yml                  # GitHub Actions: lint + test
│
├── data/                           # ★ JSON Database Layer
│   ├── _schema/                    # Esquemas Zod exportados
│   │   └── example.schema.ts
│   ├── example.json                # Colección de ejemplo
│   └── README.md                   # Documentación de la capa de datos
│
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              # Layout raíz con metadata
│   │   ├── page.tsx                # ★ Home — "Hola Mundo"
│   │   ├── globals.css             # Tailwind directives
│   │   └── api/                    # API Routes (Backend)
│   │       ├── health/
│   │       │   └── route.ts        # GET /api/health
│   │       └── data/
│   │           └── [collection]/
│   │               └── route.ts    # CRUD genérico sobre JSON
│   │
│   ├── lib/                        # Lógica compartida
│   │   ├── json-db.ts              # ★ Motor de lectura/escritura JSON
│   │   ├── types.ts                # Tipos globales
│   │   └── utils.ts                # Helpers
│   │
│   └── components/                 # Componentes React
│       ├── ui/                     # Componentes base (botones, cards)
│       └── home/
│           └── HolaMundo.tsx       # ★ Componente animado
│
├── public/
│   └── favicon.ico
│
├── .env.example                    # Variables de entorno documentadas
├── .eslintrc.json
├── .prettierrc
├── next.config.ts                  # Config de Next.js en TS
├── tailwind.config.ts              # Config de Tailwind en TS
├── tsconfig.json                   # TS strict mode
├── vitest.config.ts
├── package.json
└── README.md
```

---

## 4. Capa de Datos JSON — Diseño del Motor

### 4.1 Principio de funcionamiento

Cada "colección" es un archivo `.json` dentro de `/data`. El motor `json-db.ts` expone operaciones CRUD que leen y escriben estos archivos mediante `fs/promises`.

### 4.2 Estructura de una colección

```jsonc
// data/example.json
{
  "_meta": {
    "version": 1,
    "lastModified": "2026-03-25T12:00:00Z",
    "description": "Colección de ejemplo"
  },
  "records": [
    {
      "id": "ex_001",
      "createdAt": "2026-03-25T12:00:00Z",
      "updatedAt": "2026-03-25T12:00:00Z",
      "data": {}
    }
  ]
}
```

### 4.3 Interfaz del motor (`json-db.ts`)

```typescript
// Firma conceptual — no implementación
interface JsonDB {
  getAll<T>(collection: string): Promise<T[]>;
  getById<T>(collection: string, id: string): Promise<T | null>;
  create<T>(collection: string, data: Omit<T, 'id'>): Promise<T>;
  update<T>(collection: string, id: string, partial: Partial<T>): Promise<T>;
  remove(collection: string, id: string): Promise<boolean>;
  query<T>(collection: string, filter: (item: T) => boolean): Promise<T[]>;
}
```

### 4.4 Consideraciones de la capa de datos

| Aspecto | Decisión |
|---|---|
| **IDs** | Generados con `crypto.randomUUID()` prefijados por colección |
| **Concurrencia** | Mutex por archivo usando `AsyncLock` para evitar escrituras simultáneas |
| **Validación** | Cada colección tiene un esquema Zod asociado en `data/_schema/` |
| **Backup** | Pre-escritura se genera snapshot en `data/_backups/` (último estado) |
| **Límite** | Recomendado < 5 MB por archivo JSON para rendimiento aceptable |
| **Lectura en Vercel** | `fs.readFile` funciona en serverless; escritura persiste solo en la invocación |

### 4.5 Limitación crítica en Vercel

> **Vercel Serverless es efímero.** Las escrituras a disco no persisten entre invocaciones. Para esta fase, el sistema funciona en modo **lectura + seed** en producción. La escritura real aplica en desarrollo local. Si el proyecto escala y requiere persistencia en producción, se contempla migración a Vercel KV, Turso o cualquier store externo sin alterar la interfaz `JsonDB`.

**Estrategia de mitigación:**

```
Desarrollo local     →  Lectura/Escritura completa (fs real)
Preview (Vercel)     →  Lectura desde archivos empaquetados en build
Producción (Vercel)  →  Lectura desde archivos + futura capa de persistencia
```

---

## 5. API Routes — Backend

### 5.1 Ruta de salud

```
GET /api/health
→ { "status": "ok", "timestamp": "...", "environment": "..." }
```

### 5.2 Rutas CRUD genéricas

```
GET    /api/data/[collection]          →  Listar todos los registros
GET    /api/data/[collection]?id=xxx   →  Obtener un registro
POST   /api/data/[collection]          →  Crear registro
PUT    /api/data/[collection]          →  Actualizar registro
DELETE /api/data/[collection]?id=xxx   →  Eliminar registro
```

Cada ruta valida contra el esquema Zod correspondiente antes de procesar.

---

## 6. Configuración TypeScript

```jsonc
// tsconfig.json — puntos clave
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "paths": {
      "@/*": ["./src/*"],
      "@data/*": ["./data/*"]
    }
  }
}
```

Modo **strict activado** con flags adicionales de seguridad para garantizar tipado exhaustivo en todo el proyecto.

---

## 7. Pipeline CI/CD

### 7.1 GitHub → Vercel (Despliegue)

```
push a main       →  Vercel Production Deploy (automático)
push a develop    →  Vercel Preview Deploy (automático)
pull request      →  Vercel Preview + GitHub Actions (lint + test)
```

### 7.2 GitHub Actions (CI)

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check    # tsc --noEmit
      - run: npm run test
```

---

## 8. Variables de Entorno

```bash
# .env.example
NODE_ENV=development
NEXT_PUBLIC_APP_NAME="Mi Sistema TS"
NEXT_PUBLIC_APP_VERSION="0.1.0"
DATA_DIR=./data                       # Ruta a la carpeta de datos
```

En Vercel se configuran desde el dashboard del proyecto. `DATA_DIR` no aplica en producción serverless (se usa path relativo al build).

---

## 9. Milestone de Validación — "Hola Mundo"

### 9.1 Objetivo

Confirmar que todo el stack funciona end-to-end: TypeScript compila, Tailwind renderiza, Framer Motion anima, la API responde, y Vercel despliega correctamente.

### 9.2 Criterios de aceptación

| # | Criterio | Verificación |
|---|---|---|
| 1 | La página Home muestra "Hola Mundo" centrado vertical y horizontalmente | Visual |
| 2 | El texto tiene un efecto de aparición animada (fade-in + blur o similar) | Visual |
| 3 | Existe un efecto de fondo sutil (gradiente animado o partículas) | Visual |
| 4 | `GET /api/health` responde `{ status: "ok" }` | curl o navegador |
| 5 | El proyecto compila sin errores TypeScript (`tsc --noEmit` pasa) | CI pipeline |
| 6 | El deploy en Vercel es exitoso desde `main` | Dashboard Vercel |
| 7 | Lighthouse Performance > 90 | DevTools |

### 9.3 Diseño del componente Home

```
┌─────────────────────────────────────────┐
│            (fondo: gradiente            │
│         animado oscuro/claro)           │
│                                         │
│                                         │
│         ┌───────────────────┐           │
│         │                   │           │
│         │   H O L A         │           │
│         │   M U N D O       │  ← fade   │
│         │                   │    + blur  │
│         │  ─────────────    │    + scale │
│         │  subtítulo sutil  │           │
│         └───────────────────┘           │
│                                         │
│            [ badge: TS ✓ ]              │
│                                         │
└─────────────────────────────────────────┘
```

### 9.4 Especificación de animaciones

| Elemento | Efecto | Duración | Delay |
|---|---|---|---|
| Fondo | Gradiente que rota suavemente (mesh gradient) | Loop infinito | — |
| "Hola" | fade-in + slide-up + blur-to-clear | 0.8s ease-out | 0.2s |
| "Mundo" | fade-in + slide-up + blur-to-clear | 0.8s ease-out | 0.5s |
| Línea divisora | width: 0→100% | 0.6s ease | 1.0s |
| Subtítulo | fade-in | 0.5s | 1.3s |
| Badge TS | scale bounce-in | 0.4s spring | 1.6s |

---

## 10. Comandos del Proyecto

```bash
# Instalación
npm install

# Desarrollo
npm run dev              # Next.js dev server (http://localhost:3000)

# Verificación de tipos
npm run type-check       # tsc --noEmit

# Linting
npm run lint             # ESLint
npm run format           # Prettier --write

# Testing
npm run test             # Vitest
npm run test:coverage    # Vitest con cobertura

# Build
npm run build            # Next.js production build
npm run start            # Servir build de producción local
```

---

## 11. Convenciones de Código

| Aspecto | Convención |
|---|---|
| **Nombrado de archivos** | kebab-case para archivos, PascalCase para componentes |
| **Tipos** | Interfaces para objetos, Types para uniones y utilidades |
| **Imports** | Alias `@/` para `src/`, `@data/` para `data/` |
| **Componentes** | Funcionales con arrow functions, props tipadas inline o extraídas |
| **API Routes** | Exportar funciones nombradas `GET`, `POST`, `PUT`, `DELETE` |
| **JSON Data** | Nombres de colección en singular, kebab-case (`user.json`, `product.json`) |
| **Commits** | Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:` |
| **Branching** | `main` (producción), `develop` (desarrollo), `feature/*`, `fix/*` |

---

## 12. Fases de Implementación

```
Fase 0 — Scaffolding ★ ACTUAL
├── Inicializar repo GitHub
├── Crear proyecto Next.js 15 con TypeScript
├── Configurar Tailwind CSS + Framer Motion
├── Vincular repo con Vercel
├── Implementar Home "Hola Mundo" con efectos
├── Crear /api/health
└── Validar deploy exitoso

Fase 1 — Motor de Datos
├── Implementar json-db.ts con CRUD completo
├── Crear esquemas Zod para validación
├── Implementar API Routes genéricas
├── Tests unitarios del motor
└── Documentar capa de datos

Fase 2 — UI Base
├── Sistema de componentes UI (botones, inputs, cards)
├── Layout con navegación
├── Tema claro/oscuro
└── Páginas de error (404, 500)

Fase 3 — Funcionalidad Core
├── Módulos específicos del negocio
├── Autenticación (si aplica)
├── Roles y permisos
└── Dashboard operativo

Fase 4 — Producción
├── Migrar escritura a store persistente (si necesario)
├── Monitoreo y logging
├── Documentación completa
└── Optimización de rendimiento
```

---

## 13. Riesgos y Mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Escritura JSON no persiste en Vercel serverless | Alto | Modo read-only en producción; migración futura a Vercel KV / Turso |
| Archivos JSON crecen sin control | Medio | Límite de 5 MB por colección, paginación en queries |
| Colisiones de escritura concurrente (local) | Medio | Mutex por archivo con AsyncLock |
| Framer Motion aumenta bundle size | Bajo | Tree-shaking, importar solo `motion` y hooks necesarios |
| Breaking changes en Next.js 15 App Router | Bajo | Lockfile estricto, CI con `npm ci` |

---

## 14. Checklist de Arranque Rápido

```
□  Crear repositorio en GitHub (público o privado)
□  npx create-next-app@latest --typescript --tailwind --app --src-dir
□  Instalar dependencias: framer-motion, zod
□  Instalar devDependencies: vitest, @testing-library/react
□  Configurar tsconfig.json con strict mode + paths
□  Crear carpeta /data con example.json
□  Implementar src/app/page.tsx (Hola Mundo animado)
□  Implementar src/app/api/health/route.ts
□  Push a GitHub
□  Vincular repositorio en Vercel Dashboard
□  Verificar deploy automático
□  Confirmar criterios de aceptación (Sección 9.2)
```

---

> **Siguiente paso:** Ejecutar la Fase 0 — Scaffolding del proyecto y desplegar el "Hola Mundo" funcional que valide toda la infraestructura descrita en este plan.
