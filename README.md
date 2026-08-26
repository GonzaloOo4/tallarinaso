# Marca Personal

Base fullstack TypeScript para construir la marca personal de Gonzalo. Incluye Next.js 15 App Router, Tailwind CSS 4, Framer Motion, API Routes, persistencia JSON validada con Zod, Vitest y CI en GitHub Actions.

## Inicio

```bash
npm install
npm run dev
```

Visita `http://localhost:3000` y `http://localhost:3000/api/health`.

## Verificaciones

```bash
npm run lint
npm run type-check
npm run test
npm run build
```

## API JSON

`GET /api/data/example` lista registros. `GET /api/data/example?id=...` obtiene uno. `POST`, `PUT` y `DELETE` completan el CRUD; las escrituras locales crean backups antes de reemplazar el archivo.

> Vercel Serverless no conserva escrituras en disco entre invocaciones. Para producción, usa esta capa como lectura/seed y migra la implementación a Vercel KV, Turso u otro store cuando sea necesario.
