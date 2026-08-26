import { describe, expect, it } from 'vitest';
import { jsonDb } from './json-db';

describe('jsonDb', () => {
  it('reads and queries a collection', async () => {
    const records = await jsonDb.getAll('example');
    expect(records).toHaveLength(1);
    expect(await jsonDb.query('example', (record) => record.data.message === 'Hola Mundo')).toHaveLength(1);
  });

  it('rejects unsafe collection names', async () => {
    await expect(jsonDb.getAll('../example')).rejects.toThrow('Invalid collection name');
  });
});
