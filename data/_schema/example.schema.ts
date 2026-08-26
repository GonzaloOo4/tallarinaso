import { z } from 'zod';

export const ExampleRecordSchema = z.object({
  id: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  data: z.record(z.unknown()),
});

export const ExampleCollectionSchema = z.object({
  _meta: z.object({
    version: z.number().int().positive(),
    lastModified: z.string().datetime(),
    description: z.string(),
  }),
  records: z.array(ExampleRecordSchema),
});

export type ExampleRecord = z.infer<typeof ExampleRecordSchema>;
