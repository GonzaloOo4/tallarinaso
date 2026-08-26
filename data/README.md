# Capa de datos JSON

Cada archivo `.json` representa una colección con metadatos y una lista de `records`. El motor en `src/lib/json-db.ts` valida colecciones conocidas con Zod, serializa las escrituras con un lock por archivo y crea un snapshot previo en `_backups/`.

La escritura local funciona con `fs/promises`. En Vercel Serverless el filesystem es efímero, por lo que producción debe tratar estos archivos como datos de lectura y seed hasta migrar la interfaz `jsonDb` a un almacén persistente.

Las colecciones usan nombres `kebab-case` y no deben superar 5 MB.
