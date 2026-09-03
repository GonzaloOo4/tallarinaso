import { z } from 'zod';

export const SitioSchema = z.object({
  nombre: z.string().min(1),
  claim: z.string().min(1).max(60),
  hero: z.string().min(1),
  bio: z.string().min(1),
  canales: z.array(z.object({
    etiqueta: z.string().min(1),
    valor: z.string().min(1),
    url: z.string().min(1),
  })).min(1),
});

export const SitioCollectionSchema = z.object({
  _meta: z.object({ version: z.number(), lastModified: z.string(), description: z.string() }),
  records: z.array(z.object({
    id: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    data: SitioSchema,
  })).length(1),
});

export type Sitio = z.infer<typeof SitioSchema>;