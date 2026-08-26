import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ExampleCollectionSchema, ExampleRecordSchema } from '@data/_schema/example.schema';
import type { CollectionFile } from './types';

const MAX_COLLECTION_BYTES = 5 * 1024 * 1024;
const locks = new Map<string, Promise<void>>();
const schemas = { example: ExampleRecordSchema };

type AnyRecord = { id: string; createdAt: string; updatedAt: string; data: Record<string, unknown> };

const dataDirectory = () => path.resolve(process.cwd(), process.env.DATA_DIR ?? './data');

const collectionPath = (collection: string) => {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(collection)) {
    throw new Error('Invalid collection name');
  }
  return path.join(dataDirectory(), `${collection}.json`);
};

const withLock = async <T>(filePath: string, operation: () => Promise<T>) => {
  const previous = locks.get(filePath) ?? Promise.resolve();
  let release!: () => void;
  const current = new Promise<void>((resolve) => {
    release = resolve;
  });
  locks.set(filePath, previous.then(() => current));
  await previous;
  try {
    return await operation();
  } finally {
    release();
    if (locks.get(filePath) === current) locks.delete(filePath);
  }
};

const readCollection = async <T extends AnyRecord>(collection: string) => {
  const filePath = collectionPath(collection);
  const parsed = JSON.parse(await readFile(filePath, 'utf8')) as CollectionFile<T>;
  if (collection === 'example') ExampleCollectionSchema.parse(parsed);
  return parsed;
};

const writeCollection = async <T extends AnyRecord>(collection: string, file: CollectionFile<T>) => {
  const filePath = collectionPath(collection);
  const serialized = JSON.stringify(file, null, 2) + '\n';
  if (Buffer.byteLength(serialized) > MAX_COLLECTION_BYTES) throw new Error('Collection exceeds 5 MB');
  await mkdir(path.join(dataDirectory(), '_backups'), { recursive: true });
  try {
    await stat(filePath);
    await writeFile(path.join(dataDirectory(), '_backups', `${collection}.json`), await readFile(filePath));
  } catch {
    // A first write has no previous snapshot.
  }
  const temporaryPath = `${filePath}.${randomUUID()}.tmp`;
  await writeFile(temporaryPath, serialized, 'utf8');
  await rename(temporaryPath, filePath);
};

export const jsonDb = {
  async getAll<T extends AnyRecord>(collection: string): Promise<T[]> {
    return (await readCollection<T>(collection)).records;
  },
  async getById<T extends AnyRecord>(collection: string, id: string): Promise<T | null> {
    return (await this.getAll<T>(collection)).find((record) => record.id === id) ?? null;
  },
  async create<T extends AnyRecord>(collection: string, data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const filePath = collectionPath(collection);
    return withLock(filePath, async () => {
      const file = await readCollection<T>(collection);
      const now = new Date().toISOString();
      const record = { ...data, id: `${collection}_${randomUUID()}`, createdAt: now, updatedAt: now } as T;
      const schema = schemas[collection as keyof typeof schemas];
      if (schema) schema.parse(record);
      file.records.push(record);
      file._meta.lastModified = now;
      await writeCollection(collection, file);
      return record;
    });
  },
  async update<T extends AnyRecord>(collection: string, id: string, partial: Partial<T>): Promise<T> {
    const filePath = collectionPath(collection);
    return withLock(filePath, async () => {
      const file = await readCollection<T>(collection);
      const index = file.records.findIndex((record) => record.id === id);
      if (index < 0) throw new Error('Record not found');
      const current = file.records[index];
      if (!current) throw new Error('Record not found');
      const record = { ...current, ...partial, id, updatedAt: new Date().toISOString() } as T;
      const schema = schemas[collection as keyof typeof schemas];
      if (schema) schema.parse(record);
      file.records[index] = record;
      file._meta.lastModified = record.updatedAt;
      await writeCollection(collection, file);
      return record;
    });
  },
  async remove(collection: string, id: string): Promise<boolean> {
    const filePath = collectionPath(collection);
    return withLock(filePath, async () => {
      const file = await readCollection<AnyRecord>(collection);
      const remaining = file.records.filter((record) => record.id !== id);
      if (remaining.length === file.records.length) return false;
      file.records = remaining;
      file._meta.lastModified = new Date().toISOString();
      await writeCollection(collection, file);
      return true;
    });
  },
  async query<T extends AnyRecord>(collection: string, filter: (item: T) => boolean): Promise<T[]> {
    return (await this.getAll<T>(collection)).filter(filter);
  },
};
