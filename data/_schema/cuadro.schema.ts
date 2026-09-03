import { z } from 'zod';

export const ImagenSchema = z.object({
  src: z.string().min(1),
  alt: z.string().min(1),
  caption: z.string().optional(),
});

export const CuadroSchema = z.object({
  numero: z.string().regex(/^\d{2}$/),
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  titulo: z.string().min(1),
  resumen: z.string().min(1),
  rol: z.string().min(1),
  anio: z.number().int(),
  formato: z.array(z.string().min(1)),
  herramientas: z.array(z.string().min(1)),
  portada: ImagenSchema.optional(),
  proceso: z.array(z.unknown()).optional(),
  resultado: z.array(z.unknown()).optional(),
  publicado: z.boolean(),
  orden: z.number().int().optional(),
}).superRefine((cuadro, context) => {
  if (cuadro.publicado && (!cuadro.portada || !cuadro.proceso?.length || !cuadro.resultado?.length)) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: 'Un cuadro publicado debe estar completo.' });
  }
});

export const CuadroCollectionSchema = z.object({
  _meta: z.object({ version: z.number(), lastModified: z.string(), description: z.string() }),
  records: z.array(z.object({
    id: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    data: CuadroSchema,
  })),
}).superRefine((collection, context) => {
  const numbers = collection.records.map(({ data }) => data.numero);
  const slugs = collection.records.map(({ data }) => data.slug);
  if (new Set(numbers).size !== numbers.length) context.addIssue({ code: z.ZodIssueCode.custom, message: 'numero duplicado' });
  if (new Set(slugs).size !== slugs.length) context.addIssue({ code: z.ZodIssueCode.custom, message: 'slug duplicado' });
});

export type Cuadro = z.infer<typeof CuadroSchema>;