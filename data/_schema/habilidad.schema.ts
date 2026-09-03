import { z } from 'zod';

export const HabilidadSchema = z.object({
  nombre: z.string().min(1),
  grupo: z.string().min(1),
});

export const HabilidadCollectionSchema = z.object({
  _meta: z.object({ version: z.number(), lastModified: z.string(), description: z.string() }),
  records: z.array(z.object({
    id: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    data: HabilidadSchema,
  })),
});

export type Habilidad = z.infer<typeof HabilidadSchema>;