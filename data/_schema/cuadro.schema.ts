import { z } from 'zod';

export const ImagenSchema = z.object({
  src: z.string().min(1),
  alt: z.string().min(1),
  caption: z.string().optional(),
});

// Bloque de contenido de la página del proyecto: un título con texto y/o una lista.
export const BloqueSchema = z.object({
  titulo: z.string().min(1),
  texto: z.string().min(1).optional(),
  items: z.array(z.object({ titulo: z.string().min(1), texto: z.string().min(1) })).optional(),
});

export const CuadroSchema = z.object({
  numero: z.string().regex(/^\d{2}$/),
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  titulo: z.string().min(1),
  resumen: z.string().min(1),
  rol: z.string().min(1),
  // Tipo corto que acompaña al año en la tarjeta (ej. "Producto · Experiencia"); si falta, se usa el rol.
  tipo: z.string().min(1).max(40).optional(),
  coautores: z.array(z.string().min(1)).optional(),
  // Detalles animados propios de la tarjeta; solo los proyectos que lo declaren los muestran.
  ambiente: z.enum(['mar', 'cocina']).optional(),
  anio: z.number().int(),
  formato: z.array(z.string().min(1)),
  herramientas: z.array(z.string().min(1)),
  portada: ImagenSchema.optional(),
  // Proyecto alojado en otra web: la tarjeta enlaza ahí en vez de a /proyectos/[slug].
  enlace: z.string().url().optional(),
  proceso: z.array(BloqueSchema).optional(),
  resultado: z.array(BloqueSchema).optional(),
  publicado: z.boolean(),
  orden: z.number().int().optional(),
}).superRefine((cuadro, context) => {
  const contenidoCompleto = Boolean(cuadro.enlace) || Boolean(cuadro.proceso?.length && cuadro.resultado?.length);
  if (cuadro.publicado && (!cuadro.portada || !contenidoCompleto)) {
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
export type Bloque = z.infer<typeof BloqueSchema>;